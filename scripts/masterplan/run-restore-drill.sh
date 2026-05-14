#!/bin/bash
# Automated restore drill orchestrator for masterplan evidence.

set -euo pipefail

readonly SCRIPT_NAME="$(basename "$0")"
readonly ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
readonly DRILL_COMPOSE_FILE="$ROOT_DIR/automation/n8n/docker-compose.restore-drill.yml"
readonly REPORT_DIR="$ROOT_DIR/reports/masterplan/restore-drills"
readonly EVIDENCE_LOG="$ROOT_DIR/reports/masterplan/evidence-log.md"
readonly BACKUP_EVIDENCE="$ROOT_DIR/reports/masterplan/backup-restore-evidence.md"
readonly PYTHON_RUNNER="$ROOT_DIR/scripts/run-python.mjs"

readonly RTO_TARGET_SECONDS="${RESTORE_DRILL_RTO_TARGET_SECONDS:-7200}"
readonly DRILL_N8N_BASE_URL="${RESTORE_DRILL_N8N_BASE_URL:-http://localhost:15678}"
readonly DRILL_DB_NAME="${RESTORE_DRILL_DB_NAME:-n8n_drill}"
readonly DRILL_DB_USER="${RESTORE_DRILL_DB_USER:-n8n_user}"
readonly DRILL_DB_PASSWORD="${RESTORE_DRILL_DB_PASSWORD:-restore_drill_dev}"
readonly ENABLE_SMOKE="${RESTORE_DRILL_ENABLE_SMOKE:-false}"
readonly STRICT_MODE="${RESTORE_DRILL_STRICT:-false}"
readonly KEEP_ENV="${RESTORE_DRILL_KEEP_ENV:-false}"
readonly COMPOSE_PROJECT="${RESTORE_DRILL_COMPOSE_PROJECT_NAME:-moe-restore-drill-$(date +%s)}"

TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
REPORT_FILE="$REPORT_DIR/${TIMESTAMP}.md"
WORK_DIR=""
BACKUP_PATH=""
RESTORE_SOURCE=""
RESTORE_FORMAT=""

START_TS=0
END_TS=0
TOTAL_DURATION=0
RESTORE_DURATION=0
RTO_STATUS="n/a"
OVERALL_STATUS="FAIL"
FAIL_REASON=""
SMOKE_SUMMARY="PRE-VALIDATION"
ROUTING_STATUS="PRE-VALIDATION"
GDPR_STATUS="PRE-VALIDATION"
DONATION_STATUS="PRE-VALIDATION"
N8N_DATAPATH_STATUS="FAIL"
N8N_DATAPATH_DETAIL="n/a"

cleanup() {
  if [[ "$KEEP_ENV" != "true" ]]; then
    if command -v docker >/dev/null 2>&1; then
      docker compose -p "$COMPOSE_PROJECT" -f "$DRILL_COMPOSE_FILE" down -v >/dev/null 2>&1 || true
    fi
  fi

  if [[ -n "${WORK_DIR:-}" && -d "$WORK_DIR" ]]; then
    rm -rf "$WORK_DIR"
  fi
}

trap cleanup EXIT

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    FAIL_REASON="Required command missing: $1"
    return 1
  fi
  return 0
}

ensure_dirs() {
  mkdir -p "$REPORT_DIR"
  return 0
}

init_workdir() {
  WORK_DIR="$(mktemp -d "$ROOT_DIR/.restore-drill-${TIMESTAMP}-XXXX")"
  return 0
}

