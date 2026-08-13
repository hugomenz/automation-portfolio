import { mkdir, writeFile } from 'node:fs/promises';
import { totalScore, workflows } from '../src/data/catalog.js';

const sanitizeName = (value) => value.replace(/[<>&]/g, '');

function uuidFrom(text) {
  let hex = '';
  for (let index = 0; hex.length < 32; index += 1) hex += [...`${text}:${index}`].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261).toString(16).padStart(8, '0');
  hex = hex.slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function readme(workflow) {
  return `# ${workflow.englishTitle}\n\n**Status:** ${workflow.status} · ${workflow.evidenceType} · ${workflow.customerValidation}\n\n## Problem\n\n${workflow.problem}\n\n## Buyer\n\n${workflow.buyer}\n\n## Concrete improvement\n\n${workflow.improvement}\n\n## Explainable flow\n\n1. **Problem:** ${workflow.problem}\n2. **Input:** ${workflow.sourceSystem}.\n3. **Processing:** deterministic extraction, completeness and rule checks with source references.\n4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.\n5. **Human decision:** a responsible person approves or rejects the prepared draft.\n6. **Result:** a structured payload is prepared for review; no external write is performed.\n\n## System boundary\n\n- System of record: ${workflow.systemOfRecord}.\n- External adapters: Mocked adapter.\n- The workflow never invents missing critical facts.\n- Fixtures are synthetic and use reserved/non-deliverable contact data where applicable.\n- This is not customer validation and contains no measured ROI.\n\n## Fixtures\n\n- \`fixtures/happy.json\` — complete or bounded input.\n- \`fixtures/edge.json\` — recoverable deviation requiring review.\n- \`fixtures/error.json\` — stop condition.\n\n## Reproduce\n\nFrom the repository root run \`npm run check\`. Open \`/lab/${workflow.slug}/\` from the built site and run all three cases. The matching sanitized n8n export is \`n8n/workflows/${workflow.slug}.workflow.json\`; it is disabled and executes all three synthetic cases from a Manual Trigger.\n\n## Market hypothesis\n\n${workflow.marketSignal}\n\n**Opportunity score:** ${totalScore(workflow)} / 50. ${workflow.assessment}\n`;
}

function n8nExport(workflow) {
  const nodes = [
    { parameters: {}, id: uuidFrom(`${workflow.id}-trigger`), name: 'Manual Trigger', type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, position: [0, 0] },
    { parameters: { jsCode: `const fixtures = ${JSON.stringify(workflow.scenarios.map(({ id, label, kind, input }) => ({ id, label, kind, input })))};\nreturn fixtures.map((fixture) => ({ json: { workflow: '${workflow.id}', ...fixture } }));` }, id: uuidFrom(`${workflow.id}-fixtures`), name: 'Synthetic Fixtures', type: 'n8n-nodes-base.code', typeVersion: 2, position: [260, 0] },
    { parameters: { jsCode: `return items.map((item) => {\n  const fixture = item.json;\n  const state = fixture.kind === 'happy' ? 'READY_FOR_REVIEW' : fixture.kind === 'edge' ? 'REVIEW_REQUIRED' : 'STOPPED_FOR_REVIEW';\n  return { json: {\n    workflow: fixture.workflow,\n    scenario: fixture.id,\n    evidenceType: 'Synthetic Demo',\n    status: state,\n    humanRequired: true,\n    correlationId: fixture.input.eventId,\n    idempotencyKey: fixture.input.eventId,\n    exceptions: fixture.kind === 'happy' ? [] : [{ code: fixture.kind === 'edge' ? 'REVIEW_RULE' : 'STOP_RULE', message: fixture.label }],\n    audit: ['INPUT_RECEIVED', 'NORMALIZED', 'RULES_CHECKED', state],\n    sourceInput: fixture.input\n  } };\n});` }, id: uuidFrom(`${workflow.id}-evaluate`), name: 'Normalize & Evaluate', type: 'n8n-nodes-base.code', typeVersion: 2, position: [520, 0] },
    { parameters: { jsCode: `return items.map((item) => ({ json: {\n  ...item.json,\n  implementationStatus: '${workflow.status}',\n  adapterStatus: '${workflow.adapterStatus}',\n  humanDecision: 'pending',\n  targetSystem: '${workflow.systemOfRecord.replaceAll("'", '')}',\n  preparedOutput: { target: '${workflow.code}_DRAFT', sourceEvent: item.json.correlationId },\n  externalWritePerformed: false,\n  terminalMessage: 'Prepared for human review; no external write.'\n} }));` }, id: uuidFrom(`${workflow.id}-human`), name: 'Human Review Boundary', type: 'n8n-nodes-base.code', typeVersion: 2, position: [780, 0] },
  ];
  return { name: `LAB ${workflow.number} - ${workflow.englishTitle}`, nodes, pinData: {}, connections: { 'Manual Trigger': { main: [[{ node: 'Synthetic Fixtures', type: 'main', index: 0 }]] }, 'Synthetic Fixtures': { main: [[{ node: 'Normalize & Evaluate', type: 'main', index: 0 }]] }, 'Normalize & Evaluate': { main: [[{ node: 'Human Review Boundary', type: 'main', index: 0 }]] } }, active: false, settings: { executionOrder: 'v1', saveManualExecutions: true }, versionId: uuidFrom(`${workflow.id}-version`), meta: { templateCredsSetupCompleted: false, syntheticOnly: true }, tags: [] };
}

