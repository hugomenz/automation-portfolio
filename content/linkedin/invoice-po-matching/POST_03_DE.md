# Entwurf 3 — Invoice / PO Matching

**Status:** Lokal, nicht veröffentlicht

Eine E-Rechnung ist maschinenlesbar. Sie ist damit noch nicht automatisch richtig.

Deutschland hat den B2B-E-Rechnungsprozess schrittweise verpflichtend gemacht. Das schafft strukturierte Daten—und eine gute Gelegenheit, die Prüfung neu zu denken.

Die Demo trennt drei Ebenen:

1. Format und Pflichtfelder,
2. fachlicher Abgleich gegen PO und Wareneingang,
3. sensible Ausnahme mit menschlicher Freigabe.

Ein Adapterfehler führt in einen begrenzten Retry. Ein Replay erzeugt keinen zweiten Fall. Eine geänderte IBAN stoppt. Jeder Lauf erhält eine Run-ID und ein Audit.

Das ist noch keine produktive Finanzintegration. Es ist ein gebauter, reproduzierbarer Prozesskern mit gemocktem ERP-Adapter.

Welche Prüfregel wäre für einen ersten Pilot ausreichend eng und trotzdem wirtschaftlich relevant?
