import { buildFlagshipN8nExport, isFlagshipWorkflow } from './flagship-workflow-builder.mjs';

const profiles = {
  'order-intake': {
    intake: 'E-Mail + PDF / Excel Bestellung',
    context: 'ERP Kunden- und Artikelstamm',
    target: 'ERP Auftrag',
    owner: 'Auftragssachbearbeitung',
    stages: ['Bestellkopf extrahieren', 'Kundenstamm auflösen [MOCK]', 'Artikelstamm auflösen [MOCK]', 'Preis, Menge und Lieferkonditionen prüfen'],
    ruleCode: `
const lines = Array.isArray(input.items) ? input.items : [];
const unknown = lines.filter((line) => !Number.isFinite(line.masterPrice));
const priceDeltas = lines.filter((line) => Number.isFinite(line.masterPrice) && Math.abs(line.unitPrice - line.masterPrice) / line.masterPrice > 0.02);
if (unknown.length) issues.push(issue('UNKNOWN_ARTICLE', 'stop', 'Mindestens eine Position ist keinem freigegebenen Artikel zugeordnet.', unknown.map((line) => line.sku)));
if (!input.deliveryDate) issues.push(issue('DELIVERY_DATE_MISSING', 'stop', 'Der bestätigungsfähige Liefertermin fehlt.', [input.document]));
if (priceDeltas.length) issues.push(issue('PRICE_DEVIATION', 'review', 'Preisabweichung über 2 % muss kaufmännisch freigegeben werden.', priceDeltas.map((line) => line.sku)));
if (!input.customer?.number) issues.push(issue('CUSTOMER_UNRESOLVED', 'review', 'Der Kunde konnte nicht eindeutig gegen den Stamm aufgelöst werden.'));`,
  },
  'service-triage': {
    intake: 'Service-E-Mail + Anhänge',
    context: 'Installed Base + Servicehistorie',
    target: 'Service Ticket',
    owner: 'Serviceleitung',
    stages: ['Service-E-Mail und Anhänge strukturieren', 'Maschine im Installed Base suchen [MOCK]', 'Servicehistorie zusammenstellen [MOCK]', 'Priorität und Sicherheit deterministisch bewerten'],
    ruleCode: `
if (input.safetyConcern === true) issues.push(issue('SAFETY_SIGNAL', 'stop', 'Sicherheitsrelevanter Hinweis: keine Ferndiagnose, sofortige manuelle Eskalation.', input.errorCodes ?? []));
if (!input.machineNumber || !input.machine) issues.push(issue('MACHINE_UNRESOLVED', 'review', 'Maschine oder Seriennummer ist nicht eindeutig zugeordnet.', [input.internalLine].filter(Boolean)));
if (!Array.isArray(input.errorCodes) || input.errorCodes.length === 0) issues.push(issue('ERROR_CODE_MISSING', 'review', 'Fehlercode fehlt; Rückfrage wird vorbereitet.'));
if (input.productionStopped === true) signals.push('production_stop');`,
  },
  'spare-parts': {
    intake: 'Freitext + Foto + Maschinennummer',
    context: 'BOM + Nachfolger + Bestand',
    target: 'Ersatzteil-Anfrage',
    owner: 'Ersatzteilservice',
    stages: ['Anfrage und Bildhinweise strukturieren', 'Maschine und BOM-Version auflösen [MOCK]', 'Kandidaten und Nachfolger vergleichen [MOCK]', 'Confidence und Freigabestatus prüfen'],
    ruleCode: `
const candidates = Array.isArray(input.candidates) ? input.candidates : [];
if (candidates.length === 0) issues.push(issue('NO_PART_CANDIDATE', 'stop', 'Kein belastbarer Ersatzteilkandidat vorhanden.'));
if (candidates.some((part) => part.successor && part.successorApproved !== true)) issues.push(issue('SUCCESSOR_NOT_APPROVED', 'stop', 'Ein möglicher Nachfolger ist technisch nicht freigegeben.', candidates.map((part) => part.successor).filter(Boolean)));
if (candidates.length > 1 || candidates.some((part) => Number(part.confidence) < 0.9)) issues.push(issue('AMBIGUOUS_PART', 'review', 'Mehrdeutige Variante: Typenschild oder elektrische Ausführung muss bestätigt werden.', candidates.map((part) => part.part)));
if (candidates.some((part) => Number(part.stock) === 0)) signals.push('synthetic_stock_zero');`,
  },
  'spec-delta': {
    intake: 'Kundenlastenheft + interner Standard',
    context: 'Anforderungs- und Standardmatrix',
    target: 'Review-Matrix',
    owner: 'Engineering',
    stages: ['Dokumente segmentieren und Seitenanker erhalten', 'Anforderungen kanonisch normalisieren', 'Interne Standards zuordnen [MOCK]', 'Deltas, Lücken und Widersprüche klassifizieren'],
    ruleCode: `
const requirements = Array.isArray(input.requirements) ? input.requirements : [];
if (requirements.some((row) => row.state === 'contradiction')) issues.push(issue('CONTRADICTORY_REQUIREMENT', 'stop', 'Widersprüchliche Anforderungen dürfen nicht still konsolidiert werden.', requirements.filter((row) => row.state === 'contradiction').map((row) => row.id)));
if (requirements.some((row) => row.state === 'missing-measure')) issues.push(issue('ACCEPTANCE_CRITERION_MISSING', 'review', 'Messbares Abnahmekriterium fehlt.', requirements.filter((row) => row.state === 'missing-measure').map((row) => row.id)));
signals.push(...requirements.filter((row) => row.state === 'delta').map((row) => \`delta:\${row.id}\`));`,
  },
  'invoice-match': {
    intake: 'E-Rechnung / PDF + PO + Wareneingang',
    context: 'Lieferantenstamm + PO + Wareneingang',
    target: 'Buchungsvorschlag',
    owner: 'Kreditorenbuchhaltung',
    stages: ['Rechnungsfelder und Positionen extrahieren', 'Lieferant und Bestellung auflösen [MOCK]', 'Drei-Wege-Match ausführen', 'Steuer- und Bankkontrollen anwenden'],
    ruleCode: `
const invoice = input.invoice ?? {};
const po = input.purchaseOrder ?? {};
const receipt = input.goodsReceipt ?? {};
if (invoice.iban && input.supplierMaster?.iban && invoice.iban !== input.supplierMaster.iban) issues.push(issue('IBAN_CHANGED', 'stop', 'Geänderte IBAN: Zahlungsvorschlag wird immer gesperrt.', ['Rechnung.IBAN', 'Lieferantenstamm.IBAN']));
const qtyMismatch = (invoice.items ?? []).some((line, index) => Number(line.quantity) !== Number(receipt.items?.[index]?.quantity));
const priceMismatch = (invoice.items ?? []).some((line, index) => Number(line.unitPrice) !== Number(po.items?.[index]?.unitPrice));
if (qtyMismatch) issues.push(issue('QUANTITY_MISMATCH', 'review', 'Rechnungsmenge und Wareneingang stimmen nicht überein.'));
if (priceMismatch) issues.push(issue('PRICE_MISMATCH', 'review', 'Rechnungspreis und Bestellpreis stimmen nicht überein.'));
if (invoice.supplierId !== po.supplierId) issues.push(issue('SUPPLIER_MISMATCH', 'stop', 'Lieferant in Rechnung und Bestellung weicht ab.'));`,
  },
  'rfq-prequal': {
    intake: 'RFQ-E-Mail + technische Dokumente',
    context: 'CRM + freigegebene Angebotsregeln',
    target: 'RFQ Review Package',
    owner: 'Technischer Vertrieb',
    stages: ['RFQ und Anlagen strukturieren', 'Anforderungen mit Quellen verknüpfen', 'Vollständigkeit gegen Prüfkatalog testen', 'Widersprüche und Rückfragen ableiten'],
    ruleCode: `
if ((input.contradictions ?? []).length) issues.push(issue('RFQ_CONTRADICTION', 'stop', 'Widersprüchliche technische Angaben müssen durch den Kunden geklärt werden.', input.contradictions));
if ((input.missing ?? []).length) issues.push(issue('RFQ_INFORMATION_MISSING', 'review', 'Kritische Angaben fehlen; Rückfragen werden vorbereitet.', input.missing));
if (!input.request) issues.push(issue('SCOPE_MISSING', 'stop', 'Anfragegegenstand fehlt.'));`,
  },
  'quality-8d': {
    intake: 'Reklamation + Fotos + Messdaten',
    context: 'QMS + Chargen- und Prüfkontext',
    target: '8D Arbeitsentwurf',
    owner: 'Qualitätsleitung',
    stages: ['Reklamation und Evidenz strukturieren', 'Produkt und Charge auflösen [MOCK]', 'Containment-Arbeitsliste vorbereiten', 'Behauptungen von belegten Fakten trennen'],
    ruleCode: `
if (input.rootCause && !input.rootCauseEvidence) issues.push(issue('UNSUPPORTED_ROOT_CAUSE', 'stop', 'Eine unbelegte Ursachenbehauptung wird nicht in den 8D übernommen.', [input.rootCause]));
if (!input.lot) issues.push(issue('LOT_MISSING', 'review', 'Charge oder Lieferlos fehlt; betroffener Bestand kann nicht sicher eingegrenzt werden.'));
if ((input.missing ?? []).length) issues.push(issue('EVIDENCE_MISSING', 'review', 'Nachweise oder Prüfergebnisse fehlen.', input.missing));
signals.push('root_cause_remains_human');`,
  },
  'supplier-docs': {
    intake: 'Zertifikate + Erklärungen + Kalibrierscheine',
    context: 'Lieferantenpflichten + Dokumentenregister',
    target: 'DMS/QMS Prüfliste',
    owner: 'Supplier Quality',
    stages: ['Dokumenttyp und Lieferant klassifizieren', 'Version und Gültigkeit normalisieren', 'Pflichtensatz gegen Register prüfen [MOCK]', 'Ablauf- und Vollständigkeitsregeln anwenden'],
    ruleCode: `
const docs = Array.isArray(input.documents) ? input.documents : [];
const present = new Set(docs.map((doc) => doc.type));
const missing = (input.expected ?? []).filter((type) => !present.has(type));
if (missing.length) issues.push(issue('REQUIRED_DOCUMENT_MISSING', 'stop', 'Mindestens ein Pflichtdokument fehlt.', missing));
const reference = new Date(input.referenceDate ?? '2026-08-13T00:00:00Z');
const expiring = docs.filter((doc) => { const days = (new Date(doc.validUntil) - reference) / 86400000; return days >= 0 && days <= 30; });
if (expiring.length) issues.push(issue('DOCUMENT_EXPIRING', 'review', 'Dokument läuft innerhalb von 30 Tagen ab.', expiring.map((doc) => \`\${doc.type}:\${doc.validUntil}\`)));`,
  },
  'maintenance-actions': {
    intake: 'Techniker- oder Wartungsbericht',
    context: 'Installed Base + CMMS-Aufgaben',
    target: 'CMMS Maßnahmenentwurf',
    owner: 'Instandhaltungsleitung',
    stages: ['Befunde mit Quellen extrahieren', 'Maschine im Installed Base auflösen [MOCK]', 'Ersatzteile und Zuständigkeiten ergänzen [MOCK]', 'Schweregrad, Frist und Vollständigkeit prüfen'],
    ruleCode: `
const findings = Array.isArray(input.findings) ? input.findings : [];
if (findings.some((finding) => /riss/i.test(finding.text ?? '') && !finding.severity)) issues.push(issue('POTENTIAL_SAFETY_FINDING', 'stop', 'Ein Riss ohne Lage- und Sicherheitsbewertung muss manuell eskaliert werden.'));
if (findings.some((finding) => !finding.owner || !finding.deadline)) issues.push(issue('ACTION_OWNER_OR_DEADLINE_MISSING', 'review', 'Mindestens eine Maßnahme hat keinen Verantwortlichen oder keine Frist.'));
if (findings.some((finding) => !finding.part)) signals.push('part_identification_open');`,
  },
  'trade-fair-lead': {
    intake: 'Badge + Visitenkarte + Gesprächsnotiz',
    context: 'CRM Dubletten- und Consent-Prüfung',
    target: 'CRM Lead Draft',
    owner: 'Sales Operations',
    stages: ['Badge und Notizen konsolidieren', 'Firma und Kontakt normalisieren', 'CRM-Dublette suchen [MOCK]', 'Consent und Follow-up-Eignung prüfen'],
    ruleCode: `
if (input.consent?.followUp !== true) issues.push(issue('FOLLOW_UP_CONSENT_UNCLEAR', 'stop', 'Ohne dokumentierte Kontaktfreigabe wird kein Follow-up vorbereitet.'));
if (input.existingContact) issues.push(issue('POSSIBLE_DUPLICATE', 'review', 'Mögliche CRM-Dublette muss zusammengeführt oder verworfen werden.', [input.existingContact.id]));
if (!input.interest || !input.badge?.role) issues.push(issue('QUALIFICATION_INCOMPLETE', 'review', 'Interesse oder Rolle fehlt.'));`,
  },
};

