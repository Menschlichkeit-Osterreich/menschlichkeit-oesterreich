#!/usr/bin/env bash
# ============================================================
# OpenClaw – Boot-Skript
# Startet den vollständigen Docker-Stack und prüft Health
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/openclaw-system/docker/docker-compose.oc.yml"

# Farben
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

log_step()  { echo -e "${CYAN}  → $1${NC}"; }
log_ok()    { echo -e "${GREEN}  ✓ $1${NC}"; }
log_warn()  { echo -e "${YELLOW}  ⚠ $1${NC}"; }
log_error() { echo -e "${RED}  ✗ $1${NC}"; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   OpenClaw Multi-Agent-System – Boot             ║${NC}"
echo -e "${CYAN}║   Menschlichkeit Österreich                      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ─── 1. Voraussetzungen ───────────────────────────────────
log_step "Prüfe Voraussetzungen..."

if ! command -v docker &>/dev/null; then
    log_error "Docker nicht gefunden. Bitte installieren: https://docs.docker.com/get-docker/"
    exit 1
fi
log_ok "Docker: $(docker --version | cut -d' ' -f3 | tr -d ',')"

if ! docker compose version &>/dev/null; then
    log_error "Docker Compose v2 nicht gefunden"
    exit 1
fi
log_ok "Docker Compose: $(docker compose version --short)"

# ─── 2. .env prüfen ───────────────────────────────────────
ENV_FILE="$ROOT_DIR/openclaw-system/.env"
if [ ! -f "$ENV_FILE" ]; then
    log_warn ".env nicht gefunden. Erstelle aus Template..."
    cp "$ROOT_DIR/openclaw-system/configs/.env.example" "$ENV_FILE" 2>/dev/null || \
    cat > "$ENV_FILE" << 'EOF'
OC_PG_PASSWORD=oc_dev_only
GITHUB_TOKEN=
OPENAI_API_KEY=
LOG_LEVEL=INFO
OC_DEFAULT_MODEL=gpt-4.1-mini
EOF
    log_warn "Bitte $ENV_FILE mit echten Werten befüllen!"
fi

# ─── 3. Docker-Stack starten ──────────────────────────────
log_step "Starte Docker-Stack..."
cd "$ROOT_DIR"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build 2>&1 | \
    grep -E "(Starting|Started|Created|Building|Error)" || true

log_ok "Stack gestartet"

# ─── 4. Health-Checks ─────────────────────────────────────
log_step "Warte auf Health-Checks (max 60s)..."

check_service() {
    local name="$1"
    local url="$2"
    local max_attempts=20
    
    for i in $(seq 1 $max_attempts); do
        if curl -sf "$url" &>/dev/null; then
            log_ok "$name: OK ($url)"
            return 0
        fi
        sleep 3
    done
    log_warn "$name: Nicht erreichbar ($url)"
    return 1
}

check_service "NATS"        "http://localhost:8222/healthz"
check_service "Qdrant"      "http://localhost:6333/healthz"
check_service "Tool-Gateway" "http://localhost:9101/health"
check_service "Agent-Runtime" "http://localhost:9100/health"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ OpenClaw Stack läuft!                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo "Services:"
echo "  NATS Monitor:    http://localhost:8222"
echo "  Qdrant API:      http://localhost:6333"
echo "  Tool-Gateway:    http://localhost:9101/docs"
echo "  Agent-Runtime:   http://localhost:9100/health"
echo ""
echo "Logs: docker compose -f openclaw-system/docker/docker-compose.oc.yml logs -f"
