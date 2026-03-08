# Deployment – Menschlichkeit Österreich

**Stand**: 2026-03-08 | Hosting: Plesk auf `5.183.217.146:8443`

---

## Umgebungen

| Umgebung | Branch | URL | Deploy-Trigger |
|----------|--------|-----|----------------|
| Staging | `main` | `staging.menschlichkeit-oesterreich.at` | Automatisch bei Push |
| Production | `main` (nach Gate) | `menschlichkeit-oesterreich.at` | Manuell oder automatisch |

---

## 1. Standard-Deploy-Pipeline

### Ablauf (automatisch via GitHub Actions)

```
Push auf main
  → quality.yml      (ESLint, Type-Check)
  → security.yml     (Trivy, Snyk)
  → ci.yml           (Tests, Build)
  → deploy-staging.yml   (rsync → Plesk Staging)
  → [manuelle Freigabe]
  → deploy-plesk.yml     (rsync → Plesk Production)
```

### Manueller Deploy

```bash
# Staging
./build-pipeline.sh staging

# Production (nach expliziter Freigabe)
./build-pipeline.sh production

# Dry-Run (keine Änderungen)
./scripts/safe-deploy.sh --dry-run

# Multi-Service
./deployment-scripts/multi-service-deploy.sh
```

---

## 2. Plesk-Deployment (SSH/rsync)

### Voraussetzungen

- SSH-Zugang zum Plesk-Server (Key in GitHub Secret `DEPLOY_KEY`)
- Plesk-Admin-Zugang: `https://5.183.217.146:8443`

### Ablauf (deploy-plesk.yml)

```yaml
# Vereinfachte Darstellung des Deploy-Flows:
rsync -avz --delete ./build/ user@server:/var/www/vhosts/menschlichkeit-oesterreich.at/httpdocs/
```

### Service-spezifische Deploy-Pfade

| Service | Plesk-Pfad | Deploy-Script |
|---------|-----------|---------------|
| Frontend | `/httpdocs/` | `scripts/deploy-frontend.ps1` |
| API | `/api.menschlichkeit-oesterreich.at/` | `scripts/deploy-api.ps1` |
| CRM | `/crm.menschlichkeit-oesterreich.at/` | `scripts/deploy-crm.ps1` |

---

## 3. Build-Kommandos

```bash
# Frontend
npm run build:frontend
# Output: frontend/dist/

# API (nur Packaging, kein Build-Schritt)
npm run build:api

# Alle
npm run build:all
```

---

## 4. Post-Deploy-Checks

```bash
# Health-Check nach Deploy
npm run status:check

# Lighthouse Performance-Check
npm run performance:lighthouse

# DSGVO-Compliance-Check
npm run compliance:dsgvo
```

---

## 5. Rollback

```bash
# Rollback auf letzten stabilen Stand
npm run deploy:rollback

# n8n-spezifischer Rollback
bash automation/n8n/rollback-to-http.sh
```

**Manueller Rollback (Plesk):**
1. Plesk → Hosting → Backup Manager
2. Letztes stabiles Backup auswählen
3. Restore starten

---

## 6. Deployment-Secrets (GitHub Actions)

| Secret | Verwendung | Rotation |
|--------|-----------|----------|
| `DEPLOY_KEY` | SSH-Key für rsync | 180 Tage |
| `STAGING_REMOTE_HOST` | Staging-Server-IP | Bei Änderung |
| `STAGING_REMOTE_USER` | SSH-User | Bei Änderung |
| `PRODUCTION_REMOTE_HOST` | Prod-Server-IP | Bei Änderung |
| `CODACY_PROJECT_TOKEN` | Code-Quality-Gate | 90 Tage |

Secrets verwalten: GitHub → Settings → Secrets and variables → Actions

---

## 7. n8n-Deployment (Docker)

```bash
# Standard (HTTP)
npm run n8n:start
# Mit HTTPS (Caddy)
bash automation/n8n/deploy-https.sh
# Stop
npm run n8n:stop
# Logs
npm run n8n:logs
```

---

## 8. Voraussetzungen für PR-Merge (Quality Gates)

PRs auf `main` werden nur gemergt, wenn:
- [ ] ESLint: 0 Errors, max 0 Warnings
- [ ] Security Scan: 0 Critical/High Issues (Codacy)
- [ ] Tests: alle bestanden
- [ ] Lighthouse: Performance ≥90, A11y ≥90, SEO ≥90
- [ ] DSGVO-Check: bestanden
- [ ] Gitleaks: keine neuen Secrets

---

## 9. Infrastruktur-Wartung (Plesk)

**Plesk-Zugriff:** Nur über HTTPS (`https://5.183.217.146:8443`), nicht über HTTP.

**TLS-Zertifikate prüfen:**
- Plesk → Domains → SSL/TLS → Let's Encrypt
- Auto-Renewal muss aktiviert sein

**PHP-Version (CRM):** PHP 8.1+ unter Plesk → PHP-Einstellungen

**Firewall:** Plesk → Tools & Settings → Firewall
- Port 8443 nur für Maintainer öffnen (IP-Allowlist empfohlen)

---

*Verwandt: [Runbook Service-Neustart](../../runbooks/service-restart.md) | [Incident Response](incident-response.md) | [Monitoring](monitoring.md)*
