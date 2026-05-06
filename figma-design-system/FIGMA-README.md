# Design System – Figma Tokens & Frontend-Integration

Dieses Verzeichnis enthält die Design Tokens (Farben, Typografie, Spacing) sowie Tools zur Synchronisation mit dem Frontend.

## Kernartefakte

- 00_design-tokens.json – Quelle der Wahrheit
- figma-css-variables.config.json – Mapping zu CSS Custom Properties
- scripts/generate-design-tokens.mjs – Token-Build für Frontend

## Nutzung im Frontend

- Tailwind-Setup: `frontend/tailwind.config.cjs`
- Tokens generieren: `npm run design:tokens`

## Accessibility

- Playwright a11y Checks: `playwright-a11y.config.ts`
- Ziel: Lighthouse Accessibility ≥ 90

## Hinweise

- Keine Farben/Spacing hardcoden – ausschließlich Tokens verwenden.
