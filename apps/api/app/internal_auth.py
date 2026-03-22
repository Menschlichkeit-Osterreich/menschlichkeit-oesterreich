from __future__ import annotations

import hashlib
import hmac
import os

from fastapi import Depends, HTTPException, Request, status

from .rbac import get_current_user

ADMIN_ROLES = {"admin", "sysadmin", "finance", "staff"}


async def require_internal_or_admin(
    request: Request,
    user: dict | None = Depends(get_current_user),
) -> dict:
    if user and user.get("role") in ADMIN_ROLES:
        return {"auth_type": "user", "user": user}

    auth_header = request.headers.get("authorization", "")
    bearer_token = auth_header.removeprefix("Bearer ").strip()
    api_key = request.headers.get("x-api-key", "").strip()
    shared_token = (
        os.getenv("MOE_API_TOKEN", "").strip()
        or os.getenv("N8N_API_KEY", "").strip()
        or os.getenv("INTERNAL_API_TOKEN", "").strip()
    )
    if shared_token and (bearer_token == shared_token or api_key == shared_token):
        return {"auth_type": "internal"}

    shared_secret = os.getenv("N8N_WEBHOOK_SECRET", "").strip() or os.getenv("INTERNAL_API_SECRET", "").strip()
    incoming = request.headers.get("x-webhook-signature") or request.headers.get("x-internal-signature")
    if shared_secret and incoming:
        raw_body = await request.body()
        expected = hmac.new(shared_secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
        if hmac.compare_digest(expected, incoming):
            return {"auth_type": "internal"}

    if shared_token or shared_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Interne Authentifizierung fehlgeschlagen")
    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Interne Authentifizierung nicht konfiguriert")
