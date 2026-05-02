from __future__ import annotations

import os
import re

from .secrets_provider import get_secret

_PLACEHOLDER_RE = re.compile(
    r"^(CHANGE_ME|PLACEHOLDER|UPDATE_VALUE_IN_VAULT|YOUR_|REPLACE_)",
    re.IGNORECASE,
)

_REQUIRED_SECRET_KEYS: dict[str, str] = {
    "DATABASE_URL": "api/DATABASE_URL",
    "JWT_SECRET_KEY": "api/JWT_SECRET_KEY",
    "STRIPE_SECRET_KEY": "api/STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET": "api/STRIPE_WEBHOOK_SECRET",
    "MOE_API_TOKEN": "api/MOE_API_TOKEN",
    "N8N_WEBHOOK_SECRET": "api/N8N_WEBHOOK_SECRET",
    "CIVICRM_SITE_KEY": "api/CIVICRM_SITE_KEY",
    "CIVICRM_API_KEY": "api/CIVICRM_API_KEY",
    "ALERTS_SLACK_WEBHOOK": "api/ALERTS_SLACK_WEBHOOK",
    "MICROSOFT_TENANT_ID": "api/MICROSOFT_TENANT_ID",
    "MICROSOFT_CLIENT_ID": "api/MICROSOFT_CLIENT_ID",
    "MICROSOFT_CLIENT_SECRET": "api/MICROSOFT_CLIENT_SECRET",
    "MICROSOFT_GRAPH_SENDER": "api/MICROSOFT_GRAPH_SENDER",
}


def _is_invalid_secret(value: str) -> bool:
    if not value or not value.strip():
        return True
    return bool(_PLACEHOLDER_RE.match(value.strip()))


def runtime_secret_contract_report(environment: str) -> dict[str, object]:
    """Builds a redacted runtime-secret report without exposing values."""

    strict_contract = environment == "production" or os.getenv(
        "STRICT_SECRET_CONTRACT", "false"
    ).lower() in {"1", "true", "yes", "on"}

    invalid_keys: list[str] = []

    for env_key, bsm_key in _REQUIRED_SECRET_KEYS.items():
        value = get_secret(env_key, bsm_key=bsm_key).strip()
        if _is_invalid_secret(value):
            invalid_keys.append(env_key)

    mail_transport = os.getenv("MAIL_TRANSPORT", "graph").strip().lower()
    if mail_transport == "smtp":
        smtp_user = get_secret("MAIL_USERNAME", bsm_key="api/MAIL_USERNAME").strip()
        smtp_password = get_secret("MAIL_PASSWORD", bsm_key="api/MAIL_PASSWORD").strip()
        if _is_invalid_secret(smtp_user):
            invalid_keys.append("MAIL_USERNAME")
        if _is_invalid_secret(smtp_password):
            invalid_keys.append("MAIL_PASSWORD")

    valid_count = len(_REQUIRED_SECRET_KEYS) - len(
        [key for key in invalid_keys if key in _REQUIRED_SECRET_KEYS]
    )
    return {
        "environment": environment,
        "strict_contract": strict_contract,
        "mail_transport": mail_transport,
        "contract_ok": len(invalid_keys) == 0,
        "required_secret_keys": len(_REQUIRED_SECRET_KEYS),
        "valid_required_keys": valid_count,
        "invalid_keys": sorted(set(invalid_keys)),
        "channels": {
            "graph_mail_configured": not any(
                key in invalid_keys
                for key in (
                    "MICROSOFT_TENANT_ID",
                    "MICROSOFT_CLIENT_ID",
                    "MICROSOFT_CLIENT_SECRET",
                    "MICROSOFT_GRAPH_SENDER",
                )
            ),
            "slack_webhook_configured": "ALERTS_SLACK_WEBHOOK" not in invalid_keys,
        },
    }


def validate_runtime_secret_contract(environment: str) -> None:
    """Enforces production runtime secret contract before API serves traffic.

    The strict contract applies in production. It can be forced in other
    environments by setting STRICT_SECRET_CONTRACT=true.
    """

    strict_contract = environment == "production" or os.getenv(
        "STRICT_SECRET_CONTRACT", "false"
    ).lower() in {"1", "true", "yes", "on"}
    if not strict_contract:
        return

    report = runtime_secret_contract_report(environment)

    invalid_keys = [str(key) for key in report["invalid_keys"]]
    if invalid_keys:
        missing_sorted = ", ".join(invalid_keys)
        raise RuntimeError(
            f"Missing required runtime secret contract entries: {missing_sorted}"
        )
