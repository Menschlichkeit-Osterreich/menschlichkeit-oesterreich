#!/usr/bin/env python3
"""GDPR Art. 17 automation helper for Menschlichkeit Österreich."""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import hmac
import json
import logging
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, Optional

import httpx

logger = logging.getLogger("moe.privacy.erasure")


@dataclass
class CivicrmConfig:
    base_url: str
    site_key: str
    api_key: str


class CivicrmClient:
    """Thin async wrapper around CiviCRM API v4."""

    def __init__(self, *, config: CivicrmConfig, http_client: httpx.AsyncClient) -> None:
        self._config = config
        self._http = http_client

    async def call(self, entity: str, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        payload = {
            "params": params,
            "_authx": {
                "api_key": self._config.api_key,
                "key": self._config.site_key,
            },
        }
        url = f"{self._config.base_url.rstrip('/')}/civicrm/ajax/api4/{entity}/{action}"
        response = await self._http.post(url, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and data.get("is_error"):
            raise RuntimeError(f"CiviCRM error: {data.get('error_message', 'unknown error')}")
        if not isinstance(data, dict):
            raise RuntimeError("Unexpected response from CiviCRM")
        return data

    async def get_contact(self, *, contact_id: Optional[int] = None, email: Optional[str] = None) -> Dict[str, Any]:
        params: Dict[str, Any] = {"limit": 1}
        if contact_id is not None:
            params["id"] = contact_id
        if email is not None:
            params["email"] = email
        data = await self.call("Contact", "get", params)
        contact = _extract_first_value(data)
        if not contact:
            raise LookupError("Contact not found")
        return contact

    async def list_memberships(self, contact_id: int) -> Iterable[Dict[str, Any]]:
        data = await self.call("Membership", "get", {"contact_id": contact_id})
        values = data.get("values")
        if isinstance(values, list):
            return values
        return []

    async def delete_membership(self, membership_id: int) -> None:
        await self.call("Membership", "delete", {"id": membership_id})

    async def delete_contact(self, contact_id: int) -> None:
        await self.call("Contact", "delete", {"id": contact_id, "skip_undelete": True})

    async def anonymize_contact(self, contact_id: int, *, marker: str) -> None:
        anonymized_email = f"gdpr-erased+{contact_id}@invalid.moe"
        payload = {
            "id": contact_id,
            "email": anonymized_email,
            "first_name": "Erased",
            "last_name": marker,
            "display_name": f"GDPR Erased {contact_id}",
            "nick_name": marker,
            "is_deleted": True,
        }
        await self.call("Contact", "create", payload)


def _extract_first_value(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    values = data.get("values")
    if isinstance(values, list) and values:
        return values[0]
    return None


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Automate GDPR Right to Erasure for CiviCRM contacts")
    identifier = parser.add_mutually_exclusive_group(required=True)
    identifier.add_argument("--email", help="Primary email address of the data subject")
    identifier.add_argument("--contact-id", type=int, help="CiviCRM contact ID")

    parser.add_argument(
        "--mode",
        choices=["delete", "anonymize"],
        default="anonymize",
        help="Deletion strategy: hard delete or anonymize in place",
    )
    parser.add_argument("--reason", default="user_request", help="Reason code stored in audit trail")
    parser.add_argument("--metadata", help="Additional metadata as JSON string")
    parser.add_argument("--dry-run", action="store_true", help="Plan actions without calling external systems")
    parser.add_argument(
        "--audit-log",
        default="logs/mcp/right-to-erasure.jsonl",
        help="Path to JSONL audit file (created if missing)",
    )
    parser.add_argument("--no-webhook", action="store_true", help="Skip n8n webhook notification")
    parser.add_argument("--timeout", type=float, default=30.0, help="HTTP timeout in seconds")

    parser.add_argument("--civi-base-url", help="Override CIVI_BASE_URL env value")
    parser.add_argument("--civi-site-key", help="Override CIVI_SITE_KEY env value")
    parser.add_argument("--civi-api-key", help="Override CIVI_API_KEY env value")

    return parser


def resolve_config(args: argparse.Namespace) -> CivicrmConfig:
    base_url = args.civi_base_url or os.getenv("CIVI_BASE_URL")
    site_key = args.civi_site_key or os.getenv("CIVI_SITE_KEY")
    api_key = args.civi_api_key or os.getenv("CIVI_API_KEY")
    missing = [name for name, value in {"CIVI_BASE_URL": base_url, "CIVI_SITE_KEY": site_key, "CIVI_API_KEY": api_key}.items() if not value]
    if missing:
        raise RuntimeError(f"Missing CiviCRM configuration values: {', '.join(missing)}")
    assert base_url and site_key and api_key  # For type checkers
    return CivicrmConfig(base_url=base_url, site_key=site_key, api_key=api_key)


async def perform_erasure(args: argparse.Namespace) -> Dict[str, Any]:
    metadata = json.loads(args.metadata) if args.metadata else {}
    config = resolve_config(args)

    async with httpx.AsyncClient(timeout=args.timeout) as http_client:
        civicrm = CivicrmClient(config=config, http_client=http_client)
        contact = await civicrm.get_contact(contact_id=args.contact_id, email=args.email)
        contact_id = int(contact["id"])
        memberships = list(await civicrm.list_memberships(contact_id))

        plan = {
            "contact_id": contact_id,
            "email": contact.get("email") or contact.get("email_primary"),
            "mode": args.mode,
            "memberships": [int(m.get("id")) for m in memberships],
            "reason": args.reason,
            "metadata": metadata,
        }

        if args.dry_run:
            logger.info("DRY RUN: %s", json.dumps(plan, indent=2, ensure_ascii=False))
            return {**plan, "status": "dry_run"}

        for membership in memberships:
            membership_id = int(membership.get("id"))
            logger.info("Removing membership %s", membership_id)
            await civicrm.delete_membership(membership_id)

        if args.mode == "delete":
            logger.info("Deleting contact %s", contact_id)
            await civicrm.delete_contact(contact_id)
        else:
            logger.info("Anonymizing contact %s", contact_id)
            await civicrm.anonymize_contact(contact_id, marker="GDPR-Erased")

        audit_payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "contact_id": contact_id,
            "original_email": plan["email"],
            "mode": args.mode,
            "memberships_removed": plan["memberships"],
            "reason": args.reason,
            "metadata": metadata,
        }

        await append_audit_entry(args.audit_log, audit_payload)

        if not args.no_webhook:
            await trigger_webhook(http_client, audit_payload)

        return {**audit_payload, "status": "completed"}


async def append_audit_entry(path: str, payload: Dict[str, Any]) -> None:
    json_line = json.dumps(payload, ensure_ascii=False)
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    loop = asyncio.get_running_loop()

    def _write() -> None:
        with destination.open("a", encoding="utf-8") as handle:
            handle.write(json_line + "\n")

    await loop.run_in_executor(None, _write)
    logger.info("Audit entry appended to %s", destination)


async def trigger_webhook(http_client: httpx.AsyncClient, payload: Dict[str, Any]) -> None:
    base_url = os.getenv("N8N_BASE_URL")
    if not base_url:
        logger.debug("N8N_BASE_URL not set; skipping webhook")
        return
    url = f"{base_url.rstrip('/')}/webhook/right-to-erasure"
    secret = os.getenv("N8N_WEBHOOK_SECRET")
    headers = {"Content-Type": "application/json"}
    if secret:
        canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        signature = hmac.new(secret.encode("utf-8"), canonical.encode("utf-8"), hashlib.sha256).hexdigest()
        headers["X-Webhook-Signature"] = signature
    response = await http_client.post(url, headers=headers, json=payload)
    if response.status_code >= 400:
        logger.warning("n8n webhook returned %s: %s", response.status_code, response.text[:200])
    else:
        logger.info("n8n webhook accepted erasure event (%s)", response.status_code)


def configure_logging() -> None:
    level = os.getenv("ERASURE_LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=getattr(logging, level, logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )


def main() -> int:
    configure_logging()
    parser = build_parser()
    args = parser.parse_args()

    try:
        result = asyncio.run(perform_erasure(args))
    except LookupError as exc:
        logger.error("%s", exc)
        return 2
    except RuntimeError as exc:
        logger.error("%s", exc)
        return 3
    except KeyboardInterrupt:
        logger.warning("Interrupted")
        return 130
    except Exception as exc:  # pragma: no cover - safeguard
        logger.exception("Unexpected failure: %s", exc)
        return 99

    logger.info("Right to Erasure flow finished: %s", result.get("status"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
