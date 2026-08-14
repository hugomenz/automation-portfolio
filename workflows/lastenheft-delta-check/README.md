# Lastenheft Delta Check

**Status:** Built and testable · Synthetic Demo · Nicht validiert

## Problem

Kundenanforderungen und interne Standards werden seitenweise verglichen. Abweichungen, Widersprüche und fehlende Angaben müssen mit Quelle belegbar bleiben.

## Buyer

Leitung Engineering / Technischer Vertrieb

## Concrete improvement

Eine prüfbare Anforderungsmatrix mit Seite, Delta, Risiko und offenen Fragen statt eines unverbundenen Text-Summaries.

## Explainable flow

1. **Problem:** Kundenanforderungen und interne Standards werden seitenweise verglichen. Abweichungen, Widersprüche und fehlende Angaben müssen mit Quelle belegbar bleiben.
2. **Input:** Lastenheft + interner Standard.
3. **Processing:** evidence extraction, completeness and deterministic rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no production write is performed.

## System boundary

- System of record: Freigegebene Anforderungsmatrix.
- Integration status: Mocked adapter.
- Context and target-system adapters remain mocked.
- The workflow never invents missing critical facts.
- Fixtures are synthetic and use reserved/non-deliverable contact data where applicable.
- This is not customer validation and contains no measured ROI.

## Fixtures

- `fixtures/happy.json` — complete or bounded input.
- `fixtures/edge.json` — recoverable deviation requiring review.
- `fixtures/error.json` — stop condition.

## Reproduce

From the repository root run `npm run check`. Open `/lab/lastenheft-delta-check/` from the built site and run all three cases. The matching n8n export is `n8n/workflows/lastenheft-delta-check.workflow.json`; it is disabled and contains no credential reference. It executes six synthetic reliability routes from the Manual Trigger without a credential.

## Market hypothesis

Hoher Projektwert ist plausibel, aber Frequenz und Kaufbereitschaft sind noch nicht belegt.

**Opportunity score:** 33 / 50. Wertvoll bei komplexen Projekten, jedoch weniger häufig und fachlich risikoreich.
