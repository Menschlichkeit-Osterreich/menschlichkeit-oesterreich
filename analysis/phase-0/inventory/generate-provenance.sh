#!/bin/bash
# Provenance Analysis Script - Identifiziert Herkunft aller Komponenten

echo "# Repository Provenance Inventory" > analysis/phase-0/inventory/provenance-report.md
echo "Generiert: $(date -Iseconds)" >> analysis/phase-0/inventory/provenance-report.md
echo "" >> analysis/phase-0/inventory/provenance-report.md

# Funktion zur Analyse von Autorenschaft
analyze_ownership() {
    local path=$1
    local total_commits=$(git log --oneline -- "$path" 2>/dev/null | wc -l)
    local primary_author=$(git log --format='%aN' -- "$path" 2>/dev/null | sort | uniq -c | sort -rn | head -1 | awk '{$1=""; print $0}' | xargs)
    local last_modified=$(git log -1 --format='%aI' -- "$path" 2>/dev/null)
    
    echo "  - Commits: $total_commits"
    echo "  - Primärer Autor: $primary_author"
    echo "  - Letzte Änderung: $last_modified"
}

# Hauptsysteme analysieren
echo "## 1. Eigenentwicklungen" >> analysis/phase-0/inventory/provenance-report.md
echo "" >> analysis/phase-0/inventory/provenance-report.md

for subsystem in "api.menschlichkeit-oesterreich.at" "frontend" "web" "automation/n8n"; do
    if [ -d "$subsystem" ]; then
        echo "### $subsystem" >> analysis/phase-0/inventory/provenance-report.md
        analyze_ownership "$subsystem" >> analysis/phase-0/inventory/provenance-report.md
        echo "" >> analysis/phase-0/inventory/provenance-report.md
    fi
done

# Fremdmodule identifizieren
echo "## 2. Externe Abhängigkeiten (Fremdmodule)" >> analysis/phase-0/inventory/provenance-report.md
echo "" >> analysis/phase-0/inventory/provenance-report.md

# PHP/Composer
if [ -f "composer.json" ]; then
    echo "### PHP Composer Dependencies" >> analysis/phase-0/inventory/provenance-report.md
    jq -r '.require | to_entries[] | "- \(.key): \(.value)"' composer.json 2>/dev/null >> analysis/phase-0/inventory/provenance-report.md || echo "- Keine composer.json gefunden" >> analysis/phase-0/inventory/provenance-report.md
    echo "" >> analysis/phase-0/inventory/provenance-report.md
fi

# Node.js/npm
if [ -f "package.json" ]; then
    echo "### Node.js npm Dependencies" >> analysis/phase-0/inventory/provenance-report.md
    jq -r '.dependencies // {} | to_entries[] | "- \(.key): \(.value)"' package.json >> analysis/phase-0/inventory/provenance-report.md
    echo "" >> analysis/phase-0/inventory/provenance-report.md
fi

# Python/pip
if [ -f "requirements.txt" ]; then
    echo "### Python pip Dependencies" >> analysis/phase-0/inventory/provenance-report.md
    cat requirements.txt | grep -v "^#" | grep -v "^$" | sed 's/^/- /' >> analysis/phase-0/inventory/provenance-report.md
    echo "" >> analysis/phase-0/inventory/provenance-report.md
fi

# Git Submodules
echo "## 3. Git Submodules" >> analysis/phase-0/inventory/provenance-report.md
if [ -f ".gitmodules" ]; then
    cat .gitmodules >> analysis/phase-0/inventory/provenance-report.md
else
    echo "Keine Submodules gefunden." >> analysis/phase-0/inventory/provenance-report.md
fi
echo "" >> analysis/phase-0/inventory/provenance-report.md

# Lizenz-Analyse
echo "## 4. Lizenz-Übersicht" >> analysis/phase-0/inventory/provenance-report.md
if [ -f "LICENSE" ]; then
    echo "**Projekt-Lizenz:** $(head -1 LICENSE)" >> analysis/phase-0/inventory/provenance-report.md
else
    echo "⚠️ **Keine LICENSE Datei gefunden!**" >> analysis/phase-0/inventory/provenance-report.md
fi

echo "✅ Provenance Report generiert: analysis/phase-0/inventory/provenance-report.md"
