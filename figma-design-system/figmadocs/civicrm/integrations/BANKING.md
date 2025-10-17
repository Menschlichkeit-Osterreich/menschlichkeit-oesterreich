# 🏦 Banking Integration - CiviBanking

**Extension:** CiviBanking  
**Version:** 0.8+  
**Formats:** CAMT.053, MT940, CSV  
**Purpose:** Automated bank statement import & transaction matching

---

## 🎯 Übersicht

CiviBanking ermöglicht automatischen Import von Bankauszügen und intelligentes Matching zu Contributions und Memberships.

---

## 🔧 Setup

### 1. Extension Installation

```bash
# Download & Install
cv ext:download org.project60.banking
cv ext:enable org.project60.banking

# Verify
cv api4 Extension.get +w name=org.project60.banking
```

**Repository:** https://github.com/Project60/org.project60.banking

---

### 2. Bank Account Configuration

**Path:** CiviCRM → CiviBanking → Configuration → Accounts

```yaml
Account Name: "Menschlichkeit Österreich - Hauptkonto"
Reference: "AT611904300234573201" (IBAN)
Description: "Bank Austria Vereinskonto"
```

**Wiederholen für weitere Konten:**
- Sparkonto
- PayPal-Konto (falls vorhanden)
- Stripe-Account (als Referenz)

---

## 📥 Import Formats

### 1. CAMT.053 (ISO 20022)

**Standard:** XML-Format der meisten europäischen Banken

**Konfiguration:**

```
CiviBanking → Configuration → Importers → New Importer

Name: "CAMT.053 - Bank Austria"
Plugin: "CAMT.053 Importer"
Account: AT611904300234573201
```

**File Upload:**
```
CiviBanking → Payments → Import

File: statement_20251130.xml
Importer: CAMT.053 - Bank Austria
```

**Automatic Processing:**
- Parsing XML
- Creating BankingTransaction records
- Auto-matching (siehe Matching Rules)

---

### 2. MT940 (SWIFT Format)

**Legacy Format:** Noch von einigen Banken verwendet

**Sample MT940:**
```
:20:STATEMENT-001
:25:AT611904300234573201
:28C:00001/001
:60F:C251101EUR5000,00
:61:2511021102D30,00NMSCNONREF//OEMO0123-2025-0001
Max Mustermann
AT483200000012345864
Mitgliedsbeitrag November
:62F:C251102EUR4970,00
```

**Konfiguration:**
```
Importer: MT940
Parsing Rules:
  - Transaction ID: Field :61 (Reference)
  - Amount: Field :61 (Sign + Amount)
  - Purpose: Multi-line text
  - IBAN: Extract from purpose
```

---

### 3. CSV Import

**Use Case:** Kleinere Banken, PayPal, Stripe Exports

**Sample CSV:**
```csv
Date,Reference,Debtor Name,Debtor IBAN,Amount,Currency,Purpose
2025-11-02,TRX001,Max Mustermann,AT48...,30.00,EUR,Mitgliedsbeitrag Nov
2025-11-05,TRX002,Anna Kraft,AT61...,25.00,EUR,Spende
2025-11-10,TRX003,Peter Schmidt,DE89...,50.00,EUR,Event-Ticket
```

**Importer Configuration:**
```yaml
Name: "CSV - Bank Austria"
Plugin: "CSV Importer"
Delimiter: ","
Encoding: "UTF-8"

Column Mapping:
  - Date → transaction_date
  - Reference → bank_reference
  - Debtor Name → party_name
  - Debtor IBAN → party_iban
  - Amount → amount
  - Currency → currency
  - Purpose → purpose
```

---

## 🎯 Matching Rules

### 1. SEPA Mandate Matching

**Rule:** Match by Mandate Reference in purpose text

```yaml
Name: "SEPA Mandate Matcher"
Priority: 1 (highest)
Plugin: "Analyser: Regular Expression"

Pattern: /OEMO(\d{4})-(\d{4})-(\d{4})/
Capture Groups:
  - Contact ID: $1
  - Year: $2
  - Sequence: $3

Actions:
  - Lookup SepaMandate by reference
  - IF found:
      Create Contribution (linked to ContributionRecur)
      Status: Completed
      Payment Instrument: "EFT" (SEPA)
```

**Example:**
```
Purpose: "Mitgliedsbeitrag Nov, Ref: OEMO0123-2025-0001"
→ Match Mandate OEMO0123-2025-0001
→ Create Contribution €30.00
→ Update Membership End Date +1 month
```

---

### 2. IBAN Matching

**Rule:** Match by Debtor IBAN to Contact

```yaml
Name: "IBAN Matcher"
Priority: 2
Plugin: "Analyser: Contact"

Lookup:
  - Search Contact where IBAN = {party_iban}
  - IF found:
      Suggest Contribution (Manual Review)
  - IF multiple:
      Flag for manual review
```

**Example:**
```
IBAN: AT483200000012345864
→ Search Contact with custom field "IBAN"
→ Found: Max Mustermann (ID: 123)
→ Suggest: Create Donation €25.00
```

