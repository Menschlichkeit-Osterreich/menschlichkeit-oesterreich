#!/bin/bash
# Rollback zu HTTP (falls HTTPS fehlschlägt)
# Nur für Notfälle - entfernt TLS-Verschlüsselung!

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}══════════════════════════════════════════════════════════════${NC}"
echo -e "${RED}  WARNUNG: Rollback zu HTTP (unverschlüsselt)${NC}"
echo -e "${RED}  Dies entfernt die TLS-Verschlüsselung!${NC}"
echo -e "${RED}══════════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Wirklich fortfahren? (yes/NO) " -r
if [[ ! $REPLY == "yes" ]]; then
    echo "Abgebrochen."
    exit 0
fi

cd "$(dirname "$0")"

echo "→ Stoppe HTTPS-Stack..."
docker-compose -f docker-compose.https.yml down

echo "→ Starte HTTP-Stack..."
docker-compose -f docker-compose.yml up -d

echo ""
echo -e "${YELLOW}✓ Rollback abgeschlossen${NC}"
echo "  n8n erreichbar auf: http://localhost:5678"
echo ""
echo "⚠️  DSGVO Art. 32 NICHT erfüllt - Webhooks unverschlüsselt!"
