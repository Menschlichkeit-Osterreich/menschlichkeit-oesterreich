import os
from datetime import datetime, timedelta
from typing import Any, Dict

import jwt
import pytest
from fastapi.testclient import TestClient


# Ensure required env vars before importing app
os.environ.setdefault("APP_ENV", "development")
os.environ.setdefault("CIVI_BASE_URL", "https://example.invalid")
os.environ.setdefault("CIVI_SITE_KEY", "test_site_key")
os.environ.setdefault("CIVI_API_KEY", "test_api_key")
os.environ.setdefault("JWT_SECRET", "unit_test_secret")


from api.menschlichkeit-oesterreich.at.app.main import app  # type: ignore  # noqa: E402


def make_token(sub: str, *, roles: list[str] | None = None, is_admin: bool | None = None) -> str:
    payload: Dict[str, Any] = {
        "sub": sub,
        "type": "access",
        "iat": int(datetime.utcnow().timestamp()),
        "exp": int((datetime.utcnow() + timedelta(hours=1)).timestamp()),
    }
    if roles is not None:
        payload["roles"] = roles
    if is_admin is not None:
        payload["is_admin"] = is_admin
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm="HS256")


@pytest.fixture()
def client():
    return TestClient(app)


def test_privacy_health(client: TestClient):
    r = client.get("/privacy/health")
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert data["data"]["module"] == "gdpr_privacy"


def test_request_deletion_auto_approved(monkeypatch: pytest.MonkeyPatch, client: TestClient):
    # Patch retention to no exceptions and anonymization + n8n to no-op
    import api.menschlichkeit-oesterreich.at.app.routes.privacy as privacy  # type: ignore

    async def _no_exceptions(user_id: int, email: str):
        return []

    async def _anon(email: str):
        return {"id": 123}

    async def _n8n(user_id: int, email: str):
        return {"status": "accepted"}

    monkeypatch.setattr(privacy, "_check_retention_requirements", _no_exceptions)
    monkeypatch.setattr(privacy, "_civicrm_anonymize_contact", _anon)
    monkeypatch.setattr(privacy, "_trigger_n8n_user_deletion_workflow", _n8n)

    token = make_token("user@example.org")
    r = client.post(
        "/privacy/data-deletion",
        headers={"Authorization": f"Bearer {token}"},
        json={"reason": "Bitte löschen", "scope": "full"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert body["data"]["auto_approved"] is True


def test_admin_endpoints_require_admin(monkeypatch: pytest.MonkeyPatch, client: TestClient):
    # With non-admin token → 403
    token_user = make_token("user@example.org")
    r1 = client.get("/privacy/data-deletion/admin/all", headers={"Authorization": f"Bearer {token_user}"})
    assert r1.status_code == 403

    # With admin claim → 200
    token_admin = make_token("admin@example.org", roles=["admin"])  # roles contains admin
    r2 = client.get("/privacy/data-deletion/admin/all", headers={"Authorization": f"Bearer {token_admin}"})
    assert r2.status_code == 200
    body = r2.json()
    assert body["success"] is True

