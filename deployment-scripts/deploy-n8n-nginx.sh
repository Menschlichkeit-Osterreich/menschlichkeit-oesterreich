#!/bin/bash
# =============================================================================
# n8n Staging Nginx Configuration Deployment
# Deploy reverse proxy configuration for n8n.menschlichkeit-oesterreich.at
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# Configuration
# =============================================================================

NGINX_CONF_DIR="/etc/nginx/conf.d"
NGINX_SOURCE="$(dirname "$0")/nginx/n8n.menschlichkeit-oesterreich.at.conf"
NGINX_TARGET="$NGINX_CONF_DIR/n8n.menschlichkeit-oesterreich.at.conf"
NGINX_BACKUP="${NGINX_TARGET}.backup.$(date +%Y%m%d_%H%M%S)"

# =============================================================================
# Pre-deployment checks
# =============================================================================

log_info "Starting n8n Nginx configuration deployment..."

# Check if running as root (required for nginx config changes)
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root (sudo)"
    exit 1
fi

# Check if source file exists
if [[ ! -f "$NGINX_SOURCE" ]]; then
    log_error "Source configuration not found: $NGINX_SOURCE"
    exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    log_error "nginx is not installed"
    exit 1
fi

# =============================================================================
# Backup existing configuration (if present)
# =============================================================================

if [[ -f "$NGINX_TARGET" ]]; then
    log_info "Backing up existing configuration..."
    cp "$NGINX_TARGET" "$NGINX_BACKUP"
    log_success "Backup created: $NGINX_BACKUP"
fi

# =============================================================================
# Deploy configuration
# =============================================================================

log_info "Deploying nginx configuration..."
cp "$NGINX_SOURCE" "$NGINX_TARGET"

# Set proper permissions
chmod 644 "$NGINX_TARGET"
log_success "Configuration deployed: $NGINX_TARGET"

# =============================================================================
# Validate nginx configuration
# =============================================================================

log_info "Validating nginx configuration..."
if ! nginx -t > /tmp/nginx_test.log 2>&1; then
    log_error "nginx configuration is invalid!"
    cat /tmp/nginx_test.log
    log_warning "Restoring backup configuration..."
    if [[ -f "$NGINX_BACKUP" ]]; then
        cp "$NGINX_BACKUP" "$NGINX_TARGET"
        log_info "Backup restored"
    fi
    exit 1
fi
log_success "nginx configuration is valid"

# =============================================================================
# Reload nginx
# =============================================================================

log_info "Reloading nginx..."
if ! systemctl reload nginx; then
    log_error "Failed to reload nginx"
    log_warning "Restoring backup configuration..."
    if [[ -f "$NGINX_BACKUP" ]]; then
        cp "$NGINX_BACKUP" "$NGINX_TARGET"
        systemctl reload nginx
        log_info "Backup restored and nginx reloaded"
    fi
    exit 1
fi
log_success "nginx reloaded successfully"

# =============================================================================
# Verify n8n is reachable
# =============================================================================

log_info "Verifying n8n endpoint..."

# Wait a moment for reload to take effect
sleep 2

# Test HTTP redirect
HTTP_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -L \
    "http://n8n.menschlichkeit-oesterreich.at/" 2>/dev/null || echo "000")

# Test HTTPS (allow 301/302 for redirect, 200/401/403 for content)
HTTPS_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -L --insecure \
    "https://n8n.menschlichkeit-oesterreich.at/healthz" 2>/dev/null || echo "000")

# Test healthz endpoint
HEALTHZ_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -L --insecure \
    "https://n8n.menschlichkeit-oesterreich.at/healthz" 2>/dev/null || echo "000")

if [[ "$HTTPS_RESPONSE" == "200" ]] || [[ "$HTTPS_RESPONSE" == "401" ]] || [[ "$HTTPS_RESPONSE" == "403" ]]; then
    log_success "n8n is reachable (HTTP response: $HTTPS_RESPONSE)"
else
    log_warning "n8n response may not be as expected (HTTP response: $HTTPS_RESPONSE)"
    log_info "This could be normal if n8n service is not yet running or if a firewall is blocking access"
fi

# =============================================================================
# Summary and next steps
# =============================================================================

log_success "n8n nginx configuration deployed successfully!"
log_info ""
log_info "Next steps:"
log_info "1. Verify https://n8n.menschlichkeit-oesterreich.at is accessible"
log_info "2. Check n8n container status: docker ps | grep n8n"
log_info "3. View nginx logs: tail -f /var/log/nginx/n8n_access.log"
log_info "4. If n8n container is not running, start it: docker-compose -f automation/n8n/docker-compose.yml up -d"
log_info "5. Run smoke test: python3 automation/n8n/smoke-test-donation.py"

exit 0
