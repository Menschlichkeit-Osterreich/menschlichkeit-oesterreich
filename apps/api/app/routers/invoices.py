"""
Menschlichkeit Österreich – Invoices & Finance Router
Issue #136 (Stripe), #137 (SEPA), #143 (Stripe→CiviCRM)

Endpunkte:
  GET  /api/invoices                    → Liste (Admin: alle, Mitglied: eigene)
  GET  /api/invoices/{id}              → Einzelne Rechnung
  GET  /api/invoices/{id}/download     → PDF-Download-URL
  POST /api/invoices/{id}/send         → Rechnung per E-Mail versenden
  GET  /api/donations                  → Spendenübersicht (Admin)
  GET  /api/donations/{id}             → Einzelne Spende
  GET  /api/sepa/mandates              → SEPA-Mandate (Admin)
  GET  /api/sepa/batches               → SEPA-Batches (Admin)
  POST /api/sepa/batches               → Neuen SEPA-Batch anlegen
"""

from __future__ import annotations

import logging
import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from pydantic import BaseModel

from ..db import get_db
from .auth import get_current_user

logger = logging.getLogger("menschlichkeit.api.invoices")

router = APIRouter(tags=["Finanzen"])

ADMIN_ROLES = {"admin", "finance", "staff"}


def _require_admin(current_user: dict) -> None:
    if current_user["role"] not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Zugriff verweigert. Nur für Administratoren.",
        )


# ── Invoice-Modelle ─────────────────────────────────────────────────────────

class InvoiceSendRequest(BaseModel):
    email: str | None = None  # Wenn None: an recipient_email der Rechnung


class SepaBatchCreate(BaseModel):
    collection_date: str   # ISO-Date: YYYY-MM-DD
    batch_type:      str = "RCUR"
    mandate_ids:     list[int]


# ── Rechnungen ───────────────────────────────────────────────────────────────

@router.get("/invoices", summary="Rechnungen auflisten")
async def list_invoices(
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=25, ge=1, le=100),
):
    """
    Admins sehen alle Rechnungen.
    Mitglieder sehen nur ihre eigenen (via civicrm_contact_id).
    """
    offset = (page - 1) * per_page
    is_admin = current_user["role"] in ADMIN_ROLES

    if is_admin:
        where = "WHERE 1=1"
        params: list = []
        if status_filter:
            params.append(status_filter)
            where += f" AND status = ${len(params)}"
        params += [per_page, offset]
        limit_clause = f"LIMIT ${len(params) - 1} OFFSET ${len(params)}"
    else:
        contact_id = current_user.get("civicrm_contact_id")
        if not contact_id:
            return {"invoices": [], "total": 0, "page": page}
        where = "WHERE civicrm_contact_id = $1"
        params = [contact_id]
        if status_filter:
            params.append(status_filter)
            where += f" AND status = ${len(params)}"
        params += [per_page, offset]
        limit_clause = f"LIMIT ${len(params) - 1} OFFSET ${len(params)}"

    rows = await db.fetch(
        f"""
        SELECT id, invoice_number, recipient_name, recipient_email,
               total_amount, currency, issue_date::text, due_date::text,
               status, invoice_type, pdf_path, civicrm_contact_id
        FROM invoices
        {where}
        ORDER BY issue_date DESC
        {limit_clause}
        """,
        *params,
    )
    return {"invoices": [dict(r) for r in rows], "page": page}


