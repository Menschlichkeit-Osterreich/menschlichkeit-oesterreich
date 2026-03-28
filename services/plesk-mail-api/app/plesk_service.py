"""Service layer — wraps PleskClient with domain→site-id caching."""

from __future__ import annotations

import functools
import logging
import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent))

from plesk_client import PleskAPIError, PleskClient, PleskMailbox  # noqa: E402

logger = logging.getLogger("plesk_service")


class PleskService:
    """Thin service layer over PleskClient with site-id caching."""

    def __init__(self, host: str, login: str, password: str, **kwargs: object) -> None:
        self._client = PleskClient(host=host, login=login, password=password, **kwargs)  # type: ignore[arg-type]
        logger.info("PleskService ready (host=%s)", host)

    @functools.lru_cache(maxsize=256)
    def get_site_id(self, domain: str) -> int:
        """Resolve domain → site-id (cached)."""
        return self._client.get_site_id(domain)

    def invalidate_site_cache(self, domain: str | None = None) -> None:
        """Clear cached site-id lookups."""
        if domain:
            # lru_cache doesn't support single-key eviction — clear all
            self.get_site_id.cache_clear()
        else:
            self.get_site_id.cache_clear()

    def create_mailbox(self, domain: str, name: str, password: str) -> int:
        site_id = self.get_site_id(domain)
        return self._client.create_mailbox(site_id, name, password)

    def update_mailbox_password(self, domain: str, name: str, new_password: str) -> bool:
        site_id = self.get_site_id(domain)
        return self._client.update_mailbox_password(site_id, name, new_password)

    def enable_mailbox(self, domain: str, name: str, enabled: bool = True) -> bool:
        site_id = self.get_site_id(domain)
        return self._client.enable_mailbox(site_id, name, enabled)

    def delete_mailbox(self, domain: str, name: str, *, idempotent: bool = False) -> bool:
        site_id = self.get_site_id(domain)
        return self._client.delete_mailbox(site_id, name, idempotent=idempotent)

    def list_mailboxes(self, domain: str) -> list[dict[str, object]]:
        site_id = self.get_site_id(domain)
        mboxes = self._client.list_mailboxes(site_id)
        return [{"name": m.name, "enabled": m.enabled, "site_id": m.site_id} for m in mboxes]

    def close(self) -> None:
        self._client.close()
