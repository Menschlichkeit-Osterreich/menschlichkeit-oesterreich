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
import secrets
from typing import Any

from ..db import fetchrow, transaction

logger = logging.getLogger("menschlichkeit.payments.webhook_inbox")

# Verarbeitungsstatus der Inbox
STATUS_RECEIVED = "received"
STATUS_PROCESSING = "processing"
STATUS_PROCESSED = "processed"
STATUS_FAILED = "failed"

# Ein 'processing'-Claim, der älter ist, gilt als verwaist (Prozessabsturz)
# und darf erneut geclaimt werden.  Der Lease-Token verhindert, dass ein
# verspäteter Worker danach den Zustand eines neueren Workers überschreibt.
STALE_CLAIM_MINUTES = 10

SUPPORTED_PAYMENT_INTENT_EVENT_TYPES = frozenset(
    {
        "payment_intent.succeeded",
        "payment_intent.payment_failed",
        "payment_intent.canceled",
    }
)


class WebhookClaimLost(RuntimeError):
    """A worker lost its lease; its local transaction must roll back."""


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

    async def claim(self, event_pk: str) -> str | None:
        """Versucht, das Event exklusiv zur Verarbeitung zu übernehmen.

        Erfolgreich nur für status received/failed — oder für einen verwaisten
        processing-Claim (Prozessabsturz vor mark_processed/mark_failed).
        Atomar: von parallelen Requests gewinnt genau einer.  Der Rückgabewert
        ist ein Lease-Token und muss beim finalen Statuswechsel vorliegen.
        """
        claim_token = secrets.token_urlsafe(24)
        row = await fetchrow(
            f"""
            UPDATE webhook_events
            SET processing_status = 'processing',
                processing_started_at = NOW(),
                claim_token = $2,
                claim_expires_at = NOW() + INTERVAL '{STALE_CLAIM_MINUTES} minutes',
                attempts = attempts + 1
            WHERE id = $1
              AND (
                    processing_status IN ('received', 'failed')
                    OR (processing_status = 'processing'
                        AND (
                            claim_expires_at < NOW()
                            OR (
                                claim_expires_at IS NULL
                                AND processing_started_at
                                    < NOW() - INTERVAL '{STALE_CLAIM_MINUTES} minutes'
                            )
                        ))
                  )
            RETURNING claim_token
            """,
            event_pk,
            claim_token,
        )
        return str(row["claim_token"]) if row else None

    async def mark_processed(self, event_pk: str, *, claim_token: str) -> bool:
        row = await fetchrow(
            """
            UPDATE webhook_events
            SET processing_status = 'processed',
                processed_at = NOW(),
                last_error = NULL,
                next_retry_at = NULL,
                claim_expires_at = NULL
            WHERE id = $1
              AND processing_status = 'processing'
              AND claim_token = $2
            RETURNING id
            """,
            event_pk,
            claim_token,
        )
        return row is not None

    async def mark_failed(
        self, event_pk: str, *, claim_token: str, error: str
    ) -> None:
        """Setzt failed + Fehlertext. Kein Secret/PII im Fehlertext ablegen."""
        await fetchrow(
            """
            UPDATE webhook_events
            SET processing_status = 'failed',
                last_error = $2,
                next_retry_at = NOW()
                    + (LEAST(attempts, 6) * INTERVAL '10 minutes'),
                claim_expires_at = NULL
            WHERE id = $1
              AND processing_status = 'processing'
              AND claim_token = $3
            RETURNING id
            """,
            event_pk,
            error[:500],
            claim_token,
        )


def _extract_metadata(obj: dict[str, Any]) -> dict[str, str]:
    meta = obj.get("metadata") or {}
    return {
        "email": (meta.get("email") or "").strip(),
        "name": (meta.get("name") or meta.get("donor_name") or "").strip(),
        "purpose": (meta.get("purpose") or "").strip(),
        "source": (meta.get("source") or "").strip(),
        "financial_type": (meta.get("financial_type") or "").strip(),
    }


