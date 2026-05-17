"""
Democracy Game – Bruecken bauen
SSO auth guard and guest-token middleware (T067).
Workshop guests receive a 2h-TTL token; authenticated users pass through SSO.
"""

from __future__ import annotations

import os
import time
from typing import Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_bearer = HTTPBearer(auto_error=False)

GUEST_TOKEN_TTL_SECONDS = 2 * 60 * 60  # 2 h per FR-021 / data-model constraint

# In production, JWT_SECRET comes from secrets management (Bitwarden).
_JWT_SECRET = os.getenv("JWT_SECRET", "")


def _decode_token(token: str) -> dict[str, Any]:
    """Decode a JWT token. Returns payload dict.

    Raises HTTPException on invalid / expired token.
    Uses PyJWT when available, otherwise falls back to a
    minimal validation stub for development.
    """
    try:
        import jwt  # PyJWT

        payload: dict[str, Any] = jwt.decode(
            token,
            _JWT_SECRET,
            algorithms=["HS256"],
            options={"require": ["exp", "sub"]},
        )
        return payload
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT-Bibliothek nicht verfuegbar",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungueltiger oder abgelaufener Token",
        )


async def require_democracy_auth(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict[str, Any]:
    """Dependency: require valid SSO or guest token.

    Sets ``request.state.user`` with at minimum ``sub`` and ``role``.
    Guest tokens additionally carry ``guest=True`` and ``session_id``.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentifizierung erforderlich",
        )

    payload = _decode_token(credentials.credentials)

    # Guest token TTL enforcement
    if payload.get("guest") is True:
        issued_at = payload.get("iat", 0)
        if time.time() - issued_at > GUEST_TOKEN_TTL_SECONDS:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Gast-Token abgelaufen (2h TTL ueberschritten)",
            )

    request.state.user = payload
    return payload


async def require_host_role(
    user: dict[str, Any] = Depends(require_democracy_auth),
) -> dict[str, Any]:
    """Dependency: require workshop host privileges."""
    if user.get("guest") is True:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur Moderator:innen koennen diese Aktion ausfuehren",
        )
    return user
