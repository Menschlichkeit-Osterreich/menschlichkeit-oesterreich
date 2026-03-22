"""Tests für den Consent-Flow: record_consent, list_consents, revoke_consent, Integration."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.privacy_service import PrivacyService


_MOCK_DB = "app.services.privacy_service"


def _run(coro):
    return asyncio.run(coro)


def _make_consent_row(status: str = "granted") -> MagicMock:
    """Simuliert eine asyncpg-Zeile aus consent_records."""
    row = MagicMock()
    row.__iter__ = lambda _: iter([
        ("id", 1),
        ("member_id", None),
        ("email", "test@example.at"),
        ("consent_type", "marketing"),
        ("version", "2026-03"),
        ("status", status),
        ("source", "newsletter_doi"),
        ("legal_basis", "consent"),
        ("created_at", datetime(2026, 3, 22, 10, 0, 0, tzinfo=timezone.utc)),
    ])
    return row


class TestRecordConsent:
    def test_zeichnet_erteilten_consent_auf(self):
        svc = PrivacyService()
        mock_row = _make_consent_row("granted")
        with patch(f"{_MOCK_DB}.fetchrow", new=AsyncMock(return_value=mock_row)):
            result = _run(svc.record_consent(
                member_id=None,
                email="test@example.at",
                consent_type="marketing",
                version="2026-03",
                source="newsletter_doi",
            ))
        assert result["status"] == "granted"
        assert result["email"] == "test@example.at"
        assert result["consent_type"] == "marketing"

    def test_zeichnet_widerruf_auf(self):
        svc = PrivacyService()
        mock_row = _make_consent_row("revoked")
        with patch(f"{_MOCK_DB}.fetchrow", new=AsyncMock(return_value=mock_row)):
            result = _run(svc.record_consent(
                member_id=None,
                email="test@example.at",
                consent_type="marketing",
                version="2026-03",
                source="newsletter_unsubscribe",
                status="revoked",
            ))
        assert result["status"] == "revoked"

    def test_insert_sql_enthaelt_pflichtfelder(self):
        svc = PrivacyService()
        mock_row = _make_consent_row("granted")
        with patch(f"{_MOCK_DB}.fetchrow", new=AsyncMock(return_value=mock_row)) as mock_fetchrow:
            _run(svc.record_consent(
                member_id=None,
                email="test@example.at",
                consent_type="terms",
                version="2026-01",
                source="registration",
            ))
        mock_fetchrow.assert_called_once()
        sql = mock_fetchrow.call_args[0][0]
        assert "INSERT INTO consent_records" in sql
        assert "RETURNING" in sql

    def test_mit_member_id_statt_email(self):
        svc = PrivacyService()
        mock_row = _make_consent_row("granted")
        with patch(f"{_MOCK_DB}.fetchrow", new=AsyncMock(return_value=mock_row)):
            result = _run(svc.record_consent(
                member_id="00000000-0000-0000-0000-000000000001",
                email=None,
                consent_type="terms",
                version="2026-01",
                source="registration",
            ))
        # Ergebnis aus gemockter Zeile
        assert result["status"] == "granted"


class TestListConsents:
    def test_listet_per_email(self):
        svc = PrivacyService()
        rows = [_make_consent_row("granted"), _make_consent_row("revoked")]
        with patch(f"{_MOCK_DB}.fetch", new=AsyncMock(return_value=rows)):
            result = _run(svc.list_consents(member_id=None, email="test@example.at"))
        assert len(result) == 2

    def test_listet_per_member_id(self):
        svc = PrivacyService()
        rows = [_make_consent_row("granted")]
        with patch(f"{_MOCK_DB}.fetch", new=AsyncMock(return_value=rows)) as mock_fetch:
            result = _run(svc.list_consents(
                member_id="00000000-0000-0000-0000-000000000001",
                email=None,
            ))
        mock_fetch.assert_called_once()
        sql = mock_fetch.call_args[0][0]
        # Mit member_id wird nach UUID gefiltert
        assert "member_id" in sql
        assert len(result) == 1

    def test_gibt_leere_liste_zurueck(self):
        svc = PrivacyService()
        with patch(f"{_MOCK_DB}.fetch", new=AsyncMock(return_value=[])):
            result = _run(svc.list_consents(member_id=None, email="niemand@example.at"))
        assert result == []


class TestRevokeConsent:
    def test_widerruft_consent_per_id(self):
        svc = PrivacyService()
        with patch(f"{_MOCK_DB}.execute", new=AsyncMock()) as mock_exec:
            _run(svc.revoke_consent("some-uuid-consent-id", member_id=None))
        mock_exec.assert_called_once()
        sql = mock_exec.call_args[0][0]
        assert "UPDATE" in sql
        assert "revoked" in sql

    def test_update_enthaelt_member_id_filter(self):
        svc = PrivacyService()
        with patch(f"{_MOCK_DB}.execute", new=AsyncMock()) as mock_exec:
            _run(svc.revoke_consent(
                "some-uuid-consent-id",
                member_id="00000000-0000-0000-0000-000000000001",
            ))
        args = mock_exec.call_args[0]
        # Zweites Argument ist die consent_id, drittes die member_id
        assert "some-uuid-consent-id" in args
        assert "00000000-0000-0000-0000-000000000001" in args


class TestConsentIntegration:
    """Integrations-Tests über den HTTP-Client."""

    def test_newsletter_abmeldung_zeichnet_consent_widerruf_auf(self, client):
        """Newsletter-Unsubscribe muss privacy_service.record_consent mit status='revoked' aufrufen."""
        sub_row = MagicMock()
        sub_row.get = lambda k, d=None: {
            "email": "sub@example.at",
            "first_name": "Erika",
            "last_name": "Musterfrau",
            "civicrm_contact_id": None,
        }.get(k, d)
        sub_row.__iter__ = lambda _: iter([
            ("email", "sub@example.at"),
            ("first_name", "Erika"),
            ("last_name", "Musterfrau"),
            ("civicrm_contact_id", None),
        ])
        with (
            patch("app.routers.newsletter.fetchrow", new=AsyncMock(return_value=sub_row)),
            patch("app.routers.newsletter.privacy_service.record_consent", new=AsyncMock()) as mock_consent,
            patch("app.routers.newsletter.mail_service.send_template", new=AsyncMock(return_value=True)),
        ):
            resp = client.post("/api/newsletter/unsubscribe", json={"email": "sub@example.at"})
        assert resp.status_code == 200
        assert resp.json()["success"] is True
        # Consent-Widerruf muss eingetragen worden sein
        mock_consent.assert_called_once()
        call_kwargs = mock_consent.call_args.kwargs
        assert call_kwargs["status"] == "revoked"
        assert call_kwargs["consent_type"] == "marketing"
        assert call_kwargs["email"] == "sub@example.at"

    def test_newsletter_anmeldung_zeichnet_kein_consent_auf(self, client):
        """Subscribe schreibt noch kein Consent (erst nach DOI-Bestätigung)."""
        with (
            patch("app.routers.newsletter.fetchrow", new=AsyncMock(return_value=None)),
            patch("app.routers.newsletter.execute", new=AsyncMock()),
            patch("app.routers.newsletter.mail_service.send_template", new=AsyncMock(return_value=True)),
            patch("app.routers.newsletter.privacy_service.record_consent", new=AsyncMock()) as mock_consent,
        ):
            resp = client.post("/api/newsletter/subscribe", json={
                "email": "neu@example.at",
                "first_name": "Neu",
                "consent": True,
            })
        assert resp.status_code == 200
        # Noch kein Consent-Record beim blossen Subscribe
        mock_consent.assert_not_called()

    def test_doi_bestaetigung_zeichnet_consent_auf(self, client):
        """DOI-Confirm muss privacy_service.record_consent mit status='granted' aufrufen."""
        from unittest.mock import MagicMock
        from datetime import timedelta

        pending = MagicMock()
        token_created = datetime.now(timezone.utc) - timedelta(hours=1)
        pending.__getitem__ = lambda _, k: token_created if k == "token_created_at" else "99"

        confirmed = MagicMock()
        confirmed.__iter__ = lambda _: iter([
            ("id", 1),
            ("email", "doi@example.at"),
            ("first_name", "Max"),
            ("last_name", "Mustermann"),
            ("civicrm_contact_id", None),
        ])
        confirmed.get = lambda k, d=None: {
            "email": "doi@example.at",
            "first_name": "Max",
            "last_name": "Mustermann",
        }.get(k, d)

        with (
            patch("app.routers.newsletter.fetchrow", side_effect=[pending, confirmed]),
            patch("app.routers.newsletter.execute", new=AsyncMock()),
            patch("app.routers.newsletter.crm_service.upsert_contact", new=AsyncMock(return_value={"id": None})),
            patch("app.routers.newsletter.privacy_service.record_consent", new=AsyncMock()) as mock_consent,
            patch("app.routers.newsletter.mail_service.send_template", new=AsyncMock(return_value=True)),
        ):
            resp = client.get("/api/newsletter/confirm?token=validtoken12345678901234567890")
        assert resp.status_code == 200
        mock_consent.assert_called_once()
        call_kwargs = mock_consent.call_args.kwargs
        assert call_kwargs["consent_type"] == "marketing"
        # Default-Status bei record_consent ist 'granted'
        assert call_kwargs.get("status", "granted") == "granted"
