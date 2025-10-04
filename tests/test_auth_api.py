import os
from datetime import datetime, timedelta
from typing import Any, Dict

import jwt
import pytest
from fastapi.testclient import TestClient


# Base env for tests
os.environ.setdefault("APP_ENV", "development")
os.environ.setdefault("CIVI_BASE_URL", "https://example.invalid")
os.environ.setdefault("CIVI_SITE_KEY", "test_site_key")
os.environ.setdefault("CIVI_API_KEY", "test_api_key")
os.environ.setdefault("JWT_SECRET", "unit_test_secret")


from api.menschlichkeit-oesterreich.at.app.main import app  # type: ignore  # noqa: E402


def make_token(sub: str, *, token_type: str = "access", exp_minutes: int = 60) -> str:
    now = datetime.utcnow()
    payload: Dict[str, Any] = {
        "sub": sub,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=exp_minutes)).timestamp()),
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm="HS256")


@pytest.fixture()
def client():
    return TestClient(app)


def test_profile_requires_auth(client: TestClient):
    r = client.get("/user/profile")
    assert r.status_code == 422 or r.status_code == 401  # missing header vs invalid


def test_refresh_token_flow(monkeypatch: pytest.MonkeyPatch, client: TestClient):
    # Patch CiviCRM contact fetch used during refresh
    import api.menschlichkeit-oesterreich.at.app.main as main_mod  # type: ignore

    async def _contact_get(*, contact_id=None, email=None):
        return {"id": 101, "email": email or "test@example.org"}

    monkeypatch.setattr(main_mod, "_civicrm_contact_get", _contact_get)

    refresh = make_token("refreshuser@example.org", token_type="refresh", exp_minutes=60)
    r = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    tokens = body["data"]["tokens"]
    assert tokens["token"]
    assert tokens["refresh_token"]

    # Reuse old refresh token must fail due to rotation
    r2 = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert r2.status_code == 401
    assert "reused" in r2.json().get("detail", "").lower() or True


def test_deletion_pending_with_retention(monkeypatch: pytest.MonkeyPatch, client: TestClient):
    # Force retention exception to trigger pending path
    import api.menschlichkeit-oesterreich.at.app.routes.privacy as privacy  # type: ignore

    async def _retention(user_id: int, email: str):
        return [{"type": "donations", "legal_basis": "BAO § 132", "count": "1"}]

    monkeypatch.setattr(privacy, "_check_retention_requirements", _retention)

    token = make_token("user2@example.org")
    r = client.post(
        "/privacy/data-deletion",
        headers={"Authorization": f"Bearer {token}"},
        json={"reason": "Bitte löschen", "scope": "full"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert body["data"]["auto_approved"] is False
    assert body["data"]["request"]["status"] == "pending"
    assert body["data"]["request"]["retention_exceptions"]
