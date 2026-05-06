from __future__ import annotations

import asyncio
import time
from email.message import EmailMessage

import httpx


class GraphMailTransportError(RuntimeError):
    """Fehler beim Versand ueber Microsoft Graph."""


class GraphMailTransport:
    def __init__(
        self,
        *,
        tenant_id: str,
        client_id: str,
        client_secret: str,
        sender: str,
        token_cache_ttl: int = 3300,
        timeout_seconds: int = 20,
    ) -> None:
        self.tenant_id = tenant_id.strip()
        self.client_id = client_id.strip()
        self.client_secret = client_secret.strip()
        self.sender = sender.strip()
        self.token_cache_ttl = token_cache_ttl
        self.timeout_seconds = timeout_seconds
        self._access_token: str | None = None
        self._access_token_expires_at: float = 0.0

    @property
    def is_enabled(self) -> bool:
        return bool(
            self.tenant_id and self.client_id and self.client_secret and self.sender
        )

    async def _get_access_token(self, *, force_refresh: bool = False) -> str:
        now = time.time()
        if (
            not force_refresh
            and self._access_token
            and now < self._access_token_expires_at
        ):
            return self._access_token

        token_url = (
            f"https://login.microsoftonline.com/{self.tenant_id}" "/oauth2/v2.0/token"
        )
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": "https://graph.microsoft.com/.default",
            "grant_type": "client_credentials",
        }

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            try:
                response = await client.post(token_url, data=payload)
            except Exception as exc:  # pragma: no cover - network-dependent
                raise GraphMailTransportError(
                    f"graph_token_request_failed: {exc}"
                ) from exc

        if response.status_code != 200:
            raise GraphMailTransportError(
                f"graph_token_http_{response.status_code}: {response.text[:200]}"
            )

        data = response.json()
        access_token = (data.get("access_token") or "").strip()
        expires_in = int(data.get("expires_in") or 3600)
        if not access_token:
            raise GraphMailTransportError("graph_token_missing_access_token")

        ttl = min(expires_in, self.token_cache_ttl)
        # 300s Sicherheitsfenster gegen Token-Expiry waehrend Versand
        self._access_token_expires_at = now + max(ttl - 300, 60)
        self._access_token = access_token
        return access_token

    @staticmethod
    def _extract_bodies(message: EmailMessage) -> tuple[str, str]:
        text_body = ""
        html_body = ""

        if message.is_multipart():
            for part in message.walk():
                content_type = part.get_content_type()
                if content_type == "text/plain" and not text_body:
                    text_body = part.get_content() or ""
                elif content_type == "text/html" and not html_body:
                    html_body = part.get_content() or ""
        else:
            content_type = message.get_content_type()
            if content_type == "text/html":
                html_body = message.get_content() or ""
            else:
                text_body = message.get_content() or ""

        if not html_body and text_body:
            html_body = text_body
        if not text_body and html_body:
            text_body = html_body
        return text_body, html_body

    async def send_message(self, message: EmailMessage) -> bool:
        if not self.is_enabled:
            raise GraphMailTransportError("graph_transport_not_configured")

        to_addr = (message.get("To") or "").strip()
        subject = (message.get("Subject") or "").strip()
        if not to_addr:
            raise GraphMailTransportError("graph_missing_recipient")

        text_body, html_body = self._extract_bodies(message)
        payload = {
            "message": {
                "subject": subject,
                "body": {
                    "contentType": "HTML",
                    "content": html_body,
                },
                "toRecipients": [
                    {
                        "emailAddress": {
                            "address": to_addr,
                        }
                    }
                ],
            },
            "saveToSentItems": True,
        }

        send_url = f"https://graph.microsoft.com/v1.0/users/{self.sender}/sendMail"
        attempts = 2
        for attempt in range(attempts):
            force_refresh = attempt > 0
            token = await self._get_access_token(force_refresh=force_refresh)
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            }
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                try:
                    response = await client.post(
                        send_url, json=payload, headers=headers
                    )
                except Exception as exc:  # pragma: no cover - network-dependent
                    if attempt < attempts - 1:
                        await asyncio.sleep(1)
                        continue
                    raise GraphMailTransportError(
                        f"graph_send_request_failed: {exc}"
                    ) from exc

            if response.status_code in (200, 202):
                return True
            if response.status_code == 401 and attempt < attempts - 1:
                continue
            if response.status_code == 429 and attempt < attempts - 1:
                await asyncio.sleep(1)
                continue
            if response.status_code >= 500 and attempt < attempts - 1:
                await asyncio.sleep(1)
                continue
            raise GraphMailTransportError(
                f"graph_send_http_{response.status_code}: {response.text[:200]}"
            )

        raise GraphMailTransportError("graph_send_exhausted")
