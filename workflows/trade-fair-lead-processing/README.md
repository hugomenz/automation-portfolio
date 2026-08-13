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
3. **Processing:** deterministic extraction, completeness and rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no external write is performed.

## System boundary

- System of record: CRM bleibt führend.
- External adapters: Mocked adapter.
- The workflow never invents missing critical facts.
- Fixtures are synthetic and use reserved/non-deliverable contact data where applicable.
- This is not customer validation and contains no measured ROI.

## Fixtures

- `fixtures/happy.json` — complete or bounded input.
- `fixtures/edge.json` — recoverable deviation requiring review.
- `fixtures/error.json` — stop condition.

## Reproduce

From the repository root run `npm run check`. Open `/lab/trade-fair-lead-processing/` from the built site and run all three cases. The matching sanitized n8n export is `n8n/workflows/trade-fair-lead-processing.workflow.json`; it is disabled and executes all three synthetic cases from a Manual Trigger.

## Market hypothesis

Leicht erklärbar, aber saisonal und weniger industriespezifisch; keine Nachfragebelege.

**Opportunity score:** 36 / 50. Guter schneller Proof, kommerziell vermutlich austauschbarer als Service- oder Auftragsprozesse.
