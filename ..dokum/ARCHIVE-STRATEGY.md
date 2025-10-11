# Analysis Archive Strategy

_Last updated: 2025-10-05_

## 1. Goal

Keep the root `analysis/` tree lightweight by relocating concluded investigations to `analysis/archive/` with consistent naming, metadata, and reproducibility breadcrumbs.

## 2. Directory Structure

```
analysis/
├─ BACKLOG.json                 # Current items (active)
└─ archive/
   ├─ .gitkeep                  # Ensures directory is tracked
   └─ 20251004-151828-<slug>/   # Timestamped archive folders
```

Each archive folder name combines UTC timestamp (`YYYYMMDD-HHMMSS`) and a slug derived from the provided label or primary file name.

## 3. Archiving Workflow

Use `scripts/archive-analysis.py` to move or copy artefacts.

```bash
# Preview move without touching files
python3 scripts/archive-analysis.py analysis/BACKLOG.json --dry-run --label backlog-cleanup

# Move multiple paths into a single archive folder
python3 scripts/archive-analysis.py analysis/tmp-report.md analysis/traces/ --label sprint-42-cleanup

# Copy instead of move
python3 scripts/archive-analysis.py analysis/research-notes.md --copy --label retention-study
```

- Default behaviour is **move**; add `--copy` if the source should remain untouched.
- The script is idempotent: repeated runs create unique folders by appending a counter suffix.
- All operations resolve from repo root, preventing accidental moves outside the workspace.

## 4. Metadata & Documentation

Include a short `README.md` or `notes.txt` within the archived folder when context is needed. Reference the originating ticket/issue and link to decision records where applicable.

## 5. Scheduling & Automation

1. Add `python3 scripts/archive-analysis.py ...` to the monthly maintenance cron (Phase 1 `Retention Rules`).
2. Pair with `scripts/purge-logs.py --prune-empty-dirs` to keep adjacent `logs/` tidy.
3. For large artefacts, consider compressing the archived directory before long-term storage (Phase 3 supply-chain hardening will introduce signed bundles).

## 6. Related Assets

- `scripts/archive-analysis.py`
- `scripts/clean-workspace.mjs`
- `docs/security/MCP-SERVER-THREAT-MODEL.md` (logging & DSFA obligations)
