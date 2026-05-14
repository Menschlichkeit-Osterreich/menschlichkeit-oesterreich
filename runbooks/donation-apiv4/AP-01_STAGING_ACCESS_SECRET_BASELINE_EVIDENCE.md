# AP-01 - Staging Access & Secret Baseline (Evidenz)

Status: BLOCKED_MISSING_STAGING_ACCESS
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
  - BW-Payment-Env-Sync Dry-Run ist erfolgreich
- Blockiert:
  - N8N-URL liefert aktuell eine Domain-Default-Seite statt n8n-UI

## Technische Evidenz
### 1) N8N Baseline
- `N8N_BASE_URL=https://n8n.menschlichkeit-oesterreich.at`
- DNS/Probe-Aufloesung: `5.183.217.146`
- HTTP-Check: Status `200`
- Health-Probe (`/healthz`): Status `404`
- Response-Anfang:
  - `<!DOCTYPE html>`
  - `This is a default webpage generated for`
  - `n8n.menschlichkeit-oesterreich.at by Plesk`

Bewertung:
- URL ist erreichbar, aber Routing/Target fuer n8n ist nicht bestaetigt.
- Klassifikation: `Domain Default Page` => Reverse Proxy und/oder DNS zeigt auf das falsche Target.
- Keine n8n-Loginseite sichtbar, keine autoritative API-Antwort nachweisbar.

### 1.1) Routing-Klassifikation fuer AP-01
| Beobachtung | Bedeutung | Klasse |
| --- | --- | --- |
| Domain Default Page | Reverse Proxy oder DNS falsch | Infrastruktur |
| 401/403 von n8n | Routing korrekt, Auth oder Rolle fehlt | Auth |
| n8n Login/UI sichtbar | Routing und App erreichbar | Access |
| API antwortet erwartbar | Autoritative Zielumgebung nutzbar | Ready |

Reproduzierbarer Probe-Check:
- `python3 automation/n8n/check-staging-routing.py`
- `python3 automation/n8n/check-staging-routing.py --json`
- VS-Code-Task: `Verify: N8N Staging Routing`

Aktueller Ist-Stand:
- `Domain Default Page` getroffen
- `401/403 von n8n` nicht getroffen
- `n8n Login/UI sichtbar` nicht getroffen
- `API antwortet erwartbar` nicht getroffen
- Probe-Exit-Code: `30` (`domain-default-page`)

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
- Task `Verify: BW Payment Env Sync`: Dry-Run erfolgreich

Frueherer Fehler (behoben):
- `Cannot bind argument to parameter 'Path' because it is null.`
- Ursache: `LOCALAPPDATA`-Annahme in Linux-Devcontainer

Aktueller Stand:
- BSM-Secrets wurden geladen (`59 Eintraege`, Scope `development`)
- Dry-Run meldet Setzoperationen fuer `VITE_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY` und `STRIPE_WEBHOOK_SECRET`
- Kein Credential-Blocker mehr im aktuellen Environment nachweisbar

## Umgesetzter Fix
Datei: `scripts/sync-payment-env-from-bw.ps1`

Aenderung:
- Winget-Pfadlogik ist jetzt null-safe und nur aktiv, wenn `LOCALAPPDATA` gesetzt ist.
- Damit funktioniert das Skript plattformneutraler im Linux-Devcontainer.

## AP-01 DoD-Stand
- Secret-Wiring-Validierung: DONE
- BW-Sync-DryRun: DONE
- n8n-UI/Role-basierter Zugriff: BLOCKED_MISSING_STAGING_ACCESS
- N8N_API_KEY: PENDING (erst sinnvoll nach korrigiertem Routing/UI-Zugriff)
- Gesamtergebnis AP-01: NO-GO bis der Infrastruktur-Blocker fuer das n8n-Routing geloest ist

## SFTP Read-only Routing-Analyse (2026-05-12) — Ergebnis: CONFIRMED_PLESK_DEFAULT_WEBSITE_MAPPING

Analyse-Skript: `automation/n8n/sftp_readonly_analysis.py`
SFTP-Verbindung: `peter_schuller@5.183.217.146:22` (Chroot-Shell)

### Rootursache bewiesen

Datei `subdomains/n8n/httpdocs/index.html` (464 Bytes) enthaelt exakt den Plesk-Default-HTML:
```
<title>Domain Default page</title>
"Copyright 1999-2023. Plesk International GmbH. All rights reserved."
"This is a default webpage generated for n8n.menschlichkeit-oesterreich.at by Plesk."
```

Plesk betreibt `n8n.menschlichkeit-oesterreich.at` als normale statische Website (Hosting-Typ: Website).
Kein Reverse Proxy, kein Caddy, kein n8n-Prozess im SFTP-sichtbaren Bereich nachweisbar.

### Chroot-Grenzen

Folgendes ist per SFTP nicht sichtbar (root-seitige Pruefung noetig):
- Docker-Container-Status (laeuft n8n auf :5678?)
- Caddy-Konfiguration
- Plesk-generierte vHost-Konfiguration (`/var/www/vhosts/system/n8n.*/conf/`)
- Nginx/Apache aktive Routing-Regeln
- Port-Bindings (443, 5678)

### Empfohlener Fix (root/Plesk-Admin)

Option A (Schnell): Plesk UI → Subdomains → n8n → Hosting-Typ auf „Proxy" aendern → Ziel: `http://localhost:5678`
Option B (manuell): `vhost_nginx.conf` fuer n8n-Subdomain mit Proxy-Block schreiben + `nginx reload`

Vorbedingung: n8n-Container muss auf `localhost:5678` lauschen (`curl http://localhost:5678/healthz` = 200).

Handoff-Dokument: `runbooks/donation-apiv4/AP-01_INFRA_HANDOFF_N8N_ROUTING_FIX.md`

## Naechste Schritte
1. **Root-Schritt (Betreiber):** Plesk-vHost fuer `n8n.menschlichkeit-oesterreich.at` von Website auf Reverse Proxy umstellen (Option A/B, s.o.)
2. **Verifikation:** `Verify: N8N Staging Routing` muss Exit 0 statt Exit 30 liefern
3. **Nach korrigiertem Routing:** UI-Zugriff, Rolle und API-Settings nachweisen
4. `N8N_API_KEY` erzeugen oder verifizieren, sobald UI/API autoritativ erreichbar ist
5. AP-01 auf `READY_FOR_STAGING_SMOKE_TEST` umstellen, sobald Routing, UI-Zugriff, API-Key und die bereits gruenen Secret-Baselines vollstaendig belegt sind
