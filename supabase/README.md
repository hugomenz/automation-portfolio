# Supabase test-account integration

The three flagship workflows use a dedicated synthetic Supabase schema for master-data lookups and inspectable audit records.

## Tables

- `industrial_lab_master_data`: synthetic customer, article, machine, error-code, supplier, PO and goods-receipt context.
- `industrial_lab_cases`: one case per correlation ID; the unique index is the idempotency boundary.
- `industrial_lab_agent_runs`: provider/model/task/output evidence for Groq runs.
- `industrial_lab_events`: department handoffs and terminal state changes.
- `industrial_lab_approvals`: explicit pending/approved/rejected human decisions.
- `industrial_lab_documents`: optional document metadata and extracted fields.

RLS is enabled and no browser-client policy is created. The n8n credential is server-only, stored inside the unpublished test project and absent from GitHub exports. The final ERP, ticket and finance adapters remain disabled.

Apply [`migrations/20260814_industrial_lab.sql`](migrations/20260814_industrial_lab.sql) only to an isolated test project. The migration and seed data are idempotent and contain synthetic records only.
