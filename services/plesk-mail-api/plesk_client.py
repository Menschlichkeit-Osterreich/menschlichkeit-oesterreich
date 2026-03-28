"""Plesk Obsidian XML API Client — Production-ready.

Supports mail provisioning operations (create, update, delete, list)
with retry logic, structured logging, and TLS enforcement.

Authentication: HTTP_AUTH_LOGIN / HTTP_AUTH_PASSWD headers only.
"""

from __future__ import annotations

import html
import logging
import re
import time
import defusedxml.ElementTree as ET
from dataclasses import dataclass
from typing import Self

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger("plesk_client")

# ── Redaction helpers ───────────────────────────────────────────


def redact_headers(headers: dict[str, str]) -> dict[str, str]:
    """Return a copy with HTTP_AUTH_PASSWD masked."""
    out = dict(headers)
    if "HTTP_AUTH_PASSWD" in out:
        out["HTTP_AUTH_PASSWD"] = "***REDACTED***"
    return out


def redact_xml_passwords(xml: str) -> str:
    """Mask <value>…</value> content inside <password> blocks."""
    return re.sub(
        r"(<password>\s*<value>)(.*?)(</value>)",
        r"\1***REDACTED***\3",
        xml,
        flags=re.DOTALL,
    )


# ── Data classes ────────────────────────────────────────────────


@dataclass(frozen=True, slots=True)
class PleskMailbox:
    name: str
    enabled: bool
    site_id: int


# ── Exceptions ──────────────────────────────────────────────────


class PleskAPIError(Exception):
    """Raised when the Plesk XML API returns status=error."""

    def __init__(self, errcode: str, errtext: str) -> None:
        self.errcode = errcode
        self.errtext = errtext
        super().__init__(f"Plesk API error {errcode}: {errtext}")


# ── Client ──────────────────────────────────────────────────────


