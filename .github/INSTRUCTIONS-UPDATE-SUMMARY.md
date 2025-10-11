# GitHub Copilot Instructions - Update Summary

**Datum:** 2025-10-07  
**Scope:** .github Verzeichnis - Prompts, Instructions & Chat Modes  
**Ziel:** Vollständige Integration der Plesk SSH & 17-Datenbank-Architektur

---

## 📝 Neue/Aktualisierte Dateien

### 1. Instructions (Regelwerke)

#### ✅ `.github/instructions/plesk-deployment.instructions.md` (NEU)
**Status:** ✅ Erstellt (~600 Zeilen)

**Inhalt:**
- SSH Credentials (dmpl20230054, GitHub Secrets)
- Vollständige Domain-Struktur (1 Main + 22 Subdomains mit Deployment-Pfaden)
- Email-Konfiguration (5 aktive Adressen, Aliases, Forwarding)
- **Database Architecture:**
  - 5 Plesk MariaDB (localhost)
  - 9 External MariaDB ($MYSQL_HOST)
  - 3 External PostgreSQL ($PG_HOST)
  - Redis (optional)
- GitHub Secrets Matrix (50+ dokumentierte Secrets)
- SQL Provisioning Templates (MariaDB + PostgreSQL)
- MCP-integrierter Deployment Workflow (GitHub → PostgreSQL → Filesystem → Playwright)
- Security Best Practices (Firewall-Regeln, TLS/SSL, Least Privilege)
- Backup & Disaster Recovery Procedures
- Deployment Checklist (Pre/During/Post)

**Anwendung:** Automatisch für alle Dateien (applyTo: `**`)

---

#### ✅ `.github/instructions/database-operations-mcp.instructions.md` (NEU)
**Status:** ✅ Erstellt (~450 Zeilen)

**Inhalt:**
- Komplette Database Matrix (17 Datenbanken dokumentiert)
- PostgreSQL MCP Integration für:
  - Connection Testing (alle 17 DBs)
  - Schema Inspection (Prisma + Drupal/CiviCRM)
  - Data Integrity Checks (PII Encryption, Referential Integrity)
  - Performance Monitoring (Slow Queries, Connection Pools)
  - Backup & Restore Procedures (automatisiert)
  - Migration Management (Prisma + Drupal)
  - DSGVO Compliance Operations (DSAR, RTBF)
  - Disaster Recovery (Complete System Restore)
- GitHub Secrets Übersicht (alle DB-Credentials)
- Best Practices (Security, Performance, DSGVO)

**Anwendung:** Alle Datenbank-relevanten Dateien (`**/*.{sql,prisma,js,ts,py,php}`)

---

#### ✅ `.github/instructions/codacy.instructions.md` (EXISTIEREND)
**Status:** Unverändert (bereits optimal)

**Inhalt:**
- Automatische Codacy CLI Analyse nach jedem File-Edit
- Dependency/Security Checks (Trivy Integration)
- Repository Setup Workflow

---

#### ✅ `.github/instructions/figma-mcp.instructions.md` (EXISTIEREND)
**Status:** Unverändert

**Inhalt:**
- Figma Design System Sync
- Design Token Workflow
- Component Code Export

---

#### ✅ `.github/instructions/mcp-integration.instructions.md` (EXISTIEREND)
**Status:** Unverändert

**Inhalt:**
- Übersicht aller verfügbaren MCP Server
- Service-spezifische Workflows
- Quality Gates Integration

---

#### ✅ `.github/instructions/project-development.instructions.md` (EXISTIEREND)
**Status:** Unverändert (bereits umfassend)

**Inhalt:**
- Projekt-Übersicht (6-Service-Architektur)
- Mandatory Quality Gates
- Service-spezifische Guidelines
- Testing Strategy
- Multi-Language Support

---

#### 🆕 `.github/instructions/civicrm-vereinsbuchhaltung.instructions.md`
**Status:** Neu erstellt

