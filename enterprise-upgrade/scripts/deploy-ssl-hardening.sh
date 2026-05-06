#!/bin/bash

# SSL/TLS Production Hardening Deployment Script
# Automatisierte Implementation für SSL Labs A+ Rating

set -euo pipefail

# Configuration
BACKUP_DIR="/etc/nginx/conf.d.backup.$(date +%Y%m%d_%H%M%S)"
SSL_CONF="/etc/nginx/conf.d/ssl_security.conf"
DHPARAM_FILE="/etc/ssl/certs/dhparam.pem"
MONITOR_SCRIPT="/opt/psa/admin/bin/ssl-monitor.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "This script must be run as root"
fi

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if nginx is installed
    if ! command -v nginx &> /dev/null; then
        error "nginx is not installed"
    fi
    
    # Check if openssl is available
    if ! command -v openssl &> /dev/null; then
        error "openssl is not installed"
    fi
    
    # Check if plesk is installed
    if [ ! -f "/usr/local/psa/version" ]; then
        error "Plesk is not installed"
    fi
    
    log "Prerequisites check completed"
}

# Create backup of existing configuration
create_backup() {
    log "Creating configuration backup..."
    
    if [ -d "/etc/nginx/conf.d" ]; then
        cp -r /etc/nginx/conf.d "$BACKUP_DIR"
        log "Backup created at: $BACKUP_DIR"
    else
        warn "nginx conf.d directory not found"
    fi
}

# Deploy SSL security configuration
deploy_ssl_config() {
    log "Deploying SSL security configuration..."
    
    cat > "$SSL_CONF" << 'EOF'
# Modern SSL Configuration for A+ Rating
# Menschlichkeit Österreich - Production SSL/TLS Configuration

# SSL/TLS Protocols - Only modern versions
ssl_protocols TLSv1.2 TLSv1.3;

# Modern cipher suite for forward secrecy and security
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;

# Prefer server ciphers for security
ssl_prefer_server_ciphers off;

# SSL session settings for performance
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# OCSP stapling for certificate validation
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Perfect Forward Secrecy with DH parameters
ssl_dhparam /etc/ssl/certs/dhparam.pem;

# Security headers for all SSL connections
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
EOF
    
    log "SSL configuration deployed to: $SSL_CONF"
}

# Generate DH parameters if not exists
generate_dhparams() {
    if [ ! -f "$DHPARAM_FILE" ]; then
        log "Generating DH parameters (this may take a few minutes)..."
        openssl dhparam -out "$DHPARAM_FILE" 2048
        chmod 644 "$DHPARAM_FILE"
        log "DH parameters generated: $DHPARAM_FILE"
    else
        log "DH parameters already exist: $DHPARAM_FILE"
    fi
}

