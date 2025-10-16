#!/bin/bash
# Plesk DNS-Setup via XML-API
# Erfordert: Plesk Admin Login oder API-Key

set -euo pipefail

echo "=========================================="
echo "Plesk DNS-Setup via XML-API"
echo "=========================================="
echo ""

# Konfiguration
PLESK_HOST="5.183.217.146"
PLESK_PORT="8443"
DOMAIN="menschlichkeit-oesterreich.at"
SERVER_IP="5.183.217.146"

# API-Credentials (müssen gesetzt werden)
PLESK_USER="${PLESK_USER:-admin}"
PLESK_PASSWORD="${PLESK_PASSWORD:-}"
PLESK_API_KEY="${PLESK_API_KEY:-}"

echo "📋 Ziel-Konfiguration:"
echo "   Plesk Server: $PLESK_HOST:$PLESK_PORT"
echo "   Domain: $DOMAIN"
echo "   DNS IP: $SERVER_IP"
echo ""

# Subdomains die erstellt werden sollen
SUBDOMAINS=(
    "api.stg"
    "games"
    "admin.stg"
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

# Funktion: DNS-Record via Plesk XML-API erstellen
create_dns_record() {
    local subdomain="$1"
    local ip="$2"
    
    # XML-Payload für DNS-Record
    local xml_payload=$(cat <<EOF
<packet>
  <dns>
    <add_rec>
      <site-id>menschlichkeit-oesterreich.at</site-id>
      <type>A</type>
      <host>$subdomain</host>
      <value>$ip</value>
    </add_rec>
  </dns>
</packet>
EOF
)
    
    # API-Request
    if [[ -n "$PLESK_API_KEY" ]]; then
        # Mit API-Key
        curl -k -X POST \
            -H "Content-Type: text/xml" \
            -H "HTTP_AUTH_LOGIN: $PLESK_USER" \
            -H "HTTP_AUTH_PASSWD: $PLESK_API_KEY" \
            -d "$xml_payload" \
            "https://$PLESK_HOST:$PLESK_PORT/enterprise/control/agent.php"
    elif [[ -n "$PLESK_PASSWORD" ]]; then
        # Mit Passwort
        curl -k -X POST \
            -u "$PLESK_USER:$PLESK_PASSWORD" \
            -H "Content-Type: text/xml" \
            -d "$xml_payload" \
            "https://$PLESK_HOST:$PLESK_PORT/enterprise/control/agent.php"
    else
        echo "❌ FEHLER: Weder PLESK_API_KEY noch PLESK_PASSWORD gesetzt!"
        return 1
    fi
}

# Prüfe Credentials
if [[ -z "$PLESK_API_KEY" && -z "$PLESK_PASSWORD" ]]; then
    echo "❌ FEHLER: Plesk-Credentials fehlen!"
    echo ""
    echo "Bitte setzen:"
    echo "  export PLESK_USER=admin"
    echo "  export PLESK_PASSWORD='dein-plesk-passwort'"
    echo ""
    echo "ODER mit API-Key:"
    echo "  export PLESK_API_KEY='dein-api-key'"
    echo ""
    echo "API-Key erstellen:"
    echo "  1. Login: https://$PLESK_HOST:$PLESK_PORT"
    echo "  2. Tools & Settings → API Keys → Create API Key"
    echo ""
    exit 1
fi

# DNS-Records erstellen
echo "=========================================="
echo "DNS-Records erstellen"
echo "=========================================="
echo ""

SUCCESS=0
FAILED=0

for subdomain in "${SUBDOMAINS[@]}"; do
    echo -n "  $subdomain.$DOMAIN → $SERVER_IP ... "
    
    if create_dns_record "$subdomain" "$SERVER_IP" 2>/dev/null | grep -q "ok"; then
        echo "✅"
        ((SUCCESS++))
    else
        echo "❌"
        ((FAILED++))
    fi
done

echo ""
echo "=========================================="
echo "📊 Zusammenfassung"
echo "=========================================="
echo "  ✅ Erfolgreich: $SUCCESS"
echo "  ❌ Fehlgeschlagen: $FAILED"
echo ""

if [[ $SUCCESS -gt 0 ]]; then
    echo "⏳ DNS-Propagierung abwarten (1-24h)"
    echo "   Prüfen mit: bash scripts/check-subdomain-dns.sh"
fi

echo ""
echo "=========================================="
echo "🌐 ALTERNATIVE: Plesk Web-Panel"
echo "=========================================="
echo ""
echo "Falls API-Setup nicht funktioniert:"
echo ""
echo "1. Login: https://$PLESK_HOST:$PLESK_PORT"
echo "2. Websites & Domains → $DOMAIN"
echo "3. DNS Settings"
echo "4. Für jede Subdomain:"
echo "   - Add Record"
echo "   - Type: A"
echo "   - Host: $subdomain"
echo "   - Value: $SERVER_IP"
echo "   - TTL: 3600"
echo ""
echo "Liste der Subdomains:"
for subdomain in "${SUBDOMAINS[@]}"; do
    echo "   • $subdomain"
done
echo ""
