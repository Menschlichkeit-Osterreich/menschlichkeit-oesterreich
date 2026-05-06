from __future__ import annotations

import csv
import io
import logging
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..db import fetch, fetchval
from ..rbac import get_current_user
from ..schemas.finance import (
    FinanceActionResult,
    FinanceAsset,
    FinanceBankAccount,
    FinanceCockpit,
    FinanceCockpitResponse,
    FinanceExpenseClaim,
    FinanceManualJournalRequest,
    FinancePayable,
    FinancePayableCreateRequest,
    FinanceOverview,
    FinanceOverviewResponse,
    FinancePayrollRun,
    FinanceReceivable,
    FinanceReportCatalogResponse,
    FinanceReportDescriptor,
    FinanceSyncFailure,
    FinanceSyncHealth,
    FinanceSyncProcessResponse,
    InvoiceListResponse,
    InvoiceResponse,
)
from ..services.finance_sync_service import finance_sync_service

logger = logging.getLogger("menschlichkeit.finance")
router = APIRouter()

FINANCE_ROLES = {"finance", "staff", "admin", "sysadmin"}


def _require_finance_access(user: dict = Depends(get_current_user)) -> dict:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentifizierung erforderlich",
        )
    if user.get("role") not in FINANCE_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Zugriff nur für Finance-, Staff- oder Admin-Rollen",
        )
    return user