**Inhalt:**
- Vollständiges Setup für Drupal/CiviCRM Vereinsbuchhaltung (`scripts/setup-civicrm.sh`)
- Pflicht-Erweiterungen (CiviSEPA, CiviInvoice, CiviBank, CiviRules, CiviAccounts)
- Prozesse für Mitgliedschaften, Beiträge, Spenden + Steuer/DATEV Exporte
- Rollen/ACL-Matrix (Admin, Buchhaltung, Mitgliederbetreuung, IT)
- Automatisierungsideen (CiviRules, Cronjobs, n8n Workflows)
- Betrieb & Wartung (Backups, Logs, Cron, Secrets)

---

#### ✅ `.github/instructions/quality-gates.instructions.md` (EXISTIEREND)
**Status:** Unverändert

**Inhalt:**
- 8 Mandatory Quality Gates (PR-Blocking)
- Automatische Enforcement (Pre-Commit/Push/PR)
- Service-spezifische Gates
- Monitoring & Reporting

---

### 2. Prompts (Aufgaben-Templates)

#### ✅ `.github/prompts/MCPMultiServiceDeployment_DE.prompt.md` (AKTUALISIERT)
**Status:** ✅ Erweitert (jetzt 725+ Zeilen)

**Neue Inhalte:**
- **Phase 4 komplett neu geschrieben:**
  - Vollständige Database Matrix (17 DBs)
  - Plesk MariaDB (5 DBs, LIMIT erreicht)
  - External MariaDB (9 DBs, Provisioning-Skripte)
  - External PostgreSQL (3 DBs, TLS/SSL-Config)
  - Connection Validation (alle 17 DBs)
  - Database Migrations (Prisma + Drupal/CiviCRM)
  - Firewall Configuration (UFW-Befehle)
  - Post-Migration Validation

**Bestehende Inhalte (optimiert):**
- Phase 1: Pre-Deployment Validation (GitHub MCP)
- Phase 2: Environment Preparation (Filesystem MCP)
- Phase 3: Service Dependency Graph
- Phase 5-16: Alle Deployment-Phasen (API, CRM, Frontend, Games, n8n, Monitoring, Rollback, Reports)

**Verwendung:** Als Template für vollständige Multi-Service-Deployments

---

#### 🆕 `.github/prompts/CiviCRM_Vereinsbuchhaltung_DE.prompt.md`
**Status:** Neu erstellt

**Inhalt:**
- End-to-End Aktionsplan für Vereinsbuchhaltung (Systemvorbereitung, Erweiterungen, Beiträge, Spenden, Export)
- Verweist auf Secrets (`docs/SECRETS.template.md`) und Setup-Skripte (`#file:scripts/setup-civicrm.sh`)
- Enthält konkrete CLI-Beispiele (`drush`, `composer`, Export-Kommandos) und Abschluss-Checklisten

#### 🆕 `.github/prompts/CiviCRM_n8n_Automation_DE.prompt.md`
**Status:** Neu erstellt

**Inhalt:**
- Automations-Roadmap für Mitglieder, SEPA, Bankabgleich, Rechnungen, Monitoring, Buchhaltung, Zuwendungsbestätigungen
- Bezieht sich auf n8n Workflows (`automation/n8n`), Cronjobs, Export-Skripte
- Explizite Hinweise auf benötigte Secrets & Tests

---

#### ✅ Alle anderen Prompts (EXISTIEREND)
**Status:** Unverändert

**Liste:**
- APIDesign_DE.prompt.md
- Architekturplan_DE.prompt.md
- BarrierefreiheitAudit_DE.prompt.md
- CodeReview_DE.prompt.md
- DatenbankSchema_DE.prompt.md
- DeploymentGuide_DE.prompt.md
- MCPDSGVOComplianceAudit_DE.prompt.md
- MCPDatabaseMigration_DE.prompt.md
- MCPFeatureImplementation_DE.prompt.md
- MCPSecurityIncident_DE.prompt.md
- ... (weitere 13 Prompts)

