import { stages, workflowBySlug } from './data/catalog.js';
import { applyHumanDecision, runWorkflow, simulateUnavailableDependency } from './lib/engine.js';

const slug = document.body.dataset.workflow || window.location.pathname.split('/').filter(Boolean).at(-1);
const workflow = workflowBySlug[slug];
const seen = new Set();
let selectedScenario = workflow?.scenarios[0];
let currentRun = null;

function escapeHtml(value) {
  return String(value ?? '—').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function stateClass(state) {
  return `state-chip state-${state.tone}`;
}

function summarizeInput(input) {
  const hidden = new Set(['eventId', 'evidence', 'items', 'requirements', 'findings', 'documents', 'candidates', 'purchaseOrder', 'goodsReceipt', 'supplierMaster']);
  const items = Object.entries(input).filter(([key, value]) => !hidden.has(key) && value != null && typeof value !== 'object').slice(0, 6);
  return items.map(([key, value]) => `<div><span>${escapeHtml(key.replace(/([A-Z])/g, ' $1'))}</span><strong>${escapeHtml(Array.isArray(value) ? value.join(', ') : value)}</strong></div>`).join('');
}

function renderStatic() {
  if (!workflow) {
    document.querySelector('#main').innerHTML = '<section class="shell missing-page"><h1>Workflow nicht gefunden</h1><a class="button button-primary" href="../../">Zur Übersicht</a></section>';
    return;
  }
  document.title = `${workflow.title} — Industrial Automation Lab`;
  document.querySelector('meta[name="description"]').content = workflow.improvement;
  document.querySelector('#workflow-number').textContent = workflow.number;
  document.querySelector('#workflow-eyebrow').textContent = workflow.eyebrow;
  document.querySelector('#workflow-title').textContent = workflow.title;
  document.querySelector('#workflow-problem').textContent = workflow.problem;
  document.querySelector('#workflow-improvement').textContent = workflow.improvement;
  document.querySelector('#workflow-buyer').textContent = workflow.buyer;
  document.querySelector('#workflow-sor').textContent = workflow.systemOfRecord;
  document.querySelector('#workflow-assessment').textContent = workflow.assessment;
  document.querySelector('#workflow-badges').innerHTML = `<span>${workflow.evidenceType}</span><span>${workflow.status}</span><span>${workflow.adapterStatus}</span><span>${workflow.customerValidation}</span>`;
  document.querySelector('#process-rail').innerHTML = stages.map((stage, index) => `<div><span>0${index + 1}</span><strong>${stage}</strong></div>`).join('');
  document.querySelector('#scenario-tabs').innerHTML = workflow.scenarios.map((scenario, index) => `<button type="button" role="tab" aria-selected="${index === 0}" data-scenario="${scenario.id}"><span>${scenario.kind === 'happy' ? 'Happy Path' : scenario.kind === 'edge' ? 'Abweichung' : 'Stop Condition'}</span><strong>${scenario.label}</strong></button>`).join('');
  document.querySelectorAll('[data-scenario]').forEach((button) => button.addEventListener('click', () => selectScenario(button.dataset.scenario)));
  document.querySelector('#run-button').addEventListener('click', () => execute(false));
  document.querySelector('#duplicate-button').addEventListener('click', () => execute(true));
  document.querySelector('#failure-button').addEventListener('click', executeFailure);
  selectScenario(workflow.scenarios[0].id);
}

function selectScenario(id) {
  selectedScenario = workflow.scenarios.find((scenario) => scenario.id === id);
  document.querySelectorAll('[data-scenario]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.scenario === id)));
  document.querySelector('#scenario-description').textContent = selectedScenario.description;
  document.querySelector('#input-summary').innerHTML = summarizeInput(selectedScenario.input);
  document.querySelector('#input-json').textContent = JSON.stringify(selectedScenario.input, null, 2);
  document.querySelector('#result-state').className = 'state-chip';
  document.querySelector('#result-state').textContent = 'Bereit';
  document.querySelector('#run-meta').innerHTML = '';
  document.querySelector('#result-content').innerHTML = '<p class="empty-state">Workflow starten, um Prüfungen, Ausnahmen und Auditverlauf zu sehen.</p>';
  currentRun = null;
}

function execute(asDuplicate) {
  if (!asDuplicate) seen.delete(`${workflow.id}:${selectedScenario.input.eventId}`);
  currentRun = runWorkflow(workflow.id, selectedScenario.input, { seen });
  renderRun(currentRun);
}

function executeFailure() {
  currentRun = simulateUnavailableDependency(workflow.id, selectedScenario.input);
  renderRun(currentRun);
}

function renderRun(run) {
  const state = document.querySelector('#result-state');
  state.textContent = run.state.label;
  state.className = stateClass(run.state);
  document.querySelector('#run-meta').innerHTML = `<span><b>RUN</b>${escapeHtml(run.runId)}</span><span><b>IDEMPOTENZ</b>${escapeHtml(run.idempotencyKey)}</span><span><b>CONFIDENCE</b>${Math.round((run.result.confidence || 0) * 100)} %</span><span><b>WRITES</b>${run.adapter.writesPerformed}</span>`;

  const extracted = Object.entries(run.result.extracted || {}).map(([key, value]) => `<div><dt>${escapeHtml(key.replace(/([A-Z])/g, ' $1'))}</dt><dd>${escapeHtml(Array.isArray(value) ? value.join(', ') : value)}</dd></div>`).join('');
  const checks = (run.result.checks || []).map((check) => `<li class="${check.ok ? 'check-ok' : 'check-warn'}"><i>${check.ok ? '✓' : '!'}</i><span><strong>${escapeHtml(check.label)}</strong><small>${escapeHtml(check.value)}</small></span></li>`).join('');
  const exceptions = (run.result.exceptions || []).map((exception) => `<li><span class="severity severity-${escapeHtml(exception.severity)}">${escapeHtml(exception.severity)}</span><div><strong>${escapeHtml(exception.label)}</strong><small>${escapeHtml(exception.source || exception.code)}</small></div></li>`).join('');
  const missing = (run.result.missing || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const audit = (run.audit || []).map((event) => `<li class="audit-${event.tone}"><span>${String(event.step).padStart(2, '0')}</span><div><strong>${escapeHtml(event.label)}</strong><small>${escapeHtml(event.detail)}</small></div></li>`).join('');
  const canDecide = run.humanRequired && run.decision === 'pending';

  document.querySelector('#result-content').innerHTML = `
    ${extracted ? `<section class="result-block"><h4>Extrahiert</h4><dl class="extracted-grid">${extracted}</dl></section>` : ''}
    ${checks ? `<section class="result-block"><h4>Regelprüfungen</h4><ul class="check-list">${checks}</ul></section>` : ''}
    ${(exceptions || missing) ? `<section class="result-block exception-block"><h4>Ausnahmen & fehlende Angaben</h4>${exceptions ? `<ul class="exception-list">${exceptions}</ul>` : ''}${missing ? `<ul class="missing-list">${missing}</ul>` : ''}</section>` : '<section class="result-block clean-block"><h4>Keine Regelabweichung</h4><p>Der Entwurf ist vollständig genug für die menschliche Freigabe.</p></section>'}
    <section class="result-block"><h4>Auditverlauf</h4><ol class="audit-list">${audit}</ol></section>
    ${run.result.preparedPayload ? `<details class="json-details payload"><summary>Vorbereiteten Payload ansehen</summary><pre>${escapeHtml(JSON.stringify(run.result.preparedPayload, null, 2))}</pre></details>` : ''}
    ${canDecide ? `<section class="decision-box"><div><span>03 / MENSCHLICHE ENTSCHEIDUNG</span><h4>Entwurf freigeben oder ablehnen</h4><p>Freigabe markiert nur den Demo-Entwurf. Es wird nichts an ein externes System gesendet.</p></div><label>Prüfnotiz<input id="decision-note" type="text" placeholder="z. B. Preis mit Einkauf geklärt" /></label><div><button type="button" class="button button-primary" data-decision="approve">Entwurf freigeben</button><button type="button" class="button button-danger" data-decision="reject">Ablehnen</button></div></section>` : ''}
  `;
  document.querySelectorAll('[data-decision]').forEach((button) => button.addEventListener('click', () => decide(button.dataset.decision)));
}

function decide(decision) {
  const note = document.querySelector('#decision-note')?.value || '';
  currentRun = applyHumanDecision(currentRun, decision, note);
  renderRun(currentRun);
}

renderStatic();
