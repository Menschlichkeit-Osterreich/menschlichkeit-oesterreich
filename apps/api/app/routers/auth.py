"""
Menschlichkeit Österreich – Auth Router
Issue #119: [P0] Auth + Dashboard

Endpunkte:
  POST /api/auth/login              → JWT zurückgeben
  POST /api/auth/register           → Neuen User + CiviCRM-Kontakt anlegen
  POST /api/auth/refresh            → Access-Token erneuern
  POST /api/auth/logout             → Token invalidieren (client-seitig)
  POST /api/auth/password-reset/request   → Reset-Token per E-Mail
  POST /api/auth/password-reset/confirm   → Passwort neu setzen
  GET  /api/auth/me                 → Eigenes Profil abrufen (geschützt)
"""

from __future__ import annotations

import os
import logging
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field

from ..db import get_db

logger = logging.getLogger("menschlichkeit.api.auth")

router = APIRouter(prefix="/api/auth", tags=["Authentifizierung"])

# ── Kryptographie-Konfiguration ────────────────────────────────────────────────
JWT_SECRET      = os.getenv("JWT_SECRET", "CHANGE_ME_IN_PRODUCTION")
JWT_ALGORITHM   = "HS256"
ACCESS_TTL_MIN  = int(os.getenv("JWT_ACCESS_TTL_MIN", "60"))   # 60 Minuten
REFRESH_TTL_DAYS = int(os.getenv("JWT_REFRESH_TTL_DAYS", "30")) # 30 Tage

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer  = HTTPBearer(auto_error=False)


# ── Pydantic-Modelle ───────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str = Field(min_length=8)

class RegisterRequest(BaseModel):
    email:      EmailStr
    password:   str  = Field(min_length=10)
    first_name: str  = Field(min_length=1, max_length=100)
    last_name:  str  = Field(min_length=1, max_length=100)
    phone:      str | None = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token:        str
    new_password: str = Field(min_length=10)

class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    expires_in:    int  # Sekunden

class RefreshRequest(BaseModel):
    refresh_token: str

class UserProfile(BaseModel):
    id:          int
    email:       str
    first_name:  str
    last_name:   str
    role:        str
    civicrm_id:  int | None


# ── Hilfsfunktionen ────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_access_token(subject: str, role: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TTL_MIN)
    return jwt.encode(
        {"sub": subject, "role": role, "type": "access", "exp": exp},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

def create_refresh_token(subject: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=REFRESH_TTL_DAYS)
    return jwt.encode(
        {"sub": subject, "type": "refresh", "exp": exp},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token abgelaufen. Bitte neu einloggen.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiger Token.",
        )

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    db=Depends(get_db),
) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentifizierung erforderlich.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Kein Access-Token.")

    user = await db.fetchrow(
        "SELECT id, email, first_name, last_name, role, civicrm_contact_id "
        "FROM users WHERE id = $1 AND is_active = true",
        int(payload["sub"]),
    )
    if not user:
        raise HTTPException(status_code=401, detail="Benutzer nicht gefunden oder deaktiviert.")
    return dict(user)


# ── Endpunkte ──────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse, summary="Login")
async def login(body: LoginRequest, db=Depends(get_db)):
    """
    Anmeldung mit E-Mail und Passwort.
    Gibt Access- und Refresh-Token zurück.
    """
    user = await db.fetchrow(
        "SELECT id, email, password_hash, role, is_active "
        "FROM users WHERE email = $1",
        body.email,
    )
    if not user or not verify_password(body.password, user["password_hash"]):
        # Gleiche Fehlermeldung für user-not-found und wrong-password (timing-safe)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-Mail oder Passwort falsch.",
        )
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Konto deaktiviert. Bitte wenden Sie sich an den Support.",
        )

    await db.execute(
        "UPDATE users SET last_login = NOW() WHERE id = $1",
        user["id"],
    )

    logger.info(f"Login OK: user_id={user['id']} email={body.email}")
    return TokenResponse(
        access_token=create_access_token(str(user["id"]), user["role"]),
        refresh_token=create_refresh_token(str(user["id"])),
        expires_in=ACCESS_TTL_MIN * 60,
    )


@router.post("/register", status_code=status.HTTP_201_CREATED, summary="Registrieren")
async def register(body: RegisterRequest, db=Depends(get_db)):
    """
    Neuen Benutzer anlegen.
    Erstellt außerdem einen CiviCRM-Kontakt (via n8n-Webhook oder direkt).
    """
    existing = await db.fetchval(
        "SELECT id FROM users WHERE email = $1", body.email
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Diese E-Mail-Adresse ist bereits registriert.",
        )

    user_id = await db.fetchval(
        """
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, 'member', true, NOW())
        RETURNING id
        """,
        body.email,
        hash_password(body.password),
        body.first_name,
        body.last_name,
        body.phone,
    )

    logger.info(f"Neuer Benutzer: user_id={user_id} email={body.email}")
    return {"message": "Registrierung erfolgreich. Bitte bestätigen Sie Ihre E-Mail-Adresse.", "user_id": user_id}


