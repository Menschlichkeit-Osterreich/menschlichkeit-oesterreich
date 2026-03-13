"""
PII Sanitizer Library
=====================

Erkennt und redigiert personenbezogene Daten (PII) aus Texten und
strukturierten Daten (dicts/JSON).

Unterstützte PII-Typen:
- E-Mail-Adressen (maskiert: t**@example.com)
- Telefonnummern (inkl. Leerzeichen-Format: +43 664 123 456)
- IPv4/IPv6-Adressen
- JWT / Bearer-Tokens
- IBAN (mit Prüfziffer-Validierung)
- Kreditkartennummern (mit Luhn-Check)
- Passwörter und API-Keys in strukturierten Daten

Author: Menschlichkeit Österreich DevOps
Date: 2025-10-03
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

@dataclass
class SanitizationConfig:
    """Konfiguration für den PiiSanitizer."""

    # Schlüsselwörter, deren Werte immer redigiert werden
    sensitive_keys: set[str] = field(default_factory=lambda: {
        "password", "passwd", "secret", "token", "api_key", "apikey",
        "access_token", "refresh_token", "private_key", "authorization",
        "credit_card", "card_number", "cvv", "pin",
    })

    # Feature-Flags
    enable_email_detection: bool = True
    enable_phone_detection: bool = True
    enable_ip_detection: bool = True
    enable_jwt_detection: bool = True
    enable_iban_detection: bool = True
    enable_credit_card_detection: bool = True

    # Maske-Zeichen für Maskierung
    mask_char: str = "*"


# ---------------------------------------------------------------------------
# Strategy
# ---------------------------------------------------------------------------

class RedactionStrategy(str, Enum):
    """Redaktionsstrategie für strukturierte Daten."""
    MASK = "mask"      # Wert maskieren (z. B. E-Mail-Alias erhalten)
    REDACT = "redact"  # Durch "[REDACTED]" ersetzen
    DROP = "drop"      # Schlüssel aus dem Dict entfernen


# ---------------------------------------------------------------------------
# Regex patterns
# ---------------------------------------------------------------------------

# E-Mail
_EMAIL_PATTERN = re.compile(
    r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}",
    re.ASCII,
)

# Telefonnummern – drei Varianten:
#   1. International kompakt: +43664123456789
#   2. National kompakt:      0664123456789
#   3. Mit Leerzeichen (Enhancement für Spaces): +43 664 123 456
_PHONE_INTERNATIONAL = re.compile(
    r"(?<!\d)(\+\d{2,3}?)\d{6,12}(?!\d)"
)
_PHONE_NATIONAL = re.compile(
    r"(?<!\d)(0\d{2,3})\d{5,10}(?!\d)"
)
_PHONE_SPACED = re.compile(
    r"(\+\d{1,3})(?:\s\d{2,4}){2,5}(?!\d)"
)

# IPv4
_IPV4_PATTERN = re.compile(
    r"\b(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}\b"
)

# IPv6 (vollständige Notation)
_IPV6_PATTERN = re.compile(
    r"\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b"
)

# JWT (eyJ… Struktur)
_JWT_PATTERN = re.compile(
    r"eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+"
)

# Bearer Token
_BEARER_PATTERN = re.compile(
    r"(Bearer\s+)[A-Za-z0-9._\-]+"
)

# GitHub PAT / ähnliche Tokens
_GITHUB_TOKEN_PATTERN = re.compile(
    r"(ghp_|gho_|ghu_|ghs_|ghr_)[A-Za-z0-9]{36}"
)

# IBAN (ohne Leerzeichen, 15–34 alphanumerische Zeichen nach 2-Letter-Ländercode + 2 Prüfziffern)
_IBAN_PATTERN = re.compile(
    r"\b([A-Z]{2}\d{2}[A-Z0-9]{11,30})\b"
)

# Kreditkarte: Visa (4), Mastercard (5), Discover (6), Amex (34/37)
# Format: 4×4 Ziffern (optional mit Leerzeichen/Bindestrich) oder 4+6+5 (Amex)
_CC_PATTERN = re.compile(
    r"\b([3-6]\d{3})[\s\-]?(\d{4})[\s\-]?(\d{4})[\s\-]?(\d{1,4})\b"
)

# Passwort/Secret in Freitext: "Password: VALUE" → VALUE redaktieren
_PASSWORD_IN_TEXT = re.compile(
    r"(?i)(password|passwd|secret)\s*[:=]\s*(\S+)"
)


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def _luhn_check(number: str) -> bool:
    """Luhn-Algorithmus zur Kreditkarten-Validierung."""
    digits = [int(d) for d in number if d.isdigit()]
    if len(digits) < 13:
        return False
    total = 0
    for i, d in enumerate(reversed(digits)):
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


def _iban_check(iban: str) -> bool:
    """Prüft die IBAN-Prüfziffer nach ISO 13616."""
    # Rearrange: letzten 4 Zeichen an den Anfang
    rearranged = iban[4:] + iban[:4]
    # Buchstaben in Zahlen umwandeln (A=10, B=11, …)
    numeric = "".join(
        str(ord(c) - 55) if c.isalpha() else c for c in rearranged
    )
    return int(numeric) % 97 == 1


# ---------------------------------------------------------------------------
# Core sanitizer
# ---------------------------------------------------------------------------

class PiiSanitizer:
    """
    Haupt-Klasse zur PII-Erkennung und -Redaktion.

    Usage::

        sanitizer = PiiSanitizer()
        clean = sanitizer.scrub_text("Telefon: +43 664 123 456")
        clean_dict = sanitizer.scrub_dict({"password": "geheim"})
    """

    def __init__(self, config: SanitizationConfig | None = None) -> None:
        self._cfg = config or SanitizationConfig()
        self._metrics: dict[str, int] = {
            "emails_redacted": 0,
            "phones_redacted": 0,
            "ips_redacted": 0,
            "jwts_redacted": 0,
            "ibans_redacted": 0,
            "cards_redacted": 0,
        }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def scrub_text(self, text: Any) -> Any:
        """
        Redigiert PII aus einem String.

        Nicht-String-Eingaben werden unverändert zurückgegeben.
        None wird als None zurückgegeben.
        """
        if text is None:
            return None
        if not isinstance(text, str):
            return text

        text = self._redact_bearer(text)
        text = self._redact_jwt(text)
        text = self._redact_github_token(text)
        text = self._redact_password_in_text(text)
        if self._cfg.enable_email_detection:
            text = self._redact_emails(text)
        if self._cfg.enable_phone_detection:
            text = self._redact_phones(text)
        if self._cfg.enable_ip_detection:
            text = self._redact_ips(text)
        if self._cfg.enable_iban_detection:
            text = self._redact_ibans(text)
        if self._cfg.enable_credit_card_detection:
            text = self._redact_credit_cards(text)
        return text

    def scrub_dict(
        self,
        data: dict,
        strategy: RedactionStrategy = RedactionStrategy.REDACT,
    ) -> dict:
        """
        Redigiert PII aus einem Dictionary (rekursiv).

        Schlüssel in `sensitive_keys` werden gemäß `strategy` behandelt.
        String-Werte werden zusätzlich durch `scrub_text` gejagt.
        """
        return self._scrub_value(data, strategy)

    def get_metrics(self) -> dict[str, int]:
        """Gibt Redaktions-Statistiken zurück."""
        return dict(self._metrics)

    def reset_metrics(self) -> None:
        """Setzt Statistiken zurück."""
        for key in self._metrics:
            self._metrics[key] = 0

    # ------------------------------------------------------------------
    # Private – redaction helpers
    # ------------------------------------------------------------------

    def _redact_emails(self, text: str) -> str:
        def _mask(m: re.Match) -> str:
            self._metrics["emails_redacted"] += 1
            addr = m.group(0)
            local, domain = addr.split("@", 1)
            masked_local = local[0] + self._cfg.mask_char * 2
            return f"{masked_local}@{domain}"

        return _EMAIL_PATTERN.sub(_mask, text)

    def _redact_phones(self, text: str) -> str:
        """
        Erkennt Telefonnummern in drei Formaten:
        - International kompakt:  +43664123456789
        - National kompakt:       0664123456789
        - Mit Spaces (Enhancement für Spaces): +43 664 123 456
        """
        def _mask(m: re.Match) -> str:
            self._metrics["phones_redacted"] += 1
            return m.group(1) + self._cfg.mask_char * 9

        # Spaced format first (more specific)
        text = _PHONE_SPACED.sub(_mask, text)
        text = _PHONE_INTERNATIONAL.sub(_mask, text)
        text = _PHONE_NATIONAL.sub(_mask, text)
        return text

    def _redact_ips(self, text: str) -> str:
        def _mask_ipv4(m: re.Match) -> str:
            self._metrics["ips_redacted"] += 1
            return f"{m.group(1)}.{m.group(2)}.*.*"

        def _mask_ipv6(m: re.Match) -> str:
            self._metrics["ips_redacted"] += 1
            return "[IPv6_REDACTED]"

        text = _IPV4_PATTERN.sub(_mask_ipv4, text)
        text = _IPV6_PATTERN.sub(_mask_ipv6, text)
        return text

    def _redact_bearer(self, text: str) -> str:
        return _BEARER_PATTERN.sub(r"\1[REDACTED]", text)

    def _redact_jwt(self, text: str) -> str:
        def _replace(m: re.Match) -> str:
            self._metrics["jwts_redacted"] += 1
            return "[JWT_REDACTED]"

        return _JWT_PATTERN.sub(_replace, text)

    def _redact_github_token(self, text: str) -> str:
        return _GITHUB_TOKEN_PATTERN.sub("[GITHUB_TOKEN]", text)

    def _redact_ibans(self, text: str) -> str:
        def _mask(m: re.Match) -> str:
            iban = m.group(1)
            if _iban_check(iban):
                self._metrics["ibans_redacted"] += 1
                return iban[:4] + "***"
            return iban  # ungültige IBAN unangetastet lassen

        return _IBAN_PATTERN.sub(_mask, text)

    def _redact_credit_cards(self, text: str) -> str:
        def _mask(m: re.Match) -> str:
            self._metrics["cards_redacted"] += 1
            return "[CARD]"

        return _CC_PATTERN.sub(_mask, text)

    def _redact_password_in_text(self, text: str) -> str:
        """Redaktiert Passwörter/Secrets im Freitext, z.B. 'Password: geheim'."""
        return _PASSWORD_IN_TEXT.sub(r"\1: [REDACTED]", text)

    # ------------------------------------------------------------------
    # Private – recursive dict scrubbing
    # ------------------------------------------------------------------

    def _scrub_value(self, value: Any, strategy: RedactionStrategy) -> Any:
        if isinstance(value, dict):
            return self._scrub_dict_inner(value, strategy)
        if isinstance(value, list):
            return [self._scrub_value(item, strategy) for item in value]
        if isinstance(value, str):
            return self.scrub_text(value)
        return value

    def _scrub_dict_inner(self, data: dict, strategy: RedactionStrategy) -> dict:
        result: dict = {}
        for key, value in data.items():
            if self._is_sensitive_key(key):
                if strategy == RedactionStrategy.DROP:
                    continue
                elif strategy == RedactionStrategy.REDACT:
                    result[key] = "[REDACTED]"
                else:  # MASK – try text scrub, fall back to REDACT
                    if isinstance(value, str):
                        scrubbed = self.scrub_text(value)
                        result[key] = scrubbed if scrubbed != value else "[REDACTED]"
                    else:
                        result[key] = "[REDACTED]"
            else:
                result[key] = self._scrub_value(value, strategy)
        return result

    def _is_sensitive_key(self, key: str) -> bool:
        key_norm = key.lower().replace("-", "_")
        for sensitive in self._cfg.sensitive_keys:
            if sensitive in key_norm:
                return True
        return False


# ---------------------------------------------------------------------------
# Logging integration
# ---------------------------------------------------------------------------

class LoggingPiiFilter(logging.Filter):
    """
    Python-Logging-Filter der PII aus Log-Records entfernt.

    Usage::

        import logging
        from app.lib.pii_sanitizer import LoggingPiiFilter, PiiSanitizer

        logger = logging.getLogger("myapp")
        logger.addFilter(LoggingPiiFilter(PiiSanitizer()))
    """

    def __init__(self, sanitizer: PiiSanitizer | None = None) -> None:
        super().__init__()
        self._sanitizer = sanitizer or PiiSanitizer()

    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = self._sanitizer.scrub_text(str(record.msg))
        if record.args:
            if isinstance(record.args, tuple):
                record.args = tuple(
                    self._sanitizer.scrub_text(a) if isinstance(a, str) else a
                    for a in record.args
                )
            elif isinstance(record.args, dict):
                record.args = self._sanitizer.scrub_dict(record.args)
        return True


# ---------------------------------------------------------------------------
# Convenience functions
# ---------------------------------------------------------------------------

_default_sanitizer = PiiSanitizer()


def scrub(text: Any) -> Any:
    """Schnell-Funktion: redigiert PII mit Default-Konfiguration."""
    return _default_sanitizer.scrub_text(text)


def scrub_dict(data: dict, strategy: RedactionStrategy = RedactionStrategy.REDACT) -> dict:
    """Schnell-Funktion: redigiert Dict mit Default-Konfiguration."""
    return _default_sanitizer.scrub_dict(data, strategy)
