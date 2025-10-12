#!/bin/bash
# Codespace onCreate setup - Critical initial setup with timeout protection
# This runs BEFORE postCreateCommand and must be fast and reliable

set +e  # Don't exit on errors

echo "🚀 Codespace onCreate Setup - Critical Phase"
echo "=============================================="

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
mkdir -p quality-reports api.menschlichkeit-oesterreich.at frontend scripts/powershell

# 2. Install npm dependencies with timeout
echo ""
echo "📦 Installing npm dependencies..."
run_with_timeout 300 "npm install" npm install || echo "  ℹ️  npm install failed/timed out - will retry in postCreateCommand"

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
create_env_file "crm.menschlichkeit-oesterreich.at/.env.example" "crm.menschlichkeit-oesterreich.at/.env"
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
echo ""
echo "ℹ️  Next: postCreateCommand will run .devcontainer/setup.sh"
echo "ℹ️  Then: postStartCommand will run PowerShell setup"

# Always exit 0 so Codespace continues even if some steps failed
exit 0
