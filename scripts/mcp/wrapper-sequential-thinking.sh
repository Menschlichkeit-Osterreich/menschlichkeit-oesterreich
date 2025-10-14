#!/usr/bin/env bash
set -euo pipefail
# Placeholder sequential-thinking: concatenates given steps and outputs numbered plan
if [[ $# -lt 1 ]]; then echo "Usage: wrapper-sequential-thinking.sh <step> [more steps...]" >&2; exit 1; fi
COUNT=1
for step in "$@"; do
  echo "$COUNT. $step"
  COUNT=$((COUNT+1))
done