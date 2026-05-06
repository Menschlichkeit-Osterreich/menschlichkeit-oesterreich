#!/bin/bash
# Post-Deployment Testing Script für Menschlichkeit Österreich

# Sichere Konfiguration laden
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config/load-config.sh"
initialize_secure_config || exit 1

# Domain Konfiguration aus APP_URL ableiten
BASE_DOMAIN=$(echo "$APP_URL" | sed 's|https\?://||' | sed 's|/.*||')
MAIN_DOMAIN="$BASE_DOMAIN"
API_DOMAIN="api.$BASE_DOMAIN"
CRM_DOMAIN="crm.$BASE_DOMAIN"

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Post-Deployment Testing Suite${NC}"
echo "=================================="

# Test-Funktionen
test_domain() {
    local domain=$1
    local expected_status=$2
    local description=$3
    
    echo -e "\n${YELLOW}🌐 Testing: $description${NC}"
    echo "Domain: https://$domain"
    
    # HTTP Status Check
    if command -v curl &> /dev/null; then
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "https://$domain" --max-time 10)
        
        if [ "$status_code" == "$expected_status" ]; then
            echo -e "${GREEN}✅ HTTP Status: $status_code (Expected: $expected_status)${NC}"
        else
            echo -e "${RED}❌ HTTP Status: $status_code (Expected: $expected_status)${NC}"
            return 1
        fi
        
        # Response Time Check
        response_time=$(curl -s -o /dev/null -w "%{time_total}" "https://$domain" --max-time 10)
        if (( $(echo "$response_time < 3.0" | bc -l) )); then
            echo -e "${GREEN}✅ Response Time: ${response_time}s${NC}"
        else
            echo -e "${YELLOW}⚠️  Response Time: ${response_time}s (>3s)${NC}"
        fi
        
    else
        echo -e "${YELLOW}⚠️  curl nicht verfügbar - überspringe HTTP-Tests${NC}"
    fi
    
    return 0
}

test_ssl_certificate() {
    local domain=$1
    
    echo -e "\n${YELLOW}🔒 SSL Certificate Test: $domain${NC}"
    
    if command -v openssl &> /dev/null; then
        ssl_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ SSL Certificate valid${NC}"
            echo "$ssl_info" | grep "notAfter" | sed 's/notAfter=/Expires: /'
        else
            echo -e "${RED}❌ SSL Certificate issue${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  openssl nicht verfügbar - überspringe SSL-Tests${NC}"
    fi
}

test_website_content() {
    echo -e "\n${YELLOW}📄 Website Content Verification${NC}"
    
    if command -v curl &> /dev/null; then
        # Test für wichtige Keywords auf Hauptseite
        content=$(curl -s "https://$MAIN_DOMAIN" --max-time 10)
        
        keywords=("Menschlichkeit" "Österreich" "Gewerkschaft" "Solidarität")
        
        for keyword in "${keywords[@]}"; do
            if echo "$content" | grep -i "$keyword" > /dev/null; then
                echo -e "${GREEN}✅ Keyword found: $keyword${NC}"
            else
                echo -e "${YELLOW}⚠️  Keyword missing: $keyword${NC}"
            fi
        done
        
        # Test HTML-Struktur
        if echo "$content" | grep -i "<!DOCTYPE html>" > /dev/null; then
            echo -e "${GREEN}✅ Valid HTML structure${NC}"
        else
            echo -e "${RED}❌ HTML structure issue${NC}"
        fi
        
        # Test Bootstrap CSS
        if echo "$content" | grep -i "bootstrap" > /dev/null; then
            echo -e "${GREEN}✅ Bootstrap CSS loaded${NC}"
        else
            echo -e "${YELLOW}⚠️  Bootstrap CSS not detected${NC}"
        fi
        
    else
        echo -e "${YELLOW}⚠️  curl nicht verfügbar - überspringe Content-Tests${NC}"
    fi
}

# Test Suite ausführen
echo -e "\n${BLUE}🚀 Starting Test Suite...${NC}"

# 1. Hauptdomain testen
test_domain "$MAIN_DOMAIN" "200" "Hauptdomain Website"

# 2. API Subdomain testen (erwartet 404 oder Setup-Page)
test_domain "$API_DOMAIN" "404" "API Subdomain (Under Development)" || \
test_domain "$API_DOMAIN" "200" "API Subdomain (Setup Page)"

# 3. CRM Subdomain testen (erwartet 404 oder Setup-Page) 
test_domain "$CRM_DOMAIN" "404" "CRM Subdomain (Under Development)" || \
test_domain "$CRM_DOMAIN" "200" "CRM Subdomain (Setup Page)"

# 4. SSL-Zertifikate testen
test_ssl_certificate "$MAIN_DOMAIN"
test_ssl_certificate "$API_DOMAIN"
test_ssl_certificate "$CRM_DOMAIN"

# 5. Website Content testen
test_website_content

# 6. Mobile Responsiveness (einfacher Test)
echo -e "\n${YELLOW}📱 Mobile Responsiveness Test${NC}"
if command -v curl &> /dev/null; then
    mobile_content=$(curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)" "https://$MAIN_DOMAIN" --max-time 10)
    
    if echo "$mobile_content" | grep -i "viewport" > /dev/null; then
        echo -e "${GREEN}✅ Mobile viewport meta tag found${NC}"
    else
        echo -e "${YELLOW}⚠️  Mobile viewport meta tag missing${NC}"
    fi
fi

# Test-Zusammenfassung
echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=================================="
echo -e "${GREEN}✅ Tests completed successfully${NC}"
echo -e "${YELLOW}⚠️  Warnings found (check above)${NC}"
echo -e "${RED}❌ Critical issues found (fix required)${NC}"

echo -e "\n${BLUE}🔗 Quick Links:${NC}"
echo "Main Website: https://$MAIN_DOMAIN"
echo "API Subdomain: https://$API_DOMAIN" 
echo "CRM Subdomain: https://$CRM_DOMAIN"

echo -e "\n${BLUE}📋 Next Steps After Deployment:${NC}"
echo "1. Setup SSL certificates if not auto-configured"
echo "2. Configure DNS records for subdomains"
echo "3. Test all website pages manually"
echo "4. Setup monitoring/alerting"
echo "5. Create backup strategy"

echo -e "\n${GREEN}🎉 Testing Suite Complete!${NC}"