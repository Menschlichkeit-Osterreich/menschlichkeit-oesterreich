"""Tests für den Newsletter-Flow: Subscribe → DOI-Confirm → Unsubscribe."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


_MOCK_BASE = "app.routers.newsletter"


class TestSubscribeNewsletter:
    def test_subscribe_happy_path(self, client):
        with (
            patch(f"{_MOCK_BASE}.fetchrow", new=AsyncMock(return_value=None)),
            patch(f"{_MOCK_BASE}.execute", new=AsyncMock(return_value=None)),
            patch(f"{_MOCK_BASE}.mail_service.send_template", new=AsyncMock(return_value=True)),
        ):
            resp = client.post("/api/newsletter/subscribe", json={
                "email": "test@example.at",
                "first_name": "Erika",
                "last_name": "Musterfrau",
                "consent": True,
                "source": "website",
            })
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert "bestätigen" in data["message"].lower()

    def test_subscribe_without_consent_rejected(self, client):
        resp = client.post("/api/newsletter/subscribe", json={
            "email": "test@example.at",
            "first_name": "Erika",
            "consent": False,
        })
        assert resp.status_code == 400

    def test_subscribe_existing_email_resets_token(self, client):
        existing_row = {"id": "42", "token_created_at": None}
        with (
            patch(f"{_MOCK_BASE}.fetchrow", new=AsyncMock(return_value=existing_row)),
            patch(f"{_MOCK_BASE}.execute", new=AsyncMock()) as mock_exec,
            patch(f"{_MOCK_BASE}.mail_service.send_template", new=AsyncMock(return_value=True)),
        ):
            resp = client.post("/api/newsletter/subscribe", json={
                "email": "existing@example.at",
                "first_name": "Erika",
                "consent": True,
            })
            assert resp.status_code == 200
            # UPDATE (nicht INSERT) muss aufgerufen worden sein
            call_sql = mock_exec.call_args[0][0]
            assert "UPDATE" in call_sql

    def test_subscribe_sends_doi_email(self, client):
        with (
            patch(f"{_MOCK_BASE}.fetchrow", new=AsyncMock(return_value=None)),
            patch(f"{_MOCK_BASE}.execute", new=AsyncMock(return_value=None)),
            patch(f"{_MOCK_BASE}.mail_service.send_template", new=AsyncMock(return_value=True)) as mock_mail,
        ):
            client.post("/api/newsletter/subscribe", json={
                "email": "doi@example.at",
                "first_name": "Max",
                "consent": True,
            })
            mock_mail.assert_called_once()
            assert mock_mail.call_args.kwargs["template_id"] == "newsletter_doi"


class TestConfirmNewsletter:
    def _make_pending_row(self, hours_old: float = 1.0):
        token_created = datetime.now(timezone.utc) - timedelta(hours=hours_old)
        return {"id": "99", "token_created_at": token_created}

    def test_confirm_happy_path(self, client):
        pending = self._make_pending_row(hours_old=1.0)
        confirmed = {
            "id": 1,
            "email": "test@example.at",
            "first_name": "Erika",
            "last_name": "Musterfrau",
            "civicrm_contact_id": None,
        }

        with (
            patch(f"{_MOCK_BASE}.fetchrow", side_effect=[pending, confirmed]),
            patch(f"{_MOCK_BASE}.execute", new=AsyncMock()),
            patch(f"{_MOCK_BASE}.crm_service.upsert_contact", new=AsyncMock(return_value={"id": None})),
            patch(f"{_MOCK_BASE}.privacy_service.record_consent", new=AsyncMock()),
            patch(f"{_MOCK_BASE}.mail_service.send_template", new=AsyncMock(return_value=True)),
        ):
            resp = client.get("/api/newsletter/confirm?token=validtoken12345678901234567890")
            assert resp.status_code == 200
            assert resp.json()["success"] is True

    def test_confirm_invalid_token_rejected(self, client):
        with patch(f"{_MOCK_BASE}.fetchrow", new=AsyncMock(return_value=None)):
            resp = client.get("/api/newsletter/confirm?token=invalidtoken1234567890abcdef")
            assert resp.status_code == 400

    def test_confirm_expired_token_rejected(self, client):
        expired = self._make_pending_row(hours_old=49.0)
        with patch(f"{_MOCK_BASE}.fetchrow", new=AsyncMock(return_value=expired)):
            resp = client.get("/api/newsletter/confirm?token=expiredtoken1234567890abcdef")
            assert resp.status_code == 400
            assert "abgelaufen" in resp.json()["error"]["message"].lower()


class TestUnsubscribeNewsletter:
    def test_unsubscribe_happy_path(self, client):
        sub_row = {
            "email": "sub@example.at",
            "first_name": "Erika",
            "last_name": "Musterfrau",
            "civicrm_contact_id": None,
        }

        with (
            patch(f"{_MOCK_BASE}.fetchrow", new=AsyncMock(return_value=sub_row)),
            patch(f"{_MOCK_BASE}.privacy_service.record_consent", new=AsyncMock()) as mock_consent,
            patch(f"{_MOCK_BASE}.mail_service.send_template", new=AsyncMock(return_value=True)),
        ):
            resp = client.post("/api/newsletter/unsubscribe", json={"email": "sub@example.at"})
            assert resp.status_code == 200
            assert resp.json()["success"] is True
            # C2: Consent-Widerruf muss aufgerufen worden sein
            mock_consent.assert_called_once()
            call_kwargs = mock_consent.call_args.kwargs
            assert call_kwargs["status"] == "revoked"
            assert call_kwargs["consent_type"] == "marketing"

    def test_unsubscribe_not_found_returns_404(self, client):
        with patch(f"{_MOCK_BASE}.fetchrow", new=AsyncMock(return_value=None)):
            resp = client.post("/api/newsletter/unsubscribe", json={"email": "notfound@example.at"})
            assert resp.status_code == 404

    def test_unsubscribe_without_email_or_token_returns_422(self, client):
        resp = client.post("/api/newsletter/unsubscribe", json={})
        assert resp.status_code == 422
