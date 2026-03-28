"""Integration tests for FastAPI routes — mocked PleskService."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent))

# Set required env vars before importing app
import os

os.environ.setdefault("PLESK_HOST", "test.example.com")
os.environ.setdefault("PLESK_LOGIN", "admin")
os.environ.setdefault("PLESK_PASSWORD", "testpass")

from fastapi.testclient import TestClient

from plesk_client import PleskAPIError


@pytest.fixture()
def client():
    """Create a test client with mocked PleskService."""
    with patch("app.main.PleskService") as MockService:
        mock_service = MagicMock()
        MockService.return_value = mock_service

        from app.main import app

        # Inject mock into module-level _plesk
        import app.main as main_module
        main_module._plesk = mock_service

        with TestClient(app) as tc:
            yield tc, mock_service

        main_module._plesk = None


def test_health(client):
    tc, _ = client
    resp = tc.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_create_mailbox_success(client):
    tc, mock = client
    mock.create_mailbox.return_value = 99

    resp = tc.post("/mailboxes", json={
        "domain": "example.com",
        "name": "testuser",
        "password": "S3cur3P@ss!",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] == 99
    assert data["name"] == "testuser"
    assert data["domain"] == "example.com"
    mock.create_mailbox.assert_called_once_with("example.com", "testuser", "S3cur3P@ss!")


def test_create_mailbox_duplicate(client):
    tc, mock = client
    mock.create_mailbox.side_effect = PleskAPIError("1007", "Mailname already exists")

    resp = tc.post("/mailboxes", json={
        "domain": "example.com",
        "name": "existing",
        "password": "S3cur3P@ss!",
    })
    assert resp.status_code == 409
    assert resp.json()["detail"]["errcode"] == "1007"


def test_create_mailbox_short_password(client):
    tc, _ = client
    resp = tc.post("/mailboxes", json={
        "domain": "example.com",
        "name": "user",
        "password": "short",
    })
    assert resp.status_code == 422  # Pydantic validation


def test_list_mailboxes(client):
    tc, mock = client
    mock.list_mailboxes.return_value = [
        {"name": "alice", "enabled": True, "site_id": 1},
        {"name": "bob", "enabled": False, "site_id": 1},
    ]

    resp = tc.get("/mailboxes/example.com")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["name"] == "alice"


def test_update_password(client):
    tc, mock = client
    mock.update_mailbox_password.return_value = True

    resp = tc.patch("/mailboxes/password", json={
        "domain": "example.com",
        "name": "alice",
        "new_password": "N3wP@ssw0rd!",
    })
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_delete_mailbox(client):
    tc, mock = client
    mock.delete_mailbox.return_value = True

    resp = tc.delete("/mailboxes", json={
        "domain": "example.com",
        "name": "alice",
    })
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_enable_mailbox(client):
    tc, mock = client
    mock.enable_mailbox.return_value = True

    resp = tc.patch("/mailboxes/enable", json={
        "domain": "example.com",
        "name": "alice",
        "enabled": False,
    })
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
    mock.enable_mailbox.assert_called_once_with("example.com", "alice", False)


def test_not_found_domain(client):
    tc, mock = client
    mock.list_mailboxes.side_effect = PleskAPIError("1005", "Object not found")

    resp = tc.get("/mailboxes/nonexistent.com")
    assert resp.status_code == 404
