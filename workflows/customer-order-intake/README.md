# Customer Order Intake

**Status:** Built and testable · Synthetic Demo · Nicht validiert

## Problem

Bestellungen kommen per E-Mail, PDF oder Excel. Artikel, Preis, Menge, Termin und Lieferadresse werden manuell gegen Stammdaten geprüft und ins ERP übertragen.

## Buyer

Leitung Vertriebsinnendienst / Operations

## Concrete improvement

Weniger Copy/Paste, früh sichtbare Abweichungen und ein nachvollziehbarer ERP-Entwurf statt einer blinden Buchung.

## Explainable flow

1. **Problem:** Bestellungen kommen per E-Mail, PDF oder Excel. Artikel, Preis, Menge, Termin und Lieferadresse werden manuell gegen Stammdaten geprüft und ins ERP übertragen.
2. **Input:** E-Mail + Bestelldokument.
3. **Processing:** deterministic extraction, completeness and rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no external write is performed.

## System boundary

- System of record: ERP bleibt führend.
- External adapters: Mocked adapter.
- The workflow never invents missing critical facts.
- Fixtures are synthetic and use reserved/non-deliverable contact data where applicable.
- This is not customer validation and contains no measured ROI.

## Fixtures

- `fixtures/happy.json` — complete or bounded input.
- `fixtures/edge.json` — recoverable deviation requiring review.
- `fixtures/error.json` — stop condition.

## Reproduce

From the repository root run `npm run check`. Open `/lab/customer-order-intake/` from the built site and run all three cases. The matching sanitized n8n export is `n8n/workflows/customer-order-intake.workflow.json`; it is disabled and executes all three synthetic cases from a Manual Trigger.

## Market hypothesis

Wiederholbarer Backoffice-Prozess; allgemeine Mittelstandsquellen stützen pragmatische Workflow-Digitalisierung. Noch keine Käuferinterviews.

**Opportunity score:** 43 / 50. Sehr gut erklärbar und mit vorhandenen Dokumenten schnell pilotierbar.
