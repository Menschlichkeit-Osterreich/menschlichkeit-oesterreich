from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, EmailStr, Field

PaymentInterval = Literal["once", "monthly", "quarterly", "yearly"]


class StripeIntentRequest(BaseModel):
    amount: float = Field(gt=0)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    email: EmailStr | None = None
    purpose: str | None = Field(default=None, max_length=200)
    method: str | None = Field(default="card", max_length=50)
    financial_type: str = Field(default="donation", max_length=50)
    interval: PaymentInterval = "once"
