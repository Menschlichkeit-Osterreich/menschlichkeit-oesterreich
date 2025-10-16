#!/bin/bash
# Aktiviere Plesk-Subdomains über Web-API oder Config-Files
# Da CLI nicht verfügbar ist, nutzen wir alternative Methode

set -euo pipefail

PLESK_HOST="dmpl20230054@5.183.217.146"

echo "=========================================="
echo "Plesk Subdomain Aktivierung"
echo "=========================================="
echo ""

# Prüfe vorhandene Subdomains
echo "1️⃣  Vorhandene Subdomain-Verzeichnisse:"
ssh $PLESK_HOST 'cd .. && ls -1d */ 2>/dev/null | grep -E "(stg|games|votes|analytics|n8n|grafana)" | head -20'
echo ""

# Prüfe fehlende Subdomains
echo "2️⃣  Zu erstellende Subdomains:"
echo "   - api.stg (fehlt, vorhanden: api.menschlichkeit-oesterreich.at)"
echo "   - games (fehlt)"
echo ""

echo "=========================================="
echo "📋 LÖSUNG: Plesk Web-UI DNS-Aktivierung"
echo "=========================================="
echo ""
echo "Da dieser SSH-User KEIN Plesk-Admin ist, müssen DNS-Records"
echo "über das Plesk Web-Panel aktiviert werden:"
echo ""
echo "URL: https://5.183.217.146:8443"
echo ""
echo "Navigation:"
echo "  1. Login mit Admin-Credentials"
echo "  2. Websites & Domains → menschlichkeit-oesterreich.at"
echo "  3. DNS Settings"
echo "  4. Für JEDE Subdomain prüfen ob A-Record existiert:"
echo ""

# Liste alle zu prüfenden Subdomains
SUBDOMAINS=(
    "api.stg"
    "admin.stg"
    "games"
    "votes"
    "s3"
    "consent"
    "support"
    "media"
    "hooks"
    "logs"
    "grafana"
    "status"
    "analytics"
    "newsletter"
    "n8n"
    "docs"
    "forum"
    "idp"
)

echo "Subdomain-Liste zum Aktivieren:"
for subdomain in "${SUBDOMAINS[@]}"; do
    echo "  ☐ $subdomain → A-Record → 5.183.217.146"
done

echo ""
echo "=========================================="
echo "🔧 ALTERNATIVE: Subdomain-Verzeichnisse erstellen"
echo "=========================================="
echo ""
echo "Fehlende Verzeichnisse auf Server anlegen:"
echo ""

# Erstelle fehlende Subdomain-Verzeichnisse
ssh $PLESK_HOST 'cd .. && \
echo "Erstelle api.stg..." && \
mkdir -p api.stg/httpdocs && \
echo "Erstelle games..." && \
mkdir -p games/httpdocs && \
echo "✅ Verzeichnisse erstellt" && \
ls -lad api.stg games 2>/dev/null'

echo ""
echo "=========================================="
echo "✅ NÄCHSTE SCHRITTE"
echo "=========================================="
echo ""
echo "1. ✅ SSH-Key installiert (kein Passwort mehr nötig)"
echo "2. ✅ Subdomain-Verzeichnisse erstellt"
echo "3. ⏳ DNS-Records über Plesk Web-UI aktivieren:"
echo ""
echo "   https://5.183.217.146:8443"
echo "   → Websites & Domains"
echo "   → menschlichkeit-oesterreich.at"
echo "   → DNS Settings"
echo "   → Add Record für jede Subdomain"
echo ""
echo "4. ⏳ Nach DNS-Aktivierung validieren:"
echo "   bash scripts/check-subdomain-dns.sh"
echo ""
