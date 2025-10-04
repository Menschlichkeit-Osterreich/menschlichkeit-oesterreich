#!/bin/bash
# DNS Check für Menschlichkeit Österreich Subdomains
# Lokale Ausführung ohne Server-Zugang

set -uo pipefail

echo "=========================================="
echo "DNS-Auflösungscheck - Subdomains"
echo "Menschlichkeit Österreich"
echo "=========================================="
echo ""

# Erwartete Server-IP (Plesk)
EXPECTED_IP="5.183.217.146"

# Liste der Subdomains
subdomains=(
    "api.stg.menschlichkeit-oesterreich.at"
    "admin.stg.menschlichkeit-oesterreich.at"
    "games.menschlichkeit-oesterreich.at"
    "s3.menschlichkeit-oesterreich.at"
    "consent.menschlichkeit-oesterreich.at"
    "support.menschlichkeit-oesterreich.at"
    "votes.menschlichkeit-oesterreich.at"
    "media.menschlichkeit-oesterreich.at"
    "hooks.menschlichkeit-oesterreich.at"
    "logs.menschlichkeit-oesterreich.at"
    "grafana.menschlichkeit-oesterreich.at"
    "status.menschlichkeit-oesterreich.at"
    "analytics.menschlichkeit-oesterreich.at"
    "newsletter.menschlichkeit-oesterreich.at"
    "n8n.menschlichkeit-oesterreich.at"
    "docs.menschlichkeit-oesterreich.at"
    "forum.menschlichkeit-oesterreich.at"
    "idp.menschlichkeit-oesterreich.at"
)

configured=0
missing=0

printf "%-50s | %-15s | %s\n" "Domain" "Status" "IP-Adresse"
printf "%s\n" "$(printf '=%.0s' {1..110})"

for domain in "${subdomains[@]}"; do
    # DNS-Auflösung versuchen
    ip=$(host "$domain" 2>/dev/null | grep "has address" | awk '{print $NF}' | head -1)
    
    if [[ -n "$ip" ]]; then
        if [[ "$ip" == "$EXPECTED_IP" ]]; then
            printf "%-50s | %-15s | %s\n" "$domain" "✅ Konfiguriert" "$ip"
            ((configured++))
        else
            printf "%-50s | %-15s | %s (⚠️  Falsche IP!)\n" "$domain" "⚠️  Warnung" "$ip"
            ((configured++))
        fi
    else
        printf "%-50s | %-15s | %s\n" "$domain" "❌ Nicht konfiguriert" "-"
        ((missing++))
    fi
done

echo ""
echo "=========================================="
echo "📊 Zusammenfassung:"
echo "=========================================="
echo "✅ Konfiguriert:     $configured / ${#subdomains[@]}"
echo "❌ Nicht konfiguriert: $missing / ${#subdomains[@]}"
echo "🎯 Erwartete IP:     $EXPECTED_IP"
echo ""

TOTAL_EXPECTED=18  # api.stg, admin.stg, games + 15 infrastructure

if [[ $configured -eq $TOTAL_EXPECTED ]]; then
    echo "✅ ALLE SUBDOMAINS ERFOLGREICH KONFIGURIERT!"
    echo ""
    echo "Nächste Schritte:"
    echo "  1. HTTPS testen: curl -I https://n8n.menschlichkeit-oesterreich.at"
    echo "  2. SSL-Zertifikate prüfen: openssl s_client -connect n8n.menschlichkeit-oesterreich.at:443"
    echo "  3. Services starten und Reverse Proxies konfigurieren"
    exit 0
elif [[ $configured -gt 0 ]]; then
    echo "⚠️  TEILWEISE KONFIGURIERT ($configured/$((${#subdomains[@]})))"
    echo ""
    echo "Fehlende Subdomains auf Plesk-Server anlegen:"
    echo "  ssh dmpl20230054@5.183.217.146"
    echo "  plesk bin subdomain --create <name> -domain menschlichkeit-oesterreich.at"
    echo ""
    echo "Siehe: docs/infrastructure/SUBDOMAIN-DNS-CHECK-GUIDE.md"
    exit 1
else
    echo "❌ KEINE SUBDOMAINS KONFIGURIERT"
    echo ""
    echo "DRINGEND: Plesk-Server-Konfiguration erforderlich!"
    echo ""
    echo "Automatisches Setup-Skript verwenden:"
    echo "  Siehe: docs/infrastructure/SUBDOMAIN-DNS-CHECK-GUIDE.md"
    echo "  Abschnitt: 'Automatisiertes Setup-Skript'"
    exit 1
fi
