#!/usr/bin/env python3
"""Synchronisiert Microsoft-Graph-Secrets aus Bitwarden SM nach apps/api/.env."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from bitwarden_sdk import BitwardenClient, DeviceType, client_settings_from_dict


SECRET_KEYS = (
    "MICROSOFT_TENANT_ID",
    "MICROSOFT_CLIENT_ID",
    "MICROSOFT_CLIENT_SECRET",
    "MICROSOFT_GRAPH_SENDER",
)


def build_client() -> BitwardenClient:
    settings = client_settings_from_dict(
        {
            "apiUrl": os.environ.get("BSM_API_URL", "https://api.bitwarden.eu"),
            "identityUrl": os.environ.get(
                "BSM_IDENTITY_URL", "https://identity.bitwarden.eu"
            ),
            "deviceType": DeviceType.SDK,
            "userAgent": "menschlichkeit-sync-secrets/1.0",
        }
    )
    return BitwardenClient(settings)


def unwrap_items(response: object) -> list[object]:
    payload = getattr(response, "data", None)
    if payload is None:
        return []
    nested = getattr(payload, "data", None)
    if nested is not None:
        return list(nested)
    if isinstance(payload, list):
        return list(payload)
    return [payload]


def load_secret_values(client: BitwardenClient, organization_id: str) -> dict[str, str]:
    list_response = client.secrets().list(organization_id)
    identifiers = unwrap_items(list_response)
    matched_ids: dict[str, str] = {}

    for item in identifiers:
        item_id = getattr(item, "id", "")
        item_key = getattr(item, "key", "") or ""
        item_name = getattr(item, "name", "") or ""
        normalized_key = item_key.split("/", 1)[-1]
        for secret_key in SECRET_KEYS:
            if secret_key in matched_ids:
                continue
            if normalized_key == secret_key or item_name == secret_key:
                matched_ids[secret_key] = item_id

    secret_values: dict[str, str] = {}
    for secret_key in SECRET_KEYS:
        item_id = matched_ids.get(secret_key)
        if not item_id:
            continue
        secret_response = client.secrets().get(item_id)
        secret_data = getattr(secret_response, "data", None)
        secret_value = (getattr(secret_data, "value", "") or "").strip()
        if secret_value:
            secret_values[secret_key] = secret_value

    return secret_values


def update_env_file(
    env_file: Path, secret_values: dict[str, str], dry_run: bool
) -> bool:
    if not env_file.exists():
        print(f"❌ Datei nicht gefunden: {env_file}")
        return False

    lines = env_file.read_text(encoding="utf-8").splitlines()
    updates: list[str] = []

    for secret_key in SECRET_KEYS:
        secret_value = secret_values.get(secret_key, "")
        if not secret_value:
            continue
        replacement = f"{secret_key}={secret_value}"
        replaced = False
        for index, line in enumerate(lines):
            if line.startswith(f"{secret_key}="):
                if line != replacement:
                    lines[index] = replacement
                    updates.append(f"UPDATE {secret_key}")
                replaced = True
                break
        if not replaced:
            lines.append(replacement)
            updates.append(f"ADD {secret_key}")

    if not any(line.startswith("MAIL_TRANSPORT=") for line in lines):
        lines.append("MAIL_TRANSPORT=graph")
        updates.append("ADD MAIL_TRANSPORT")

    if not updates:
        print("✓ Keine Änderungen nötig")
        return True

    for update in updates:
        print(f"  [{update}]")

    if dry_run:
        print("\n📋 Dry-Run: keine Änderungen geschrieben")
        return True

    env_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\n✓ Erfolgreich aktualisiert: {env_file}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Sync Microsoft Graph secrets from Bitwarden SM to apps/api/.env"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Show changes without applying them"
    )
    parser.add_argument(
        "--mode",
        choices=["test", "live"],
        default="test",
        help="Kompatibilitätsparameter; aktuell ohne Wirkung.",
    )
    args = parser.parse_args()

    access_token = (
        os.environ.get("BWS_ACCESS_TOKEN") or os.environ.get("BSM_ACCESS_TOKEN") or ""
    ).strip()
    organization_id = (
        os.environ.get("BWS_ORGANIZATION_ID")
        or os.environ.get("BSM_ORGANIZATION_ID")
        or ""
    ).strip()

    if not access_token:
        print("❌ BWS_ACCESS_TOKEN/BSM_ACCESS_TOKEN ist nicht gesetzt")
        return 1
    if not organization_id:
        print("❌ BWS_ORGANIZATION_ID/BSM_ORGANIZATION_ID ist nicht gesetzt")
        return 1

    workspace_root = Path(__file__).resolve().parent.parent
    env_file = workspace_root / "apps" / "api" / ".env"

    print("🔐 Syncing Microsoft Graph secrets from Bitwarden SM...")
    print(f"   Workspace: {workspace_root}")
    print(f"   Env file: {env_file}")
    print(f"   Dry run: {args.dry_run}")
    print()

    try:
        client = build_client()
        client.auth().login_access_token(access_token)
        secret_values = load_secret_values(client, organization_id)
    except Exception as exc:
        print(f"❌ Bitwarden-Abfrage fehlgeschlagen: {exc}")
        return 1

    print(f"📥 Gefundene Secrets: {len(secret_values)}")
    for key in sorted(secret_values):
        print(f"  ✓ {key}")

    return 0 if update_env_file(env_file, secret_values, args.dry_run) else 1


if __name__ == "__main__":
    sys.exit(main())
