from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src" / "assets" / "evidence"
OUTPUT.mkdir(parents=True, exist_ok=True)

INK = colors.HexColor("#16211E")
MUTED = colors.HexColor("#66736E")
LINE = colors.HexColor("#D9DEDA")
PAPER = colors.HexColor("#F7F8F5")
LIME = colors.HexColor("#B8F34B")
ORANGE = colors.HexColor("#FF7A45")
RED = colors.HexColor("#E34D43")
BLUE = colors.HexColor("#3B6CF4")


def text(c, x, y, value, size=9, color=INK, font="Helvetica"):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, value)


def right_text(c, x, y, value, size=9, color=INK, font="Helvetica"):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawRightString(x, y, value)


def label(c, x, y, value):
    text(c, x, y, value.upper(), 6.5, MUTED, "Helvetica-Bold")


def badge(c, x, y, value, fill=LIME, color=INK):
    width = stringWidth(value, "Helvetica-Bold", 7) + 10 * mm
    c.setFillColor(fill)
    c.roundRect(x, y - 4.2 * mm, width, 6.5 * mm, 1.8 * mm, fill=1, stroke=0)
    text(c, x + 5 * mm, y - 2.2 * mm, value, 7, color, "Helvetica-Bold")
    return width


def header(c, document_type, reference):
    width, height = A4
    c.setFillColor(INK)
    c.rect(0, height - 41 * mm, width, 41 * mm, fill=1, stroke=0)
    text(c, 18 * mm, height - 16 * mm, "HM / INDUSTRIAL LAB", 8, LIME, "Helvetica-Bold")
    text(c, 18 * mm, height - 29 * mm, document_type, 24, colors.white, "Helvetica-Bold")
    right_text(c, width - 18 * mm, height - 16 * mm, "SYNTHETIC DEMO", 8, ORANGE, "Helvetica-Bold")
    right_text(c, width - 18 * mm, height - 29 * mm, reference, 11, colors.white, "Helvetica-Bold")


def footer(c, page=1):
    width, _ = A4
    c.setStrokeColor(LINE)
    c.line(18 * mm, 15 * mm, width - 18 * mm, 15 * mm)
    text(c, 18 * mm, 9 * mm, "Synthetische Testdaten - keine reale Bestellung, Rechnung oder Kundenkommunikation", 6.5, MUTED)
    right_text(c, width - 18 * mm, 9 * mm, f"Seite {page} / 1", 6.5, MUTED)


def draw_kv(c, x, y, key, value, width=58 * mm):
    label(c, x, y, key)
    text(c, x, y - 5 * mm, value, 9.5, INK, "Helvetica-Bold")
    c.setStrokeColor(LINE)
    c.line(x, y - 8 * mm, x + width, y - 8 * mm)


def order_pdf(path):
    c = canvas.Canvas(str(path), pagesize=A4)
    width, height = A4
    header(c, "BESTELLUNG", "PO 900144")

    y = height - 57 * mm
    draw_kv(c, 18 * mm, y, "Besteller", "Neckar Montagebau GmbH", 80 * mm)
    draw_kv(c, 110 * mm, y, "Bestelldatum", "12.08.2026", 82 * mm)
    y -= 23 * mm
    draw_kv(c, 18 * mm, y, "Lieferadresse", "Industriestrasse 4, 71638 Ludwigsburg", 80 * mm)
    draw_kv(c, 110 * mm, y, "Wunschtermin", "04.09.2026", 82 * mm)
    y -= 23 * mm
    draw_kv(c, 18 * mm, y, "Kundennummer", "K-1088", 80 * mm)
    draw_kv(c, 110 * mm, y, "Zahlungsziel", "45 Tage netto", 82 * mm)

    table_data = [
        ["POS", "ARTIKEL", "BESCHREIBUNG", "MENGE", "PREIS", "GESAMT"],
        ["10", "HM-GRD-500", "Schutzgitter 500", "10 Stk.", "221,00 EUR", "2.210,00 EUR"],
    ]
    table = Table(table_data, colWidths=[14 * mm, 31 * mm, 57 * mm, 22 * mm, 27 * mm, 31 * mm], rowHeights=[10 * mm, 15 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 6.5),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (3, 0), (-1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("BACKGROUND", (0, 1), (-1, -1), PAPER),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))
    table.wrapOn(c, width, height)
    table.drawOn(c, 14 * mm, height - 173 * mm)

    c.setFillColor(colors.HexColor("#FFF0E9"))
    c.roundRect(18 * mm, height - 207 * mm, 174 * mm, 22 * mm, 3 * mm, fill=1, stroke=0)
    text(c, 24 * mm, height - 194 * mm, "PRUEFPUNKT", 6.5, RED, "Helvetica-Bold")
    text(c, 24 * mm, height - 201 * mm, "Der Bestellpreis liegt 8,1 % unter dem synthetischen ERP-Stammpreis von 240,50 EUR.", 8.5, INK, "Helvetica-Bold")

    right_text(c, width - 18 * mm, height - 224 * mm, "NETTO  2.210,00 EUR", 11, INK, "Helvetica-Bold")
    right_text(c, width - 18 * mm, height - 233 * mm, "MWST 19 %  419,90 EUR", 9, MUTED)
    right_text(c, width - 18 * mm, height - 245 * mm, "GESAMT  2.629,90 EUR", 15, INK, "Helvetica-Bold")
    footer(c)
    c.save()


