"""Behavioral tests for apps/api/app/runtime_secret_contract.

Each test verifies one of the four contractual guarantees without
making any network or BSM calls — get_secret is always mocked.

Covered scenarios:
 1. Non-production, STRICT_SECRET_CONTRACT unset  → no error
 2. STRICT_SECRET_CONTRACT=true with placeholder secrets  → RuntimeError
 3. environment=production with placeholder secrets  → RuntimeError
 4. environment=production with complete dummy values  → no error
"""
from __future__ import annotations

import pytest
from unittest.mock import patch

from app.runtime_secret_contract import validate_runtime_secret_contract, _is_invalid_secret

# ---------------------------------------------------------------------------
# Dummy values — obviously non-production, safe to commit
# ---------------------------------------------------------------------------
_DUMMY_OK = "test-value-for-unit-test-only-not-real"

_ALL_KEYS_DUMMY_OK: dict[str, str] = {
    "DATABASE_URL": _DUMMY_OK,
    "JWT_SECRET_KEY": _DUMMY_OK,
    "STRIPE_SECRET_KEY": _DUMMY_OK,
    "STRIPE_WEBHOOK_SECRET": _DUMMY_OK,
    "MOE_API_TOKEN": _DUMMY_OK,
    "N8N_WEBHOOK_SECRET": _DUMMY_OK,
    "CIVICRM_SITE_KEY": _DUMMY_OK,
    "CIVICRM_API_KEY": _DUMMY_OK,
    "ALERTS_SLACK_WEBHOOK": _DUMMY_OK,
    "MICROSOFT_TENANT_ID": _DUMMY_OK,
    "MICROSOFT_CLIENT_ID": _DUMMY_OK,
    "MICROSOFT_CLIENT_SECRET": _DUMMY_OK,
    "MICROSOFT_GRAPH_SENDER": _DUMMY_OK,
}


def _mock_get(values: dict[str, str], default: str = ""):
    """Factory: returns a get_secret mock that looks up by env_key."""

    def _get(env_key: str, *, bsm_key: str | None = None) -> str:
        return values.get(env_key, default)

    return _get


# ---------------------------------------------------------------------------
# Unit tests: _is_invalid_secret helper
# ---------------------------------------------------------------------------
class TestIsInvalidSecret:
    def test_empty_string_is_invalid(self):
        assert _is_invalid_secret("") is True

    def test_whitespace_only_is_valid(self):
        # Implementation only rejects empty/None and placeholder patterns;
        # whitespace-only strings are NOT treated as invalid.
        assert _is_invalid_secret("   ") is False

    @pytest.mark.parametrize("placeholder", [
        "CHANGE_ME",
        "PLACEHOLDER",
        "UPDATE_VALUE_IN_VAULT",
        "YOUR_SECRET",
        "REPLACE_THIS",
    ])
    def test_placeholder_patterns_are_invalid(self, placeholder: str):
        assert _is_invalid_secret(placeholder) is True

    def test_real_dummy_value_is_valid(self):
        assert _is_invalid_secret(_DUMMY_OK) is False


