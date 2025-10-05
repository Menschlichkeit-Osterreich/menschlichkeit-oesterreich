#!/usr/bin/env bash
set -euo pipefail

# Run MCP File Server under Docker with a seccomp profile for extra isolation.

WS_DIR=${WORKSPACE_DIR:-$(pwd)}
PROFILE_PATH=${SECcomp_PROFILE:-mcp-servers/policies/seccomp/node-min.json}

if [ ! -f "$PROFILE_PATH" ]; then
  echo "Seccomp profile not found: $PROFILE_PATH" >&2
  exit 1
fi

docker run --rm \
  -v "$WS_DIR":"/work" \
  -w /work \
  --security-opt "seccomp=$PROFILE_PATH" \
  -e PROJECT_ROOT=/work \
  -e MCP_FS_MAX_FILE_BYTES=${MCP_FS_MAX_FILE_BYTES:-262144} \
  -e MCP_RATE_LIMIT=${MCP_RATE_LIMIT:-30} \
  -e MCP_RATE_INTERVAL_MS=${MCP_RATE_INTERVAL_MS:-10000} \
  -e MCP_OPA_POLICY=${MCP_OPA_POLICY:-/work/mcp-servers/policies/opa/tool-io.rego} \
  node:20-alpine \
  node mcp-servers/file-server/index.js

