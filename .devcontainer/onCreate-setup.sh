#!/bin/bash
# Codespace onCreate setup - Critical initial setup with timeout protection
# This runs BEFORE postCreateCommand and must be fast and reliable

set +e  # Don't exit on errors

echo "🚀 Codespace onCreate Setup - Critical Phase"
echo "=============================================="
echo "📅 Started at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Log file for debugging
LOG_FILE="/tmp/devcontainer-onCreate-setup.log"
exec > >(tee -a "$LOG_FILE") 2>&1

# Function to run command with timeout
run_with_timeout() {
    local timeout_seconds=$1
    local description=$2
    shift 2
    
    echo "⏱️  Running: $description (timeout: ${timeout_seconds}s)"
    timeout "$timeout_seconds" "$@"
    local exit_code=$?
    
    if [ $exit_code -eq 124 ]; then
        echo "  ⚠️  Timeout: $description - continuing anyway"
        return 1
    elif [ $exit_code -eq 0 ]; then
        echo "  ✅ Success: $description"
        return 0
    else
        echo "  ⚠️  Failed: $description (exit code: $exit_code) - continuing anyway"
        return 1
    fi
}

# 1. Create essential directories
echo ""
echo "📁 Creating essential directories..."
mkdir -p quality-reports api.menschlichkeit-oesterreich.at frontend scripts/powershell 2>/dev/null || {
    echo "  ⚠️  Failed to create some directories, but continuing..."
}

# Verify critical directories exist
if [ -d "api.menschlichkeit-oesterreich.at" ]; then
    echo "  ✅ API directory exists"
else
    echo "  ⚠️  API directory missing - may cause issues"
fi

# 2. Install npm dependencies with timeout and fallback
echo ""
echo "📦 Installing npm dependencies..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "  ⚠️  package.json not found - skipping npm install"
else
    # Check if node_modules already exists (partial install from previous attempt)
    if [ -d "node_modules" ]; then
        echo "  ℹ️  node_modules exists - checking if complete..."
        if npm ls >/dev/null 2>&1; then
            echo "  ✅ npm dependencies already installed"
        else
            echo "  ⚠️  Incomplete installation detected - retrying..."
            run_with_timeout 300 "npm install" npm install || echo "  ℹ️  npm install failed/timed out - will retry in postCreateCommand"
        fi
    else
        run_with_timeout 300 "npm install" npm install || echo "  ℹ️  npm install failed/timed out - will retry in postCreateCommand"
    fi
fi

# 3. Create environment files from examples (CRITICAL)
echo ""
echo "⚙️  Creating environment files..."
create_env_file() {
    local example_file=$1
    local target_file=$2
    
    if [ -f "$example_file" ] && [ ! -f "$target_file" ]; then
        cp "$example_file" "$target_file"
        echo "  ✅ Created $target_file"
    elif [ -f "$target_file" ]; then
        echo "  ⏭️  $target_file already exists"
    else
        echo "  ⚠️  $example_file not found, skipping $target_file"
    fi
}

create_env_file ".env.example" ".env"
create_env_file "api.menschlichkeit-oesterreich.at/.env.example" "api.menschlichkeit-oesterreich.at/.env"
create_env_file "frontend/.env.example" "frontend/.env"
# CRM uses different structure - check multiple possible locations
if [ -f "crm.menschlichkeit-oesterreich.at/.env.example" ]; then
    create_env_file "crm.menschlichkeit-oesterreich.at/.env.example" "crm.menschlichkeit-oesterreich.at/.env"
elif [ -f "crm.menschlichkeit-oesterreich.at/sites/default/.env.example" ]; then
    create_env_file "crm.menschlichkeit-oesterreich.at/sites/default/.env.example" "crm.menschlichkeit-oesterreich.at/sites/default/.env"
else
    echo "  ℹ️  CRM .env.example not found - manual configuration may be needed"
fi
create_env_file "automation/n8n/.env.example" "automation/n8n/.env"

# 4. Install critical Python dependencies (FastAPI, Uvicorn)
echo ""
echo "🐍 Installing critical Python dependencies..."

# First try to install just the essentials
if ! python3 -c "import fastapi" 2>/dev/null; then
    run_with_timeout 120 "FastAPI + Uvicorn + python-dotenv" \
        pip install --user --timeout 60 fastapi uvicorn python-dotenv pydantic || \
        echo "  ℹ️  Will retry in postCreateCommand"
fi

# 5. Make scripts executable
echo ""
echo "🔧 Making scripts executable..."
chmod +x build-pipeline.sh 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x deployment-scripts/*.sh 2>/dev/null || true
chmod +x .devcontainer/*.sh 2>/dev/null || true

# 6. Resource check
echo ""
echo "📊 System Resources:"
if command -v free &>/dev/null; then
    echo "  Memory: $(free -h | awk '/^Mem:/ {print $2 " total, " $3 " used, " $4 " free"}' || echo 'N/A')"
fi
if command -v df &>/dev/null; then
    echo "  Disk: $(df -h / | awk 'NR==2 {print $2 " total, " $3 " used, " $4 " available"}' || echo 'N/A')"
fi
if command -v nproc &>/dev/null; then
    echo "  CPU cores: $(nproc || echo 'N/A')"
fi

echo ""
echo "✅ onCreate Setup Complete (Phase 1/3)"
echo "📊 Summary:"
echo "  - Essential directories: Created"
echo "  - npm dependencies: $([ -d "node_modules" ] && echo "Installed" || echo "Pending")"
echo "  - .env files: $([ -f ".env" ] && echo "Created" || echo "Pending")"
echo "  - Python dependencies: $(python3 -c "import fastapi" 2>/dev/null && echo "Installed" || echo "Pending")"
echo ""
echo "ℹ️  Next: postCreateCommand will run .devcontainer/setup.sh"
echo "ℹ️  Then: postStartCommand will run PowerShell setup"
echo "📝 Log file: $LOG_FILE"
echo "📅 Completed at: $(date '+%Y-%m-%d %H:%M:%S')"

# Always exit 0 so Codespace continues even if some steps failed
exit 0
