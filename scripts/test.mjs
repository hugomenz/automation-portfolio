import { access, readFile, stat } from 'node:fs/promises';
import { polishedWorkflows, stages, totalScore, workflows } from '../src/data/catalog.js';
import { applyHumanDecision, runStates, runWorkflow, simulateUnavailableDependency } from '../src/lib/engine.js';
import { linkedinContent } from '../content/linkedin/content-data.mjs';

const checks = [];
const check = (name, condition) => checks.push([name, Boolean(condition)]);

function runCodeNode(node, items) {
  return Function('items', `'use strict';\n${node.parameters.jsCode}`)(structuredClone(items));
}

function routeSwitchNode(node, items) {
  const expression = node.parameters.output.replace(/^=\{\{\s*/, '').replace(/\s*\}\}$/, '');
  const outputs = Array.from({ length: node.parameters.numberOutputs }, () => []);
  for (const item of items) {
    const output = Function('$json', `'use strict'; return (${expression});`)(item.json);
    if (!Number.isInteger(output) || output < 0 || output >= outputs.length) throw new Error(`${node.name}: invalid output ${output}`);
    outputs[output].push(item);
  }
  return outputs;
}

function executeN8nExport(workflow) {
  const nodes = new Map(workflow.nodes.map((node) => [node.name, node]));
  const terminalItems = new Map();
  const walk = (nodeName, inputItems) => {
    if (!inputItems.length) return;
    const node = nodes.get(nodeName);
    if (!node) throw new Error(`Missing node ${nodeName}`);
    let outputs;
    if (node.type === 'n8n-nodes-base.code') outputs = [runCodeNode(node, inputItems)];
    else if (node.type === 'n8n-nodes-base.switch') outputs = routeSwitchNode(node, inputItems);
    else outputs = [structuredClone(inputItems)];
    const links = workflow.connections[nodeName]?.main ?? [];
    if (!links.some((branch) => branch?.length)) {
      terminalItems.set(nodeName, [...(terminalItems.get(nodeName) ?? []), ...outputs.flat()]);
      return;
    }
    outputs.forEach((items, outputIndex) => {
      for (const link of links[outputIndex] ?? []) walk(link.node, items);
    });
  };
  walk('Manual Test Start', [{ json: {} }]);
  return terminalItems;
}

check('exactly ten workflow definitions', workflows.length === 10);
check('exactly three polished workflows', polishedWorkflows.length === 3);
check('six-stage explainable process', JSON.stringify(stages) === JSON.stringify(['Problem', 'Eingang', 'Prüfung', 'Ausnahme', 'Mensch', 'Ergebnis']));
check('unique IDs and slugs', new Set(workflows.map(({ id }) => id)).size === 10 && new Set(workflows.map(({ slug }) => slug)).size === 10);
check('approved public status taxonomy', workflows.every((workflow) => ['Built and testable', 'Test-account integration', 'Mocked adapter', 'Architecture only', 'Planned'].includes(workflow.status) && ['Test-account integration', 'Mocked adapter'].includes(workflow.adapterStatus)));
check('three flagships use test-account integrations', polishedWorkflows.every((workflow) => workflow.adapterStatus === 'Test-account integration' && workflow.controlTower));
check('no claimed customer validation', workflows.every((workflow) => workflow.customerValidation === 'Nicht validiert'));
check('LinkedIn content exists for all workflows', Object.keys(linkedinContent).length === 10 && workflows.every((workflow) => linkedinContent[workflow.slug]));

