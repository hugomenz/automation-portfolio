# n8n runbook — Machine Service Triage

## Canvas contract

- Intake: Service-E-Mail + Anhänge.
- Integration status: Test-account integration.
- Human owner: Serviceleitung.
- Prepared target: Service Ticket; external adapter remains disabled.

## Test-account integrations

- Groq multimodal reader: document/image evidence extraction.
- Two Groq agents: evidence analysis and independent challenger.
- Supabase tools: read-only synthetic master data.
- Supabase writes: synthetic case, agent-run, event and pending approval audit rows.
- Credentials are selected only inside the unpublished n8n test project and are absent from this export.

## Visible recovery paths

- Invalid intake quarantine.
- Vision and agent no-claim fallback.
- Atomic case creation as the idempotency boundary.
- Classified Supabase failure with a maximum of three retry attempts.
- Operator incident after retry exhaustion.
- Mandatory human gate before the disabled Service Ticket adapter.

## Reliability evidence

The canvas separates contract validation, idempotency, dependency health, domain processing, deterministic guardrails, human decision and adapter boundary. Every terminal output includes correlation, audit state and zero production writes. Run the workflow manually while unpublished. Groq and Supabase test-account credentials are required only for the cloud proof.
