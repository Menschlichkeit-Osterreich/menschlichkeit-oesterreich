from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from ..audit import write_audit_event
from ..rbac import require_auth
from ..schemas.admin_crm import AdminCrmContactUpdate, AdminCrmMembershipCreate
from ..services.admin_crm_service import admin_crm_service

router = APIRouter()

ALLOWED_CRM_ROLES = {"staff", "finance", "admin", "sysadmin"}


def require_crm_staff_access(user: dict = Depends(require_auth)) -> dict:
    role = str(user.get("role") or "guest").lower()
    if role not in ALLOWED_CRM_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Zugriff nur für Admin- oder Staff-Konten",
        )
    return user


@router.get("/admin/crm/contacts")
async def list_crm_contacts(
    search: str | None = Query(default=None, min_length=1),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    user: dict = Depends(require_crm_staff_access),
):
    data = await admin_crm_service.list_contacts(search=search, page=page, page_size=page_size)
    return {"success": True, "data": data}


@router.get("/admin/crm/contacts/{contact_id}")
async def get_crm_contact(contact_id: int, user: dict = Depends(require_crm_staff_access)):
    data = await admin_crm_service.get_contact_detail(contact_id=contact_id)
    return {"success": True, "data": data}


@router.put("/admin/crm/contacts/{contact_id}")
async def update_crm_contact(
    contact_id: int,
    body: AdminCrmContactUpdate,
    request: Request,
    user: dict = Depends(require_crm_staff_access),
):
    payload = body.model_dump(exclude_none=True)
    data = await admin_crm_service.update_contact(contact_id=contact_id, payload=payload)
    await write_audit_event(
        actor_id=user.get("uid"),
        path=f"/api/admin/crm/contacts/{contact_id}",
        method="PUT",
        status_code=200,
        request_id=request.headers.get("X-Request-ID", f"crm-{uuid4().hex}"),
        consent_flag=False,
        metadata={
            "contact_id": contact_id,
            "updated_fields": sorted(payload.keys()),
            "actor_role": user.get("role"),
            "audit_domain": "admin_crm_contact_update",
        },
    )
    return {"success": True, "data": data, "message": "Kontakt wurde aktualisiert."}


@router.post("/admin/crm/contacts/{contact_id}/memberships", status_code=status.HTTP_201_CREATED)
async def create_crm_membership(
    contact_id: int,
    body: AdminCrmMembershipCreate,
    request: Request,
    user: dict = Depends(require_crm_staff_access),
):
    membership = await admin_crm_service.create_membership(
        contact_id=contact_id,
        membership_key=body.membership_key,
    )
    await write_audit_event(
        actor_id=user.get("uid"),
        path=f"/api/admin/crm/contacts/{contact_id}/memberships",
        method="POST",
        status_code=201,
        request_id=request.headers.get("X-Request-ID", f"crm-{uuid4().hex}"),
        consent_flag=False,
        metadata={
            "contact_id": contact_id,
            "membership_key": body.membership_key,
            "actor_role": user.get("role"),
            "audit_domain": "admin_crm_membership_create",
        },
    )
    return {"success": True, "data": {"membership": membership}, "message": "Mitgliedschaft wurde angelegt."}


@router.get("/admin/crm/contacts/{contact_id}/memberships")
async def get_crm_memberships(contact_id: int, user: dict = Depends(require_crm_staff_access)):
    data = await admin_crm_service.get_contact_detail(contact_id=contact_id)
    return {"success": True, "data": {"items": data["memberships"], "sync": data["sync"]}}


@router.get("/admin/crm/contacts/{contact_id}/contributions")
async def get_crm_contributions(contact_id: int, user: dict = Depends(require_crm_staff_access)):
    data = await admin_crm_service.get_contact_detail(contact_id=contact_id)
    return {"success": True, "data": {"items": data["contributions"], "sync": data["sync"]}}


@router.get("/admin/crm/contacts/{contact_id}/invoices")
async def get_crm_invoices(contact_id: int, user: dict = Depends(require_crm_staff_access)):
    data = await admin_crm_service.get_contact_detail(contact_id=contact_id)
    return {"success": True, "data": {"items": data["invoices"], "sync": data["sync"]}}


@router.get("/admin/crm/contacts/{contact_id}/consents")
async def get_crm_consents(contact_id: int, user: dict = Depends(require_crm_staff_access)):
    data = await admin_crm_service.get_contact_detail(contact_id=contact_id)
    return {"success": True, "data": {"items": data["consents"], "sync": data["sync"]}}


@router.get("/admin/crm/contacts/{contact_id}/events")
async def get_crm_events(contact_id: int, user: dict = Depends(require_crm_staff_access)):
    data = await admin_crm_service.get_contact_detail(contact_id=contact_id)
    return {"success": True, "data": {"items": data["events"], "sync": data["sync"]}}

