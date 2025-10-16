#!/bin/bash
# Development API Server Startup Script
# Handles various scenarios for FastAPI server startup

set -e

cd "$(dirname "$0")/../api.menschlichkeit-oesterreich.at"

echo "🚀 Starting FastAPI development server..."

# Check if .env exists, create from example if not
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "📝 Creating .env from .env.example"
    cp .env.example .env
fi

# Try uvicorn first (if available)
if command -v uvicorn >/dev/null 2>&1; then
    echo "✅ Using uvicorn (system installation) with --env-file"
    uvicorn --env-file .env app.main:app --host 0.0.0.0 --port 8001 --reload
elif python3 -c "import uvicorn" 2>/dev/null; then
    echo "✅ Using uvicorn (Python module) with --env-file"
    python3 -m uvicorn --env-file .env app.main:app --host 0.0.0.0 --port 8001 --reload
elif python3 -c "import fastapi" 2>/dev/null; then
    echo "⚠️ FastAPI available but uvicorn missing, using basic Python server"
    # Fallback to basic Python HTTP server with FastAPI
    python3 -c "
import sys, os
sys.path.insert(0, '.')
try:
    from app.main import app
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8001, reload=True)
except ImportError as e:
    print(f'❌ Missing dependencies: {e}')
    print('📦 Please install: pip install fastapi uvicorn')
    sys.exit(1)
"
else
    echo "❌ FastAPI not available"
    echo "📦 Please install dependencies:"
    echo "   cd api.menschlichkeit-oesterreich.at"
    echo "   pip install -r requirements.txt"
    echo "   # OR minimal install:"
    echo "   pip install fastapi uvicorn python-dotenv"
    exit 1
fi