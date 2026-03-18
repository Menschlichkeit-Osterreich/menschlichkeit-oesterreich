# Security Scripts

This directory contains security scanning and validation scripts for the Menschlichkeit Österreich project.

## Scripts

### trivy-fs.sh

Wrapper script for Trivy filesystem security scanning.

**Usage:**
```bash
./trivy-fs.sh <output-sarif-file> <scan-path>
```

**Example:**
```bash
./trivy-fs.sh trivy-fs.sarif .
```

**Features:**
- Automatic Trivy installation if not present
- Configuration file support (`trivy.yaml`)
- SARIF output for GitHub Security integration
- Non-blocking execution (always exits 0)
- Summary output with jq if available

**Environment Variables:**
- `TRIVY_CONFIG` - Path to Trivy config file (default: `trivy.yaml`)
- `TRIVY_CACHE_DIR` - Cache directory (default: `.trivycache`)
- `TRIVY_SEVERITY` - Severity levels to scan (default: `CRITICAL,HIGH,MEDIUM`)
- `TRIVY_SCANNERS` - Scanners to use (default: `vuln,secret,config`)

**Used in Workflows:**
- `.github/workflows/trivy-fs.yml`

### incident-secret-audit.sh

Reproducible incident-response collector for suspected public secret exposure.

**Usage:**
```bash
./incident-secret-audit.sh
./incident-secret-audit.sh /custom/output/dir
```

**Features:**
- Captures current-tree and git-history evidence
- Writes artifacts into `quality-reports/incident-secret-audit/<timestamp>/`
- Queries GitHub, Docker and log sources when tooling/auth is available
- Degrades gracefully when optional tools are missing

Windows wrapper:
```powershell
pwsh -File scripts/security/incident-secret-audit.ps1
```

NPM entrypoint:
```bash
npm run security:incident:audit
```

### rewrite-public-secrets.sh

Safe wrapper around `git-filter-repo` for mirror-based history cleanup.

**Usage:**
```bash
./rewrite-public-secrets.sh --replace-text ../replace-text.txt --mirror-dir ../repo-ir-clean.git
./rewrite-public-secrets.sh --replace-text ../replace-text.txt --mirror-dir ../repo-ir-clean.git --push
```

**Safety rails:**
- Requires an explicit mirror repository
- Creates a backup bundle before rewriting
- Refuses to run without `git-filter-repo`, `gitleaks`, and a replace-text file
- Does not push unless `--push` is provided

Windows wrapper:
```powershell
pwsh -File scripts/security/rewrite-public-secrets.ps1 -ReplaceText ..\replace-text.txt -MirrorDir ..\repo-ir-clean.git
```

NPM entrypoint:
```bash
npm run security:rewrite-public-secrets -- -ReplaceText ..\replace-text.txt -MirrorDir ..\repo-ir-clean.git
```

## Security Scanning Tools

The project uses multiple security scanning tools:

1. **Trivy** - Vulnerability scanner for containers and filesystems
2. **CodeQL** - Semantic code analysis
3. **Semgrep** - OWASP-based SAST scanning
4. **OSV Scanner** - Open Source Vulnerability Database
5. **Gitleaks** - Secret detection

## Integration

All security scans are integrated with GitHub Security:
- SARIF reports are uploaded to Security tab
- Results are visible in Pull Request checks
- Daily scheduled scans at 04:00 UTC

## Configuration

Main configuration files:
- `trivy.yaml` - Trivy scanner configuration
- `.github/workflows/trivy.yml` - Trivy workflow
- `.github/workflows/security.yml` - Combined security workflow
- `.gitleaksignore` - Gitleaks exclusions

## DSGVO Compliance

All security scans are configured to respect GDPR/DSGVO requirements:
- PII detection patterns
- Austrian phone number patterns
- Email address scanning
- Exclusion patterns for test files and documentation

## Maintenance

Security tools and configurations are reviewed:
- **Weekly**: Automated scans via GitHub Actions
- **Monthly**: Manual review of findings
- **Quarterly**: Tool version updates
