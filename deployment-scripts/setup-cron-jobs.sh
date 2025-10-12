#!/bin/bash
# =============================================================================
# Plesk Cron Jobs Setup for CiviCRM
# Configure scheduled tasks for CiviCRM maintenance and SEPA processing
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
CRM_ROOT="${PLESK_ROOT}/crm.menschlichkeit-oesterreich.at/httpdocs"
DRUSH_PATH="${CRM_ROOT}/vendor/bin/drush"
PHP_BINARY="/usr/bin/php"

# Email for cron job notifications
ADMIN_EMAIL="admin@menschlichkeit-oesterreich.at"

# =============================================================================
# Pre-flight checks
# =============================================================================

log_info "Setting up CiviCRM cron jobs..."

# Check if CRM directory exists
if [[ ! -d "$CRM_ROOT" ]]; then
    log_error "CRM directory not found: $CRM_ROOT"
    log_info "Please run deploy-crm-plesk.sh first"
    exit 1
fi

# Check if Drush exists
if [[ ! -f "$DRUSH_PATH" ]]; then
    log_error "Drush not found: $DRUSH_PATH"
    exit 1
fi

# Test Drush functionality
log_info "Testing Drush functionality..."
cd "$CRM_ROOT"
if ! $PHP_BINARY "$DRUSH_PATH" status &>/dev/null; then
    log_error "Drush test failed"
    exit 1
fi

log_success "Pre-flight checks passed"

# =============================================================================
# Create cron job scripts
# =============================================================================

log_info "Creating cron job scripts..."

# Create cron scripts directory
CRON_SCRIPTS_DIR="${CRM_ROOT}/../private/cron"
mkdir -p "$CRON_SCRIPTS_DIR"

# CiviCRM Scheduled Jobs (every 5 minutes)
cat > "$CRON_SCRIPTS_DIR/civicrm-scheduled-jobs.sh" << EOF
#!/bin/bash
# CiviCRM Scheduled Jobs Runner
# Runs every 5 minutes

cd "$CRM_ROOT"
$PHP_BINARY "$DRUSH_PATH" -r "$CRM_ROOT/web" --quiet civicrm-api job.execute >> "${CRM_ROOT}/../private/logs/civicrm-cron.log" 2>&1
EOF

# Drupal Cron (every 15 minutes)
cat > "$CRON_SCRIPTS_DIR/drupal-cron.sh" << EOF
#!/bin/bash
# Drupal Cron Runner
# Runs every 15 minutes

cd "$CRM_ROOT"
$PHP_BINARY "$DRUSH_PATH" -r "$CRM_ROOT/web" core:cron --quiet >> "${CRM_ROOT}/../private/logs/drupal-cron.log" 2>&1
EOF

# CiviCRM Cache Clear (daily at 2 AM)
cat > "$CRON_SCRIPTS_DIR/civicrm-cache-clear.sh" << EOF
#!/bin/bash
# CiviCRM Cache Clear
# Runs daily at 2 AM

cd "$CRM_ROOT"
$PHP_BINARY "$DRUSH_PATH" -r "$CRM_ROOT/web" --quiet civicrm-api system.flush >> "${CRM_ROOT}/../private/logs/civicrm-maintenance.log" 2>&1
EOF

# Log rotation (weekly)
cat > "$CRON_SCRIPTS_DIR/rotate-logs.sh" << EOF
#!/bin/bash
# Log Rotation
# Runs weekly on Sunday at 3 AM

LOG_DIR="${CRM_ROOT}/../private/logs"
DATE=\$(date +%Y%m%d)

# Rotate CiviCRM logs
if [[ -f "\$LOG_DIR/civicrm-cron.log" ]]; then
    cp "\$LOG_DIR/civicrm-cron.log" "\$LOG_DIR/civicrm-cron.log.\$DATE"
    echo "" > "\$LOG_DIR/civicrm-cron.log"
    gzip "\$LOG_DIR/civicrm-cron.log.\$DATE"
fi

# Rotate Drupal logs
if [[ -f "\$LOG_DIR/drupal-cron.log" ]]; then
    cp "\$LOG_DIR/drupal-cron.log" "\$LOG_DIR/drupal-cron.log.\$DATE"
    echo "" > "\$LOG_DIR/drupal-cron.log"
    gzip "\$LOG_DIR/drupal-cron.log.\$DATE"
