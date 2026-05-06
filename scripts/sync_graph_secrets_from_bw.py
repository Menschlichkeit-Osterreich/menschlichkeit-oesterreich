#!/usr/bin/env python3
"""
Sync Microsoft Graph secrets from Bitwarden SM to .env file
Uses Bitwarden Secrets Manager Python SDK
"""

import os
import sys
from pathlib import Path
from bitwarden_sdk import BitwardenClient, ClientSettings

# Workspace paths
WORKSPACE_ROOT = Path(__file__).parent.parent
ENV_FILE = WORKSPACE_ROOT / "apps" / "api" / ".env"

# Secrets to retrieve
GRAPH_SECRETS = [
    "MICROSOFT_TENANT_ID",
    "MICROSOFT_CLIENT_ID",
    "MICROSOFT_CLIENT_SECRET",
    "MICROSOFT_GRAPH_SENDER",
]


def get_bitwarden_secrets():
    """Retrieve Graph secrets from Bitwarden SM"""
    print("🔐 Syncing Microsoft Graph secrets from Bitwarden SM...")
    print(f"   Workspace: {WORKSPACE_ROOT}")
    print(f"   Env file: {ENV_FILE}\n")

    # Initialize Bitwarden client
    settings = ClientSettings(
        api_url="https://vault.bitwarden.eu",
        identity_url="https://identity.bitwarden.eu",
    )
    client = BitwardenClient(settings)

    # Auth using env vars or access token
    access_token = os.getenv("BWS_ACCESS_TOKEN") or os.getenv("BITWARDEN_ACCESS_TOKEN")
    if not access_token:
        print("❌ FAILED: No Bitwarden access token found")
        print("   Set BWS_ACCESS_TOKEN or BITWARDEN_ACCESS_TOKEN environment variable")
        return None

    try:
        client.auth.login_access_token(access_token)
        print("✅ Authenticated to Bitwarden SM\n")
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return None

    # Retrieve secrets
    secrets = {}
    for secret_name in GRAPH_SECRETS:
        secret_id = f"api/{secret_name}"
        print(f"  📥 Fetching {secret_name}...", end=" ")
        try:
            # Get secret by ID pattern
            all_secrets = client.secrets.list()
            secret = None
            for s in all_secrets.data:
                if secret_name in s.name or secret_name in (s.key or ""):
                    secret = client.secrets.get(s.id)
                    break

            if secret:
                secrets[secret_name] = secret.value
                print("✅")
            else:
                print("⏭️  (not found)")
        except Exception as e:
            print(f"⚠️  ({str(e)[:50]}...)")

    return secrets


def update_env_file(secrets):
    """Update .env file with Graph secrets"""
    if not ENV_FILE.exists():
        print(f"❌ File not found: {ENV_FILE}")
        return False

    print()

    # Read current .env
    env_lines = ENV_FILE.read_text(encoding="utf-8").splitlines(keepends=True)
    updated = False

    # Update or add each secret
    for secret_name, secret_value in secrets.items():
        if not secret_value:
            print(f"⏭️  Skipped {secret_name} (empty)")
            continue

        # Find and replace existing line
        found = False
        for i, line in enumerate(env_lines):
            if line.startswith(f"{secret_name}="):
                env_lines[i] = f"{secret_name}={secret_value}\n"
                print(f"✏️  Updated {secret_name}")
                found = True
                updated = True
                break

        # Append if not found
        if not found:
            env_lines.append(f"{secret_name}={secret_value}\n")
            print(f"✨ Added {secret_name}")
            updated = True

    # Ensure MAIL_TRANSPORT is set
    has_mail_transport = any(line.startswith("MAIL_TRANSPORT=") for line in env_lines)
    if not has_mail_transport:
        env_lines.append("MAIL_TRANSPORT=graph\n")
        print("✨ Added MAIL_TRANSPORT=graph")
        updated = True

    # Write updated .env
    if updated:
        ENV_FILE.write_text("".join(env_lines), encoding="utf-8")
        print(f"\n✅ Successfully updated {ENV_FILE}")
        return True
    else:
        print(f"\nℹ️  No changes needed")
        return True


if __name__ == "__main__":
    secrets = get_bitwarden_secrets()
    if secrets:
        success = update_env_file(secrets)
        sys.exit(0 if success else 1)
    else:
        sys.exit(1)
