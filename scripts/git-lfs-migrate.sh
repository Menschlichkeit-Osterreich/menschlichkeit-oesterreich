#!/usr/bin/env bash
set -euo pipefail

INCLUDE_PATTERNS="*.pdf,*.jar,*.phar,*.zip,*.7z,*.png,*.jpg,*.jpeg"

if ! command -v git-lfs >/dev/null 2>&1; then
  echo "[!] git-lfs ist nicht installiert. Bitte zuerst installieren." >&2
  exit 1
fi

if git status --short | grep -qE '^(\?\?| M|MM)'; then
  echo "[!] Arbeitsverzeichnis ist nicht sauber. Bitte committen oder stashen." >&2
  exit 1
fi

echo "[+] Git LFS initialisieren"
git lfs install --skip-smudge

echo "[+] Git LFS Migration für Muster: $INCLUDE_PATTERNS"
git lfs migrate import --yes --include="$INCLUDE_PATTERNS" --fixup HEAD

echo "[+] Abschluss"
git status
