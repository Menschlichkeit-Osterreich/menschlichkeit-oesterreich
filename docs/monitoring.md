# Monitoring & Betrieb

Dieses Dokument beschreibt nur den kanonischen Monitoring-Vertrag fuer die aktive Plattform.

## API-Health

| Endpunkt       | Zweck                                 | Status          |
| -------------- | ------------------------------------- | --------------- |
| `GET /healthz` | Liveness                              | kanonisch       |
| `GET /readyz`  | Readiness inkl. Basischecks           | kanonisch       |
| `GET /health`  | Legacy-Alias fuer bestehende Monitore | uebergangsweise |

`/api/health*` gilt aktuell nicht als kanonischer Produktionsvertrag.

## Externe Monitore

- Website: `https://www.menschlichkeit-oesterreich.at/`
- API Liveness: `https://api.menschlichkeit-oesterreich.at/healthz`
- API Readiness: `https://api.menschlichkeit-oesterreich.at/readyz`
- CRM Portal: `https://crm.menschlichkeit-oesterreich.at/`
- CRM Native: `https://crm.menschlichkeit-oesterreich.at/native/`
- Games: `https://games.menschlichkeit-oesterreich.at/`

## Operative Regel

- Wenn Monitoring-, Deploy- und API-Doku sich widersprechen, gewinnt die reale API in `apps/api/app/main.py`.
- `/health` wird erst entfernt, wenn externe Monitore und Betriebsdoku voll auf `/healthz` und `/readyz` migriert sind.
