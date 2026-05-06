# Merge Logs

This directory contains merge execution logs and post-merge documentation.

## File Naming Convention

- `PR-{number}.txt` - Merge execution log for specific PR
- `merge-{timestamp}.log` - Batch merge log
- Format: Structured text with merge strategy and results

## Log Structure

Each merge log contains:
- PR number and title
- Merge timestamp
- Merge strategy (squash/rebase/merge)
- Commit SHA after merge
- Branch cleanup status
- Post-merge validations
- Rollback checkpoint

## Merge Strategies

### Squash & Merge (Default)
- All commits squashed into one
- Clean linear history
- Feature branch deleted after merge

### Rebase & Merge
- Commits rebased onto target
- Maintains commit history
- Used for multi-commit features

### Standard Merge
- Creates merge commit
- Preserves full history
- Used for long-running branches

## Usage

### Execute Merge

```bash
# Via GitHub CLI
gh pr merge 87 --squash --delete-branch

# Log is automatically created
cat logs/merge/PR-87.txt
```

### Rollback Merge

```bash
# Find merge commit
git log --oneline | grep "PR-87"

# Revert merge
git revert -m 1 <merge-commit-sha>

# Document rollback
echo "Rollback: PR-87" >> logs/merge/PR-87-rollback.txt
```

## Validation Checkpoints

After each merge:
- [ ] All CI checks passed
- [ ] No new security vulnerabilities
- [ ] Quality gates maintained
- [ ] Documentation updated
- [ ] Feature branch deleted

## Retention

- **Development:** 30 days
- **Stage:** 90 days
- **Production:** 365 days (audit requirement)

## Related Files

- `../conflicts/` - Pre-merge conflict analysis
- `../audit/` - Audit trail logs
- `.github/workflows/secrets-validate.yml` - Pre-merge validation
- `prompts/rollback-masterprompt.md` - Rollback procedures
