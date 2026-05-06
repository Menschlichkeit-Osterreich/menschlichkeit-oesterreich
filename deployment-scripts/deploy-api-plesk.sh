#!/bin/bash
# =============================================================================
# Plesk API Subdomain Deployment Script
# Deploy FastAPI + PHP Bridge to api.menschlichkeit-oesterreich.at
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

# Plesk paths
PLESK_ROOT="/var/www/vhosts/menschlichkeit-oesterreich.at"
API_DOMAIN_ROOT="${PLESK_ROOT}/api.menschlichkeit-oesterreich.at"
PUBLIC_ROOT="${API_DOMAIN_ROOT}/public"
PRIVATE_ROOT="${API_DOMAIN_ROOT}/private"

# Local development paths
LOCAL_DEV_PATH="./api.menschlichkeit-oesterreich.at"
LOCAL_APP_PATH="${LOCAL_DEV_PATH}/app"
LOCAL_PUBLIC_PATH="${LOCAL_DEV_PATH}/public"

# Configuration variables
CRM_BASE_URL=""
JWT_SECRET=""
CIVI_SITE_KEY=""
CIVI_API_KEY=""

# =============================================================================
# Pre-deployment checks
# =============================================================================

log_info "Starting Plesk API deployment..."

# Check if running as correct user
if [[ ! -w "$PLESK_ROOT" ]]; then
    log_error "No write access to $PLESK_ROOT"
    log_info "Please run as: sudo -u <plesk-user> $0"
    exit 1
fi

# Check if local development files exist
if [[ ! -d "$LOCAL_APP_PATH" ]]; then
    log_error "Local development directory not found: $LOCAL_APP_PATH"
    log_info "Please run this script from the project root directory"
    exit 1
fi

# Check required files
if [[ ! -f "$LOCAL_APP_PATH/main.py" ]]; then
    log_error "FastAPI main.py not found in $LOCAL_APP_PATH"
    exit 1
fi

if [[ ! -f "$LOCAL_APP_PATH/requirements.txt" ]]; then
    log_error "requirements.txt not found in $LOCAL_APP_PATH"
    exit 1
fi

if [[ ! -f "$LOCAL_PUBLIC_PATH/index.php" ]]; then
    log_error "PHP bridge index.php not found in $LOCAL_PUBLIC_PATH"
    exit 1
fi

# =============================================================================
# Collect configuration
# =============================================================================

log_info "Collecting API configuration..."

