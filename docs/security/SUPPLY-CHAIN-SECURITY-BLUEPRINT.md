# Supply Chain Security Blueprint

**Version:** 1.0.0  
**Datum:** 2025-10-03  
**Framework:** SLSA Level 3 + NIST SSDF  
**Compliance:** EU Cyber Resilience Act (CRA) Ready

---

## Übersicht

Dieser Blueprint definiert Maßnahmen zur Absicherung der Software-Lieferkette gegen Supply-Chain-Angriffe (SolarWinds-Typ, Dependency Confusion, Typosquatting, etc.).

---

## 1. Software Bill of Materials (SBOM)

### 1.1 SBOM-Generierung

**Status:** ✅ IMPLEMENTIERT

**Tools:**

- **cdxgen** (CycloneDX-Format) für Node.js, Python, PHP
- **syft** (Alternative für Container-Images)

**Generierte SBOMs:**

```
security/sbom/
├── root-project.json        # Monorepo-Root (1.8 MB)
├── api-python.json          # FastAPI-Service
├── crm-php.json             # Drupal 10 + CiviCRM
├── frontend.json            # React/TypeScript
└── manifest.json            # Konsolidierte Übersicht
```

**CI/CD Integration:**

```yaml
# .github/workflows/sbom-generation.yml
name: Generate SBOM

on:
  push:
    branches: [chore/figma-mcp-make]
  release:
    types: [published]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install cdxgen
        run: npm install -g @cyclonedx/cdxgen

      - name: Generate Root SBOM
        run: cdxgen -o sbom-root.json -t js .

      - name: Generate API SBOM
        run: cdxgen -o sbom-api.json -t python api.menschlichkeit-oesterreich.at/

      - name: Upload SBOMs
        uses: actions/upload-artifact@v4
        with:
          name: sboms
          path: sbom-*.json

      - name: Sign SBOMs with Sigstore
        run: |
          cosign sign-blob --bundle sbom-root.json.bundle sbom-root.json
          cosign sign-blob --bundle sbom-api.json.bundle sbom-api.json
```

Aktualisierung (Release Gate & Validierung):

```yaml
# Ergänzende Schritte im selben Workflow
permissions:
  contents: write
  id-token: write

steps:
  - name: Install CycloneDX CLI
    run: npm install -g @cyclonedx/cyclonedx-cli

  - name: Validate SBOMs
    run: |
      for f in security/sbom/*.json; do
        npx @cyclonedx/cyclonedx-cli validate --input-file "$f";
      done

  - name: Install Cosign
    uses: sigstore/cosign-installer@v3

  - name: Sign SBOMs with Sigstore (keyless)
    if: ${{ github.event_name == 'release' }}
    env:
      COSIGN_EXPERIMENTAL: '1'
    run: |
      for f in security/sbom/*.json; do
        cosign sign-blob --yes --bundle "$f.bundle" "$f";
      done

  - name: Verify SBOM Signatures
    if: ${{ github.event_name == 'release' }}
    env:
      COSIGN_EXPERIMENTAL: '1'
    run: |
      for f in security/sbom/*.json; do
        cosign verify-blob --bundle "$f.bundle" "$f";
      done

  - name: Upload SBOMs to Release
    if: ${{ github.event_name == 'release' }}
    uses: softprops/action-gh-release@v2
    with:
      files: |
        security/sbom/*.json
        security/sbom/*.bundle
```

---

### 1.2 SBOM-Validierung

**Checkliste:**

- [x] SBOMs im CycloneDX-Format generiert
- [ ] SBOMs bei jedem Release aktualisiert
- [ ] SBOMs signiert (Sigstore/Cosign)
- [ ] SBOMs öffentlich verfügbar (GitHub Releases)
- [ ] SBOMs maschinenlesbar (JSON)

**Validierung:**

```bash
# CycloneDX-Schema-Validierung
npx @cyclonedx/cyclonedx-cli validate --input-file security/sbom/root-project.json

# Vollständigkeits-Check
jq '.components | length' security/sbom/root-project.json  # Anzahl Dependencies
```

---

### 1.3 Dependency-Inventar

**Top-Level Dependencies (Auszug):**