pull_backup() {
  local remote_url="${RESTORE_DRILL_BACKUP_URL:-}"
  local local_backup="${RESTORE_DRILL_BACKUP_FILE:-}"

  if [[ -n "$remote_url" ]]; then
    BACKUP_PATH="$WORK_DIR/backup-from-remote"
    if ! curl -fsSL "$remote_url" -o "$BACKUP_PATH"; then
      FAIL_REASON="Remote backup pull failed"
      return 1
    fi
  elif [[ -n "$local_backup" ]]; then
    if [[ ! -f "$local_backup" ]]; then
      FAIL_REASON="Configured local backup file not found: $local_backup"
      return 1
    fi
    BACKUP_PATH="$WORK_DIR/backup-from-local"
    cp "$local_backup" "$BACKUP_PATH"
  else
    FAIL_REASON="No backup source configured (RESTORE_DRILL_BACKUP_URL or RESTORE_DRILL_BACKUP_FILE)"
    return 2
  fi

  if [[ ! -s "$BACKUP_PATH" ]]; then
    FAIL_REASON="Backup file is empty after pull"
    return 1
  fi

  if file "$BACKUP_PATH" | grep -qi "gzip"; then
    RESTORE_SOURCE="$WORK_DIR/backup.sql"
    if ! gzip -dc "$BACKUP_PATH" >"$RESTORE_SOURCE"; then
      FAIL_REASON="Failed to decompress backup"
      return 1
    fi
  else
    RESTORE_SOURCE="$BACKUP_PATH"
  fi

  if head -c 5 "$RESTORE_SOURCE" 2>/dev/null | grep -q "PGDMP"; then
    RESTORE_FORMAT="custom"
  else
    RESTORE_FORMAT="sql"
  fi

  if [[ ! -s "$RESTORE_SOURCE" ]]; then
    FAIL_REASON="Restore source is empty"
    return 1
  fi

  return 0
}

start_drill_environment() {
  if [[ ! -f "$DRILL_COMPOSE_FILE" ]]; then
    FAIL_REASON="Restore drill compose file missing: $DRILL_COMPOSE_FILE"
    return 1
  fi

  if ! docker compose -p "$COMPOSE_PROJECT" -f "$DRILL_COMPOSE_FILE" up -d postgres-drill n8n-drill; then
    FAIL_REASON="Failed to start restore drill environment"
    return 1
  fi

  local retries=40
  while (( retries > 0 )); do
    if docker compose -p "$COMPOSE_PROJECT" -f "$DRILL_COMPOSE_FILE" exec -T postgres-drill \
      pg_isready -U "$DRILL_DB_USER" -d "$DRILL_DB_NAME" >/dev/null 2>&1; then
      return 0
    fi
    retries=$((retries - 1))
    sleep 2
  done

  FAIL_REASON="PostgreSQL drill container did not become ready"
  return 1
}

restore_backup() {
  local restore_start
  local restore_end
  restore_start=$(date +%s)

  if ! docker compose -p "$COMPOSE_PROJECT" -f "$DRILL_COMPOSE_FILE" exec -T postgres-drill \
    psql -U "$DRILL_DB_USER" -d postgres -v ON_ERROR_STOP=1 \
    -c "DROP DATABASE IF EXISTS \"$DRILL_DB_NAME\";" \
    -c "CREATE DATABASE \"$DRILL_DB_NAME\" OWNER \"$DRILL_DB_USER\";"; then
    FAIL_REASON="Failed to re-create drill database"
    return 1
  fi

  if [[ "$RESTORE_FORMAT" == "custom" ]]; then
    if ! docker compose -p "$COMPOSE_PROJECT" -f "$DRILL_COMPOSE_FILE" exec -T postgres-drill \
      sh -lc "pg_restore -U '$DRILL_DB_USER' --clean --if-exists -d '$DRILL_DB_NAME'" <"$RESTORE_SOURCE"; then
      FAIL_REASON="pg_restore failed"
      return 1
    fi
  else
    if ! docker compose -p "$COMPOSE_PROJECT" -f "$DRILL_COMPOSE_FILE" exec -T postgres-drill \
      psql -U "$DRILL_DB_USER" -d "$DRILL_DB_NAME" -v ON_ERROR_STOP=1 <"$RESTORE_SOURCE"; then
      FAIL_REASON="psql restore failed"
      return 1
    fi
  fi

  restore_end=$(date +%s)
  RESTORE_DURATION=$((restore_end - restore_start))
  return 0
}

