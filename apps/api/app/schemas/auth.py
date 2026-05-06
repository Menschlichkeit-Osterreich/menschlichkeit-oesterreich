from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    twoFactorCode: str | None = Field(default=None, min_length=6, max_length=32)
    two_factor_code: str | None = Field(default=None, min_length=6, max_length=32)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str | None = Field(default=None, min_length=8, max_length=128)
    vorname: str | None = Field(default=None, min_length=1, max_length=100)
    nachname: str | None = Field(default=None, min_length=1, max_length=100)
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    firstName: str | None = Field(default=None, min_length=1, max_length=100)
    lastName: str | None = Field(default=None, min_length=1, max_length=100)
    mitgliedschaft_typ: str = Field(default="ordentlich")
    mitgliedschaftTyp: str | None = Field(default=None)
    accept_terms: bool = False
    accept_privacy: bool = False
    newsletter_opt_in: bool = False
    acceptTerms: bool = False
    acceptPrivacy: bool = False
    newsletterOptIn: bool = False


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str | None = Field(default=None, min_length=8, max_length=128)
    password: str | None = Field(default=None, min_length=8, max_length=128)
    confirmPassword: str | None = Field(default=None, min_length=8, max_length=128)


class RefreshRequest(BaseModel):
    refreshToken: str | None = None
    refresh_token: str | None = None


class VerifyEmailRequest(BaseModel):
    token: str


class TokenResponse(BaseModel):
    success: bool = True
    data: dict


class TokenData(BaseModel):
    token: str
    expires_in: int = 3600


class MessageResponse(BaseModel):
    success: bool = True
    message: str
