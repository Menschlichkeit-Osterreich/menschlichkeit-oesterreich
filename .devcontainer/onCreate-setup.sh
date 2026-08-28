#!/usr/bin/env bash

set -euo pipefail

LOG_FILE="/tmp/devcontainer-onCreate-setup.log"
exec > >(tee -a "$LOG_FILE") 2>&1

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

AGENT_INSTALL_CRM_DEPS="${AGENT_INSTALL_CRM_DEPS:-1}"
AGENT_INSTALL_PLAYWRIGHT="${AGENT_INSTALL_PLAYWRIGHT:-1}"

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

echo "Pinning npm to repository packageManager version..."
if [[ "$(npm --version)" != "11.4.2" ]]; then
    run_with_timeout 180 npm install --global npm@11.4.2
fi

echo "Installing Node.js workspace dependencies..."
run_with_timeout 900 npm ci

echo "Creating Python workspace virtual environment..."
if [[ ! -x ".venv/bin/python" ]]; then
    python3 -m venv .venv
fi
run_with_timeout 300 .venv/bin/python -m pip install --upgrade pip setuptools wheel
run_with_timeout 900 .venv/bin/python -m pip install -r .devcontainer/python-tooling.txt

echo "Installing root Composer development dependencies..."
COMPOSER_MEMORY_LIMIT=-1 run_with_timeout 900 composer install \
    --no-interaction \
    --prefer-dist \
    --no-progress \
    --optimize-autoloader

if [[ "$AGENT_INSTALL_CRM_DEPS" == "1" && -f "apps/crm/composer.json" ]]; then
    echo "Installing Drupal/CiviCRM Composer dependencies..."
    COMPOSER_MEMORY_LIMIT=-1 run_with_timeout 1200 composer install \
        --working-dir=apps/crm \
        --no-interaction \
        --prefer-dist \
        --no-progress \
        --optimize-autoloader
else
    echo "Skipping Drupal/CiviCRM dependency installation."
fi

echo "Generating Prisma client..."
run_with_timeout 180 npx --no-install prisma generate

if [[ "$AGENT_INSTALL_PLAYWRIGHT" == "1" ]]; then
    echo "Installing Playwright Chromium runtime..."
    if command -v sudo >/dev/null 2>&1; then
        run_with_timeout 600 sudo npx --no-install playwright install-deps chromium
    else
        run_with_timeout 600 npx --no-install playwright install-deps chromium
    fi
    run_with_timeout 600 npx --no-install playwright install chromium
else
    echo "Skipping Playwright browser installation."
fi

echo "Ensuring script permissions..."
chmod +x .devcontainer/*.sh 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x deployment-scripts/*.sh 2>/dev/null || true

echo "onCreate completed: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Log file: $LOG_FILE"
