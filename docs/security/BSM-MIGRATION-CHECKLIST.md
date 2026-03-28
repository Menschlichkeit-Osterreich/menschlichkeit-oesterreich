# Bitwarden Secrets Manager — Migrations-Checkliste

**Stand:** 2026-03-25
**Ziel:** Alle CI/CD-Secrets von GitHub Secrets auf Bitwarden SM (EU-Vault) migrieren

---

## Voraussetzungen

- [ ] Bitwarden SM Organisation aufgesetzt (`peschull`)
- [ ] BSM-Projekte erstellt: `moe-development`, `moe-staging`, `moe-production`
- [ ] Service Account `sa-cicd` mit Zugriff auf alle drei Projekte
- [ ] Access Token für `sa-cicd` generiert
- [ ] `BW_ACCESS_TOKEN` als GitHub Repository Secret gespeichert
- [ ] Reusable Workflow `.github/workflows/reusable-bsm-secrets.yml` committed

---

## Phase 1: UUID-Mapping erstellen

Für jedes Secret in Bitwarden SM:

1. Vault öffnen: https://vault.bitwarden.eu
2. Secrets Manager → Secrets navigieren
3. UUID des Secrets kopieren (Spalte "ID" oder Detail-Ansicht)
4. UUID in `.github/bsm-secret-ids.json` eintragen
5. GitHub Repository Variable erstellen:
   - Settings → Secrets and variables → Actions → Variables → New variable
   - Name: `BSM_<PREFIX>_<NAME>` (z.B. `BSM_INFRA_PLESK_HOST`)
   - Wert: Die kopierte UUID

### Deploy Production Secrets

| BSM-Key                 | GitHub Variable             | UUID         | Status |
| ----------------------- | --------------------------- | ------------ | ------ |
| `infra/SSH_PRIVATE_KEY` | `BSM_INFRA_SSH_PRIVATE_KEY` | **\_\_\_\_** | ⬜     |
| `infra/SSH_KNOWN_HOSTS` | `BSM_INFRA_SSH_KNOWN_HOSTS` | **\_\_\_\_** | ⬜     |
| `infra/PLESK_HOST`      | `BSM_INFRA_PLESK_HOST`      | **\_\_\_\_** | ⬜     |
| `infra/PLESK_USER`      | `BSM_INFRA_PLESK_USER`      | **\_\_\_\_** | ⬜     |
| `infra/PLESK_PORT`      | `BSM_INFRA_PLESK_PORT`      | **\_\_\_\_** | ⬜     |
| `api/DATABASE_URL`      | `BSM_API_DATABASE_URL`      | **\_\_\_\_** | ⬜     |
| `api/MOE_API_TOKEN`     | `BSM_API_MOE_API_TOKEN`     | **\_\_\_\_** | ⬜     |

### Deploy Staging Secrets

| BSM-Key                   | GitHub Variable               | UUID         | Status |
| ------------------------- | ----------------------------- | ------------ | ------ |
| `staging/SSH_PRIVATE_KEY` | `BSM_STAGING_SSH_PRIVATE_KEY` | **\_\_\_\_** | ⬜     |
| `staging/SSH_KNOWN_HOSTS` | `BSM_STAGING_SSH_KNOWN_HOSTS` | **\_\_\_\_** | ⬜     |
| `staging/REMOTE_HOST`     | `BSM_STAGING_REMOTE_HOST`     | **\_\_\_\_** | ⬜     |
| `staging/REMOTE_USER`     | `BSM_STAGING_REMOTE_USER`     | **\_\_\_\_** | ⬜     |
| `staging/REMOTE_PORT`     | `BSM_STAGING_REMOTE_PORT`     | **\_\_\_\_** | ⬜     |

### API Test Secrets

| BSM-Key                  | GitHub Variable              | UUID         | Status |
| ------------------------ | ---------------------------- | ------------ | ------ |
| `api/CIVICRM_SITE_KEY`   | `BSM_API_CIVICRM_SITE_KEY`   | **\_\_\_\_** | ⬜     |
| `api/CIVICRM_API_KEY`    | `BSM_API_CIVICRM_API_KEY`    | **\_\_\_\_** | ⬜     |
| `api/JWT_SECRET_KEY`     | `BSM_API_JWT_SECRET_KEY`     | **\_\_\_\_** | ⬜     |
| `api/N8N_WEBHOOK_SECRET` | `BSM_API_N8N_WEBHOOK_SECRET` | **\_\_\_\_** | ⬜     |

### n8n Automation Secrets

| BSM-Key                  | GitHub Variable          | UUID         | Status |
| ------------------------ | ------------------------ | ------------ | ------ |
| `n8n/N8N_ENCRYPTION_KEY` | `BSM_N8N_ENCRYPTION_KEY` | **\_\_\_\_** | ⬜     |
| `n8n/N8N_DB_PASSWORD`    | `BSM_N8N_DB_PASSWORD`    | **\_\_\_\_** | ⬜     |
| `n8n/N8N_PASSWORD`       | `BSM_N8N_PASSWORD`       | **\_\_\_\_** | ⬜     |
| `n8n/REDIS_PASSWORD`     | `BSM_N8N_REDIS_PASSWORD` | **\_\_\_\_** | ⬜     |

