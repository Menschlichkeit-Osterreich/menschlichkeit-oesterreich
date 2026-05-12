#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== Devcontainer setup (postCreate) ==="

echo "Applying inotify tuning (best effort)..."
{
    sudo sysctl -w fs.inotify.max_user_watches=524288 || \
    sysctl -w fs.inotify.max_user_watches=524288 || true
    sudo sysctl -w fs.inotify.max_user_instances=1024 || \
    sysctl -w fs.inotify.max_user_instances=1024 || true
    sudo sysctl -w fs.inotify.max_queued_events=32768 || \
    sysctl -w fs.inotify.max_queued_events=32768 || true
} >/dev/null 2>&1 || true

version_ge() {
    local current="$1"
    local required="$2"
    [[ "$(printf '%s\n%s\n' "$required" "$current" | sort -V | tail -n1)" == "$current" ]]
}

warn() {
    printf 'WARN: %s\n' "$1"
}

fail() {
    printf 'FAIL: %s\n' "$1"
}

ok() {
    printf 'PASS: %s\n' "$1"
}

critical_failures=0

check_cmd() {
    local name="$1"
    local command="$2"
    if eval "$command" >/dev/null 2>&1; then
        ok "$name"
    else
        fail "$name"
        critical_failures=$((critical_failures + 1))
    fi
}

check_optional_cmd() {
    local name="$1"
    local command="$2"
    if eval "$command" >/dev/null 2>&1; then
        ok "$name"
    else
        warn "$name"
    fi
}

copy_if_missing() {
    local source_file="$1"
    local target_file="$2"
    if [[ -f "$source_file" && ! -f "$target_file" ]]; then
        cp "$source_file" "$target_file"
        ok "Created $target_file"
    fi
}

install_stripe_fallback() {
    if command -v stripe >/dev/null 2>&1; then
        return 0
    fi

    local arch
    arch="$(uname -m)"
    case "$arch" in
        x86_64|amd64) arch="x86_64" ;;
        aarch64|arm64) arch="arm64" ;;
        *) warn "stripe unsupported architecture: $arch"; return 0 ;;
    esac

    local tag version url tmpdir
    tag="$(curl -fsSL https://api.github.com/repos/stripe/stripe-cli/releases/latest | jq -r '.tag_name // empty' || true)"
    if [[ -z "$tag" ]]; then
        warn "stripe release lookup failed"
        return 0
    fi

    version="${tag#v}"
    url="https://github.com/stripe/stripe-cli/releases/download/${tag}/stripe_${version}_linux_${arch}.tar.gz"
    tmpdir="$(mktemp -d)"
    if curl -fsSL "$url" -o "$tmpdir/stripe.tar.gz"; then
        tar -xzf "$tmpdir/stripe.tar.gz" -C "$tmpdir"
        install -m 0755 "$tmpdir/stripe" /usr/local/bin/stripe
        ok "stripe installed"
    else
        warn "stripe download failed"
    fi
    rm -rf "$tmpdir"
}

install_bws_fallback() {
    if command -v bws >/dev/null 2>&1; then
        return 0
    fi

    local arch
    arch="$(uname -m)"
    case "$arch" in
        x86_64|amd64) arch="x86_64" ;;
        aarch64|arm64) arch="aarch64" ;;
        *) warn "bws unsupported architecture: $arch"; return 0 ;;
    esac

    local tag url tmpdir
    tag="$(curl -fsSL https://api.github.com/repos/bitwarden/sdk-sm/releases/latest | jq -r '.tag_name // empty' || true)"
    if [[ -z "$tag" ]]; then
        warn "bws release lookup failed"
        return 0
    fi

    url="https://github.com/bitwarden/sdk-sm/releases/download/${tag}/bws-${arch}-unknown-linux-gnu.zip"
    tmpdir="$(mktemp -d)"
    if curl -fsSL "$url" -o "$tmpdir/bws.zip"; then
        unzip -q "$tmpdir/bws.zip" -d "$tmpdir"
        if [[ -f "$tmpdir/bws" ]]; then
            install -m 0755 "$tmpdir/bws" /usr/local/bin/bws
            ok "bws installed"
        else
            warn "bws archive did not contain expected binary"
        fi
    else
        warn "bws download failed"
    fi
    rm -rf "$tmpdir"
}

echo "Checking critical tools..."
check_cmd "node" "command -v node"
check_cmd "npm" "command -v npm"
check_cmd "git" "command -v git"
check_cmd "docker" "command -v docker"
check_cmd "docker compose" "docker compose version"
check_cmd "python3" "command -v python3"
check_cmd "pip" "command -v pip"
check_cmd "php" "command -v php"
check_cmd "composer" "command -v composer"
check_cmd "jq" "command -v jq"
check_cmd "yq" "command -v yq"

if command -v node >/dev/null 2>&1; then
    node_version="$(node --version | sed 's/^v//')"
    if version_ge "$node_version" "22.19.0"; then
        ok "node version >= 22.19.0 ($node_version)"
    else
        fail "node version must be >= 22.19.0 (current $node_version)"
        critical_failures=$((critical_failures + 1))
    fi
fi

if command -v npm >/dev/null 2>&1; then
    npm_version="$(npm --version)"
    if version_ge "$npm_version" "11.0.0"; then
        ok "npm version >= 11 ($npm_version)"
        if [[ "$npm_version" != "11.4.2" ]]; then
            warn "npm target version is 11.4.2 (current $npm_version)"
        fi
    else
        fail "npm version must be >= 11 (current $npm_version)"
        critical_failures=$((critical_failures + 1))
    fi
fi

echo "Bootstrapping active-path environment files..."
copy_if_missing ".env.example" ".env"
copy_if_missing "apps/api/.env.example" "apps/api/.env"
copy_if_missing "apps/website/.env.example" "apps/website/.env.local"
copy_if_missing "automation/n8n/.env.example" "automation/n8n/.env"

if [[ -f "apps/api/requirements-dev.txt" ]]; then
    echo "Installing Python requirements for apps/api..."
    timeout 300 pip install --user --timeout 120 -r apps/api/requirements-dev.txt || warn "apps/api requirements install failed"
fi

check_optional_cmd "az" "command -v az"
check_optional_cmd "gh" "command -v gh"
check_optional_cmd "pwsh" "command -v pwsh"
check_optional_cmd "stripe" "command -v stripe"
check_optional_cmd "bws" "command -v bws"

if ! command -v stripe >/dev/null 2>&1; then
    install_stripe_fallback
fi
if ! command -v bws >/dev/null 2>&1; then
    install_bws_fallback
fi

if (( critical_failures > 0 )); then
    printf 'Setup failed with %d critical check(s).\n' "$critical_failures"
    exit 1
fi

echo "Setup complete with all critical checks passing."