function diagram(workflow) {
  const labels = ['Eingang', 'Struktur', 'Regeln', 'Ausnahme', 'Mensch', 'Entwurf'];
  const boxes = labels.map((label, index) => {
    const x = 45 + index * 205;
    const fill = index === 4 ? '#b9f34c' : index === 3 ? '#ff6a3d' : '#131b19';
    const text = index === 4 || index === 3 ? '#0b1110' : '#fffef8';
    return `${index ? `<path d="M${x - 55} 190 H${x - 12}" stroke="#6f7a76" stroke-width="2"/><path d="M${x - 20} 182 L${x - 12} 190 L${x - 20} 198" fill="none" stroke="#6f7a76" stroke-width="2"/>` : ''}<rect x="${x}" y="140" width="150" height="100" fill="${fill}" stroke="#59645f"/><text x="${x + 18}" y="171" fill="${text}" font-family="monospace" font-size="11">0${index + 1}</text><text x="${x + 18}" y="209" fill="${text}" font-family="Arial,sans-serif" font-size="16" font-weight="700">${label}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="360" viewBox="0 0 1280 360" role="img" aria-labelledby="title desc"><title id="title">${sanitizeName(workflow.title)} Workflow</title><desc id="desc">Eingang, Struktur, Regeln, Ausnahme, menschliche Entscheidung und vorbereiteter Entwurf.</desc><rect width="1280" height="360" fill="#0b1110"/><path d="M0 46 H1280 M0 314 H1280" stroke="#28332f"/><text x="45" y="70" fill="#b9f34c" font-family="monospace" font-size="12">LAB ${workflow.number} / ${sanitizeName(workflow.code)}</text><text x="45" y="110" fill="#fffef8" font-family="Arial,sans-serif" font-size="30" font-weight="700">${sanitizeName(workflow.title)}</text>${boxes}<text x="45" y="302" fill="#93a09a" font-family="monospace" font-size="11">SYNTHETIC DEMO · ${workflow.status.toUpperCase()} · 0 EXTERNAL WRITES</text></svg>`;
}

await mkdir('n8n/workflows', { recursive: true });
await mkdir('docs/diagrams', { recursive: true });
for (const workflow of workflows) {
  const directory = `workflows/${workflow.slug}`;
  await mkdir(`${directory}/fixtures`, { recursive: true });
  await writeFile(`${directory}/README.md`, readme(workflow));
  for (const scenario of workflow.scenarios) await writeFile(`${directory}/fixtures/${scenario.kind}.json`, `${JSON.stringify({ workflow: workflow.id, scenario: scenario.id, evidenceType: 'Synthetic Demo', input: scenario.input }, null, 2)}\n`);
  await writeFile(`n8n/workflows/${workflow.slug}.workflow.json`, `${JSON.stringify(n8nExport(workflow), null, 2)}\n`);
  await writeFile(`docs/diagrams/${workflow.slug}.svg`, diagram(workflow));
}
console.log(`Generated READMEs, 30 fixtures, ${workflows.length} n8n exports and ${workflows.length} diagrams`);