read -p "CRM Base URL [https://crm.menschlichkeit-oesterreich.at]: " CRM_BASE_URL
CRM_BASE_URL=${CRM_BASE_URL:-https://crm.menschlichkeit-oesterreich.at}

read -p "CiviCRM Site Key: " CIVI_SITE_KEY
if [[ -z "$CIVI_SITE_KEY" ]]; then
    log_error "CiviCRM Site Key is required"
    exit 1
fi

read -s -p "CiviCRM API Key: " CIVI_API_KEY
echo
if [[ -z "$CIVI_API_KEY" ]]; then
    log_error "CiviCRM API Key is required"
    exit 1
fi

# Generate JWT secret if not provided
JWT_SECRET=$(openssl rand -hex 32)

log_success "Configuration collected"

# =============================================================================
# Create directory structure
# =============================================================================

log_info "Creating directory structure..."

# Create directories
mkdir -p "$PUBLIC_ROOT"
mkdir -p "$PRIVATE_ROOT"
mkdir -p "${PRIVATE_ROOT}/app"
mkdir -p "${PRIVATE_ROOT}/logs"
mkdir -p "${PRIVATE_ROOT}/venv"

# Set proper permissions
chown -R $(id -u):$(id -g) "$API_DOMAIN_ROOT"
chmod -R 755 "$API_DOMAIN_ROOT"
chmod -R 750 "$PRIVATE_ROOT"

log_success "Directory structure created"

# =============================================================================
# Deploy FastAPI application
# =============================================================================

log_info "Deploying FastAPI application..."

# Copy FastAPI files to private directory
cp -r "$LOCAL_APP_PATH"/* "$PRIVATE_ROOT/app/"

# Create Python virtual environment
cd "$PRIVATE_ROOT"
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r app/requirements.txt

log_success "FastAPI application deployed"

# =============================================================================
# Deploy PHP bridge
# =============================================================================

log_info "Deploying PHP bridge..."

# Copy PHP bridge to public directory
cp "$LOCAL_PUBLIC_PATH/index.php" "$PUBLIC_ROOT/"

# Create .htaccess for clean URLs
cat > "$PUBLIC_ROOT/.htaccess" << 'EOF'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
EOF

log_success "PHP bridge deployed"

# =============================================================================
# Create environment configuration
# =============================================================================

log_info "Creating environment configuration..."

# Create environment file for FastAPI
cat > "$PRIVATE_ROOT/.env" << EOF
CIVI_BASE_URL=$CRM_BASE_URL
CIVI_SITE_KEY=$CIVI_SITE_KEY
CIVI_API_KEY=$CIVI_API_KEY
JWT_SECRET=$JWT_SECRET
ENVIRONMENT=production
EOF

chmod 600 "$PRIVATE_ROOT/.env"

# Create systemd service file (if systemd is available)
if command -v systemctl &> /dev/null; then
    log_info "Creating systemd service..."
    
    sudo tee /etc/systemd/system/moe-api.service > /dev/null << EOF
[Unit]
Description=Menschlichkeit Österreich API
After=network.target

[Service]
Type=simple
User=$(id -un)
Group=$(id -gn)
WorkingDirectory=$PRIVATE_ROOT
Environment=PATH=$PRIVATE_ROOT/venv/bin
EnvironmentFile=$PRIVATE_ROOT/.env
ExecStart=$PRIVATE_ROOT/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable moe-api
    sudo systemctl start moe-api
    
    log_success "Systemd service created and started"
else
    log_warning "Systemd not available, manual process management required"
fi

# =============================================================================
# Create startup script
# =============================================================================

log_info "Creating startup script..."

cat > "$PRIVATE_ROOT/start-api.sh" << EOF
#!/bin/bash
# Start script for Menschlichkeit Österreich API

cd "$PRIVATE_ROOT"
source venv/bin/activate
source .env

# Start FastAPI with uvicorn
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
EOF

chmod +x "$PRIVATE_ROOT/start-api.sh"

# Create stop script
cat > "$PRIVATE_ROOT/stop-api.sh" << EOF
#!/bin/bash
# Stop script for Menschlichkeit Österreich API

# Find and kill uvicorn process
pkill -f "uvicorn app.main:app"
EOF

chmod +x "$PRIVATE_ROOT/stop-api.sh"

log_success "Startup scripts created"

# =============================================================================
# Create security configuration
# =============================================================================

log_info "Creating security configuration..."

# Create .htaccess in private directory
cat > "$PRIVATE_ROOT/.htaccess" << 'EOF'
# Deny access to private files
Require all denied
EOF

# Update PHP bridge with security headers
cat > "$PUBLIC_ROOT/.htaccess" << 'EOF'
# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options SAMEORIGIN
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Rate limiting (basic)
<RequireAll>
    Require all granted
    # Add rate limiting rules here if needed
</RequireAll>

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
EOF

# Create robots.txt
cat > "$PUBLIC_ROOT/robots.txt" << 'EOF'
User-agent: *
Disallow: /
EOF

log_success "Security configuration created"

# =============================================================================
# Create health check endpoint
# =============================================================================

log_info "Creating health check..."

cat > "$PUBLIC_ROOT/health.php" << 'EOF'
<?php
// Simple health check for API service
header('Content-Type: application/json');

$health_data = [
    'status' => 'healthy',
    'service' => 'moe-api-bridge',
    'timestamp' => date('c'),
    'version' => '1.0.0'
];

// Check if FastAPI service is responding
$fastapi_url = 'http://127.0.0.1:8000/health';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $fastapi_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_error($ch) || $http_code !== 200) {
    $health_data['status'] = 'degraded';
    $health_data['fastapi_status'] = 'unavailable';
    http_response_code(503);
} else {
    $health_data['fastapi_status'] = 'healthy';
}

curl_close($ch);

echo json_encode($health_data, JSON_PRETTY_PRINT);
?>
EOF

log_success "Health check created"

# =============================================================================
# Save deployment information
# =============================================================================

log_info "Saving deployment information..."

cat > "$PRIVATE_ROOT/deployment-info.txt" << EOF
API Deployment Information
==========================
Date: $(date)
CRM Base URL: $CRM_BASE_URL
JWT Secret: $JWT_SECRET
FastAPI Port: 8000

Files:
- FastAPI App: $PRIVATE_ROOT/app/
- PHP Bridge: $PUBLIC_ROOT/index.php
- Environment: $PRIVATE_ROOT/.env

Management Commands:
- Start API: $PRIVATE_ROOT/start-api.sh
- Stop API: $PRIVATE_ROOT/stop-api.sh
- Health Check: https://api.menschlichkeit-oesterreich.at/health

Next Steps:
1. Configure SSL certificate in Plesk
2. Test API endpoints
3. Set up monitoring
4. Configure log rotation

URLs:
- API Base: https://api.menschlichkeit-oesterreich.at
- Health Check: https://api.menschlichkeit-oesterreich.at/health
- Documentation: https://api.menschlichkeit-oesterreich.at/docs
EOF

chmod 600 "$PRIVATE_ROOT/deployment-info.txt"

log_success "Deployment information saved"

# =============================================================================
# Final status
# =============================================================================

log_success "=== API DEPLOYMENT COMPLETE ==="
echo ""
log_info "📊 Deployment Summary:"
echo "  • FastAPI service deployed"
echo "  • PHP bridge configured"
echo "  • Environment variables set"
echo "  • Security headers configured"
echo ""
log_info "🔗 URLs:"
echo "  • API Base: https://api.menschlichkeit-oesterreich.at"
echo "  • Health Check: https://api.menschlichkeit-oesterreich.at/health"
echo "  • Documentation: https://api.menschlichkeit-oesterreich.at/docs"
echo ""
log_warning "⚠️  Next Steps Required:"
echo "  1. Configure SSL certificate in Plesk"
echo "  2. Test API endpoints with JWT tokens"
echo "  3. Set up log monitoring"
echo "  4. Configure backup for environment file"
echo ""
log_info "📋 Deployment info: $PRIVATE_ROOT/deployment-info.txt"
echo ""
log_success "🎉 API ready for production!"