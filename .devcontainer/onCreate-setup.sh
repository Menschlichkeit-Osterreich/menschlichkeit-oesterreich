#!/usr/bin/env bash

set -euo pipefail

LOG_FILE="/tmp/devcontainer-onCreate-setup.log"
exec > >(tee -a "$LOG_FILE") 2>&1

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== Devcontainer onCreate (idempotent) ==="
echo "Started: $(date '+%Y-%m-%d %H:%M:%S')"

run_with_timeout() {
    local timeout_seconds="$1"
    shift
    timeout "$timeout_seconds" "$@"
}

copy_if_missing() {
    local source_file="$1"
    local target_file="$2"

    if [[ -f "$source_file" && ! -f "$target_file" ]]; then
        cp "$source_file" "$target_file"
        echo "Created: $target_file"
    fi
}

echo "Checking required repository paths..."
required_paths=(
    "apps/api"
    "apps/website"
    "apps/crm"
    "apps/babylon-game"
    "automation/n8n"
)

for path in "${required_paths[@]}"; do
    if [[ ! -e "$path" ]]; then
        echo "Missing required path: $path"
        exit 1
    fi
done

mkdir -p quality-reports

echo "Bootstrapping environment templates..."
copy_if_missing ".env.example" ".env"
copy_if_missing "apps/api/.env.example" "apps/api/.env"
copy_if_missing "apps/website/.env.example" "apps/website/.env.local"
copy_if_missing "automation/n8n/.env.example" "automation/n8n/.env"

echo "Installing npm dependencies (if needed)..."
if [[ ! -d "node_modules" ]]; then
    if [[ -f "package-lock.json" ]]; then
        run_with_timeout 600 npm ci || run_with_timeout 600 npm install
    else
        run_with_timeout 600 npm install
    fi
fi

echo "Ensuring script permissions..."
chmod +x .devcontainer/*.sh 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x deployment-scripts/*.sh 2>/dev/null || true

echo "onCreate completed: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Log file: $LOG_FILE"
