# Repository Rulesets & Branch Protection

**Organisation:** Menschlichkeit Österreich  
**Repository:** Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development  
**Stand:** 2025-10-12

---

## Übersicht

GitHub Rulesets bieten granulare Kontrolle über Repository-Schutzmaßnahmen:
- **Branch Protection:** Erzwingt Reviews, Status Checks, Signierte Commits
- **Tag Protection:** Verhindert unautorisierten Tag-Push
- **Workflow Protection:** Schützt `.github/workflows/**` vor unbefugten Änderungen
- **Push Protection:** Blockt Secret-Pushes (GitHub Secret Scanning)

**Dokumentation:**
- [GitHub Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- [Push Protection](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations)

---

## 1. Branch Protection Ruleset

### 1.1 Protected Branches

```yaml
Branches:
  - main
  - chore/figma-mcp-make (Default Branch aktuell)
  - release/*
  - hotfix/*
```

### 1.2 Required Rules

#### Pull Request Reviews

```yaml
required_pull_request_reviews:
  required_approving_review_count: 1
  dismiss_stale_reviews: true
  require_code_owner_reviews: true
  dismiss_stale_reviews_on_new_commits: true
```

**Rationale:**
- Mindestens 1 Approval (Vier-Augen-Prinzip)
- Alte Reviews ungültig bei neuem Push
- CODEOWNERS müssen reviewen (Security, API, CRM)

#### Required Status Checks

```yaml
required_status_checks:
  strict: true  # Branch muss up-to-date mit Base sein
  contexts:
    # Security Scans
    - "CodeQL (javascript)"
    - "CodeQL (python)"
    - "Semgrep / Scan"
    - "Trivy / Scan"
    - "OSV Scanner / Scan"
    - "OpenSSF Scorecard / Analysis"
    
    # Quality Gates
    - "Quality Gates / Codacy"
    - "Quality Gates / DSGVO Compliance"
    
    # Tests
    - "Tests / Unit Tests"
    - "Tests / E2E Tests (chromium)"
    - "Tests / E2E Tests (firefox)"
    
    # Build & SBOM
    - "Build / Production Build"
    - "SBOM / Generate CycloneDX"
    
    # Secret Validation
    - "Secrets / Validate Required Secrets"
```

**Rationale:**
- Alle Security Scans müssen grün sein
- Quality Gates blocken Merge bei Regression
- Tests MÜSSEN passen (keine Ausnahmen)
- SBOM stellt Supply Chain Transparency sicher

#### Commit Signing

```yaml
required_signatures: true
```

**Rationale:**
- Verhindert Commit-Spoofing
- Authentifiziert Autoren via GPG/SSH
- Compliance-Anforderung

#### Linear History

```yaml
required_linear_history: true
```

**Rationale:**
- Keine Merge-Commits (nur Squash/Rebase)
- Saubere, nachvollziehbare Git-History
- Einfacheres Revert bei Issues

#### Conversation Resolution

```yaml
required_conversation_resolution: true
```

**Rationale:**
- Alle Review-Kommentare müssen resolved sein
- Verhindert "Übersehen" von Feedback

### 1.3 Restrictions

```yaml
restrictions:
  users: []
  teams:
    - security-team
    - devops-team
  apps: []
```

**Rationale:**
- Nur bestimmte Teams können ohne Review mergen
- Emergency Hotfixes durch Security/DevOps

### 1.4 Enforcement

```yaml
enforce_admins: true
include_administrators: true
```

**Rationale:**
- Admins unterliegen GLEICHEN Regeln
- Keine Umgehung für Admins

---

## 2. Workflow Protection Ruleset

### 2.1 Protected Paths

```yaml
protected_paths:
  - ".github/workflows/**"
  - ".github/actions/**"
  - "scripts/secrets-*.sh"
  - "scripts/secrets-*.ps1"
```

### 2.2 Required Approvals

```yaml
workflow_protection:
  required_reviewers:
    - security-team
  required_approvals: 2  # Bei Workflow-Änderungen
```

**Rationale:**
- Workflows haben Zugriff auf Secrets
- Änderungen könnten Secrets exfiltrieren
- 2 Approvals bei kritischen Änderungen

### 2.3 Allowed Actions

```yaml
allowed_actions:
  github_owned_allowed: true
  verified_allowed: true
  patterns_allowed:
    - "actions/*"
    - "github/*"
    - "azure/*"
    - "aws-actions/*"
    - "google-github-actions/*"
```

**Rationale:**
- Nur verifizierte Actions (Marketplace Badge)
- Verhindert Supply Chain Attacks via Third-Party Actions

---

## 3. Tag Protection Ruleset

### 3.1 Protected Tags

```yaml
protected_tags:
  - "v*.*.*"
  - "release-*"
```

### 3.2 Rules

```yaml
tag_protection:
  allow_deletions: false
  allow_force_pushes: false
  required_signatures: true
```

**Rationale:**
- Release-Tags unveränderlich
- Signiert für Authentizität
- Verhindert versehentliches Löschen

---

## 4. Push Protection (Secret Scanning)

### 4.1 Aktivierung

**Organisation-Level:**
```bash
# Via GitHub UI
Settings → Code security → Secret scanning
  ✓ Push protection (org-wide)
  ✓ Validity checks (verify if secret active)
  ✓ Non-provider patterns
```

**Repository-Level:**
```bash
Settings → Code security → Secret scanning
  ✓ Push protection
  ✓ Alert on bypass
```

### 4.2 Bypass Policy

```yaml
bypass_policy:
  allowed_reasons:
    - "False positive (test data)"
    - "Public documentation (not secret)"
    - "Legacy migration (temporary)"
  
  approval_required: true
  approvers:
    - security-team
  
  documentation_required: true
  documentation_template: |
    **Reason:** <reason>
    **Evidence:** <link to proof>
    **Remediation:** <planned fix>
    **Deadline:** <date>
```

**Bypass Tracking:**
- Alle Bypässe im Security Tab geloggt
- Automatische Issue-Erstellung
- Eskalation nach 24h ohne Remediation

### 4.3 Delegated Bypass

```yaml
delegated_bypass:
  enabled: true
  request_flow:
    1. Developer pusht → Secret detected → Blocked
    2. Developer requests bypass (with reason)
    3. Security Team reviews (via Slack notification)
    4. Approval/Rejection innerhalb 1h (Business Hours)
```

**Implementierung:**
```bash
# GitHub API: Request Bypass
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/$ORG/$REPO/secret-scanning/push-protection/bypass-requests \
  -d '{
    "reason": "False positive - test data",
    "evidence_url": "https://example.com/proof"
  }'
```

---

## 5. OIDC-basierte Cloud-Authentifizierung

### 5.1 Principle

```
GitHub Actions → OIDC Token → Cloud Provider IAM → Kurzlebiges Access Token
```

**Vorteile:**
- ✅ Keine Langzeit-Secrets
- ✅ Automatische Rotation (1h Lebensdauer)
- ✅ Granulare Berechtigungen (per Job)
- ✅ Audit-Trail in Cloud IAM

### 5.2 Configuration

#### Azure OIDC

```yaml
# .github/workflows/deploy-azure.yml
permissions:
  id-token: write  # OIDC Token
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          # NO client-secret!
```

**Azure Setup:**
```bash
# Federated Credential erstellen
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-actions",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

#### AWS OIDC

```yaml
# .github/workflows/deploy-aws.yml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: eu-central-1
```

**AWS Setup:**
```bash
# Trust Policy für GitHub Actions
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:sub": "repo:Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

### 5.3 Benefits Over Secrets

| Aspekt | Secrets | OIDC |
|--------|---------|------|
| **Lebensdauer** | Unbegrenzt (bis Rotation) | 1 Stunde (per Job) |
| **Rotation** | Manuell (90 Tage) | Automatisch (jeder Job) |
| **Kompromittierung** | Bleibt gültig | Ungültig nach Job-Ende |
| **Audit** | GitHub Audit Log | Cloud IAM Audit + GitHub |
| **Granularität** | Repo/Environment | Per Job + Repo + Branch |

---

## 6. Implementation Checkliste

### 6.1 Sofort (Critical)

- [x] Push Protection aktivieren (Org + Repo)
- [x] Secret Scanning aktivieren
- [x] Branch Protection Rules (main)
- [x] Required Status Checks (Security Scans)
- [x] Signierte Commits erzwingen

### 6.2 Kurzfristig (< 1 Woche)

- [ ] Workflow Protection Rules
- [ ] Tag Protection Rules
- [ ] Delegated Bypass konfigurieren
- [ ] CODEOWNERS-Datei aktualisieren
- [ ] Security Team Training (Bypass-Approval)

### 6.3 Mittelfristig (< 1 Monat)

- [ ] OIDC für Azure konfigurieren
- [ ] OIDC für AWS konfigurieren
- [ ] Langzeit-Secrets migrieren zu OIDC
- [ ] Scorecard-Badge im README

### 6.4 Langfristig (< 3 Monate)

- [ ] Alle Cloud-Secrets via OIDC
- [ ] Zero Langzeit-Secrets (außer GitHub PAT)
- [ ] Automatische Compliance-Reports
- [ ] External Security Audit

---

## 7. Monitoring & Alerts

### 7.1 Metrics

```yaml
Tracked Metrics:
  - Push Protection Blocks (per Week)
  - Bypass Requests (Approved/Rejected)
  - Failed Status Checks (per Check)
  - Unsigned Commits Blocked
  - Secret Scanning Alerts (New/Resolved)
```

### 7.2 Alerting

**Slack/Matrix Notifications:**
```yaml
Triggers:
  - Push Protection Bypass Request → #security-team (Immediate)
  - Failed Security Scan → #dev-team (15 Min Delay)
  - New Secret Scanning Alert → #security-team (Immediate)
  - Unsigned Commit Attempt → #devops-team (Daily Digest)
```

**GitHub Issues:**
```yaml
Auto-Create Issue:
  - Push Protection Bypass (with details)
  - Secret Scanning Alert (HIGH/CRITICAL)
  - Scorecard Score < 7.0
```

### 7.3 Quarterly Reviews

```yaml
Review Checklist:
  - [ ] Ruleset Effectiveness (False Positive Rate)
  - [ ] Bypass Justifications (Valid?)
  - [ ] Status Check Reliability (Flaky Tests?)
  - [ ] OIDC Adoption Rate
  - [ ] Secret Rotation Compliance
```

---

## 8. Troubleshooting

### 8.1 Push Protection Bypass (Emergency)

**Problem:** Legitimer Push wird geblockt

**Lösung:**
```bash
# 1. Verify False Positive
git diff HEAD~1 HEAD | grep -i "secret"

# 2. Request Bypass via UI
# → GitHub Web UI → Push Protection Dialog → "Request Bypass"

# 3. Provide Justification
# Reason: "Test data in fixture file, not real secret"
# Evidence: Link to docs/test-data.md

# 4. Await Approval (Security Team, < 1h)

# 5. Alternative: Remove Secret, Re-Push
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/file' \
  --prune-empty --tag-name-filter cat -- --all
```

### 8.2 OIDC-Fehler

**Problem:** "Error: Unable to get ACTIONS_ID_TOKEN_REQUEST_URL"

**Lösung:**
```yaml
# Fehlt: permissions.id-token: write
permissions:
  id-token: write  # <-- WICHTIG
  contents: read
```

### 8.3 Status Check Failure

**Problem:** PR geblockt durch Failed Check

**Lösung:**
```bash
# 1. Identify Failed Check
gh pr checks --repo $ORG/$REPO $PR_NUMBER

# 2. Re-Run Failed Job
gh run rerun $RUN_ID --failed

# 3. Wenn persistent fehlschlägt: Investigate
gh run view $RUN_ID --log-failed
```

---

## 9. References

### Internal Docs
- [Security Policy](../../SECURITY.md)
- [Secrets Catalog](../security/secrets-catalog.md)
- [Quality Gates](../../.github/instructions/core/quality-gates.instructions.md)

### External Docs
- [GitHub Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- [Push Protection](https://docs.github.com/en/code-security/secret-scanning/push-protection)
- [OIDC with GitHub Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [OpenSSF Scorecard](https://github.com/ossf/scorecard)

---

**Maintainer:** Security Team  
**Review:** Quartalsweise  
**Last Updated:** 2025-10-12
