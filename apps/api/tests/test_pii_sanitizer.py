"""Tests für PII-Sanitizer in apps/api/app/lib/."""
from __future__ import annotations

import pytest
from app.lib.pii_sanitizer import PiiSanitizer, scrub, scrub_dict, _default_sanitizer


@pytest.fixture(autouse=True)
def reset_sanitizer_metrics():
    """Singleton-Metriken vor jedem Test zurücksetzen – verhindert Test-Interferenz."""
    _default_sanitizer.reset_metrics()
    yield
    _default_sanitizer.reset_metrics()


class TestEmailRedaction:
    def test_email_masked(self):
        result = scrub("Kontakt: test@example.com bitte melden")
        assert "test@example.com" not in result
        assert "@" in result  # Maskierung enthält noch @

    def test_email_in_dict(self):
        data = {"email": "user@example.com", "name": "Max"}
        result = scrub_dict(data)
        assert result["email"] != "user@example.com"
        assert result["name"] == "Max"


class TestIbanRedaction:
    def test_iban_redacted(self):
        # IBAN ohne Leerzeichen (wie im Pattern erwartet)
        result = scrub("IBAN: AT611904300234573201")
        assert "AT61***" in result or "AT611904300234573201" not in result

    def test_iban_with_spaces_not_matched(self):
        # IBAN mit Leerzeichen wird vom Pattern nicht erfasst (by design)
        result = scrub("IBAN: AT61 1904 3002 3457 3201")
        assert "AT61" in result  # bleibt unverändert

    def test_non_iban_preserved(self):
        result = scrub("Bestellnummer: 12345678")
        assert "12345678" in result


class TestPhoneRedaction:
    def test_phone_redacted(self):
        result = scrub("+43 664 123 4567")
        assert "664 123 4567" not in result


class TestSafeText:
    def test_plain_text_preserved(self):
        text = "Hallo Welt! Kein PII hier."
        result = scrub(text)
        assert result == text

    def test_empty_string(self):
        assert scrub("") == ""

    def test_scrub_dict_preserves_non_pii(self):
        data = {"title": "Vorstandssitzung", "count": 5}
        result = scrub_dict(data)
        assert result["title"] == "Vorstandssitzung"
        assert result["count"] == 5
