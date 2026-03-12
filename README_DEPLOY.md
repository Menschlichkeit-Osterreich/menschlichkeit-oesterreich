# Deployment-Anleitung – Menschlichkeit Österreich

## Voraussetzungen

- Node.js >= 18
- Python >= 3.11
- SSH-Zugang zum Plesk-Server
- Umgebungsvariablen konfiguriert (siehe `.env.example`)

## Umgebungsvariablen

Siehe `scripts/validate_env.sh` für alle benötigten Variablen.

### Kritische Variablen

| Variable | Beschreibung |
|----------|-------------|
| `PLSK_HOST` | Plesk-Server-IP oder Hostname |
| `PLSK_USER` | SSH-Benutzername |
| `PLSK_SSH_KEY` | SSH Private Key (Inhalt) |
| `PLSK_DEPLOY_PATH` | Zielpfad Frontend |
| `JWT_SECRET_KEY` | JWT-Signierungsschlüssel |
| `DATABASE_URL` | PostgreSQL Connection String |
| `ADMIN_EMAILS` | Komma-getrennte Admin-E-Mails |

## Frontend-Build

```bash
cd apps/website
npm ci
npm run build
```

Output: `apps/website/dist/`

## API starten

```bash
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Deployment ausführen

```bash
# Vollständiges Deployment (Frontend + API)
./scripts/deploy.sh

# Nur Frontend
SERVICE=frontend ./scripts/deploy.sh

# Dry-Run (kein Schreiben)
DRY_RUN=true ./scripts/deploy.sh
```

## Validierung

```bash
# Umgebungsvariablen prüfen
./scripts/validate_env.sh

# Post-Deploy-Verifizierung
./scripts/post_deploy_verify.sh
```

## Health-Checks

| Endpunkt | Beschreibung |
|----------|-------------|
| `GET /healthz` | Liveness-Check |
| `GET /readyz` | Readiness-Check (inkl. DB) |
| `GET /api/version` | API-Version und Features |

## Rollback

Bei fehlerhaftem Deployment:
1. Git-Tag des letzten stabilen Releases identifizieren
2. `git checkout <tag>`
3. Erneut deployen

## Monitoring

- Uptime Kuma: `docker compose -f docker-compose.monitoring.yml up -d uptime-kuma`
- API-Logs: Structured Logging via `menschlichkeit.api` Logger
- Audit-Trail: PostgreSQL `audit_trail` Tabelle
