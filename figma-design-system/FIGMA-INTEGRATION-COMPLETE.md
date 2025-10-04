# 🎨 Figma Design System Integration - Vollständige Dokumentation

## 📋 Übersicht

Komplettes Setup für automatische Synchronisation zwischen Figma Design System und Code. Extrahiert Design Tokens (Farben, Typography, Spacing) aus Figma und generiert JSON, TypeScript und CSS.

**Status**: ✅ **Implementiert & Einsatzbereit**

---

## 🗂️ Implementierte Komponenten

### 1. **Sync-Script** (`scripts/sync-figma-tokens.sh`)

- Automatischer Export von Figma via API
- Konvertierung zu Design Token Format
- Generierung von TypeScript Definitionen
- Generierung von CSS Variables
- Automatisches Backup vor Updates

### 2. **GitHub Actions Workflow** (`.github/workflows/sync-figma-tokens.yml`)

- Täglicher automatischer Sync (2:00 UTC)
- Manueller Trigger über GitHub UI
- Automatische Pull Request Erstellung
- Visual Regression Testing
- Chromatic Integration (optional)

### 3. **Validation Script** (`scripts/validate-design-tokens.js`)

- JSON Schema Validierung
- Token-Struktur Prüfung
- Farb-Hex-Validierung
- Typography-Validierung
- Best Practices Check
- Sync-Status Prüfung (JSON ↔ TS ↔ CSS)

### 4. **npm Scripts** (in `package.json`)

```json
{
  "figma:sync": "bash scripts/sync-figma-tokens.sh",
  "figma:sync:watch": "nodemon --watch figma-design-system scripts/sync-figma-tokens.sh",
  "figma:validate": "node scripts/validate-design-tokens.js",
  "design:tokens": "npm run figma:sync && npm run build:frontend",
  "design:docs": "storybook build && npm run figma:sync"
}
```

### 5. **Dokumentation**

- **FIGMA-SYNC-GUIDE.md**: Komplette Setup-Anleitung
- **BRAND-GUIDELINES.md**: Brand Identity Guide
- **COMPONENT-USAGE.md**: Komponenten-Dokumentation
- **DESIGN-SYSTEM-INTEGRATION.md**: Integration Übersicht

---

## 🚀 Quick Start

### Schritt 1: Figma Token erstellen

