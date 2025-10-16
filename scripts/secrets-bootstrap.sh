#!/bin/bash
# Secrets Bootstrap Script - Menschlichkeit Österreich
# Setzt alle erforderlichen GitHub Secrets via GitHub CLI

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ORG="peschull"
REPO="menschlichkeit-oesterreich-development"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) not found. Install from https://cli.github.com"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI not authenticated. Run: gh auth login"
        exit 1
    fi
    
    log_info "GitHub CLI authenticated ✓"
}

generate_random_secret() {
    openssl rand -base64 32 | tr -d '\n'
}

set_repo_secret() {
    local name=$1
    local value=$2
    
    if echo "$value" | gh secret set "$name" --repo "$ORG/$REPO" 2>/dev/null; then
        log_info "✓ Set: $name"
    else
        log_error "✗ Failed: $name"
        return 1
    fi
}

set_org_secret() {
    local name=$1
    local value=$2
    local repos=$3
    
    if echo "$value" | gh secret set "$name" --org "$ORG" --repos "$repos" 2>/dev/null; then
        log_info "✓ Set (Org): $name"
    else
        log_error "✗ Failed (Org): $name"
        return 1
    fi
}

set_env_secret() {
    local env=$1
    local name=$2
    local value=$3
    
    if echo "$value" | gh secret set "$name" --env "$env" --repo "$ORG/$REPO" 2>/dev/null; then
        log_info "✓ Set (Env:$env): $name"
    else
        log_error "✗ Failed (Env:$env): $name"
        return 1
    fi
}

