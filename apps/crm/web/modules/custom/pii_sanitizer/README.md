# PII Sanitizer - Drupal/CiviCRM Module

## 📋 Overview

DSGVO-compliant PII (Personally Identifiable Information) sanitization for Drupal 10+ and CiviCRM logs.

**Features:**

- ✅ Automatic PII redaction in Watchdog logs
- ✅ CiviCRM activity log sanitization
- ✅ Form error message sanitization
- ✅ Email log redaction
- ✅ API response sanitization
- ✅ Metrics collection for monitoring

---

## 🚀 Installation

### 1. Enable the Module

```bash
cd /var/www/vhosts/menschlichkeit-oesterreich.at/crm/web
drush pm:enable pii_sanitizer
drush cr
```

### 2. Configure Settings

```bash
drush config:set pii_sanitizer.settings enabled TRUE
drush config:set pii_sanitizer.settings default_strategy mask
drush config:set pii_sanitizer.settings sanitize_civicrm_activities TRUE
```

### 3. Verify Installation

```bash
drush php-eval "use Drupal\pii_sanitizer\PiiSanitizer; \$s = new PiiSanitizer(); echo \$s->scrubText('Email: test@example.com');"
```

**Expected output:** `Email: t**@example.com`

---

## 🔧 Usage

### Basic Usage

```php
use Drupal\pii_sanitizer\PiiSanitizer;

// Initialize
$sanitizer = new PiiSanitizer(['enabled' => TRUE]);

// Sanitize text
$clean_text = $sanitizer->scrubText('Call +43 664 1234567');
// Output: "Call +43*********"

// Sanitize array (DROP strategy for sensitive fields)
$data = [
  'username' => 'john_doe',
  'password' => 'secret123',  // Will be removed
  'email' => 'john@example.com',
];
$clean_data = $sanitizer->scrubDict($data, PiiSanitizer::STRATEGY_DROP);
// Output: ['username' => 'john_doe', 'email' => 'j**@example.com']
```

### Drupal Watchdog Integration

**Automatic** - No code changes needed. All watchdog logs are sanitized:

```php
\Drupal::logger('my_module')->error('User email: @email', [
  '@email' => 'john@example.com',
]);
// Logged as: "User email: j**@example.com"
```

### CiviCRM Activity Logs

**Automatic** - CiviCRM activities are sanitized via `hook_civicrm_post()`:

```php
// Create activity with PII
$activity = civicrm_api3('Activity', 'create', [
  'activity_type_id' => 'Meeting',
  'subject' => 'Call with john@example.com',
  'details' => 'Discussed donation, IBAN: AT61 1904 3002 3457 3201',
]);
// Stored as: "Call with j**@example.com", "Discussed donation, IBAN: AT61***"
```

### Form Error Sanitization

**Automatic** - Form validation errors are sanitized:

```php
$form_state->setErrorByName('email', 'Invalid email: john@example.com');
// Displayed to user as: "Invalid email: j**@example.com"
```

---

## ⚙️ Configuration

### Configuration Schema

File: `config/schema/pii_sanitizer.schema.yml`

```yaml
pii_sanitizer.settings:
  type: config_object
  mapping:
    enabled:
      type: boolean
      label: 'Enable PII Sanitization'
    default_strategy:
      type: string
      label: 'Default Redaction Strategy'
    sensitive_fields:
      type: sequence
      label: 'Sensitive Field Names (will be dropped)'
      sequence:
        type: string
    allowlist_fields:
      type: sequence
      label: 'Allowlist Fields (skip sanitization)'
      sequence:
        type: string
    sanitize_civicrm_activities:
      type: boolean
      label: 'Sanitize CiviCRM Activity Logs'
    sanitize_civicrm_api_logs:
      type: boolean
      label: 'Sanitize CiviCRM API Response Logs'
    sanitize_mail_logs:
      type: boolean
      label: 'Sanitize Email Logs'
    sanitize_form_errors:
      type: boolean
      label: 'Sanitize Form Error Messages'
```

### Default Configuration

```yaml
enabled: true
default_strategy: 'mask'
sensitive_fields:
  - password
  - pass
  - secret
  - token
  - api_key
  - apikey
  - authorization
  - auth
  - cookie
  - session
allowlist_fields:
  - timestamp
  - level
  - severity
  - channel
  - context
sanitize_civicrm_activities: true
sanitize_civicrm_api_logs: true
sanitize_mail_logs: false
sanitize_form_errors: true
```

---

## 📊 Monitoring & Metrics

### View Metrics

```bash
# Via Drush
drush php-eval "print_r(\Drupal\pii_sanitizer\PiiSanitizer::getMetrics());"

# Via State API
drush state:get pii_sanitizer.metrics
```

**Output:**

```php
Array
(
    [emails_redacted] => 142
    [phones_redacted] => 23
    [cards_redacted] => 5
    [ibans_redacted] => 12
    [ips_redacted] => 89
    [jwts_redacted] => 34
    [secrets_redacted] => 7
)
```

### Grafana Integration

Metrics are stored in Drupal State and can be scraped by Prometheus:

```bash
curl https://crm.menschlichkeit-oesterreich.at/api/pii-metrics
```

---

## 🔒 Security & Permissions

### CiviCRM Permission

The module defines a new permission:

**`view unredacted civicrm logs`**

