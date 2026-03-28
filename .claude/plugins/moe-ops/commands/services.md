---
description: 'Schnellreferenz aller Services mit Start-Befehlen'
disable-model-invocation: true
---

# MOe Services

## Einzeln starten

```bash
# Frontend (React 19 + Vite)
cd menschlichkeit-oesterreich-development && npm run dev:frontend

# API (FastAPI Python 3.12)
cd menschlichkeit-oesterreich-development && npm run dev:api

# CRM (Drupal 10 + CiviCRM)
cd menschlichkeit-oesterreich-development && npm run dev:crm

# Games (Static Server)
cd menschlichkeit-oesterreich-development && npm run dev:games

# Root App (Next.js + Babylon.js)
npm run dev
```

## Alle zusammen

```bash
cd menschlichkeit-oesterreich-development && npm run dev:all
```

## Infrastruktur (Docker)

```bash
cd menschlichkeit-oesterreich-development

# PostgreSQL + Redis + n8n
npm run docker:up

# n8n separat (mit eigenem Postgres + Redis)
npm run n8n:start

# CRM Docker-Stack (MariaDB + Nginx + MailHog)
cd apps/crm && docker-compose up -d

# OpenClaw Multi-Agent
bash openclaw-system/scripts/boot.sh
```

## Datenbank

```bash
cd menschlichkeit-oesterreich-development

# Prisma Studio (DB-UI)
npm run db:studio

# Migrationen
npm run db:migrate

# Seed-Daten
npm run db:seed
```

## Deployment (Production)

```bash
cd menschlichkeit-oesterreich-development

# Plesk Deploy (PowerShell)
powershell scripts/deploy-to-plesk.ps1

# Plesk Sync (Bash)
bash scripts/plesk-sync.sh push
```
