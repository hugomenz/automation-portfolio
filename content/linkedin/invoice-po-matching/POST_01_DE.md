# Entwurf 1 — Invoice / PO Matching

**Status:** Lokal, nicht veröffentlicht

Alle Beträge passen. Trotzdem darf diese Rechnung nicht weiter.

Im synthetischen Test stimmen Lieferant, Bestellung, Positionen, Menge, Preis und Steuer. Nur die IBAN auf der Rechnung weicht vom freigegebenen Lieferantenstamm ab.

Genau deshalb endet der Lauf als „Zur manuellen Prüfung“.

Der Workflow führt einen nachvollziehbaren 3-Wege-Abgleich durch:

– Rechnung gegen Bestellung
– Menge gegen Wareneingang
– Preis gegen PO
– Steuer und Gesamtbetrag
– IBAN gegen Lieferantenstamm

Bei geänderten Bankdaten gibt es keine Toleranzregel und keine automatische Stammdatenänderung. Die Verifizierung muss über einen freigegebenen, unabhängigen Prozess erfolgen.

Die Demo schreibt weder ins ERP noch ins Finanzsystem. Sie bereitet eine Entscheidung vor und zeigt, warum die Buchung blockiert ist.

Wie wird eine neue IBAN bei Ihnen heute unabhängig verifiziert?
