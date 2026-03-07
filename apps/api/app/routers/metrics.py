"""Dashboard KPI Endpoints (Metrics Router)."""
from fastapi import APIRouter, Query
from typing import Optional, Literal
from datetime import date
from ..db import fetch, fetchval

router = APIRouter()


# --- Helper Functions ---------------------------------------------------


def first_day_of_year(today: date) -> date:
    """Return first day of current year."""
    return date(today.year, 1, 1)


# --- Overview KPIs ------------------------------------------------------


@router.get("/kpis/overview")
async def kpis_overview(since: Optional[date] = None):
    """
    Aggregated overview KPIs:
    - members_total (active members)
    - net_new_members_month (joins - cancels in current month)
    - donations_ytd_cents (year-to-date donations)
    - income_vs_expense_current_month_cents (signed balance)
    """
    today = date.today()
    ytd_start = since or first_day_of_year(today)

    # Total active members
    members_total_q = "SELECT COUNT(*) FROM members WHERE status = 'Active';"
    members_total = await fetchval(members_total_q) or 0

    # Net new members in current month (joins - cancels)
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

    # Year-to-date donations (payer_type: donor or member)
    donations_ytd_q = """
      SELECT COALESCE(SUM(amount_cents),0) FROM payments
      WHERE booked_at >= $1
        AND payer_type IN ('donor','member');
    """
    donations_ytd_cents = await fetchval(donations_ytd_q, ytd_start) or 0

    # Income vs Expense (current month)
    income_q = """
      SELECT COALESCE(SUM(amount_cents),0) FROM payments
      WHERE booked_at >= date_trunc('month', CURRENT_DATE);
    """
    expense_q = """
      SELECT COALESCE(SUM(amount_cents),0) FROM expenses
      WHERE booked_at >= date_trunc('month', CURRENT_DATE);
    """
    income = await fetchval(income_q) or 0
    expense = await fetchval(expense_q) or 0
    income_vs_expense_current_month = int(income) - int(expense)

    return {
        "members_total": int(members_total),
        "net_new_members_month": int(net_new_members_month),
        "donations_ytd_cents": int(donations_ytd_cents),
        "income_vs_expense_current_month_cents": income_vs_expense_current_month,
        "as_of": today.isoformat(),
        "since": ytd_start.isoformat()
    }


# --- Members: Time Series -----------------------------------------------


@router.get("/members/timeseries")
async def members_timeseries(
    granularity: Literal["day", "month", "quarter", "year"] = "month",
    months: int = Query(12, ge=1, le=60)
):
    """
    Members time series with:
    - active_members (count at end of bucket)
    - joins (new members in bucket)
    - cancels (cancelled members in bucket)
    
    Args:
        granularity: Time bucket size (day/month/quarter/year)
        months: Number of periods to look back (default 12)
    """
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
    return [dict(r) for r in rows]


# --- Donations/Payments: Summary ----------------------------------------


@router.get("/donations/summary")
async def donations_summary(
    period: Literal["last_12_months", "ytd", "last_30d"] = "ytd"
):
    """
    Donations summary statistics for given period:
    - total_cents (total amount)
    - count (number of donations)
    - avg_cents (average donation)
    - recurring_share (percentage of recurring vs one-time)
    """
    if period == "last_12_months":
        constraint = "booked_at >= (CURRENT_DATE - INTERVAL '12 months')"
    elif period == "last_30d":
        constraint = "booked_at >= (CURRENT_DATE - INTERVAL '30 days')"
    else:  # ytd
        constraint = "booked_at >= date_trunc('year', CURRENT_DATE)"

    q_total = f"SELECT COALESCE(SUM(amount_cents),0) FROM payments WHERE {constraint};"
    q_rec = f"SELECT COALESCE(SUM(amount_cents),0) FROM payments WHERE {constraint} AND is_recurring = true;"
    q_cnt = f"SELECT COUNT(*) FROM payments WHERE {constraint};"

    total = await fetchval(q_total)
    recurring = await fetchval(q_rec)
    count = await fetchval(q_cnt)

    avg = int(total) // int(count) if count else 0
    recurring_share = (int(recurring) / int(total)) if total else 0.0

    return {
        "period": period,
        "total_cents": int(total or 0),
        "count": int(count or 0),
        "avg_cents": int(avg),
        "recurring_share": round(recurring_share, 4)
    }


# --- Finance: Income vs Expense -----------------------------------------


@router.get("/finance/income-vs-expense")
async def income_vs_expense(
    from_date: date = Query(default=date(date.today().year, 1, 1)),
    to_date: date = Query(default=date.today())
):
    """
    Monthly income vs expense breakdown:
    - month (YYYY-MM)
    - income_cents (total payments in month)
    - expense_cents (total expenses in month)
    - balance_cents (income - expense)
    """
    q = """
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
    """
    rows = await fetch(q, from_date, to_date)
    return [dict(r) for r in rows]


# --- Projects: Burn Rate ------------------------------------------------


@router.get("/projects/burn")
async def project_burn(code: str):
    """
    Project budget burn rate:
    - code (project code)
    - name (project name)
    - budget_cents (planned budget)
    - spend_cents (actual expenses)
    - burn_rate (spend / budget ratio)
    
    Args:
        code: Project code (e.g. "DEMO", "PROJ-001")
    """
    q = """
      SELECT p.code, p.name, p.budget_cents,
             COALESCE(SUM(e.amount_cents),0)::bigint AS spend_cents
      FROM projects p
      LEFT JOIN expenses e ON e.project = p.code
      WHERE p.code = $1
      GROUP BY p.code, p.name, p.budget_cents;
    """
    row = await fetch(q, code)
    if not row:
        return {"code": code, "found": False}
    
    r = dict(row[0])
    r["found"] = True
    r["burn_rate"] = (r["spend_cents"] / r["budget_cents"]) if r["budget_cents"] else None
    return r
