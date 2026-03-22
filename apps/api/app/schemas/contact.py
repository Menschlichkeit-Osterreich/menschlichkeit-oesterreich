from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class ContactSubmitRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    city: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=20)
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=10, max_length=5000)
    consent_privacy: bool = True
    newsletter_opt_in: bool = False
    source: str = Field(default="website_contact", max_length=100)
