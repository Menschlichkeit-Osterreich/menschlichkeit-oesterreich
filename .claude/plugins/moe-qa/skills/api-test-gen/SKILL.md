---
name: api-test-gen
description: 'Generiert pytest-Tests fuer FastAPI-Router-Endpoints mit korrektem TestClient-Setup und Mock-Patterns aus dem MOe-Projekt'
argument-hint: '<router-name>'
allowed-tools:
  - Read
  - Write
  - Grep
  - Glob
---

# API Test Generator

## Zweck

Generiert vollstaendige pytest-Tests fuer FastAPI-Router basierend auf der bestehenden Teststruktur in `apps/api/tests/`.

## Konventionen

### Dateistruktur

```
apps/api/tests/
├── conftest.py          # Fixtures (TestClient, DB-Session, Auth-Mock)
├── test_auth.py         # Auth-Router Tests
├── test_members.py      # Members-Router Tests
├── test_payments.py     # Payment-Router Tests
└── test_<router>.py     # Neue Tests hier
```

### Test-Klassen-Pattern

```python
"""Tests for {router_name} router."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)


class Test{RouterName}:
    """Tests for /api/{route-prefix} endpoints."""

    def test_list_returns_200(self):
        """GET /{prefix} returns 200 with list."""
        response = client.get("/{prefix}")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_create_returns_201(self):
        """POST /{prefix} with valid data returns 201."""
        response = client.post("/{prefix}", json={...})
        assert response.status_code == 201

    def test_create_invalid_returns_422(self):
        """POST /{prefix} with invalid data returns 422."""
        response = client.post("/{prefix}", json={})
        assert response.status_code == 422

    def test_unauthorized_returns_401(self):
        """Request without auth token returns 401."""
        response = client.get("/{prefix}", headers={})
        assert response.status_code == 401
```

## Bestehende Router (aus `apps/api/app/routers/`)

| Router     | Endpunkte                                  | Testdatei        |
| ---------- | ------------------------------------------ | ---------------- |
| auth       | /auth/login, /auth/register, /auth/refresh | test_auth.py     |
| members    | /members CRUD                              | test_members.py  |
| payments   | /payments/stripe, /payments/paypal         | test_payments.py |
| finance    | /finance/reports, /finance/summary         | (fehlt)          |
| invoices   | /invoices CRUD                             | (fehlt)          |
| events     | /events CRUD                               | (fehlt)          |
| newsletter | /newsletter/subscribe, /newsletter/confirm | (fehlt)          |
| contact    | /contact/send                              | (fehlt)          |
| privacy    | /privacy/export, /privacy/delete           | (fehlt)          |
| forum      | /forum/posts, /forum/comments              | (fehlt)          |
| blog       | /blog/posts                                | (fehlt)          |
| admin_crm  | /admin/crm/\*                              | (fehlt)          |

## Ablauf

1. Router-Datei lesen (`apps/api/app/routers/<name>.py`)
2. Endpoints extrahieren (Dekoratoren `@router.get/post/patch/delete`)
3. Request/Response-Schemas aus Pydantic-Models ableiten
4. Tests generieren: Happy Path + Validation + Auth + Error Cases
5. In `apps/api/tests/test_<name>.py` schreiben

## Sicherheit

- Test-Daten MUESSEN anonymisiert sein
- Keine echten API-Keys, Tokens oder Passwörter
- Fixtures aus `conftest.py` wiederverwenden
