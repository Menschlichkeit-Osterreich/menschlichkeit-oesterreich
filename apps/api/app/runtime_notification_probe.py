from __future__ import annotations

import asyncio
from urllib.parse import urlparse

import httpx

from .secrets_provider import get_secret
from .services.graph_mail_transport import GraphMailTransport


async def _run_live_probe() -> dict[str, object]:
    tenant = get_secret(
        "MICROSOFT_TENANT_ID", bsm_key="api/MICROSOFT_TENANT_ID"
    ).strip()
    client_id = get_secret(
        "MICROSOFT_CLIENT_ID", bsm_key="api/MICROSOFT_CLIENT_ID"
    ).strip()
    client_secret = get_secret(
        "MICROSOFT_CLIENT_SECRET", bsm_key="api/MICROSOFT_CLIENT_SECRET"
    ).strip()
    sender = get_secret(
        "MICROSOFT_GRAPH_SENDER", bsm_key="api/MICROSOFT_GRAPH_SENDER"
    ).strip()
    slack = get_secret(
        "ALERTS_SLACK_WEBHOOK", bsm_key="api/ALERTS_SLACK_WEBHOOK"
    ).strip()

    result: dict[str, object] = {
        "probe": "ok",
        "graph_token_probe": False,
        "slack_webhook_probe": False,
        "breakpoint": "",
    }

    try:
        transport = GraphMailTransport(
            tenant_id=tenant,
            client_id=client_id,
            client_secret=client_secret,
            sender=sender,
            timeout_seconds=20,
        )
        if not transport.is_enabled:
            raise RuntimeError("graph_transport_not_configured")
        await transport._get_access_token(force_refresh=True)
        result["graph_token_probe"] = True
    except Exception as exc:
        result["probe"] = "failed"
        result["breakpoint"] = f"graph_token_probe_failed:{type(exc).__name__}"
        return result

    try:
        parsed = urlparse(slack)
        if parsed.scheme != "https" or parsed.netloc != "hooks.slack.com":
            raise RuntimeError("slack_webhook_invalid_format")

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                slack,
                json={
                    "text": "[deploy-probe] API Secret-Handoff Probe (Graph+Slack) erfolgreich gestartet."
                },
                headers={"Content-Type": "application/json"},
            )
        if response.status_code >= 400:
            raise RuntimeError(f"slack_webhook_http_{response.status_code}")

        result["slack_webhook_probe"] = True
    except Exception as exc:
        result["probe"] = "failed"
        result["breakpoint"] = f"slack_probe_failed:{type(exc).__name__}"
        return result

    return result


def run_live_notification_probe() -> dict[str, object]:
    return asyncio.run(_run_live_probe())
