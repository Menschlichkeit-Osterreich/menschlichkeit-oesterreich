#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${1:-$REPO_ROOT/quality-reports/incident-secret-audit/$TIMESTAMP}"
SEARCH_EXCLUDES=(
  ':(exclude)attached_assets/**'
  ':(exclude)_scan_hits.txt'
  ':(exclude)quality-reports/**'
  ':(exclude)reports/**'
)

mkdir -p "$OUT_DIR"

log() {
  printf '[incident-audit] %s\n' "$*"
}

write_cmd() {
  local name="$1"
  shift
  log "running: $name"
  {
    printf '$ %q' "$@"
    printf '\n'
    "$@"
  } >"$OUT_DIR/$name.txt" 2>&1 || {
    printf '\n[exit-code] %s\n' "$?" >>"$OUT_DIR/$name.txt"
  }
}

write_shell() {
  local name="$1"
  local script="$2"
  log "running shell block: $name"
  {
    printf '%s\n' "$script"
    printf '\n'
    bash -lc "$script"
  } >"$OUT_DIR/$name.txt" 2>&1 || {
    printf '\n[exit-code] %s\n' "$?" >>"$OUT_DIR/$name.txt"
  }
}

cat >"$OUT_DIR/README.md" <<EOF
# Secret Exposure Incident Audit

- Repository: \`$(basename "$REPO_ROOT")\`
- Timestamp (UTC): \`$TIMESTAMP\`
- Host: \`$(hostname)\`
- Git branch: \`$(git -C "$REPO_ROOT" branch --show-current 2>/dev/null || echo unknown)\`

This directory contains reproducible, point-in-time audit artifacts for the
public-repo secret exposure response workflow.
EOF

write_cmd git-status git -C "$REPO_ROOT" status --short --branch
write_cmd git-grep-identifiers git -C "$REPO_ROOT" grep -nI -e 'office@menschlichkeit-oesterreich.at' -e 'n8n.menschlichkeit-oesterreich.at' -- . "${SEARCH_EXCLUDES[@]}"
write_shell git-grep-secret-patterns "cd '$REPO_ROOT' && git grep -nI -E 'CHA[^[:space:]]{2,}|(SMTP_(USER|PASS|PASSWORD)|N8N_(PASSWORD|ENCRYPTION_KEY|WEBHOOK_SECRET|DB_PASSWORD)|REDIS_PASSWORD|MOE_API_TOKEN|JWT_SECRET|CIVI_(API|SITE)_KEY|STRIPE_WEBHOOK_SECRET|PAYPAL_CLIENT_SECRET|SLACK_WEBHOOK_URL|S3_SECRET_ACCESS_KEY)' -- . ':(exclude)attached_assets/**' ':(exclude)_scan_hits.txt' ':(exclude)quality-reports/**' ':(exclude)reports/**'"
write_shell tracked-env-files "cd '$REPO_ROOT' && find . -type f \\( -name '.env*' -o -name 'docker-compose*.yml' -o -name 'docker-compose*.yaml' \\) -not -path './node_modules/*' -not -path './vendor/*' | sort"
write_cmd history-office git -C "$REPO_ROOT" log --all --oneline -S 'office@menschlichkeit-oesterreich.at' -- . "${SEARCH_EXCLUDES[@]}"
write_cmd history-n8n git -C "$REPO_ROOT" log --all --oneline -S 'n8n.menschlichkeit-oesterreich.at' -- . "${SEARCH_EXCLUDES[@]}"
write_shell history-cha "cd '$REPO_ROOT' && git log --all -G 'CHA[^[:space:]]{2,}' -- . ':(exclude)docs/archive/**' ':(exclude)attached_assets/**' ':(exclude)_scan_hits.txt' ':(exclude)quality-reports/**' ':(exclude)reports/**'"

if command -v gitleaks >/dev/null 2>&1; then
  write_shell gitleaks-history "cd '$REPO_ROOT' && gitleaks git --repo-path . --config .gitleaks.toml --redact --report-format sarif --report-path '$OUT_DIR/gitleaks-history.sarif'"
else
  printf 'gitleaks not installed on this host\n' >"$OUT_DIR/gitleaks-history.txt"
fi

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  OWNER_REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || true)"
  if [ -n "$OWNER_REPO" ]; then
    write_cmd gh-secrets gh api "repos/$OWNER_REPO/actions/secrets"
    write_cmd gh-production-secrets gh api "repos/$OWNER_REPO/environments/production/secrets"
    write_cmd gh-staging-secrets gh api "repos/$OWNER_REPO/environments/staging/secrets"
    write_shell gh-actions-runs "gh api repos/$OWNER_REPO/actions/runs?per_page=100 --jq '.workflow_runs[] | [.created_at,.name,.event,.conclusion,.actor.login] | @tsv'"
    write_cmd gh-hooks gh api "repos/$OWNER_REPO/hooks"
    write_cmd gh-deployments gh api "repos/$OWNER_REPO/deployments"
    write_cmd gh-branch-protection gh api "repos/$OWNER_REPO/branches/main/protection"
    write_cmd gh-org-audit gh api "orgs/${OWNER_REPO%/*}/audit-log?phrase=repo:${OWNER_REPO#*/}&include=all&per_page=100"
  fi
else
  printf 'gh not authenticated on this host\n' >"$OUT_DIR/gh-status.txt"
fi

if command -v docker >/dev/null 2>&1; then
  write_shell docker-n8n-logs "cd '$REPO_ROOT' && docker compose -f automation/n8n/docker-compose.https.yml logs --since 7d n8n caddy | rg -i 'login|auth|credential|token|webhook|401|403|429|failed|error|session'"
  write_shell docker-n8n-db "docker exec moe-n8n-postgres psql -U n8n_user -d n8n -c '\\dt public.*'"
else
  printf 'docker not installed on this host\n' >"$OUT_DIR/docker-status.txt"
fi

write_shell proxy-logs "sudo zgrep -h 'n8n.menschlichkeit-oesterreich.at' /var/log/nginx/*log* /var/www/vhosts/system/*/logs/*log* 2>/dev/null | rg -i '/rest/|/webhook/|401|403|404|429|5[0-9]{2}'"
write_shell mail-logs "sudo zgrep -h 'office@menschlichkeit-oesterreich.at|automation@menschlichkeit-oesterreich.at|info@menschlichkeit-oesterreich.at|civi@menschlichkeit-oesterreich.at|bounce@menschlichkeit-oesterreich.at|logging@menschlichkeit-oesterreich.at' /var/log/mail.log* /var/log/maillog* 2>/dev/null | rg -i 'auth|login|imap|pop3|smtp|sasl|failed|disconnect'"

log "artifacts written to $OUT_DIR"
