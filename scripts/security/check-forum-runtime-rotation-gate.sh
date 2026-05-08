#!/bin/bash
#
# check-forum-runtime-rotation-gate.sh
#
# Purpose:
#   CI/CD blocking gate for forum runtime secrets rotation tracking.
#   Reads forum-runtime-rotation-tracking.csv and enforces:
#   - All 3 forum secrets must have status = 'bestätigt' to pass
#   - Any secret with status = 'offen' blocks the gate
#
# Usage:
#   bash scripts/security/check-forum-runtime-rotation-gate.sh
#
# Exit Codes:
#   0  = Gate PASS (all 3 secrets bestätigt)
#   1  = Gate FAIL (1+ secrets offen or CSV not found)
#
# Related:
#   - CSV: quality-reports/forum-runtime-rotation-tracking.csv
#   - Issue: #176 Forum Deployment Collision
#

set -euo pipefail

# Configuration
FORUM_CSV="quality-reports/forum-runtime-rotation-tracking.csv"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
FORUM_CSV_FULL="${REPO_ROOT}/${FORUM_CSV}"

# ANSI colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# === Main Logic ===

# Check if CSV exists
if [ ! -f "${FORUM_CSV_FULL}" ]; then
    echo -e "${RED}❌ GATE FAIL${NC}: Forum CSV not found at ${FORUM_CSV_FULL}"
    exit 1
fi

# Parse CSV and count offen/bestätigt
offen_count=0
bestetaetigt_count=0
data_rows=0

# Skip header (line 1), process data rows (lines 2-4)
while IFS=',' read -r group secret_family target_system owner status evidence timestamp operator refs; do
    # Skip header
    if [ "$group" = "group" ]; then
        continue
    fi
    
    # Skip empty lines
    if [ -z "$group" ]; then
        continue
    fi
    
    data_rows=$((data_rows + 1))
    
    # Trim whitespace from status
    status=$(echo "$status" | xargs)
    
    if [ "$status" = "offen" ]; then
        offen_count=$((offen_count + 1))
        echo -e "${YELLOW}⏳ PENDING${NC}: $secret_family (status: offen)"
    elif [ "$status" = "bestätigt" ]; then
        bestetaetigt_count=$((bestetaetigt_count + 1))
        echo -e "${GREEN}✅ CONFIRMED${NC}: $secret_family (status: bestätigt)"
    else
        echo -e "${RED}⚠️  INVALID${NC}: $secret_family (status: $status - expected 'offen' or 'bestätigt')"
        exit 1
    fi
done < "${FORUM_CSV_FULL}"

# Validation
if [ $data_rows -ne 3 ]; then
    echo -e "${RED}❌ GATE FAIL${NC}: Expected 3 data rows, found $data_rows"
    exit 1
fi

# Gate decision
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Forum Runtime Secrets Gate Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Offen (awaiting evidence):    $offen_count/3"
echo "Bestätigt (confirmed):        $bestetaetigt_count/3"
echo ""

if [ $offen_count -eq 0 ]; then
    echo -e "${GREEN}✅ GATE PASS${NC}: All forum secrets confirmed and ready for use"
    exit 0
else
    echo -e "${RED}❌ GATE FAIL${NC}: $offen_count secret(s) still awaiting evidence"
    echo ""
    echo "To pass the gate, provide real evidence (Issue/#, Ticket ID, Code-Ref) for:"
    echo "  Format: FORUM_<NAME> | benötigt/entfernbar | [Nachweis] | [Person]"
    exit 1
fi
