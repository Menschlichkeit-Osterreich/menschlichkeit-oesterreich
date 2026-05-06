# Token-Inventar und Secret-Uebergabe

Stand: 2026-04-25
Owner: DevOps + Security
Review-Zyklus: quartalsweise und nach jedem Incident

## Zweck

Dieses Dokument ist das operative Inventar fuer alle wirklich benoetigten Token und tokenaehnlichen Zugangswerte im Projekt.

Es beantwortet fuer jede Klasse verbindlich:

- wofuer der Zugang gebraucht wird
- wer ihn fachlich und technisch verantwortet
- wo die Primaerablage liegt
- ueber welchen Injektionspfad er in Laufzeit oder Workflow gelangt
- welche Minimalrechte gelten
- wie Rotation und Incident-Entzug ablaufen

## Kanonische Grenzen

Es gibt absichtlich nur eine Wahrheit je Ebene:

- `secrets.manifest.json` ist die kanonische Liste der produktiven und laufzeitnahen Secret-Namen fuer BSM-gestuetzte Services.
- Dieses Dokument ist die kanonische Governance-Sicht fuer Token-Klassen, Eigentum, Ablage, Injektion und Rotation.
- GitHub Repository Secrets und Environment Secrets sind Laufzeit-Injektionspunkte, nicht die Primaerdokumentation produktiver Secrets.
- Produktive Secret-Werte werden nicht in Markdown, `.env.example`, Tickets, Chat, SharePoint-Screenshots oder Commit-Historie gepflegt.

## Einsatzregeln

1. Ein Token, ein Zweck.
2. Ein Token, ein fachlicher Owner.
3. Ein produktiver Zugang, eine Primaerablage.
4. Keine Klartext-Uebergabe in Chat, Mail, Ticket oder Shell-History.
5. Keine PAT-Nutzung als Ersatz fuer saubere Workflow- oder System-Secrets.
6. Jede Offenlegung fuehrt zu sofortigem Widerruf, Ersatz und Nachweis.
7. Jede Rollen- oder Geraeteaenderung triggert Review oder Rotation.

## Token-Klassen

| Klasse      | Typ                | Grundregel                                                              |
| ----------- | ------------------ | ----------------------------------------------------------------------- |
| Persoenlich | menschlich         | Nur fuer klar benannte manuelle Admin-Aufgaben; nie fuer Produktivpfade |
| Workflow    | systemnah          | Nur fuer CI/CD und nur entlang eines benannten Workflow-Pfads           |
| Produktiv   | systembezogen      | Primaer in BSM, GitHub nur als Injektionspunkt                          |
| Intern      | maschinell         | Nur fuer Service-zu-Service oder Runtime-Checks; keine Alltagsnutzung   |
| Notfall     | zeitlich befristet | Nur fuer Incident-Behebung mit Ablaufdatum und Widerrufspflicht         |

## Zentrales Inventar

