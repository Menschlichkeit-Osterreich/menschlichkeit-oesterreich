#!/usr/bin/env python3
"""n8n Webhook smoke test for GDPR erasure workflows.

Runs minimal (no signature) and optional HMAC-signed tests against
`/webhook/right-to-erasure`.

Env vars:
  N8N_BASE_URL         default http://localhost:5678
  N8N_WEBHOOK_SECRET   optional; if set, runs HMAC test

Usage:
  python3 automation/n8n/smoke-test.py
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import sys
import time
from typing import Dict

import urllib.request


def post_json(url: str, payload: Dict[str, object], headers: Dict[str, str] | None = None) -> tuple[int, str]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")


def compact_json(payload: Dict[str, object]) -> str:
    # Match JSON.stringify default shape (no sorting, compact separators)
    return json.dumps(payload, separators=(",", ":"))


def main() -> int:
    base = os.getenv("N8N_BASE_URL", "http://localhost:5678").rstrip("/")
    url = f"{base}/webhook/right-to-erasure"

    print(f"n8n smoke test → {url}")

    # Minimal test
    minimal_payload = {
        "requestId": f"min_{int(time.time())}",
        "subjectEmail": "smoketest@example.com",
    }
    code, body = post_json(url, minimal_payload)
    ok_min = code in (200, 202) and '"status":"accepted"' in body.replace(" ", "")
    print(f"Minimal: HTTP {code} → {'OK' if ok_min else 'FAIL'} | {body[:120]}")

    # HMAC test (optional)
    secret = os.getenv("N8N_WEBHOOK_SECRET", "").strip()
    ok_hmac = None
    if secret:
        hmac_payload = {
            "requestId": f"hmac_{int(time.time())}",
            "subjectEmail": "smoketest@example.com",
        }
        signature = hmac.new(secret.encode("utf-8"), compact_json(hmac_payload).encode("utf-8"), hashlib.sha256).hexdigest()
        code2, body2 = post_json(url, hmac_payload, headers={"X-Webhook-Signature": signature})
        ok_hmac = code2 in (200, 202) and '"status":"accepted"' in body2.replace(" ", "")
        print(f"HMAC:    HTTP {code2} → {'OK' if ok_hmac else 'FAIL'} | {body2[:120]}")
    else:
        print("HMAC:    skipped (N8N_WEBHOOK_SECRET not set)")

    # Exit code
    if ok_min and (ok_hmac in (True, None)):
        print("Smoke:   ✅ PASS")
        return 0
    print("Smoke:   ❌ FAIL")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())

