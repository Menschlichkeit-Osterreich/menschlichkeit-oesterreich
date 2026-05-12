# AP-01 - Staging Access & Secret Baseline (Evidenz)

Status: BLOCKED_ON_CREDENTIALS  
Datum: 2026-05-12

## Ziel
Nachweis fuer AP-01 aus dem Masterplan: Staging-Zugriff, Secret-Baseline und Vorbedingungen fuer den Staging-Smoke.

## Ergebnisuebersicht
- Erfuellt:
  - `N8N_BASE_URL` ist gesetzt: `https://n8n.menschlichkeit-oesterreich.at`
  - Azure-Kontext ist valide (Subscription/Tenant/User aufgelöst)
  - Provider-Registrierungen sind vorhanden (`Registered`)
  - Payment-Secret-Wiring-Check ist `Pass: true`
  - Linux-Inkompatibilitaet im BW-Sync-Skript wurde behoben
- Blockiert:
  - Bitwarden-Authentifizierung fehlt im aktuellen Environment (`BSM_ACCESS_TOKEN`/`BW_ACCESS_TOKEN`/`BW_TOKEN_FILE`)
  - N8N-URL liefert aktuell eine Domain-Default-Seite statt n8n-UI

## Technische Evidenz
### 1) N8N Baseline
- `N8N_BASE_URL=https://n8n.menschlichkeit-oesterreich.at`
- HTTP-Check: Status `200`
- Response-Anfang:
  - `<!doctype html>`
  - `<html lang="en">`
  - `<title>Domain Default page</title>`

Bewertung:
- URL ist erreichbar, aber Routing/Target fuer n8n ist nicht bestaetigt (Default-Page statt n8n-UI).

### 2) Azure Kontext
- Subscription: `Abonnement 1` (`a41eb54a-a189-4051-be6f-44055e26c94f`)
- Tenant: `Menschlichkeit Österreich`
- User: `peter.schuller@menschlichkeit-oesterreich.at`

### 3) Azure Provider Status
- `Microsoft.ContainerService`: `Registered`
- `Microsoft.OperationalInsights`: `Registered`
- `Microsoft.SecurityInsights`: `Registered`
- `Microsoft.DevCenter`: `Registered`

### 4) Ressourcenlage
- AKS-Cluster: keine gefunden
- Log-Analytics-Workspaces: keine gefunden
- DevCenter-Instanzen: keine gefunden
- Cognitive Services: 3 Accounts gefunden

Bewertung:
- Auth/Provider-Basis passt, aber mehrere MCP-Szenarien bleiben ohne Ressourcen wirkungslos.

### 5) Secret-Wiring / Bitwarden
- Task `Verify: Payment Secret Wiring`: erfolgreich (`Pass=true`)
- Task `Verify: BW Payment Env Sync`: zuerst Linux-Fehler, danach Credential-Blocker

Frueherer Fehler (behoben):
- `Cannot bind argument to parameter 'Path' because it is null.`
- Ursache: `LOCALAPPDATA`-Annahme in Linux-Devcontainer

Aktueller Blocker:
- `Weder 'bw' noch ein Bitwarden Access Token sind verfuegbar.`

## Umgesetzter Fix
Datei: `scripts/sync-payment-env-from-bw.ps1`

Aenderung:
- Winget-Pfadlogik ist jetzt null-safe und nur aktiv, wenn `LOCALAPPDATA` gesetzt ist.
- Damit funktioniert das Skript plattformneutraler im Linux-Devcontainer.

## AP-01 DoD-Stand
- Secret-Wiring-Validierung: DONE
- BW-Sync-DryRun: BLOCKED (fehlende Auth-Credentials)
- n8n-UI/Role-basierter Zugriff: PENDING (Routing/Ziel pruefen)
- Gesamtergebnis AP-01: NO-GO bis Credential- und n8n-Routing-Blocker geloest sind

## Naechste Schritte
1. Bitwarden-Credentials im aktuellen Shell-Kontext bereitstellen:
   - `BSM_ACCESS_TOKEN` oder `BW_ACCESS_TOKEN` setzen
   - alternativ `BW_TOKEN_FILE` auf gitignored Token-Datei zeigen lassen
2. `Verify: BW Payment Env Sync` erneut laufen lassen (Dry-Run)
3. n8n-Domain-Routing pruefen (Reverse Proxy / Target), bis UI statt Default-Page liefert
4. AP-01 auf `READY_FOR_STAGING_SMOKE_TEST` umstellen, sobald 1-3 gruen sind