---

### 3. Chat Modes (Spezialisierte KI-Modi)

#### ✅ `.github/chatmodes/MCPDeploymentOps_DE.chatmode.md` (NEU)
**Status:** ✅ Erstellt (~550 Zeilen)

**Spezialisierung:**
- Multi-Service Deployments auf Plesk-Infrastruktur
- 17-Datenbank-Architektur Management
- Automatische Initialisierung (Memory MCP + GitHub MCP + PostgreSQL MCP)

**Haupt-Workflows:**
1. **Pre-Deployment Validation**
   - GitHub CI/CD Check
   - Quality Gates Validation
   - Database Backup Verification
   - SSH Connection Test

2. **Database Environment Setup**
   - External MariaDB Provisioning (9 DBs)
   - PostgreSQL Provisioning (3 DBs)
   - Firewall Configuration
   - Connection Validation (17 DBs)

3. **Service Deployment**
   - Dependency-basierte Reihenfolge (DB → API → CRM → Frontend → Games → Admin → n8n)
   - Schrittweise Deployment mit Health Checks
   - Playwright E2E Tests nach jedem Service
   - Accessibility Audits (WCAG AA)

4. **Post-Deployment Monitoring**
   - 30-Minuten-Überwachung (automatisch)
   - Metrics: Service Health, Resources, DB Health, Error Rates, Performance
   - Auto-Rollback bei kritischen Fehlern
   - n8n Alerting Integration

---

#### 🆕 `.github/modes/civicrm-vereinsbuchhaltung.mode.md`
**Status:** Neu erstellt

**Fokus:**
- Beiträge, Spenden, SEPA-Mandate, Rechnungswesen in CiviCRM
- Snippets für Erweiterungsinstallation (CiviSEPA, CiviInvoice, CiviBank, CiviRules)
- Automatisierungsempfehlungen (CiviRules, Cronjobs, n8n Workflows)
- Sicherheitsprinzipien (Secrets, Backups, ACLs) & Livegang-Checkliste

5. **Rollback**
   - < 5 Minuten SLA
   - 10-Schritt-Verfahren (Alert → Traffic Stop → DB Restore → Service Rollback → Resume)
   - Post-Mortem Issue Creation (GitHub MCP)

**Kontext-Bewusste Antworten:**
- "Kann ich jetzt deployen?" → Automatische Readiness-Check
- "Sind alle Datenbanken erreichbar?" → PostgreSQL MCP Test aller 17 DBs
- "Wie performant ist die letzte Deployment?" → Memory MCP Metrics Retrieval

**Spezielle Kommandos:**
- "Zeige Deployment Dashboard" → Interaktive CLI UI
- "Quick health check" → <10s Paralleltest

**Best Practices:**
- Immer zuerst validieren (nie blind deployen)
- Backups vor jeder kritischen Operation
- Schrittweise Deployment (nicht parallel)
- 30 Min Post-Deployment Monitoring
- Rollback immer bereit
- Team-Kommunikation
- Dokumentation in GitHub Issues

**Auto-Eskalation:**
- Error Rate >5% → Automatic Rollback + PagerDuty
- Service Down >5 min → Rollback + On-Call
- DB Connection Lost → STOP + Firewall/Credentials Check

**SLA:**
- Deployment: <30 min
- Rollback: <5 min

---

#### ✅ Alle anderen Chat Modes (EXISTIEREND)
**Status:** Unverändert

**Liste:**
- MCPAPIDesign_DE.chatmode.md
- MCPCodeReview_DE.chatmode.md
- MCPDesignSystemSync_DE.chatmode.md
- MCPPerformanceOptimierung_DE.chatmode.md
- MCPSicherheitsAudit_DE.chatmode.md
- ... (weitere 19 Chat Modes)

