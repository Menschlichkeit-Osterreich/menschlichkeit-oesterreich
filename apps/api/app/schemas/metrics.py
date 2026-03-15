from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field


class KpisOverviewResponse(BaseModel):
    members_total: int = Field(ge=0)
    net_new_members_month: int
    donations_ytd_cents: int = Field(ge=0)
    income_vs_expense_current_month_cents: int
    as_of: date
    since: date


class MembersTimeSeriesPoint(BaseModel):
    bucket: str
    active_members: int = Field(ge=0)
    joins: int = Field(ge=0)
    cancels: int = Field(ge=0)


class DonationsSummaryResponse(BaseModel):
    period: str
    total_cents: int = Field(ge=0)
    count: int = Field(ge=0)
    avg_cents: int = Field(ge=0)
    recurring_share: float = Field(ge=0, le=1)


class IncomeExpensePoint(BaseModel):
    month: str
    income_cents: int
    expense_cents: int
    balance_cents: int


class ProjectBurnResponse(BaseModel):
    code: str
    found: bool
    name: str | None = None
    budget_cents: int | None = None
    spend_cents: int | None = None
    burn_rate: float | None = None
