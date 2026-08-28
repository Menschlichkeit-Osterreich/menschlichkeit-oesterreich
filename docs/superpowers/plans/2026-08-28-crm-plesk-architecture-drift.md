# CRM Plesk Architecture Drift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove executable CRM-to-Azure migration drift from the repository while preserving Azure for API/Games/n8n and making Plesk the explicit canonical runtime for Drupal/CiviCRM.

**Architecture:** Treat `specs/007-crm-drupal-civicrm-auslagerung/` as historical evidence, not an active execution plan. Keep the repo-wide infrastructure split in `specs/004-speckit-repo-wide-orchestrierung/tasks.md`, but replace direct host/user/key/ForwardAgent assumptions with the existing BSM and strict host-trust contracts. Disable the one-time combined issue generator so it cannot recreate superseded CRM migration issues.

**Tech Stack:** Markdown governance/specification, Bash safety guard, GitHub Actions repository gates.

**Spec:** GitHub issue #535 and PR #533 Plesk runtime contract.

## Global Constraints

- Drupal/CiviCRM remains on Plesk.
- Azure devmoe remains the container track for API, Games and n8n only.
- No secret values are written to repository files, issues, logs or artifacts.
- Existing BSM mappings are reused; no new vault/secret path is created without proven need.
- Plesk host trust must use strict host-key checking; `ForwardAgent` is not a default assumption.
- Live infrastructure is not modified by this drift-remediation branch.
- Backup is not `VERIFIED_LIVE` until an isolated restore has evidence.
- PR #533 remains a read-only/prevalidation contract and is not merged or expanded by this plan.

---

### Task 1: Supersede the CRM-to-Azure specification

**Files:**
- Modify: `specs/007-crm-drupal-civicrm-auslagerung/spec.md`
- Modify: `specs/007-crm-drupal-civicrm-auslagerung/plan.md`
- Modify: `specs/007-crm-drupal-civicrm-auslagerung/tasks.md`
- Create: `specs/007-crm-drupal-civicrm-auslagerung/SUPERSEDED.md`

**Interfaces:**
- Consumes: architecture decision recorded in #535.
- Produces: one unambiguous historical tombstone that agents and humans cannot mistake for an active migration plan.

- [ ] **Step 1: Add the supersession record**

Create `SUPERSEDED.md` with the exact decisions:

```markdown
# SUPERSEDED: CRM Drupal + CiviCRM Auslagerung aus Plesk

Status: SUPERSEDED on 2026-08-28.

The former target "Drupal/CiviCRM leaves Plesk and moves to Azure" is no longer an active architecture decision.

Canonical runtime split:

- Plesk: Drupal/CiviCRM, Website, Forum
- Azure devmoe: API, Games, n8n

Do not execute VM provisioning, CRM cutover, DNS cutover away from Plesk, or Plesk CRM shutdown from this directory.

Replacement work is tracked in #535 and the rewritten CRM/Plesk issues #484, #486, #488, #489 and #493. Plesk read-only runtime verification is developed in PR #533.

Git history remains the source for the former migration design.
```

- [ ] **Step 2: Replace active `spec.md` instructions with a historical header**

The file must start with `# SUPERSEDED` and state that the historical contents are non-executable. It must not say `Status: Draft` or present Azure CRM migration as the current strategic decision.

- [ ] **Step 3: Replace `plan.md` with a compact historical plan tombstone**

The active summary must say the former Azure CRM implementation plan is cancelled and reference `SUPERSEDED.md`, #535 and the replacement Plesk issues. Do not retain executable provisioning/cutover steps in an active plan file.

- [ ] **Step 4: Replace `tasks.md` with a compact historical task tombstone**

The active task file must contain no unchecked Azure CRM provisioning, cutover, DNS migration or Plesk shutdown tasks. It must direct execution to #484, #486, #488, #489, #493, #436-#439 and PR #533.

- [ ] **Step 5: Verify the old migration is no longer executable**

Run:

```bash
rg -n "Status: Draft|Plesk wird nicht mehr als Zielplattform|Azure Linux VM|Plesk-CRM-vHost.*abschalten|Cutover.*Ziel-VM" specs/007-crm-drupal-civicrm-auslagerung
```

Expected: no active migration instruction; matches are allowed only inside `SUPERSEDED.md` when quoted as historical text.

- [ ] **Step 6: Commit**

```bash
git add specs/007-crm-drupal-civicrm-auslagerung
git commit -m "docs(crm): supersede Azure CRM migration spec"
```

---

### Task 2: Canonicalize the Plesk/Azure infrastructure split

**Files:**
- Modify: `specs/004-speckit-repo-wide-orchestrierung/tasks.md`

**Interfaces:**
- Consumes: current repo service split and BSM/host-trust rules.
- Produces: canonical infrastructure tasks with Plesk for CRM/Website/Forum and Azure for API/Games/n8n, without public credential assumptions.

