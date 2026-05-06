#!/usr/bin/env bash
# ============================================================
# TLS-Zertifikat-Prüfskript
# Menschlichkeit Österreich – Infrastruktur-Audit 2026-03
#
# Verwendung:
#   chmod +x scripts/ssl-cert-check.sh
#   ./scripts/ssl-cert-check.sh
#   ./scripts/ssl-cert-check.sh --json    # JSON-Ausgabe
#   ./scripts/ssl-cert-check.sh --email   # E-Mail bei Ablauf
#
# Cron (täglich 07:00):
#   0 7 * * * /path/to/scripts/ssl-cert-check.sh --email >> /var/log/ssl-check.log 2>&1
# ============================================================

set -euo pipefail

# ---- Konfiguration ----
DOMAINS=(
    "menschlichkeit-oesterreich.at"
    "www.menschlichkeit-oesterreich.at"
    "api.menschlichkeit-oesterreich.at"
    "crm.menschlichkeit-oesterreich.at"
    "cloud.menschlichkeit-oesterreich.at"
    "n8n.menschlichkeit-oesterreich.at"
    "forum.menschlichkeit-oesterreich.at"
    "support.menschlichkeit-oesterreich.at"
    "mail.menschlichkeit-oesterreich.at"
    "webmail.menschlichkeit-oesterreich.at"
)

WARN_DAYS=14
CRITICAL_DAYS=7
ALERT_EMAIL="${ALERT_EMAIL:-admin@menschlichkeit-oesterreich.at}"
SMTP_HOST="${SMTP_HOST:-mail.menschlichkeit-oesterreich.at}"

# ---- Argumente ----
JSON_OUTPUT=false
SEND_EMAIL=false
for arg in "$@"; do
    case "$arg" in
        --json)  JSON_OUTPUT=true ;;
        --email) SEND_EMAIL=true ;;
    esac
done

# ---- Farben (nur im Terminal) ----
if [ -t 1 ] && ! $JSON_OUTPUT; then
    RED='\033[0;31m'
    YELLOW='\033[1;33m'
    GREEN='\033[0;32m'
    NC='\033[0m'
else
    RED='' YELLOW='' GREEN='' NC=''
fi

# ---- Prüfung ----
RESULTS=()
FAILED=0
WARNING=0
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

for DOMAIN in "${DOMAINS[@]}"; do
    EXPIRY=$(echo | timeout 10 openssl s_client \
        -connect "${DOMAIN}:443" \
        -servername "${DOMAIN}" \
        2>/dev/null \
        | openssl x509 -noout -enddate 2>/dev/null \
        | sed 's/notAfter=//' || true)

    if [ -z "$EXPIRY" ]; then
        STATUS="unreachable"
        DAYS_LEFT=-1
        if ! $JSON_OUTPUT; then
            echo -e "${YELLOW}⚠  ${DOMAIN}: nicht erreichbar${NC}"
        fi
    else
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null \
            || date -j -f "%b %d %T %Y %Z" "$EXPIRY" +%s 2>/dev/null \
            || echo 0)
        NOW_EPOCH=$(date +%s)
        DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

        if [ "$DAYS_LEFT" -le "$CRITICAL_DAYS" ]; then
            STATUS="critical"
            FAILED=1
            if ! $JSON_OUTPUT; then
                echo -e "${RED}🔴 KRITISCH ${DOMAIN}: läuft in ${DAYS_LEFT} Tagen ab!${NC}"
            fi
        elif [ "$DAYS_LEFT" -le "$WARN_DAYS" ]; then
            STATUS="warning"
            WARNING=1
            if ! $JSON_OUTPUT; then
                echo -e "${YELLOW}🟡 WARNUNG  ${DOMAIN}: läuft in ${DAYS_LEFT} Tagen ab${NC}"
            fi
        else
            STATUS="ok"
            if ! $JSON_OUTPUT; then
                echo -e "${GREEN}✅ OK       ${DOMAIN}: ${DAYS_LEFT} Tage verbleibend${NC}"
            fi
        fi
    fi

    RESULTS+=("{\"domain\":\"${DOMAIN}\",\"status\":\"${STATUS}\",\"days_left\":${DAYS_LEFT}}")
done

# ---- JSON-Ausgabe ----
if $JSON_OUTPUT; then
    RESULTS_JSON=$(IFS=,; echo "${RESULTS[*]}")
    echo "{\"timestamp\":\"${TIMESTAMP}\",\"results\":[${RESULTS_JSON}],\"overall\":$([ $FAILED -eq 1 ] && echo '"critical"' || ([ $WARNING -eq 1 ] && echo '"warning"' || echo '"ok"'))}"
fi

# ---- E-Mail senden bei Problemen ----
if $SEND_EMAIL && [ $FAILED -eq 1 ]; then
    BODY="TLS-Zertifikat-Alarm – Menschlichkeit Österreich\n\n"
    BODY+="Kritische Zertifikate gefunden! Sofortiger Handlungsbedarf.\n\n"
    for RESULT in "${RESULTS[@]}"; do
        DOMAIN=$(echo "$RESULT" | grep -o '"domain":"[^"]*"' | cut -d'"' -f4)
        STATUS=$(echo "$RESULT" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        DAYS=$(echo "$RESULT" | grep -o '"days_left":[0-9-]*' | cut -d: -f2)
        if [ "$STATUS" = "critical" ]; then
            BODY+="🔴 KRITISCH: ${DOMAIN} – ${DAYS} Tage\n"
        fi
    done
    BODY+="\nAktion: Plesk → Domains → [Domain] → SSL/TLS → Let's Encrypt → Erneuern\n"
    BODY+="\nZeitstempel: ${TIMESTAMP}"

    echo -e "$BODY" | mail \
        -s "[MOE] TLS-Zertifikat läuft ab – Sofortmaßnahme!" \
        -S smtp="smtp://${SMTP_HOST}:587" \
        "$ALERT_EMAIL" 2>/dev/null || \
        echo "E-Mail-Versand fehlgeschlagen (mail-Befehl nicht verfügbar?)"
fi

# ---- Exit-Code ----
if [ $FAILED -eq 1 ]; then
    exit 2
elif [ $WARNING -eq 1 ]; then
    exit 1
else
    exit 0
fi
