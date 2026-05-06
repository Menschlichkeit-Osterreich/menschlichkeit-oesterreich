#!/bin/bash
# =============================================================================
# Plesk Cron Jobs Setup for CiviCRM
# Configure scheduled tasks for the canonical CRM portal/native split runtime
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

PLESK_ROOT="/var/www/vhosts/menschlichkeit-oesterreich.at"
CRM_PORTAL_ROOT="${PLESK_ROOT}/subdomains/crm/httpdocs"
CRM_NATIVE_ROOT="${CRM_PORTAL_ROOT}/native"
CRM_BUILD_ROOT="${CRM_PORTAL_ROOT}/.native-build"
CRON_SCRIPTS_DIR="${CRM_PORTAL_ROOT}/private/cron"
LOG_DIR="${CRM_PORTAL_ROOT}/private/logs"
SETUP_INFO_FILE="${CRM_PORTAL_ROOT}/private/cron-setup-info.txt"
DRUSH_PATH="${CRM_BUILD_ROOT}/vendor/bin/drush"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@menschlichkeit-oesterreich.at}"

if [[ -x "/opt/plesk/php/8.4/bin/php" ]]; then
    PHP_BINARY="/opt/plesk/php/8.4/bin/php"
elif [[ -x "/opt/plesk/php/8.3/bin/php" ]]; then
    PHP_BINARY="/opt/plesk/php/8.3/bin/php"
else
    PHP_BINARY="/usr/bin/php"
fi

if [[ ! -x "$PHP_BINARY" ]]; then
    log_error "PHP binary not found: $PHP_BINARY"
    log_info "Available PHP binaries:"
    find /opt/plesk/php -name "php" -type f 2>/dev/null || echo "No Plesk PHP found"
    command -v php && echo "System PHP: $(which php)" || echo "No system PHP found"
    exit 1
fi

log_info "Using PHP binary: $PHP_BINARY"
log_info "CRM portal root: $CRM_PORTAL_ROOT"
log_info "CRM native root: $CRM_NATIVE_ROOT"
log_info "CRM build root: $CRM_BUILD_ROOT"

if [[ ! -d "$CRM_PORTAL_ROOT" ]]; then
    log_error "CRM portal root not found: $CRM_PORTAL_ROOT"
    exit 1
fi

if [[ ! -d "$CRM_NATIVE_ROOT" ]]; then
    log_error "CRM native root not found: $CRM_NATIVE_ROOT"
    log_info "Expected native runtime under /native/"
    exit 1
fi

if [[ ! -x "$DRUSH_PATH" ]]; then
    log_error "Drush not found: $DRUSH_PATH"
    log_info "Expected composer build under .native-build/vendor/bin/drush"
    exit 1
fi

log_info "Testing Drush bootstrap..."
if ! "$PHP_BINARY" "$DRUSH_PATH" --root="$CRM_NATIVE_ROOT" status --field=bootstrap 2>/dev/null | grep -qi "Successful"; then
    log_error "Drush bootstrap failed for native runtime"
    exit 1
fi

mkdir -p "$CRON_SCRIPTS_DIR" "$LOG_DIR"
touch "$LOG_DIR/civicrm-cron.log" "$LOG_DIR/drupal-cron.log" "$LOG_DIR/civicrm-maintenance.log" "$LOG_DIR/sepa-processing.log" "$LOG_DIR/maintenance.log"
chmod -R 750 "$LOG_DIR"

log_info "Creating cron job scripts..."

cat > "$CRON_SCRIPTS_DIR/civicrm-scheduled-jobs.sh" << EOF
#!/bin/bash
set -euo pipefail
cd "$CRM_PORTAL_ROOT"
"$PHP_BINARY" "$DRUSH_PATH" --root="$CRM_NATIVE_ROOT" --quiet civicrm-api job.execute >> "$LOG_DIR/civicrm-cron.log" 2>&1
EOF

cat > "$CRON_SCRIPTS_DIR/drupal-cron.sh" << EOF
#!/bin/bash
set -euo pipefail
cd "$CRM_PORTAL_ROOT"
"$PHP_BINARY" "$DRUSH_PATH" --root="$CRM_NATIVE_ROOT" core:cron --quiet >> "$LOG_DIR/drupal-cron.log" 2>&1
EOF

cat > "$CRON_SCRIPTS_DIR/civicrm-cache-clear.sh" << EOF
#!/bin/bash
set -euo pipefail
cd "$CRM_PORTAL_ROOT"
"$PHP_BINARY" "$DRUSH_PATH" --root="$CRM_NATIVE_ROOT" --quiet civicrm-api system.flush >> "$LOG_DIR/civicrm-maintenance.log" 2>&1
EOF

cat > "$CRON_SCRIPTS_DIR/rotate-logs.sh" << EOF
#!/bin/bash
set -euo pipefail
LOG_DIR="$LOG_DIR"
DATE=\$(date +%Y%m%d)

