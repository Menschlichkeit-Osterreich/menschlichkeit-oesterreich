#!/usr/bin/env python3
"""
Secret-Validierungs-Script fuer .env-Dateien und .env.example-Templates.

Modi:
- env:     prueft echte .env-Dateien inkl. Platzhalter-, Format- und Security-Checks
- template: prueft .env.example-Dateien auf Struktur, Pflichtschluessel und versehentlich
            committed echte Tokens; Platzhalterwerte sind erlaubt
"""

import argparse
import re
import sys
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

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

PATTERNS = {
    "GH_TOKEN": r"^ghp_[A-Za-z0-9]{36}$",
    "FIGMA_API_TOKEN": r"^figd_[A-Za-z0-9_-]{24,}$",
    "FIGMA_FILE_KEY": r"^[A-Za-z0-9]{22}$",
    "DATABASE_URL": r"^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[\w.-]+$",
    "JWT_SECRET": r"^.{32,}$",
    "JWT_SECRET_KEY": r"^.{32,}$",
    "SMTP_HOST": r"^[a-z0-9.-]+\.[a-z]{2,}$",
    "SMTP_USER": r"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$",
    "SMTP_PASSWORD": r"^.{16,}$",
    "STRIPE_API_KEY": r"^sk_(test|live)_[A-Za-z0-9]{24,}$",
    "STRIPE_WEBHOOK_SECRET": r"^whsec_[A-Za-z0-9]{32,}$",
    "SENTRY_DSN": r"^https:\/\/[a-f0-9]+@[^\/]+\.ingest\.sentry\.io\/\d+$",
    "GPG_KEY_ID": r"^[A-F0-9]{16}$",
}

REAL_SECRET_PATTERNS = {
    "GH_TOKEN": PATTERNS["GH_TOKEN"],
    "FIGMA_API_TOKEN": PATTERNS["FIGMA_API_TOKEN"],
    "STRIPE_API_KEY": PATTERNS["STRIPE_API_KEY"],
    "STRIPE_WEBHOOK_SECRET": PATTERNS["STRIPE_WEBHOOK_SECRET"],
    "SENTRY_DSN": PATTERNS["SENTRY_DSN"],
}

PLACEHOLDERS = [
    r"CHANGE",
    r"PLACEHOLDER",
    r"XXX+",
    r"TODO",
    r"REPLACE",
    r"GENERATE",
    r"YOUR_",
    r"EXAMPLE",
]

REQUIRED_GROUPS = [
    ("DATABASE_URL",),
    ("JWT_SECRET", "JWT_SECRET_KEY"),
]

OPTIONAL_VARS = [
    "GH_TOKEN",
    "SENTRY_DSN",
]

SECURITY_RULES = [
    {
        "key": "STRIPE_API_KEY",
        "env": "development",
        "forbidden_pattern": r"^sk_live_",
        "message": "Live Stripe-Key in Development-Umgebung!",
    },
    {
        "key": "DATABASE_URL",
        "env": "development",
        "forbidden_pattern": r"@(prod|production)\.",
        "message": "Production-DB in Development-Umgebung!",
    },
]


