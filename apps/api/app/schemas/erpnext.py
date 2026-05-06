from __future__ import annotations

from datetime import date
from typing import Any

from pydantic import BaseModel, Field


class ErpNextDocRef(BaseModel):
    doctype: str
    name: str
    docstatus: int | None = None


class ErpNextAddress(BaseModel):
    email_id: str | None = None
    address_line1: str | None = None
    city: str | None = None
    pincode: str | None = None
    country: str | None = None


class ErpNextCustomerPayload(BaseModel):
    customer_name: str = Field(min_length=1, max_length=140)
    customer_group: str = Field(default="All Customer Groups")
    territory: str = Field(default="All Territories")
    customer_type: str = Field(default="Individual")
    email_id: str | None = None
    mobile_no: str | None = None
    tax_id: str | None = None
    external_reference: str | None = None
    primary_address: ErpNextAddress | None = None


class ErpNextSupplierPayload(BaseModel):
    supplier_name: str = Field(min_length=1, max_length=140)
    supplier_group: str = Field(default="All Supplier Groups")
    supplier_type: str = Field(default="Company")
    email_id: str | None = None
    mobile_no: str | None = None
    tax_id: str | None = None
    external_reference: str | None = None
    primary_address: ErpNextAddress | None = None


class ErpNextItemLine(BaseModel):
    item_code: str = Field(min_length=1, max_length=140)
    item_name: str | None = None
    description: str = Field(min_length=1, max_length=500)
    qty: float = Field(gt=0)
    rate: float = Field(ge=0)
    amount: float = Field(ge=0)
    income_account: str | None = None
    expense_account: str | None = None
    cost_center: str | None = None
    uom: str = Field(default="Nos")
    conversion_factor: float = Field(default=1.0, gt=0)


class ErpNextSalesInvoicePayload(BaseModel):
    customer: str = Field(min_length=1, max_length=140)
    company: str = Field(min_length=1, max_length=140)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    due_date: date | None = None
    posting_date: date | None = None
    set_posting_time: int = 1
    items: list[ErpNextItemLine] = Field(default_factory=list)
    naming_series: str | None = None
    remarks: str | None = None
    debit_to: str | None = None
    cost_center: str | None = None
    custom_external_reference: str | None = None


class ErpNextPurchaseInvoicePayload(BaseModel):
    supplier: str = Field(min_length=1, max_length=140)
    company: str = Field(min_length=1, max_length=140)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    bill_date: date | None = None
    due_date: date | None = None
    posting_date: date | None = None
    items: list[ErpNextItemLine] = Field(default_factory=list)
    naming_series: str | None = None
    remarks: str | None = None
    cost_center: str | None = None
    custom_external_reference: str | None = None


class ErpNextPaymentReference(BaseModel):
    reference_doctype: str = Field(min_length=1, max_length=140)
    reference_name: str = Field(min_length=1, max_length=140)
    total_amount: float | None = Field(default=None, ge=0)
    outstanding_amount: float | None = Field(default=None, ge=0)
    allocated_amount: float = Field(ge=0)


class ErpNextPaymentEntryPayload(BaseModel):
    payment_type: str = Field(min_length=1, max_length=30)
    party_type: str = Field(min_length=1, max_length=30)
    party: str = Field(min_length=1, max_length=140)
    company: str = Field(min_length=1, max_length=140)
    posting_date: date | None = None
    paid_from: str = Field(min_length=1, max_length=140)
    paid_to: str = Field(min_length=1, max_length=140)
    paid_amount: float = Field(gt=0)
    received_amount: float = Field(gt=0)
    reference_no: str | None = None
    reference_date: date | None = None
    mode_of_payment: str | None = None
    references: list[ErpNextPaymentReference] = Field(default_factory=list)
    remarks: str | None = None
    custom_external_reference: str | None = None


class ErpNextJournalEntryLine(BaseModel):
    account: str = Field(min_length=1, max_length=140)
    debit_in_account_currency: float = Field(default=0, ge=0)
    credit_in_account_currency: float = Field(default=0, ge=0)
    cost_center: str | None = None
    reference_type: str | None = None
    reference_name: str | None = None
    user_remark: str | None = None


class ErpNextJournalEntryPayload(BaseModel):
    company: str = Field(min_length=1, max_length=140)
    posting_date: date | None = None
    voucher_type: str = Field(default="Journal Entry")
    user_remark: str | None = None
    naming_series: str | None = None
    accounts: list[ErpNextJournalEntryLine] = Field(default_factory=list)
    custom_external_reference: str | None = None


class ErpNextEmployeePayload(BaseModel):
    employee_name: str = Field(min_length=1, max_length=140)
    company: str = Field(min_length=1, max_length=140)
    date_of_joining: date | None = None
    status: str = Field(default="Active")
    personal_email: str | None = None
    department: str | None = None
    designation: str | None = None
    external_reference: str | None = None


class ErpNextAssetPayload(BaseModel):
    asset_name: str = Field(min_length=1, max_length=140)
    company: str = Field(min_length=1, max_length=140)
    asset_category: str = Field(min_length=1, max_length=140)
    gross_purchase_amount: float = Field(ge=0)
    purchase_date: date | None = None
    available_for_use_date: date | None = None
    location: str | None = None
    custodian: str | None = None
    external_reference: str | None = None


class ErpNextListResult(BaseModel):
    data: list[dict[str, Any]] = Field(default_factory=list)


class ErpNextSyncResult(BaseModel):
    success: bool = True
    operation: str
    doctype: str
    source_entity_type: str
    source_entity_id: str
    target_name: str | None = None
    payload_hash: str
    attempts: int = 1
    message: str | None = None
