#!/usr/bin/env bash
set -euo pipefail

FILE="${1:?Usage: verify-signature.sh <file> [signature.asc]}"
SIG="${2:-${FILE}.asc}"

if [ ! -f "$FILE" ]; then
  echo "❌ Datei nicht gefunden: $FILE"
  exit 1
fi

if [ ! -f "$SIG" ]; then
  echo "❌ Signatur nicht gefunden: $SIG"
  exit 1
fi

echo "🔍 Verifiziere Signatur..."
echo "📄 Datei: $FILE"
echo "🔏 Signatur: $SIG"
echo ""

if gpg --verify "$SIG" "$FILE"; then
  echo ""
  echo "✅ Signatur gültig!"
  exit 0
else
  echo ""
  echo "❌ Signatur ungültig oder fehlerhaft!"
  exit 1
fi
