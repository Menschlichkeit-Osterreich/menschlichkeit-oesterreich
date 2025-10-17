# 💳 Payment Integration - Stripe

**Provider:** Stripe  
**Currencies:** EUR  
**Methods:** Card (Visa, Mastercard, Amex), SEPA Debit (optional)  
**Environment:** Test + Live

---

## 🎯 Übersicht

Vollständige Stripe-Integration für einmalige Spenden, wiederkehrende Zahlungen (Subscriptions) und Event-Tickets.

---

## 🔧 Setup

### 1. Stripe Extension

```bash
# Install Extension
cv ext:download mjwshared
cv ext:download stripe
cv ext:enable mjwshared stripe

# Verify
cv api4 Extension.get +w name=stripe
```

**Version:** Latest (>= 6.9)  
**Repository:** https://lab.civicrm.org/extensions/stripe

---

### 2. Stripe Account Setup

**Dashboard:** https://dashboard.stripe.com

#### API Keys
```yaml
# Test Mode
publishable_key_test: "pk_test_51..."
secret_key_test: "sk_test_51..."

# Live Mode
publishable_key_live: "pk_live_51..."
secret_key_live: "sk_live_51..."
```

**Store in Environment:**
```bash
# .env
STRIPE_PUBLISHABLE_KEY_TEST="pk_test_51..."
STRIPE_SECRET_KEY_TEST="sk_test_51..."
STRIPE_PUBLISHABLE_KEY_LIVE="pk_live_51..."
STRIPE_SECRET_KEY_LIVE="sk_live_51..."
```

#### Webhook Endpoint
```
URL: https://menschlichkeit-oesterreich.at/civicrm/stripe/webhook
Events to send:
  ✅ charge.succeeded
  ✅ charge.failed
  ✅ payment_intent.succeeded
  ✅ payment_intent.payment_failed
  ✅ customer.subscription.created
  ✅ customer.subscription.updated
  ✅ customer.subscription.deleted
  ✅ invoice.payment_succeeded
  ✅ invoice.payment_failed

Signing Secret: whsec_...
```

---

### 3. CiviCRM Payment Processor Configuration

**Path:** Administer → System Settings → Payment Processors → Add New

```yaml
Name: "Stripe (Live)"
Processor Type: "Stripe"
Financial Account: "Payment Processor Account"

# Live Credentials
User Name: ${STRIPE_PUBLISHABLE_KEY_LIVE}
Password: ${STRIPE_SECRET_KEY_LIVE}
Signature: whsec_... (Webhook Secret)

# Settings
Currency: EUR
Is Active: Yes
Is Default: No (only if multiple processors)
Is Test: No

# Frontend
Accepted Credit Cards:
  ✅ Visa
  ✅ Mastercard
  ✅ American Express
```

**Repeat for Test Processor:**
```yaml
Name: "Stripe (Test)"
Is Test: Yes
# Use Test Keys
```

---

### 4. Webhook Configuration (CiviCRM)

**Extension Settings:**

```
Administer → System Settings → Stripe Settings

Webhook Endpoint: /civicrm/stripe/webhook
Webhook Secret: ${STRIPE_WEBHOOK_SECRET}

Retry Failed Webhooks: Yes (3x with backoff)
Log Webhooks: Yes (for debugging)

Auto-Create Customers: Yes
Update Contact on Payment: Yes
```

**Test Webhook:**
```bash
# Via Stripe CLI
stripe listen --forward-to https://menschlichkeit-oesterreich.at/civicrm/stripe/webhook

# Trigger Test Event
stripe trigger payment_intent.succeeded
```

---

## 💰 Payment Flows

### 1. One-Time Donation (Card)

**Webform:** `/spenden`

**Flow:**
```
1. User fills form (Amount, Contact Info)
2. Submit → Create Contact + Contribution (Status: Pending)
3. Stripe Checkout Session created:
   - Amount: €25.00
   - Description: "Spende an Menschlichkeit Österreich"
   - Success URL: /spenden/danke?contribution_id={CHECKOUT_SESSION_ID}
   - Cancel URL: /spenden?cancelled=1
4. Redirect to Stripe Checkout (hosted page)
5. User enters card details
6. Stripe processes payment
7. Webhook: charge.succeeded
   - Update Contribution Status: Completed
   - Receive Date: NOW
   - Transaction ID: ch_...
8. CiviRules Trigger: "Contribution Completed"
   - Send Thank-You Email
   - Add to Group "Donors"
9. Redirect to Success URL
```

