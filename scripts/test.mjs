import { access, readFile, stat } from 'node:fs/promises';
import { polishedWorkflows, stages, totalScore, workflows } from '../src/data/catalog.js';
import { applyHumanDecision, runStates, runWorkflow, simulateUnavailableDependency } from '../src/lib/engine.js';
import { linkedinContent } from '../content/linkedin/content-data.mjs';

const checks = [];
const check = (name, condition) => checks.push([name, Boolean(condition)]);

check('exactly ten workflow definitions', workflows.length === 10);
check('exactly three polished workflows', polishedWorkflows.length === 3);
check('six-stage explainable process', JSON.stringify(stages) === JSON.stringify(['Problem', 'Eingang', 'Prüfung', 'Ausnahme', 'Mensch', 'Ergebnis']));
check('unique IDs and slugs', new Set(workflows.map(({ id }) => id)).size === 10 && new Set(workflows.map(({ slug }) => slug)).size === 10);
check('approved public status taxonomy', workflows.every((workflow) => ['Built and testable', 'Test-account integration', 'Mocked adapter', 'Architecture only', 'Planned'].includes(workflow.status) && workflow.adapterStatus === 'Mocked adapter'));
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
check('mobile and reduced motion CSS', css.includes('@media (max-width: 780px)') && css.includes('prefers-reduced-motion'));
check('human decision interaction present', workflowScript.includes('applyHumanDecision') && detail.includes('menschlicher Freigabe'));
check('duplicate and dependency failure controls present', detail.includes('duplicate-button') && detail.includes('failure-button'));
check('truth status visible on home and detail', home.includes('Customer') && home.includes('Validated') && detail.includes('Built and testable'));
check('no common secret patterns', !/(gsk_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|sb_secret_|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|ghp_[A-Za-z0-9]{20,})/.test(publicSource));
check('no invented commercial metrics', !/\b\d+\s*(customers?|Kunden|clients?)\b|\b\d+%\s*(saved|gespart|weniger)/i.test(publicSource));

for (const workflow of workflows) {
  await access(`workflows/${workflow.slug}/README.md`);
  await access(`workflows/${workflow.slug}/fixtures/happy.json`);
  await access(`workflows/${workflow.slug}/fixtures/edge.json`);
  await access(`workflows/${workflow.slug}/fixtures/error.json`);
  const exportSource = await readFile(`n8n/workflows/${workflow.slug}.workflow.json`, 'utf8');
  const exportJson = JSON.parse(exportSource);
  check(`${workflow.id}: disabled sanitized n8n export`, exportJson.active === false && exportJson.nodes.length >= 4 && !/(credential|gsk_|sk-|@gmail|password)/i.test(exportSource));
  check(`${workflow.id}: n8n export contains human boundary`, exportJson.nodes.some((node) => /Human Review/i.test(node.name)) && exportSource.includes('externalWritePerformed'));
  check(`${workflow.id}: diagram generated`, (await stat(`docs/diagrams/${workflow.slug}.svg`)).size > 1500);
  await access(`content/linkedin/${workflow.slug}/POST_01_DE.md`);
  await access(`content/linkedin/${workflow.slug}/POST_02_DE.md`);
  await access(`content/linkedin/${workflow.slug}/VISUAL_BRIEF_DE.md`);
  check(`${workflow.id}: exception screenshot exists`, (await stat(`content/linkedin/${workflow.slug}/assets/demo-exception.png`)).size > 50_000);
  if (workflow.polished) {
    await access(`content/linkedin/${workflow.slug}/POST_03_DE.md`);
    await access(`content/linkedin/${workflow.slug}/CAROUSEL_STORYBOARD_DE.md`);
    await access(`content/linkedin/${workflow.slug}/VIDEO_SCRIPT_DE.md`);
    check(`${workflow.id}: short video asset exists`, (await stat(`content/linkedin/${workflow.slug}/assets/demo-30s.mp4`)).size > 200_000);
  }
}

for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
const failures = checks.filter(([, passed]) => !passed);
console.log(`\n${checks.length - failures.length}/${checks.length} checks passed`);
if (failures.length) process.exitCode = 1;
