---
description: 'Schnellreferenz aller Service-Ports der MOe-Plattform'
disable-model-invocation: true
---

# MOe Service-Ports

## Applikations-Services (Lokal)

| Port | Service                     | Start-Befehl                       |
| ---- | --------------------------- | ---------------------------------- |
| 3000 | Next.js / Babylon.js (Root) | `npm run dev`                      |
| 3000 | Games (Static Server)       | `npm run dev:games`                |
| 5173 | Frontend React/Vite         | `npm run dev:frontend`             |
| 8000 | CRM Drupal/CiviCRM          | `npm run dev:crm`                  |
| 8001 | FastAPI Haupt-API           | `npm run dev:api`                  |
| 5555 | Prisma Studio               | `npm run db:studio`                |
| 8005 | Plesk Mail API              | `uvicorn app.main:app --port 8005` |

## Infrastruktur (Docker)

| Port | Service           | Container                 |
| ---- | ----------------- | ------------------------- |
| 5432 | PostgreSQL (Main) | `menschlichkeit-postgres` |
| 6379 | Redis (Main)      | `menschlichkeit-redis`    |
| 5678 | n8n Automation    | `menschlichkeit-n8n`      |
| 3306 | MariaDB (CRM)     | `moe-crm-db`              |
| 8025 | MailHog Web UI    | `moe-crm-mailhog`         |

## OpenClaw Multi-Agent-System

| Port  | Service               | Container          |
| ----- | --------------------- | ------------------ |
| 4222  | NATS JetStream        | `oc_nats`          |
| 6380  | Redis (OpenClaw)      | `oc_redis`         |
| 55432 | PostgreSQL (OpenClaw) | `oc_postgres`      |
| 6333  | Qdrant REST           | `oc_qdrant`        |
| 9100  | Agent-Runtime         | `oc_agent_runtime` |
| 9101  | Tool-Gateway          | `oc_tool_gateway`  |
| 18790 | Windows Bridge        | WSL2 Proxy         |

## Plesk Production

| Port | Service                            |
| ---- | ---------------------------------- |
| 8443 | Plesk Panel (`5.183.217.146`)      |
| 22   | SSH (`dmpl20230054@5.183.217.146`) |
