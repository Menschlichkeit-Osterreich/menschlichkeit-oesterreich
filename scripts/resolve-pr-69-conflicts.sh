#!/bin/bash

# Script to resolve conflicts on PR #69
# This script posts a comment to trigger Dependabot rebase

set -euo pipefail

REPO="Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development"
PR_NUMBER=69
COMMENT_BODY="@dependabot rebase"

echo "========================================="
echo "Resolve PR #69 Conflicts via Dependabot"
echo "========================================="
echo ""
echo "PR #69: chore(deps): bump pyjwt from 2.8.0 to 2.10.1"
echo "Issue: Branch has conflicts with main (unrelated histories)"
echo "Solution: Ask Dependabot to rebase the PR"
echo ""

# Check for GitHub token
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "ERROR: GITHUB_TOKEN environment variable is not set"
  echo ""
  echo "To run this script, you need to set GITHUB_TOKEN:"
  echo "  export GITHUB_TOKEN=<your-github-token>"
  echo ""
  echo "Alternatively, you can manually comment on the PR:"
  echo "  1. Go to: https://github.com/$REPO/pull/$PR_NUMBER"
  echo "  2. Add a comment: @dependabot rebase"
  echo "  3. Submit the comment"
  echo ""
  exit 1
fi

echo "Posting comment to PR #${PR_NUMBER}..."
echo "Comment: $COMMENT_BODY"
echo ""

# Post the comment using GitHub API
response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/$REPO/issues/$PR_NUMBER/comments \
  -d "{\"body\":\"$COMMENT_BODY\"}")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "201" ]; then
  echo "✅ SUCCESS! Comment posted successfully."
  echo ""
  echo "Dependabot will now rebase the PR automatically."
  echo "This should resolve the conflicts."
  echo ""
  echo "Monitor the PR at: https://github.com/$REPO/pull/$PR_NUMBER"
else
  echo "❌ FAILED! HTTP Status: $http_code"
  echo ""
  echo "Response:"
  echo "$body" | jq . 2>/dev/null || echo "$body"
  echo ""
  echo "Please manually comment '@dependabot rebase' on the PR:"
  echo "  https://github.com/$REPO/pull/$PR_NUMBER"
  exit 1
fi
