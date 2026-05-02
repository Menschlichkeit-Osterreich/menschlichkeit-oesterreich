# Website Frontend

React- und Vite-basierte Frontend-Anwendung fuer das oeffentliche Web, das CRM-Portal-Root und die statische Landingpage rund um das Demokratiespiel.

## Aktiver Vertrag

- Oeffentliche Website: `https://www.menschlichkeit-oesterreich.at`
- CRM-Portal-Root: `https://crm.menschlichkeit-oesterreich.at`
- Games-Host: `https://games.menschlichkeit-oesterreich.at`
- Laufzeit-Einstieg: `apps/website/src/main.tsx`
- Routing-Vertrag: `apps/website/src/AppRoutes.tsx`
- Aktive Runtime-Styles: `apps/website/src/index.css` und `apps/website/src/styles/tokens.css`

## Brand- und Token-Quelle

- Kanonische Markenentscheidung: `.claude/plugins/moe-brand/BRAND-GUIDELINES-V1.0.md`
- Abgeleitete Build-Tokens: `figma-design-system/00_design-tokens.json`
- Generierte Runtime-Tokens: `apps/website/src/styles/tokens.css`

`figma-design-system/00_design-tokens.json` ist kein freies zweites Designsystem, sondern die buildbare Ableitung des Moe-Brand-Guides. Wenn Farben oder Typografie geaendert werden, muss der Moe-Brand-Vertrag die Entscheidung tragen.

## Wichtige Routen

- Oeffentliche Kernpfade: `/`, `/kontakt`, `/mitglied-werden`, `/spenden`, `/forum`, `/spiel`, `/barrierefreiheit`
- Oeffentlicher Portal-Einstieg: `/login`
- CRM-Portal-Ziel: `https://crm.menschlichkeit-oesterreich.at/login`
- Native CRM-/Drupal-Laufzeit: `https://crm.menschlichkeit-oesterreich.at/native/`

Die oeffentliche Website verlinkt fuer geschuetzte Bereiche auf den robusten Public-Entry `/login`. Direkte tote Links auf den CRM-Host sind zu vermeiden.

## Lokale Arbeit

```bash
npm install
npm run type-check
npm run build:prerender
npm run preview
```

Fuer Route-Smokes und A11y-Pruefungen werden die Hilfsskripte unter `apps/website/scripts/` und die Workspace-Konfiguration in `apps/website/.pa11yci.json` verwendet.

## Deployment

- Produktionsvertrag: `.github/workflows/deploy-plesk.yml`
- Doku: `README_DEPLOY.md` und `docs/operations/deployment.md`

Pushes auf `main` sind der aktive Produktionspfad. Der Workflow muss Build, Typecheck, Route-Smokes und Post-Deploy-Checks fuer die oeffentlichen Kernpfade bestehen lassen, bevor das Oekosystem als konsistent gilt.