| Token oder Zugang                                | Klasse      | Zweck                                                                                   | Primaerablage                                                           | Injektionspfad                                                    | Fachlicher Owner | Technischer Owner | Minimalrechte                                                                    | Rotation                                                                            | Hinweise                                                                                                               |
| ------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------- | ----------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `GH_TOKEN` (Fine-grained PAT)                    | persoenlich | Nur manuelle GitHub-CLI-, Review- oder Cross-Repo-Admin-Aufgaben einer benannten Person | lokaler Credential Store oder `gh auth login`                           | keine produktive Injektion; nur lokale Shell/CLI                  | benannte Person  | Security          | nur benoetigte Repo-/Org-Rechte; kein Default fuer Deployments                   | bei Rollenwechsel, Geraeteverlust, Offenlegung sofort; sonst spaetestens vor Ablauf | Darf nicht in produktiven Deploy-Pfaden und nicht als generischer Repo-Secret-Standard verwendet werden                |
| `github.token`                                   | workflow    | Kurzlebiger GitHub-Token fuer denselben Workflow im selben Repo                         | GitHub Actions, ephemer                                                 | direkt aus GitHub Actions Context                                 | DevOps           | DevOps            | nur explizit gesetzte Workflow-Permissions                                       | automatisch pro Run                                                                 | Bevorzugt gegenueber PAT fuer Standard-Workflows                                                                       |
| `BW_ACCESS_TOKEN` / `BSM_ACCESS_TOKEN`           | workflow    | Zugriff des Secret-Handoff-Workflows auf Bitwarden Secrets Manager                      | GitHub Environment oder Repo Secret mit dokumentierter Ausnahme         | `.github/workflows/reusable-bsm-secrets.yml` und `bsm-env-inject` | DevOps           | DevOps            | nur Zugriff fuer benoetigtes BSM-Service-Account-/Projekt-Scope                  | 90 Tage oder bei Exposure sofort                                                    | Ausnahme von der BSM-first-Regel, weil dieses Secret den Zugriff auf die Primaerquelle selbst ermoeglicht              |
| `PLESK_SSH_PRIVATE_KEY`                          | workflow    | Deployment-Zugang zu Plesk                                                              | GitHub Environment Secret fuer Deployment                               | `deploy-plesk.yml` SSH-Agent                                      | DevOps           | DevOps            | nur Deployment-Host, nur benoetigter Benutzer, kein interaktiver Mehrzweckzugang | 180 Tage oder bei Host-/Rollenwechsel sofort                                        | tokenaehnlicher Zugang, gleich streng wie Secret behandeln                                                             |
| `PLESK_KNOWN_HOSTS`                              | workflow    | Host-Pinning fuer Deployment                                                            | GitHub Environment Secret                                               | `deploy-plesk.yml` SSH-Setup                                      | DevOps           | DevOps            | nur verifizierte Hostkeys                                                        | bei Hostkey-Aenderung                                                               | kein Secret im engeren Sinn, aber sicherheitskritischer Vertrauensanker                                                |
| `ALERTS_SLACK_WEBHOOK`                           | produktiv   | Versand betrieblicher Alerts an Slack                                                   | Bitwarden Secrets Manager                                               | BSM Handoff in API-Runtime und Deploy-Workflow                    | Operations       | DevOps            | nur Webhook fuer den benoetigten Channel                                         | 180 Tage oder bei Exposure sofort                                                   | nie parallel in mehreren `.env`-Dateien pflegen                                                                        |
| `MICROSOFT_CLIENT_SECRET`                        | produktiv   | OAuth-Client-Secret fuer Graph/M365-Integration                                         | Bitwarden Secrets Manager                                               | BSM Handoff in API-Runtime                                        | Operations       | DevOps            | nur benoetigte App-Registration-Rechte                                           | 180 Tage oder nach App-/Owner-Wechsel                                               | gehoert logisch zu `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_GRAPH_SENDER`; nur das Secret ist sensitiv |
| `STRIPE_SECRET_KEY`                              | produktiv   | serverseitige Stripe-API-Zugriffe                                                       | Bitwarden Secrets Manager                                               | BSM Handoff in API-Runtime                                        | Finance          | DevOps            | nur benoetigter Stripe-Account und Modus                                         | 90 Tage oder bei Exposure sofort                                                    | produktiv und test klar getrennt halten                                                                                |
| `STRIPE_WEBHOOK_SECRET`                          | produktiv   | Signaturpruefung eingehender Stripe-Events                                              | Bitwarden Secrets Manager                                               | BSM Handoff in API-Runtime                                        | Finance          | DevOps            | nur Signaturpruefung des benoetigten Endpunkts                                   | 90 Tage oder nach Endpoint-Neuerzeugung                                             | nie gemeinsam mit API-Key als Freitext dokumentieren                                                                   |
| `CIVICRM_API_KEY`                                | produktiv   | API-Zugriff auf CRM-Funktionen                                                          | Bitwarden Secrets Manager                                               | BSM Handoff in API/CRM-Runtime                                    | CRM              | DevOps            | nur benoetigter API-Scope                                                        | 180 Tage oder bei Owner-Wechsel                                                     | wegen PII-Bezug als hochkritisch behandeln                                                                             |
| `CIVICRM_SITE_KEY`                               | produktiv   | CiviCRM-Sicherheits- und Laufzeitkopplung                                               | Bitwarden Secrets Manager                                               | BSM Handoff in API/CRM-Runtime                                    | CRM              | DevOps            | nur interner CiviCRM-Use-Case                                                    | 180 Tage                                                                            | nie in Doku oder Support-Tickets wiederholen                                                                           |
| `MOE_API_TOKEN`                                  | intern      | interner Maschinenzugriff auf geschuetzte API-Routen und Runtime-Checks                 | Bitwarden Secrets Manager                                               | BSM Handoff in API und angebundene Automationen                   | API Owner        | DevOps            | nur interner Scope, keine Admin-Generalrechte                                    | 180 Tage oder bei Exposure sofort                                                   | nicht fuer menschliche Alltagsnutzung wiederverwenden                                                                  |
| `N8N_API_KEY` / `INTERNAL_API_TOKEN`             | intern      | Fallback- oder Altpfade fuer interne Maschinenautorisierung                             | Bitwarden Secrets Manager, nur wenn wirklich aktiv benoetigt            | BSM Handoff in API/n8n                                            | Automation       | DevOps            | nur interner Scope                                                               | 180 Tage; bei Abschaltung aus Inventar entfernen                                    | keine parallele Dauerpflege ohne dokumentierte Begruendung                                                             |
| `N8N_WEBHOOK_SECRET`                             | intern      | Signaturpruefung und Absicherung interner Webhook-Pfade                                 | Bitwarden Secrets Manager                                               | BSM Handoff in API/n8n                                            | Automation       | DevOps            | nur benoetigte Webhook-Signatur                                                  | 180 Tage oder bei Exposure sofort                                                   | kein Ersatz fuer generische Service-Tokens                                                                             |
| `FIGMA_ACCESS_TOKEN`                             | workflow    | Design-Sync und Token-Automation                                                        | GitHub Organization Secret oder lokaler Owner-Store fuer manuelle Syncs | Figma-bezogene Workflows oder lokale Design-Aufgaben              | Design           | DevOps            | nur Zugriff auf benoetigte Figma-Ressourcen                                      | 180 Tage                                                                            | nicht fuer allgemeine Entwickler-CLI wiederverwenden                                                                   |
| `CODACY_API_TOKEN`                               | workflow    | Code-Quality-Integration                                                                | GitHub Organization Secret                                              | Security-/Quality-Workflows                                       | QA               | DevOps            | nur benoetigte Repository-/Org-Scopes                                            | 90 Tage                                                                             | optional, aber falls aktiv dokumentationspflichtig                                                                     |
| `SEMGREP_APP_TOKEN`, `SNYK_TOKEN`, `SONAR_TOKEN` | workflow    | Security- und Qualitaetsscans                                                           | GitHub Organization Secret                                              | jeweilige Scan-Workflows                                          | QA/Security      | DevOps            | nur benoetigte Scanner-Rechte                                                    | 90 Tage                                                                             | nur aktiv halten, wenn der jeweilige Scanner wirklich genutzt wird                                                     |
| Temporaere Incident-Tokens                       | notfall     | eng begrenzte Incident-Behebung                                                         | kontrollierte Sonderablage mit Ablaufdatum                              | nur benannter Incident-Workflow oder manuelle Notmassnahme        | Incident Lead    | Security          | exakt benoetigte Rechte, harte Laufzeitbegrenzung                                | sofort nach Incident-Ende widerrufen                                                | duerfen nie zu Dauerzugang werden                                                                                      |

