from __future__ import annotations

from fastapi import Header, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import time
import jwt


class ApiResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


def _require_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if value is None or value.strip() == "":
        raise RuntimeError(f"Missing required environment variable: {var_name}")
    return value


JWT_SECRET = os.getenv("JWT_SECRET") or ""


def verify_jwt_token(authorization: str = Header(...)) -> Dict[str, Any]:
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        secret = JWT_SECRET or _require_env("JWT_SECRET")
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload  # e.g., {"sub": email, "type": "access", ...}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_admin(claims: Dict[str, Any]) -> None:
    """Enforce admin privileges from JWT claims.

    Accepts either `roles` array containing 'admin' or boolean `is_admin`.
    """
    roles = claims.get("roles") or []
    is_admin = claims.get("is_admin") is True
    if isinstance(roles, str):
        roles = [roles]
    if not (is_admin or (isinstance(roles, list) and any(r.lower() == "admin" for r in roles))):
        raise HTTPException(status_code=403, detail="Admin privileges required")


def require_role(claims: Dict[str, Any], allowed_roles: list) -> None:
    """Enforce that the JWT claims contain at least one of the allowed roles.

    Admins (via `is_admin` flag or 'admin' in roles) are always permitted.
    Raises HTTP 403 if none of the allowed_roles (or admin) are present.
    """
    roles = claims.get("roles") or []
    if isinstance(roles, str):
        roles = [roles]
    roles_lower = [r.lower() for r in roles] if isinstance(roles, list) else []

    is_admin = claims.get("is_admin") is True or "admin" in roles_lower
    if is_admin:
        return

    allowed_lower = [r.lower() for r in allowed_roles]
    if not any(r in allowed_lower for r in roles_lower):
        raise HTTPException(
            status_code=403,
            detail=f"Required role(s): {', '.join(allowed_roles)}"
        )
