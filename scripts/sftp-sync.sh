#!/bin/bash
# SFTP Sync Script für Menschlichkeit Österreich Development

# Sichere Konfiguration laden (falls nicht bereits geladen)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -z "$DB_WP_NAME" ]; then
    source "$SCRIPT_DIR/../config/load-config.sh"
    initialize_secure_config || exit 1
fi

# SFTP Konfiguration mit korrekter IP-Adresse
REMOTE_HOST="5.183.217.146"
REMOTE_USER="dmpl20230054"
REMOTE_PORT=22
LOCAL_BASE="/mnt/d/Arbeitsverzeichniss"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 SFTP Sync für Menschlichkeit Österreich Development${NC}"
echo "========================================================"

# Funktion für SFTP Upload
sync_directory() {
    local LOCAL_DIR=$1
    local REMOTE_DIR=$2
    local DESCRIPTION=$3
    
    echo -e "\n${YELLOW}📂 Syncing: $DESCRIPTION${NC}"
    echo "   Local:  $LOCAL_DIR"
    echo "   Remote: $REMOTE_DIR"
    
    if [ ! -d "$LOCAL_DIR" ]; then
        echo -e "${RED}❌ Local directory not found: $LOCAL_DIR${NC}"
        return 1
    fi
    
    # SFTP Batch Commands
    cat > /tmp/sftp_batch.txt << EOF
-mkdir $REMOTE_DIR
cd $REMOTE_DIR
lcd $LOCAL_DIR
put -r *
quit
EOF
    
    # Execute SFTP mit SSH-Key
    echo -e "${BLUE}⬆️  Uploading...${NC}"
    sftp -P $REMOTE_PORT -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no -b /tmp/sftp_batch.txt $REMOTE_USER@$REMOTE_HOST
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully synced: $DESCRIPTION${NC}"
    else
        echo -e "${RED}❌ Failed to sync: $DESCRIPTION${NC}"
        return 1
    fi
    
    rm -f /tmp/sftp_batch.txt
}

# Check SFTP availability
if ! command -v sftp &> /dev/null; then
    echo -e "${RED}❌ SFTP not found. Please install OpenSSH client.${NC}"
    exit 1
fi

# Validierung der Konfiguration
if [ -z "$REMOTE_HOST" ] || [ -z "$REMOTE_USER" ]; then
    echo -e "${RED}❌ Please configure REMOTE_HOST and REMOTE_USER in this script${NC}"
    echo "   Edit the variables at the top of this file:"
    echo "   REMOTE_HOST=\"your-server.com\""
    echo "   REMOTE_USER=\"your-username\""
    exit 1
fi

echo -e "${YELLOW}📋 Pre-sync Checks:${NC}"
echo "   Remote Host: $REMOTE_HOST"
echo "   Remote User: $REMOTE_USER"
echo "   Remote Port: $REMOTE_PORT"
echo "   Local Base:  $LOCAL_BASE"

# Hauptdomain Website (menschlichkeit-oesterreich.at)
sync_directory \
    "$LOCAL_BASE/website" \
    "/httpdocs" \
    "Hauptdomain Website (httpdocs)"

# API Subdomain (api.menschlichkeit-oesterreich.at)
if [ -d "$LOCAL_BASE/api.menschlichkeit-oesterreich.at" ]; then
    sync_directory \
        "$LOCAL_BASE/api.menschlichkeit-oesterreich.at" \
        "/api.menschlichkeit-oesterreich.at/httpdocs" \
        "API Subdomain"
else
    echo -e "${YELLOW}⚠️  API directory not found - will be created during API development${NC}"
fi

# CRM Subdomain (crm.menschlichkeit-oesterreich.at)
if [ -d "$LOCAL_BASE/crm.menschlichkeit-oesterreich.at" ]; then
    sync_directory \
        "$LOCAL_BASE/crm.menschlichkeit-oesterreich.at" \
        "/crm.menschlichkeit-oesterreich.at/httpdocs" \
        "CRM Subdomain"
else
    echo -e "${YELLOW}⚠️  CRM directory not found - will be created during CRM integration${NC}"
fi

echo -e "\n${GREEN}🎉 SFTP Sync completed!${NC}"
echo -e "${BLUE}📊 Next Steps:${NC}"
echo "   1. Verify uploads on remote server"
echo "   2. Test static website functionality"
echo "   3. Set up API subdomain (if needed)"
echo "   4. Configure CiviCRM integration (if needed)"