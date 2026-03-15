"""
Datenbankmodelle – Finanzsystem
Menschlichkeit Österreich Vereinsplattform

Tabellen:
  - invoices          Rechnungen
  - invoice_items     Rechnungspositionen
  - dunning_runs      Mahnläufe
  - dunning_notices   Einzelne Mahnungen
  - payment_intents   Zahlungsabsichten (Stripe/PayPal/SEPA)
  - donations         Spenden
  - donation_receipts Spendenquittungen
  - sepa_mandates     SEPA-Lastschriftmandate
  - sepa_batches      SEPA-Sammellastschriften
  - email_log         E-Mail-Versandprotokoll
  - audit_log         Audit-Trail
"""

from __future__ import annotations
import logging
from datetime import datetime, date
from decimal import Decimal
from enum import Enum as PyEnum
from typing import Optional, List
import uuid

logger = logging.getLogger(__name__)

try:
    from sqlalchemy import (
        Column, String, Integer, Numeric, Boolean, DateTime, Date,
        ForeignKey, Text, Enum, JSON, Index, UniqueConstraint
    )
    from sqlalchemy.dialects.postgresql import UUID
    from sqlalchemy.orm import relationship, declarative_base
    from sqlalchemy.sql import func

    Base = declarative_base()

    def gen_uuid():
        return str(uuid.uuid4())

    # ── Enumerationen ──────────────────────────────────────────────────────────

    class InvoiceStatus(str, PyEnum):
        DRAFT      = "draft"
        OPEN       = "open"
        SENT       = "sent"
        PARTIAL    = "partial"
        PAID       = "paid"
        OVERDUE    = "overdue"
        CANCELLED  = "cancelled"
        REFUNDED   = "refunded"

    class DunningLevel(str, PyEnum):
        REMINDER_1 = "reminder_1"   # Zahlungserinnerung (freundlich)
        REMINDER_2 = "reminder_2"   # 1. Mahnung
        REMINDER_3 = "reminder_3"   # 2. Mahnung (mit Mahngebühr)
        FINAL      = "final"        # Letzte Mahnung (Inkasso-Androhung)
        LEGAL      = "legal"        # Übergabe an Inkasso/Rechtsanwalt

    class PaymentMethod(str, PyEnum):
        STRIPE_CARD   = "stripe_card"
        STRIPE_SEPA   = "stripe_sepa"
        PAYPAL        = "paypal"
        BANK_TRANSFER = "bank_transfer"
        SEPA_DEBIT    = "sepa_debit"
        CASH          = "cash"

    class PaymentStatus(str, PyEnum):
        PENDING    = "pending"
        PROCESSING = "processing"
        SUCCEEDED  = "succeeded"
        FAILED     = "failed"
        CANCELLED  = "cancelled"
        REFUNDED   = "refunded"

    class DonationType(str, PyEnum):
        ONE_TIME   = "one_time"
        RECURRING  = "recurring"
        CAMPAIGN   = "campaign"
        MEMORIAL   = "memorial"

    class ReceiptStatus(str, PyEnum):
        PENDING  = "pending"
        ISSUED   = "issued"
        SENT     = "sent"
        REVOKED  = "revoked"

    # ── Rechnungen ─────────────────────────────────────────────────────────────

    class Invoice(Base):
        __tablename__ = "invoices"

        id                    = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        invoice_number        = Column(String(30), unique=True, nullable=False, index=True)
        civicrm_contact_id    = Column(Integer, nullable=False, index=True)
        civicrm_contribution_id = Column(Integer, nullable=True, index=True)

        # Empfänger (denormalisiert für Archivzwecke)
        recipient_name        = Column(String(255), nullable=False)
        recipient_email       = Column(String(255), nullable=False)
        recipient_address     = Column(Text, nullable=True)
        recipient_tax_id      = Column(String(50), nullable=True)

        # Beträge
        subtotal              = Column(Numeric(10, 2), nullable=False, default=0)
        tax_rate              = Column(Numeric(5, 2), nullable=False, default=0)  # 0% für Verein
        tax_amount            = Column(Numeric(10, 2), nullable=False, default=0)
        total_amount          = Column(Numeric(10, 2), nullable=False)
        paid_amount           = Column(Numeric(10, 2), nullable=False, default=0)
        currency              = Column(String(3), nullable=False, default="EUR")

        # Datum
        issue_date            = Column(Date, nullable=False, default=date.today)
        due_date              = Column(Date, nullable=False)
        paid_date             = Column(Date, nullable=True)

        # Status
        status                = Column(Enum(InvoiceStatus), nullable=False, default=InvoiceStatus.DRAFT)
        invoice_type          = Column(String(50), nullable=False, default="membership")  # membership, donation, event, service

        # Referenzen
        period_start          = Column(Date, nullable=True)
        period_end            = Column(Date, nullable=True)
        membership_type       = Column(String(100), nullable=True)
        notes                 = Column(Text, nullable=True)
        internal_notes        = Column(Text, nullable=True)

        # PDF
        pdf_path              = Column(String(500), nullable=True)
        pdf_generated_at      = Column(DateTime, nullable=True)

        # Metadaten
        created_at            = Column(DateTime, nullable=False, default=func.now())
        updated_at            = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
        created_by            = Column(String(100), nullable=True)

        # Beziehungen
        items                 = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
        payment_intents       = relationship("PaymentIntent", back_populates="invoice")
        dunning_notices       = relationship("DunningNotice", back_populates="invoice")

        def __repr__(self):
            return f"<Invoice {self.invoice_number} | {self.status} | {self.total_amount} {self.currency}>"

        @property
        def outstanding_amount(self) -> Decimal:
            return self.total_amount - self.paid_amount

        @property
        def is_overdue(self) -> bool:
            return self.status == InvoiceStatus.OPEN and date.today() > self.due_date


    class InvoiceItem(Base):
        __tablename__ = "invoice_items"

        id          = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        invoice_id  = Column(UUID(as_uuid=False), ForeignKey("invoices.id"), nullable=False)
        position    = Column(Integer, nullable=False, default=1)
        description = Column(String(500), nullable=False)
        quantity    = Column(Numeric(10, 3), nullable=False, default=1)
        unit        = Column(String(50), nullable=True)
        unit_price  = Column(Numeric(10, 2), nullable=False)
        total_price = Column(Numeric(10, 2), nullable=False)
        tax_rate    = Column(Numeric(5, 2), nullable=False, default=0)

        invoice     = relationship("Invoice", back_populates="items")


    # ── Mahnwesen ──────────────────────────────────────────────────────────────

    class DunningRun(Base):
        __tablename__ = "dunning_runs"

        id              = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        run_date        = Column(DateTime, nullable=False, default=func.now())
        triggered_by    = Column(String(100), nullable=False, default="n8n_scheduler")
        invoices_checked = Column(Integer, nullable=False, default=0)
        notices_created  = Column(Integer, nullable=False, default=0)
        total_amount_due = Column(Numeric(12, 2), nullable=True)
        status          = Column(String(50), nullable=False, default="completed")
        notes           = Column(Text, nullable=True)
        created_at      = Column(DateTime, nullable=False, default=func.now())

        notices         = relationship("DunningNotice", back_populates="dunning_run")


    class DunningNotice(Base):
        __tablename__ = "dunning_notices"

        id                  = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        dunning_run_id      = Column(UUID(as_uuid=False), ForeignKey("dunning_runs.id"), nullable=True)
        invoice_id          = Column(UUID(as_uuid=False), ForeignKey("invoices.id"), nullable=False)
        civicrm_contact_id  = Column(Integer, nullable=False, index=True)
        level               = Column(Enum(DunningLevel), nullable=False)
        dunning_fee         = Column(Numeric(10, 2), nullable=False, default=0)
        sent_at             = Column(DateTime, nullable=True)
        email_address       = Column(String(255), nullable=False)
        pdf_path            = Column(String(500), nullable=True)
        response_deadline   = Column(Date, nullable=True)
        status              = Column(String(50), nullable=False, default="pending")  # pending, sent, resolved, escalated
        resolved_at         = Column(DateTime, nullable=True)
        notes               = Column(Text, nullable=True)
        created_at          = Column(DateTime, nullable=False, default=func.now())

        invoice             = relationship("Invoice", back_populates="dunning_notices")
        dunning_run         = relationship("DunningRun", back_populates="notices")


    # ── Zahlungen ──────────────────────────────────────────────────────────────

    class PaymentIntent(Base):
        __tablename__ = "payment_intents"

        id                  = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        invoice_id          = Column(UUID(as_uuid=False), ForeignKey("invoices.id"), nullable=True)
        donation_id         = Column(UUID(as_uuid=False), ForeignKey("donations.id"), nullable=True)
        civicrm_contact_id  = Column(Integer, nullable=False, index=True)

        # Gateway-Daten
        payment_method      = Column(Enum(PaymentMethod), nullable=False)
        gateway_intent_id   = Column(String(255), nullable=True, unique=True)  # Stripe/PayPal ID
        gateway_charge_id   = Column(String(255), nullable=True)
        gateway_customer_id = Column(String(255), nullable=True)
        gateway_response    = Column(JSON, nullable=True)

        # Betrag
        amount              = Column(Numeric(10, 2), nullable=False)
        currency            = Column(String(3), nullable=False, default="EUR")
        status              = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)

        # Zeitstempel
        created_at          = Column(DateTime, nullable=False, default=func.now())
        updated_at          = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
        succeeded_at        = Column(DateTime, nullable=True)
        failed_at           = Column(DateTime, nullable=True)
        failure_reason      = Column(Text, nullable=True)

        invoice             = relationship("Invoice", back_populates="payment_intents")
        donation            = relationship("Donation", back_populates="payment_intents")


    # ── Spenden ────────────────────────────────────────────────────────────────

    class Donation(Base):
        __tablename__ = "donations"

        id                    = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        civicrm_contact_id    = Column(Integer, nullable=False, index=True)
        civicrm_contribution_id = Column(Integer, nullable=True, unique=True)

        # Spender (denormalisiert)
        donor_name            = Column(String(255), nullable=False)
        donor_email           = Column(String(255), nullable=False)
        donor_address         = Column(Text, nullable=True)

        # Betrag
        amount                = Column(Numeric(10, 2), nullable=False)
        currency              = Column(String(3), nullable=False, default="EUR")
        donation_type         = Column(Enum(DonationType), nullable=False, default=DonationType.ONE_TIME)

        # Kampagne
        campaign_id           = Column(String(100), nullable=True)
        campaign_name         = Column(String(255), nullable=True)
        purpose               = Column(String(500), nullable=True)

        # Wiederkehrend
        is_recurring          = Column(Boolean, nullable=False, default=False)
        recurring_interval    = Column(String(20), nullable=True)  # monthly, quarterly, yearly
        recurring_end_date    = Column(Date, nullable=True)

        # Status
        status                = Column(String(50), nullable=False, default="pending")
        donation_date         = Column(Date, nullable=False, default=date.today)
        receipt_eligible      = Column(Boolean, nullable=False, default=True)

        # Metadaten
        source                = Column(String(100), nullable=True)  # website, event, direct
        notes                 = Column(Text, nullable=True)
        created_at            = Column(DateTime, nullable=False, default=func.now())
        updated_at            = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())

        payment_intents       = relationship("PaymentIntent", back_populates="donation")
        receipts              = relationship("DonationReceipt", back_populates="donation")


    class DonationReceipt(Base):
        __tablename__ = "donation_receipts"

        id                  = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        donation_id         = Column(UUID(as_uuid=False), ForeignKey("donations.id"), nullable=False)
        receipt_number      = Column(String(30), unique=True, nullable=False)
        tax_year            = Column(Integer, nullable=False)

        # Quittungs-Daten
        amount              = Column(Numeric(10, 2), nullable=False)
        donation_date       = Column(Date, nullable=False)
        purpose             = Column(String(500), nullable=True)

        # Empfänger
        donor_name          = Column(String(255), nullable=False)
        donor_address       = Column(Text, nullable=True)

        # Aussteller (Verein)
        issuer_name         = Column(String(255), nullable=False, default="Menschlichkeit Österreich")
        issuer_address      = Column(Text, nullable=True)
        issuer_tax_id       = Column(String(50), nullable=True)
        issuer_registration = Column(String(100), nullable=True)

        # Status & Dokument
        status              = Column(Enum(ReceiptStatus), nullable=False, default=ReceiptStatus.PENDING)
        pdf_path            = Column(String(500), nullable=True)
        issued_at           = Column(DateTime, nullable=True)
        sent_at             = Column(DateTime, nullable=True)
        revoked_at          = Column(DateTime, nullable=True)
        revocation_reason   = Column(Text, nullable=True)
        created_at          = Column(DateTime, nullable=False, default=func.now())

        donation            = relationship("Donation", back_populates="receipts")


    # ── SEPA ───────────────────────────────────────────────────────────────────

    class SepaMandate(Base):
        __tablename__ = "sepa_mandates"

        id                  = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        civicrm_contact_id  = Column(Integer, nullable=False, index=True)
        mandate_reference   = Column(String(35), unique=True, nullable=False)
        mandate_type        = Column(String(10), nullable=False, default="RCUR")  # FRST, RCUR, OOFF, FNAL
        iban                = Column(String(34), nullable=False)
        bic                 = Column(String(11), nullable=True)
        account_holder      = Column(String(255), nullable=False)
        signed_date         = Column(Date, nullable=False)
        is_active           = Column(Boolean, nullable=False, default=True)
        revoked_at          = Column(DateTime, nullable=True)
        created_at          = Column(DateTime, nullable=False, default=func.now())


    class SepaBatch(Base):
        __tablename__ = "sepa_batches"

        id                  = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        batch_id            = Column(String(35), unique=True, nullable=False)
        collection_date     = Column(Date, nullable=False)
        total_amount        = Column(Numeric(12, 2), nullable=False)
        transaction_count   = Column(Integer, nullable=False, default=0)
        status              = Column(String(50), nullable=False, default="created")  # created, submitted, settled, failed
        xml_file_path       = Column(String(500), nullable=True)
        submitted_at        = Column(DateTime, nullable=True)
        settled_at          = Column(DateTime, nullable=True)
        created_at          = Column(DateTime, nullable=False, default=func.now())


    # ── Protokollierung ────────────────────────────────────────────────────────

    class EmailLog(Base):
        __tablename__ = "email_log"

        id              = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        recipient_email = Column(String(255), nullable=False, index=True)
        recipient_name  = Column(String(255), nullable=True)
        subject         = Column(String(500), nullable=False)
        template_id     = Column(String(100), nullable=True)
        email_type      = Column(String(100), nullable=False)  # invoice, dunning, receipt, newsletter, welcome, etc.
        related_id      = Column(String(36), nullable=True)    # UUID der verknüpften Entität
        status          = Column(String(50), nullable=False, default="queued")  # queued, sent, delivered, bounced, failed
        provider_id     = Column(String(255), nullable=True)   # ID beim E-Mail-Provider
        sent_at         = Column(DateTime, nullable=True)
        delivered_at    = Column(DateTime, nullable=True)
        opened_at       = Column(DateTime, nullable=True)
        clicked_at      = Column(DateTime, nullable=True)
        bounced_at      = Column(DateTime, nullable=True)
        error_message   = Column(Text, nullable=True)
        created_at      = Column(DateTime, nullable=False, default=func.now())

        __table_args__ = (
            Index("idx_email_log_type_date", "email_type", "created_at"),
        )


    class AuditLog(Base):
        __tablename__ = "audit_log"

        id          = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
        timestamp   = Column(DateTime, nullable=False, default=func.now(), index=True)
        actor       = Column(String(255), nullable=False)  # user_id, "n8n", "system"
        action      = Column(String(100), nullable=False)  # create_invoice, send_dunning, etc.
        entity_type = Column(String(100), nullable=True)
        entity_id   = Column(String(36), nullable=True)
        old_values  = Column(JSON, nullable=True)
        new_values  = Column(JSON, nullable=True)
        ip_address  = Column(String(45), nullable=True)
        user_agent  = Column(String(500), nullable=True)
        notes       = Column(Text, nullable=True)

        __table_args__ = (
            Index("idx_audit_entity", "entity_type", "entity_id"),
            Index("idx_audit_actor", "actor", "timestamp"),
        )

except ImportError:
    # SQLAlchemy nicht installiert – Stub für Entwicklung
    Base = object
    logger.warning("SQLAlchemy nicht installiert. Modelle sind Stubs.")
