#!/usr/bin/env python3
"""
Best-practice cleanup for Project #2:

  1. Backfill missing Priority (P0/P1/P2) and Wave (wave/A..D-cutover) labels
     using deterministic rules.
  2. Set the project's "Plan Wave" single-select field on every item that has a
     wave/* label.
  3. Set the project's "Workflow Status" field to "Backlog" for every open item
     that has no explicit workflow status yet.

Rules for backfill (only applied to OPEN, non-Done items):

  has only Priority -> Wave from Priority
      P0 -> wave/A-foundation
      P1 -> wave/B-feature-core
      P2 -> wave/C-stabilization

  has only Wave -> Priority from Wave
      wave/A-foundation    -> P0
      wave/B-feature-core  -> P1
      wave/C-stabilization -> P1
      wave/D-cutover       -> P1

  has neither -> from secondary signals
      label spec/secrets-governance      -> P1 + wave/B-feature-core
      label spec/n8n-gate                -> P1 + wave/B-feature-core
      label masterplan                   -> P1 + wave/C-stabilization
      label backlog/legacy               -> P2 + wave/D-cutover
      label spec/speckit-multiapp        -> P2 + wave/D-cutover
      label spec/speckit-repowide        -> P2 + wave/D-cutover
      otherwise                          -> P2 + wave/D-cutover

The script is idempotent. Items that already have valid priority + wave keep them.
"""
from __future__ import annotations
import json
import subprocess
import sys

OWNER = "Menschlichkeit-Osterreich"
REPO = f"{OWNER}/menschlichkeit-oesterreich"
PROJECT_NUMBER = 2
PROJECT_ID = "PVT_kwDODiODFs4BXxSE"

# Field IDs from `gh project field-list 2 --owner ... --format json`
PLAN_WAVE_FIELD_ID = "PVTSSF_lADODiODFs4BXxSEzhS8LLQ"
WORKFLOW_STATUS_FIELD_ID = "PVTSSF_lADODiODFs4BXxSEzhS75TI"

PLAN_WAVE_OPTION = {
    "wave/A-foundation":    "120e17cd",  # Wave A (P0 Critical)
    "wave/B-feature-core":  "d6520e85",  # Wave B (P0/P1 Core)
    "wave/C-stabilization": "6d415d62",  # Wave C (P1 Experience)
    "wave/D-cutover":       "0f496c30",  # Wave D (P1/P2 Hardening)
}
WORKFLOW_BACKLOG_OPTION = "8dbeac7a"  # 📋 Backlog

PRIO_LABELS = {"P0", "P1", "P2"}
WAVE_LABELS = set(PLAN_WAVE_OPTION.keys())

PRIO_TO_WAVE = {
    "P0": "wave/A-foundation",
    "P1": "wave/B-feature-core",
    "P2": "wave/C-stabilization",
}
WAVE_TO_PRIO = {
    "wave/A-foundation":    "P0",
    "wave/B-feature-core":  "P1",
    "wave/C-stabilization": "P1",
    "wave/D-cutover":       "P1",
}

# Signal-based rules for items with neither priority nor wave
NEITHER_RULES: list[tuple[str, str, str]] = [
    # (label, priority, wave)
    ("spec/secrets-governance", "P1", "wave/B-feature-core"),
    ("spec/n8n-gate",           "P1", "wave/B-feature-core"),
    ("masterplan",              "P1", "wave/C-stabilization"),
    ("backlog/legacy",          "P2", "wave/D-cutover"),
    ("spec/speckit-multiapp",   "P2", "wave/D-cutover"),
    ("spec/speckit-repowide",   "P2", "wave/D-cutover"),
]
NEITHER_DEFAULT = ("P2", "wave/D-cutover")


def sh(args: list[str], check: bool = False) -> tuple[int, str, str]:
    r = subprocess.run(args, capture_output=True, text=True)
    if check and r.returncode != 0:
        sys.stderr.write(f"!! {' '.join(args)}\n   {r.stderr.strip()}\n")
    return r.returncode, r.stdout, r.stderr


def load_items() -> list[dict]:
    _, out, _ = sh([
        "gh", "project", "item-list", str(PROJECT_NUMBER),
        "--owner", OWNER, "--format", "json", "--limit", "500",
    ])
    return json.loads(out).get("items", [])


def decide(labels: set[str]) -> tuple[list[str], str | None]:
    """Return (labels_to_add, target_wave_label)."""
    p = labels & PRIO_LABELS
    w = labels & WAVE_LABELS
    add: list[str] = []

    if p and not w:
        prio = sorted(p)[0]  # P0 wins over P1 wins over P2
        add.append(PRIO_TO_WAVE[prio])
    elif w and not p:
        wave = sorted(w)[0]
        add.append(WAVE_TO_PRIO[wave])
    elif not p and not w:
        chosen = NEITHER_DEFAULT
        for lbl, prio, wave in NEITHER_RULES:
            if lbl in labels:
                chosen = (prio, wave)
                break
        add.extend(list(chosen))

    final_w = (labels | set(add)) & WAVE_LABELS
    return add, sorted(final_w)[0] if final_w else None


def main() -> int:
    items = load_items()
    open_items = [it for it in items
                  if it.get("status") != "Done"
                  and it.get("content", {}).get("state") != "CLOSED"]
    print(f"Open items: {len(open_items)}")

    added_labels = 0
    set_wave = 0
    set_status = 0

    for it in open_items:
        c = it.get("content", {})
        num = c.get("number")
        if not num:
            continue
        labels = set(it.get("labels", []) or [])
        item_id = it.get("id")

        # 1. Backfill labels
        to_add, target_wave = decide(labels)
        if to_add:
            print(f"  label #{num}: +{to_add}")
            label_args = []
            for lbl in to_add:
                label_args += ["--add-label", lbl]
            sh(["gh", "issue", "edit", str(num), "--repo", REPO, *label_args])
            added_labels += len(to_add)

        # 2. Set Plan Wave field
        if item_id and target_wave and target_wave in PLAN_WAVE_OPTION:
            rc, _, _ = sh([
                "gh", "project", "item-edit",
                "--project-id", PROJECT_ID,
                "--id", item_id,
                "--field-id", PLAN_WAVE_FIELD_ID,
                "--single-select-option-id", PLAN_WAVE_OPTION[target_wave],
            ])
            if rc == 0:
                set_wave += 1

        # 3. Set Workflow Status to Backlog when not already set
        if item_id:
            current_ws = it.get("workflow Status") or it.get("workflowStatus") or ""
            if not current_ws:
                rc, _, _ = sh([
                    "gh", "project", "item-edit",
                    "--project-id", PROJECT_ID,
                    "--id", item_id,
                    "--field-id", WORKFLOW_STATUS_FIELD_ID,
                    "--single-select-option-id", WORKFLOW_BACKLOG_OPTION,
                ])
                if rc == 0:
                    set_status += 1

    print()
    print(f"Added labels       : {added_labels}")
    print(f"Plan Wave set      : {set_wave}")
    print(f"Workflow Status set: {set_status}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