@router.get("/invoices/{invoice_id}", summary="Einzelne Rechnung")
async def get_invoice(
    invoice_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    row = await db.fetchrow(
        "SELECT * FROM invoices WHERE id = $1",
        invoice_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Rechnung nicht gefunden.")

    is_admin = current_user["role"] in ADMIN_ROLES
    if not is_admin:
        contact_id = current_user.get("civicrm_contact_id")
        if row["civicrm_contact_id"] != contact_id:
            raise HTTPException(status_code=403, detail="Zugriff verweigert.")

    items = await db.fetch(
        "SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY position",
        invoice_id,
    )
    result = dict(row)
    result["items"] = [dict(i) for i in items]
    return result


@router.get("/invoices/{invoice_id}/download", summary="PDF-Download-URL")
async def download_invoice(
    invoice_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """Gibt eine vorzeichnete URL für das Rechnungs-PDF zurück."""
    row = await db.fetchrow(
        "SELECT civicrm_contact_id, pdf_path FROM invoices WHERE id = $1",
        invoice_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Rechnung nicht gefunden.")

    is_admin = current_user["role"] in ADMIN_ROLES
    if not is_admin and row["civicrm_contact_id"] != current_user.get("civicrm_contact_id"):
        raise HTTPException(status_code=403, detail="Zugriff verweigert.")

    if not row["pdf_path"]:
        raise HTTPException(status_code=404, detail="Kein PDF verfügbar.")

    # In Produktion: vorgezeichnete S3/MinIO-URL generieren
    base_url = os.getenv("STORAGE_BASE_URL", "https://api.menschlichkeit-oesterreich.at/storage")
    return {"url": f"{base_url}/{row['pdf_path']}", "expires_in": 3600}


@router.post("/invoices/{invoice_id}/send", summary="Rechnung per E-Mail versenden")
async def send_invoice(
    invoice_id: int,
    body: InvoiceSendRequest,
    background_tasks: BackgroundTasks,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    _require_admin(current_user)

    row = await db.fetchrow(
        "SELECT id, invoice_number, recipient_email, recipient_name FROM invoices WHERE id = $1",
        invoice_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Rechnung nicht gefunden.")

    target_email = body.email or row["recipient_email"]
    background_tasks.add_task(_send_invoice_email, dict(row), target_email)
    logger.info(f"Rechnung {row['invoice_number']} an {target_email} versenden")
    return {"message": f"Rechnung wird an {target_email} gesendet."}


# ── Spenden ──────────────────────────────────────────────────────────────────

@router.get("/donations", summary="Spenden auflisten (Admin)")
async def list_donations(
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=25, ge=1, le=100),
):
    _require_admin(current_user)
    offset = (page - 1) * per_page

    rows = await db.fetch(
        """
        SELECT id, donor_name, donor_email, amount, currency,
               donation_type, status, donation_date::text, receipt_eligible, source
        FROM donations
        ORDER BY donation_date DESC
        LIMIT $1 OFFSET $2
        """,
        per_page, offset,
    )
    return {"donations": [dict(r) for r in rows], "page": page}


@router.get("/donations/{donation_id}", summary="Einzelne Spende")
async def get_donation(
    donation_id: int,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    _require_admin(current_user)
    row = await db.fetchrow("SELECT * FROM donations WHERE id = $1", donation_id)
    if not row:
        raise HTTPException(status_code=404, detail="Spende nicht gefunden.")
    return dict(row)


# ── SEPA ─────────────────────────────────────────────────────────────────────

@router.get("/sepa/mandates", summary="SEPA-Mandate (Admin)")
async def list_sepa_mandates(
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
    active_only: bool = Query(default=True),
):
    _require_admin(current_user)

    where = "WHERE is_active = true" if active_only else ""
    rows = await db.fetch(
        f"""
        SELECT id, civicrm_contact_id, mandate_reference, mandate_type,
               iban, bic, account_holder, signed_date::text, is_active
        FROM sepa_mandates
        {where}
        ORDER BY signed_date DESC
        """,
    )
    return {"mandates": [dict(r) for r in rows]}


@router.get("/sepa/batches", summary="SEPA-Batches (Admin)")
async def list_sepa_batches(
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    _require_admin(current_user)

    rows = await db.fetch(
        """
        SELECT id, batch_reference, batch_type, collection_date::text,
               total_amount, mandate_count, status, submitted_at, created_at
        FROM sepa_batches
        ORDER BY collection_date DESC
        LIMIT 50
        """,
    )
    return {"batches": [dict(r) for r in rows]}


@router.post("/sepa/batches", status_code=status.HTTP_201_CREATED,
             summary="Neuen SEPA-Batch anlegen")
async def create_sepa_batch(
    body: SepaBatchCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """
    Legt einen neuen SEPA-Sammellastschrift-Batch an.
    Die PAIN.008-XML-Generierung erfolgt via n8n-Workflow.
    """
    _require_admin(current_user)

    if not body.mandate_ids:
        raise HTTPException(status_code=400, detail="Mindestens ein Mandat erforderlich.")

    # Mandate validieren
    mandates = await db.fetch(
        "SELECT id FROM sepa_mandates WHERE id = ANY($1::int[]) AND is_active = true",
        body.mandate_ids,
    )
    if len(mandates) != len(body.mandate_ids):
        raise HTTPException(
            status_code=400,
            detail="Einige Mandate sind ungültig oder inaktiv.",
        )

    import secrets
    batch_ref = f"MOE-{body.collection_date.replace('-', '')}-{secrets.token_hex(4).upper()}"

    batch_id = await db.fetchval(
        """
        INSERT INTO sepa_batches (batch_reference, batch_type, collection_date, total_amount, mandate_count, status)
        VALUES ($1, $2, $3, 0, $4, 'pending')
        RETURNING id
        """,
        batch_ref, body.batch_type, body.collection_date, len(body.mandate_ids),
    )

    logger.info(
        f"SEPA-Batch erstellt: id={batch_id} ref={batch_ref} "
        f"mandate={len(body.mandate_ids)} datum={body.collection_date}"
    )
    return {
        "id":              batch_id,
        "batch_reference": batch_ref,
        "message":         "SEPA-Batch angelegt. PAIN.008-XML wird generiert.",
    }


# ── Hintergrund-Tasks ────────────────────────────────────────────────────────

async def _send_invoice_email(invoice: dict, recipient_email: str) -> None:
    """Sendet Rechnung via n8n-Webhook."""
    import httpx
    n8n_url = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(f"{n8n_url}/webhook/send-invoice", json={
                "invoice_id":     invoice["id"],
                "invoice_number": invoice["invoice_number"],
                "recipient_email": recipient_email,
                "recipient_name":  invoice["recipient_name"],
            })
    except Exception as exc:
        logger.error(f"Fehler beim Senden der Rechnung {invoice['invoice_number']}: {exc}")
