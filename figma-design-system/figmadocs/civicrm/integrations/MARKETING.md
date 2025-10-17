# 📬 Marketing Integration - Mailchimp

**Provider:** Mailchimp  
**Extension:** CiviCRM Mailchimp Sync (Optional)  
**Automation:** n8n Workflow  
**Sync Type:** Bi-directional

---

## 🎯 Übersicht

Vollständige Mailchimp-Integration für Newsletter-Management, Audience-Synchronisation und Campaign-Automation.

---

## 🔧 Setup

### Option A: n8n Workflow (Empfohlen) ✅

**File:** `automation/n8n/flows/Mailchimp_Sync_Groups_Audience.json`

**Vorteile:**
- ✅ Vollständige Kontrolle über Sync-Logik
- ✅ Bi-direktional (CiviCRM ↔ Mailchimp)
- ✅ Custom Merge Fields
- ✅ Error Handling & Monitoring
- ✅ Keine zusätzliche CiviCRM Extension

**Setup:**
```yaml
1. Mailchimp Account:
   - Create Audience "Menschlichkeit Österreich Newsletter"
   - Note Audience ID (z.B. "a1b2c3d4e5")
   - Generate API Key (Account → Extras → API Keys)

2. n8n Credentials:
   - Add Mailchimp Credential (API Key)
   - Add CiviCRM HTTP Header Auth (X-Civi-Auth: ${API_TOKEN})
   - Add Slack Webhook (Optional, für Notifications)

3. Environment Variables:
   MAILCHIMP_AUDIENCE_ID=a1b2c3d4e5
   MAILCHIMP_API_KEY=xxxxx-us21
   SLACK_WEBHOOK_URL=https://hooks.slack.com/...

4. Import Workflow:
   - n8n → Import → Select JSON
   - Activate Workflow
   - Test Execution (Manual Trigger)
```

---

### Option B: CiviCRM Extension (Alternative)

**Extension:** `uk.co.vedaconsulting.mailchimp`

```bash
# Install
cv ext:download uk.co.vedaconsulting.mailchimp
cv ext:enable uk.co.vedaconsulting.mailchimp
```

**Configuration:**
```
Mailings → CiviCRM Mailchimp → Settings

API Key: ${MAILCHIMP_API_KEY}
Sync Groups: Newsletter → Audience ID
Sync Frequency: Hourly (Cron)
Sync Direction: CiviCRM → Mailchimp (Unidirectional)
```

**Limitation:** Nur unidirektional (CiviCRM → MC), keine MC → CiviCRM Sync.

---

## 📊 Workflow-Logik (n8n)

### Sync-Flow

```
1. TRIGGER (Hourly Cron)
   ↓
2. FETCH CiviCRM Newsletter Group
   APIv4: GroupContact.get
   Filter: group_id:name = "Newsletter", status = "Added"
   Join: Contact (Email, Name)
   ↓
3. FETCH Mailchimp Audience
   Mailchimp API: GET /lists/{audience_id}/members
   Filter: status = "subscribed"
   ↓
4. CALCULATE DIFF
   Compare Email addresses:
   - In CiviCRM but NOT in MC → ADD to MC
   - In MC but NOT in CiviCRM → UNSUBSCRIBE from MC
   ↓
5. EXECUTE CHANGES
   5a. Add to Mailchimp:
       - Split Members
       - POST /lists/{id}/members
       - Status: "subscribed"
       - Merge Fields: FNAME, LNAME
   
   5b. Remove from Mailchimp:
       - Split Members
       - PATCH /lists/{id}/members/{hash}
       - Status: "unsubscribed"
   ↓
6. MERGE RESULTS
   Combine Add/Remove actions
   ↓
7. CREATE SUMMARY
   Count: Added, Removed, Total
   ↓
8. SEND NOTIFICATION (Slack)
   "🔄 Mailchimp Sync Complete
   Added: 5, Removed: 2"
```

---

## 🔄 Synchronisation

### CiviCRM → Mailchimp (Add)

**Trigger:** Contact added to Group "Newsletter" in CiviCRM

**n8n Processing:**
```javascript
// In "Calculate Diff" Node
const civiEmails = new Set(civiMembers.map(m => 
  m.json['contact_id.email']?.toLowerCase()
));

const mcEmails = new Set(mcMembers.map(m => 
  m.json.email_address?.toLowerCase()
));

const toAddMC = [];
civiMembers.forEach(civi => {
  const email = civi.json['contact_id.email']?.toLowerCase();
  if (!email || mcEmails.has(email)) return;
  
  toAddMC.push({
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      FNAME: civi.json['contact_id.first_name'] || '',
      LNAME: civi.json['contact_id.last_name'] || ''
    }
  });
});
```

