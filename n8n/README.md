# n8n proof layer

## Status

- 10 sanitized, importable workflow exports.
- 46 nodes per workflow: 40 operational nodes plus 6 explanatory Sticky Notes.
- 6 executable synthetic routes per workflow: nominal, recoverable deviation, critical stop, duplicate delivery, transient dependency failure and invalid contract.
- `active: false` in every versioned JSON file; Manual Trigger only.
- One visible HTTP target adapter per workflow, intentionally disabled and pointed at `example.invalid`.
- No credential reference, environment secret, account identifier or real personal data in the exports.
- Every terminal route reports zero external writes.
- All ten detailed versions were imported into Hugo's n8n Personal test project and executed manually on 2026-08-14.
- None was published or activated; the n8n production-execution counter remained at zero.

## Inspectable canvas contract

Each workflow separates the concerns that were previously hidden in one code block:

1. `Manual Trigger` and `Load 6 Synthetic Test Cases`.
2. `Normalize Intake Envelope` and `Validate Required Contract`.
3. `Route Contract Status` with a redacted manual data-repair terminal.
4. `Claim Idempotency Key [MOCK]` and replay-safe previous outcome.
5. Mocked domain-context lookup and explicit dependency-health routing.
6. Transient-error classification, retry budget, backoff envelope and terminal operator incident.
7. Four domain-specific processing stages for the industrial problem.
8. Deterministic guardrails and three visible outcomes: ready, review and critical stop.
9. Version-bound `Human Decision Required`.
10. Draft payload, disabled target adapter, final audit event and inspectable terminal package.

This is deliberate portfolio evidence rather than decorative complexity. The workflow demonstrates where data is rejected, where a retry is safe, where a duplicate stops, and where a person owns the decision.

## Reproduce locally

Run `npm run check`. The test harness parses every export and executes its graph without n8n-specific hidden state. It verifies all six routes, valid connections, unique node names, deterministic domain outcomes, disabled adapters and zero writes.

Each workflow directory also contains an `N8N_RUNBOOK.md` and six matching fixtures.

## Safe import

Import a JSON file from `n8n/workflows/` into a development/test project. Keep it unpublished. Execute only with the Manual Trigger. The disabled HTTP adapter is illustrative: do not activate it or attach credentials without a separately approved test-account integration and rollback plan.

## Visual evidence

- [Ten detailed workflows in the cloud inventory](../docs/screenshots/n8n/workflow-inventory-10-inspectable.png)
- [Order Intake — executed overview](../docs/screenshots/n8n/customer-order-intake-inspectable-executed.png)
- [Order Intake — error handling detail](../docs/screenshots/n8n/customer-order-intake-error-handling-detail.png)
- [Service Triage — executed overview](../docs/screenshots/n8n/machine-service-triage-inspectable-executed.png)
- [Service Triage — error handling detail](../docs/screenshots/n8n/machine-service-triage-error-handling-detail.png)
- [Invoice Matching — executed overview](../docs/screenshots/n8n/invoice-po-matching-inspectable-executed.png)
- [Invoice Matching — error handling detail](../docs/screenshots/n8n/invoice-po-matching-error-handling-detail.png)

The other seven executed canvases are stored beside these files using the matching workflow slug. Cloud editor URLs remain only in the private control-repository handoff.
