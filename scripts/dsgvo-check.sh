#!/bin/bash
# DSGVO Compliance Check Script
# Bash equivalent for dsgvo-check.ps1

set -e

echo "🔒 DSGVO Compliance Check..."
echo ""

# Colors for output (if terminal supports it)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check for PII in logs
check_pii_in_logs() {
    echo "📝 Checking for PII in log files..."
    
    # Patterns that should NOT appear in logs (unmasked)
    PATTERNS=(
        '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' # Email
        'AT[0-9]{2}[0-9]{16}' # IBAN Austria
        'DE[0-9]{2}[0-9]{18}' # IBAN Germany
        '[0-9]{3}-[0-9]{2}-[0-9]{4}' # SSN-like patterns
    )
    
    # Whitelist: Öffentliche/dokumentierte Email-Adressen
    ALLOWED_EMAILS=(
        'peter.schuller@menschlichkeit-oesterreich.at'
        'dev@menschlichkeit-oesterreich.at'
        'devops@menschlichkeit-oesterreich.at'
        'contact@menschlichkeit-oesterreich.at'
    )
    
    for pattern in "${PATTERNS[@]}"; do
        # Exclude: test files, examples, script itself, markdown docs, and whitelisted emails
        matches=$(grep -rE "$pattern" logs/ 2>/dev/null | grep -v "test" | grep -v ".example" | grep -v "dsgvo-check" | grep -v "\.md$" || true)
        
        # Filter out whitelisted emails
        for allowed in "${ALLOWED_EMAILS[@]}"; do
            matches=$(echo "$matches" | grep -v "$allowed" || true)
        done
        
        if [ -n "$matches" ]; then
            echo -e "${RED}❌ Found potential unmasked PII: $pattern${NC}"
            echo "$matches"
            ((ERRORS++))
        fi
    done
}

# Function to check for DSGVO headers in API
check_api_headers() {
    echo ""
    echo "🌐 Checking API for DSGVO-compliant headers..."
    
    if [ -f "api.menschlichkeit-oesterreich.at/app/main.py" ]; then
        if ! grep -q "X-Content-Type-Options" api.menschlichkeit-oesterreich.at/app/main.py; then
            echo -e "${YELLOW}⚠️  Security headers may be missing${NC}"
            ((WARNINGS++))
        fi
    fi
}

# Function to check for data retention policies
check_data_retention() {
    echo ""
    echo "📅 Checking data retention policies..."
    
    if [ ! -f "docs/DSGVO-COMPLIANCE.md" ] && [ ! -f ".github/instructions/dsgvo-compliance.instructions.md" ]; then
        echo -e "${YELLOW}⚠️  DSGVO compliance documentation not found${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ DSGVO documentation found${NC}"
    fi
}

# Function to check for encryption
check_encryption() {
    echo ""
    echo "🔐 Checking encryption configuration..."
    
    # Check if DATABASE_URL uses SSL
    if [ -f ".env" ]; then
        if grep -q "DATABASE_URL" .env && ! grep -q "sslmode=require" .env; then
            echo -e "${YELLOW}⚠️  Database connection may not enforce SSL${NC}"
            ((WARNINGS++))
        fi
    fi
}

# Function to check PII sanitizers
check_pii_sanitizers() {
    echo ""
    echo "🧹 Checking PII sanitizer implementation..."
    
    SANITIZER_FILES=(
        "api.menschlichkeit-oesterreich.at/app/lib/pii_sanitizer.py"
        "api.menschlichkeit-oesterreich.at/app/middleware/pii_middleware.py"
        "tests/test_pii_sanitizer.py"
    )
    
    for file in "${SANITIZER_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            echo -e "${RED}❌ Missing PII sanitizer: $file${NC}"
            ((ERRORS++))
        else
            echo -e "${GREEN}✅ Found: $file${NC}"
        fi
    done
}

# Run all checks
echo "═══════════════════════════════════════════════════════════════════"
echo "  DSGVO/Privacy Compliance Check"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

check_pii_sanitizers
check_pii_in_logs
check_api_headers
check_data_retention
check_encryption

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  Summary"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All DSGVO compliance checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found${NC}"
    exit 1
fi