# Create SSL monitoring script
create_ssl_monitor() {
    log "Creating SSL monitoring script..."
    
    cat > "$MONITOR_SCRIPT" << 'EOF'
#!/bin/bash
# SSL Certificate Monitoring Script
# Monitors SSL certificates for expiry and sends alerts

DOMAINS=("menschlichkeit-oesterreich.at" "crm.menschlichkeit-oesterreich.at" "api.menschlichkeit-oesterreich.at")
ALERT_EMAIL="admin@menschlichkeit-oesterreich.at"
ALERT_THRESHOLD=30

check_ssl_expiry() {
    local domain=$1
    local cert_path="/opt/psa/var/certificates"
    
    # Find certificate file for domain
    local cert_id=$(plesk bin certificate --list | grep "$domain" | awk '{print $1}' | head -1)
    
    if [ -n "$cert_id" ]; then
        local cert_file="$cert_path/$cert_id/cert.pem"
        
        if [ -f "$cert_file" ]; then
            local expiry_date=$(openssl x509 -in "$cert_file" -noout -enddate | cut -d= -f2)
            local expiry_epoch=$(date -d "$expiry_date" +%s)
            local current_epoch=$(date +%s)
            local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
            
            echo "Domain: $domain - Expires in $days_until_expiry days"
            
            if [ $days_until_expiry -lt $ALERT_THRESHOLD ]; then
                echo "WARNING: SSL certificate for $domain expires in $days_until_expiry days" | \
                mail -s "SSL Certificate Alert - $domain" "$ALERT_EMAIL"
            fi
        else
            echo "ERROR: Certificate file not found for $domain"
        fi
    else
        echo "ERROR: No certificate found for $domain"
    fi
}

# Check SSL Labs rating (rate limited - use with caution)
check_ssl_rating() {
    local domain=$1
    local api_url="https://api.ssllabs.com/api/v3/analyze?host=$domain&publish=off&fromCache=on"
    
    local response=$(curl -s "$api_url")
    local status=$(echo "$response" | jq -r '.status // "UNKNOWN"')
    
    if [ "$status" = "READY" ]; then
        local grade=$(echo "$response" | jq -r '.endpoints[0].grade // "UNKNOWN"')
        echo "Domain: $domain - SSL Labs Grade: $grade"
        
        if [ "$grade" != "A+" ] && [ "$grade" != "A" ]; then
            echo "WARNING: SSL rating for $domain is $grade (expected A+)" | \
            mail -s "SSL Rating Alert - $domain" "$ALERT_EMAIL"
        fi
    else
        echo "Domain: $domain - SSL Labs Status: $status"
    fi
}

# Main monitoring loop
for domain in "${DOMAINS[@]}"; do
    check_ssl_expiry "$domain"
done

# Weekly SSL Labs check (uncomment if needed)
# if [ "$(date +%u)" = "1" ]; then  # Monday only
#     for domain in "${DOMAINS[@]}"; do
#         check_ssl_rating "$domain"
#     done
# fi
EOF
    
    chmod +x "$MONITOR_SCRIPT"
    log "SSL monitoring script created: $MONITOR_SCRIPT"
}

# Install cron job for SSL monitoring
install_cron() {
    log "Installing SSL monitoring cron job..."
    
    # Check if cron job already exists
    if ! crontab -l 2>/dev/null | grep -q "ssl-monitor.sh"; then
        # Add cron job: daily at 6:00 AM
        (crontab -l 2>/dev/null; echo "0 6 * * * $MONITOR_SCRIPT") | crontab -
        log "SSL monitoring cron job installed (daily at 6:00 AM)"
    else
        log "SSL monitoring cron job already exists"
    fi
}

# Configure domain-specific SSL settings
configure_domains() {
    log "Configuring domain-specific SSL settings..."
    
    # Main domain configuration
    configure_main_domain
    
    # CRM subdomain configuration
    configure_crm_subdomain
    
    # API subdomain configuration
    configure_api_subdomain
}

configure_main_domain() {
    local domain_config="/var/www/vhosts/menschlichkeit-oesterreich.at/conf/vhost_ssl.conf"
    
    if [ ! -f "$domain_config" ]; then
        mkdir -p "$(dirname "$domain_config")"
        cat > "$domain_config" << 'EOF'
# Main domain SSL configuration
server {
    listen 443 ssl http2;
    server_name menschlichkeit-oesterreich.at www.menschlichkeit-oesterreich.at;
    
    include /etc/nginx/conf.d/ssl_security.conf;
    
    # Force HTTPS redirect
    if ($scheme = http) {
        return 301 https://$server_name$request_uri;
    }
    
    # Additional security headers for main site
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.menschlichkeit-oesterreich.at; frame-src 'self' https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;" always;
}
EOF
        log "Main domain SSL configuration created"
    fi
}

