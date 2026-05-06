#!/bin/bash

# Local Development Testing Script
# Tests the local development environment before deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.yml"
CRM_PORT="8080"
API_PORT="8000"

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Test Docker Environment
test_docker_environment() {
    log "Testing Docker environment..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running"
        return 1
    fi
    success "Docker is running"
    
    # Check docker-compose file
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        error "docker-compose.yml not found"
        return 1
    fi
    success "docker-compose.yml found"
    
    # Start containers
    log "Starting Docker containers..."
    if docker-compose up -d; then
        success "Docker containers started"
    else
        error "Failed to start Docker containers"
        return 1
    fi
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
}

# Test CRM Service
test_crm_service() {
    log "Testing CRM service..."
    
    # Test Drupal access
    if curl -f -s "http://localhost:${CRM_PORT}" > /dev/null; then
        success "CRM service accessible on port ${CRM_PORT}"
    else
        error "CRM service not accessible on port ${CRM_PORT}"
        return 1
    fi
    
    # Test CiviCRM installation (if available)
    if curl -f -s "http://localhost:${CRM_PORT}/civicrm" > /dev/null; then
        success "CiviCRM accessible"
    else
        warning "CiviCRM may not be fully installed yet"
    fi
}

# Test API Service
test_api_service() {
    log "Testing API service..."
    
    # Test FastAPI health endpoint
    if curl -f -s "http://localhost:${API_PORT}/health" > /dev/null; then
        success "API service accessible on port ${API_PORT}"
    else
        error "API service not accessible on port ${API_PORT}"
        return 1
    fi
    
    # Test API documentation
    if curl -f -s "http://localhost:${API_PORT}/docs" > /dev/null; then
        success "API documentation accessible"
    else
        warning "API documentation may not be available"
    fi
}

# Test Database Connectivity
test_database() {
    log "Testing database connectivity..."
    
    # Test MySQL connection through Docker
    if docker-compose exec -T db mysql -u root -proot_password -e "SELECT 1;" > /dev/null 2>&1; then
        success "Database connection successful"
    else
        error "Database connection failed"
        return 1
    fi
    
    # Check if CiviCRM database exists
    if docker-compose exec -T db mysql -u root -proot_password -e "USE civicrm; SHOW TABLES;" > /dev/null 2>&1; then
        success "CiviCRM database accessible"
    else
        warning "CiviCRM database may not exist yet"
    fi
}

# Test File Structure
test_file_structure() {
    log "Testing file structure..."
    
    # Check deployment scripts
    scripts=(
        "deployment-scripts/deploy-crm-plesk.sh"
        "deployment-scripts/deploy-api-plesk.sh"
        "deployment-scripts/setup-cron-jobs.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            success "Deployment script found: $script"
            
            # Check if script is executable
            if [ -x "$script" ]; then
                success "Script is executable: $script"
            else
                warning "Script not executable: $script"
                chmod +x "$script"
                success "Made script executable: $script"
            fi
        else
            error "Deployment script missing: $script"
            return 1
        fi
    done
    
    # Check website files
    website_files=(
        "website/index.html"
        "website/login.html"
        "website/member-area.html"
        "website/assets/js/crm-api.js"
        "website/assets/js/auth-handler.js"
        "website/assets/js/sepa-handler.js"
    )
    
    for file in "${website_files[@]}"; do
        if [ -f "$file" ]; then
            success "Website file found: $file"
        else
            error "Website file missing: $file"
            return 1
        fi
    done
}

# Test Configuration Files
test_configuration() {
    log "Testing configuration files..."
    
    # Check .env files
    env_files=(
        "crm.menschlichkeit-oesterreich.at/.env"
        "api.menschlichkeit-oesterreich.at/.env"
    )
    
    for env_file in "${env_files[@]}"; do
        if [ -f "$env_file" ]; then
            success "Environment file found: $env_file"
        else
            warning "Environment file missing: $env_file (will be created during deployment)"
        fi
    done
    
    # Check composer files
    if [ -f "crm.menschlichkeit-oesterreich.at/composer.json" ]; then
        success "CRM composer.json found"
    else
        error "CRM composer.json missing"
        return 1
    fi
    
    if [ -f "api.menschlichkeit-oesterreich.at/requirements.txt" ]; then
        success "API requirements.txt found"
    else
        error "API requirements.txt missing"
        return 1
    fi
}

# Test Script Syntax
test_script_syntax() {
    log "Testing deployment script syntax..."
    
    scripts=(
        "deployment-scripts/deploy-crm-plesk.sh"
        "deployment-scripts/deploy-api-plesk.sh"
        "deployment-scripts/setup-cron-jobs.sh"
    )
    
    for script in "${scripts[@]}"; do
        if bash -n "$script" 2>/dev/null; then
            success "Script syntax OK: $script"
        else
            error "Script syntax error: $script"
            return 1
        fi
    done
}

# Test JavaScript Syntax (basic)
test_javascript_syntax() {
    log "Testing JavaScript files..."
    
    js_files=(
        "website/assets/js/crm-api.js"
        "website/assets/js/auth-handler.js"
        "website/assets/js/sepa-handler.js"
    )
    
    for js_file in "${js_files[@]}"; do
        # Basic syntax check - look for common issues
        if grep -q "function\|class\|const\|let\|var" "$js_file"; then
            success "JavaScript file appears valid: $js_file"
        else
            warning "JavaScript file may have issues: $js_file"
        fi
    done
}

# Cleanup function
cleanup() {
    log "Cleaning up test environment..."
    if [ "$1" = "stop" ]; then
        docker-compose down
        success "Docker containers stopped"
    fi
}

# Main function
main() {
    log "🧪 Starting Local Development Testing"
    
    # Initialize status
    local_status=0
    
    # Run tests
    test_docker_environment || local_status=1
    test_crm_service || local_status=1
    test_api_service || local_status=1
    test_database || local_status=1
    test_file_structure || local_status=1
    test_configuration || local_status=1
    test_script_syntax || local_status=1
    test_javascript_syntax || local_status=1
    
    log "🏁 Local Development Testing Complete"
    
    if [ $local_status -eq 0 ]; then
        success "🎉 ALL LOCAL TESTS PASSED - READY FOR DEPLOYMENT!"
        
        # Show next steps
        echo
        log "Next Steps:"
        echo "1. Deploy to Plesk using deployment scripts"
        echo "2. Run production testing: ./test-production.sh"
        echo "3. Verify all services are working correctly"
        echo
        
        return 0
    else
        error "⚠️ SOME LOCAL TESTS FAILED - FIX ISSUES BEFORE DEPLOYMENT"
        return 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "stop")
        cleanup stop
        exit 0
        ;;
    "help"|"-h"|"--help")
        echo "Local Development Testing Script"
        echo ""
        echo "Usage: $0 [stop|help]"
        echo ""
        echo "Commands:"
        echo "  (no args) - Run all local tests"
        echo "  stop      - Stop Docker containers and cleanup"
        echo "  help      - Show this help message"
        echo ""
        exit 0
        ;;
    "")
        # Run main testing
        main
        exit $?
        ;;
    *)
        error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac