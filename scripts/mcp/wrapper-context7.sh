#!/usr/bin/env bash
set -euo pipefail
# Placeholder context7: grep for symbol/library name in workspace
QUERY="${1:-}"; [[ -z "$QUERY" ]] && { echo "Usage: wrapper-context7.sh <query>" >&2; exit 1; }
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
echo "[context7] Suche nach: $QUERY" >&2
grep -RIn --exclude-dir=.git "$QUERY" "$ROOT" | head -n 50 || true