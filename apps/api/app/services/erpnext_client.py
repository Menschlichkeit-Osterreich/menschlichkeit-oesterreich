from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass
from typing import Any

import httpx

from ..schemas.erpnext import (
    ErpNextAssetPayload,
    ErpNextCustomerPayload,
    ErpNextDocRef,
    ErpNextEmployeePayload,
    ErpNextJournalEntryPayload,
    ErpNextListResult,
    ErpNextPaymentEntryPayload,
    ErpNextPurchaseInvoicePayload,
    ErpNextSalesInvoicePayload,
    ErpNextSupplierPayload,
)
from ..secrets_provider import get_secret

logger = logging.getLogger("menschlichkeit.finance.erpnext")


class ErpNextClientError(RuntimeError):
    def __init__(self, message: str, *, status_code: int | None = None, body: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.body = body


@dataclass(frozen=True)
class ErpNextConfig:
    base_url: str
    api_key: str
    api_secret: str
    company: str
    timeout_seconds: float
    max_retries: int
    naming_series_sales: str
    naming_series_purchase: str
    naming_series_journal: str

    @property
    def enabled(self) -> bool:
        return bool(self.base_url and self.api_key and self.api_secret)


def get_erpnext_config() -> ErpNextConfig:
    timeout_raw = get_secret("ERP_TIMEOUT_SECONDS", "12", bsm_key="api/ERP_TIMEOUT_SECONDS").strip() or "12"
    retries_raw = get_secret("ERP_MAX_RETRIES", "2", bsm_key="api/ERP_MAX_RETRIES").strip() or "2"
    return ErpNextConfig(
        base_url=get_secret("FRAPPE_BASE_URL", "", bsm_key="api/FRAPPE_BASE_URL").rstrip("/"),
        api_key=get_secret("FRAPPE_API_KEY", "", bsm_key="api/FRAPPE_API_KEY"),
        api_secret=get_secret("FRAPPE_API_SECRET", "", bsm_key="api/FRAPPE_API_SECRET"),
        company=get_secret("ERP_COMPANY", "Menschlichkeit Österreich", bsm_key="api/ERP_COMPANY"),
        timeout_seconds=float(timeout_raw),
        max_retries=max(int(retries_raw), 0),
        naming_series_sales=get_secret("ERP_SALES_INVOICE_SERIES", "ACC-SINV-.YYYY.-", bsm_key="api/ERP_SALES_INVOICE_SERIES"),
        naming_series_purchase=get_secret("ERP_PURCHASE_INVOICE_SERIES", "ACC-PINV-.YYYY.-", bsm_key="api/ERP_PURCHASE_INVOICE_SERIES"),
        naming_series_journal=get_secret("ERP_JOURNAL_ENTRY_SERIES", "ACC-JV-.YYYY.-", bsm_key="api/ERP_JOURNAL_ENTRY_SERIES"),
    )


class ErpNextClient:
    def __init__(self, config: ErpNextConfig | None = None):
        self.config = config or get_erpnext_config()

    @property
    def enabled(self) -> bool:
        return self.config.enabled

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"token {self.config.api_key}:{self.config.api_secret}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    async def _request(
        self,
        method: str,
        path: str,
        *,
        json_body: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if not self.enabled:
            raise ErpNextClientError("ERPNext ist nicht konfiguriert")

        url = f"{self.config.base_url}{path}"
        attempts = self.config.max_retries + 1
        last_error: Exception | None = None

        for attempt in range(1, attempts + 1):
            try:
                async with httpx.AsyncClient(timeout=self.config.timeout_seconds) as client:
                    response = await client.request(
                        method,
                        url,
                        headers=self._headers(),
                        json=json_body,
                        params=params,
                    )
                body: Any
                try:
                    body = response.json()
                except ValueError:
                    body = {"raw": response.text}

                if response.status_code >= 500:
                    raise ErpNextClientError(
                        "ERPNext Serverfehler",
                        status_code=response.status_code,
                        body=body,
                    )
                if response.status_code >= 400:
                    raise ErpNextClientError(
                        "ERPNext Anfrage fehlgeschlagen",
                        status_code=response.status_code,
                        body=body,
                    )
                if isinstance(body, dict) and "data" in body and isinstance(body["data"], dict):
                    return body["data"]
                return body if isinstance(body, dict) else {"data": body}
            except (httpx.TimeoutException, httpx.NetworkError, ErpNextClientError) as exc:
                last_error = exc
                retryable = isinstance(exc, (httpx.TimeoutException, httpx.NetworkError))
                retryable = retryable or (
                    isinstance(exc, ErpNextClientError)
                    and exc.status_code is not None
                    and exc.status_code >= 500
                )
                if attempt >= attempts or not retryable:
                    if isinstance(exc, ErpNextClientError):
                        raise
                    raise ErpNextClientError("ERPNext Netzwerkfehler") from exc
                await asyncio.sleep(min(0.5 * attempt, 2.0))

        raise ErpNextClientError("ERPNext Anfrage fehlgeschlagen") from last_error

    async def ping(self) -> dict[str, Any]:
        if not self.enabled:
            return {"enabled": False, "status": "disabled"}
        data = await self._request("GET", "/api/method/ping")
        return {"enabled": True, "status": data.get("message") or "ok"}

    async def insert_doc(self, doctype: str, payload: dict[str, Any]) -> ErpNextDocRef:
        data = await self._request(
            "POST",
            f"/api/resource/{doctype}",
            json_body=payload,
        )
        name = str(data.get("name") or data.get("message") or "")
        return ErpNextDocRef(
            doctype=str(data.get("doctype") or doctype),
            name=name,
            docstatus=data.get("docstatus"),
        )

    async def get_doc(self, doctype: str, name: str) -> dict[str, Any]:
        return await self._request("GET", f"/api/resource/{doctype}/{name}")

    async def list_docs(
        self,
        doctype: str,
        *,
        fields: list[str] | None = None,
        filters: list[list[Any]] | None = None,
        limit_page_length: int = 20,
        order_by: str | None = None,
    ) -> ErpNextListResult:
        params: dict[str, Any] = {"limit_page_length": limit_page_length}
        if fields:
            params["fields"] = json.dumps(fields)
        if filters:
            params["filters"] = json.dumps(filters)
        if order_by:
            params["order_by"] = order_by
        data = await self._request("GET", f"/api/resource/{doctype}", params=params)
        rows = data if isinstance(data, list) else data.get("data", data)
        if not isinstance(rows, list):
            rows = []
        return ErpNextListResult(data=rows)

    async def ensure_customer(self, payload: ErpNextCustomerPayload) -> str:
        external_ref = payload.external_reference
        if external_ref:
            existing = await self.list_docs(
                "Customer",
                fields=["name", "customer_name"],
                filters=[["Customer", "customer_name", "=", payload.customer_name]],
                limit_page_length=1,
            )
            if existing.data:
                return str(existing.data[0]["name"])
        doc = await self.insert_doc("Customer", payload.model_dump(exclude_none=True))
        return doc.name

    async def ensure_supplier(self, payload: ErpNextSupplierPayload) -> str:
        existing = await self.list_docs(
            "Supplier",
            fields=["name", "supplier_name"],
            filters=[["Supplier", "supplier_name", "=", payload.supplier_name]],
            limit_page_length=1,
        )
        if existing.data:
            return str(existing.data[0]["name"])
        doc = await self.insert_doc("Supplier", payload.model_dump(exclude_none=True))
        return doc.name

    async def create_sales_invoice(self, payload: ErpNextSalesInvoicePayload) -> ErpNextDocRef:
        return await self.insert_doc("Sales Invoice", payload.model_dump(exclude_none=True))

    async def create_purchase_invoice(self, payload: ErpNextPurchaseInvoicePayload) -> ErpNextDocRef:
        return await self.insert_doc("Purchase Invoice", payload.model_dump(exclude_none=True))

    async def create_payment_entry(self, payload: ErpNextPaymentEntryPayload) -> ErpNextDocRef:
        return await self.insert_doc("Payment Entry", payload.model_dump(exclude_none=True))

    async def create_journal_entry(self, payload: ErpNextJournalEntryPayload) -> ErpNextDocRef:
        return await self.insert_doc("Journal Entry", payload.model_dump(exclude_none=True))

    async def create_employee(self, payload: ErpNextEmployeePayload) -> ErpNextDocRef:
        return await self.insert_doc("Employee", payload.model_dump(exclude_none=True))

    async def create_asset(self, payload: ErpNextAssetPayload) -> ErpNextDocRef:
        return await self.insert_doc("Asset", payload.model_dump(exclude_none=True))

    async def receivables_summary(self) -> list[dict[str, Any]]:
        result = await self.list_docs(
            "Sales Invoice",
            fields=["name", "customer", "customer_name", "grand_total", "outstanding_amount", "status", "due_date", "posting_date"],
            filters=[["Sales Invoice", "docstatus", "<", 2]],
            limit_page_length=50,
            order_by="due_date asc",
        )
        return result.data

    async def payables_summary(self) -> list[dict[str, Any]]:
        result = await self.list_docs(
            "Purchase Invoice",
            fields=["name", "supplier", "supplier_name", "grand_total", "outstanding_amount", "status", "due_date", "posting_date"],
            filters=[["Purchase Invoice", "docstatus", "<", 2]],
            limit_page_length=50,
            order_by="due_date asc",
        )
        return result.data

    async def bank_accounts_summary(self) -> list[dict[str, Any]]:
        result = await self.list_docs(
            "Bank Account",
            fields=["name", "bank", "bank_account_no", "is_company_account", "company"],
            limit_page_length=20,
        )
        return result.data

    async def payroll_entries_summary(self) -> list[dict[str, Any]]:
        result = await self.list_docs(
            "Payroll Entry",
            fields=["name", "company", "start_date", "end_date", "posting_date", "status"],
            limit_page_length=20,
            order_by="modified desc",
        )
        return result.data

    async def assets_summary(self) -> list[dict[str, Any]]:
        result = await self.list_docs(
            "Asset",
            fields=["name", "asset_name", "status", "gross_purchase_amount", "purchase_date", "available_for_use_date"],
            limit_page_length=20,
            order_by="modified desc",
        )
        return result.data

    async def expense_claims_summary(self) -> list[dict[str, Any]]:
        result = await self.list_docs(
            "Expense Claim",
            fields=["name", "employee_name", "total_claimed_amount", "posting_date", "approval_status"],
            limit_page_length=20,
            order_by="modified desc",
        )
        return result.data


erpnext_client = ErpNextClient()
