"""Tests für Health-Endpunkte."""
from __future__ import annotations

import pytest


def test_healthz(client):
    resp = client.get("/healthz")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


def test_version(client):
    resp = client.get("/api/version")
    assert resp.status_code == 200
    data = resp.json()
    assert data["version"] == "2.0.0"
    assert "features" in data


def test_readyz_returns_json(client):
    # Ohne DB-Verbindung kann es 200 oder 503 zurückgeben
    resp = client.get("/readyz")
    assert resp.status_code in (200, 503)
    data = resp.json()
    assert "status" in data
