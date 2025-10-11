---
title: Figma MCP Integration Rules
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: medium
category: core
applyTo: figma-design-system/**,frontend/**,website/**
---
# Figma MCP Integration Rules

## Aktivierung

- Figma MCP Tools sind über `.vscode/mcp.json` verbunden
- Endpoint: `https://mcp.figma.com/mcp`
- Verwendete Tools: `get_code`, `get_metadata`, `get_screenshot`, `create_design_system_rules`

## Design Token Struktur

### Haupt-Token-Datei

- **Pfad**: `figma-design-system/00_design-tokens.json`
- **Format**: JSON mit Kategorien: `colors`, `typography`, `spacing`, `borderRadius`, `shadows`
- **Auto-generiert**: CSS-Variablen nach `figma-design-system/styles/tokens.css`

### Sync-Workflow

```bash
# Manueller Sync
npm run figma:sync

# Validierung (Token-Drift-Check)
node scripts/validate-design-tokens.js

# Automatisch via GitHub Actions
# .github/workflows/sync-figma-tokens.yml läuft täglich 2:00 UTC
```

## Integration Points

### Frontend (React/TypeScript)

- **Design Tokens**: Import via `figma-design-system/index.ts`
- **Tailwind Config**: `frontend/tailwind.config.cjs` konsumiert Tokens
- **Komponenten**: `figma-design-system/components/` mit TypeScript Types

### Website (WordPress/HTML)

- **CSS Variables**: `website/assets/css/figma-tokens.css`
- **Branding**: Rot-Weiß-Rot österreichische Farben aus Tokens

## MANDATORY bei Figma-Änderungen

1. **Nach Token-Updates**:
   - Laufe `node scripts/validate-design-tokens.js` zur Token-Validierung
   - Prüfe `Design Token Drift=0` im Quality Gate
   - Codacy-Analyse für geänderte CSS/TS-Dateien

2. **Bei neuen Komponenten**:
   - Nutze `mcp_figma_get_code` mit `nodeId` + `fileKey`
   - Generiere TypeScript + CSS gemäß bestehender Architektur
   - Accessibility: WCAG AA-Konformität validieren

3. **URL-Format für Figma**:
   - Extrahiere aus `https://figma.com/design/:fileKey/:fileName?node-id=1-2`
   - `fileKey` = `:fileKey`
   - `nodeId` = `1:2` (Doppelpunkt, nicht Bindestrich!)

## Automatisierung via GitHub Copilot

### Figma → Code Workflow

1. User gibt Figma URL oder NodeId
2. Copilot nutzt `mcp_figma_get_code(nodeId, fileKey)`
3. Generierter Code wird nach `frontend/src/components/` oder `figma-design-system/components/` geschrieben
4. Automatische Codacy-Analyse nach Datei-Edit
5. Design Token Validierung läuft automatisch

## Qualitätskriterien

- **Token Drift**: 0 Abweichungen zwischen Figma und Code
- **Accessibility**: WCAG AA für alle generierten Komponenten
- **Performance**: CSS-Variablen bevorzugt über Inline-Styles
- **Dokumentation**: Jede Komponente mit Usage-Beispiel in `COMPONENT-USAGE.md`

## Fehlerbehandlung

- **401 Unauthorized**: Figma Access Token fehlt (GitHub Secret `FIGMA_ACCESS_TOKEN`)
- **404 Not Found**: FileKey oder NodeId ungültig
- **413 Too Large**: Nutze `get_metadata` statt `get_code` für große Designs