configure_crm_subdomain() {
    local crm_config="/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/conf/vhost_ssl.conf"
    
    if [ ! -f "$crm_config" ]; then
        mkdir -p "$(dirname "$crm_config")"
        cat > "$crm_config" << 'EOF'
# CRM subdomain SSL configuration
server {
    listen 443 ssl http2;
    server_name crm.menschlichkeit-oesterreich.at;
    
    include /etc/nginx/conf.d/ssl_security.conf;
    
    # CRM-specific security headers
    add_header X-Robots-Tag "noindex, nofollow" always;
    add_header Cache-Control "no-store, no-cache, must-revalidate" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';" always;
}
EOF
        log "CRM subdomain SSL configuration created"
    fi
}

configure_api_subdomain() {
    local api_config="/var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/api/conf/vhost_ssl.conf"
    
    if [ ! -f "$api_config" ]; then
        mkdir -p "$(dirname "$api_config")"
        cat > "$api_config" << 'EOF'
# API subdomain SSL configuration
server {
    listen 443 ssl http2;
    server_name api.menschlichkeit-oesterreich.at;
    
    include /etc/nginx/conf.d/ssl_security.conf;
    
    # API rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
    
    # CORS headers
    add_header Access-Control-Allow-Origin "https://menschlichkeit-oesterreich.at" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
    add_header Access-Control-Max-Age "86400" always;
    
    # API-specific CSP
    add_header Content-Security-Policy "default-src 'none'; connect-src 'self'; frame-ancestors 'none';" always;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
        log "API subdomain SSL configuration created"
    fi
}

# Test nginx configuration
test_nginx_config() {
    log "Testing nginx configuration..."
    
    if nginx -t; then
        log "nginx configuration test passed"
        return 0
    else
        error "nginx configuration test failed"
    fi
}

# Reload nginx
reload_nginx() {
    log "Reloading nginx..."
    
    if systemctl reload nginx; then
        log "nginx reloaded successfully"
    else
        error "Failed to reload nginx"
    fi
}

# Run SSL tests
run_ssl_tests() {
    log "Running SSL configuration tests..."
    
    local domains=("menschlichkeit-oesterreich.at" "crm.menschlichkeit-oesterreich.at" "api.menschlichkeit-oesterreich.at")
    
    for domain in "${domains[@]}"; do
        log "Testing SSL connection to $domain..."
        
        # Test SSL connection
        if timeout 10 openssl s_client -servername "$domain" -connect "$domain:443" -tls1_2 </dev/null &>/dev/null; then
            log "✓ SSL connection to $domain successful"
        else
            warn "✗ SSL connection to $domain failed"
        fi
        
        # Test HSTS header
        if curl -s -I "https://$domain" | grep -i "strict-transport-security" >/dev/null; then
            log "✓ HSTS header present for $domain"
        else
            warn "✗ HSTS header missing for $domain"
        fi
    done
}

# Rollback function
rollback() {
    error "Rolling back changes due to failure..."
    
    if [ -d "$BACKUP_DIR" ]; then
        rm -rf /etc/nginx/conf.d
        mv "$BACKUP_DIR" /etc/nginx/conf.d
        systemctl reload nginx
        log "Rollback completed"
    fi
}

# Main deployment function
main() {
    log "Starting SSL/TLS Production Hardening Deployment"
    log "========================================================"
    
    # Set trap for error handling
    trap rollback ERR
    
    # Run deployment steps
    check_prerequisites
    create_backup
    deploy_ssl_config
    generate_dhparams
    create_ssl_monitor
    install_cron
    configure_domains
    test_nginx_config
    reload_nginx
    run_ssl_tests
    
    log "========================================================"
    log "SSL/TLS Production Hardening Deployment Completed Successfully!"
    log ""
    log "Next steps:"
    log "1. Test SSL configuration: https://www.ssllabs.com/ssltest/"
    log "2. Verify HSTS preload eligibility: https://hstspreload.org/"
    log "3. Check security headers: https://securityheaders.com/"
    log "4. Monitor SSL certificates daily via cron job"
    log ""
    log "Backup created at: $BACKUP_DIR"
    log "SSL monitoring script: $MONITOR_SCRIPT"
    log "SSL configuration: $SSL_CONF"
}

# Run main function
main "$@"