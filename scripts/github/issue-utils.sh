#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_OWNER:?Set GITHUB_OWNER env var}"
: "${GITHUB_REPO:?Set GITHUB_REPO env var}"
: "${GH_TOKEN:?Set GH_TOKEN env var}"

api() {
  local method="$1"; shift
  local path="$1"; shift
  curl -sSf -X "$method" \
    -H "Authorization: token ${GH_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    "$@" \
    "https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}${path}"
}

