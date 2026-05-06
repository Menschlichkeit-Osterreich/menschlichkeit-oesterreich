#!/usr/bin/env python3
"""CLI: Mailboxen auflisten.

Usage: python scripts/list_mailboxes.py <domain>
"""

from __future__ import annotations

import argparse
import os
import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

from plesk_client import PleskAPIError, PleskClient

load_dotenv()


def main() -> None:
    parser = argparse.ArgumentParser(description="Plesk Mailboxen auflisten")
    parser.add_argument("domain", help="Domain (z.B. menschlichkeit-oesterreich.at)")
    args = parser.parse_args()

    with PleskClient(
        host=os.environ["PLESK_HOST"],
        login=os.environ["PLESK_LOGIN"],
        password=os.environ["PLESK_PASSWORD"],
        port=int(os.getenv("PLESK_PORT", "8443")),
    ) as client:
        try:
            site_id = client.get_site_id(args.domain)
            mailboxes = client.list_mailboxes(site_id)
            if not mailboxes:
                print(f"Keine Mailboxen für {args.domain}")
                return
            print(f"{'Name':<30} {'Aktiv':<8} {'Site-ID':<10}")
            print("-" * 48)
            for mb in mailboxes:
                status = "ja" if mb.enabled else "nein"
                print(f"{mb.name:<30} {status:<8} {mb.site_id:<10}")
            print(f"\nGesamt: {len(mailboxes)} Mailboxen")
        except PleskAPIError as exc:
            print(f"Fehler: [{exc.errcode}] {exc.errtext}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