function uuidFrom(text) {
  let hex = '';
  for (let index = 0; hex.length < 32; index += 1) {
    hex += [...`${text}:${index}`].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261).toString(16).padStart(8, '0');
  }
  hex = hex.slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function baseNode(workflow, key, name, type, typeVersion, position, parameters = {}) {
  return { parameters, id: uuidFrom(`${workflow.id}-${key}`), name, type, typeVersion, position };
}

function codeNode(workflow, key, name, position, jsCode) {
  return baseNode(workflow, key, name, 'n8n-nodes-base.code', 2, position, { jsCode });
}

function switchNode(workflow, key, name, position, numberOutputs, expression) {
  return baseNode(workflow, key, name, 'n8n-nodes-base.switch', 3.4, position, {
    mode: 'expression', numberOutputs, output: expression,
  });
}

function noOpNode(workflow, key, name, position) {
  return baseNode(workflow, key, name, 'n8n-nodes-base.noOp', 1, position, {});
}

function noteNode(workflow, key, name, position, content, color, width = 840, height = 300) {
  return baseNode(workflow, key, name, 'n8n-nodes-base.stickyNote', 1, position, { content, width, height, color });
}

function disabledAdapterNode(workflow, profile, position) {
  return {
    ...baseNode(workflow, 'disabled-adapter', `[DISABLED] ${profile.target} Test Adapter`, 'n8n-nodes-base.httpRequest', 4.2, position, {
      method: 'POST',
      url: 'https://example.invalid/test-adapter',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Idempotency-Key', value: '={{ $json.idempotencyKey }}' }] },
      sendBody: true,
      contentType: 'raw',
      rawContentType: 'application/json',
      body: '={{ JSON.stringify($json.preparedOutput) }}',
      options: { timeout: 5000 },
    }),
    disabled: true,
    onError: 'stopWorkflow',
    notes: 'Intentionally disabled. Assign a test credential and test endpoint only in a future approved integration goal.',
  };
}

