#!/usr/bin/env bash
# =============================================================================
# Menschlichkeit Österreich – Lokales Entwicklungs-Setup
# =============================================================================
# Dieses Skript richtet die komplette Entwicklungsumgebung ein.
# Ausführen: bash scripts/setup-local.sh
#
# Voraussetzungen:
#   - Node.js >= 18, npm >= 8
#   - Python >= 3.12
#   - Docker + Docker Compose (für PostgreSQL & Redis)
# =============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()     { echo -e "${BLUE}[setup]${NC} $*"; }
ok()      { echo -e "${GREEN}  ✓${NC} $*"; }
warn()    { echo -e "${YELLOW}  !${NC} $*"; }
fail()    { echo -e "${RED}  ✗${NC} $*"; }

echo
echo "============================================================"
echo "  Menschlichkeit Österreich – Lokales Setup"
echo "============================================================"
echo

# ─── 1. .env Dateien ──────────────────────────────────────────────────────────
log "Schritt 1/5: Umgebungsvariablen einrichten"

if [ ! -f ".env" ]; then
  cp ".env.example" ".env"
  ok "Root .env aus .env.example erstellt"
  warn "Bitte .env öffnen und SSH_USER, SSH_KEY etc. eintragen!"
else
  ok "Root .env bereits vorhanden"
fi

if [ ! -f "frontend/.env.local" ]; then
  cp "frontend/.env.example" "frontend/.env.local"
  ok "frontend/.env.local aus .env.example erstellt"
  warn "Für Zahlungen: VITE_STRIPE_PUBLISHABLE_KEY und VITE_PAYPAL_CLIENT_ID eintragen"
else
  ok "frontend/.env.local bereits vorhanden"
fi

if [ ! -f "api.menschlichkeit-oesterreich.at/.env" ]; then
  cp "api.menschlichkeit-oesterreich.at/.env.example" "api.menschlichkeit-oesterreich.at/.env"
  ok "API .env aus .env.example erstellt"
  warn "WICHTIG: CIVI_SITE_KEY, CIVI_API_KEY und JWT_SECRET in api/.env eintragen!"
else
  ok "API .env bereits vorhanden"
fi

# ─── 2. Node.js Dependencies ──────────────────────────────────────────────────
log "Schritt 2/5: Node.js-Abhängigkeiten installieren"

if command -v node >/dev/null 2>&1; then
  NODE_VER=$(node --version | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
  if [ "$NODE_MAJOR" -lt 18 ]; then
    fail "Node.js >= 18 erforderlich (gefunden: v$NODE_VER)"
    exit 1
  fi
  ok "Node.js v$NODE_VER gefunden"
else
  fail "Node.js nicht gefunden! Bitte installieren: https://nodejs.org"
  exit 1
fi

PUPPETEER_SKIP_DOWNLOAD=true npm install --workspaces=false
ok "Root-Abhängigkeiten installiert"

PUPPETEER_SKIP_DOWNLOAD=true npm install --workspace=frontend
ok "Frontend-Abhängigkeiten installiert"

# ─── 3. Python Virtual Environment ────────────────────────────────────────────
log "Schritt 3/5: Python-Umgebung für API einrichten"

API_DIR="api.menschlichkeit-oesterreich.at"

if command -v python3 >/dev/null 2>&1; then
  PY_VER=$(python3 --version | awk '{print $2}')
  ok "Python $PY_VER gefunden"

  if [ ! -d "$API_DIR/venv" ]; then
    python3 -m venv "$API_DIR/venv"
    ok "Virtual Environment erstellt"
  else
    ok "Virtual Environment bereits vorhanden"
  fi

  # Shellcheck: Sourcing venv
  # shellcheck disable=SC1091
  source "$API_DIR/venv/bin/activate"
  pip install --quiet -r "$API_DIR/requirements.txt"
  ok "Python-Abhängigkeiten installiert"
  deactivate
else
  warn "Python3 nicht gefunden – API-Backend wird übersprungen"
  warn "Installiere Python >= 3.12 und führe setup erneut aus"
fi

# ─── 4. Docker Services ───────────────────────────────────────────────────────
log "Schritt 4/5: Docker-Services starten (PostgreSQL, Redis)"

if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    docker compose up -d postgres redis
    ok "PostgreSQL und Redis gestartet"
  else
    warn "Docker läuft nicht – Bitte Docker Desktop starten"
    warn "Dann: docker compose up -d postgres redis"
  fi
else
  warn "Docker nicht gefunden – PostgreSQL/Redis nicht gestartet"
  warn "Installiere Docker: https://docs.docker.com/get-docker/"
fi

# ─── 5. TypeScript-Check ──────────────────────────────────────────────────────
log "Schritt 5/5: TypeScript-Syntax prüfen"

if npm run type-check --workspace=frontend 2>&1 | grep -q "error TS"; then
  warn "TypeScript-Fehler gefunden – trotzdem startbar mit 'npm run dev:frontend'"
else
  ok "TypeScript-Check erfolgreich"
fi

# ─── Zusammenfassung ──────────────────────────────────────────────────────────
echo
echo "============================================================"
echo "  Setup abgeschlossen!"
echo "============================================================"
echo
echo "  Nächste Schritte:"
echo
echo "  1. Frontend starten (React App):"
echo "       npm run dev:frontend"
echo "       → http://localhost:5173"
echo
echo "  2. API-Backend starten:"
echo "       cd api.menschlichkeit-oesterreich.at"
echo "       source venv/bin/activate"
echo "       uvicorn app.main:app --reload --port 8001"
echo "       → http://localhost:8001/docs"
echo
echo "  3. Statische Website (plain HTML):"
echo "       cd website && python3 -m http.server 8080"
echo "       → http://localhost:8080"
echo
echo "  Wichtige Konfigurationen:"
echo "  - API-Keys:    api.menschlichkeit-oesterreich.at/.env"
echo "  - Frontend:    frontend/.env.local"
echo "  - Payments:    VITE_STRIPE_PUBLISHABLE_KEY, VITE_PAYPAL_CLIENT_ID"
echo
