# 🏦 SEPA Integration - CiviSEPA

**Extension:** CiviSEPA  
**Version:** 1.8+  
**Mandate Types:** RCUR (Recurring), OOFF (One-Off)  
**Standard:** SEPA Direct Debit (SDD)

---

## 🎯 Übersicht

Vollständige SEPA-Lastschrift-Integration für wiederkehrende Mitgliedsbeiträge und Spenden mit PAIN.008 XML-Export und PAIN.002 Return-File-Import.

---

## 🔧 Setup

### 1. Extension Installation

```bash
# Download & Install
cv ext:download org.project60.sepa
cv ext:enable org.project60.sepa

# Verify
cv api4 Extension.get +w name=org.project60.sepa
```

**Repository:** https://github.com/Project60/org.project60.sepa

---

### 2. Creditor Configuration

**Path:** Administer → CiviSEPA → Settings → Creditors

```yaml
Creditor Name: "Menschlichkeit Österreich"
Creditor Identifier (CI): "AT00ZZZ00000000001" # Von Bank erhalten
Creditor Contact: [CiviCRM Contact ID]
IBAN: "AT611904300234573201" # Vereinskonto
BIC: "BKAUATWW"
Currency: EUR
```

**Creditor Identifier Format (Austria):**
```
AT + 00 + ZZZ + 11-digit number
Beispiel: AT00ZZZ00000123456
```

**Beantragung:** Bei Hausbank (z.B. Bank Austria, Erste Bank)

---

### 3. Mandate Reference Format

**Format:** `OEMOXXXX-YYYY-ZZZZ`

- **OEMO:** Prefix (Menschlichkeit Österreich)
- **XXXX:** Contact ID (4-stellig, zero-padded)
- **YYYY:** Jahr (2025)
- **ZZZZ:** Sequenz (laufende Nummer)

**Beispiel:** `OEMO0123-2025-0001`

**Konfiguration:**
```
CiviSEPA Settings → Mandate Reference

Prefix: OEMO
Format: {prefix}{contact_id}-{year}-{sequence}
Padding: 4 digits
```

---

## 💶 Mandate Types

### RCUR - Recurring (Wiederkehrend)

**Use Cases:**
- Mitgliedsbeiträge (monatlich)
- Regelmäßige Spenden
- Abonnements

**Flow:**
```
1. User submits Webform (/mitglied-werden)
2. IBAN validiert (Mod-97 Check)
3. SepaMandate erstellt (Type: RCUR, Status: FRST)
4. ContributionRecur erstellt
5. First debit: FRST (First)
6. Following debits: RCUR (Recurring)
```

**SEPA Sequence Codes:**
- **FRST:** First debit in recurring series
- **RCUR:** Recurring debit (2nd onwards)
- **FNAL:** Final debit in series
- **OOFF:** One-off debit

---

### OOFF - One-Off (Einmalig)

**Use Cases:**
- Einmalige Spenden (falls Stripe nicht gewünscht)
- Event-Tickets (Sonderfall)

**Flow:**
```
1. User submits donation (SEPA option)
2. SepaMandate (Type: OOFF, Status: OOFF)
3. Contribution erstellt
4. Single debit executed
5. Mandate closed
```

---

## 📅 Batch Processing

### 1. Batch Creation (Automatisch via Cron)

**Scheduled Job:** `SepaCreateBatches`

```yaml
Frequency: Daily 22:00 CET
Parameters:
  - notice_days: 14 (SEPA Pre-Notification: 14 Tage vorher)
  - collection_date: AUTO (nächster Bankarbeitstag + notice)
  - type: RCUR / OOFF
```

**Batch-Lifecycle:**
```
Open → Closed → Sent → Received → (Completed/Partial)
```

---

### 2. Batch Review & Close

**Path:** CiviCRM → CiviSEPA → Batches

**Actions:**
1. **Review Batch:**
   - Anzahl Mandate
   - Gesamtbetrag
   - Collection Date
   - Fehlerhafte Mandate (z.B. fehlendes IBAN)

2. **Close Batch:**
   - Status: Open → Closed
   - PAIN.008 XML generiert
   - Pre-Notification Emails versendet (Optional)

3. **Export PAIN.008:**
   - Download XML
   - Upload zu Banking-Portal

