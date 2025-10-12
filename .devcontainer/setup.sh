#!/bin/bash
# Devcontainer setup script for Menschlichkeit Österreich
# This runs as postCreateCommand AFTER onCreate-setup.sh
# Exit on error is disabled to allow graceful degradation
set +e  # Changed from set -e to allow continuing on errors

echo "🚀 Setting up Menschlichkeit Österreich development environment (Phase 2/3)..."
echo ""

# Create quality-reports directory
mkdir -p quality-reports

# Install Python dependencies for API service
echo "🐍 Installing Python dependencies for API service..."
cd api.menschlichkeit-oesterreich.at

# Check if we already have the basics (from onCreate)
if python3 -c "import fastapi, uvicorn" 2>/dev/null; then
    echo "  ✅ FastAPI and Uvicorn already installed"
else
    # Try minimal requirements first (more likely to succeed)  
    if [ -f "requirements-minimal.txt" ]; then
        echo "📦 Installing minimal Python requirements..."
        timeout 120 pip install --user --timeout 120 -r requirements-minimal.txt || echo "⚠️ Minimal requirements install failed, will try manual install"
    fi
    
    # Try full requirements if minimal succeeded or if minimal doesn't exist
    if ! python3 -c "import fastapi, uvicorn" 2>/dev/null; then
        echo "📦 Installing essential packages manually..."
        timeout 120 pip install --user --timeout 120 fastapi uvicorn python-dotenv pydantic requests || echo "⚠️ Manual install failed, API server may not work"
    fi
fi

# Try full requirements if we have basic packages working
if python3 -c "import fastapi, uvicorn" 2>/dev/null; then
    echo "📦 Attempting full requirements install (with timeout protection)..."
    # requirements.txt is in app/ subdirectory
    if [ -f "app/requirements.txt" ]; then
        timeout 180 pip install --user --timeout 120 -r app/requirements.txt || echo "⚠️ Full requirements install failed or timed out, basic functionality should still work"
    elif [ -f "requirements.txt" ]; then
        timeout 180 pip install --user --timeout 120 -r requirements.txt || echo "⚠️ Full requirements install failed or timed out, basic functionality should still work"
    else
        echo "⚠️ No requirements.txt found, skipping"
    fi
fi

cd ..

# Install PHP dependencies (if composer.json exists)
if [ -f "composer.json" ]; then
    echo "🐘 Installing PHP dependencies (with timeout protection)..."
    timeout 180 composer install --no-dev --optimize-autoloader || echo "⚠️ PHP dependencies installation failed or timed out"
fi

# Setup environment files from templates
echo "⚙️ Setting up environment files..."
copy_env_if_missing() {
    if [ -f "$1" ] && [ ! -f "$2" ]; then
        cp "$1" "$2"
        echo "✅ Created $2 from $1"
    fi
}

copy_env_if_missing ".env.example" ".env"
copy_env_if_missing "api.menschlichkeit-oesterreich.at/.env.example" "api.menschlichkeit-oesterreich.at/.env"
copy_env_if_missing "frontend/.env.example" "frontend/.env"
# CRM uses different structure - check multiple possible locations
if [ -f "crm.menschlichkeit-oesterreich.at/.env.example" ]; then
    copy_env_if_missing "crm.menschlichkeit-oesterreich.at/.env.example" "crm.menschlichkeit-oesterreich.at/.env"
elif [ -f "crm.menschlichkeit-oesterreich.at/sites/default/.env.example" ]; then
    copy_env_if_missing "crm.menschlichkeit-oesterreich.at/sites/default/.env.example" "crm.menschlichkeit-oesterreich.at/sites/default/.env"
else
    echo "ℹ️  CRM .env.example not found - manual configuration may be needed"
fi
copy_env_if_missing "automation/n8n/.env.example" "automation/n8n/.env"

# Make scripts executable
chmod +x build-pipeline.sh 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x deployment-scripts/*.sh 2>/dev/null || true

# Check available resources
echo ""
echo "📊 System Resources:"
echo "  Memory: $(free -h | awk '/^Mem:/ {print $2 " total, " $3 " used, " $4 " free"}')"
echo "  Disk: $(df -h / | awk 'NR==2 {print $2 " total, " $3 " used, " $4 " available"}')"
echo "  CPU cores: $(nproc)"

echo ""
echo "✅ Devcontainer setup complete!"
echo ""
echo "🎯 Quick Start Commands:"
echo "  npm run dev:all      - Start all development services"
echo "  npm run dev:api      - Start API service only" 
echo "  npm run dev:frontend - Start frontend only"
echo "  npm run dev:crm      - Start CRM service only"
echo ""
echo "🔧 If API server fails to start:"
echo "  cd api.menschlichkeit-oesterreich.at"
echo "  pip install --user fastapi uvicorn python-dotenv"
echo ""
echo "📊 Quality Commands:"
echo "  npm run quality:gates - Run all quality checks"
echo "  npm run lint:all     - Run all linters"
echo "  npm run test:all     - Run all tests"
echo ""
echo "🌐 Service URLs (when running):"
echo "  Frontend: http://localhost:5173"
echo "  API: http://localhost:8001"
echo "  CRM: http://localhost:8000"
echo "  Games: http://localhost:3000"
echo ""
echo "💡 Note: PowerShell setup runs in background (optional)"
echo "  Check '.devcontainer/POWERSHELL.md' for PowerShell features"