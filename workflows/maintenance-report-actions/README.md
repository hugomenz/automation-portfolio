# Maintenance Report → Actions

**Status:** Built and testable · Synthetic Demo · Nicht validiert

## Problem

Freitextberichte enthalten Befunde, Ersatzteile und offene Arbeiten. Ohne klare Maßnahmen, Verantwortliche und Fristen verschwinden Punkte in PDFs.

## Buyer

Instandhaltungsleitung / Service Operations

## Concrete improvement

Befunde werden mit Quelle in priorisierte Maßnahmen überführt; unklare Schweregrade bleiben zur Prüfung offen.

## Explainable flow

1. **Problem:** Freitextberichte enthalten Befunde, Ersatzteile und offene Arbeiten. Ohne klare Maßnahmen, Verantwortliche und Fristen verschwinden Punkte in PDFs.
2. **Input:** Technikerbericht.
3. **Processing:** deterministic extraction, completeness and rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no external write is performed.

## System boundary

- System of record: CMMS/Ticketsystem bleibt führend.
- External adapters: Mocked adapter.
- The workflow never invents missing critical facts.
- Fixtures are synthetic and use reserved/non-deliverable contact data where applicable.
- This is not customer validation and contains no measured ROI.

## Fixtures

- `fixtures/happy.json` — complete or bounded input.
- `fixtures/edge.json` — recoverable deviation requiring review.
- `fixtures/error.json` — stop condition.

## Reproduce

From the repository root run `npm run check`. Open `/lab/maintenance-report-actions/` from the built site and run all three cases. The matching sanitized n8n export is `n8n/workflows/maintenance-report-actions.workflow.json`; it is disabled and executes all three synthetic cases from a Manual Trigger.

## Market hypothesis

Prozess ist wiederholbar und service-nah; konkrete Nachfrage ist nicht belegt.

**Opportunity score:** 41 / 50. Sehr anschlussfähig an Service, aber nahe an der Service-Triage und daher zunächst sekundär.
