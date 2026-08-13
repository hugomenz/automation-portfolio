# Supplier Document Control

**Status:** Built and testable · Synthetic Demo · Nicht validiert

## Problem

Zertifikate, Erklärungen und Kalibrierungen liegen in Ordnern und Postfächern. Version, Ablauf und fehlende Dokumente werden manuell verfolgt.

## Buyer

Supplier Quality / Strategischer Einkauf

## Concrete improvement

Klassifikation, Lieferant, Version und Frist werden in eine prüfbare Ausnahmeliste überführt.

## Explainable flow

1. **Problem:** Zertifikate, Erklärungen und Kalibrierungen liegen in Ordnern und Postfächern. Version, Ablauf und fehlende Dokumente werden manuell verfolgt.
2. **Input:** Lieferantendokumente.
3. **Processing:** deterministic extraction, completeness and rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no external write is performed.

## System boundary

- System of record: DMS/QMS bleibt führend.
- External adapters: Mocked adapter.
- The workflow never invents missing critical facts.
- Fixtures are synthetic and use reserved/non-deliverable contact data where applicable.
- This is not customer validation and contains no measured ROI.

## Fixtures

- `fixtures/happy.json` — complete or bounded input.
- `fixtures/edge.json` — recoverable deviation requiring review.
- `fixtures/error.json` — stop condition.

## Reproduce

From the repository root run `npm run check`. Open `/lab/supplier-document-control/` from the built site and run all three cases. The matching sanitized n8n export is `n8n/workflows/supplier-document-control.workflow.json`; it is disabled and executes all three synthetic cases from a Manual Trigger.

## Market hypothesis

Aktuelle EU-Regeln erhöhen den Stellenwert maschinenlesbarer Produkt- und Konformitätsinformationen; kein Käuferinterview.

**Opportunity score:** 42 / 50. Datenverfügbar und risikoarm zu demonstrieren; wirtschaftlicher Impact muss validiert werden.
