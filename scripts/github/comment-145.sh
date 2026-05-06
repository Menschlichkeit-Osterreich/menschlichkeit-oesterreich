#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
. "$DIR/issue-utils.sh"

COMMENT_BODY=${COMMENT_BODY:-}
if [ -z "$COMMENT_BODY" ]; then
  COMMENT_BODY="Backend queue + monitoring delivered. Added JWT-protected endpoints (push/pop/ack/fail/stats, DLQ list/requeue/purge), idempotency support (Idempotency-Key), n8n workflows (enqueue + worker + alerts), and a basic Admin Queue page (/admin/queue). Propose to close and track UI polish under a follow-up issue."
fi

ISSUE_NUMBER=${ISSUE_NUMBER:-145}

api POST "/issues/${ISSUE_NUMBER}/comments" \
  -d "$(jq -n --arg body "$COMMENT_BODY" '{body:$body}')"
echo "Comment posted on #${ISSUE_NUMBER}."

