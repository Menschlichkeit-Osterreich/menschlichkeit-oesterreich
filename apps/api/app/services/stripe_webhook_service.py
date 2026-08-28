"""
Stripe-Webhook-Inbox (durable-first)
====================================

Implementiert das Inbox-Muster für Stripe-Webhooks (Audit-Finding P1-001):

    Stripe → Signatur prüfen → Event ATOMAR speichern (status=received)
           → claimen (status=processing)
           → lokale PostgreSQL-Transaktion (Donation, payment_intents, Outbox)
           → COMMIT → status=processed
           → externe Folgeeffekte NACH Commit, best effort

Garantien:

1. Das Event wird VOR jeder Geschäftslogik dauerhaft gespeichert. Schlägt die
   Verarbeitung fehl, bleibt es mit status=failed + last_error retryfähig.
2. Deduplizierung ist atomar über ``INSERT … ON CONFLICT DO NOTHING`` auf der
   bestehenden Unique-Constraint ``(provider, provider_event_id)`` — kein
   SELECT-dann-INSERT-Fenster. Parallel eintreffende identische Events können
   das Claim-UPDATE nur einmal gewinnen.
3. Die Doppelbuchungs-Sperre für Spenden liegt zusätzlich auf DB-Ebene:
   partieller Unique-Index auf ``donations(gateway_provider,
   gateway_payment_id)`` (Migration 006).
4. Externe Systeme (CiviCRM, ERPNext, Mail, Slack) werden NICHT innerhalb der
   Transaktion aufgerufen. Die Weitergabe erfolgt über ``outbox_events``;
   Konsument ist gemäß Zielarchitektur Make (FastAPI→Make-Vertrag, siehe
   docs/integration/fastapi-make-event-contract.md).

DSGVO: Slack-Alerts werden über ``build_ops_alert_text`` erzeugt und enthalten
keine Spenderidentität — nur Betrag, Event-Typ und interne Correlation-ID
(Audit-Finding P1-002).
"""

from __future__ import annotations

import hashlib
import json
import logging
from typing import Any

from ..db import fetchrow, transaction

logger = logging.getLogger("menschlichkeit.payments.webhook_inbox")

# Verarbeitungsstatus der Inbox
STATUS_RECEIVED = "received"
STATUS_PROCESSING = "processing"
STATUS_PROCESSED = "processed"
STATUS_FAILED = "failed"

# Ein 'processing'-Claim, der älter ist, gilt als verwaist (Prozessabsturz)
# und darf erneut geclaimt werden.
STALE_CLAIM_MINUTES = 10

_RECURRING_INTERVALS = {"monthly", "quarterly", "yearly"}


def build_ops_alert_text(
    *,
    event_type: str,
    amount: float,
    currency: str,
    correlation_id: str,
) -> str:
    """Datensparsamer Slack-Alert-Text ohne personenbezogene Daten.

    Bewusst NICHT enthalten: Spender-E-Mail, Name, Stripe-IDs. Die Zuordnung
    zum Vorgang erfolgt intern über die Correlation-ID (= webhook_events.id).
    """
    return (
        "🚨 *Payment Failure Alert*\n"
        f"• Event: `{event_type}`\n"
        f"• Amount: `{amount:.2f} {currency}`\n"
        f"• Reference: `{correlation_id}`"
    )


