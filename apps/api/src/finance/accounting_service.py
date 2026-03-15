"""
Buchhaltungsservice – Menschlichkeit Österreich
Einnahmen-Ausgaben-Rechnung & DATEV-Export nach österr. Vereinsrecht
"""

from __future__ import annotations
import csv
import logging
from datetime import date, datetime
from decimal import Decimal
from typing import List, Dict, Any
from io import StringIO

logger = logging.getLogger(__name__)

# Österreichischer Kontenrahmen für Vereine (Auszug)
ACCOUNTING_MAP = {
    "membership_fee": {"account": 5000, "description": "Einnahmen aus Mitgliedsbeiträgen"},
    "donation":       {"account": 5100, "description": "Einnahmen aus Spenden"},
    "event_income":   {"account": 5300, "description": "Einnahmen aus Veranstaltungen"},
    "rent":           {"account": 6100, "description": "Miete und Betriebskosten"},
    "office_supplies":{"account": 6200, "description": "Bürobedarf und Verwaltung"},
    "personnel":      {"account": 6000, "description": "Personalaufwand"},
    "bank_charges":   {"account": 6700, "description": "Sonstiger betrieblicher Aufwand"},
}

class AccountingService:
    """Generiert Buchhaltungsberichte und Exporte."""

    def generate_income_expense_report(
        self,
        transactions: List[Dict[str, Any]],
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """Erstellt eine Einnahmen-Ausgaben-Rechnung."""
        income = Decimal("0.00")
        expenses = Decimal("0.00")
        income_details = []
        expense_details = []

        for tx in transactions:
            amount = Decimal(str(tx["amount"]))
            if tx["type"] == "income":
                income += amount
                income_details.append(tx)
            else:
                expenses += amount
                expense_details.append(tx)

        result = income - expenses

        return {
            "start_date": str(start_date),
            "end_date": str(end_date),
            "total_income": float(income),
            "total_expenses": float(expenses),
            "result": float(result),
            "income_transactions": income_details,
            "expense_transactions": expense_details,
        }

    def _map_transaction_to_account(self, transaction: Dict[str, Any]) -> int:
        """Mappt eine Transaktion auf ein Buchungskonto."""
        tx_type = transaction.get("category", "other").lower()
        return ACCOUNTING_MAP.get(tx_type, {"account": 6700})["account"]

    def generate_datev_export(self, transactions: List[Dict[str, Any]]) -> str:
        """Erstellt einen DATEV-CSV-Export (vereinfachtes Format)."""
        output = StringIO()
        writer = csv.writer(output, delimiter=";", quotechar=\'"\', quoting=csv.QUOTE_ALL)

        # Header nach DATEV-Spezifikation
        writer.writerow([
            "Umsatz (ohne Soll/Haben-Kz)",
            "Soll/Haben-Kennzeichen",
            "WKZ Umsatz",
            "Kurs",
            "Basisu_msatz",
            "WKZ Basisu_msatz",
            "Konto",
            "Gegenkonto (ohne BU-Schlüssel)",
            "BU-Schlüssel",
            "Belegdatum",
            "Belegfeld 1",
            "Belegfeld 2",
            "Skonto",
            "Buchungstext"
        ])

        for tx in transactions:
            is_income = tx["type"] == "income"
            amount_str = f"{Decimal(str(tx["amount"])):.2f}".replace(".", ",")
            tx_date = datetime.fromisoformat(tx["date"]).strftime("%d%m")

            konto = self._map_transaction_to_account(tx)
            gegenkonto = 1100  # Bank

            writer.writerow([
                amount_str,                                     # Umsatz
                "H" if is_income else "S",                     # Soll/Haben
                "EUR",                                          # WKZ Umsatz
                "",                                             # Kurs
                "",                                             # Basisumsatz
                "",                                             # WKZ Basisumsatz
                str(konto if is_income else gegenkonto),        # Konto
                str(gegenkonto if is_income else konto),        # Gegenkonto
                "",                                             # BU-Schlüssel
                tx_date,                                        # Belegdatum (ddmm)
                tx.get("invoice_number", tx.get("id")),       # Belegfeld 1
                "",                                             # Belegfeld 2
                "",                                             # Skonto
                tx["description"]                               # Buchungstext
            ])

        return output.getvalue()

# ── Beispiel-Nutzung ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    dummy_transactions = [
        {"id": "1", "date": "2026-02-01T10:00:00", "amount": 120.00, "type": "income", "category": "membership_fee", "description": "Mitgliedsbeitrag M. Mustermann"},
        {"id": "2", "date": "2026-02-05T14:30:00", "amount": 50.00, "type": "income", "category": "donation", "description": "Spende E. Spitzer"},
        {"id": "3", "date": "2026-02-10T11:00:00", "amount": 350.00, "type": "expense", "category": "rent", "description": "Miete Büro Februar"},
        {"id": "4", "date": "2026-02-15T09:00:00", "amount": 45.50, "type": "expense", "category": "office_supplies", "description": "Büromaterial"},
    ]

    accounting_service = AccountingService()

    # E/A-Rechnung generieren
    report = accounting_service.generate_income_expense_report(
        dummy_transactions,
        date(2026, 2, 1),
        date(2026, 2, 28)
    )
    logger.info("Einnahmen-Ausgaben-Rechnung:")
    logger.info("  Zeitraum: %s - %s", report["start_date"], report["end_date"])
    logger.info("  Einnahmen: %.2f EUR", report["total_income"])
    logger.info("  Ausgaben:  %.2f EUR", report["total_expenses"])
    logger.info("  Ergebnis:  %.2f EUR", report["result"])

    # DATEV-Export generieren
    datev_csv = accounting_service.generate_datev_export(dummy_transactions)
    logger.info("DATEV CSV Export:\n%s", datev_csv)
