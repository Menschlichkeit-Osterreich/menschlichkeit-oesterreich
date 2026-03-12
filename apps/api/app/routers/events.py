from __future__ import annotations

import logging
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..db import fetch, fetchrow, fetchval, execute
from ..rbac import Role, require_auth, require_role
from ..schemas.events import (
    EventCreate,
    EventListResponse,
    EventResponse,
    EventRsvpRequest,
    EventRsvpResponse,
    EventUpdate,
)

logger = logging.getLogger("menschlichkeit.events")
router = APIRouter()


async def _ensure_events_tables() -> None:
    await execute("""
        CREATE TABLE IF NOT EXISTS events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            titel TEXT NOT NULL,
            beschreibung TEXT NOT NULL,
            ort TEXT,
            start_datum TIMESTAMPTZ NOT NULL,
            end_datum TIMESTAMPTZ,
            max_teilnehmer INTEGER,
            kategorie TEXT DEFAULT 'Allgemein',
            ist_oeffentlich BOOLEAN DEFAULT TRUE,
            ersteller_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)
    await execute("""
        CREATE TABLE IF NOT EXISTS event_rsvps (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id UUID REFERENCES events(id) ON DELETE CASCADE,
            user_id UUID NOT NULL,
            status TEXT DEFAULT 'angemeldet',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(event_id, user_id)
        );
    """)


def _row_to_response(r: dict) -> EventResponse:
    return EventResponse(
        id=str(r["id"]), titel=r["titel"], beschreibung=r["beschreibung"],
        ort=r.get("ort"), start_datum=str(r["start_datum"]),
        end_datum=str(r["end_datum"]) if r.get("end_datum") else None,
        max_teilnehmer=r.get("max_teilnehmer"),
        aktuelle_teilnehmer=int(r.get("aktuelle_teilnehmer", 0)),
        kategorie=r.get("kategorie", "Allgemein"),
        ist_oeffentlich=r.get("ist_oeffentlich", True),
        ersteller_id=str(r["ersteller_id"]),
        ersteller_name=r.get("ersteller_name", "Unbekannt"),
        created_at=str(r["created_at"]), updated_at=str(r["updated_at"]),
    )


@router.get("/events", response_model=EventListResponse)
async def list_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    kategorie: str = Query("", max_length=100),
    nur_oeffentlich: bool = Query(True),
):
    await _ensure_events_tables()
    conditions = ["1=1"]
    params: list = []
    idx = 1

    if nur_oeffentlich:
        conditions.append("e.ist_oeffentlich = TRUE")

    if kategorie:
        conditions.append(f"e.kategorie = ${idx}")
        params.append(kategorie)
        idx += 1

    where = " AND ".join(conditions)
    total = await fetchval(f"SELECT COUNT(*) FROM events e WHERE {where}", *params) or 0

    params.append(page_size)
    params.append((page - 1) * page_size)
    rows = await fetch(f"""
        SELECT e.*, m.vorname || ' ' || m.nachname AS ersteller_name,
               COALESCE((SELECT COUNT(*) FROM event_rsvps r WHERE r.event_id = e.id AND r.status = 'angemeldet'), 0) AS aktuelle_teilnehmer
        FROM events e
        LEFT JOIN members m ON e.ersteller_id = m.id
        WHERE {where}
        ORDER BY e.start_datum ASC
        LIMIT ${idx} OFFSET ${idx+1}
    """, *params)

    return EventListResponse(data=[_row_to_response(dict(r)) for r in rows], total=int(total))


@router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    await _ensure_events_tables()
    row = await fetchrow("""
        SELECT e.*, m.vorname || ' ' || m.nachname AS ersteller_name,
               COALESCE((SELECT COUNT(*) FROM event_rsvps r WHERE r.event_id = e.id AND r.status = 'angemeldet'), 0) AS aktuelle_teilnehmer
        FROM events e
        LEFT JOIN members m ON e.ersteller_id = m.id
        WHERE e.id = $1::uuid
    """, event_id)
    if not row:
        raise HTTPException(status_code=404, detail="Veranstaltung nicht gefunden")
    return _row_to_response(dict(row))


@router.post("/events", response_model=EventResponse, status_code=201)
async def create_event(body: EventCreate, user: dict = require_role(Role.MODERATOR)):
    await _ensure_events_tables()
    eid = str(uuid4())
    uid = user.get("uid", str(uuid4()))
    await execute(
        """INSERT INTO events (id, titel, beschreibung, ort, start_datum, end_datum, max_teilnehmer, kategorie, ist_oeffentlich, ersteller_id)
           VALUES ($1::uuid, $2, $3, $4, $5::timestamptz, $6::timestamptz, $7, $8, $9, $10::uuid)""",
        eid, body.titel, body.beschreibung, body.ort,
        body.start_datum, body.end_datum, body.max_teilnehmer,
        body.kategorie, body.ist_oeffentlich, uid,
    )
    return await get_event(eid)


@router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(event_id: str, body: EventUpdate, user: dict = require_role(Role.MODERATOR)):
    await _ensure_events_tables()
    row = await fetchrow("SELECT * FROM events WHERE id = $1::uuid", event_id)
    if not row:
        raise HTTPException(status_code=404, detail="Veranstaltung nicht gefunden")

    updates = {}
    for field in ("titel", "beschreibung", "ort", "start_datum", "end_datum", "max_teilnehmer", "kategorie", "ist_oeffentlich"):
        val = getattr(body, field, None)
        if val is not None:
            updates[field] = val

    if updates:
        set_clauses = []
        params = []
        for i, (key, val) in enumerate(updates.items(), 1):
            if key in ("start_datum", "end_datum"):
                set_clauses.append(f"{key} = ${i}::timestamptz")
            else:
                set_clauses.append(f"{key} = ${i}")
            params.append(val)
        params.append(event_id)
        await execute(
            f"UPDATE events SET {', '.join(set_clauses)}, updated_at = NOW() WHERE id = ${len(params)}::uuid",
            *params,
        )
    return await get_event(event_id)


@router.delete("/events/{event_id}")
async def delete_event(event_id: str, user: dict = require_role(Role.ADMIN)):
    await execute("DELETE FROM events WHERE id = $1::uuid", event_id)
    return {"success": True, "message": "Veranstaltung gelöscht"}


@router.post("/events/{event_id}/rsvp", response_model=EventRsvpResponse)
async def rsvp_event(event_id: str, user: dict = Depends(require_auth)):
    await _ensure_events_tables()
    event = await fetchrow("SELECT * FROM events WHERE id = $1::uuid", event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Veranstaltung nicht gefunden")

    event_dict = dict(event)
    uid = user.get("uid")

    existing = await fetchrow(
        "SELECT * FROM event_rsvps WHERE event_id = $1::uuid AND user_id = $2::uuid", event_id, uid
    )
    if existing:
        await execute("DELETE FROM event_rsvps WHERE event_id = $1::uuid AND user_id = $2::uuid", event_id, uid)
        count = await fetchval("SELECT COUNT(*) FROM event_rsvps WHERE event_id = $1::uuid AND status = 'angemeldet'", event_id) or 0
        return EventRsvpResponse(message="Abmeldung erfolgreich", teilnehmer_count=int(count))

    if event_dict.get("max_teilnehmer"):
        current = await fetchval(
            "SELECT COUNT(*) FROM event_rsvps WHERE event_id = $1::uuid AND status = 'angemeldet'", event_id
        ) or 0
        if int(current) >= event_dict["max_teilnehmer"]:
            raise HTTPException(status_code=409, detail="Veranstaltung ist voll")

    await execute(
        "INSERT INTO event_rsvps (event_id, user_id, status) VALUES ($1::uuid, $2::uuid, 'angemeldet')",
        event_id, uid,
    )
    count = await fetchval("SELECT COUNT(*) FROM event_rsvps WHERE event_id = $1::uuid AND status = 'angemeldet'", event_id) or 0
    return EventRsvpResponse(message="Anmeldung erfolgreich", teilnehmer_count=int(count))
