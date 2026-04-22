# Complete BSM Consolidation Workflow

**Status**: 90% Complete | Blocked on Step 1 (UUID retrieval)
**Last Updated**: 2025-10-18
**Commit Reference**: d7361f4b (all four file modifications)
**Owner**: DevOps Engineer

---

## Overview

This runbook completes the Bitwarden Secrets Manager (BSM) consolidation of four Graph-Mail credentials (MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_GRAPH_SENDER) from GitHub Secrets bypass pattern into unified BSM injection workflow for production deployments.

**What's Already Done (d7361f4b):**

- ✅ Operation 1: Added four Graph-Mail secrets to `.github/bsm-secret-ids.json` deploy-production array (with PLACEHOLDER UUIDs)
- ✅ Operation 2: Extended `reusable-bsm-secrets.yml` deploy-production job with four secret variable mappings
- ✅ Operation 3: Added `bsm-secrets` to deploy job needs array in `deploy-plesk.yml`
- ✅ Operation 4: Replaced GitHub Secrets references with BSM-injected env vars in `deploy-plesk.yml`
- ✅ Syntax validation passed (`npm run governance:check`)
- ✅ Git commit created with proper conventional message

**What Remains:**

- ❌ Replace four PLACEHOLDER\_\*\_UUID values with actual BSM Resource IDs
- ❌ Create four GitHub Actions Repository Variables
- ❌ Test on staging branch
- ❌ Deploy to production

---

## Phase 1: Retrieve BSM Resource UUIDs (BLOCKING STEP)

### Task 1.1: Login to Bitwarden Vault

```
URL: https://vault.bitwarden.eu
Credentials: Bitwarden Organization account
Expected Access: deploy-production project
```

### Task 1.2: Locate Four Graph-Mail Secrets

Navigate to **Projects → deploy-production** and locate these four secrets:

| Secret                  | Path                        | Status            |
| ----------------------- | --------------------------- | ----------------- |
| MICROSOFT_TENANT_ID     | api/MICROSOFT_TENANT_ID     | Should exist      |
| MICROSOFT_CLIENT_ID     | api/MICROSOFT_CLIENT_ID     | Should exist      |
| MICROSOFT_CLIENT_SECRET | api/MICROSOFT_CLIENT_SECRET | Should exist      |
| MICROSOFT_GRAPH_SENDER  | api/MICROSOFT_GRAPH_SENDER  | May need creation |

### Task 1.3: Extract Resource IDs

For each secret:

1. Click the secret name → Open details pane
2. Look for **"Resource ID"** or **"UUID"** field
3. Copy the 36-character UUID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

**Example Resource ID Format:**

```
12345678-abcd-1234-5678-9abcdef01234
```

### Task 1.4: Document UUIDs

Create a temporary file or note with these four UUIDs:

```bash
# Copy these and save securely during Phase 2

MICROSOFT_TENANT_ID_UUID="[PASTE UUID HERE]"
MICROSOFT_CLIENT_ID_UUID="[PASTE UUID HERE]"
MICROSOFT_CLIENT_SECRET_UUID="[PASTE UUID HERE]"
MICROSOFT_GRAPH_SENDER_UUID="[PASTE UUID HERE]"
```

**⚠️ Critical**: If MICROSOFT_GRAPH_SENDER secret does not exist in vault:

- **Create it first** in Bitwarden with value: the Graph API sender email (e.g., `office@menschlichkeit-oesterreich.at`)
- Then copy its resource UUID

---

## Phase 2: Update `.github/bsm-secret-ids.json` with Real UUIDs

**File**: `.github/bsm-secret-ids.json`
**Lines to Update**: 61, 67, 73, 79

### Task 2.1: Read Current File State

```bash
cat .github/bsm-secret-ids.json | grep -A 1 "PLACEHOLDER"
```

Expected output shows four PLACEHOLDER\_\*\_UUID values at lines 61, 67, 73, 79.

### Task 2.2: Update Line 61 (MICROSOFT_TENANT_ID)

**Before:**

```json
{
  "bsm_key": "api/MICROSOFT_TENANT_ID",
  "env_var": "MICROSOFT_TENANT_ID",
  "github_variable": "BSM_API_MICROSOFT_TENANT_ID",
  "uuid": "PLACEHOLDER_TENANT_ID_UUID"
}
```

**After:**

```json
{
  "bsm_key": "api/MICROSOFT_TENANT_ID",
  "env_var": "MICROSOFT_TENANT_ID",
  "github_variable": "BSM_API_MICROSOFT_TENANT_ID",
  "uuid": "[UUID from Phase 1]"
}
```

### Task 2.3: Update Line 67 (MICROSOFT_CLIENT_ID)

**Before:**

```json
{
  "bsm_key": "api/MICROSOFT_CLIENT_ID",
  "env_var": "MICROSOFT_CLIENT_ID",
  "github_variable": "BSM_API_MICROSOFT_CLIENT_ID",
  "uuid": "PLACEHOLDER_CLIENT_ID_UUID"
}
```