### OpenClaw Secrets

| BSM-Key                      | GitHub Variable         | UUID         | Status |
| ---------------------------- | ----------------------- | ------------ | ------ |
| `openclaw/OC_OPENAI_API_KEY` | `BSM_OC_OPENAI_API_KEY` | **\_\_\_\_** | ⬜     |
| `openclaw/OC_GITHUB_TOKEN`   | `BSM_OC_GITHUB_TOKEN`   | **\_\_\_\_** | ⬜     |
| `openclaw/OC_PG_DSN`         | `BSM_OC_PG_DSN`         | **\_\_\_\_** | ⬜     |
| `openclaw/OC_REDIS_URL`      | `BSM_OC_REDIS_URL`      | **\_\_\_\_** | ⬜     |

### Infrastructure Secrets

| BSM-Key                      | GitHub Variable               | UUID         | Status |
| ---------------------------- | ----------------------------- | ------------ | ------ |
| `infra/POSTGRES_PASSWORD`    | `BSM_INFRA_POSTGRES_PASSWORD` | **\_\_\_\_** | ⬜     |
| `infra/S3_ACCESS_KEY_ID`     | `BSM_INFRA_S3_ACCESS_KEY`     | **\_\_\_\_** | ⬜     |
| `infra/S3_SECRET_ACCESS_KEY` | `BSM_INFRA_S3_SECRET_KEY`     | **\_\_\_\_** | ⬜     |

---

## Phase 2: Workflow-Integration testen

Für jedes BSM-Profil:

### 2.1 deploy-production

- [ ] UUIDs + GitHub Variables angelegt
- [ ] `deploy-plesk.yml` mit `dry_run: true` ausführen
- [ ] BSM-Job-Log prüfen: "BSM-Profil 'deploy-production' erfolgreich geladen"
- [ ] Secrets korrekt als Env-Vars verfügbar

### 2.2 deploy-staging

- [ ] UUIDs + GitHub Variables angelegt
- [ ] `deploy-staging.yml` manuell triggern
- [ ] BSM-Job-Log prüfen

### 2.3 api-tests

- [ ] UUIDs + GitHub Variables angelegt
- [ ] `api-tests.yml` manuell triggern
- [ ] Tests bestehen mit BSM-injizierten Secrets

### 2.4 deploy-forum

- [ ] UUIDs + GitHub Variables angelegt (gleiche Infra-UUIDs wie deploy-production)
- [ ] `deploy-forum.yml` manuell triggern (`workflow_dispatch`)
- [ ] BSM-Job-Log prüfen: "BSM-Profil 'deploy-forum' erfolgreich geladen"
- [ ] Forum-Erreichbarkeit bestätigt nach Deployment

---

## Phase 3: Alte GitHub Secrets entfernen

**WICHTIG:** Erst nach erfolgreicher Verifikation in Phase 2!

- [ ] `PLESK_HOST` → nur entfernen wenn BSM-Production-Profil verifiziert
- [ ] `PLESK_USER` → dto.
- [ ] `PLESK_PORT` → dto.
- [ ] `PLESK_SSH_PRIVATE_KEY` → dto.
- [ ] `PLESK_KNOWN_HOSTS` → dto.
- [ ] `PLESK_SSH_KEY` → nur entfernen wenn BSM-Forum-Profil verifiziert
- [ ] `STAGING_REMOTE_HOST` → dto.
- [ ] `STAGING_REMOTE_USER` → dto.
- [ ] `STAGING_REMOTE_PORT` → dto.
- [ ] `STAGING_DEPLOY_KEY` → dto.
- [ ] `STAGING_KNOWN_HOSTS` → dto.
- [ ] `CIVICRM_SITE_KEY` → dto.
- [ ] `CIVICRM_API_KEY` → dto.
- [ ] `JWT_SECRET` → dto.

**Nicht entfernen:**

- `GH_TOKEN` (PAT — wird weiterhin für Admin-Ops benötigt)
- `BW_ACCESS_TOKEN` (BSM-Zugang selbst)
- `CODACY_API_TOKEN` (Drittanbieter-Integration)
- `SEMGREP_APP_TOKEN` (Drittanbieter-Integration)

---

## Phase 4: Dokumentation aktualisieren

- [ ] `secrets/SECRETS-AUDIT.md` — BSM als primäre Quelle markieren
- [ ] `docs/security/secrets-catalog.md` — BSM-Einträge hinzufügen
- [ ] `.github/instructions/gh-pat-integration.instructions.md` — BSM-Hinweis
- [ ] `docs/security/GITHUB-AUDIT-2026-03.md` — Status aktualisieren

---

## Rollback-Plan

Falls BSM-Integration Probleme verursacht:

1. GitHub Secrets **NICHT** löschen bevor BSM verifiziert ist
2. In Workflows: BSM-Job ist optional (`if: secrets.BW_ACCESS_TOKEN != ''`)
3. Fallback: Workflows funktionieren weiterhin mit GitHub Secrets
4. BSM-Job entfernen = revert des Workflow-Changes

---

**Verantwortlich:** Peter Schuller (peschull)
**Zieldatum:** 2026-04-30 (Phase 1-3)
