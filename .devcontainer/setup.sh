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

warn() {
    printf 'WARN: %s\n' "$1"
}

ok() {
    printf 'PASS: %s\n' "$1"
}

install_stripe_fallback() {
    if command -v stripe >/dev/null 2>&1; then
        return 0
    fi

    local arch tag version url tmpdir
    arch="$(uname -m)"
    case "$arch" in
        x86_64|amd64) arch="x86_64" ;;
        aarch64|arm64) arch="arm64" ;;
        *) warn "stripe unsupported architecture: $arch"; return 0 ;;
    esac

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
        if command -v sudo >/dev/null 2>&1; then
            sudo install -m 0755 "$tmpdir/stripe" /usr/local/bin/stripe
        else
            install -m 0755 "$tmpdir/stripe" /usr/local/bin/stripe
        fi
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

    local arch tag url tmpdir asset_arch
    arch="$(uname -m)"
    case "$arch" in
        x86_64|amd64) asset_arch="x86_64" ;;
        aarch64|arm64) asset_arch="aarch64" ;;
        *) warn "bws unsupported architecture: $arch"; return 0 ;;
    esac

    tag="$(curl -fsSL https://api.github.com/repos/bitwarden/sdk-sm/releases/latest | jq -r '.tag_name // empty' || true)"
    if [[ -z "$tag" ]]; then
        warn "bws release lookup failed"
        return 0
    fi

    url="https://github.com/bitwarden/sdk-sm/releases/download/${tag}/bws-${asset_arch}-unknown-linux-gnu-${tag}.zip"
    tmpdir="$(mktemp -d)"
    if curl -fsSL "$url" -o "$tmpdir/bws.zip"; then
        unzip -q "$tmpdir/bws.zip" -d "$tmpdir"
        if [[ -f "$tmpdir/bws" ]]; then
            if command -v sudo >/dev/null 2>&1; then
                sudo install -m 0755 "$tmpdir/bws" /usr/local/bin/bws
            else
                install -m 0755 "$tmpdir/bws" /usr/local/bin/bws
            fi
            ok "bws installed"
        else
            warn "bws archive did not contain expected binary"
        fi
    else
        warn "bws download failed"
    fi
    rm -rf "$tmpdir"
}

if ! command -v stripe >/dev/null 2>&1; then
    install_stripe_fallback
fi

if ! command -v bws >/dev/null 2>&1; then
    install_bws_fallback
fi

echo "Running deterministic environment validation..."
bash .devcontainer/test-setup.sh

echo "Setup complete."