4. **Mark as Sent:**
   - Status: Closed → Sent
   - Sent Date: TODAY

---

### 3. PAIN.008 XML Export

**Format:** ISO 20022 PAIN.008.001.02

**Struktur:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>OEMO-20251115-001</MsgId>
      <CreDtTm>2025-11-15T22:00:00</CreDtTm>
      <NbOfTxs>25</NbOfTxs>
      <CtrlSum>750.00</CtrlSum>
      <InitgPty>
        <Nm>Menschlichkeit Österreich</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>RCUR-20251130</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <NbOfTxs>25</NbOfTxs>
      <CtrlSum>750.00</CtrlSum>
      <ReqdColltnDt>2025-11-30</ReqdColltnDt>
      <Cdtr>
        <Nm>Menschlichkeit Österreich</Nm>
      </Cdtr>
      <CdtrAcct>
        <Id>
          <IBAN>AT611904300234573201</IBAN>
        </Id>
      </CdtrAcct>
      <CdtrAgt>
        <FinInstnId>
          <BIC>BKAUATWW</BIC>
        </FinInstnId>
      </CdtrAgt>
      <CdtrSchmeId>
        <Id>
          <PrvtId>
            <Othr>
              <Id>AT00ZZZ00000123456</Id>
            </Othr>
          </PrvtId>
        </Id>
      </CdtrSchmeId>
      <DrctDbtTxInf>
        <PmtId>
          <EndToEndId>OEMO0123-2025-0001</EndToEndId>
        </PmtId>
        <InstdAmt Ccy="EUR">30.00</InstdAmt>
        <DrctDbtTx>
          <MndtRltdInf>
            <MndtId>OEMO0123-2025-0001</MndtId>
            <DtOfSgntr>2025-10-01</DtOfSgntr>
            <AmdmntInd>false</AmdmntInd>
          </MndtRltdInf>
        </DrctDbtTx>
        <DbtrAgt>
          <FinInstnId>
            <BIC>GIBAATWWXXX</BIC>
          </FinInstnId>
        </DbtrAgt>
        <Dbtr>
          <Nm>Max Mustermann</Nm>
        </Dbtr>
        <DbtrAcct>
          <Id>
            <IBAN>AT483200000012345864</IBAN>
          </Id>
        </DbtrAcct>
        <RmtInf>
          <Ustrd>Mitgliedsbeitrag November 2025</Ustrd>
        </RmtInf>
      </DrctDbtTxInf>
      <!-- Weitere Transaktionen... -->
    </PmtInf>
  </CstmrDrctDbtInitn>
</Document>
```

**Download:**
```
CiviSEPA → Batches → [Batch auswählen] → "Download PAIN file"
```

**Upload zu Bank:**
- Online-Banking Portal
- EBICS (für größere Organisationen)
- SFTP (automatisiert)

---

## 🔄 Return File Processing

### PAIN.002 - Payment Status Report

**Szenarien:**
- **Successful Debit:** Confirmation
- **Failed Debit:** Rejection (z.B. insufficient funds, invalid IBAN)
- **Return Debit:** Rückgabe (z.B. Debtor revocation)

**Import:**
```
CiviSEPA → Batches → [Batch auswählen] → "Upload return file (PAIN.002)"
```

**Processing:**
```
1. Parse PAIN.002 XML
2. Match by Mandate Reference (EndToEndId)
3. Update Contribution Status:
   - Success → Completed
   - Rejected → Failed
   - Returned → Cancelled (+ refund if already collected)
4. Update Mandate Status:
   - Failed → Invalid (suspend)
   - Returned → Cancelled
5. Create Activities (Error Logs)
6. Trigger CiviRules (Notifications)
```

---

## 📧 Pre-Notification

**SEPA Requirement:** Debtor muss 14 Tage vorher informiert werden

**Implementation:**

### Option 1: Email via CiviRules

```yaml
Rule: "SEPA Pre-Notification Email"
Trigger: "Scheduled (14 days before collection)"
Conditions:
  - Batch Status = Closed
  - Mandate Status = Active
Actions:
  - Send Email (Template: "SEPA Pre-Notification")
    To: {contact.email}
    Subject: "Lastschrift-Einzug am {collection_date}"
```

**Email Template:**
```
Betreff: Lastschrift-Einzug am {collection_date}

