# Machine Service Triage

**Status:** Built and testable · Synthetic Demo · Nicht validiert

## Problem

Eine Störungsmeldung enthält oft unvollständige Maschinenangaben, freie Fehlertexte und Anhänge. Bis ein Techniker übernehmen kann, gehen Rückfragen und Kontextsuche hin und her.

## Buyer

Serviceleiter / After-Sales Operations

## Concrete improvement

Schnellere, nachvollziehbare Triage mit fehlenden Angaben, Priorität und Zuständigkeit—ohne eine technische Ursache zu behaupten.

## Explainable flow

1. **Problem:** Eine Störungsmeldung enthält oft unvollständige Maschinenangaben, freie Fehlertexte und Anhänge. Bis ein Techniker übernehmen kann, gehen Rückfragen und Kontextsuche hin und her.
2. **Input:** Service-E-Mail + Anhänge.
3. **Processing:** deterministic extraction, completeness and rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no external write is performed.

## System boundary

- System of record: Service-/Ticketsystem bleibt führend.
- External adapters: Mocked adapter.
- The workflow never invents missing critical facts.
- Fixtures are synthetic and use reserved/non-deliverable contact data where applicable.
- This is not customer validation and contains no measured ROI.

## Fixtures

- `fixtures/happy.json` — complete or bounded input.
- `fixtures/edge.json` — recoverable deviation requiring review.
- `fixtures/error.json` — stop condition.

## Reproduce

From the repository root run `npm run check`. Open `/lab/machine-service-triage/` from the built site and run all three cases. The matching sanitized n8n export is `n8n/workflows/machine-service-triage.workflow.json`; it is disabled and executes all three synthetic cases from a Manual Trigger.

## Market hypothesis

VDMA beschreibt Service als wesentlichen Umsatzbeitrag im Maschinenbau. Noch keine Käuferinterviews für diesen konkreten Workflow.

**Opportunity score:** 43 / 50. Starker Maschinenbau-Fit und sichtbarer Nutzen bei sicherer Begrenzung auf Triage.
