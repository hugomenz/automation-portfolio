# Entwurf 2 — Invoice / PO Matching

**Status:** Lokal, nicht veröffentlicht

20 Stück auf der Rechnung. 18 im Wareneingang.

Der Rechnungsbetrag kann rechnerisch korrekt sein und trotzdem nicht zur realen Lieferung passen.

Für eine Synthetic Demo habe ich Rechnung, Bestellung und Wareneingang als getrennte Quellen modelliert. Der Workflow vergleicht jede Position und zeigt die Abweichung dort, wo sie entsteht.

Das Ergebnis ist kein automatisches „bezahlen“ oder „nicht bezahlen“. Es ist ein prüfbarer Fall für Einkauf oder Kreditorenbuchhaltung:

– Welche Position weicht ab?
– Welche Quelle sagt was?
– Ist es eine Teillieferung, ein Buchungsrückstand oder ein Rechnungsfehler?
– Wer muss klären?

Gerade mit zunehmender E-Rechnung wird der strukturierte Eingang leichter. Die fachliche Ausnahme verschwindet dadurch nicht.

Welche Abweichung verursacht bei Ihnen mehr Arbeit: Menge, Preis oder fehlender Wareneingang?
