"""
Menschlichkeit Österreich – Members Router
Issues #119 (Auth/Dashboard), #121 (GDPR-Dashboard & Profil)

Endpunkte:
  GET  /api/members/me/profile          → Eigenes Profil
  PUT  /api/members/me/profile          → Profil aktualisieren
  GET  /api/members/me/invoices         → Eigene Rechnungen
  GET  /api/members/me/donations        → Eigene Spenden
  POST /api/members/me/data-export      → DSGVO-Datenexport anfordern
  POST /api/members/me/delete-request   → Löschantrag (DSGVO Art. 17)
"""

from __future__ import annotations

import logging
import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field

from ..db import get_db
from .auth import get_current_user

logger = logging.getLogger("menschlichkeit.api.members")

router = APIRouter(prefix="/api/members", tags=["Mitglieder"])


# ── Pydantic-Modelle ────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name:  str | None = Field(default=None, min_length=1, max_length=100)
    phone:      str | None = Field(default=None, max_length=30)

class InvoiceItem(BaseModel):
    id:             int
    invoice_number: str
    total_amount:   float
    currency:       str
    issue_date:     str
    due_date:       str
    status:         str
    invoice_type:   str
    pdf_path:       str | None

class DonationItem(BaseModel):
    id:            int
    amount:        float
    currency:      str
    donation_type: str
    status:        str
    donation_date: str
    receipt_eligible: bool

class DataExportRequest(BaseModel):
    reason: str | None = None

class DeleteRequest(BaseModel):
    reason:   str
    confirm:  bool = Field(description="Muss true sein um zu bestätigen")


# ── Endpunkte ───────────────────────────────────────────────────────────────

@router.get("/me/profile", summary="Eigenes Profil abrufen")
async def get_profile(
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """Gibt Profildaten des aktuell eingeloggten Mitglieds zurück."""
    return {
        "id":         current_user["id"],
        "email":      current_user["email"],
        "first_name": current_user["first_name"],
        "last_name":  current_user["last_name"],
        "role":       current_user["role"],
        "civicrm_id": current_user.get("civicrm_contact_id"),
    }


@router.put("/me/profile", summary="Eigenes Profil aktualisieren")
async def update_profile(
    body: ProfileUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """Aktualisiert Vorname, Nachname und/oder Telefonnummer."""
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Keine Felder zum Aktualisieren angegeben.")

    set_clauses = ", ".join(
        f"{col} = ${i + 2}" for i, col in enumerate(updates.keys())
    )
    values = [current_user["id"]] + list(updates.values())

    await db.execute(
        f"UPDATE users SET {set_clauses}, updated_at = NOW() WHERE id = $1",
        *values,
    )
    logger.info(f"Profil aktualisiert: user_id={current_user['id']} felder={list(updates.keys())}")
    return {"message": "Profil erfolgreich aktualisiert."}


@router.get("/me/invoices", response_model=list[InvoiceItem], summary="Eigene Rechnungen")
async def get_my_invoices(
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """Gibt alle Rechnungen des aktuellen Mitglieds zurück."""
    contact_id = current_user.get("civicrm_contact_id")
    if not contact_id:
        return []

    rows = await db.fetch(
        """
        SELECT id, invoice_number, total_amount, currency,
               issue_date::text, due_date::text, status, invoice_type, pdf_path
        FROM invoices
        WHERE civicrm_contact_id = $1
        ORDER BY issue_date DESC
        LIMIT 50
        """,
        contact_id,
    )
    return [dict(r) for r in rows]


@router.get("/me/donations", response_model=list[DonationItem], summary="Eigene Spenden")
async def get_my_donations(
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """Gibt alle Spenden des aktuellen Mitglieds zurück."""
    contact_id = current_user.get("civicrm_contact_id")
    if not contact_id:
        return []

    rows = await db.fetch(
        """
        SELECT id, amount, currency, donation_type, status,
               donation_date::text, receipt_eligible
        FROM donations
        WHERE civicrm_contact_id = $1
        ORDER BY donation_date DESC
        LIMIT 50
        """,
        contact_id,
    )
    return [dict(r) for r in rows]


@router.post("/me/data-export", status_code=status.HTTP_202_ACCEPTED,
             summary="DSGVO-Datenexport anfordern (Art. 15)")
async def request_data_export(
    body: DataExportRequest,
    background_tasks: BackgroundTasks,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """
    Löst einen DSGVO-Datenexport (Art. 15) aus.
    Der Export wird per E-Mail innerhalb von 30 Tagen zugesendet.
    Wird via n8n-Webhook ausgeführt.
    """
    background_tasks.add_task(
        _trigger_data_export,
        current_user["id"],
        current_user["email"],
        current_user["first_name"],
    )
    logger.info(f"Datenexport angefordert: user_id={current_user['id']}")

    await db.execute(
        """
        INSERT INTO audit_log (actor, action, entity_type, entity_id, notes)
        VALUES ($1, 'data_export_requested', 'user', $2, $3)
        """,
        current_user["email"],
        str(current_user["id"]),
        body.reason,
    )
    return {"message": "Ihr Datenexport wurde angefordert. Sie erhalten in Kürze eine E-Mail."}


@router.post("/me/delete-request", status_code=status.HTTP_202_ACCEPTED,
             summary="Löschantrag stellen (DSGVO Art. 17)")
async def request_account_deletion(
    body: DeleteRequest,
    background_tasks: BackgroundTasks,
    current_user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
):
    """
    Stellt einen DSGVO-Löschantrag (Art. 17).
    Wird manuell vom Admin-Team geprüft und ausgeführt.
    """
    if not body.confirm:
        raise HTTPException(
            status_code=400,
            detail="Bitte bestätigen Sie den Löschantrag indem Sie 'confirm' auf true setzen.",
        )

    await db.execute(
        """
        INSERT INTO audit_log (actor, action, entity_type, entity_id, notes)
        VALUES ($1, 'deletion_requested', 'user', $2, $3)
        """,
        current_user["email"],
        str(current_user["id"]),
        body.reason,
    )

    background_tasks.add_task(
        _notify_admin_deletion_request,
        current_user["id"],
        current_user["email"],
        body.reason,
    )

    logger.info(f"Löschantrag gestellt: user_id={current_user['id']}")
    return {
        "message": (
            "Ihr Löschantrag wurde eingereicht. Das Admin-Team wird sich innerhalb von 30 Tagen "
            "bei Ihnen melden."
        )
    }


# ── Hintergrund-Tasks ───────────────────────────────────────────────────────

async def _trigger_data_export(user_id: int, email: str, first_name: str) -> None:
    """Sendet Datenexport-Anfrage an n8n-Webhook."""
    import httpx
    n8n_url = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(f"{n8n_url}/webhook/dsgvo-data-export", json={
                "user_id":    user_id,
                "email":      email,
                "first_name": first_name,
            })
    except Exception as exc:
        logger.error(f"Fehler beim Auslösen des Datenexports für user_id={user_id}: {exc}")


async def _notify_admin_deletion_request(user_id: int, email: str, reason: str) -> None:
    """Benachrichtigt Admin-Team über Löschantrag via n8n-Webhook."""
    import httpx
    n8n_url = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(f"{n8n_url}/webhook/dsgvo-deletion-request", json={
                "user_id": user_id,
                "email":   email,
                "reason":  reason,
            })
    except Exception as exc:
        logger.error(f"Fehler beim Senden des Löschantrags für user_id={user_id}: {exc}")