---

## 🎯 Integration mit bestehender Architektur

### MCP Server Nutzung in neuen Dateien

#### PostgreSQL MCP
```markdown
VERWENDET IN:
- plesk-deployment.instructions.md → DB Connection Tests, Schema Validation
- database-operations-mcp.instructions.md → Alle DB-Operationen (17 DBs)
- MCPDeploymentOps_DE.chatmode.md → Connection Validation, Migration Workflow

FUNKTIONEN:
✅ Test all 17 database connections (MariaDB + PostgreSQL)
✅ Schema inspection (Prisma + Drupal/CiviCRM)
✅ Data integrity checks (PII encryption, foreign keys)
✅ Performance monitoring (slow queries, connection pools)
✅ Migration management (Prisma deploy + Drupal updatedb)
```

#### GitHub MCP
```markdown
VERWENDET IN:
- plesk-deployment.instructions.md → PR Validation, Security Alerts
- MCPDeploymentOps_DE.chatmode.md → CI/CD Status, Deployment Issues

FUNKTIONEN:
✅ Check deployment branch readiness
✅ List Dependabot/Security alerts
✅ Create deployment tracking issues
✅ Create post-mortem issues (rollback)
```

#### Filesystem MCP
```markdown
VERWENDET IN:
- plesk-deployment.instructions.md → Deployment Scripts, Config Files
- database-operations-mcp.instructions.md → Backup Scripts
- MCPDeploymentOps_DE.chatmode.md → .env.deployment, Build Artifacts

FUNKTIONEN:
✅ Read deployment scripts (deploy-api-plesk.sh, etc.)
✅ Validate environment configs (.env files)
✅ Execute backup scripts (db-backup-all.sh)
✅ Deploy built artifacts (rsync)
```

#### Playwright MCP
```markdown
VERWENDET IN:
- plesk-deployment.instructions.md → Smoke Tests, E2E Validation
- MCPDeploymentOps_DE.chatmode.md → Post-Deployment Testing

FUNKTIONEN:
✅ API endpoint validation (health, auth, performance)
✅ Frontend E2E tests (donation flow, registration, login)
✅ CRM smoke tests (contact creation, donations)
✅ Accessibility audits (WCAG AA)
✅ Performance benchmarks (Lighthouse)
```

#### Memory MCP
```markdown
VERWENDET IN:
- MCPDeploymentOps_DE.chatmode.md → Deployment State, Metrics Tracking

FUNKTIONEN:
✅ Load last deployment state (timestamp, version, status)
✅ Track deployment metrics (response times, error rates, resources)
✅ Trend analysis (performance over time)
```

#### Brave Search MCP
```markdown
VERWENDET IN:
- database-operations-mcp.instructions.md → CVE Details, Best Practices

FUNKTIONEN:
✅ Search for security vulnerability details (CVE-XXXX)
✅ Find best practices (PostgreSQL optimization, DSGVO compliance)
```

---

## 🔗 Dokumentations-Hierarchie

### Ebene 1: Copilot Instructions (Root)
```text
.github/copilot-instructions.md (EXISTIEREND)
├─ Arbeitsmodus & Verhalten
├─ Repository-Überblick (6 Services)
├─ Qualitäts- & Sicherheits-Gates (9 Gates)
├─ Kern-Workflows (Setup, Quality, Build, Deploy)
├─ Testing & Observability
└─ Daten & Sicherheit
```

### Ebene 2: Spezialisierte Instructions
```text
.github/instructions/
├─ codacy.instructions.md                    (EXISTIEREND - Code Quality)
├─ figma-mcp.instructions.md                 (EXISTIEREND - Design System)
├─ mcp-integration.instructions.md           (EXISTIEREND - MCP Übersicht)
├─ project-development.instructions.md       (EXISTIEREND - Entwicklung)
├─ quality-gates.instructions.md             (EXISTIEREND - Quality Enforcement)
├─ plesk-deployment.instructions.md          (NEU - Plesk Infrastructure)
└─ database-operations-mcp.instructions.md   (NEU - DB Management)
```

