# Log Retention Operations

_Last updated: 2025-10-05_

## 1. Policy Snapshot

| Directory | Retention | Notes |
| --- | --- | --- |
| `logs/operational` | 30 days | Runtime & monitoring noise, safe to purge aggressively |
| `logs/compliance` | 365 days | Required for annual DSGVO reviews |
| `logs/security-audit` | 7 days | High-sensitivity data, rotate fast |

The defaults align with the Phase 0 ILM plan (`docs/Repo & MCP-Server Optimierung.md`).

## 2. Purge Script

`scripts/purge-logs.py` enforces these rules and supports overrides.

```bash
# Dry-run with verbose output
python3 scripts/purge-logs.py --dry-run --verbose

# Execute purge and remove empty directories afterwards
python3 scripts/purge-logs.py --prune-empty-dirs

# Add a custom retention for feature flags logs
python3 scripts/purge-logs.py --rule logs/feature-flags:14

# Load JSON configuration with extended rules
python3 scripts/purge-logs.py --config configs/log-retention.json
```

Use the `--root` flag when running from automation contexts outside the repo root.

## 3. Scheduling

- Integrate into the weekly cron or CI maintenance workflow (Phase 1 Policy-Driven Cleanup).
- Capture purge metrics in `quality-reports/` if required by compliance.
- Pair with `scripts/archive-analysis.py` for artefacts moved out of `analysis/`.

## 4. Safety Considerations

- Default mode is destructive; always run `--dry-run` during onboarding.
- Non-existent directories are skipped gracefully.
- Deletions operate on file modification timestamps (`mtime`); ensure system clocks are accurate.

## 5. References

- `docs/legal/RIGHT-TO-ERASURE-WORKFLOW.md`
- `docs/security/MCP-SERVER-THREAT-MODEL.md`
- `docs/Repo & MCP-Server Optimierung.md`
