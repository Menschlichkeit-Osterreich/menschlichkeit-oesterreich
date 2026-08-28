#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PASS=0
WARN=0
FAIL=0

pass() {
    PASS=$((PASS + 1))
    printf 'PASS: %s\n' "$1"
}

warn() {
    WARN=$((WARN + 1))
    printf 'WARN: %s\n' "$1"
}

fail() {
    FAIL=$((FAIL + 1))
    printf 'FAIL: %s\n' "$1"
}

check_required() {
    local name="$1"
    local command="$2"
    if eval "$command" >/dev/null 2>&1; then
        pass "$name"
    else
        fail "$name"
    fi
}

check_optional() {
    local name="$1"
    local command="$2"
    if eval "$command" >/dev/null 2>&1; then
        pass "$name"
    else
        warn "$name"
    fi
}

version_ge() {
    local current="$1"
    local required="$2"
    [[ "$(printf '%s\n%s\n' "$required" "$current" | sort -V | tail -n1)" == "$current" ]]
}

echo "=== Devcontainer validation ==="

check_required "path apps/api" "[[ -d apps/api ]]"
check_required "path apps/website" "[[ -d apps/website ]]"
check_required "path apps/crm" "[[ -d apps/crm ]]"
check_required "path apps/babylon-game" "[[ -d apps/babylon-game ]]"
check_optional "path automation/n8n (legacy migration only)" "[[ -d automation/n8n ]]"

check_required "tool node" "command -v node"
check_required "tool npm" "command -v npm"
check_required "tool git" "command -v git"
check_required "tool gh" "command -v gh"
check_required "tool docker" "command -v docker"
check_required "tool docker compose" "docker compose version"
check_required "tool python3" "command -v python3"
check_required "tool pip" "command -v pip"
check_required "tool php" "command -v php"
check_required "tool composer" "command -v composer"
check_required "tool pwsh" "command -v pwsh"
check_required "tool jq" "command -v jq"
check_required "tool yq" "command -v yq"
check_required "tool curl" "command -v curl"
check_required "tool shellcheck" "command -v shellcheck"
check_required "tool openssh-client" "command -v ssh"
check_required "tool PostgreSQL client" "command -v psql"
check_required "tool Redis client" "command -v redis-cli"
check_required "tool MariaDB client" "command -v mariadb || command -v mysql"

if command -v node >/dev/null 2>&1; then
    node_version="$(node --version | sed 's/^v//')"
    if version_ge "$node_version" "22.19.0"; then
        pass "node >= 22.19.0 ($node_version)"
    else
        fail "node >= 22.19.0 (current $node_version)"
    fi
fi

if command -v npm >/dev/null 2>&1; then
    npm_version="$(npm --version)"
    if [[ "$npm_version" == "11.4.2" ]]; then
        pass "npm == 11.4.2"
    else
        fail "npm == 11.4.2 (current $npm_version)"
    fi
fi

if command -v python3 >/dev/null 2>&1; then
    python_version="$(python3 -c 'import platform; print(platform.python_version())')"
    if version_ge "$python_version" "3.12.0"; then
        pass "python >= 3.12 ($python_version)"
    else
        fail "python >= 3.12 (current $python_version)"
    fi
fi

if command -v php >/dev/null 2>&1; then
    php_version="$(php -r 'echo PHP_VERSION;')"
    if version_ge "$php_version" "8.2.0"; then
        pass "php >= 8.2 ($php_version)"
    else
        fail "php >= 8.2 (current $php_version)"
    fi
fi

check_required "workspace python venv" "[[ -x .venv/bin/python ]]"
check_required "pytest" ".venv/bin/python -m pytest --version"
check_required "pytest-cov" ".venv/bin/python -c 'import pytest_cov'"
check_required "bandit" ".venv/bin/python -m bandit --version"
check_required "black" ".venv/bin/python -m black --version"
check_required "isort" ".venv/bin/python -m isort --version"
check_required "mypy" ".venv/bin/python -m mypy --version"
check_required "flake8" ".venv/bin/python -m flake8 --version"

check_required "npm dependencies" "[[ -d node_modules ]]"
check_required "eslint" "npx --no-install eslint --version"
check_required "prettier" "npx --no-install prettier --version"
check_required "vitest" "npx --no-install vitest --version"
check_required "playwright" "npx --no-install playwright --version"
check_required "prisma" "npx --no-install prisma --version"

check_required "composer dependencies" "[[ -f vendor/autoload.php ]]"
check_required "phpunit" "composer exec phpunit -- --version"
check_required "phpstan" "composer exec phpstan -- --version"
check_required "php-cs-fixer" "composer exec php-cs-fixer -- --version"
check_required "phpcs" "composer exec phpcs -- --version"

check_required "root .env or .env.example" "[[ -f .env || -f .env.example ]]"
check_required "apps/api env template" "[[ -f apps/api/.env.example ]]"
check_required "apps/website env template" "[[ -f apps/website/.env.example ]]"
check_optional "automation/n8n env template (legacy migration only)" "[[ -f automation/n8n/.env.example ]]"

check_optional "tool az" "command -v az"
check_optional "tool stripe" "command -v stripe"
check_optional "tool bws" "command -v bws"
check_optional "tool uv" "command -v uv"

echo "=== Summary ==="
printf 'PASS: %d\n' "$PASS"
printf 'WARN: %d\n' "$WARN"
printf 'FAIL: %d\n' "$FAIL"

if (( FAIL > 0 )); then
    exit 1
fi

exit 0
