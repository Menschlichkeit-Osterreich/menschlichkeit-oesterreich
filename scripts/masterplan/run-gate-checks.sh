#!/bin/bash
# Masterplan Gate-Check Script
set -euo pipefail

EVIDENCE_LOG="reports/masterplan/evidence-log.md"
NO_GO_RULES="config-templates/masterplan-no-go-rules.json"
GO_NO_GO_CHECKLIST="runbooks/operations-masterplan/go-no-go-checklist.md"
LOGGING_POLICY="runbooks/operations-masterplan/logging-and-secrets-policy.md"
ROLE_MATRIX="runbooks/operations-masterplan/role-ownership-matrix.md"
HANDOVER_CHECKLIST="runbooks/operations-masterplan/handover-checklist.md"
SLO_SLA_POLICY="runbooks/operations-masterplan/slo-sla-policy.md"
ESCALATION_POLICY="runbooks/operations-masterplan/escalation-policy.md"
DATA_CLASSIFICATION_POLICY="runbooks/operations-masterplan/data-classification-policy.md"
SECRET_OWNERSHIP_MAP="runbooks/operations-masterplan/secret-ownership-map.md"
DSGVO_LOG_REDACTION_CHECKLIST="runbooks/operations-masterplan/dsgvo-log-redaction-checklist.md"
BACKUP_EVIDENCE="reports/masterplan/backup-restore-evidence.md"
BACKUP_RESTORE_DOC="docs/operations/backup-restore.md"
RESTORE_RUNBOOK="runbooks/operations-masterplan/restore-runbook.md"
BACKUP_RESTORE_GATE=".github/workflows/backup-restore-gate.yml"
FINAL_READINESS="reports/masterplan/final-readiness-report.md"
GO_NO_GO_FINAL="reports/masterplan/go-no-go-final-check.md"
DONATION_REPORT="reports/masterplan/donation-e2e-evidence.md"
DONATION_CONFIG="config-templates/donation-gate-config.json"
DONATION_SMOKE="scripts/masterplan/run-donation-smoke.sh"
RECEIPT_EVIDENCE="scripts/masterplan/collect-receipt-evidence.sh"
DONATION_ARCHIVE="automation/n8n/workflows/donation-webhook-archive.json"
SIGNAL_MATRIX="monitoring/masterplan/signal-matrix.yaml"
ALERT_ROUTING="monitoring/masterplan/alert-routing.yaml"
ALERT_SIMULATION="scripts/masterplan/simulate-critical-alerts.sh"
ACK_SLA_CHECK="scripts/masterplan/verify-alert-ack-sla.sh"
MONITORING_GATE=".github/workflows/monitoring-gate.yml"
DONATION_GATE=".github/workflows/donation-gate.yml"
TERRAFORM_MAIN="deployment-scripts/infra/terraform/main.tf"
TERRAFORM_NETWORK="deployment-scripts/infra/terraform/network.tf"
TERRAFORM_COMPUTE="deployment-scripts/infra/terraform/compute.tf"
TERRAFORM_SECURITY="deployment-scripts/infra/terraform/security.tf"
TERRAFORM_VARIABLES="deployment-scripts/infra/terraform/variables.tf"
DEPLOY_INFRA_SCRIPT="deployment-scripts/deploy-infra-azure.sh"
READINESS_SCRIPT="scripts/masterplan/check-platform-readiness.sh"

FAILURES=0

log_evidence() {
  local phase="$1"
  local gate="$2"
  local result="$3"
  local evidence="$4"
  local comment="$5"

  echo "| $(date +%F) | $phase | $gate | $result | $evidence | $comment |" >> "$EVIDENCE_LOG"
}

ensure_file() {
  local path="$1"
  local phase="$2"
  local gate="$3"
  local description="$4"

  if [ -f "$path" ]; then
    log_evidence "$phase" "$gate" "PASS" "$path" "$description"
    return 0
  fi

  log_evidence "$phase" "$gate" "FAIL" "$path" "$description fehlt"
  FAILURES=$((FAILURES + 1))
  return 1
}

ensure_contains() {
  local path="$1"
  local needle="$2"
  local phase="$3"
  local gate="$4"
  local description="$5"

  if ! [ -f "$path" ]; then
    log_evidence "$phase" "$gate" "FAIL" "$path" "$description: Datei fehlt"
    FAILURES=$((FAILURES + 1))
    return 1
  fi

  if grep -Fq "$needle" "$path"; then
    log_evidence "$phase" "$gate" "PASS" "$path" "$description"
    return 0
  fi

  log_evidence "$phase" "$gate" "FAIL" "$path" "$description nicht nachweisbar"
  FAILURES=$((FAILURES + 1))
  return 1
}