---

### 3. Name Matching (Fuzzy)

**Rule:** Fuzzy match by debtor name

```yaml
Name: "Name Fuzzy Matcher"
Priority: 3
Plugin: "Analyser: Name"

Algorithm: Levenshtein Distance
Threshold: 85% similarity

Lookup:
  - Search Contact where display_name LIKE {party_name}
  - Score matches
  - Suggest top 3 (if score > 85%)
```

**Example:**
```
Debtor: "M. Musterman" (typo)
→ Fuzzy search: "Max Mustermann" (90% match)
→ Suggest: Create Contribution
```

---

### 4. Amount + Date Matching

**Rule:** Match pending contributions by amount + date range

```yaml
Name: "Pending Contribution Matcher"
Priority: 4
Plugin: "Analyser: Contribution"

Lookup:
  - Search Contribution WHERE:
      total_amount = {amount}
      contribution_status = "Pending"
      receive_date BETWEEN {date - 7 days} AND {date + 7 days}
  - IF found (single):
      Update Status: Completed
      Set trxn_id: {bank_reference}
```

**Example:**
```
Transaction: €20.00 on 2025-11-05
→ Found Pending Contribution (Event Registration, €20.00, 2025-11-03)
→ Update Status: Completed
```

---

### 5. Default Rule (Unmatched)

**Rule:** Create suggestion for manual review

```yaml
Name: "Manual Review"
Priority: 999 (lowest)
Plugin: "Suggester: Create Contribution"

Action:
  - Create suggestion: "New Donation"
  - Suggested Amount: {amount}
  - Suggested Contact: [Search UI]
  - Status: Pending Review
```

---

## 🔄 Processing Workflow

### Automated Processing

```
1. Import File (CAMT.053/CSV)
   ↓
2. Parse Transactions
   ↓
3. Run Matchers (Priority 1 → 999)
   ↓
4. Auto-Execute (if confidence > 90%)
   ↓
5. Manual Review (if 50-90% confidence)
   ↓
6. Flag Unmatched (< 50%)
```

**Confidence Levels:**
- **90-100%:** Auto-Execute (SEPA Mandate exact match)
- **70-89%:** Suggest (Review recommended)
- **50-69%:** Flag (Manual decision)
- **< 50%:** Unmatched (Create new contact?)

---

### Manual Review UI

**Path:** CiviBanking → Payments → Review

**List View:**
```
Date       | Debtor          | Amount  | Suggestions       | Actions
2025-11-05 | Max Mustermann  | €30.00  | ✅ SEPA Match     | [Execute]
2025-11-06 | Unknown Person  | €25.00  | ⚠️ 3 Suggestions  | [Review]
2025-11-07 | Company XY      | €100.00 | ❌ No Match       | [Create]
```

**Review Screen:**
```
Transaction Details:
  Date: 2025-11-06
  Amount: €25.00
  Debtor: Anna K.
  IBAN: AT61...
  Purpose: "Spende für Projekt"

Suggestions (3):
  ✅ Contact: Anna Kraft (ID: 456) - 85% match
     → Create Donation €25.00
  
  ⚠️ Contact: Anna Klein (ID: 789) - 70% match
     → Create Donation €25.00
  
  ⚠️ Create New Contact "Anna K."
     → Create Donation €25.00

Actions:
  [Execute Suggestion 1] [Ignore] [Manual Entry]
```

---

## 📊 Reports & Reconciliation

### Banking Dashboard

**Path:** CiviBanking → Dashboard

```
Import Statistics (Last 30 days):
  Transactions Imported: 150
  Auto-Matched: 120 (80%)
  Manual Review: 20 (13%)
  Unmatched: 10 (7%)

Total Amount Processed: €4,500.00
```

### Reconciliation Report

```sql
-- Transactions by Status
SELECT
  status,
  COUNT(*) AS count,
  SUM(amount) AS total
FROM civicrm_bank_tx
WHERE value_date >= '2025-11-01'
GROUP BY status;

-- Unmatched Transactions
SELECT
  value_date,
  party_name,
  amount,
  purpose
FROM civicrm_bank_tx
WHERE status_id = (SELECT id FROM civicrm_bank_tx_status WHERE name = 'new')
ORDER BY value_date DESC;
```

---

## 🔗 Integration mit CiviCRM

### Auto-Create Contributions

**Matcher Action:**
```php
// Create Contribution from matched transaction
civicrm_api4('Contribution', 'create', [
  'values' => [
    'contact_id' => $matchedContact['id'],
    'financial_type_id' => 1, // Donation
    'total_amount' => $transaction['amount'],
    'receive_date' => $transaction['value_date'],
    'trxn_id' => $transaction['bank_reference'],
    'contribution_status_id' => 1, // Completed
    'payment_instrument_id' => 5, // EFT
    'source' => 'Banking Import (CAMT.053)',
  ],
]);
```

---

### Update Membership

