#!/usr/bin/env bash
set -euo pipefail
# Einfacher Filesystem Wrapper (list, cat, find)
ROOT="${WORKSPACE_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
CMD="${1:-}"; shift || true

usage() {
  echo "Usage: wrapper-filesystem.sh {list [path]|cat <file>|find <pattern>|stat <file>}" >&2
  exit 1
}

list_cmd() {
  local path="${1:-$ROOT}"
  find "$path" -maxdepth 1 -type d -printf "[DIR] %f\n" -o -type f -printf "[FILE] %f\n" | head -n 200
}

cat_cmd() {
  local file="$1"; [[ -f "$file" ]] || { echo "File not found: $file" >&2; exit 2; }
  sed -n '1,200p' "$file"
}

find_cmd() {
  local pattern="$1"; grep -RIn --exclude-dir .git --exclude-dir node_modules --max-count=1 "$pattern" "$ROOT" | head -n 50 || true
}

stat_cmd() {
  local file="$1"; [[ -e "$file" ]] || { echo "Not found: $file" >&2; exit 3; }
  ls -l "$file"
  wc -l < "$file" 2>/dev/null || true
}

case "$CMD" in
  list) list_cmd "$@" ;;
  cat) [[ $# -ge 1 ]] || usage; cat_cmd "$1" ;;
  find) [[ $# -ge 1 ]] || usage; find_cmd "$1" ;;
  stat) [[ $# -ge 1 ]] || usage; stat_cmd "$1" ;;
  *) usage ;;
esac

exit 0