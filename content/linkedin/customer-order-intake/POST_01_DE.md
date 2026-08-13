# Entwurf 1 — Customer Order Intake

**Status:** Lokal, nicht veröffentlicht

Ein Kundenauftrag kommt als PDF per E-Mail rein.

Jemand prüft Kundennummer, Artikel, Preis, Menge, Liefertermin und Adresse. Danach werden die Daten ins ERP übertragen.

Das Problem ist nicht nur das Copy/Paste. Kritisch wird es dort, wo eine Zeile plausibel aussieht, aber nicht zum Stammdatensatz passt.

Für eine Synthetic Demo habe ich den Ablauf deshalb nicht als automatische ERP-Buchung gebaut, sondern als prüfbare Vorbereitung:

– Bestelldaten strukturieren
– Artikel und Preise gegen synthetische Stammdaten prüfen
– fehlende Angaben markieren
– jede Abweichung mit Quelle anzeigen
– einen ERP-Payload vorbereiten
– Freigabe beim Menschen lassen

Im Happy Path spart das Such- und Übertragungsarbeit. Im wichtigen Fall stoppt das System.

Kein „autonomer Agent“. Kein erfundener Liefertermin. Keine stille Buchung.

Wo entstehen bei Ihnen die meisten Rückfragen: Artikel, Preis oder Liefertermin?
