---
title: "Mcpsecurityincident"
description: "Security Incident Response Flow (MCP-Enhanced)"
lastUpdated: 2025-10-10
status: ACTIVE
category: security
tags: ['security', 'mcp', 'dsgvo']
version: "1.0.0"
language: de-AT
audience: ['Security Team', 'DevOps']
---

```prompt
---
title: Security Incident Response mit MCP
description: DSGVO-konforme Security Incident Response für österreichische NGO
service: all
priority: critical
mcpTools: required
mcpServers: ['github', 'postgres', 'filesystem', 'brave-search', 'memory']
---

# Security Incident Response Flow (MCP-Enhanced)

**Trigger:** Security Alert / Data Breach Detection / Vulnerability Exploitation

## 🚨 Phase 1: Incident Detection & Classification

```
Via GitHub MCP:
"List all recent security alerts":
1. Dependabot Alerts (last 24h)
2. Secret Scanning Alerts
3. Code Scanning Alerts (SARIF)

Via Filesystem MCP:
"Check security logs":
→ security/logs/alerts-{DATE}.log
→ api.menschlichkeit-oesterreich.at/logs/security.log
→ crm.menschlichkeit-oesterreich.at/logs/watchdog.log

Via PostgreSQL MCP:
"Detect anomalous database activity":
SELECT 
  query, 
  usename, 
  client_addr, 
  COUNT(*) as frequency
FROM pg_stat_activity
WHERE state = 'active'
GROUP BY query, usename, client_addr
HAVING COUNT(*) > 100;  -- Potential SQL injection

CLASSIFICATION:
□ Security Incident Type:
  - [ ] Data Breach (PII exposed)
  - [ ] Unauthorized Access
  - [ ] Malware/Ransomware
  - [ ] DDoS Attack
  - [ ] Supply Chain Compromise
  - [ ] Insider Threat

□ Severity Level:
  - [ ] CRITICAL: PII/Financial Data exposed
  - [ ] HIGH: System compromise, no PII
  - [ ] MEDIUM: Vulnerability detected, not exploited
  - [ ] LOW: False positive / Informational
```text

## 🔒 Phase 2: Immediate Containment (0-15 Minutes)

```
IF CRITICAL (PII Breach):

1. STOP ALL AFFECTED SERVICES
Via Filesystem MCP:
"Execute emergency shutdown":
./scripts/emergency-shutdown.sh {SERVICE}

Services to consider:
□ api.menschlichkeit-oesterreich.at (FastAPI)
□ crm.menschlichkeit-oesterreich.at (Drupal/CiviCRM)
□ frontend (React App)
□ n8n (Automation)

2. ISOLATE DATABASE
Via PostgreSQL MCP:
"Revoke all non-admin access":
REVOKE ALL PRIVILEGES ON DATABASE {DB_NAME} FROM PUBLIC;
REVOKE CONNECT ON DATABASE {DB_NAME} FROM {APP_USER};

3. ROTATE ALL CREDENTIALS
Via Filesystem MCP:
"Generate new secrets":
./scripts/rotate-credentials.sh --emergency

Via GitHub MCP:
"Revoke all GitHub Personal Access Tokens"
"Invalidate all OAuth Apps"

4. BLOCK SUSPICIOUS IPs
Via Filesystem MCP:
"Update firewall rules":
./scripts/block-ip.sh {SUSPICIOUS_IP}

5. PRESERVE EVIDENCE
Via Filesystem MCP:
"Create forensic backup":
./scripts/forensic-snapshot.sh {TIMESTAMP}

Via PostgreSQL MCP:
"Dump audit logs":
COPY (
  SELECT * FROM audit_log 
  WHERE timestamp >= NOW() - INTERVAL '24 hours'
) TO '/tmp/incident-audit-{TIMESTAMP}.csv';
```text

## 🔍 Phase 3: Impact Assessment (15-60 Minutes)

```
Via PostgreSQL MCP - PII Exposure Check:
"Identify affected records":

