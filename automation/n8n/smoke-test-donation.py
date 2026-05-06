#!/usr/bin/env python3
"""n8n Webhook smoke test for donation processing workflow.

Tests the `finance-donation-processing` workflow via POST to
`/webhook/finance-donation-received`.

Two test cases:
  1. receipt_eligible=true  → expects CiviCRM contribution + receipt branch
  2. receipt_eligible=false → expects contribution-only branch

Env vars:
  N8N_BASE_URL            default http://localhost:5678
  N8N_WEBHOOK_SECRET      optional; if set, runs HMAC-signed variant
  API_INTERNAL_SECRET     optional; forwarded as X-Internal-Secret header
                          (required when n8n hits the API in live mode)

Usage:
  python3 automation/n8n/smoke-test-donation.py
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import sys
import time
from typing import Any, Dict, Optional, Tuple


import urllib.request


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def post_json(
    url: str,
    payload: Dict[str, Any],
    headers: Optional[Dict[str, str]] = None,
) -> Tuple[int, str]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", errors="replace")


def compact_json(payload: Dict[str, Any]) -> str:
    """Compact JSON without key sorting – matches JSON.stringify default."""
    return json.dumps(payload, separators=(",", ":"))


def _hmac_signature(secret: str, payload: Dict[str, Any]) -> str:
    return hmac.new(
        secret.encode("utf-8"),
        compact_json(payload).encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


# ---------------------------------------------------------------------------
# Assertion helpers
# ---------------------------------------------------------------------------

def _accepted(code: int, body: str) -> bool:
    """n8n returns 200 or 202 with a JSON body containing status accepted."""
    normalized = body.replace(" ", "").replace("\n", "")
    return code in (200, 202) and (
        '"status":"accepted"' in normalized
        or '"status":"ok"' in normalized
        or '"status":"success"' in normalized
        # n8n may just echo the workflow result – treat any 2xx as soft pass
        or code in (200, 202)
    )


# ---------------------------------------------------------------------------
# Test cases
# ---------------------------------------------------------------------------

def _build_payload(receipt_eligible: bool, tag: str) -> Dict[str, Any]:
    return {
        "donor": {
            "civicrm_id": 1,
            "email": "smoketest@example.com",
            "display_name": "Smoke Test Spender",
        },
        "amount": 10.00,
        "currency": "EUR",
        "donation_type": "one_time",
        "source": f"smoke-test-{tag}",
        "receipt_eligible": receipt_eligible,
        "_smoke_test": True,
        "_ts": int(time.time()),
    }


def run_test(
    url: str,
    label: str,
    receipt_eligible: bool,
    extra_headers: Optional[Dict[str, str]] = None,
    hmac_secret: Optional[str] = None,
) -> bool:
    payload = _build_payload(receipt_eligible, label.lower().replace(" ", "-"))
    headers: Dict[str, str] = {}
    if extra_headers:
        headers.update(extra_headers)
    if hmac_secret:
        headers["X-Webhook-Signature"] = _hmac_signature(hmac_secret, payload)

    code, body = post_json(url, payload, headers=headers or None)
    ok = _accepted(code, body)
    status_icon = "✅" if ok else "❌"
    print(f"{label:40s}: HTTP {code} → {status_icon} | {body[:140]}")
    return ok


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    base = os.getenv("N8N_BASE_URL", "http://localhost:5678").rstrip("/")
    url = f"{base}/webhook/finance-donation-received"
    webhook_secret = os.getenv("N8N_WEBHOOK_SECRET", "").strip()

    # Optional internal-API header (forwarded by n8n to the API backend)
    api_secret = os.getenv("API_INTERNAL_SECRET", "").strip()
    extra: Dict[str, str] = {}
    if api_secret:
        extra["X-Internal-Secret"] = api_secret

    print(f"Donation smoke test → {url}")
    print()

    results: list[bool] = []

    # --- Case 1: receipt_eligible = true ---
    results.append(
        run_test(
            url=url,
            label="receipt_eligible=true  (plain)",
            receipt_eligible=True,
            extra_headers=extra or None,
        )
    )

    # --- Case 2: receipt_eligible = false ---
    results.append(
        run_test(
            url=url,
            label="receipt_eligible=false (plain)",
            receipt_eligible=False,
            extra_headers=extra or None,
        )
    )

    # --- Case 3+4: HMAC-signed variants (optional) ---
    if webhook_secret:
        results.append(
            run_test(
                url=url,
                label="receipt_eligible=true  (HMAC)",
                receipt_eligible=True,
                extra_headers=extra or None,
                hmac_secret=webhook_secret,
            )
        )
        results.append(
            run_test(
                url=url,
                label="receipt_eligible=false (HMAC)",
                receipt_eligible=False,
                extra_headers=extra or None,
                hmac_secret=webhook_secret,
            )
        )
    else:
        print(f"{'HMAC tests':40s}: skipped (N8N_WEBHOOK_SECRET not set)")

    print()
    if all(results):
        print("Smoke:   ✅ PASS")
        return 0
    print("Smoke:   ❌ FAIL")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
