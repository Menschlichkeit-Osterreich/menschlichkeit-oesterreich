#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def _require(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"{name} fehlt")
    return value


def main() -> int:
    api_base = _require("API_BASE_URL").rstrip("/")
    api_token = _require("MOE_API_TOKEN")
    limit = os.environ.get("FINANCE_SYNC_LIMIT", "50")
    request = urllib.request.Request(
        f"{api_base}/api/internal/finance/erpnext/process",
        method="POST",
        headers={
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        data=json.dumps({"limit": int(limit)}).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        print(f"Backfill HTTP-Fehler: {exc.code}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"Backfill fehlgeschlagen: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
