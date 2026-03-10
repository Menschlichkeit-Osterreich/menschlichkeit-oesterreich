"""Dashboard KPI Endpoints (Metrics Router)."""
from __future__ import annotations

from datetime import date
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..db import fetch, fetchval
from ..schemas.metrics import (
    DonationsSummaryResponse,
    IncomeExpensePoint,
    KpisOverviewResponse,
    MembersTimeSeriesPoint,
    ProjectBurnResponse,
)

try:
    from src.auth.rbac import Scope, create_auth_dependencies
except Exception:  # pragma: no cover
    Scope = None
    create_auth_dependencies = None

router = APIRouter()

auth_deps = create_auth_dependencies() if create_auth_dependencies else {}
require_scope = auth_deps.get("require_scope") if auth_deps else None


def analytics_access_dependency():
    if require_scope and Scope:
        return Depends(require_scope(Scope.ANALYTICS_BOARD))
    return Depends(lambda: {"roles": ["service"]})


ANALYTICS_GUARD = analytics_access_dependency()


def first_day_of_year(today: date) -> date:
    return date(today.year, 1, 1)


@router.get("/kpis/overview", response_model=KpisOverviewResponse)
async def kpis_overview(
    since: Optional[date] = None,
    _: dict = ANALYTICS_GUARD,
) -> KpisOverviewResponse:
    today = date.today()
    ytd_start = since or first_day_of_year(today)

    members_total = await fetchval("SELECT COUNT(*) FROM members WHERE status = 'Active';") or 0

    net_new_q = """
      WITH joined AS (
        SELECT COUNT(*)::int AS c FROM members
        WHERE joined_at >= date_trunc('month', CURRENT_DATE)
          AND (status = 'Active' OR status = 'Pending')
      ),
      cancelled AS (
        SELECT COUNT(*)::int AS c FROM members
        WHERE cancelled_at >= date_trunc('month', CURRENT_DATE)
      )
      SELECT COALESCE((SELECT c FROM joined),0) - COALESCE((SELECT c FROM cancelled),0);
    """
    net_new_members_month = await fetchval(net_new_q) or 0

    donations_ytd_cents = await fetchval(
        """
      SELECT COALESCE(SUM(amount_cents),0) FROM payments
      WHERE booked_at >= $1
        AND payer_type IN ('donor','member');
    """,
        ytd_start,
    ) or 0

    income = await fetchval(
        """
      SELECT COALESCE(SUM(amount_cents),0) FROM payments
      WHERE booked_at >= date_trunc('month', CURRENT_DATE);
    """
    ) or 0
    expense = await fetchval(
        """
      SELECT COALESCE(SUM(amount_cents),0) FROM expenses
      WHERE booked_at >= date_trunc('month', CURRENT_DATE);
    """
    ) or 0

    return KpisOverviewResponse(
        members_total=int(members_total),
        net_new_members_month=int(net_new_members_month),
        donations_ytd_cents=int(donations_ytd_cents),
        income_vs_expense_current_month_cents=int(income) - int(expense),
        as_of=today,
        since=ytd_start,
    )


@router.get("/members/timeseries", response_model=list[MembersTimeSeriesPoint])
async def members_timeseries(
    granularity: Literal["day", "month", "quarter", "year"] = "month",
    months: int = Query(12, ge=1, le=60),
    _: dict = ANALYTICS_GUARD,
) -> list[MembersTimeSeriesPoint]:
    q = f"""
      WITH series AS (
        SELECT generate_series(
          date_trunc('{granularity}', CURRENT_DATE) - INTERVAL '{months-1} {granularity}',
          date_trunc('{granularity}', CURRENT_DATE),
          '1 {granularity}'
        ) AS bucket
      ),
      joins AS (
        SELECT date_trunc('{granularity}', joined_at) AS bucket, COUNT(*)::int AS c
        FROM members WHERE joined_at IS NOT NULL
        GROUP BY 1
      ),
      cancels AS (
        SELECT date_trunc('{granularity}', cancelled_at) AS bucket, COUNT(*)::int AS c
        FROM members WHERE cancelled_at IS NOT NULL
        GROUP BY 1
      ),
      active AS (
        SELECT s.bucket,
               (SELECT COUNT(*) FROM members m
                 WHERE (m.joined_at IS NULL OR m.joined_at <= s.bucket)
                   AND (m.cancelled_at IS NULL OR m.cancelled_at > s.bucket)
                )::int AS active_members
        FROM series s
      )
      SELECT
        to_char(s.bucket, 'YYYY-MM-DD') AS bucket,
        COALESCE(a.active_members,0) AS active_members,
        COALESCE(j.c,0) AS joins,
        COALESCE(c.c,0) AS cancels
      FROM series s
      LEFT JOIN active a ON a.bucket = s.bucket
      LEFT JOIN joins j  ON j.bucket = s.bucket
      LEFT JOIN cancels c ON c.bucket = s.bucket
      ORDER BY s.bucket;
    """
    rows = await fetch(q)
    return [MembersTimeSeriesPoint(**dict(r)) for r in rows]