class PleskClient:
    """Low-level Plesk Obsidian XML API client.

    Usage::

        with PleskClient("plesk.example.com", "admin", "secret") as c:
            sid = c.get_site_id("example.com")
            c.create_mailbox(sid, "user", "P@ssw0rd!")
            for mb in c.list_mailboxes(sid):
                print(mb.name, mb.enabled)
    """

    PACKET_VERSION = "1.6.9.1"

    def __init__(
        self,
        host: str,
        login: str,
        password: str,
        *,
        port: int = 8443,
        verify_ssl: bool | str = True,
        timeout: int = 30,
        max_retries: int = 3,
        backoff_factor: float = 1.0,
    ) -> None:
        self._url = f"https://{host}:{port}/enterprise/control/agent.php"
        self._headers = {
            "HTTP_AUTH_LOGIN": login,
            "HTTP_AUTH_PASSWD": password,
            "Content-Type": "text/xml",
        }
        self._verify = verify_ssl
        self._timeout = timeout

        self._session = requests.Session()
        retry = Retry(
            total=max_retries,
            backoff_factor=backoff_factor,
            status_forcelist=[502, 503, 504],
            allowed_methods=["POST"],
        )
        self._session.mount("https://", HTTPAdapter(max_retries=retry))

        logger.info(
            "PleskClient initialized for %s:%d (verify=%s)",
            host,
            port,
            verify_ssl,
        )

    # ── Internal helpers ────────────────────────────────────────

    @staticmethod
    def _esc(value: str) -> str:
        """Escape user input for safe XML embedding."""
        return html.escape(value, quote=True)

    def _build_packet(self, inner_xml: str) -> str:
        return (
            f'<?xml version="1.0" encoding="UTF-8"?>'
            f'<packet version="{self.PACKET_VERSION}">'
            f"{inner_xml}"
            f"</packet>"
        )

    def _send(self, inner_xml: str) -> ET.Element:
        payload = self._build_packet(inner_xml)
        logger.debug("Request: %s", redact_xml_passwords(payload[:500]))

        t0 = time.monotonic()
        resp = self._session.post(
            self._url,
            headers=self._headers,
            data=payload.encode("utf-8"),
            verify=self._verify,
            timeout=self._timeout,
        )
        elapsed = time.monotonic() - t0
        logger.debug("Response %d in %.2fs (%d bytes)", resp.status_code, elapsed, len(resp.content))

        resp.raise_for_status()

        root = ET.fromstring(resp.text)
        if root.tag != "packet":
            raise ValueError(f"Unexpected root element: {root.tag}")
        return root

    def _check_result(self, root: ET.Element, path: str = ".//result") -> ET.Element:
        result = root.find(path)
        if result is None:
            raise PleskAPIError("0", "No <result> element in response")
        status_el = result.find("status")
        if status_el is None:
            raise PleskAPIError("0", "No <status> element in result")
        if status_el.text != "ok":
            errcode = result.findtext("errcode", "unknown")
            errtext = result.findtext("errtext", "Unknown error")
            raise PleskAPIError(errcode, errtext)
        return result

    # ── Lifecycle ───────────────────────────────────────────────

    def close(self) -> None:
        self._session.close()
        logger.info("PleskClient session closed")

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    # ── Site ID lookup ──────────────────────────────────────────

    def get_site_id(self, domain: str) -> int:
        """Resolve a domain name to its Plesk site-id."""
        safe_domain = self._esc(domain)
        xml = (
            f"<site><get>"
            f"<filter><name>{safe_domain}</name></filter>"
            f"<dataset><gen_info/></dataset>"
            f"</get></site>"
        )
        root = self._send(xml)
        result = self._check_result(root)
        site_id = result.findtext(".//id")
        if not site_id:
            raise PleskAPIError("0", f"No site-id returned for domain {domain}")
        logger.info("Resolved domain %s → site-id %s", domain, site_id)
        return int(site_id)

    # ── Mail CRUD ───────────────────────────────────────────────

    def create_mailbox(self, site_id: int, name: str, password: str) -> int:
        """Create a new mailbox. Returns the mailbox id."""
        safe_name = self._esc(name)
        safe_pass = self._esc(password)
        xml = (
            f"<mail><create><filter>"
            f"<site-id>{site_id}</site-id>"
            f"<mailname>"
            f"<name>{safe_name}</name>"
            f"<mailbox><enabled>true</enabled></mailbox>"
            f"<password><value>{safe_pass}</value><type>plain</type></password>"
            f"</mailname>"
            f"</filter></create></mail>"
        )
        root = self._send(xml)
        result = self._check_result(root)
        mail_id = result.findtext("id", "0")
        logger.info("Created mailbox '%s' (id=%s) on site %d", name, mail_id, site_id)
        return int(mail_id)

    def update_mailbox_password(self, site_id: int, name: str, new_password: str) -> bool:
        """Update a mailbox password."""
        safe_name = self._esc(name)
        safe_pass = self._esc(new_password)
        xml = (
            f"<mail><update><set><filter>"
            f"<site-id>{site_id}</site-id>"
            f"<mailname>"
            f"<name>{safe_name}</name>"
            f"<password><value>{safe_pass}</value><type>plain</type></password>"
            f"</mailname>"
            f"</filter></set></update></mail>"
        )
        root = self._send(xml)
        self._check_result(root)
        logger.info("Updated password for mailbox '%s' on site %d", name, site_id)
        return True

    def enable_mailbox(self, site_id: int, name: str, enabled: bool = True) -> bool:
        """Enable or disable a mailbox."""
        safe_name = self._esc(name)
        flag = "true" if enabled else "false"
        xml = (
            f"<mail><update><set><filter>"
            f"<site-id>{site_id}</site-id>"
            f"<mailname>"
            f"<name>{safe_name}</name>"
            f"<mailbox><enabled>{flag}</enabled></mailbox>"
            f"</mailname>"
            f"</filter></set></update></mail>"
        )
        root = self._send(xml)
        self._check_result(root)
        logger.info("Set mailbox '%s' enabled=%s on site %d", name, flag, site_id)
        return True

    def delete_mailbox(self, site_id: int, name: str, *, idempotent: bool = False) -> bool:
        """Delete a mailbox. If idempotent=True, ignore 'not found' errors."""
        safe_name = self._esc(name)
        xml = (
            f"<mail><remove><filter>"
            f"<site-id>{site_id}</site-id>"
            f"<mailname><name>{safe_name}</name></mailname>"
            f"</filter></remove></mail>"
        )
        try:
            root = self._send(xml)
            self._check_result(root)
        except PleskAPIError as exc:
            if idempotent and exc.errcode == "1013":
                logger.info("Mailbox '%s' already deleted (idempotent)", name)
                return True
            raise
        logger.info("Deleted mailbox '%s' on site %d", name, site_id)
        return True

    def list_mailboxes(self, site_id: int) -> list[PleskMailbox]:
        """List all mailboxes for a site."""
        xml = (
            f"<mail><get_info><filter>"
            f"<site-id>{site_id}</site-id>"
            f"</filter><mailbox/></get_info></mail>"
        )
        root = self._send(xml)
        mailboxes: list[PleskMailbox] = []
        for result in root.findall(".//result"):
            if result.findtext("status") != "ok":
                continue
            name = result.findtext(".//name")
            enabled = result.findtext(".//mailbox/enabled", "false") == "true"
            if name:
                mailboxes.append(PleskMailbox(name=name, enabled=enabled, site_id=site_id))
        logger.info("Listed %d mailboxes on site %d", len(mailboxes), site_id)
        return mailboxes
