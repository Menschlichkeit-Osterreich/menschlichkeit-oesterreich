#!/usr/bin/env python3
"""
Secret-Validierungs-Script für .env-Dateien

Prüft:
- Vorhandensein aller Pflicht-Variablen
- Keine Platzhalter-Werte (CHANGE, XXX, TODO, PLACEHOLDER)
- Format-Validierung (Regex-Patterns)
- Sicherheits-Checks (keine Production-Keys in Development)

Usage:
    python scripts/validate-secrets.py
    python scripts/validate-secrets.py --strict  # Exits with error code
    python scripts/validate-secrets.py --env staging
"""

import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# ANSI-Farbcodes
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"

# Validierungs-Patterns
PATTERNS = {
    "GH_TOKEN": r"^ghp_[A-Za-z0-9]{36}$",
    "FIGMA_API_TOKEN": r"^figd_[A-Za-z0-9_-]{24,}$",
    "FIGMA_FILE_KEY": r"^[A-Za-z0-9]{22}$",
    "DATABASE_URL": r"^postgresql:\/\/[^:]+:[^@]+@[^:]+:\d+\/\w+$",
    "JWT_SECRET": r"^.{32,}$",
    "SMTP_HOST": r"^[a-z0-9.-]+\.[a-z]{2,}$",
    "SMTP_USER": r"^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$",
    "SMTP_PASSWORD": r"^.{16,}$",
    "STRIPE_API_KEY": r"^sk_(test|live)_[A-Za-z0-9]{24,}$",
    "STRIPE_WEBHOOK_SECRET": r"^whsec_[A-Za-z0-9]{32,}$",
    "SENTRY_DSN": r"^https:\/\/[a-f0-9]+@[^\/]+\.ingest\.sentry\.io\/\d+$",
    "GPG_KEY_ID": r"^[A-F0-9]{16}$",
}

# Platzhalter-Patterns (immer invalid)
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

# Pflicht-Variablen (müssen gesetzt sein)
REQUIRED_VARS = [
    "DATABASE_URL",
    "JWT_SECRET",
]

# Optionale Variablen (mit Warnung wenn leer)
OPTIONAL_VARS = [
    "GH_TOKEN",
    "FIGMA_API_TOKEN",
    "SENTRY_DSN",
]

# Security-Checks
SECURITY_RULES = [
    {
        "key": "STRIPE_API_KEY",
        "env": "development",
        "forbidden_pattern": r"^sk_live_",
        "message": "⚠️  Live Stripe-Key in Development-Umgebung!"
    },
    {
        "key": "DATABASE_URL",
        "env": "development",
        "forbidden_pattern": r"@(prod|production)\.",
        "message": "⚠️  Production-DB in Development-Umgebung!"
    },
]


def load_env(env_file: Path = Path(".env")) -> Dict[str, str]:
    """Lädt .env-Datei und parst Key-Value-Paare."""
    env_vars = {}
    if not env_file.exists():
        return env_vars
    
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip().strip('"').strip("'")
    
    return env_vars


def check_placeholders(value: str) -> Tuple[bool, str]:
    """Prüft ob Wert ein Platzhalter ist."""
    for pattern in PLACEHOLDERS:
        if re.search(pattern, value, re.IGNORECASE):
            return False, f"Platzhalter-Pattern gefunden: {pattern}"
    return True, ""


def validate_format(key: str, value: str) -> Tuple[bool, str]:
    """Validiert Wert gegen Regex-Pattern."""
    if key not in PATTERNS:
        return True, ""  # Kein Pattern definiert = OK
    
    pattern = PATTERNS[key]
    if not re.match(pattern, value):
        return False, f"Format ungültig (erwartet: {pattern})"
    return True, ""


def check_security(key: str, value: str, env: str) -> List[str]:
    """Prüft Security-Regeln (z.B. keine Prod-Keys in Dev)."""
    warnings = []
    for rule in SECURITY_RULES:
        if rule["key"] == key and rule["env"] == env:
            if re.search(rule["forbidden_pattern"], value, re.IGNORECASE):
                warnings.append(rule["message"])
    return warnings


def validate_env(env_file: Path = Path(".env"), strict: bool = False, env: str = "development") -> int:
    """
    Hauptvalidierung.
    
    Returns:
        0 = Alles OK
        1 = Warnungen gefunden
        2 = Kritische Fehler
    """
    if not env_file.exists():
        print(f"{RED}✗ Datei nicht gefunden: {env_file}{RESET}")
        return 2
    
    print(f"\n{BOLD}🔍 Validiere Secrets: {env_file}{RESET}")
    print(f"Umgebung: {env}\n")
    
    env_vars = load_env(env_file)
    errors = []
    warnings = []
    success = []
    
    # 1. Pflicht-Variablen prüfen
    for var in REQUIRED_VARS:
        if var not in env_vars or not env_vars[var]:
            errors.append(f"{var}: Pflicht-Variable fehlt oder leer")
        else:
            success.append(f"{var}: Vorhanden")
    
    # 2. Optionale Variablen (nur Warnung)
    for var in OPTIONAL_VARS:
        if var not in env_vars or not env_vars[var]:
            warnings.append(f"{var}: Optional, aber empfohlen")
    
    # 3. Alle gesetzten Variablen validieren
    for key, value in env_vars.items():
        if not value:
            continue  # Leere Werte wurden oben geprüft
        
        # Platzhalter-Check
        ok, msg = check_placeholders(value)
        if not ok:
            errors.append(f"{key}: {msg}")
            continue
        
        # Format-Check
        ok, msg = validate_format(key, value)
        if not ok:
            errors.append(f"{key}: {msg}")
            continue
        
        # Security-Check
        security_warnings = check_security(key, value, env)
        warnings.extend([f"{key}: {w}" for w in security_warnings])
    
    # Ergebnisse ausgeben
    if success:
        print(f"{GREEN}✓ Erfolgreiche Checks ({len(success)}):{RESET}")
        for s in success[:5]:  # Max 5 anzeigen
            print(f"  {GREEN}✓{RESET} {s}")
        if len(success) > 5:
            print(f"  ... und {len(success) - 5} weitere\n")
        else:
            print()
    
    if warnings:
        print(f"{YELLOW}⚠ Warnungen ({len(warnings)}):{RESET}")
        for w in warnings:
            print(f"  {YELLOW}⚠{RESET} {w}")
        print()
    
    if errors:
        print(f"{RED}✗ Fehler ({len(errors)}):{RESET}")
        for e in errors:
            print(f"  {RED}✗{RESET} {e}")
        print()
    
    # Exit-Code ermitteln
    if errors:
        print(f"{RED}{BOLD}❌ Validierung fehlgeschlagen!{RESET}\n")
        return 2
    elif warnings and strict:
        print(f"{YELLOW}{BOLD}⚠️  Validierung mit Warnungen (Strict-Mode){RESET}\n")
        return 1
    else:
        print(f"{GREEN}{BOLD}✅ Validierung erfolgreich!{RESET}\n")
        return 0


def main():
    """CLI-Einstiegspunkt."""
    import argparse
    parser = argparse.ArgumentParser(description="Validiert .env-Secrets")
    parser.add_argument("--strict", action="store_true", 
                        help="Exit mit Fehler bei Warnungen")
    parser.add_argument("--env", default="development",
                        choices=["development", "staging", "production"],
                        help="Umgebung für Security-Checks")
    parser.add_argument("--file", default=".env",
                        help="Pfad zur .env-Datei")
    args = parser.parse_args()
    
    env_file = Path(args.file)
    exit_code = validate_env(env_file, strict=args.strict, env=args.env)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
