# Evidence Log – Masterplan Infrastruktur & Donation

Dieses Log dokumentiert alle Nachweise, Gate-Checks und kritischen Ereignisse im Rahmen des Infrastruktur- und Donation-Masterplans.

## Phase 1 Basis

Die ersten Phase-1-Artefakte wurden angelegt und dienen als Grundlage fuer die weitere Umsetzung:

- Runbooks: `runbooks/operations-masterplan/`
- IaC-Basis: `deployment-scripts/infra/terraform/`
- Monitoring-Basis: `monitoring/masterplan/`
- Evidence-Log und Go-/No-Go-Vorlagen: `reports/masterplan/` und `runbooks/operations-masterplan/`

## Struktur

| Datum       | Phase/User Story | Gate/Check         | Ergebnis | Evidenz/Link                | Kommentar           |
|-------------|------------------|--------------------|----------|-----------------------------|---------------------|
| YYYY-MM-DD  | US1              | Plattform-Readiness| PASS     | ./readiness-report.md       |                     |

## Hinweise
- Jede Gate-Prüfung und jeder kritische Vorfall ist hier zu dokumentieren.
- Links zu Reports, Screenshots oder externen Nachweisen ergänzen.
- Dieses Log ist revisionssicher zu führen.
| 2026-05-14 | Foundation | No-Go-Regeln | PASS | config-templates/masterplan-no-go-rules.json | No-Go-Regeln vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | FAIL | deployment-scripts/infra/terraform | Terraform-Verzeichnis oder .tf-Dateien fehlen |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Expositionsregel in Checkliste dokumentiert |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | reports/masterplan/go-no-go-final-check.md | Expositionsregel im Final-Check nachgewiesen |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | runbooks/operations-masterplan/gate-criteria-catalog.md | Monitoring-Gate definiert |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | reports/masterplan/final-readiness-report.md | Monitoring-Status im Readiness-Report enthalten |
| 2026-05-14 | US1 | NG-004 Backup | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Backup/Restore-Kriterium dokumentiert |
| 2026-05-14 | US1 | NG-004 Backup | PASS | reports/masterplan/backup-restore-evidence.md | Restore-Test nachgewiesen |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | runbooks/operations-masterplan/logging-and-secrets-policy.md | Secrets-Redaction-Regel vorhanden |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | reports/masterplan/go-no-go-final-check.md | DSGVO-Status im Final-Check dokumentiert |
| 2026-05-14 | US1 | NG-006 Donation E2E | PASS | reports/masterplan/donation-e2e-evidence.md | Donation-E2E als PASS dokumentiert |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-001 Eintrag |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-006 Eintrag |
| 2026-05-14 | US1 | NG-008 Handover | PASS | runbooks/operations-masterplan/handover-checklist.md | Betriebsübergabe-Checkliste vorhanden |
| 2026-05-14 | US1 | NG-008 Handover | FAIL | reports/masterplan/go-no-go-final-check.md | Betriebsübergabe im Final-Check dokumentiert nicht nachweisbar |
| 2026-05-14 | Foundation | No-Go-Regeln | PASS | config-templates/masterplan-no-go-rules.json | No-Go-Regeln vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | FAIL | deployment-scripts/infra/terraform | Terraform-Verzeichnis oder .tf-Dateien fehlen |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Expositionsregel in Checkliste dokumentiert |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | reports/masterplan/go-no-go-final-check.md | Expositionsregel im Final-Check nachgewiesen |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | runbooks/operations-masterplan/gate-criteria-catalog.md | Monitoring-Gate definiert |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | reports/masterplan/final-readiness-report.md | Monitoring-Status im Readiness-Report enthalten |
| 2026-05-14 | US1 | NG-004 Backup | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Backup/Restore-Kriterium dokumentiert |
| 2026-05-14 | US1 | NG-004 Backup | PASS | reports/masterplan/backup-restore-evidence.md | Restore-Test nachgewiesen |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | runbooks/operations-masterplan/logging-and-secrets-policy.md | Secrets-Redaction-Regel vorhanden |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | reports/masterplan/go-no-go-final-check.md | DSGVO-Status im Final-Check dokumentiert |
| 2026-05-14 | US1 | NG-006 Donation E2E | PASS | reports/masterplan/donation-e2e-evidence.md | Donation-E2E als PASS dokumentiert |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-001 Eintrag |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-006 Eintrag |
| 2026-05-14 | US1 | NG-008 Handover | PASS | runbooks/operations-masterplan/handover-checklist.md | Betriebsübergabe-Checkliste vorhanden |
| 2026-05-14 | US1 | NG-008 Handover | FAIL | reports/masterplan/go-no-go-final-check.md | Betriebsübergabe im Final-Check dokumentiert nicht nachweisbar |
| 2026-05-14 | Foundation | No-Go-Regeln | PASS | config-templates/masterplan-no-go-rules.json | No-Go-Regeln vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | FAIL | deployment-scripts/infra/terraform | Terraform-Verzeichnis oder .tf-Dateien fehlen |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Expositionsregel in Checkliste dokumentiert |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | reports/masterplan/go-no-go-final-check.md | Expositionsregel im Final-Check nachgewiesen |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | runbooks/operations-masterplan/gate-criteria-catalog.md | Monitoring-Gate definiert |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | reports/masterplan/final-readiness-report.md | Monitoring-Status im Readiness-Report enthalten |
| 2026-05-14 | US1 | NG-004 Backup | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Backup/Restore-Kriterium dokumentiert |
| 2026-05-14 | US1 | NG-004 Backup | PASS | reports/masterplan/backup-restore-evidence.md | Restore-Test nachgewiesen |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | runbooks/operations-masterplan/logging-and-secrets-policy.md | Secrets-Redaction-Regel vorhanden |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | reports/masterplan/go-no-go-final-check.md | DSGVO-Status im Final-Check dokumentiert |
| 2026-05-14 | US1 | NG-006 Donation E2E | PASS | reports/masterplan/donation-e2e-evidence.md | Donation-E2E als PASS dokumentiert |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-001 Eintrag |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-006 Eintrag |
| 2026-05-14 | US1 | NG-008 Handover | PASS | runbooks/operations-masterplan/handover-checklist.md | Betriebsübergabe-Checkliste vorhanden |
| 2026-05-14 | US1 | NG-008 Handover | FAIL | reports/masterplan/go-no-go-final-check.md | Betriebsübergabe im Final-Check dokumentiert nicht nachweisbar |
| 2026-05-14 | Foundation | No-Go-Regeln | PASS | config-templates/masterplan-no-go-rules.json | No-Go-Regeln vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform | Terraform-Verzeichnis und .tf-Dateien vorhanden |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Expositionsregel in Checkliste dokumentiert |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | reports/masterplan/go-no-go-final-check.md | Expositionsregel im Final-Check nachgewiesen |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | runbooks/operations-masterplan/gate-criteria-catalog.md | Monitoring-Gate definiert |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | reports/masterplan/final-readiness-report.md | Monitoring-Status im Readiness-Report enthalten |
| 2026-05-14 | US1 | NG-004 Backup | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Backup/Restore-Kriterium dokumentiert |
| 2026-05-14 | US1 | NG-004 Backup | PASS | reports/masterplan/backup-restore-evidence.md | Restore-Test nachgewiesen |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | runbooks/operations-masterplan/logging-and-secrets-policy.md | Secrets-Redaction-Regel vorhanden |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | reports/masterplan/go-no-go-final-check.md | DSGVO-Status im Final-Check dokumentiert |
| 2026-05-14 | US1 | NG-006 Donation E2E | PASS | reports/masterplan/donation-e2e-evidence.md | Donation-E2E als PASS dokumentiert |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-001 Eintrag |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-006 Eintrag |
| 2026-05-14 | US1 | NG-008 Handover | PASS | runbooks/operations-masterplan/handover-checklist.md | Betriebsübergabe-Checkliste vorhanden |
| 2026-05-14 | US1 | NG-008 Handover | PASS | reports/masterplan/go-no-go-final-check.md | Betriebsübergabe im Final-Check dokumentiert |
| 2026-05-14 | US1 | NG-008 Handover | PASS | runbooks/operations-masterplan/role-ownership-matrix.md | Vertretungsregel in Rollenmatrix dokumentiert |
| 2026-05-14 | US1 | Masterplan Gates | PASS | reports/masterplan/evidence-log.md | Alle NG-Checks erfüllt |
| 2026-05-14 | Foundation | No-Go-Regeln | PASS | config-templates/masterplan-no-go-rules.json | No-Go-Regeln vorhanden |
| 2026-05-14 | Phase 2 | Rollenmatrix | PASS | runbooks/operations-masterplan/role-ownership-matrix.md | Rollen- und Ownership-Matrix vorhanden |
| 2026-05-14 | Phase 2 | SLO/SLA | PASS | runbooks/operations-masterplan/slo-sla-policy.md | SLO/SLA-Policy vorhanden |
| 2026-05-14 | Phase 2 | Logging | PASS | runbooks/operations-masterplan/logging-and-secrets-policy.md | Logging- und Secrets-Policy vorhanden |
| 2026-05-14 | Phase 2 | Escalation | PASS | runbooks/operations-masterplan/escalation-policy.md | Escalation-Policy vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/main.tf | Terraform-Hauptdatei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/network.tf | Terraform-Netzwerkdatei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/compute.tf | Terraform-Compute-Datei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/security.tf | Terraform-Security-Datei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/variables.tf | Terraform-Variablen-Datei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/deploy-infra-azure.sh | Infra-Deploy-Skript vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | scripts/masterplan/check-platform-readiness.sh | Readiness-Skript vorhanden |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Expositionsregel in Checkliste dokumentiert |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | reports/masterplan/go-no-go-final-check.md | Expositionsregel im Final-Check nachgewiesen |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | runbooks/operations-masterplan/gate-criteria-catalog.md | Monitoring-Gate definiert |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | reports/masterplan/final-readiness-report.md | Monitoring-Status im Readiness-Report enthalten |
| 2026-05-14 | US1 | NG-004 Backup | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Backup/Restore-Kriterium dokumentiert |
| 2026-05-14 | US1 | NG-004 Backup | PASS | reports/masterplan/backup-restore-evidence.md | Restore-Test nachgewiesen |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | runbooks/operations-masterplan/logging-and-secrets-policy.md | Secrets-Redaction-Regel vorhanden |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | reports/masterplan/go-no-go-final-check.md | DSGVO-Status im Final-Check dokumentiert |
| 2026-05-14 | US3 | DSGVO | PASS | runbooks/operations-masterplan/data-classification-policy.md | Data-Classification-Policy vorhanden |
| 2026-05-14 | US3 | DSGVO | PASS | runbooks/operations-masterplan/secret-ownership-map.md | Secret-Ownership-Map vorhanden |
| 2026-05-14 | US3 | DSGVO | PASS | runbooks/operations-masterplan/dsgvo-log-redaction-checklist.md | DSGVO-Log-Redaction-Checkliste vorhanden |
| 2026-05-14 | US1 | NG-006 Donation E2E | PASS | reports/masterplan/donation-e2e-evidence.md | Donation-E2E als PASS dokumentiert |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | config-templates/donation-gate-config.json | Donation-Gate-Config vorhanden |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | scripts/masterplan/run-donation-smoke.sh | Donation-Smoke-Skript vorhanden |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | scripts/masterplan/collect-receipt-evidence.sh | Receipt-Evidence-Skript vorhanden |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | automation/n8n/workflows/donation-webhook-archive.json | Webhook-Archiv vorhanden |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-001 Eintrag |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-006 Eintrag |
| 2026-05-14 | US1 | NG-008 Handover | PASS | runbooks/operations-masterplan/handover-checklist.md | Betriebsübergabe-Checkliste vorhanden |
| 2026-05-14 | US1 | NG-008 Handover | PASS | reports/masterplan/go-no-go-final-check.md | Betriebsübergabe im Final-Check dokumentiert |
| 2026-05-14 | US1 | NG-008 Handover | PASS | runbooks/operations-masterplan/role-ownership-matrix.md | Vertretungsregel in Rollenmatrix dokumentiert |
| 2026-05-14 | US5 | Monitoring | PASS | monitoring/masterplan/signal-matrix.yaml | Signal-Matrix vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | monitoring/masterplan/alert-routing.yaml | Alert-Routing vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | scripts/masterplan/simulate-critical-alerts.sh | Alert-Simulation-Skript vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | scripts/masterplan/verify-alert-ack-sla.sh | Ack-SLA-Check vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | .github/workflows/monitoring-gate.yml | Monitoring-Gate-Workflow vorhanden |
| 2026-05-14 | US1 | Masterplan Gates | PASS | reports/masterplan/evidence-log.md | Alle NG-Checks erfüllt |
| 2026-05-14 | Foundation | No-Go-Regeln | PASS | config-templates/masterplan-no-go-rules.json | No-Go-Regeln vorhanden |
| 2026-05-14 | Phase 2 | Rollenmatrix | PASS | runbooks/operations-masterplan/role-ownership-matrix.md | Rollen- und Ownership-Matrix vorhanden |
| 2026-05-14 | Phase 2 | SLO/SLA | PASS | runbooks/operations-masterplan/slo-sla-policy.md | SLO/SLA-Policy vorhanden |
| 2026-05-14 | Phase 2 | Logging | PASS | runbooks/operations-masterplan/logging-and-secrets-policy.md | Logging- und Secrets-Policy vorhanden |
| 2026-05-14 | Phase 2 | Escalation | PASS | runbooks/operations-masterplan/escalation-policy.md | Escalation-Policy vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/main.tf | Terraform-Hauptdatei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/network.tf | Terraform-Netzwerkdatei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/compute.tf | Terraform-Compute-Datei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/security.tf | Terraform-Security-Datei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/variables.tf | Terraform-Variablen-Datei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/deploy-infra-azure.sh | Infra-Deploy-Skript vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | scripts/masterplan/check-platform-readiness.sh | Readiness-Skript vorhanden |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Expositionsregel in Checkliste dokumentiert |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | reports/masterplan/go-no-go-final-check.md | Expositionsregel im Final-Check nachgewiesen |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | runbooks/operations-masterplan/gate-criteria-catalog.md | Monitoring-Gate definiert |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | reports/masterplan/final-readiness-report.md | Monitoring-Status im Readiness-Report enthalten |
| 2026-05-14 | US1 | NG-004 Backup | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Backup/Restore-Kriterium dokumentiert |
| 2026-05-14 | US1 | NG-004 Backup | PASS | reports/masterplan/backup-restore-evidence.md | Restore-Test nachgewiesen |
| 2026-05-14 | US6 | Backup/Restore | PASS | docs/operations/backup-restore.md | Backup/Restore-Dokumentation vorhanden |
| 2026-05-14 | US6 | Backup/Restore | PASS | runbooks/operations-masterplan/restore-runbook.md | Restore-Runbook vorhanden |
| 2026-05-14 | US6 | Backup/Restore | PASS | .github/workflows/backup-restore-gate.yml | Backup/Restore-Gate-Workflow vorhanden |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | runbooks/operations-masterplan/logging-and-secrets-policy.md | Secrets-Redaction-Regel vorhanden |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | reports/masterplan/go-no-go-final-check.md | DSGVO-Status im Final-Check dokumentiert |
| 2026-05-14 | US3 | DSGVO | PASS | runbooks/operations-masterplan/data-classification-policy.md | Data-Classification-Policy vorhanden |
| 2026-05-14 | US3 | DSGVO | PASS | runbooks/operations-masterplan/secret-ownership-map.md | Secret-Ownership-Map vorhanden |
| 2026-05-14 | US3 | DSGVO | PASS | runbooks/operations-masterplan/dsgvo-log-redaction-checklist.md | DSGVO-Log-Redaction-Checkliste vorhanden |
| 2026-05-14 | US1 | NG-006 Donation E2E | PASS | reports/masterplan/donation-e2e-evidence.md | Donation-E2E als PASS dokumentiert |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | config-templates/donation-gate-config.json | Donation-Gate-Config vorhanden |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | scripts/masterplan/run-donation-smoke.sh | Donation-Smoke-Skript vorhanden |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | scripts/masterplan/collect-receipt-evidence.sh | Receipt-Evidence-Skript vorhanden |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | automation/n8n/workflows/donation-webhook-archive.json | Webhook-Archiv vorhanden |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-001 Eintrag |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-006 Eintrag |
| 2026-05-14 | US1 | NG-008 Handover | PASS | runbooks/operations-masterplan/handover-checklist.md | Betriebsübergabe-Checkliste vorhanden |
| 2026-05-14 | US1 | NG-008 Handover | PASS | reports/masterplan/go-no-go-final-check.md | Betriebsübergabe im Final-Check dokumentiert |
| 2026-05-14 | US1 | NG-008 Handover | PASS | runbooks/operations-masterplan/role-ownership-matrix.md | Vertretungsregel in Rollenmatrix dokumentiert |
| 2026-05-14 | US5 | Monitoring | PASS | monitoring/masterplan/signal-matrix.yaml | Signal-Matrix vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | monitoring/masterplan/alert-routing.yaml | Alert-Routing vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | scripts/masterplan/simulate-critical-alerts.sh | Alert-Simulation-Skript vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | scripts/masterplan/verify-alert-ack-sla.sh | Ack-SLA-Check vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | .github/workflows/monitoring-gate.yml | Monitoring-Gate-Workflow vorhanden |
| 2026-05-14 | US1 | Masterplan Gates | PASS | reports/masterplan/evidence-log.md | Alle NG-Checks erfüllt |
| 2026-05-14 | Foundation | No-Go-Regeln | PASS | config-templates/masterplan-no-go-rules.json | No-Go-Regeln vorhanden |
| 2026-05-14 | Phase 2 | Rollenmatrix | PASS | runbooks/operations-masterplan/role-ownership-matrix.md | Rollen- und Ownership-Matrix vorhanden |
| 2026-05-14 | Phase 2 | SLO/SLA | PASS | runbooks/operations-masterplan/slo-sla-policy.md | SLO/SLA-Policy vorhanden |
| 2026-05-14 | Phase 2 | Logging | PASS | runbooks/operations-masterplan/logging-and-secrets-policy.md | Logging- und Secrets-Policy vorhanden |
| 2026-05-14 | Phase 2 | Escalation | PASS | runbooks/operations-masterplan/escalation-policy.md | Escalation-Policy vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/main.tf | Terraform-Hauptdatei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/network.tf | Terraform-Netzwerkdatei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/compute.tf | Terraform-Compute-Datei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/security.tf | Terraform-Security-Datei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/infra/terraform/variables.tf | Terraform-Variablen-Datei vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | deployment-scripts/deploy-infra-azure.sh | Infra-Deploy-Skript vorhanden |
| 2026-05-14 | US1 | NG-001 Terraform Apply | PASS | scripts/masterplan/check-platform-readiness.sh | Readiness-Skript vorhanden |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Expositionsregel in Checkliste dokumentiert |
| 2026-05-14 | US1 | NG-002 Expositionsregel | PASS | reports/masterplan/go-no-go-final-check.md | Expositionsregel im Final-Check nachgewiesen |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | runbooks/operations-masterplan/gate-criteria-catalog.md | Monitoring-Gate definiert |
| 2026-05-14 | US1 | NG-003 Monitoring | PASS | reports/masterplan/final-readiness-report.md | Monitoring-Status im Readiness-Report enthalten |
| 2026-05-14 | US1 | NG-004 Backup | PASS | runbooks/operations-masterplan/go-no-go-checklist.md | Backup/Restore-Kriterium dokumentiert |
| 2026-05-14 | US1 | NG-004 Backup | PASS | reports/masterplan/backup-restore-evidence.md | Restore-Test nachgewiesen |
| 2026-05-14 | US6 | Backup/Restore | PASS | docs/operations/backup-restore.md | Backup/Restore-Dokumentation vorhanden |
| 2026-05-14 | US6 | Backup/Restore | PASS | runbooks/operations-masterplan/restore-runbook.md | Restore-Runbook vorhanden |
| 2026-05-14 | US6 | Backup/Restore | PASS | .github/workflows/backup-restore-gate.yml | Backup/Restore-Gate-Workflow vorhanden |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | runbooks/operations-masterplan/logging-and-secrets-policy.md | Secrets-Redaction-Regel vorhanden |
| 2026-05-14 | US1 | NG-005 Compliance | PASS | reports/masterplan/go-no-go-final-check.md | DSGVO-Status im Final-Check dokumentiert |
| 2026-05-14 | US3 | DSGVO | PASS | runbooks/operations-masterplan/data-classification-policy.md | Data-Classification-Policy vorhanden |
| 2026-05-14 | US3 | DSGVO | PASS | runbooks/operations-masterplan/secret-ownership-map.md | Secret-Ownership-Map vorhanden |
| 2026-05-14 | US3 | DSGVO | PASS | runbooks/operations-masterplan/dsgvo-log-redaction-checklist.md | DSGVO-Log-Redaction-Checkliste vorhanden |
| 2026-05-14 | US1 | NG-006 Donation E2E | PASS | reports/masterplan/donation-e2e-evidence.md | Donation-E2E als PASS dokumentiert |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | config-templates/donation-gate-config.json | Donation-Gate-Config vorhanden |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | scripts/masterplan/run-donation-smoke.sh | Donation-Smoke-Skript vorhanden |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | scripts/masterplan/collect-receipt-evidence.sh | Receipt-Evidence-Skript vorhanden |
| 2026-05-14 | US2 | NG-006 Donation E2E | PASS | automation/n8n/workflows/donation-webhook-archive.json | Webhook-Archiv vorhanden |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-001 Eintrag |
| 2026-05-14 | US1 | NG-007 Evidence | PASS | reports/masterplan/evidence-log.md | Evidence enthält NG-006 Eintrag |
| 2026-05-14 | US1 | NG-008 Handover | PASS | runbooks/operations-masterplan/handover-checklist.md | Betriebsübergabe-Checkliste vorhanden |
| 2026-05-14 | US1 | NG-008 Handover | PASS | reports/masterplan/go-no-go-final-check.md | Betriebsübergabe im Final-Check dokumentiert |
| 2026-05-14 | US1 | NG-008 Handover | PASS | runbooks/operations-masterplan/role-ownership-matrix.md | Vertretungsregel in Rollenmatrix dokumentiert |
| 2026-05-14 | US5 | Monitoring | PASS | monitoring/masterplan/signal-matrix.yaml | Signal-Matrix vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | monitoring/masterplan/alert-routing.yaml | Alert-Routing vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | scripts/masterplan/simulate-critical-alerts.sh | Alert-Simulation-Skript vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | scripts/masterplan/verify-alert-ack-sla.sh | Ack-SLA-Check vorhanden |
| 2026-05-14 | US5 | Monitoring | PASS | .github/workflows/monitoring-gate.yml | Monitoring-Gate-Workflow vorhanden |
| 2026-05-14 | US1 | Masterplan Gates | PASS | reports/masterplan/evidence-log.md | Alle NG-Checks erfüllt |
