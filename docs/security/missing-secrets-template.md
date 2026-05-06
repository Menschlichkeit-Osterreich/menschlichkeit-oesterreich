# Missing-Secrets-Template

Stand: 2026-04-25
Quelle der Wahrheit: [secrets.manifest.json](../../secrets.manifest.json)

## Zweck

Dieses Template wird verwendet, wenn bei Onboarding, Deployment, Incident oder Secret-Review unklar ist, welche benoetigten Secrets noch fehlen.

Es dokumentiert keine Secret-Werte, sondern nur:

- betroffenen Secret-Namen
- Environment und Service
- Soll-Ablage
- Injektionspfad
- aktuellen Status
- benoetigte Massnahme

## Einsatzregeln

1. Keine Secret-Werte eintragen.
2. Status nur mit `vorhanden`, `fehlt`, `deprecated`, `in-pruefung` markieren.
3. Produktive Secrets werden in Bitwarden Secrets Manager gepflegt.
4. GitHub Secrets sind nur Injektionspunkte oder dokumentierte Ausnahmen.
5. Deprecated-Aliasse nur solange fuehren, bis der Konsolidierungsnachweis abgeschlossen ist.

## Kopiervorlage fuer einzelne Reviews

```md
# Missing-Secrets-Review

- Anlass:
- Datum:
- Reviewer:
- Environment:
- Betroffener Workflow oder Service:

| Secret         | Klasse    | Service | Environment | Primaerablage             | Injektionspfad           | Status | Owner  | Naechste Massnahme                |
| -------------- | --------- | ------- | ----------- | ------------------------- | ------------------------ | ------ | ------ | --------------------------------- |
| EXAMPLE_SECRET | produktiv | api     | production  | Bitwarden Secrets Manager | reusable-bsm-secrets.yml | fehlt  | DevOps | in BSM anlegen und Handoff testen |
```

## Basis-Set aus dem aktuellen Manifest

### API und Integrationen

| Secret                                | Klasse    | Service  | Environments                     | Primaerablage             | Injektionspfad             | Status | Owner               | Naechste Massnahme |
| ------------------------------------- | --------- | -------- | -------------------------------- | ------------------------- | -------------------------- | ------ | ------------------- | ------------------ |
| DATABASE_URL                          | produktiv | api      | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API-Runtime |        | API + DevOps        |                    |
| JWT_SECRET_KEY                        | produktiv | api      | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API-Runtime |        | API + DevOps        |                    |
| MOE_API_TOKEN                         | intern    | api, n8n | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API/n8n     |        | API + DevOps        |                    |
| N8N_WEBHOOK_SECRET                    | intern    | api, n8n | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API/n8n     |        | Automation + DevOps |                    |
| CIVICRM_SITE_KEY                      | produktiv | api, crm | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API/CRM     |        | CRM + DevOps        |                    |
| CIVICRM_API_KEY                       | produktiv | api, crm | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API/CRM     |        | CRM + DevOps        |                    |
| ALERTS_SLACK_WEBHOOK                  | produktiv | api      | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API/Deploy  |        | Operations + DevOps |                    |
| MICROSOFT_TENANT_ID                   | produktiv | api      | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API-Runtime |        | Operations + DevOps |                    |
| MICROSOFT_CLIENT_ID                   | produktiv | api      | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API-Runtime |        | Operations + DevOps |                    |
| MICROSOFT_CLIENT_SECRET               | produktiv | api      | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API-Runtime |        | Operations + DevOps |                    |
| MICROSOFT_GRAPH_SENDER                | produktiv | api      | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API-Runtime |        | Operations + DevOps |                    |
| STRIPE_SECRET_KEY                     | produktiv | api      | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API-Runtime |        | Finance + DevOps    |                    |
| STRIPE_WEBHOOK_SECRET                 | produktiv | api      | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in API-Runtime |        | Finance + DevOps    |                    |
| APPLICATIONINSIGHTS_CONNECTION_STRING | produktiv | api, n8n | development, staging, production | Bitwarden Secrets Manager | BSM Handoff in Runtime     |        | DevOps              |                    |
| SEPA_CREDITOR_IBAN                    | produktiv | api      | production                       | Bitwarden Secrets Manager | BSM Handoff in API-Runtime |        | Finance + DevOps    |                    |
| SEPA_CREDITOR_ID                      | produktiv | api      | production                       | Bitwarden Secrets Manager | BSM Handoff in API-Runtime |        | Finance + DevOps    |                    |
| SEPA_CREDITOR_BIC                     | produktiv | api      | production                       | Bitwarden Secrets Manager | BSM Handoff in API-Runtime |        | Finance + DevOps    |                    |

