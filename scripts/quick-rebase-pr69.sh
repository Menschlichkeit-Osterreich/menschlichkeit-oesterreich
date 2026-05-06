#!/bin/bash

# Quick command to post @dependabot rebase comment to PR #69
# This is a simple one-liner for users with GitHub CLI installed

set -e

PR_NUMBER=69
REPO="Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development"

echo "🤖 Posting '@dependabot rebase' to PR #${PR_NUMBER}..."

# Using GitHub CLI
if command -v gh &> /dev/null; then
    gh pr comment $PR_NUMBER --body "@dependabot rebase" --repo $REPO
    echo "✅ Comment posted successfully via GitHub CLI!"
    echo ""
    echo "Monitor the PR: https://github.com/$REPO/pull/$PR_NUMBER"
else
    echo "❌ GitHub CLI (gh) not found!"
    echo ""
    echo "Please install it or use one of these alternatives:"
    echo ""
    echo "1. Manual comment on PR:"
    echo "   https://github.com/$REPO/pull/$PR_NUMBER"
    echo "   Comment text: @dependabot rebase"
    echo ""
    echo "2. Run GitHub Actions workflow:"
    echo "   https://github.com/$REPO/actions/workflows/resolve-pr-conflicts.yml"
    echo ""
    echo "3. Use the full script:"
    echo "   ./scripts/resolve-pr-69-conflicts.sh"
    exit 1
fi
