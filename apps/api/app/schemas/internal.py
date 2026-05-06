from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class InternalMailSendRequest(BaseModel):
    template_id: str = Field(min_length=1, max_length=100)
    recipient_email: EmailStr
    subject: str | None = Field(default=None, max_length=500)
    context: dict = Field(default_factory=dict)
    entity_type: str | None = Field(default=None, max_length=50)
    entity_id: int | None = None


class InternalSyncMemberRequest(BaseModel):
    member_id: str = Field(min_length=1)
    membership_key: str | None = Field(default=None, max_length=100)


class InternalPaymentConfirmedRequest(BaseModel):
    donor_email: EmailStr
    donor_name: str = Field(min_length=1, max_length=200)
    amount: float = Field(gt=0)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    donation_type: str = Field(default="one_time", max_length=50)
    source: str = Field(default="n8n", max_length=200)
    gateway_charge_id: str | None = Field(default=None, max_length=200)
    civicrm_contact_id: int | None = None
