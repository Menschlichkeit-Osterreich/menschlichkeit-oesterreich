#!/usr/bin/env bash
set -euo pipefail

EMAIL="${1:-peter.schuller@menschlichkeit-oesterreich.at}"
STAMP="$(date +%Y-%m)"
DEST="${HOME}/GPG-Backups/${STAMP}"
mkdir -p "${DEST}"

FP=$(gpg --list-keys --with-colons "$EMAIL" | awk -F: '/^fpr:/ {print $10; exit}')

echo "📂 Exportiere GPG-Keys für: $EMAIL"
echo "📁 Zielverzeichnis: $DEST"

gpg --export -a "$EMAIL" > "${DEST}/public.asc"
echo "✅ Public Key: ${DEST}/public.asc"

gpg --export-secret-subkeys -a "$EMAIL" > "${DEST}/secret-subkeys.asc"
echo "✅ Secret Subkeys: ${DEST}/secret-subkeys.asc"

gpg --export-secret-keys -a "$EMAIL" > "${DEST}/secret-full.asc"
echo "⚠️  Full Secret Key: ${DEST}/secret-full.asc (OFFLINE aufbewahren!)"

gpg --export-ownertrust > "${DEST}/ownertrust.txt"
echo "✅ Ownertrust: ${DEST}/ownertrust.txt"

if [ ! -f "${DEST}/revoke.asc" ]; then
  echo "🔑 Generiere Revocation Certificate..."
  gpg --output "${DEST}/revoke.asc" --gen-revoke "$FP"
  echo "✅ Revocation: ${DEST}/revoke.asc"
else
  echo "ℹ️  Revocation existiert bereits: ${DEST}/revoke.asc"
fi

echo ""
echo "✅ Export abgeschlossen!"
echo "📋 Fingerprint: $FP"
echo "📂 Backup-Verzeichnis: $DEST"