Hallo {contact.first_name},

wir werden am {collection_date} folgende Lastschrift einziehen:

Betrag: €{amount}
Zweck: {purpose}
Mandat: {mandate_reference}
IBAN: {iban_masked} (****{iban_last4})

Falls Fragen bestehen, kontaktiere uns unter finance@menschlichkeit-oesterreich.at.

Mit freundlichen Grüßen,
Menschlichkeit Österreich

---
Mandatsreferenz: {mandate_reference}
Gläubiger-ID: AT00ZZZ00000123456
```

---

### Option 2: Batch Email (CiviSEPA)

```
CiviSEPA → Batches → [Batch] → "Send Pre-Notification Emails"

Template: Custom (siehe oben)
Recipients: All contacts in batch
Timing: 14 days before collection
```

---

## ❌ Failed Debit Handling

### Workflow

```
1. PAIN.002 Import → Contribution Status: Failed
2. CiviRules Trigger: "Contribution Failed"
3. Actions:
   a) Send Email "Zahlung fehlgeschlagen"
   b) Tag Contact: "Payment Issue"
   c) Create Activity: "Follow-up required"
   d) Update Mandate Status: "Invalid" (after 2 failures)
```

**Email Template (Failed Payment):**
```
Betreff: Lastschrift fehlgeschlagen

Hallo {contact.first_name},

leider konnte die Lastschrift vom {collection_date} nicht eingezogen werden.

Betrag: €{amount}
Grund: {rejection_reason}
Mandat: {mandate_reference}

Bitte überprüfe dein Konto und aktualisiere ggf. deine Bankdaten:
{profile_edit_url}

Alternativ kannst du per Überweisung zahlen:
IBAN: AT611904300234573201
BIC: BKAUATWW
Verwendungszweck: {contribution_id}

Bei Fragen: finance@menschlichkeit-oesterreich.at

Vielen Dank!
```

---

### Retry Strategy

```yaml
First Failure:
  - Send notification email
  - Retry in next batch (after 30 days)

Second Failure:
  - Send urgent notification
  - Tag: "Payment Issue"
  - Manual follow-up (Staff)

Third Failure:
  - Suspend mandate
  - Update Membership Status: Grace Period
  - Offer alternative payment method (Stripe)
```

---

## 🔒 Mandate Management

### Mandate Lifecycle

```
Created → Active (FRST) → Recurring (RCUR) → Cancelled/Invalid
```

**Status Codes:**
- **FRST:** First debit pending
- **RCUR:** Recurring active
- **OOFF:** One-off
- **INVALID:** Failed debits, suspended
- **CANCELLED:** Revoked by debtor

---

### Mandate Revocation (Widerruf)

**User Action:**
```
Profile → SEPA Mandates → "Mandat widerrufen"
```

**Backend Processing:**
```php
civicrm_api4('SepaMandate', 'update', [
  'where' => [['id', '=', $mandateId]],
  'values' => [
    'status' => 'INVALID',
    'is_enabled' => 0,
  ],
]);

// Cancel ContributionRecur
civicrm_api4('ContributionRecur', 'cancel', [
  'where' => [['id', '=', $recurId]],
]);

// Send confirmation email
```

**Confirmation Email:**
```
Betreff: Mandat widerrufen

Hallo {contact.first_name},

dein SEPA-Mandat {mandate_reference} wurde erfolgreich widerrufen.

Es erfolgen keine weiteren Lastschriften.

Falls du die Mitgliedschaft fortsetzen möchtest, wähle bitte eine alternative Zahlungsmethode:
{payment_options_url}

Vielen Dank!
```

---

## 📊 Reports & Analytics

### CiviSEPA Reports

**Path:** CiviSEPA → Reports

#### 1. Mandate Overview
```
Total Mandates: 150
Active (RCUR): 120
Inactive: 20
Invalid: 10

Monthly Recurring Revenue (MRR): €3,600
```

#### 2. Batch History
```
Date       | Type | Count | Amount    | Status
2025-11-30 | RCUR | 120   | €3,600.00 | Sent
2025-10-31 | RCUR | 115   | €3,450.00 | Completed
2025-09-30 | RCUR | 110   | €3,300.00 | Completed
```

#### 3. Failed Debits
```
Contact       | Date       | Amount | Reason
Max M.        | 2025-11-30 | €30.00 | Insufficient funds
Anna K.       | 2025-11-30 | €50.00 | Invalid IBAN
```

---

### Custom SQL Reports

```sql
-- Monthly Recurring Revenue
SELECT
  SUM(amount) AS mrr,
  COUNT(DISTINCT mandate_id) AS active_mandates
