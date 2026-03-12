from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    vorname: str = Field(min_length=1, max_length=100)
    nachname: str = Field(min_length=1, max_length=100)
    mitgliedschaft_typ: str = Field(default="ordentlich")


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    success: bool = True
    data: TokenData


class TokenData(BaseModel):
    token: str
    expires_in: int = 3600


class MessageResponse(BaseModel):
    success: bool = True
    message: str
