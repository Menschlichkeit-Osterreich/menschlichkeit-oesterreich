#!/bin/bash
# Repository-Einstellungen setzen (benötigt admin:repo Scope)
# Usage: ./repo-settings.sh [owner/repo]

set -euo pipefail

REPO="${1:-Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development}"

echo "🔧 Aktualisiere Repository-Einstellungen für: $REPO"

# Security-Features aktivieren
gh api -X PATCH "repos/$REPO" \
  -f has_issues=true \
  -f has_wiki=true \
  -f has_discussions=true \
  -f allow_squash_merge=true \
  -f allow_merge_commit=false \
  -f allow_rebase_merge=false \
  -f delete_branch_on_merge=true \
  -f allow_auto_merge=true \
  -f use_squash_pr_title_as_default=true

echo "✅ Basis-Einstellungen aktualisiert"

# Vulnerability-Alerts aktivieren
gh api -X PUT "repos/$REPO/vulnerability-alerts"
echo "✅ Vulnerability Alerts aktiviert"

# Automated Security Fixes (Dependabot)
gh api -X PUT "repos/$REPO/automated-security-fixes"
echo "✅ Automated Security Fixes aktiviert"

# Branch Protection (main)
gh api -X PUT "repos/$REPO/branches/main/protection" \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]=CI \
  -f required_status_checks[contexts][]="Security Scan" \
  -f enforce_admins=false \
  -f required_pull_request_reviews[dismiss_stale_reviews]=true \
  -f required_pull_request_reviews[require_code_owner_reviews]=true \
  -f required_pull_request_reviews[required_approving_review_count]=1 \
  -f required_signatures=true \
  -f required_linear_history=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false

echo "✅ Branch Protection (main) konfiguriert"

echo ""
echo "=========================================="
echo "✅ Alle Einstellungen erfolgreich gesetzt!"
echo "=========================================="
echo ""
echo "Repository: https://github.com/$REPO"
echo "Settings:   https://github.com/$REPO/settings"
