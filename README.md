# Hugo Menz Automation Portfolio

[Portfolio ES](https://hugomenz.github.io/automation-portfolio/?lang=es) · [Portfolio EN](https://hugomenz.github.io/automation-portfolio/?lang=en) · [Portfolio DE](https://hugomenz.github.io/automation-portfolio/?lang=de)

[N8N Workflows ES](https://hugomenz.github.io/automation-portfolio/workflows/?lang=es) · [N8N Workflows EN](https://hugomenz.github.io/automation-portfolio/workflows/?lang=en) · [Arbeitsweise DE](https://hugomenz.github.io/automation-portfolio/approach/?lang=de)

[Home screenshot](docs/screenshots/desktop.png) · [workflow page screenshot](docs/screenshots/workflows-en.png)

Trilingual GitHub Pages portfolio for five inspectable automation and workflow case studies.

![Portfolio with Menz RFQ Copilot as the principal case](docs/screenshots/desktop.png)

## Projects

1. Menz RFQ Copilot, primary working case.
2. Second Brain RAG Security Lab, technical differentiator.
3. FridgeFlow, human-facing product.
4. Agent Observatory, experimental architecture and observability.
5. Music School Automation, enquiry and n8n-to-Telegram handoff.

Every case distinguishes working, simulated and experimental parts. The home page contains the five project cases, the dedicated `/workflows/` route explains the real n8n architecture, and `/approach/` documents the delivery method. Screenshots in `src/assets` were captured from the current local builds. The n8n page uses the real local editor after importing the versioned workflow JSON files; it does not claim production executions.

## Run

```bash
npm run check
npx serve src
```

Translations are maintained independently in `src/i18n/es.json`, `en.json` and `de.json`. The language selector writes `?lang=es`, `?lang=en` or `?lang=de` into every route so the selected page and language can be shared directly.

## Architecture

The portfolio is a dependency-free multipage static application. `src/app.js` loads one of the three translation JSON files and renders the home cases, workflow explanations or approach sections according to the current route. The home slider changes its project and CTAs, the section navigator follows scroll position, and native dialogs enlarge diagrams without leaving the site. Real application screenshots and exported workflow diagrams are versioned in `src/assets`; no external API, credential or personal dataset is required at runtime.

`npm run check` verifies translation parity, five projects and workflow cases, three routes, slider, scroll navigation, native dialog, LinkedIn footer, responsive CSS, screenshot presence, and common secret patterns before building `dist/` for GitHub Pages.
