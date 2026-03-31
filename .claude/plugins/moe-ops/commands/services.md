---
description: 'Schnellreferenz aller aktiven Services mit aktuellen Startbefehlen'
disable-model-invocation: true
---

# MOe Services

Aktueller Repo-Root:

```powershell
$env:MOE_REPO_ROOT = "E:\Menschlichkeit-Osterreich\menschlichkeit-oesterreich"
Set-Location $env:MOE_REPO_ROOT
```

## Einzeln starten

```powershell
# Website
npm run dev:frontend

# API
npm run dev:api

# CRM
npm run dev:crm

# Games
npm run dev:games

# Forum
npm run dev:forum
```

## Alle zusammen

```powershell
npm run dev:all
```

## Infrastruktur

```powershell
# Docker-Basisdienste
npm run docker:up

# n8n separat
npm run n8n:start

# OpenClaw Runtime
bash openclaw-system/scripts/boot.sh
```

## Datenbank

```powershell
# Prisma Studio
npm run db:studio

# Migrationen
npm run db:migrate

# Seed-Daten
npm run db:seed
```

## Governance und Betrieb

```powershell
# MCP
npm run mcp:check
npm run mcp:health

# Governance
npm run governance:check

# Quality Gates
npm run quality:gates
```

## Deployment

```powershell
# Plesk Deploy (PowerShell)
pwsh -File scripts/deploy-to-plesk.ps1

# Dry Run
bash scripts/safe-deploy.sh --dry-run
```
