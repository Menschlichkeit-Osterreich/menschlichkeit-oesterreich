"""Bitwarden Secrets Manager Provider fuer OpenClaw Tool-Gateway.

Identische Logik wie apps/api/app/secrets_provider.py,
angepasst fuer den OpenClaw Deployment-Kontext.

DSGVO Art. 32: Secret-Werte werden NIEMALS geloggt.

Verwendung:
    from secrets_provider import get_secret

    PG_DSN = get_secret("OC_PG_DSN", bsm_key="openclaw/OC_PG_DSN")
"""

from __future__ import annotations

import logging
import os
import time
from typing import Optional

logger = logging.getLogger("openclaw.secrets")

_bsm_client = None
_bsm_secrets_cache: dict[str, tuple[str, float]] = {}
_bsm_init_attempted = False

BSM_CACHE_TTL = int(os.environ.get("BSM_CACHE_TTL", "300"))


def _init_bsm_client():
    """Lazy-Init des BSM-Clients. Gibt None zurueck wenn BSM nicht konfiguriert."""
    global _bsm_client, _bsm_init_attempted

    if _bsm_init_attempted:
        return _bsm_client

    _bsm_init_attempted = True

    access_token = (
        os.environ.get("BSM_ACCESS_TOKEN")
        or os.environ.get("BWS_ACCESS_TOKEN")
        or os.environ.get("BW_ACCESS_TOKEN")
    )
    if not access_token:
        logger.info("bsm_provider=disabled reason=BSM_ACCESS_TOKEN_not_set")
        return None

    try:
        from bitwarden_sdk import (
            BitwardenClient,
            DeviceType,
            client_settings_from_dict,
        )

        settings = client_settings_from_dict(
            {
                "apiUrl": os.environ.get("BSM_API_URL", "https://api.bitwarden.eu"),
                "identityUrl": os.environ.get(
                    "BSM_IDENTITY_URL", "https://identity.bitwarden.eu"
                ),
                "deviceType": DeviceType.SDK,
                "userAgent": "openclaw-gateway/2.0",
            }
        )
        _bsm_client = BitwardenClient(settings)

        state_file = (
            os.environ.get("BSM_STATE_FILE") or os.environ.get("BWS_STATE_FILE") or ""
        )
        _bsm_client.auth().login_access_token(access_token, state_file)
        logger.info("bsm_provider=active")
        return _bsm_client

    except Exception:
        logger.error("bsm_init_failed")
        return None


def _fetch_from_bsm(bsm_key: str) -> Optional[str]:
    """Holt ein einzelnes Secret aus BSM via key-basiertem Lookup."""
    client = _init_bsm_client()
    if client is None:
        return None

    org_id = (
        os.environ.get("BSM_ORGANIZATION_ID")
        or os.environ.get("BWS_ORGANIZATION_ID")
        or os.environ.get("BW_ORGANIZATION_ID")
    )
    if not org_id:
        logger.warning("bsm_fetch_skipped reason=BSM_ORGANIZATION_ID_not_set")
        return None

    try:
        response = client.secrets().list(org_id)
        if not response or not response.data:
            return None

        target_id = None
        for secret_identifier in response.data.data:
            if secret_identifier.key == bsm_key:
                target_id = secret_identifier.id
                break

        if target_id is None:
            logger.debug("bsm_miss key=%s", bsm_key)
            return None

        secret_response = client.secrets().get(str(target_id))
        if secret_response and secret_response.data:
            logger.debug("bsm_hit key=%s", bsm_key)
            return secret_response.data.value

    except Exception:
        logger.warning("bsm_fetch_failed key=%s", bsm_key)

    return None


def get_secret(
    env_var: str,
    default: str = "",
    *,
    bsm_key: Optional[str] = None,
) -> str:
    """Lade ein Secret: BSM zuerst, dann os.getenv() als Fallback.

    Args:
        env_var: Name der Umgebungsvariable (z.B. 'OC_PG_DSN').
        default: Standardwert wenn weder BSM noch env einen Wert liefern.
        bsm_key: BSM-Secret-Key (z.B. 'openclaw/OC_PG_DSN').

    Returns:
        Secret-Wert als String.
    """
    lookup_key = bsm_key or env_var
    now = time.time()

    if lookup_key in _bsm_secrets_cache:
        value, expires_at = _bsm_secrets_cache[lookup_key]
        if now < expires_at:
            return value

    bsm_value = _fetch_from_bsm(lookup_key)
    if bsm_value is not None:
        _bsm_secrets_cache[lookup_key] = (bsm_value, now + BSM_CACHE_TTL)
        return bsm_value

    env_value = os.getenv(env_var, default)
    if env_value and env_value != default:
        _bsm_secrets_cache[lookup_key] = (env_value, now + BSM_CACHE_TTL)
    return env_value


def invalidate_cache(key: Optional[str] = None) -> None:
    """Cache invalidieren."""
    if key is None:
        _bsm_secrets_cache.clear()
        logger.info("bsm_cache_cleared scope=all")
    elif key in _bsm_secrets_cache:
        del _bsm_secrets_cache[key]
        logger.info("bsm_cache_cleared key=%s", key)