-- Check for unauthorized access
SELECT 
  u.email,
  u.created_at,
  a.ip_address,
  a.user_agent,
  a.action
FROM users u
JOIN access_log a ON u.id = a.user_id
WHERE a.timestamp >= '{INCIDENT_START}'
  AND a.ip_address NOT IN ({TRUSTED_IPS});

-- Check for data exfiltration
SELECT 
  table_name,
  COUNT(*) as rows_accessed
FROM audit_log
WHERE action = 'SELECT'
  AND timestamp >= '{INCIDENT_START}'
  AND (
    table_name LIKE '%contact%' OR
    table_name LIKE '%donation%' OR
    table_name LIKE '%payment%'
  )
GROUP BY table_name;

AFFECTED DATA CATEGORIES:
□ Personal Data (Art. 4 GDPR):
  - Names: {COUNT}
  - Email Addresses: {COUNT}
  - Phone Numbers: {COUNT}
  - Postal Addresses: {COUNT}

□ Special Categories (Art. 9 GDPR):
  - Health Data: {COUNT}
  - Political Opinions: {COUNT}
  - Religious Beliefs: {COUNT}

□ Financial Data:
  - IBAN/Payment Info: {COUNT}
  - Donation History: {COUNT}

Via Filesystem MCP:
"Search for PII in application logs":
grep -r "email\|phone\|address" /var/log/app/ > /tmp/pii-in-logs-{TIMESTAMP}.txt

Via Brave Search MCP:
"Search for GDPR breach notification requirements Austria"
"Find Austrian Data Protection Authority contact details"
```text

## 📢 Phase 4: Legal Compliance (Art. 33/34 DSGVO)

```
BREACH NOTIFICATION DECISION TREE:

IF (affected_records > 0 AND contains_pii):
  
  STEP 1: Internal Notification (Immediate)
  Via GitHub MCP:
  "Create CRITICAL issue with template 'security-incident'":
  ---
  # 🚨 SECURITY INCIDENT: {INCIDENT_ID}
  
  **Classification:** {CRITICAL/HIGH/MEDIUM/LOW}
  **Type:** {Data Breach/Unauthorized Access/etc.}
  **Detected:** {TIMESTAMP}
  **Affected Records:** {COUNT}
  **PII Exposed:** {YES/NO}
  
  ## Immediate Actions Taken:
  - [x] Services shut down
  - [x] Credentials rotated
  - [x] Evidence preserved
  
  ## Data Protection Officer Notified: {YES/NO}
  ## Management Notified: {YES/NO}
  
  /label security-incident, critical
  /assign @datenschutzbeauftragter
  ---

  STEP 2: Authority Notification (Art. 33 GDPR - 72 Hours)
  IF (high_risk_to_rights_and_freedoms):
    
    Via Filesystem MCP:
    "Generate breach notification for Austrian DPA":
    
    Template: docs/templates/dsgvo-breach-notification.md
    
    **An:** Österreichische Datenschutzbehörde
    **Betreff:** Meldung einer Verletzung des Schutzes personenbezogener Daten gem. Art. 33 DSGVO
    
    1. **Art der Verletzung:** {DESCRIPTION}
    2. **Kategorien betroffener Daten:** {PII_CATEGORIES}
    3. **Ungefähre Anzahl betroffener Personen:** {COUNT}
    4. **Name Datenschutzbeauftragter:** {NAME}
    5. **Wahrscheinliche Folgen:** {ASSESSMENT}
    6. **Ergriffene Maßnahmen:** {REMEDIATION}
    
    Deadline: {TIMESTAMP + 72 hours}

  STEP 3: Individual Notification (Art. 34 GDPR - if high risk)
  IF (high_risk_to_individuals):
    
    Via Filesystem MCP + PostgreSQL MCP:
    "Generate personalized breach notifications":
    
    SELECT email, name FROM affected_users;
    
    Email Template:
    ---
    Betreff: Wichtige Information zur Sicherheit Ihrer Daten
    
    Sehr geehrte/r {NAME},
    
    wir müssen Ihnen leider mitteilen, dass am {DATE} ein Sicherheitsvorfall 
    aufgetreten ist, bei dem folgende Ihrer Daten betroffen waren:
    - {AFFECTED_DATA_CATEGORIES}
    
    Welche Maßnahmen haben wir ergriffen:
    - {REMEDIATION_STEPS}
    
    Was können Sie tun:
    - {RECOMMENDATIONS}
    
    Bei Fragen: datenschutz@menschlichkeit-oesterreich.at
    
    Mit freundlichen Grüßen,
    Menschlichkeit Österreich
    ---
    
    Via n8n Automation:
    "Trigger mass email workflow with personalization"