def normalize_stripe_event_for_inbox(
    *, event_type: str, obj: dict[str, Any]
) -> dict[str, Any]:
    """Return the only provider-derived data retained by new inbox rows.

    ``webhook_events.payload`` is a historic column.  Existing payloads remain
    untouched, but new writes store a small, normalized envelope rather than a
    full Stripe object.  PII, provider metadata and error text stay out of the
    inbox; the signed request is processed in memory only.
    """
    amount_cents = obj.get("amount_received", obj.get("amount"))
    return {
        "schema_version": 2,
        "event_type": event_type,
        "payment_intent_id": str(obj.get("id") or "") or None,
        "amount_cents": int(amount_cents) if isinstance(amount_cents, int) else None,
        "currency": str(obj.get("currency") or "").upper() or None,
    }


async def process_stripe_event(
    *,
    event_pk: str,
    claim_token: str,
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
        # Der finale Inbox-Status gehört zur selben lokalen Transaktion wie
        # Donation und Outbox.  Verliert ein Worker den Lease, löst die
        # Ausnahme ein Rollback aller seiner lokalen Änderungen aus.
        result = await conn.execute(
            """
            UPDATE webhook_events
            SET processing_status = 'processed',
                processed_at = NOW(),
                last_error = NULL,
                next_retry_at = NULL,
                claim_expires_at = NULL
            WHERE id = $1
              AND processing_status = 'processing'
              AND claim_token = $2
            """,
            event_pk,
            claim_token,
        )
        if result.endswith("0"):
            raise WebhookClaimLost("Stripe webhook lease is no longer current")

    return side_effects


async def _process_payment_succeeded(
    conn: Any, *, event_pk: str, obj: dict[str, Any]
) -> dict[str, Any]:
    meta = _extract_metadata(obj)
    gateway_payment_id = obj.get("id") or ""
    amount = float(obj.get("amount_received", obj.get("amount", 0))) / 100
    currency = (obj.get("currency") or "eur").upper()
    # A PaymentIntent is one charge.  Historical metadata such as
    # ``interval=monthly`` must not turn it into an undocumented Subscription.
    donation_type = "one_time"

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
                FALSE, $8, $9, 'stripe', $10, $10)
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
        False,
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
        INSERT INTO outbox_events (
            event_type, aggregate_type, aggregate_id, payload, idempotency_key
        )
        VALUES ('donation.recorded', 'donation', $1, $2::jsonb, $3)
        ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
        """,
        str(donation_id),
        json.dumps(
            {
                "schema_version": 2,
                "correlation_id": event_pk,
                "idempotency_key": f"donation.recorded:{donation_id}",
                "donation_id": donation_id,
                "amount": f"{amount:.2f}",
                "currency": currency,
                "donation_type": "one_time",
                "purpose": meta["purpose"] or None,
                "source": meta["source"] or "stripe",
                "donor": {
                    "email": meta["email"] or None,
                    "name": meta["name"] or None,
                },
                "gateway_provider": "stripe",
                "gateway_payment_id": gateway_payment_id,
                "receipt_eligibility": "undecided",
            }
        ),
        f"donation.recorded:{donation_id}",
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

    outbox_event_type = (
        "payment.failed"
        if event_type == "payment_intent.payment_failed"
        else "payment.canceled"
    )
    idempotency_key = f"{outbox_event_type}:{event_pk}"
    await conn.execute(
        """
        INSERT INTO outbox_events (
            event_type, aggregate_type, aggregate_id, payload, idempotency_key
        )
        VALUES ($1, 'payment_intent', $2, $3::jsonb, $4)
        ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
        """,
        outbox_event_type,
        gateway_intent_id or event_pk,
        json.dumps(
            {
                "schema_version": 2,
                "correlation_id": event_pk,
                "idempotency_key": idempotency_key,
                "status": new_status,
                "amount": f"{amount:.2f}",
                "currency": currency,
                "donor_email": meta["email"] or obj.get("receipt_email") or None,
                "gateway_provider": "stripe",
                "gateway_intent_id": gateway_intent_id or None,
            }
        ),
        idempotency_key,
    )

    return {
        "payment_failed": event_type == "payment_intent.payment_failed",
        "amount": amount,
        "currency": currency,
        "donor_email": meta["email"] or obj.get("receipt_email") or "",
        "failure_reason": (obj.get("last_payment_error") or {}).get("message"),
    }


stripe_webhook_inbox = StripeWebhookInbox()
