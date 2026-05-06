# Figma Design Documentation (figmadocs)

Dies ist die zentrale Dokumentationssammlung für das Figma Design System von „Menschlichkeit Österreich“.

- Quelle (Figma): Siehe `figma-design-system/figma-source.json`
- Design Tokens: `figma-design-system/00_design-tokens.json`
- Build/Checks: Lighthouse, A11y, DSGVO – via Repo-Quality-Gates

## Struktur

- `design/` – Design System, Code-Generierung, MCP Quick Reference
- `setup/` – Setup, Migration, VS Code Integration
- `features/` – Feature-Übersichten
- `civicrm/` – CiviCRM-Integrationen, GDPR-Checklisten
- `releases/` – Release-Notes
- `status/` – Statusberichte
- `archive/` – Archivierte Inhalte

## Verwendung im Repo

Die Qualitätsreports binden figmadocs automatisch ein (`scripts/generate-quality-report.js`) und listen Anzahl und Kategorien der Dokumente im Report `quality-reports/complete-analysis.json` auf.

## Richtlinien

- Keine PII (DSGVO) in Doku-Beispielen.
- UI-Texte auf Österreichisches Deutsch.
- Token-Drift = 0 (nur CSS-Variablen, keine Hardcodes).
- Accessibility: WCAG 2.1 AA.

---
Stand: 2025-10-17T00:00:00.000Z