| Package     | Version  | License  | Criticality | Vuln. Status |
| ----------- | -------- | -------- | ----------- | ------------ |
| react       | ^18.x    | MIT      | HIGH        | ✅ Clean     |
| next        | ^14.x    | MIT      | HIGH        | ⚠️ 2 Low     |
| drupal/core | ^10.x    | GPL-2.0+ | CRITICAL    | ✅ Clean     |
| fastapi     | ^0.115.x | MIT      | CRITICAL    | ✅ Clean     |
| axios       | ^1.7.x   | MIT      | MEDIUM      | ✅ Clean     |

**Transitive Dependencies:** 1.247 (aus SBOM)

---

## 2. SLSA Framework (Supply-chain Levels for Software Artifacts)

### 2.1 SLSA Level 1 (Baseline)

**Anforderung:** Build-Prozess ist dokumentiert und versioniert.

- [x] Build-Skript im Repository (`build-pipeline.sh`)
- [x] Build in CI/CD ausgeführt (GitHub Actions)
- [x] Build-Parameter dokumentiert

---

### 2.2 SLSA Level 2 (Enhanced Build System)

**Anforderung:** Signierte Build-Provenance generiert.

- [ ] Build-Provenance generiert (GitHub Attestation API)
- [ ] Provenance enthält:
  - [ ] Build-Befehl
  - [ ] Git-Commit-SHA
  - [ ] Build-Umgebung (Runner-Image)
  - [ ] Zeitstempel

**Implementierung:**

```yaml
# .github/workflows/slsa-provenance.yml
name: SLSA Provenance

on:
  release:
    types: [published]

permissions:
  id-token: write # Für Sigstore
  contents: write
  attestations: write

jobs:
  provenance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Artifacts
        run: ./build-pipeline.sh production

      - name: Generate Provenance
        uses: actions/attest-build-provenance@v2
        with:
          subject-path: 'build/**'

      - name: Sign with Cosign
        run: |
          cosign sign-blob --bundle build.tar.gz.bundle build.tar.gz
```

---

### 2.3 SLSA Level 3 (Hardened Build System)

**Anforderung:** Build-Umgebung ist isoliert und nicht-interaktiv.

- [ ] Build läuft in ephemerer VM (GitHub-hosted Runners ✅)
- [ ] Keine manuelle Intervention während Build
- [ ] Build-Secrets aus Vault/GitHub Secrets (nicht hardcoded)
- [ ] Reproduzierbare Builds (gleicher Input → gleicher Output)

**Reproduzierbare Builds (Experimental):**

```bash
# Build 1
./build-pipeline.sh production > build1.tar.gz
sha256sum build1.tar.gz

# Build 2 (clean environment)
./build-pipeline.sh production > build2.tar.gz
sha256sum build2.tar.gz

# Checksums MÜSSEN identisch sein
```

---

### 2.4 SLSA Level 4 (Two-Person Review)

**Anforderung:** Alle Änderungen durch mindestens 2 Personen reviewed.

- [ ] Branch-Protection: Require 2 Approvals
- [ ] CODEOWNERS-Datei definiert
- [ ] Maintainer Rotation dokumentiert

**GitHub Branch Protection (via API):**

```bash
curl -X PUT \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/branches/chore/figma-mcp-make/protection \
  -d '{
    "required_pull_request_reviews": {
      "required_approving_review_count": 2,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true
    },
    "enforce_admins": true,
    "required_signatures": true
  }'
```

---

## 3. Dependency Management

### 3.1 Automatisiertes Dependency Scanning

**Tools:**

- **Dependabot** (GitHub-nativ)
- **Trivy** (für Container + Code)
- **npm audit** / **pip-audit** / **composer audit**

**GitHub Actions Integration:**

```yaml
# .github/workflows/dependency-scan.yml
name: Dependency Vulnerability Scan

on:
  push:
  schedule:
    - cron: '0 2 * * *' # Täglich 02:00 UTC

jobs:
  trivy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high

  pip-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install pip-audit && pip-audit -r api.menschlichkeit-oesterreich.at/requirements.txt
```

---

### 3.2 Dependency Pinning

