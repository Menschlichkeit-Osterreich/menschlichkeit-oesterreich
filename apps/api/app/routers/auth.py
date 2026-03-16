from __future__ import annotations

import logging
import secrets
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException, status

from ..db import fetch, fetchrow, fetchval, execute
from ..lib.pii_sanitizer import scrub
from ..rbac import (
    ADMIN_EMAILS,
    Role,
    create_jwt,
    hash_password,
    verify_password,
)
from ..schemas.auth import (
    LoginRequest,
    MessageResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    RegisterRequest,
    TokenData,
    TokenResponse,
)

logger = logging.getLogger("menschlichkeit.auth")
router = APIRouter()


async def _ensure_members_table() -> None:
    await execute("""
        CREATE TABLE IF NOT EXISTS members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            vorname TEXT NOT NULL DEFAULT '',
            nachname TEXT NOT NULL DEFAULT '',
            rolle TEXT NOT NULL DEFAULT 'member',
            mitgliedschaft_typ TEXT NOT NULL DEFAULT 'ordentlich',
            status TEXT NOT NULL DEFAULT 'Active',
            joined_at TIMESTAMPTZ DEFAULT NOW(),
            cancelled_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)


async def _ensure_password_reset_table() -> None:
    await execute("""
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)


@router.post("/auth/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    await _ensure_members_table()
    row = await fetchrow(
        "SELECT id, email, password_hash, rolle, status FROM members WHERE LOWER(email) = LOWER($1)",
        body.email,
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ungültige Anmeldedaten")

    row = dict(row)
    if not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Ungültige Anmeldedaten")

    if row["status"] != "Active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Konto ist nicht aktiv")

    role = row["rolle"]
    if body.email.lower() in ADMIN_EMAILS and role not in ("admin", "sysadmin"):
        role = "admin"

    token = create_jwt({"sub": row["email"], "uid": str(row["id"]), "role": role})
    logger.info(f"Login erfolgreich: {scrub(row['email'])}")
    return TokenResponse(data=TokenData(token=token, expires_in=3600))


@router.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    await _ensure_members_table()
    existing = await fetchval("SELECT COUNT(*) FROM members WHERE LOWER(email) = LOWER($1)", body.email)
    if existing and existing > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-Mail-Adresse bereits registriert")

    member_id = str(uuid4())
    pw_hash = hash_password(body.password)

    role = "admin" if body.email.lower() in ADMIN_EMAILS else "member"

    await execute(
        """INSERT INTO members (id, email, password_hash, vorname, nachname, rolle, mitgliedschaft_typ)
           VALUES ($1, $2, $3, $4, $5, $6, $7)""",
        member_id, body.email.lower(), pw_hash, body.vorname, body.nachname, role, body.mitgliedschaft_typ,
    )

    token = create_jwt({"sub": body.email.lower(), "uid": member_id, "role": role})
    logger.info(f"Registrierung erfolgreich: {scrub(body.email)}")
    return TokenResponse(data=TokenData(token=token, expires_in=3600))


@router.post("/auth/password-reset", response_model=MessageResponse)
async def password_reset_request(body: PasswordResetRequest):
    await _ensure_members_table()
    await _ensure_password_reset_table()

    row = await fetchrow(
        "SELECT id, email FROM members WHERE LOWER(email) = LOWER($1) AND status = 'Active'",
        body.email,
    )

    safe_message = "Falls ein Konto mit dieser E-Mail existiert, wurde ein Wiederherstellungs-Link gesendet."

    if not row:
        logger.info(f"Passwort-Reset angefordert für unbekannte E-Mail: {scrub(body.email)}")
        return MessageResponse(message=safe_message)

    reset_token = secrets.token_urlsafe(48)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    await execute(
        "UPDATE password_reset_tokens SET used = TRUE WHERE LOWER(email) = LOWER($1) AND used = FALSE",
        body.email,
    )

    await execute(
        "INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)",
        body.email.lower(), reset_token, expires_at.isoformat(),
    )

    logger.info(f"Passwort-Reset Token erstellt für: {scrub(body.email)}")
    return MessageResponse(message=safe_message)


@router.post("/auth/password-reset/confirm", response_model=MessageResponse)
async def password_reset_confirm(body: PasswordResetConfirm):
    await _ensure_members_table()
    await _ensure_password_reset_table()

    row = await fetchrow(
        "SELECT id, email, expires_at, used FROM password_reset_tokens WHERE token = $1",
        body.token,
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ungültiger oder abgelaufener Token",
        )

    row_dict = dict(row)

    if row_dict.get("used"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dieser Token wurde bereits verwendet",
        )

    expires_at = row_dict["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        await execute("UPDATE password_reset_tokens SET used = TRUE WHERE token = $1", body.token)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ungültiger oder abgelaufener Token",
        )

    new_hash = hash_password(body.new_password)
    email = row_dict["email"]

    await execute(
        "UPDATE members SET password_hash = $1, updated_at = NOW() WHERE LOWER(email) = LOWER($2)",
        new_hash, email,
    )

    await execute("UPDATE password_reset_tokens SET used = TRUE WHERE token = $1", body.token)

    logger.info(f"Passwort erfolgreich zurückgesetzt für: {scrub(email)}")
    return MessageResponse(message="Passwort wurde erfolgreich zurückgesetzt.")
