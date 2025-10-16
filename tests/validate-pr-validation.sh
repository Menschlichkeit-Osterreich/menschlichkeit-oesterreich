#!/bin/bash
# Integration test for PR validation infrastructure

set -e

echo "🧪 Testing PR Validation Infrastructure"
echo "======================================="

# Test 1: Validate secrets.manifest.json exists and is valid JSON
echo ""
echo "Test 1: Secrets Manifest Validation"
if [ -f "secrets.manifest.json" ]; then
    echo "  ✅ secrets.manifest.json exists"
    if jq empty secrets.manifest.json 2>/dev/null; then
        echo "  ✅ Valid JSON format"
        
        # Check required fields
        if jq -e '.version' secrets.manifest.json > /dev/null; then
            echo "  ✅ Has version field"
        fi
        if jq -e '.environment' secrets.manifest.json > /dev/null; then
            echo "  ✅ Has environment field"
        fi
        if jq -e '.secrets' secrets.manifest.json > /dev/null; then
            echo "  ✅ Has secrets array"
        fi
    else
        echo "  ❌ Invalid JSON"
        exit 1
    fi
else
    echo "  ❌ secrets.manifest.json not found"
    exit 1
fi

# Test 2: Validate workflow exists
echo ""
echo "Test 2: CI Workflow Validation"
if [ -f ".github/workflows/secrets-validate.yml" ]; then
    echo "  ✅ secrets-validate.yml exists"
    
    # Check for required elements
    if grep -q "pull_request" .github/workflows/secrets-validate.yml; then
        echo "  ✅ Has pull_request trigger"
    fi
    if grep -q "validate-secrets" .github/workflows/secrets-validate.yml; then
        echo "  ✅ Has validate-secrets job"
    fi
else
    echo "  ❌ secrets-validate.yml not found"
    exit 1
fi

# Test 3: Validate Codacy config
echo ""
echo "Test 3: Codacy Configuration"
if [ -f ".codacy/codacy.yaml" ]; then
    echo "  ✅ codacy.yaml exists"
    
    # Check indentation (no tabs)
    if ! grep -P '^\t' .codacy/codacy.yaml > /dev/null; then
        echo "  ✅ No tabs in YAML"
    else
        echo "  ❌ Tabs found in YAML"
        exit 1
    fi
else
    echo "  ❌ codacy.yaml not found"
    exit 1
fi

# Test 4: Log directories
echo ""
echo "Test 4: Log Directory Structure"
for dir in logs/conflicts logs/audit logs/merge; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir exists"
        if [ -f "$dir/README.md" ]; then
            echo "     ✅ Has README.md"
        fi
    else
        echo "  ❌ $dir not found"
        exit 1
    fi
done

# Test 5: PowerShell scripts
echo ""
echo "Test 5: PowerShell Scripts"
if [ -f "scripts/validate-pr.ps1" ]; then
    echo "  ✅ validate-pr.ps1 exists"
    if pwsh -Command "Get-Help ./scripts/validate-pr.ps1" > /dev/null 2>&1; then
        echo "  ✅ Script is valid PowerShell"
    fi
else
    echo "  ❌ validate-pr.ps1 not found"
    exit 1
fi

if [ -f "scripts/create-audit-tag.ps1" ]; then
    echo "  ✅ create-audit-tag.ps1 exists"
else
    echo "  ❌ create-audit-tag.ps1 not found"
    exit 1
fi

# Test 6: Review comment template
echo ""
echo "Test 6: Review Comment Template"
if [ -f ".github/prompts/review-comment.md" ]; then
    echo "  ✅ review-comment.md exists"
    
    # Check for placeholder variables
    if grep -q "{{pr_number}}" .github/prompts/review-comment.md; then
        echo "  ✅ Has template variables"
    fi
else
    echo "  ❌ review-comment.md not found"
    exit 1
fi

# Test 7: Rollback prompt
echo ""
echo "Test 7: Rollback Masterprompt"
if [ -f ".github/prompts/rollback-masterprompt.md" ]; then
    echo "  ✅ rollback-masterprompt.md exists"
else
    echo "  ❌ rollback-masterprompt.md not found"
    exit 1
fi

echo ""
echo "======================================="
echo "✅ All validation tests passed!"
echo ""

exit 0
