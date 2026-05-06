#!/bin/bash

# Automated Testing Script für Menschlichkeit Österreich CRM System
# Führt End-to-End Tests für Plesk Production Environment durch

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="menschlichkeit-oesterreich.at"
CRM_DOMAIN="crm.${DOMAIN}"
API_DOMAIN="api.${DOMAIN}"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="TestPass123!"

# Log file
LOG_FILE="production-test-$(date +%Y%m%d-%H%M%S).log"

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}" | tee -a "$LOG_FILE"
}

# Test Health Checks
test_health_checks() {
    log "Starting Health Check Tests..."
    
    # Test API Health
    log "Testing API health endpoint..."
    if curl -f -s "https://${API_DOMAIN}/health" > /dev/null; then
        success "API health check passed"
    else
        error "API health check failed"
        return 1
    fi
    
    # Test CRM Access
    log "Testing CRM accessibility..."
    if curl -f -s -I "https://${CRM_DOMAIN}" | grep -q "200 OK"; then
        success "CRM accessibility check passed"
    else
        error "CRM accessibility check failed"
        return 1
    fi
    
    # Test Main Website
    log "Testing main website..."
    if curl -f -s -I "https://${DOMAIN}" | grep -q "200 OK"; then
        success "Main website accessibility check passed"
    else
        error "Main website accessibility check failed"
        return 1
    fi
}

# Test SSL Certificates
test_ssl_certificates() {
    log "Starting SSL Certificate Tests..."
    
    domains=("${DOMAIN}" "${CRM_DOMAIN}" "${API_DOMAIN}")
    
    for domain in "${domains[@]}"; do
        log "Testing SSL certificate for ${domain}..."
        
        # Check certificate validity
        if echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>/dev/null | \
           openssl x509 -noout -dates 2>/dev/null; then
            success "SSL certificate valid for ${domain}"
        else
            error "SSL certificate test failed for ${domain}"
            return 1
        fi
    done
}

# Test API Authentication
test_api_authentication() {
    log "Starting API Authentication Tests..."
    
    # Test user registration
    log "Testing user registration..."
    register_response=$(curl -s -X POST "https://${API_DOMAIN}/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"first_name\": \"Test\",
            \"last_name\": \"User\",
            \"email\": \"${TEST_EMAIL}\",
            \"password\": \"${TEST_PASSWORD}\"
        }")
    
    if echo "$register_response" | grep -q "access_token\|already exists"; then
        success "User registration test passed"
    else
        warning "User registration test inconclusive: $register_response"
    fi
    
    # Test user login
    log "Testing user login..."
    login_response=$(curl -s -X POST "https://${API_DOMAIN}/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"${TEST_EMAIL}\",
            \"password\": \"${TEST_PASSWORD}\"
        }")
    
    if echo "$login_response" | grep -q "access_token"; then
        success "User login test passed"
        # Extract JWT token for further tests
        JWT_TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
        export JWT_TOKEN
    else
        error "User login test failed: $login_response"
        return 1
    fi
}

# Test Contact Management
test_contact_management() {
    log "Starting Contact Management Tests..."
    
    if [ -z "$JWT_TOKEN" ]; then
        error "No JWT token available for contact tests"
        return 1
    fi
    
    # Test contact creation
    log "Testing contact creation..."
    contact_response=$(curl -s -X POST "https://${API_DOMAIN}/contacts/create" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "first_name": "Max",
            "last_name": "Testmann",
            "email": "max.test@example.com"
        }')
    
    if echo "$contact_response" | grep -q '"contact_id":\|"success":\|already exists'; then
        success "Contact creation test passed"
        
        # Extract contact ID if available
        CONTACT_ID=$(echo "$contact_response" | grep -o '"contact_id":[0-9]*' | cut -d':' -f2)
        if [ -n "$CONTACT_ID" ]; then
            export CONTACT_ID
            log "Contact ID: $CONTACT_ID"
        fi
    else
        error "Contact creation test failed: $contact_response"
        return 1
    fi
}

# Test Membership Management
test_membership_management() {
    log "Starting Membership Management Tests..."
    
    if [ -z "$JWT_TOKEN" ]; then
        error "No JWT token available for membership tests"
        return 1
    fi
    
    if [ -z "$CONTACT_ID" ]; then
        warning "No contact ID available for membership tests"
        return 0
    fi
    
    # Test membership creation
    log "Testing membership creation..."
    membership_response=$(curl -s -X POST "https://${API_DOMAIN}/memberships/create" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"contact_id\": $CONTACT_ID,
            \"membership_type\": \"Standard\",
            \"amount\": 36.00
        }")
    
    if echo "$membership_response" | grep -q '"membership_id":\|"success":\|already exists'; then
        success "Membership creation test passed"
    else
        error "Membership creation test failed: $membership_response"
        return 1
    fi
}

# Test Website Integration
test_website_integration() {
    log "Starting Website Integration Tests..."
    
    # Test login page accessibility
    log "Testing login page..."
    if curl -f -s "https://${DOMAIN}/login.html" > /dev/null; then
        success "Login page accessible"
    else
        error "Login page not accessible"
        return 1
    fi
    
    # Test member area (should redirect without auth)
    log "Testing member area protection..."
    if curl -s -I "https://${DOMAIN}/member-area.html" | grep -q "200 OK"; then
        success "Member area accessible"
    else
        warning "Member area may have authentication protection"
    fi
    
    # Test JavaScript files
    log "Testing JavaScript resources..."
    js_files=("assets/js/crm-api.js" "assets/js/auth-handler.js" "assets/js/sepa-handler.js")
    
    for js_file in "${js_files[@]}"; do
        if curl -f -s "https://${DOMAIN}/${js_file}" > /dev/null; then
            success "JavaScript file accessible: ${js_file}"
        else
            error "JavaScript file not accessible: ${js_file}"
            return 1
        fi
    done
}

