"""
PDF-Generator – Menschlichkeit Österreich
Erstellt Rechnungen, Mahnungen, Spendenquittungen und Mitgliedsausweise
"""

from __future__ import annotations
import os
import logging
from datetime import date
from typing import Dict, Any
import jinja2

try:
    from weasyprint import HTML, CSS
    from weasyprint.fonts import FontConfiguration
except ImportError:
    HTML, CSS, FontConfiguration = None, None, None
    logging.warning("WeasyPrint nicht installiert. PDF-Generierung ist deaktiviert.")

logger = logging.getLogger(__name__)

# ── Konfiguration ──────────────────────────────────────────────────────────────

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")
OUTPUT_DIR   = os.getenv("PDF_STORAGE_PATH", "/tmp/pdfs")

JINJA_ENV = jinja2.Environment(
    loader=jinja2.FileSystemLoader(TEMPLATE_DIR),
    autoescape=jinja2.select_autoescape(["html", "xml"])
)

# ── Hilfsfunktionen ────────────────────────────────────────────────────────────

def format_currency(value, currency="EUR") -> str:
    return f"{value:,.2f} {currency}".replace(",", "X").replace(".", ",").replace("X", ".")

def format_date(value, fmt="%d.%m.%Y") -> str:
    if isinstance(value, str):
        value = date.fromisoformat(value)
    return value.strftime(fmt)

JINJA_ENV.filters["currency"] = format_currency
JINJA_ENV.filters["date"] = format_date

# ── PDF-Generator-Service ──────────────────────────────────────────────────────

class PdfGeneratorService:
    """Generiert verschiedene PDF-Dokumente aus HTML-Templates."""

    def __init__(self):
        if not HTML:
            raise ImportError("WeasyPrint ist nicht installiert. `pip install weasyprint`")
        self.font_config = FontConfiguration()
        os.makedirs(OUTPUT_DIR, exist_ok=True)

    def _render_html(self, template_name: str, context: Dict[str, Any]) -> str:
        """Rendert ein Jinja2-Template zu HTML."""
        template = JINJA_ENV.get_template(template_name)
        return template.render(context)

    def _generate_pdf(self, html_string: str, css_string: str, output_path: str) -> str:
        """Generiert ein PDF aus HTML- und CSS-Strings."""
        html = HTML(string=html_string)
        css = CSS(string=css_string, font_config=self.font_config)
        html.write_pdf(output_path, stylesheets=[css])
        logger.info("PDF erfolgreich generiert: %s", output_path)
        return output_path

    def generate_invoice_pdf(self, invoice_data: Dict[str, Any]) -> str:
        """Generiert eine Rechnung als PDF."""
        template_name = "invoice.html"
        css_name = "invoice.css"
        invoice_number = invoice_data["invoice_number"]
        output_path = os.path.join(OUTPUT_DIR, f"rechnung-{invoice_number}.pdf")

        html = self._render_html(template_name, {"invoice": invoice_data})
        css = JINJA_ENV.get_template(css_name).render()

        return self._generate_pdf(html, css, output_path)

    def generate_dunning_pdf(self, dunning_data: Dict[str, Any]) -> str:
        """Generiert eine Mahnung als PDF."""
        template_name = "dunning.html"
        css_name = "invoice.css"  # Gleiches Layout wie Rechnung
        invoice_number = dunning_data["invoice"]["invoice_number"]
        level = dunning_data["level"]
        output_path = os.path.join(OUTPUT_DIR, f"mahnung-{invoice_number}-{level}.pdf")

        html = self._render_html(template_name, {"dunning": dunning_data})
        css = JINJA_ENV.get_template(css_name).render()

        return self._generate_pdf(html, css, output_path)

    def generate_receipt_pdf(self, receipt_data: Dict[str, Any]) -> str:
        """Generiert eine Spendenquittung als PDF."""
        template_name = "receipt.html"
        css_name = "receipt.css"
        receipt_number = receipt_data["receipt_number"]
        output_path = os.path.join(OUTPUT_DIR, f"spendenquittung-{receipt_number}.pdf")

        html = self._render_html(template_name, {"receipt": receipt_data})
        css = JINJA_ENV.get_template(css_name).render()

        return self._generate_pdf(html, css, output_path)

    def generate_membership_card_pdf(self, member_data: Dict[str, Any]) -> str:
        """Generiert einen Mitgliedsausweis als PDF."""
        template_name = "membership_card.html"
        css_name = "membership_card.css"
        member_id = member_data["civicrm_id"]
        output_path = os.path.join(OUTPUT_DIR, f"mitgliedsausweis-{member_id}.pdf")

        html = self._render_html(template_name, {"member": member_data})
        css = JINJA_ENV.get_template(css_name).render()

        return self._generate_pdf(html, css, output_path)


# ── Beispiel-Nutzung ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Erstelle Dummy-Templates für den Test
    os.makedirs(TEMPLATE_DIR, exist_ok=True)
    with open(os.path.join(TEMPLATE_DIR, "invoice.html"), "w") as f:
        f.write("<h1>Rechnung {{ invoice.invoice_number }}</h1><p>Betrag: {{ invoice.total_amount|currency }}</p>")
    with open(os.path.join(TEMPLATE_DIR, "invoice.css"), "w") as f:
        f.write("body { font-family: sans-serif; } h1 { color: steelblue; }")

    # Dummy-Daten
    dummy_invoice = {
        "invoice_number": "RE-2026-00001",
        "total_amount": 120.00,
        "recipient_name": "Max Mustermann",
        "issue_date": "2026-02-28",
        "due_date": "2026-03-14",
        "items": [
            {"description": "Mitgliedsbeitrag 2026", "quantity": 1, "unit_price": 120.00, "total_price": 120.00}
        ]
    }

    # Service instanziieren und PDF generieren
    pdf_service = PdfGeneratorService()
    pdf_path = pdf_service.generate_invoice_pdf(dummy_invoice)
    print(f"PDF generiert unter: {pdf_path}")