# Main Script
main() {
    log_info "=== Secrets Bootstrap für Menschlichkeit Österreich ==="
    echo ""
    
    # Check prerequisites
    check_gh_cli
    
    # Ask user for parameters
    read -p "DPO_NAME (Datenschutzbeauftragte:r): " DPO_NAME
    read -p "DPO_EMAIL: " DPO_EMAIL
    read -p "SEC_EMAIL (Security Contact): " SEC_EMAIL
    read -p "INCIDENT_PAGER (Matrix/Slack On-Call): " INCIDENT_PAGER
    
    echo ""
    log_info "=== Step 1: Infrastructure Secrets ==="
    
    # SSH Deployment
    if [ -f ~/.ssh/id_ed25519 ]; then
        SSH_PRIVATE_KEY=$(cat ~/.ssh/id_ed25519)
        set_repo_secret "SSH_PRIVATE_KEY" "$SSH_PRIVATE_KEY"
    else
        log_warn "SSH key not found at ~/.ssh/id_ed25519. Please set manually."
    fi
    
    read -p "SSH_HOST (e.g., user@host): " SSH_HOST
    set_repo_secret "SSH_HOST" "$SSH_HOST"
    
    read -p "SSH_USER: " SSH_USER
    set_repo_secret "SSH_USER" "$SSH_USER"
    
    read -p "SSH_PORT (default: 22): " SSH_PORT
    SSH_PORT=${SSH_PORT:-22}
    set_repo_secret "SSH_PORT" "$SSH_PORT"
    
    echo ""
    log_info "=== Step 2: Database Hosts ==="
    
    read -p "MYSQL_HOST (External MariaDB): " MYSQL_HOST
    set_repo_secret "MYSQL_HOST" "$MYSQL_HOST"
    
    read -p "PG_HOST (External PostgreSQL): " PG_HOST
    set_repo_secret "PG_HOST" "$PG_HOST"
    
    read -p "REDIS_HOST (Optional, press Enter to skip): " REDIS_HOST
    if [ -n "$REDIS_HOST" ]; then
        set_repo_secret "REDIS_HOST" "$REDIS_HOST"
    fi
    
    echo ""
    log_info "=== Step 3: Database Passwords (Auto-Generate) ==="
    
    # Plesk MariaDB
    for db in MAIN VOTES SUPPORT NEWSLETTER FORUM; do
        SECRET_NAME="MO_${db}_DB_PASS"
        SECRET_VALUE=$(generate_random_secret)
        set_repo_secret "$SECRET_NAME" "$SECRET_VALUE"
        log_warn "Please update ${db} DB password to: [REDACTED - check GitHub Secrets]"
    done
    
    # External MariaDB
    for db in CRM N8N HOOKS CONSENT GAMES ANALYTICS API_STG ADMIN_STG NEXTCLOUD; do
        SECRET_NAME="MO_${db}_DB_PASS"
        SECRET_VALUE=$(generate_random_secret)
        set_repo_secret "$SECRET_NAME" "$SECRET_VALUE"
    done
    
    # PostgreSQL
    for db in IDP GRAFANA DISCOURSE; do
        SECRET_NAME="PG_${db}_DB_PASS"
        SECRET_VALUE=$(generate_random_secret)
        set_repo_secret "$SECRET_NAME" "$SECRET_VALUE"
    done
    
    # Redis (if configured)
    if [ -n "$REDIS_HOST" ]; then
        REDIS_PASSWORD=$(generate_random_secret)
        set_repo_secret "REDIS_PASSWORD" "$REDIS_PASSWORD"
    fi
    
    echo ""
    log_info "=== Step 4: Application Secrets ==="
    
    # JWT & Encryption
    JWT_SECRET=$(generate_random_secret)
    set_repo_secret "JWT_SECRET" "$JWT_SECRET"
    
    N8N_ENCRYPTION_KEY=$(generate_random_secret)
    set_repo_secret "N8N_ENCRYPTION_KEY" "$N8N_ENCRYPTION_KEY"
    
    # CiviCRM
    read -p "CIVICRM_SITE_KEY (32 chars, or press Enter to generate): " CIVICRM_SITE_KEY
    CIVICRM_SITE_KEY=${CIVICRM_SITE_KEY:-$(generate_random_secret)}
    set_repo_secret "CIVICRM_SITE_KEY" "$CIVICRM_SITE_KEY"
    
    read -p "CIVICRM_API_KEY (or press Enter to generate): " CIVICRM_API_KEY
    CIVICRM_API_KEY=${CIVICRM_API_KEY:-$(generate_random_secret)}
    set_repo_secret "CIVICRM_API_KEY" "$CIVICRM_API_KEY"
    
    # n8n
    read -p "N8N_USER (admin username): " N8N_USER
    set_repo_secret "N8N_USER" "$N8N_USER"
    
    read -s -p "N8N_PASSWORD (will be hidden): " N8N_PASSWORD
    echo ""
    set_repo_secret "N8N_PASSWORD" "$N8N_PASSWORD"
    
    echo ""
    log_info "=== Step 5: Organization Secrets (Optional) ==="
    
    read -p "Set Organization Secrets? (y/N): " SET_ORG
    if [[ "$SET_ORG" =~ ^[Yy]$ ]]; then
        read -p "FIGMA_ACCESS_TOKEN: " FIGMA_TOKEN
        set_org_secret "FIGMA_ACCESS_TOKEN" "$FIGMA_TOKEN" "$REPO"
        
        read -p "CODACY_API_TOKEN (optional, press Enter to skip): " CODACY_TOKEN
        if [ -n "$CODACY_TOKEN" ]; then
            set_org_secret "CODACY_API_TOKEN" "$CODACY_TOKEN" "$REPO"
        fi
    fi
    
    echo ""
    log_info "=== Step 6: Environment Secrets ==="
    
    # Production
    log_info "Setting Production Environment Secrets..."
    read -p "PROD_DATABASE_URL: " PROD_DB_URL
    set_env_secret "production" "DATABASE_URL" "$PROD_DB_URL"
    set_env_secret "production" "API_BASE_URL" "https://api.menschlichkeit-oesterreich.at"
    set_env_secret "production" "LOG_LEVEL" "info"
    
    # Staging
    log_info "Setting Staging Environment Secrets..."
    read -p "STAGING_DATABASE_URL: " STAGING_DB_URL
    set_env_secret "staging" "DATABASE_URL" "$STAGING_DB_URL"
    set_env_secret "staging" "API_BASE_URL" "https://api.stg.menschlichkeit-oesterreich.at"
    set_env_secret "staging" "LOG_LEVEL" "debug"
    
    echo ""
    log_info "=== Step 7: Validation ==="
    
    # List all secrets (names only)
    log_info "Repository Secrets:"
    gh secret list --repo "$ORG/$REPO"
    
    echo ""
    log_info "✅ Bootstrap completed!"
    echo ""
    log_warn "⚠️ NEXT STEPS:"
    echo "1. Update database passwords on servers with generated values"
    echo "2. Run validation: npm run validate:secrets"
    echo "3. Test deployment with new secrets"
    echo "4. Document any custom secrets in docs/security/secrets-catalog.md"
    echo ""
    log_info "📝 Secrets are encrypted and only visible to authorized users."
}

# Run main function
main "$@"