@router.get("/donations/summary", response_model=DonationsSummaryResponse)
async def donations_summary(
    period: Literal["last_12_months", "ytd", "last_30d"] = "ytd",
    _: dict = ANALYTICS_GUARD,
) -> DonationsSummaryResponse:
    if period == "last_12_months":
        constraint = "booked_at >= (CURRENT_DATE - INTERVAL '12 months')"
    elif period == "last_30d":
        constraint = "booked_at >= (CURRENT_DATE - INTERVAL '30 days')"
    else:
        constraint = "booked_at >= date_trunc('year', CURRENT_DATE)"

    total = await fetchval(f"SELECT COALESCE(SUM(amount_cents),0) FROM payments WHERE {constraint};")
    recurring = await fetchval(
        f"SELECT COALESCE(SUM(amount_cents),0) FROM payments WHERE {constraint} AND is_recurring = true;"
    )
    count = await fetchval(f"SELECT COUNT(*) FROM payments WHERE {constraint};")

    total_int = int(total or 0)
    count_int = int(count or 0)
    recurring_int = int(recurring or 0)

    return DonationsSummaryResponse(
        period=period,
        total_cents=total_int,
        count=count_int,
        avg_cents=(total_int // count_int) if count_int else 0,
        recurring_share=round((recurring_int / total_int) if total_int else 0.0, 4),
    )


@router.get("/finance/income-vs-expense", response_model=list[IncomeExpensePoint])
async def income_vs_expense(
    from_date: date = Query(default=date(date.today().year, 1, 1)),
    to_date: date = Query(default=date.today()),
    _: dict = ANALYTICS_GUARD,
) -> list[IncomeExpensePoint]:
    if from_date > to_date:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="from_date must be <= to_date")

    rows = await fetch(
        """
      WITH months AS (
        SELECT date_trunc('month', dd)::date AS month
        FROM generate_series($1::date, $2::date, interval '1 month') dd
      ),
      inc AS (
        SELECT date_trunc('month', booked_at)::date AS m, SUM(amount_cents)::bigint AS income_cents
        FROM payments WHERE booked_at >= $1 AND booked_at <= $2
        GROUP BY 1
      ),
      exp AS (
        SELECT date_trunc('month', booked_at)::date AS m, SUM(amount_cents)::bigint AS expense_cents
        FROM expenses WHERE booked_at >= $1 AND booked_at <= $2
        GROUP BY 1
      )
      SELECT to_char(m.month, 'YYYY-MM') AS month,
             COALESCE(i.income_cents,0) AS income_cents,
             COALESCE(e.expense_cents,0) AS expense_cents,
             (COALESCE(i.income_cents,0) - COALESCE(e.expense_cents,0)) AS balance_cents
      FROM months m
      LEFT JOIN inc i ON i.m = m.month
      LEFT JOIN exp e ON e.m = m.month
      ORDER BY m.month;
    """,
        from_date,
        to_date,
    )
    return [IncomeExpensePoint(**dict(r)) for r in rows]


@router.get("/projects/burn", response_model=ProjectBurnResponse)
async def project_burn(code: str = Query(min_length=2, max_length=64), _: dict = ANALYTICS_GUARD) -> ProjectBurnResponse:
    rows = await fetch(
        """
      SELECT p.code, p.name, p.budget_cents,
             COALESCE(SUM(e.amount_cents),0)::bigint AS spend_cents
      FROM projects p
      LEFT JOIN expenses e ON e.project = p.code
      WHERE p.code = $1
      GROUP BY p.code, p.name, p.budget_cents;
    """,
        code,
    )
    if not rows:
        return ProjectBurnResponse(code=code, found=False)

    row = dict(rows[0])
    budget_cents = int(row["budget_cents"]) if row["budget_cents"] is not None else 0
    spend_cents = int(row["spend_cents"])
    burn_rate = (spend_cents / budget_cents) if budget_cents else None

    return ProjectBurnResponse(
        code=row["code"],
        found=True,
        name=row["name"],
        budget_cents=budget_cents,
        spend_cents=spend_cents,
        burn_rate=burn_rate,
    )
