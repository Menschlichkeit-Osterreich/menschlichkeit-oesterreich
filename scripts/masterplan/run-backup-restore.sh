#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
BACKUP_DOC="$ROOT_DIR/docs/operations/backup-restore.md"
RESTORE_RUNBOOK="$ROOT_DIR/runbooks/operations-masterplan/restore-runbook.md"
BACKUP_EVIDENCE="$ROOT_DIR/reports/masterplan/backup-restore-evidence.md"
EVIDENCE_LOG="$ROOT_DIR/reports/masterplan/evidence-log.md"

for path in "$BACKUP_DOC" "$RESTORE_RUNBOOK" "$BACKUP_EVIDENCE" "$EVIDENCE_LOG"; do
  if ! [ -f "$path" ]; then
    echo "Fehlende Backup/Restore-Datei: $path" >&2
    exit 1
  fi
done

grep -Fq "Restore-Test: PASS" "$BACKUP_EVIDENCE"
grep -Fq "RTO <= 2 Stunden" "$RESTORE_RUNBOOK"
grep -Fq "Monatlicher Restore-Test" "$BACKUP_DOC"

echo "Backup/Restore-Check: PASS"
