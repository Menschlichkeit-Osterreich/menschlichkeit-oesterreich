#!/usr/bin/env bash
# ============================================================
# OpenClaw – Smoke Tests
# Schnelle End-to-End-Prüfung aller Services
# ============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

PASS=0; FAIL=0

test_ok()   { echo -e "${GREEN}  ✓ PASS${NC} $1"; ((PASS++)); }
test_fail() { echo -e "${RED}  ✗ FAIL${NC} $1: $2"; ((FAIL++)); }
test_warn() { echo -e "${YELLOW}  ⚠ SKIP${NC} $1: $2"; }

echo ""
echo -e "${CYAN}OpenClaw Smoke Tests${NC}"
echo "────────────────────"

# ─── NATS ─────────────────────────────────────────────────
echo -e "\n${CYAN}NATS:${NC}"
if curl -sf http://localhost:8222/varz | grep -q "server_id"; then
    test_ok "NATS Health"
else
    test_fail "NATS Health" "Nicht erreichbar"
fi

# ─── Qdrant ───────────────────────────────────────────────
echo -e "\n${CYAN}Qdrant:${NC}"
if curl -sf http://localhost:6333/healthz | grep -q "ok"; then
    test_ok "Qdrant Health"
else
    test_fail "Qdrant Health" "Nicht erreichbar"
fi

# ─── PostgreSQL ───────────────────────────────────────────
echo -e "\n${CYAN}PostgreSQL:${NC}"
if docker exec oc_postgres pg_isready -U oc -d oc &>/dev/null; then
    test_ok "PostgreSQL Ready"
    # Tabellen prüfen
    TABLES=$(docker exec oc_postgres psql -U oc -d oc -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'oc_%'" 2>/dev/null | tr -d ' ')
    if [ "$TABLES" -ge "6" ]; then
        test_ok "PostgreSQL Tabellen ($TABLES oc_-Tabellen)"
    else
        test_fail "PostgreSQL Tabellen" "Nur $TABLES Tabellen gefunden (erwartet: >=6)"
    fi
else
    test_fail "PostgreSQL" "Nicht erreichbar"
fi

# ─── Redis ────────────────────────────────────────────────
echo -e "\n${CYAN}Redis:${NC}"
if docker exec oc_redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    test_ok "Redis PING"
else
    test_fail "Redis" "Nicht erreichbar"
fi

# ─── Tool-Gateway ─────────────────────────────────────────
echo -e "\n${CYAN}Tool-Gateway (Port 9101):${NC}"
HEALTH=$(curl -sf http://localhost:9101/health 2>/dev/null || echo "{}")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    test_ok "Tool-Gateway Health"
else
    test_fail "Tool-Gateway Health" "Antwort: $HEALTH"
fi

# Tools-Liste
TOOLS=$(curl -sf http://localhost:9101/tools 2>/dev/null || echo "{}")
if echo "$TOOLS" | grep -q "fs.read"; then
    test_ok "Tool-Gateway Tools verfügbar"
else
    test_warn "Tool-Gateway Tools" "Liste nicht abrufbar"
fi

# Policy-Check (fs.write von research-Rolle sollte abgelehnt werden)
POLICY=$(curl -sf -X POST http://localhost:9101/tool/call \
    -H "Content-Type: application/json" \
    -d '{"tool":"fs.write","args":{"path":"/etc/passwd","content":"hack"},"agent_id":"test","agent_role":"research","task_id":"smoke-test"}' \
    2>/dev/null || echo "{}")
if echo "$POLICY" | grep -q '"success":false'; then
    test_ok "Policy-Engine: fs.write von research abgelehnt"
else
    test_fail "Policy-Engine" "Unerlaubter Schreibzugriff nicht blockiert!"
fi

# ─── Agent-Runtime ────────────────────────────────────────
echo -e "\n${CYAN}Agent-Runtime (Port 9100):${NC}"
AGENT_HEALTH=$(curl -sf http://localhost:9100/health 2>/dev/null || echo "{}")
if echo "$AGENT_HEALTH" | grep -q '"status":"ok"'; then
    test_ok "Agent-Runtime Health"
    # Agenten-Anzahl prüfen
    AGENT_COUNT=$(echo "$AGENT_HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('agents',[])))" 2>/dev/null || echo "0")
    if [ "$AGENT_COUNT" -ge "6" ]; then
        test_ok "Alle 6 Agenten aktiv"
    else
        test_warn "Agenten-Anzahl" "Nur $AGENT_COUNT Agenten (erwartet: 6)"
    fi
else
    test_fail "Agent-Runtime Health" "Antwort: $AGENT_HEALTH"
fi

# Task-Submit Test
TASK=$(curl -sf -X POST http://localhost:9100/task/submit \
    -H "Content-Type: application/json" \
    -d '{"title":"Smoke Test","objective":"Teste das System","role":"research"}' \
    2>/dev/null || echo "{}")
if echo "$TASK" | grep -q '"task_id"'; then
    test_ok "Task-Submit"
else
    test_warn "Task-Submit" "Nicht verfügbar"
fi

# ─── Ergebnis ─────────────────────────────────────────────
echo ""
echo "────────────────────"
TOTAL=$((PASS + FAIL))
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ Alle $TOTAL Tests bestanden!${NC}"
    exit 0
else
    echo -e "${RED}✗ $FAIL/$TOTAL Tests fehlgeschlagen${NC}"
    exit 1
fi
