#!/usr/bin/env bash
set -euo pipefail

# Phase 0 Verification Script
# Checks the presence of all referenced Phase-0 artifacts and generates a consolidated report.

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
REPORT_DIR="$ROOT_DIR/analysis/phase-0/verification"
REPORT_FILE="$REPORT_DIR/phase-0-verification-report.md"

mkdir -p "$REPORT_DIR"

declare -a ITEMS=(
  "docs/infrastructure/SUBDOMAIN-REGISTRY.md|Asset Mapping (Subdomains Registry)"
  "docs/security/LICENSE-AUDIT-2025-10-04.md|License Audit (SPDX Matrix)"
  "docs/security/THIRD-PARTY-NOTICES.md|Third-Party Notices"
  "analysis/phase-0/inventory/provenance-report.md|Provenance Report"
  "analysis/phase-0/threat-model/STRIDE-LINDDUN-ANALYSIS.md|Threat Model (STRIDE/LINDDUN)"
  "docs/security/FRONTEND-THREAT-MODEL.md|Frontend Threat Model"
  "docs/security/MCP-SERVER-THREAT-MODEL.md|MCP Server Threat Model"
  "api.menschlichkeit-oesterreich.at/PII-SANITIZATION-README.md|API PII Sanitization"
  "crm.menschlichkeit-oesterreich.at/web/modules/custom/pii_sanitizer/README.md|CRM PII Sanitizer"
  "automation/n8n/custom-nodes/pii-sanitizer/README.md|n8n PII Sanitizer"
  "automation/privacy/right_to_erasure.py|Right to Erasure Script"
  "automation/n8n/workflows/right-to-erasure.json|Right to Erasure Workflow (n8n)"
  "docs/legal/RIGHT-TO-ERASURE-WORKFLOW.md|Right to Erasure Documentation"
  "docs/security/AUTHENTICATION-FLOWS.md|Authentication Flows"
  "docs/security/SUPPLY-CHAIN-SECURITY-BLUEPRINT.md|Supply Chain Security Blueprint"
)

ts() { date -Iseconds; }

has_cmd() { command -v "$1" >/dev/null 2>&1; }

append() { printf "%s\n" "$1" >>"$REPORT_FILE"; }

echo "# Phase 0 – Re-Verification Report" >"$REPORT_FILE"
append "Generiert: $(ts)"
append ""

append "## Artefakte – Existenzprüfung"
append ""

missing=0

for entry in "${ITEMS[@]}"; do
  path="${entry%%|*}"
  title="${entry##*|}"
  abs="$ROOT_DIR/$path"

  if [ -f "$abs" ] || [ -d "$abs" ]; then
    status="✅"
    note="gefunden"
  else
    status="❌"
    note="FEHLT"
    missing=$((missing+1))
  fi

  # Use printf with single-quoted format to avoid command substitution on backticks
  printf -- '- %s %s — `%s` (%s)\n' "$status" "$title" "$path" "$note" >>"$REPORT_FILE"
done

append ""

# Reproducible builds quick checks
append "## Reproducible Builds – Quick Checks"
append ""

check_and_print() {
  local label="$1"; shift
  local paths=("$@")
  local found_any=0
  for p in "${paths[@]}"; do
    if [ -f "$ROOT_DIR/$p" ]; then found_any=1; fi
  done
  if [ $found_any -eq 1 ]; then
    append "- ✅ $label: vorhanden"
  else
    append "- ❌ $label: fehlt"
  fi
}

check_and_print "Node Lockfile (npm/yarn/pnpm)" \
  package-lock.json yarn.lock pnpm-lock.yaml \
  frontend/package-lock.json frontend/yarn.lock frontend/pnpm-lock.yaml

check_and_print "Composer Lockfile" \
  composer.lock crm.menschlichkeit-oesterreich.at/composer.lock

check_and_print "Python Requirements" \
  api.menschlichkeit-oesterreich.at/requirements.txt requirements.txt pyproject.toml

append ""

append "# SBOM & Supply Chain – Baseline Evidenz"
if [ -f "$ROOT_DIR/docs/security/SUPPLY-CHAIN-SECURITY-BLUEPRINT.md" ]; then
  printf -- '- ✅ Blueprint dokumentiert (CycloneDX/SPDX) — `%s`\n' "docs/security/SUPPLY-CHAIN-SECURITY-BLUEPRINT.md" >>"$REPORT_FILE"
else
  append "- ❌ Blueprint fehlt"
  missing=$((missing+1))
fi

# SBOM files existence
append ""
append "## SBOM Artefakte"
declare -a SBOMS=(
  "security/sbom/root-project.json|Root SBOM"
  "security/sbom/api-python.json|API SBOM (Python)"
  "security/sbom/crm-php.json|CRM SBOM (PHP)"
  "security/sbom/frontend.json|Frontend SBOM"
)
for entry in "${SBOMS[@]}"; do
  p="${entry%%|*}"; t="${entry##*|}";
  if [ -f "$ROOT_DIR/$p" ]; then
    printf -- '- ✅ %s — `%s`\n' "$t" "$p" >>"$REPORT_FILE"
  else
    printf -- '- ❌ %s — `%s` (FEHLT)\n' "$t" "$p" >>"$REPORT_FILE"
    missing=$((missing+1))
  fi
done

