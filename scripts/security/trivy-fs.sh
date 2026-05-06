#!/usr/bin/env bash
# Trivy Filesystem Scanner Wrapper
# Part of Menschlichkeit Österreich Security Pipeline
# 
# Usage: trivy-fs.sh <output-sarif-file> <scan-path>
# Example: trivy-fs.sh trivy-fs.sarif .

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script arguments
OUTPUT_FILE="${1:-trivy-fs.sarif}"
SCAN_PATH="${2:-.}"

# Configuration
TRIVY_CONFIG="${TRIVY_CONFIG:-trivy.yaml}"
TRIVY_CACHE_DIR="${TRIVY_CACHE_DIR:-.trivycache}"
SEVERITY="${TRIVY_SEVERITY:-CRITICAL,HIGH,MEDIUM}"
SCANNERS="${TRIVY_SCANNERS:-vuln,secret,config}"

echo -e "${BLUE}🔒 Trivy Filesystem Security Scanner${NC}"
echo "======================================"
echo "Output: ${OUTPUT_FILE}"
echo "Path: ${SCAN_PATH}"
echo "Severity: ${SEVERITY}"
echo "Scanners: ${SCANNERS}"
echo ""

# Check if trivy is installed
if ! command -v trivy &> /dev/null; then
    echo -e "${RED}❌ Error: trivy is not installed${NC}"
    echo "Installing Trivy..."
    
    # Install Trivy on Ubuntu/Debian
    if [ -f /etc/debian_version ]; then
        sudo apt-get update -qq
        sudo apt-get install -y wget apt-transport-https gnupg lsb-release
        wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
        echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
        sudo apt-get update -qq
        sudo apt-get install -y trivy
    else
        echo -e "${RED}❌ Unsupported OS. Please install trivy manually.${NC}"
        exit 1
    fi
fi

# Verify trivy installation
TRIVY_VERSION=$(trivy --version | head -n1 || echo "unknown")
echo -e "${GREEN}✓ Trivy version: ${TRIVY_VERSION}${NC}"
echo ""

# Create cache directory if it doesn't exist
mkdir -p "${TRIVY_CACHE_DIR}"

# Run Trivy scan
echo -e "${BLUE}🔍 Starting filesystem scan...${NC}"

# Check if config file exists
CONFIG_ARGS=""
if [ -f "${TRIVY_CONFIG}" ]; then
    echo -e "${GREEN}✓ Using config file: ${TRIVY_CONFIG}${NC}"
    CONFIG_ARGS="--config ${TRIVY_CONFIG}"
else
    echo -e "${YELLOW}⚠ Config file ${TRIVY_CONFIG} not found, using defaults${NC}"
fi

# Run the scan
# Note: We don't use --exit-code 1 here to avoid failing the workflow
# The SARIF file will be uploaded and GitHub Security will handle alerts
trivy filesystem \
    ${CONFIG_ARGS} \
    --format sarif \
    --output "${OUTPUT_FILE}" \
    --severity "${SEVERITY}" \
    --scanners "${SCANNERS}" \
    --cache-dir "${TRIVY_CACHE_DIR}" \
    --timeout 10m \
    --quiet \
    "${SCAN_PATH}" || {
        EXIT_CODE=$?
        echo -e "${YELLOW}⚠ Trivy scan completed with findings (exit code: ${EXIT_CODE})${NC}"
        # Don't fail - let GitHub Security handle the results
    }

# Verify output file was created
if [ ! -f "${OUTPUT_FILE}" ]; then
    echo -e "${RED}❌ Error: Output file ${OUTPUT_FILE} was not created${NC}"
    exit 1
fi

# Check file size
FILE_SIZE=$(stat -f%z "${OUTPUT_FILE}" 2>/dev/null || stat -c%s "${OUTPUT_FILE}" 2>/dev/null || echo "0")
echo -e "${GREEN}✓ SARIF report generated: ${OUTPUT_FILE} (${FILE_SIZE} bytes)${NC}"

# Parse SARIF to show summary (optional, requires jq)
if command -v jq &> /dev/null && [ "${FILE_SIZE}" -gt 100 ]; then
    echo ""
    echo -e "${BLUE}📊 Scan Summary:${NC}"
    
    TOTAL_RESULTS=$(jq '[.runs[].results | length] | add // 0' "${OUTPUT_FILE}" 2>/dev/null || echo "0")
    echo "Total findings: ${TOTAL_RESULTS}"
    
    if [ "${TOTAL_RESULTS}" -gt 0 ]; then
        echo -e "${YELLOW}⚠ Security findings detected - check GitHub Security tab for details${NC}"
    else
        echo -e "${GREEN}✓ No security findings detected${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Trivy scan completed successfully${NC}"
echo "SARIF report: ${OUTPUT_FILE}"
echo ""

# Always exit 0 so the workflow continues and uploads the SARIF
exit 0