FROM civicrm_sdd_mandate
WHERE status = 'RCUR'
  AND is_enabled = 1;

-- Churn Rate (Cancelled Mandates)
SELECT
  DATE_FORMAT(modified_date, '%Y-%m') AS month,
  COUNT(*) AS cancelled
FROM civicrm_sdd_mandate
WHERE status = 'INVALID'
  AND modified_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY month;

-- Average Mandate Lifetime
SELECT
  AVG(DATEDIFF(NOW(), creation_date)) AS avg_days
FROM civicrm_sdd_mandate
WHERE status IN ('RCUR', 'INVALID', 'CANCELLED');
```

---

## 🔐 Security & Compliance

### SEPA Compliance

**Requirements:**
- ✅ **Creditor Identifier:** Registered with bank
- ✅ **Pre-Notification:** 14 days (email)
- ✅ **Mandate Signature:** Digital or Paper
- ✅ **Data Retention:** 14 months after final debit
- ✅ **Revocation:** Immediate processing

### GDPR

**Data Stored:**
- IBAN (encrypted)
- BIC
- Account Holder Name
- Mandate Reference
- Signature Date

**Rights:**
- ✅ Access: View in profile
- ✅ Rectification: Update IBAN
- ✅ Erasure: Anonymize (retain for 14 months)
- ✅ Portability: Export mandate data

**Encryption:**
```php
// IBAN stored encrypted (CiviSEPA handles this)
// Visible only to authorized users (Financial ACL)
```

---

## 🧪 Testing

### Test IBAN (Austria)

```
Valid Test IBANs:
AT611904300234573201 (Bank Austria)
AT483200000012345864 (Erste Bank)

Invalid Test IBANs (for testing validation):
AT000000000000000000 (Invalid checksum)
DE89370400440532013000 (Wrong country)
```

### Test Workflow

```
1. Create Test Contact
2. Submit Mitglied-Werden Form (SEPA)
3. Verify Mandate Created (Status: FRST)
4. Verify ContributionRecur Created
5. Run SepaCreateBatches Job
6. Review Batch (should contain test mandate)
7. Export PAIN.008 (validate XML)
8. Import PAIN.002 (simulate success)
9. Verify Contribution Status: Completed
10. Verify Mandate Status: RCUR
```

---

## 🔄 Automation

### Scheduled Jobs

```yaml
SepaCreateBatches:
  Frequency: Daily 22:00 CET
  Parameters: {notice_days: 14, type: 'RCUR'}

SepaProcessBatch:
  Frequency: On-Demand (manual trigger after PAIN.002 upload)

SepaCleanup:
  Frequency: Weekly
  Action: Archive old batches (> 12 months)
```

### CiviRules Integration

```yaml
Rules:
  - "SEPA Pre-Notification" (14 days before)
  - "SEPA Debit Failed" (on PAIN.002 rejection)
  - "SEPA Mandate Revoked" (on user action)
  - "SEPA First Debit Success" (FRST → RCUR transition)
```

---

## 📞 Support

### Bank Contact
- **Bank:** Bank Austria
- **Contact:** sepa-support@bankaustria.at
- **Hotline:** +43 5 05 05-0

### CiviSEPA Community
- **Forum:** https://civicrm.stackexchange.com
- **GitHub:** https://github.com/Project60/org.project60.sepa
- **Documentation:** https://docs.civicrm.org/sepa

---

## 🔮 Future Enhancements

- [ ] **Auto-Retry Failed Debits** (Smart Retry Logic)
- [ ] **Predictive Analytics** (Churn Prediction)
- [ ] **IBAN Validation API** (Real-time check with bank)
- [ ] **Mobile App** (Mandate Management)

---

<div align="center">
  <br />
  <strong>🏦 SEPA Integration Complete</strong>
  <br />
  <sub>RCUR + OOFF | PAIN.008 + PAIN.002 | Fully Automated</sub>
</div>