@router.post("/refresh", response_model=TokenResponse, summary="Token erneuern")
async def refresh_token(body: RefreshRequest, db=Depends(get_db)):
    """Neuen Access-Token via Refresh-Token holen."""
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Kein Refresh-Token.")

    user = await db.fetchrow(
        "SELECT id, role, is_active FROM users WHERE id = $1",
        int(payload["sub"]),
    )
    if not user or not user["is_active"]:
        raise HTTPException(status_code=401, detail="Benutzer nicht gefunden.")

    return TokenResponse(
        access_token=create_access_token(str(user["id"]), user["role"]),
        refresh_token=create_refresh_token(str(user["id"])),
        expires_in=ACCESS_TTL_MIN * 60,
    )


@router.post("/logout", summary="Logout")
async def logout():
    """
    Logout – Token-Invalidierung erfolgt client-seitig (Token löschen).
    Server-seitige Blacklist kann via Redis ergänzt werden.
    """
    return {"message": "Logout erfolgreich."}


@router.post("/password-reset/request", summary="Passwort-Reset anfordern")
async def password_reset_request(
    body: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db=Depends(get_db),
):
    """
    Reset-Token generieren und per E-Mail versenden.
    Gibt immer 200 zurück (auch wenn E-Mail nicht gefunden) – gegen User-Enumeration.
    """
    user = await db.fetchrow(
        "SELECT id, first_name FROM users WHERE email = $1 AND is_active = true",
        body.email,
    )
    if user:
        token = secrets.token_urlsafe(48)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=2)

        await db.execute(
            """
            INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used)
            VALUES ($1, $2, $3, false)
            ON CONFLICT (user_id) DO UPDATE
            SET token_hash = EXCLUDED.token_hash,
                expires_at = EXCLUDED.expires_at,
                used = false
            """,
            user["id"], token_hash, expires_at,
        )

        # E-Mail via n8n-Webhook (asynchron)
        reset_url = f"https://menschlichkeit-oesterreich.at/passwort-reset?token={token}"
        background_tasks.add_task(_send_reset_email, body.email, user["first_name"], reset_url)
        logger.info(f"Password-Reset angefordert: user_id={user['id']}")

    # Immer gleiche Antwort (Anti-Enumeration)
    return {"message": "Falls die E-Mail-Adresse bei uns bekannt ist, erhalten Sie in Kürze eine E-Mail."}


@router.post("/password-reset/confirm", summary="Passwort neu setzen")
async def password_reset_confirm(body: PasswordResetConfirm, db=Depends(get_db)):
    """Token validieren und neues Passwort setzen."""
    token_hash = hashlib.sha256(body.token.encode()).hexdigest()

    record = await db.fetchrow(
        """
        SELECT prt.user_id, prt.expires_at, prt.used
        FROM password_reset_tokens prt
        WHERE prt.token_hash = $1
        """,
        token_hash,
    )
    if not record:
        raise HTTPException(status_code=400, detail="Ungültiger Reset-Link.")
    if record["used"]:
        raise HTTPException(status_code=400, detail="Dieser Reset-Link wurde bereits verwendet.")
    if record["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset-Link abgelaufen. Bitte erneut anfordern.")

    await db.execute(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        hash_password(body.new_password),
        record["user_id"],
    )
    await db.execute(
        "UPDATE password_reset_tokens SET used = true WHERE token_hash = $1",
        token_hash,
    )
    logger.info(f"Passwort zurückgesetzt: user_id={record['user_id']}")
    return {"message": "Passwort erfolgreich geändert. Sie können sich jetzt einloggen."}


@router.get("/me", response_model=UserProfile, summary="Eigenes Profil")
async def me(current_user: Annotated[dict, Depends(get_current_user)]):
    """Gibt das Profil des aktuell eingeloggten Benutzers zurück."""
    return UserProfile(
        id=current_user["id"],
        email=current_user["email"],
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        role=current_user["role"],
        civicrm_id=current_user.get("civicrm_contact_id"),
    )


# ── Hilfsfunktion (Hintergrund-Task) ──────────────────────────────────────────

async def _send_reset_email(email: str, first_name: str, reset_url: str) -> None:
    """Sendet Reset-E-Mail via n8n-Webhook (fire-and-forget)."""
    import httpx
    n8n_url = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678")
    webhook = f"{n8n_url}/webhook/password-reset"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(webhook, json={
                "email": email,
                "first_name": first_name,
                "reset_url": reset_url,
            })
    except Exception as exc:
        logger.error(f"Fehler beim Senden der Reset-E-Mail an {email}: {exc}")