### Website und oeffentliche Build-Werte

| Secret                      | Klasse   | Service | Environments                     | Primaerablage                                                   | Injektionspfad | Status | Owner              | Naechste Massnahme                                                                    |
| --------------------------- | -------- | ------- | -------------------------------- | --------------------------------------------------------------- | -------------- | ------ | ------------------ | ------------------------------------------------------------------------------------- |
| VITE_STRIPE_PUBLISHABLE_KEY | workflow | website | development, staging, production | Bitwarden Secrets Manager oder dokumentierter Build-Secret-Pfad | Frontend-Build |        | Finance + Frontend | pruefen, ob als oeffentlicher Publishable Key weiterhin Secret-Handoff gebraucht wird |

### n8n und Automation

| Secret               | Klasse    | Service   | Environments                     | Primaerablage             | Injektionspfad                              | Status | Owner               | Naechste Massnahme                     |
| -------------------- | --------- | --------- | -------------------------------- | ------------------------- | ------------------------------------------- | ------ | ------------------- | -------------------------------------- |
| N8N_ENCRYPTION_KEY   | produktiv | n8n       | development, staging, production | Bitwarden Secrets Manager | n8n Runtime                                 |        | Automation + DevOps | nicht blind rotieren                   |
| N8N_USER             | workflow  | n8n       | development, staging, production | Bitwarden Secrets Manager | n8n Runtime                                 |        | Automation + DevOps |                                        |
| N8N_PASSWORD         | produktiv | n8n       | development, staging, production | Bitwarden Secrets Manager | n8n Runtime                                 |        | Automation + DevOps |                                        |
| N8N_DB_PASSWORD      | produktiv | n8n       | development, staging, production | Bitwarden Secrets Manager | n8n Runtime                                 |        | Automation + DevOps |                                        |
| REDIS_PASSWORD       | produktiv | n8n       | development, staging, production | Bitwarden Secrets Manager | n8n Runtime                                 |        | Automation + DevOps |                                        |
| SLACK_WEBHOOK_URL    | produktiv | n8n       | development, staging, production | Bitwarden Secrets Manager | n8n Runtime                                 |        | Operations + DevOps |                                        |
| SMTP_PASS            | produktiv | n8n       | development, staging, production | Bitwarden Secrets Manager | n8n Runtime                                 |        | Operations + DevOps |                                        |
| INFO_EMAIL_PASS      | produktiv | n8n       | production                       | Bitwarden Secrets Manager | n8n Runtime                                 |        | Operations + DevOps |                                        |
| ADMIN_EMAIL_PASS     | produktiv | n8n       | production                       | Bitwarden Secrets Manager | n8n Runtime                                 |        | Operations + DevOps |                                        |
| CIVIMAIL_EMAIL_PASS  | produktiv | n8n       | production                       | Bitwarden Secrets Manager | n8n Runtime                                 |        | CRM + DevOps        |                                        |
| BOUNCE_EMAIL_PASS    | produktiv | n8n       | production                       | Bitwarden Secrets Manager | n8n Runtime                                 |        | CRM + DevOps        |                                        |
| LOGGING_EMAIL_PASS   | produktiv | n8n       | production                       | Bitwarden Secrets Manager | n8n Runtime                                 |        | DevOps              |                                        |
| CODACY_PROJECT_TOKEN | workflow  | n8n       | production                       | Bitwarden Secrets Manager | n8n Runtime oder Workflow-Handoff           |        | QA + DevOps         | Scope gegen CODACY_API_TOKEN abgrenzen |
| N8N_BASE_URL         | workflow  | n8n, cicd | staging, production              | Bitwarden Secrets Manager | Smoke- und Deploy-Workflows                 |        | Automation + DevOps |                                        |
| N8N_WEBHOOK_URL      | workflow  | n8n, cicd | staging, production              | Bitwarden Secrets Manager | validate-secrets.yml und Benachrichtigungen |        | Automation + DevOps |                                        |