### Ebene 3: Aufgaben-Prompts
```text
.github/prompts/
├─ MCPMultiServiceDeployment_DE.prompt.md    (AKTUALISIERT - 17 DB Integration)
├─ MCPDatabaseMigration_DE.prompt.md         (EXISTIEREND)
├─ MCPDSGVOComplianceAudit_DE.prompt.md      (EXISTIEREND)
├─ MCPFeatureImplementation_DE.prompt.md     (EXISTIEREND)
├─ MCPSecurityIncident_DE.prompt.md          (EXISTIEREND)
└─ ... (weitere 20 Prompts)
```

### Ebene 4: Chat Modes
```text
.github/chatmodes/
├─ MCPDeploymentOps_DE.chatmode.md           (NEU - Deployment Spezialist)
├─ MCPCodeReview_DE.chatmode.md              (EXISTIEREND)
├─ MCPDesignSystemSync_DE.chatmode.md        (EXISTIEREND)
├─ MCPPerformanceOptimierung_DE.chatmode.md  (EXISTIEREND)
├─ MCPSicherheitsAudit_DE.chatmode.md        (EXISTIEREND)
└─ ... (weitere 19 Chat Modes)
```

---

## 📊 Statistiken

### Dateien

| Kategorie       | Neu | Aktualisiert | Unverändert | Gesamt |
|-----------------|-----|--------------|-------------|--------|
| Instructions    | 2   | 0            | 5           | 7      |
| Prompts         | 0   | 1            | 24          | 25     |
| Chat Modes      | 1   | 0            | 23          | 24     |
| **TOTAL**       | **3** | **1**      | **52**      | **56** |

### Zeilen Code/Dokumentation

| Datei                                        | Zeilen | Status        |
|----------------------------------------------|--------|---------------|
| plesk-deployment.instructions.md             | ~600   | ✅ Neu        |
| database-operations-mcp.instructions.md      | ~450   | ✅ Neu        |
| MCPDeploymentOps_DE.chatmode.md              | ~550   | ✅ Neu        |
| MCPMultiServiceDeployment_DE.prompt.md       | ~725   | ✅ Aktualisiert |
| **GESAMT NEUE/GEÄNDERTE DOKUMENTATION**      | **~2.325** | |

---

## ✅ Quality Gates für neue Dokumentation

### Vollständigkeit
- ✅ Alle 17 Datenbanken dokumentiert (5 Plesk + 9 External MariaDB + 3 PostgreSQL)
- ✅ SSH Credentials & Zugriffsinformationen (dmpl20230054)
- ✅ Alle 22 Subdomains mit Deployment-Pfaden
- ✅ Komplette GitHub Secrets Matrix (50+ Secrets)
- ✅ SQL Provisioning Templates (MariaDB + PostgreSQL)
- ✅ Firewall-Konfigurationen (UFW)
- ✅ Backup & DR Procedures
- ✅ DSGVO Compliance Operations (DSAR, RTBF)

### MCP Integration
- ✅ PostgreSQL MCP: Alle DB-Operationen
- ✅ GitHub MCP: CI/CD, Issues, Security
- ✅ Filesystem MCP: Deployment Scripts, Configs
- ✅ Playwright MCP: E2E Tests, Smoke Tests
- ✅ Memory MCP: State Tracking, Metrics
- ✅ Brave Search MCP: Best Practices, CVE