for file in civicrm-cron.log drupal-cron.log civicrm-maintenance.log sepa-processing.log maintenance.log; do
    if [[ -f "\$LOG_DIR/\$file" ]]; then
        cp "\$LOG_DIR/\$file" "\$LOG_DIR/\$file.\$DATE"
        : > "\$LOG_DIR/\$file"
        gzip -f "\$LOG_DIR/\$file.\$DATE"
    fi
done

find "\$LOG_DIR" -name "*.log.*.gz" -mtime +30 -delete
echo "Log rotation completed on \$(date)" >> "\$LOG_DIR/maintenance.log"
EOF

cat > "$CRON_SCRIPTS_DIR/sepa-processing.sh" << EOF
#!/bin/bash
set -euo pipefail
cd "$CRM_PORTAL_ROOT"

if "$PHP_BINARY" "$DRUSH_PATH" --root="$CRM_NATIVE_ROOT" --quiet civicrm-api extension.get key=org.project60.sepa | grep -q "installed"; then
    "$PHP_BINARY" "$DRUSH_PATH" --root="$CRM_NATIVE_ROOT" --quiet civicrm-api job.sepa_ppbatch >> "$LOG_DIR/sepa-processing.log" 2>&1
    "$PHP_BINARY" "$DRUSH_PATH" --root="$CRM_NATIVE_ROOT" --quiet civicrm-api job.sepa_closegroup >> "$LOG_DIR/sepa-processing.log" 2>&1
    echo "SEPA processing completed on \$(date)" >> "$LOG_DIR/sepa-processing.log"
else
    echo "SEPA extension not installed, skipping SEPA processing" >> "$LOG_DIR/sepa-processing.log"
fi
EOF

cat > "$CRON_SCRIPTS_DIR/check-cron-health.sh" << EOF
#!/bin/bash
set -euo pipefail
LOG_DIR="$LOG_DIR"

check_log_freshness() {
    local logfile="\$1"
    local max_age="\$2"

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
}

echo "=== Cron Job Health Check - \$(date) ==="
check_log_freshness "\$LOG_DIR/civicrm-cron.log" 10
check_log_freshness "\$LOG_DIR/drupal-cron.log" 30
echo ""
echo "Recent errors in CiviCRM log:"
tail -n 20 "\$LOG_DIR/civicrm-cron.log" | grep -i "error\|warning\|fatal" || echo "No recent errors found"
echo ""
echo "Recent errors in Drupal log:"
tail -n 20 "\$LOG_DIR/drupal-cron.log" | grep -i "error\|warning\|fatal" || echo "No recent errors found"
EOF

chmod +x "$CRON_SCRIPTS_DIR"/*.sh

CRONTAB_FILE="/tmp/civicrm-crontab-$(date +%s).txt"
cat > "$CRONTAB_FILE" << EOF
# CiviCRM and Drupal Cron Jobs for Menschlichkeit Österreich
# Generated on $(date)
MAILTO=$ADMIN_EMAIL
*/5 * * * * $CRON_SCRIPTS_DIR/civicrm-scheduled-jobs.sh
*/15 * * * * $CRON_SCRIPTS_DIR/drupal-cron.sh
0 1 * * * $CRON_SCRIPTS_DIR/sepa-processing.sh
0 2 * * * $CRON_SCRIPTS_DIR/civicrm-cache-clear.sh
0 3 * * 0 $CRON_SCRIPTS_DIR/rotate-logs.sh
EOF

cat > "$SETUP_INFO_FILE" << EOF
CiviCRM Cron Jobs Configuration
===============================
Date: $(date)
Portal Root: $CRM_PORTAL_ROOT
Native Root: $CRM_NATIVE_ROOT
Build Root: $CRM_BUILD_ROOT
Scripts Directory: $CRON_SCRIPTS_DIR
Logs Directory: $LOG_DIR
Crontab File: $CRONTAB_FILE
PHP Binary: $PHP_BINARY
Drush Path: $DRUSH_PATH

Scheduled Jobs:
- CiviCRM Jobs: Every 5 minutes
- Drupal Cron: Every 15 minutes
- SEPA Processing: Daily at 1 AM
- Cache Clear: Daily at 2 AM
- Log Rotation: Weekly on Sunday at 3 AM

Installation:
1. Run: crontab $CRONTAB_FILE
2. Verify: crontab -l
3. Test: $CRON_SCRIPTS_DIR/civicrm-scheduled-jobs.sh
4. Monitor: tail -f $LOG_DIR/civicrm-cron.log
EOF

chmod 600 "$SETUP_INFO_FILE"

log_success "Cron scripts created in $CRON_SCRIPTS_DIR"
log_success "Logs directory ready: $LOG_DIR"
log_success "Crontab file generated: $CRONTAB_FILE"
echo ""
log_warning "MANUAL STEPS REQUIRED:"
echo "  1. crontab $CRONTAB_FILE"
echo "  2. bash $CRON_SCRIPTS_DIR/civicrm-scheduled-jobs.sh"
echo "  3. bash $CRON_SCRIPTS_DIR/drupal-cron.sh"
echo "  4. tail -f $LOG_DIR/civicrm-cron.log"
