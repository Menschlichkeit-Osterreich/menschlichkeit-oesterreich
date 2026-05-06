#!/bin/bash
# Development API Server Startup Script

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT_DIR/apps/api"

cd "$API_DIR"

echo "Starting FastAPI development server from $API_DIR ..."

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "Creating apps/api/.env from apps/api/.env.example"
    cp .env.example .env
fi

if command -v uvicorn >/dev/null 2>&1; then
    uvicorn --env-file .env app.main:app --host 0.0.0.0 --port 8001 --reload
elif python -c "import uvicorn" 2>/dev/null; then
    python -m uvicorn --env-file .env app.main:app --host 0.0.0.0 --port 8001 --reload
else
    echo "FastAPI/uvicorn not available. Install apps/api requirements first."
    exit 1
fi
