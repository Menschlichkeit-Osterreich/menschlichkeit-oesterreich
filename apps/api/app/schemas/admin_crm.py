from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class AdminCrmContactUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=120)
    last_name: str | None = Field(default=None, max_length=120)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=50)
    street_address: str | None = Field(default=None, max_length=255)
    postal_code: str | None = Field(default=None, max_length=20)
    city: str | None = Field(default=None, max_length=120)
    newsletter_status: str | None = Field(default=None, max_length=40)


class AdminCrmMembershipCreate(BaseModel):
    membership_key: str = Field(min_length=2, max_length=80)

