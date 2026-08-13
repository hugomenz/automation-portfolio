# Invoice / PO Matching

**Status:** Built and testable · Synthetic Demo · Nicht validiert

## Problem

Lieferantenrechnung, Bestellung und Wareneingang müssen auf Preis, Menge, Steuer und Bankdaten abgeglichen werden. Sensible Abweichungen dürfen nicht durchrutschen.

## Buyer

Leitung Kreditorenbuchhaltung / Einkauf

## Concrete improvement

Schnellere Dreifachprüfung mit sichtbaren Quellen; IBAN-Änderungen und unklare Abweichungen stoppen immer.

## Explainable flow

1. **Problem:** Lieferantenrechnung, Bestellung und Wareneingang müssen auf Preis, Menge, Steuer und Bankdaten abgeglichen werden. Sensible Abweichungen dürfen nicht durchrutschen.
2. **Input:** E-Rechnung / PDF + PO + Wareneingang.
3. **Processing:** deterministic extraction, completeness and rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no external write is performed.

## System boundary

- System of record: ERP/Finanzsystem bleibt führend.
- External adapters: Mocked adapter.
- The workflow never invents missing critical facts.
- Fixtures are synthetic and use reserved/non-deliverable contact data where applicable.
- This is not customer validation and contains no measured ROI.

## Fixtures

- `fixtures/happy.json` — complete or bounded input.
- `fixtures/edge.json` — recoverable deviation requiring review.
- `fixtures/error.json` — stop condition.

## Reproduce

From the repository root run `npm run check`. Open `/lab/invoice-po-matching/` from the built site and run all three cases. The matching sanitized n8n export is `n8n/workflows/invoice-po-matching.workflow.json`; it is disabled and executes all three synthetic cases from a Manual Trigger.

## Market hypothesis

Die deutsche B2B-E-Rechnung schafft aktuellen Prozessdruck; das beweist noch keine Nachfrage nach genau dieser Lösung.

**Opportunity score:** 44 / 50. Sehr häufig, gut messbar und mit starkem Failure-Post rund um Bankdaten.
