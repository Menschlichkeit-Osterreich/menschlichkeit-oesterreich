# 11 – Dokumentations-Zielstruktur

**Stand**: 2026-03-09

---

## Ziel-Hierarchie

```
docs/
├── index.md                          ← Einstiegspunkt, Übersicht aller Docs
│
├── architecture/
│   ├── overview.md                   ← Systemübersicht, C4-Diagramm
│   ├── frontend.md                   ← React + Vite Architektur
│   ├── api.md                        ← FastAPI Design, Endpunkte
│   ├── crm.md                        ← Drupal + CiviCRM Architektur
│   ├── database.md                   ← MariaDB + PostgreSQL Dual-ORM
│   ├── openclaw.md                   ← Multi-Agent-System Architektur
│   ├── design-system.md              ← Figma Design Tokens, Komponenten
│   └── adr/                          ← Architecture Decision Records
│       ├── 001-mariadb-vs-postgres.md
│       ├── 002-rsync-vs-docker-deploy.md
│       └── template.md
│
├── operations/
│   ├── runbook-deployment.md         ← Deployment-Runbook (Schritt-für-Schritt)
│   ├── runbook-rollback.md           ← Rollback-Prozedur
│   ├── runbook-backup-restore.md     ← Backup & Restore
│   ├── runbook-ssl-renewal.md        ← TLS-Zertifikat-Erneuerung
│   ├── runbook-n8n.md                ← n8n-Betrieb
│   ├── incident-response.md          ← Incident Response Playbook
│   ├── monitoring.md                 ← Monitoring-Setup (bereits vorhanden)
│   ├── maintenance.md                ← Wartungsfenster, Update-Prozesse
│   ├── plesk-setup.md                ← Plesk-Konfiguration
│   ├── subdomain-setup.md            ← Neue Subdomain anlegen
│   └── MAILBOXEN-ERSTELLUNG-PLESK.md ← bereits vorhanden
│
├── security/
│   ├── secrets-management.md         ← SOPS, GitHub Secrets, Rotation
│   ├── security-hardening.md         ← Hardening-Checklisten
│   ├── vulnerability-disclosure.md   ← Responsible Disclosure Policy
│   ├── access-control.md             ← Zugriffsmatrix, Rollen
│   └── audit-log.md                  ← Audit-Trail-Prozesse
│
├── compliance/
│   ├── dsgvo-overview.md             ← DSGVO-Compliance-Übersicht
│   ├── dsgvo-pii-sanitizer.md        ← PII-Sanitizer-Dokumentation
│   ├── dsgvo-data-processing.md      ← Verarbeitungsverzeichnis
│   ├── dsgvo-data-retention.md       ← Löschfristen
│   └── avv-partners.md               ← Auftragsverarbeiter (Hetzner, etc.)
│
├── infrastructure-audit/             ← Dieser Audit (2026-03)
│   ├── README.md
│   ├── 00-executive-summary.md
│   └── [... alle Audit-Dokumente ...]
│
└── media/
    ├── screenshots/
    │   ├── README.md                 ← Screenshot-Richtlinien
    │   ├── plesk/
    │   ├── monitoring/
    │   └── ui/
    ├── diagrams/
    │   ├── architecture-c4.png
    │   ├── subdomain-overview.png
    │   └── monitoring-stack.png
    └── branding/
        ├── logo.JPG                  ← Primärquelle (bereits vorhanden)
        ├── logo.svg                  ← empfohlen: Vektordatei erstellen
        ├── favicon.ico               ← generiert aus logo.svg
        ├── favicon-32.png
        ├── favicon-16.png
        └── brand-guidelines.md
```

---

## Architecture Decision Records (ADR)

ADRs dokumentieren technische Entscheidungen mit Kontext, Alternativen und Konsequenzen.

### ADR-Template

```markdown
# ADR-NNN – [Titel der Entscheidung]

**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Datum**: YYYY-MM-DD
**Autoren**: [Namen]

## Kontext

[Warum war eine Entscheidung nötig?]

## Entscheidung

[Was wurde entschieden?]

## Alternativen betrachtet

| Alternative | Vorteile | Nachteile |
|-------------|---------|-----------|
| Option A | ... | ... |
| Option B | ... | ... |

## Konsequenzen

**Positive**:
- ...

**Negative**:
- ...
```

### Offene ADRs (zu erstellen)

| ADR | Entscheidung | Status |
|-----|-------------|--------|
| ADR-001 | MariaDB (Prod) vs. PostgreSQL (Dev) – wann vereinheitlichen? | Offen |
| ADR-002 | rsync-Deployment vs. Container-Deployment | Offen |
| ADR-003 | n8n als Automation-Plattform | Accepted (implizit) |
| ADR-004 | Dual-ORM (Alembic + Prisma) | Offen |
| ADR-005 | OpenClaw Produktions-Deployment | Offen |

---

## Screenshot-Richtlinien

```
Dateiformat:    PNG für UI-Screenshots, WEBP für Blog/Doku
Auflösung:      1920×1080 minimum, 4K bevorzugt
Benennung:      YYYY-MM-DD_[service]_[beschreibung].png
                Beispiel: 2026-03-09_plesk_backup-konfiguration.png
Inhalt:         Keine PII (E-Mail-Adressen, Namen, IPs unkenntlich)
Keine Secrets:  Passwörter, Tokens immer schwärzen
Ablage:         docs/media/screenshots/[service]/
Rotation:       Veraltete Screenshots (> 6 Monate) entfernen oder aktualisieren
```

---

## KI-lesbare Dokumentation (für OpenClaw)

Alle Dokumente sollen maschinenlesbar sein:

```markdown
<!-- Frontmatter für KI-Indexierung -->
---
title: "Monitoring-Architektur"
service: monitoring
last_reviewed: 2026-03-09
review_cycle: quarterly
status: current  # current | draft | deprecated
tags: [monitoring, prometheus, grafana, uptime-kuma]
---
```

---

## Bestehende Docs-Qualitätsbewertung

| Dokument | Status | Qualität |
|----------|--------|----------|
| docs/operations/monitoring.md | vorhanden | ✅ Gut, TODO-Liste offen |
| docs/operations/MAILBOXEN-ERSTELLUNG-PLESK.md | vorhanden | ✅ Gut, überfällig |
| docs/operations/incident-response.md | wahrscheinlich vorhanden | prüfen |
| docs/architecture/* | teilweise | ausbaufähig |
| docs/security/* | teilweise | security-hardening.md fehlt |
| docs/compliance/dsgvo* | teilweise | PII-Sanitizer dokumentiert |
| docs/media/branding/* | fehlt | Logo JPG vorhanden, SVG fehlt |
| ADR-Verzeichnis | fehlt | erstellen |
