# Workspace Hygiene Playbook

_Last updated: 2025-10-05_

## 1. Quick Actions

| Command | Description |
| --- | --- |
| `npm run clean:dry-run` | Preview removable artefacts without deleting |
| `npm run clean` | Remove caches, build outputs, and virtual envs (safe defaults) |
| `npm run clean:dist` | Target only `dist/` and `build/` folders |
| `npm run clean:node-modules` | Remove all `node_modules/` folders |
| `npm run logs:purge:dry-run` | Preview log retention clean-up |
| `npm run logs:purge` | Enforce log retention policies |

The cleanup script respects dependency trees (`node_modules/`, `vendor/`, `bower_components/`, `civicrm/ext/`) and will not delete assets inside those paths.

## 2. Options

`scripts/clean-workspace.mjs` supports advanced use:

```bash
# Remove only Python caches
node scripts/clean-workspace.mjs --only=pycache,pyc,pytest

# Exclude virtual environments
node scripts/clean-workspace.mjs --skip=venv --skip=pycache

# Clean an alternate checkout (CI workspace)
node scripts/clean-workspace.mjs --root=/mnt/runner/_work/project --dry-run --verbose
```

## 3. Integration Tips

- Run `npm run clean` before packaging release bundles to avoid leaking temporary files.
- Combine with `python3 scripts/archive-analysis.py ...` when tidying exploratory outputs.
- For Codespaces, add `npm run clean && npm run logs:purge --dry-run` to a pre-stop task to keep snapshots lean.

## 4. References

- `scripts/clean-workspace.mjs`
- `scripts/purge-logs.py`
- `docs/infrastructure/ARCHIVE-STRATEGY.md`