function addConnection(connections, source, target, output = 0) {
  connections[source] ??= { main: [] };
  while (connections[source].main.length <= output) connections[source].main.push([]);
  connections[source].main[output].push({ node: target, type: 'main', index: 0 });
}

function syntheticCases(workflow) {
  const happy = workflow.scenarios.find((scenario) => scenario.kind === 'happy');
  const dependencyInput = structuredClone(happy.input);
  dependencyInput.eventId = `${happy.input.eventId}-DEP`;
  dependencyInput.adapterAvailable = false;
  dependencyInput.retryAttempt = 1;
  const invalidInput = structuredClone(happy.input);
  invalidInput.eventId = null;
  return [
    ...workflow.scenarios.map(({ id, label, kind, input }) => ({ id, label, kind, input })),
    { id: `${happy.id}-replay`, label: 'Doppelte Zustellung', kind: 'duplicate', input: structuredClone(happy.input) },
    { id: `${happy.id}-dependency`, label: 'Temporärer Adapterfehler', kind: 'dependency', input: dependencyInput },
    { id: `${happy.id}-invalid`, label: 'Ungültiger Eingangsvertrag', kind: 'invalid', input: invalidInput },
  ];
}

function stageCode(label, index) {
  return `return items.map((item) => ({ json: { ...item.json, processing: [...(item.json.processing ?? []), { order: ${index + 1}, step: ${JSON.stringify(label)}, status: 'completed', sourceBound: true }], audit: [...item.json.audit, { state: 'DOMAIN_STAGE_${index + 1}', detail: ${JSON.stringify(label)}, at: '2026-08-13T12:0${index}:00.000Z' }] } }));`;
}

