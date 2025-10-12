#!/bin/bash

# Bash Build Pipeline für Menschlichkeit Österreich Development
# Usage: ./build-pipeline.sh [development|staging|production] [--skip-tests] [--force]

set -euo pipefail

# Default values
ENVIRONMENT="${1:-development}"
SKIP_TESTS=false
FORCE=false

# n8n Webhook Integration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/automation/n8n/webhook-client.js" ]; then
    N8N_WEBHOOK_CLIENT="$SCRIPT_DIR/automation/n8n/webhook-client.js"
    N8N_AVAILABLE=true
else
    N8N_AVAILABLE=false
fi

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        development|staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        *)
            echo "❌ Unknown argument: $1"
            echo "Usage: $0 [development|staging|production] [--skip-tests] [--force]"
            exit 1
            ;;
    esac
done

# Color functions
print_success() {
    echo -e "\e[32m✅ SUCCESS: $1\e[0m"
}

print_error() {
    echo -e "\e[31m❌ ERROR: $1\e[0m"

    # n8n Build Failure Notification
    if [ "$N8N_AVAILABLE" = true ]; then
        echo -e "\e[34m📡 Sending build failure notification...\e[0m"
        node "$N8N_WEBHOOK_CLIENT" build "failed" "$ENVIRONMENT" "$1" || echo -e "\e[33m⚠️ n8n failure notification failed\e[0m"
    fi

    exit 1
}

print_warning() {
    echo -e "\e[33m⚠️  WARNING: $1\e[0m"
}

print_info() {
    echo -e "\e[34m$1\e[0m"
}

echo -e "\e[32m🚀 Starting Build Pipeline for Environment: $ENVIRONMENT\e[0m"

# n8n Build Started Notification
if [ "$N8N_AVAILABLE" = true ]; then
    echo -e "\e[34m📡 Sending build started notification...\e[0m"
    node "$N8N_WEBHOOK_CLIENT" build "started" "$ENVIRONMENT" || echo -e "\e[33m⚠️ n8n notification failed (continuing)\e[0m"
fi

# 1. Environment Checks
print_info "🔧 Checking environment dependencies..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js ist nicht installiert oder nicht im PATH"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm ist nicht verfügbar"
fi

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    print_error "Python ist nicht installiert oder nicht im PATH"
fi

# Check PHP
if ! command -v php &> /dev/null; then
    print_warning "PHP nicht verfügbar - PHP-Projekte werden übersprungen"
fi

print_success "Environment checks completed"

# 2. Install Dependencies
print_info "📦 Installing dependencies..."

# Node.js Dependencies
echo "Installing Node.js packages..."
npm ci --silent || print_error "Failed to install Node.js dependencies"

# PHP Dependencies (if available)
if command -v composer &> /dev/null && [[ -f "composer.json" ]]; then
    echo "Installing PHP packages..."
    composer install --no-dev --optimize-autoloader || print_error "Failed to install PHP dependencies"
fi

# Python Dependencies
if [[ -f "api.menschlichkeit-oesterreich.at/requirements.txt" ]]; then
    echo "Installing Python packages..."
    cd api.menschlichkeit-oesterreich.at
    python3 -m pip install -r requirements.txt || python -m pip install -r requirements.txt || print_error "Failed to install Python dependencies"
    cd ..
fi

print_success "Dependencies installation completed"

# 3. Code Quality Checks
print_info "🔍 Running code quality checks..."

# ESLint
echo "Running ESLint..."
if ! npm run lint &> /dev/null; then
    if [[ "$FORCE" == "false" ]]; then
        print_error "ESLint checks failed. Use --force to override."
    fi
    print_warning "ESLint issues found but continuing due to --force flag"
fi

# Prettier Check
echo "Checking code formatting..."
if ! npx prettier --check . &> /dev/null; then
    if [[ "$FORCE" == "false" ]]; then
        print_error "Code formatting check failed. Use --force to override."
    fi
    print_warning "Formatting issues found but continuing due to --force flag"
fi

print_success "Code quality checks completed"

# 4. Build Projects
print_info "🏗️  Building projects..."

# Build Frontend (Next.js)
if [[ -f "frontend/package.json" ]]; then
    echo "Building Frontend (Next.js)..."
    cd frontend
    npm run build || print_error "Frontend build failed"
    cd ..
fi

# Build Games platform
if [[ -f "web/package.json" ]]; then
    echo "Building Games platform..."
    cd web
    if grep -q '"build":' package.json; then
        npm run build || print_error "Games platform build failed"
    fi
    cd ..
fi

print_success "Build completed successfully"

# 5. Run Tests (unless skipped)
if [[ "$SKIP_TESTS" == "false" ]]; then
    print_info "🧪 Running tests..."

    # Unit Tests
    echo "Running unit tests..."
    if ! npm run test:unit &> /dev/null; then
        if [[ "$FORCE" == "false" ]]; then
            print_error "Unit tests failed. Use --force to override or --skip-tests to skip."
        fi
        print_warning "Unit test failures detected but continuing due to --force flag"
    fi

    # E2E Tests (only in CI or if explicitly requested)
    if [[ "$ENVIRONMENT" == "ci" || "$FORCE" == "true" ]]; then
        echo "Running E2E tests..."
        if ! npm run test:e2e &> /dev/null; then
            if [[ "$FORCE" == "false" ]]; then
                print_error "E2E tests failed. Use --force to override."
            fi
            print_warning "E2E test failures detected but continuing due to --force flag"
        fi
    fi

    print_success "All tests completed"
fi

# 6. Environment-specific tasks
case $ENVIRONMENT in
    development)
        print_info "🔧 Development environment setup complete"
        ;;
    staging)
        print_info "🚀 Staging deployment preparation..."
        # Additional staging tasks here
        ;;
    production)
        print_info "🏭 Production deployment preparation..."
        # Production-specific tasks here
        ;;
esac

# 7. Generate Build Report
BUILD_REPORT=$(cat << EOF
{
    "timestamp": "$(date -Iseconds)",
    "environment": "$ENVIRONMENT",
    "nodeVersion": "$(node --version)",
    "gitCommit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
    "success": true
}
EOF
)

echo "$BUILD_REPORT" > build-report.json

echo ""
print_success "Build Pipeline completed successfully!"
echo -e "\e[36m📊 Build report saved to: build-report.json\e[0m"

# n8n Build Success Notification
if [ "$N8N_AVAILABLE" = true ]; then
    echo -e "\e[34m📡 Sending build success notification...\e[0m"
    node "$N8N_WEBHOOK_CLIENT" build "success" "$ENVIRONMENT" || echo -e "\e[33m⚠️ n8n success notification failed\e[0m"
fi

echo ""

# Return success exit code
exit 0
