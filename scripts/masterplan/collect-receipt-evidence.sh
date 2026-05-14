#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

if ! [ -f "$ROOT_DIR/reports/masterplan/donation-e2e-evidence.md" ]; then
  echo "Donation-Evidence fehlt." >&2
  exit 1
fi

if ! [ -f "$ROOT_DIR/reports/masterplan/evidence-log.md" ]; then
  echo "Evidence-Log fehlt." >&2
  exit 1
fi

echo "Receipt-Evidence gesammelt."
