# Contract: DNS and HTTPS Acceptance Gate

## Contract Purpose

Dieser Contract definiert den Abnahmevertrag fuer DNS-Zielroute und HTTPS-Betrieb von `n8n.menschlichkeit-oesterreich.at` im Azure-Zielbild.

## Scope

### In Scope

- DNS-Zielzustand fuer `n8n.menschlichkeit-oesterreich.at`
- Plesk-Abloesepfad inklusive Rollback
- HTTPS-Erreichbarkeit und Zertifikatsgueltigkeit
- Konsistenz von `WEBHOOK_URL` und `N8N_EDITOR_BASE_URL`
- Expositionskontrolle (nur `22`, `80`, `443` oeffentlich)

### Out of Scope

- Produktiver Go-Claim ohne Evidenz
- n8n-Fachworkflow-Ausbau
- Queue-Mode-Erweiterung

## Invariants

- DNS muss auf den definierten Azure-Zielpunkt zeigen (kein stiller Plesk-Restpfad).
- HTTPS muss gueltig und reproduzierbar pruefbar sein.
- `WEBHOOK_URL` und `N8N_EDITOR_BASE_URL` muessen auf den produktiv vorgesehenen Host zeigen.
- `5678`, `5432`, `6379` duerfen nicht oeffentlich sichtbar sein.

## Required Evidence

- DNS-Aufloesungsnachweis (A/AAAA/CNAME entsprechend Zielbild)
- HTTPS-Check mit Statuscode und Zertifikatsmetadaten
- Routing-/URL-Konsistenznachweis fuer Editor- und Webhook-Basis-URL
- Port-/Expositionsnachweis fuer oeffentliche und private Ports
- Dokumentierter Rollbackpfad fuer DNS/HTTPS-Fehler

## Go/No-Go Conditions

- **Go** (Abnahmevorbereitung bestanden):
  - DNS-Ziel korrekt
  - HTTPS gueltig
  - URL-Konsistenz gegeben
  - Expositionsregeln eingehalten
- **No-Go**:
  - DNS zeigt nicht auf Azure-Ziel
  - HTTPS fehlerhaft oder Zertifikat ungueltig
  - `WEBHOOK_URL`/`N8N_EDITOR_BASE_URL` inkonsistent
  - private Ports oeffentlich exponiert

## Rollback Contract

Bei DNS-/HTTPS-Fehlern muss ein sicherer Rueckfallpfad dokumentiert und anwendbar sein:

1. Fehlerklassifikation (DNS, Cert, URL, Exposition)
2. Rueckschaltung auf letzten stabilen Zielzustand
3. Incident-Dokumentation im Evidenzpfad
4. Erneute Go/No-Go-Bewertung vor naechstem Umschaltversuch

## Acceptance Gate

Der Contract gilt als erfuellt, wenn jeder Gate-Punkt einen Evidenztyp, einen Pruefschritt, einen Status und eine Blockerklasse besitzt und keine offenen Go-Live-Blocker bestehen.