- [ ] **Step 1: Rewrite the Phase 9 heading and contract**

Replace the host/IP/user-specific heading with:

```markdown
## Phase 9: Plesk-Infra-Track

> Plesk is the production runtime for CRM, Website and Forum. Connectivity values come from the existing BSM mapping. Strict host-key checking is mandatory. ForwardAgent is not a default requirement.
```

- [ ] **Step 2: Rewrite I901-I909 to match issues #436-#439 and PR #533**

The tasks must require read-only connectivity, inventory reuse, canonical deployment-path discovery, existing BSM references, health checks, rollback and no duplicate deploy scripts.

- [ ] **Step 3: Rewrite the Phase 10 heading and contract**

Use:

```markdown
## Phase 10: Azure-Infra-Track

> Azure devmoe is the container platform for API, Games and n8n only. It is not a target for Drupal/CiviCRM. Connectivity values and keys must be resolved through the existing secret-management contract.
```

- [ ] **Step 4: Remove direct credential assumptions from A901-A909**

Do not hardcode an IP, username or PEM filename in the canonical tasks. Preserve API/Games/n8n container responsibilities and the Azure track itself.

- [ ] **Step 5: Verify service ownership is unambiguous**

Run:

```bash
rg -n "Plesk-Infra-Track|Azure-Infra-Track|CRM|CiviCRM|API|Games|n8n|ForwardAgent|devmoelaptop.pem|20\\.91\\.246\\.245|5\\.183\\.217\\.146" specs/004-speckit-repo-wide-orchestrierung/tasks.md
```

Expected: Plesk owns CRM/Website/Forum; Azure owns API/Games/n8n; no IP/username/PEM/ForwardAgent-default remains.

- [ ] **Step 6: Commit**

```bash
git add specs/004-speckit-repo-wide-orchestrierung/tasks.md
git commit -m "docs(infra): canonicalize Plesk and Azure service ownership"
```

---

### Task 3: Fail closed on the obsolete issue generator

**Files:**
- Modify: `scripts/gh/create-spec-006-007-issues.sh`

**Interfaces:**
- Consumes: #535 supersession decision.
- Produces: a non-destructive tombstone script that cannot recreate old CRM migration issues.

- [ ] **Step 1: Replace the one-time combined generator with a fail-closed tombstone**

Use this structure:

```bash
#!/usr/bin/env bash
set -euo pipefail

cat >&2 <<'EOF'
This one-time issue generator is archived.
Spec 007 CRM-to-Azure migration was superseded on 2026-08-28 by #535.
Do not recreate those issues. Existing Forum/CRM issues are managed directly in GitHub.
EOF
exit 2
```

- [ ] **Step 2: Verify it cannot mutate GitHub**

Run:

```bash
bash scripts/gh/create-spec-006-007-issues.sh
```

Expected: exit code 2 before any `gh issue create`, `gh label create` or `gh project item-add` can execute.

- [ ] **Step 3: Static mutation scan**

Run:

```bash
rg -n "gh (issue create|label create|project item-add)" scripts/gh/create-spec-006-007-issues.sh
```

Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add scripts/gh/create-spec-006-007-issues.sh
git commit -m "chore(governance): archive superseded issue generator"
```

---

### Task 4: Repository verification and Draft PR

**Files:**
- Validate only; do not broaden scope.

**Interfaces:**
- Consumes: Tasks 1-3.
- Produces: a reviewable, non-production Draft PR linked to #535.

- [ ] **Step 1: Run repository governance checks**

```bash
npm run governance:check
npm run workspace:config:check
```

Expected: both exit 0.

- [ ] **Step 2: Run documentation/metadata checks used by repository CI**

```bash
npm run quality:gates
```

Expected: exit 0, or an existing-main baseline failure is documented with direct comparison rather than suppressed.

- [ ] **Step 3: Review the diff for scope**

```bash
git diff --check main...HEAD
git diff --name-only main...HEAD
```

Expected files only:

```text
docs/superpowers/plans/2026-08-28-crm-plesk-architecture-drift.md
specs/007-crm-drupal-civicrm-auslagerung/SUPERSEDED.md
specs/007-crm-drupal-civicrm-auslagerung/spec.md
specs/007-crm-drupal-civicrm-auslagerung/plan.md
specs/007-crm-drupal-civicrm-auslagerung/tasks.md
specs/004-speckit-repo-wide-orchestrierung/tasks.md
scripts/gh/create-spec-006-007-issues.sh
```

- [ ] **Step 4: Open a Draft PR**

Title:

```text
docs(architecture): supersede CRM Azure migration drift
```

The PR body must state that it changes repository governance/documentation only, leaves Azure active for API/Games/n8n, leaves CRM on Plesk, makes no live infrastructure changes, and links #535 and PR #533.

- [ ] **Step 5: Do not merge**

Keep the PR Draft until governance/workspace/security checks have completed and the known Codacy SARIF baseline failure is classified separately through #534.