validate_n8n_datapath() {
  local env_line
  env_line="$(docker compose -p "$COMPOSE_PROJECT" -f "$DRILL_COMPOSE_FILE" exec -T n8n-drill sh -lc 'echo "${DB_TYPE}|${DB_POSTGRESDB_HOST}|${DB_POSTGRESDB_DATABASE}"' 2>/dev/null || true)"

  if [[ "$env_line" == "postgresdb|postgres-drill|$DRILL_DB_NAME" ]]; then
    N8N_DATAPATH_STATUS="PASS"
    N8N_DATAPATH_DETAIL="$env_line"
    return 0
  fi

  N8N_DATAPATH_STATUS="FAIL"
  N8N_DATAPATH_DETAIL="unexpected datapath: ${env_line:-empty}"
  FAIL_REASON="n8n drill datapath validation failed"
  return 1
}

run_optional_smokes() {
  if [[ "$ENABLE_SMOKE" != "true" ]]; then
    SMOKE_SUMMARY="PRE-VALIDATION"
    ROUTING_STATUS="PRE-VALIDATION"
    GDPR_STATUS="PRE-VALIDATION"
    DONATION_STATUS="PRE-VALIDATION"
    return 0
  fi

  local smoke_failed=0
  SMOKE_SUMMARY="RUNNING"

  if N8N_BASE_URL="$DRILL_N8N_BASE_URL" node "$PYTHON_RUNNER" "$ROOT_DIR/automation/n8n/check-staging-routing.py" --json >/dev/null 2>&1; then
    ROUTING_STATUS="PASS"
  else
    ROUTING_STATUS="FAIL"
    smoke_failed=1
  fi

  if N8N_BASE_URL="$DRILL_N8N_BASE_URL" node "$PYTHON_RUNNER" "$ROOT_DIR/automation/n8n/smoke-test.py" >/dev/null 2>&1; then
    GDPR_STATUS="PASS"
  else
    GDPR_STATUS="FAIL"
    smoke_failed=1
  fi

  if N8N_BASE_URL="$DRILL_N8N_BASE_URL" node "$PYTHON_RUNNER" "$ROOT_DIR/automation/n8n/smoke-test-donation.py" >/dev/null 2>&1; then
    DONATION_STATUS="PASS"
  else
    DONATION_STATUS="FAIL"
    smoke_failed=1
  fi

  if [[ "$smoke_failed" -eq 0 ]]; then
    SMOKE_SUMMARY="PASS"
    return 0
  fi

  SMOKE_SUMMARY="FAIL"
  FAIL_REASON="One or more smoke checks failed"
  return 1
}

ensure_evidence_log() {
  if [[ ! -f "$EVIDENCE_LOG" ]]; then
    mkdir -p "$(dirname "$EVIDENCE_LOG")"
    cat >"$EVIDENCE_LOG" <<'EOF'
# Evidence Log – Masterplan Infrastruktur & Donation

| Datum | Phase/User Story | Gate/Check | Ergebnis | Evidenz/Link | Kommentar |
|-------|------------------|------------|----------|--------------|-----------|
EOF
    return 0
  fi

  if ! grep -Fq "| Datum" "$EVIDENCE_LOG"; then
    cat >>"$EVIDENCE_LOG" <<'EOF'

| Datum | Phase/User Story | Gate/Check | Ergebnis | Evidenz/Link | Kommentar |
|-------|------------------|------------|----------|--------------|-----------|
EOF
  fi
  return 0
}

write_report() {
  mkdir -p "$(dirname "$REPORT_FILE")"

  cat >"$REPORT_FILE" <<EOF
# Restore Drill Report

- Timestamp (UTC): $TIMESTAMP
- Compose project: $COMPOSE_PROJECT
- Overall status: $OVERALL_STATUS
- Failure reason: ${FAIL_REASON:-n/a}

## Timing

- Total duration (s): $TOTAL_DURATION
- Restore duration (s): $RESTORE_DURATION
- RTO target (s): $RTO_TARGET_SECONDS
- RTO status: $RTO_STATUS

## Backup Source

- Pull mode: ${RESTORE_DRILL_BACKUP_URL:+remote}${RESTORE_DRILL_BACKUP_FILE:+local}
- Backup path: ${BACKUP_PATH:-n/a}
- Restore source: ${RESTORE_SOURCE:-n/a}
- Restore format: ${RESTORE_FORMAT:-n/a}

## n8n Data Path Validation

- Status: $N8N_DATAPATH_STATUS
- Detail: $N8N_DATAPATH_DETAIL

## Smoke Checks

- Summary: $SMOKE_SUMMARY
- Routing probe: $ROUTING_STATUS
- GDPR smoke: $GDPR_STATUS
- Donation smoke: $DONATION_STATUS

## Governance Note

Donation-Staging bleibt PRE-VALIDATION / STAGING PENDING. Verbindliche Smoke-Nachweise gegen autoritatives Staging zaehlen erst nach sauberem N8N_BASE_URL- und Secret-Mapping.
EOF

  return 0
}

