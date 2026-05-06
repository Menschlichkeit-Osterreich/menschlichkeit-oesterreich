# Phase 0 – Re-Verification Report
Generiert: 2025-10-04T21:01:02+02:00

## Artefakte – Existenzprüfung

- ✅ Asset Mapping (Subdomains Registry) — `docs/infrastructure/SUBDOMAIN-REGISTRY.md` (gefunden)
- ✅ License Audit (SPDX Matrix) — `docs/security/LICENSE-AUDIT-2025-10-04.md` (gefunden)
- ✅ Third-Party Notices — `docs/security/THIRD-PARTY-NOTICES.md` (gefunden)
- ✅ Provenance Report — `analysis/phase-0/inventory/provenance-report.md` (gefunden)
- ✅ Threat Model (STRIDE/LINDDUN) — `analysis/phase-0/threat-model/STRIDE-LINDDUN-ANALYSIS.md` (gefunden)
- ✅ Frontend Threat Model — `docs/security/FRONTEND-THREAT-MODEL.md` (gefunden)
- ✅ MCP Server Threat Model — `docs/security/MCP-SERVER-THREAT-MODEL.md` (gefunden)
- ✅ API PII Sanitization — `api.menschlichkeit-oesterreich.at/PII-SANITIZATION-README.md` (gefunden)
- ✅ CRM PII Sanitizer — `crm.menschlichkeit-oesterreich.at/web/modules/custom/pii_sanitizer/README.md` (gefunden)
- ✅ n8n PII Sanitizer — `automation/n8n/custom-nodes/pii-sanitizer/README.md` (gefunden)
- ✅ Right to Erasure Script — `automation/privacy/right_to_erasure.py` (gefunden)
- ✅ Right to Erasure Workflow (n8n) — `automation/n8n/workflows/right-to-erasure.json` (gefunden)
- ✅ Right to Erasure Documentation — `docs/legal/RIGHT-TO-ERASURE-WORKFLOW.md` (gefunden)
- ✅ Authentication Flows — `docs/security/AUTHENTICATION-FLOWS.md` (gefunden)
- ✅ Supply Chain Security Blueprint — `docs/security/SUPPLY-CHAIN-SECURITY-BLUEPRINT.md` (gefunden)

## Reproducible Builds – Quick Checks

- ✅ Node Lockfile (npm/yarn/pnpm): vorhanden
- ✅ Composer Lockfile: vorhanden
- ✅ Python Requirements: vorhanden

# SBOM & Supply Chain – Baseline Evidenz
- ✅ Blueprint dokumentiert (CycloneDX/SPDX) — `docs/security/SUPPLY-CHAIN-SECURITY-BLUEPRINT.md`

## SBOM Artefakte
- ✅ Root SBOM — `security/sbom/root-project.json`
- ✅ API SBOM (Python) — `security/sbom/api-python.json`
- ✅ CRM SBOM (PHP) — `security/sbom/crm-php.json`
- ✅ Frontend SBOM — `security/sbom/frontend.json`

### SBOM Validierung (CycloneDX CLI)
- ⚠️ CycloneDX CLI nicht installiert; Validierung übersprungen

## GitHub Workflow: SBOM Generation & Signing
- ✅ Workflow vorhanden — `.github/workflows/sbom-generation.yml`
- ✅ OIDC (id-token: write) konfiguriert
- ✅ Cosign signing integriert
- ✅ CycloneDX Validierung im Workflow

## MCP Server Härtung – Implementationsnachweis
- ✅ File Server vorhanden — `mcp-servers/file-server/index.js`
- ✅ Path Traversal Guard (resolveSafePath)
- ✅ Rate Limiting (Token Bucket)
- ✅ Circuit Breaker
- ✅ OPA Gate (optional) integriert

## Policies & Seccomp
- ✅ OPA Policy — `mcp-servers/policies/opa/tool-io.rego`
- ✅ Seccomp Profil — `mcp-servers/policies/seccomp/node-min.json`
- ✅ Seccomp Runner Script — `scripts/run-mcp-file-server-seccomp.sh`

## Threat Model – Deltas
- ✅ T-04 Path Traversal dokumentiert
- ✅ D-04 MCP Flooding dokumentiert

## Tests (Unit/Property)
- ✅ Unit/Property Tests erfolgreich

## Zusammenfassung
Alle referenzierten Artefakte und Kontrollen aus Phase 0 sind vorhanden. ✅
