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
check_required "path automation/n8n" "[[ -d automation/n8n ]]"

check_required "tool node" "command -v node"
check_required "tool npm" "command -v npm"
check_required "tool git" "command -v git"
check_required "tool docker" "command -v docker"
check_required "tool docker compose" "docker compose version"
check_required "tool python3" "command -v python3"
check_required "tool pip" "command -v pip"
check_required "tool php" "command -v php"
check_required "tool composer" "command -v composer"
check_required "tool jq" "command -v jq"
check_required "tool yq" "command -v yq"

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
    if version_ge "$npm_version" "11.0.0"; then
        pass "npm >= 11 ($npm_version)"
        if [[ "$npm_version" != "11.4.2" ]]; then
            warn "npm target 11.4.2 not met (current $npm_version)"
        fi
    else
        fail "npm >= 11 (current $npm_version)"
    fi
fi

check_required "root .env or .env.example" "[[ -f .env || -f .env.example ]]"
check_required "apps/api env template" "[[ -f apps/api/.env.example ]]"
check_required "apps/website env template" "[[ -f apps/website/.env.example ]]"
check_required "automation/n8n env template" "[[ -f automation/n8n/.env.example ]]"

check_optional "tool az" "command -v az"
check_optional "tool gh" "command -v gh"
check_optional "tool pwsh" "command -v pwsh"
check_optional "tool stripe" "command -v stripe"
check_optional "tool bws" "command -v bws"

echo "=== Summary ==="
printf 'PASS: %d\n' "$PASS"
printf 'WARN: %d\n' "$WARN"
printf 'FAIL: %d\n' "$FAIL"

if (( FAIL > 0 )); then
    exit 1
fi

exit 0
