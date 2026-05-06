#!/bin/bash
# =============================================================================
# Plesk SSH Connection Test Script
# Tests SSH access and verifies directory structure
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                    🔐 PLESK SSH VERBINDUNGSTEST                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# =============================================================================
# Configuration
# =============================================================================

# Try to get SSH credentials from environment or prompt
if [[ -z "${PLESK_SSH_HOST:-}" ]]; then
    read -p "SSH Host [menschlichkeit-oesterreich.at]: " SSH_HOST
    SSH_HOST=${SSH_HOST:-menschlichkeit-oesterreich.at}
else
    SSH_HOST="$PLESK_SSH_HOST"
fi

if [[ -z "${PLESK_SSH_USER:-}" ]]; then
    read -p "SSH User: " SSH_USER
    if [[ -z "$SSH_USER" ]]; then
        log_error "SSH user is required"
        exit 1
    fi
else
    SSH_USER="$PLESK_SSH_USER"
fi

if [[ -z "${PLESK_SSH_PORT:-}" ]]; then
    SSH_PORT=22
else
    SSH_PORT="$PLESK_SSH_PORT"
fi

log_info "Testing SSH connection to $SSH_USER@$SSH_HOST:$SSH_PORT"

# =============================================================================
# Test 1: Basic SSH Connectivity
# =============================================================================

echo ""
log_info "Test 1: Checking SSH connectivity..."

if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "echo 'SSH_OK'" 2>/dev/null | grep -q "SSH_OK"; then
    log_success "SSH connection successful"
else
    log_error "SSH connection failed"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check SSH credentials in GitHub Secrets"
    echo "2. Verify SSH key is added to Plesk Panel"
    echo "3. Check firewall allows SSH (port $SSH_PORT)"
    echo "4. Try: ssh -v $SSH_USER@$SSH_HOST"
    exit 1
fi

# =============================================================================
# Test 2: Check Plesk Directory Structure
# =============================================================================

echo ""
log_info "Test 2: Checking Plesk directory structure..."

SSH_CMD="ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -p $SSH_PORT $SSH_USER@$SSH_HOST"

# Check main vhosts directory
if $SSH_CMD "test -d /var/www/vhosts" 2>/dev/null; then
    log_success "Plesk vhosts directory exists: /var/www/vhosts"
else
    log_warning "Standard Plesk path not found, checking alternatives..."
    
    # Try to find actual web root
    WEB_ROOT=$($SSH_CMD "find /var/www -maxdepth 2 -name 'httpdocs' -type d | head -1 | xargs dirname" 2>/dev/null || echo "")
    
    if [[ -n "$WEB_ROOT" ]]; then
        log_info "Found web root: $WEB_ROOT"
    else
        log_error "Could not find Plesk web root"
    fi
fi

# =============================================================================
# Test 3: Check Domain Directories
# =============================================================================

echo ""
log_info "Test 3: Checking domain directories..."

DOMAIN_BASE="/var/www/vhosts/menschlichkeit-oesterreich.at"

check_domain_dir() {
    local domain=$1
    local path="$DOMAIN_BASE/$domain"
    
    if $SSH_CMD "test -d $path" 2>/dev/null; then
        log_success "$domain exists"
        
        # Check subdirectories
        if $SSH_CMD "test -d $path/httpdocs" 2>/dev/null; then
            log_info "  → httpdocs: ✓"
        else
            log_warning "  → httpdocs: ✗"
        fi
        
        if $SSH_CMD "test -d $path/private" 2>/dev/null; then
            log_info "  → private: ✓"
        else
            log_warning "  → private: ✗"
        fi
    else
        log_warning "$domain does not exist"
    fi
}

check_domain_dir "www.menschlichkeit-oesterreich.at"
check_domain_dir "crm.menschlichkeit-oesterreich.at"
check_domain_dir "frontend.menschlichkeit-oesterreich.at"

# =============================================================================
# Test 4: Check Permissions
# =============================================================================

echo ""
log_info "Test 4: Checking write permissions..."

