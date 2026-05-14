#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

required_paths=(
  "$ROOT_DIR/deployment-scripts/infra/terraform/main.tf"
  "$ROOT_DIR/deployment-scripts/infra/terraform/network.tf"
  "$ROOT_DIR/deployment-scripts/infra/terraform/compute.tf"
  "$ROOT_DIR/deployment-scripts/infra/terraform/security.tf"
  "$ROOT_DIR/deployment-scripts/infra/terraform/variables.tf"
  "$ROOT_DIR/runbooks/operations-masterplan/go-no-go-checklist.md"
  "$ROOT_DIR/reports/masterplan/evidence-log.md"
)

for path in "${required_paths[@]}"; do
  if ! [ -f "$path" ]; then
    echo "Fehlende Readiness-Datei: $path" >&2
    exit 1
  fi
done

echo "Plattform-Readiness: PASS"