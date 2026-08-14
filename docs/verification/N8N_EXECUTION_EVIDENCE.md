# n8n execution evidence

Date: 2026-08-14

Result: **PASS - synthetic test-account integrations, unpublished and inspectable**

## Flagship cloud executions

| Control tower | Cloud execution | Result | Canvas | Human boundary |
| --- | --- | --- | --- | --- |
| Order-to-ERP Control Tower | `#30` | Succeeded in 5.802 s | 46 nodes, 5 department lanes, Groq multimodal reader, 2 Groq agents, 2 Supabase master-data tools | One pending sales approval; ERP adapter disabled |
| Service Incident Command | `#31` | Succeeded in 8.383 s | 47 nodes, 5 department lanes, Groq multimodal reader, 2 Groq agents, installed-base and error-code tools | One pending service-lead approval; ticket adapter disabled |
| Procure-to-Pay Exception Control | `#32` | Succeeded in 6.629 s | 48 nodes, 5 department lanes, Groq multimodal reader, 2 Groq agents, supplier/PO/goods-receipt tools | Two pending approvals; accounting/payment adapter disabled |

Every run used the synthetic focus case shown in the public demo. The AI steps extracted or challenged evidence; deterministic code retained control of price, safety, bank-data and release decisions.

## Supabase test-account proof

Immediately after the three successful runs, a scoped query over the three synthetic correlation IDs returned:

| Table | Rows |
| --- | ---: |
| `industrial_lab_cases` | 3 |
| `industrial_lab_agent_runs` | 3 |
| `industrial_lab_events` | 3 |
| `industrial_lab_approvals` | 4 |

The rows are synthetic audit evidence only. Master data includes the synthetic customer/article, installed-base/error-code and supplier/PO/goods-receipt records required by the demos.

## Reliability boundaries observed

- Invalid intake has an explicit quarantine route.
- Multimodal and agent failures have evidence-only fallbacks.
- Case creation is the idempotency boundary.
- Supabase failures route through classified, bounded retry handling and then an operator incident.
- Every material business result enters a human review queue.
- ERP, service-ticket and accounting target adapters are visibly disabled.
- The workflows remain unpublished and performed no production-system write.
- Exported JSON is sanitized and contains no credential reference.

## Remaining seven workflows

The other seven lab workflows remain functional deterministic prototypes with six executable synthetic routes each: happy path, recoverable exception, critical stop, invalid contract, replay-safe duplicate and bounded dependency retry. They remain deliberately lighter than the three flagships.

The previous cloud versions were not deleted. Order-to-ERP was upgraded in place; the Service and Procure-to-Pay flagships were created as separate iterations so the earlier prototypes remain recoverable.

## Visual evidence

- [`customer-order-intake-inspectable-executed.png`](../screenshots/n8n/customer-order-intake-inspectable-executed.png)
- [`machine-service-triage-inspectable-executed.png`](../screenshots/n8n/machine-service-triage-inspectable-executed.png)
- [`invoice-po-matching-inspectable-executed.png`](../screenshots/n8n/invoice-po-matching-inspectable-executed.png)
- [`workflow-inventory-10-inspectable.png`](../screenshots/n8n/workflow-inventory-10-inspectable.png)

Cloud editor URLs are recorded only in the private control-repository handoff.
