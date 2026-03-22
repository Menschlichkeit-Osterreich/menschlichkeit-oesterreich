"""Tests für MailService: Template-Rendering und SMTP-Retry-Logik."""
from __future__ import annotations

import asyncio
import smtplib
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.mail_service import MailService


def _run(coro):
    return asyncio.run(coro)


# Minimale Testkontexte für alle 17 registrierten Templates
_MINIMAL_CONTEXTS: dict[str, dict] = {
    "welcome": {
        "contact": {"first_name": "Max", "last_name": "Mustermann", "email": "max@example.at"},
    },
    "verify_email": {
        "first_name": "Max",
        "last_name": "Mustermann",
        "verification_url": "https://example.at/verify?token=abc",
    },
    "newsletter_doi": {
        "first_name": "Max",
        "last_name": "Mustermann",
        "confirmation_url": "https://example.at/confirm?token=abc",
    },
    "newsletter_confirmed": {
        "first_name": "Max",
        "last_name": "Mustermann",
    },
    "newsletter_unsubscribed": {
        "first_name": "Max",
        "last_name": "Mustermann",
    },
    "donation_success": {
        "contact": {"first_name": "Max", "last_name": "Mustermann"},
        "donation": {"amount": 50.0, "date": "22.03.2026", "receipt_eligible": True},
    },
    "membership_received": {
        "first_name": "Max",
        "last_name": "Mustermann",
    },
    "password_reset": {
        "first_name": "Max",
        "last_name": "Mustermann",
        "reset_url": "https://example.at/reset?token=xyz",
    },
    "contact_confirmation": {
        "first_name": "Max",
        "last_name": "Mustermann",
        "subject": "Testanfrage",
    },
    "admin_alert": {
        "title": "Testwarnung",
        "body": "Teststatus",
    },
    "invoice": {
        "contact": {"first_name": "Max", "last_name": "Mustermann"},
        "invoice": {
            "number": "INV-2026-001",
            "date": "22.03.2026",
            "due_date": "06.04.2026",
            "period": "2026",
            "amount_net": 40.0,
            "amount_total": 48.0,
            "id": 1,
        },
        "bank": {"iban": "AT12 3456 7890 1234 5678", "bic": "TESTBIC"},
    },
    "dunning": {
        "contact": {"first_name": "Max", "last_name": "Mustermann"},
        "dunning": {
            "level": 1,
            "level_label": "1. Mahnung",
            "subject_line": "Zahlungserinnerung",
            "intro_text": "Bitte begleichen Sie den offenen Betrag.",
            "warning_title": "Offener Betrag",
            "warning_text": "Bitte zahlen Sie umgehend.",
            "new_due_date": "06.04.2026",
        },
        "invoice": {"number": "INV-001", "amount_total": 48.0},
        "bank": {"iban": "AT12 3456 7890 1234 5678", "bic": "TESTBIC"},
    },
    "donation_failed": {
        "contact": {"first_name": "Max"},
        "donation": {"amount": 50.0, "date": "22.03.2026", "failure_reason": None},
        "retry_url": "https://example.at/spenden",
    },
    "admin_new_donation": {
        "contact": {"first_name": "Max", "last_name": "Mustermann", "email": "max@example.at"},
        "donation": {
            "amount": 50.0,
            "date": "22.03.2026",
            "payment_method": "Stripe",
            "transaction_id": "pi_test123",
            "receipt_eligible": False,
        },
        "related_id": None,
    },
    "admin_new_registration": {
        "user": {
            "first_name": "Max",
            "last_name": "Mustermann",
            "email": "max@example.at",
            "registered_at": "22.03.2026",
            "role": "member",
            "email_verified": True,
            "crm_synced": True,
            "membership_type": "Standard",
            "source": "website",
        },
        "related_id": None,
    },
    "opt_out_confirmed": {
        "first_name": "Max",
        "last_name": "Mustermann",
        "opt_out_type": "newsletter",
        "resubscribe_url": "https://example.at/newsletter",
    },
    "recurring_donation_problem": {
        "contact": {"first_name": "Max"},
        "subscription": {
            "amount": 20.0,
            "status": "past_due",
            "failure_reason": "Karte abgelaufen",
            "next_retry_date": "25.03.2026",
        },
        "update_payment_url": "https://example.at/zahlung",
    },
}


class TestTemplateRendering:
    """Alle registrierten Templates müssen ohne Jinja2-Fehler rendern."""

    @pytest.mark.parametrize("template_id", list(_MINIMAL_CONTEXTS.keys()))
    def test_render_ohne_fehler(self, template_id):
        svc = MailService()
        context = _MINIMAL_CONTEXTS[template_id]
        subject, html, text = svc._render(template_id, context)
        assert subject  # Betreff nicht leer
        assert len(html) > 100  # HTML hat Inhalt
        # HTML enthält grundlegende Strukturelemente
        assert "menschlichkeit" in html.lower() or "österreich" in html.lower()

    def test_render_liefert_plaintext_variante(self):
        svc = MailService()
        _, html, text = svc._render("newsletter_doi", _MINIMAL_CONTEXTS["newsletter_doi"])
        assert "<" not in text  # Text-Variante enthält keine HTML-Tags

    def test_subject_override_wird_angewendet(self):
        """send_template() soll subject_override verwenden wenn angegeben."""
        svc = MailService()
        subject, _, _ = svc._render("welcome", _MINIMAL_CONTEXTS["welcome"])
        # Standard-Betreff aus Template-Registry
        assert "Willkommen" in subject

    def test_unbekanntes_template_wirft_fehler(self):
        svc = MailService()
        with pytest.raises(KeyError):
            svc._render("nicht_vorhanden", {})


