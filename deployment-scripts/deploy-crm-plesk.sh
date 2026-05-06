#!/bin/bash
# =============================================================================
# Plesk CRM Subdomain Deployment Script
# Deploy Drupal 10 + CiviCRM to crm.menschlichkeit-oesterreich.at
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# Configuration
# =============================================================================

# Plesk paths (adjust if needed)
PLESK_ROOT="/var/www/vhosts/menschlichkeit-oesterreich.at"
CRM_DOMAIN_ROOT="${PLESK_ROOT}/crm.menschlichkeit-oesterreich.at"
HTTPDOCS="${CRM_DOMAIN_ROOT}/httpdocs"
PRIVATE_ROOT="${CRM_DOMAIN_ROOT}/private"

# Local development paths
LOCAL_DEV_PATH="./crm.menschlichkeit-oesterreich.at"
LOCAL_HTTPDOCS="${LOCAL_DEV_PATH}/httpdocs"

# Database configuration (will be prompted)
DB_HOST=""
DB_NAME=""
DB_USER=""
DB_PASS=""

# Site configuration
SITE_NAME="Menschlichkeit Österreich CRM"
ADMIN_USER="admin"
ADMIN_PASS=""
CIVICRM_SITE_KEY=""

# =============================================================================
# Pre-deployment checks
# =============================================================================

log_info "Starting Plesk CRM deployment..."

# Check if running as correct user
if [[ ! -w "$PLESK_ROOT" ]]; then
    log_error "No write access to $PLESK_ROOT"
    log_info "Please run as: sudo -u <plesk-user> $0"
    exit 1
fi

# Check if local development files exist
if [[ ! -d "$LOCAL_HTTPDOCS" ]]; then
    log_error "Local development directory not found: $LOCAL_HTTPDOCS"
    log_info "Please run this script from the project root directory"
    exit 1
fi

# Check if composer.json exists
if [[ ! -f "$LOCAL_HTTPDOCS/composer.json" ]]; then
    log_error "composer.json not found in $LOCAL_HTTPDOCS"
    exit 1
fi

# =============================================================================
# Collect configuration
# =============================================================================

log_info "Collecting configuration..."

read -p "Database Host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database Name: " DB_NAME
if [[ -z "$DB_NAME" ]]; then
    log_error "Database name is required"
    exit 1
fi

read -p "Database User: " DB_USER
if [[ -z "$DB_USER" ]]; then
    log_error "Database user is required"
    exit 1
fi

read -s -p "Database Password: " DB_PASS
echo
if [[ -z "$DB_PASS" ]]; then
    log_error "Database password is required"
    exit 1
fi

# Generate secure passwords
ADMIN_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
CIVICRM_SITE_KEY=$(openssl rand -hex 32)

log_success "Configuration collected"

# =============================================================================
# Create directory structure
# =============================================================================

log_info "Creating directory structure..."

# Create directories if they don't exist
mkdir -p "$HTTPDOCS"
mkdir -p "$PRIVATE_ROOT"
mkdir -p "${PRIVATE_ROOT}/tmp"
mkdir -p "${PRIVATE_ROOT}/logs"

# Set proper permissions
chown -R $(id -u):$(id -g) "$CRM_DOMAIN_ROOT"
chmod -R 755 "$CRM_DOMAIN_ROOT"

log_success "Directory structure created"

# =============================================================================
# Deploy code
# =============================================================================

log_info "Deploying application code..."

# Copy composer.json and other config files
cp "$LOCAL_HTTPDOCS/composer.json" "$HTTPDOCS/"

# Copy any additional files if they exist
if [[ -f "$LOCAL_HTTPDOCS/.htaccess" ]]; then
    cp "$LOCAL_HTTPDOCS/.htaccess" "$HTTPDOCS/"
fi

# Change to httpdocs directory
cd "$HTTPDOCS"

log_success "Code deployed"

# =============================================================================
# Install dependencies
# =============================================================================

log_info "Installing Composer dependencies..."

# Check if Composer is available
if ! command -v composer &> /dev/null; then
    log_error "Composer not found. Please install Composer first."
    exit 1
fi

# Install Drupal and dependencies
composer install --no-dev --optimize-autoloader

log_success "Dependencies installed"

# =============================================================================
# Install Drupal
# =============================================================================

log_info "Installing Drupal site..."

# Check if Drush is available
if [[ ! -f "vendor/bin/drush" ]]; then
    log_error "Drush not found after Composer install"
    exit 1
fi