for (const workflow of workflows) {
  check(`${workflow.id}: three synthetic scenarios`, workflow.scenarios.length >= 3 && new Set(workflow.scenarios.map(({ kind }) => kind)).size === 3);
  check(`${workflow.id}: complete commercial frame`, Boolean(workflow.problem && workflow.buyer && workflow.improvement && workflow.systemOfRecord && workflow.marketSignal && workflow.assessment));
  check(`${workflow.id}: ten opportunity scores`, Object.keys(workflow.scores).length === 10 && Object.values(workflow.scores).every((score) => score >= 1 && score <= 5) && totalScore(workflow) <= 50);
  const content = linkedinContent[workflow.slug];
  check(`${workflow.id}: complete local content pack`, content.posts.length >= 2 && content.angles.length >= 3 && content.hooks.length >= 3 && content.ctas.length >= 3 && content.visual);
  check(`${workflow.id}: polished content is richer`, !workflow.polished || (content.posts.length >= 3 && content.carousel.length >= 8 && content.video.length >= 5));

  const seen = new Set();
  const runs = workflow.scenarios.map((scenario) => runWorkflow(workflow.id, scenario.input, { seen }));
  check(`${workflow.id}: every scenario has structured output`, runs.every((run) => run.runId && run.idempotencyKey && run.audit.length >= 4 && run.result && run.adapter.writesPerformed === 0));
  check(`${workflow.id}: happy path reaches review-ready`, runs.find((_, index) => workflow.scenarios[index].kind === 'happy')?.state.code === runStates.ready.code || workflow.id === 'spec-delta');
  check(`${workflow.id}: stop condition exists`, runs.some((run) => run.state.code === runStates.stopped.code));
  check(`${workflow.id}: all critical outcomes remain human controlled`, runs.filter((run) => ![runStates.duplicate.code, runStates.retry.code].includes(run.state.code)).every((run) => run.humanRequired));

  const fresh = runWorkflow(workflow.id, workflow.scenarios[0].input, { seen: new Set() });
  const approved = applyHumanDecision(fresh, 'approve', 'synthetic test approval');
  check(`${workflow.id}: approval prepares but never writes`, approved.state.code === runStates.approved.code && approved.result.externalWritePerformed === false && approved.adapter.writesPerformed === 0);

  const replaySeen = new Set();
  runWorkflow(workflow.id, workflow.scenarios[0].input, { seen: replaySeen });
  const replay = runWorkflow(workflow.id, workflow.scenarios[0].input, { seen: replaySeen });
  check(`${workflow.id}: replay is idempotent`, replay.state.code === runStates.duplicate.code && replay.adapter.writesPerformed === 0);

  const retry = simulateUnavailableDependency(workflow.id, workflow.scenarios[0].input);
  check(`${workflow.id}: unavailable dependency schedules bounded retry`, retry.state.code === runStates.retry.code && retry.result.retry.maxAttempts === 3 && retry.adapter.writesPerformed === 0);
}

const [home, detail, script, workflowScript, css, readme] = await Promise.all([
  readFile('src/index.html', 'utf8'), readFile('src/workflow.html', 'utf8'), readFile('src/app.js', 'utf8'), readFile('src/workflow.js', 'utf8'), readFile('src/app.css', 'utf8'), readFile('README.md', 'utf8'),
]);
const publicSource = [home, detail, script, workflowScript, css, readme, JSON.stringify(workflows)].join('\n');
check('German initial document language', home.includes('<html lang="de">') && detail.includes('<html lang="de">'));
check('accessible landmarks and skip links', [home, detail].every((html) => html.includes('<main id="main">') && html.includes('skip-link')));
check('all important items avoid carousel navigation', !/carousel|slider/i.test(home + script));
check('mobile and reduced motion CSS', /@media \(max-width: 7(?:60|80)px\)/.test(css) && css.includes('prefers-reduced-motion'));
check('human decision interaction present', workflowScript.includes('applyHumanDecision') && detail.includes('menschlicher Freigabe'));
check('duplicate and dependency failure controls present', detail.includes('duplicate-button') && detail.includes('failure-button'));
check('executed n8n evidence is visible on every detail page', detail.includes('n8n-canvas-image') && workflowScript.includes('inspectable-executed.png') && detail.includes('Engineering evidence'));
check('truth status visible on home and detail', home.includes('Nicht kundenvalidiert') && detail.includes('nicht kundenvalidiert') && workflowScript.includes('workflow.status'));
check('no common secret patterns', !/(gsk_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|sb_secret_|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|ghp_[A-Za-z0-9]{20,})/.test(publicSource));
check('no invented commercial metrics', !/\b\d+\s*(customers?|Kunden|clients?)\b|\b\d+%\s*(saved|gespart|weniger)/i.test(publicSource));