**API Example (Create Checkout Session):**
```php
$stripe = new \Stripe\StripeClient($secretKey);

$session = $stripe->checkout->sessions->create([
  'payment_method_types' => ['card'],
  'line_items' => [[
    'price_data' => [
      'currency' => 'eur',
      'product_data' => [
        'name' => 'Spende an Menschlichkeit Österreich',
      ],
      'unit_amount' => 2500, // €25.00 in cents
    ],
    'quantity' => 1,
  ]],
  'mode' => 'payment',
  'success_url' => 'https://menschlichkeit-oesterreich.at/spenden/danke?session_id={CHECKOUT_SESSION_ID}',
  'cancel_url' => 'https://menschlichkeit-oesterreich.at/spenden?cancelled=1',
  'customer_email' => $contact['email'],
  'metadata' => [
    'civicrm_contact_id' => $contact['id'],
    'civicrm_contribution_id' => $contribution['id'],
  ],
]);

// Return session.url to frontend
return $session->url;
```

---

### 2. Recurring Donation (Subscription)

**Webform:** `/spenden` (with "Monatlich spenden" checkbox)

**Flow:**
```
1. User selects "Recurring" (Checkbox)
2. Submit → Create Contact + ContributionRecur (Status: Pending)
3. Stripe Subscription created:
   - Plan: "Monthly Donation"
   - Amount: €25/month
   - Start: Immediate
4. Webhook: customer.subscription.created
   - Update ContributionRecur Status: In Progress
5. Monthly: invoice.payment_succeeded
   - Create Contribution (linked to ContributionRecur)
   - Status: Completed
   - Transaction ID: in_...
6. CiviRules: Send Monthly Thank-You
```

**Stripe Price/Product Setup:**
```bash
# Create Product
stripe products create \
  --name "Monthly Donation" \
  --description "Monatliche Spende"

# Create Price (€25/month)
stripe prices create \
  --product prod_... \
  --currency eur \
  --unit_amount 2500 \
  --recurring[interval]=month
```

**CiviCRM API (Create Subscription):**
```php
$subscription = $stripe->subscriptions->create([
  'customer' => $customer->id,
  'items' => [['price' => $priceId]],
  'metadata' => [
    'civicrm_contact_id' => $contactId,
    'civicrm_contribution_recur_id' => $recurId,
  ],
]);
```

---

### 3. Membership Payment (SEPA fallback)

**Webform:** `/mitglied-werden`

**Payment Options:**
- Stripe Card (One-Time OR Recurring)
- SEPA Debit (Recurring only) → See SEPA.md

**Flow (Stripe Recurring):**
```
1. User selects Membership Type (€30/month)
2. Create Contact + Membership (Status: Pending)
3. Create ContributionRecur (Membership Fee)
4. Stripe Subscription (linked to Membership)
5. Webhook: first invoice.payment_succeeded
   - Update Membership Status: New
   - Create Contribution
6. Monthly payments → Auto-renew Membership
```

**Membership Auto-Renewal (CiviRules):**
```yaml
Rule: "Auto-Renew Membership on Payment"
Trigger: "Contribution Completed (via ContributionRecur)"
Conditions:
  - Financial Type = "Membership Fee"
  - ContributionRecur Active
Actions:
  - Extend Membership End Date by 1 month
```

---

### 4. Event Ticket Payment

**Webform:** `/events/{event-id}`

**Flow:**
```
1. User registers for event (€20 ticket)
2. Create Participant (Status: Pending)
3. Create Contribution (via ParticipantPayment)
4. Stripe Checkout
5. Webhook: charge.succeeded
   - Update Participant Status: Registered
   - Update Contribution Status: Completed
6. CiviRules: Send Event Confirmation Email
```

---

## 🔐 Security & Compliance

### PCI DSS
- ✅ **No Card Data Stored:** Stripe Checkout handles all card entry
- ✅ **Tokenization:** Only Stripe Customer/Payment Method IDs stored
- ✅ **HTTPS Only:** All communication encrypted
- ✅ **Webhook Signatures:** Verify authenticity

### Webhook Signature Verification
```php
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
$endpoint_secret = getenv('STRIPE_WEBHOOK_SECRET');

try {
  $event = \Stripe\Webhook::constructEvent(
    $payload, $sig_header, $endpoint_secret
  );
} catch(\UnexpectedValueException $e) {
  // Invalid payload
  http_response_code(400);
  exit();
} catch(\Stripe\Exception\SignatureVerificationException $e) {
  // Invalid signature
  http_response_code(400);
  exit();
}

// Process $event
```

### Data Protection (GDPR)
- ✅ **Customer Deletion:** Delete Stripe Customer on Contact anonymization
- ✅ **Data Export:** Include Stripe Payment Methods in data export
- ✅ **Retention:** Delete old payment data after 7 years (legal requirement)

