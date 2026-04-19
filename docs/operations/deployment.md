# Deployment - Menschlichkeit Oesterreich

**Stand:** 2026-04-13

## Aktiver Produktionsvertrag

- Workflow: `.github/workflows/deploy-plesk.yml`
- Aktiver Branch: `main`
- Standardfall: Push auf `main` deployt automatisch
- Sonderfall: `workflow_dispatch` fuer Dry-Run oder gezielte Service-Auswahl

## Service-Ziele auf Plesk

| Service    | Zielpfad                         | Oeffentliche URL                                    |
| ---------- | -------------------------------- | --------------------------------------------------- |
| Website    | `httpdocs`                       | `https://www.menschlichkeit-oesterreich.at/`        |
| API        | `subdomains/api/httpdocs`        | `https://api.menschlichkeit-oesterreich.at/`        |
| CRM-Portal | `subdomains/crm/httpdocs`        | `https://crm.menschlichkeit-oesterreich.at/`        |
| CRM-Native | `subdomains/crm/httpdocs/native` | `https://crm.menschlichkeit-oesterreich.at/native/` |
| Games      | `subdomains/games/httpdocs`      | `https://games.menschlichkeit-oesterreich.at/`      |

Das CRM-Root ist der Portal-SPA-Host. Drupal/CiviCRM liegt bewusst nur unter `/native/`.

## Pflicht-Gates vor dem Deploy

1. `npm run type-check` fuer `apps/website`
2. Frontend-Build inklusive `build:prerender`
3. Lokale Route-Smokes fuer `/`, `/kontakt`, `/mitglied-werden`, `/spenden`, `/forum`, `/spiel`, `/login`, `/barrierefreiheit`
4. Pa11y-Checks ueber `apps/website/.pa11yci.json`
5. Unit-Tests

## Pflicht-Checks nach dem Deploy

1. HTTP-Healthchecks fuer Website, CRM-Portal, CRM-Native und Games
2. API Liveness pruefen: `https://api.menschlichkeit-oesterreich.at/healthz`
3. API Readiness pruefen: `https://api.menschlichkeit-oesterreich.at/readyz`
4. `https://api.menschlichkeit-oesterreich.at/health` nur als Legacy-Alias behandeln
5. Live-Route-Smokes fuer die oeffentlichen Kernpfade auf `www`
6. Live-Route-Smoke fuer `https://crm.menschlichkeit-oesterreich.at/login`
7. Release-Marker-Pruefung auf Commit-Gleichstand via `/.deploy_release`

## Betriebsregeln

- Tote oeffentliche Einstiegswege sind Produktionsfehler und kein reines Hosting-Thema.
- `/login` auf `www` bleibt der oeffentliche Handoff ins CRM-Portal.
- `/barrierefreiheit` ist verpflichtender Public-Build-Pfad.
- Versionierte Nginx- und Deploy-Konfiguration muessen denselben Routing-Vertrag beschreiben wie die Live-Instanz.

## Lokaler Fallback

Fuer lokale Vorbereitung bleibt dieser Fallback erlaubt:

```powershell
pwsh -File scripts/deploy-to-plesk.ps1 -Target frontend -DryRun
```
