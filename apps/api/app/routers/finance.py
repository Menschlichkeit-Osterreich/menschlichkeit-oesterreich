from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, status

from ..db import fetch, fetchval
from ..rbac import Role, require_role
from ..schemas.finance import (
    FinanceOverview,
    FinanceOverviewResponse,
    InvoiceListResponse,
    InvoiceResponse,
)

logger = logging.getLogger("menschlichkeit.finance")
router = APIRouter()


async def _ensure_finance_tables() -> None:
    await fetch(
        """
        CREATE TABLE IF NOT EXISTS payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            amount_cents INTEGER NOT NULL,
            booked_at TIMESTAMPTZ DEFAULT NOW(),
            description TEXT,
            payer_type TEXT NOT NULL DEFAULT 'member',
            is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    """
    )
    # Fehlende Spalten nachrüsten falls Tabelle bereits existiert
    await fetch(
        """
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_type TEXT NOT NULL DEFAULT 'member';
    """
    )
    await fetch(
        """
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE;
    """
    )
    await fetch(
        """
        CREATE TABLE IF NOT EXISTS expenses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            amount_cents INTEGER NOT NULL,
            booked_at TIMESTAMPTZ DEFAULT NOW(),
            description TEXT,
            project TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    """
    )
    await fetch(
        """
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS project TEXT;
    """
    )
    await fetch(
        """
        CREATE TABLE IF NOT EXISTS invoices (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mitglied_id UUID,
            betrag_cents INTEGER NOT NULL,
            status TEXT DEFAULT 'offen',
            faellig_am TIMESTAMPTZ,
            erstellt_am TIMESTAMPTZ DEFAULT NOW(),
            beschreibung TEXT
        );
    """
    )
    await fetch(
        """
        CREATE TABLE IF NOT EXISTS projects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            budget_cents INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    """
    )


@router.get("/finance/overview", response_model=FinanceOverviewResponse)
async def finance_overview(user: dict = require_role(Role.ADMIN)):
    await _ensure_finance_tables()

    einnahmen_monat = (
        await fetchval(
            "SELECT COALESCE(SUM(amount_cents),0) FROM payments WHERE booked_at >= date_trunc('month', CURRENT_DATE)"
        )
        or 0
    )
    ausgaben_monat = (
        await fetchval(
            "SELECT COALESCE(SUM(amount_cents),0) FROM expenses WHERE booked_at >= date_trunc('month', CURRENT_DATE)"
        )
        or 0
    )
    einnahmen_jahr = (
        await fetchval(
            "SELECT COALESCE(SUM(amount_cents),0) FROM payments WHERE booked_at >= date_trunc('year', CURRENT_DATE)"
        )
        or 0
    )
    ausgaben_jahr = (
        await fetchval(
            "SELECT COALESCE(SUM(amount_cents),0) FROM expenses WHERE booked_at >= date_trunc('year', CURRENT_DATE)"
        )
        or 0
    )
    offene = await fetchval("SELECT COUNT(*) FROM invoices WHERE status = 'offen'") or 0
    ueberfaellige = (
        await fetchval(
            "SELECT COUNT(*) FROM invoices WHERE status = 'offen' AND faellig_am < NOW()"
        )
        or 0
    )

    overview = FinanceOverview(
        einnahmen_monat_cents=int(einnahmen_monat),
        ausgaben_monat_cents=int(ausgaben_monat),
        saldo_monat_cents=int(einnahmen_monat) - int(ausgaben_monat),
        einnahmen_jahr_cents=int(einnahmen_jahr),
        ausgaben_jahr_cents=int(ausgaben_jahr),
        saldo_jahr_cents=int(einnahmen_jahr) - int(ausgaben_jahr),
        offene_rechnungen=int(offene),
        ueberfaellige_rechnungen=int(ueberfaellige),
    )
    return FinanceOverviewResponse(data=overview)


@router.get("/finance/invoices", response_model=InvoiceListResponse)
async def list_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str = Query("", max_length=50),
    user: dict = require_role(Role.ADMIN),
):
    await _ensure_finance_tables()

    conditions = ["1=1"]
    params: list = []
    idx = 1

    if status_filter:
        conditions.append(f"i.status = ${idx}")
        params.append(status_filter)
        idx += 1

    where = " AND ".join(conditions)

    total = (
        await fetchval(f"SELECT COUNT(*) FROM invoices i WHERE {where}", *params) or 0
    )

    params.append(page_size)
    params.append((page - 1) * page_size)
    rows = await fetch(
        f"""
        SELECT i.*, m.vorname || ' ' || m.nachname AS mitglied_name
        FROM invoices i
        LEFT JOIN members m ON i.mitglied_id = m.id
        WHERE {where}
        ORDER BY i.erstellt_am DESC
        LIMIT ${idx} OFFSET ${idx+1}
    """,
        *params,
    )

    invoices = [
        InvoiceResponse(
            id=str(r["id"]),
            mitglied_id=str(r["mitglied_id"]),
            mitglied_name=r.get("mitglied_name", "Unbekannt"),
            betrag_cents=int(r["betrag_cents"]),
            status=r["status"],
            faellig_am=str(r["faellig_am"]),
            erstellt_am=str(r["erstellt_am"]),
            beschreibung=r.get("beschreibung"),
        )
        for r in rows
    ]

    return InvoiceListResponse(data=invoices, total=int(total))