class StripeWebhookInbox:
    """Durable Inbox für Stripe-Webhook-Events."""

    async def ingest(
        self,
        *,
        provider: str,
        provider_event_id: str,
        event_type: str | None,
        payload: dict[str, Any],
        signature_valid: bool,
    ) -> dict[str, Any]:
        """Speichert das Event atomar, bevor irgendetwas anderes passiert.

        Rückgabe: {"id": <uuid>, "status": <processing_status>, "created": bool}
        ``created=False`` bedeutet: das Event war bereits bekannt; ``status``
        ist dann der aktuelle Verarbeitungsstatus des vorhandenen Eintrags.
        """
        payload_hash = hashlib.sha256(
            json.dumps(payload, sort_keys=True).encode("utf-8")
        ).hexdigest()
        row = await fetchrow(
            """
            INSERT INTO webhook_events
                (provider, provider_event_id, event_type, payload_hash,
                 signature_valid, payload, processing_status)
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, 'received')
            ON CONFLICT (provider, provider_event_id) DO NOTHING
            RETURNING id
            """,
            provider,
            provider_event_id,
            event_type,
            payload_hash,
            signature_valid,
            json.dumps(payload),
        )
        if row:
            return {"id": str(row["id"]), "status": STATUS_RECEIVED, "created": True}

        existing = await fetchrow(
            """
            SELECT id, processing_status
            FROM webhook_events
            WHERE provider = $1 AND provider_event_id = $2
            """,
            provider,
            provider_event_id,
        )
        # Zwischen ON CONFLICT und SELECT kann der Eintrag praktisch nicht
        # verschwinden (Inbox löscht nie); defensiv trotzdem behandeln.
        if existing is None:  # pragma: no cover - Race ohne Lösch-Pfad
            raise RuntimeError("webhook_events Eintrag nach ON CONFLICT nicht auffindbar")
        return {
            "id": str(existing["id"]),
            "status": existing["processing_status"],
            "created": False,
        }

    async def claim(self, event_pk: str) -> bool:
        """Versucht, das Event exklusiv zur Verarbeitung zu übernehmen.

        Erfolgreich nur für status received/failed — oder für einen verwaisten
        processing-Claim (Prozessabsturz vor mark_processed/mark_failed).
        Atomar: von parallelen Requests gewinnt genau einer.
        """
        row = await fetchrow(
            f"""
            UPDATE webhook_events
            SET processing_status = 'processing',
                processing_started_at = NOW(),
                attempts = attempts + 1
            WHERE id = $1
              AND (
                    processing_status IN ('received', 'failed')
                    OR (processing_status = 'processing'
                        AND processing_started_at
                            < NOW() - INTERVAL '{STALE_CLAIM_MINUTES} minutes')
                  )
            RETURNING id
            """,
            event_pk,
        )
        return row is not None

    async def mark_processed(self, event_pk: str) -> None:
        await fetchrow(
            """
            UPDATE webhook_events
            SET processing_status = 'processed',
                processed_at = NOW(),
                last_error = NULL,
                next_retry_at = NULL
            WHERE id = $1
            RETURNING id
            """,
            event_pk,
        )

    async def mark_failed(self, event_pk: str, *, error: str) -> None:
        """Setzt failed + Fehlertext. Kein Secret/PII im Fehlertext ablegen."""
        await fetchrow(
            """
            UPDATE webhook_events
            SET processing_status = 'failed',
                last_error = $2,
                next_retry_at = NOW()
                    + (LEAST(attempts, 6) * INTERVAL '10 minutes')
            WHERE id = $1
            RETURNING id
            """,
            event_pk,
            error[:500],
        )


def _extract_metadata(obj: dict[str, Any]) -> dict[str, str]:
    meta = obj.get("metadata") or {}
    return {
        "email": (meta.get("email") or "").strip(),
        "name": (meta.get("name") or meta.get("donor_name") or "").strip(),
        "purpose": (meta.get("purpose") or "").strip(),
        "source": (meta.get("source") or "").strip(),
        "interval": (meta.get("interval") or "once").strip(),
        "financial_type": (meta.get("financial_type") or "").strip(),
    }


async def process_stripe_event(
    *,
    event_pk: str,
    event_type: str,
    obj: dict[str, Any],
) -> dict[str, Any]:
    """Führt die lokale Geschäftsverarbeitung in EINER Transaktion aus.

    Innerhalb der Transaktion passieren ausschließlich lokale
    PostgreSQL-Writes: Donation, payment_intents, Outbox. Keine HTTP-Aufrufe
    (CiviCRM, ERPNext, Mail, Slack) — die laufen über die Outbox bzw. nach
    dem Commit (Audit-Findings P1-006, Transaktionsgrenzen §33).

    Rückgabe beschreibt, welche Folgeeffekte der Aufrufer NACH dem Commit
    anstoßen soll (Mails), inklusive der dafür nötigen Daten.
    """
    side_effects: dict[str, Any] = {"event_type": event_type}

    async with transaction() as conn:
        if event_type == "payment_intent.succeeded":
            side_effects.update(
                await _process_payment_succeeded(conn, event_pk=event_pk, obj=obj)
            )
        elif event_type in ("payment_intent.payment_failed", "payment_intent.canceled"):
            side_effects.update(
                await _process_payment_failed(
                    conn, event_pk=event_pk, event_type=event_type, obj=obj
                )
            )
        # Unbekannte Event-Typen: bewusst kein Fehler — Event wird als
        # processed markiert (Inbox vollständig), Verarbeitung ist ein No-Op.

    return side_effects


