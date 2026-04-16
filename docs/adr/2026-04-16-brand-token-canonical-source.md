# ADR: Kanonische Brand- und Token-Quelle

- Status: Accepted
- Datum: 2026-04-16
- Kontext: Frontend-Audit (A11y, Routing, Deploy-Drift, Brand-Konsistenz)

## Entscheidung

Die kanonische Quelle fuer Brand-Entscheidungen ist:

1. `.claude/plugins/moe-brand/BRAND-GUIDELINES-V1.0.md`

Die kanonische technische Token-Quelle fuer Build und Styling ist:

2. `figma-design-system/00_design-tokens.json`

Daraus abgeleitete Runtime-Quellen sind:

3. `apps/website/src/styles/tokens.css`
4. `apps/website/tailwind.config.cjs`

Der Root-Config-Stand wurde auf dieselbe Token-Quelle angeglichen:

5. `tailwind.config.js`

## Begruendung

- Vermeidet konkurrierende Farbwelten (insbesondere alte generische Rot-/Slate-Paletten).
- Stellt konsistente Kontrastwerte und semantische Farben ueber Layout-Bausteine sicher.
- Reduziert Drift zwischen Design-System, Build-Konfiguration und Runtime-CSS.

## Auswirkungen

- Neue Farb-/Typografie-Entscheidungen werden nur noch ueber die Brand-Guideline und die daraus abgeleitete Token-Datei eingefuehrt.
- Legacy-Dateien wie `apps/website/src/styles/globals.css` bleiben kompatibel, sind aber nicht die fuehrende Runtime-Quelle.
- A11y-Fixes in gemeinsam genutzten Komponenten koennen zentral und reproduzierbar umgesetzt werden.

## Nicht-Ziele

- Keine Einfuehrung eines Accessibility-Overlays.
- Keine ad-hoc Inline-Farbwerte ausserhalb des Token-Systems.
