from __future__ import annotations

"""
AdminCrmService — Facade
========================
Dünner Einstiegspunkt; delegiert an spezialisierte Services:
  - AdminService      (admin_service.py)   — Business-Logik
  - CrmSyncService    (crm_sync_service.py) — Lokale Datenbankabfragen

Alle bisherigen Aufrufer (Router, Tests) können weiterhin
`admin_crm_service.*` verwenden — die öffentliche API bleibt identisch.
"""

from typing import Any

from .admin_service import admin_service
from .crm_sync_service import crm_sync_service


class AdminCrmService:

    async def list_contacts(self, *, search: str | None, page: int, page_size: int) -> dict[str, Any]:
        return await admin_service.list_contacts(search=search, page=page, page_size=page_size)

    async def get_contact_detail(self, *, contact_id: int) -> dict[str, Any]:
        return await admin_service.get_contact_detail(contact_id=contact_id)

    async def update_contact(self, *, contact_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        return await admin_service.update_contact(contact_id=contact_id, payload=payload)

    async def create_membership(self, *, contact_id: int, membership_key: str) -> dict[str, Any]:
        return await admin_service.create_membership(contact_id=contact_id, membership_key=membership_key)


admin_crm_service = AdminCrmService()
