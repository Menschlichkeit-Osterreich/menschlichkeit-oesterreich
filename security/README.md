# Security Monitoring Module

Real-time security monitoring and threat detection system for Menschlichkeit Österreich.

## Features

- ✅ **Real-time Alert Detection**
  - Brute force attack detection
  - PII leak detection (DSGVO compliance)
  - Unusual access pattern detection
  - Automated threat categorization

- ✅ **Alert Management**
  - Create, resolve, and dismiss alerts
  - Persistent storage (JSON)
  - Severity levels (low, medium, high, critical)
  - Recommended actions per alert

- ✅ **Security Metrics**
  - Failed login tracking
  - Suspicious activity counts
  - Last security incident timestamp
  - Active alert statistics

- ✅ **DSGVO Compliance**
  - Automated PII detection in logs
  - Art. 33/34 incident response tracking
  - Data breach notification support

## Quick Start

### Installation

```bash
# No additional dependencies required
# Uses Python 3.11+ standard library
```

### Basic Usage

```python
from security.monitoring import SecurityMonitor

# Initialize monitor
monitor = SecurityMonitor()

# Detect brute force attack
alert = monitor.detect_brute_force_attack(
    ip_address="198.51.100.1",
    failed_attempts=10,
    time_window_minutes=10
)

# Detect PII leak in logs
alert = monitor.detect_pii_leak(
    log_source="api-server.log",
    pii_patterns_found=["email_addresses", "iban_numbers"]
)

# Get active alerts
alerts = monitor.get_active_alerts()

# Get security metrics
metrics = monitor.get_security_metrics()
```

### Alert Types

| Type | Description | Severity |
|------|-------------|----------|
| `brute_force` | Multiple failed login attempts | HIGH |
| `pii_leak` | PII found in logs | CRITICAL |
| `unusual_access` | Access from unusual location | MEDIUM |
| `suspicious_ip` | Known malicious IP | HIGH |
| `data_breach_attempt` | Unauthorized data access | CRITICAL |
| `rate_limit_exceeded` | API abuse detected | MEDIUM |

### Severity Levels

- **CRITICAL** - Immediate action required (DSGVO violations, data breaches)
- **HIGH** - Action required within 24h (security threats)
- **MEDIUM** - Action required within 7 days (policy violations)
- **LOW** - Informational (unusual but not threatening)

## API Integration

### REST API Endpoints

The module is integrated with FastAPI via `api/routers/security.py`:

```python
# Get active alerts
GET /api/security/alerts?active_only=true

# Get security metrics
GET /api/security/metrics

# Resolve alert
POST /api/security/alerts/{alert_id}/resolve

# Dismiss alert
DELETE /api/security/alerts/{alert_id}

# Scan logs for PII
POST /api/security/scan/logs

# Health check
GET /api/security/health
```

### Frontend Integration

Connect to the SecurityDashboard component:

```typescript
// Fetch alerts
const response = await fetch('/api/security/alerts');
const alerts = await response.json();

// Resolve alert
await fetch(`/api/security/alerts/${alertId}/resolve`, {
  method: 'POST'
});
```

## Alert Detection Examples

### 1. Brute Force Detection

```python
# Automatically creates alert if >= 5 failed attempts
monitor.detect_brute_force_attack(
    ip_address="198.51.100.1",
    failed_attempts=10,
    time_window_minutes=10
)

# Returns SecurityAlert with recommended actions:
# - Block IP address
# - Enable rate limiting
# - Notify affected users
```

### 2. PII Leak Detection (DSGVO)

```python
# Scan logs for PII patterns
alerts = monitor.scan_logs_for_security_issues([
    Path("logs/api.log"),
    Path("logs/crm.log")
])

# Automatically detects:
# - Email addresses (not @example.com/@test.com)
# - IBAN numbers (AT*, DE* patterns)
# - Phone numbers

# Returns CRITICAL alert with DSGVO actions:
# - Clean logs immediately
# - Enable PII sanitizer
# - Check Art. 33 reporting obligation
# - Notify data subjects (Art. 34)
```

### 3. Unusual Access Detection

```python
monitor.detect_suspicious_access(
    user_email="user@example.com",
    unusual_location="Unknown location",
    ip_address="45.123.67.89"
)

# Returns MEDIUM alert with actions:
# - Inform user of suspicious activity
# - Check 2FA status
# - Invalidate session if needed
```

## Alert Management

### Resolve Alert

```python
# Mark alert as resolved
success = monitor.resolve_alert("alert_1234567890")
# Alert remains in system but marked as resolved
```

### Dismiss Alert