# Try to create a test file in www httpdocs
TEST_FILE="$DOMAIN_BASE/www.menschlichkeit-oesterreich.at/httpdocs/.ssh_test_$(date +%s)"

if $SSH_CMD "touch $TEST_FILE && rm $TEST_FILE" 2>/dev/null; then
    log_success "Write permission: OK"
else
    log_error "No write permission in httpdocs"
    log_info "Current user: $($SSH_CMD 'whoami')"
    log_info "You may need to use: sudo -u www-data"
fi

# =============================================================================
# Test 5: Check Available Disk Space
# =============================================================================

echo ""
log_info "Test 5: Checking disk space..."

DISK_INFO=$($SSH_CMD "df -h /var/www | tail -1" 2>/dev/null || echo "")
if [[ -n "$DISK_INFO" ]]; then
    log_info "Disk space: $DISK_INFO"
else
    log_warning "Could not retrieve disk information"
fi

# =============================================================================
# Test 6: List Existing Subdomains
# =============================================================================

echo ""
log_info "Test 6: Listing existing subdomains..."

EXISTING_DIRS=$($SSH_CMD "ls -1 $DOMAIN_BASE 2>/dev/null || echo ''" 2>/dev/null)

if [[ -n "$EXISTING_DIRS" ]]; then
    echo "$EXISTING_DIRS" | while read -r dir; do
        if [[ -n "$dir" ]]; then
            log_info "  → $dir"
        fi
    done
else
    log_warning "Could not list subdomain directories"
fi

# =============================================================================
# Test 7: Check Web Server Configuration
# =============================================================================

echo ""
log_info "Test 7: Checking web server..."

# Check if nginx is running
if $SSH_CMD "pgrep nginx" &>/dev/null; then
    log_success "Nginx is running"
else
    log_warning "Nginx may not be running"
fi

# Check if Apache is running
if $SSH_CMD "pgrep apache2 || pgrep httpd" &>/dev/null; then
    log_success "Apache is running"
else
    log_info "Apache not detected (might be using Nginx only)"
fi

# =============================================================================
# Summary & Next Steps
# =============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                    📊 CONNECTION TEST SUMMARY                            ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

log_success "SSH connection verified"
log_info "Host: $SSH_HOST"
log_info "User: $SSH_USER"
log_info "Port: $SSH_PORT"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                    🚀 NEXT STEPS FOR DEPLOYMENT                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "1. CREATE FRONTEND SUBDOMAIN:"
echo "   Option A (Plesk Panel):"
echo "     - Login to Plesk → Websites & Domains"
echo "     - Add Subdomain: frontend"
echo "     - Document Root: /httpdocs"
echo ""
echo "   Option B (SSH - if you have permissions):"
echo "     $ ssh $SSH_USER@$SSH_HOST"
echo "     $ mkdir -p $DOMAIN_BASE/frontend.menschlichkeit-oesterreich.at/httpdocs"
echo "     $ mkdir -p $DOMAIN_BASE/frontend.menschlichkeit-oesterreich.at/private"
echo ""

echo "2. UPLOAD FRONTEND BUILD:"
echo "   $ scp -r frontend/dist/* $SSH_USER@$SSH_HOST:$DOMAIN_BASE/frontend.menschlichkeit-oesterreich.at/httpdocs/"
echo ""

echo "3. CONFIGURE SSL (via Plesk Panel):"
echo "   - Websites & Domains → frontend.menschlichkeit-oesterreich.at"
echo "   - SSL/TLS Certificates → Let's Encrypt"
echo ""

echo "4. CONFIGURE NGINX (create config file or use Plesk UI):"
echo "   - SPA routing: try_files \$uri \$uri/ /index.html"
echo "   - API proxy: location /api/ { proxy_pass http://localhost:8001/; }"
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                    💡 DEPLOYMENT OPTIONS                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "OPTION A: Use deploy-frontend-plesk.sh (recommended)"
echo "  → Automated deployment with all checks"
echo ""
echo "OPTION B: Manual deployment via Plesk Panel"
echo "  → Good for first-time setup"
echo ""
echo "OPTION C: Direct SCP upload"
echo "  → Quick for updates after initial setup"
echo ""