**Anforderung:** Exakte Versionen statt Ranges.

**Aktuell (❌ BAD):**

```json
{
  "dependencies": {
    "react": "^18.0.0" // Erlaubt 18.0.0 - 18.x.x
  }
}
```

**Ziel (✅ GOOD):**

```json
{
  "dependencies": {
    "react": "18.2.0" // Exakte Version
  }
}
```

**Lock-Files:**

- [x] `package-lock.json` (Node.js)
- [x] `composer.lock` (PHP)
- [ ] `requirements.txt` mit Hashes (Python)

**Python-Hashes hinzufügen:**

```bash
pip-compile --generate-hashes requirements.in > requirements.txt
```

---

### 3.3 Private Package Registry

**Risiko:** Dependency Confusion (Angreifer veröffentlicht gleichnamiges Package auf public registry)

**Mitigation:**

- [ ] Interne Packages nur von privatem Registry laden
- [ ] `.npmrc` / `.piprc` mit Scope-Mapping

**Beispiel `.npmrc`:**

```
@menschlichkeit-oesterreich:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

---

### 3.4 Typosquatting-Schutz

**Maßnahmen:**

- [ ] Whitelist kritischer Packages
- [ ] Pre-Install-Hook prüft Package-Namen gegen Whitelist
- [ ] Socket.dev Integration (Echtzeit-Analyse)

**Whitelist-Beispiel:**

```yaml
# .github/allowed-dependencies.yml
allowed:
  - react
  - react-dom
  - next
  - axios
  - fastapi
blocked:
  - requst # Typo von "request"
  - colour # Typo von "color"
```

---

## 4. Artifact Signing & Verification

### 4.1 Commit Signing

**Status:** 🔴 KRITISCH (Finding #1 aus Phase 0)

**Anforderung:** Alle Commits GPG-signiert.

**Setup:**

```bash
# GPG-Key generieren
gpg --full-generate-key  # RSA 4096, kein Ablaufdatum

# Key zu GitHub hinzufügen
gpg --armor --export YOUR_KEY_ID | gh gpg-key add -

# Git konfigurieren
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

**Branch Protection:**

```yaml
required_signatures: true # Nur signierte Commits erlaubt
```

---

### 4.2 Artifact Signing (Sigstore/Cosign)

**Anforderung:** Build-Artifacts und Container-Images signiert.

**Installation:**

```bash
# Cosign installieren
curl -O -L "https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64"
sudo mv cosign-linux-amd64 /usr/local/bin/cosign
sudo chmod +x /usr/local/bin/cosign
```

**Signierung:**

```bash
# SBOM signieren
cosign sign-blob --bundle sbom.json.bundle sbom.json

# Container-Image signieren
cosign sign ghcr.io/peschull/crm:latest
```

**Verifikation:**

```bash
# SBOM verifizieren
cosign verify-blob --bundle sbom.json.bundle sbom.json

# Container verifizieren
cosign verify ghcr.io/peschull/crm:latest
```

---

### 4.3 SBOM Embedding

**Ziel:** SBOM direkt in Container-Image einbetten (SPDX/CycloneDX).

**Docker-Integration:**

```dockerfile
# Dockerfile
FROM node:20-alpine
COPY sbom.json /sbom.json
LABEL org.opencontainers.image.sbom=/sbom.json
```

**Attestation:**

```bash
cosign attest --predicate sbom.json --type cyclonedx ghcr.io/peschull/crm:latest
```

---

## 5. Security Policies

### 5.1 Dependency Update Policy

**Kategorien:**

| Severity | SLA             | Verantwortlich    |
| -------- | --------------- | ----------------- |
| CRITICAL | 24h             | DevOps + Security |
| HIGH     | 7 Tage          | DevOps            |
| MEDIUM   | 30 Tage         | Dev Team          |
| LOW      | Nächster Sprint | Dev Team          |

**Automatisierung:**

- [ ] Dependabot Auto-Merge für PATCH-Updates (z.B. 1.2.3 → 1.2.4)
- [ ] Manual Review für MINOR/MAJOR (z.B. 1.2.3 → 1.3.0)

---

