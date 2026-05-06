# 🔒 Security & GDPR Checklist

**Organisation:** Menschlichkeit Österreich  
**Compliance Officer:** gdpr@menschlichkeit-oesterreich.at  
**Last Review:** 2025-10-11

---

## ✅ Security Checklist

### Access Control
- [x] **Role-Based Access (RBAC)** - Drupal Roles + CiviCRM ACLs
- [x] **Financial ACLs** - Only Admin can view/edit financial data
- [x] **2FA Enforced** - For all admin accounts
- [x] **Strong Passwords** - Min. 12 chars, complexity rules
- [x] **Session Timeout** - 30 minutes idle
- [x] **IP Whitelisting** - Admin panel restricted to office IPs

### API Security
- [x] **API Keys Rotated** - Every 90 days
- [x] **Webhook Signatures** - Stripe, n8n verified
- [x] **Rate Limiting** - Max 100 requests/min per IP
- [x] **CORS Policy** - Whitelist only trusted domains
- [x] **TLS 1.3** - HTTPS enforced, HSTS enabled

### Data Protection
- [x] **Encryption at Rest** - Database encrypted (AES-256)
- [x] **Encryption in Transit** - HTTPS only, no HTTP
- [x] **PCI DSS Compliance** - Stripe handles all card data
- [x] **Regular Backups** - Daily, encrypted, off-site
- [x] **Audit Logging** - All changes tracked

---

## ✅ GDPR Compliance Checklist

### Legal Basis (Art. 6)
- [x] **Consent** - Explicit checkboxes (Newsletter, Marketing)
- [x] **Contract** - Membership agreements
- [x] **Legitimate Interest** - Event invitations for members

### Data Subject Rights

#### Right to Access (Art. 15)
- [x] **Implementation:** Self-Service Profile Page (`/mein-profil`)
- [x] **Data Export:** PDF/CSV download
- [x] **Response Time:** Automated (instant)

#### Right to Rectification (Art. 16)
- [x] **Implementation:** Edit profile fields
- [x] **Validation:** Email verification for changes
- [x] **Audit:** Activity logged

#### Right to Erasure (Art. 17)
- [x] **Implementation:** "Konto löschen" button
- [x] **Process:**
  1. Request submitted
  2. Review (check legal obligations: Finanzamt 7 years)
  3. Anonymization (not deletion if financial data exists)
  4. Confirmation email

#### Right to Data Portability (Art. 20)
- [x] **Implementation:** Export in machine-readable format (JSON, CSV)
- [x] **Scope:** All personal data + contributions + activities

#### Right to Object (Art. 21)
- [x] **Implementation:** Opt-Out checkboxes, Unsubscribe links
- [x] **Processing:** Automatic group removal

### Data Minimization (Art. 5)
- [x] **Collect Only Necessary Data:**
  - Name, Email: Required
  - Phone: Optional
  - Birthday: Optional (only for birthday greetings)
  - Address: Only for SEPA/Receipts

### Retention Periods
| Data Type | Retention | Legal Basis |
|-----------|-----------|-------------|
| **Contact Data** | Until consent withdrawn | Consent |
| **Financial Data** | 7 years | Tax law (BAO) |
| **Event Attendance** | 1 year | Legitimate interest |
| **Mailing Stats** | 2 years | Analytics |

### Privacy by Design
- [x] **Default Opt-Out:** Newsletter not checked by default
- [x] **Double Opt-In:** Confirmation email for subscriptions
- [x] **Minimal Data Collection:** No tracking without consent
- [x] **Pseudonymization:** Internal IDs, not names in logs

### Data Processing Agreements (DPA)
- [x] **Stripe** - Signed (PCI DSS compliant)
- [x] **SparkPost** - Signed (GDPR compliant)
- [x] **Hosting Provider** - Signed (EU-based)
- [x] **n8n** - Self-hosted (no third-party)

### Breach Notification (Art. 33/34)
**Process:**
1. Detect breach (monitoring, logs)
2. Contain (isolate affected systems)
3. Assess impact (# affected, data type)
4. Notify authorities (within 72h if high risk)
5. Notify data subjects (if high risk to rights)
6. Document incident

**Contact:** Österreichische Datenschutzbehörde (DSB)

---

## 🔐 Technical Measures

### Anonymization Script
```php
// Anonymize contact (GDPR erasure request)
function anonymizeContact($contactId) {
  civicrm_api4('Contact', 'update', [
    'where' => [['id', '=', $contactId]],
    'values' => [
      'first_name' => 'Anonymized',
      'last_name' => 'User',
      'email' => "anonymized_{$contactId}@deleted.local",
      'phone' => NULL,
      'street_address' => NULL,
      'postal_code' => NULL,
      'city' => NULL,
      'is_deleted' => 1,
      'do_not_email' => 1,
      'do_not_phone' => 1,
      'do_not_mail' => 1,
    ],
  ]);
  
  // Log activity
  civicrm_api4('Activity', 'create', [
    'values' => [
      'activity_type_id:name' => 'Data Anonymization',
      'source_contact_id' => $contactId,
      'subject' => 'Contact anonymized per GDPR request',
      'activity_date_time' => date('Y-m-d H:i:s'),
    ],
  ]);
}
```

### Consent Tracking
```yaml
Activity Type: "Consent Given"
Fields:
  - Consent Type (Newsletter, Marketing, Events)
  - Date Given
  - IP Address (hashed)
  - Double Opt-In Confirmed (Yes/No)
```

---

## 📋 Audit Log

### What to Log
- User logins/logouts
- Permission changes
- Financial data access
- Data exports
- Contact deletions/anonymizations
- Failed login attempts (security)

### Retention
- Audit logs: 1 year (GDPR Art. 5 accountability)

---

## 🔄 Review Schedule

**Monthly:**
- Access control review (remove ex-staff)
- Failed login attempts analysis
- Backup restore test

**Quarterly:**
- DPA review (any new processors?)
- Privacy policy update check
- GDPR training for staff

**Annually:**
- External security audit
- Penetration testing
- GDPR compliance audit

---

## ✅ Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Data Protection Officer** | - | 2025-10-11 | - |
| **IT Admin** | - | 2025-10-11 | - |
| **Legal Counsel** | - | 2025-10-11 | - |

---

<div align="center">
  <strong>🔒 Security & GDPR Compliant</strong>
</div>
