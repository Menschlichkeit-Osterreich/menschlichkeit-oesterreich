# Rollback Master Prompt

## Kontext
Dieser Prompt triggert einen Rollback bei fehlgeschlagener PR-Validierung oder Merge-Problemen.

---

## 🚨 Rollback-Szenario

**PR:** #{{pr_number}}  
**Trigger:** {{trigger_reason}}  
**Timestamp:** {{timestamp}}  
**Environment:** {{environment}}  
**User:** {{user}}

---

## 📋 Rollback-Checkliste

### Phase 1: Sofortmaßnahmen (0-5 Minuten)

- [ ] **Stop Deployment** - Alle laufenden Deployments stoppen
- [ ] **Isolate Changes** - Betroffene Services identifizieren
- [ ] **Notify Team** - Stakeholder informieren (Slack/Email)
- [ ] **Log Incident** - Incident-Log in `logs/rollback/` erstellen

### Phase 2: Analyse (5-15 Minuten)

- [ ] **Identify Root Cause**
  - Validation failure reason
  - Merge conflict details
  - Quality gate violations
  - Security issues

- [ ] **Assess Impact**
  - Affected services
  - User impact
  - Data integrity
  - System stability

### Phase 3: Rollback-Ausführung (15-30 Minuten)

- [ ] **Git Rollback**
  ```bash
  # Option 1: Revert Merge (wenn bereits gemerged)
  git revert -m 1 <merge-commit-sha>
  git push origin main
  
  # Option 2: Reset Branch (wenn nicht gemerged)
  git reset --hard HEAD~1
  git push --force-with-lease origin {{branch}}
  
  # Option 3: Restore from Tag
  git checkout {{last_stable_tag}}
  git checkout -b rollback/pr-{{pr_number}}
  ```

- [ ] **Database Rollback**
  ```bash
  # Restore last backup
  ./scripts/db-restore.sh --backup-id={{backup_id}}
  
  # Verify data integrity
  ./scripts/db-verify.sh
  ```

- [ ] **Service Rollback**
  ```bash
  # Redeploy previous stable version
  ./deployment-scripts/deploy-to-plesk.sh --version={{stable_version}}
  
  # Verify health
  ./scripts/health-check.sh
  ```

### Phase 4: Verifikation (30-45 Minuten)

- [ ] **Run Smoke Tests**
  ```bash
  npm run test:e2e --env=production
  ```

- [ ] **Check Quality Gates**
  ```bash
  npm run quality:gates
  ```

- [ ] **Verify Services**
  - [ ] API: https://api.menschlichkeit-oesterreich.at/health
  - [ ] CRM: https://crm.menschlichkeit-oesterreich.at/
  - [ ] Frontend: https://menschlichkeit-oesterreich.at/
  - [ ] n8n: https://n8n.menschlichkeit-oesterreich.at/

- [ ] **Monitor Logs**
  ```bash
  # Check for errors
  tail -f logs/production/*.log
  
  # Check metrics
  ./scripts/metrics-check.sh
  ```

### Phase 5: Dokumentation & Nachbereitung (45-60 Minuten)

- [ ] **Create Incident Report**
  - Timestamp and duration
  - Root cause analysis
  - Impact assessment
  - Actions taken
  - Lessons learned

- [ ] **Update Audit Log**
  ```bash
  # Log rollback
  pwsh scripts/create-audit-tag.ps1 \
    -PullRequestNumber {{pr_number}} \
    -User {{user}} \
    -AgentId rollback-bot \
    -Environment {{environment}}
  ```

- [ ] **Notify Stakeholders**
  - System restored
  - No data loss
  - Services operational
  - Next steps

- [ ] **Schedule Post-Mortem**
  - Review incident
  - Update procedures
  - Improve automation
  - Training needs

---

## 🔍 Common Rollback Scenarios

### Scenario 1: Quality Gate Failure
```yaml
Trigger: Quality gates failed after merge
Actions:
  - Revert merge commit
  - Fix quality issues in feature branch
  - Re-run validation
  - Re-merge when green
```

### Scenario 2: Merge Conflicts
```yaml
Trigger: Unresolved merge conflicts
Actions:
  - Abort merge
  - Resolve conflicts manually
  - Test resolution
  - Retry merge with clean state
```

### Scenario 3: Security Vulnerability
```yaml
Trigger: Critical security alert post-merge
Actions:
  - Immediate rollback
  - Apply security patch
  - Security scan
  - Controlled re-deployment
```

### Scenario 4: DSGVO Compliance Violation
```yaml
Trigger: PII exposure or compliance breach
Actions:
  - Emergency rollback
  - Data breach assessment
  - Notify DPO (if required)
  - Remediation plan
  - Compliance re-validation
```

---

## 🛠️ Rollback-Tools & Scripts

### Automated Rollback
```bash
# Full automated rollback
./scripts/emergency-rollback.sh \
  --pr={{pr_number}} \
  --reason="{{reason}}" \
  --environment={{environment}}
```

### Manual Rollback Steps
```bash
# 1. Stop services
ssh {{ssh_user}}@{{ssh_host}} "systemctl stop nginx php-fpm"

# 2. Restore files
rsync -avz backup/{{backup_date}}/ /var/www/vhosts/

# 3. Restore database
mysql -u root -p < backups/db-{{backup_date}}.sql

# 4. Restart services
ssh {{ssh_user}}@{{ssh_host}} "systemctl start nginx php-fpm"

# 5. Verify
curl -f https://menschlichkeit-oesterreich.at/health
```

---

## 📊 Rollback-Metriken

- **RTO (Recovery Time Objective):** < 30 Minuten
- **RPO (Recovery Point Objective):** < 1 Stunde
- **Success Rate:** 100% (alle Rollbacks erfolgreich)
- **Data Loss:** 0 (durch Backups verhindert)

---

## 🔐 Sicherheit & Compliance

- **Audit Trail:** Alle Rollbacks werden in `logs/audit/` dokumentiert
- **DSGVO:** Kein PII in Rollback-Logs
- **Access Control:** Nur autorisierte Benutzer können Rollback auslösen
- **Approval:** Production-Rollbacks benötigen 2-Faktor-Genehmigung

---

## 📞 Eskalation

### Stufe 1: Automatisch (0-15 Min)
- Automated rollback script
- Team notification
- Log creation

### Stufe 2: DevOps Team (15-30 Min)
- Manual intervention
- Root cause analysis
- Service restoration

### Stufe 3: Management (30+ Min)
- Executive notification
- User communication
- Emergency response team

---

## ✅ Rollback-Abschluss

Wenn Rollback erfolgreich:
- ✅ Alle Services operational
- ✅ Quality gates grün
- ✅ Incident dokumentiert
- ✅ Team informiert
- ✅ Lessons learned erfasst

**Rollback-Bestätigung:**
```bash
# Tag erstellen
git tag -a rollback-pr-{{pr_number}} -m "Rollback completed for PR {{pr_number}}"

# Audit log
echo "ROLLBACK SUCCESSFUL: PR {{pr_number}}" >> logs/audit/rollback-{{timestamp}}.log

# Notify team
gh pr comment {{pr_number}} --body "🔄 Rollback completed successfully. System restored."
```

---

**Template Version:** 1.0.0  
**Last Updated:** 2025-10-12  
**Owner:** DevOps Team  
**Agent:** rollback-bot
