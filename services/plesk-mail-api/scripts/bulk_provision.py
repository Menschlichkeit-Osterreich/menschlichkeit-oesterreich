#!/usr/bin/env python3
"""CLI: Bulk-Mailbox-Provisionierung aus CSV.

CSV-Format:
  domain,name,password
  example.com,user1,P@ssw0rd1
  example.com,user2,P@ssw0rd2

Usage: python scripts/bulk_provision.py <csv_file> [--dry-run]
"""

from __future__ import annotations

import argparse
import csv
import os
import sys
import time

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

from plesk_client import PleskAPIError, PleskClient

load_dotenv()


def main() -> None:
    parser = argparse.ArgumentParser(description="Bulk Mailbox Provisioning")
    parser.add_argument("csv_file", help="CSV-Datei mit domain,name,password")
    parser.add_argument("--dry-run", action="store_true", help="Nur Vorschau, keine Änderungen")
    parser.add_argument("--delay", type=float, default=0.5, help="Wartezeit zwischen Operationen (Sek)")
    args = parser.parse_args()

    with open(args.csv_file, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    required = {"domain", "name", "password"}
    if rows and not required.issubset(rows[0].keys()):
        print(f"CSV muss Spalten enthalten: {required}", file=sys.stderr)
        sys.exit(1)

    print(f"{'Modus'}: {'DRY-RUN' if args.dry_run else 'LIVE'}")
    print(f"Einträge: {len(rows)}\n")

    if args.dry_run:
        for row in rows:
            print(f"  [DRY] {row['name']}@{row['domain']}")
        print("\nKeine Änderungen durchgeführt.")
        return

    with PleskClient(
        host=os.environ["PLESK_HOST"],
        login=os.environ["PLESK_LOGIN"],
        password=os.environ["PLESK_PASSWORD"],
        port=int(os.getenv("PLESK_PORT", "8443")),
    ) as client:
        ok = 0
        failed = 0
        site_cache: dict[str, int] = {}

        for i, row in enumerate(rows, 1):
            domain = row["domain"]
            name = row["name"]
            password = row["password"]

            try:
                if domain not in site_cache:
                    site_cache[domain] = client.get_site_id(domain)
                site_id = site_cache[domain]

                mail_id = client.create_mailbox(site_id, name, password)
                print(f"  [{i}/{len(rows)}] OK: {name}@{domain} (id={mail_id})")
                ok += 1
            except PleskAPIError as exc:
                print(f"  [{i}/{len(rows)}] FEHLER: {name}@{domain} — [{exc.errcode}] {exc.errtext}")
                failed += 1

            if args.delay and i < len(rows):
                time.sleep(args.delay)

        print(f"\nErgebnis: {ok} erstellt, {failed} fehlgeschlagen")


if __name__ == "__main__":
    main()