fi

# Remove logs older than 30 days
find "\$LOG_DIR" -name "*.log.*.gz" -mtime +30 -delete

echo "Log rotation completed on \$(date)" >> "\$LOG_DIR/maintenance.log"
EOF

# SEPA Processing (daily at 1 AM) - if SEPA extension is installed
cat > "$CRON_SCRIPTS_DIR/sepa-processing.sh" << EOF
#!/bin/bash
# SEPA Processing
# Runs daily at 1 AM

cd "$CRM_ROOT"

# Check if SEPA extension is installed
if $PHP_BINARY "$DRUSH_PATH" -r "$CRM_ROOT/web" --quiet civicrm-api extension.get key=org.project60.sepa | grep -q "installed"; then
    # Run SEPA batching
    $PHP_BINARY "$DRUSH_PATH" -r "$CRM_ROOT/web" --quiet civicrm-api job.sepa_ppbatch >> "${CRM_ROOT}/../private/logs/sepa-processing.log" 2>&1
    
    # Close SEPA groups
    $PHP_BINARY "$DRUSH_PATH" -r "$CRM_ROOT/web" --quiet civicrm-api job.sepa_closegroup >> "${CRM_ROOT}/../private/logs/sepa-processing.log" 2>&1
    
    echo "SEPA processing completed on \$(date)" >> "${CRM_ROOT}/../private/logs/sepa-processing.log"
else
    echo "SEPA extension not installed, skipping SEPA processing" >> "${CRM_ROOT}/../private/logs/sepa-processing.log"
fi
EOF

# Make scripts executable
chmod +x "$CRON_SCRIPTS_DIR"/*.sh

log_success "Cron scripts created"

# =============================================================================
# Create log directory
# =============================================================================

log_info "Creating log directory..."

LOG_DIR="${CRM_ROOT}/../private/logs"
mkdir -p "$LOG_DIR"

# Create initial log files
touch "$LOG_DIR/civicrm-cron.log"
touch "$LOG_DIR/drupal-cron.log"
touch "$LOG_DIR/civicrm-maintenance.log"
touch "$LOG_DIR/sepa-processing.log"
touch "$LOG_DIR/maintenance.log"

# Set proper permissions
chmod -R 750 "$LOG_DIR"

log_success "Log directory created"

# =============================================================================
# Generate crontab entries
# =============================================================================

log_info "Generating crontab entries..."

CRONTAB_FILE="/tmp/civicrm-crontab-$(date +%s).txt"

cat > "$CRONTAB_FILE" << EOF
# CiviCRM and Drupal Cron Jobs for Menschlichkeit Österreich
# Generated on $(date)

# Set email for notifications
MAILTO=$ADMIN_EMAIL

# CiviCRM Scheduled Jobs - Every 5 minutes
*/5 * * * * $CRON_SCRIPTS_DIR/civicrm-scheduled-jobs.sh

# Drupal Cron - Every 15 minutes
*/15 * * * * $CRON_SCRIPTS_DIR/drupal-cron.sh

# SEPA Processing - Daily at 1 AM
0 1 * * * $CRON_SCRIPTS_DIR/sepa-processing.sh

# Cache Clear - Daily at 2 AM
0 2 * * * $CRON_SCRIPTS_DIR/civicrm-cache-clear.sh

# Log Rotation - Weekly on Sunday at 3 AM
0 3 * * 0 $CRON_SCRIPTS_DIR/rotate-logs.sh
EOF

log_success "Crontab entries generated: $CRONTAB_FILE"

# =============================================================================
# Installation instructions
# =============================================================================

log_info "Cron job setup instructions..."

echo ""
log_warning "📋 MANUAL STEPS REQUIRED:"
echo ""
echo "1. Install the crontab entries:"
echo "   crontab $CRONTAB_FILE"
echo ""
echo "2. Verify cron jobs are installed:"
echo "   crontab -l"
echo ""
echo "3. Test individual scripts:"
echo "   $CRON_SCRIPTS_DIR/civicrm-scheduled-jobs.sh"
echo "   $CRON_SCRIPTS_DIR/drupal-cron.sh"
echo ""
echo "4. Monitor log files:"
echo "   tail -f $LOG_DIR/civicrm-cron.log"
echo "   tail -f $LOG_DIR/drupal-cron.log"
echo ""

