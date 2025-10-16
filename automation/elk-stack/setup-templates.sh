#!/bin/bash

################################################################################
# Elasticsearch Index Templates and ILM Policies Setup
# 
# Project: F-03 Phase 4 - Centralized Log Aggregation
# Purpose: Install Elasticsearch index templates and ILM policies for log retention
# 
# Usage:
#   ./setup-templates.sh [ELASTICSEARCH_URL] [ELASTICSEARCH_PASSWORD]
# 
# Example:
#   ./setup-templates.sh http://localhost:9200 changeme
# 
# Environment Variables:
#   ELASTICSEARCH_URL      - Elasticsearch endpoint (default: http://localhost:9200)
#   ELASTIC_PASSWORD       - Elasticsearch password (default: changeme)
################################################################################

set -euo pipefail

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="${SCRIPT_DIR}/elasticsearch/templates"
ELASTICSEARCH_URL="${1:-${ELASTICSEARCH_URL:-http://localhost:9200}}"
ELASTIC_PASSWORD="${2:-${ELASTIC_PASSWORD:-changeme}}"

# Log functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Elasticsearch connection
check_elasticsearch() {
    log_info "Checking Elasticsearch connection at ${ELASTICSEARCH_URL}..."
    
    if ! curl -sf -u "elastic:${ELASTIC_PASSWORD}" "${ELASTICSEARCH_URL}/_cluster/health" > /dev/null; then
        log_error "Cannot connect to Elasticsearch at ${ELASTICSEARCH_URL}"
        log_error "Please ensure Elasticsearch is running and credentials are correct."
        exit 1
    fi
    
    log_info "Elasticsearch connection successful!"
}

# Install ILM Policy
install_ilm_policy() {
    local policy_file="$1"
    local policy_name=$(jq -r '.policy' "${policy_file}")
    
    log_info "Installing ILM policy: ${policy_name}"
    
    # Remove "policy" key from JSON (Elasticsearch API expects policy name in URL)
    local policy_body=$(jq 'del(.policy)' "${policy_file}")
    
    local response=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
        -X PUT "${ELASTICSEARCH_URL}/_ilm/policy/${policy_name}" \
        -H 'Content-Type: application/json' \
        -d "${policy_body}")
    
    if echo "${response}" | jq -e '.acknowledged' > /dev/null 2>&1; then
        log_info "✓ ILM policy '${policy_name}' installed successfully"
    else
        log_error "✗ Failed to install ILM policy '${policy_name}'"
        echo "${response}" | jq .
        return 1
    fi
}

# Install Index Template
install_index_template() {
    local template_file="$1"
    local template_name=$(basename "${template_file}" .json)
    
    log_info "Installing index template: ${template_name}"
    
    local response=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
        -X PUT "${ELASTICSEARCH_URL}/_index_template/${template_name}" \
        -H 'Content-Type: application/json' \
        -d @"${template_file}")
    
    if echo "${response}" | jq -e '.acknowledged' > /dev/null 2>&1; then
        log_info "✓ Index template '${template_name}' installed successfully"
    else
        log_error "✗ Failed to install index template '${template_name}'"
        echo "${response}" | jq .
        return 1
    fi
}

# Create initial indices with aliases
create_initial_indices() {
    log_info "Creating initial indices with aliases..."
    
    # logs-operational
    local response=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
        -X PUT "${ELASTICSEARCH_URL}/logs-operational-000001" \
        -H 'Content-Type: application/json' \
        -d '{
            "aliases": {
                "logs-operational": {
                    "is_write_index": true
                }
            }
        }')
    
    if echo "${response}" | jq -e '.acknowledged' > /dev/null 2>&1; then
        log_info "✓ Index 'logs-operational-000001' created"
    else
        log_warning "Index 'logs-operational-000001' may already exist"
    fi
    
    # logs-compliance
    response=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
        -X PUT "${ELASTICSEARCH_URL}/logs-compliance-000001" \
        -H 'Content-Type: application/json' \
        -d '{
            "aliases": {
                "logs-compliance": {
                    "is_write_index": true
                }
            }
        }')
    
    if echo "${response}" | jq -e '.acknowledged' > /dev/null 2>&1; then
        log_info "✓ Index 'logs-compliance-000001' created"
    else
        log_warning "Index 'logs-compliance-000001' may already exist"
    fi
    
    # logs-security-audit
    response=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" \
        -X PUT "${ELASTICSEARCH_URL}/logs-security-audit-000001" \
        -H 'Content-Type: application/json' \
        -d '{
            "aliases": {
                "logs-security-audit": {
                    "is_write_index": true
                }
            }
        }')
    
    if echo "${response}" | jq -e '.acknowledged' > /dev/null 2>&1; then
        log_info "✓ Index 'logs-security-audit-000001' created"
    else
        log_warning "Index 'logs-security-audit-000001' may already exist"
    fi
}

# Verify installation
verify_installation() {
    log_info "Verifying installation..."
    
    # Check ILM policies
    log_info "Installed ILM policies:"
    curl -s -u "elastic:${ELASTIC_PASSWORD}" "${ELASTICSEARCH_URL}/_ilm/policy" | \
        jq -r 'keys | .[]' | grep -E "operational-retention|compliance-retention|security-audit-retention" || true
    
    # Check index templates
    log_info "Installed index templates:"
    curl -s -u "elastic:${ELASTIC_PASSWORD}" "${ELASTICSEARCH_URL}/_index_template" | \
        jq -r '.index_templates[].name' | grep -E "logs-operational|logs-compliance|logs-security-audit" || true
    
    # Check indices
    log_info "Created indices:"
    curl -s -u "elastic:${ELASTIC_PASSWORD}" "${ELASTICSEARCH_URL}/_cat/indices/logs-*?v" || true
}

# Main execution
main() {
    log_info "Starting Elasticsearch setup..."
    log_info "Elasticsearch URL: ${ELASTICSEARCH_URL}"
    
    # Check dependencies
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed."
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed."
        exit 1
    fi
    
    # Check Elasticsearch connection
    check_elasticsearch
    
    # Install ILM policies first (required by index templates)
    log_info ""
    log_info "============================================"
    log_info "Installing ILM Policies"
    log_info "============================================"
    
    install_ilm_policy "${TEMPLATES_DIR}/ilm-operational-30d.json"
    install_ilm_policy "${TEMPLATES_DIR}/ilm-compliance-1y.json"
    install_ilm_policy "${TEMPLATES_DIR}/ilm-security-audit-7y.json"
    
    # Install index templates
    log_info ""
    log_info "============================================"
    log_info "Installing Index Templates"
    log_info "============================================"
    
    install_index_template "${TEMPLATES_DIR}/logs-operational-template.json"
    install_index_template "${TEMPLATES_DIR}/logs-compliance-template.json"
    install_index_template "${TEMPLATES_DIR}/logs-security-audit-template.json"
    
    # Create initial indices
    log_info ""
    log_info "============================================"
    log_info "Creating Initial Indices"
    log_info "============================================"
    
    create_initial_indices
    
    # Verify installation
    log_info ""
    log_info "============================================"
    log_info "Verification"
    log_info "============================================"
    
    verify_installation
    
    log_info ""
    log_info "============================================"
    log_info "Setup Complete!"
    log_info "============================================"
    log_info ""
    log_info "Next steps:"
    log_info "1. Start Logstash: cd automation/elk-stack && docker-compose up -d logstash"
    log_info "2. Configure Filebeat to send logs to Logstash (port 5044)"
    log_info "3. Access Kibana at http://localhost:5601 to create dashboards"
    log_info ""
}

# Execute main function
main "$@"