```text

## 🛠️ Phase 5: Root Cause Analysis

```
Via GitHub MCP:
"Search commit history for vulnerability introduction":
→ git log --all --grep="authentication" --since="3 months ago"

Via Filesystem MCP:
"Analyze security configuration":
→ security/config/auth.yaml
→ .env files (check for exposed secrets)
→ deployment-scripts/ (check for misconfigurations)

Via Brave Search MCP:
"Search for CVE details":
→ "CVE-{NUMBER} exploit analysis"
→ "{PACKAGE}@{VERSION} vulnerability report"

Via Memory MCP:
"Retrieve similar past incidents":
→ "Search for incidents with type={TYPE}"

ROOT CAUSE CATEGORIES:
□ Technical:
  - [ ] Unpatched Vulnerability (CVE-{NUMBER})
  - [ ] Misconfiguration (e.g., exposed .env)
  - [ ] Weak Authentication
  - [ ] SQL Injection
  - [ ] XSS Vulnerability

□ Process:
  - [ ] Missing Security Review
  - [ ] Insufficient Testing
  - [ ] Delayed Patching
  - [ ] Poor Access Control

□ Human:
  - [ ] Social Engineering
  - [ ] Phishing Attack
  - [ ] Insider Threat
  - [ ] Accidental Exposure
```text

## 🔧 Phase 6: Remediation

```
TECHNICAL FIXES:

Via Filesystem MCP:
"Apply security patch":

IF (sql_injection_detected):
  "Update all SQL queries to use parameterization"
  
  BEFORE (VULNERABLE):
  query = f"SELECT * FROM users WHERE id = {user_input}"
  
  AFTER (SECURE):
  query = "SELECT * FROM users WHERE id = %s"
  cursor.execute(query, (user_input,))

IF (xss_detected):
  "Sanitize all user inputs in frontend"
  
  import DOMPurify from 'dompurify';
  const cleanHTML = DOMPurify.sanitize(userInput);

IF (exposed_secrets):
  Via GitHub MCP:
  "Purge secrets from git history":
  git filter-repo --path .env --invert-paths
  
  "Add to .gitignore":
  echo ".env" >> .gitignore
  echo ".env.*" >> .gitignore

INFRASTRUCTURE HARDENING:

Via Filesystem MCP:
"Update security configurations":

1. Enable Web Application Firewall (WAF)
   → deployment-scripts/nginx/security.conf

2. Implement Rate Limiting
   → api.menschlichkeit-oesterreich.at/middleware/rate_limit.py

3. Enable Audit Logging
   → PostgreSQL: ALTER DATABASE SET log_statement = 'all';

4. Multi-Factor Authentication (MFA)
   → CRM: Enable Drupal TFA module
   → API: Implement TOTP

Via PostgreSQL MCP:
"Implement Row-Level Security (RLS)":

ALTER TABLE civicrm_contact ENABLE ROW LEVEL SECURITY;

CREATE POLICY contact_access_policy ON civicrm_contact
  USING (
    -- Users can only access their own data
    id = current_setting('app.current_user_id')::int
    OR
    -- Admins can access all
    current_setting('app.current_user_role') = 'admin'
  );
