# Deployment - Menschlichkeit Oesterreich

**Stand:** 2026-04-13

## Aktiver Produktionsvertrag

- Workflow: `.github/workflows/deploy-plesk.yml`
- Aktiver Branch: `main`
- Standardfall: Push auf `main` deployt automatisch
- Sonderfall: `workflow_dispatch` fuer Dry-Run oder gezielte Service-Auswahl

## Aktiver BSM-/Runtime-Secret-Vertrag

### Verbindliche Betriebswahrheit

- `.github/workflows/deploy-plesk.yml` steuert den produktiven API-Deploy und den Handoff in die Runtime.
- `.github/workflows/reusable-bsm-secrets.yml` ist der kanonische Loader fuer BSM-Secrets pro Profil.
- `.github/bsm-secret-ids.json` ist das UUID-Mapping (BSM-Key -> Runtime-Env-Var) fuer die aktiven Deploy-Profile.

Diese drei Dateien bilden zusammen den aktiven Deploy-/Secret-Vertrag. Keine zweite Wahrheit in Legacy- oder Archivpfaden pflegen.

### Fuehrende Secret-Quelle

- Fuehrend ist Bitwarden Secrets Manager (BSM).
- Im Repository duerfen keine echten Secret-Werte liegen.
- Das Mapping in `.github/bsm-secret-ids.json` muss fuer `deploy-production` mindestens diese API-Runtime-Werte enthalten:
  - `MICROSOFT_TENANT_ID`
  - `MICROSOFT_CLIENT_ID`
  - `MICROSOFT_CLIENT_SECRET`
  - `MICROSOFT_GRAPH_SENDER`
  - `ALERTS_SLACK_WEBHOOK`

### Runtime-Handoff (API)

Im produktiven API-Pfad werden die genannten Werte wie folgt uebergeben:

1. BSM-Injektion in der Pipeline (`bsm-env-inject`) auf Basis von `deploy-production`.
1. API-Deploy erzeugt `.env.deploy` mit den injizierten Werten.
1. Merge in `${API_REMOTE_PATH}/.env` (nur die betroffenen Keys werden ersetzt/gesetzt).
1. Uvicorn-Restart im Zielpfad, danach Liveness/Readiness-Checks.

### Verifikation ohne produktive Nebeneffekte

Fuer reinen Handoff-Nachweis ohne Deploy-Schreibschritte:

- Workflow manuell starten (`workflow_dispatch`) mit:
  - `service=api`
  - `dry_run=true`
  - `normalize_test_case=none`
- Erwarteter Nachweis im Job `Preflight (BSM Handoff)`:
  - alle fuenf Zielwerte werden als vorhanden bestaetigt
  - bei fehlendem Wert bricht der Lauf vor dem Deploy ab

Damit ist der Secret-Handoff aus BSM in die Workflow-Runtime nachvollziehbar pruefbar, ohne produktive Deploy-Schritte auszufuehren.

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
