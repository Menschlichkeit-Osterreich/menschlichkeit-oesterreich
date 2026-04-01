# Monitoring & Observability – Menschlichkeit Oesterreich

Stand: 2026-03-31

## Monitor-Liste

| #   | Service / Endpunkt     | Typ  | URL / Host                                        | Intervall | Timeout | Alert-Schwelle | Owner      |
| --- | ---------------------- | ---- | ------------------------------------------------- | --------- | ------- | -------------- | ---------- |
| 1   | Website                | HTTP | https://www.menschlichkeit-oesterreich.at         | 1 min     | 10s     | HTTP != 200    | Maintainer |
| 2   | API Liveness           | HTTP | https://api.menschlichkeit-oesterreich.at/healthz | 1 min     | 10s     | HTTP != 200    | Backend    |
| 3   | API Readiness          | HTTP | https://api.menschlichkeit-oesterreich.at/readyz  | 2 min     | 15s     | HTTP != 200    | Backend    |
| 4   | CRM Portal             | HTTP | https://crm.menschlichkeit-oesterreich.at         | 5 min     | 15s     | HTTP != 200    | DevOps     |
| 5   | CRM Native             | HTTP | https://crm.menschlichkeit-oesterreich.at/native/ | 5 min     | 15s     | HTTP != 200    | DevOps     |
| 6   | Games                  | HTTP | https://games.menschlichkeit-oesterreich.at       | 5 min     | 15s     | HTTP != 200    | DevOps     |
| 7   | OpenClaw Agent-Runtime | HTTP | http://localhost:9100/health                      | 2 min     | 10s     | HTTP != 200    | DevOps     |
| 8   | OpenClaw Tool-Gateway  | HTTP | http://localhost:9101/health                      | 2 min     | 10s     | HTTP != 200    | DevOps     |

## Healthcheck-Vertrag

- API kanonisch: `/healthz`, `/readyz`
- API Legacy-Alias: `/health`
- Andere neue Betriebsdoku oder neue Monitore duerfen `/health` nicht mehr als Primaerziel verwenden

## Minimale Betriebschecks

```bash
npm run governance:check
npm run test:api
npm run test:unit -- --run
```

## Produktionshinweis

Wenn dieses Dokument, `docs/monitoring.md` und `.github/workflows/deploy-plesk.yml` voneinander abweichen, gilt der Workflow plus reale API-Implementierung als kanonisch.
