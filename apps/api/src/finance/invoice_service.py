"""
Rechnungsservice – Menschlichkeit Österreich
Vollständige Geschäftslogik für Rechnungserstellung, -verwaltung und Mahnwesen
"""

from __future__ import annotations
import os
import logging
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Optional, List, Dict, Any
import httpx

from ...app.secrets_provider import get_secret

logger = logging.getLogger(__name__)

# ── Konfiguration ──────────────────────────────────────────────────────────────

INVOICE_CONFIG = {
    "prefix":           "RE",
    "number_padding":   6,
    "default_due_days": 14,
    "tax_rate":         Decimal("0.00"),   # Verein: 0% MwSt
    "currency":         "EUR",
    "dunning_fees": {
        "reminder_1": Decimal("0.00"),
        "reminder_2": Decimal("0.00"),
        "reminder_3": Decimal("5.00"),
        "final":      Decimal("10.00"),
        "legal":      Decimal("25.00"),
    },
    "dunning_intervals_days": {
        "reminder_1": 7,    # 7 Tage nach Fälligkeit
        "reminder_2": 21,   # 21 Tage nach Fälligkeit
        "reminder_3": 35,   # 35 Tage nach Fälligkeit
        "final":      49,   # 49 Tage nach Fälligkeit
        "legal":      63,   # 63 Tage nach Fälligkeit
    },
    "issuer": {
        "name":         "Menschlichkeit Österreich",
        "address":      "Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn, Österreich",
        "email":        "kontakt@menschlichkeit-oesterreich.at",
        "website":      "https://menschlichkeit-oesterreich.at",
        "iban":         "AT12 3456 7890 1234 5678",
        "bic":          "BKAUATWW",
        "bank":         "Bank Austria",
        "tax_id":       "ZVR: 1182213083",
        "registration": "ZVR-Zahl: 1182213083",
    },
    "receipt": {
        "prefix":          "SQ",
        "min_amount":      Decimal("0.01"),
        "tax_deductible":  True,
        "purpose_default": "Förderung demokratischer Bildung und Zivilgesellschaft",
    },
    "sepa": {
        "creditor_id":   "AT12ZZZ00000012345",
        "creditor_name": "Menschlichkeit Österreich",
    },
}

N8N_BASE = os.getenv("N8N_WEBHOOK_BASE_URL", "http://localhost:5678/webhook/")
N8N_KEY  = get_secret("N8N_API_KEY", bsm_key="api/N8N_API_KEY")


# ── Hilfsfunktionen ────────────────────────────────────────────────────────────

def generate_invoice_number(last_number: int) -> str:
    """Generiert eine eindeutige Rechnungsnummer im Format RE-2026-000001."""
    year = date.today().year
    seq  = str(last_number + 1).zfill(INVOICE_CONFIG["number_padding"])
    return f"{INVOICE_CONFIG['prefix']}-{year}-{seq}"


def generate_receipt_number(last_number: int, year: int) -> str:
    """Generiert eine Quittungsnummer im Format SQ-2026-000001."""
    seq = str(last_number + 1).zfill(6)
    return f"{INVOICE_CONFIG['receipt']['prefix']}-{year}-{seq}"


def calculate_due_date(issue_date: date, days: int = None) -> date:
    """Berechnet das Fälligkeitsdatum."""
    days = days or INVOICE_CONFIG["default_due_days"]
    return issue_date + timedelta(days=days)


