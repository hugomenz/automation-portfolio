import { mkdir, writeFile } from 'node:fs/promises';
import { totalScore, workflows } from '../src/data/catalog.js';
import { buildN8nExport, getN8nProfile, getSyntheticN8nCases } from './n8n-workflow-builder.mjs';

const sanitizeName = (value) => value.replace(/[<>&]/g, '');

function uuidFrom(text) {
  let hex = '';
  for (let index = 0; hex.length < 32; index += 1) hex += [...`${text}:${index}`].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261).toString(16).padStart(8, '0');
  hex = hex.slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function readme(workflow) {
  const integrationBoundary = workflow.polished
    ? `- Groq and Supabase are connected only in an unpublished test account; credentials are never exported.\n- The final ERP, ticket or finance-system adapter remains disabled.`
    : '- Context and target-system adapters remain mocked.';
  const reproduction = workflow.polished
    ? 'After import, connect separate Groq and Supabase test credentials and execute only the Manual Trigger.'
    : 'It executes six synthetic reliability routes from the Manual Trigger without a credential.';
  return `# ${workflow.englishTitle}\n\n**Status:** ${workflow.status} · ${workflow.evidenceType} · ${workflow.customerValidation}\n\n## Problem\n\n${workflow.problem}\n\n## Buyer\n\n${workflow.buyer}\n\n## Concrete improvement\n\n${workflow.improvement}\n\n## Explainable flow\n\n1. **Problem:** ${workflow.problem}\n2. **Input:** ${workflow.sourceSystem}.\n3. **Processing:** evidence extraction, completeness and deterministic rule checks with source references.\n4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.\n5. **Human decision:** a responsible person approves or rejects the prepared draft.\n6. **Result:** a structured payload is prepared for review; no production write is performed.\n\n## System boundary\n\n- System of record: ${workflow.systemOfRecord}.\n- Integration status: ${workflow.adapterStatus}.\n${integrationBoundary}\n- The workflow never invents missing critical facts.\n- Fixtures are synthetic and use reserved/non-deliverable contact data where applicable.\n- This is not customer validation and contains no measured ROI.\n\n## Fixtures\n\n- \`fixtures/happy.json\` — complete or bounded input.\n- \`fixtures/edge.json\` — recoverable deviation requiring review.\n- \`fixtures/error.json\` — stop condition.\n\n## Reproduce\n\nFrom the repository root run \`npm run check\`. Open \`/lab/${workflow.slug}/\` from the built site and run all three cases. The matching n8n export is \`n8n/workflows/${workflow.slug}.workflow.json\`; it is disabled and contains no credential reference. ${reproduction}\n\n## Market hypothesis\n\n${workflow.marketSignal}\n\n**Opportunity score:** ${totalScore(workflow)} / 50. ${workflow.assessment}\n`;
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
  const extraCases = getSyntheticN8nCases(workflow).filter((scenario) => !['happy', 'edge', 'error'].includes(scenario.kind));
  for (const scenario of extraCases) await writeFile(`${directory}/fixtures/${scenario.kind}.json`, `${JSON.stringify({ workflow: workflow.id, scenario: scenario.id, evidenceType: 'Synthetic Demo', input: scenario.input }, null, 2)}\n`);
  const profile = getN8nProfile(workflow.id);
  const testRoutes = workflow.polished
    ? `## Test-account integrations\n\n- Groq multimodal reader: document/image evidence extraction.\n- Two Groq agents: evidence analysis and independent challenger.\n- Supabase tools: read-only synthetic master data.\n- Supabase writes: synthetic case, agent-run, event and pending approval audit rows.\n- Credentials are selected only inside the unpublished n8n test project and are absent from this export.\n\n## Visible recovery paths\n\n- Invalid intake quarantine.\n- Vision and agent no-claim fallback.\n- Atomic case creation as the idempotency boundary.\n- Classified Supabase failure with a maximum of three retry attempts.\n- Operator incident after retry exhaustion.\n- Mandatory human gate before the disabled ${profile.target} adapter.\n`
    : `## Six executable test routes\n\n1. Happy path → review-ready candidate.\n2. Recoverable domain deviation → explained review exception.\n3. Critical ambiguity/sensitive condition → quarantined stop.\n4. Duplicate delivery → previous outcome, no second processing.\n5. Transient dependency failure → bounded retry envelope.\n6. Invalid contract → redacted manual data-repair queue.\n`;
  await writeFile(`${directory}/N8N_RUNBOOK.md`, `# n8n runbook — ${workflow.englishTitle}\n\n## Canvas contract\n\n- Intake: ${profile.intake}.\n- Integration status: ${workflow.adapterStatus}.\n- Human owner: ${profile.owner}.\n- Prepared target: ${profile.target}; external adapter remains disabled.\n\n${testRoutes}\n## Reliability evidence\n\nThe canvas separates contract validation, idempotency, dependency health, domain processing, deterministic guardrails, human decision and adapter boundary. Every terminal output includes correlation, audit state and zero production writes. Run the workflow manually while unpublished.${workflow.polished ? ' Groq and Supabase test-account credentials are required only for the cloud proof.' : ' No credential is required.'}\n`);
  await writeFile(`n8n/workflows/${workflow.slug}.workflow.json`, `${JSON.stringify(buildN8nExport(workflow), null, 2)}\n`);
  await writeFile(`docs/diagrams/${workflow.slug}.svg`, diagram(workflow));
}
console.log(`Generated READMEs, 60 fixtures, ${workflows.length} detailed n8n exports and ${workflows.length} diagrams`);
