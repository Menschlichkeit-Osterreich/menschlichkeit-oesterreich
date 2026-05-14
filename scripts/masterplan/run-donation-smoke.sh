#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
CONFIG="$ROOT_DIR/config-templates/donation-gate-config.json"
EVIDENCE="$ROOT_DIR/reports/masterplan/donation-e2e-evidence.md"
LOG="$ROOT_DIR/reports/masterplan/evidence-log.md"

for path in "$CONFIG" "$EVIDENCE" "$LOG"; do
  if ! [ -f "$path" ]; then
    echo "Fehlende Donation-Datei: $path" >&2
    exit 1
  fi
done

grep -Fq '"receipt_eligibility_rules"' "$CONFIG"
grep -Fq 'Donation-End-to-End-Test: PASS' "$EVIDENCE"

echo "Donation-Smoke: PASS"
