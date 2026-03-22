from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..db import execute, fetch, fetchrow, fetchval
from ..rbac import Role, require_auth, require_role
from ..schemas.members import MemberListResponse, MemberResponse, MemberUpdate
from ..services.member_service import member_service, member_to_user
from ..services.privacy_service import privacy_service

logger = logging.getLogger("menschlichkeit.members")
router = APIRouter()


def _row_to_response(row: dict) -> MemberResponse:
    return MemberResponse(
        id=str(row["id"]),
        email=row["email"],
        vorname=row.get("vorname", ""),
        nachname=row.get("nachname", ""),
        mitgliedschaft_typ=row.get("mitgliedschaft_typ", "ordentlich"),
        status=row.get("status", "Active"),
        rolle=row.get("rolle", "member"),
        joined_at=str(row["joined_at"]) if row.get("joined_at") else None,
        created_at=str(row["created_at"]) if row.get("created_at") else None,
    )


@router.get("/members", response_model=MemberListResponse)
async def list_members(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query("", max_length=200),
    status_filter: str = Query("", max_length=50),
    user: dict = require_role(Role.MODERATOR),
):
    offset = (page - 1) * page_size
    conditions = ["1=1"]
    params: list = []
    idx = 1

    if search:
        conditions.append(
            f"(LOWER(vorname) LIKE LOWER(${idx}) OR LOWER(nachname) LIKE LOWER(${idx}) OR LOWER(email) LIKE LOWER(${idx}))"
        )
        params.append(f"%{search}%")
        idx += 1

    if status_filter:
        conditions.append(f"status = ${idx}")
        params.append(status_filter)
        idx += 1

    where_clause = " AND ".join(conditions)
    total = await fetchval(f"SELECT COUNT(*) FROM members WHERE {where_clause}", *params) or 0

    params.append(page_size)
    params.append(offset)
    rows = await fetch(
        f"SELECT * FROM members WHERE {where_clause} ORDER BY created_at DESC LIMIT ${idx} OFFSET ${idx+1}",
        *params,
    )

    members = [_row_to_response(dict(r)) for r in rows]
    return MemberListResponse(data=members, total=int(total), page=page, page_size=page_size)


@router.get("/members/me/profile")
async def get_my_profile(user: dict = Depends(require_auth)):
    member = await member_service.get_member_by_id(user["uid"])
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil nicht gefunden")
    return {"success": True, "data": member_to_user(member)}


@router.put("/members/me/profile")
async def update_my_profile(payload: dict, user: dict = Depends(require_auth)):
    updated = await member_service.update_profile(user["uid"], payload)
    return {"success": True, "data": updated}


@router.get("/members/me/invoices")
async def get_my_invoices(user: dict = Depends(require_auth)):
    member = await member_service.get_member_by_id(user["uid"])
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil nicht gefunden")
    return await member_service.list_member_invoices(member)


@router.get("/members/me/donations")
async def get_my_donations(user: dict = Depends(require_auth)):
    member = await member_service.get_member_by_id(user["uid"])
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil nicht gefunden")
    return await member_service.list_member_donations(member)


@router.post("/members/me/data-export")
async def request_data_export(payload: dict | None = None, user: dict = Depends(require_auth)):
    request_row = await member_service.request_data_export(user["uid"], (payload or {}).get("reason"))
    return {"success": True, "data": {"request": request_row}}


@router.post("/members/me/delete-request")
async def request_delete(payload: dict, user: dict = Depends(require_auth)):
    reason = payload.get("reason")
    if not reason:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Begründung fehlt")
    request_row = await member_service.request_account_deletion(user["uid"], reason)
    return {"success": True, "data": {"request": request_row}}


@router.get("/members/{member_id}", response_model=MemberResponse)
async def get_member(member_id: str, user: dict = Depends(require_auth)):
    uid = user.get("uid")
    role = user.get("role", "member")
    if uid != member_id and role not in ("moderator", "admin", "sysadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Zugriff nur auf eigenes Profil oder mit Moderator-/Admin-Rechten",
        )
    row = await fetchrow("SELECT * FROM members WHERE id = $1::uuid", member_id)
    if not row:
        raise HTTPException(status_code=404, detail="Mitglied nicht gefunden")
    return _row_to_response(dict(row))


@router.put("/members/{member_id}", response_model=MemberResponse)
async def update_member(member_id: str, body: MemberUpdate, user: dict = require_role(Role.ADMIN)):
    row = await fetchrow("SELECT * FROM members WHERE id = $1::uuid", member_id)
    if not row:
        raise HTTPException(status_code=404, detail="Mitglied nicht gefunden")

    updates = {}
    if body.vorname is not None:
        updates["vorname"] = body.vorname
    if body.nachname is not None:
        updates["nachname"] = body.nachname
    if body.email is not None:
        updates["email"] = str(body.email)
    if body.mitgliedschaft_typ is not None:
        updates["mitgliedschaft_typ"] = body.mitgliedschaft_typ
    if body.status is not None:
        updates["status"] = body.status
    if body.rolle is not None:
        updates["rolle"] = body.rolle

    if updates:
        set_clauses = []
        params = []
        for i, (key, val) in enumerate(updates.items(), 1):
            set_clauses.append(f"{key} = ${i}")
            params.append(val)
        params.append(member_id)
        await execute(
            f"UPDATE members SET {', '.join(set_clauses)}, updated_at = NOW() WHERE id = ${len(params)}::uuid",
            *params,
        )

    updated = await fetchrow("SELECT * FROM members WHERE id = $1::uuid", member_id)
    return _row_to_response(dict(updated))


@router.delete("/members/{member_id}")
async def delete_member(member_id: str, user: dict = require_role(Role.ADMIN)):
    row = await fetchrow("SELECT * FROM members WHERE id = $1::uuid", member_id)
    if not row:
        raise HTTPException(status_code=404, detail="Mitglied nicht gefunden")
    await execute("UPDATE members SET status = 'deleted', updated_at = NOW() WHERE id = $1::uuid", member_id)
    return {"success": True, "message": "Mitglied zur Löschung markiert"}


@router.get("/privacy/consents")
async def get_consents(user: dict = Depends(require_auth)):
    consents = await privacy_service.list_consents(member_id=user["uid"], email=user.get("sub"))
    return {"success": True, "data": {"consents": consents}}
