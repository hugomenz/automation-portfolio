import { mkdir, writeFile } from 'node:fs/promises';
import { workflows } from '../src/data/catalog.js';
import { linkedinContent } from '../content/linkedin/content-data.mjs';

function overview(workflow, content) {
  const richerFiles = content.carousel
    ? '- `CAROUSEL_STORYBOARD_DE.md`: eight-slide carousel structure.\n- `VIDEO_SCRIPT_DE.md`: 30–90 second screen-demo script.\n- `assets/demo-30s.mp4`: 35-second silent browser sequence.\n'
    : '';
  const thirdPost = content.posts[2]
    ? '- `POST_03_DE.md`: additional technical/operations draft for a polished workflow.\n'
    : '';
  return `# LinkedIn Content Pack — ${workflow.englishTitle}\n\n**Publication status:** Local draft only. Nothing in this directory has been published.\n\n**Recommended audience:** ${content.audience}\n\n**Truth status:** Synthetic Demo · ${workflow.status} · ${workflow.customerValidation}\n\n## Content angles\n\n${content.angles.map((angle) => `- ${angle}`).join('\n')}\n\n## Hooks\n\n${content.hooks.map((hook) => `- ${hook}`).join('\n')}\n\n## Calls to action\n\n${content.ctas.map((cta) => `- ${cta}`).join('\n')}\n\n## Visual concept\n\n${content.visual}\n\n## Files\n\n- \`POST_01_DE.md\` and \`POST_02_DE.md\`: complete German drafts.\n${thirdPost}- \`VISUAL_BRIEF_DE.md\`: screenshot and composition instructions.\n- \`assets/demo-exception.png\`: German exception-state capture.\n- \`../../../docs/screenshots/n8n/${workflow.slug}-inspectable-executed.png\`: supporting evidence from the executed n8n canvas.\n${richerFiles}\n## Safety\n\nDo not claim customers, production use, measured savings or ROI. Do not publish automatically. Replace no synthetic company with a real company unless explicit consent and evidence exist.\n`;
}

for (const workflow of workflows) {
  const content = linkedinContent[workflow.slug];
  if (!content) throw new Error(`Missing LinkedIn content for ${workflow.slug}`);
  const directory = `content/linkedin/${workflow.slug}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/README.md`, overview(workflow, content));
  for (let index = 0; index < content.posts.length; index += 1) {
    await writeFile(`${directory}/POST_${String(index + 1).padStart(2, '0')}_DE.md`, `# Entwurf ${index + 1} — ${workflow.englishTitle}\n\n**Status:** Lokal, nicht veröffentlicht\n\n${content.posts[index]}\n`);
  }
  await writeFile(`${directory}/VISUAL_BRIEF_DE.md`, `# Visual Brief — ${workflow.englishTitle}\n\n${content.visual}\n\n## Required captures\n\n1. Input or business document context.\n2. The primary rule result.\n3. At least one visible exception or stop state.\n4. Human review controls.\n5. Prepared output and “0 external writes” boundary.\n6. Executed n8n canvas as a supporting engineering-evidence frame; for polished cases also use the matching \`-error-handling-detail.png\` view.\n\nUse the German UI. Start with the business problem, then use the n8n canvas to prove error handling and implementation depth. Label all data as synthetic.\n`);
  if (content.carousel) await writeFile(`${directory}/CAROUSEL_STORYBOARD_DE.md`, `# Carousel Storyboard — ${workflow.englishTitle}\n\n${content.carousel.map((slide, index) => `## Slide ${index + 1}\n\n${slide}`).join('\n\n')}\n`);
  if (content.video) await writeFile(`${directory}/VIDEO_SCRIPT_DE.md`, `# Video Script — ${workflow.englishTitle}\n\nTarget length: 30–90 seconds. Start with the business input, not n8n.\n\n| Time | Picture | Voice-over |\n|---|---|---|\n${content.video.map(([time, picture, voice]) => `| ${time} | ${picture} | ${voice} |`).join('\n')}\n\nEnd card: \`Synthetic Demo · ${workflow.status} · 0 external writes · Nicht kundenvalidiert\`.\n`);
}

console.log(`Generated local German LinkedIn packs for ${workflows.length} workflows`);
