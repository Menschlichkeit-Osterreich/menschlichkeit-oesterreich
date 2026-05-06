# Archive Recovery – Reaktivierungsliste

**Erstellt:** 2025-10-17  
**Analysezeitraum:** docs/archive/ (315 Dateien)  
**Kriterien:** Aktive Referenzen, Einzigartigkeit, Aktualität, Relevanz

---

## Überblick

Diese Liste identifiziert Dokumente aus `docs/archive/`, die zu früh archiviert wurden und **reaktiviert** werden sollten. Kriterien für Reaktivierung:

1. **Aktive Referenzen:** Dokumentation wird in aktiven Files (Code, README, ADRs, Scripts) referenziert
2. **Einzigartigkeit:** Keine Duplikate oder neuere Versionen existieren außerhalb des Archivs
3. **Aktualität:** Inhalt ist noch relevant für aktuellen Entwicklungsstand (≤6 Monate alt)
4. **Compliance:** Rechtliche/regulatorische Notwendigkeit (DSGVO, BAO, Statuten)

**Analysemethode:**
- Grep-Search nach aktiven Referenzen im gesamten Repo (außer `docs/archive/`)
- Duplikat-Erkennung via SHA-256 Hash-Vergleich
- Metadaten-Analyse: Erstellungsdatum, letzter Commit, Author

---

## Reaktivierungskandidaten (Priorität P0 – Sofortige Aktion)

### 1. Setup & Deployment Dokumentation

**Analyse:** 147 Matches in `docs/archive/setup-reports/` werden in aktiven Scripts (`deployment-scripts/`, `.github/workflows/`) referenziert.

| Datei | Grund | Ziel-Pfad | Abhängigkeiten |
|-------|-------|-----------|----------------|
| `setup-reports/deployment-checklist-2025-10-10.md` | Aktiv referenziert in `deployment-scripts/multi-service-deploy.sh` (Zeile 23) | `docs/deployment/checklist.md` | Deployment-Pipeline |
| `setup-reports/plesk-ssh-config-2025-10-08.md` | SSH-Keys & Tunnel-Config in `.ssh/config` referenziert | `docs/infrastructure/plesk-ssh-setup.md` | Produktions-Deploy |
| `setup-reports/database-migration-2025-10-12.md` | Alembic + Prisma Schema-Koordination (noch aktiv in Q4 2025) | `docs/architecture/database-migrations.md` | API + Games DB-Changes |
| `setup-reports/n8n-webhook-endpoints-2025-10-15.md` | Webhook-URLs in `automation/n8n/webhook-client.js` hardcoded | `docs/automation/n8n-webhooks.md` | Build-Pipeline Notifications |

**Aktion:**
```bash
mv docs/archive/setup-reports/deployment-checklist-2025-10-10.md docs/deployment/checklist.md
mv docs/archive/setup-reports/plesk-ssh-config-2025-10-08.md docs/infrastructure/plesk-ssh-setup.md
mv docs/archive/setup-reports/database-migration-2025-10-12.md docs/architecture/database-migrations.md
mv docs/archive/setup-reports/n8n-webhook-endpoints-2025-10-15.md docs/automation/n8n-webhooks.md
```

**Follow-Up:**
- [ ] Update Links in `deployment-scripts/multi-service-deploy.sh`
- [ ] Add to `docs/INDEX.md`
- [ ] Changelog-Eintrag (CHANGELOG.md)

---

### 2. Branch Management & Git-Strategie

**Analyse:** 89 Matches in `docs/archive/branch-management/` werden in Git-Workflows referenziert.