ensure_evidence_log_header() {
  if ! [ -f "$EVIDENCE_LOG" ]; then
    echo "Fehlendes Evidence-Log: $EVIDENCE_LOG" >&2
    exit 1
  fi

  if ! grep -Fq "| Datum" "$EVIDENCE_LOG"; then
    echo "Evidence-Log Header fehlt in $EVIDENCE_LOG" >&2
    exit 1
  fi
}

ensure_evidence_log_header
ensure_file "$NO_GO_RULES" "Foundation" "No-Go-Regeln" "No-Go-Regeln vorhanden"
ensure_contains "$ROLE_MATRIX" "Betriebsleitung" "Phase 2" "Rollenmatrix" "Rollen- und Ownership-Matrix vorhanden"
ensure_contains "$SLO_SLA_POLICY" "Ack-SLA" "Phase 2" "SLO/SLA" "SLO/SLA-Policy vorhanden"
ensure_contains "$LOGGING_POLICY" "Keine Klartext-Secrets" "Phase 2" "Logging" "Logging- und Secrets-Policy vorhanden"
ensure_contains "$ESCALATION_POLICY" "Eskalationsstufen" "Phase 2" "Escalation" "Escalation-Policy vorhanden"

# NG-001: Terraform Apply mit Fehlern
ensure_file "$TERRAFORM_MAIN" "US1" "NG-001 Terraform Apply" "Terraform-Hauptdatei vorhanden"
ensure_file "$TERRAFORM_NETWORK" "US1" "NG-001 Terraform Apply" "Terraform-Netzwerkdatei vorhanden"
ensure_file "$TERRAFORM_COMPUTE" "US1" "NG-001 Terraform Apply" "Terraform-Compute-Datei vorhanden"
ensure_file "$TERRAFORM_SECURITY" "US1" "NG-001 Terraform Apply" "Terraform-Security-Datei vorhanden"
ensure_file "$TERRAFORM_VARIABLES" "US1" "NG-001 Terraform Apply" "Terraform-Variablen-Datei vorhanden"
ensure_file "$DEPLOY_INFRA_SCRIPT" "US1" "NG-001 Terraform Apply" "Infra-Deploy-Skript vorhanden"
ensure_file "$READINESS_SCRIPT" "US1" "NG-001 Terraform Apply" "Readiness-Skript vorhanden"

# NG-002: Expositionsregel verletzt (API/n8n öffentlich)
ensure_contains "$GO_NO_GO_CHECKLIST" "Expositionsregel (nur Proxy öffentlich) technisch validiert" "US1" "NG-002 Expositionsregel" "Expositionsregel in Checkliste dokumentiert"
ensure_contains "$GO_NO_GO_FINAL" "Expositionsregel" "US1" "NG-002 Expositionsregel" "Expositionsregel im Final-Check nachgewiesen"

# NG-003: Monitoring nicht aktiviert
ensure_contains "runbooks/operations-masterplan/gate-criteria-catalog.md" "Monitoring aktiviert" "US1" "NG-003 Monitoring" "Monitoring-Gate definiert"
ensure_contains "$FINAL_READINESS" "Monitoring" "US1" "NG-003 Monitoring" "Monitoring-Status im Readiness-Report enthalten"

# NG-004: Backup-Strategie fehlt oder nicht getestet
ensure_contains "$GO_NO_GO_CHECKLIST" "Backup- und Restore-Strategie dokumentiert und getestet" "US1" "NG-004 Backup" "Backup/Restore-Kriterium dokumentiert"
ensure_contains "$BACKUP_EVIDENCE" "Restore-Test" "US1" "NG-004 Backup" "Restore-Test nachgewiesen"
ensure_contains "$BACKUP_RESTORE_DOC" "Monatlicher Restore-Test" "US6" "Backup/Restore" "Backup/Restore-Dokumentation vorhanden"
ensure_contains "$RESTORE_RUNBOOK" "Restore-Test (Pflicht)" "US6" "Backup/Restore" "Restore-Runbook vorhanden"
ensure_file "$BACKUP_RESTORE_GATE" "US6" "Backup/Restore" "Backup/Restore-Gate-Workflow vorhanden"

