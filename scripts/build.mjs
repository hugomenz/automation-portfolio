import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { workflows } from '../src/data/catalog.js';

const origin = 'https://hugomenz.github.io/automation-portfolio';

try {
  await rm('dist', { recursive: true, force: true });
} catch (error) {
  if (error?.code !== 'EBUSY') throw error;
  for (const entry of await readdir('dist')) await rm(`dist/${entry}`, { recursive: true, force: true });
}

await mkdir('dist', { recursive: true });
await cp('src', 'dist', { recursive: true });
await mkdir('dist/evidence/n8n', { recursive: true });
await cp('docs/screenshots/n8n', 'dist/evidence/n8n', { recursive: true });
const template = await readFile('src/workflow.html', 'utf8');

for (const workflow of workflows) {
  const route = `dist/lab/${workflow.slug}`;
  await mkdir(route, { recursive: true });
  const html = template
    .replaceAll('__WORKFLOW_SLUG__', workflow.slug)
    .replace('<title>Workflow — Industrial Automation Lab</title>', `<title>${workflow.title} — Industrial Automation Lab</title>`)
    .replace('Interaktive synthetische Workflow-Demo mit Ausnahmeweg und menschlicher Freigabe.', workflow.improvement)
    .replace('</head>', `    <link rel="canonical" href="${origin}/lab/${workflow.slug}/" />\n  </head>`);
  await writeFile(`${route}/index.html`, html);
}

const sitemap = [`${origin}/`, ...workflows.map((workflow) => `${origin}/lab/${workflow.slug}/`)]
  .map((url) => `  <url><loc>${url}</loc></url>`).join('\n');
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile('dist/404.html', await readFile('src/index.html'));
await rm('dist/workflow.html');
console.log(`Built Industrial Automation Lab with ${workflows.length} direct workflow routes`);