def _csv_content(rows: list[dict]) -> str:
    if not rows:
        return ""
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


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
            betrag_cents INTEGER,
            status TEXT DEFAULT 'offen',
            faellig_am TIMESTAMPTZ,
            due_date TIMESTAMPTZ,
            erstellt_am TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            beschreibung TEXT
        );
    """
    )
    await fetch("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;")
    await fetch("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();")
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
    await finance_sync_service.ensure_tables()


async def _legacy_overview() -> FinanceOverview:
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
    offene = await fetchval("SELECT COUNT(*) FROM invoices WHERE status IN ('offen', 'open', 'sent', 'draft', 'pending')") or 0
    ueberfaellige = (
        await fetchval(
            "SELECT COUNT(*) FROM invoices WHERE status IN ('offen', 'open', 'sent', 'draft', 'pending') AND COALESCE(faellig_am, due_date) < NOW()"
        )
        or 0
    )
    sync = await finance_sync_service.get_sync_health()
    return FinanceOverview(
        einnahmen_monat_cents=int(einnahmen_monat),
        ausgaben_monat_cents=int(ausgaben_monat),
        saldo_monat_cents=int(einnahmen_monat) - int(ausgaben_monat),
        einnahmen_jahr_cents=int(einnahmen_jahr),
        ausgaben_jahr_cents=int(ausgaben_jahr),
        saldo_jahr_cents=int(einnahmen_jahr) - int(ausgaben_jahr),
        offene_rechnungen=int(offene),
        ueberfaellige_rechnungen=int(ueberfaellige),
        source_system="erpnext-hybrid" if sync["erpnext_enabled"] else "legacy",
        erpnext_enabled=bool(sync["erpnext_enabled"]),
    )


def _normalize_receivable(row: dict) -> FinanceReceivable:
    return FinanceReceivable(
        name=str(row.get("name")),
        party=row.get("customer"),
        display_name=row.get("customer_name"),
        status=row.get("status"),
        due_date=str(row.get("due_date")) if row.get("due_date") else None,
        posting_date=str(row.get("posting_date")) if row.get("posting_date") else None,
        grand_total=float(row.get("grand_total") or 0),
        outstanding_amount=float(row.get("outstanding_amount") or 0),
    )


def _normalize_payable(row: dict) -> FinancePayable:
    return FinancePayable(
        name=str(row.get("name")),
        party=row.get("supplier"),
        display_name=row.get("supplier_name"),
        status=row.get("status"),
        due_date=str(row.get("due_date")) if row.get("due_date") else None,
        posting_date=str(row.get("posting_date")) if row.get("posting_date") else None,
        grand_total=float(row.get("grand_total") or 0),
        outstanding_amount=float(row.get("outstanding_amount") or 0),
    )


@router.get("/finance/overview", response_model=FinanceOverviewResponse)
async def finance_overview(user: dict = Depends(_require_finance_access)):
    overview = await _legacy_overview()
    return FinanceOverviewResponse(data=overview)


@router.get("/finance/cockpit", response_model=FinanceCockpitResponse)
async def finance_cockpit(user: dict = Depends(_require_finance_access)):
    overview = await _legacy_overview()
    snapshot = await finance_sync_service.build_cockpit_snapshot()
    sync = FinanceSyncHealth(
        pending=int(snapshot["sync"]["pending"]),
        processing=int(snapshot["sync"]["processing"]),
        failed=int(snapshot["sync"]["failed"]),
        success=int(snapshot["sync"]["success"]),
        latest_success_at=snapshot["sync"]["latest_success_at"],
        erpnext_enabled=bool(snapshot["sync"]["erpnext_enabled"]),
        failures=[FinanceSyncFailure(**failure) for failure in snapshot["sync"]["failures"]],
    )
    return FinanceCockpitResponse(
        data=FinanceCockpit(
            overview=overview,
            sync=sync,
            receivables=[_normalize_receivable(row) for row in snapshot["receivables"]],
            payables=[_normalize_payable(row) for row in snapshot["payables"]],
            bank_accounts=[FinanceBankAccount(**row) for row in snapshot["bank_accounts"]],
            payroll_runs=[FinancePayrollRun(**row) for row in snapshot["payroll_runs"]],
            assets=[FinanceAsset(**row) for row in snapshot["assets"]],
            expense_claims=[FinanceExpenseClaim(**row) for row in snapshot["expense_claims"]],
            mapping=snapshot["mapping"],
        )
    )


@router.get("/finance/sync/health")
async def finance_sync_health(user: dict = Depends(_require_finance_access)):
    return {"success": True, "data": await finance_sync_service.get_sync_health()}


@router.post("/finance/sync/process", response_model=FinanceSyncProcessResponse)
async def finance_sync_process(
    limit: int = Query(default=20, ge=1, le=100),
    user: dict = Depends(_require_finance_access),
):
    result = await finance_sync_service.process_pending(limit=limit)
    return FinanceSyncProcessResponse(**result)


@router.post("/finance/sync/requeue/{sync_id}")
async def finance_sync_requeue(sync_id: str, user: dict = Depends(_require_finance_access)):
    try:
        row = await finance_sync_service.requeue_sync(sync_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return {"success": True, "data": row}


@router.post("/finance/payables", response_model=FinanceActionResult, status_code=status.HTTP_201_CREATED)
async def finance_create_payable(
    body: FinancePayableCreateRequest,
    user: dict = Depends(_require_finance_access),
):
    try:
        result = await finance_sync_service.create_payable_now(body.model_dump(exclude_none=True))
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return FinanceActionResult(**result)


@router.post("/finance/manual-journal", response_model=FinanceActionResult, status_code=status.HTTP_201_CREATED)
async def finance_manual_journal(
    body: FinanceManualJournalRequest,
    user: dict = Depends(_require_finance_access),
):
    try:
        result = await finance_sync_service.create_manual_journal_now(body.model_dump(exclude_none=True))
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return FinanceActionResult(**result)


@router.get("/finance/invoices", response_model=InvoiceListResponse)
async def list_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str = Query("", max_length=50),
    user: dict = Depends(_require_finance_access),
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
    total = await fetchval(f"SELECT COUNT(*) FROM invoices i WHERE {where}", *params) or 0

    params.append(page_size)
    params.append((page - 1) * page_size)
    rows = await fetch(
        f"""
        SELECT i.*, m.vorname || ' ' || m.nachname AS mitglied_name
        FROM invoices i
        LEFT JOIN members m ON i.mitglied_id = m.id
        WHERE {where}
        ORDER BY COALESCE(i.erstellt_am, i.created_at, NOW()) DESC
        LIMIT ${idx} OFFSET ${idx + 1}
        """,
        *params,
    )

    invoices = [
        InvoiceResponse(
            id=str(r["id"]),
            mitglied_id=str(r["mitglied_id"]) if r.get("mitglied_id") else "",
            mitglied_name=r.get("mitglied_name", "Unbekannt"),
            betrag_cents=int(r.get("betrag_cents") or 0),
            status=str(r.get("status") or ""),
            faellig_am=str(r.get("faellig_am") or ""),
            erstellt_am=str(r.get("erstellt_am") or ""),
            beschreibung=r.get("beschreibung"),
        )
        for r in rows
    ]
    return InvoiceListResponse(data=invoices, total=int(total))


@router.get("/finance/reports/catalog", response_model=FinanceReportCatalogResponse)
async def finance_report_catalog(user: dict = Depends(_require_finance_access)):
    source = "erpnext-hybrid"
    return FinanceReportCatalogResponse(
        data=[
            FinanceReportDescriptor(
                id="overview",
                title="Finance Overview",
                description="Zusammenfassung aus Live-Finanzdaten und Sync-Status.",
                format="json",
                source=source,
            ),
            FinanceReportDescriptor(
                id="receivables",
                title="Offene Forderungen",
                description="Receivables aus ERPNext bzw. dem aktuellen Hybrid-Cockpit.",
                format="csv",
                source=source,
            ),
            FinanceReportDescriptor(
                id="payables",
                title="Offene Verbindlichkeiten",
                description="Payables, Eingangsrechnungen und offene Lieferantenposten.",
                format="csv",
                source=source,
            ),
            FinanceReportDescriptor(
                id="sync",
                title="Integrations- und Fehlerreport",
                description="Queue-, Failure- und ERPNext-Sync-Status.",
                format="json",
                source=source,
            ),
            FinanceReportDescriptor(
                id="payroll",
                title="Payroll-Läufe",
                description="Aktuelle ERPNext Payroll Entries.",
                format="csv",
                source=source,
            ),
            FinanceReportDescriptor(
                id="assets",
                title="Anlagenübersicht",
                description="Aktuelle Asset-Daten und Status aus ERPNext.",
                format="csv",
                source=source,
            ),
        ]
    )


@router.get("/finance/reports/{report_id}")
async def finance_report_data(
    report_id: str,
    format: str = Query(default="json", pattern="^(json|csv)$"),
    user: dict = Depends(_require_finance_access),
):
    cockpit = (await finance_cockpit(user)).data
    generated_at = date.today().isoformat()

    if report_id == "overview":
        payload = cockpit.overview.model_dump()
    elif report_id == "receivables":
        rows = [row.model_dump() for row in cockpit.receivables]
        payload = {"rows": rows, "content": _csv_content(rows) if format == "csv" else rows}
    elif report_id == "payables":
        rows = [row.model_dump() for row in cockpit.payables]
        payload = {"rows": rows, "content": _csv_content(rows) if format == "csv" else rows}
    elif report_id == "sync":
        payload = cockpit.sync.model_dump()
    elif report_id == "payroll":
        rows = [row.model_dump() for row in cockpit.payroll_runs]
        payload = {"rows": rows, "content": _csv_content(rows) if format == "csv" else rows}
    elif report_id == "assets":
        rows = [row.model_dump() for row in cockpit.assets]
        payload = {"rows": rows, "content": _csv_content(rows) if format == "csv" else rows}
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unbekannter Report")

    return {
        "success": True,
        "data": {
            "report_id": report_id,
            "format": format,
            "generated_at": generated_at,
            **(payload if isinstance(payload, dict) else {"content": payload}),
        },
    }
