#!/usr/bin/env python3
"""Classify the current n8n staging routing state for AP-01.

This script is read-only and exists to make the AP-01 routing evidence
reproducible. It probes the configured n8n base URL and classifies the result
 into one of the governance-relevant states:

- domain-default-page: reverse proxy or DNS points to a default host page
- auth-gated: routing is correct but access is blocked by auth or role
- n8n-ui-visible: the n8n UI is reachable
- api-expected: the target responds on a typical health endpoint

Env vars:
  N8N_BASE_URL  defaults to https://n8n.menschlichkeit-oesterreich.at

Usage:
  python3 automation/n8n/check-staging-routing.py
  python3 automation/n8n/check-staging-routing.py --json
"""

from __future__ import annotations

import argparse
import json
import socket
import ssl
import sys
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass
from typing import Optional


DEFAULT_URL = "https://n8n.menschlichkeit-oesterreich.at"
USER_AGENT = "moe-ap01-routing-probe/1.0"


@dataclass
class ProbeResult:
    url: str
    resolved_ips: list[str]
    root_status: Optional[int]
    root_content_type: str
    root_body_preview: str
    health_status: Optional[int]
    health_body_preview: str
    classification: str
    detail: str


def fetch(url: str) -> tuple[Optional[int], str, str]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=15, context=ssl.create_default_context()) as response:
            status = response.status
            content_type = response.headers.get("Content-Type", "")
            body = response.read(512).decode("utf-8", errors="replace")
            return status, content_type, body
    except urllib.error.HTTPError as error:
        body = error.read(512).decode("utf-8", errors="replace")
        return error.code, error.headers.get("Content-Type", ""), body
    except Exception as error:  # pragma: no cover - best-effort probe path
        return None, "", f"ERROR: {error}"


def resolve_ips(hostname: str) -> list[str]:
    try:
        infos = socket.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
    except socket.gaierror:
        return []
    return sorted({info[4][0] for info in infos})


def classify(base_url: str) -> ProbeResult:
    root_status, root_content_type, root_body = fetch(base_url)
    health_status, _, health_body = fetch(f"{base_url.rstrip('/')}/healthz")
    resolved_ips = resolve_ips(urllib.request.urlparse(base_url).hostname or "")

    lowered_root = root_body.lower()
    lowered_health = health_body.lower()

    if "default webpage generated" in lowered_root or "domain default page" in lowered_root:
        return ProbeResult(
            url=base_url,
            resolved_ips=resolved_ips,
            root_status=root_status,
            root_content_type=root_content_type,
            root_body_preview=root_body.strip(),
            health_status=health_status,
            health_body_preview=health_body.strip(),
            classification="domain-default-page",
            detail="Reverse proxy und/oder DNS zeigt auf eine Default-Host-Seite statt auf n8n.",
        )

    if root_status in (401, 403) or health_status in (401, 403):
        return ProbeResult(
            url=base_url,
            resolved_ips=resolved_ips,
            root_status=root_status,
            root_content_type=root_content_type,
            root_body_preview=root_body.strip(),
            health_status=health_status,
            health_body_preview=health_body.strip(),
            classification="auth-gated",
            detail="Routing ist plausibel korrekt, aber Authentifizierung oder Rolle blockiert den Zugriff.",
        )

    if health_status == 200 and ("ok" in lowered_health or "healthy" in lowered_health or health_body.strip() == "OK"):
        return ProbeResult(
            url=base_url,
            resolved_ips=resolved_ips,
            root_status=root_status,
            root_content_type=root_content_type,
            root_body_preview=root_body.strip(),
            health_status=health_status,
            health_body_preview=health_body.strip(),
            classification="api-expected",
            detail="Health-Endpoint antwortet erwartbar; die autoritative Zielumgebung ist nutzbar.",
        )

    if "n8n" in lowered_root or "workflow automation" in lowered_root or "data-test-id" in lowered_root:
        return ProbeResult(
            url=base_url,
            resolved_ips=resolved_ips,
            root_status=root_status,
            root_content_type=root_content_type,
            root_body_preview=root_body.strip(),
            health_status=health_status,
            health_body_preview=health_body.strip(),
            classification="n8n-ui-visible",
            detail="Die n8n-Oberflaeche ist erreichbar, aber ein erwartbarer API-Health-Nachweis fehlt noch.",
        )

    return ProbeResult(
        url=base_url,
        resolved_ips=resolved_ips,
        root_status=root_status,
        root_content_type=root_content_type,
        root_body_preview=root_body.strip(),
        health_status=health_status,
        health_body_preview=health_body.strip(),
        classification="unknown",
        detail="Keiner der bekannten AP-01-Zustaende konnte eindeutig bestaetigt werden.",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Probe the n8n staging routing state for AP-01.")
    parser.add_argument("--json", action="store_true", help="Output machine-readable JSON only.")
    args = parser.parse_args()

    base_url = DEFAULT_URL
    result = classify(base_url=base_url)

    if args.json:
        print(json.dumps(asdict(result), ensure_ascii=True))
    else:
        print(f"AP-01 routing probe -> {result.url}")
        print(f"resolved_ips      : {', '.join(result.resolved_ips) or 'n/a'}")
        print(f"root_status       : {result.root_status}")
        print(f"health_status     : {result.health_status}")
        print(f"classification    : {result.classification}")
        print(f"detail            : {result.detail}")
        print(f"root_preview      : {result.root_body_preview[:200]}")
        if result.health_body_preview:
            print(f"health_preview    : {result.health_body_preview[:200]}")

    exit_codes = {
        "api-expected": 0,
        "n8n-ui-visible": 10,
        "auth-gated": 20,
        "domain-default-page": 30,
        "unknown": 40,
    }
    return exit_codes[result.classification]


if __name__ == "__main__":
    raise SystemExit(main())