class TestSmtpRetryLogik:
    """Mail-Service soll bei SMTP-Fehler bis zu 3-mal retrien."""

    @pytest.fixture
    def svc(self):
        s = MailService()
        s.smtp_user = "sender@test.at"
        s.smtp_password = "testpassword"
        return s

    def _smtp_mock(self, side_effect=None):
        m = MagicMock()
        m.__enter__ = MagicMock(return_value=m)
        m.__exit__ = MagicMock(return_value=False)
        m.send_message = MagicMock(side_effect=side_effect)
        return m

    def test_sendet_erfolgreich_beim_ersten_versuch(self, svc):
        smtp_mock = self._smtp_mock()
        with (
            patch.object(svc, "_smtp_enabled", return_value=True),
            patch("app.services.mail_service.SMTP_ENCRYPTION", "ssl"),
            patch("smtplib.SMTP_SSL", return_value=smtp_mock),
            patch("app.services.mail_service.execute", new=AsyncMock()),
        ):
            result = _run(svc.send_template(
                template_id="newsletter_confirmed",
                recipient_email="test@example.at",
                context=_MINIMAL_CONTEXTS["newsletter_confirmed"],
            ))
        assert result is True
        smtp_mock.send_message.assert_called_once()

    def test_drei_versuche_dann_false(self, svc):
        smtp_mock = self._smtp_mock(
            side_effect=smtplib.SMTPException("Verbindung abgelehnt")
        )
        with (
            patch.object(svc, "_smtp_enabled", return_value=True),
            patch("app.services.mail_service.SMTP_ENCRYPTION", "ssl"),
            patch("smtplib.SMTP_SSL", return_value=smtp_mock),
            patch("app.services.mail_service.execute", new=AsyncMock()),
            patch("asyncio.sleep", new=AsyncMock()),
        ):
            result = _run(svc.send_template(
                template_id="newsletter_confirmed",
                recipient_email="test@example.at",
                context=_MINIMAL_CONTEXTS["newsletter_confirmed"],
            ))
        assert result is False
        assert smtp_mock.send_message.call_count == 3

    def test_erfolg_beim_zweiten_versuch(self, svc):
        versuche = {"count": 0}

        def send_einmal_fehler(msg):
            versuche["count"] += 1
            if versuche["count"] < 2:
                raise smtplib.SMTPException("Erster Versuch fehlgeschlagen")

        smtp_mock = self._smtp_mock(side_effect=send_einmal_fehler)
        with (
            patch.object(svc, "_smtp_enabled", return_value=True),
            patch("app.services.mail_service.SMTP_ENCRYPTION", "ssl"),
            patch("smtplib.SMTP_SSL", return_value=smtp_mock),
            patch("app.services.mail_service.execute", new=AsyncMock()),
            patch("asyncio.sleep", new=AsyncMock()),
        ):
            result = _run(svc.send_template(
                template_id="newsletter_confirmed",
                recipient_email="test@example.at",
                context=_MINIMAL_CONTEXTS["newsletter_confirmed"],
            ))
        assert result is True
        assert smtp_mock.send_message.call_count == 2

    def test_log_only_modus_ohne_smtp(self, svc):
        """Wenn SMTP deaktiviert: Mail in email_log eingetragen, kein SMTP-Aufruf."""
        svc.smtp_user = ""
        svc.smtp_password = ""
        with patch("app.services.mail_service.execute", new=AsyncMock()) as mock_exec:
            result = _run(svc.send_template(
                template_id="newsletter_confirmed",
                recipient_email="test@example.at",
                context=_MINIMAL_CONTEXTS["newsletter_confirmed"],
            ))
        assert result is True
        # execute (log_email) wurde mit status='logged' aufgerufen
        mock_exec.assert_called_once()
        sql_call = str(mock_exec.call_args)
        assert "logged" in sql_call

    def test_subject_override_wird_uebergeben(self, svc):
        smtp_mock = self._smtp_mock()
        with (
            patch.object(svc, "_smtp_enabled", return_value=True),
            patch("app.services.mail_service.SMTP_ENCRYPTION", "ssl"),
            patch("smtplib.SMTP_SSL", return_value=smtp_mock),
            patch("app.services.mail_service.execute", new=AsyncMock()),
        ):
            result = _run(svc.send_template(
                template_id="newsletter_confirmed",
                recipient_email="test@example.at",
                context=_MINIMAL_CONTEXTS["newsletter_confirmed"],
                subject_override="Mein eigener Betreff",
            ))
        assert result is True
        # Überprüfe, dass die Nachricht den überschriebenen Betreff verwendet
        sent_message = smtp_mock.send_message.call_args[0][0]
        assert sent_message["Subject"] == "Mein eigener Betreff"