### CI/CD, GitHub und Signierung

| Secret             | Klasse                             | Service | Environments                     | Primaerablage                                         | Injektionspfad                                       | Status | Owner                      | Naechste Massnahme                             |
| ------------------ | ---------------------------------- | ------- | -------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- | ------ | -------------------------- | ---------------------------------------------- |
| BW_ACCESS_TOKEN    | workflow                           | cicd    | staging, production              | dokumentierte GitHub-Secret-Ausnahme fuer BSM-Zugriff | reusable-bsm-secrets.yml                             |        | DevOps                     |                                                |
| GH_TOKEN           | persoenlich oder workflow-ausnahme | cicd    | development, staging, production | lokaler Credential Store oder dokumentierte Ausnahme  | manuelle Admin-Aufgaben oder eng begrenzte Workflows |        | benannte Person + Security | pruefen, ob noch als Repo/Env-Secret benoetigt |
| GH_ADMIN_TOKEN     | workflow-ausnahme                  | cicd    | staging, production              | Bitwarden Secrets Manager                             | branch-protection/secrets-validation                 |        | DevOps + Security          | kanonischen Namen durchsetzen                  |
| ADMIN_GITHUB_TOKEN | deprecated                         | cicd    | staging, production              | Bitwarden Secrets Manager                             | Legacy-Alias                                         |        | DevOps                     | auf GH_ADMIN_TOKEN konsolidieren               |
| REPO_ADMIN_TOKEN   | deprecated                         | cicd    | staging, production              | Bitwarden Secrets Manager                             | Legacy-Alias                                         |        | DevOps                     | auf GH_ADMIN_TOKEN konsolidieren               |
| ADMIN_PAT          | deprecated                         | cicd    | staging, production              | Bitwarden Secrets Manager                             | Legacy-Alias                                         |        | DevOps                     | auf GH_ADMIN_TOKEN konsolidieren               |
| GPG_KEY_ID         | workflow                           | cicd    | development, staging, production | Bitwarden Secrets Manager oder GitHub Secret          | Release-Signing                                      |        | DevOps                     |                                                |
| GPG_PRIVATE_KEY    | workflow                           | cicd    | production                       | Bitwarden Secrets Manager                             | release-sign.yml                                     |        | DevOps + Security          |                                                |
| GPG_PASSPHRASE     | workflow                           | cicd    | production                       | Bitwarden Secrets Manager                             | release-sign.yml                                     |        | DevOps + Security          |                                                |
| SEMGREP_APP_TOKEN  | workflow                           | cicd    | production                       | Bitwarden Secrets Manager                             | semgrep.yml                                          |        | QA/Security                | nur aktiv halten, wenn genutzt                 |
| CODACY_API_TOKEN   | workflow                           | cicd    | production                       | Bitwarden Secrets Manager                             | codacy.yml, validate-secrets.yml                     |        | QA                         |                                                |

### Deployment und Infrastruktur

