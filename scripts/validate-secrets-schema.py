#!/usr/bin/env python3
"""
Schema-basierter Secret-Validator
Liest secrets-audit.schema.yaml und validiert .env-Datei gegen definierte Regeln

Verwendung:
    python validate-secrets-schema.py
    python validate-secrets-schema.py --schema secrets/secrets-audit.schema.yaml --env .env
    python validate-secrets-schema.py --strict  # Exit 1 bei Warnings

Exit Codes:
    0 = Alle Checks bestanden
    1 = Warnings gefunden (nur mit --strict)
    2 = Errors gefunden
"""

import sys
import re
import argparse
import yaml
from pathlib import Path

# ANSI-Farben
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
RESET = '\033[0m'

def load_schema(schema_path: str) -> dict:
    """Lädt YAML-Schema"""
    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"{RED}✗ Fehler beim Laden des Schemas: {e}{RESET}")
        sys.exit(2)

def load_env_file(filepath: str) -> dict:
    """Lädt .env-Datei"""
    env_vars = {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' not in line:
                    print(f"{YELLOW}⚠ Zeile {line_num}: Ungültiges Format (kein '='): {line}{RESET}")
                    continue
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    except FileNotFoundError:
        print(f"{RED}✗ Datei nicht gefunden: {filepath}{RESET}")
        sys.exit(2)
    return env_vars

def check_placeholders(value: str, patterns: list) -> bool:
    """Prüft auf Platzhalter-Patterns aus Schema"""
    for pattern in patterns:
        if re.search(pattern, value, re.IGNORECASE):
            return True
    return False

def validate_against_schema(env_vars: dict, schema: dict, env_type: str) -> tuple:
    """Validiert .env gegen Schema"""
    errors = []
    warnings = []
    success = []
    
    categories = schema.get('categories', {})
    placeholder_patterns = schema.get('placeholder_patterns', [])
    security_rules = schema.get('security_rules', [])
    
    # 1. Required Secrets prüfen
    for category_name, category in categories.items():
        if not category.get('required', False):
            continue
        
        for secret in category.get('secrets', []):
            key = secret['key']
            
            if secret['validation']['required']:
                if key in env_vars:
                    success.append(f"✓ {key}: Vorhanden (Kategorie: {category['label']})")
                else:
                    errors.append(f"✗ {key}: Fehlt (Pflicht-Variable in {category['label']})")
    
    # 2. Format & Platzhalter prüfen
    for key, value in env_vars.items():
        # Finde Secret in Schema
        secret_def = None
        for category in categories.values():
            for secret in category.get('secrets', []):
                if secret['key'] == key:
                    secret_def = secret
                    break
            if secret_def:
                break
        
        if not secret_def:
            warnings.append(f"⚠ {key}: Nicht im Schema definiert")
            continue
        
        # Platzhalter prüfen
        if check_placeholders(value, placeholder_patterns):
            errors.append(f"✗ {key}: Enthält Platzhalter-Pattern")
        
        # Format prüfen
        pattern = secret_def.get('pattern')
        if pattern and not re.match(pattern, value, re.DOTALL):
            errors.append(
                f"✗ {key}: Ungültiges Format\n"
                f"   Erwartet: {secret_def['validation']['format']}\n"
                f"   Pattern: {pattern}"
            )
    
    # 3. Security Rules prüfen
    for rule in security_rules:
        rule_name = rule['rule']
        
        if rule_name == 'no_prod_keys_in_dev' and env_type == 'development':
            for key, value in env_vars.items():
                if '_PROD_' in key.upper() or '_LIVE_' in key.upper():
                    errors.append(f"✗ Security: {key} enthält _PROD_/_LIVE_ in development")
        
        elif rule_name == 'no_prod_db_in_dev' and env_type == 'development':
            db_url = env_vars.get('DATABASE_URL', '')
            if any(prod_host in db_url.lower() for prod_host in ['prod', 'production', 'live']):
                errors.append(f"✗ Security: DATABASE_URL zeigt auf Produktions-Host")
        
        elif rule_name == 'min_secret_length':
            for key in ['JWT_SECRET', 'DB_PASS']:
                if key in env_vars and len(env_vars[key]) < 32:
                    warnings.append(f"⚠ {key}: Weniger als 32 Zeichen (empfohlen: min. 32)")
    
    return success, warnings, errors

def main():
    parser = argparse.ArgumentParser(description='Schema-basierter Secret-Validator')
    parser.add_argument('--schema', default='secrets/secrets-audit.schema.yaml', help='Pfad zum Schema')
    parser.add_argument('--env', default='.env', help='Pfad zur .env-Datei')
    parser.add_argument('--env-type', default='development', choices=['development', 'staging', 'production'])
    parser.add_argument('--strict', action='store_true', help='Exit 1 bei Warnings')
    args = parser.parse_args()
    
    print(f"🔍 Schema-basierte Secret-Validierung")
    print(f"Schema: {args.schema}")
    print(f"Datei: {args.env}")
    print(f"Umgebung: {args.env_type}\n")
    
    # Schema laden
    schema = load_schema(args.schema)
    
    # .env laden
    env_vars = load_env_file(args.env)
    
    # Validierung
    success, warnings, errors = validate_against_schema(env_vars, schema, args.env_type)
    
    # Ausgabe
    if success:
        print(f"{GREEN}✓ Erfolgreiche Checks ({len(success)}):{RESET}")
        for msg in success[:10]:  # Max 10 anzeigen
            print(f"  {msg}")
        if len(success) > 10:
            print(f"  ... und {len(success) - 10} weitere")
        print()
    
    if warnings:
        print(f"{YELLOW}⚠ Warnings ({len(warnings)}):{RESET}")
        for msg in warnings:
            print(f"  {msg}")
        print()
    
    if errors:
        print(f"{RED}✗ Fehler ({len(errors)}):{RESET}")
        for msg in errors:
            print(f"  {msg}")
        print()
    
    # Exit Code
    if errors:
        print(f"{RED}❌ Validierung fehlgeschlagen!{RESET}")
        sys.exit(2)
    elif warnings and args.strict:
        print(f"{YELLOW}⚠ Warnings gefunden (strict mode)!{RESET}")
        sys.exit(1)
    else:
        print(f"{GREEN}✅ Alle Checks bestanden!{RESET}")
        sys.exit(0)

if __name__ == '__main__':
    main()
