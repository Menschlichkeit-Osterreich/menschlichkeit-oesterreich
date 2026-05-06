from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from ..db import execute, fetchrow
from ..rbac import Role, require_role
from ..schemas.roles import RoleAssignRequest, RoleListResponse, RoleResponse

logger = logging.getLogger("menschlichkeit.roles")
router = APIRouter()

SYSTEM_ROLES = [
    RoleResponse(id="guest", name="guest", beschreibung="Gast – nur öffentliche Inhalte", berechtigungen=["public:read"]),
    RoleResponse(id="member", name="member", beschreibung="Ordentliches Mitglied", berechtigungen=["public:read", "member:read", "forum:write", "events:rsvp"]),
    RoleResponse(id="moderator", name="moderator", beschreibung="Moderator*in – Inhalte verwalten", berechtigungen=["public:read", "member:read", "forum:write", "forum:moderate", "blog:write", "events:write"]),
    RoleResponse(id="admin", name="admin", beschreibung="Administrator*in – Vollzugriff", berechtigungen=["public:read", "member:read", "member:write", "forum:write", "forum:moderate", "blog:write", "events:write", "admin:read", "admin:write", "finance:read"]),
    RoleResponse(id="sysadmin", name="sysadmin", beschreibung="Systemadministrator*in", berechtigungen=["*"]),
]


@router.get("/roles", response_model=RoleListResponse)
async def list_roles(user: dict = require_role(Role.ADMIN)):
    return RoleListResponse(data=SYSTEM_ROLES)


@router.post("/roles/assign")
async def assign_role(body: RoleAssignRequest, user: dict = require_role(Role.ADMIN)):
    valid_roles = {r.name for r in SYSTEM_ROLES}
    if body.role_name not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Ungültige Rolle: {body.role_name}")

    member = await fetchrow("SELECT id FROM members WHERE id = $1", body.user_id)
    if not member:
        raise HTTPException(status_code=404, detail="Mitglied nicht gefunden")

    await execute("UPDATE members SET rolle = $1, updated_at = NOW() WHERE id = $2", body.role_name, body.user_id)
    logger.info(f"Rolle '{body.role_name}' zugewiesen an Benutzer {body.user_id}")
    return {"success": True, "message": f"Rolle '{body.role_name}' erfolgreich zugewiesen"}
