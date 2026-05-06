---
name: deploy-checklist
description: Pre-Deployment Checkliste — prüft Env-Vars, Migrations, Security, Quality Gates vor dem Deploy
---

# Deploy Checklist

Führe diese Checkliste vor jedem Deployment aus. Zielumgebung wird als Argument übergeben.

## Verwendung

```
/deploy-checklist staging
/deploy-checklist production
```

## Prüfschritte

### 1. Git-Status

```bash
git status
git log --oneline -5
```

- [ ] Keine uncommitted Changes
- [ ] Auf korrektem Branch (`develop` für staging, `main` für production)
- [ ] Branch ist up-to-date mit Remote

### 2. Umgebungsvariablen

Prüfe ob alle erforderlichen Variablen gesetzt sind:

```bash
# Root .env
grep -c "^[A-Z]" .env

# API .env
grep -c "^[A-Z]" apps/api/.env

# Frontend .env
grep -c "^VITE_" apps/website/.env
```

**Kritische Variablen für Production:**

- `DATABASE_URL` — PostgreSQL Verbindung
- `JWT_SECRET_KEY` — JWT Signing Key (mind. 32 Zeichen)
- `STRIPE_SECRET_KEY` — Zahlungsverarbeitung
- `CIVICRM_API_KEY` — CRM-Integration
- `EMAIL_*` — Mindestens EMAIL_KONTAKT und EMAIL_OFFICE

### 3. Datenbank-Migrations

```bash
# Alembic (API Finance-Schema)
cd apps/api && alembic current
cd apps/api && alembic history --verbose | head -20

# Prisma (Games)
npx prisma migrate status
```

- [ ] Alle Migrations angewandt
- [ ] Keine pending Migrations

### 4. Security Scan

```bash
npm run security:scan
```

- [ ] Trivy: Keine CRITICAL/HIGH Findings
- [ ] Bandit: Keine HIGH Findings
- [ ] Gitleaks: Keine Secrets im Code

### 5. Quality Gates

```bash
npm run quality:gates
```

- [ ] Codacy: Keine neuen Issues
- [ ] Lighthouse: Performance Score ≥ 80
- [ ] DSGVO-Check: Bestanden

### 6. Tests

```bash
npm run test:unit
cd apps/api && pytest tests/
```

- [ ] Unit-Tests: Alle bestanden
- [ ] API-Tests: Alle bestanden
- [ ] PII-Sanitizer-Tests: Bestanden

### 7. OpenAPI Spec

```bash
diff apps/api/openapi.yaml <(python -c "from app.main import app; import json; print(json.dumps(app.openapi(), indent=2))")
```

- [ ] OpenAPI-Spec aktuell (keine Drift)

### 8. Build

```bash
npm run build:all
```

- [ ] Frontend baut erfolgreich
- [ ] Keine TypeScript-Fehler
- [ ] Keine ESLint-Fehler

### 9. Finale Prüfung

- [ ] CHANGELOG aktualisiert (für production)
- [ ] Version-Bump durchgeführt (für production)
- [ ] Team benachrichtigt

## Nach dem Deploy

```bash
# Staging
curl -s https://staging.menschlichkeit-oesterreich.at/api/health | jq .

# Production
curl -s https://menschlichkeit-oesterreich.at/api/health | jq .
```
