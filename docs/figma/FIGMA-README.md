---
title: Figma Design System Quick Reference
description: Kurzreferenz fuer Figma-Token-Sync und Design-System-Integration.
lastUpdated: 2026-04-16
status: ACTIVE
---

# 🎨 Figma Design System - Quick Reference

## Status: ✅ Production-Ready

Automatisches Sync-System zwischen Figma und Code implementiert.

---

## 🚀 Quick Start

### 1. Setup (Einmalig)

```bash
# 1. Figma Personal Access Token erstellen
# → https://www.figma.com/settings → Personal Access Tokens

# 2. Figma File ID aus URL kopieren
# → https://www.figma.com/file/{FILE_ID}/...

# 3. Environment Variables setzen
export FIGMA_ACCESS_TOKEN='figd_...'
export FIGMA_FILE_ID='...'
```

### 2. Sync ausführen

```bash
# Manueller Sync
npm run figma:sync

# Mit Validation
npm run figma:sync && npm run figma:validate

# Automatisch bei Änderungen
npm run figma:sync:watch
```

### 3. Integration nutzen

```tsx
// React/TypeScript
import { colors, typography } from '@menschlichkeit/design-system/figma-tokens';

<h1 style={{ color: colors['austria-red'] }}>Titel</h1>;
```

```css
/* CSS */
.title {
  color: var(--color-austria-red);
  font-family: var(--typography-heading-1-font-family);
}
```

---

## 📁 Generierte Dateien

| Datei                  | Pfad                                             | Beschreibung              |
| ---------------------- | ------------------------------------------------ | ------------------------- |
| **Design Tokens JSON** | `figma-design-system/00_design-tokens.json`      | Master Token-Definitionen |
| **TypeScript**         | `frontend/src/lib/figma-tokens.ts`               | Type-safe Token Imports   |
| **CSS Variables**      | `figma-design-system/styles/figma-variables.css` | CSS Custom Properties     |

---

## 🔄 Automatischer Sync

GitHub Actions führt täglich um 2:00 UTC automatisch Sync durch:

- ✅ Exportiert Design Tokens von Figma
- ✅ Generiert JSON, TypeScript, CSS
- ✅ Erstellt Pull Request bei Änderungen
- ✅ Führt Visual Regression Tests durch

**Manueller Trigger**: GitHub → Actions → "🎨 Sync Figma Design Tokens" → Run workflow

---

## 🛡️ Validation

```bash
npm run figma:validate
```

Prüft:

- ✅ JSON Schema Validität
- ✅ Farb-Hex-Werte (`#RRGGBB`)
- ✅ Typography Units (`px`, `rem`, `em`)
- ✅ Sync-Status (JSON ↔ TS ↔ CSS)
- ✅ Austrian Red = `#C8102E`
- ✅ Naming Conventions (kebab-case)

---

## 📚 Vollständige Dokumentation

| Dokument                                                                           | Beschreibung                                                     |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [**FIGMA-INTEGRATION-COMPLETE.md**](../archive/bulk/FIGMA-INTEGRATION-COMPLETE.md) | 🎯 **Vollständige Dokumentation** - Setup, Usage, Best Practices |
| [**FIGMA-SYNC-GUIDE.md**](./FIGMA-SYNC-GUIDE.md)                                   | Setup-Anleitung & Konfiguration                                  |
| [**BRAND-GUIDELINES.md**](./BRAND-GUIDELINES.md)                                   | Brand Identity & Design Regeln                                   |
| [**COMPONENT-USAGE.md**](../archive/bulk/COMPONENT-USAGE.md)                       | Komponenten-Dokumentation                                        |

---

## 🚨 Troubleshooting

### ❌ "FIGMA_ACCESS_TOKEN nicht gesetzt"

```bash
export FIGMA_ACCESS_TOKEN='figd_your_token'
```

### ❌ "Figma API rate limit exceeded"

- **Limit**: 1000 Requests/Stunde
- **Lösung**: 1 Stunde warten oder manuellen Sync nutzen

### ❌ Sync schlägt fehl

```bash
# Backup wiederherstellen
cp figma-design-system/00_design-tokens.backup.*.json \
   figma-design-system/00_design-tokens.json

# Validation prüfen
npm run figma:validate
```

---

## 📞 Support

- **Docs**: [FIGMA-INTEGRATION-COMPLETE.md](../archive/bulk/FIGMA-INTEGRATION-COMPLETE.md)
- **Issues**: [GitHub Issues](https://github.com/menschlichkeit-oesterreich/issues)
- **Chat**: Slack #design-system
- **E-Mail**: <design@menschlichkeit-oesterreich.at>

---

**Implementiert**: 2025-01-15  
**Status**: ✅ Production-Ready  
**Version**: 1.0.0
