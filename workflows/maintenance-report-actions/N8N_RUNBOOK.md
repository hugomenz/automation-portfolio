# n8n runbook — Maintenance Report → Actions

## Canvas contract

- Intake: Techniker- oder Wartungsbericht.
- Integration status: Mocked adapter.
- Human owner: Instandhaltungsleitung.
- Prepared target: CMMS Maßnahmenentwurf; external adapter remains disabled.

## Six executable test routes

1. Happy path → review-ready candidate.
2. Recoverable domain deviation → explained review exception.
3. Critical ambiguity/sensitive condition → quarantined stop.
4. Duplicate delivery → previous outcome, no second processing.
5. Transient dependency failure → bounded retry envelope.
6. Invalid contract → redacted manual data-repair queue.

## Reliability evidence

The canvas separates contract validation, idempotency, dependency health, domain processing, deterministic guardrails, human decision and adapter boundary. Every terminal output includes correlation, audit state and zero production writes. Run the workflow manually while unpublished. No credential is required.
