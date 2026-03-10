# 01 – Ist-Analyse

**Stand**: 2026-03-09 | Basis: Repo-Analyse + Konfigurationsdateien

---

## 1. Server-Infrastruktur

| Eigenschaft | Wert | Quelle |
|-------------|------|--------|
| Server-IP | 5.183.217.146 | verifiziert – .env.example, Monitoring-Docs |
| Webserver | nginx/1.28.0 | verifiziert – .env.example |
| PHP-Version | 8.4.11 | verifiziert – .env.example |
| Datenbankserver | MariaDB 10.6.22 | verifiziert – .env.example |
| Panel | Plesk (Port 8443) | verifiziert – Docs |
| Plesk-URL | https://5.183.217.146:8443 | verifiziert |
| Betriebssystem | Ubuntu 22.04 LTS | wahrscheinlich – Plesk-Standard |
| Hosting-Typ | Dedicated/VPS, Single-Server | verifiziert |

### Widerspruch: MariaDB vs. PostgreSQL

> **FINDING P1-DB-001** (verifiziert): `CLAUDE.md`, `docker-compose.yml` und System-Dokumentation referenzieren PostgreSQL ≥15. Die Produktionskonfiguration (`.env.example`, Plesk-Datenbankserver) zeigt MariaDB 10.6.22.
>
> **Wahrscheinliche Erklärung**: MariaDB = Produktion (Plesk-Shared), PostgreSQL = Lokale Entwicklung via Docker Compose. Beide Systeme laufen nebeneinander. Dual-ORM (Alembic + Prisma) auf unterschiedlichen DB-Systemen ist ein Architekturrisiko.

---

## 2. Services-Inventar

| Service | Technologie | Lokaler Port | Subdomain (Produktion) | Status |
|---------|------------|-------------|----------------------|--------|
| Frontend | React 18 + TypeScript + Vite | 5173 | menschlichkeit-oesterreich.at | wahrscheinlich aktiv |
| API | FastAPI Python 3.12+ | 8001 | api.menschlichkeit-oesterreich.at | wahrscheinlich aktiv |
| CRM | Drupal 10 + CiviCRM (PHP 8.1) | 8000 | crm.menschlichkeit-oesterreich.at | wahrscheinlich aktiv |
| Games/Web | Statisch + Prisma | 3000 | games.menschlichkeit-oesterreich.at | wahrscheinlich aktiv |
| n8n Automation | Docker | 5678 | n8n.menschlichkeit-oesterreich.at | wahrscheinlich aktiv |
| OpenClaw Gateway | FastAPI | 9101 | intern (kein öffentl. Zugang) | wahrscheinlich Entwicklung |
| OpenClaw Runtime | Python asyncio | 9100 | intern | wahrscheinlich Entwicklung |
| Windows-Bridge | PowerShell/Node | 18790 | intern | wahrscheinlich Entwicklung |
| Forum | – | – | forum.menschlichkeit-oesterreich.at | unklar – kein Code im Repo |
| Support | – | – | support.menschlichkeit-oesterreich.at | unklar – kein Code im Repo |
| Voting | – | – | vote.menschlichkeit-oesterreich.at | unklar – kein Code im Repo |
| Nextcloud | – | – | cloud.menschlichkeit-oesterreich.at | nicht deployed |

---

## 3. Repo-Struktur

| Bereich | Zustand | Anmerkung |
|---------|---------|-----------|
| Monorepo | npm workspaces | `apps/`, `packages/`, `automation/`, `openclaw-system/` |
| Dual-Verzeichnisstruktur | ⚠ Risiko | Services in `apps/<name>/` UND Legacy `<name>.menschlichkeit-oesterreich.at/` |
| GitHub Actions Workflows | 52 Workflows | Comprehensive CI/CD: Lint, Test, Security, Deploy, Quality Gates |
| Package Manager | npm | `package-lock.json` vorhanden |
| Node.js-Version | ≥22.19.0 (package.json) | ⚠ deploy-plesk.yml verwendete 20 (behoben) |
| Design Tokens | figma-design-system/00_design-tokens.json | verifiziert |
| Secrets-Management | SOPS + dotenv-vault | verifiziert – secrets/README.md |
| OpenAPI-Spec | api.menschlichkeit-oesterreich.at/openapi.yaml | verifiziert |

### Legacy-Verzeichnisse (Drift-Risiko)

```
api.menschlichkeit-oesterreich.at/   ← Legacy
crm.menschlichkeit-oesterreich.at/   ← Legacy
apps/api/                             ← Modern
apps/crm/                             ← Modern
apps/website/                         ← Modern
frontend/                             ← Legacy
```

> **FINDING P2-REPO-001**: Beide Verzeichnisstrukturen parallel gepflegt. `docker-compose.prod.yml` referenziert `api.menschlichkeit-oesterreich.at/app` (Legacy). `deploy-plesk.yml` deployt aus `apps/api/` (Modern). Kein formeller Sync-Mechanismus dokumentiert.

---

## 4. Datenbank-Inventar

### MariaDB (Produktion – Plesk)

| Datenbank | Service | Status |
|-----------|---------|--------|
| (Standard) | Drupal + CiviCRM | wahrscheinlich aktiv |
| (Standard) | Alle weiteren Services shared | wahrscheinlich aktiv |

> **FINDING P2-DB-001**: Keine Service-isolierten Datenbanken dokumentiert. Wahrscheinlich ein oder zwei geteilte DB-Instanzen.

