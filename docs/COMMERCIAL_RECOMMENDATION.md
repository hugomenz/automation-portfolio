# What to validate commercially first

Date: 2026-08-13

This recommendation combines current market context with implementation learning. It is a hypothesis, not evidence of customer interest. `Observed interest: none` and `Paid validation: no` apply to all three.

## 1. Customer Order Intake

**Buyer:** Leitung Vertriebsinnendienst / Operations; ERP responsibility is an important technical stakeholder.

**Why first:** The input and manual work are immediately recognisable. The value mechanism is concrete: reduce document reading, master-data lookup and copy/paste while bringing price, article and delivery exceptions forward. A first pilot can remain narrow—one order format, one business unit and an ERP draft without an automatic write.

**Best evidence:** deterministic rule engine, price-deviation and unknown-article stops, replay protection, German UI, sanitized n8n run and a 35-second demo.

**Unknowns:** actual weekly volume, master-data quality, tolerance ownership, order-channel mix and willingness to pay.

**Next validation:** show the price-deviation case to 5–8 order-processing or sales-operations leaders and ask for the last three real exception types, frequency and time-to-clarify. Do not ask whether “AI is interesting.”

## 2. Machine Service Triage

**Buyer:** Serviceleiter / After-Sales Operations.

**Why second:** It is the strongest fit with Hugo's machinery background and with VDMA's evidence that service is commercially important. The safe promise is faster, more complete routing—not diagnosis. Installed-base lookup, missing-information questions and priority are easy to inspect.

**Best evidence:** known/unknown machine cases, a safety-related stop that explicitly forbids remote diagnosis, ticket draft, source evidence and n8n execution.

**Unknowns:** service-email volume, installed-base data access, routing model, multilingual intake and where the current ticket record begins.

**Next validation:** interview service leaders using one recent anonymised intake pattern. Measure number of clarification loops and time until a technically responsible person receives a workable case.

## 3. Invoice / PO Matching

**Buyer:** Leitung Kreditorenbuchhaltung / Einkauf; finance/ERP control is a stakeholder.

**Why third:** High frequency, structured inputs and current German e-invoice pressure make the process easy to justify. Quantity and price exceptions are familiar, while the changed-IBAN case gives a memorable safety boundary. The market is more crowded and less differentiating for Hugo, so it ranks behind the two industrially distinctive cases despite the highest raw matrix score.

**Best evidence:** invoice/PO/goods-receipt comparison, mandatory IBAN stop, no master-data update, audit and manual release.

**Unknowns:** invoice volume, existing ERP capability, exception rate, fraud-control policy and competitive displacement.

**Next validation:** speak with accounts-payable and purchasing teams about unresolved exceptions rather than format ingestion. Determine whether the pain is data capture, missing goods receipt, price variance or approval routing.

## Why Spare Parts is not in the first three

Spare Parts Inquiry may have very high value and a clear service buyer, but the prototype exposed its main commercial risk: outcome quality depends on machine configuration, BOM revisions, successor relationships and technical approvals. It should move into the top three only when a target company can supply a bounded, sufficiently clean installed-base slice.

## Decision rule after validation

Promote a problem only when interviews or paid work show all of the following:

- repeated cases in the buyer's actual week;
- an identifiable exception owner;
- accessible source and master data;
- a value measure the buyer already cares about;
- a pilot boundary that avoids uncontrolled system writes;
- willingness to commit time, data and preferably budget.
