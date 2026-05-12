FROM mcr.microsoft.com/devcontainers/universal:2

# Workaround: remove stale Yarn APT source that breaks apt-get update during feature installs.
RUN rm -f /etc/apt/sources.list.d/yarn.list \
    && rm -f /etc/apt/sources.list.d/yarn*.list

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    bash-completion \
    ca-certificates \
    curl \
    dnsutils \
    gnupg \
    iproute2 \
    jq \
    make \
    netcat-openbsd \
    openssh-client \
    shellcheck \
    unzip \
    zip \
    && rm -rf /var/lib/apt/lists/*

# Ubuntu focal has no official apt package named "yq". Install the upstream static binary.
RUN set -eu; \
    arch="$(uname -m)"; \
    case "$arch" in \
    x86_64|amd64) yq_arch="amd64" ;; \
    aarch64|arm64) yq_arch="arm64" ;; \
    *) yq_arch="" ;; \
    esac; \
    if [ -n "$yq_arch" ]; then \
    yq_version="v4.44.3"; \
    yq_url="https://github.com/mikefarah/yq/releases/download/${yq_version}/yq_linux_${yq_arch}"; \
    curl -fsSL "$yq_url" -o /usr/local/bin/yq; \
    chmod 0755 /usr/local/bin/yq; \
    fi

# Optional fallback install for Stripe CLI when not provided by the base image/features.
RUN set -eu; \
    if command -v stripe >/dev/null 2>&1; then \
    stripe version; \
    else \
    arch="$(uname -m)"; \
    case "$arch" in \
    x86_64|amd64) stripe_arch="x86_64" ;; \
    aarch64|arm64) stripe_arch="arm64" ;; \
    *) stripe_arch="" ;; \
    esac; \
    if [ -n "$stripe_arch" ]; then \
    tag="$(curl -fsSL https://api.github.com/repos/stripe/stripe-cli/releases/latest | jq -r '.tag_name // empty')"; \
    if [ -n "$tag" ]; then \
    version="${tag#v}"; \
    url="https://github.com/stripe/stripe-cli/releases/download/${tag}/stripe_${version}_linux_${stripe_arch}.tar.gz"; \
    tmpdir="$(mktemp -d)"; \
    if curl -fsSL "$url" -o "$tmpdir/stripe.tar.gz"; then \
    tar -xzf "$tmpdir/stripe.tar.gz" -C "$tmpdir"; \
    install -m 0755 "$tmpdir/stripe" /usr/local/bin/stripe; \
    fi; \
    rm -rf "$tmpdir"; \
    fi; \
    fi; \
    fi

# Optional fallback install for Bitwarden Secrets Manager CLI when unavailable.
RUN set -eu; \
    if command -v bws >/dev/null 2>&1; then \
    bws --version || true; \
    else \
    arch="$(uname -m)"; \
    case "$arch" in \
    x86_64|amd64) bws_arch="x86_64" ;; \
    aarch64|arm64) bws_arch="aarch64" ;; \
    *) bws_arch="" ;; \
    esac; \
    if [ -n "$bws_arch" ]; then \
    tag="$(curl -fsSL https://api.github.com/repos/bitwarden/sdk-sm/releases/latest | jq -r '.tag_name // empty')"; \
    if [ -n "$tag" ]; then \
    tmpdir="$(mktemp -d)"; \
    bws_url="https://github.com/bitwarden/sdk-sm/releases/download/${tag}/bws-x86_64-unknown-linux-gnu-${tag}.zip"; \
    if [ "$bws_arch" = "aarch64" ]; then \
    bws_url="https://github.com/bitwarden/sdk-sm/releases/download/${tag}/bws-aarch64-unknown-linux-gnu-${tag}.zip"; \
    fi; \
    if curl -fsSL "$bws_url" -o "$tmpdir/bws.zip"; then \
    unzip -q "$tmpdir/bws.zip" -d "$tmpdir"; \
    if [ -f "$tmpdir/bws" ]; then \
    install -m 0755 "$tmpdir/bws" /usr/local/bin/bws; \
    fi; \
    fi; \
    rm -rf "$tmpdir"; \
    fi; \
    fi; \
    fi
