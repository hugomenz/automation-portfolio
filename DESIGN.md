# Design — Automation Portfolio

## World and colour

The portfolio is an inspection contact sheet on a near-black proofing table (`#111313`). Real project screenshots sit in darker mounts with thin grey proofing rules; warm paper (`#f4f1e8`) provides the primary type colour. Vermilion (`#f0442e`) acts like a grease-pencil mark for identity, numbering and primary actions. Green (`#23835c`), yellow (`#e8bc26`) and blue (`#2256d7`) consistently identify working, simulated and experimental status.

## Typography

Archivo Black carries the brand, oversized thesis and project identities with tight tracking and compressed line height. Atkinson Hyperlegible carries explanations, captions, evidence definitions and truth tables at regular and bold weights. Frame captions, index labels and status labels use compact uppercase text; summaries are larger and more open.

## Composition and spacing

The content is centered at a maximum width of 1600px with fluid 20–64px gutters. Menz RFQ Copilot occupies the principal first-viewport frame beside the thesis and actions. A ruled, horizontally scrollable index strip introduces five projects, which then alternate screenshot and evidence copy in a numbered sequence with roughly 90px section padding and fluid 34–90px column gaps. The approach statement and principles form the closing two-column spread.

Below 1050px the hero, project rows and approach stack, all frames lose their alternating grid placement and the hero frame loses its slight rotation. Below 780px navigation links are hidden, the language selector remains, the index becomes a two-column list, definition and truth rows stack, and the portfolio reads as a vertical proof strip without changing evidence order.

## Components and interaction

The system uses proof frames, frame captions, a fixed status legend, ruled definition lists, repeated truth rows and direct rectangular actions. Screenshots are the visual evidence; there are no decorative capability cards or invented statistics. Links remain visibly underlined unless promoted to the vermilion primary action. The only persistent control is the compact native language selector; language changes rerender the project evidence and update document metadata.

## Accessibility

The implementation provides semantic navigation and sections, descriptive localized image alt text, labelled image links, a labelled language selector, visible focus outlines and an `aria-live` project region. Status colours always appear with translated text labels. Native links and select controls preserve keyboard operation. Reduced-motion preferences disable smooth scrolling; the rotated hero frame is also removed at narrower layouts.

## Truth and internationalisation rules

Every project repeats the same three labelled evidence rows: green `Working`, yellow `Simulated` and blue `Experimental`. These statuses stay separate rather than collapsing into a single completion claim, and every case exposes both demo and repository links. Spanish, English and German use identical key structures in separate JSON files; changing language updates visible copy, image descriptions, title and description, and stores the preference locally. Translations may change language, never the underlying status or claim.
