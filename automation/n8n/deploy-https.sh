#!/bin/bash
# n8n HTTPS Deployment Script
# Automatisiertes Deployment für F-02
# Author: Menschlichkeit Österreich DevOps
# Date: 2025-10-03

set -euo pipefail

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  n8n HTTPS Deployment - F-02${NC}"
echo -e "${BLUE}  DSGVO Art. 32 Compliance${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo ""

# Arbeitsverzeichnis
cd "$(dirname "$0")"
N8N_DIR="/workspaces/menschlichkeit-oesterreich-development/automation/n8n"

# Pre-Flight Checks
echo -e "${YELLOW}[1/7] Pre-Flight Checks...${NC}"

# Check: DNS konfiguriert?
echo -n "  → DNS-Auflösung für n8n.menschlichkeit-oesterreich.at... "
if nslookup n8n.menschlichkeit-oesterreich.at >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo -e "${RED}ERROR: DNS nicht konfiguriert. Bitte A-Record anlegen:${NC}"
    echo "  n8n.menschlichkeit-oesterreich.at → 5.183.217.146"
    exit 1
fi

# Check: .env vorhanden?
echo -n "  → .env Datei vorhanden... "
if [ -f "$N8N_DIR/.env" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    echo "  Erstelle .env aus .env.example..."
    cp "$N8N_DIR/.env.example" "$N8N_DIR/.env"
    echo -e "${YELLOW}  ACHTUNG: Bitte .env anpassen (N8N_PASSWORD, ACME_EMAIL)${NC}"
    echo -e "${YELLOW}  vim $N8N_DIR/.env${NC}"
    read -p "  Fortfahren nach Anpassung? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check: Docker läuft?
echo -n "  → Docker Service... "
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo -e "${RED}ERROR: Docker nicht verfügbar. Bitte starten: sudo systemctl start docker${NC}"
    exit 1
fi

# Check: docker-compose.https.yml vorhanden?
echo -n "  → docker-compose.https.yml... "
if [ -f "$N8N_DIR/docker-compose.https.yml" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo -e "${RED}ERROR: docker-compose.https.yml fehlt${NC}"
    exit 1
fi

echo ""

# Backup bestehender Daten
echo -e "${YELLOW}[2/7] Backup bestehender n8n-Daten...${NC}"
BACKUP_DIR="$N8N_DIR/backups/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if docker ps -a | grep -q moe-n8n; then
    echo "  → Kopiere n8n-Daten..."
    docker cp moe-n8n:/home/node/.n8n "$BACKUP_DIR/" 2>/dev/null || echo "  (Kein Container aktiv)"
fi

echo -e "${GREEN}  ✓ Backup gespeichert: $BACKUP_DIR${NC}"
echo ""

# Alte Instanz stoppen
echo -e "${YELLOW}[3/7] Stoppe alte HTTP-Instanz...${NC}"
cd "$N8N_DIR"

if docker-compose -f docker-compose.yml ps | grep -q "Up"; then
    echo "  → docker-compose down (HTTP)..."
    docker-compose -f docker-compose.yml down
    echo -e "${GREEN}  ✓ HTTP-Instanz gestoppt${NC}"
else
    echo "  (Keine laufende HTTP-Instanz gefunden)"
fi
echo ""

# HTTPS-Stack starten
echo -e "${YELLOW}[4/7] Starte HTTPS-Stack...${NC}"
echo "  → docker-compose up -d (HTTPS)..."
docker-compose -f docker-compose.https.yml up -d

# Warte auf Container-Start
echo "  → Warte auf Container-Start (30s)..."
sleep 30

# Health Check
echo ""
echo -e "${YELLOW}[5/7] Health Checks...${NC}"

# Container Status
echo "  → Container Status:"
docker-compose -f docker-compose.https.yml ps

# Caddy Logs (Let's Encrypt)
echo ""
echo "  → Caddy Logs (Let's Encrypt Zertifikat):"
docker logs moe-n8n-caddy 2>&1 | tail -20 | grep -E "certificate|acme|error" || echo "  (Keine Fehler)"

# n8n Logs
echo ""
echo "  → n8n Logs:"
docker logs moe-n8n 2>&1 | tail -10 | grep -E "Webhook|Editor|error" || echo "  (Keine Fehler)"

echo ""

# Connectivity Tests
echo -e "${YELLOW}[6/7] Connectivity Tests...${NC}"

# Test 1: HTTPS Health Endpoint
echo -n "  → HTTPS Health Check (https://n8n.menschlichkeit-oesterreich.at/healthz)... "
if curl -f -s -o /dev/null -w "%{http_code}" https://n8n.menschlichkeit-oesterreich.at/healthz 2>/dev/null | grep -q 200; then
    echo -e "${GREEN}✓ (200 OK)${NC}"
else
    echo -e "${RED}✗${NC}"
    echo -e "${YELLOW}  Hinweis: Let's Encrypt kann bis zu 2 Minuten dauern. Später nochmal prüfen.${NC}"
fi

# Test 2: TLS Version
echo -n "  → TLS Version... "
TLS_VERSION=$(echo | timeout 5 openssl s_client -connect n8n.menschlichkeit-oesterreich.at:443 2>/dev/null | grep "Protocol" | awk '{print $3}' || echo "N/A")
if [[ "$TLS_VERSION" =~ TLSv1\.[23] ]]; then
    echo -e "${GREEN}✓ ($TLS_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠ ($TLS_VERSION - prüfe Firewall)${NC}"
fi

# Test 3: HSTS Header
echo -n "  → HSTS Header... "
if curl -I -s https://n8n.menschlichkeit-oesterreich.at 2>/dev/null | grep -q "Strict-Transport-Security"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ (noch nicht verfügbar)${NC}"
fi

echo ""

# Abschluss & Next Steps
echo -e "${GREEN}[7/7] Deployment abgeschlossen!${NC}"
echo ""
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ n8n HTTPS erfolgreich deployed${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📊 Service URLs:"
echo "  • WebUI:  https://n8n.menschlichkeit-oesterreich.at"
echo "  • Health: https://n8n.menschlichkeit-oesterreich.at/healthz"
echo "  • Webhook: https://n8n.menschlichkeit-oesterreich.at/webhook/..."
echo ""
echo "🔐 Credentials (siehe .env):"
echo "  • Username: moe_admin"
echo "  • Password: <siehe $N8N_DIR/.env>"
echo ""
echo "📋 Next Steps:"
echo "  1. WebUI öffnen und anmelden"
echo "  2. Test-Webhook erstellen und triggern"
echo "  3. Alte HTTP-Workflows auf HTTPS-URLs migrieren"
echo "  4. Nach 30 Tagen: HSTS Preload einreichen (optional)"
echo ""
echo "📚 Dokumentation:"
echo "  docs/security/F-02-N8N-HTTPS-SETUP.md"
echo ""
echo "🔧 Troubleshooting:"
echo "  • Logs: docker logs -f moe-n8n-caddy"
echo "  • Logs: docker logs -f moe-n8n"
echo "  • Status: docker-compose -f docker-compose.https.yml ps"
echo "  • Rollback: ./rollback-to-http.sh"
echo ""
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
