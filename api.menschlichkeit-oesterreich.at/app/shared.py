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


def _extract_roles(claims: Dict[str, Any]) -> list:
    """Extract all role identifiers from JWT claims.

    Supports: `role` (str), `roles` (list), `is_admin` (bool).
    """
    result: list = []
    single = claims.get("role")
    if isinstance(single, str) and single:
        result.append(single.lower())
    multi = claims.get("roles") or []
    if isinstance(multi, str):
        multi = [multi]
    if isinstance(multi, list):
        result.extend(r.lower() for r in multi if isinstance(r, str))
    if claims.get("is_admin") is True and "admin" not in result:
        result.append("admin")
    return result


def require_admin(claims: Dict[str, Any]) -> None:
    """Enforce admin privileges from JWT claims.

    Accepts `role` (str) == 'admin', `roles` (array) containing 'admin',
    or boolean `is_admin`.
    """
    roles = _extract_roles(claims)
    if "admin" not in roles and "sysadmin" not in roles:
        raise HTTPException(status_code=403, detail="Admin privileges required")


def require_role(claims: Dict[str, Any], allowed_roles: list) -> None:
    """Enforce that the JWT claims contain at least one of the allowed roles.

    Admins are always permitted.
    Raises HTTP 403 if none of the allowed_roles (or admin) are present.
    """
    roles = _extract_roles(claims)

    if "admin" in roles or "sysadmin" in roles:
        return

    allowed_lower = [r.lower() for r in allowed_roles]
    if not any(r in allowed_lower for r in roles):
        raise HTTPException(
            status_code=403,
            detail=f"Required role(s): {', '.join(allowed_roles)}"
        )
