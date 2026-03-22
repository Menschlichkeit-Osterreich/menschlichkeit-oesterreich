#!/usr/bin/env python3
"""
Validate environment templates and env files for the Menschlichkeit workspace.

Modes:
- env:      validate a concrete env file using its template profile
- template: validate a single template file
- suite:    validate the full tracked template set and cross-file boundaries
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:
    pass

GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"

PLACEHOLDER_PATTERNS = [
    r"^CHANGE_ME",
    r"PLACEHOLDER",
    r"GENERATE",
    r"YOUR_",
    r"EXAMPLE",
]

REAL_SECRET_PATTERNS = {
    "GH_TOKEN": r"^(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,})$",
    "OC_GITHUB_TOKEN": r"^(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,})$",
    "OC_OPENAI_API_KEY": r"^sk-[A-Za-z0-9]{20,}$",
    "JWT_SECRET_KEY": r"^.{32,}$",
    "MOE_API_TOKEN": r"^.{20,}$",
    "N8N_WEBHOOK_SECRET": r"^.{20,}$",
    "N8N_ENCRYPTION_KEY": r"^.{20,}$",
    "STRIPE_SECRET_KEY": r"^sk_(test|live)_[A-Za-z0-9]{16,}$",
    "STRIPE_WEBHOOK_SECRET": r"^whsec_[A-Za-z0-9]{16,}$",
    "MAIL_PASSWORD": r"^.{12,}$",
    "PAYPAL_CLIENT_SECRET": r"^.{12,}$",
}

FORMAT_PATTERNS = {
    "DATABASE_URL": r"^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[\w.-]+$",
    "GH_TOKEN": REAL_SECRET_PATTERNS["GH_TOKEN"],
    "GPG_KEY_ID": r"^CHANGE_ME_GPG_KEY_ID$|^[A-F0-9]{16,40}$",
    "JWT_SECRET_KEY": r"^.{32,}$",
    "MOE_API_TOKEN": r"^.{20,}$",
    "N8N_WEBHOOK_SECRET": r"^.{20,}$",
    "N8N_ENCRYPTION_KEY": r"^.{20,}$",
    "MAIL_HOST": r"^[a-z0-9.-]+\.[a-z]{2,}$",
    "MAIL_USERNAME": r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
    "SMTP_HOST": r"^[a-z0-9.-]+\.[a-z]{2,}$",
    "SMTP_USER": r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
    "VITE_API_URL": r"^https?:\/\/.+\/api$",
    "VITE_API_BASE_URL": r"^https?:\/\/.+$",
    "VITE_CIVICRM_BASE_URL": r"^https?:\/\/.+$",
    "VITE_CIVICRM_API_ENDPOINT": r"^\/.+$",
    "VITE_OPENCLAW_BRIDGE_URL": r"^https?:\/\/.+$",
    "STRIPE_SECRET_KEY": r"^(sk_test_PLACEHOLDER|sk_live_PLACEHOLDER|sk_(test|live)_[A-Za-z0-9]{16,})$",
    "STRIPE_WEBHOOK_SECRET": r"^(whsec_PLACEHOLDER|whsec_[A-Za-z0-9]{16,})$",
    "VITE_STRIPE_PUBLISHABLE_KEY": r"^(pk_test_PLACEHOLDER|pk_live_PLACEHOLDER|pk_(test|live)_[A-Za-z0-9]{16,})$",
}


@dataclass
class TemplateProfile:
    path: str
    required_keys: set[str]
    optional_keys: set[str] = field(default_factory=set)
    forbidden_keys: set[str] = field(default_factory=set)
    forbidden_prefixes: tuple[str, ...] = ()
    description: str = ""


PROFILES: dict[str, TemplateProfile] = {
    ".env.example": TemplateProfile(
        path=".env.example",
        description="root workspace template",
        required_keys={
            "GH_TOKEN",
            "GPG_KEY_ID",
            "PLESK_HOST",
            "PLESK_REMOTE_PATH",
            "LOCAL_WEBROOT",
            "SSH_AUTH_MODE",
            "SSH_KEY_NAME",
            "SSH_PORT",
            "OC_ENV",
            "OC_NATS_URL",
            "OC_REDIS_URL",
            "OC_PG_DSN",
            "OC_QDRANT_URL",
            "OC_TOOL_GATEWAY_URL",
            "OC_AGENT_RUNTIME_URL",
            "OC_OPENAI_API_KEY",
            "OC_GITHUB_TOKEN",
            "OC_DEFAULT_MODEL",
            "OC_FALLBACK_MODEL",
            "OC_MAX_TOOL_CALLS",
            "OC_MAX_MINUTES",
            "OC_MAX_COST_EUR",
            "OC_WORKSPACE_ROOT",
        },
        forbidden_keys={
            "DATABASE_URL",
            "JWT_SECRET",
            "JWT_SECRET_KEY",
            "N8N_USER",
            "N8N_PASSWORD",
            "N8N_ENCRYPTION_KEY",
            "MOE_API_TOKEN",
        },
        forbidden_prefixes=("VITE_", "TEST_", "MAIL_", "EMAIL_", "STRIPE_", "PAYPAL_"),
    ),
    ".env.production.template": TemplateProfile(
        path=".env.production.template",
        description="root deployment template",
        required_keys={
            "ENVIRONMENT",
            "NODE_ENV",
            "MAIN_DOMAIN",
            "MAIN_SITE_URL",
            "API_BASE_URL",
            "GAMES_BASE_URL",
            "PLESK_HOST",
            "PLESK_REMOTE_PATH",
            "LOCAL_WEBROOT",
            "SSH_AUTH_MODE",
            "SSH_KEY_NAME",
            "SSH_PORT",
            "DEPLOY_STRATEGY",
            "GPG_KEY_ID",
            "GH_TOKEN",
            "OC_ENV",
            "OC_TOOL_GATEWAY_URL",
            "OC_AGENT_RUNTIME_URL",
            "OC_WORKSPACE_ROOT",
        },
        forbidden_keys={
            "APP_ENV",
            "DATABASE_URL",
            "JWT_SECRET",
            "JWT_SECRET_KEY",
            "N8N_USER",
            "N8N_PASSWORD",
            "N8N_ENCRYPTION_KEY",
        },
        forbidden_prefixes=("VITE_", "TEST_", "MAIL_", "EMAIL_", "STRIPE_", "PAYPAL_"),
    ),
    "apps/api/.env.example": TemplateProfile(
        path="apps/api/.env.example",
        description="api template",
        required_keys={
            "ENVIRONMENT",
            "DATABASE_URL",
            "JWT_SECRET_KEY",
            "JWT_ALGORITHM",
            "ADMIN_EMAILS",
            "RATE_LIMIT_REQUESTS",
            "RATE_LIMIT_WINDOW_SECONDS",
            "PUBLIC_APP_URL",
            "CIVICRM_BASE_URL",
            "CIVICRM_SITE_KEY",
            "CIVICRM_API_KEY",
            "MAIL_HOST",
            "MAIL_PORT",
            "MAIL_ENCRYPTION",
            "MAIL_USERNAME",
            "MAIL_PASSWORD",
            "MAIL_FROM_ADDRESS",
            "MAIL_FROM_NAME",
            "MAIL_REPLY_TO_ADDRESS",
            "EMAIL_OFFICE",
            "EMAIL_INFO",
            "EMAIL_ADMIN",
            "MOE_API_TOKEN",
            "N8N_WEBHOOK_SECRET",
            "N8N_WEBHOOK_URL",
            "N8N_WEBHOOK_BASE_URL",
            "STRIPE_SECRET_KEY",
            "STRIPE_WEBHOOK_SECRET",
            "PAYPAL_CLIENT_ID",
            "PAYPAL_CLIENT_SECRET",
            "PAYPAL_BASE_URL",
            "SEPA_CREDITOR_NAME",
            "SEPA_CREDITOR_ID",
            "SEPA_CREDITOR_IBAN",
            "SEPA_CREDITOR_BIC",
        },
        forbidden_keys={"APP_ENV", "JWT_SECRET", "INTERNAL_API_TOKEN", "INTERNAL_API_SECRET"},
        forbidden_prefixes=("VITE_", "TEST_"),
    ),
    "apps/website/.env.example": TemplateProfile(
        path="apps/website/.env.example",
        description="website template",
        required_keys={
            "VITE_API_URL",
            "VITE_API_BASE_URL",
            "VITE_API_TIMEOUT_MS",
            "VITE_CIVICRM_BASE_URL",
            "VITE_CIVICRM_API_ENDPOINT",
            "VITE_STRIPE_PUBLISHABLE_KEY",
            "VITE_PAYPAL_CLIENT_ID",
            "VITE_OPENCLAW_BRIDGE_URL",
        },
        forbidden_keys={"JWT_SECRET", "JWT_SECRET_KEY", "DATABASE_URL", "N8N_USER"},
    ),
    "automation/n8n/.env.example": TemplateProfile(
        path="automation/n8n/.env.example",
        description="n8n template",
        required_keys={
            "N8N_USER",
            "N8N_PASSWORD",
            "N8N_ENCRYPTION_KEY",
            "N8N_WEBHOOK_SECRET",
            "N8N_DOMAIN",
            "N8N_HOST",
            "N8N_PORT",
            "ACME_EMAIL",
            "N8N_DB_PASSWORD",
            "REDIS_PASSWORD",
            "MOE_API_URL",
            "API_BASE_URL",
            "MOE_API_TOKEN",
            "MOE_CRM_URL",
            "MOE_FRONTEND_URL",
            "MOE_GAMES_URL",
            "PLESK_HOST",
            "PLESK_USER",
            "PLESK_SSH_PORT",
            "GITHUB_REPO",
            "GITHUB_OWNER",
            "SMTP_HOST",
            "SMTP_PORT",
            "SMTP_USER",
            "SMTP_PASS",
            "TZ",
        },
        optional_keys={"QUEUE_ALERT_SLACK_WEBHOOK"},
        forbidden_keys={"JWT_SECRET", "JWT_SECRET_KEY", "DATABASE_URL"},
        forbidden_prefixes=("VITE_", "TEST_"),
    ),
    ".env.test.example": TemplateProfile(
        path=".env.test.example",
        description="test credentials template",
        required_keys={
            "DATABASE_URL",
            "ENVIRONMENT",
            "JWT_SECRET_KEY",
            "PUBLIC_APP_URL",
            "VITE_API_URL",
            "VITE_API_BASE_URL",
            "TEST_SYSADMIN_EMAIL",
            "TEST_SYSADMIN_PASSWORD",
            "TEST_ADMIN_EMAIL",
            "TEST_ADMIN_PASSWORD",
            "TEST_VORSTAND_EMAIL",
            "TEST_VORSTAND_PASSWORD",
            "TEST_MODERATOR_EMAIL",
            "TEST_MODERATOR_PASSWORD",
            "TEST_MITGLIED_EMAIL",
            "TEST_MITGLIED_PASSWORD",
            "TEST_FOERDERMITGLIED_EMAIL",
            "TEST_FOERDERMITGLIED_PASSWORD",
            "TEST_INAKTIV_EMAIL",
            "TEST_INAKTIV_PASSWORD",
        },
        forbidden_keys={"APP_ENV", "JWT_SECRET"},
        forbidden_prefixes=("MAIL_", "EMAIL_", "N8N_", "OC_"),
    ),
}

KNOWN_TEMPLATES = tuple(PROFILES.keys())


def load_env(path: Path) -> dict[str, str]:
    env_vars: dict[str, str] = {}
    with path.open("r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env_vars[key.strip()] = value.strip().strip('"').strip("'")
    return env_vars


def infer_profile(path: Path) -> TemplateProfile | None:
    try:
        rel = path.resolve().relative_to(Path.cwd().resolve()).as_posix()
    except ValueError:
        rel = path.as_posix()

    if rel in PROFILES:
        return PROFILES[rel]
    if path.name == ".env":
        candidate = path.parent / ".env.example"
        try:
            rel_candidate = candidate.resolve().relative_to(Path.cwd().resolve()).as_posix()
        except ValueError:
            rel_candidate = candidate.as_posix()
        return PROFILES.get(rel_candidate)
    return PROFILES.get(path.name)


def is_placeholder(value: str) -> bool:
    return any(re.search(pattern, value, re.IGNORECASE) for pattern in PLACEHOLDER_PATTERNS)


def validate_common(
    profile: TemplateProfile,
    env_vars: dict[str, str],
    *,
    template_mode: bool,
) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    missing = sorted(key for key in profile.required_keys if key not in env_vars)
    for key in missing:
        errors.append(f"Pflichtschluessel fehlt: {key}")

    for key in sorted(profile.forbidden_keys):
        if key in env_vars:
            errors.append(f"Veralteter oder verbotener Schluessel vorhanden: {key}")

    for key in sorted(env_vars):
        value = env_vars[key]
        if any(key.startswith(prefix) for prefix in profile.forbidden_prefixes):
            errors.append(f"Schluessel liegt ausserhalb des Dateiscope: {key}")
            continue

        if not value:
            if key in profile.optional_keys:
                continue
            warnings.append(f"{key}: leerer Wert")
            continue

        if template_mode:
            pattern = REAL_SECRET_PATTERNS.get(key)
            if pattern and not is_placeholder(value) and re.match(pattern, value):
                errors.append(f"{key}: echter Secret-Wert in Template erkannt")
        else:
            if is_placeholder(value):
                errors.append(f"{key}: Platzhalterwert in echter .env erkannt")

        fmt = FORMAT_PATTERNS.get(key)
        if fmt and not is_placeholder(value) and not re.match(fmt, value):
            errors.append(f"{key}: Format ungueltig")

    return errors, warnings


def validate_template(path: Path) -> int:
    if not path.exists():
        print(f"{RED}✗ Datei nicht gefunden: {path}{RESET}")
        return 2

    profile = infer_profile(path)
    if not profile:
        print(f"{RED}✗ Kein Template-Profil fuer {path} bekannt.{RESET}")
        return 2

    print(f"\n{BOLD}🧩 Validiere Template: {profile.description} ({path}){RESET}\n")
    env_vars = load_env(path)
    errors, warnings = validate_common(profile, env_vars, template_mode=True)

    if warnings:
        print(f"{YELLOW}⚠ Warnungen ({len(warnings)}):{RESET}")
        for warning in warnings:
            print(f"  {YELLOW}⚠{RESET} {warning}")
        print()

    if errors:
        print(f"{RED}✗ Fehler ({len(errors)}):{RESET}")
        for error in errors:
            print(f"  {RED}✗{RESET} {error}")
        print(f"\n{RED}{BOLD}❌ Template-Validierung fehlgeschlagen!{RESET}\n")
        return 2

    print(f"{GREEN}{BOLD}✅ Template-Validierung erfolgreich!{RESET}\n")
    return 0


def validate_env(path: Path) -> int:
    if not path.exists():
        print(f"{RED}✗ Datei nicht gefunden: {path}{RESET}")
        return 2

    profile = infer_profile(path)
    if not profile:
        print(f"{RED}✗ Kein Env-Profil fuer {path} bekannt.{RESET}")
        return 2

    print(f"\n{BOLD}🔍 Validiere Env-Datei: {profile.description} ({path}){RESET}\n")
    env_vars = load_env(path)
    errors, warnings = validate_common(profile, env_vars, template_mode=False)

    if warnings:
        print(f"{YELLOW}⚠ Warnungen ({len(warnings)}):{RESET}")
        for warning in warnings:
            print(f"  {YELLOW}⚠{RESET} {warning}")
        print()

    if errors:
        print(f"{RED}✗ Fehler ({len(errors)}):{RESET}")
        for error in errors:
            print(f"  {RED}✗{RESET} {error}")
        print(f"\n{RED}{BOLD}❌ Env-Validierung fehlgeschlagen!{RESET}\n")
        return 2

    print(f"{GREEN}{BOLD}✅ Env-Validierung erfolgreich!{RESET}\n")
    return 0


def validate_suite() -> int:
    print(f"\n{BOLD}📚 Validiere Template-Suite{RESET}\n")
    exit_code = 0
    for rel_path in KNOWN_TEMPLATES:
        rc = validate_template(Path(rel_path))
        exit_code = max(exit_code, rc)

    return exit_code


def main() -> None:
    parser = argparse.ArgumentParser(description="Validiert .env Dateien und Templates")
    parser.add_argument("--file", default=".env", help="Pfad zur Eingabedatei")
    parser.add_argument(
        "--mode",
        default="env",
        choices=["env", "template", "suite"],
        help="Validierungsmodus",
    )
    args = parser.parse_args()

    path = Path(args.file)

    if args.mode == "template":
        sys.exit(validate_template(path))
    if args.mode == "suite":
        sys.exit(validate_suite())
    sys.exit(validate_env(path))


if __name__ == "__main__":
    main()
