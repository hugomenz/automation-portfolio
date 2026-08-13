# Design — Industrial Automation Lab

## Visual idea

An editorial industrial control sheet: warm technical paper outside, near-black inspection surfaces inside, lime for prepared states and safety orange/red for exceptions. The interface should look plausible beside a German ERP or service tool without copying one.

## Hierarchy

The first viewport states the operational outcome and truth status. It does not lead with n8n, agents or an integration-logo wall. Direct workflow discovery uses a numbered ruled list; no carousel hides evidence.

Each detail page follows problem and buyer, concrete improvement, six-stage process, synthetic input, checks, exception, human decision, prepared output, audit and limitations.

## Typography and colour

Use system sans-serif for durable rendering and system monospace for IDs, sources, states and controls. Core colours are near-black `#0b1110`, warm paper `#f1f0e9`, lime `#b9f34c`, exception orange `#ff6a3d`, stop red `#ff605c` and evidence blue `#8dd7ff`.

## Interaction

Three scenarios are always visible. Replay demonstrates idempotency. A simulated adapter failure demonstrates bounded retry. Approval changes only local demo state and keeps `0 writes` visible.

## Accessibility

German initial HTML, semantic headings and landmarks, skip links, labelled tabs and controls, visible focus, keyboard-operable disclosure widgets, reduced-motion support and responsive layouts at desktop and 390px mobile.

## Truth guardrails

- Status labels come from the approved taxonomy.
- Synthetic data is never presented as customer evidence.
- Confidence never replaces source evidence or a critical human decision.
- No stock metric, customer logo, testimonial, saving or ROI is shown.