**Mailchimp API Call:**
```http
POST https://<dc>.api.mailchimp.com/3.0/lists/{audience_id}/members
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "email_address": "max.mustermann@example.com",
  "status": "subscribed",
  "merge_fields": {
    "FNAME": "Max",
    "LNAME": "Mustermann"
  }
}
```

**Response:**
```json
{
  "id": "abc123",
  "email_address": "max.mustermann@example.com",
  "status": "subscribed",
  "merge_fields": {
    "FNAME": "Max",
    "LNAME": "Mustermann"
  }
}
```

---

### Mailchimp → CiviCRM (Remove)

**Trigger:** Contact unsubscribed in Mailchimp (NOT in CiviCRM Newsletter Group)

**n8n Processing:**
```javascript
const toRemoveMC = [];
mcMembers.forEach(mc => {
  const email = mc.json.email_address?.toLowerCase();
  
  // If in MC but NOT in CiviCRM Newsletter Group
  if (!civiEmails.has(email) && mc.json.status === 'subscribed') {
    toRemoveMC.push({email: email});
  }
});
```

**Mailchimp API Call:**
```http
PATCH https://<dc>.api.mailchimp.com/3.0/lists/{audience_id}/members/{subscriber_hash}
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "status": "unsubscribed"
}
```

**subscriber_hash:** MD5 hash of lowercase email

```javascript
const crypto = require('crypto');
const hash = crypto.createHash('md5')
  .update(email.toLowerCase())
  .digest('hex');
```

---

## 📋 Merge Fields Mapping

### Standard Fields

| CiviCRM Field | Mailchimp Merge Tag | Type |
|---------------|---------------------|------|
| first_name | FNAME | Text |
| last_name | LNAME | Text |
| email | EMAIL | Email (primary) |

### Custom Fields (Optional)

| CiviCRM Field | Mailchimp Merge Tag | Setup |
|---------------|---------------------|-------|
| Membership Type | MTYPE | Add in MC: Settings → Audience → Merge Tags |
| Member Since | MSINCE | Date field |
| City | CITY | Text field |
| Language Preference | LANG | Dropdown (DE/EN) |

**n8n Extension:**
```javascript
// In "Split Members (Add)" Node
merge_fields: {
  FNAME: $json.merge_fields.FNAME,
  LNAME: $json.merge_fields.LNAME,
  MTYPE: $json.membership_type || 'Supporter',
  MSINCE: $json.member_since || '',
  CITY: $json.city || ''
}
```

---

## 🏷️ Interest Groups (Tags)

**Use Case:** Segment subscribers by interests (Events, Surveys, Advocacy)

### Mailchimp Setup

```
Audience → Settings → Groups

Group Name: "Interessen"
Group Type: Checkboxes

Interests:
  - Events & Workshops
  - Umfragen & Feedback
  - Politische Aktionen
  - Community-Updates
```

**Interest IDs:** (from Mailchimp API)
```
events: "a1b2c3d4"
surveys: "e5f6g7h8"
advocacy: "i9j0k1l2"
community: "m3n4o5p6"
```

### CiviCRM Groups Mapping

```yaml
CiviCRM Group → Mailchimp Interest:
  "Events" → events (a1b2c3d4)
  "Surveys" → surveys (e5f6g7h8)
  "Advocacy" → advocacy (i9j0k1l2)
  "Community Updates" → community (m3n4o5p6)
```

### n8n Implementation (Advanced)

```javascript
// Fetch all relevant groups
const groups = ['Events', 'Surveys', 'Advocacy', 'Community'];
const groupMappings = {
  'Events': 'a1b2c3d4',
  'Surveys': 'e5f6g7h8',
  'Advocacy': 'i9j0k1l2',
  'Community': 'm3n4o5p6'
};

// Get contact's groups
const contactGroups = await civiAPI('GroupContact', 'get', {
  where: [['contact_id', '=', contactId]],
  select: ['group_id.name']
});

// Map to Mailchimp interests
const interests = {};
groups.forEach(group => {
  const inGroup = contactGroups.some(g => g['group_id.name'] === group);
  interests[groupMappings[group]] = inGroup;
});

// Add to Mailchimp member
{
  email_address: email,
  status: 'subscribed',
  merge_fields: {...},
  interests: interests // {"a1b2c3d4": true, "e5f6g7h8": false, ...}
}
```

