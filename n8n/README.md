# n8n proof layer

## Status

- 10 sanitized workflow exports.
- `active: false` in every versioned JSON file.
- Manual Trigger only; no webhook, schedule, email or production trigger.
- No credentials, environment secrets, account identifiers or real personal data.
- External writes are explicitly `false` in terminal output.
- Cloud baseline was empty before import.
- All ten were imported into the Personal project and manually executed on 2026-08-13.
- Each manual run produced three items: happy path, recoverable edge case and stop condition.
- None was published or activated.

## Node contract

Every workflow contains four nodes:

1. `Manual Trigger`.
2. `Synthetic Fixtures` — emits exactly three synthetic cases.
3. `Normalize & Evaluate` — assigns `READY_FOR_REVIEW`, `REVIEW_REQUIRED` or `STOPPED_FOR_REVIEW`, plus correlation and idempotency identifiers.
4. `Human Review Boundary` — prepares a draft and declares `externalWritePerformed: false`.

The browser demo contains the more detailed domain-specific checks. The n8n layer proves that the same three-way status boundary is importable and executable without credentials.

## Local validation

Run `npm run check`. The suite parses every export and verifies the disabled state, node count, human boundary and secret patterns.

## Safe import

Import a JSON file from `n8n/workflows/` into a development/test project. Keep it unpublished. Execute only with Manual Trigger. Do not attach credentials unless a future approved goal defines a test-account integration and rollback.

## Evidence

- [Ten-workflow cloud inventory](../docs/screenshots/n8n/workflow-inventory-10.png)
- [Order Intake executed](../docs/screenshots/n8n/order-intake-executed.png)
- [Service Triage executed](../docs/screenshots/n8n/service-triage-executed.png)
- [Invoice Matching executed](../docs/screenshots/n8n/invoice-match-executed.png)

Cloud editor URLs are intentionally kept out of the public repository. They are listed only in the private control-repository handoff.
