#!/usr/bin/env bash
set -euo pipefail

CSV_PATH="${1:-quality-reports/rotation-evidence-pr0/01-secrets-production-rotation-tracking.csv}"

if [[ ! -f "$CSV_PATH" ]]; then
  echo "GATE FAIL: CSV not found: $CSV_PATH" >&2
  exit 2
fi

python3 - "$CSV_PATH" <<'PY'
import csv
import sys

csv_path = sys.argv[1]
required_header = [
    "group",
    "secret_family",
    "target_system",
    "owner",
    "status",
    "evidence",
    "timestamp",
    "operator",
    "refs",
]

critical_groups = {"aktiv produktiv", "unbekannt"}
allowed_status = {"offen", "bestaetigt"}

open_total = 0
open_by_group = {"aktiv produktiv": 0, "unbekannt": 0}
invalid_rows = []

with open(csv_path, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    if reader.fieldnames != required_header:
        print("GATE FAIL: Invalid CSV header/order.", file=sys.stderr)
        print(f"Expected: {required_header}", file=sys.stderr)
        print(f"Actual:   {reader.fieldnames}", file=sys.stderr)
        sys.exit(2)

    for line_no, row in enumerate(reader, start=2):
        group = (row.get("group") or "").strip()
        status = (row.get("status") or "").strip()
        refs = row.get("refs") or ""

        if status not in allowed_status:
            invalid_rows.append(f"line {line_no}: invalid status '{status}'")

        ref_value = refs.strip().strip('"')
        if " " in ref_value:
            invalid_rows.append(f"line {line_no}: refs must not contain spaces")

        if group in critical_groups and status == "offen":
            open_total += 1
            open_by_group[group] += 1

if invalid_rows:
    print("GATE FAIL: Invalid CSV content.", file=sys.stderr)
    for item in invalid_rows:
        print(f"- {item}", file=sys.stderr)
    sys.exit(2)

if open_total > 0:
    print("GATE FAIL: open entries detected in blocked groups.", file=sys.stderr)
    print(f"- aktiv produktiv: {open_by_group['aktiv produktiv']}", file=sys.stderr)
    print(f"- unbekannt: {open_by_group['unbekannt']}", file=sys.stderr)
    print("Action: complete rotation evidence and set status=bestaetigt before ref delete/rewrite.", file=sys.stderr)
    sys.exit(1)

print("GATE PASS: all entries in groups 'aktiv produktiv' and 'unbekannt' are bestaetigt.")
sys.exit(0)
PY