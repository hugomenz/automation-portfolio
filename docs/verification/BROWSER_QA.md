# Browser QA — Industrial Automation Lab

Date: 2026-08-13

Result: **PASS**

## Coverage

- 11 routes: home plus all 10 direct workflow routes.
- Desktop: 1440 × 1000.
- Mobile: 390 × 844.
- Total combinations: 22.
- Every route returned HTTP 200 in the local production build.
- Every route had a non-empty German H1, description and canonical URL.
- No console error occurred.
- No horizontal overflow remained.
- The third scenario on every workflow produced `Zur manuellen Prüfung` and displayed `WRITES 0`.

Machine-readable evidence: [`browser-qa.json`](browser-qa.json).

## Interactive checks in the signed-in in-app Browser

- Home rendered with German initial content and all 10 discoverable links.
- Order Intake price-deviation scenario showed `Prüfung erforderlich`, source values, audit events and human controls.
- Approval changed only the local draft state and explicitly reported no external write.
- Replaying the same event returned `Duplikat erkannt` with no second processing.
- Mobile full-page visual inspection confirmed readable hierarchy and usable navigation.

## Defect found and fixed

The first mobile pass found horizontal overflow on Supplier Document Control because the long German compound heading held the grid at 511 px. `min-width: 0`, `overflow-wrap: anywhere` and German hyphenation were added. The full 22-case run then passed.

## Accessibility basics

- German document language.
- Semantic header, navigation, main, sections and footer.
- Skip link and visible focus state.
- Labelled tabs, buttons, text input and disclosure controls.
- Keyboard-operable native controls.
- Reduced-motion CSS.
- Text labels accompany colour-coded states.

This is a focused browser check, not a formal WCAG conformance audit.
