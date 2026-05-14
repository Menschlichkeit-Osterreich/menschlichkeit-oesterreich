# AP-01 Infra Handoff: n8n Routing Fix

Status: HANDOFF_READY
Datum: 2026-05-12

## Ziel

Dieses Handoff beschreibt den minimalen Infrastruktur-Fix fuer AP-01.
Es basiert ausschliesslich auf den vorhandenen Repo-Artefakten und fuehrt keine neue Architektur ein.

## Kanonisches Soll-Ziel aus dem Repo

Abgeleitet aus:

- [automation/n8n/deploy-https.sh](/workspaces/menschlichkeit-oesterreich/automation/n8n/deploy-https.sh)
- [automation/n8n/Caddyfile](/workspaces/menschlichkeit-oesterreich/automation/n8n/Caddyfile)
- [automation/n8n/docker-compose.https.yml](/workspaces/menschlichkeit-oesterreich/automation/n8n/docker-compose.https.yml)

### Oeffentlicher Host

- Host: `n8n.menschlichkeit-oesterreich.at`
- Protokoll: `https`

### Erwartete oeffentliche Pfade

- Web UI: `/`
- Health: `/healthz`
- Webhook-Basis: `/webhook/...`

### Erwartetes internes Ziel

- TLS-Endpunkt oeffentlich: Caddy auf Host-Port `443`
- HTTP fuer Redirect/ACME: Caddy auf Host-Port `80`
- Reverse-Proxy-Upstream hinter Caddy: `n8n:5678`

### Erwartete Host- und Forwarding-Informationen

Der vorhandene Caddy-Stack erwartet fuer `n8n.menschlichkeit-oesterreich.at`:

- Host-Header: `n8n.menschlichkeit-oesterreich.at`
- `X-Forwarded-Proto: https`
- `X-Forwarded-Host: n8n.menschlichkeit-oesterreich.at`
- WebSocket-faehiges Proxying zur n8n-UI

## Aktueller Ist-Fehler

Der reproduzierbare Probe-Check zeigt aktuell:

- Domain liefert Plesk Default Page
- Kein n8n-Login sichtbar
- Kein n8n-typischer `401/403`
- Kein erwartbarer Health-Response

Das bedeutet:

- Die Subdomain zeigt derzeit nicht auf den vorgesehenen n8n-Stack.
- Der Blocker liegt in Reverse Proxy, Plesk-Vhost-Zuordnung oder DNS-Zielbindung.

## Minimale Zielkonfiguration fuer Reverse Proxy oder Plesk

Nur das ist fuer den Fix erforderlich:

1. Die Subdomain `n8n.menschlichkeit-oesterreich.at` darf nicht mehr auf die Plesk-Default-Vhost-Seite fallen.
2. Die Anfrage fuer diesen Host muss auf den vorhandenen n8n-HTTPS-Stack zeigen, der in den Repo-Artefakten ueber Caddy definiert ist.
3. Falls Plesk vor dem Stack sitzt, muss Plesk den Host an den vorgesehenen Zielstack weiterreichen statt selbst die Default-Seite auszuliefern.
4. Falls direkt auf den Container-Stack geroutet wird, ist das kanonische oeffentliche Ziel der Caddy-Endpunkt auf `80/443`, nicht eine neue alternative Zielarchitektur.
5. Hinter Caddy bleibt das interne Upstream-Ziel `n8n:5678` unveraendert.

## Sehr kurze Betreiber-Checkliste

1. Die Domain `n8n.menschlichkeit-oesterreich.at` darf nicht mehr auf die Plesk-Default-Site zeigen.
2. Das oeffentliche Ziel muss der bestehende HTTPS-Stack mit Caddy auf `80/443` sein.
3. Der Upstream hinter diesem HTTPS-Stack muss `n8n:5678` bleiben.
4. Oeffentliche Sollpfade muessen erreichbar und korrekt geroutet sein:
   - `/`
   - `/healthz`
   - `/webhook/...`
5. Abnahme nur mit bestandenem Task `Verify: N8N Staging Routing` ohne Exit-Code `30`.

## Nicht Teil dieses Pakets

- keine n8n-Workflow-Aenderungen
- keine Secret-Refactors
- keine API-Refactors
- keine neuen Hosts oder Pfade
- kein Start des Donation-Smoke-Tests

## Done-Kriterium fuer den Routing-Fix

Der Fix ist erst belastbar abgeschlossen, wenn gleichzeitig gilt:

1. [automation/n8n/check-staging-routing.py](/workspaces/menschlichkeit-oesterreich/automation/n8n/check-staging-routing.py) liefert keinen Exit-Code `30` mehr.
2. Der Task `Verify: N8N Staging Routing` wechselt von `domain-default-page` auf einen erlaubten Nicht-Blocker-Zustand.
3. Extern erscheint keine Plesk-Default-Seite mehr.
4. Stattdessen ist mindestens einer dieser Zustaende sichtbar:
   - n8n-Login/UI sichtbar
   - n8n-typischer `401/403`
5. [runbooks/donation-apiv4/AP-01_STAGING_ACCESS_SECRET_BASELINE_EVIDENCE.md](/workspaces/menschlichkeit-oesterreich/runbooks/donation-apiv4/AP-01_STAGING_ACCESS_SECRET_BASELINE_EVIDENCE.md) bleibt deckungsgleich zur Task-Ausgabe.
6. `Verify: Payment Secret Wiring` bleibt gruen.
7. `Verify: BW Payment Env Sync` bleibt im Dry-Run gruen.

## Abnahmeweg

1. Proxy- oder Plesk-Zuordnung fuer `n8n.menschlichkeit-oesterreich.at` korrigieren.
2. `Verify: N8N Staging Routing` erneut ausfuehren.
3. Nur wenn Exit-Code `30` verschwunden ist, AP-01-Evidenz aktualisieren.
4. Secret-Baselines erneut gegenpruefen, damit kein Seiteneffekt eingefuehrt wurde.

## Operativer Hinweis

Der Probe-Check ist eine Abnahmebedingung, kein Fix-Mechanismus.
Solange `domain-default-page` geliefert wird, ist jede weitere AP-01-Arbeit, die UI-, API- oder Staging-Erreichbarkeit voraussetzt, ein No-Go.
