from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class MemberBase(BaseModel):
    email: EmailStr
    vorname: str = Field(min_length=1, max_length=100)
    nachname: str = Field(min_length=1, max_length=100)
    mitgliedschaft_typ: str = Field(default="ordentlich")
    status: str = Field(default="Active")


class MemberCreate(MemberBase):
    password: str = Field(min_length=8, max_length=128)


class MemberUpdate(BaseModel):
    vorname: Optional[str] = None
    nachname: Optional[str] = None
    email: Optional[EmailStr] = None
    mitgliedschaft_typ: Optional[str] = None
    status: Optional[str] = None
    rolle: Optional[str] = None


class MemberResponse(BaseModel):
    id: str
    email: str
    vorname: str
    nachname: str
    mitgliedschaft_typ: str
    status: str
    rolle: str
    joined_at: Optional[str] = None
    created_at: Optional[str] = None


class MemberListResponse(BaseModel):
    success: bool = True
    data: list[MemberResponse]
    total: int
    page: int
    page_size: int
