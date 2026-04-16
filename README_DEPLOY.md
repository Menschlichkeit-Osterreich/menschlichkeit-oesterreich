# Deployment-Anleitung

Diese Datei beschreibt nur den **aktiven** Produktionsvertrag fuer `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`.

## Source of Truth

- Produktionsdeploy: `.github/workflows/deploy-plesk.yml`
- Aktiver Branch: `main`
- Produktive Zielpfade:
  - Frontend: `httpdocs`
  - API: `subdomains/api/httpdocs`
  - CRM Portal: `subdomains/crm/httpdocs`
  - CRM Native: `subdomains/crm/httpdocs/native`
  - Games: `subdomains/games/httpdocs`

Lokale oder historische Skripte sind nur Fallbacks und duerfen den Workflowvertrag nicht uebersteuern.

## Kanonische Secrets und Variablen

### Secrets

- `PLESK_HOST`
- `PLESK_PORT`
- `PLESK_USER`
- `PLESK_SSH_PRIVATE_KEY`
- `PLESK_KNOWN_HOSTS`

### Optionale Repository-/Environment-Variablen

- `PLESK_BASE_PATH`
- `PLESK_FRONTEND_PATH`
- `PLESK_API_PATH`
- `PLESK_CRM_PATH`
- `PLESK_CRM_NATIVE_PATH`
- `PLESK_CRM_NATIVE_BUILD_PATH`
- `PLESK_GAMES_PATH`
- `MAIN_DOMAIN`

`PLSK_*` und `PLESK_REMOTE_PATH` gelten nicht mehr als aktive Betriebswahrheit.

## Standardablauf

1. `main` aktuell halten
2. Quality Gates laufen lassen
3. Push auf `main` startet den produktiven Workflow `.github/workflows/deploy-plesk.yml` automatisch
4. `workflow_dispatch` bleibt fuer Dry-Runs oder gezielte Service-Deploys verfuegbar
5. Route-Smokes, Release-Marker und Post-Deploy-Healthchecks muessen gruene Ergebnisse liefern

## Health-Vertrag

- API Liveness: `https://api.menschlichkeit-oesterreich.at/healthz`
- API Readiness: `https://api.menschlichkeit-oesterreich.at/readyz`
- `https://api.menschlichkeit-oesterreich.at/health` bleibt nur Legacy-Alias

## Lokaler Fallback

Fuer lokale Vorbereitung oder Dry-Runs steht nur dieser Fallback bereit:

```powershell
pwsh -File scripts/deploy-to-plesk.ps1 -Target frontend -DryRun
```

Echte Produktionsdeploys sollen weiterhin ueber GitHub Actions laufen.
