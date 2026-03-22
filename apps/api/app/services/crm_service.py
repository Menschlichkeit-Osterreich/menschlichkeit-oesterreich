from __future__ import annotations

import json
import logging
import os
from functools import lru_cache
from typing import Any

from ...src.crm.civi_service import CiviCRMService

logger = logging.getLogger("menschlichkeit.crm")


class CrmConfig:
    def __init__(self) -> None:
        self.base_url = os.getenv("CIVICRM_BASE_URL", "").strip()
        self.site_key = os.getenv("CIVICRM_SITE_KEY", "").strip()
        self.api_key = os.getenv("CIVICRM_API_KEY", "").strip()
        self.membership_type_map = self._load_map("CIVICRM_MEMBERSHIP_TYPE_MAP")
        self.group_map = self._load_map("CIVICRM_GROUP_MAP")

    @staticmethod
    def _load_map(env_name: str) -> dict[str, Any]:
        raw = os.getenv(env_name, "").strip()
        if not raw:
            return {}
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            logger.warning("crm_config_invalid_json | env=%s", env_name)
            return {}

    @property
    def enabled(self) -> bool:
        return bool(self.base_url and self.site_key and self.api_key)


@lru_cache(maxsize=1)
def get_crm_config() -> CrmConfig:
    return CrmConfig()


class CrmFacade:
    def __init__(self) -> None:
        self.config = get_crm_config()

    def _client(self) -> CiviCRMService | None:
        if not self.config.enabled:
            return None
        return CiviCRMService(
            base_url=self.config.base_url,
            site_key=self.config.site_key,
            api_key=self.config.api_key,
        )

    async def find_contact_by_email(self, email: str) -> dict[str, Any] | None:
        client = self._client()
        if client is None:
            return None
        try:
            result = await client._request("Contact", "get", {
                "where": [["email_primary.email", "=", email]],
                "select": ["id", "first_name", "last_name", "email_primary.email", "phone_primary.phone"],
                "limit": 1,
            })
            values = result.get("values", [])
            if not values:
                return None
            contact = values[0]
            contact["email"] = contact.get("email_primary.email", "")
            return contact
        except Exception as exc:
            logger.warning("crm_find_contact_failed | email=%s | error=%s", email, exc)
            return None
        finally:
            await client.close()

    async def upsert_contact(
        self,
        *,
        email: str,
        first_name: str,
        last_name: str,
        phone: str | None = None,
        postal_code: str | None = None,
        city: str | None = None,
        source: str = "website",
    ) -> dict[str, Any] | None:
        client = self._client()
        if client is None:
            logger.info("crm_disabled | action=upsert_contact | email=%s", email)
            return None
        try:
            existing = await self.find_contact_by_email(email)
            if existing:
                await client.update_contact(existing["id"], {
                    "first_name": first_name,
                    "last_name": last_name,
                    "email_primary.email": email,
                    "phone_primary.phone": phone or "",
                    "address_primary.postal_code": postal_code or "",
                    "address_primary.city": city or "",
                    "source": source,
                })
                existing.update({
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "phone": phone or "",
                    "postal_code": postal_code or "",
                    "city": city or "",
                })
                return existing
            return await client.create_contact({
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "phone": phone or "",
                "postal_code": postal_code or "",
                "city": city or "",
                "source": source,
            })
        except Exception as exc:
            logger.warning("crm_upsert_failed | email=%s | error=%s", email, exc)
            return None
        finally:
            await client.close()

    async def ensure_membership(self, *, contact_id: int, membership_key: str) -> dict[str, Any] | None:
        client = self._client()
        if client is None:
            logger.info("crm_disabled | action=ensure_membership | contact_id=%s", contact_id)
            return None
        membership_type_id = self.config.membership_type_map.get(membership_key)
        if not membership_type_id:
            logger.warning("crm_membership_type_missing | key=%s", membership_key)
            await client.close()
            return None
        try:
            existing = await client.get_membership(contact_id)
            if existing:
                return existing
            return await client.create_membership(contact_id, int(membership_type_id))
        except Exception as exc:
            logger.warning("crm_membership_failed | contact_id=%s | error=%s", contact_id, exc)
            return None
        finally:
            await client.close()

    async def create_contribution(self, *, contact_id: int, amount: float, source: str) -> dict[str, Any] | None:
        client = self._client()
        if client is None:
            logger.info("crm_disabled | action=create_contribution | contact_id=%s", contact_id)
            return None
        try:
            return await client.create_contribution(contact_id, amount, source=source)
        except Exception as exc:
            logger.warning("crm_contribution_failed | contact_id=%s | error=%s", contact_id, exc)
            return None
        finally:
            await client.close()

    async def set_newsletter_subscription(self, *, contact_id: int, subscribe: bool) -> bool:
        client = self._client()
        if client is None:
            logger.info("crm_disabled | action=newsletter | contact_id=%s", contact_id)
            return False
        group_name = self.config.group_map.get("newsletter", "Newsletter")
        try:
            if subscribe:
                return await client.subscribe_to_newsletter(contact_id, group_name=group_name)
            return await client.unsubscribe_from_newsletter(contact_id, group_name=group_name)
        except Exception as exc:
            logger.warning(
                "crm_newsletter_failed | contact_id=%s | subscribe=%s | error=%s",
                contact_id,
                subscribe,
                exc,
            )
            return False
        finally:
            await client.close()


crm_service = CrmFacade()
