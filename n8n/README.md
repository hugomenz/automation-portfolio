# n8n proof layer

## Status

- 10 sanitized, importable workflow exports.
- Three 46–48-node flagship control towers: Order-to-ERP, Service Incident Command and Procure-to-Pay Exception Control.
- Seven deterministic 46-node prototypes with six executable synthetic routes: nominal, recoverable deviation, critical stop, duplicate delivery, transient dependency failure and invalid contract.
- `active: false` in every versioned JSON file; Manual Trigger only.
- One visible target adapter per workflow, intentionally disabled and pointed at `example.invalid`.
- No credential reference, environment secret, account identifier or real personal data in the exports.
- Every terminal route reports zero external writes.
- The flagship exports require separately selected Groq and Supabase test-account credentials after import. Credentials are not present in these files.
- None is published or activated; no ERP, ticket, payment, e-mail or other production side effect is permitted.

## Flagship control towers

Each flagship visibly separates five departmental lanes and includes:

1. Manual synthetic evidence intake with correlation and idempotency keys.
2. Groq multimodal evidence extraction from a rendered PDF or HMI photo.
3. An evidence agent using read-only Supabase master-data tools.
4. An independent Groq challenger agent.
5. Deterministic hard stops that remain outside the model prompt.
6. Supabase case, agent-run, event and pending-approval audit writes.
7. No-claim AI fallbacks, classified database failure, bounded retry and operator incident.
8. An explicit human gate before a disabled target adapter.

## Inspectable canvas contract

The seven compact prototypes separate the concerns that were previously hidden in one code block:

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

Run `npm run check`. The test harness parses every export, verifies valid cross-type connections, unique node names, the exact Groq/Supabase/human-boundary structure of each flagship, all six routes in the seven deterministic prototypes, disabled target adapters and secret-free exports.

Each workflow directory also contains an `N8N_RUNBOOK.md` and six matching fixtures.

## Safe import

Import a JSON file from `n8n/workflows/` into a development/test project. Keep it unpublished. Execute only with the Manual Trigger. For a flagship, select a Groq test credential on the model/vision nodes and a Supabase test credential on the tools/audit nodes. Never enable the final target adapter.

## Visual evidence

- [Ten detailed workflows in the cloud inventory](../docs/screenshots/n8n/workflow-inventory-10-inspectable.png)
- [Order Intake — executed overview](../docs/screenshots/n8n/customer-order-intake-inspectable-executed.png)
- [Order Intake — error handling detail](../docs/screenshots/n8n/customer-order-intake-error-handling-detail.png)
- [Service Triage — executed overview](../docs/screenshots/n8n/machine-service-triage-inspectable-executed.png)
- [Service Triage — error handling detail](../docs/screenshots/n8n/machine-service-triage-error-handling-detail.png)
- [Invoice Matching — executed overview](../docs/screenshots/n8n/invoice-po-matching-inspectable-executed.png)
- [Invoice Matching — error handling detail](../docs/screenshots/n8n/invoice-po-matching-error-handling-detail.png)

The other seven executed canvases are stored beside these files using the matching workflow slug. Cloud editor URLs remain only in the private control-repository handoff.
