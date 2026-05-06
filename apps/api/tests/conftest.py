"""Pytest-Konfiguration für apps/api Tests."""
from __future__ import annotations

import os
import sys

# JWT-Secret und Umgebung für Tests setzen bevor Module importiert werden
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-min-32-chars-long-xyz")
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ.setdefault("PUBLIC_APP_URL", "http://localhost:3000")

# Pfad für Imports setzen
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock

from app.main import app
from app.rbac import create_jwt, Role


def _make_pool_mock() -> MagicMock:
    conn = MagicMock()
    conn.fetchrow = AsyncMock(return_value=None)
    conn.fetch = AsyncMock(return_value=[])
    conn.fetchval = AsyncMock(return_value=1)
    conn.execute = AsyncMock(return_value="OK")

    acquire_ctx = MagicMock()
    acquire_ctx.__aenter__ = AsyncMock(return_value=conn)
    acquire_ctx.__aexit__ = AsyncMock(return_value=False)

    pool = MagicMock()
    pool.acquire.return_value = acquire_ctx
    return pool


@pytest.fixture
def client():
    """FastAPI TestClient mit gemockter DB für Tests ohne PostgreSQL."""
    pool = _make_pool_mock()
    with (
        patch("app.audit.ensure_audit_table", new=AsyncMock(return_value=None)),
        patch("app.audit.write_audit_event", new=AsyncMock(return_value=None)),
        patch("app.db.get_pool", new=AsyncMock(return_value=pool)),
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
