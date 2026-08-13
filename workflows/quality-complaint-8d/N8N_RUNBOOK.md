# n8n runbook — Quality Complaint / 8D Preparation

## Canvas contract

- Intake: Reklamation + Fotos + Messdaten.
- Context adapter: QMS + Chargen- und Prüfkontext (**Mocked adapter**).
- Human owner: Qualitätsleitung.
- Prepared target: 8D Arbeitsentwurf; external adapter remains disabled.

## Six executable test routes

1. Happy path → review-ready candidate.
2. Recoverable domain deviation → explained review exception.
3. Critical ambiguity/sensitive condition → quarantined stop.
4. Duplicate delivery → previous outcome, no second processing.
5. Transient dependency failure → bounded retry envelope.
6. Invalid contract → redacted manual data-repair queue.

## Reliability evidence

The canvas separates contract validation, idempotency, dependency health, domain processing, deterministic guardrails, human decision and adapter boundary. Every terminal output includes correlation, audit state and zero external writes. Run the workflow manually while unpublished; no credential is required.
