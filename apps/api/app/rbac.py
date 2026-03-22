from __future__ import annotations

import os
import hmac
import hashlib
import time
import json
import base64
import logging
from enum import Enum
from functools import wraps
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .lib.token_blacklist import is_token_revoked

logger = logging.getLogger("menschlichkeit.rbac")

_jwt_secret_raw = os.getenv("JWT_SECRET_KEY", "").strip()
if not _jwt_secret_raw:
    _jwt_secret_raw = os.getenv("JWT_SECRET", "").strip()
    if _jwt_secret_raw:
        logger.warning("JWT_SECRET ist veraltet – bitte JWT_SECRET_KEY verwenden.")

_environment = os.getenv("ENVIRONMENT", "").strip() or os.getenv("APP_ENV", "").strip() or "development"
if os.getenv("APP_ENV", "").strip() and not os.getenv("ENVIRONMENT", "").strip():
    logger.warning("APP_ENV ist veraltet – bitte ENVIRONMENT verwenden.")
_is_production = _environment == "production"
if not _jwt_secret_raw:
    if os.getenv("REPLIT_DEV_DOMAIN") and not _is_production:
        _jwt_secret_raw = "replit-dev-only-not-for-production"
        logger.warning("JWT_SECRET_KEY nicht gesetzt – verwende Entwicklungs-Fallback. NICHT für Produktion geeignet!")
    else:
        raise RuntimeError(
            "JWT_SECRET_KEY Umgebungsvariable ist nicht gesetzt. "
            "Bitte setzen Sie einen sicheren Schlüssel (mind. 32 Zeichen) bevor Sie die API starten."
        )
JWT_SECRET: str = _jwt_secret_raw
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRY_SECONDS = 3600

security_scheme = HTTPBearer(auto_error=False)


class Role(str, Enum):
    GUEST = "guest"
    MEMBER = "member"
    MODERATOR = "moderator"
    ADMIN = "admin"
    SYSADMIN = "sysadmin"


ROLE_HIERARCHY = {
    Role.GUEST: 0,
    Role.MEMBER: 1,
    Role.MODERATOR: 2,
    Role.ADMIN: 3,
    Role.SYSADMIN: 4,
}

ADMIN_EMAILS = [
    e.strip().lower()
    for e in os.getenv("ADMIN_EMAILS", "").split(",")
    if e.strip()
]


def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64_decode(s: str) -> bytes:
    s += "=" * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)


def create_jwt(payload: dict, expires_in: int = JWT_EXPIRY_SECONDS) -> str:
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    now = int(time.time())
    payload = {**payload, "iat": now, "exp": now + expires_in}
    header_b64 = _b64_encode(json.dumps(header).encode())
    payload_b64 = _b64_encode(json.dumps(payload).encode())
    message = f"{header_b64}.{payload_b64}"
    sig = hmac.new(JWT_SECRET.encode(), message.encode(), hashlib.sha256).digest()
    sig_b64 = _b64_encode(sig)
    return f"{message}.{sig_b64}"


def decode_jwt(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        message = f"{header_b64}.{payload_b64}"
        expected_sig = hmac.new(JWT_SECRET.encode(), message.encode(), hashlib.sha256).digest()
        actual_sig = _b64_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload = json.loads(_b64_decode(payload_b64))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return f"{salt.hex()}:{key.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_hex, key_hex = stored_hash.split(":")
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        actual_key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
        return hmac.compare_digest(expected_key, actual_key)
    except Exception:
        return False


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> Optional[dict]:
    if not credentials:
        return None
    if is_token_revoked(credentials.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token wurde widerrufen",
        )
    payload = decode_jwt(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiger oder abgelaufener Token",
        )
    return payload


async def require_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentifizierung erforderlich",
        )
    if is_token_revoked(credentials.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token wurde widerrufen",
        )
    payload = decode_jwt(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiger oder abgelaufener Token",
        )
    return payload


def require_role(minimum_role: Role):
    async def dependency(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    ) -> dict:
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentifizierung erforderlich",
            )
        if is_token_revoked(credentials.credentials):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token wurde widerrufen",
            )
        payload = decode_jwt(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ungültiger oder abgelaufener Token",
            )
        user_role_str = payload.get("role", "guest")
        try:
            user_role = Role(user_role_str)
        except ValueError:
            user_role = Role.GUEST

        if ROLE_HIERARCHY.get(user_role, 0) < ROLE_HIERARCHY.get(minimum_role, 0):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Mindestrolle '{minimum_role.value}' erforderlich",
            )
        return payload

    return Depends(dependency)
