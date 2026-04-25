# Services & Ports – Menschlichkeit Österreich

## Lokale Entwicklung

| Service                | Port | Startkommando          | Verzeichnis                          |
| ---------------------- | ---- | ---------------------- | ------------------------------------ |
| Frontend (React/Vite)  | 5173 | `npm run dev:frontend` | `apps/website/`                      |
| API (FastAPI)          | 8001 | `npm run dev:api`      | `api.menschlichkeit-oesterreich.at/` |
| CRM (Drupal + CiviCRM) | 8000 | `npm run dev:crm`      | `crm.menschlichkeit-oesterreich.at/` |
| Games (Static)         | 3000 | `npm run dev:games`    | `web/`                               |
| n8n (Docker)           | 5678 | `npm run docker:up`    | `automation/n8n/`                    |
| PostgreSQL (Docker)    | 5432 | `npm run docker:up`    | docker-compose.yml                   |
| Redis (Docker)         | 6379 | `npm run docker:up`    | docker-compose.yml                   |
| Prisma Studio          | 5555 | `npx prisma studio`    | root                                 |

## Produktion

| Service | URL                                         | Subdomain |
| ------- | ------------------------------------------- | --------- |
| Website | https://menschlichkeit-oesterreich.at       | (Apex)    |
| API     | https://api.menschlichkeit-oesterreich.at   | api.      |
| CRM     | https://crm.menschlichkeit-oesterreich.at   | crm.      |
| Forum   | https://forum.menschlichkeit-oesterreich.at | forum.    |
| n8n     | https://n8n.menschlichkeit-oesterreich.at   | n8n.      |

**Hosting:** Plesk Panel auf `5.183.217.146:8443` (Zugriff nur für autorisierte Maintainer).

## API-Dokumentation (lokal)

| Service        | URL                                              |
| -------------- | ------------------------------------------------ |
| API Swagger UI | http://localhost:8001/docs                       |
| API ReDoc      | http://localhost:8001/redoc                      |
| OpenAPI Spec   | `api.menschlichkeit-oesterreich.at/openapi.yaml` |

## Credentials (nur lokal, niemals in Produktion)

| Service    | Benutzer | Passwort            |
| ---------- | -------- | ------------------- |
| PostgreSQL | postgres | postgres            |
| n8n        | admin    | admin123            |
| Redis      | —        | — (kein Auth lokal) |

**Produktions-Credentials:** Ausschließlich über GitHub Secrets und Plesk Environment Variables.
