#!/usr/bin/env bash
set -euo pipefail
MANIFEST="${1:-secrets.manifest.json}"
req(){ command -v "$1" >/dev/null || { echo "Fehlt: $1"; exit 1; }; }
req gh; req jq
REPO=$(jq -r '.repository' "$MANIFEST")
ORG=$(jq -r '.organization // empty' "$MANIFEST")
jq -c '.environments[]?' "$MANIFEST" | while read -r env; do
  NAME=$(jq -r '.name' <<<"$env"); WAIT=$(jq -r '.wait_timer // 0' <<<"$env")
  reviewers_json="[]"
  if jq -e '.reviewers' <<<"$env" >/dev/null; then
    tmp="[]"
    for t in $(jq -r '.reviewers.teams[]?' <<<"$env"); do
      [[ -n "$ORG" ]] || { echo "ORG nötig für Team-Reviewer"; exit 1; }
      TID=$(gh api "orgs/$ORG/teams/$t" --jq .id)
      tmp=$(jq --argjson id "$TID" '. + [{"type":"Team","id":$id}]' <<<"$tmp")
    done
    for u in $(jq -r '.reviewers.users[]?' <<<"$env"); do
      UID=$(gh api "users/$u" --jq .id)
      tmp=$(jq --argjson id "$UID" '. + [{"type":"User","id":$id}]' <<<"$tmp")
    done
    reviewers_json="$tmp"
  fi
  echo "⚙️  Environment $NAME konfigurieren (Reviewer/Wait=$WAIT)"
  gh api -X PUT "repos/$REPO/environments/$NAME" \
    -f wait_timer="$WAIT" \
    -f "reviewers=$(jq -c '.' <<<"$reviewers_json")" >/dev/null
done