| Secret                 | Klasse     | Service | Environments | Primaerablage             | Injektionspfad               | Status | Owner      | Naechste Massnahme                      |
| ---------------------- | ---------- | ------- | ------------ | ------------------------- | ---------------------------- | ------ | ---------- | --------------------------------------- |
| PLESK_HOST             | workflow   | cicd    | production   | Bitwarden Secrets Manager | deploy-plesk.yml             |        | DevOps     |                                         |
| PLESK_USER             | workflow   | cicd    | production   | Bitwarden Secrets Manager | deploy-plesk.yml             |        | DevOps     |                                         |
| PLESK_SSH_PRIVATE_KEY  | workflow   | cicd    | production   | Bitwarden Secrets Manager | deploy-plesk.yml             |        | DevOps     |                                         |
| PLESK_SSH_KEY          | deprecated | cicd    | production   | Bitwarden Secrets Manager | forum/db Legacy-Workflow     |        | DevOps     | auf PLESK_SSH_PRIVATE_KEY konsolidieren |
| PLESK_KNOWN_HOSTS      | workflow   | cicd    | production   | Bitwarden Secrets Manager | deploy-plesk.yml             |        | DevOps     |                                         |
| STAGING_REMOTE_HOST    | workflow   | cicd    | staging      | Bitwarden Secrets Manager | deploy-staging.yml           |        | DevOps     |                                         |
| STAGING_REMOTE_USER    | workflow   | cicd    | staging      | Bitwarden Secrets Manager | deploy-staging.yml           |        | DevOps     |                                         |
| STAGING_REMOTE_PORT    | workflow   | cicd    | staging      | Bitwarden Secrets Manager | deploy-staging.yml           |        | DevOps     |                                         |
| STAGING_DEPLOY_KEY     | workflow   | cicd    | staging      | Bitwarden Secrets Manager | deploy-staging.yml           |        | DevOps     |                                         |
| STAGING_DEPLOY_WEBHOOK | workflow   | cicd    | staging      | Bitwarden Secrets Manager | Post-Deploy-Benachrichtigung |        | DevOps     |                                         |
| STAGING_KNOWN_HOSTS    | workflow   | cicd    | staging      | Bitwarden Secrets Manager | deploy-staging.yml           |        | DevOps     |                                         |
| DB_HOST                | workflow   | cicd    | production   | Bitwarden Secrets Manager | db-pull.yml, db-restore.yml  |        | DevOps/DBA |                                         |
| DB_NAME                | workflow   | cicd    | production   | Bitwarden Secrets Manager | db-pull.yml, db-restore.yml  |        | DevOps/DBA |                                         |
| DB_USER                | workflow   | cicd    | production   | Bitwarden Secrets Manager | db-pull.yml, db-restore.yml  |        | DevOps/DBA |                                         |
| DB_PASS                | workflow   | cicd    | production   | Bitwarden Secrets Manager | db-pull.yml, db-restore.yml  |        | DevOps/DBA |                                         |

### Social und Drittintegrationen

| Secret              | Klasse   | Service | Environments | Primaerablage             | Injektionspfad   | Status | Owner                   | Naechste Massnahme |
| ------------------- | -------- | ------- | ------------ | ------------------------- | ---------------- | ------ | ----------------------- | ------------------ |
| BSKY_APP_PASSWORD   | workflow | cicd    | production   | Bitwarden Secrets Manager | social-posts.yml |        | Communications + DevOps |                    |
| BSKY_HANDLE         | workflow | cicd    | production   | Bitwarden Secrets Manager | social-posts.yml |        | Communications          |                    |
| BSKY_SERVICE_URL    | workflow | cicd    | production   | Bitwarden Secrets Manager | social-posts.yml |        | Communications          |                    |
| DISCORD_WEBHOOK_URL | workflow | cicd    | production   | Bitwarden Secrets Manager | social-posts.yml |        | Communications + DevOps |                    |

## Abschlusscheck pro Review

- kein Secret-Wert im Dokument
- produktive Secrets laufen ueber BSM oder dokumentierte Ausnahme
- deprecated Aliasse sind markiert und mit Konsolidierungsschritt versehen
- jeder Eintrag hat Owner und naechste Massnahme