### Konsistenz
- ✅ Einheitliche Markdown-Formatierung
- ✅ Konsistente Code-Block-Syntax (```bash, ```sql, ```markdown)
- ✅ Strukturierte YAML Frontmatter (description, applyTo, priority)
- ✅ Deutsche UI-Texte, englische technische Begriffe
- ✅ Emoji-Nutzung für visuelle Orientierung (🚀, ✅, ❌, 🗄️, etc.)

### Verknüpfung
- ✅ Cross-References zwischen Instructions, Prompts, Chat Modes
- ✅ Links zu bestehenden Skripten (deployment-scripts/, scripts/)
- ✅ Referenzen auf externe Dokumentation (GITHUB-SECRETS-COMPLETE-SETUP.md, etc.)

### Praktikabilität
- ✅ Copy-Paste-Ready Code Snippets
- ✅ Schritt-für-Schritt-Anleitungen
- ✅ Fehlerbehandlung dokumentiert
- ✅ Rollback-Strategien enthalten
- ✅ SLAs definiert (Deployment <30 min, Rollback <5 min)

---

## 🎯 Nächste Schritte (für User)

### Sofort verfügbar:
1. **Deployment Dashboard starten:**
   ```bash
   npm run deploy:dashboard
   ```

2. **Chat Mode aktivieren (in GitHub Copilot):**
   - Wähle "MCPDeploymentOps_DE" aus der Chat Mode Liste
   - Frage: "Kann ich jetzt deployen?"
   - → Automatische Readiness-Validation

3. **Database Connections testen:**
   - Via PostgreSQL MCP: "Test all 17 database connections"
   - Oder manuell: `./scripts/db-test-connections.sh`

### Vorbereitung für Production Deployment:

1. **External Database Server Provisioning:**
   - MariaDB Server aufsetzen (für 9 externe DBs)
   - PostgreSQL Server aufsetzen (für 3 DBs)
   - Firewall konfigurieren (nur Plesk IP)

2. **GitHub Secrets konfigurieren (50+):**
   - SSH Credentials (SSH_HOST, SSH_PORT, SSH_USER, SSH_PRIVATE_KEY)
   - Database Hosts (MYSQL_HOST, PG_HOST, REDIS_HOST)
   - Alle 17 DB Passwords (siehe `.github/instructions/plesk-deployment.instructions.md`)

3. **Deployment Dry-Run:**
   ```bash
   npm run deploy:readiness       # Quality Gates Check
   ./scripts/safe-deploy.sh --dry-run
   ```

4. **Erste Production Deployment:**
   - Via Chat Mode: "Start deployment"
   - Oder manuell: `npm run deploy:multi-service`
   - Post-Deployment Monitoring läuft automatisch 30 min

---

## 📚 Referenzen

### Haupt-Dokumentation
- [Copilot Instructions](../copilot-instructions.md)
- [Plesk Deployment Instructions](../instructions/plesk-deployment.instructions.md)
- [Database Operations MCP](../instructions/database-operations-mcp.instructions.md)
- [Multi-Service Deployment Prompt](../prompts/MCPMultiServiceDeployment_DE.prompt.md)
- [Deployment Operations Chat Mode](../chatmodes/MCPDeploymentOps_DE.chatmode.md)

### Deployment Scripts
- `deployment-scripts/multi-service-deploy.sh`
- `deployment-scripts/deploy-api-plesk.sh`
- `deployment-scripts/deploy-crm-plesk.sh`
- `deployment-scripts/blue-green-deploy.sh`
- `deployment-scripts/rollback.sh`

### Secrets Setup
- `GITHUB-SECRETS-COMPLETE-SETUP.md`
- `GITHUB-SECRETS-SETUP.md`
- `ZUGANGSDATEN-CHECKLISTE.md`

---

**Status:** ✅ COMPLETE  
**Update-Datum:** 2025-10-07  
**Nächster Review:** Bei nächstem Major Infrastructure Change
- Fokus auf Automationen zwischen CiviCRM, n8n, Plesk Cron & Monitoring (`civicrm-n8n-automation.instructions.md`)
- Snippets für Bankimport, SEPA, Monitoring Alerts, Exporte
- Checkliste für Secrets/Testläufe