---

## 🔄 Webhook Handling

### Webhook Event Processing

**Endpoint:** `/civicrm/stripe/webhook`

**Supported Events:**

#### charge.succeeded
```php
$charge = $event->data->object;
$contributionId = $charge->metadata->civicrm_contribution_id;

civicrm_api4('Contribution', 'update', [
  'where' => [['id', '=', $contributionId]],
  'values' => [
    'contribution_status_id:name' => 'Completed',
    'trxn_id' => $charge->id,
    'receive_date' => date('Y-m-d H:i:s', $charge->created),
  ],
]);

// Trigger CiviRules
civicrm_api4('Activity', 'create', [
  'values' => [
    'activity_type_id:name' => 'Contribution',
    'source_contact_id' => $contactId,
    'subject' => 'Payment received via Stripe',
  ],
]);
```

#### charge.failed
```php
civicrm_api4('Contribution', 'update', [
  'where' => [['id', '=', $contributionId]],
  'values' => [
    'contribution_status_id:name' => 'Failed',
    'cancel_reason' => $charge->failure_message,
  ],
]);

// Send notification
sendFailedPaymentEmail($contactId, $charge->failure_message);
```

#### customer.subscription.created
```php
$subscription = $event->data->object;
$recurId = $subscription->metadata->civicrm_contribution_recur_id;

civicrm_api4('ContributionRecur', 'update', [
  'where' => [['id', '=', $recurId]],
  'values' => [
    'contribution_status_id:name' => 'In Progress',
    'trxn_id' => $subscription->id,
    'start_date' => date('Y-m-d', $subscription->current_period_start),
    'next_sched_contribution_date' => date('Y-m-d', $subscription->current_period_end),
  ],
]);
```

#### invoice.payment_succeeded (Recurring)
```php
$invoice = $event->data->object;
$subscription = \Stripe\Subscription::retrieve($invoice->subscription);
$recurId = $subscription->metadata->civicrm_contribution_recur_id;

// Create Contribution for this cycle
civicrm_api4('Contribution', 'create', [
  'values' => [
    'contact_id' => $contactId,
    'financial_type_id' => $financialTypeId,
    'total_amount' => $invoice->amount_paid / 100,
    'contribution_recur_id' => $recurId,
    'contribution_status_id:name' => 'Completed',
    'trxn_id' => $invoice->charge,
    'receive_date' => date('Y-m-d H:i:s', $invoice->status_transitions->paid_at),
  ],
]);

// Update next payment date
civicrm_api4('ContributionRecur', 'update', [
  'where' => [['id', '=', $recurId]],
  'values' => [
    'next_sched_contribution_date' => date('Y-m-d', $subscription->current_period_end),
  ],
]);
```

#### customer.subscription.deleted
```php
civicrm_api4('ContributionRecur', 'update', [
  'where' => [['id', '=', $recurId]],
  'values' => [
    'contribution_status_id:name' => 'Cancelled',
    'cancel_date' => date('Y-m-d H:i:s'),
  ],
]);

// Optionally: Update Membership Status
```

---

## 📊 Reporting & Reconciliation

### Stripe Dashboard
- **Payments:** Real-time payment list
- **Customers:** All customer profiles
- **Subscriptions:** Active/Cancelled recurring
- **Disputes:** Chargebacks
- **Radar:** Fraud detection

### CiviCRM Reports

**Contribution Summary (by Payment Processor):**
```sql
SELECT
  pp.name AS processor,
  COUNT(c.id) AS total_contributions,
  SUM(c.total_amount) AS total_amount,
  AVG(c.total_amount) AS avg_amount
FROM civicrm_contribution c
LEFT JOIN civicrm_payment_processor pp ON c.payment_processor_id = pp.id
WHERE c.contribution_status_id = 1 -- Completed
  AND c.receive_date >= '2025-01-01'
GROUP BY pp.id
ORDER BY total_amount DESC;
```

**Recurring Revenue (MRR):**
```sql
SELECT
  SUM(amount) AS mrr
FROM civicrm_contribution_recur
WHERE contribution_status_id = 5 -- In Progress
  AND frequency_unit = 'month';
```

### Reconciliation (Daily)

**Automated via n8n:**
```yaml
Trigger: Cron (02:00 CET)
Steps:
  1. Fetch Stripe Payments (yesterday)
     API: GET /v1/charges?created[gte]={yesterday_start}&created[lt]={today_start}
  
  2. Fetch CiviCRM Contributions (yesterday)
     APIv4: Contribution.get WHERE receive_date BETWEEN ...
  
  3. Compare:
     - Match by trxn_id (Stripe Charge ID)
     - Flag discrepancies
  
  4. Report:
     - Email to finance@menschlichkeit-oesterreich.at
     - Slack alert if diff > €50
```

