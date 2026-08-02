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
const [html, script, css] = await Promise.all([
  readFile('src/index.html', 'utf8'), readFile('src/app.js', 'utf8'), readFile('src/app.css', 'utf8'),
]);
const checks = [
  ['translation keys match', languages.every((language) => JSON.stringify(keys(translations[language])) === baselineKeys)],
  ['five projects translated', languages.every((language) => Object.keys(translations[language].projects).length === 5)],
  ['language selector', html.includes('id="language-selector"')],
  ['status vocabulary', languages.every((language) => ['working', 'simulated', 'experimental'].every((key) => translations[language].status[key]))],
  ['responsive breakpoint', css.includes('@media (max-width: 780px)')],
  ['no invented metrics', !/\b\d+%|\bsaved\s+\d+|\b\d+\s+(customers?|clients?)\b/i.test(JSON.stringify(translations))],
  ['no secrets', !/sk-or-v1-|sb_secret_|BEGIN PRIVATE KEY/.test(html + script + css + JSON.stringify(translations))],
];
for (const image of imagePaths) checks.push([`real screenshot ${image}`, (await stat(`src/assets/${image}`)).size > 20_000]);
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (checks.some(([, passed]) => !passed)) process.exitCode = 1;
