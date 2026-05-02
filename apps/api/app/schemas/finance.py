from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class FinanceOverview(BaseModel):
    einnahmen_monat_cents: int = 0
    ausgaben_monat_cents: int = 0
    saldo_monat_cents: int = 0
    einnahmen_jahr_cents: int = 0
    ausgaben_jahr_cents: int = 0
    saldo_jahr_cents: int = 0
    offene_rechnungen: int = 0
    ueberfaellige_rechnungen: int = 0
    source_system: str = "legacy"
    erpnext_enabled: bool = False


class InvoiceResponse(BaseModel):
    id: str
    mitglied_id: str
    mitglied_name: str
    betrag_cents: int
    status: str
    faellig_am: str
    erstellt_am: str
    beschreibung: Optional[str] = None


class InvoiceListResponse(BaseModel):
    success: bool = True
    data: list[InvoiceResponse]
    total: int


class FinanceOverviewResponse(BaseModel):
    success: bool = True
    data: FinanceOverview


class FinanceSyncFailure(BaseModel):
    id: str
    source_entity_type: str
    source_entity_id: str
    operation: str
    last_error: str | None = None
    attempts: int = 0
    updated_at: str | None = None


class FinanceSyncHealth(BaseModel):
    pending: int = 0
    processing: int = 0
    failed: int = 0
    success: int = 0
    latest_success_at: str | None = None
    erpnext_enabled: bool = False
    failures: list[FinanceSyncFailure] = Field(default_factory=list)


class FinanceReceivable(BaseModel):
    name: str
    party: str | None = None
    display_name: str | None = None
    status: str | None = None
    due_date: str | None = None
    posting_date: str | None = None
    grand_total: float = 0
    outstanding_amount: float = 0


class FinancePayable(BaseModel):
    name: str
    party: str | None = None
    display_name: str | None = None
    status: str | None = None
    due_date: str | None = None
    posting_date: str | None = None
    grand_total: float = 0
    outstanding_amount: float = 0


class FinanceBankAccount(BaseModel):
    name: str
    bank: str | None = None
    bank_account_no: str | None = None
    is_company_account: bool | None = None
    company: str | None = None


class FinancePayrollRun(BaseModel):
    name: str
    company: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    posting_date: str | None = None
    status: str | None = None


class FinanceAsset(BaseModel):
    name: str
    asset_name: str | None = None
    status: str | None = None
    gross_purchase_amount: float | None = None
    purchase_date: str | None = None
    available_for_use_date: str | None = None


class FinanceExpenseClaim(BaseModel):
    name: str
    employee_name: str | None = None
    total_claimed_amount: float | None = None
    posting_date: str | None = None
    approval_status: str | None = None


class FinanceCockpit(BaseModel):
    overview: FinanceOverview
    sync: FinanceSyncHealth
    receivables: list[FinanceReceivable] = Field(default_factory=list)
    payables: list[FinancePayable] = Field(default_factory=list)
    bank_accounts: list[FinanceBankAccount] = Field(default_factory=list)
    payroll_runs: list[FinancePayrollRun] = Field(default_factory=list)
    assets: list[FinanceAsset] = Field(default_factory=list)
    expense_claims: list[FinanceExpenseClaim] = Field(default_factory=list)
    mapping: dict[str, str] = Field(default_factory=dict)


class FinanceCockpitResponse(BaseModel):
    success: bool = True
    data: FinanceCockpit


class FinanceSyncProcessResponse(BaseModel):
    success: bool = True
    count: int = 0
    processed: list[dict] = Field(default_factory=list)


class FinancePayableCreateRequest(BaseModel):
    supplier_name: str = Field(min_length=1, max_length=140)
    supplier_email: str | None = Field(default=None, max_length=255)
    description: str = Field(min_length=1, max_length=500)
    amount: float = Field(gt=0)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    due_date: date | None = None
    bill_date: date | None = None
    posting_date: date | None = None
    expense_account: str | None = Field(default=None, max_length=140)
    cost_center: str | None = Field(default=None, max_length=140)
    item_code: str | None = Field(default=None, max_length=140)
    external_reference: str | None = Field(default=None, max_length=140)


class FinanceJournalLineRequest(BaseModel):
    account: str = Field(min_length=1, max_length=140)
    debit: float = Field(default=0, ge=0)
    credit: float = Field(default=0, ge=0)
    cost_center: str | None = Field(default=None, max_length=140)
    remark: str | None = Field(default=None, max_length=300)


class FinanceManualJournalRequest(BaseModel):
    posting_date: date
    memo: str = Field(min_length=1, max_length=500)
    external_reference: str | None = Field(default=None, max_length=140)
    lines: list[FinanceJournalLineRequest] = Field(min_length=2)


class FinanceActionResult(BaseModel):
    success: bool = True
    sync_id: str
    target_name: str


class FinanceReportDescriptor(BaseModel):
    id: str
    title: str
    description: str
    format: str
    source: str


class FinanceReportCatalogResponse(BaseModel):
    success: bool = True
    data: list[FinanceReportDescriptor] = Field(default_factory=list)
