#!/usr/bin/env bash
set -euo pipefail

# Codacy Analysis CLI Wrapper (Docker-based)
# Provides: version | analyze | help
# Usage examples:
#   codacy-cli.sh version
#   codacy-cli.sh analyze --path ./frontend --format json --output codacy-frontend.json
#
# The official Codacy Analysis CLI Docker image: codacy/codacy-analysis-cli:latest
# We avoid direct npm installation (package unavailable) and use Docker for deterministic runs.

IMAGE="codacy/codacy-analysis-cli:latest"
WORKDIR="/src"

function ensure_image() {
  if ! docker image inspect "$IMAGE" > /dev/null 2>&1; then
    echo "[codacy-wrapper] Pulling Docker image $IMAGE..." >&2
    docker pull "$IMAGE" >/dev/null
    echo "[codacy-wrapper] Image pulled." >&2
  fi
}

function run_cli() {
  # Ensure output directory exists locally before container run
  mkdir -p quality-reports || true
  # Mount Docker socket to allow Codacy to spawn analysis tool containers
  local codacyrc_mount=()
  if [[ -f ".codacyrc" ]]; then
    codacyrc_mount=(-v "$(pwd)/.codacyrc:/.codacyrc:ro")
  fi
  docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$(pwd):$WORKDIR" \
    "${codacyrc_mount[@]}" \
    -w "$WORKDIR" \
    "$IMAGE" "$@"
}

function cmd_version() {
  ensure_image
  run_cli --version
}

function cmd_analyze() {
  ensure_image
  # Default arguments if not provided
  local args=("analyze")
  # Forward remaining parameters
  shift || true
  if [ "$#" -gt 0 ]; then
    args+=("$@")
  else
    # Sensible defaults: analyze whole repo, JSON output
    args+=("--directory" "." "--format" "json" "--output" "codacy-analysis.json")
  fi
  echo "[codacy-wrapper] Running analysis: ${args[*]}" >&2
  run_cli "${args[@]}"
}

function cmd_help() {
  cat <<EOF
Codacy Analysis CLI Docker Wrapper

Commands:
  version                    Show CLI version
  analyze [options]          Run analysis (defaults: --path . --format json --output codacy-analysis.json)
  help                       Show this help

Examples:
  ./scripts/codacy/codacy-cli.sh version
  ./scripts/codacy/codacy-cli.sh analyze --path frontend --format sarif --output codacy-frontend.sarif

Notes:
  - This wrapper uses image: $IMAGE
  - Ensure Docker daemon is running.
  - For MCP integration, invoke with 'analyze' and capture output file.
EOF
}

analyze_entrypoint() {
  local directory="."  # default scan entire repo
  local format="json"
  local output="codacy-analysis.json"
  local tools_env="${CODACY_TOOLS:-}" # optional comma-separierte Toolliste
  # parse flags
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --directory)
        directory="$2"; shift 2 ;;
      --format)
        format="$2"; shift 2 ;;
      --output)
        output="$2"; shift 2 ;;
      --tools)
        tools_env="$2"; shift 2 ;;
      *)
        echo "[codacy-wrapper] Unbekannte Option: $1"; shift ;;
    esac
  done
  ensure_image || return 1
  mkdir -p "$(dirname "$output")"
  echo "[codacy-wrapper] Starte Analyse (Directory=$directory, Format=$format, Output=$output, Tools=${tools_env:-auto})"
  local tool_args=()
  if [[ -n "$tools_env" ]]; then
    IFS=',' read -ra list <<< "$tools_env"
    for t in "${list[@]}"; do
      t_trim="$(echo "$t" | xargs)"
      [[ -n "$t_trim" ]] && tool_args+=("--tool" "$t_trim")
    done
  fi
  run_cli analyze --directory "$directory" --format "$format" --output "/src/$output" "${tool_args[@]}"
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[codacy-wrapper] Analyse beendete sich mit Code $exit_code" >&2
    if [[ "${CODACY_SOFT_FAIL:-}" == "1" ]]; then
      echo "[codacy-wrapper] Soft-Fail aktiv – setze Exit Code auf 0." >&2
      exit 0
    else
      exit $exit_code
    fi
  fi
}

case "${1:-help}" in
  version)
    shift
    cmd_version ;;
  analyze)
    shift
    analyze_entrypoint "$@" ;;
  help|--help|-h)
    cmd_help ;;
  *)
    echo "[codacy-wrapper] Unbekannter Befehl: $1" >&2
    cmd_help >&2
    exit 1 ;;
esac
