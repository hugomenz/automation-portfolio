# Entwurf 3 — Customer Order Intake

**Status:** Lokal, nicht veröffentlicht

Was passiert, wenn dieselbe Bestellung zweimal eingeht?

In vielen Demos endet die Geschichte nach der erfolgreichen Extraktion. In realen Abläufen kommt danach eine unangenehmere Frage: Wird der Auftrag doppelt angelegt?

Der Prototyp verwendet deshalb einen Idempotenzschlüssel aus dem Eingangsereignis. Beim Replay wird kein zweiter Entwurf erzeugt. Der Lauf endet sichtbar als „Duplikat erkannt“.

Zusätzlich speichert der Auditverlauf:

– Run-ID
– Eingangsquelle
– Regelprüfungen
– Ausnahmezustand
– menschliche Entscheidung
– terminales Ergebnis

Auch hier bleibt der ERP-Adapter gemockt. Die technische Aussage ist nicht „bereit für Produktion“, sondern enger: Der Ablauf ist gebaut und reproduzierbar testbar, einschließlich Replay und Fehlerpfad.

Welche Ereignis-ID könnten Sie heute zuverlässig für eine doppelte Bestellung verwenden?