def invoice_pdf(path):
    c = canvas.Canvas(str(path), pagesize=A4)
    width, height = A4
    header(c, "RECHNUNG", "RE-2026-0824")

    y = height - 57 * mm
    draw_kv(c, 18 * mm, y, "Lieferant", "Muster Pneumatik GmbH", 80 * mm)
    draw_kv(c, 110 * mm, y, "Rechnungsdatum", "14.08.2026", 82 * mm)
    y -= 23 * mm
    draw_kv(c, 18 * mm, y, "Lieferantennummer", "L-2091", 80 * mm)
    draw_kv(c, 110 * mm, y, "Bestellbezug", "PO-78133", 82 * mm)
    y -= 23 * mm
    draw_kv(c, 18 * mm, y, "Leistungsdatum", "12.08.2026", 80 * mm)
    draw_kv(c, 110 * mm, y, "Wareneingang", "10 Stk. gebucht", 82 * mm)

    table_data = [
        ["POS", "ARTIKEL", "BESCHREIBUNG", "MENGE", "PREIS", "GESAMT"],
        ["1", "VLV-24", "Magnetventil 24 V", "10 Stk.", "94,00 EUR", "940,00 EUR"],
    ]
    table = Table(table_data, colWidths=[14 * mm, 28 * mm, 60 * mm, 22 * mm, 27 * mm, 31 * mm], rowHeights=[10 * mm, 15 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 6.5),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (3, 0), (-1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("BACKGROUND", (0, 1), (-1, -1), PAPER),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))
    table.wrapOn(c, width, height)
    table.drawOn(c, 14 * mm, height - 173 * mm)

    right_text(c, width - 18 * mm, height - 194 * mm, "NETTO  940,00 EUR", 10, INK, "Helvetica-Bold")
    right_text(c, width - 18 * mm, height - 204 * mm, "MWST 19 %  178,60 EUR", 9, MUTED)
    right_text(c, width - 18 * mm, height - 217 * mm, "GESAMT  1.118,60 EUR", 15, INK, "Helvetica-Bold")

    c.setFillColor(colors.HexColor("#FFF0E9"))
    c.roundRect(18 * mm, height - 258 * mm, 174 * mm, 27 * mm, 3 * mm, fill=1, stroke=0)
    text(c, 24 * mm, height - 239 * mm, "BANKVERBINDUNG AUF DOKUMENT", 6.5, RED, "Helvetica-Bold")
    text(c, 24 * mm, height - 247 * mm, "DE02 1001 0010 0000 0009 99", 12, INK, "Helvetica-Bold")
    text(c, 24 * mm, height - 253 * mm, "Weicht vom freigegebenen Lieferantenstamm ab - Zahlung stoppen.", 7.5, RED, "Helvetica-Bold")
    footer(c)
    c.save()


def service_email_pdf(path, photo_path):
    c = canvas.Canvas(str(path), pagesize=A4)
    width, height = A4
    header(c, "SERVICE-E-MAIL", "SRV-DEMO-2001")

    text(c, 18 * mm, height - 57 * mm, "Von", 7, MUTED, "Helvetica-Bold")
    text(c, 39 * mm, height - 57 * mm, "instandhaltung@musterwerk.example", 9, INK)
    text(c, 18 * mm, height - 67 * mm, "An", 7, MUTED, "Helvetica-Bold")
    text(c, 39 * mm, height - 67 * mm, "service@maschinenbau.example", 9, INK)
    text(c, 18 * mm, height - 77 * mm, "Betreff", 7, MUTED, "Helvetica-Bold")
    text(c, 39 * mm, height - 77 * mm, "Anlage stoppt beim Referenzieren", 10, INK, "Helvetica-Bold")
    c.setStrokeColor(LINE)
    c.line(18 * mm, height - 83 * mm, width - 18 * mm, height - 83 * mm)

    body_style = ParagraphStyle("body", fontName="Helvetica", fontSize=10, leading=15, textColor=INK)
    body = Paragraph(
        "Guten Morgen,<br/><br/>unsere Montagezelle <b>MX-24-0187</b> steht seit 06:31 Uhr. "
        "Die Y-Achse referenziert nicht. Auf dem Panel ist <b>E-217</b> sichtbar. "
        "Ein Neustart hat keine Aenderung gebracht. Produktion ist gestoppt; aktuell kein Sicherheitshinweis.<br/><br/>"
        "Bitte kurze Rueckmeldung, welche Angaben Sie noch benoetigen.<br/><br/>Viele Gruesse<br/>Instandhaltung",
        body_style,
    )
    body.wrapOn(c, 174 * mm, 70 * mm)
    body.drawOn(c, 18 * mm, height - 137 * mm)

    if photo_path.exists():
        c.drawImage(str(photo_path), 18 * mm, 30 * mm, width=174 * mm, height=105 * mm, preserveAspectRatio=True, anchor="c", mask="auto")
        c.setFillColor(INK)
        c.rect(18 * mm, 30 * mm, 174 * mm, 9 * mm, fill=1, stroke=0)
        text(c, 23 * mm, 33 * mm, "ANHANG  panel-e217.jpg  |  2,4 MB  |  SYNTHETISCH", 7, colors.white, "Helvetica-Bold")
    footer(c)
    c.save()


def main():
    order_pdf(OUTPUT / "order-price-deviation.pdf")
    invoice_pdf(OUTPUT / "invoice-iban-change.pdf")
    service_email_pdf(OUTPUT / "service-email-e217.pdf", OUTPUT / "service-hmi-e217.png")
    print(f"Generated demo PDFs in {OUTPUT}")


if __name__ == "__main__":
    main()
