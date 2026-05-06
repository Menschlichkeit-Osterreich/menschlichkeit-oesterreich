#!/usr/bin/env python3
"""CLI: Mailbox erstellen.

Usage: python scripts/create_mailbox.py <name> <domain> [--password <pw>]
"""

from __future__ import annotations

import argparse
import os
import secrets
import string
import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

from plesk_client import PleskAPIError, PleskClient

load_dotenv()


def generate_password(length: int = 16) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%&*"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def main() -> None:
    parser = argparse.ArgumentParser(description="Plesk Mailbox erstellen")
    parser.add_argument("name", help="Mailbox-Name (ohne @domain)")
    parser.add_argument("domain", help="Domain (z.B. menschlichkeit-oesterreich.at)")
    parser.add_argument("--password", help="Passwort (wird generiert falls leer)")
    args = parser.parse_args()

    password = args.password or generate_password()

    with PleskClient(
        host=os.environ["PLESK_HOST"],
        login=os.environ["PLESK_LOGIN"],
        password=os.environ["PLESK_PASSWORD"],
        port=int(os.getenv("PLESK_PORT", "8443")),
    ) as client:
        try:
            site_id = client.get_site_id(args.domain)
            mail_id = client.create_mailbox(site_id, args.name, password)
            print(f"Erstellt: {args.name}@{args.domain} (id={mail_id})")
            if not args.password:
                print(f"Generiertes Passwort: {password}")
        except PleskAPIError as exc:
            print(f"Fehler: [{exc.errcode}] {exc.errtext}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
