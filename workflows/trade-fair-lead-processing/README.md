# Trade Fair Lead Processing

**Status:** Built and testable · Synthetic Demo · Nicht validiert

## Problem

Badge, Visitenkarte und Gesprächsnotizen müssen nach der Messe konsolidiert, ergänzt und ins CRM vorbereitet werden. Consent und Dubletten sind oft unklar.

## Buyer

Vertriebsleitung / Sales Operations

## Concrete improvement

Ein strukturierter CRM-Entwurf mit fehlenden Angaben, Dublettenhinweis und freizugebendem Follow-up.

## Explainable flow

1. **Problem:** Badge, Visitenkarte und Gesprächsnotizen müssen nach der Messe konsolidiert, ergänzt und ins CRM vorbereitet werden. Consent und Dubletten sind oft unklar.
2. **Input:** Badge / Visitenkarte / Notizen.
3. **Processing:** evidence extraction, completeness and deterministic rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no production write is performed.

## System boundary

- System of record: CRM bleibt führend.
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

From the repository root run `npm run check`. Open `/lab/trade-fair-lead-processing/` from the built site and run all three cases. The matching n8n export is `n8n/workflows/trade-fair-lead-processing.workflow.json`; it is disabled and contains no credential reference. It executes six synthetic reliability routes from the Manual Trigger without a credential.

## Market hypothesis

Leicht erklärbar, aber saisonal und weniger industriespezifisch; keine Nachfragebelege.

**Opportunity score:** 36 / 50. Guter schneller Proof, kommerziell vermutlich austauschbarer als Service- oder Auftragsprozesse.
