#!/usr/bin/env python3
"""
Re-number and structure all OPEN items in GitHub Project #2 (Menschlichkeit Oesterreich
- Operative Reife) so a logical execution order emerges.

Order key:
  1. priority   P0 -> P1 -> P2 -> none
  2. wave       A  -> B  -> C  -> D-cutover -> E -> none
  3. spec       spec/forum-eigenbau, spec/crm-auslagerung, spec/secrets-governance,
                spec/speckit-multiapp, spec/speckit-repowide, spec/masterplan,
                spec/n8n-gate, masterplan, none
  4. service    api, website, crm, forum, babylon-game, cross, none
  5. issue#     ascending

Actions per open item (skipping closed/Done items):
  - Prefix title with "[NNN] " (NNN = 3-digit sequence). Existing [NNN] prefix is
    stripped first so re-runs are idempotent.
  - Set "Plan Wave" field on the project item if a wave/* label is present.

Safe to re-run: idempotent on both title prefix and Plan Wave value.
"""
from __future__ import annotations
import json
import re
import subprocess
import sys

OWNER = "Menschlichkeit-Osterreich"
REPO = f"{OWNER}/menschlichkeit-oesterreich"
PROJECT_NUMBER = 2
PROJECT_ID = "PVT_kwDODiODFs4BXxSE"
PLAN_WAVE_FIELD_ID = "PVTSSF_lADODiODFs4BXxSEzhS8LLQ"

WAVE_OPTION = {
    "wave/A-foundation":    "120e17cd",  # Wave A (P0 Critical)
    "wave/B-feature-core":  "d6520e85",  # Wave B (P0/P1 Core)
    "wave/C-stabilization": "6d415d62",  # Wave C (P1 Experience)
    "wave/D-cutover":       "0f496c30",  # Wave D (P1/P2 Hardening)
}

PRIO_RANK = {"P0": 0, "P1": 1, "P2": 2}
WAVE_RANK = {
    "wave/A-foundation":    0,
    "wave/B-feature-core":  1,
    "wave/C-stabilization": 2,
    "wave/D-cutover":       3,
}
SPEC_RANK = {
    "spec/forum-eigenbau":   0,
    "spec/crm-auslagerung":  1,
    "spec/secrets-governance": 2,
    "spec/speckit-multiapp": 3,
    "spec/speckit-repowide": 4,
    "spec/masterplan":       5,
    "spec/n8n-gate":         6,
    "masterplan":            7,
}
SERVICE_RANK = {
    "service/api":          0,
    "service/website":      1,
    "service/crm":          2,
    "service/forum":        3,
    "service/babylon-game": 4,
    "service/cross":        5,
}

PREFIX_RE = re.compile(r"^\[\d{3}\]\s+")


def sh(args: list[str]) -> str:
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(f"!! {' '.join(args)}\n   {r.stderr.strip()}\n")
    return r.stdout


def load_items() -> list[dict]:
    out = sh([
        "gh", "project", "item-list", str(PROJECT_NUMBER),
        "--owner", OWNER, "--format", "json", "--limit", "500",
    ])
    return json.loads(out).get("items", [])


def rank(item: dict) -> tuple:
    labels = item.get("labels", []) or []
    prio = min((PRIO_RANK[l] for l in labels if l in PRIO_RANK), default=9)
    wave = min((WAVE_RANK[l] for l in labels if l in WAVE_RANK), default=9)
    spec = min((SPEC_RANK[l] for l in labels if l in SPEC_RANK), default=9)
    serv = min((SERVICE_RANK[l] for l in labels if l in SERVICE_RANK), default=9)
    num  = item.get("content", {}).get("number", 999999)
    return (prio, wave, spec, serv, num)


def main() -> int:
    items = load_items()
    open_items = [it for it in items if it.get("status") != "Done"
                  and it.get("content", {}).get("state") != "CLOSED"]
    print(f"Open items: {len(open_items)} / total {len(items)}")

    open_items.sort(key=rank)

    for idx, it in enumerate(open_items, start=1):
        c = it.get("content", {})
        num = c.get("number")
        if not num:
            continue
        old_title = c.get("title", "")
        stripped = PREFIX_RE.sub("", old_title)
        new_title = f"[{idx:03d}] {stripped}"

        # 1) retitle if needed
        if new_title != old_title:
            print(f"  retitle #{num}: {new_title[:90]}")
            sh(["gh", "issue", "edit", str(num), "--repo", REPO, "--title", new_title])
        else:
            print(f"  keep    #{num}: {new_title[:90]}")

        # 2) set Plan Wave if a wave label is present and item has an ID
        item_id = it.get("id")
        labels = it.get("labels", []) or []
        wave_opt = next((WAVE_OPTION[l] for l in labels if l in WAVE_OPTION), None)
        if item_id and wave_opt:
            sh([
                "gh", "project", "item-edit",
                "--project-id", PROJECT_ID,
                "--id", item_id,
                "--field-id", PLAN_WAVE_FIELD_ID,
                "--single-select-option-id", wave_opt,
            ])

    print()
    print(f"Done. {len(open_items)} open items numbered and waved.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
