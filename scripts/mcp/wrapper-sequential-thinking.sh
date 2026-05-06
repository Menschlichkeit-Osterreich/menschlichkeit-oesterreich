#!/usr/bin/env bash
set -euo pipefail
# Fallback fuer Umgebungen ohne MCP-Server.
# Die kanonische Analyse-Engine ist `@modelcontextprotocol/server-sequential-thinking`
# aus `mcp.json`. Dieses Skript dient nur als minimale Rueckfalloption.
if [[ $# -lt 1 ]]; then echo "Usage: wrapper-sequential-thinking.sh <step> [more steps...]" >&2; exit 1; fi
COUNT=1
for step in "$@"; do
  echo "$COUNT. $step"
  COUNT=$((COUNT+1))
done