1. Gehe zu [Figma Settings](https://www.figma.com/settings) → **Personal Access Tokens**
2. Klicke auf **Generate new token**
3. Name: "Design System Sync"
4. Kopiere den Token (wird nur einmal angezeigt!)

### Schritt 2: Figma File ID ermitteln

URL Format:

```
https://www.figma.com/file/{FILE_ID}/Design-System
                              ^^^^^^^^
                              Diese ID kopieren
```

### Schritt 3: Environment Variables setzen

**Lokal (.env im Root)**:

```bash
FIGMA_ACCESS_TOKEN=figd_your_token_here
FIGMA_FILE_ID=your_file_id_here
```

**GitHub Secrets** (für CI/CD):

1. Repo Settings → Secrets and variables → Actions
2. Füge hinzu:
   - `FIGMA_ACCESS_TOKEN`
   - `FIGMA_FILE_ID`

### Schritt 4: Ersten Sync durchführen

```bash
# Manuell
npm run figma:sync

# Mit Validation
npm run figma:sync && npm run figma:validate
```

---

## 🔧 Verwendung

### Manueller Sync

```bash
# Einmaliger Sync
npm run figma:sync

# Mit automatischer Wiederholung bei Änderungen
npm run figma:sync:watch

# Validation nach Sync
npm run figma:validate

# Komplett: Sync → Validate → Build
npm run design:tokens
```

### Automatischer Sync (GitHub Actions)

**Täglich um 2:00 UTC**:

- Workflow läuft automatisch
- Erstellt PR bei Änderungen
- Führt Visual Regression Tests durch

**Manueller Trigger**:

1. GitHub Repo → Actions
2. Workflow "🎨 Sync Figma Design Tokens"
3. "Run workflow" klicken

---

## 📁 Generierte Dateien

Nach erfolgreichem Sync:

### 1. Design Tokens JSON

**Pfad**: `figma-design-system/00_design-tokens.json`

**Aktuelle Struktur** (verschachtelt):

```json
{
  "designTokens": {
    "colors": {
      "brand": {
        "austria-red": "#c8102e",
        "orange": "#ff6b35",
        "red": "#e63946"
      },
      "primary": { ... },
      "secondary": { ... }
    },
    "typography": { ... },
    "spacing": { ... }
  }
}
```

**Ziel-Struktur** (flach, für Sync-Script):

```json
{
  "color": {
    "austria-red": { "value": "#c8102e", "type": "color" },
    "primary-500": { "value": "#c8102e", "type": "color" }
  },
  "typography": {
    "heading-1": {
      "fontFamily": { "value": "Inter", "type": "fontFamily" },
      "fontSize": { "value": "48px", "type": "fontSize" }
    }
  }
}
```

### 2. TypeScript Definitionen

**Pfad**: `frontend/src/lib/figma-tokens.ts`

```typescript
export const colors = {
  'austria-red': '#c8102e',
  'primary-500': '#c8102e',
} as const;

export const typography = {
  'heading-1': {
    fontFamily: 'Inter',
    fontSize: '48px',
  },
} as const;

export type ColorToken = keyof typeof colors;
export type TypographyToken = keyof typeof typography;
```

### 3. CSS Variables

**Pfad**: `figma-design-system/styles/figma-variables.css`

```css
:root {
  /* Colors */
  --color-austria-red: #c8102e;
  --color-primary-500: #c8102e;

  /* Typography */
  --typography-heading-1-font-family: Inter;
  --typography-heading-1-font-size: 48px;
}
```

---

## 🎯 Code-Verwendung

### React/TypeScript

```tsx
import { colors, typography } from '@menschlichkeit/design-system/figma-tokens';

function Header() {
  return (
    <h1
      style={{
        color: colors['austria-red'],
        fontFamily: typography['heading-1'].fontFamily,
      }}
    >
      Menschlichkeit Österreich
    </h1>
  );
}
```

### CSS/SCSS

```css
.hero-title {
  color: var(--color-austria-red);
  font-family: var(--typography-heading-1-font-family);
}
```

### Tailwind CSS

```javascript
// tailwind.config.js
const { colors } = require('./frontend/src/lib/figma-tokens');

module.exports = {
  theme: {
    extend: {
      colors: {
        'austria-red': colors['austria-red'],
      },
    },
  },
};
```

---

## 🔄 Workflow

### Figma → Code Sync Process

1. **Designer ändert Design in Figma**
2. **GitHub Action triggert** (täglich oder manuell)
3. **Figma API Export** mit `figma-api-exporter`
4. **Token Konvertierung** (Figma Format → Design Token Format)
5. **File Generation**:
   - `00_design-tokens.json` (Backup vorher erstellt)
   - `figma-tokens.ts` (TypeScript)
   - `figma-variables.css` (CSS Variables)
6. **Pull Request erstellt** mit Change Report
7. **Visual Regression Tests** laufen automatisch
8. **Team Review** & Merge
9. **Deployment** mit neuen Tokens

### Entwickler Workflow

```bash
# Figma wurde aktualisiert → lokaler Sync
npm run figma:sync

# Prüfe ob alles korrekt ist
npm run figma:validate

# Teste Integration
npm run dev

# Build & Deploy
npm run build
```

---

## ⚙️ Konfiguration

### Figma Sync Script anpassen

**Export Optionen** (`scripts/sync-figma-tokens.sh`):

```bash
# Nur bestimmte Nodes exportieren
figma-api-exporter \
  --ids="123:456,789:012" \
  --output="$TEMP_DIR/figma-export.json"

# Mit Bildern
figma-api-exporter \
  --format="png" \
  --scale=2 \
  --output="$TEMP_DIR/assets/"
```

### Token Mapping anpassen

Bearbeite in `scripts/sync-figma-tokens.sh`:

```javascript
// Farbnamen transformieren
const name = style.name
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/primary/g, 'austria-red');

// Custom Token-Kategorien
const customTokens = {
  animations: extractAnimations(figmaData),
  effects: extractEffects(figmaData),
};
```

---

## 🛡️ Validation & Quality

### Automatische Validierung

Nach jedem Sync läuft automatisch:

```bash
npm run figma:validate
```

**Prüft**:

- ✅ JSON Schema Validität
- ✅ Erforderliche Token-Kategorien (color, typography, spacing)
- ✅ Hex-Farb-Validierung (`#RRGGBB`)
- ✅ Typography Units (`px`, `rem`, `em`)
- ✅ Sync-Status (JSON ↔ TypeScript ↔ CSS)
- ✅ Austrian Red = `#C8102E`
- ✅ Naming Conventions (kebab-case)

### Manuelle Validierung

```bash
# Vollständige Validation
node scripts/validate-design-tokens.js

# Output:
# ✅ SUCCESS: Alle Validierungen erfolgreich!
# 📈 Statistiken:
#    - Farben: 42
#    - Typography: 18
#    - Spacing: 12
```

---

## 🚨 Fehlerbehandlung

### Backup & Rollback

**Automatisches Backup** bei jedem Sync:

```bash
figma-design-system/00_design-tokens.backup.20250115_143000.json
```

**Manuelles Rollback**:

```bash
# Zu vorherigem Stand zurückkehren
cp figma-design-system/00_design-tokens.backup.20250115_143000.json \
   figma-design-system/00_design-tokens.json

# Validation prüfen
npm run figma:validate
```

### Häufige Fehler

#### ❌ "FIGMA_ACCESS_TOKEN nicht gesetzt"

**Lösung**:

```bash
export FIGMA_ACCESS_TOKEN='figd_your_token'
# Oder in .env Datei setzen
```

#### ❌ "Figma API rate limit exceeded"

**Problem**: Figma Rate Limit = 1000 Requests/Stunde

**Lösung**:

- Warte 1 Stunde
- Reduziere Sync-Frequenz
- Verwende `workflow_dispatch` (manuell) statt Schedule

#### ❌ "File ID nicht gefunden"

**Lösung**:

```bash
# Korrekte File ID aus Figma URL kopieren:
# https://www.figma.com/file/{FILE_ID}/...
export FIGMA_FILE_ID='abc123...'
```

#### ❌ "JSON Parse Error"

**Lösung**:

```bash
# Validiere JSON manuell
cat figma-design-system/00_design-tokens.json | jq .

# Falls korrupt, Backup wiederherstellen
cp figma-design-system/00_design-tokens.backup.*.json \
   figma-design-system/00_design-tokens.json
```

---

## 📊 Monitoring & Reporting

### GitHub Actions Dashboard

**Location**: Repository → Actions → "🎨 Sync Figma Design Tokens"

**Metriken**:

- ✅ Erfolgreiche Syncs (grün)
- ❌ Fehlgeschlagene Syncs (rot)
- ⏱️ Durchschnittliche Dauer
- 📊 Sync-Frequenz

### Sync-Log

```bash
# Letzter Sync-Bericht
cat figma-design-system/sync-log.txt

# Beispiel-Output:
# [2025-01-15 14:30:00] ✅ Sync erfolgreich
# - 42 Farben exportiert
# - 18 Typography Tokens aktualisiert
# - 0 Breaking Changes
# - Dauer: 3.2s
```

### Change Reports

Jeder automatische Sync erstellt einen Change Report:

```markdown
# 🎨 Figma Design Token Changes

**Sync Date:** 2025-01-15 14:30:00 UTC

## Changed Files

- `figma-design-system/00_design-tokens.json`
- `frontend/src/lib/figma-tokens.ts`
- `figma-design-system/styles/figma-variables.css`

## Detailed Changes

- color/austria-red: #c8102e → #c8102e (unchanged)
- color/new-blue: (added) → #0066cc
- typography/heading-1/fontSize: 48px → 52px
```

---

## 🔗 Integration mit Tools

### Storybook

```javascript
// .storybook/preview.js
import '../figma-design-system/styles/figma-variables.css';
import { colors } from '../frontend/src/lib/figma-tokens';

export const globalTypes = {
  theme: {
    name: 'Theme',
    items: [
      { value: 'light', title: 'Light' },
      { value: 'dark', title: 'Dark' },
    ],
  },
};
```

### Chromatic (Visual Testing)

```yaml
# .github/workflows/chromatic.yml
on:
  pull_request:
    paths:
      - 'figma-design-system/00_design-tokens.json'

jobs:
  chromatic:
    steps:
      - uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

### Lighthouse (Performance)

```bash
# Nach Sync automatisch Performance testen
npm run figma:sync && npm run performance:lighthouse
```

---

## 📚 Best Practices

### 1. Naming Conventions in Figma

**✅ GOOD**:

```
color/primary-500
color/austria-red
typography/heading-1
spacing/md
```

**❌ BAD**:

```
Main Color (Leerzeichen)
H1 Title (kein Muster)
16px Spacing (Wert im Namen)
```

### 2. Version Control

```bash
# Tagge Design Token Releases
git tag -a design-tokens-v1.0.0 -m "Initial design tokens"

# Semantic Versioning
# v1.0.0 → v2.0.0: Breaking Changes (Farbe gelöscht)
# v1.0.0 → v1.1.0: Neue Features (neue Farbe)
# v1.0.0 → v1.0.1: Bugfixes (Hex-Wert Korrektur)
```

### 3. Testing nach Sync

```bash
# Vollständige Test-Pipeline
npm run figma:sync
npm run figma:validate
npm run test              # Unit Tests
npm run test:visual       # Visual Regression
npm run lint              # Code Quality
npm run build             # Build Check
```

### 4. PR Review Checklist

Bei automatischen Figma Sync PRs prüfen:

- [ ] **Breaking Changes**: Wurden Farben/Tokens gelöscht?
- [ ] **Neue Tokens**: Naming Conventions eingehalten?
- [ ] **Werte**: Hex-Farben korrekt? Typography Units valide?
- [ ] **Sync-Status**: JSON, TS, CSS synchron?
- [ ] **Tests**: Visual Regression Tests erfolgreich?
- [ ] **Dokumentation**: Changelog aktualisiert?

---

## 🚀 Erweiterte Features

### Multi-Brand Support

```javascript
// Mehrere Figma Files für verschiedene Brands
const brands = {
  austria: process.env.FIGMA_FILE_ID_AUSTRIA,
  germany: process.env.FIGMA_FILE_ID_GERMANY,
  switzerland: process.env.FIGMA_FILE_ID_SWITZERLAND,
};

Object.entries(brands).forEach(([brand, fileId]) => {
  syncFigmaTokens(fileId, `tokens-${brand}.json`);
});
```

### Token Transformation Pipeline

```javascript
// Custom Transform Pipeline
const pipeline = [
  extractColors,
  extractTypography,
  extractSpacing,
  transformToTailwind, // Custom Transform
  validateTokens,
  generateTypeScript,
  generateCSS,
  generateDocs,
];

const tokens = pipeline.reduce(
  (data, transform) => transform(data),
  rawFigmaData
);
```

### Custom Token Kategorien

```javascript
// Animationen aus Figma extrahieren
const animations = figmaData.prototypes?.map(proto => ({
  name: proto.name,
  duration: proto.duration,
  easing: proto.easing,
}));

// In Design Tokens integrieren
designTokens.animations = animations;
```

---

## 📞 Support & Ressourcen

### Dokumentation

- **Setup Guide**: [FIGMA-SYNC-GUIDE.md](./FIGMA-SYNC-GUIDE.md)
- **Brand Guidelines**: [BRAND-GUIDELINES.md](./BRAND-GUIDELINES.md)
- **Component Usage**: [COMPONENT-USAGE.md](./COMPONENT-USAGE.md)
- **Integration Docs**: [DESIGN-SYSTEM-INTEGRATION.md](../DESIGN-SYSTEM-INTEGRATION.md)

### Tools & Services

- **Figma API Docs**: <https://www.figma.com/developers/api>
- **figma-api-exporter**: <https://github.com/primer/figma-api-exporter>
- **Design Tokens Spec**: <https://tr.designtokens.org/format/>

### Hilfe erhalten

1. **Dokumentation** durchsuchen
2. **GitHub Issues** prüfen
3. **Team Chat** (Slack #design-system)
4. **E-Mail**: <design@menschlichkeit-oesterreich.at>

---

## 🔄 Nächste Schritte

### Sofort (Required)

1. **Figma Token erstellen** ([Anleitung](#schritt-1-figma-token-erstellen))
2. **GitHub Secrets setzen** (`FIGMA_ACCESS_TOKEN`, `FIGMA_FILE_ID`)
3. **Ersten Sync durchführen**: `npm run figma:sync`
4. **Validation prüfen**: `npm run figma:validate`

### Kurzfristig (Recommended)

5. **GitHub Actions testen** (manueller Workflow-Trigger)
6. **Visual Regression Setup** (Chromatic oder Playwright)
7. **Storybook Integration** (Design Tokens in Stories)
8. **Team Training** (Sync-Prozess & Best Practices)

### Langfristig (Optional)

9. **Multi-Brand Support** implementieren
10. **Custom Token Pipeline** erweitern
11. **Animation Tokens** aus Figma extrahieren
12. **Performance Monitoring** (Token Bundle Size)

---

## 📝 Changelog

### v1.0.0 (2025-01-15)

**✨ Features**:

- Figma → Code Sync Script (`sync-figma-tokens.sh`)
- GitHub Actions Workflow (täglich + manuell)
- Design Token Validation (`validate-design-tokens.js`)
- TypeScript Definitionen Generation
- CSS Variables Generation
- Automatisches Backup-System
- npm Scripts Integration
- Umfassende Dokumentation

**🎨 Design Tokens**:

- Austrian Red (#c8102e) als Primary Color
- 42+ Farben
- 18+ Typography Tokens
- 12+ Spacing Values

**🔧 Configuration**:

- Environment Variables Support (.env)
- GitHub Secrets Integration
- Multi-Format Output (JSON, TS, CSS)

**📚 Dokumentation**:

- FIGMA-SYNC-GUIDE.md (Setup Guide)
- FIGMA-INTEGRATION-COMPLETE.md (Vollständige Docs)
- Inline Code-Dokumentation

---

**Status**: ✅ **Production-Ready**

Bereit für:

- Automatische tägliche Syncs
- Team-Nutzung
- CI/CD Integration
- Visual Regression Testing

**Nächster Meilenstein**: Multi-Brand Support (v2.0.0)
