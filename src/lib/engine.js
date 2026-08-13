import { workflowById } from '../data/catalog.js';

export const runStates = {
  ready: { code: 'READY_FOR_REVIEW', label: 'Zur Freigabe vorbereitet', tone: 'ready' },
  review: { code: 'REVIEW_REQUIRED', label: 'Prüfung erforderlich', tone: 'review' },
  stopped: { code: 'STOPPED_FOR_REVIEW', label: 'Zur manuellen Prüfung', tone: 'stop' },
  retry: { code: 'RETRY_SCHEDULED', label: 'Wiederholung vorgemerkt', tone: 'review' },
  duplicate: { code: 'DUPLICATE_IGNORED', label: 'Duplikat erkannt', tone: 'neutral' },
  approved: { code: 'APPROVED_DRAFT', label: 'Entwurf freigegeben', tone: 'ready' },
  rejected: { code: 'REJECTED', label: 'Abgelehnt', tone: 'stop' },
};

function stableHash(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

function resultBase() {
  return { extracted: {}, checks: [], missing: [], exceptions: [], sensitiveFlags: [], confidence: 0.92, blocked: false, retry: false, preparedPayload: {}, questions: [] };
}

function orderIntake(input) {
  const result = resultBase();
  result.extracted = { customer: input.customer?.name, customerNumber: input.customer?.number, orderNumber: input.orderNumber, deliveryDate: input.deliveryDate, shipTo: input.shipTo, terms: input.terms, positions: input.items?.length || 0 };
  if (!input.deliveryDate) result.missing.push('Bestätigter Liefertermin');
  for (const item of input.items || []) {
    if (item.masterPrice == null) {
      result.exceptions.push({ code: 'UNKNOWN_ITEM', label: `Artikel ${item.sku} nicht im freigegebenen Stamm`, severity: 'high', source: item.sku });
      result.blocked = true;
      continue;
    }
    const deviation = ((item.unitPrice - item.masterPrice) / item.masterPrice) * 100;
    result.checks.push({ label: `${item.sku}: Preis gegen Stamm`, value: `${money(item.unitPrice)} € / ${money(item.masterPrice)} €`, ok: Math.abs(deviation) <= 2 });
    if (Math.abs(deviation) > 2) result.exceptions.push({ code: 'PRICE_DEVIATION', label: `Preisabweichung ${deviation.toFixed(1)} % bei ${item.sku}`, severity: 'medium', source: item.sku });
  }
  result.confidence = result.blocked ? 0.54 : result.exceptions.length ? 0.82 : 0.97;
  result.questions = result.missing.map((field) => `Bitte ${field.toLowerCase()} bestätigen.`);
  result.preparedPayload = { target: 'ERP_ORDER_DRAFT', writePerformed: false, customer: input.customer?.number, customerOrder: input.orderNumber, requestedDelivery: input.deliveryDate, positions: (input.items || []).filter((item) => item.masterPrice != null).map(({ sku, quantity, unitPrice }) => ({ sku, quantity, unitPrice })) };
  return result;
}

function serviceTriage(input) {
  const result = resultBase();
  result.extracted = { machineNumber: input.machineNumber, family: input.machine?.family, site: input.machine?.site, productionStopped: input.productionStopped, errorCodes: input.errorCodes, attachments: input.attachments?.length || 0 };
  if (!input.machineNumber || !input.machine) result.missing.push('eindeutige Maschinennummer');
  if (!input.errorCodes?.length) result.missing.push('Fehlercode oder Panel-Anzeige');
  if (input.safetyConcern) {
    result.sensitiveFlags.push('Möglicher Sicherheitsbezug');
    result.exceptions.push({ code: 'SAFETY_ESCALATION', label: 'Sicherheitsrelevanter Hinweis—keine Ferndiagnose', severity: 'critical', source: 'Kundenmeldung' });
    result.blocked = true;
  }
  result.checks = [
    { label: 'Maschine im installierten Bestand', value: input.machine ? 'gefunden' : 'nicht gefunden', ok: Boolean(input.machine) },
    { label: 'Produktion betroffen', value: input.productionStopped ? 'Stillstand gemeldet' : 'kein Stillstand gemeldet', ok: !input.productionStopped },
    { label: 'Technische Ursache', value: 'nicht behauptet', ok: true },
  ];
  result.confidence = result.blocked ? 0.61 : result.missing.length ? 0.69 : 0.94;
  result.questions = result.missing.map((field) => `Bitte ${field} nachreichen.`);
  result.preparedPayload = { target: 'SERVICE_TICKET_DRAFT', writePerformed: false, priority: input.safetyConcern ? 'P1-MANUAL' : input.productionStopped ? 'P2' : 'P3', ownerQueue: input.machine?.family?.includes('Prüf') ? 'Service Elektrik' : 'Service Mechanik', machineNumber: input.machineNumber, symptoms: input.symptoms, evidence: input.evidence, rootCause: null };
  return result;
}

function spareParts(input) {
  const result = resultBase();
  result.extracted = { machineNumber: input.machineNumber, query: input.query, candidates: input.candidates?.length || 0 };
  if (!input.machineNumber) result.missing.push('Maschinennummer');
  if (!input.candidates?.length) {
    result.exceptions.push({ code: 'NO_PART', label: 'Kein Kandidat gefunden', severity: 'high' });
    result.blocked = true;
  } else if (input.candidates.length > 1) {
    result.exceptions.push({ code: 'AMBIGUOUS_PART', label: `${input.candidates.length} mögliche Varianten—keine automatische Auswahl`, severity: 'high' });
    result.blocked = true;
  }
  const candidate = input.candidates?.[0];
  if (candidate?.successor && candidate.successorApproved === false) {
    result.exceptions.push({ code: 'UNAPPROVED_SUCCESSOR', label: `Nachfolger ${candidate.successor} ist nicht technisch freigegeben`, severity: 'critical' });
    result.blocked = true;
  }
  result.checks = (input.candidates || []).map((part) => ({ label: part.part, value: `${part.label} · ${(part.confidence * 100).toFixed(0)} % · Bestand synthetisch: ${part.stock}`, ok: input.candidates.length === 1 && part.confidence >= 0.9 && part.successorApproved !== false }));
  result.confidence = candidate ? candidate.confidence : 0.2;
  result.questions = input.candidates?.length > 1 ? ['Bitte Spannung/Typenschild oder exakte BOM-Position bestätigen.'] : [];
  result.preparedPayload = { target: 'SPARE_PART_RESPONSE_DRAFT', writePerformed: false, machineNumber: input.machineNumber, candidates: input.candidates, selectedPart: !result.blocked && candidate?.confidence >= 0.9 ? candidate.part : null, availabilityIsSynthetic: true };
  return result;
}

function specDelta(input) {
  const result = resultBase();
  result.extracted = { customerSpec: input.customerSpec, internalStandard: input.internalStandard, requirements: input.requirements?.length || 0 };
  for (const requirement of input.requirements || []) {
    result.checks.push({ label: `${requirement.id} · Seite ${requirement.page}`, value: `${requirement.text} ↔ ${requirement.standard}`, ok: requirement.state === 'match' });
    if (requirement.state === 'delta') result.exceptions.push({ code: 'SPEC_DELTA', label: `${requirement.id}: Abweichung zum internen Standard`, severity: 'medium', source: `Seite ${requirement.page}` });
    if (requirement.state === 'missing-measure') result.missing.push(`${requirement.id}: messbares Abnahmekriterium`);
    if (requirement.state === 'contradiction') {
      result.exceptions.push({ code: 'CONTRADICTION', label: `${requirement.id}: ${requirement.conflictsWith}`, severity: 'high', source: `Seite ${requirement.page}` });
      result.blocked = true;
    }
  }
  result.confidence = result.blocked ? 0.63 : result.missing.length ? 0.76 : 0.91;
  result.questions = result.missing.map((item) => `Kunde soll ${item} konkretisieren.`);
  result.preparedPayload = { target: 'REQUIREMENTS_MATRIX_DRAFT', writePerformed: false, source: input.customerSpec, rows: input.requirements, feasibilityApproved: false };
  return result;
}

function invoiceMatch(input) {
  const result = resultBase();
  const invoice = input.invoice;
  result.extracted = { invoiceNumber: invoice.number, supplier: invoice.supplier, supplierId: invoice.supplierId, purchaseOrder: invoice.po, net: invoice.net, tax: invoice.tax, gross: invoice.gross };
  const ibanMatch = invoice.iban === input.supplierMaster?.iban;
  const poMatch = invoice.po === input.purchaseOrder?.number && invoice.supplierId === input.purchaseOrder?.supplierId;
  result.checks.push({ label: 'Lieferant und Bestellung', value: `${invoice.supplierId} / ${invoice.po}`, ok: poMatch });
  result.checks.push({ label: 'IBAN gegen Lieferantenstamm', value: ibanMatch ? 'stimmt überein' : 'weicht ab', ok: ibanMatch });
  for (const line of invoice.items || []) {
    const poLine = input.purchaseOrder?.items?.find((item) => item.sku === line.sku);
    const receipt = input.goodsReceipt?.items?.find((item) => item.sku === line.sku);
    const priceOk = poLine && poLine.unitPrice === line.unitPrice;
    const quantityOk = receipt && receipt.quantity === line.quantity;
    result.checks.push({ label: `${line.sku}: Preis`, value: `${money(line.unitPrice)} €`, ok: Boolean(priceOk) });
    result.checks.push({ label: `${line.sku}: Menge`, value: `Rechnung ${line.quantity} / WE ${receipt?.quantity ?? '—'}`, ok: Boolean(quantityOk) });
    if (!quantityOk) result.exceptions.push({ code: 'QUANTITY_MISMATCH', label: `Mengenabweichung bei ${line.sku}`, severity: 'medium', source: 'Rechnung ↔ Wareneingang' });
    if (!priceOk) result.exceptions.push({ code: 'PRICE_MISMATCH', label: `Preisabweichung bei ${line.sku}`, severity: 'medium', source: 'Rechnung ↔ PO' });
  }
  if (!ibanMatch) {
    result.sensitiveFlags.push('Geänderte Bankverbindung');
    result.exceptions.push({ code: 'IBAN_CHANGE', label: 'IBAN weicht vom freigegebenen Lieferantenstamm ab', severity: 'critical', source: 'Rechnung ↔ Lieferantenstamm' });
    result.blocked = true;
  }
  result.confidence = result.blocked ? 0.99 : result.exceptions.length ? 0.9 : 0.98;
  result.questions = result.blocked ? ['Bankdaten ausschließlich über den freigegebenen Lieferantenprozess verifizieren.'] : [];
  result.preparedPayload = { target: 'AP_APPROVAL_DRAFT', writePerformed: false, invoiceNumber: invoice.number, purchaseOrder: invoice.po, gross: invoice.gross, postingBlocked: result.blocked || result.exceptions.length > 0, bankDataUpdated: false };
  return result;
}

function rfqPrequal(input) {
  const result = resultBase();
  result.extracted = { request: input.request, quantityPerYear: input.quantityPerYear, cycleTimeSeconds: input.cycleTimeSeconds, interfaces: input.interfaces, targetSop: input.targetSop, requirements: input.requirements };
  result.missing = [...(input.missing || [])];
  for (const contradiction of input.contradictions || []) result.exceptions.push({ code: 'CONTRADICTION', label: contradiction, severity: 'high', source: 'RFQ-Quellen' });
  if (result.exceptions.length) result.blocked = true;
  result.checks = [{ label: 'Technische Machbarkeit', value: 'nicht automatisch freigegeben', ok: true }, { label: 'Preis', value: 'nicht berechnet', ok: true }, { label: 'Kernfelder', value: `${input.requirements} Anforderungen`, ok: result.missing.length === 0 }];
  result.confidence = result.blocked ? 0.72 : result.missing.length ? 0.74 : 0.93;
  result.questions = result.missing.map((field) => `Bitte ${field} ergänzen.`);
  result.preparedPayload = { target: 'RFQ_REVIEW_DRAFT', writePerformed: false, request: input.request, completeness: result.missing.length ? 'incomplete' : 'complete', contradictions: input.contradictions, feasibilityApproved: false, price: null };
  return result;
}

function quality8d(input) {
  const result = resultBase();
  result.extracted = { complaint: input.complaint, product: input.product, lot: input.lot, affected: input.quantityAffected, evidenceFiles: input.evidenceFiles?.length || 0 };
  result.missing = [...(input.missing || [])];
  if (!input.lot && !result.missing.includes('Charge / Lieferlos')) result.missing.push('Charge / Lieferlos');
  if (input.rootCause && !input.rootCauseEvidence) {
    result.exceptions.push({ code: 'UNSUPPORTED_ROOT_CAUSE', label: 'Ursachenbehauptung ohne Nachweis wird nur als Hypothese geführt', severity: 'high', source: 'Reklamationsfreitext' });
    result.blocked = true;
  }
  if (!input.evidenceFiles?.length) result.exceptions.push({ code: 'MISSING_EVIDENCE', label: 'Kein Ausfallteil, Foto oder Messnachweis vorhanden', severity: 'medium' });
  result.checks = [{ label: 'Containment', value: `${input.containment?.length || 0} Maßnahme(n) vorbereitet`, ok: Boolean(input.containment?.length) }, { label: 'Root Cause', value: 'offen—keine automatische Behauptung', ok: true }];
  result.confidence = result.missing.length || result.exceptions.length ? 0.72 : 0.91;
  result.questions = result.missing.map((field) => `${field} für die Abgrenzung nachfordern.`);
  result.preparedPayload = { target: '8D_WORKSPACE_DRAFT', writePerformed: false, d1Team: [], d2Problem: input.complaint, d3Containment: input.containment, d4RootCause: null, hypothesisFromInput: input.rootCause || null, evidenceRequired: true };
  return result;
}

function supplierDocs(input) {
  const result = resultBase();
  const referenceDate = new Date(input.referenceDate || '2026-08-13T00:00:00Z');
  result.extracted = { supplier: input.supplier, expectedDocuments: input.expected?.length || 0, receivedDocuments: input.documents?.length || 0 };
  for (const expected of input.expected || []) {
    const doc = input.documents?.find((item) => item.type === expected);
    if (!doc) {
      result.missing.push(expected);
      result.checks.push({ label: expected, value: 'fehlt', ok: false });
      continue;
    }
    const days = Math.ceil((new Date(`${doc.validUntil}T00:00:00Z`) - referenceDate) / 86400000);
    result.checks.push({ label: expected, value: `Version ${doc.version} · gültig bis ${doc.validUntil}`, ok: days > 30 });
    if (days <= 30) result.exceptions.push({ code: 'EXPIRING_DOCUMENT', label: `${expected} läuft in ${days} Tagen ab`, severity: days < 0 ? 'high' : 'medium', source: doc.version });
  }
  if (result.missing.length) result.blocked = true;
  result.confidence = result.missing.length ? 0.88 : 0.97;
  result.questions = result.missing.map((doc) => `${doc} beim Lieferanten anfordern.`);
  result.preparedPayload = { target: 'SUPPLIER_DOCUMENT_REGISTER_DRAFT', writePerformed: false, supplier: input.supplier, documents: input.documents, missing: result.missing, alerts: result.exceptions };
  return result;
}

function maintenanceActions(input) {
  const result = resultBase();
  result.extracted = { report: input.report, machineNumber: input.machineNumber, findings: input.findings?.length || 0 };
  for (const finding of input.findings || []) {
    const complete = Boolean(finding.severity && finding.owner && finding.deadline);
    result.checks.push({ label: finding.text, value: `${finding.severity || 'Schweregrad offen'} · ${finding.owner || 'Verantwortung offen'} · ${finding.deadline || 'Frist offen'}`, ok: complete });
    if (!finding.severity) result.exceptions.push({ code: 'UNCLEAR_SEVERITY', label: `Schweregrad unklar: ${finding.text}`, severity: 'high', source: input.report });
    if (!finding.owner) result.missing.push(`Verantwortliche Stelle für „${finding.text}“`);
    if (!finding.deadline) result.missing.push(`Frist für „${finding.text}“`);
  }
  if (result.exceptions.length) result.blocked = true;
  result.confidence = result.blocked ? 0.62 : result.missing.length ? 0.78 : 0.94;
  result.questions = result.missing.map((field) => `${field} festlegen.`);
  result.preparedPayload = { target: 'CMMS_ACTIONS_DRAFT', writePerformed: false, machineNumber: input.machineNumber, actions: input.findings?.map((finding, index) => ({ id: `A-${index + 1}`, ...finding, status: 'draft' })) };
  return result;
}

function tradeFairLead(input) {
  const result = resultBase();
  result.extracted = { company: input.badge?.company, contact: input.badge?.name, role: input.badge?.role, interest: input.interest, followUpConsent: input.consent?.followUp };
  if (!input.badge?.role) result.missing.push('Rolle/Funktion');
  if (!input.interest) result.missing.push('konkretes Interesse');
  if (input.consent?.followUp !== true) {
    result.exceptions.push({ code: 'CONSENT_UNCLEAR', label: 'Follow-up-Erlaubnis nicht dokumentiert', severity: 'high', source: 'Gesprächsnotiz' });
    result.blocked = true;
  }
  if (input.existingContact) result.exceptions.push({ code: 'POSSIBLE_DUPLICATE', label: `Mögliche CRM-Dublette ${input.existingContact.id} (${(input.existingContact.similarity * 100).toFixed(0)} %)`, severity: 'medium', source: 'CRM-Suche' });
  result.checks = [{ label: 'Follow-up-Consent', value: input.consent?.followUp === true ? `dokumentiert: ${input.consent.source}` : 'nicht dokumentiert', ok: input.consent?.followUp === true }, { label: 'CRM-Schreibvorgang', value: 'nicht ausgeführt', ok: true }];
  result.confidence = result.blocked ? 0.55 : result.exceptions.length ? 0.81 : 0.94;
  result.questions = result.missing.map((field) => `${field} vor CRM-Freigabe ergänzen.`);
  result.preparedPayload = { target: 'CRM_LEAD_DRAFT', writePerformed: false, contact: input.badge, interest: input.interest, notes: input.notes, consent: input.consent, followUpDraftAllowed: input.consent?.followUp === true };
  return result;
}

const handlers = { 'order-intake': orderIntake, 'service-triage': serviceTriage, 'spare-parts': spareParts, 'spec-delta': specDelta, 'invoice-match': invoiceMatch, 'rfq-prequal': rfqPrequal, 'quality-8d': quality8d, 'supplier-docs': supplierDocs, 'maintenance-actions': maintenanceActions, 'trade-fair-lead': tradeFairLead };

function auditEvent(step, label, detail, tone = 'neutral') {
  return { step, label, detail, tone };
}

export function runWorkflow(workflowId, input, context = {}) {
  const workflow = workflowById[workflowId];
  if (!workflow) throw new Error(`Unknown workflow: ${workflowId}`);
  const idempotencyKey = input.eventId || stableHash(input);
  const runId = `LAB-${workflow.code}-${stableHash(`${workflow.id}:${idempotencyKey}`)}`;
  const seen = context.seen || new Set();
  if (seen.has(`${workflow.id}:${idempotencyKey}`)) {
    return {
      workflowId, runId, idempotencyKey, state: runStates.duplicate, humanRequired: false, decision: null,
      result: { extracted: {}, checks: [{ label: 'Idempotenzschlüssel', value: idempotencyKey, ok: true }], missing: [], exceptions: [{ code: 'DUPLICATE_EVENT', label: 'Dieses Ereignis wurde bereits verarbeitet.', severity: 'low' }], preparedPayload: null, confidence: 1 },
      audit: [auditEvent(1, 'Ereignis empfangen', idempotencyKey), auditEvent(2, 'Duplikat erkannt', 'Keine zweite Verarbeitung und kein externer Schreibvorgang.', 'neutral')],
      adapter: { status: 'Mocked adapter', writesPerformed: 0 },
    };
  }
  seen.add(`${workflow.id}:${idempotencyKey}`);
  const result = handlers[workflowId](input);
  let state = runStates.ready;
  if (result.retry) state = runStates.retry;
  else if (result.blocked) state = runStates.stopped;
  else if (result.exceptions.length || result.missing.length || result.confidence < 0.85) state = runStates.review;
  const audit = [
    auditEvent(1, 'Eingang registriert', `${workflow.sourceSystem} · ${idempotencyKey}`),
    auditEvent(2, 'Felder strukturiert', `${Object.keys(result.extracted).length} Kernfelder · ${(result.confidence * 100).toFixed(0)} % Regelkonfidenz`),
    auditEvent(3, 'Regelprüfung abgeschlossen', `${result.checks.length} Prüfungen · ${result.exceptions.length} Ausnahme(n)`),
  ];
  if (result.exceptions.length || result.missing.length) audit.push(auditEvent(4, 'Ausnahmeweg geöffnet', `${result.missing.length} fehlend · ${result.exceptions.length} auffällig`, state.tone));
  audit.push(auditEvent(5, 'Menschliche Entscheidung ausstehend', state.label, state.tone));
  return { workflowId, runId, idempotencyKey, state, humanRequired: state !== runStates.retry, decision: 'pending', result, evidence: input.evidence || [], audit, adapter: { status: 'Mocked adapter', writesPerformed: 0, systemOfRecord: workflow.systemOfRecord } };
}

export function applyHumanDecision(run, decision, note = '') {
  if (!['approve', 'reject'].includes(decision)) throw new Error('Decision must be approve or reject');
  if (!run.humanRequired || run.state.code === runStates.duplicate.code || run.state.code === runStates.retry.code) return run;
  const approved = decision === 'approve';
  return {
    ...run,
    decision,
    state: approved ? runStates.approved : runStates.rejected,
    result: { ...run.result, preparedPayload: approved ? run.result.preparedPayload : null, externalWritePerformed: false },
    audit: [...run.audit, auditEvent(6, approved ? 'Entwurf freigegeben' : 'Entwurf abgelehnt', `${note || 'Keine Notiz'} · Kein externer Schreibvorgang.`, approved ? 'ready' : 'stop')],
  };
}

export function simulateUnavailableDependency(workflowId, input) {
  const workflow = workflowById[workflowId];
  const idempotencyKey = input.eventId || stableHash(input);
  return {
    workflowId,
    runId: `LAB-${workflow.code}-${stableHash(`${workflow.id}:${idempotencyKey}:retry`)}`,
    idempotencyKey,
    state: runStates.retry,
    humanRequired: false,
    decision: null,
    result: { extracted: {}, checks: [], missing: [], exceptions: [{ code: 'DEPENDENCY_UNAVAILABLE', label: 'Mock-Adapter vorübergehend nicht erreichbar', severity: 'medium' }], confidence: 1, preparedPayload: null, retry: { attempt: 1, maxAttempts: 3, nextDelaySeconds: 30 } },
    audit: [auditEvent(1, 'Eingang registriert', idempotencyKey), auditEvent(2, 'Adapter nicht erreichbar', 'Versuch 1/3', 'review'), auditEvent(3, 'Wiederholung vorgemerkt', 'Exponentialer Backoff: 30 Sekunden; kein Schreibvorgang.', 'review')],
    adapter: { status: 'Mocked adapter', writesPerformed: 0 },
  };
}