### PostgreSQL (Entwicklung – Docker)

| Datenbank | Service |
|-----------|---------|
| postgres (default) | FastAPI + Prisma/Games |

---

## 5. CI/CD-Inventar

### Ausgewählte kritische Workflows

| Workflow | Trigger | Funktion |
|----------|---------|----------|
| `deploy-plesk.yml` | push/main + manuell | Produktion rsync-Deployment |
| `security-scan.yml` | PR + tägl. | Trivy, Bandit, Gitleaks |
| `codeql.yml` | PR + tägl. | SAST via GitHub CodeQL |
| `semgrep.yml` | PR | SAST via Semgrep |
| `quality-gates.yml` | PR | Codacy, Lighthouse, DSGVO |
| `sbom.yml` | Release | SBOM-Generierung |
| `dependency-review.yml` | PR | OSS-Lizenz-Check |

### Deployment-Strategie

- **Methode**: rsync + SSH-Remotebefehle (pip install, composer install, drush)
- **Kein Zero-Downtime**: Direktes Überschreiben des Produktionsverzeichnisses
- **Kein Rollback-Mechanismus**: Kein Blue-Green, kein Canary
- **Healthchecks**: Post-Deploy HTTP-Checks (5–20s Timeout)

---

## 6. E-Mail-Inventar

### Bestehende Mailboxen (verifiziert)

| Adresse | Funktion |
|---------|----------|
| office@menschlichkeit-oesterreich.at | Hauptadresse (Primär) |
| info@menschlichkeit-oesterreich.at | Allgemeine Anfragen |
| kontakt@menschlichkeit-oesterreich.at | Kontaktformular |
| peter.schuller@menschlichkeit-oesterreich.at | Persönliche Mailbox |
| bounce@menschlichkeit-oesterreich.at | E-Mail-Bounces |
| civi@menschlichkeit-oesterreich.at | CiviCRM-Integration |

### Fehlende Mailboxen (P1 – seit KW43/2025 offen)

| Adresse | Funktion | Priorität |
|---------|----------|-----------|
| support@menschlichkeit-oesterreich.at | Ticketing | P1 |
| newsletter@menschlichkeit-oesterreich.at | Kampagnen-Versand | P1 |
| noreply@menschlichkeit-oesterreich.at | Transaktionsmails | P1 |
| security@menschlichkeit-oesterreich.at | Security Disclosures | P1 |
| admin@menschlichkeit-oesterreich.at | System-Benachrichtigungen | P1 |
| devops@menschlichkeit-oesterreich.at | Ops-Alerts | P2 |
| automation@menschlichkeit-oesterreich.at | n8n SMTP | P2 |
| logging@menschlichkeit-oesterreich.at | Log-Aggregation | P3 |

### E-Mail-Authentifizierung

| Mechanismus | Status | Anmerkung |
|-------------|--------|-----------|
| SPF | wahrscheinlich aktiv | v=spf1 mx a ip4:5.183.217.146 ~all |
| DKIM | wahrscheinlich aktiv | Via Plesk konfiguriert |
| DMARC | wahrscheinlich Monitoring-only | p=none oder p=quarantine |
| DMARC-Reports | unklar | Kein rua-Empfänger dokumentiert |

---

## 7. Secrets-Inventar

| Mechanismus | Status | Bewertung |
|-------------|--------|-----------|
| SOPS + dotenv-vault | verifiziert – `secrets/README.md` | ✅ Korrekte Architektur |
| GitHub Secrets (CI/CD) | verifiziert – Workflows referenzieren `${{ secrets.* }}` | ✅ Korrekt |
| n8n `.env.example` | ⚠ KRITISCH (vor Audit) | ❌ Klartext-Credentials (behoben) |
| `.env.prod` (root) | wahrscheinlich vorhanden, in .gitignore | wahrscheinlich korrekt |
| `secrets/` Verzeichnis | verifiziert | ✅ Rotation-Schedules dokumentiert |

---

## 8. Monitoring-Inventar

| Tool | Status | Anmerkung |
|------|--------|-----------|
| Uptime Kuma | ❌ Nicht deployed | Nur als Docker-Compose-Beispiel in Docs |
| Prometheus | ❌ Nicht deployed | Empfohlen in Docs, kein Config vorhanden |
| Grafana | ❌ Nicht deployed | Empfohlen in Docs, kein Config vorhanden |
| node_exporter | ❌ Nicht deployed | – |
| Alertmanager | ❌ Nicht deployed | – |
| ELK-Stack | ⚠ Definiert | `automation/elk-stack/` vorhanden, Produktionsstatus unklar |
| Status-Page | ❌ Nicht vorhanden | – |
| TLS-Zertifikats-Monitoring | ❌ Nicht automatisiert | Jetzt via GitHub Actions (neu) |

---

## 9. Plesk-Extensions (wahrscheinlich installiert)

| Extension | Funktion | Risiko |
|-----------|----------|--------|
| XOVI SEO Toolkit | SEO-Analyse | Externe API-Verbindung, DSGVO prüfen |
| Let's Encrypt | TLS-Zertifikate | Standard, kein Risiko |
| Fail2ban | Brute-Force-Schutz | Konfiguration prüfen |
| ModSecurity | WAF | Regelwerk (CRS-Version) prüfen |
| Imunify360 | Anti-Malware | Falls installiert: Ressourcenintensiv |