function domainEvaluationCode(profile) {
  return `return items.map((item) => {
  const input = item.json.sourceInput ?? {};
  const issues = [];
  const signals = [];
  const issue = (code, severity, message, evidence = []) => ({ code, severity, message, evidence });
  ${profile.ruleCode}
  const status = issues.some((entry) => entry.severity === 'stop')
    ? 'STOPPED_FOR_REVIEW'
    : issues.some((entry) => entry.severity === 'review')
      ? 'REVIEW_REQUIRED'
      : 'READY_FOR_REVIEW';
  return { json: {
    ...item.json,
    decision: { status, derivedBy: 'deterministic_guardrails', humanRequired: true },
    exceptions: issues,
    signals,
    audit: [...item.json.audit, { state: 'GUARDRAILS_EVALUATED', detail: status, at: '2026-08-13T12:05:00.000Z' }]
  } };
});`;
}

export function buildN8nExport(workflow) {
  if (isFlagshipWorkflow(workflow.id)) return buildFlagshipN8nExport(workflow);
  const profile = profiles[workflow.id];
  if (!profile) throw new Error(`Missing n8n profile for ${workflow.id}`);
  const cases = syntheticCases(workflow);
  const nodes = [
    noteNode(workflow, 'note-overview', 'Note 01 - Business Flow', [-1240, -720], `# LAB ${workflow.number}: ${workflow.title}\n\n**Buyer:** ${workflow.buyer}\n\n**Problem:** ${workflow.problem}\n\n**Result:** ${workflow.improvement}\n\nInput → contract → idempotency → context → deterministic rules → exception → human decision → draft.`, 2),
    noteNode(workflow, 'note-contract', 'Note 02 - Contract & Evidence', [-300, -720], `# Contract and evidence\n\n- Six synthetic cases: happy, review, stop, duplicate, dependency failure and invalid payload.\n- Source references stay attached to findings.\n- Missing critical facts are never inferred.\n- Correlation and idempotency keys are created before any adapter boundary.`, 4),
    noteNode(workflow, 'note-reliability', 'Note 03 - Reliability Controls', [660, -720], `# Reliability controls\n\n- Atomic claim is represented by a deterministic test double.\n- Duplicate delivery returns the previous outcome.\n- Only transient failures enter a bounded retry envelope.\n- Retry budget: 3 attempts; no unbounded loop.\n- Invalid data enters a redacted repair queue.`, 3),
    noteNode(workflow, 'note-domain', 'Note 04 - Domain Guardrails', [1640, -720], `# Domain guardrails\n\nContext: ${profile.context} (mocked adapter).\n\nThe workflow classifies each case as review-ready, review-required or stopped. Domain rules—not an LLM prompt—own the stop decision.`, 5),
    noteNode(workflow, 'note-human', 'Note 05 - Human Boundary', [2640, -720], `# Human-controlled decision\n\nOwner: ${profile.owner}.\n\nApprove, reject or request information. The approval is version-bound. The external adapter is visible but disabled; every test run reports zero external writes.`, 6),
    noteNode(workflow, 'note-tests', 'Note 06 - Test Matrix', [3640, -720], `# Test matrix\n\n1. Nominal input reaches review-ready.\n2. Recoverable deviation explains its evidence.\n3. Critical ambiguity stops.\n4. Replay is idempotent.\n5. Dependency outage schedules bounded retry.\n6. Invalid contract is redacted and quarantined.\n\nStatus: Synthetic Demo · Built and testable · not customer validated.`, 7, 900, 340),

    baseNode(workflow, 'trigger', 'Manual Test Start', 'n8n-nodes-base.manualTrigger', 1, [-1240, 0], {}),
    codeNode(workflow, 'cases', 'Load 6 Synthetic Test Cases', [-1020, 0], `const fixtures = ${JSON.stringify(cases)};\nreturn fixtures.map((fixture) => ({ json: { workflowId: '${workflow.id}', evidenceType: 'Synthetic Demo', ...fixture } }));`),
    codeNode(workflow, 'normalize', 'Normalize Intake Envelope', [-800, 0], `return items.map((item, index) => ({ json: {
  workflowId: item.json.workflowId,
  workflowTitle: ${JSON.stringify(workflow.englishTitle)},
  implementationStatus: '${workflow.status}',
  adapterStatus: '${workflow.adapterStatus}',
  evidenceType: item.json.evidenceType,
  scenario: item.json.id,
  scenarioLabel: item.json.label,
  fixtureKind: item.json.kind,
  sourceType: ${JSON.stringify(profile.intake)},
  sourceInput: item.json.input,
  correlationId: item.json.input?.eventId ?? \`INVALID-${workflow.code}-\${String(index + 1).padStart(2, '0')}\`,
  idempotencyKey: item.json.input?.eventId ?? null,
  retry: { attempt: Number(item.json.input?.retryAttempt ?? 0), maxAttempts: 3, policy: 'transient_only' },
  adapter: { name: ${JSON.stringify(profile.context)}, mode: 'mock', available: item.json.kind !== 'dependency', writesPerformed: 0 },
  processing: [],
  audit: [{ state: 'INPUT_RECEIVED', detail: item.json.id, at: '2026-08-13T12:00:00.000Z' }]
} }));`),
    codeNode(workflow, 'validate', 'Validate Required Contract', [-580, 0], `return items.map((item) => {
  const missing = [];
  if (!item.json.sourceInput || typeof item.json.sourceInput !== 'object') missing.push('sourceInput');
  if (!item.json.sourceInput?.eventId) missing.push('eventId');
  return { json: { ...item.json, validation: { valid: missing.length === 0, missing, schema: '${workflow.code}_INTAKE_V1' }, audit: [...item.json.audit, { state: 'CONTRACT_VALIDATED', detail: missing.length ? missing.join(',') : 'valid', at: '2026-08-13T12:00:10.000Z' }] } };
});`),
    switchNode(workflow, 'route-contract', 'Route Contract Status', [-360, 0], 2, '={{ $json.validation.valid ? 0 : 1 }}'),

    codeNode(workflow, 'validation-incident', 'Classify Validation Error', [-100, 500], `return items.map((item) => ({ json: { ...item.json, status: 'INVALID_INPUT', errorClass: 'business_validation', retryable: false, exceptions: [{ code: 'INVALID_CONTRACT', severity: 'stop', message: \`Missing: \${item.json.validation.missing.join(', ')}\` }], externalWritePerformed: false } }));`),
    codeNode(workflow, 'redact-invalid', 'Redact Invalid Payload', [140, 500], `return items.map((item) => ({ json: { ...item.json, sourceInput: { redacted: true, sourceType: item.json.sourceType }, redaction: { applied: true, retained: ['correlationId', 'scenario', 'errorClass'] } } }));`),
    codeNode(workflow, 'audit-validation', 'Audit Validation Failure', [380, 500], `return items.map((item) => ({ json: { ...item.json, audit: [...item.json.audit, { state: 'MANUAL_DATA_REPAIR', detail: 'invalid_contract', at: '2026-08-13T12:00:20.000Z' }] } }));`),
    noOpNode(workflow, 'terminal-invalid', 'Terminal - Manual Data Repair', [620, 500]),

    codeNode(workflow, 'claim-key', 'Claim Idempotency Key [MOCK]', [-100, 0], `const claimed = new Set();
return items.map((item) => {
  const key = item.json.idempotencyKey;
  const duplicate = item.json.fixtureKind === 'duplicate' || claimed.has(key);
  if (!duplicate) claimed.add(key);
  return { json: { ...item.json, idempotency: { key, claimed: !duplicate, duplicate, store: 'atomic_test_double' }, audit: [...item.json.audit, { state: duplicate ? 'DUPLICATE_DETECTED' : 'IDEMPOTENCY_CLAIMED', detail: key, at: '2026-08-13T12:00:30.000Z' }] } };
});`),
    switchNode(workflow, 'route-replay', 'Route Replay Status', [140, 0], 2, '={{ $json.idempotency.duplicate ? 1 : 0 }}'),
    codeNode(workflow, 'previous-outcome', 'Load Previous Outcome [MOCK]', [380, 280], `return items.map((item) => ({ json: { ...item.json, status: 'DUPLICATE_REPLAY', previousOutcome: { status: 'READY_FOR_REVIEW', reference: item.json.idempotencyKey }, externalWritePerformed: false } }));`),
    codeNode(workflow, 'audit-duplicate', 'Audit Duplicate Delivery', [620, 280], `return items.map((item) => ({ json: { ...item.json, audit: [...item.json.audit, { state: 'REPLAY_SAFE_RETURN', detail: 'no_second_processing', at: '2026-08-13T12:00:40.000Z' }] } }));`),
    noOpNode(workflow, 'terminal-replay', 'Terminal - Replay Safe', [860, 280]),

    codeNode(workflow, 'context', `Load ${profile.context} [MOCK]`, [380, 0], `return items.map((item) => ({ json: { ...item.json, contextLookup: { source: ${JSON.stringify(profile.context)}, status: item.json.adapter.available ? 'available' : 'unavailable', synthetic: true }, audit: [...item.json.audit, { state: 'CONTEXT_LOOKUP', detail: item.json.adapter.available ? 'ok' : '503_test_double', at: '2026-08-13T12:00:50.000Z' }] } }));`),
    switchNode(workflow, 'route-dependency', 'Route Dependency Health', [620, 0], 2, '={{ $json.adapter.available ? 0 : 1 }}'),
    codeNode(workflow, 'classify-dependency', 'Classify Transient Dependency Failure', [860, 500], `return items.map((item) => ({ json: { ...item.json, status: 'DEPENDENCY_UNAVAILABLE', errorClass: 'external_transient', retryable: true, retry: { ...item.json.retry, attempt: item.json.retry.attempt || 1 }, externalWritePerformed: false } }));`),
    switchNode(workflow, 'route-retry', 'Route Retry Budget', [1100, 500], 2, '={{ $json.retry.retryable === false || $json.retry.attempt >= $json.retry.maxAttempts ? 1 : 0 }}'),
    codeNode(workflow, 'backoff', 'Plan Backoff + Jitter', [1340, 420], `return items.map((item) => ({ json: { ...item.json, retry: { ...item.json.retry, nextAttempt: item.json.retry.attempt + 1, backoffSeconds: Math.min(60, 2 ** item.json.retry.attempt) + 1, jitterPolicy: 'deterministic_test_value' } } }));`),
    codeNode(workflow, 'retry-envelope', 'Persist Retry Envelope [MOCK]', [1580, 420], `return items.map((item) => ({ json: { ...item.json, retryEnvelope: { correlationId: item.json.correlationId, idempotencyKey: item.json.idempotencyKey, nextAttempt: item.json.retry.nextAttempt, payloadRedacted: true }, audit: [...item.json.audit, { state: 'RETRY_SCHEDULED', detail: \`attempt_\${item.json.retry.nextAttempt}\`, at: '2026-08-13T12:01:00.000Z' }] } }));`),
    noOpNode(workflow, 'terminal-retry', 'Terminal - Bounded Retry Queue', [1820, 420]),
    codeNode(workflow, 'incident', 'Build Redacted Technical Incident', [1340, 620], `return items.map((item) => ({ json: { ...item.json, status: 'TERMINAL_DEPENDENCY_FAILURE', incident: { severity: 'high', correlationId: item.json.correlationId, errorClass: item.json.errorClass, payloadIncluded: false }, externalWritePerformed: false } }));`),
    noOpNode(workflow, 'terminal-operator', 'Terminal - Operator Action', [1580, 620]),

    ...profile.stages.map((stage, index) => codeNode(workflow, `domain-${index + 1}`, stage, [860 + index * 240, 0], stageCode(stage, index))),
    codeNode(workflow, 'guardrails', 'Evaluate Deterministic Guardrails', [1820, 0], domainEvaluationCode(profile)),
    switchNode(workflow, 'route-business', 'Route Business Outcome', [2060, 0], 3, "={{ ({ READY_FOR_REVIEW: 0, REVIEW_REQUIRED: 1, STOPPED_FOR_REVIEW: 2 })[$json.decision.status] ?? 2 }}"),
    codeNode(workflow, 'ready-candidate', 'Prepare Review-Ready Candidate', [2300, -180], `return items.map((item) => ({ json: { ...item.json, route: 'ready', reviewMessage: 'Prüfung vollständig; fachliche Freigabe bleibt erforderlich.' } }));`),
    codeNode(workflow, 'review-exceptions', 'Explain Review Exceptions', [2300, 0], `return items.map((item) => ({ json: { ...item.json, route: 'review', reviewMessage: 'Abweichung mit Quelle und empfohlener Rückfrage vorbereitet.' } }));`),
    codeNode(workflow, 'quarantine', 'Quarantine Critical Case', [2300, 180], `return items.map((item) => ({ json: { ...item.json, route: 'stopped', reviewMessage: 'Kritischer Stop: keine automatische Fortsetzung.' } }));`),
    codeNode(workflow, 'human', 'Human Decision Required', [2560, 0], `return items.map((item) => ({ json: { ...item.json, humanDecision: { state: 'pending', owner: ${JSON.stringify(profile.owner)}, allowed: ['approve', 'reject', 'request_information'], approvalVersion: \`\${item.json.correlationId}:v1\` }, externalWritePerformed: false, audit: [...item.json.audit, { state: 'HUMAN_REVIEW_PENDING', detail: item.json.decision.status, at: '2026-08-13T12:06:00.000Z' }] } }));`),
    codeNode(workflow, 'draft', `Build ${profile.target} Draft`, [2800, 0], `return items.map((item) => ({ json: { ...item.json, preparedOutput: { target: ${JSON.stringify(profile.target)}, mode: 'draft_only', sourceEvent: item.json.correlationId, status: item.json.decision.status, exceptionCodes: item.json.exceptions.map((entry) => entry.code), approvalVersion: item.json.humanDecision.approvalVersion }, adapter: { ...item.json.adapter, writesPerformed: 0 } } }));`),
    switchNode(workflow, 'route-human', 'Route Human Decision', [3040, 0], 3, "={{ ({ pending: 0, approved: 1, rejected: 2 })[$json.humanDecision.state] ?? 0 }}"),
    codeNode(workflow, 'owner-queue', 'Queue for Owner Review [MOCK]', [3280, -160], `return items.map((item) => ({ json: { ...item.json, terminalState: 'PENDING_HUMAN_REVIEW', queue: { owner: item.json.humanDecision.owner, synthetic: true }, externalWritePerformed: false } }));`),
    disabledAdapterNode(workflow, profile, [3280, 0]),
    codeNode(workflow, 'rejected', 'Close Rejected Draft', [3280, 160], `return items.map((item) => ({ json: { ...item.json, terminalState: 'REJECTED_BY_HUMAN', preparedOutput: null, externalWritePerformed: false } }));`),
    codeNode(workflow, 'final-audit', 'Append Final Audit Event [MOCK]', [3540, 0], `return items.map((item) => ({ json: { ...item.json, externalWritePerformed: false, adapter: { ...item.json.adapter, writesPerformed: 0 }, audit: [...item.json.audit, { state: item.json.terminalState ?? 'ADAPTER_DRY_RUN', detail: 'zero_external_writes', at: '2026-08-13T12:07:00.000Z' }] } }));`),
    noOpNode(workflow, 'terminal-review', 'Terminal - Inspectable Review Package', [3800, 0]),
  ];

  const connections = {};
  addConnection(connections, 'Manual Test Start', 'Load 6 Synthetic Test Cases');
  addConnection(connections, 'Load 6 Synthetic Test Cases', 'Normalize Intake Envelope');
  addConnection(connections, 'Normalize Intake Envelope', 'Validate Required Contract');
  addConnection(connections, 'Validate Required Contract', 'Route Contract Status');
  addConnection(connections, 'Route Contract Status', 'Claim Idempotency Key [MOCK]', 0);
  addConnection(connections, 'Route Contract Status', 'Classify Validation Error', 1);
  addConnection(connections, 'Classify Validation Error', 'Redact Invalid Payload');
  addConnection(connections, 'Redact Invalid Payload', 'Audit Validation Failure');
  addConnection(connections, 'Audit Validation Failure', 'Terminal - Manual Data Repair');
  addConnection(connections, 'Claim Idempotency Key [MOCK]', 'Route Replay Status');
  addConnection(connections, 'Route Replay Status', `Load ${profile.context} [MOCK]`, 0);
  addConnection(connections, 'Route Replay Status', 'Load Previous Outcome [MOCK]', 1);
  addConnection(connections, 'Load Previous Outcome [MOCK]', 'Audit Duplicate Delivery');
  addConnection(connections, 'Audit Duplicate Delivery', 'Terminal - Replay Safe');
  addConnection(connections, `Load ${profile.context} [MOCK]`, 'Route Dependency Health');
  addConnection(connections, 'Route Dependency Health', profile.stages[0], 0);
  addConnection(connections, 'Route Dependency Health', 'Classify Transient Dependency Failure', 1);
  addConnection(connections, 'Classify Transient Dependency Failure', 'Route Retry Budget');
  addConnection(connections, 'Route Retry Budget', 'Plan Backoff + Jitter', 0);
  addConnection(connections, 'Route Retry Budget', 'Build Redacted Technical Incident', 1);
  addConnection(connections, 'Plan Backoff + Jitter', 'Persist Retry Envelope [MOCK]');
  addConnection(connections, 'Persist Retry Envelope [MOCK]', 'Terminal - Bounded Retry Queue');
  addConnection(connections, 'Build Redacted Technical Incident', 'Terminal - Operator Action');
  profile.stages.forEach((stage, index) => addConnection(connections, stage, profile.stages[index + 1] ?? 'Evaluate Deterministic Guardrails'));
  addConnection(connections, 'Evaluate Deterministic Guardrails', 'Route Business Outcome');
  addConnection(connections, 'Route Business Outcome', 'Prepare Review-Ready Candidate', 0);
  addConnection(connections, 'Route Business Outcome', 'Explain Review Exceptions', 1);
  addConnection(connections, 'Route Business Outcome', 'Quarantine Critical Case', 2);
  addConnection(connections, 'Prepare Review-Ready Candidate', 'Human Decision Required');
  addConnection(connections, 'Explain Review Exceptions', 'Human Decision Required');
  addConnection(connections, 'Quarantine Critical Case', 'Human Decision Required');
  addConnection(connections, 'Human Decision Required', `Build ${profile.target} Draft`);
  addConnection(connections, `Build ${profile.target} Draft`, 'Route Human Decision');
  addConnection(connections, 'Route Human Decision', 'Queue for Owner Review [MOCK]', 0);
  addConnection(connections, 'Route Human Decision', `[DISABLED] ${profile.target} Test Adapter`, 1);
  addConnection(connections, 'Route Human Decision', 'Close Rejected Draft', 2);
  addConnection(connections, 'Queue for Owner Review [MOCK]', 'Append Final Audit Event [MOCK]');
  addConnection(connections, `[DISABLED] ${profile.target} Test Adapter`, 'Append Final Audit Event [MOCK]');
  addConnection(connections, 'Close Rejected Draft', 'Append Final Audit Event [MOCK]');
  addConnection(connections, 'Append Final Audit Event [MOCK]', 'Terminal - Inspectable Review Package');

  return {
    name: `LAB ${workflow.number} - ${workflow.englishTitle} - Inspectable`,
    nodes,
    pinData: {},
    connections,
    active: false,
    settings: { executionOrder: 'v1', saveManualExecutions: true, saveExecutionProgress: true, executionTimeout: 300 },
    versionId: uuidFrom(`${workflow.id}-inspectable-v2`),
    meta: { templateCredsSetupCompleted: false, syntheticOnly: true, portfolioProof: 'inspectable-v2' },
    tags: [],
  };
}

export function getN8nProfile(workflowId) {
  return profiles[workflowId];
}

export function getSyntheticN8nCases(workflow) {
  return syntheticCases(workflow);
}
