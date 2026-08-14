# Design — Industrial Automation Lab

## Visual idea

An editorial industrial control sheet: warm technical paper outside, near-black inspection surfaces inside, lime for prepared states and safety orange/red for exceptions. The interface should look plausible beside a German ERP or service tool without copying one.

## Hierarchy

The first viewport states the operational outcome and shows a compact cross-department control console. It does not lead with n8n or an integration-logo wall. Direct workflow discovery uses three flagship cards plus a compact ten-workflow index; no carousel hides evidence.

Each flagship detail page is a two-pane operations console: the original PDF/image on the left and the extracted control package on the right. Department handoffs and bounded agent roles sit directly below; the n8n canvas is available as progressive-disclosure engineering evidence.

## Typography and colour

Use system sans-serif for durable rendering and system monospace for IDs, sources, states and controls. Core colours are near-black `#111916`, technical paper `#f3f4f0`, lime `#b8f34b`, exception orange `#ff7043`, stop red `#e54e45`, evidence blue `#5575f5` and agent purple `#8c68e8`.

## Interaction

Three scenarios are always visible. Replay demonstrates idempotency. A simulated adapter failure demonstrates bounded retry. Approval changes only local demo state and keeps `0 writes` visible.

## Accessibility

German initial HTML, semantic headings and landmarks, skip links, labelled tabs and controls, visible focus, keyboard-operable disclosure widgets, reduced-motion support and responsive layouts at desktop and 390px mobile.

## Truth guardrails

- Status labels come from the approved taxonomy.
- Synthetic data is never presented as customer evidence.
- Confidence never replaces source evidence or a critical human decision.
- No stock metric, customer logo, testimonial, saving or ROI is shown.