**If SEPA Mandate matched:**
```php
// Extend Membership on successful debit
$membership = getMembershipByContact($contactId);

civicrm_api4('Membership', 'update', [
  'where' => [['id', '=', $membership['id']]],
  'values' => [
    'end_date' => date('Y-m-d', strtotime($membership['end_date'] . ' +1 month')),
  ],
]);
```

---

## 🔐 Security

### Access Control

**Permissions:**
- **View Banking Data:** Staff, Admin
- **Import Statements:** Staff, Admin
- **Execute Matchers:** Admin only
- **Manual Review:** Staff, Admin

**Financial ACL:**
- Only users with "access CiviContribute" can see amounts

---

### Audit Trail

**Logged Actions:**
- Import Date/Time
- User who imported
- File name
- Matcher executed
- Manual actions (Execute/Ignore)

**Activity Created:**
```
Type: "Banking Transaction Matched"
Source Contact: System
Target Contact: {matched_contact}
Details: "Transaction €{amount} matched via {matcher_name}"
```

---

## 🧪 Testing

### Sample CAMT.053 File

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>STMT-20251130</MsgId>
      <CreDtTm>2025-11-30T23:59:59</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>00001</Id>
      <Acct>
        <Id>
          <IBAN>AT611904300234573201</IBAN>
        </Id>
      </Acct>
      <Bal>
        <Tp><CdOrPrtry><Cd>OPBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="EUR">5000.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2025-11-01</Dt></Dt>
      </Bal>
      <Ntry>
        <Amt Ccy="EUR">30.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2025-11-02</Dt></BookgDt>
        <ValDt><Dt>2025-11-02</Dt></ValDt>
        <BkTxCd>
          <Domn><Cd>PMNT</Cd></Domn>
        </BkTxCd>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>OEMO0123-2025-0001</EndToEndId>
            </Refs>
            <RltdPties>
              <Dbtr><Nm>Max Mustermann</Nm></Dbtr>
              <DbtrAcct><Id><IBAN>AT483200000012345864</IBAN></Id></DbtrAcct>
            </RltdPties>
            <RmtInf>
              <Ustrd>Mitgliedsbeitrag November 2025</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>
```

**Test:**
```
1. Upload sample CAMT.053
2. Run import
3. Verify transaction parsed:
   - Amount: €30.00
   - Reference: OEMO0123-2025-0001
   - Debtor: Max Mustermann
4. Verify auto-matched to SEPA Mandate
5. Verify Contribution created (Status: Completed)
```

---

## 🔄 Automation

### Scheduled Import (via n8n)

**Workflow:** `Banking_Auto_Import.json`

```yaml
Trigger: SFTP File Watcher (Bank's SFTP server)
Frequency: Every 6 hours

Steps:
  1. Download CAMT.053 from SFTP
  2. Upload to CiviBanking via API
  3. Trigger Processing
  4. Send Report (Slack/Email)
     - Transactions imported
     - Auto-matched count
     - Manual review count
```

**n8n Nodes:**
```
SFTP → Download File
  → HTTP POST (CiviBanking Import API)
  → Wait for Processing
  → Fetch Stats
  → Send Notification (Slack)
```

---

## 📈 Best Practices

### 1. Import Frequency
- **Daily:** For high-volume organizations
- **Weekly:** For smaller NGOs
- **Real-time:** Via SFTP automation (recommended)

### 2. Matcher Optimization
- **Start Simple:** Enable SEPA Matcher first
- **Add Complexity:** IBAN, Name matchers later
- **Monitor Confidence:** Adjust thresholds based on false positives

### 3. Data Quality
- **Clean IBANs:** Store in custom field, validate format
- **Mandate References:** Always include in SEPA purpose text
- **Dedupe Contacts:** Merge duplicates before banking import

---

## 🚨 Troubleshooting

### Issue: Transactions not matching

**Causes:**
- Mandate reference missing/typo in purpose
- IBAN not stored in CiviCRM
- Contact name mismatch

**Fix:**
```
1. Check Matcher Priority (run SEPA first)
2. Verify purpose text includes reference
3. Add IBAN custom field to Contact
4. Manually link transaction in Review UI
```

---

### Issue: Duplicate Contributions

**Causes:**
- Same file imported twice
- Matcher creates new instead of updating

**Fix:**
```
1. Add "Dedupe" matcher (check trxn_id)
2. Before import: Check last import date
3. Enable "Skip duplicates" option in Importer
```

---

## 🔮 Future Enhancements

- [ ] **AI-Powered Matching** (ML-based contact suggestion)
- [ ] **Multi-Currency Support** (EUR, USD, CHF)
- [ ] **Real-Time Bank API** (PSD2 Open Banking)
- [ ] **Mobile Review App** (Approve matches on-the-go)

---

<div align="center">
  <br />
  <strong>🏦 Banking Integration Complete</strong>
  <br />
  <sub>CAMT.053 + MT940 + CSV | Intelligent Matching | Automated</sub>
</div>
