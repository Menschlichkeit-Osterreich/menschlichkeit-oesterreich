#!/usr/bin/env bash
# Local environment bootstrap for the current monorepo structure.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${BLUE}[setup]${NC} $*"; }
ok()   { echo -e "${GREEN}  ✓${NC} $*"; }
warn() { echo -e "${YELLOW}  !${NC} $*"; }

copy_if_missing() {
  local src="$1"
  local dest="$2"
  if [ ! -f "$dest" ] && [ -f "$src" ]; then
    cp "$src" "$dest"
    ok "Erstellt: $dest"
  elif [ -f "$dest" ]; then
    ok "Vorhanden: $dest"
  else
    warn "Template fehlt: $src"
  fi
}

log "Lege sichere lokale Env-Dateien an"
copy_if_missing ".env.example" ".env"
copy_if_missing "apps/api/.env.example" "apps/api/.env"
copy_if_missing "apps/website/.env.example" "apps/website/.env.local"
copy_if_missing "automation/n8n/.env.example" "automation/n8n/.env"
copy_if_missing ".env.test.example" ".env.test.local"

log "Installiere Root-Abhaengigkeiten"
PUPPETEER_SKIP_DOWNLOAD=true npm install --workspaces=false

if [ -f "apps/website/package.json" ]; then
  log "Installiere Frontend-Abhaengigkeiten"
  PUPPETEER_SKIP_DOWNLOAD=true npm install --workspace=@moe/frontend
fi

if command -v python >/dev/null 2>&1 && [ -f "apps/api/requirements.txt" ]; then
  log "Installiere API-Abhaengigkeiten"
  python -m pip install -r apps/api/requirements.txt
fi

cat <<'EOF'

Naechste Schritte:
  1. apps/api/.env pruefen und echte lokale Werte eintragen
  2. apps/website/.env.local pruefen
  3. automation/n8n/.env pruefen
  4. .env.test.local fuer lokale Seed-/Login-Tests anpassen
  5. npm run dev:api / npm run dev:frontend / npm run n8n:start
EOF
