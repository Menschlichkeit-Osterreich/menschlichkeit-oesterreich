#!/bin/bash
set -euo pipefail

# ==============================================================================
# Kibana Dashboard & Index Pattern Import Script
# 
# Lädt alle Dashboards und Index-Pattern in Kibana
# GDPR-compliant monitoring setup für logs.menschlichkeit-oesterreich.at
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIBANA_URL="${KIBANA_URL:-http://localhost:5601}"
DASHBOARDS_DIR="${SCRIPT_DIR}/../kibana/dashboards"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Wait for Kibana to be ready
wait_for_kibana() {
    log_info "Warte auf Kibana-Verfügbarkeit..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "${KIBANA_URL}/api/status" >/dev/null 2>&1; then
            log_success "Kibana ist verfügbar"
            return 0
        fi
        
        log_info "Versuch $attempt/$max_attempts - Warte 10 Sekunden..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Kibana ist nach ${max_attempts} Versuchen nicht verfügbar"
    return 1
}

# Create index patterns
create_index_patterns() {
    log_info "Erstelle Index-Pattern..."
    
    # Index pattern for operational logs
    cat <<EOF | curl -X POST "${KIBANA_URL}/api/saved_objects/index-pattern/logs-operational-pattern" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: true" \
        -d @-
{
  "attributes": {
    "title": "logs-operational-*",
    "timeFieldName": "@timestamp",
    "fields": "[{\"name\":\"@timestamp\",\"type\":\"date\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"service\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"level\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"message\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":false},{\"name\":\"duration_ms\",\"type\":\"number\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"ip_masked\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"user_id\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"tags\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true}]"
  }
}
EOF
    
    # Index pattern for compliance logs
    cat <<EOF | curl -X POST "${KIBANA_URL}/api/saved_objects/index-pattern/logs-compliance-pattern" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: true" \
        -d @-
{
  "attributes": {
    "title": "logs-compliance-*",
    "timeFieldName": "@timestamp",
    "fields": "[{\"name\":\"@timestamp\",\"type\":\"date\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"gdpr_event\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"consent_action\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"data_subject_id\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"retention_category\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"pii_detected\",\"type\":\"boolean\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"pii_type\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true}]"
  }
}
EOF
    
    # Index pattern for security audit logs
    cat <<EOF | curl -X POST "${KIBANA_URL}/api/saved_objects/index-pattern/logs-security-audit-pattern" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: true" \
        -d @-
{
  "attributes": {
    "title": "logs-security-audit-*",
    "timeFieldName": "@timestamp",
    "fields": "[{\"name\":\"@timestamp\",\"type\":\"date\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"security_event\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"pii_bypass_detected\",\"type\":\"boolean\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"pii_bypass_severity_score\",\"type\":\"number\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"failed_attempts_count\",\"type\":\"number\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"authentication_method\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"authentication_result\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true},{\"name\":\"ip_masked\",\"type\":\"string\",\"searchable\":true,\"aggregatable\":true}]"
  }
}
EOF

    log_success "Index-Pattern erstellt"
}

# Import dashboard
import_dashboard() {
    local dashboard_file="$1"
    local dashboard_name=$(basename "$dashboard_file" .ndjson)
    
    log_info "Importiere Dashboard: $dashboard_name"
    
    if [ ! -f "$dashboard_file" ]; then
        log_error "Dashboard-Datei nicht gefunden: $dashboard_file"
        return 1
    fi
    
    # Import dashboard using Kibana API
    local response=$(curl -s -X POST "${KIBANA_URL}/api/saved_objects/_import" \
        -H "kbn-xsrf: true" \
        -F "file=@${dashboard_file}")
    
    # Check if import was successful
    if echo "$response" | jq -e '.success' >/dev/null 2>&1; then
        log_success "Dashboard erfolgreich importiert: $dashboard_name"
        
        # Log imported objects
        local imported_count=$(echo "$response" | jq '.successCount // 0')
        log_info "Anzahl importierter Objekte: $imported_count"
    else
        log_error "Fehler beim Importieren von Dashboard: $dashboard_name"
        echo "Response: $response"
        return 1
    fi
}

# Set default index pattern
set_default_index_pattern() {
    log_info "Setze Standard-Index-Pattern..."
    
    curl -X POST "${KIBANA_URL}/api/kibana/settings/defaultIndex" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: true" \
        -d '{"value": "logs-operational-pattern"}'
    
    log_success "Standard-Index-Pattern gesetzt: logs-operational-pattern"
}

# Main execution
main() {
    log_info "=== Kibana Dashboard Import gestartet ==="
    log_info "Kibana URL: $KIBANA_URL"
    log_info "Dashboards-Verzeichnis: $DASHBOARDS_DIR"
    
    # Check dependencies
    if ! command -v curl >/dev/null 2>&1; then
        log_error "curl ist nicht installiert"
        exit 1
    fi
    
    if ! command -v jq >/dev/null 2>&1; then
        log_error "jq ist nicht installiert"
        exit 1
    fi
    
    # Wait for Kibana
    if ! wait_for_kibana; then
        exit 1
    fi
    
    # Create index patterns first
    create_index_patterns
    
    # Import all dashboards
    local dashboard_count=0
    local success_count=0
    
    if [ -d "$DASHBOARDS_DIR" ]; then
        for dashboard_file in "$DASHBOARDS_DIR"/*.ndjson; do
            if [ -f "$dashboard_file" ]; then
                ((dashboard_count++))
                if import_dashboard "$dashboard_file"; then
                    ((success_count++))
                fi
            fi
        done
    else
        log_warning "Dashboards-Verzeichnis nicht gefunden: $DASHBOARDS_DIR"
    fi
    
    # Set default index pattern
    set_default_index_pattern
    
    # Summary
    log_info "=== Import Summary ==="
    log_info "Gefundene Dashboards: $dashboard_count"
    log_info "Erfolgreich importiert: $success_count"
    
    if [ $success_count -eq $dashboard_count ] && [ $dashboard_count -gt 0 ]; then
        log_success "✅ Alle Dashboards erfolgreich importiert!"
        log_info "Öffne Kibana: $KIBANA_URL/app/dashboards"
    else
        log_error "❌ Nicht alle Dashboards konnten importiert werden"
        exit 1
    fi
}

# Execute main function
main "$@"