def load_env(env_file: Path) -> Dict[str, str]:
    env_vars: Dict[str, str] = {}
    if not env_file.exists():
        return env_vars

    with open(env_file, "r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env_vars[key.strip()] = value.strip().strip('"').strip("'")

    return env_vars


def check_placeholders(value: str) -> Tuple[bool, str]:
    for pattern in PLACEHOLDERS:
        if re.search(pattern, value, re.IGNORECASE):
            return False, f"Platzhalter-Pattern gefunden: {pattern}"
    return True, ""


def validate_format(key: str, value: str) -> Tuple[bool, str]:
    pattern = PATTERNS.get(key)
    if not pattern:
        return True, ""
    if not re.match(pattern, value):
        return False, f"Format ungueltig (erwartet: {pattern})"
    return True, ""


def check_security(key: str, value: str, env: str) -> List[str]:
    warnings: List[str] = []
    for rule in SECURITY_RULES:
        if rule["key"] == key and rule["env"] == env:
            if re.search(rule["forbidden_pattern"], value, re.IGNORECASE):
                warnings.append(rule["message"])
    return warnings


def format_group(group: Iterable[str]) -> str:
    return " / ".join(group)


def validate_required_groups(env_vars: Dict[str, str]) -> List[str]:
    errors: List[str] = []
    for group in REQUIRED_GROUPS:
        if not any(env_vars.get(key) for key in group):
            errors.append(f"Pflicht-Variable fehlt oder leer: {format_group(group)}")
    return errors


def validate_template(env_file: Path, strict: bool = False) -> int:
    if not env_file.exists():
        print(f"{RED}✗ Datei nicht gefunden: {env_file}{RESET}")
        return 2

    print(f"\n{BOLD}🧩 Validiere Template: {env_file}{RESET}\n")
    env_vars = load_env(env_file)
    errors = validate_required_groups(env_vars)
    warnings: List[str] = []

    for key, value in env_vars.items():
        if not value:
            warnings.append(f"{key}: leerer Template-Wert")
            continue
        pattern = REAL_SECRET_PATTERNS.get(key)
        if pattern and re.match(pattern, value):
            errors.append(f"{key}: echter Secret-Wert in Template erkannt")

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

    if warnings and strict:
        print(
            f"{YELLOW}{BOLD}⚠️  Template-Validierung mit Warnungen "
            f"(Strict-Mode, aber nicht blockierend fuer Templates){RESET}\n"
        )
        return 0

    print(f"{GREEN}{BOLD}✅ Template-Validierung erfolgreich!{RESET}\n")
    return 0


def validate_env(env_file: Path, strict: bool = False, env: str = "development") -> int:
    if not env_file.exists():
        print(f"{RED}✗ Datei nicht gefunden: {env_file}{RESET}")
        return 2

    print(f"\n{BOLD}🔍 Validiere Secrets: {env_file}{RESET}")
    print(f"Umgebung: {env}\n")

    env_vars = load_env(env_file)
    errors = validate_required_groups(env_vars)
    warnings: List[str] = []
    success: List[str] = []

    for group in REQUIRED_GROUPS:
        if any(env_vars.get(key) for key in group):
            success.append(f"{format_group(group)}: vorhanden")

    for var in OPTIONAL_VARS:
        if var not in env_vars or not env_vars[var]:
            warnings.append(f"{var}: Optional, aber empfohlen")

    for key, value in env_vars.items():
        if not value:
            continue

        ok, msg = check_placeholders(value)
        if not ok:
            errors.append(f"{key}: {msg}")
            continue

        ok, msg = validate_format(key, value)
        if not ok:
            errors.append(f"{key}: {msg}")
            continue

        warnings.extend([f"{key}: {w}" for w in check_security(key, value, env)])

    if success:
        print(f"{GREEN}✓ Erfolgreiche Checks ({len(success)}):{RESET}")
        for item in success[:5]:
            print(f"  {GREEN}✓{RESET} {item}")
        if len(success) > 5:
            print(f"  ... und {len(success) - 5} weitere")
        print()

    if warnings:
        print(f"{YELLOW}⚠ Warnungen ({len(warnings)}):{RESET}")
        for warning in warnings:
            print(f"  {YELLOW}⚠{RESET} {warning}")
        print()

    if errors:
        print(f"{RED}✗ Fehler ({len(errors)}):{RESET}")
        for error in errors:
            print(f"  {RED}✗{RESET} {error}")
        print(f"\n{RED}{BOLD}❌ Validierung fehlgeschlagen!{RESET}\n")
        return 2

    if warnings and strict:
        print(f"{YELLOW}{BOLD}⚠️  Validierung mit Warnungen (Strict-Mode){RESET}\n")
        return 1

    print(f"{GREEN}{BOLD}✅ Validierung erfolgreich!{RESET}\n")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Validiert .env-Secrets und Templates")
    parser.add_argument("--strict", action="store_true", help="Exit mit Fehler bei Warnungen")
    parser.add_argument(
        "--env",
        default="development",
        choices=["development", "staging", "production"],
        help="Umgebung fuer Security-Checks",
    )
    parser.add_argument("--file", default=".env", help="Pfad zur Eingabedatei")
    parser.add_argument(
        "--mode",
        default="env",
        choices=["env", "template"],
        help="Validierungsmodus: echte .env oder .env.example Template",
    )
    args = parser.parse_args()

    env_file = Path(args.file)
    if args.mode == "template":
        exit_code = validate_template(env_file, strict=args.strict)
    else:
        exit_code = validate_env(env_file, strict=args.strict, env=args.env)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