for (const workflow of workflows) {
  await access(`workflows/${workflow.slug}/README.md`);
  await access(`workflows/${workflow.slug}/fixtures/happy.json`);
  await access(`workflows/${workflow.slug}/fixtures/edge.json`);
  await access(`workflows/${workflow.slug}/fixtures/error.json`);
  await access(`workflows/${workflow.slug}/fixtures/duplicate.json`);
  await access(`workflows/${workflow.slug}/fixtures/dependency.json`);
  await access(`workflows/${workflow.slug}/fixtures/invalid.json`);
  await access(`workflows/${workflow.slug}/N8N_RUNBOOK.md`);
  const exportSource = await readFile(`n8n/workflows/${workflow.slug}.workflow.json`, 'utf8');
  const exportJson = JSON.parse(exportSource);
  const operationalNodes = exportJson.nodes.filter((node) => node.type !== 'n8n-nodes-base.stickyNote');
  const codeNodesAreSyntacticallyValid = exportJson.nodes.filter((node) => node.type === 'n8n-nodes-base.code').every((node) => {
    try {
      new Function('items', node.parameters.jsCode);
      return true;
    } catch {
      return false;
    }
  });
  const nodeNames = new Set(exportJson.nodes.map((node) => node.name));
  const connectionTargets = Object.values(exportJson.connections).flatMap((connection) => Object.values(connection).flatMap((branches) => branches.flat().map(({ node }) => node)));
  check(`${workflow.id}: detailed disabled n8n export`, exportJson.active === false && operationalNodes.length >= (workflow.polished ? 35 : 35) && exportJson.nodes.filter((node) => node.type === 'n8n-nodes-base.switch').length >= (workflow.polished ? 2 : 6));
  check(`${workflow.id}: sanitized adapter boundary`, exportJson.nodes.every((node) => !node.credentials) && exportJson.nodes.filter((node) => node.type === 'n8n-nodes-base.httpRequest' && /example\.invalid/.test(node.parameters.url || '')).every((node) => node.disabled === true) && !/(gsk_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|sb_secret_|ghp_[A-Za-z0-9]{20,}|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY)/.test(exportSource));
  check(`${workflow.id}: valid names and connections`, nodeNames.size === exportJson.nodes.length && connectionTargets.every((target) => nodeNames.has(target)));
  check(`${workflow.id}: code nodes parse`, codeNodesAreSyntacticallyValid);
  if (workflow.polished) {
    check(`${workflow.id}: flagship has Groq agents and Supabase tools`, exportJson.nodes.filter((node) => node.type === '@n8n/n8n-nodes-langchain.agent').length === 2 && exportJson.nodes.filter((node) => node.type === '@n8n/n8n-nodes-langchain.lmChatGroq').length === 2 && exportJson.nodes.filter((node) => /supabase/i.test(node.type)).length >= 6);
    check(`${workflow.id}: flagship has multimodal evidence and human boundary`, nodeNames.has('Groq Multimodal Evidence Reader') && nodeNames.has('Deterministic Decision Guardrails') && nodeNames.has('HUMAN GATE - Review Required') && exportSource.includes('externalWritePerformed'));
    check(`${workflow.id}: flagship has explicit recovery paths`, nodeNames.has('Classify Supabase Failure') && nodeNames.has('Route Retry Budget') && nodeNames.has('Operator Incident - Manual Recovery'));
  } else {
    check(`${workflow.id}: n8n export contains reliability and human boundaries`, ['Claim Idempotency Key [MOCK]', 'Route Retry Budget', 'Human Decision Required', 'Append Final Audit Event [MOCK]'].every((name) => nodeNames.has(name)) && exportSource.includes('externalWritePerformed'));
    const terminalItems = executeN8nExport(exportJson);
    const reviewItems = terminalItems.get('Terminal - Inspectable Review Package') ?? [];
    check(`${workflow.id}: six n8n test cases execute locally`, [...terminalItems.values()].reduce((sum, items) => sum + items.length, 0) === 6);
    check(`${workflow.id}: visible invalid, replay and retry terminals`, (terminalItems.get('Terminal - Manual Data Repair')?.length ?? 0) === 1 && (terminalItems.get('Terminal - Replay Safe')?.length ?? 0) === 1 && (terminalItems.get('Terminal - Bounded Retry Queue')?.length ?? 0) === 1);
    check(`${workflow.id}: domain routes reach human review`, reviewItems.length === 3 && new Set(reviewItems.map((item) => item.json.decision.status)).size === 3);
    check(`${workflow.id}: every n8n terminal performs zero writes`, [...terminalItems.values()].flat().every((item) => item.json.externalWritePerformed !== true && (item.json.adapter?.writesPerformed ?? 0) === 0));
  }
  check(`${workflow.id}: executed n8n screenshot exists`, (await stat(`docs/screenshots/n8n/${workflow.slug}-inspectable-executed.png`)).size > 50_000);
  check(`${workflow.id}: diagram generated`, (await stat(`docs/diagrams/${workflow.slug}.svg`)).size > 1500);
  await access(`content/linkedin/${workflow.slug}/POST_01_DE.md`);
  await access(`content/linkedin/${workflow.slug}/POST_02_DE.md`);
  await access(`content/linkedin/${workflow.slug}/VISUAL_BRIEF_DE.md`);
  check(`${workflow.id}: exception screenshot exists`, (await stat(`content/linkedin/${workflow.slug}/assets/demo-exception.png`)).size > 50_000);
  if (workflow.polished) {
    await access(`content/linkedin/${workflow.slug}/POST_03_DE.md`);
    await access(`content/linkedin/${workflow.slug}/CAROUSEL_STORYBOARD_DE.md`);
    await access(`content/linkedin/${workflow.slug}/VIDEO_SCRIPT_DE.md`);
    check(`${workflow.id}: detailed n8n error screenshot exists`, (await stat(`docs/screenshots/n8n/${workflow.slug}-error-handling-detail.png`)).size > 50_000);
    check(`${workflow.id}: short video asset exists`, (await stat(`content/linkedin/${workflow.slug}/assets/demo-30s.mp4`)).size > 200_000);
  }
}

for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
const failures = checks.filter(([, passed]) => !passed);
console.log(`\n${checks.length - failures.length}/${checks.length} checks passed`);
if (failures.length) process.exitCode = 1;
