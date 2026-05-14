#!/bin/bash
# Masterplan backup/restore entrypoint delegating to the automated restore drill.

set -euo pipefail

readonly ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
readonly DRILL_SCRIPT="$ROOT_DIR/scripts/masterplan/run-restore-drill.sh"
readonly LEGACY_MODE="${MASTERPLAN_BACKUP_RESTORE_MODE:-drill}"

if [[ "$LEGACY_MODE" == "static" ]]; then
  readonly BACKUP_DOC="$ROOT_DIR/docs/operations/backup-restore.md"
  readonly RESTORE_RUNBOOK="$ROOT_DIR/runbooks/operations-masterplan/restore-runbook.md"
  readonly BACKUP_EVIDENCE="$ROOT_DIR/reports/masterplan/backup-restore-evidence.md"
  readonly EVIDENCE_LOG="$ROOT_DIR/reports/masterplan/evidence-log.md"

  for path in "$BACKUP_DOC" "$RESTORE_RUNBOOK" "$BACKUP_EVIDENCE" "$EVIDENCE_LOG"; do
    if ! [ -f "$path" ]; then
      echo "Fehlende Backup/Restore-Datei: $path" >&2
      exit 1
    fi
  done

  grep -Fq "RTO" "$BACKUP_EVIDENCE"
  grep -Fq "RTO <= 2 Stunden" "$RESTORE_RUNBOOK"
  grep -Fq "Monatlicher Restore-Test" "$BACKUP_DOC"

  echo "Backup/Restore-Check (static): PASS"
  exit 0
fi

if [[ ! -x "$DRILL_SCRIPT" ]]; then
  chmod +x "$DRILL_SCRIPT"
fi

bash "$DRILL_SCRIPT" "$@"