- **Purpose:** Allow privileged users to see full PII in CiviCRM logs
- **Risk:** DSGVO-KRITISCH! Only assign to data protection officers
- **Default:** Not assigned to any role

### Grant Permission

```bash
drush role:perm:add administrator 'view unredacted civicrm logs'
```

---

## 🧪 Testing

### Run PHPUnit Tests

```bash
cd /var/www/vhosts/menschlichkeit-oesterreich.at/crm/web
../vendor/bin/phpunit modules/custom/pii_sanitizer/tests/
```

### Test Coverage

- ✅ Email pattern detection (RFC-compliant)
- ✅ Phone number sanitization (E.164)
- ✅ Credit card validation (Luhn algorithm)
- ✅ IBAN masking (AT/DE/CH)
- ✅ JWT/Bearer token redaction
- ✅ IPv4/IPv6 sanitization
- ✅ API secret detection (AWS/GitHub/Slack)
- ✅ Dictionary/array sanitization
- ✅ Nested array handling
- ✅ Redaction strategies (DROP/REDACT/MASK/HASH)
- ✅ Golden samples (DSGVO critical scenarios)

---

## 🐛 Troubleshooting

### Issue: Logs still contain PII

**Cause:** Module not enabled or disabled in config

**Solution:**

```bash
drush pm:enable pii_sanitizer
drush config:set pii_sanitizer.settings enabled TRUE
drush cr
```

### Issue: CiviCRM activities not sanitized

**Cause:** CiviCRM hooks not firing

**Solution:**

1. Check CiviCRM system status: `/civicrm/admin/setting/path`
2. Clear CiviCRM cache: `drush cvapi System.flush`
3. Verify hook file is included:

```bash
ls -la modules/custom/pii_sanitizer/pii_sanitizer.civicrm.php
```

### Issue: Performance degradation

**Cause:** Regex compilation on every request

**Solution:** Enable PHP OpCache for regex caching:

```bash
# In php.ini
opcache.enable=1
opcache.memory_consumption=256
```

### Issue: False positives (phone numbers)

**Cause:** Greedy regex matching non-phone patterns

**Solution:** Adjust phone pattern in `PiiSanitizer.php`:

```php
'phone' => '/\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/',
```

---

## 🔄 Integration with Other Systems

### n8n Workflows

Export sanitized data to n8n:

```php
// In custom module
$data = ['email' => 'john@example.com'];
$sanitizer = new PiiSanitizer();
$clean_data = $sanitizer->scrubDict($data);

// Send to n8n webhook
$client = \Drupal::httpClient();
$client->post('https://n8n.menschlichkeit-oesterreich.at/webhook/civicrm', [
  'json' => $clean_data,
]);
```

### Syslog Export

Sanitize before sending to remote syslog:

```php
// Implements hook_syslog_format_alter()
function mymodule_syslog_format_alter(&$entry, $message) {
  $sanitizer = new PiiSanitizer();
  $entry['message'] = $sanitizer->scrubText($message['message']);
}
```

---

## 📚 API Reference

### PiiSanitizer Class

#### Methods

**`__construct(array $config = [])`**

- Initialize sanitizer with configuration

**`scrubText(string $text): string`**

- Sanitize text for PII patterns
- Returns redacted text

**`scrubDict(array $data, string $strategy = null): array`**

- Sanitize array/dictionary
- Strategies: `drop`, `redact`, `mask`, `hash`

**`static getMetrics(): array`**

- Get redaction metrics

**`static resetMetrics(): void`**

- Reset metrics (for testing)

#### Private Methods

**`validateLuhn(string $number): bool`**

- Validate credit card with Luhn algorithm

**`maskEmail(string $email): string`**

- Mask email address (e.g., `m**@example.com`)

**`maskPhone(string $phone): string`**

- Mask phone number (e.g., `+43*********`)

**`maskIban(string $iban): string`**

- Mask IBAN (e.g., `AT61***`)

**`maskIpv4(string $ip): string`**

- Mask IPv4 (e.g., `192.168.*.*`)

---

## 🎯 DSGVO Compliance

### Articles Addressed

**Art. 5 (Grundsätze):**

- ✅ Datenminimierung (PII entfernt)
- ✅ Speicherbegrenzung (Logs mit redacted PII)

**Art. 25 (Datenschutz durch Technikgestaltung):**

- ✅ Privacy by Design (automatische Redaktion)

**Art. 32 (Sicherheit der Verarbeitung):**

- ✅ Pseudonymisierung (Email/Phone-Masking)
- ✅ Verschlüsselung (HASH-Strategy)

**Art. 35 (Datenschutz-Folgenabschätzung):**

- ✅ Risikominimierung (PII in Logs = Hohes Risiko → Redacted)

---

## 📄 License

GPL-2.0-or-later (compatible with Drupal core)

---

## 👥 Authors

**Menschlichkeit Österreich DevOps Team**

- Version: 1.0.0
- Date: 2025-10-04
- Contact: dev@menschlichkeit-oesterreich.at

---

## 🔗 Related Documentation

- [F-03 Phase 1 Completion Report](../../../docs/security/F-03-PHASE-1-COMPLETION-REPORT.md) (FastAPI implementation)
- [DSGVO Compliance Guide](../../../docs/compliance/DSGVO.md)
- [CiviCRM Security Best Practices](../../../docs/civicrm/SECURITY.md)
