#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TERRAFORM_DIR="$ROOT_DIR/deployment-scripts/infra/terraform"

if ! [ -d "$TERRAFORM_DIR" ]; then
  echo "Terraform-Basis fehlt: $TERRAFORM_DIR" >&2
  exit 1
fi

if ! compgen -G "$TERRAFORM_DIR/*.tf" > /dev/null; then
  echo "Keine Terraform-Dateien im Masterplan gefunden." >&2
  exit 1
fi

echo "Masterplan-Infrastruktur vorbereitet."
echo "Nächster Schritt: terraform init/plan/apply im Zielkontext ausführen."