## Verbindliche Einsatzregeln je Klasse

### Persoenliche Tokens

- nur fuer benannte Menschen
- nur lokal im Credential Store oder ueber `gh auth login`
- nie in `GitHub Actions`, produktiven `.env`-Dateien oder Deploy-Handoff als Standardpfad

### Workflow-Secrets

- nur fuer klar benannte CI/CD-Aufgaben
- GitHub Environment Secrets vor Repo Secrets bevorzugen
- primaere technische Doku bleibt hier, primaere Wertablage fuer Produktivsecrets bleibt BSM

### Produktive Integrations-Tokens

- BSM ist die Quelle der Wahrheit
- GitHub dient nur als kontrollierter Injektionspunkt, wenn BSM nicht direkt in die Runtime sprechen kann
- keine manuelle Parallelpflege in mehreren Laufzeitdateien

### Interne Service-Tokens

- nur fuer Maschinen-zu-Maschinen-Pfade
- Scope so klein wie moeglich
- nie fuer menschliche Admin-Aufgaben oder Support-Zugriffe recyceln

### Notfall-Tokens

- nur mit Ticket-/Incident-Bezug
- mit Ersteller, Grund, Ablaufdatum und Widerrufszeitpunkt dokumentieren
- nach Ende des Incidents entfernen oder widerrufen

## Pflichtfelder pro Eintrag

