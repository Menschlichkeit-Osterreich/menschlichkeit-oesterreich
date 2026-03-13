"""Pytest-Konfiguration für apps/api Tests."""
from __future__ import annotations

import os
import sys

# JWT-Secret und Umgebung für Tests setzen bevor Module importiert werden
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-min-32-chars-long-xyz")
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")

# Pfad für Imports setzen
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock

from app.main import app
from app.rbac import create_jwt, Role


@pytest.fixture
def client():
    """FastAPI TestClient mit gemockter DB für Tests ohne PostgreSQL."""
    with (
        patch("app.audit.ensure_audit_table", new=AsyncMock(return_value=None)),
        patch("app.audit.write_audit_event", new=AsyncMock(return_value=None)),
        patch("app.db.get_pool", new=AsyncMock(return_value=MagicMock())),
    ):
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c


@pytest.fixture
def admin_token():
    """JWT Token mit Admin-Rolle für Tests."""
    return create_jwt({"sub": "admin@test.at", "uid": "00000000-0000-0000-0000-000000000001", "role": "admin"})


@pytest.fixture
def member_token():
    """JWT Token mit Member-Rolle für Tests."""
    return create_jwt({"sub": "member@test.at", "uid": "00000000-0000-0000-0000-000000000002", "role": "member"})


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def member_headers(member_token):
    return {"Authorization": f"Bearer {member_token}"}
