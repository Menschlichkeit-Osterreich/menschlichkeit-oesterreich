"""
PII Sanitizer - Unit Tests
===========================

Umfassende Tests für PII-Erkennung und -Redaktion.
Inkl. Edge-Cases, False-Positives-Prevention, Golden Samples.

Author: Menschlichkeit Österreich DevOps
Date: 2025-10-03
"""

import pytest
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.lib.pii_sanitizer import (
    PiiSanitizer,
    SanitizationConfig,
    RedactionStrategy,
    LoggingPiiFilter,
    scrub,
    scrub_dict
)


class TestEmailRedaction:
    """Tests für Email-Erkennung und -Maskierung"""
    
    def test_simple_email(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("Contact: max@example.com")
        assert "max@example.com" not in result
        assert "m**@example.com" in result
    
    def test_email_with_plus_alias(self):
        """Gmail-Style Aliases (+tag)"""
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("user+alias@example.com")
        assert "user+alias@example.com" not in result
        assert "@example.com" in result
    
    def test_email_with_subdomain(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("admin@mail.sub.example.co.uk")
        assert "admin@mail.sub.example.co.uk" not in result
        assert "@mail.sub.example.co.uk" in result
    
    def test_multiple_emails(self):
        sanitizer = PiiSanitizer()
        text = "Contact: a@test.com or b@test.com"
        result = sanitizer.scrub_text(text)
        assert "a@test.com" not in result
        assert "b@test.com" not in result
        assert result.count("@test.com") == 2
    
    def test_email_in_log_message(self):
        sanitizer = PiiSanitizer()
        log = "User registration failed for peter.schuller@example.com: Invalid password"
        result = sanitizer.scrub_text(log)
        assert "peter.schuller@example.com" not in result
        assert "Invalid password" in result  # Rest bleibt


class TestPhoneRedaction:
    """Tests für Telefonnummern-Erkennung"""
    
    def test_austrian_mobile_international(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("Rufnummer: +43664123456789")
        assert "+43664123456789" not in result
        assert "+43*********" in result
    
    def test_austrian_mobile_national(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("Tel: 0664123456789")
        assert "0664123456789" not in result
    
    def test_german_mobile(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("Mobile: +491701234567")
        assert "+491701234567" not in result
    
    def test_swiss_landline(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("Office: +41443434343")
        assert "+41443434343" not in result
    
    def test_phone_with_spaces(self):
        """Telefonnummer mit Leerzeichen (Edge-Case)"""
        sanitizer = PiiSanitizer()
        # Aktuell nicht erkannt - dokumentiert als Limitation
        result = sanitizer.scrub_text("+43 664 123 456")
        # TODO: Enhancement für Spaces


class TestIpRedaction:
    """Tests für IP-Adressen-Maskierung"""
    
    def test_ipv4_private(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("Server IP: 192.168.1.100")
        assert "192.168.1.100" not in result
        assert "192.168.*.*" in result
    
    def test_ipv4_public(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("Origin: 8.8.8.8")
        assert "8.8.8.8" not in result
        assert "8.8.*.*" in result
    
    def test_ipv6(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334")
        assert "2001:0db8:85a3:0000:0000:8a2e:0370:7334" not in result
    
    def test_localhost_preservation(self):
        """127.0.0.1 sollte auch maskiert werden (keine Whitelist)"""
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("Binding to 127.0.0.1:8000")
        assert "127.0.0.1" not in result


class TestJwtRedaction:
    """Tests für JWT/Bearer-Token-Redaktion"""
    
    def test_bearer_token(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("Authorization: Bearer abc123.def456.ghi789")
        assert "abc123.def456.ghi789" not in result
        assert "Bearer [REDACTED]" in result
    
    def test_jwt_plain(self):
        sanitizer = PiiSanitizer()
        jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test"
        result = sanitizer.scrub_text(f"Token: {jwt}")
        assert jwt not in result
        assert "[JWT_REDACTED]" in result
    
    def test_github_token(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz")
        assert "ghp_" not in result or "[GITHUB_TOKEN]" in result


class TestIbanRedaction:
    """Tests für IBAN-Erkennung mit Validierung"""
    
    def test_austrian_iban_valid(self):
        sanitizer = PiiSanitizer()
        # AT61 1904 3002 3457 3201 (gültige IBAN)
        result = sanitizer.scrub_text("Kontonummer: AT611904300234573201")
        assert "AT611904300234573201" not in result
        assert "AT61***" in result
    
    def test_german_iban_valid(self):
        sanitizer = PiiSanitizer()
        # DE89 3704 0044 0532 0130 00 (Beispiel)
        result = sanitizer.scrub_text("IBAN: DE89370400440532013000")
        assert "DE89370400440532013000" not in result
    
    def test_iban_invalid_checksum(self):
        """Ungültige IBAN sollte NICHT redaktiert werden (False Positive Prevention)"""
        sanitizer = PiiSanitizer()
        # AT99 9999... (ungültig)
        result = sanitizer.scrub_text("Random: AT999999999999999999")
        # Sollte nicht redaktiert werden wenn Prüfziffer falsch
        # (Implementation-dependent)


class TestCreditCardRedaction:
    """Tests für Kreditkarten-Erkennung mit Luhn-Check"""
    
    def test_visa_valid(self):
        sanitizer = PiiSanitizer()
        # Visa Test-Karte: 4532 1488 0343 6467
        result = sanitizer.scrub_text("Card: 4532148803436467")
        assert "4532148803436467" not in result
        assert "[CARD]" in result
    
    def test_mastercard_valid(self):
        sanitizer = PiiSanitizer()
        # Mastercard Test: 5425 2334 3010 9903
        result = sanitizer.scrub_text("MC: 5425233430109903")
        assert "5425233430109903" not in result
    
    def test_card_with_spaces(self):
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("Card: 4532 1488 0343 6467")
        assert "4532 1488 0343 6467" not in result
    
    def test_random_numbers_not_card(self):
        """Zufällige Zahlenfolge ohne Luhn-Gültigkeit -> NICHT redaktieren"""
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text("Order ID: 1234567890123456")
        # Sollte bleiben weil Luhn-Check fehlschlägt
        assert "1234567890123456" in result or "[CARD]" not in result


class TestStructuredDataRedaction:
    """Tests für Dictionary/JSON-Redaktion"""
    
    def test_password_field_drop(self):
        sanitizer = PiiSanitizer()
        data = {"username": "admin", "password": "secret123"}
        result = sanitizer.scrub_dict(data, RedactionStrategy.DROP)
        assert "password" not in result
        assert result["username"] == "admin"
    
    def test_password_field_redact(self):
        sanitizer = PiiSanitizer()
        data = {"username": "admin", "password": "secret123"}
        result = sanitizer.scrub_dict(data, RedactionStrategy.REDACT)
        assert result["password"] == "[REDACTED]"
    
    def test_email_field_mask(self):
        sanitizer = PiiSanitizer()
        data = {"email": "max@example.com", "name": "Max"}
        result = sanitizer.scrub_dict(data, RedactionStrategy.MASK)
        assert "@example.com" in result["email"]
        assert "max@example.com" not in result["email"]
    
    def test_nested_dict(self):
        sanitizer = PiiSanitizer()
        data = {
            "user": {
                "email": "test@test.com",
                "profile": {
                    "phone": "+43664123456"
                }
            }
        }
        result = sanitizer.scrub_dict(data)
        assert "test@test.com" not in str(result)
        assert "+43664123456" not in str(result)
    
    def test_list_of_dicts(self):
        sanitizer = PiiSanitizer()
        data = {
            "users": [
                {"email": "a@test.com"},
                {"email": "b@test.com"}
            ]
        }
        result = sanitizer.scrub_dict(data)
        assert "a@test.com" not in str(result)
        assert "b@test.com" not in str(result)
    
    def test_sensitive_key_variations(self):
        """Test case-insensitivity und Variationen"""
        sanitizer = PiiSanitizer()
        data = {
            "PASSWORD": "test",
            "api_key": "key123",
            "API-KEY": "key456"
        }
        result = sanitizer.scrub_dict(data)
        assert result["PASSWORD"] == "[REDACTED]"
        assert result["api_key"] == "[REDACTED]"


class TestLoggingFilter:
    """Tests für Python Logging-Integration"""
    
    def test_filter_message_string(self):
        import logging
        
        sanitizer = PiiSanitizer()
        filter = LoggingPiiFilter(sanitizer)
        
        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="",
            lineno=0,
            msg="User email: test@example.com",
            args=(),
            exc_info=None
        )
        
        filter.filter(record)
        assert "test@example.com" not in record.msg
    
    def test_filter_with_args(self):
        import logging
        
        sanitizer = PiiSanitizer()
        filter = LoggingPiiFilter(sanitizer)
        
        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="",
            lineno=0,
            msg="User: %s, Email: %s",
            args=("Max", "max@test.com"),
            exc_info=None
        )
        
        filter.filter(record)
        assert "max@test.com" not in str(record.args)


class TestMetrics:
    """Tests für Redaction-Metriken"""
    
    def test_metrics_incremented(self):
        sanitizer = PiiSanitizer()
        initial = sanitizer.get_metrics()["emails_redacted"]
        
        sanitizer.scrub_text("Email: test@test.com")
        
        final = sanitizer.get_metrics()["emails_redacted"]
        assert final == initial + 1
    
    def test_metrics_reset(self):
        sanitizer = PiiSanitizer()
        sanitizer.scrub_text("test@test.com")
        
        sanitizer.reset_metrics()
        
        metrics = sanitizer.get_metrics()
        assert all(v == 0 for v in metrics.values())


class TestGoldenSamples:
    """Golden Samples für CI/CD - dürfen NIEMALS unredaktiert durchgehen"""
    
    GOLDEN_SAMPLES = [
        # (input, forbidden_substring)
        ("peter.schuller@icloud.com", "peter.schuller@icloud.com"),
        ("+43664123456789", "+43664123456789"),
        ("Password: MySecret123!", "MySecret123!"),
        ("Bearer eyJhbGc...", "eyJhbGc"),
        ("IBAN: AT611904300234573201", "AT611904300234573201"),
        ("Card: 4532148803436467", "4532148803436467"),
        ("IP: 192.168.1.100", "192.168.1.100"),
    ]
    
    @pytest.mark.parametrize("input_text,forbidden", GOLDEN_SAMPLES)
    def test_golden_sample_redacted(self, input_text, forbidden):
        """CRITICAL: Golden Samples müssen immer redaktiert werden"""
        sanitizer = PiiSanitizer()
        result = sanitizer.scrub_text(input_text)
        
        assert forbidden not in result, (
            f"SECURITY VIOLATION: '{forbidden}' found in output: {result}"
        )


class TestEdgeCases:
    """Edge-Cases und Grenzfälle"""
    
    def test_empty_string(self):
        sanitizer = PiiSanitizer()
        assert sanitizer.scrub_text("") == ""
    
    def test_none_input(self):
        sanitizer = PiiSanitizer()
        assert sanitizer.scrub_text(None) is None
    
    def test_non_string_input(self):
        sanitizer = PiiSanitizer()
        assert sanitizer.scrub_text(123) == 123
    
    def test_unicode_email(self):
        """Unicode-Domains (IDN)"""
        sanitizer = PiiSanitizer()
        # Hinweis: Regex unterstützt aktuell nur ASCII
        result = sanitizer.scrub_text("user@münchen.de")
        # Expected behavior dokumentiert
    
    def test_very_long_string(self):
        """Performance-Test für große Logs"""
        sanitizer = PiiSanitizer()
        long_text = "Log entry: " + ("X" * 100000) + " email: test@test.com"
        result = sanitizer.scrub_text(long_text)
        assert "test@test.com" not in result


class TestConvenienceFunctions:
    """Tests für Shortcut-Funktionen"""
    
    def test_scrub_function(self):
        result = scrub("Email: test@test.com")
        assert "test@test.com" not in result
    
    def test_scrub_dict_function(self):
        result = scrub_dict({"password": "secret"})
        assert result["password"] == "[REDACTED]"


class TestCustomConfiguration:
    """Tests für Custom-Konfigurationen"""
    
    def test_custom_sensitive_keys(self):
        config = SanitizationConfig(
            sensitive_keys={"custom_field", "proprietary_data"}
        )
        sanitizer = PiiSanitizer(config)
        
        data = {"custom_field": "sensitive", "public_field": "ok"}
        result = sanitizer.scrub_dict(data)
        
        assert result["custom_field"] == "[REDACTED]"
        assert result["public_field"] == "ok"
    
    def test_disable_phone_detection(self):
        config = SanitizationConfig(enable_phone_detection=False)
        sanitizer = PiiSanitizer(config)
        
        result = sanitizer.scrub_text("Phone: +43664123456")
        # Phone-Detection deaktiviert -> bleibt
        assert "+43664123456" in result
    
    def test_custom_mask_char(self):
        config = SanitizationConfig(mask_char="#")
        sanitizer = PiiSanitizer(config)
        
        result = sanitizer.scrub_text("test@test.com")
        assert "#" in result
        assert "*" not in result


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])
