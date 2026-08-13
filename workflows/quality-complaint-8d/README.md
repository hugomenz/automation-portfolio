# Quality Complaint / 8D Preparation

**Status:** Built and testable · Synthetic Demo · Nicht validiert

## Problem

Reklamationen starten mit unvollständigen Angaben. Sofortmaßnahmen, Verantwortliche und Nachweise müssen strukturiert werden, bevor eine Ursachenanalyse belastbar ist.

## Buyer

Qualitätsleitung

## Concrete improvement

Ein prüfbares 8D-Arbeitsgerüst mit fehlenden Nachweisen und Containment—ohne Root Cause zu erfinden.

## Explainable flow

1. **Problem:** Reklamationen starten mit unvollständigen Angaben. Sofortmaßnahmen, Verantwortliche und Nachweise müssen strukturiert werden, bevor eine Ursachenanalyse belastbar ist.
2. **Input:** Reklamation + Fotos/Messdaten.
3. **Processing:** deterministic extraction, completeness and rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no external write is performed.

## System boundary

- System of record: QMS bleibt führend.
- External adapters: Mocked adapter.
- The workflow never invents missing critical facts.
- Fixtures are synthetic and use reserved/non-deliverable contact data where applicable.
- This is not customer validation and contains no measured ROI.

## Fixtures

- `fixtures/happy.json` — complete or bounded input.
- `fixtures/edge.json` — recoverable deviation requiring review.
- `fixtures/error.json` — stop condition.

## Reproduce

From the repository root run `npm run check`. Open `/lab/quality-complaint-8d/` from the built site and run all three cases. The matching sanitized n8n export is `n8n/workflows/quality-complaint-8d.workflow.json`; it is disabled and executes all three synthetic cases from a Manual Trigger.

## Market hypothesis

Klarer etablierter Qualitätsprozess; konkrete Frequenz und Budgetbereitschaft sind unbekannt.

**Opportunity score:** 34 / 50. Wertvoll, aber hohe fachliche Verantwortung und oft geringere Fallzahl.
