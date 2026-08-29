from __future__ import annotations

from typing import Literal
from uuid import UUID

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


class MakeOutboxClaimRequest(BaseModel):
    """Request for Make's signed, lease-based outbox consumer contract."""

    consumer_id: str = Field(
        min_length=3,
        max_length=100,
        pattern=r"^[A-Za-z0-9][A-Za-z0-9._:-]*$",
    )
    limit: int = Field(default=20, ge=1, le=100)
    lease_seconds: int = Field(default=300, ge=30, le=900)


class MakeOutboxAckRequest(BaseModel):
    """Idempotent result acknowledgement for one leased outbox event."""

    lease_token: UUID
    idempotency_key: str = Field(
        min_length=8,
        max_length=200,
        pattern=r"^[A-Za-z0-9][A-Za-z0-9._:-]*$",
    )
    result_class: Literal[
        "succeeded",
        "transient_failure",
        "permanent_failure",
        "business_failure",
        "auth_failure",
        "rate_limited",
        "schema_failure",
    ]
    result_reference: str | None = Field(
        default=None,
        max_length=200,
        pattern=r"^[A-Za-z0-9][A-Za-z0-9._:-]*$",
    )
    retry_after_seconds: int | None = Field(default=None, ge=30, le=86400)
