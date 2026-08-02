# Design — Automation Portfolio

## World and colour

The portfolio is an inspection contact sheet on a near-black proofing table (`#111313`). Real project screenshots sit in darker mounts with thin grey proofing rules; warm paper (`#f4f1e8`) provides the primary type colour. Vermilion (`#f0442e`) acts like a grease-pencil mark for identity, numbering and primary actions. Platform colours appear only inside their logos.

## Typography

Archivo Black carries the brand, oversized thesis and project identities with tight tracking and compressed line height. Atkinson Hyperlegible carries explanations, captions, definitions and scope notes at regular and bold weights. Frame captions and index labels use compact uppercase text; summaries are larger and more open.

## Composition and spacing

The content is centered at a maximum width of 1600px with fluid 20–64px gutters. The first viewport pairs the thesis with a five-project slider; its image, title, demo CTA and case anchor change together. A ruled index introduces five project sections. Each section uses a full-width product screenshot and workflow strip, followed by two text columns: explanation on the left and flow, scope, platforms and actions on the right. N8N Workflows uses the same full-width-image and two-column pattern.

Below 1050px the hero, case content, workflow explanations and approach sections stack, and the hero frame loses its slight rotation. Below 780px the primary navigation moves to a second sticky row, the index becomes a two-column list, definition rows stack, and the portfolio reads as a vertical proof strip without changing information order.

## Components and interaction

The system uses proof frames, frame captions, ruled definition lists, numbered flow cards, compact platform-logo chips and direct rectangular actions. A sticky top bar provides route navigation. After 220px of scroll, a section index follows the active project; narrower viewports receive a fixed section selector. High-level workflow images are buttons that open a native dialog with a larger canvas and a route link to the matching n8n explanation. Screenshots remain visual evidence rather than decoration.

## Accessibility

The implementation provides semantic navigation and sections, descriptive localized image alt text, labelled image buttons, a labelled language selector, visible focus outlines and an `aria-live` slider and project region. Platform icons always appear with translated text labels. The zoom surface uses native `dialog`, supports Escape and backdrop close, and keeps a visible close action. Reduced-motion preferences disable smooth scrolling and transitions.

## Truth and internationalisation rules

Every project explains one coherent product flow, then adds a single scope note that distinguishes the public demo from credentialed integrations. This avoids repeated status labels while keeping claims specific. Every case exposes a demo and repository link; Agent Chaos Lab also links directly to Observatory. Spanish, English and German use identical key structures in separate JSON files; changing language updates visible copy, image descriptions, title and description, and stores the preference locally.
