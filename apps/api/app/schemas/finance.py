from __future__ import annotations

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
