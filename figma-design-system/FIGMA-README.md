# Design System – Figma Tokens & Frontend-Integration

Dieses Verzeichnis enthält die Design Tokens (Farben, Typografie, Spacing) sowie Tools zur Synchronisation mit dem Frontend.

## Kernartefakte

- 00_design-tokens.json – Quelle der Wahrheit
- figma-css-variables.config.json – Mapping zu CSS Custom Properties
- apps/website/scripts/generate-design-tokens.mjs – Token-Build für Frontend (CSS-Variables für Website)
- figma-design-system/styles/design-tokens.css – Referenz-CSS-Variablen (Dokumentation)

## Nutzung im Frontend

- Tailwind-Setup: `apps/website/tailwind.config.cjs`
- Tokens generieren (Website CSS): `npm run tokens:build --workspace=@moe/frontend`

## Accessibility

- WCAG 2.1 AA Baselines: `figma-design-system/accessibility/WCAG-AA-BASELINES.md`
- Kontrastpaare: `figma-design-system/accessibility/CONTRAST-PAIRS.md`
- Playwright a11y Checks: `playwright-a11y.config.ts`
- Ziel: Lighthouse Accessibility ≥ 90

## Hinweise

- Keine Farben/Spacing hardcoden – ausschließlich Tokens verwenden.
