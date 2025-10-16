#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Setze Ausführungsrechte für Deploy-/DB-Skripte im Git-Index..."
git -C "$ROOT_DIR" update-index --chmod=+x scripts/plesk-sync.sh || true
git -C "$ROOT_DIR" update-index --chmod=+x scripts/db-pull.sh || true
git -C "$ROOT_DIR" update-index --chmod=+x scripts/db-push.sh || true

echo "Fertig. Bitte committen/pushen falls Änderungen im Index vorgenommen wurden."
