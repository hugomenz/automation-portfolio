# Design — Automation Portfolio

## World and permitted colour

The portfolio is an inspection contact sheet on a near-black proofing table. The permitted interface palette is near-black `#111313`, mount black `#181b1b`, warm paper `#f4f1e8`, muted paper `#b8bab4`, proofing grey `#343838`, and vermilion `#f0442e`. Vermilion acts like a grease-pencil mark for identity, numbering and primary actions. Platform colours appear only inside their logos. No decorative gradients, glow or glass effects are part of the system.

## Typography

Archivo Black carries the brand, oversized thesis and project identities with tight tracking and compressed line height. Atkinson Hyperlegible carries explanations, captions, definitions and scope notes at regular and bold weights. Frame captions and index labels use compact uppercase text; summaries are larger and more open. Inter is not a fallback design choice.

## Hierarchy, spacing and radii

The content is centered at a maximum width of 1600px with fluid 20–64px gutters. Spacing follows an 8px base: `8`, `12`, `16`, `24`, `32`, `48`, `64`, `96`. The first viewport pairs the thesis with a language-dependent slider: six cases in German and English, five in Spanish. RFQ is always first. A ruled index introduces the same sequence. Each section uses a full-width product screenshot and workflow strip, followed by two text columns: explanation on the left and flow, scope, platforms and actions on the right.

Most surfaces are square or use a restrained `4px` radius; native dialogs may use `8px`. The hierarchy is thesis → project identity → problem/solution → workflow evidence → scope. Order Entry is labelled as a secondary case study and must never outrank RFQ.

Below 1050px the hero, case content, workflow explanations and approach sections stack, and the hero frame loses its slight rotation. Below 780px the primary navigation moves to a second sticky row, the index becomes a two-column list, definition rows stack, and the portfolio reads as a vertical proof strip without changing information order.

## Components and interaction

The system uses proof frames, frame captions, ruled definition lists, numbered flow steps, compact platform-logo labels and direct rectangular actions. These are not independent cards: rules and alignment bind them into one continuous inspection surface. A sticky top bar provides route navigation. After 220px of scroll, a section index follows the active project; narrower viewports receive a fixed section selector. High-level workflow images are buttons that open a native dialog with a larger canvas and a route link to the matching explanation. Screenshots remain visual evidence rather than decoration.

Motion is limited to slider transitions, section navigation and dialog feedback. It must clarify a state change, remain short, and disappear under `prefers-reduced-motion`. There are no ambient loops or scroll-triggered decoration.

## Accessibility

The implementation provides semantic navigation and sections, descriptive localized image alt text, labelled image buttons, a labelled language selector, visible focus outlines and an `aria-live` slider and project region. Platform icons always appear with translated text labels. The zoom surface uses native `dialog`, supports Escape and backdrop close, and keeps a visible close action. Reduced-motion preferences disable smooth scrolling and transitions.

## Truth and internationalisation rules

Every project explains one coherent product flow, then adds a single scope note that distinguishes the public demo from credentialed integrations. Repository actions are optional: the AuftragKlar research repository stays private. German and English expose the secondary Order Entry case; Spanish intentionally retains the prior five-case portfolio. Changing language updates visible copy, image descriptions, title and description, and stores the preference locally.

## Prohibited patterns

Do not add repeated card grids, cards inside cards, generic gradients, glassmorphism, oversized icons, badge clusters, decorative motion, duplicate section templates, sentence-long display type, stock dashboard metrics, or commercial claims without repository evidence. Do not imply a customer, production ERP integration, proven savings or employee replacement. A new case must add distinct evidence or it does not belong in the portfolio.