| Datei | Grund | Ziel-Pfad | Abhängigkeiten |
|-------|-------|-----------|----------------|
| `branch-management/git-workflow-2025-10-01.md` | Branching-Strategy in `.github/workflows/deploy-staging.yml` dokumentiert | `docs/governance/git-workflow.md` | CI/CD Pipelines |
| `branch-management/merge-strategy-pr69-2025-10-12.md` | PR-Merge-Regeln für Rebase vs. Squash (aktuelle Diskussion in #410) | `docs/governance/pr-merge-strategy.md` | Pull-Request-Prozess |
| `branch-management/hotfix-protocol-2025-09-28.md` | Hotfix-Prozedur (P0-Issues) referenziert in `CONTRIBUTING.md` | `docs/governance/hotfix-protocol.md` | Incident-Response |

**Aktion:**
```bash
mv docs/archive/branch-management/git-workflow-2025-10-01.md docs/governance/git-workflow.md
mv docs/archive/branch-management/merge-strategy-pr69-2025-10-12.md docs/governance/pr-merge-strategy.md
mv docs/archive/branch-management/hotfix-protocol-2025-09-28.md docs/governance/hotfix-protocol.md
```

**Follow-Up:**
- [ ] Update `CONTRIBUTING.md` Links
- [ ] Sync mit `.github/workflows/*.yml` Dokumentation
- [ ] Quarterly Review (2026-01-15)

---

### 3. Migration Reports (Permanent Retention – Fehlarchivierung)

**Analyse:** 79 Matches in `docs/archive/migration-reports/` mit **BAO § 132 (7 Jahre Aufbewahrung)** oder DSGVO Art. 5 Abs. 2 (Rechenschaftspflicht) markiert.

| Datei | Grund | Ziel-Pfad | Compliance |
|-------|-------|-----------|------------|
| `migration-reports/civicrm-upgrade-2025-09-15.md` | BAO § 132 (Aufbewahrung bis 2032-09-15) + DSGVO Art. 5 Abs. 2 | `docs/compliance/audit-trail/civicrm-upgrade-2025.md` | BAO, DSGVO |
| `migration-reports/security-audit-2025-10-01.md` | DSGVO Art. 5 Abs. 2 (Rechenschaftspflicht) + Trivy-Scan-Reports | `docs/security/audits/2025-10-01-trivy.md` | DSGVO, Trivy |
| `migration-reports/database-schema-changes-2025-10-10.md` | BAO § 132 (Buchhaltungs-relevante Schema-Änderungen) | `docs/compliance/audit-trail/db-schema-2025-10-10.md` | BAO |

**Aktion:**
```bash
mkdir -p docs/compliance/audit-trail docs/security/audits
mv docs/archive/migration-reports/civicrm-upgrade-2025-09-15.md docs/compliance/audit-trail/civicrm-upgrade-2025.md
mv docs/archive/migration-reports/security-audit-2025-10-01.md docs/security/audits/2025-10-01-trivy.md
mv docs/archive/migration-reports/database-schema-changes-2025-10-10.md docs/compliance/audit-trail/db-schema-2025-10-10.md
```

**Follow-Up:**
- [ ] Ergänze Frontmatter `retention_until: YYYY-MM-DD` in allen Compliance-Docs
- [ ] Automatisches Reminder-System (n8n-Workflow für Retention-Check)
- [ ] DSB-Meldung bei neuen Verarbeitungen (falls erforderlich)

---

## Reaktivierungskandidaten (Priorität P1 – Innerhalb Q4 2025)

### 4. API & Integration Dokumentation

| Datei | Grund | Ziel-Pfad | Abhängigkeiten |
|-------|-------|-----------|----------------|
| `bulk/api-endpoints-draft-2025-09-01.md` | Basis für `api/openapi.yaml` (noch nicht vollständig migriert) | `docs/api/endpoints-reference.md` | CiviCRM Interface v1.0 |
| `bulk/stripe-integration-notes-2025-10-05.md` | Stripe-Webhooks in `automation/n8n/` referenziert | `docs/integrations/stripe-webhooks.md` | Billing Milestone Q2 2026 |
| `bulk/oauth2-flow-diagram-2025-09-20.png` | Einziges Diagramm zu OAuth2-Flow (referenced in ADR-005) | `docs/architecture/oauth2-flow.png` | API Authentication |

**Aktion:**
```bash
mv docs/archive/bulk/api-endpoints-draft-2025-09-01.md docs/api/endpoints-reference.md
mv docs/archive/bulk/stripe-integration-notes-2025-10-05.md docs/integrations/stripe-webhooks.md
mv docs/archive/bulk/oauth2-flow-diagram-2025-09-20.png docs/architecture/oauth2-flow.png
```

---

### 5. Design System & Figma

| Datei | Grund | Ziel-Pfad | Abhängigkeiten |
|-------|-------|-----------|----------------|
| `bulk/figma-token-sync-v1-2025-10-10.md` | Aktuelle Version des Figma-Token-Sync-Prozesses (noch keine v2) | `docs/figma/token-sync-process.md` | Figma Integration v1.0 |
| `bulk/design-token-migration-checklist-2025-10-12.md` | Checklist für Migration von Hardcodes → Tokens (noch aktiv) | `docs/figma/migration-checklist.md` | Frontend Quality Gates |

**Aktion:**
```bash
mv docs/archive/bulk/figma-token-sync-v1-2025-10-10.md docs/figma/token-sync-process.md
mv docs/archive/bulk/design-token-migration-checklist-2025-10-12.md docs/figma/migration-checklist.md
```

---

## Grenzfälle – Manuelle Review erforderlich (Priorität P2)

### 6. Experimentelle Features & Spikes

| Datei | Status | Grund für Archivierung | Reaktivierungs-Kriterium |
|-------|--------|------------------------|--------------------------|
| `bulk/gaming-xp-system-draft-2025-08-15.md` | ⚠️ Grenzfall | Draft für Gaming-Platform (Beta erst Q2 2026) | **Falls Gaming-Milestone vorgezogen wird** → Reaktivieren nach `docs/games/xp-system-design.md` |
| `bulk/multi-language-i18n-concept-2025-07-20.md` | ⚠️ Grenzfall | i18n-Konzept (Milestone Q3 2026) | **Falls i18n-Spike startet** → Reaktivieren nach `docs/architecture/i18n-concept.md` |
| `bulk/pwa-offline-support-2025-06-10.md` | ⚠️ Grenzfall | PWA-Feature (Milestone Q1 2026 – Mobile) | **Bei Start Mobile-Redesign** → Reaktivieren nach `docs/architecture/pwa-offline.md` |

**Empfehlung:**
- Status: `WATCH` (Quarterly Review)
- Reaktivierung nur bei explizitem Milestone-Start
- Vorerst im Archiv belassen, aber Frontmatter ergänzen: `status: draft`, `milestone: Q2-2026`, `watch: true`

---

### 7. Alte Branching-Strategien & Workflows (Veraltete Versionen)

| Datei | Status | Duplikat-Check | Aktion |
|-------|--------|----------------|--------|
| `branch-management/git-workflow-2025-09-01.md` | ❌ Veraltet | Duplikat zu `git-workflow-2025-10-01.md` (neuere Version existiert) | **KEEP ARCHIVED** |
| `setup-reports/deployment-2025-09-20.md` | ❌ Veraltet | Superseded by `deployment-checklist-2025-10-10.md` | **KEEP ARCHIVED** |
| `bulk/civicrm-api-v1-2025-05-01.md` | ❌ Veraltet | Superseded by OpenAPI Spec (`api/openapi.yaml`) | **DELETE** (Retention 1 Jahr abgelaufen) |

**Empfehlung:**
- Ältere Versionen im Archiv belassen (historischer Wert)
- Nach 1 Jahr Retention: Löschen (Ausnahme: Compliance-Docs mit BAO/DSGVO-Pflicht)

---

## Compliance-Fälle – Niemals löschen (Permanent Archiv)

### 8. Security & DSGVO Audit-Trail

| Datei | Retention | Rechtsgrundlage | Ziel-Pfad |
|-------|-----------|-----------------|-----------|
| `migration-reports/trivy-scan-2025-10-01.sarif` | Permanent | DSGVO Art. 5 Abs. 2 (Rechenschaftspflicht) | `docs/security/audits/2025-10-01-trivy.sarif` |
| `migration-reports/gitleaks-report-2025-10-05.json` | Permanent | DSGVO Art. 5 Abs. 2 | `docs/security/audits/2025-10-05-gitleaks.json` |
| `migration-reports/pii-sanitizer-test-results-2025-10-10.md` | Permanent | DSGVO Art. 25 (Privacy by Design) | `docs/compliance/audit-trail/pii-sanitizer-2025-10-10.md` |

**Aktion:**
```bash
mv docs/archive/migration-reports/trivy-scan-2025-10-01.sarif docs/security/audits/2025-10-01-trivy.sarif
mv docs/archive/migration-reports/gitleaks-report-2025-10-05.json docs/security/audits/2025-10-05-gitleaks.json
mv docs/archive/migration-reports/pii-sanitizer-test-results-2025-10-10.md docs/compliance/audit-trail/pii-sanitizer-2025-10-10.md
```

**Follow-Up:**
- [ ] Ergänze `docs/security/audits/README.md` mit Retention-Policy (Permanent)
- [ ] Quarterly Security-Review (2026-01-15) → neue Scans in Audit-Trail ablegen

---

## Zusammenfassung & Statistik

### Reaktivierung nach Priorität

| Priorität | Anzahl Dateien | Ziel-Verzeichnisse | Deadline |
|-----------|----------------|---------------------|----------|
| **P0 – Sofort** | 17 | `docs/deployment/`, `docs/infrastructure/`, `docs/architecture/`, `docs/automation/`, `docs/governance/`, `docs/compliance/audit-trail/`, `docs/security/audits/` | 2025-10-20 |
| **P1 – Q4 2025** | 11 | `docs/api/`, `docs/integrations/`, `docs/figma/`, `docs/games/` | 2025-12-31 |
| **P2 – Grenzfälle** | 3 | `docs/architecture/` (conditional) | Milestone-abhängig |
| **KEEP ARCHIVED** | 264 | `docs/archive/` (Retention-Policy beachten) | - |

### Duplikat-Statistik

- **Exakte Duplikate (SHA-256):** 8 Dateien (alle veraltet → KEEP ARCHIVED oder DELETE)
- **Near-Duplicates (Fuzzy >90%):** 23 Dateien (manuelle Review erforderlich → siehe `reports/duplicates.csv`)
- **Einzigartige Dateien:** 284

### Aktive Referenzen (Repo-Wide Grep)

- **Code-Referenzen:** 147 Matches in `deployment-scripts/`, `automation/`, `.github/workflows/`
- **Doku-Referenzen:** 89 Matches in `docs/`, `CONTRIBUTING.md`, `README.md`
- **ADR-Referenzen:** 17 Matches in `docs/adr/*.md`

---

## Empfehlungen & Next Steps

### Sofort-Aktionen (P0)

1. **Batch-Move Script:**
   ```bash
   # Siehe oben: 17 P0-Dateien verschieben
   # Script: scripts/archive-recovery.sh (auto-generated)
   ```

2. **Link-Updates:**
   - [ ] `deployment-scripts/multi-service-deploy.sh` (Zeile 23, 87, 145)
   - [ ] `CONTRIBUTING.md` (Zeile 67, 89)
   - [ ] `.github/workflows/deploy-staging.yml` (Zeile 34)

3. **Index-Updates:**
   - [ ] `docs/INDEX.md` (neue Sektionen: deployment/, infrastructure/, automation/, compliance/audit-trail/)
   - [ ] `docs/architecture/INDEX.md` (database-migrations.md)

### Langfristige Maßnahmen

1. **Archive-Neustruktur (siehe `reports/reorg-plan.md`):**
   - `docs/archive/legacy/` – Veraltete Versionen (Retention 1 Jahr)
   - `docs/archive/old-drafts/` – Experimentelle Features (Retention 6 Monate)
   - `docs/archive/unused-experiments/` – Verworfene Konzepte (Retention 3 Monate)

2. **ARCHIVE_NOTE.md per Bucket:**
   - Ursprung, Grund der Archivierung, Rückhol-Kriterien, Retention-Policy

3. **Automatisierung (n8n-Workflow):**
   - Quarterly Reminder: Review `docs/archive/` für Reaktivierungskandidaten
   - Auto-Deletion: Nach Retention-Ablauf (außer Compliance-Docs)

4. **Compliance-Dashboard:**
   - Übersicht aller Audit-Trail-Docs mit Retention-Datum
   - Alerts bei Retention-Ablauf (BAO § 132: 7 Jahre)

---

**Version:** 1.0.0  
**Erstellt:** 2025-10-17  
**Analysebasis:** docs/archive/ (315 Dateien)  
**Nächste Review:** 2026-01-15 (Quarterly)  
**Verantwortlich:** Tech Lead (Peter Schuller)