async def trigger_n8n_webhook(webhook_path: str, payload: Dict[str, Any]) -> bool:
    """Sendet einen Webhook-Trigger an n8n."""
    url = f"{N8N_BASE}{webhook_path}"
    headers = {"X-N8N-API-KEY": N8N_KEY, "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            logger.info("n8n webhook triggered: %s → %s", webhook_path, resp.status_code)
            return True
    except Exception as e:
        logger.error("n8n webhook failed: %s → %s", webhook_path, e)
        return False


# ── Rechnungsservice ───────────────────────────────────────────────────────────

class InvoiceService:
    """Vollständige Geschäftslogik für Rechnungen."""

    def __init__(self, db_session=None):
        self.db = db_session

    def create_invoice_data(
        self,
        contact: Dict[str, Any],
        items: List[Dict[str, Any]],
        invoice_type: str = "membership",
        due_days: int = None,
        period_start: date = None,
        period_end: date = None,
        notes: str = None,
    ) -> Dict[str, Any]:
        """Erstellt ein vollständiges Rechnungs-Daten-Dict."""
        issue_date = date.today()
        due_date   = calculate_due_date(issue_date, due_days)

        # Positionen berechnen
        processed_items = []
        subtotal = Decimal("0.00")
        for i, item in enumerate(items, 1):
            qty        = Decimal(str(item.get("quantity", 1)))
            unit_price = Decimal(str(item["unit_price"]))
            total      = qty * unit_price
            subtotal  += total
            processed_items.append({
                "position":    i,
                "description": item["description"],
                "quantity":    float(qty),
                "unit":        item.get("unit", "Stk."),
                "unit_price":  float(unit_price),
                "total_price": float(total),
                "tax_rate":    float(INVOICE_CONFIG["tax_rate"]),
            })

        tax_amount   = subtotal * INVOICE_CONFIG["tax_rate"] / 100
        total_amount = subtotal + tax_amount

        return {
            "issue_date":       issue_date.isoformat(),
            "due_date":         due_date.isoformat(),
            "invoice_type":     invoice_type,
            "period_start":     period_start.isoformat() if period_start else None,
            "period_end":       period_end.isoformat() if period_end else None,
            "recipient": {
                "civicrm_id":   contact["id"],
                "name":         contact.get("display_name", ""),
                "email":        contact.get("email", ""),
                "address":      contact.get("address", ""),
            },
            "issuer":           INVOICE_CONFIG["issuer"],
            "items":            processed_items,
            "subtotal":         float(subtotal),
            "tax_rate":         float(INVOICE_CONFIG["tax_rate"]),
            "tax_amount":       float(tax_amount),
            "total_amount":     float(total_amount),
            "currency":         INVOICE_CONFIG["currency"],
            "notes":            notes,
            "payment_methods":  ["bank_transfer", "stripe_card", "paypal"],
        }

    async def create_and_send_invoice(
        self,
        contact: Dict[str, Any],
        items: List[Dict[str, Any]],
        **kwargs
    ) -> Dict[str, Any]:
        """Erstellt eine Rechnung und triggert den n8n-Versand-Workflow."""
        invoice_data = self.create_invoice_data(contact, items, **kwargs)

        # n8n-Workflow triggern: PDF generieren + E-Mail versenden
        await trigger_n8n_webhook("finance/invoice-created", {
            "action":       "create_and_send",
            "invoice_data": invoice_data,
            "contact":      contact,
        })

        logger.info("Invoice created and n8n workflow triggered for contact %s", contact.get("id"))
        return invoice_data

    async def process_payment_confirmation(
        self,
        invoice_id: str,
        payment_data: Dict[str, Any],
    ) -> bool:
        """Verarbeitet eine Zahlungsbestätigung vom Gateway."""
        await trigger_n8n_webhook("finance/payment-confirmed", {
            "invoice_id":   invoice_id,
            "payment_data": payment_data,
            "timestamp":    datetime.utcnow().isoformat(),
        })
        return True


# ── Mahnservice ────────────────────────────────────────────────────────────────

class DunningService:
    """Vollständige Mahnlogik mit automatischer Eskalation."""

    DUNNING_LEVELS = ["reminder_1", "reminder_2", "reminder_3", "final", "legal"]

    def get_next_dunning_level(self, current_level: Optional[str]) -> Optional[str]:
        """Gibt die nächste Mahnstufe zurück."""
        if current_level is None:
            return "reminder_1"
        try:
            idx = self.DUNNING_LEVELS.index(current_level)
            return self.DUNNING_LEVELS[idx + 1] if idx + 1 < len(self.DUNNING_LEVELS) else None
        except ValueError:
            return "reminder_1"

    def should_send_dunning(
        self,
        invoice_due_date: date,
        last_dunning_level: Optional[str],
        last_dunning_date: Optional[date],
    ) -> bool:
        """Prüft ob eine Mahnung fällig ist."""
        today = date.today()
        if today <= invoice_due_date:
            return False

        days_overdue = (today - invoice_due_date).days
        next_level   = self.get_next_dunning_level(last_dunning_level)
        if next_level is None:
            return False

        required_days = INVOICE_CONFIG["dunning_intervals_days"][next_level]
        return days_overdue >= required_days

    def calculate_dunning_fee(self, level: str) -> Decimal:
        """Berechnet die Mahngebühr für eine Stufe."""
        return INVOICE_CONFIG["dunning_fees"].get(level, Decimal("0.00"))

    async def run_dunning_check(self, overdue_invoices: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Führt einen vollständigen Mahnlauf durch."""
        processed = []
        for invoice in overdue_invoices:
            due_date    = date.fromisoformat(invoice["due_date"])
            last_level  = invoice.get("last_dunning_level")
            last_date   = date.fromisoformat(invoice["last_dunning_date"]) if invoice.get("last_dunning_date") else None

            if self.should_send_dunning(due_date, last_level, last_date):
                next_level = self.get_next_dunning_level(last_level)
                fee        = self.calculate_dunning_fee(next_level)
                processed.append({
                    "invoice_id":   invoice["id"],
                    "contact_id":   invoice["civicrm_contact_id"],
                    "email":        invoice["recipient_email"],
                    "level":        next_level,
                    "fee":          float(fee),
                    "invoice_data": invoice,
                })

        if processed:
            await trigger_n8n_webhook("finance/dunning-run", {
                "run_date":  date.today().isoformat(),
                "notices":   processed,
                "count":     len(processed),
            })
            logger.info("Dunning run: %d notices triggered", len(processed))

        return {
            "checked":  len(overdue_invoices),
            "notices":  len(processed),
            "details":  processed,
        }


# ── Spendenservice ─────────────────────────────────────────────────────────────

class DonationService:
    """Vollständige Spendenlogik mit automatischer Quittungserstellung."""

    async def process_donation(
        self,
        donor: Dict[str, Any],
        amount: Decimal,
        donation_type: str = "one_time",
        campaign: str = None,
        purpose: str = None,
        payment_method: str = "stripe_card",
    ) -> Dict[str, Any]:
        """Verarbeitet eine Spende und triggert alle Folge-Workflows."""
        donation_data = {
            "donor":          donor,
            "amount":         float(amount),
            "currency":       "EUR",
            "donation_type":  donation_type,
            "campaign":       campaign,
            "purpose":        purpose or INVOICE_CONFIG["receipt"]["purpose_default"],
            "payment_method": payment_method,
            "donation_date":  date.today().isoformat(),
            "receipt_eligible": amount >= INVOICE_CONFIG["receipt"]["min_amount"],
        }

        # n8n-Workflow: Spende verarbeiten (CiviCRM + Quittung + Dankes-E-Mail)
        await trigger_n8n_webhook("finance/donation-received", donation_data)
        logger.info("Donation processed: %.2f EUR from %s", amount, donor.get("email"))
        return donation_data

    def create_receipt_data(
        self,
        donation: Dict[str, Any],
        tax_year: int = None,
    ) -> Dict[str, Any]:
        """Erstellt die Daten für eine Spendenquittung nach österreichischem Recht."""
        year = tax_year or date.today().year
        return {
            "tax_year":         year,
            "amount":           donation["amount"],
            "currency":         donation.get("currency", "EUR"),
            "donation_date":    donation["donation_date"],
            "purpose":          donation.get("purpose", INVOICE_CONFIG["receipt"]["purpose_default"]),
            "donor": {
                "name":    donation["donor"]["display_name"],
                "address": donation["donor"].get("address", ""),
                "email":   donation["donor"]["email"],
            },
            "issuer":           INVOICE_CONFIG["issuer"],
            "tax_deductible":   INVOICE_CONFIG["receipt"]["tax_deductible"],
            "legal_note":       (
                "Diese Spendenbestätigung wurde gemäß § 4a EStG 1988 ausgestellt. "
                "Menschlichkeit Österreich ist als begünstigte Einrichtung anerkannt."
            ),
        }

    async def issue_annual_receipts(self, year: int) -> Dict[str, Any]:
        """Erstellt und versendet alle Jahresquittungen für ein Steuerjahr."""
        await trigger_n8n_webhook("finance/annual-receipts", {
            "tax_year":   year,
            "action":     "issue_all",
            "triggered_at": datetime.utcnow().isoformat(),
        })
        return {"status": "triggered", "tax_year": year}


# ── SEPA-Service ───────────────────────────────────────────────────────────────

class SepaService:
    """SEPA-Lastschrift-Verwaltung und XML-Export."""

    def generate_mandate_reference(self, contact_id: int) -> str:
        """Generiert eine eindeutige Mandatsreferenz."""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        return f"MO-{contact_id:06d}-{timestamp}"

    def generate_pain_xml(
        self,
        transactions: List[Dict[str, Any]],
        collection_date: date,
        batch_id: str,
    ) -> str:
        """Generiert eine SEPA-PAIN.008-XML-Datei für Sammellastschriften."""
        total = sum(t["amount"] for t in transactions)
        creditor = INVOICE_CONFIG["sepa"]

        items_xml = ""
        for t in transactions:
            items_xml += f"""
        <DrctDbtTxInf>
          <PmtId><EndToEndId>{t['mandate_reference']}</EndToEndId></PmtId>
          <InstdAmt Ccy="EUR">{t['amount']:.2f}</InstdAmt>
          <DrctDbtTx>
            <MndtRltdInf>
              <MndtId>{t['mandate_reference']}</MndtId>
              <DtOfSgntr>{t['mandate_signed_date']}</DtOfSgntr>
            </MndtRltdInf>
          </DrctDbtTx>
          <DbtrAgt><FinInstnId><BIC>{t.get('bic', 'NOTPROVIDED')}</BIC></FinInstnId></DbtrAgt>
          <Dbtr><Nm>{t['account_holder']}</Nm></Dbtr>
          <DbtrAcct><Id><IBAN>{t['iban']}</IBAN></Id></DbtrAcct>
          <Purp><Cd>OTHR</Cd></Purp>
          <RmtInf><Ustrd>{t.get('purpose', 'Mitgliedsbeitrag')}</Ustrd></RmtInf>
        </DrctDbtTxInf>"""

        return f"""<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.003.02">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>{batch_id}</MsgId>
      <CreDtTm>{datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S')}</CreDtTm>
      <NbOfTxs>{len(transactions)}</NbOfTxs>
      <CtrlSum>{total:.2f}</CtrlSum>
      <InitgPty><Nm>{creditor['creditor_name']}</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>{batch_id}-001</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <NbOfTxs>{len(transactions)}</NbOfTxs>
      <CtrlSum>{total:.2f}</CtrlSum>
      <PmtTpInf>
        <SvcLvl><Cd>SEPA</Cd></SvcLvl>
        <LclInstrm><Cd>CORE</Cd></LclInstrm>
        <SeqTp>RCUR</SeqTp>
      </PmtTpInf>
      <ReqdColltnDt>{collection_date.isoformat()}</ReqdColltnDt>
      <Cdtr><Nm>{creditor['creditor_name']}</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>{INVOICE_CONFIG['issuer']['iban']}</IBAN></Id></CdtrAcct>
      <CdtrAgt><FinInstnId><BIC>{INVOICE_CONFIG['issuer']['bic']}</BIC></FinInstnId></CdtrAgt>
      <CdtrSchmeId>
        <Id><PrvtId><Othr>
          <Id>{creditor['creditor_id']}</Id>
          <SchmeNm><Prtry>SEPA</Prtry></SchmeNm>
        </Othr></PrvtId></Id>
      </CdtrSchmeId>
      {items_xml}
    </PmtInf>
  </CstmrDrctDbtInitn>
</Document>"""

    async def export_and_submit_batch(
        self,
        transactions: List[Dict[str, Any]],
        collection_date: date,
    ) -> Dict[str, Any]:
        """Exportiert einen SEPA-Batch und triggert den Einreichungs-Workflow."""
        batch_id = f"BATCH-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        xml      = self.generate_pain_xml(transactions, collection_date, batch_id)

        await trigger_n8n_webhook("finance/sepa-batch-export", {
            "batch_id":        batch_id,
            "collection_date": collection_date.isoformat(),
            "transaction_count": len(transactions),
            "total_amount":    sum(t["amount"] for t in transactions),
            "xml_content":     xml,
        })

        return {
            "batch_id":    batch_id,
            "count":       len(transactions),
            "total":       sum(t["amount"] for t in transactions),
            "status":      "submitted_to_n8n",
        }