# Validate SBOMs if CycloneDX CLI is available
if has_cmd npx; then
  append ""
  append "### SBOM Validierung (CycloneDX CLI)"
  if npx -y @cyclonedx/cyclonedx-cli --version >/dev/null 2>&1; then
    valid_ok=0
    for entry in "${SBOMS[@]}"; do
      p="${entry%%|*}"
      if [ -f "$ROOT_DIR/$p" ]; then
        if npx -y @cyclonedx/cyclonedx-cli validate --input-file "$ROOT_DIR/$p" >/dev/null 2>&1; then
          append "- ✅ Schema valide — \`$p\`"
        else
          append "- ❌ Schema ungültig — \`$p\`"
          missing=$((missing+1))
        fi
        valid_ok=1
      fi
    done
    if [ $valid_ok -eq 0 ]; then
      append "- ⚠️ Keine SBOMs zum Validieren gefunden"
    fi
  else
    append "- ⚠️ CycloneDX CLI nicht installiert; Validierung übersprungen"
  fi
fi

# GitHub workflow presence and signing steps
append ""
append "## GitHub Workflow: SBOM Generation & Signing"
WF=".github/workflows/sbom-generation.yml"
if [ -f "$ROOT_DIR/$WF" ]; then
  append "- ✅ Workflow vorhanden — \`$WF\`"
  # Check for id-token permission and cosign usage
  if grep -q "id-token: write" "$ROOT_DIR/$WF"; then
    append "- ✅ OIDC (id-token: write) konfiguriert"
  else
    append "- ❌ OIDC (id-token) fehlt"
    missing=$((missing+1))
  fi
  if grep -q "cosign sign-blob" "$ROOT_DIR/$WF"; then
    append "- ✅ Cosign signing integriert"
  else
    append "- ❌ Cosign signing fehlt"
    missing=$((missing+1))
  fi
  if grep -q "cyclonedx-cli validate" "$ROOT_DIR/$WF"; then
    append "- ✅ CycloneDX Validierung im Workflow"
  else
    append "- ❌ CycloneDX Validierung fehlt"
    missing=$((missing+1))
  fi
else
  append "- ❌ Workflow fehlt — \`$WF\`"
  missing=$((missing+1))
fi

# MCP Server hardening checks
append ""
append "## MCP Server Härtung – Implementationsnachweis"
MCP_FS="mcp-servers/file-server/index.js"
if [ -f "$ROOT_DIR/$MCP_FS" ]; then
  append "- ✅ File Server vorhanden — \`$MCP_FS\`"
  grep -Fq "resolveSafePath(" "$ROOT_DIR/$MCP_FS" && append "- ✅ Path Traversal Guard (resolveSafePath)" || { append "- ❌ Path Traversal Guard fehlt"; missing=$((missing+1)); }
  grep -Fq "TokenBucket" "$ROOT_DIR/$MCP_FS" && append "- ✅ Rate Limiting (Token Bucket)" || { append "- ❌ Rate Limiting fehlt"; missing=$((missing+1)); }
  grep -Fq "CircuitBreaker" "$ROOT_DIR/$MCP_FS" && append "- ✅ Circuit Breaker" || { append "- ❌ Circuit Breaker fehlt"; missing=$((missing+1)); }
  grep -Fq "opa" "$ROOT_DIR/$MCP_FS" && append "- ✅ OPA Gate (optional) integriert" || append "- ⚠️ OPA Gate nicht gefunden"
else
  append "- ❌ MCP File Server nicht vorhanden — \`$MCP_FS\`"
  missing=$((missing+1))
fi

# Policies & Seccomp
append ""
append "## Policies & Seccomp"
POL_REGO="mcp-servers/policies/opa/tool-io.rego"
POL_SECCOMP="mcp-servers/policies/seccomp/node-min.json"
RUNNER="scripts/run-mcp-file-server-seccomp.sh"
[ -f "$ROOT_DIR/$POL_REGO" ] && append "- ✅ OPA Policy — \`$POL_REGO\`" || { append "- ❌ OPA Policy fehlt — \`$POL_REGO\`"; missing=$((missing+1)); }
[ -f "$ROOT_DIR/$POL_SECCOMP" ] && append "- ✅ Seccomp Profil — \`$POL_SECCOMP\`" || { append "- ❌ Seccomp Profil fehlt — \`$POL_SECCOMP\`"; missing=$((missing+1)); }
[ -f "$ROOT_DIR/$RUNNER" ] && append "- ✅ Seccomp Runner Script — \`$RUNNER\`" || { append "- ❌ Runner Script fehlt — \`$RUNNER\`"; missing=$((missing+1)); }

# Threat model deltas present
append ""
append "## Threat Model – Deltas"
TM1="analysis/phase-0/threat-model/STRIDE-LINDDUN-ANALYSIS.md"
if grep -q "Threat T-04: Path Traversal" "$ROOT_DIR/$TM1"; then
  append "- ✅ T-04 Path Traversal dokumentiert"
else
  append "- ❌ T-04 Path Traversal fehlt"
  missing=$((missing+1))
fi
if grep -q "Threat D-04: MCP Request Flooding" "$ROOT_DIR/$TM1"; then
  append "- ✅ D-04 MCP Flooding dokumentiert"
else
  append "- ❌ D-04 MCP Flooding fehlt"
  missing=$((missing+1))
fi

# Unit tests summary
append ""
append "## Tests (Unit/Property)"
if has_cmd npm; then
  if npm run -s test:unit >/dev/null 2>&1; then
    append "- ✅ Unit/Property Tests erfolgreich"
  else
    append "- ❌ Tests fehlgeschlagen"
    missing=$((missing+1))
  fi
else
  append "- ⚠️ npm nicht verfügbar; Tests übersprungen"
fi

append ""
append "## Zusammenfassung"
if [ $missing -eq 0 ]; then
  append "Alle referenzierten Artefakte und Kontrollen aus Phase 0 sind vorhanden. ✅"
else
  append "$missing Prüfpunkt(e) nicht erfüllt. ❌"
fi

echo "Bericht generiert: $REPORT_FILE"
exit $([ $missing -eq 0 ] && echo 0 || echo 1)