# =============================================================================
# Create monitoring script
# =============================================================================

log_info "Creating monitoring script..."

cat > "$CRON_SCRIPTS_DIR/check-cron-health.sh" << EOF
#!/bin/bash
# Cron Job Health Check
# Monitors if cron jobs are running properly

LOG_DIR="$LOG_DIR"
ALERT_EMAIL="$ADMIN_EMAIL"

# Check if logs have been updated recently
check_log_freshness() {
    local logfile="\$1"
    local max_age="\$2"  # in minutes
    
    if [[ ! -f "\$logfile" ]]; then
        echo "ERROR: Log file \$logfile does not exist"
        return 1
    fi
    
    local last_modified=\$(stat -c %Y "\$logfile")
    local current_time=\$(date +%s)
    local age=\$(( (current_time - last_modified) / 60 ))
    
    if [[ \$age -gt \$max_age ]]; then
        echo "WARNING: \$logfile is \$age minutes old (max: \$max_age)"
        return 1
    fi
    
    echo "OK: \$logfile updated \$age minutes ago"
    return 0
}

# Health checks
echo "=== Cron Job Health Check - \$(date) ==="

# Check CiviCRM cron (should run every 5 minutes, alert if older than 10)
check_log_freshness "\$LOG_DIR/civicrm-cron.log" 10

# Check Drupal cron (should run every 15 minutes, alert if older than 30)
check_log_freshness "\$LOG_DIR/drupal-cron.log" 30

# Check for errors in logs
echo ""
echo "Recent errors in CiviCRM log:"
tail -n 20 "\$LOG_DIR/civicrm-cron.log" | grep -i "error\|warning\|fatal" || echo "No recent errors found"

echo ""
echo "Recent errors in Drupal log:"
tail -n 20 "\$LOG_DIR/drupal-cron.log" | grep -i "error\|warning\|fatal" || echo "No recent errors found"

echo ""
echo "=== Health Check Complete ==="
EOF

chmod +x "$CRON_SCRIPTS_DIR/check-cron-health.sh"

# =============================================================================
# Save configuration
# =============================================================================

log_info "Saving cron configuration..."

cat > "${CRM_ROOT}/../private/cron-setup-info.txt" << EOF
CiviCRM Cron Jobs Configuration
===============================
Date: $(date)
Scripts Directory: $CRON_SCRIPTS_DIR
Logs Directory: $LOG_DIR
Crontab File: $CRONTAB_FILE

Scheduled Jobs:
- CiviCRM Jobs: Every 5 minutes
- Drupal Cron: Every 15 minutes
- SEPA Processing: Daily at 1 AM
- Cache Clear: Daily at 2 AM
- Log Rotation: Weekly on Sunday at 3 AM

Monitoring:
- Health Check: $CRON_SCRIPTS_DIR/check-cron-health.sh
- Log Files: $LOG_DIR/

Installation:
1. Run: crontab $CRONTAB_FILE
2. Verify: crontab -l
3. Test: $CRON_SCRIPTS_DIR/civicrm-scheduled-jobs.sh

Troubleshooting:
- Check logs in: $LOG_DIR/
- Run health check: $CRON_SCRIPTS_DIR/check-cron-health.sh
- Email notifications to: $ADMIN_EMAIL
EOF

chmod 600 "${CRM_ROOT}/../private/cron-setup-info.txt"

# =============================================================================
# Final output
# =============================================================================

log_success "=== CRON SETUP COMPLETE ==="
echo ""
log_info "📊 Summary:"
echo "  • 5 cron scripts created"
echo "  • Log directory configured"
echo "  • Monitoring script ready"
echo "  • Crontab entries generated"
echo ""
log_warning "⚠️  NEXT STEPS:"
echo "  1. Install crontab: crontab $CRONTAB_FILE"
echo "  2. Test scripts manually first"
echo "  3. Monitor logs for first 24 hours"
echo "  4. Set up log rotation monitoring"
echo ""
log_info "📋 Configuration saved: ${CRM_ROOT}/../private/cron-setup-info.txt"
echo ""
log_success "🎉 CiviCRM cron jobs ready!"