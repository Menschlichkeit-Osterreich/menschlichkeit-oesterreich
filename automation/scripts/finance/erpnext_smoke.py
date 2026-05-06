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


def _request(url: str, headers: dict[str, str]) -> dict:
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> int:
    base_url = _require("FRAPPE_BASE_URL").rstrip("/")
    api_key = _require("FRAPPE_API_KEY")
    api_secret = _require("FRAPPE_API_SECRET")
    headers = {
        "Authorization": f"token {api_key}:{api_secret}",
        "Accept": "application/json",
    }
    try:
        data = _request(f"{base_url}/api/method/ping", headers)
    except urllib.error.HTTPError as exc:
        print(f"ERPNext HTTP-Fehler: {exc.code}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"ERPNext nicht erreichbar: {exc}", file=sys.stderr)
        return 1

    print(json.dumps({"status": "ok", "ping": data}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
