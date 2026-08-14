# Spare Parts Inquiry

**Status:** Built and testable · Synthetic Demo · Nicht validiert

## Problem

Kunden fragen mit Freitext, Foto oder Maschinenreferenz nach einem Ersatzteil. Varianten, Nachfolger und unvollständige BOM-Daten machen eine automatische Auswahl riskant.

## Buyer

Leitung Ersatzteilservice

## Concrete improvement

Kandidaten, BOM-Quelle, Nachfolger und synthetische Verfügbarkeit werden vorbereitet; bei Mehrdeutigkeit stoppt der Prozess.

## Explainable flow

1. **Problem:** Kunden fragen mit Freitext, Foto oder Maschinenreferenz nach einem Ersatzteil. Varianten, Nachfolger und unvollständige BOM-Daten machen eine automatische Auswahl riskant.
2. **Input:** E-Mail / Foto / Maschinennummer.
3. **Processing:** evidence extraction, completeness and deterministic rule checks with source references.
4. **Exception:** missing, ambiguous, contradictory or sensitive fields enter a visible exception state.
5. **Human decision:** a responsible person approves or rejects the prepared draft.
6. **Result:** a structured payload is prepared for review; no production write is performed.

## System boundary

- System of record: BOM und ERP bleiben führend.
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

From the repository root run `npm run check`. Open `/lab/spare-parts-inquiry/` from the built site and run all three cases. The matching n8n export is `n8n/workflows/spare-parts-inquiry.workflow.json`; it is disabled and contains no credential reference. It executes six synthetic reliability routes from the Manual Trigger without a credential.

## Market hypothesis

VDMA bezeichnet Ersatzteile als Rückgrat des Servicegeschäfts. Die konkrete Datenqualität ist noch unbekannt.

**Opportunity score:** 38 / 50. Hoher Wert, aber stark abhängig von BOM-, Varianten- und Nachfolgerdaten.