# NG-005: DSGVO/Secret-Redaction nicht erfüllt
ensure_contains "$LOGGING_POLICY" "Keine Klartext-Secrets oder Zugangsdaten in Logs" "US1" "NG-005 Compliance" "Secrets-Redaction-Regel vorhanden"
ensure_contains "$GO_NO_GO_FINAL" "DSGVO" "US1" "NG-005 Compliance" "DSGVO-Status im Final-Check dokumentiert"
ensure_file "$DATA_CLASSIFICATION_POLICY" "US3" "DSGVO" "Data-Classification-Policy vorhanden"
ensure_file "$SECRET_OWNERSHIP_MAP" "US3" "DSGVO" "Secret-Ownership-Map vorhanden"
ensure_file "$DSGVO_LOG_REDACTION_CHECKLIST" "US3" "DSGVO" "DSGVO-Log-Redaction-Checkliste vorhanden"

# NG-006: Donation-End-to-End-Test fehlgeschlagen
ensure_contains "$DONATION_REPORT" "PASS" "US1" "NG-006 Donation E2E" "Donation-E2E als PASS dokumentiert"
ensure_file "$DONATION_CONFIG" "US2" "NG-006 Donation E2E" "Donation-Gate-Config vorhanden"
ensure_file "$DONATION_SMOKE" "US2" "NG-006 Donation E2E" "Donation-Smoke-Skript vorhanden"
ensure_file "$RECEIPT_EVIDENCE" "US2" "NG-006 Donation E2E" "Receipt-Evidence-Skript vorhanden"
ensure_file "$DONATION_ARCHIVE" "US2" "NG-006 Donation E2E" "Webhook-Archiv vorhanden"

# NG-007: Evidence-Logs unvollständig
ensure_contains "$EVIDENCE_LOG" "NG-001" "US1" "NG-007 Evidence" "Evidence enthält NG-001 Eintrag"
ensure_contains "$EVIDENCE_LOG" "NG-006" "US1" "NG-007 Evidence" "Evidence enthält NG-006 Eintrag"

# NG-008: Betriebsübergabe-Checkliste nicht erfüllt
ensure_file "$HANDOVER_CHECKLIST" "US1" "NG-008 Handover" "Betriebsübergabe-Checkliste vorhanden"
if grep -Eq "Betriebs(ü|ue)bergabe" "$GO_NO_GO_FINAL"; then
  log_evidence "US1" "NG-008 Handover" "PASS" "$GO_NO_GO_FINAL" "Betriebsübergabe im Final-Check dokumentiert"
else
  log_evidence "US1" "NG-008 Handover" "FAIL" "$GO_NO_GO_FINAL" "Betriebsübergabe im Final-Check nicht nachweisbar"
  FAILURES=$((FAILURES + 1))
fi
ensure_contains "$ROLE_MATRIX" "Vertretung" "US1" "NG-008 Handover" "Vertretungsregel in Rollenmatrix dokumentiert"

ensure_file "$SIGNAL_MATRIX" "US5" "Monitoring" "Signal-Matrix vorhanden"
ensure_file "$ALERT_ROUTING" "US5" "Monitoring" "Alert-Routing vorhanden"
ensure_file "$ALERT_SIMULATION" "US5" "Monitoring" "Alert-Simulation-Skript vorhanden"
ensure_file "$ACK_SLA_CHECK" "US5" "Monitoring" "Ack-SLA-Check vorhanden"
ensure_file "$MONITORING_GATE" "US5" "Monitoring" "Monitoring-Gate-Workflow vorhanden"

if ! grep -Fq "Monitoring und Alerting aktiviert" "$GO_NO_GO_CHECKLIST"; then
  log_evidence "US5" "Monitoring" "FAIL" "$GO_NO_GO_CHECKLIST" "Monitoring-Kriterium nicht nachweisbar"
  FAILURES=$((FAILURES + 1))
fi

if [ "$FAILURES" -gt 0 ]; then
  log_evidence "US1" "Masterplan Gates" "FAIL" "$EVIDENCE_LOG" "$FAILURES Gate-Check(s) fehlgeschlagen"
  echo "Masterplan Gate Checks fehlgeschlagen: $FAILURES Problem(e)." >&2
  exit 1
fi

log_evidence "US1" "Masterplan Gates" "PASS" "$EVIDENCE_LOG" "Alle NG-Checks erfüllt"
echo "Masterplan Gate Checks erfolgreich."
exit 0
