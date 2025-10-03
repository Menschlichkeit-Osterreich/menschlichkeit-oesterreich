#!/bin/bash

# Figma Design System Sync Script
# Synchronisiert Design Tokens von Figma → Code

set -e

echo "🎨 Figma Design System Sync gestartet..."

# Farbcodes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Überprüfe Figma Token
if [ -z "$FIGMA_ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ FEHLER: FIGMA_ACCESS_TOKEN nicht gesetzt!${NC}"
  echo "Bitte setzen Sie: export FIGMA_ACCESS_TOKEN='your-token'"
  exit 1
fi

# Überprüfe Figma File ID
if [ -z "$FIGMA_FILE_ID" ]; then
  echo -e "${RED}❌ FEHLER: FIGMA_FILE_ID nicht gesetzt!${NC}"
  echo "Bitte setzen Sie: export FIGMA_FILE_ID='your-file-id'"
  exit 1
fi

echo -e "${GREEN}✓${NC} Figma Credentials gefunden"

# Wechsle in figma-design-system Verzeichnis
cd "$(dirname "$0")/../figma-design-system" || exit 1

# Installiere figma-api-exporter falls nicht vorhanden
if ! npm list -g figma-api-exporter > /dev/null 2>&1; then
  echo -e "${YELLOW}⚙️  Installiere figma-api-exporter...${NC}"
  npm install -g figma-api-exporter
fi

# Erstelle temporäres Verzeichnis
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Exportiere Figma Design Tokens
echo -e "${YELLOW}📥 Exportiere Design Tokens von Figma...${NC}"

# Exportiere als JSON
figma-api-exporter \
  --token="$FIGMA_ACCESS_TOKEN" \
  --fileId="$FIGMA_FILE_ID" \
  --output="$TEMP_DIR/figma-export.json"

# Konvertiere zu Design Token Format
echo -e "${YELLOW}🔄 Konvertiere zu Design Token Format...${NC}"

node <<'EOF'
const fs = require('fs');
const figmaData = JSON.parse(fs.readFileSync(process.env.TEMP_DIR + '/figma-export.json', 'utf8'));

// Extrahiere Farben
const colors = {};
if (figmaData.styles) {
  figmaData.styles
    .filter(style => style.styleType === 'FILL')
    .forEach(style => {
      const name = style.name.toLowerCase().replace(/\s+/g, '-');
      const fill = style.fills?.[0];
      if (fill && fill.type === 'SOLID') {
        const { r, g, b, a = 1 } = fill.color;
        const hex = '#' + [r, g, b]
          .map(x => Math.round(x * 255).toString(16).padStart(2, '0'))
          .join('');
        colors[name] = { value: hex, type: 'color' };
      }
    });
}

// Extrahiere Typography
const typography = {};
if (figmaData.styles) {
  figmaData.styles
    .filter(style => style.styleType === 'TEXT')
    .forEach(style => {
      const name = style.name.toLowerCase().replace(/\s+/g, '-');
      typography[name] = {
        fontFamily: { value: style.fontFamily || 'Inter', type: 'fontFamily' },
        fontSize: { value: `${style.fontSize || 16}px`, type: 'fontSize' },
        fontWeight: { value: style.fontWeight || 400, type: 'fontWeight' },
        lineHeight: { value: style.lineHeight || 1.5, type: 'lineHeight' }
      };
    });
}

// Generiere Design Token JSON
const designTokens = {
  color: colors,
  typography: typography,
  // Weitere Kategorien können hinzugefügt werden
};

fs.writeFileSync(
  process.env.TEMP_DIR + '/design-tokens.json',
  JSON.stringify(designTokens, null, 2)
);

console.log('✓ Design Tokens konvertiert');
EOF

# Backup alte Tokens
if [ -f "00_design-tokens.json" ]; then
  cp 00_design-tokens.json "00_design-tokens.backup.$(date +%Y%m%d_%H%M%S).json"
  echo -e "${GREEN}✓${NC} Backup erstellt"
fi

# Kopiere neue Tokens
cp "$TEMP_DIR/design-tokens.json" "00_design-tokens.json"
echo -e "${GREEN}✓${NC} Design Tokens aktualisiert"

# Generiere TypeScript Definitionen
echo -e "${YELLOW}📝 Generiere TypeScript Definitionen...${NC}"

node <<'EOF'
const fs = require('fs');
const tokens = JSON.parse(fs.readFileSync('00_design-tokens.json', 'utf8'));

let tsContent = '// Auto-generated from Figma Design Tokens\n\n';

// Farbtypen
if (tokens.color) {
  tsContent += 'export const colors = {\n';
  Object.entries(tokens.color).forEach(([key, value]) => {
    tsContent += `  '${key}': '${value.value}',\n`;
  });
  tsContent += '} as const;\n\n';
}

// Typography Typen
if (tokens.typography) {
  tsContent += 'export const typography = {\n';
  Object.entries(tokens.typography).forEach(([key, value]) => {
    tsContent += `  '${key}': {\n`;
    Object.entries(value).forEach(([prop, propValue]) => {
      tsContent += `    ${prop}: '${propValue.value}',\n`;
    });
    tsContent += '  },\n';
  });
  tsContent += '} as const;\n\n';
}

tsContent += 'export type ColorToken = keyof typeof colors;\n';
tsContent += 'export type TypographyToken = keyof typeof typography;\n';

fs.writeFileSync('../frontend/src/lib/figma-tokens.ts', tsContent);
console.log('✓ TypeScript Definitionen generiert');
EOF

# Generiere CSS Variables
echo -e "${YELLOW}🎨 Generiere CSS Variables...${NC}"

node <<'EOF'
const fs = require('fs');
const tokens = JSON.parse(fs.readFileSync('00_design-tokens.json', 'utf8'));

let cssContent = '/* Auto-generated from Figma Design Tokens */\n\n';
cssContent += ':root {\n';

// Farben
if (tokens.color) {
  cssContent += '  /* Colors */\n';
  Object.entries(tokens.color).forEach(([key, value]) => {
    cssContent += `  --color-${key}: ${value.value};\n`;
  });
  cssContent += '\n';
}

// Typography
if (tokens.typography) {
  cssContent += '  /* Typography */\n';
  Object.entries(tokens.typography).forEach(([key, value]) => {
    Object.entries(value).forEach(([prop, propValue]) => {
      const cssVar = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssContent += `  --typography-${key}${cssVar}: ${propValue.value};\n`;
    });
  });
}

cssContent += '}\n';

fs.writeFileSync('styles/figma-variables.css', cssContent);
console.log('✓ CSS Variables generiert');
EOF

echo -e "${GREEN}✅ Figma Design System Sync abgeschlossen!${NC}"
echo ""
echo "Aktualisierte Dateien:"
echo "  - 00_design-tokens.json"
echo "  - ../frontend/src/lib/figma-tokens.ts"
echo "  - styles/figma-variables.css"
echo ""
echo "Nächste Schritte:"
echo "  1. Überprüfen Sie die Änderungen: git diff"
echo "  2. Testen Sie die Integration: npm run dev"
echo "  3. Committen Sie die Änderungen: git add . && git commit -m 'chore: Sync Figma design tokens'"
