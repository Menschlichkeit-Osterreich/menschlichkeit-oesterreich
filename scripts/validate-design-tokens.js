#!/usr/bin/env node

/**
 * Design Token Validation Script
 * Validates design tokens against schema and best practices
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Colors
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

let hasErrors = false;
let hasWarnings = false;

console.log(`${BLUE}🔍 Design Token Validation gestartet...${RESET}\n`);

// Pfade
const rootDir = resolve(process.cwd());
const tokenFile = resolve(rootDir, 'figma-design-system/00_design-tokens.json');
const tsFile = resolve(rootDir, 'frontend/src/lib/figma-tokens.ts');
const cssFile = resolve(rootDir, 'figma-design-system/styles/figma-variables.css');

// 1. Prüfe ob Dateien existieren
console.log(`${BLUE}📋 Schritt 1: Datei-Existenz prüfen${RESET}`);

if (!existsSync(tokenFile)) {
  console.error(`${RED}❌ Design Token JSON fehlt: ${tokenFile}${RESET}`);
  hasErrors = true;
} else {
  console.log(`${GREEN}✓${RESET} Design Token JSON gefunden`);
}

if (!existsSync(tsFile)) {
  console.warn(`${YELLOW}⚠️  TypeScript Definitionen fehlen: ${tsFile}${RESET}`);
  hasWarnings = true;
} else {
  console.log(`${GREEN}✓${RESET} TypeScript Definitionen gefunden`);
}

if (!existsSync(cssFile)) {
  console.warn(`${YELLOW}⚠️  CSS Variables fehlen: ${cssFile}${RESET}`);
  hasWarnings = true;
} else {
  console.log(`${GREEN}✓${RESET} CSS Variables gefunden`);
}

if (hasErrors) {
  console.error(`\n${RED}❌ Validation fehlgeschlagen: Dateien fehlen${RESET}`);
  process.exit(1);
}

// 2. Lade und parse Design Tokens
console.log(`\n${BLUE}📋 Schritt 2: JSON Schema validieren${RESET}`);

let tokens;
try {
  const content = readFileSync(tokenFile, 'utf8');
  tokens = JSON.parse(content);
  console.log(`${GREEN}✓${RESET} JSON ist valide`);
} catch (error) {
  console.error(`${RED}❌ JSON Parse Fehler: ${error.message}${RESET}`);
  process.exit(1);
}

// 3. Validiere Token-Struktur
console.log(`\n${BLUE}📋 Schritt 3: Token-Struktur validieren${RESET}`);

const requiredCategories = ['color', 'typography', 'spacing'];
const foundCategories = Object.keys(tokens);

requiredCategories.forEach(category => {
  if (!tokens[category]) {
    console.error(`${RED}❌ Fehlende Kategorie: ${category}${RESET}`);
    hasErrors = true;
  } else {
    console.log(`${GREEN}✓${RESET} Kategorie '${category}' vorhanden`);
  }
});

// 4. Validiere Farben
console.log(`\n${BLUE}📋 Schritt 4: Farben validieren${RESET}`);

const hexRegex = /^#[0-9A-F]{6}$/i;
const requiredColors = ['austria-red', 'primary-500'];

if (tokens.color) {
  Object.entries(tokens.color).forEach(([name, token]) => {
    // Type check
    if (token.type !== 'color') {
      console.warn(
        `${YELLOW}⚠️  Farbe '${name}': Falscher Type '${token.type}', erwartet 'color'${RESET}`
      );
      hasWarnings = true;
    }

    // Hex validation
    if (!hexRegex.test(token.value)) {
      console.error(`${RED}❌ Farbe '${name}': Ungültiger Hex-Wert '${token.value}'${RESET}`);
      hasErrors = true;
    }
  });

  // Check required colors
  requiredColors.forEach(colorName => {
    if (!tokens.color[colorName]) {
      console.error(`${RED}❌ Pflicht-Farbe fehlt: ${colorName}${RESET}`);
      hasErrors = true;
    } else {
      console.log(
        `${GREEN}✓${RESET} Pflicht-Farbe '${colorName}' vorhanden: ${tokens.color[colorName].value}`
      );
    }
  });

  console.log(`${GREEN}✓${RESET} ${Object.keys(tokens.color).length} Farben validiert`);
}

// 5. Validiere Typography
console.log(`\n${BLUE}📋 Schritt 5: Typography validieren${RESET}`);

const validFontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

if (tokens.typography) {
  Object.entries(tokens.typography).forEach(([name, typoToken]) => {
    // Font Family
    if (!typoToken.fontFamily) {
      console.error(`${RED}❌ Typography '${name}': fontFamily fehlt${RESET}`);
      hasErrors = true;
    }

    // Font Size
    if (!typoToken.fontSize) {
      console.error(`${RED}❌ Typography '${name}': fontSize fehlt${RESET}`);
      hasErrors = true;
    } else if (!/^\d+(?:\.\d+)?(?:px|rem|em)$/.test(typoToken.fontSize.value)) {
      console.warn(
        `${YELLOW}⚠️  Typography '${name}': Ungültige fontSize Unit '${typoToken.fontSize.value}'${RESET}`
      );
      hasWarnings = true;
    }

    // Font Weight
    if (typoToken.fontWeight && !validFontWeights.includes(typoToken.fontWeight.value)) {
      console.warn(
        `${YELLOW}⚠️  Typography '${name}': Ungültige fontWeight '${typoToken.fontWeight.value}'${RESET}`
      );
      hasWarnings = true;
    }
  });

  console.log(
    `${GREEN}✓${RESET} ${Object.keys(tokens.typography).length} Typography Tokens validiert`
  );
}

// 6. Validiere Spacing
console.log(`\n${BLUE}📋 Schritt 6: Spacing validieren${RESET}`);

if (tokens.spacing) {
  Object.entries(tokens.spacing).forEach(([name, spacingToken]) => {
    if (spacingToken.type !== 'spacing') {
      console.warn(`${YELLOW}⚠️  Spacing '${name}': Falscher Type '${spacingToken.type}'${RESET}`);
      hasWarnings = true;
    }

    if (!/^\d+(?:\.\d+)?(?:px|rem|em)$/.test(spacingToken.value)) {
      console.error(`${RED}❌ Spacing '${name}': Ungültige Unit '${spacingToken.value}'${RESET}`);
      hasErrors = true;
    }
  });

  console.log(`${GREEN}✓${RESET} ${Object.keys(tokens.spacing).length} Spacing Tokens validiert`);
}

// 7. Validiere TypeScript Sync
console.log(`\n${BLUE}📋 Schritt 7: TypeScript Definitionen prüfen${RESET}`);

try {
  const tsContent = readFileSync(tsFile, 'utf8');

  // Check if all colors are in TS
  if (tokens.color) {
    Object.keys(tokens.color).forEach(colorName => {
      if (!tsContent.includes(`'${colorName}'`)) {
        console.warn(`${YELLOW}⚠️  Farbe '${colorName}' fehlt in TypeScript Definitionen${RESET}`);
        hasWarnings = true;
      }
    });
  }

  console.log(`${GREEN}✓${RESET} TypeScript Definitionen synchronisiert`);
} catch (error) {
  console.error(`${RED}❌ TypeScript Datei lesen fehlgeschlagen: ${error.message}${RESET}`);
  hasErrors = true;
}

// 8. Validiere CSS Variables
console.log(`\n${BLUE}📋 Schritt 8: CSS Variables prüfen${RESET}`);

try {
  const cssContent = readFileSync(cssFile, 'utf8');

  // Check if all colors are in CSS
  if (tokens.color) {
    Object.keys(tokens.color).forEach(colorName => {
      if (!cssContent.includes(`--color-${colorName}`)) {
        console.warn(`${YELLOW}⚠️  CSS Variable '--color-${colorName}' fehlt${RESET}`);
        hasWarnings = true;
      }
    });
  }

  console.log(`${GREEN}✓${RESET} CSS Variables synchronisiert`);
} catch (error) {
  console.error(`${RED}❌ CSS Datei lesen fehlgeschlagen: ${error.message}${RESET}`);
  hasErrors = true;
}

// 9. Best Practices prüfen
console.log(`\n${BLUE}📋 Schritt 9: Best Practices prüfen${RESET}`);

// Austrian Red als Primary
if (tokens.color && tokens.color['austria-red']) {
  const austrianRed = tokens.color['austria-red'].value.toUpperCase();
  if (austrianRed !== '#C8102E') {
    console.warn(`${YELLOW}⚠️  Austrian Red sollte #C8102E sein, ist aber ${austrianRed}${RESET}`);
    hasWarnings = true;
  } else {
    console.log(`${GREEN}✓${RESET} Austrian Red korrekt: ${austrianRed}`);
  }
}

// Naming Convention
if (tokens.color) {
  Object.keys(tokens.color).forEach(name => {
    if (!/^[a-z0-9-]+$/.test(name)) {
      console.warn(
        `${YELLOW}⚠️  Farbe '${name}': Naming Convention verletzt (nur lowercase + kebab-case)${RESET}`
      );
      hasWarnings = true;
    }
  });
}

// 10. Zusammenfassung
console.log(`\n${BLUE}═══════════════════════════════════════${RESET}`);
console.log(`${BLUE}📊 Validation Zusammenfassung${RESET}`);
console.log(`${BLUE}═══════════════════════════════════════${RESET}\n`);

if (hasErrors) {
  console.error(`${RED}❌ FEHLER: Design Tokens haben Fehler!${RESET}`);
  console.error(
    `${RED}   Bitte beheben Sie die Fehler und führen Sie die Validation erneut aus.${RESET}\n`
  );
  process.exit(1);
}

if (hasWarnings) {
  console.warn(`${YELLOW}⚠️  WARNUNG: Design Tokens haben Warnungen${RESET}`);
  console.warn(
    `${YELLOW}   Die Tokens sind valide, aber einige Best Practices wurden nicht befolgt.${RESET}\n`
  );
  process.exit(0);
}

console.log(`${GREEN}✅ SUCCESS: Alle Validierungen erfolgreich!${RESET}`);
console.log(`${GREEN}   Design Tokens sind valide und synchronisiert.${RESET}\n`);

// Statistiken
console.log(`${BLUE}📈 Statistiken:${RESET}`);
if (tokens.color) console.log(`   - Farben: ${Object.keys(tokens.color).length}`);
if (tokens.typography) console.log(`   - Typography: ${Object.keys(tokens.typography).length}`);
if (tokens.spacing) console.log(`   - Spacing: ${Object.keys(tokens.spacing).length}`);
if (tokens.borderRadius)
  console.log(`   - Border Radius: ${Object.keys(tokens.borderRadius).length}`);
if (tokens.boxShadow) console.log(`   - Box Shadow: ${Object.keys(tokens.boxShadow).length}`);

console.log(`\n${GREEN}✨ Nächste Schritte:${RESET}`);
console.log(`   1. Testen Sie die Integration: npm run dev`);
console.log(`   2. Erstellen Sie einen Build: npm run build`);
console.log(`   3. Committen Sie Änderungen: git commit -m "chore: Update design tokens"\n`);

process.exit(0);