**After:**

```json
{
  "bsm_key": "api/MICROSOFT_CLIENT_ID",
  "env_var": "MICROSOFT_CLIENT_ID",
  "github_variable": "BSM_API_MICROSOFT_CLIENT_ID",
  "uuid": "[UUID from Phase 1]"
}
```

### Task 2.4: Update Line 73 (MICROSOFT_CLIENT_SECRET)

**Before:**

```json
{
  "bsm_key": "api/MICROSOFT_CLIENT_SECRET",
  "env_var": "MICROSOFT_CLIENT_SECRET",
  "github_variable": "BSM_API_MICROSOFT_CLIENT_SECRET",
  "uuid": "PLACEHOLDER_CLIENT_SECRET_UUID"
}
```

**After:**

```json
{
  "bsm_key": "api/MICROSOFT_CLIENT_SECRET",
  "env_var": "MICROSOFT_CLIENT_SECRET",
  "github_variable": "BSM_API_MICROSOFT_CLIENT_SECRET",
  "uuid": "[UUID from Phase 1]"
}
```

### Task 2.5: Update Line 79 (MICROSOFT_GRAPH_SENDER)

**Before:**

```json
{
  "bsm_key": "api/MICROSOFT_GRAPH_SENDER",
  "env_var": "MICROSOFT_GRAPH_SENDER",
  "github_variable": "BSM_API_MICROSOFT_GRAPH_SENDER",
  "uuid": "PLACEHOLDER_GRAPH_SENDER_UUID"
}
```

**After:**

```json
{
  "bsm_key": "api/MICROSOFT_GRAPH_SENDER",
  "env_var": "MICROSOFT_GRAPH_SENDER",
  "github_variable": "BSM_API_MICROSOFT_GRAPH_SENDER",
  "uuid": "[UUID from Phase 1]"
}
```

### Task 2.6: Validate JSON Syntax

```bash
npm run governance:check
```

Expected output: ✅ All validation passed

### Task 2.7: Commit Changes

```bash
git add .github/bsm-secret-ids.json
git commit -m "ci(bsm-secrets): replace placeholder UUIDs with actual BSM resource IDs"
git push origin main
```

---

## Phase 3: Create GitHub Actions Repository Variables

**Location**: GitHub Repository Settings → Secrets and variables → Actions variables

### Task 3.1: Create BSM_API_MICROSOFT_TENANT_ID Variable

- **Name**: `BSM_API_MICROSOFT_TENANT_ID`
- **Value**: [UUID from Phase 1 - MICROSOFT_TENANT_ID]
- **Repository**: Menschlichkeit-Osterreich/menschlichkeit-oesterreich

### Task 3.2: Create BSM_API_MICROSOFT_CLIENT_ID Variable

- **Name**: `BSM_API_MICROSOFT_CLIENT_ID`
- **Value**: [UUID from Phase 1 - MICROSOFT_CLIENT_ID]

### Task 3.3: Create BSM_API_MICROSOFT_CLIENT_SECRET Variable

- **Name**: `BSM_API_MICROSOFT_CLIENT_SECRET`
- **Value**: [UUID from Phase 1 - MICROSOFT_CLIENT_SECRET]

### Task 3.4: Create BSM_API_MICROSOFT_GRAPH_SENDER Variable

- **Name**: `BSM_API_MICROSOFT_GRAPH_SENDER`
- **Value**: [UUID from Phase 1 - MICROSOFT_GRAPH_SENDER]

### Task 3.5: Verify Variables Created

```bash
gh repo variable list --repo Menschlichkeit-Osterreich/menschlichkeit-oesterreich | grep BSM_API_MICROSOFT
```

Expected output: All four variables listed with values set.

---

## Phase 4: Staging Deployment Test

### Task 4.1: Create Test Branch

```bash
git checkout -b test/bsm-graph-mail-integration
git push origin test/bsm-graph-mail-integration
```

### Task 4.2: Trigger Deployment Workflow (Staging)

Via GitHub UI:

1. **Actions → deploy-plesk.yml**
2. **Run workflow**
3. **Branch**: `test/bsm-graph-mail-integration`
4. **Wait for execution**

### Task 4.3: Monitor Job Execution

Expected flow:

1. ✅ `bsm-secrets` job retrieves secrets from vault via UUIDs
2. ✅ `bsm-secrets` job outputs environment variables (MICROSOFT_TENANT_ID, etc.)
3. ✅ `build-*` and `test` jobs run
4. ✅ `deploy` job receives environment variables from `bsm-secrets` output
5. ✅ `deploy` job injects MICROSOFT\_\* credentials into production deployment

**Success Indicators:**

- No "secret not found" errors in workflow logs
- No PLACEHOLDER UUID values in logs
- `MICROSOFT_*` environment variables successfully injected to deployment shell

### Task 4.4: Verify Mail Service Integration

After staging deployment succeeds:

1. SSH to staging server: `ssh user@staging.menschlichkeit-oesterreich.at`
2. Check API environment variables: `env | grep MICROSOFT`
3. Expected output:
   ```
   MICROSOFT_TENANT_ID=[actual UUID value]
   MICROSOFT_CLIENT_ID=[actual UUID value]
   MICROSOFT_CLIENT_SECRET=[actual UUID value]
   MICROSOFT_GRAPH_SENDER=[actual email value]
   ```
4. Test mail service: `curl http://localhost:8001/health`
   - Should return 200 OK with mail service running

### Task 4.5: Trigger Test Email

Via FastAPI admin endpoint:

```bash
curl -X POST http://localhost:8001/admin/test-email \
  -H "Authorization: Bearer $MOE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"admin@menschlichkeit-oesterreich.at", "subject":"BSM Integration Test"}'
```

Expected: Email received at destination address (mail service using Graph API credentials from BSM).

### Task 4.6: Review Bitwarden Audit Log

1. Navigate to vault.bitwarden.eu → Activity log
2. Verify: Service account `sa-cicd` accessed the four secrets at time of deployment
3. Confirm: Each secret shows audit trail entry

---

## Phase 5: Production Deployment

### Task 5.1: Merge Test Branch to Main

```bash
git checkout main
git pull origin main
git merge test/bsm-graph-mail-integration
git push origin main
```

### Task 5.2: Trigger Production Deployment

Via GitHub UI:

1. **Actions → deploy-plesk.yml**
2. **Run workflow**
3. **Branch**: `main`
4. **Wait for execution**

### Task 5.3: Production Validation

Same as Task 4.3-4.6, but for production environment:

```bash
ssh user@menschlichkeit-oesterreich.at
env | grep MICROSOFT
curl https://api.menschlichkeit-oesterreich.at/health
```

### Task 5.4: Monitor Slack Alerts

Expected Slack notification in #06-crm-spenden:

```
✅ Production deployment succeeded
   - Graph-Mail credentials injected via BSM
   - API service running on new configuration
   - Email service ready
```

---

## Troubleshooting

### Issue: "Secret not found" Error in Workflow Logs

**Root Cause**: UUIDs in `.github/bsm-secret-ids.json` don't match actual vault resource IDs.

**Resolution**:

1. Re-verify UUIDs from Phase 1
2. Update `.github/bsm-secret-ids.json` with correct UUIDs
3. Re-run workflow

### Issue: GitHub Actions Variables Not Picked Up

**Root Cause**: Variables not created or names misspelled.

**Resolution**:

1. Verify variable names exactly match:
   - `BSM_API_MICROSOFT_TENANT_ID`
   - `BSM_API_MICROSOFT_CLIENT_ID`
   - `BSM_API_MICROSOFT_CLIENT_SECRET`
   - `BSM_API_MICROSOFT_GRAPH_SENDER`
2. Re-create if necessary
3. Re-run workflow after 2-minute propagation delay

### Issue: Mail Service Fails to Initialize

**Root Cause**: Graph API credentials (TENANT_ID, CLIENT_ID, CLIENT_SECRET) incorrect or expired.

**Resolution**:

1. Verify credentials in vault are current
2. Check Microsoft Entra app registration still valid
3. Re-create credentials if expired
4. Update UUIDs and restart deployment

---

## Rollback Procedure (If Issues Arise)

If production deployment fails, rollback to GitHub Secrets:

### Task: Revert to GitHub Secrets Bypass

**File**: `.github/workflows/deploy-plesk.yml` (lines 325-328)

**Change**:

```yaml
# REVERT TO:
export MICROSOFT_TENANT_ID="${{ secrets.MICROSOFT_TENANT_ID }}"
export MICROSOFT_CLIENT_ID="${{ secrets.MICROSOFT_CLIENT_ID }}"
export MICROSOFT_CLIENT_SECRET="${{ secrets.MICROSOFT_CLIENT_SECRET }}"
export MICROSOFT_GRAPH_SENDER="${{ secrets.MICROSOFT_GRAPH_SENDER }}"
```

**Commit and Deploy**:

```bash
git add .github/workflows/deploy-plesk.yml
git commit -m "ci(revert): restore GitHub Secrets bypass pending BSM troubleshooting"
git push origin main
```

---

## Sign-Off Checklist

- [ ] Phase 1: Four UUIDs retrieved from vault
- [ ] Phase 2: `.github/bsm-secret-ids.json` updated with real UUIDs
- [ ] Phase 2: Syntax validation passed
- [ ] Phase 2: Changes committed to main
- [ ] Phase 3: Four GitHub Actions Repository Variables created
- [ ] Phase 4: Staging deployment test completed successfully
- [ ] Phase 4: Mail service integration verified on staging
- [ ] Phase 4: Bitwarden audit log shows credential access
- [ ] Phase 5: Production deployment executed
- [ ] Phase 5: Production mail service verified
- [ ] Phase 5: Slack notification received in #06-crm-spenden

---

**Next Steps**: Follow Phase 1-5 sequentially. If blocked, refer to Troubleshooting section.

**Support**: For questions, contact: peter@menschlichkeit-oesterreich.at
