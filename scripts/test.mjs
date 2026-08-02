import { readFile, stat } from 'node:fs/promises';

const languages = ['es', 'en', 'de'];
const translations = Object.fromEntries(
  await Promise.all(languages.map(async (language) => [language, JSON.parse(await readFile(`src/i18n/${language}.json`, 'utf8'))])),
);

function keys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child) ? keys(child, path) : [path];
  }).sort();
}

const baselineKeys = JSON.stringify(keys(translations.es));
const imagePaths = ['rfq.png', 'rag-security.png', 'fridgeflow.png', 'agent-observatory.png', 'music-school.png'];
const workflowPaths = ['rfq-workflow.png', 'rag-workflow.png', 'fridge-workflow.png', 'agent-workflow.png', 'music-workflow.png'];
const n8nPaths = ['n8n-rfq.jpg', 'n8n-rag.jpg', 'n8n-fridge.jpg', 'n8n-agent.jpg'];
const [home, workflows, approach, script, css] = await Promise.all([
  readFile('src/index.html', 'utf8'),
  readFile('src/workflows/index.html', 'utf8'),
  readFile('src/approach/index.html', 'utf8'),
  readFile('src/app.js', 'utf8'),
  readFile('src/app.css', 'utf8'),
]);
const publicSource = home + workflows + approach + script + css + JSON.stringify(translations);
const checks = [
  ['translation keys match', languages.every((language) => JSON.stringify(keys(translations[language])) === baselineKeys)],
  ['five projects translated', languages.every((language) => Object.keys(translations[language].projects).length === 5)],
  ['five workflow cases translated', languages.every((language) => Object.keys(translations[language].workflowPage.cases).length === 5)],
  ['three independent pages', home.includes('data-page="home"') && workflows.includes('data-page="workflows"') && approach.includes('data-page="approach"')],
  ['language selector on every page', [home, workflows, approach].every((html) => html.includes('id="language-selector"'))],
  ['shareable language URL', script.includes("searchParams.set('lang', language)") && script.includes('languageFromUrl()')],
  ['route links preserve language', script.includes('routeUrl') && script.includes("route === 'home'")],
  ['hero project slider', home.includes('id="hero-dots"') && script.includes('updateHeroSlide')],
  ['scroll-aware section navigation', script.includes('IntersectionObserver') && script.includes('section-index')],
  ['native workflow zoom dialog', home.includes('<dialog') && workflows.includes('<dialog') && script.includes('showModal()')],
  ['no public Figma navigation', !/figma\.com/i.test(home + workflows + approach + script)],
  ['LinkedIn footer on every page', [home, workflows, approach].every((html) => html.includes('linkedin.com/in/hugomartin-menz'))],
  ['workflow explanations', languages.every((language) => Object.values(translations[language].workflowPage.cases).every((item) => item.why && item.purpose && item.how && item.set.length))],
  ['project flows and scope', languages.every((language) => Object.values(translations[language].projects).every((item) => item.flow.length >= 5 && item.scope && item.visualLabel))],
  ['platform logos', script.includes('platformMeta') && script.includes('cdn.simpleicons.org') && script.includes('renderPlatforms')],
  ['no repeated status grid', !script.includes('truth-table') && !home.includes('status.working') && languages.every((language) => !translations[language].status)],
  ['agent is the full experiment', languages.every((language) => translations[language].projects.agent.name === 'Agent Chaos Lab' && /Observatory/.test(translations[language].projects.agent.how))],
  ['Twilio is scoped as an extension', languages.every((language) => /Twilio/.test(translations[language].projects.music.extension))],
  ['desktop and mobile navigation', css.includes('.section-index') && css.includes('.section-jump') && css.includes('@media (max-width: 780px)')],
  ['no invented metrics', !/\b\d+%|\bsaved\s+\d+|\b\d+\s+(customers?|clients?)\b/i.test(JSON.stringify(translations))],
  ['no secrets', !/sk-or-v1-|sb_secret_|BEGIN PRIVATE KEY/.test(publicSource)],
];
for (const image of imagePaths) checks.push([`real screenshot ${image}`, (await stat(`src/assets/${image}`)).size > 20_000]);
for (const image of workflowPaths) checks.push([`workflow diagram ${image}`, (await stat(`src/assets/${image}`)).size > 20_000]);
for (const image of n8nPaths) checks.push([`real n8n editor ${image}`, (await stat(`src/assets/${image}`)).size > 40_000]);
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (checks.some(([, passed]) => !passed)) process.exitCode = 1;
