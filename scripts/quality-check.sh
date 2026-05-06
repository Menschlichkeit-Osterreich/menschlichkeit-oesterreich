#!/bin/bash
# Code Quality Monitoring Script für Menschlichkeit Österreich

# Sichere Konfiguration laden
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
source "$SCRIPT_DIR/../config/load-config.sh"
initialize_secure_config || exit 1

REPORT_DIR="$PROJECT_DIR/quality-reports"

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 Code Quality Monitoring - Menschlichkeit Österreich${NC}"
echo "====================================================="

# Report-Verzeichnis erstellen
mkdir -p "$REPORT_DIR"

# Zeitstempel für Reports
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "\n${YELLOW}🔍 Führe Code-Analyse aus...${NC}"

# 1. Vollständige Projektanalyse
echo -e "${BLUE}→ Analysiere gesamtes Projekt...${NC}"
if java -jar "$HOME/.codacy/codacy-analysis-cli-assembly.jar" analyze \
    --directory "$PROJECT_DIR" \
    --format json \
    --output "$REPORT_DIR/full-analysis-$TIMESTAMP.json" 2>/dev/null; then
    echo -e "${GREEN}✅ Vollständige Analyse gespeichert${NC}"
else
    echo -e "${YELLOW}⚠️  JSON-Report fehlgeschlagen, erstelle Text-Report...${NC}"
    java -jar "$HOME/.codacy/codacy-analysis-cli-assembly.jar" analyze \
        --directory "$PROJECT_DIR" \
        --format text > "$REPORT_DIR/full-analysis-$TIMESTAMP.txt"
fi

# 2. Website-spezifische Analyse
echo -e "${BLUE}→ Analysiere Website-Code...${NC}"
java -jar "$HOME/.codacy/codacy-analysis-cli-assembly.jar" analyze \
    --directory "$PROJECT_DIR/website" \
    --format text > "$REPORT_DIR/website-analysis-$TIMESTAMP.txt"

# 3. Metriken sammeln
echo -e "${BLUE}→ Sammle Code-Metriken...${NC}"

# Website-Dateien zählen und analysieren
WEBSITE_DIR="$PROJECT_DIR/website"
HTML_FILES=$(find "$WEBSITE_DIR" -name "*.html" | wc -l)
CSS_FILES=$(find "$WEBSITE_DIR" -name "*.css" | wc -l)
JS_FILES=$(find "$WEBSITE_DIR" -name "*.js" | wc -l)

# LOC (Lines of Code) berechnen
HTML_LOC=$(find "$WEBSITE_DIR" -name "*.html" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
CSS_LOC=$(find "$WEBSITE_DIR" -name "*.css" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
JS_LOC=$(find "$WEBSITE_DIR" -name "*.js" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
TOTAL_LOC=$((HTML_LOC + CSS_LOC + JS_LOC))

# Metriken-Report erstellen
cat > "$REPORT_DIR/metrics-$TIMESTAMP.md" << EOF
# Code Metriken - $(date)

## Datei-Übersicht
- HTML Dateien: $HTML_FILES
- CSS Dateien: $CSS_FILES  
- JavaScript Dateien: $JS_FILES

## Lines of Code (LOC)
- HTML: $HTML_LOC LOC
- CSS: $CSS_LOC LOC
- JavaScript: $JS_LOC LOC
- **Gesamt: $TOTAL_LOC LOC**

## Verzeichnisstruktur
\`\`\`
$(tree -d "$PROJECT_DIR" -I 'node_modules|.git|.mypy_cache' 2>/dev/null || echo "Tree command nicht verfügbar")
\`\`\`

## Letzte Analyse
- Zeitpunkt: $(date)
- Analysierte Verzeichnisse: website/, scripts/, docs/
- Reports: quality-reports/
EOF

# 4. Zusammenfassung anzeigen
echo -e "\n${GREEN}📈 Code Quality Summary${NC}"
echo "======================================"
echo -e "Website Dateien: ${BLUE}$HTML_FILES HTML, $CSS_FILES CSS, $JS_FILES JS${NC}"
echo -e "Lines of Code: ${BLUE}$TOTAL_LOC LOC${NC}"
echo -e "Reports gespeichert: ${BLUE}$REPORT_DIR${NC}"

# 5. Letzte Analyse-Ergebnisse anzeigen
echo -e "\n${YELLOW}📋 Letzte Analyse-Ergebnisse:${NC}"
if [ -f "$REPORT_DIR/website-analysis-$TIMESTAMP.txt" ]; then
    echo "----------------------------------------"
    tail -20 "$REPORT_DIR/website-analysis-$TIMESTAMP.txt"
    echo "----------------------------------------"
fi

echo -e "\n${BLUE}💡 Empfehlungen:${NC}"
echo "1. Reports regelmäßig überprüfen (täglich/wöchentlich)"
echo "2. Bei Code-Änderungen Analyse ausführen" 
echo "3. Metriken-Trends über Zeit verfolgen"
echo "4. Automatisierung in CI/CD Pipeline einbauen"

echo -e "\n${GREEN}✅ Quality Monitoring abgeschlossen!${NC}"