---

## 🚨 Error Handling

### Failed Payments

**Scenario:** Card declined

**Flow:**
```
1. Stripe: charge.failed webhook
2. Update Contribution Status: Failed
3. CiviRules:
   - Send Email "Zahlung fehlgeschlagen"
   - Create Activity "Follow-up Payment"
   - Tag: "Payment Issue"
4. Manual Follow-up (Staff)
```

**Retry Logic (Subscriptions):**
```yaml
Stripe Smart Retries: Enabled
Retry Schedule:
  - 3 days after failure
  - 5 days after failure
  - 7 days after failure
  - If all fail → Cancel subscription

CiviCRM:
  - On final failure → Update ContributionRecur Status: Failed
  - Membership Status: Grace (allow 14 days manual resolution)
```

---

### Disputes & Chargebacks

**Notification:**
```
Stripe → Webhook: charge.dispute.created
↓
CiviCRM Activity: "Chargeback Received"
↓
Staff Notification: Email + Slack
```

**Handling:**
```
1. Review dispute in Stripe Dashboard
2. Collect evidence (emails, receipts, communication)
3. Submit evidence via Stripe
4. Wait for decision (typically 60-75 days)
5. IF win → Close Activity
6. IF lose → Update Contribution Status: Refunded
```

---

## 🔧 Configuration Examples

### Custom Amount Input (Webform)

```yaml
Element: Number
Label: "Spendenbetrag (€)"
Required: Yes
Min: 1
Max: 10000
Step: 1
Default: 25

Conditional: "Anderer Betrag" Radio selected
```

**JavaScript (Dynamic Pricing):**
```javascript
document.getElementById('amount-custom').addEventListener('input', (e) => {
  const amount = parseInt(e.target.value);
  document.getElementById('checkout-button').dataset.amount = amount * 100; // cents
});
```

---

### Donation Levels (Pre-set Buttons)

```html
<div class="donation-levels">
  <button class="level" data-amount="1000">€10</button>
  <button class="level" data-amount="2500">€25</button>
  <button class="level" data-amount="5000">€50</button>
  <button class="level" data-amount="10000">€100</button>
  <button class="level custom">Anderer Betrag</button>
</div>

<script>
document.querySelectorAll('.level:not(.custom)').forEach(btn => {
  btn.addEventListener('click', () => {
    // Submit with data-amount
  });
});
</script>
```

---

## 📈 Optimization Tips

### 1. Reduce Checkout Friction
- ✅ **Pre-fill Email:** If user logged in
- ✅ **Remember Cards:** Stripe Customer + Payment Methods
- ✅ **Express Checkout:** Apple Pay, Google Pay (enable in Stripe)

### 2. Increase Conversion
- ✅ **Social Proof:** Show "125 people donated this month"
- ✅ **Impact:** "€25 provides X"
- ✅ **Recurring Nudge:** "Make it monthly" (higher LTV)

### 3. Upsell Strategies
- ✅ **Suggested Amounts:** Based on giving history
- ✅ **Round-Up:** "Add €2 to cover fees?"
- ✅ **Matching Campaigns:** "Double your impact!"

---

## 🧪 Testing

### Test Cards (Stripe)

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0025 0000 3155 | 3D Secure (requires auth) |
| 4000 0000 0000 9995 | Declined (insufficient funds) |
| 4000 0000 0000 0341 | Declined (card blocked) |

**Test in CiviCRM:**
```
1. Use "Stripe (Test)" processor
2. Submit donation with test card
3. Verify webhook received (check logs)
4. Verify Contribution Status: Completed
5. Verify Thank-You email sent
```

---

## 🔄 Migration (from other processor)

**Scenario:** Migrate from PayPal to Stripe

**Steps:**
```
1. Export all active Recurring Contributions (PayPal)
2. Contact donors: "Switch to Stripe for better security"
3. Create new Stripe Subscriptions
4. Cancel old PayPal subscriptions
5. Update ContributionRecur records:
   - payment_processor_id → Stripe
   - trxn_id → Stripe subscription ID
```

---

## 📚 Resources

- **Stripe Docs:** https://stripe.com/docs
- **CiviCRM Stripe Extension:** https://lab.civicrm.org/extensions/stripe
- **Webhook Events:** https://stripe.com/docs/webhooks
- **Testing:** https://stripe.com/docs/testing

---

<div align="center">
  <br />
  <strong>💳 Stripe Integration Complete</strong>
  <br />
  <sub>One-Time, Recurring, Subscriptions, Webhooks</sub>
</div>
