# Audit Logs

This directory contains audit trail logs for PR validation and merge operations.

## File Naming Convention

- `PR-{number}-{timestamp}.txt` - Audit trail for specific PR
- `audit-tag-{tag}.log` - Tag creation audit log
- Format: Structured text with user, timestamp, and agent information

## Audit Tag Format

```
audit-pr-{number}-validated
```

Example: `audit-pr-87-validated`

## Log Structure

Each audit log contains:
- Audit tag identifier
- User who initiated action
- Timestamp (ISO 8601 format)
- Agent ID (e.g., merge-bot)
- Environment (dev/stage/prod)
- Validation results
- Actions taken
- Related artifacts

## Audit Events

- **pr-validated** - PR passed all validation checks
- **pr-failed** - PR failed validation
- **pr-merged** - PR successfully merged
- **pr-rollback** - Rollback initiated
- **tag-created** - Audit tag created

## Usage

### Create Audit Tag

```bash
# Via validation script
pwsh scripts/validate-pr.ps1 -Environment stage -PullRequestNumber 87

# Manual audit tag creation
pwsh scripts/create-audit-tag.ps1 -PullRequestNumber 87 -User peschull -AgentId merge-bot

# Or via Git directly
git tag -a audit-pr-87-validated -m "PR 87 validated by merge-bot"
```

### Query Audit Logs

```bash
# Find all validated PRs
grep -r "validated" logs/audit/

# Find specific PR audit
cat logs/audit/PR-87-*.txt
```

## Compliance

- **DSGVO:** Logs contain no PII
- **Retention:** 3 years (legal requirement)
- **Access:** Read-only after creation
- **Integrity:** SHA-256 checksums for verification

## Related Files

- `../conflicts/` - Conflict analysis logs
- `../merge/` - Merge execution logs
- `.github/workflows/secrets-validate.yml` - Audit trigger
