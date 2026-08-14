# RFQ Prequalification

**Status:** Built and testable · Synthetic Demo · Nicht validiert

## Problem

Anfragen verteilen technische Anforderungen über E-Mail und Anhänge. Fehlende Angaben und Widersprüche werden oft erst spät sichtbar.

## Buyer

Leitung technischer Vertrieb

## Concrete improvement

Vollständigkeit, Widersprüche, Quellen und Rückfragen werden vorbereitet—ohne Preis oder technische Machbarkeit zu erfinden.

## Explainable flow

1. **Problem:** Anfragen verteilen technische Anforderungen über E-Mail und Anhänge. Fehlende Angaben und Widersprüche werden oft erst spät sichtbar.
2. **Input:** RFQ-E-Mail + Dokumente.
3. **Processing:** evidence extraction, completeness and deterministic rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no production write is performed.

## System boundary

- System of record: CRM/Angebotsakte bleibt führend.
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

From the repository root run `npm run check`. Open `/lab/rfq-prequalification/` from the built site and run all three cases. The matching n8n export is `n8n/workflows/rfq-prequalification.workflow.json`; it is disabled and contains no credential reference. It executes six synthetic reliability routes from the Manual Trigger without a credential.

## Market hypothesis

Bestehende Hugo-Prototypen liefern technische Evidenz; kommerzielle Validierung fehlt.

**Opportunity score:** 36 / 50. Guter Domain-Fit, aber bewusst nur ein Experiment unter mehreren.
