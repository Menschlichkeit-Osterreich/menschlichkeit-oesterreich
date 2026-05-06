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

## Deploy-Einstiegspunkte (klassifiziert)

### Canonical active

- `.github/workflows/deploy-plesk.yml`

### Documented fallback

- `scripts/deploy-to-plesk.ps1` (nur manuelle Vorbereitung oder Dry-Run)
- `deployment-scripts/README.md` (historische Hilfsskripte, keine produktive Wahrheit)

### Spezialpfade (nicht produktive Hauptwahrheit)

- `.github/workflows/deploy-staging.yml` (Staging)
- `.github/workflows/deploy-forum.yml` (Forum-spezifisch)

### Obsolete fuer produktiven Pfad

- `scripts/deploy.sh` (Legacy-Bash-Deploy, nicht kanonisch)
- `PLSK_*` Variablenvertrag
- `PLESK_REMOTE_PATH`

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

## Abgeschlossener Infrastruktur-Fix 2026-04-24

Problemursache:
Im Plesk-Deploy fuehrten Remote-Pfade mit fuehrendem Slash wie `/httpdocs` in der chroot-basierten Zielumgebung zu einem fehleranfaelligen Zielpfadverhalten. Der Sollvertrag fuer `PLESK_*_PATH` ist deshalb ausschliesslich relativ und ohne fuehrenden Slash.

Umgesetzte Guard-/Normalize-Logik:
Der produktive Workflow `.github/workflows/deploy-plesk.yml` normalisiert fuehrende Slashes vor Deploy-Schritten weg und enthaelt fuer `workflow_dispatch` einen separaten Verifikationsmodus ueber `normalize_test_case`. In diesem Modus werden `BSM: Production Secrets laden`, Build-, Test-, Preflight- und Deploy-Jobs bewusst uebersprungen, sodass nur die Pfad-Normalisierung verifiziert wird.

Referenzen:

- Fix-Stand: Commit `e03d7958`
- Verifikationsrun: `24885970632`
- Nachgewiesener Testfall: `////httpdocs -> httpdocs`
- Abschluss im Log: `keine SSH/SCP/Deploy-Schritte wurden ausgefuehrt`

Erwarteter Sollzustand:
Alle `PLESK_*_PATH`-Werte bleiben relativ, ohne fuehrenden Slash, zum Beispiel `httpdocs`, `subdomains/api/httpdocs` und `subdomains/crm/httpdocs/native`.

## Standardablauf

1. `main` aktuell halten
1. Quality Gates laufen lassen
1. Push auf `main` startet den produktiven Workflow `.github/workflows/deploy-plesk.yml` automatisch
1. `workflow_dispatch` bleibt fuer Dry-Runs oder gezielte Service-Deploys verfuegbar
1. Route-Smokes, Release-Marker und Post-Deploy-Healthchecks muessen gruene Ergebnisse liefern

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
