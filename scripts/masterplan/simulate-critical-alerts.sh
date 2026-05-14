#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

for path in \
  "$ROOT_DIR/monitoring/masterplan/signal-matrix.yaml" \
  "$ROOT_DIR/monitoring/masterplan/alert-routing.yaml" \
  "$ROOT_DIR/runbooks/operations-masterplan/slo-sla-policy.md"; do
  if ! [ -f "$path" ]; then
    echo "Fehlende Monitoring-Datei: $path" >&2
    exit 1
  fi
done

grep -Fq "ack_sla_minutes: 30" "$ROOT_DIR/monitoring/masterplan/alert-routing.yaml"
grep -Fq "severity: critical" "$ROOT_DIR/monitoring/masterplan/signal-matrix.yaml"

echo "Critical alert simulation: PASS"
