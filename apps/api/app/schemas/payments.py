from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class StripeIntentRequest(BaseModel):
    amount: float = Field(gt=0)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    email: EmailStr | None = None
    purpose: str | None = Field(default=None, max_length=200)
    method: str | None = Field(default="card", max_length=50)
    financial_type: str = Field(default="donation", max_length=50)


class PayPalOrderRequest(BaseModel):
    amount: float = Field(gt=0)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    email: EmailStr | None = None
    purpose: str | None = Field(default=None, max_length=200)


class PayPalCaptureRequest(BaseModel):
    order_id: str = Field(min_length=3, max_length=200)
    email: EmailStr | None = None
    contact_id: int | None = None
    purpose: str | None = Field(default=None, max_length=200)
