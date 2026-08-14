import { workflowBySlug } from './data/catalog.js';
import { applyHumanDecision, runWorkflow, simulateUnavailableDependency } from './lib/engine.js';

const slug = document.body.dataset.workflow || window.location.pathname.split('/').filter(Boolean).at(-1);
const workflow = workflowBySlug[slug];
const seen = new Set();
let selectedScenario;
let currentRun = null;

const labels = {
  customer: 'Kunde', customerNumber: 'Kundennummer', orderNumber: 'Bestellnummer', deliveryDate: 'Wunschtermin', shipTo: 'Lieferadresse', terms: 'Zahlungsziel', positions: 'Positionen',
  machineNumber: 'Maschine', family: 'Baureihe', site: 'Standort', productionStopped: 'Produktion', errorCodes: 'Sichtbarer Code', attachments: 'Anhänge',
  invoiceNumber: 'Rechnung', supplier: 'Lieferant', supplierId: 'Lieferanten-ID', purchaseOrder: 'Bestellung', net: 'Netto', tax: 'MwSt.', gross: 'Gesamt',
  request: 'Anfrage', requirements: 'Anforderungen', documents: 'Dokumente', findings: 'Befunde', company: 'Unternehmen', contact: 'Kontakt',
};

function escapeHtml(value) {
  return String(value ?? '—').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function displayValue(value) {
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number' && !Number.isInteger(value)) return value.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  return value;
}

function assetPath(name) {
  return `../../assets/evidence/${name}`;
}

function renderStatic() {
  if (!workflow) {
    document.querySelector('#main').innerHTML = '<section class="shell missing-page"><h1>Workflow nicht gefunden</h1><a class="button primary" href="../../">Zur Übersicht</a></section>';
    return;
  }
  document.title = `${workflow.title} — Industrial Automation Lab`;
  document.querySelector('meta[name="description"]').content = workflow.improvement;
  document.querySelector('#workflow-eyebrow').lastChild.textContent = ` ${workflow.eyebrow}`;
  document.querySelector('#workflow-title').textContent = workflow.controlTower?.name || workflow.title;
  document.querySelector('#workflow-problem').textContent = workflow.controlTower?.proposition || workflow.problem;
  document.querySelector('#workflow-improvement').textContent = workflow.improvement;
  document.querySelector('#workflow-buyer').textContent = workflow.buyer;
  document.querySelector('#workflow-sor').textContent = workflow.systemOfRecord;
  document.querySelector('#workflow-assessment').textContent = workflow.assessment;
  document.querySelector('#workflow-badges').innerHTML = `<span>${workflow.evidenceType}</span><span>${workflow.status}</span><span>${workflow.adapterStatus}</span>`;
  document.querySelector('#demo-system-name').textContent = workflow.controlTower?.name || workflow.englishTitle;

  configureSourceViewer();
  renderDepartments();
  renderAgents();

  document.querySelector('#scenario-tabs').innerHTML = workflow.scenarios.map((scenario) => `<button type="button" role="tab" aria-selected="false" data-scenario="${scenario.id}"><span>${scenario.kind === 'happy' ? 'Nominal' : scenario.kind === 'edge' ? 'Abweichung' : 'Stop'}</span><strong>${scenario.label}</strong></button>`).join('');
  document.querySelectorAll('[data-scenario]').forEach((button) => button.addEventListener('click', () => selectScenario(button.dataset.scenario)));
  document.querySelector('#run-button').addEventListener('click', () => execute(false));
  document.querySelector('#duplicate-button').addEventListener('click', () => execute(true));
  document.querySelector('#failure-button').addEventListener('click', executeFailure);

  const n8nImage = document.querySelector('#n8n-canvas-image');
  n8nImage.src = `../../evidence/n8n/${workflow.slug}-inspectable-executed.png`;
  n8nImage.alt = `Ausgeführter n8n-Workflow für ${workflow.title} mit sichtbaren Agenten-, Fehler- und Freigaberouten`;
  document.querySelector('#n8n-proof-caption').textContent = `${workflow.controlTower?.name || workflow.title} — ausgeführter Synthetic Demo Workflow`;
  document.querySelector('#canvas-proof-type').textContent = workflow.polished ? 'GROQ + SUPABASE + HUMAN GATE' : 'DETERMINISTIC PROTOTYPE';

  selectScenario(workflow.controlTower?.focusScenario || workflow.scenarios[0].id);
}

function configureSourceViewer() {
  const image = document.querySelector('#source-image');
  const pdf = document.querySelector('#source-pdf');
  if (workflow.controlTower) {
    image.src = assetPath(workflow.controlTower.sourceAsset);
    image.alt = `Synthetischer Originalbeleg für ${workflow.title}`;
    document.querySelector('#source-name').textContent = workflow.controlTower.sourceName;
    document.querySelector('#source-meta').textContent = workflow.controlTower.sourceMeta;
    pdf.href = assetPath(workflow.controlTower.sourcePdf);
  } else {
    image.hidden = true;
    pdf.hidden = true;
    document.querySelector('#source-name').textContent = workflow.sourceSystem;
    document.querySelector('#source-meta').textContent = 'Strukturierte synthetische Fixture';
    document.querySelector('#document-stage').classList.add('generic-source');
    document.querySelector('#document-stage').insertAdjacentHTML('beforeend', `<div class="generic-document"><span>${escapeHtml(workflow.code)} / SYNTHETIC INPUT</span><strong>${escapeHtml(workflow.title)}</strong><p>${escapeHtml(workflow.sourceSystem)}</p><i></i><i></i><i></i><i></i></div>`);
    document.querySelectorAll('.source-pin').forEach((pin) => { pin.hidden = true; });
  }
}

function renderDepartments() {
  const departments = workflow.controlTower?.departments || [
    { name: 'Eingang', detail: workflow.sourceSystem, tone: 'sales' },
    { name: 'Fachprüfung', detail: 'Regeln + Quellen', tone: 'data' },
    { name: 'Ausnahme', detail: 'Stop oder Review', tone: 'planning' },
    { name: 'Verantwortliche Rolle', detail: workflow.buyer.split('/')[0], tone: 'human' },
  ];
  document.querySelector('#department-flow').innerHTML = departments.map((department, index) => `${index ? '<i aria-hidden="true">→</i>' : ''}<div class="department-node ${department.tone}"><span>0${index + 1}</span><strong>${escapeHtml(department.name)}</strong><small>${escapeHtml(department.detail)}</small></div>`).join('');
}

function renderAgents() {
  const agents = workflow.controlTower?.agents || ['Input normalisieren', 'Deterministische Regeln', 'Human gate'];
  document.querySelector('#agent-flow').innerHTML = agents.map((agent, index) => `<div><span>${String(index + 1).padStart(2, '0')}</span><i class="agent-pulse"></i><strong>${escapeHtml(agent)}</strong><small>${workflow.polished ? (index === 0 ? 'multimodal evidence' : index === agents.length - 1 ? 'independent challenge' : 'master-data tools') : 'bounded prototype step'}</small></div>`).join('');
  if (!workflow.polished) document.querySelector('.integration-health').innerHTML = '<span><i class="ok"></i> Local rules</span><span><i></i> Mocked adapter</span><span><i></i> Zieladapter deaktiviert</span>';
}

function selectScenario(id) {
  selectedScenario = workflow.scenarios.find((scenario) => scenario.id === id);
  document.querySelectorAll('[data-scenario]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.scenario === id)));
  document.querySelector('#demo-title').textContent = selectedScenario.label;
  document.querySelector('#result-state').className = 'state-chip';
  document.querySelector('#result-state').textContent = 'Bereit';
  document.querySelector('#result-content').innerHTML = `<div class="ready-panel"><span class="ready-icon">↗</span><strong>${escapeHtml(selectedScenario.description)}</strong><p>Fall analysieren, um Evidenz, Abweichung und menschliche Entscheidung zu sehen.</p></div>`;
  currentRun = null;
}

async function execute(asDuplicate) {
  const button = document.querySelector('#run-button');
  button.disabled = true;
  const state = document.querySelector('#result-state');
  state.className = 'state-chip processing';
  state.textContent = asDuplicate ? 'Replay wird geprüft' : 'Agenten prüfen';
  document.querySelector('#result-content').innerHTML = `<div class="processing-panel"><i></i><strong>${workflow.polished ? 'Dokument lesen · Stammdaten prüfen · Challenger ausführen' : 'Eingang prüfen · Regeln anwenden · Ausnahme routen'}</strong><span>Die öffentliche Demo spielt den reproduzierbaren Testlauf lokal ab.</span></div>`;
  await new Promise((resolve) => window.setTimeout(resolve, 420));
  if (!asDuplicate) seen.delete(`${workflow.id}:${selectedScenario.input.eventId}`);
  currentRun = runWorkflow(workflow.id, selectedScenario.input, { seen });
  renderRun(currentRun);
  button.disabled = false;
}

function executeFailure() {
  currentRun = simulateUnavailableDependency(workflow.id, selectedScenario.input);
  renderRun(currentRun);
}

function renderRun(run) {
  const state = document.querySelector('#result-state');
  state.textContent = run.state.label;
  state.className = `state-chip ${run.state.tone}`;
  const extracted = Object.entries(run.result.extracted || {}).slice(0, 7).map(([key, value]) => `<div><span>${escapeHtml(labels[key] || key.replace(/([A-Z])/g, ' $1'))}</span><strong>${escapeHtml(displayValue(value))}</strong><small>Quelle gebunden</small></div>`).join('');
  const checks = (run.result.checks || []).map((check) => `<li class="${check.ok ? 'ok' : 'warn'}"><i>${check.ok ? '✓' : '!'}</i><div><strong>${escapeHtml(check.label)}</strong><span>${escapeHtml(check.value)}</span></div></li>`).join('');
  const exceptions = (run.result.exceptions || []).map((exception) => `<article class="exception-card ${escapeHtml(exception.severity)}"><span>${escapeHtml(exception.code)}</span><strong>${escapeHtml(exception.label)}</strong><small>${escapeHtml(exception.source || 'Deterministische Regel')}</small></article>`).join('');
  const canDecide = run.humanRequired && run.decision === 'pending';
  const isClean = !exceptions && !run.result.missing?.length;
  document.querySelector('#result-content').innerHTML = `
    <div class="run-meta"><span><b>CONFIDENCE</b>${Math.round((run.result.confidence || 0) * 100)} %</span><span><b>CASE</b>${escapeHtml(selectedScenario.input.eventId)}</span><span><b>WRITES</b>${run.adapter.writesPerformed}</span></div>
    ${extracted ? `<section class="analysis-block"><div class="block-title"><span>Extrahiert</span><b>${Object.keys(run.result.extracted || {}).length} Felder</b></div><div class="extraction-grid">${extracted}</div></section>` : ''}
    ${checks ? `<section class="analysis-block"><div class="block-title"><span>Kontrollen</span><b>Regelbasiert</b></div><ul class="compact-checks">${checks}</ul></section>` : ''}
    <section class="analysis-block exception-zone"><div class="block-title"><span>${isClean ? 'Ergebnis' : 'Ausnahme'}</span><b>${isClean ? 'Kein Hard-Stop' : 'Mensch erforderlich'}</b></div>${isClean ? '<div class="clean-result"><i>✓</i><p>Kein kritischer Regelverstoß. Der Entwurf wartet trotzdem auf die verantwortliche Person.</p></div>' : `<div class="exception-stack">${exceptions}</div>`}</section>
    ${canDecide ? `<section class="human-decision"><div><span>HUMAN GATE</span><strong>${run.state.tone === 'stop' ? 'Vorgang bleibt gestoppt' : 'Entwurf prüfen'}</strong><p>Freigabe verändert nur diesen synthetischen Lauf. Kein ERP-, Ticket- oder Zahlungs-Write.</p></div><input id="decision-note" type="text" aria-label="Prüfnotiz" placeholder="Prüfnotiz hinzufügen …" /><div><button type="button" class="button primary" data-decision="approve">Freigeben</button><button type="button" class="button danger" data-decision="reject">Ablehnen</button></div></section>` : ''}
  `;
  document.querySelectorAll('[data-decision]').forEach((button) => button.addEventListener('click', () => decide(button.dataset.decision)));
}

function decide(decision) {
  const note = document.querySelector('#decision-note')?.value || '';
  currentRun = applyHumanDecision(currentRun, decision, note);
  renderRun(currentRun);
}

renderStatic();
