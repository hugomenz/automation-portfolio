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
3. **Processing:** evidence extraction, completeness and deterministic rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no production write is performed.

## System boundary

- System of record: ERP/Finanzsystem bleibt führend.
- Integration status: Test-account integration.
- Groq and Supabase are connected only in an unpublished test account; credentials are never exported.
- The final ERP, ticket or finance-system adapter remains disabled.
- The workflow never invents missing critical facts.
- Fixtures are synthetic and use reserved/non-deliverable contact data where applicable.
- This is not customer validation and contains no measured ROI.

## Fixtures

- `fixtures/happy.json` — complete or bounded input.
- `fixtures/edge.json` — recoverable deviation requiring review.
- `fixtures/error.json` — stop condition.

## Reproduce

From the repository root run `npm run check`. Open `/lab/invoice-po-matching/` from the built site and run all three cases. The matching n8n export is `n8n/workflows/invoice-po-matching.workflow.json`; it is disabled and contains no credential reference. After import, connect separate Groq and Supabase test credentials and execute only the Manual Trigger.

## Market hypothesis

Die deutsche B2B-E-Rechnung schafft aktuellen Prozessdruck; das beweist noch keine Nachfrage nach genau dieser Lösung.

**Opportunity score:** 44 / 50. Sehr häufig, gut messbar und mit starkem Failure-Post rund um Bankdaten.
