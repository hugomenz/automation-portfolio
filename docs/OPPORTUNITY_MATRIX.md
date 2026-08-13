# Industrial Automation Lab — Opportunity Matrix

Date: 2026-08-13

This matrix ranks implementation and sales hypotheses. It does **not** report customer validation. `Observed interest` and `Paid validation` remain negative until real evidence exists.

Scores use 1–5. For `Integration difficulty` and `Risk`, a higher number means easier to contain safely in an initial pilot. The 50-point total is the sum of all ten scored dimensions.

| Rank | Problem | Buyer | Frequency | Economic impact | Repetition | Data availability | Technical feasibility | Integration difficulty | Risk | Ease of explaining | Ease of selling | Market-demand evidence | Observed interest | Paid validation | Overall |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| 1 | Invoice / PO Matching | Kreditorenbuchhaltung / Einkauf | 5 | 5 | 5 | 5 | 5 | 3 | 3 | 5 | 4 | 4 | No evidence | No | 44/50 — strong current process pressure and visible failure boundary |
| 2 | Customer Order Intake | Vertriebsinnendienst / Operations | 5 | 5 | 5 | 4 | 5 | 3 | 3 | 5 | 5 | 3 | No evidence | No | 43/50 — clearest first pilot and value story |
| 3 | Machine Service Triage | Serviceleitung | 5 | 5 | 4 | 4 | 5 | 3 | 3 | 5 | 5 | 4 | No evidence | No | 43/50 — strongest machinery-specific positioning |
| 4 | Supplier Document Control | Supplier Quality / Einkauf | 4 | 4 | 5 | 5 | 5 | 4 | 4 | 4 | 4 | 3 | No evidence | No | 42/50 — easy proof, value magnitude still uncertain |
| 5 | Maintenance Report → Actions | Instandhaltung / Service Operations | 5 | 4 | 5 | 4 | 5 | 3 | 3 | 5 | 4 | 3 | No evidence | No | 41/50 — useful but overlaps service triage |
| 6 | Spare Parts Inquiry | Ersatzteilservice | 5 | 5 | 5 | 2 | 3 | 2 | 2 | 5 | 5 | 4 | No evidence | No | 38/50 — high value, hard master-data dependency |
| 7 | RFQ Prequalification | Technischer Vertrieb | 4 | 5 | 4 | 3 | 4 | 4 | 2 | 5 | 3 | 2 | No evidence | No | 36/50 — domain fit, not assumed winner |
| 8 | Trade Fair Lead Processing | Vertrieb / Sales Operations | 2 | 3 | 4 | 4 | 5 | 4 | 4 | 5 | 3 | 2 | No evidence | No | 36/50 — simple but seasonal and generic |
| 9 | Lastenheft Delta Check | Engineering / Technischer Vertrieb | 3 | 5 | 3 | 3 | 4 | 4 | 2 | 4 | 3 | 2 | No evidence | No | 33/50 — high project value, specialist review burden |
| 10 | Quality Complaint / 8D Preparation | Qualitätsleitung | 3 | 5 | 3 | 3 | 4 | 4 | 2 | 4 | 3 | 3 | No evidence | No | 34/50 — high impact, sensitive evidence boundary |

## Why the three polished demos

1. **Customer Order Intake** is the easiest business conversation: incoming order, master-data check, visible discrepancy, human release, prepared ERP payload.
2. **Machine Service Triage** best demonstrates Hugo's machinery context and a safe AI boundary: prioritise and ask for evidence without claiming root cause.
3. **Invoice / PO Matching** has a frequent buyer, structured data and a memorable stop condition: a changed IBAN must never flow through silently.

Invoice/PO has the highest raw score, while Order Intake leads the initial pilot recommendation because it better differentiates Hugo's industrial and software combination. These choices remain hypotheses until interviews, observed engagement or paid validation exist.

## Source boundary

Current primary sources are registered in the control repository at `work/SOURCES.md`. They support broad market context—service relevance, digitalisation constraints and e-invoice process pressure. They do not prove willingness to buy these exact workflows.
