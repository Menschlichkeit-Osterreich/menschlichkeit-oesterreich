from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    consent: bool = True
    source: str = Field(default="website_newsletter", max_length=100)


class NewsletterUnsubscribeRequest(BaseModel):
    email: EmailStr | None = None
    token: str | None = None
