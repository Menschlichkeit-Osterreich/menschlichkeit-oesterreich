#!/bin/bash
# Komplettes DNS-Setup für Menschlichkeit Österreich
# Erstellt ALLE DNS-Records inkl. bestehende und neue Subdomains

set -euo pipefail

echo "=========================================="
echo "DNS-Setup für Menschlichkeit Österreich"
echo "Alle Subdomains + Core-Domains"
echo "=========================================="
echo ""

# Variablen
DOMAIN="menschlichkeit-oesterreich.at"
SERVER_IP="5.183.217.146"
PLESK_HOST="dmpl20230054@5.183.217.146"

echo "📋 Ziel-Konfiguration:"
echo "   Domain: $DOMAIN"
echo "   Server-IP: $SERVER_IP"
echo "   Plesk-Host: $PLESK_HOST"
echo ""

# ============================================
# CORE-DOMAINS (bereits konfiguriert)
# ============================================

echo "=========================================="
echo "1️⃣  CORE-DOMAINS (Status-Check)"
echo "=========================================="
echo ""

CORE_DOMAINS=(
    "@"                    # Hauptdomain
    "www"                  # WWW-Subdomain
    "api.stg"              # API-Service (Staging)
    "crm"                  # CRM-System (Drupal + CiviCRM)
)

echo "Bestehende Core-Domains:"
for subdomain in "${CORE_DOMAINS[@]}"; do
    if [ "$subdomain" = "@" ]; then
        check_domain="$DOMAIN"
        display_name="$DOMAIN (Hauptdomain)"
    else
        check_domain="${subdomain}.${DOMAIN}"
        display_name="$check_domain"
    fi
    
    ip=$(getent hosts "$check_domain" 2>/dev/null | awk '{print $1}' || echo "")
    if [[ -n "$ip" ]]; then
        echo "  ✅ $display_name → $ip"
    else
        echo "  ❌ $display_name → Keine Auflösung (MUSS ERSTELLT WERDEN)"
    fi
done

echo ""

# ============================================
# NEUE GAMING-DOMAINS
# ============================================

echo "=========================================="
echo "2️⃣  GAMING-PLATFORM DOMAINS (NEU)"
echo "=========================================="
echo ""

GAMING_DOMAINS=(
    "games"                # Gaming-Platform
    "votes"                # Voting-System
)

echo "Gaming-Domains (zu erstellen):"
for subdomain in "${GAMING_DOMAINS[@]}"; do
    check_domain="${subdomain}.${DOMAIN}"
    ip=$(getent hosts "$check_domain" 2>/dev/null | awk '{print $1}' || echo "")
    if [[ -n "$ip" ]]; then
        echo "  ✅ $check_domain → $ip"
    else
        echo "  ❌ $check_domain → Muss erstellt werden"
    fi
done

echo ""

# ============================================
# INFRASTRUCTURE & SERVICES (16 Subdomains)
# ============================================

echo "=========================================="
echo "3️⃣  INFRASTRUCTURE SERVICES (NEU)"
echo "=========================================="
echo ""

INFRA_DOMAINS=(
    "admin.stg"            # Staging Admin Panel
    "s3"                   # Object Storage (MinIO)
    "consent"              # Cookie Consent
    "support"              # Support-Tickets
    "media"                # Media CDN
    "hooks"                # Webhook Gateway
    "logs"                 # Log Aggregation
    "grafana"              # Monitoring Dashboard
    "status"               # Status Page
    "analytics"            # Privacy Analytics
    "newsletter"           # Newsletter
    "n8n"                  # Workflow Automation
    "docs"                 # Dokumentation
    "forum"                # Community Forum
    "idp"                  # Identity Provider
)

echo "Infrastructure-Domains (zu erstellen):"
for subdomain in "${INFRA_DOMAINS[@]}"; do
    check_domain="${subdomain}.${DOMAIN}"
    ip=$(getent hosts "$check_domain" 2>/dev/null | awk '{print $1}' || echo "")
    if [[ -n "$ip" ]]; then
        echo "  ✅ $check_domain → $ip"
    else
        echo "  ❌ $check_domain → Muss erstellt werden"
    fi
done

echo ""

# ============================================
# ZUSAMMENFASSUNG & PLESK-KOMMANDOS
# ============================================

echo "=========================================="
echo "📊 ZUSAMMENFASSUNG"
echo "=========================================="
echo ""

