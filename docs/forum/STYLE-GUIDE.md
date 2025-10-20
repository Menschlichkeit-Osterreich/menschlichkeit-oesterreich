# STYLE-GUIDE – Designsystem-Integration (Figma → Tailwind → phpBB)

**Stand:** 2025-10-19

## Ziele
- Volle Konsistenz zur Hauptplattform (Figma Tokens).
- Responsive, WCAG 2.2 AA/AAA, Dark/Light Mode.

## Quellen
- **Figma File Key:** `mTlUSy9BQk4326cvwNa8zQ` (Tokens)
- **Tailwind Tokens:** Projektweit standardisiert

## Pipeline
1. `figma-tokens-sync.yml` zieht Tokens → `web/forum/theme/tokens.json`.
2. Build-Script generiert CSS‑Variablen/SCSS für phpBB Theme.
3. SCSS Overrides achten Atomic Components (Buttons/Cards/Badges).

## Komponenten
- Header/Footer identisch, Navigationslinks (Home, Datenschutz, Impressum)
- Buttons, Badges, Cards, Alerts, Forms

## Barrierefreiheit
- Kontrast ≥ 4.5:1, Fokus‑Styles sichtbar, ARIA‑Labels
