export const implementationLabels = {
  built: 'Built and testable',
  test: 'Test-account integration',
  mocked: 'Mocked adapter',
  architecture: 'Architecture only',
  planned: 'Planned',
};

const common = {
  status: implementationLabels.built,
  adapterStatus: implementationLabels.mocked,
  evidenceType: 'Synthetic Demo',
  customerValidation: 'Nicht validiert',
};

export const workflows = [
  {
    ...common,
    id: 'order-intake',
    code: 'ORD',
    slug: 'customer-order-intake',
    number: '01',
    title: 'Auftragseingang prüfen',
    englishTitle: 'Customer Order Intake',
    eyebrow: 'Vertriebsinnendienst · Auftragssachbearbeitung',
    buyer: 'Leitung Vertriebsinnendienst / Operations',
    problem: 'Bestellungen kommen per E-Mail, PDF oder Excel. Artikel, Preis, Menge, Termin und Lieferadresse werden manuell gegen Stammdaten geprüft und ins ERP übertragen.',
    improvement: 'Weniger Copy/Paste, früh sichtbare Abweichungen und ein nachvollziehbarer ERP-Entwurf statt einer blinden Buchung.',
    sourceSystem: 'E-Mail + Bestelldokument',
    systemOfRecord: 'ERP bleibt führend',
    polished: true,
    adapterStatus: implementationLabels.test,
    controlTower: {
      name: 'Order-to-ERP Control Tower',
      proposition: 'Ein Kundenauftrag wird gelesen, gegen Stammdaten und Preise geprüft und als freigabefähiger ERP-Entwurf zwischen Vertrieb, Planung und Logistik übergeben.',
      focusScenario: 'price-deviation',
      sourceAsset: 'order-price-deviation.png',
      sourcePdf: 'order-price-deviation.pdf',
      sourceName: 'PO_900144.pdf',
      sourceMeta: '1 Seite · synthetisch · 99 KB',
      agents: ['Groq Multimodal Evidence Reader', 'Commercial Evidence Agent', 'Fulfilment Challenger Agent'],
      departments: [
        { name: 'Vertrieb', detail: 'Kunde + Preis', tone: 'sales' },
        { name: 'Stammdaten', detail: 'Artikel + Kondition', tone: 'data' },
        { name: 'Planung', detail: 'Termin + Kapazität', tone: 'planning' },
        { name: 'Logistik', detail: 'Ship-to', tone: 'logistics' },
        { name: 'Order Mgmt.', detail: 'Freigabe', tone: 'human' },
      ],
    },
    marketSignal: 'Wiederholbarer Backoffice-Prozess; allgemeine Mittelstandsquellen stützen pragmatische Workflow-Digitalisierung. Noch keine Käuferinterviews.',
    assessment: 'Sehr gut erklärbar und mit vorhandenen Dokumenten schnell pilotierbar.',
    scores: { frequency: 5, impact: 5, repetition: 5, data: 4, feasibility: 5, integration: 3, risk: 3, explain: 5, sell: 5, demand: 3 },
    scenarios: [
      {
        id: 'clean-order',
        label: 'Passender Auftrag',
        kind: 'happy',
        description: 'Bekannter Kunde, zwei bekannte Artikel und Preise innerhalb der Toleranz.',
        input: {
          eventId: 'ORD-DEMO-1001', receivedAt: '2026-08-12T08:14:00Z', document: 'Bestellung_4500815.pdf',
          customer: { name: 'Musterwerk Süd GmbH', number: 'K-1042', address: 'Werkstraße 18, 70191 Stuttgart' },
          orderNumber: '4500815', deliveryDate: '2026-09-18', shipTo: 'Tor 3, Werkstraße 18, 70191 Stuttgart', terms: '30 Tage netto',
          items: [
            { sku: 'HM-AX-240', description: 'Achseinheit 240', quantity: 2, unitPrice: 1280, masterPrice: 1280 },
            { sku: 'HM-SEN-18', description: 'Näherungssensor M18', quantity: 6, unitPrice: 84.5, masterPrice: 84.5 },
          ],
          evidence: [{ source: 'Bestellung_4500815.pdf', page: 1, field: 'Bestellnummer, Kunde, Liefertermin' }, { source: 'Bestellung_4500815.pdf', page: 2, field: 'Positionen und Preise' }],
        },
      },
      {
        id: 'price-deviation',
        label: 'Preisabweichung',
        kind: 'edge',
        description: 'Ein bekannter Artikel liegt 8,1 % unter dem ERP-Stammpreis.',
        input: {
          eventId: 'ORD-DEMO-1002', receivedAt: '2026-08-12T09:05:00Z', document: 'PO_900144.xlsx',
          customer: { name: 'Neckar Montagebau GmbH', number: 'K-1088', address: 'Industriestraße 4, 71638 Ludwigsburg' },
          orderNumber: '900144', deliveryDate: '2026-09-04', shipTo: 'Industriestraße 4, 71638 Ludwigsburg', terms: '45 Tage netto',
          items: [{ sku: 'HM-GRD-500', description: 'Schutzgitter 500', quantity: 10, unitPrice: 221, masterPrice: 240.5 }],
          evidence: [{ source: 'PO_900144.xlsx', page: 'Tabelle 1', field: 'Position 10' }],
        },
      },
      {
        id: 'unknown-item',
        label: 'Unbekannter Artikel',
        kind: 'error',
        description: 'Die Kundenreferenz lässt sich keinem freigegebenen Artikel zuordnen.',
        input: {
          eventId: 'ORD-DEMO-1003', receivedAt: '2026-08-12T10:22:00Z', document: 'Bestellung_7719.pdf',
          customer: { name: 'Alb Automationssysteme GmbH', number: 'K-1097', address: 'Talweg 7, 72764 Reutlingen' },
          orderNumber: '7719', deliveryDate: null, shipTo: 'Talweg 7, 72764 Reutlingen', terms: '30 Tage netto',
          items: [{ sku: 'CUSTOM-LINE-7B', description: 'Sonderhalter laut letzter Anlage', quantity: 4, unitPrice: 310, masterPrice: null }],
          evidence: [{ source: 'Bestellung_7719.pdf', page: 1, field: 'Position 1' }],
        },
      },
    ],
  },
  {
    ...common,
    id: 'service-triage',
    code: 'SRV',
    slug: 'machine-service-triage',
    number: '02',
    title: 'Serviceanfrage vorsortieren',
    englishTitle: 'Machine Service Triage',
    eyebrow: 'Serviceleitung · Technischer Kundendienst',
    buyer: 'Serviceleiter / After-Sales Operations',
    problem: 'Eine Störungsmeldung enthält oft unvollständige Maschinenangaben, freie Fehlertexte und Anhänge. Bis ein Techniker übernehmen kann, gehen Rückfragen und Kontextsuche hin und her.',
    improvement: 'Schnellere, nachvollziehbare Triage mit fehlenden Angaben, Priorität und Zuständigkeit—ohne eine technische Ursache zu behaupten.',
    sourceSystem: 'Service-E-Mail + Anhänge',
    systemOfRecord: 'Service-/Ticketsystem bleibt führend',
    polished: true,
    adapterStatus: implementationLabels.test,
    controlTower: {
      name: 'Service Incident Command',
      proposition: 'E-Mail und HMI-Foto werden als Evidenz gelesen, mit Installed Base und Fehlercode-Kontext verbunden und ohne Ferndiagnose an die richtigen Rollen übergeben.',
      focusScenario: 'known-machine',
      sourceAsset: 'service-email-e217.png',
      sourcePdf: 'service-email-e217.pdf',
      sourceImage: 'service-hmi-e217.png',
      sourceName: 'Service-Mail + panel-e217.jpg',
      sourceMeta: 'E-Mail · Foto · synthetisch',
      agents: ['Groq Vision Reader', 'Incident Context Agent', 'Safety Challenger Agent'],
      departments: [
        { name: 'Service Desk', detail: 'Intake + Priorität', tone: 'sales' },
        { name: 'Installed Base', detail: 'Maschine + Historie', tone: 'data' },
        { name: 'Engineering', detail: 'Evidenz prüfen', tone: 'planning' },
        { name: 'Ersatzteile', detail: 'Kandidaten', tone: 'logistics' },
        { name: 'Serviceleitung', detail: 'Triage', tone: 'human' },
      ],
    },
    marketSignal: 'VDMA beschreibt Service als wesentlichen Umsatzbeitrag im Maschinenbau. Noch keine Käuferinterviews für diesen konkreten Workflow.',
    assessment: 'Starker Maschinenbau-Fit und sichtbarer Nutzen bei sicherer Begrenzung auf Triage.',
    scores: { frequency: 5, impact: 5, repetition: 4, data: 4, feasibility: 5, integration: 3, risk: 3, explain: 5, sell: 5, demand: 4 },
    scenarios: [
      {
        id: 'known-machine', label: 'Maschine erkannt', kind: 'happy', description: 'Seriennummer, Fehlercode und Foto reichen für eine priorisierte Übergabe.',
        input: { eventId: 'SRV-DEMO-2001', receivedAt: '2026-08-12T06:40:00Z', sender: 'instandhaltung@musterwerk.example', machineNumber: 'MX-24-0187', subject: 'Anlage stoppt beim Referenzieren', errorCodes: ['E-217'], symptoms: 'Achse Y referenziert nicht; Neustart ohne Änderung.', attachments: ['panel-e217.jpg', 'servicebericht-2025-11.pdf'], productionStopped: true, safetyConcern: false, machine: { family: 'Montagezelle MX-24', site: 'Werk Stuttgart', warranty: 'bis 2027-02-28', lastService: '2025-11-14' }, evidence: [{ source: 'E-Mail', field: 'Seriennummer und Ausfall' }, { source: 'panel-e217.jpg', field: 'Fehlercode E-217' }] },
      },
      {
        id: 'missing-machine', label: 'Maschine unklar', kind: 'edge', description: 'Der Kunde nennt nur eine interne Linienbezeichnung.',
        input: { eventId: 'SRV-DEMO-2002', receivedAt: '2026-08-12T07:20:00Z', sender: 'technik@alb-demo.example', machineNumber: null, internalLine: 'Linie 3 / Presse links', subject: 'Druck fällt sporadisch ab', errorCodes: [], symptoms: 'Nach ca. 20 Minuten fällt der Druck ab.', attachments: ['druckanzeige.jpg'], productionStopped: false, safetyConcern: false, machine: null, evidence: [{ source: 'E-Mail', field: 'Linie 3' }, { source: 'druckanzeige.jpg', field: 'sichtbarer Messwert' }] },
      },
      {
        id: 'safety-stop', label: 'Sicherheitsrelevanter Hinweis', kind: 'error', description: 'Ein Schutzkreis-Hinweis erzwingt sofortige manuelle Eskalation.',
        input: { eventId: 'SRV-DEMO-2003', receivedAt: '2026-08-12T07:43:00Z', sender: 'schichtleitung@demoform.example', machineNumber: 'MX-22-0091', subject: 'Schutztürmeldung nach Umbau', errorCodes: ['S-044'], symptoms: 'Meldung nach mechanischem Umbau; Produktion pausiert.', attachments: [], productionStopped: true, safetyConcern: true, machine: { family: 'Prüfzelle PX-8', site: 'Werk Heilbronn', warranty: 'abgelaufen', lastService: '2024-04-09' }, evidence: [{ source: 'E-Mail', field: 'Umbau und Schutztürmeldung' }] },
      },
    ],
  },
  {
    ...common,
    id: 'spare-parts', code: 'SPR', slug: 'spare-parts-inquiry', number: '03', title: 'Ersatzteilanfrage klären', englishTitle: 'Spare Parts Inquiry', eyebrow: 'Ersatzteilservice · After-Sales', buyer: 'Leitung Ersatzteilservice',
    problem: 'Kunden fragen mit Freitext, Foto oder Maschinenreferenz nach einem Ersatzteil. Varianten, Nachfolger und unvollständige BOM-Daten machen eine automatische Auswahl riskant.',
    improvement: 'Kandidaten, BOM-Quelle, Nachfolger und synthetische Verfügbarkeit werden vorbereitet; bei Mehrdeutigkeit stoppt der Prozess.', sourceSystem: 'E-Mail / Foto / Maschinennummer', systemOfRecord: 'BOM und ERP bleiben führend', polished: false,
    marketSignal: 'VDMA bezeichnet Ersatzteile als Rückgrat des Servicegeschäfts. Die konkrete Datenqualität ist noch unbekannt.', assessment: 'Hoher Wert, aber stark abhängig von BOM-, Varianten- und Nachfolgerdaten.',
    scores: { frequency: 5, impact: 5, repetition: 5, data: 2, feasibility: 3, integration: 2, risk: 2, explain: 5, sell: 5, demand: 4 },
    scenarios: [
      { id: 'unique-part', label: 'Eindeutiger Treffer', kind: 'happy', description: 'Maschine und Positionsnummer ergeben genau einen freigegebenen Kandidaten.', input: { eventId: 'SPR-DEMO-3001', machineNumber: 'MX-24-0187', query: 'Sensor an Position B-17', photo: 'sensor-b17.jpg', candidates: [{ part: 'HM-SEN-18', label: 'Näherungssensor M18', confidence: 0.97, bom: 'MX-24 Rev. C / B-17', successor: null, stock: 12 }], evidence: [{ source: 'BOM MX-24 Rev. C', field: 'Position B-17' }] } },
      { id: 'ambiguous-part', label: 'Zwei mögliche Varianten', kind: 'edge', description: 'Foto und Text passen zu zwei Spannungsvarianten.', input: { eventId: 'SPR-DEMO-3002', machineNumber: 'PX-8-0091', query: 'Ventil an der Wartungseinheit', photo: 'valve-closeup.jpg', candidates: [{ part: 'HM-VLV-24', label: 'Magnetventil 24 V', confidence: 0.71, bom: 'PX-8 Rev. B / P-08', stock: 4 }, { part: 'HM-VLV-230', label: 'Magnetventil 230 V', confidence: 0.68, bom: 'PX-8 Rev. A / P-08', stock: 1 }], evidence: [{ source: 'Foto', field: 'Bauform; Typenschild nicht lesbar' }] } },
      { id: 'obsolete-part', label: 'Abgekündigtes Teil', kind: 'error', description: 'Ein möglicher Nachfolger ist vorhanden, aber nicht technisch freigegeben.', input: { eventId: 'SPR-DEMO-3003', machineNumber: 'AS-17-0033', query: 'HMI Panel 7 Zoll', photo: null, candidates: [{ part: 'HM-HMI-07A', label: 'HMI 7 Zoll Gen. 1', confidence: 0.93, bom: 'AS-17 Rev. A / E-02', successor: 'HM-HMI-07C', successorApproved: false, stock: 0 }], evidence: [{ source: 'BOM AS-17 Rev. A', field: 'E-02' }, { source: 'Nachfolgerliste', field: 'ungeprüfter Kandidat HM-HMI-07C' }] } },
    ],
  },
  {
    ...common,
    id: 'spec-delta', code: 'LST', slug: 'lastenheft-delta-check', number: '04', title: 'Lastenheft-Deltas sichtbar machen', englishTitle: 'Lastenheft Delta Check', eyebrow: 'Engineering · Technischer Vertrieb', buyer: 'Leitung Engineering / Technischer Vertrieb',
    problem: 'Kundenanforderungen und interne Standards werden seitenweise verglichen. Abweichungen, Widersprüche und fehlende Angaben müssen mit Quelle belegbar bleiben.', improvement: 'Eine prüfbare Anforderungsmatrix mit Seite, Delta, Risiko und offenen Fragen statt eines unverbundenen Text-Summaries.', sourceSystem: 'Lastenheft + interner Standard', systemOfRecord: 'Freigegebene Anforderungsmatrix', polished: false,
    marketSignal: 'Hoher Projektwert ist plausibel, aber Frequenz und Kaufbereitschaft sind noch nicht belegt.', assessment: 'Wertvoll bei komplexen Projekten, jedoch weniger häufig und fachlich risikoreich.', scores: { frequency: 3, impact: 5, repetition: 3, data: 3, feasibility: 4, integration: 4, risk: 2, explain: 4, sell: 3, demand: 2 },
    scenarios: [
      { id: 'bounded-delta', label: 'Klare Abweichungen', kind: 'happy', description: 'Drei Anforderungen lassen sich eindeutig gegen den Standard stellen.', input: { eventId: 'LST-DEMO-4001', customerSpec: 'Lastenheft_Musterlinie.pdf', internalStandard: 'Werksstandard_WS-04.pdf', requirements: [{ id: 'R-12', text: 'Taktzeit ≤ 18 s', page: 8, standard: '≤ 20 s', state: 'delta' }, { id: 'R-27', text: 'Profinet-Schnittstelle', page: 14, standard: 'Profinet vorgesehen', state: 'match' }, { id: 'R-41', text: 'Schaltschrank IP54', page: 22, standard: 'IP54', state: 'match' }], evidence: [{ source: 'Lastenheft_Musterlinie.pdf', page: 8, field: 'R-12' }] } },
      { id: 'missing-acceptance', label: 'Abnahmekriterium fehlt', kind: 'edge', description: 'Eine Leistungsanforderung hat kein messbares Abnahmekriterium.', input: { eventId: 'LST-DEMO-4002', customerSpec: 'Lastenheft_Prüfzelle.pdf', internalStandard: 'Werksstandard_WS-04.pdf', requirements: [{ id: 'R-08', text: 'Hohe Prüfgenauigkeit', page: 6, standard: 'Messunsicherheit angeben', state: 'missing-measure' }, { id: 'R-19', text: 'CSV-Export', page: 11, standard: 'CSV oder OPC UA', state: 'match' }], evidence: [{ source: 'Lastenheft_Prüfzelle.pdf', page: 6, field: 'R-08' }] } },
      { id: 'contradiction', label: 'Widersprüchliche Taktzeit', kind: 'error', description: 'Zwei Seiten nennen unterschiedliche Taktzeiten.', input: { eventId: 'LST-DEMO-4003', customerSpec: 'Lastenheft_Linie7.pdf', internalStandard: 'Werksstandard_WS-04.pdf', requirements: [{ id: 'R-03', text: 'Taktzeit 12 s', page: 3, standard: '≤ 20 s', state: 'contradiction', conflictsWith: 'R-44: Taktzeit 15 s auf Seite 28' }], evidence: [{ source: 'Lastenheft_Linie7.pdf', page: 3, field: 'R-03' }, { source: 'Lastenheft_Linie7.pdf', page: 28, field: 'R-44' }] } },
    ],
  },
  {
    ...common,
    id: 'invoice-match', code: 'INV', slug: 'invoice-po-matching', number: '05', title: 'Rechnung gegen Bestellung prüfen', englishTitle: 'Invoice / PO Matching', eyebrow: 'Finance · Einkauf', buyer: 'Leitung Kreditorenbuchhaltung / Einkauf',
    problem: 'Lieferantenrechnung, Bestellung und Wareneingang müssen auf Preis, Menge, Steuer und Bankdaten abgeglichen werden. Sensible Abweichungen dürfen nicht durchrutschen.', improvement: 'Schnellere Dreifachprüfung mit sichtbaren Quellen; IBAN-Änderungen und unklare Abweichungen stoppen immer.', sourceSystem: 'E-Rechnung / PDF + PO + Wareneingang', systemOfRecord: 'ERP/Finanzsystem bleibt führend', polished: true,
    adapterStatus: implementationLabels.test,
    controlTower: {
      name: 'Procure-to-Pay Exception Control',
      proposition: 'Rechnung, Bestellung, Wareneingang und Lieferantenstamm werden getrennt gelesen, abgeglichen und bei Bankdatenänderung zwingend an Einkauf und Finance gestoppt.',
      focusScenario: 'iban-change',
      sourceAsset: 'invoice-iban-change.png',
      sourcePdf: 'invoice-iban-change.pdf',
      sourceName: 'RE-2026-0824.pdf',
      sourceMeta: '1 Seite · synthetisch · 97 KB',
      agents: ['Groq Multimodal Evidence Reader', 'Three-Way Match Agent', 'Payment Fraud Challenger Agent'],
      departments: [
        { name: 'Kreditoren', detail: 'Rechnung + Steuer', tone: 'sales' },
        { name: 'Einkauf', detail: 'PO + Lieferant', tone: 'data' },
        { name: 'Wareneingang', detail: 'Menge', tone: 'planning' },
        { name: 'Treasury', detail: 'Bankdaten', tone: 'logistics' },
        { name: 'Finance', detail: 'Doppelfreigabe', tone: 'human' },
      ],
    },
    marketSignal: 'Die deutsche B2B-E-Rechnung schafft aktuellen Prozessdruck; das beweist noch keine Nachfrage nach genau dieser Lösung.', assessment: 'Sehr häufig, gut messbar und mit starkem Failure-Post rund um Bankdaten.', scores: { frequency: 5, impact: 5, repetition: 5, data: 5, feasibility: 5, integration: 3, risk: 3, explain: 5, sell: 4, demand: 4 },
    scenarios: [
      { id: 'three-way-match', label: '3-Wege-Match', kind: 'happy', description: 'Rechnung, PO und Wareneingang stimmen überein.', input: { eventId: 'INV-DEMO-5001', invoice: { number: 'RE-2026-0814', supplier: 'Demo Komponenten GmbH', supplierId: 'L-2044', po: 'PO-78031', net: 4820, tax: 915.8, gross: 5735.8, iban: 'DE02100100100000000002', items: [{ sku: 'KUG-25', quantity: 20, unitPrice: 241 }] }, purchaseOrder: { number: 'PO-78031', supplierId: 'L-2044', items: [{ sku: 'KUG-25', quantity: 20, unitPrice: 241 }] }, goodsReceipt: { po: 'PO-78031', items: [{ sku: 'KUG-25', quantity: 20 }] }, supplierMaster: { iban: 'DE02100100100000000002' }, evidence: [{ source: 'XRechnung_RE-2026-0814.xml', field: 'Beträge und IBAN' }, { source: 'ERP PO-78031', field: 'Bestellposition' }] } },
      { id: 'quantity-delta', label: 'Mengenabweichung', kind: 'edge', description: 'Die Rechnung enthält 20 Stück, im Wareneingang sind 18 gebucht.', input: { eventId: 'INV-DEMO-5002', invoice: { number: 'RE-2026-0820', supplier: 'Fiktiv Antriebstechnik KG', supplierId: 'L-2077', po: 'PO-78109', net: 3200, tax: 608, gross: 3808, iban: 'DE02100100100000000003', items: [{ sku: 'MOT-075', quantity: 20, unitPrice: 160 }] }, purchaseOrder: { number: 'PO-78109', supplierId: 'L-2077', items: [{ sku: 'MOT-075', quantity: 20, unitPrice: 160 }] }, goodsReceipt: { po: 'PO-78109', items: [{ sku: 'MOT-075', quantity: 18 }] }, supplierMaster: { iban: 'DE02100100100000000003' }, evidence: [{ source: 'RE-2026-0820.pdf', field: 'Position 1' }, { source: 'ERP Wareneingang', field: '18 Stück' }] } },
      { id: 'iban-change', label: 'Geänderte IBAN', kind: 'error', description: 'Alle Beträge passen, aber die Rechnungs-IBAN weicht vom Lieferantenstamm ab.', input: { eventId: 'INV-DEMO-5003', invoice: { number: 'RE-2026-0824', supplier: 'Muster Pneumatik GmbH', supplierId: 'L-2091', po: 'PO-78133', net: 940, tax: 178.6, gross: 1118.6, iban: 'DE02100100100000000999', items: [{ sku: 'VLV-24', quantity: 10, unitPrice: 94 }] }, purchaseOrder: { number: 'PO-78133', supplierId: 'L-2091', items: [{ sku: 'VLV-24', quantity: 10, unitPrice: 94 }] }, goodsReceipt: { po: 'PO-78133', items: [{ sku: 'VLV-24', quantity: 10 }] }, supplierMaster: { iban: 'DE02100100100000000004' }, evidence: [{ source: 'RE-2026-0824.pdf', field: 'IBAN' }, { source: 'Lieferantenstamm L-2091', field: 'freigegebene IBAN' }] } },
    ],
  },
  {
    ...common,
    id: 'rfq-prequal', code: 'RFQ', slug: 'rfq-prequalification', number: '06', title: 'Anfrage vorqualifizieren', englishTitle: 'RFQ Prequalification', eyebrow: 'Technischer Vertrieb · Angebotswesen', buyer: 'Leitung technischer Vertrieb',
    problem: 'Anfragen verteilen technische Anforderungen über E-Mail und Anhänge. Fehlende Angaben und Widersprüche werden oft erst spät sichtbar.', improvement: 'Vollständigkeit, Widersprüche, Quellen und Rückfragen werden vorbereitet—ohne Preis oder technische Machbarkeit zu erfinden.', sourceSystem: 'RFQ-E-Mail + Dokumente', systemOfRecord: 'CRM/Angebotsakte bleibt führend', polished: false,
    marketSignal: 'Bestehende Hugo-Prototypen liefern technische Evidenz; kommerzielle Validierung fehlt.', assessment: 'Guter Domain-Fit, aber bewusst nur ein Experiment unter mehreren.', scores: { frequency: 4, impact: 5, repetition: 4, data: 3, feasibility: 4, integration: 4, risk: 2, explain: 5, sell: 3, demand: 2 },
    scenarios: [
      { id: 'complete-rfq', label: 'Vollständige Anfrage', kind: 'happy', description: 'Kernanforderungen und Quellen sind vorhanden.', input: { eventId: 'RFQ-DEMO-6001', request: 'Montagezelle für Ventilbaugruppe', quantityPerYear: 180000, cycleTimeSeconds: 16, interfaces: ['Profinet', 'OPC UA'], targetSop: '2027-05-01', requirements: 14, contradictions: [], missing: [], evidence: [{ source: 'RFQ_Montagezelle.pdf', page: 4, field: 'Taktzeit' }] } },
      { id: 'missing-volume', label: 'Menge und SOP fehlen', kind: 'edge', description: 'Eine belastbare Vorprüfung braucht zwei Rückfragen.', input: { eventId: 'RFQ-DEMO-6002', request: 'Prüfstation für Gehäuse', quantityPerYear: null, cycleTimeSeconds: 22, interfaces: ['CSV'], targetSop: null, requirements: 8, contradictions: [], missing: ['Jahresmenge', 'Ziel-SOP'], evidence: [{ source: 'Anfrage_E-Mail', field: 'Taktzeit' }] } },
      { id: 'conflicting-cycle', label: 'Taktzeit widersprüchlich', kind: 'error', description: 'E-Mail und Lastenheft nennen unterschiedliche Werte.', input: { eventId: 'RFQ-DEMO-6003', request: 'Verkettete Prüflinie', quantityPerYear: 240000, cycleTimeSeconds: 12, interfaces: ['Profinet'], targetSop: '2027-02-01', requirements: 21, contradictions: ['E-Mail: 12 s; Lastenheft Seite 9: 15 s'], missing: [], evidence: [{ source: 'E-Mail', field: '12 s' }, { source: 'Lastenheft.pdf', page: 9, field: '15 s' }] } },
    ],
  },
  {
    ...common,
    id: 'quality-8d', code: 'QLT', slug: 'quality-complaint-8d', number: '07', title: '8D-Vorbereitung strukturieren', englishTitle: 'Quality Complaint / 8D Preparation', eyebrow: 'Qualität · Reklamationsmanagement', buyer: 'Qualitätsleitung',
    problem: 'Reklamationen starten mit unvollständigen Angaben. Sofortmaßnahmen, Verantwortliche und Nachweise müssen strukturiert werden, bevor eine Ursachenanalyse belastbar ist.', improvement: 'Ein prüfbares 8D-Arbeitsgerüst mit fehlenden Nachweisen und Containment—ohne Root Cause zu erfinden.', sourceSystem: 'Reklamation + Fotos/Messdaten', systemOfRecord: 'QMS bleibt führend', polished: false,
    marketSignal: 'Klarer etablierter Qualitätsprozess; konkrete Frequenz und Budgetbereitschaft sind unbekannt.', assessment: 'Wertvoll, aber hohe fachliche Verantwortung und oft geringere Fallzahl.', scores: { frequency: 3, impact: 5, repetition: 3, data: 3, feasibility: 4, integration: 4, risk: 2, explain: 4, sell: 3, demand: 3 },
    scenarios: [
      { id: 'contained-complaint', label: 'Containment vorbereitet', kind: 'happy', description: 'Charge, Bild und Messwert sind vorhanden; Ursache bleibt offen.', input: { eventId: 'QLT-DEMO-7001', complaint: 'Bohrungsdurchmesser außerhalb Toleranz', product: 'Trägerplatte TP-44', lot: 'L-260812-A', quantityAffected: 7, evidenceFiles: ['messprotokoll.csv', 'teilfoto.jpg'], containment: ['Bestand L-260812-A sperren', '100%-Prüfung vorbereiten'], rootCause: null, missing: [] } },
      { id: 'missing-lot', label: 'Charge fehlt', kind: 'edge', description: 'Ohne Charge kann der betroffene Bestand nicht abgegrenzt werden.', input: { eventId: 'QLT-DEMO-7002', complaint: 'Kratzer auf Sichtfläche', product: 'Blende B-12', lot: null, quantityAffected: 4, evidenceFiles: ['foto1.jpg'], containment: ['Versandstopp für ungeklärte Blenden prüfen'], rootCause: null, missing: ['Charge / Lieferlos'] } },
      { id: 'root-cause-claim', label: 'Unbelegte Ursache im Freitext', kind: 'error', description: 'Eine behauptete Ursache wird als Hypothese markiert, nicht übernommen.', input: { eventId: 'QLT-DEMO-7003', complaint: 'Stecker löst sich im Betrieb', product: 'Kabelsatz KS-8', lot: 'L-260801-C', quantityAffected: 2, evidenceFiles: [], containment: ['Betroffene Lieferung identifizieren'], rootCause: 'Bestimmt Montagefehler beim Lieferanten', rootCauseEvidence: null, missing: ['Ausfallteil', 'Prüfergebnis'] } },
    ],
  },
  {
    ...common,
    id: 'supplier-docs', code: 'DOC', slug: 'supplier-document-control', number: '08', title: 'Lieferantendokumente überwachen', englishTitle: 'Supplier Document Control', eyebrow: 'Einkauf · Qualität · Dokumentation', buyer: 'Supplier Quality / Strategischer Einkauf',
    problem: 'Zertifikate, Erklärungen und Kalibrierungen liegen in Ordnern und Postfächern. Version, Ablauf und fehlende Dokumente werden manuell verfolgt.', improvement: 'Klassifikation, Lieferant, Version und Frist werden in eine prüfbare Ausnahmeliste überführt.', sourceSystem: 'Lieferantendokumente', systemOfRecord: 'DMS/QMS bleibt führend', polished: false,
    marketSignal: 'Aktuelle EU-Regeln erhöhen den Stellenwert maschinenlesbarer Produkt- und Konformitätsinformationen; kein Käuferinterview.', assessment: 'Datenverfügbar und risikoarm zu demonstrieren; wirtschaftlicher Impact muss validiert werden.', scores: { frequency: 4, impact: 4, repetition: 5, data: 5, feasibility: 5, integration: 4, risk: 4, explain: 4, sell: 4, demand: 3 },
    scenarios: [
      { id: 'valid-docs', label: 'Dokumentensatz vollständig', kind: 'happy', description: 'Alle erwarteten Dokumente sind gültig und versioniert.', input: { eventId: 'DOC-DEMO-8001', supplier: 'Demo Sensorik GmbH', expected: ['ISO 9001', 'RoHS', 'Kalibrierschein'], documents: [{ type: 'ISO 9001', version: '2025-2', validUntil: '2027-06-30' }, { type: 'RoHS', version: '2026-1', validUntil: '2028-01-31' }, { type: 'Kalibrierschein', version: 'K-260711', validUntil: '2027-07-11' }] } },
      { id: 'expiring-cert', label: 'Zertifikat läuft ab', kind: 'edge', description: 'Ein Zertifikat läuft innerhalb von 30 Tagen ab.', input: { eventId: 'DOC-DEMO-8002', supplier: 'Fiktiv Messtechnik KG', expected: ['ISO 9001', 'Kalibrierschein'], referenceDate: '2026-08-13', documents: [{ type: 'ISO 9001', version: '2024-1', validUntil: '2026-09-02' }, { type: 'Kalibrierschein', version: 'K-260101', validUntil: '2027-01-01' }] } },
      { id: 'missing-declaration', label: 'Erklärung fehlt', kind: 'error', description: 'Die erwartete RoHS-Erklärung ist nicht im Satz enthalten.', input: { eventId: 'DOC-DEMO-8003', supplier: 'Muster Kabeltechnik GmbH', expected: ['ISO 9001', 'RoHS'], documents: [{ type: 'ISO 9001', version: '2025-4', validUntil: '2028-04-20' }] } },
    ],
  },
  {
    ...common,
    id: 'maintenance-actions', code: 'MNT', slug: 'maintenance-report-actions', number: '09', title: 'Wartungsbericht in Maßnahmen überführen', englishTitle: 'Maintenance Report → Actions', eyebrow: 'Instandhaltung · Service Operations', buyer: 'Instandhaltungsleitung / Service Operations',
    problem: 'Freitextberichte enthalten Befunde, Ersatzteile und offene Arbeiten. Ohne klare Maßnahmen, Verantwortliche und Fristen verschwinden Punkte in PDFs.', improvement: 'Befunde werden mit Quelle in priorisierte Maßnahmen überführt; unklare Schweregrade bleiben zur Prüfung offen.', sourceSystem: 'Technikerbericht', systemOfRecord: 'CMMS/Ticketsystem bleibt führend', polished: false,
    marketSignal: 'Prozess ist wiederholbar und service-nah; konkrete Nachfrage ist nicht belegt.', assessment: 'Sehr anschlussfähig an Service, aber nahe an der Service-Triage und daher zunächst sekundär.', scores: { frequency: 5, impact: 4, repetition: 5, data: 4, feasibility: 5, integration: 3, risk: 3, explain: 5, sell: 4, demand: 3 },
    scenarios: [
      { id: 'clear-findings', label: 'Klare Maßnahmen', kind: 'happy', description: 'Zwei Befunde enthalten Schweregrad, Teil und Frist.', input: { eventId: 'MNT-DEMO-9001', report: 'Wartung_MX-24-0187.pdf', machineNumber: 'MX-24-0187', findings: [{ text: 'Führungswagen Y zeigt erhöhtes Spiel', severity: 'mittel', part: 'HM-LIN-25', owner: 'Mechanik', deadline: '2026-09-05' }, { text: 'Filtermatte Schaltschrank verschmutzt', severity: 'niedrig', part: 'HM-FLT-300', owner: 'Instandhaltung', deadline: '2026-08-20' }] } },
      { id: 'missing-owner', label: 'Verantwortung offen', kind: 'edge', description: 'Ein Befund hat eine Frist, aber keine Zuständigkeit.', input: { eventId: 'MNT-DEMO-9002', report: 'Service_PX8.pdf', machineNumber: 'PX-8-0091', findings: [{ text: 'Druckregler schwankt außerhalb Sollbereich', severity: 'hoch', part: 'HM-REG-08', owner: null, deadline: '2026-08-18' }] } },
      { id: 'unclear-severity', label: 'Schweregrad unklar', kind: 'error', description: 'Der Bericht nennt einen Riss, aber keine Lage oder Sicherheitsbewertung.', input: { eventId: 'MNT-DEMO-9003', report: 'Wartung_AS17.pdf', machineNumber: 'AS-17-0033', findings: [{ text: 'Riss an Halterung festgestellt', severity: null, part: null, owner: null, deadline: null }] } },
    ],
  },
  {
    ...common,
    id: 'trade-fair-lead', code: 'LEAD', slug: 'trade-fair-lead-processing', number: '10', title: 'Messekontakt sauber nachbereiten', englishTitle: 'Trade Fair Lead Processing', eyebrow: 'Vertrieb · Marketing Operations', buyer: 'Vertriebsleitung / Sales Operations',
    problem: 'Badge, Visitenkarte und Gesprächsnotizen müssen nach der Messe konsolidiert, ergänzt und ins CRM vorbereitet werden. Consent und Dubletten sind oft unklar.', improvement: 'Ein strukturierter CRM-Entwurf mit fehlenden Angaben, Dublettenhinweis und freizugebendem Follow-up.', sourceSystem: 'Badge / Visitenkarte / Notizen', systemOfRecord: 'CRM bleibt führend', polished: false,
    marketSignal: 'Leicht erklärbar, aber saisonal und weniger industriespezifisch; keine Nachfragebelege.', assessment: 'Guter schneller Proof, kommerziell vermutlich austauschbarer als Service- oder Auftragsprozesse.', scores: { frequency: 2, impact: 3, repetition: 4, data: 4, feasibility: 5, integration: 4, risk: 4, explain: 5, sell: 3, demand: 2 },
    scenarios: [
      { id: 'qualified-lead', label: 'Kontakt vollständig', kind: 'happy', description: 'Firma, Rolle, Interesse und Follow-up-Erlaubnis sind dokumentiert.', input: { eventId: 'LEAD-DEMO-10001', badge: { company: 'Muster Automation GmbH', name: 'Lena Beispiel', role: 'Leitung Produktion', email: 'lena.beispiel@example.invalid' }, notes: 'Interesse an Service-Triage für drei Werke. Rückruf in KW 35 vereinbart.', interest: 'Machine Service Triage', consent: { followUp: true, source: 'Gesprächsnotiz' }, existingContact: false } },
      { id: 'possible-duplicate', label: 'Mögliche Dublette', kind: 'edge', description: 'Firma und E-Mail-Domain ähneln einem bestehenden CRM-Kontakt.', input: { eventId: 'LEAD-DEMO-10002', badge: { company: 'DemoForm AG', name: 'Kai Muster', role: 'Service Operations', email: 'kai.muster@example.invalid' }, notes: 'Ersatzteilprozess besprochen.', interest: 'Spare Parts Inquiry', consent: { followUp: true, source: 'Badge-Scan' }, existingContact: { id: 'CRM-4481', similarity: 0.91 } } },
      { id: 'no-consent', label: 'Follow-up unklar', kind: 'error', description: 'Notizen enthalten keinen belastbaren Hinweis auf die gewünschte Kontaktaufnahme.', input: { eventId: 'LEAD-DEMO-10003', badge: { company: 'Fiktiv Maschinenbau KG', name: 'Robin Test', role: null, email: 'robin.test@example.invalid' }, notes: 'Kurzes Gespräch am Stand.', interest: null, consent: { followUp: null, source: null }, existingContact: false } },
    ],
  },
];

export const polishedWorkflows = workflows.filter((workflow) => workflow.polished);
export const workflowBySlug = Object.fromEntries(workflows.map((workflow) => [workflow.slug, workflow]));
export const workflowById = Object.fromEntries(workflows.map((workflow) => [workflow.id, workflow]));

export function totalScore(workflow) {
  return Object.values(workflow.scores).reduce((sum, score) => sum + score, 0);
}

export const stages = ['Problem', 'Eingang', 'Prüfung', 'Ausnahme', 'Mensch', 'Ergebnis'];