```text

## 🧪 Phase 7: Validation & Testing

```
Via Playwright MCP:
"Run security regression tests":

test('should prevent SQL injection', async ({ page }) => {
  await page.goto('/search');
  
  // Malicious input
  await page.fill('#search', "'; DROP TABLE users; --");
  await page.click('#submit');
  
  // Verify sanitization
  const response = await page.waitForResponse(/api\/search/);
  expect(response.status()).toBe(400); // Bad Request
});

test('should sanitize XSS', async ({ page }) => {
  await page.goto('/comment');
  
  await page.fill('#comment', '<script>alert("XSS")</script>');
  await page.click('#submit');
  
  // Verify no script execution
  const scriptTags = await page.$$('script');
  expect(scriptTags.length).toBe(0);
});

Via PostgreSQL MCP:
"Verify security policies":
SELECT * FROM pg_policies WHERE tablename = 'civicrm_contact';

Via Filesystem MCP:
"Run security scanner":
npm run security:scan
trivy fs . --severity HIGH,CRITICAL
```text

## 📊 Phase 8: Post-Incident Review

```
Via Memory MCP:
"Store incident learnings":

INCIDENT SUMMARY:
- ID: {INCIDENT_ID}
- Date: {TIMESTAMP}
- Type: {DATA_BREACH/UNAUTHORIZED_ACCESS/etc.}
- Root Cause: {ROOT_CAUSE}
- Affected Records: {COUNT}
- DSGVO Notification: {YES/NO}
- Resolution Time: {HOURS}

LESSONS LEARNED:
1. {LEARNING_1}
2. {LEARNING_2}
3. {LEARNING_3}

PREVENTIVE MEASURES:
1. {MEASURE_1}
2. {MEASURE_2}
3. {MEASURE_3}

Via GitHub MCP:
"Create post-mortem issue":
---

## Security Incident Post-Mortem: {INCIDENT_ID}

### Timeline:
- {TIME_1}: Incident detected
- {TIME_2}: Containment completed
- {TIME_3}: Root cause identified
- {TIME_4}: Remediation deployed
- {TIME_5}: Incident closed

### What Went Well:
- {POSITIVE_1}
- {POSITIVE_2}

### What Went Wrong:
- {NEGATIVE_1}
- {NEGATIVE_2}

### Action Items:
- [ ] {ACTION_1} (@owner, due: {DATE})
- [ ] {ACTION_2} (@owner, due: {DATE})

/label post-mortem, security
---

Via Filesystem MCP:
"Update incident response playbook":
docs/security/incident-response-playbook.md
```text

## 🎯 Success Criteria

```
TECHNICAL RESOLUTION:
✅ Vulnerability patched and verified
✅ All credentials rotated
✅ Security policies implemented
✅ Regression tests passing

LEGAL COMPLIANCE:
✅ DSGVO notification within 72h (if required)
✅ Affected individuals notified (if high risk)
✅ Documentation complete
✅ Austrian DPA informed (if required)

OPERATIONAL:
✅ Services restored
✅ Monitoring enhanced
✅ Team trained on learnings
✅ Incident playbook updated
```text

## 🔗 Emergency Contacts

```
Via Brave Search MCP:
"Find emergency contacts for Austrian data protection"

CONTACTS:
- Österreichische Datenschutzbehörde: +43 1 531 15-0
- IT Security Team: security@menschlichkeit-oesterreich.at
- Datenschutzbeauftragter: dpo@menschlichkeit-oesterreich.at
- Legal Counsel: legal@menschlichkeit-oesterreich.at
- Management: vorstand@menschlichkeit-oesterreich.at

HOTLINES:
- CERT.at: +43 1 5056416 78
- Polizei Cybercrime: 133 (Austria)
```text

---

**Verwendung:**
- Trigger: Security Alert / Anomaly Detection / Manual Report
- Erwartung: DSGVO-konforme Incident Response innerhalb 72h
- Output: Forensic Reports, Legal Notifications, Remediation Code, Updated Playbooks
```
