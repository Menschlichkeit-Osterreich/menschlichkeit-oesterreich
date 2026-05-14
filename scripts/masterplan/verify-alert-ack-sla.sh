#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SLA_FILE="$ROOT_DIR/runbooks/operations-masterplan/slo-sla-policy.md"

if ! [ -f "$SLA_FILE" ]; then
  echo "SLO/SLA-Policy fehlt." >&2
  exit 1
fi

grep -Fq "<= 30 Minuten" "$SLA_FILE"
echo "Ack-SLA: PASS"