TOTAL_SUBDOMAINS=$((${#CORE_DOMAINS[@]} + ${#GAMING_DOMAINS[@]} + ${#INFRA_DOMAINS[@]}))
echo "Gesamt-Anzahl Domains/Subdomains: $TOTAL_SUBDOMAINS"
echo "  - Core-Domains: ${#CORE_DOMAINS[@]}"
echo "  - Gaming-Domains: ${#GAMING_DOMAINS[@]}"
echo "  - Infrastructure-Domains: ${#INFRA_DOMAINS[@]}"
echo ""

# ============================================
# PLESK-SETUP-KOMMANDOS GENERIEREN
# ============================================

echo "=========================================="
echo "🔧 PLESK DNS-SETUP KOMMANDOS"
echo "=========================================="
echo ""
echo "METHODE 1: Einzelne A-Records (EMPFOHLEN für Kontrolle)"
echo "-----------------------------------------------------------"
echo ""
echo "# Nach SSH-Login zu Plesk ($PLESK_HOST):"
echo ""

# Core-Domains
echo "# 1️⃣  Core-Domains"
for subdomain in "${CORE_DOMAINS[@]}"; do
    if [ "$subdomain" = "@" ]; then
        echo "# Hauptdomain (bereits konfiguriert, überprüfen):"
        echo "plesk bin dns --info $DOMAIN -domain $DOMAIN"
    else
        echo "plesk bin dns --add $DOMAIN -host $subdomain -type A -value $SERVER_IP -ttl 3600"
    fi
done

echo ""
echo "# 2️⃣  Gaming-Domains"
for subdomain in "${GAMING_DOMAINS[@]}"; do
    echo "plesk bin dns --add $DOMAIN -host $subdomain -type A -value $SERVER_IP -ttl 3600"
done

echo ""
echo "# 3️⃣  Infrastructure-Domains"
for subdomain in "${INFRA_DOMAINS[@]}"; do
    echo "plesk bin dns --add $DOMAIN -host $subdomain -type A -value $SERVER_IP -ttl 3600"
done

echo ""
echo "=========================================="
echo "METHODE 2: Wildcard-Record (SCHNELL aber weniger Kontrolle)"
echo "-----------------------------------------------------------"
echo ""
echo "# Ein Wildcard-Record für ALLE Subdomains:"
echo "plesk bin dns --add $DOMAIN -host '*' -type A -value $SERVER_IP -ttl 3600"
echo ""
echo "⚠️  ACHTUNG: Wildcard überschreibt spezifische Records!"
echo "   Nur verwenden wenn keine speziellen DNS-Einträge benötigt werden."
echo ""

# ============================================
# SKRIPT-GENERIERUNG FÜR AUTOMATISCHES SETUP
# ============================================

echo "=========================================="
echo "📜 AUTOMATISCHES SETUP-SKRIPT GENERIEREN"
echo "=========================================="
echo ""

SETUP_SCRIPT="/tmp/plesk-dns-setup.sh"

cat > "$SETUP_SCRIPT" <<'EOF'
#!/bin/bash
# Auto-generiertes DNS-Setup für Plesk
# Wird auf Plesk-Server ausgeführt

set -euo pipefail

DOMAIN="menschlichkeit-oesterreich.at"
SERVER_IP="5.183.217.146"

echo "=========================================="
echo "DNS-Records erstellen für $DOMAIN"
echo "=========================================="
echo ""

# Funktion: DNS-Record hinzufügen
add_dns_record() {
    local host="$1"
    local type="$2"
    local value="$3"
    
    if plesk bin dns --info "$DOMAIN" | grep -q "^$host\s"; then
        echo "  ⏭️  $host.$DOMAIN bereits vorhanden (übersprungen)"
    else
        if plesk bin dns --add "$DOMAIN" -host "$host" -type "$type" -value "$value" -ttl 3600 2>/dev/null; then
            echo "  ✅ $host.$DOMAIN → $value"
        else
            echo "  ❌ FEHLER bei $host.$DOMAIN"
        fi
    fi
}

echo "1️⃣  Core-Domains"
EOF

# Core-Domains hinzufügen
for subdomain in "${CORE_DOMAINS[@]}"; do
    if [ "$subdomain" != "@" ]; then
        echo "add_dns_record \"$subdomain\" \"A\" \"$SERVER_IP\"" >> "$SETUP_SCRIPT"
    fi
done

cat >> "$SETUP_SCRIPT" <<'EOF'

echo ""
echo "2️⃣  Gaming-Domains"
EOF

# Gaming-Domains hinzufügen
for subdomain in "${GAMING_DOMAINS[@]}"; do
    echo "add_dns_record \"$subdomain\" \"A\" \"$SERVER_IP\"" >> "$SETUP_SCRIPT"
done

cat >> "$SETUP_SCRIPT" <<'EOF'

echo ""
echo "3️⃣  Infrastructure-Domains"
EOF

# Infrastructure-Domains hinzufügen
for subdomain in "${INFRA_DOMAINS[@]}"; do
    echo "add_dns_record \"$subdomain\" \"A\" \"$SERVER_IP\"" >> "$SETUP_SCRIPT"
done

cat >> "$SETUP_SCRIPT" <<'EOF'

echo ""
echo "=========================================="
echo "✅ DNS-Setup abgeschlossen!"
echo "=========================================="
echo ""
echo "Nächste Schritte:"
echo "  1. DNS-Propagierung abwarten (1-24h)"
echo "  2. Lokale Prüfung: bash scripts/check-subdomain-dns.sh"
echo "  3. SSL-Zertifikate via Let's Encrypt generieren"
echo ""
EOF

chmod +x "$SETUP_SCRIPT"

echo "✅ Automatisches Setup-Skript erstellt: $SETUP_SCRIPT"
echo ""
echo "Verwendung:"
echo "  1. Skript auf Plesk-Server kopieren:"
echo "     scp $SETUP_SCRIPT $PLESK_HOST:/tmp/"
echo ""
echo "  2. Auf Plesk-Server ausführen:"
echo "     ssh $PLESK_HOST 'bash /tmp/plesk-dns-setup.sh'"
echo ""

# ============================================
# ALTERNATIVE: WEB-UI ANLEITUNG
# ============================================

echo "=========================================="
echo "🌐 ALTERNATIVE: Plesk Web-UI"
echo "=========================================="
echo ""
echo "Falls SSH nicht verfügbar:"
echo ""
echo "1. Login: https://5.183.217.146:8443"
echo "2. Navigation: Websites & Domains → $DOMAIN → DNS Settings"
echo "3. Für jede Subdomain:"
echo "   - Klicke 'Add Record'"
echo "   - Record Type: A"
echo "   - Host: [subdomain-name] (z.B. 'api', 'game', 'n8n')"
echo "   - Value: $SERVER_IP"
echo "   - TTL: 3600"
echo "   - Klicke 'OK'"
echo ""

# ============================================
# DNS-VALIDATION NACH SETUP
# ============================================

echo "=========================================="
echo "🧪 VALIDATION NACH DNS-SETUP"
echo "=========================================="
echo ""
echo "1. Sofort (lokal):"
echo "   bash scripts/check-subdomain-dns.sh"
echo ""
echo "2. Nach 1-6 Stunden (DNS-Propagierung):"
echo "   bash scripts/check-subdomain-dns.sh"
echo ""
echo "3. Public DNS Check:"
echo "   https://dnschecker.org/#A/api.menschlichkeit-oesterreich.at"
echo ""
echo "4. SSL-Zertifikate generieren (nach DNS-Propagierung):"
echo "   Plesk → SSL/TLS Certificates → Let's Encrypt → Reissue"
echo ""

# ============================================
# KOMPLETTE DNS-RECORD-LISTE FÜR COPY-PASTE
# ============================================

echo "=========================================="
echo "📋 KOMPLETTE PLESK CLI KOMMANDO-LISTE"
echo "=========================================="
echo ""
echo "# Für Copy-Paste in Plesk SSH-Session:"
echo ""

# Alle Domains zusammen
ALL_DOMAINS=()
for subdomain in "${CORE_DOMAINS[@]}"; do
    if [ "$subdomain" != "@" ]; then
        ALL_DOMAINS+=("$subdomain")
    fi
done
ALL_DOMAINS+=("${GAMING_DOMAINS[@]}")
ALL_DOMAINS+=("${INFRA_DOMAINS[@]}")

for subdomain in "${ALL_DOMAINS[@]}"; do
    echo "plesk bin dns --add $DOMAIN -host $subdomain -type A -value $SERVER_IP -ttl 3600"
done

echo ""
echo "=========================================="
echo "✅ SETUP-GUIDE ABGESCHLOSSEN"
echo "=========================================="
echo ""
echo "Nächste Schritte:"
echo "  1. ✅ Dieses Skript ausgeführt"
echo "  2. ⏳ SSH zu Plesk oder Web-UI öffnen"
echo "  3. ⏳ DNS-Records erstellen (CLI oder UI)"
echo "  4. ⏳ 1-24h DNS-Propagierung abwarten"
echo "  5. ⏳ Validation durchführen"
echo "  6. ⏳ SSL-Zertifikate generieren"
echo ""