---

## 📧 Campaign Integration

### Mailchimp Campaigns

**Use Case:** Design & send campaigns in Mailchimp, track in CiviCRM

**Workflow:**
```
1. Design Campaign in Mailchimp
   - Subject: "Neuigkeiten November 2025"
   - Template: Mailchimp Editor
   - Audience: Menschlichkeit Österreich Newsletter

2. Send Campaign
   - Schedule or Send Now

3. Track Opens/Clicks (Mailchimp)
   - Dashboard → Reports

4. Sync Stats to CiviCRM (Optional)
   - n8n Workflow: Fetch Campaign Stats
   - Create Activity in CiviCRM per contact
   - Type: "Email Opened" / "Link Clicked"
```

**n8n Workflow (Campaign Stats Sync):**
```yaml
Trigger: Daily (check new campaigns)

Steps:
  1. Fetch Recent Campaigns (Mailchimp API)
  2. For each campaign:
     - Fetch Email Activity (/reports/{id}/email-activity)
     - Filter: opens, clicks
  3. Match email to CiviCRM Contact
  4. Create Activity:
     - Type: "Email Opened" or "Link Clicked"
     - Subject: Campaign Title
     - Date: Activity Timestamp
```

---

## 🔔 Webhooks (Real-time Sync)

**Use Case:** Instant sync on subscribe/unsubscribe in Mailchimp

### Mailchimp Webhook Setup

```
Mailchimp → Audience → Settings → Webhooks

Webhook URL: https://n8n.menschlichkeit-oesterreich.at/webhook/mailchimp
Events:
  ✅ Subscribe
  ✅ Unsubscribe
  ✅ Profile Updates
  ✅ Cleaned (bounced/spam)
```

### n8n Webhook Handler

**New Workflow:** `Mailchimp_Webhook_to_CiviCRM.json`

```yaml
Trigger: Webhook (POST /webhook/mailchimp)

Processing:
  1. Parse Event Type
  2. IF subscribe:
       - Find/Create Contact in CiviCRM (by email)
       - Add to Group "Newsletter"
  
  3. IF unsubscribe:
       - Find Contact
       - Remove from Group "Newsletter"
       - Set do_not_email = 0 (respect preference)
  
  4. IF cleaned:
       - Find Contact
       - Set Email "On Hold" = Yes
       - Create Activity "Email Bounced (Mailchimp)"
  
  5. Respond 200 OK
```

**Example Event (Subscribe):**
```json
{
  "type": "subscribe",
  "fired_at": "2025-11-15 10:30:00",
  "data": {
    "email": "new.subscriber@example.com",
    "merges": {
      "EMAIL": "new.subscriber@example.com",
      "FNAME": "New",
      "LNAME": "Subscriber"
    }
  }
}
```

---

## 📊 Reports & Analytics

### Mailchimp Dashboard

**Metrics:**
- Audience Size: 1,250 subscribers
- Open Rate: 22% (industry avg: 21%)
- Click Rate: 3.5% (industry avg: 2.6%)
- Unsubscribe Rate: 0.3%
- Growth Rate: +5% (last 30 days)

### CiviCRM Custom Report

```sql
-- Newsletter Subscribers by Status
SELECT
  c.id,
  c.display_name,
  c.email,
  gc.status AS newsletter_status,
  COUNT(a.id) AS email_opens_last_90_days
FROM civicrm_contact c
LEFT JOIN civicrm_group_contact gc 
  ON c.id = gc.contact_id 
  AND gc.group_id = (SELECT id FROM civicrm_group WHERE name = 'Newsletter')
LEFT JOIN civicrm_activity_contact ac ON c.id = ac.contact_id
LEFT JOIN civicrm_activity a 
  ON ac.activity_id = a.id 
  AND a.activity_type_id = (SELECT value FROM civicrm_option_value WHERE name = 'Email Opened')
  AND a.activity_date_time >= DATE_SUB(NOW(), INTERVAL 90 DAY)
WHERE gc.status = 'Added'
GROUP BY c.id
ORDER BY email_opens_last_90_days DESC;
```

---

## 🔐 Security & Compliance

### GDPR

