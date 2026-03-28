---
name: deploy-verify
description: 'Post-Deployment Healthcheck aller MOe-Services mit automatischer Statusauswertung und Rollback-Empfehlung'
argument-hint: '[staging|production|local]'
allowed-tools:
  - Bash
  - Read
  - Grep
  - WebFetch
---

# Deploy Verify — Post-Deployment Healthcheck

## Zweck

Fuehrt nach einem Deployment systematische Healthchecks aller Services durch und gibt eine klare Go/NoGo-Empfehlung.

## Ablauf

### 1. Environment bestimmen

- `local`: Localhost-Ports (5173, 8001, 8000, 3000)
- `staging`: Staging-Subdomains auf Plesk
- `production`: Production-Domains auf Plesk

### 2. Healthcheck-Matrix

#### Lokal

```bash
# API (FastAPI)
curl -sf http://localhost:8001/health && echo "API: OK" || echo "API: FAIL"

# Frontend (Vite)
curl -sf http://localhost:5173/ | head -1 && echo "Frontend: OK" || echo "Frontend: FAIL"

# CRM (Drupal)
curl -sf http://localhost:8000/ | head -1 && echo "CRM: OK" || echo "CRM: FAIL"

# n8n
curl -sf http://localhost:5678/healthz && echo "n8n: OK" || echo "n8n: FAIL"
```

#### Production

```bash
# API
curl -sf https://api.menschlichkeit-oesterreich.at/health

# Frontend
curl -sf https://www.menschlichkeit-oesterreich.at/ | head -1

# CRM
curl -sf https://crm.menschlichkeit-oesterreich.at/ | head -1
```

### 3. Ergebnis-Auswertung

| Status | Bedingung                                                  | Aktion                 |
| ------ | ---------------------------------------------------------- | ---------------------- |
| GRUEN  | Alle Services antworten mit 2xx                            | Deployment erfolgreich |
| GELB   | 1 nicht-kritischer Service (Games, Prisma) antwortet nicht | Warnung, kein Rollback |
| ROT    | API, Frontend oder CRM antwortet nicht                     | Rollback empfehlen     |

### 4. Bei ROT: Rollback-Vorschlag

1. Letztes Deployment-Artefakt identifizieren (rsync snapshot)
2. Rollback-Befehl vorschlagen: `bash scripts/plesk-sync.sh pull`
3. **Bestaetigung einholen** vor Rollback-Ausfuehrung
4. Nach Rollback: Healthchecks erneut durchfuehren

### 5. n8n Notification

Bei Abschluss (Erfolg oder Failure): n8n `plesk-deployment-notifications` Workflow triggern via Webhook.

## Output-Format

```
═══════════════════════════════════════
  MOe Deploy Verify — [environment]
═══════════════════════════════════════
  API (8001)      ✅ 200 OK  (142ms)
  Frontend (5173) ✅ 200 OK  (89ms)
  CRM (8000)      ✅ 200 OK  (231ms)
  n8n (5678)      ✅ 200 OK  (67ms)
───────────────────────────────────────
  Status: GRUEN — Deployment erfolgreich
═══════════════════════════════════════
```
