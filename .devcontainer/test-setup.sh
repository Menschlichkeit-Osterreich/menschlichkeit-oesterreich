#!/bin/bash
# Test script to validate devcontainer setup
# This can be run manually to verify the setup is working

set +e  # Don't exit on errors, we want to see all test results

echo "🧪 Testing Devcontainer Setup..."
echo "================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
WARNINGS=0

# Test function
test_command() {
    local name=$1
    local command=$2
    local required=${3:-true}
    
    echo -n "Testing $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}✗ FAIL${NC}"
            ((FAILED++))
        else
            echo -e "${YELLOW}⚠ SKIP (optional)${NC}"
            ((WARNINGS++))
        fi
        return 1
    fi
}

echo ""
echo "📦 Testing System Prerequisites..."
test_command "Node.js" "node --version"
test_command "npm" "npm --version"
test_command "Python 3" "python3 --version"
test_command "PHP" "php --version"
test_command "Git" "git --version"
test_command "Docker" "docker --version"
test_command "PowerShell" "pwsh --version" false

echo ""
echo "🐍 Testing Python Environment..."
test_command "FastAPI" "python3 -c 'import fastapi'"
test_command "Uvicorn" "python3 -c 'import uvicorn'"
test_command "Pydantic" "python3 -c 'import pydantic'" false

echo ""
echo "📁 Testing File Structure..."
test_command ".env file" "[ -f .env ]"
test_command "API .env" "[ -f api.menschlichkeit-oesterreich.at/.env ]"
test_command "Frontend .env" "[ -f frontend/.env ]"
test_command "Scripts executable" "[ -x build-pipeline.sh ]"

echo ""
echo "🌐 Testing Service Start Scripts..."
test_command "API start script" "[ -f scripts/start-api-dev.sh ]"
test_command "Frontend package.json" "[ -f frontend/package.json ]"
test_command "CRM directory" "[ -d crm.menschlichkeit-oesterreich.at ]"

echo ""
echo "💪 Testing PowerShell Setup (optional)..."
if command -v pwsh > /dev/null 2>&1; then
    test_command "PowerShell profile" "pwsh -c 'Test-Path \$PROFILE'" false
    test_command "PowerShell scripts dir" "[ -d scripts/powershell ]" false
    test_command "GitHelper module" "[ -f scripts/powershell/GitHelper.psm1 ]" false
else
    echo -e "${YELLOW}PowerShell not available - skipping PowerShell tests${NC}"
fi

echo ""
echo "================================"
echo "📊 Test Summary:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo -e "  ${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    echo ""
    echo "🚀 Ready to start development:"
    echo "  npm run dev:all      - Start all services"
    echo "  npm run dev:frontend - Start frontend only"
    echo "  npm run dev:api      - Start API only"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the setup.${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "  1. Run: bash .devcontainer/setup.sh"
    echo "  2. Check: ..dokum/CODESPACE-TROUBLESHOOTING.md"
    echo "  3. Manual install: cd api.menschlichkeit-oesterreich.at && pip install --user fastapi uvicorn"
    exit 1
fi