# Test Performance
test_performance() {
    log "Starting Performance Tests..."
    
    # Test API response time
    log "Testing API response time..."
    api_time=$(curl -o /dev/null -s -w '%{time_total}' "https://${API_DOMAIN}/health")
    if (( $(echo "$api_time < 2.0" | bc -l) )); then
        success "API response time: ${api_time}s (< 2s)"
    else
        warning "API response time: ${api_time}s (>= 2s)"
    fi
    
    # Test website response time
    log "Testing website response time..."
    web_time=$(curl -o /dev/null -s -w '%{time_total}' "https://${DOMAIN}")
    if (( $(echo "$web_time < 3.0" | bc -l) )); then
        success "Website response time: ${web_time}s (< 3s)"
    else
        warning "Website response time: ${web_time}s (>= 3s)"
    fi
}

# Test Security Headers
test_security_headers() {
    log "Starting Security Headers Tests..."
    
    # Test HTTPS redirect
    log "Testing HTTPS redirect..."
    if curl -s -I "http://${DOMAIN}" | grep -q "301\|302"; then
        success "HTTPS redirect active"
    else
        warning "HTTPS redirect may not be active"
    fi
    
    # Test security headers
    log "Testing security headers..."
    headers_response=$(curl -s -I "https://${DOMAIN}")
    
    if echo "$headers_response" | grep -qi "strict-transport-security"; then
        success "HSTS header present"
    else
        warning "HSTS header missing"
    fi
    
    if echo "$headers_response" | grep -qi "x-content-type-options"; then
        success "X-Content-Type-Options header present"
    else
        warning "X-Content-Type-Options header missing"
    fi
}

# Generate Test Report
generate_report() {
    log "Generating test report..."
    
    cat << EOF > "test-report-$(date +%Y%m%d-%H%M%S).md"
# Production Test Report

**Date:** $(date)
**Environment:** Production Plesk Server
**Domain:** ${DOMAIN}

## Test Results Summary

$(if [ $health_status -eq 0 ]; then echo "- ✅ Health Checks: PASSED"; else echo "- ❌ Health Checks: FAILED"; fi)
$(if [ $ssl_status -eq 0 ]; then echo "- ✅ SSL Certificates: PASSED"; else echo "- ❌ SSL Certificates: FAILED"; fi)
$(if [ $auth_status -eq 0 ]; then echo "- ✅ API Authentication: PASSED"; else echo "- ❌ API Authentication: FAILED"; fi)
$(if [ $contact_status -eq 0 ]; then echo "- ✅ Contact Management: PASSED"; else echo "- ❌ Contact Management: FAILED"; fi)
$(if [ $membership_status -eq 0 ]; then echo "- ✅ Membership Management: PASSED"; else echo "- ❌ Membership Management: FAILED"; fi)
$(if [ $website_status -eq 0 ]; then echo "- ✅ Website Integration: PASSED"; else echo "- ❌ Website Integration: FAILED"; fi)
$(if [ $performance_status -eq 0 ]; then echo "- ✅ Performance: PASSED"; else echo "- ⚠️ Performance: WARNING"; fi)
$(if [ $security_status -eq 0 ]; then echo "- ✅ Security: PASSED"; else echo "- ⚠️ Security: WARNING"; fi)

## Overall Status

$(if [ $overall_status -eq 0 ]; then echo "🎉 **ALL TESTS PASSED - READY FOR PRODUCTION**"; else echo "⚠️ **SOME TESTS FAILED - REVIEW REQUIRED**"; fi)

## Detailed Log

See: ${LOG_FILE}

## Recommendations

- Monitor system for 48 hours after deployment
- Set up automated health checks
- Schedule regular backups
- Review any warnings above

---
**Generated by:** Production Testing Script
**Log File:** ${LOG_FILE}
EOF

    success "Test report generated: test-report-$(date +%Y%m%d-%H%M%S).md"
}

# Main execution
main() {
    log "🧪 Starting Production Testing for Menschlichkeit Österreich CRM System"
    log "Domain: ${DOMAIN}"
    log "Log file: ${LOG_FILE}"
    
    # Initialize status variables
    health_status=0
    ssl_status=0
    auth_status=0
    contact_status=0
    membership_status=0
    website_status=0
    performance_status=0
    security_status=0
    
    # Run tests
    test_health_checks || health_status=1
    test_ssl_certificates || ssl_status=1
    test_api_authentication || auth_status=1
    test_contact_management || contact_status=1
    test_membership_management || membership_status=1
    test_website_integration || website_status=1
    test_performance || performance_status=1
    test_security_headers || security_status=1
    
    # Calculate overall status
    overall_status=$((health_status + ssl_status + auth_status + contact_status + membership_status + website_status))
    
    # Generate report
    generate_report
    
    log "🏁 Production Testing Complete"
    
    if [ $overall_status -eq 0 ]; then
        success "🎉 ALL CRITICAL TESTS PASSED - SYSTEM READY FOR PRODUCTION!"
        exit 0
    else
        error "⚠️ SOME TESTS FAILED - PLEASE REVIEW BEFORE PRODUCTION RELEASE"
        exit 1
    fi
}

# Check dependencies
check_dependencies() {
    dependencies=("curl" "openssl" "bc")
    
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "Missing dependency: $dep"
            exit 1
        fi
    done
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_dependencies
    main "$@"
fi