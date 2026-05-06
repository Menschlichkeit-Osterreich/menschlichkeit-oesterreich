#!/usr/bin/env bash
set -euo pipefail
# Simple placeholder for memory MCP server (stores lines in temp file per session)
STATE_FILE="${TMPDIR:-/tmp}/mcp_memory_state.txt"
mkdir -p "${STATE_FILE%/*}" || true

case "${1:-}" in
  add)
    shift
    echo "$(date +%FT%T) $*" >> "$STATE_FILE"
    echo "[memory] stored";
    ;;
  list)
    if [[ -f "$STATE_FILE" ]]; then cat "$STATE_FILE"; else echo "(empty)"; fi
    ;;
  clear)
    rm -f "$STATE_FILE"; echo "[memory] cleared";
    ;;
  *)
    echo "Usage: wrapper-memory.sh {add <text>|list|clear}" >&2; exit 1;
    ;;
esac