# Hugo Menz Automation Portfolio

[Live portfolio](https://hugomenz.github.io/automation-portfolio/) · [desktop screenshot](docs/screenshots/desktop.png) · [mobile screenshot](docs/screenshots/mobile.png)

Trilingual GitHub Pages portfolio for five inspectable automation and workflow case studies.

![Portfolio with Menz RFQ Copilot as the principal case](docs/screenshots/desktop.png)

## Projects

1. Menz RFQ Copilot, primary working case.
2. Second Brain RAG Security Lab, technical differentiator.
3. FridgeFlow, human-facing product.
4. Agent Observatory, experimental architecture and observability.
5. Music School Automation, enquiry and n8n-to-Telegram handoff.

Every case distinguishes working, simulated and experimental parts. Screenshots in `src/assets` were captured from the current local builds.

## Run

```bash
npm run check
npx serve src
```

Translations are maintained independently in `src/i18n/es.json`, `en.json` and `de.json`.

## Architecture

The portfolio is a dependency-free static application. `src/app.js` loads one of the three translation JSON files, renders the five project records, and links each case to its real repository and public demo. Real screenshots are versioned in `src/assets`; no external API, credential or personal dataset is required at runtime.

`npm run check` verifies translation parity, five projects in every language, status vocabulary, responsive CSS, screenshot presence, and common secret patterns before building `dist/` for GitHub Pages.