async def _process_payment_succeeded(
    conn: Any, *, event_pk: str, obj: dict[str, Any]
) -> dict[str, Any]:
    meta = _extract_metadata(obj)
    gateway_payment_id = obj.get("id") or ""
    amount = float(obj.get("amount_received", obj.get("amount", 0))) / 100
    currency = (obj.get("currency") or "eur").upper()
    interval = meta["interval"]
    is_recurring = interval in _RECURRING_INTERVALS
    donation_type = "recurring" if is_recurring else "one_time"

    # Idempotenz auf DB-Ebene: Der partielle Unique-Index
    # ux_donations_gateway_payment macht die zweite Buchung unmöglich —
    # auch bei parallelen Events, die die Inbox-Dedup theoretisch passieren.
    donation_row = await conn.fetchrow(
        """
        INSERT INTO donations (
            civicrm_contact_id, donor_name, donor_email, amount, currency,
            donation_type, is_recurring, status, donation_date,
            receipt_eligible, source, purpose,
            gateway_provider, gateway_payment_id, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'paid', CURRENT_DATE,
                TRUE, $8, $9, 'stripe', $10, $10)
        ON CONFLICT (gateway_provider, gateway_payment_id)
            WHERE gateway_payment_id IS NOT NULL
        DO NOTHING
        RETURNING id, amount, currency, donation_type, donation_date
        """,
        None,  # CRM-Auflösung erfolgt asynchron über die Outbox (kein HTTP hier)
        meta["name"] or "Spender/in",
        meta["email"],
        amount,
        currency,
        donation_type,
        is_recurring,
        meta["source"] or "stripe",
        meta["purpose"] or None,
        gateway_payment_id,
    )

    if donation_row is None:
        # Spende existiert bereits (z. B. paralleles Duplikat) → keine
        # zweite Verbuchung, keine zweite Mail, kein zweites Outbox-Event.
        logger.info(
            "donation_duplicate_skipped | correlation_id=%s", event_pk
        )
        return {"donation_created": False}

    donation_id = donation_row["id"]

    await conn.execute(
        """
        UPDATE payment_intents
        SET status = 'succeeded', donation_id = $1, updated_at = NOW()
        WHERE gateway_intent_id = $2
        """,
        donation_id,
        gateway_payment_id,
    )

    await conn.execute(
        """
        INSERT INTO outbox_events (event_type, aggregate_type, aggregate_id, payload)
        VALUES ('donation.recorded', 'donation', $1, $2::jsonb)
        """,
        str(donation_id),
        json.dumps(
            {
                "schema_version": 1,
                "correlation_id": event_pk,
                "idempotency_key": f"donation.recorded:{donation_id}",
                "donation_id": donation_id,
                "amount": f"{amount:.2f}",
                "currency": currency,
                "donation_type": donation_type,
                "interval": interval,
                "purpose": meta["purpose"] or None,
                "source": meta["source"] or "stripe",
                "financial_type": meta["financial_type"] or None,
                "donor_email": meta["email"] or None,
                "donor_name": meta["name"] or None,
                "gateway_provider": "stripe",
                "gateway_payment_id": gateway_payment_id,
                # FastAPI versendet die Dankesmail übergangsweise selbst
                # (nach Commit); Make darf sie nicht erneut senden.
                "receipt_email_sent_by_api": bool(meta["email"]),
            }
        ),
    )

    return {
        "donation_created": True,
        "donation_id": donation_id,
        "amount": amount,
        "currency": currency,
        "donor_email": meta["email"],
        "donor_name": meta["name"],
        "purpose": meta["purpose"],
        "donation_date": str(donation_row["donation_date"]),
    }


async def _process_payment_failed(
    conn: Any, *, event_pk: str, event_type: str, obj: dict[str, Any]
) -> dict[str, Any]:
    meta = _extract_metadata(obj)
    gateway_intent_id = obj.get("id") or ""
    amount = float(obj.get("amount", 0)) / 100
    currency = (obj.get("currency") or "eur").upper()
    new_status = "failed" if event_type == "payment_intent.payment_failed" else "canceled"

    if gateway_intent_id:
        await conn.execute(
            """
            UPDATE payment_intents
            SET status = $1, updated_at = NOW()
            WHERE gateway_intent_id = $2
            """,
            new_status,
            gateway_intent_id,
        )

    await conn.execute(
        """
        INSERT INTO outbox_events (event_type, aggregate_type, aggregate_id, payload)
        VALUES ('payment.failed', 'payment_intent', $1, $2::jsonb)
        """,
        gateway_intent_id or event_pk,
        json.dumps(
            {
                "schema_version": 1,
                "correlation_id": event_pk,
                "idempotency_key": f"payment.failed:{event_pk}",
                "status": new_status,
                "amount": f"{amount:.2f}",
                "currency": currency,
                "donor_email": meta["email"] or obj.get("receipt_email") or None,
                "failure_reason": (obj.get("last_payment_error") or {}).get("message"),
                "gateway_provider": "stripe",
                "gateway_intent_id": gateway_intent_id or None,
            }
        ),
    )

    return {
        "payment_failed": event_type == "payment_intent.payment_failed",
        "amount": amount,
        "currency": currency,
        "donor_email": meta["email"] or obj.get("receipt_email") or "",
        "failure_reason": (obj.get("last_payment_error") or {}).get("message"),
    }


stripe_webhook_inbox = StripeWebhookInbox()