### 5.2 Allowlist/Blocklist

**Blocked Licenses:**

- GPL-3.0 (Copyleft-Konflikt mit MIT-Code)
- AGPL-3.0
- Proprietary (ohne explizite Genehmigung)

**Allowed Licenses:**

- MIT
- Apache-2.0
- BSD-3-Clause
- ISC

**Automatischer Check:**

```bash
npx license-checker --exclude "GPL-3.0;AGPL-3.0"
```

---

### 5.3 Vendor Verification

**Trusted Vendors:**

- npm: @types/_, @react/_
- PyPI: fastapi, uvicorn, pydantic
- Packagist: drupal/_, civicrm/_

**Verification:**

```yaml
# .github/verified-publishers.yml
npm:
  - '@types'
  - '@react'
  - 'next'
pypi:
  - 'fastapi'
  - 'uvicorn'
```

---

## 6. Incident Response

### 6.1 Supply Chain Incident

**Auslöser:**

- CVE in kritischer Dependency
- Compromised Package (z.B. event-stream-Attacke)
- Dependency Confusion-Angriff

**Response-Schritte:**

1. **Identifikation (0-2h):**
   - SBOM prüfen: Ist betroffenes Package verwendet?
   - Version-Check: Ist vulnerable Version deployed?

2. **Containment (2-4h):**
   - Betroffene Services isolieren (falls deployed)
   - Rollback auf letzte sichere Version

3. **Eradication (4-8h):**
   - Dependency updaten oder entfernen
   - Code-Review: Wurde Exploit ausgenutzt?

4. **Recovery (8-24h):**
   - Patch deployed
   - Monitoring für Anomalien

5. **Post-Incident:**
   - Incident Report erstellen
   - SBOM-Archive vergleichen (welche Systeme betroffen?)

**Playbook-Vorlage:**

```yaml
incident:
  type: 'SUPPLY_CHAIN'
  trigger: 'CVE-2024-XXXXX in package XYZ'

affected_systems:
  - frontend
  - api

actions:
  - timestamp: '2025-10-03T22:30:00Z'
    action: 'Identified vulnerable version 1.2.3 in SBOM'
    actor: 'Security Team'

  - timestamp: '2025-10-03T23:00:00Z'
    action: 'Rolled back to version 1.2.2'
    actor: 'DevOps'

resolution:
  patched_version: '1.2.4'
  deployed_at: '2025-10-04T01:00:00Z'
  residual_risk: 'LOW'
```

---

## 7. Compliance-Status

### 7.1 Checkliste

**SLSA:**

- [x] Level 1: Build dokumentiert
- [ ] Level 2: Provenance generiert
- [ ] Level 3: Reproduzierbare Builds
- [ ] Level 4: Two-Person Review

**SBOM:**

- [x] SBOM generiert
- [ ] SBOM signiert
- [ ] SBOM öffentlich
- [ ] SBOM bei jedem Release aktualisiert

**Artifact Signing:**

- [ ] Commits signiert (GPG)
- [ ] Container signiert (Cosign)
- [ ] Release-Artifacts signiert

**Dependency Management:**

- [x] Lock-Files vorhanden
- [ ] Dependency Pinning (exakte Versionen)
- [ ] Automatisches Scanning (Dependabot/Trivy)
- [ ] License-Compliance geprüft

### 7.2 Gesamt-Score

**Erfüllt:** 5 / 24 Checkboxen (20.8%)  
**Status:** 🔴 NICHT COMPLIANT

---

## 8. Nächste Schritte

**SOFORT (0-7 Tage):**

1. GPG-Commit-Signing aktivieren
2. Dependabot konfigurieren
3. SBOM-Signierung mit Cosign

**KURZ (1-4 Wochen):** 4. SLSA-Provenance-Workflow erstellen 5. Dependency-Pinning durchsetzen 6. License-Checker in CI/CD

**MITTEL (1-3 Monate):** 7. Reproduzierbare Builds verifizieren 8. Two-Person Review Policy 9. Private Package Registry

---

**Review-Zyklus:** Monatlich  
**Nächste Review:** 2025-11-03  
**Verantwortlich:** Security + DevOps Team
