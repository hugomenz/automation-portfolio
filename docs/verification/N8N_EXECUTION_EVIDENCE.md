# n8n execution evidence

Date: 2026-08-14

Result: **PASS — test-only, unpublished and inspectable**

The ten previously created Personal-project workflows were upgraded in place from the four-node proof to the detailed versioned exports. No workflow was deleted and no duplicate workflow was created.

## Imported and executed

1. `LAB 01 - Customer Order Intake - Inspectable`
2. `LAB 02 - Machine Service Triage - Inspectable`
3. `LAB 03 - Spare Parts Inquiry - Inspectable`
4. `LAB 04 - Lastenheft Delta Check - Inspectable`
5. `LAB 05 - Invoice / PO Matching - Inspectable`
6. `LAB 06 - RFQ Prequalification - Inspectable`
7. `LAB 07 - Quality Complaint / 8D Preparation - Inspectable`
8. `LAB 08 - Supplier Document Control - Inspectable`
9. `LAB 09 - Maintenance Report → Actions - Inspectable`
10. `LAB 10 - Trade Fair Lead Processing - Inspectable`

## Observed execution

For every workflow, Browser verification observed:

- 40 operational canvas nodes and 6 explanatory Sticky Notes;
- six input items emitted from the Manual Trigger;
- an invalid-contract route ending in `Terminal - Manual Data Repair`;
- a duplicate route ending in `Terminal - Replay Safe`;
- a transient dependency route ending in `Terminal - Bounded Retry Queue`;
- happy, recoverable-deviation and critical-stop items passing through domain-specific deterministic guardrails;
- three domain items reaching `Human Decision Required` and a draft-only review package;
- successful manual execution;
- a visibly disabled HTTP target adapter with no credential attached;
- no publish or activation action;
- zero production executions and zero external writes.

This execution proves the observed synthetic paths in the current n8n test project. It does not prove a real ERP, CRM, QMS, DMS, CMMS or ticket integration.

## Visual evidence

- [`workflow-inventory-10-inspectable.png`](../screenshots/n8n/workflow-inventory-10-inspectable.png)
- [`customer-order-intake-inspectable-executed.png`](../screenshots/n8n/customer-order-intake-inspectable-executed.png)
- [`machine-service-triage-inspectable-executed.png`](../screenshots/n8n/machine-service-triage-inspectable-executed.png)
- [`invoice-po-matching-inspectable-executed.png`](../screenshots/n8n/invoice-po-matching-inspectable-executed.png)

Cloud editor URLs are kept in the private control-repository handoff rather than in this public repository.