# Install Drupal site
vendor/bin/drush site:install standard -y \
    --site-name="$SITE_NAME" \
    --account-name="$ADMIN_USER" \
    --account-pass="$ADMIN_PASS" \
    --db-url="mysql://$DB_USER:$DB_PASS@$DB_HOST/$DB_NAME" \
    --root="$HTTPDOCS/web"

log_success "Drupal installed"

# =============================================================================
# Install CiviCRM
# =============================================================================

log_info "Installing CiviCRM..."

# Install CiviCRM
composer civicrm:install --no-interaction

# Configure CiviCRM settings
CIVI_SETTINGS="$HTTPDOCS/web/sites/default/civicrm.settings.php"
if [[ -f "$CIVI_SETTINGS" ]]; then
    # Set site key
    if grep -q "CIVICRM_SITE_KEY" "$CIVI_SETTINGS"; then
        sed -ri "s|define\('CIVICRM_SITE_KEY',[^)]*\)|define('CIVICRM_SITE_KEY', '$CIVICRM_SITE_KEY')|" "$CIVI_SETTINGS"
    else
        echo "define('CIVICRM_SITE_KEY', '$CIVICRM_SITE_KEY');" >> "$CIVI_SETTINGS"
    fi
    
    # Set base URL
    if ! grep -q "CIVICRM_UF_BASEURL" "$CIVI_SETTINGS"; then
        echo "if (!defined('CIVICRM_UF_BASEURL')) define('CIVICRM_UF_BASEURL', 'https://crm.menschlichkeit-oesterreich.at/');" >> "$CIVI_SETTINGS"
    fi
fi

log_success "CiviCRM installed and configured"

# =============================================================================
# Set file permissions
# =============================================================================

log_info "Setting file permissions..."

# Drupal file permissions
find "$HTTPDOCS" -type d -exec chmod 755 {} \;
find "$HTTPDOCS" -type f -exec chmod 644 {} \;

# Make files directory writable
chmod -R 775 "$HTTPDOCS/web/sites/default/files"

# Private files
chmod -R 750 "$PRIVATE_ROOT"

log_success "Permissions set"

# =============================================================================
# Create .htaccess for security
# =============================================================================

log_info "Creating security configuration..."

# Create .htaccess in private directory
cat > "$PRIVATE_ROOT/.htaccess" << 'EOF'
# Deny access to private files
Require all denied
EOF

# Create robots.txt
cat > "$HTTPDOCS/robots.txt" << 'EOF'
User-agent: *
Disallow: /admin/
Disallow: /user/
Disallow: /civicrm/
Sitemap: https://crm.menschlichkeit-oesterreich.at/sitemap.xml
EOF

log_success "Security configuration created"

# =============================================================================
# Save deployment information
# =============================================================================

log_info "Saving deployment information..."

# Create deployment info file
cat > "$PRIVATE_ROOT/deployment-info.txt" << EOF
Deployment Information
======================
Date: $(date)
Drupal Version: $(cd "$HTTPDOCS" && vendor/bin/drush status --field=drupal-version)
Admin User: $ADMIN_USER
Admin Password: $ADMIN_PASS
CiviCRM Site Key: $CIVICRM_SITE_KEY
Database: $DB_NAME@$DB_HOST

Next Steps:
1. Set up SSL certificate in Plesk
2. Configure cron jobs for CiviCRM
3. Set API key for admin user in CiviCRM UI
4. Configure SEPA extension if needed

URLs:
- Site: https://crm.menschlichkeit-oesterreich.at
- Admin: https://crm.menschlichkeit-oesterreich.at/user/login
- CiviCRM: https://crm.menschlichkeit-oesterreich.at/civicrm
EOF

chmod 600 "$PRIVATE_ROOT/deployment-info.txt"

log_success "Deployment information saved to $PRIVATE_ROOT/deployment-info.txt"

# =============================================================================
# Final status
# =============================================================================

log_success "=== CRM DEPLOYMENT COMPLETE ==="
echo ""
log_info "📊 Deployment Summary:"
echo "  • Drupal 10 + CiviCRM installed"
echo "  • Site: https://crm.menschlichkeit-oesterreich.at"
echo "  • Admin login: $ADMIN_USER"
echo "  • Admin password: $ADMIN_PASS"
echo ""
log_warning "⚠️  Next Steps Required:"
echo "  1. Configure SSL certificate in Plesk"
echo "  2. Set up cron jobs (see cron-setup.sh)"
echo "  3. Configure CiviCRM API key in admin interface"
echo "  4. Test site functionality"
echo ""
log_info "📋 Deployment info saved to: $PRIVATE_ROOT/deployment-info.txt"
echo ""
log_success "🎉 Ready for production!"