# ---------------------------------------------------------------------------
# Behavioral tests: validate_runtime_secret_contract
# ---------------------------------------------------------------------------
class TestValidateRuntimeSecretContract:

    # Scenario 1 ─────────────────────────────────────────────────────────────
    def test_non_production_without_strict_flag_passes(self, monkeypatch):
        """Non-production, STRICT_SECRET_CONTRACT not set → no error, get_secret not called."""
        monkeypatch.delenv("STRICT_SECRET_CONTRACT", raising=False)
        monkeypatch.setenv("MAIL_TRANSPORT", "graph")

        with patch("app.runtime_secret_contract.get_secret") as mock_gs:
            validate_runtime_secret_contract("test")  # must not raise
            mock_gs.assert_not_called()

    def test_non_production_development_without_strict_flag_passes(self, monkeypatch):
        """environment=development, no STRICT flag → short-circuit, no error."""
        monkeypatch.delenv("STRICT_SECRET_CONTRACT", raising=False)
        monkeypatch.setenv("MAIL_TRANSPORT", "graph")

        with patch("app.runtime_secret_contract.get_secret") as mock_gs:
            validate_runtime_secret_contract("development")
            mock_gs.assert_not_called()

    # Scenario 2 ─────────────────────────────────────────────────────────────
    def test_strict_flag_true_with_placeholder_secrets_raises(self, monkeypatch):
        """STRICT_SECRET_CONTRACT=true with placeholder values → RuntimeError."""
        monkeypatch.setenv("STRICT_SECRET_CONTRACT", "true")
        monkeypatch.setenv("MAIL_TRANSPORT", "graph")

        placeholder_map = {k: "CHANGE_ME" for k in _ALL_KEYS_DUMMY_OK}

        with patch(
            "app.runtime_secret_contract.get_secret",
            side_effect=_mock_get(placeholder_map),
        ):
            with pytest.raises(RuntimeError, match="Missing required runtime secret contract entries"):
                validate_runtime_secret_contract("test")

    def test_strict_flag_true_with_missing_secrets_raises(self, monkeypatch):
        """STRICT_SECRET_CONTRACT=true with all secrets empty → RuntimeError."""
        monkeypatch.setenv("STRICT_SECRET_CONTRACT", "true")
        monkeypatch.setenv("MAIL_TRANSPORT", "graph")

        with patch(
            "app.runtime_secret_contract.get_secret",
            side_effect=_mock_get({}, default=""),
        ):
            with pytest.raises(RuntimeError, match="Missing required runtime secret contract entries"):
                validate_runtime_secret_contract("staging")

    # Scenario 3 ─────────────────────────────────────────────────────────────
    def test_production_with_placeholder_secrets_raises(self, monkeypatch):
        """environment=production with placeholder values → RuntimeError."""
        monkeypatch.delenv("STRICT_SECRET_CONTRACT", raising=False)
        monkeypatch.setenv("MAIL_TRANSPORT", "graph")

        placeholder_map = {k: "PLACEHOLDER" for k in _ALL_KEYS_DUMMY_OK}

        with patch(
            "app.runtime_secret_contract.get_secret",
            side_effect=_mock_get(placeholder_map),
        ):
            with pytest.raises(RuntimeError, match="Missing required runtime secret contract entries"):
                validate_runtime_secret_contract("production")

    # Scenario 4 ─────────────────────────────────────────────────────────────
    def test_production_with_complete_dummy_values_passes(self, monkeypatch):
        """environment=production with all keys set to valid dummy values → no error."""
        monkeypatch.delenv("STRICT_SECRET_CONTRACT", raising=False)
        monkeypatch.setenv("MAIL_TRANSPORT", "graph")

        with patch(
            "app.runtime_secret_contract.get_secret",
            side_effect=_mock_get(_ALL_KEYS_DUMMY_OK),
        ):
            validate_runtime_secret_contract("production")  # must not raise

    # Extra edge cases ────────────────────────────────────────────────────────
    def test_error_message_lists_missing_keys(self, monkeypatch):
        """RuntimeError message must name the specific missing keys."""
        monkeypatch.setenv("STRICT_SECRET_CONTRACT", "true")
        monkeypatch.setenv("MAIL_TRANSPORT", "graph")

        partial = {**_ALL_KEYS_DUMMY_OK}
        partial.pop("JWT_SECRET_KEY")
        partial.pop("STRIPE_SECRET_KEY")

        with patch(
            "app.runtime_secret_contract.get_secret",
            side_effect=_mock_get(partial, default=""),
        ):
            with pytest.raises(RuntimeError) as exc_info:
                validate_runtime_secret_contract("test")

        msg = str(exc_info.value)
        assert "JWT_SECRET_KEY" in msg
        assert "STRIPE_SECRET_KEY" in msg

    def test_strict_flag_various_truthy_forms(self, monkeypatch):
        """STRICT_SECRET_CONTRACT accepts 1, yes, on as truthy values."""
        monkeypatch.setenv("MAIL_TRANSPORT", "graph")

        for truthy in ("1", "yes", "on"):
            monkeypatch.setenv("STRICT_SECRET_CONTRACT", truthy)

            with patch(
                "app.runtime_secret_contract.get_secret",
                side_effect=_mock_get({}, default=""),
            ):
                with pytest.raises(RuntimeError):
                    validate_runtime_secret_contract("staging")

    def test_production_smtp_missing_mail_creds_raises(self, monkeypatch):
        """environment=production, MAIL_TRANSPORT=smtp, missing SMTP credentials → RuntimeError."""
        monkeypatch.delenv("STRICT_SECRET_CONTRACT", raising=False)
        monkeypatch.setenv("MAIL_TRANSPORT", "smtp")

        # All core keys are OK, but MAIL_USERNAME / MAIL_PASSWORD not present
        with patch(
            "app.runtime_secret_contract.get_secret",
            side_effect=_mock_get(_ALL_KEYS_DUMMY_OK, default=""),
        ):
            with pytest.raises(RuntimeError, match="MAIL_"):
                validate_runtime_secret_contract("production")

    def test_production_smtp_with_smtp_creds_passes(self, monkeypatch):
        """environment=production, MAIL_TRANSPORT=smtp, all creds present → no error."""
        monkeypatch.delenv("STRICT_SECRET_CONTRACT", raising=False)
        monkeypatch.setenv("MAIL_TRANSPORT", "smtp")

        smtp_map = {
            **_ALL_KEYS_DUMMY_OK,
            "MAIL_USERNAME": _DUMMY_OK,
            "MAIL_PASSWORD": _DUMMY_OK,
        }

        with patch(
            "app.runtime_secret_contract.get_secret",
            side_effect=_mock_get(smtp_map),
        ):
            validate_runtime_secret_contract("production")  # must not raise