```python
# Remove alert completely
success = monitor.dismiss_alert("alert_1234567890")
# Alert removed from storage
```

### Get Recent Alerts

```python
# Get alerts from last 24 hours
alerts = monitor.get_recent_alerts(hours=24)

# Get alerts from last week
alerts = monitor.get_recent_alerts(hours=168)
```

## Security Metrics

```python
metrics = monitor.get_security_metrics()

# Returns:
{
    "total_logins": 1247,
    "failed_logins": 23,
    "active_sessions": 12,
    "two_factor_usage": 78,
    "suspicious_activities": 2,
    "data_exports": 5,
    "password_changes": 8,
    "last_security_incident": "2025-10-13T10:30:00"
}
```

## Alert Storage

Alerts are persisted to `logs/security-alerts.json`:

```json
[
  {
    "id": "alert_1760337430.961882",
    "alert_type": "brute_force",
    "severity": "high",
    "title": "Brute-Force-Angriff erkannt",
    "description": "Mehrfache fehlgeschlagene Login-Versuche von IP 198.51.100.1",
    "timestamp": "2025-10-13T06:37:10.961894",
    "is_resolved": false,
    "affected_users": [],
    "recommended_actions": [
      "IP-Adresse blockieren",
      "Rate-Limiting aktivieren"
    ],
    "metadata": {
      "ip_address": "198.51.100.1",
      "failed_attempts": 10
    }
  }
]
```

## Testing

### Run Tests

```bash
# Run monitoring module with test alerts
python3 security/monitoring.py

# Expected output: 3 test alerts created
# - Brute force (HIGH)
# - PII leak (CRITICAL)
# - Unusual access (MEDIUM)
```

### Integration Tests

```python
import pytest
from security.monitoring import SecurityMonitor, SeverityLevel, AlertType

def test_brute_force_detection():
    monitor = SecurityMonitor()
    alert = monitor.detect_brute_force_attack("1.2.3.4", 10)
    assert alert.severity == SeverityLevel.HIGH.value
    assert alert.alert_type == AlertType.BRUTE_FORCE.value

def test_pii_leak_detection():
    monitor = SecurityMonitor()
    alert = monitor.detect_pii_leak("test.log", ["email_addresses"])
    assert alert.severity == SeverityLevel.CRITICAL.value
    assert "DSGVO" in alert.description
```

## DSGVO Compliance

### Automated PII Detection

The module automatically detects PII in logs:

- **Email addresses** - Pattern: `user@domain.com`
- **IBAN numbers** - Pattern: `AT61...`, `DE89...`
- **Phone numbers** - Pattern: `+43 xxx xxx xxxx`

### Incident Response

When PII leak detected:

1. **Immediate Alert** - CRITICAL severity created
2. **Recommended Actions** - Art. 33/34 DSGVO compliance steps
3. **Metadata** - Source file and PII types documented
4. **Tracking** - Alert persisted for audit trail

### Art. 33 Breach Notification

If CRITICAL PII leak detected:
- Check if notification to authority required (72h deadline)
- Document incident in alert metadata
- Track resolution and remediation actions

## Configuration

### Custom Log Directory

```python
from pathlib import Path

monitor = SecurityMonitor(log_dir=Path("/var/log/security"))
```

### Custom Alert Thresholds

```python
# Modify detection logic
def detect_custom_threat(self, ...):
    if condition_met:
        return self.create_alert(
            alert_type=AlertType.CUSTOM,
            severity=SeverityLevel.HIGH,
            title="Custom Threat Detected",
            description="...",
            recommended_actions=[...]
        )
```

## Troubleshooting

### Alert Not Persisting

```bash
# Check log directory exists and is writable
mkdir -p logs
chmod 755 logs
```

### No Alerts Generated

```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Check thresholds
# Brute force needs >= 5 failed attempts
# PII needs actual patterns (not test emails)
```

### API Integration Issues

```python
# Verify import path
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Then import
from security.monitoring import SecurityMonitor
```

## Documentation

- **Implementation Guide:** `docs/SECURITY-IMPLEMENTATION-GUIDE.md`
- **Status Report:** `docs/SECURITY-STATUS-REPORT.md`
- **Visual Summary:** `docs/SECURITY-CHECK-SUMMARY.md`
- **API Endpoints:** `api/routers/security.py`

## Support

- **Security Team:** security@menschlichkeit-oesterreich.at
- **Response Time:** < 72 hours
- **Emergency:** Use GitHub Security Advisories for critical issues

## License

Part of Menschlichkeit Österreich platform. See main repository LICENSE.

---

**Last Updated:** 2025-10-13  
**Version:** 1.0.0  
**Status:** Production Ready
