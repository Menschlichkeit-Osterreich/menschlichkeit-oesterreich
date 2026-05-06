from __future__ import annotations

from pydantic import BaseModel, Field


class ConsentCreateRequest(BaseModel):
    type: str = Field(min_length=1, max_length=50)
    version: str = Field(min_length=1, max_length=50)
    source: str = Field(default="website", max_length=100)


class DataDeletionRequestCreate(BaseModel):
    reason: str = Field(min_length=3, max_length=1000)
    scope: str = Field(default="full", max_length=20)


class DataExportRequestCreate(BaseModel):
    reason: str | None = Field(default=None, max_length=1000)


class CookiePreferencesPayload(BaseModel):
    essential: bool = True
    analytics: bool = False
    marketing: bool = False
    functional: bool = False
    preferences: bool = False


class PrivacySettingsPayload(BaseModel):
    dataProcessing: dict
    communication: dict
    sharing: dict