**Double Opt-In (Recommended):**
```
Mailchimp → Audience → Settings → Form Settings
✅ Enable Double Opt-In

Flow:
  1. User subscribes via CiviCRM form
  2. n8n adds to Mailchimp (status: "pending")
  3. Mailchimp sends confirmation email
  4. User clicks confirm link
  5. Status → "subscribed"
  6. Webhook → n8n → Update CiviCRM Group status
```

**Data Retention:**
- Unsubscribed contacts: Keep in Mailchimp (archived)
- Cleaned contacts: Remove after 30 days
- GDPR deletion: Remove from both CiviCRM & Mailchimp

**Mailchimp API (Delete):**
```http
DELETE https://<dc>.api.mailchimp.com/3.0/lists/{audience_id}/members/{subscriber_hash}
```

---

## 🧪 Testing

### Test Workflow

```
1. Add Test Contact to CiviCRM:
   - Name: "Test Subscriber"
   - Email: test+mc@example.com
   - Group: Newsletter

2. Wait for Sync (or trigger manually in n8n)

3. Verify in Mailchimp:
   - Audience → All Contacts
   - Search: test+mc@example.com
   - Status: Subscribed
   - FNAME: Test
   - LNAME: Subscriber

4. Remove from CiviCRM Group

5. Wait for Sync

6. Verify in Mailchimp:
   - Status: Unsubscribed

7. Cleanup:
   - Delete from CiviCRM
   - Delete from Mailchimp (Permanently delete)
```

---

## 🚨 Troubleshooting

### Issue: Contacts not syncing

**Diagnostics:**
```
1. Check n8n Execution Log:
   - Executions → Filter by "Mailchimp Sync"
   - Check for errors

2. Verify CiviCRM Group:
   - Contacts → Manage Groups → Newsletter
   - Check member count

3. Verify Mailchimp Audience:
   - Audience → Dashboard
   - Check subscriber count

4. Check Email Format:
   - Invalid emails are skipped
   - CiviCRM: must have valid email (not "On Hold")
```

**Fix:**
```
- Ensure MAILCHIMP_AUDIENCE_ID is correct
- Verify API credentials in n8n
- Check n8n workflow is activated
- Review error messages in execution log
```

---

### Issue: Duplicate Subscribers

**Cause:** Mailchimp uses lowercase email for matching

**Prevention:**
```javascript
// In n8n "Calculate Diff" Node
const email = contact.email?.toLowerCase().trim();
```

**Fix:**
```
Mailchimp → Audience → Settings → Audience Name and Defaults
→ Contact Information → Require email confirmation for updates
```

---

## 📈 Advanced Features

### Segmentation

**Use Case:** Send targeted campaigns based on CiviCRM data

**Example Segment:**
```
Name: "Active Members (Vienna)"
Conditions:
  - Interest: Events = Yes
  - Merge Field: CITY = "Wien"
  - Merge Field: MTYPE = "Active" OR "Champion"
```

**CiviCRM Smart Group → Mailchimp Segment:**
```
1. Create Smart Group in CiviCRM:
   - Name: "Active Members Vienna"
   - Criteria: Membership Type IN (Active, Champion) AND City = Wien

2. Extend n8n Workflow:
   - Add loop for Smart Groups
   - Create/Update Mailchimp Segment
   - Sync members
```

---

### A/B Testing

**Mailchimp Feature:** Built-in A/B Testing

```
Campaign → Create → A/B Test

Test Variable:
  - Subject Line
  - From Name
  - Send Time

Split: 50% / 50%
Winner Criteria: Open Rate
Send to Remaining: After 4 hours
```

---

## 🔮 Future Enhancements

- [ ] **Real-time Webhook Sync** (Subscribe/Unsubscribe instant)
- [ ] **Campaign Stats Sync** (Opens/Clicks → CiviCRM Activities)
- [ ] **Advanced Segments** (CiviCRM Smart Groups → MC Segments)
- [ ] **Custom Merge Fields** (Membership Type, City, etc.)
- [ ] **Interest Groups Sync** (CiviCRM Groups ↔ MC Interests)

---

## 📚 Resources

- **Mailchimp API Docs:** https://mailchimp.com/developer/
- **n8n Mailchimp Node:** https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mailchimp/
- **CiviCRM Mailchimp Extension:** https://github.com/veda-consulting/uk.co.vedaconsulting.mailchimp

---

<div align="center">
  <br />
  <strong>📬 Mailchimp Integration Complete</strong>
  <br />
  <sub>Bi-directional Sync | n8n Automation | GDPR-konform</sub>
</div>
