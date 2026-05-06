from __future__ import annotations

from decimal import Decimal
from typing import Any

from .crm_service import crm_service


def _to_cents(amount: float | Decimal) -> int:
    return int(Decimal(str(amount)) * 100)


def _money(value: Any) -> Decimal:
    return Decimal(str(value or 0)).quantize(Decimal("0.01"))


async def _resolve_contact_id(
    *,
    email: str | None,
    donor_name: str | None = None,
    civicrm_contact_id: int | None = None,
    source: str = "website_payment",
) -> int | None:
    if civicrm_contact_id:
        return civicrm_contact_id
    if not email:
        return None
    existing = await crm_service.find_contact_by_email(email)
    if existing and existing.get("id"):
        return int(existing["id"])
    name_parts = (donor_name or "").strip().split()
    first_name = name_parts[0] if name_parts else "Unterstützer/in"
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else "Menschlichkeit"
    created = await crm_service.upsert_contact(
        email=email,
        first_name=first_name,
        last_name=last_name,
        source=source,
    )
    if created and created.get("id"):
        return int(created["id"])
    return None
