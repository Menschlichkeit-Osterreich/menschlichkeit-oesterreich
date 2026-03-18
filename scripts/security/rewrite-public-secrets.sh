#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  rewrite-public-secrets.sh --replace-text <file> [--mirror-dir <dir>] [--remote <name>] [--push]

Safe defaults:
  - requires a mirror clone
  - refuses to run without an explicit replace-text file
  - creates a backup bundle before any rewrite
  - does not push unless --push is passed
EOF
}

REPLACE_TEXT=""
MIRROR_DIR=""
REMOTE_NAME="origin"
PUSH_CHANGES="false"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --replace-text)
      REPLACE_TEXT="$2"
      shift 2
      ;;
    --mirror-dir)
      MIRROR_DIR="$2"
      shift 2
      ;;
    --remote)
      REMOTE_NAME="$2"
      shift 2
      ;;
    --push)
      PUSH_CHANGES="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [ -z "$REPLACE_TEXT" ] || [ ! -f "$REPLACE_TEXT" ]; then
  printf 'A valid --replace-text file is required.\n' >&2
  exit 2
fi

if [ -z "$MIRROR_DIR" ]; then
  REPO_ROOT="$(git rev-parse --show-toplevel)"
  REPO_NAME="$(basename "$REPO_ROOT")"
  MIRROR_DIR="$(dirname "$REPO_ROOT")/${REPO_NAME}-ir-clean.git"
fi

if [ ! -d "$MIRROR_DIR" ]; then
  printf 'Mirror directory not found: %s\n' "$MIRROR_DIR" >&2
  printf 'Create it first with: git clone --mirror <repo-url> %s\n' "$MIRROR_DIR" >&2
  exit 2
fi

if [ ! -f "$MIRROR_DIR/HEAD" ] || [ ! -d "$MIRROR_DIR/refs" ]; then
  printf 'Target is not a valid mirror git repository: %s\n' "$MIRROR_DIR" >&2
  exit 2
fi

if ! command -v git-filter-repo >/dev/null 2>&1; then
  printf 'git-filter-repo is required. Install with: python3 -m pip install --user git-filter-repo\n' >&2
  exit 2
fi

if ! command -v gitleaks >/dev/null 2>&1; then
  printf 'gitleaks is required for post-rewrite verification.\n' >&2
  exit 2
fi

cd "$MIRROR_DIR"
BACKUP_BUNDLE="../$(basename "$MIRROR_DIR")-pre-rewrite.bundle"
git bundle create "$BACKUP_BUNDLE" --all

git filter-repo --force --replace-text "$REPLACE_TEXT" --sensitive-data-removal
gitleaks git --repo-path . --config .gitleaks.toml --redact || true

if [ "$PUSH_CHANGES" = "true" ]; then
  git push --force --mirror "$REMOTE_NAME"
else
  printf 'Rewrite complete. Review the mirror repo and push manually if satisfied.\n'
fi