Jeder neue oder geaenderte Token-Eintrag braucht mindestens:

- exakten Einsatzzweck
- fachlichen und technischen Owner
- Primaerablage
- Injektionspfad
- Minimalrechte
- Rotationsanlass und Intervall
- Incident-Entzugspfad

## Austritts- und Incident-Regel

Folgende Ausloeser machen Review oder Rotation verpflichtend:

- Rollenwechsel oder Ausscheiden eines Owners
- Geraeteverlust
- Log-, Chat-, Ticket- oder Repo-Offenlegung
- Wechsel von Host, App-Registration, Webhook-Endpoint oder Drittanbieter-Konto

Siehe dazu auch:

- [docs/security/secrets-policy.md](docs/security/secrets-policy.md)
- [docs/security/GH-TOKEN-USAGE.md](docs/security/GH-TOKEN-USAGE.md)
- [docs/security/incidents/2026-03-secret-exposure-response.md](docs/security/incidents/2026-03-secret-exposure-response.md)
- [runbooks/token-uebergabe-template.md](runbooks/token-uebergabe-template.md)
- [docs/security/missing-secrets-template.md](docs/security/missing-secrets-template.md)
  gh secret set FIGMA_ACCESS_TOKEN --org peschull \
   --repos menschlichkeit-oesterreich \
   --body "$(cat ~/.figma-token)"

echo "✅ Secrets bootstrapped successfully"

````

### PowerShell (Windows)

**File**: `scripts/secrets-bootstrap.ps1`

```powershell
# Bootstrap secrets via GitHub CLI (Windows)

# Repository Secrets
gh secret set SSH_PRIVATE_KEY --body (Get-Content ~/.ssh/id_ed25519 -Raw)
gh secret set SSH_HOST --body "dmpl20230054@5.183.217.146"

# Generate Random Secrets
$JwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
gh secret set JWT_SECRET --body $JwtSecret

$N8nKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
gh secret set N8N_ENCRYPTION_KEY --body $N8nKey

Write-Host "✅ Secrets bootstrapped successfully" -ForegroundColor Green
````

---

## 📝 .env.example Templates

### API Service

**File**: `api.menschlichkeit-oesterreich.at/.env.example`

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379

# Application
JWT_SECRET=your-32-char-secret-here
API_BASE_URL=http://localhost:8001

# CiviCRM Integration
CIVICRM_API_URL=https://crm.menschlichkeit-oesterreich.at/civicrm/ajax/api4
CIVICRM_API_KEY=your-civicrm-api-key
CIVICRM_SITE_KEY=your-civicrm-site-key

# Monitoring (Optional)
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info
```

### CRM Service

**File**: `crm.menschlichkeit-oesterreich.at/.env.example`

```bash
# Database (Drupal + CiviCRM)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mo_crm
DB_USER=svc_crm
DB_PASSWORD=your-db-password

# CiviCRM
CIVICRM_SITE_KEY=your-32-char-site-key
CIVICRM_UF_DSN=mysql://user:pass@localhost/mo_crm

# Drupal
DRUPAL_HASH_SALT=your-hash-salt

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

### Frontend

**File**: `frontend/.env.example`

```bash
# API
VITE_API_BASE_URL=http://localhost:8001
VITE_CRM_BASE_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_ANALYTICS=false

# Figma (Dev only)
VITE_FIGMA_FILE_ID=your-figma-file-id
```

### n8n Automation

**File**: `automation/n8n/.env.example`

```bash
# Database
DB_TYPE=mariadb
DB_MYSQLDB_HOST=localhost
DB_MYSQLDB_PORT=3306
DB_MYSQLDB_DATABASE=mo_n8n
DB_MYSQLDB_USER=svc_n8n
DB_MYSQLDB_PASSWORD=your-db-password

# Encryption
N8N_ENCRYPTION_KEY=your-32-char-encryption-key

# Authentication
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password

# External Access
WEBHOOK_URL=https://n8n.menschlichkeit-oesterreich.at
```

---

## 🔗 Weiterführende Dokumentation

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [GitHub Push Protection](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations)
- [OIDC with GitHub Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Gitleaks Configuration](https://github.com/gitleaks/gitleaks#configuration)

---

**Verantwortlich**: DevOps Team
**Review**: Quartalsweise + bei Secret-Änderungen
**Kontakt**: security@menschlichkeit-oesterreich.at
