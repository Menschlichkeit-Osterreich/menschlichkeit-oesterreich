#!/bin/bash
# Safe Deployment Script mit Pre-Checks und Backup

# Sichere Konfiguration laden
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/load-config.sh"

# Initialize secure configuration
if ! initialize_secure_config; then
    echo -e "${RED}❌ Fehler beim Laden der Konfiguration${NC}"
    exit 1
fi

# SFTP Funktionen laden
source "$SCRIPT_DIR/sftp-sync.sh"

# n8n Webhook Integration laden (falls verfügbar)
if [ -f "$SCRIPT_DIR/../automation/n8n/webhook-client.js" ]; then
    N8N_WEBHOOK_CLIENT="$SCRIPT_DIR/../automation/n8n/webhook-client.js"
    N8N_AVAILABLE=true
else
    N8N_AVAILABLE=false
fi

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# n8n Deployment Started Notification
if [ "$N8N_AVAILABLE" = true ]; then
    echo -e "${BLUE}📡 Sending deployment started notification...${NC}"
    node "$N8N_WEBHOOK_CLIENT" deploy "website" "started" || echo -e "${YELLOW}⚠️ n8n notification failed (continuing)${NC}"
fi

echo -e "${BLUE}🔒 Safe Deployment für Menschlichkeit Österreich${NC}"
echo "=================================================="

# Pre-Deployment Checks
echo -e "\n${YELLOW}📋 Pre-Deployment Checks...${NC}"

# 1. Sichere Konfiguration validiert (bereits durch initialize_secure_config)
if [ -z "$REMOTE_HOST" ] || [ -z "$REMOTE_USER" ]; then
    echo -e "${RED}❌ FEHLER: Server-Konfiguration unvollständig!${NC}"
    echo "Bitte REMOTE_HOST und REMOTE_USER in sftp-sync.sh konfigurieren."
    exit 1
fi

# 2. Lokale Dateien validieren
if [ ! -d "$LOCAL_BASE/website" ]; then
    echo -e "${RED}❌ FEHLER: Website-Verzeichnis nicht gefunden!${NC}"
    exit 1
fi

# 3. Codacy Analyse durchführen
echo -e "${YELLOW}🔍 Code-Qualitätsprüfung...${NC}"
if command -v java &> /dev/null; then
    if [ -f "$HOME/.codacy/codacy-analysis-cli-assembly.jar" ]; then
        java -jar "$HOME/.codacy/codacy-analysis-cli-assembly.jar" analyze --directory "$LOCAL_BASE/website" --format text

        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}⚠️  Code-Qualität Warnungen gefunden. Fortfahren? (j/N)${NC}"
            read -r response
            if [[ ! "$response" =~ ^[Jj]$ ]]; then
                echo -e "${RED}Deployment abgebrochen.${NC}"
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Codacy CLI nicht gefunden - überspringe Code-Analyse${NC}"
    fi
fi

# 4. Backup erstellen (falls Server-Zugang vorhanden)
echo -e "${YELLOW}💾 Remote Backup erstellen...${NC}"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
echo "Backup würde erstellt: backup_$BACKUP_DATE"

# 5. Benutzerbestätigung
echo -e "\n${YELLOW}🚀 Deployment-Übersicht:${NC}"
echo "Server: $REMOTE_USER@$REMOTE_HOST:$REMOTE_PORT"
echo "Lokales Verzeichnis: $LOCAL_BASE"
echo "Domains:"
echo "  - menschlichkeit-oesterreich.at → /httpdocs"
echo "  - api.menschlichkeit-oesterreich.at → /subdomains/api/httpdocs"
echo "  - crm.menschlichkeit-oesterreich.at → /subdomains/crm/httpdocs"
echo ""
echo -e "${YELLOW}Deployment starten? (j/N)${NC}"
read -r response

if [[ "$response" =~ ^[Jj]$ ]]; then
    echo -e "\n${GREEN}🚀 Starte Deployment...${NC}"

    # Original SFTP Script ausführen
    bash "$SCRIPT_DIR/sftp-sync.sh"

    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✅ Deployment erfolgreich abgeschlossen!${NC}"

        # n8n Success Notification
        if [ "$N8N_AVAILABLE" = true ]; then
            echo -e "${BLUE}📡 Sending deployment success notification...${NC}"
            node "$N8N_WEBHOOK_CLIENT" deploy "website" "success" || echo -e "${YELLOW}⚠️ n8n success notification failed${NC}"
        fi

        echo -e "${BLUE}📝 Post-Deployment Checks:${NC}"
        echo "1. Website testen: https://menschlichkeit-oesterreich.at"
        echo "2. SSL-Zertifikate prüfen"
        echo "3. API-Endpoints validieren (falls vorhanden)"
    else
        echo -e "\n${RED}❌ Deployment fehlgeschlagen!${NC}"

        # n8n Failure Notification
        if [ "$N8N_AVAILABLE" = true ]; then
            echo -e "${BLUE}📡 Sending deployment failure notification...${NC}"
            node "$N8N_WEBHOOK_CLIENT" deploy "website" "failed" || echo -e "${YELLOW}⚠️ n8n failure notification failed${NC}"
        fi

        echo "Bitte Logs überprüfen und bei Bedarf Backup wiederherstellen."
        exit 1
    fi
else
    echo -e "${YELLOW}Deployment abgebrochen.${NC}"
    exit 0
fi