append_evidence_log() {
  local status_for_log="$OVERALL_STATUS"
  local comment="RTO=${TOTAL_DURATION}s; restore=${RESTORE_DURATION}s; smoke=${SMOKE_SUMMARY}"
  local relative_report="reports/masterplan/restore-drills/$(basename "$REPORT_FILE")"

  ensure_evidence_log
  echo "| $(date +%F) | US6 | Restore-Drill (automated) | $status_for_log | $relative_report | $comment |" >>"$EVIDENCE_LOG"
}

append_backup_restore_evidence() {
  mkdir -p "$(dirname "$BACKUP_EVIDENCE")"
  if [[ ! -f "$BACKUP_EVIDENCE" ]]; then
    cat >"$BACKUP_EVIDENCE" <<'EOF'
# Backup/Restore Evidence – Masterplan
EOF
  fi

  cat >>"$BACKUP_EVIDENCE" <<EOF

## Automated Restore Drill ($TIMESTAMP)

- Restore-Drill: $OVERALL_STATUS
- Drill-Datum (UTC): $TIMESTAMP
- Drill-Dauer: ${TOTAL_DURATION} Sekunden
- Restore-Dauer: ${RESTORE_DURATION} Sekunden
- RTO-Target: <= ${RTO_TARGET_SECONDS} Sekunden
- RTO-Status: $RTO_STATUS
- Smoke-Status: $SMOKE_SUMMARY
- Drill-Report: [reports/masterplan/restore-drills/$(basename "$REPORT_FILE")](restore-drills/$(basename "$REPORT_FILE"))
EOF
}

finalize_status() {
  END_TS=$(date +%s)
  TOTAL_DURATION=$((END_TS - START_TS))

  if [[ "$TOTAL_DURATION" -le "$RTO_TARGET_SECONDS" ]]; then
    RTO_STATUS="PASS"
  else
    RTO_STATUS="FAIL"
  fi

  if [[ "$OVERALL_STATUS" == "PASS" && "$RTO_STATUS" == "FAIL" ]]; then
    OVERALL_STATUS="FAIL"
    FAIL_REASON="RTO target exceeded"
  fi

  write_report
  append_evidence_log
  append_backup_restore_evidence
}

main() {
  START_TS=$(date +%s)
  OVERALL_STATUS="FAIL"

  ensure_dirs
  init_workdir

  require_cmd docker || {
    OVERALL_STATUS="PRE-VALIDATION"
    finalize_status
    return 0
  }
  require_cmd curl || {
    OVERALL_STATUS="PRE-VALIDATION"
    finalize_status
    return 0
  }
  require_cmd node || {
    OVERALL_STATUS="PRE-VALIDATION"
    finalize_status
    return 0
  }

  set +e
  pull_backup
  local rc=$?
  set -e
  if [[ "$rc" -ne 0 ]]; then
    if [[ "$rc" -eq 2 && "$STRICT_MODE" != "true" ]]; then
      OVERALL_STATUS="PRE-VALIDATION"
      SMOKE_SUMMARY="PRE-VALIDATION"
      finalize_status
      return 0
    fi
    OVERALL_STATUS="FAIL"
    finalize_status
    return 1
  fi

  start_drill_environment || {
    OVERALL_STATUS="FAIL"
    finalize_status
    return 1
  }

  restore_backup || {
    OVERALL_STATUS="FAIL"
    finalize_status
    return 1
  }

  validate_n8n_datapath || {
    OVERALL_STATUS="FAIL"
    finalize_status
    return 1
  }

  run_optional_smokes || {
    OVERALL_STATUS="FAIL"
    finalize_status
    return 1
  }

  OVERALL_STATUS="PASS"
  finalize_status
  return 0
}

main "$@"
