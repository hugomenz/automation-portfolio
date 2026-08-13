# n8n execution evidence

Date: 2026-08-13

Result: **PASS — test-only and unpublished**

The signed-in Personal project was empty before this goal. The following workflows were imported from the sanitized repository JSON and executed manually:

1. `LAB 01 - Customer Order Intake`
2. `LAB 02 - Machine Service Triage`
3. `LAB 03 - Spare Parts Inquiry`
4. `LAB 04 - Lastenheft Delta Check`
5. `LAB 05 - Invoice / PO Matching`
6. `LAB 06 - RFQ Prequalification`
7. `LAB 07 - Quality Complaint / 8D Preparation`
8. `LAB 08 - Supplier Document Control`
9. `LAB 09 - Maintenance Report → Actions`
10. `LAB 10 - Trade Fair Lead Processing`

For each workflow, Browser verification observed:

- four nodes: Manual Trigger, Synthetic Fixtures, Normalize & Evaluate and Human Review Boundary;
- one input item expanding to three synthetic scenario items;
- three items reaching the Human Review Boundary;
- a successful manual execution state;
- no attached credential;
- no published trigger and no external adapter;
- `externalWritePerformed: false` in the versioned terminal output contract.

The final Personal-project list showed exactly 10 workflows. None was published or activated. The cloud trial header continued to show zero production executions.

## Visual evidence

- [`workflow-inventory-10.png`](../screenshots/n8n/workflow-inventory-10.png)
- [`order-intake-executed.png`](../screenshots/n8n/order-intake-executed.png)
- [`service-triage-executed.png`](../screenshots/n8n/service-triage-executed.png)
- [`invoice-match-executed.png`](../screenshots/n8n/invoice-match-executed.png)

Cloud editor URLs are kept in the private control-repository handoff rather than in this public repository.
