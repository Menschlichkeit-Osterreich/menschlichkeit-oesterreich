#!/bin/bash
# Devcontainer Diagnostic Script
# This script helps diagnose issues with the devcontainer setup

set +e  # Don't exit on errors

echo "🔍 Devcontainer Diagnostic Tool"
echo "================================"
echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check function with color output
check_item() {
    local name=$1
    local command=$2
    
    echo -n "Checking $name... "
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

# 1. System Information
echo -e "${BLUE}📊 System Information${NC}"
echo "===================="
echo "Hostname: $(hostname)"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Kernel: $(uname -r)"
echo "Architecture: $(uname -m)"
echo ""

# 2. Resource Check
echo -e "${BLUE}💻 System Resources${NC}"
echo "==================="
if command -v free >/dev/null 2>&1; then
    echo "Memory:"
    free -h | awk 'NR==1 || NR==2 {print "  "$0}'
fi
if command -v df >/dev/null 2>&1; then
    echo "Disk:"
    df -h / | awk 'NR==1 || NR==2 {print "  "$0}'
fi
if command -v nproc >/dev/null 2>&1; then
    echo "CPU Cores: $(nproc)"
fi
echo ""

# 3. Development Tools
echo -e "${BLUE}🛠️  Development Tools${NC}"
echo "===================="
check_item "Node.js" "node --version"
check_item "npm" "npm --version"
check_item "Python 3" "python3 --version"
check_item "pip" "pip --version || pip3 --version"
check_item "PHP" "php --version"
check_item "Git" "git --version"
check_item "Docker" "docker --version"
check_item "PowerShell" "pwsh --version"
echo ""

# 4. Python Environment
echo -e "${BLUE}🐍 Python Environment${NC}"
echo "====================="
echo "Python Version: $(python3 --version)"
echo "Python Path: $(which python3)"
echo ""
echo "Critical Packages:"
check_item "  FastAPI" "python3 -c 'import fastapi'"
check_item "  Uvicorn" "python3 -c 'import uvicorn'"
check_item "  Pydantic" "python3 -c 'import pydantic'"
check_item "  python-dotenv" "python3 -c 'import dotenv'"
echo ""

# 5. File Structure
echo -e "${BLUE}📁 File Structure${NC}"
echo "================="
check_item "Root .env" "[ -f .env ]"
check_item "API .env" "[ -f api.menschlichkeit-oesterreich.at/.env ]"
check_item "Frontend .env" "[ -f frontend/.env ]"
check_item "package.json" "[ -f package.json ]"
check_item "node_modules" "[ -d node_modules ]"
check_item "API directory" "[ -d api.menschlichkeit-oesterreich.at ]"
check_item "Frontend directory" "[ -d frontend ]"
check_item "CRM directory" "[ -d crm.menschlichkeit-oesterreich.at ]"
echo ""

# 6. Script Permissions
echo -e "${BLUE}🔐 Script Permissions${NC}"
echo "====================="
check_item "build-pipeline.sh" "[ -x build-pipeline.sh ]"
check_item "onCreate-setup.sh" "[ -x .devcontainer/onCreate-setup.sh ]"
check_item "setup.sh" "[ -x .devcontainer/setup.sh ]"
check_item "test-setup.sh" "[ -x .devcontainer/test-setup.sh ]"
echo ""

# 7. Git Configuration
echo -e "${BLUE}🔧 Git Configuration${NC}"
echo "===================="
echo "Git User: $(git config user.name || echo 'Not set')"
echo "Git Email: $(git config user.email || echo 'Not set')"
echo "Current Branch: $(git branch --show-current 2>/dev/null || echo 'Not in git repo')"
echo "Remote URL: $(git remote get-url origin 2>/dev/null || echo 'No remote configured')"
echo ""

# 8. Network Connectivity
echo -e "${BLUE}🌐 Network Connectivity${NC}"
echo "======================="
check_item "Internet (github.com)" "ping -c 1 -W 2 github.com"
check_item "Internet (8.8.8.8)" "ping -c 1 -W 2 8.8.8.8"
check_item "npm registry" "ping -c 1 -W 2 registry.npmjs.org"
check_item "PyPI" "ping -c 1 -W 2 pypi.org"
echo ""

# 9. Log Files
echo -e "${BLUE}📝 Recent Log Files${NC}"
echo "==================="
if [ -f "/tmp/devcontainer-onCreate-setup.log" ]; then
    echo "onCreate Log (last 10 lines):"
    tail -n 10 /tmp/devcontainer-onCreate-setup.log | sed 's/^/  /'
else
    echo "  ℹ️  No onCreate log found at /tmp/devcontainer-onCreate-setup.log"
fi
echo ""

# 10. Common Issues Check
echo -e "${BLUE}🔍 Common Issues Check${NC}"
echo "======================"

# Check for CRLF line endings
if find .devcontainer -name "*.sh" -exec file {} \; | grep -q "CRLF"; then
    echo -e "${RED}⚠️  CRLF line endings detected in shell scripts${NC}"
    echo "   Run: dos2unix .devcontainer/*.sh"
else
    echo -e "${GREEN}✓${NC} Shell scripts have correct line endings (LF)"
fi

# Check npm cache
if [ -d "$HOME/.npm" ]; then
    cache_size=$(du -sh "$HOME/.npm" 2>/dev/null | cut -f1)
    echo "ℹ️  npm cache size: $cache_size"
else
    echo "ℹ️  npm cache not found"
fi

# Check pip cache
if [ -d "$HOME/.cache/pip" ]; then
    cache_size=$(du -sh "$HOME/.cache/pip" 2>/dev/null | cut -f1)
    echo "ℹ️  pip cache size: $cache_size"
else
    echo "ℹ️  pip cache not found"
fi

echo ""

# 11. Recommendations
echo -e "${BLUE}💡 Recommendations${NC}"
echo "=================="

# Check network first
if ! ping -c 1 -W 2 github.com >/dev/null 2>&1 && ! ping -c 1 -W 2 8.8.8.8 >/dev/null 2>&1; then
    echo -e "${RED}⚠️  No network connectivity detected${NC}"
    echo "   This may be a CI/test environment or network is down"
    echo "   Some features require internet access:"
    echo "   - npm install (downloading packages)"
    echo "   - pip install (downloading Python packages)"
    echo "   - Git operations (clone, push, pull)"
    echo ""
fi

if ! python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  FastAPI not installed${NC}"
    echo "   Run: pip install --user fastapi uvicorn python-dotenv"
fi

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Root .env file missing${NC}"
    echo "   Run: cp .env.example .env"
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules missing${NC}"
    echo "   Run: npm install"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Diagnostic Complete${NC}"
echo "================================"
echo ""
echo "📝 To save this output:"
echo "   bash .devcontainer/diagnose.sh > diagnostic-report.txt"
echo ""
echo "🆘 For help:"
echo "   - Check .devcontainer/README.md"
echo "   - Run: bash .devcontainer/test-setup.sh"
echo "   - Run: bash .devcontainer/manual-setup.sh"
