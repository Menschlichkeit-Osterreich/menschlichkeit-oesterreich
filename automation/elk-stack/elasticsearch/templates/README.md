# Elasticsearch Index Templates - README

## Overview

Diese Konfiguration enthält **3 Index Templates** und **3 ILM Policies** für die DSGVO-konforme Log-Verwaltung im ELK-Stack.

## Index Templates

### 1. logs-operational-template.json

- **Index Pattern**: `logs-operational-*`
- **Purpose**: Tägliche operationale Logs (FastAPI, Drupal, n8n, Frontend)
- **Retention**: 30 Tage (Hot → Delete)
- **Shards**: 3 (balanced performance)
- **Replicas**: 1 (basic redundancy)
- **Refresh Interval**: 30s (near real-time)

**Field Mappings**:

- `@timestamp`, `timestamp`: date
- `level`: keyword (INFO, WARNING, ERROR, CRITICAL)
- `service`: keyword (fastapi, drupal, n8n, frontend)
- `message`: text + keyword
- `pii_emails_redacted`, `pii_cards_redacted`, etc.: integer
- `pii_bypass_type`, `pii_bypass_severity`: keyword

**Use Cases**:

- Performance monitoring (duration_ms, status_code)
- Error tracking (level: ERROR)
- PII sanitization metrics (pii_total_detected)

### 2. logs-compliance-template.json

- **Index Pattern**: `logs-compliance-*`
- **Purpose**: DSGVO-Compliance-Logs (Consent, Data Access, Retention)
- **Retention**: 1 Jahr (Hot → Warm → Cold Snapshot → Delete)
- **Shards**: 2 (lower volume)
- **Replicas**: 2 (high availability for compliance)
- **Refresh Interval**: 60s (less time-sensitive)

**Field Mappings**:

- `audit_event`: keyword (consent_granted, data_access, data_deletion)
- `consent_granted`: boolean
- `consent_timestamp`: date
- `retention_period_days`: integer
- `data_before`, `data_after`: object (disabled indexing for privacy)

**DSGVO Compliance**:

- **Article 5(2)**: Accountability (audit trail of consent)
- **Article 30**: Processing records (data access logs)
- **Retention**: 365 days as per DSGVO storage limitation

### 3. logs-security-audit-template.json

- **Index Pattern**: `logs-security-audit-*`
- **Purpose**: Security-Incident-Logs (PII Bypass, Failed Auth, Anomalies)
- **Retention**: 7 Jahre (Hot → Warm → Cold Snapshot → Delete)
- **Shards**: 2 (low volume, critical events only)
- **Replicas**: 2 (high availability for forensics)
- **Refresh Interval**: 60s

**Field Mappings**:

- `security_event`: keyword (pii_bypass, auth_failure, anomaly)
- `pii_bypass_detected`: boolean
- `pii_bypass_type`: keyword (email, card, iban, phone)
- `pii_bypass_severity`: keyword (critical, high, medium, low)
- `authentication_method`: keyword (oauth2, basic, api_key)
- `failed_attempts_count`: integer

**DSGVO Compliance**:

- **Article 5(2)**: Accountability (security incident tracking)
- **Article 32**: Security of processing (technical measures documentation)
- **Retention**: 7 years for security forensics and legal compliance

## ILM Policies

### 1. operational-retention-30d

```json
{
  "hot": {
    "rollover": { "max_age": "1d", "max_primary_shard_size": "50gb" },
    "set_priority": { "priority": 100 }
  },
  "delete": {
    "min_age": "30d",
    "delete_searchable_snapshot": true
  }
}
```

**Lifecycle**:

- **Hot**: 0-30 days (active indexing, high priority)
- **Delete**: After 30 days (permanent deletion)

**Rationale**: Operational logs are short-lived debugging data, no long-term retention required.

### 2. compliance-retention-1y

```json
{
  "hot": {
    "rollover": { "max_age": "1d", "max_primary_shard_size": "50gb" },
    "set_priority": { "priority": 100 }
  },
  "warm": {
    "min_age": "7d",
    "allocate": { "number_of_replicas": 1 },
    "forcemerge": { "max_num_segments": 1 }
  },
  "cold": {
    "min_age": "30d",
    "searchable_snapshot": { "snapshot_repository": "compliance_backups" }
  },
  "delete": {
    "min_age": "365d",
    "delete_searchable_snapshot": true
  }
}
```

**Lifecycle**:

- **Hot**: 0-7 days (active indexing, 2 replicas)
- **Warm**: 7-30 days (reduce replicas to 1, force merge for efficiency)
- **Cold**: 30-365 days (searchable snapshot, archival storage)
- **Delete**: After 365 days (permanent deletion)

**DSGVO Article 5(1)(e)**: Storage Limitation - data kept no longer than necessary.

### 3. security-audit-retention-7y

```json
{
  "hot": {
    "rollover": { "max_age": "1d", "max_primary_shard_size": "50gb" },
    "set_priority": { "priority": 100 }
  },
  "warm": {
    "min_age": "30d",
    "allocate": { "number_of_replicas": 2 },
    "forcemerge": { "max_num_segments": 1 }
  },
  "cold": {
    "min_age": "180d",
    "searchable_snapshot": { "snapshot_repository": "security_backups" }
  },
  "delete": {
    "min_age": "2555d",
    "delete_searchable_snapshot": true
  }
}
```

**Lifecycle**:

- **Hot**: 0-30 days (active indexing, high availability)
- **Warm**: 30-180 days (maintain 2 replicas, force merge)
- **Cold**: 180-2555 days (searchable snapshot, long-term storage)
- **Delete**: After 7 years (permanent deletion)

**Rationale**: Security incidents may require long-term forensic analysis (breach investigations, legal proceedings).

## Installation

### Prerequisites

- Elasticsearch 8.11.0+ running at http://localhost:9200
- `curl` and `jq` installed
- Valid Elasticsearch credentials (username: `elastic`)

### Automatic Setup

```bash
cd automation/elk-stack
./setup-templates.sh http://localhost:9200 YOUR_ELASTIC_PASSWORD
```

### Manual Installation

#### 1. Install ILM Policies

```bash
# Operational 30d
curl -u elastic:PASSWORD -X PUT "http://localhost:9200/_ilm/policy/operational-retention-30d" \
  -H 'Content-Type: application/json' \
  -d @elasticsearch/templates/ilm-operational-30d.json

# Compliance 1y
curl -u elastic:PASSWORD -X PUT "http://localhost:9200/_ilm/policy/compliance-retention-1y" \
  -H 'Content-Type: application/json' \
  -d @elasticsearch/templates/ilm-compliance-1y.json

# Security Audit 7y
curl -u elastic:PASSWORD -X PUT "http://localhost:9200/_ilm/policy/security-audit-retention-7y" \
  -H 'Content-Type: application/json' \
  -d @elasticsearch/templates/ilm-security-audit-7y.json
```

#### 2. Install Index Templates

```bash
# Operational
curl -u elastic:PASSWORD -X PUT "http://localhost:9200/_index_template/logs-operational-template" \
  -H 'Content-Type: application/json' \
  -d @elasticsearch/templates/logs-operational-template.json

# Compliance
curl -u elastic:PASSWORD -X PUT "http://localhost:9200/_index_template/logs-compliance-template" \
  -H 'Content-Type: application/json' \
  -d @elasticsearch/templates/logs-compliance-template.json

# Security Audit
curl -u elastic:PASSWORD -X PUT "http://localhost:9200/_index_template/logs-security-audit-template" \
  -H 'Content-Type: application/json' \
  -d @elasticsearch/templates/logs-security-audit-template.json
```

#### 3. Create Initial Indices

```bash
# Operational
curl -u elastic:PASSWORD -X PUT "http://localhost:9200/logs-operational-000001" \
  -H 'Content-Type: application/json' \
  -d '{"aliases": {"logs-operational": {"is_write_index": true}}}'

# Compliance
curl -u elastic:PASSWORD -X PUT "http://localhost:9200/logs-compliance-000001" \
  -H 'Content-Type: application/json' \
  -d '{"aliases": {"logs-compliance": {"is_write_index": true}}}'

# Security Audit
curl -u elastic:PASSWORD -X PUT "http://localhost:9200/logs-security-audit-000001" \
  -H 'Content-Type: application/json' \
  -d '{"aliases": {"logs-security-audit": {"is_write_index": true}}}'
```

### Verification

```bash
# Check ILM policies
curl -u elastic:PASSWORD "http://localhost:9200/_ilm/policy"

# Check index templates
curl -u elastic:PASSWORD "http://localhost:9200/_index_template"

# Check indices
curl -u elastic:PASSWORD "http://localhost:9200/_cat/indices/logs-*?v"
```

## Usage in Logstash

Die Logstash-Pipelines (`automation/elk-stack/logstash/pipeline/*.conf`) schreiben automatisch in die richtigen Indizes:

```ruby
output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    user => "elastic"
    password => "${ELASTIC_PASSWORD}"
    index => "logs-operational-%{+YYYY.MM.dd}"  # → logs-operational-template
    # Alternative mit alias:
    # index => "logs-operational"  # → schreibt in logs-operational-000001
  }
}
```

**Index Routing**:

- `logs-operational-*`: FastAPI, n8n, Frontend, Drupal (normal logs)
- `logs-compliance-*`: Consent events, data access, GDPR audit logs
- `logs-security-audit-*`: PII bypass, authentication failures, anomalies

## Monitoring & Maintenance

### Check Index Health

```bash
curl -u elastic:PASSWORD "http://localhost:9200/_cat/indices/logs-*?v&s=index"
```

### Check ILM Execution

```bash
curl -u elastic:PASSWORD "http://localhost:9200/logs-operational-*/_ilm/explain"
```

### Manually Trigger Rollover

```bash
curl -u elastic:PASSWORD -X POST "http://localhost:9200/logs-operational/_rollover"
```

### Monitor Index Size

```bash
curl -u elastic:PASSWORD "http://localhost:9200/_cat/indices/logs-*?v&h=index,store.size,pri,rep,docs.count&s=store.size:desc"
```

## Kibana Integration

### Index Patterns

Create in Kibana → Stack Management → Index Patterns:

1. **logs-operational-\*** (30-day operational data)
2. **logs-compliance-\*** (1-year GDPR audit)
3. **logs-security-audit-\*** (7-year security forensics)

### Dashboards

Import from `automation/elk-stack/kibana/dashboards/`:

- `compliance-dashboard.ndjson` (PII metrics, consent audit)
- `security-dashboard.ndjson` (PII bypass, auth failures)
- `performance-dashboard.ndjson` (log volume, Logstash throughput)

## Troubleshooting

### Template Not Applied to New Index

```bash
# Re-create index with explicit template
curl -u elastic:PASSWORD -X DELETE "http://localhost:9200/logs-operational-000001"
curl -u elastic:PASSWORD -X PUT "http://localhost:9200/logs-operational-000001" \
  -H 'Content-Type: application/json' \
  -d '{"aliases": {"logs-operational": {"is_write_index": true}}}'
```

### ILM Policy Not Executing

```bash
# Check ILM status
curl -u elastic:PASSWORD "http://localhost:9200/_ilm/status"

# Start ILM (if stopped)
curl -u elastic:PASSWORD -X POST "http://localhost:9200/_ilm/start"
```

### Snapshot Repository Not Found

```bash
# Create snapshot repository (required for cold phase)
curl -u elastic:PASSWORD -X PUT "http://localhost:9200/_snapshot/compliance_backups" \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "fs",
    "settings": {
      "location": "/var/lib/elk-stack/elasticsearch/snapshots/compliance"
    }
  }'
```

## DSGVO Compliance Checklist

- ✅ **Article 5(1)(e)**: Storage Limitation (30d, 1y, 7y retention policies)
- ✅ **Article 5(2)**: Accountability (audit trail in logs-compliance-\*)
- ✅ **Article 30**: Processing Records (consent logs, data access logs)
- ✅ **Article 32**: Security (PII bypass detection in logs-security-audit-\*)
- ✅ **Encrypted Storage**: Elasticsearch uses `index.codec: best_compression`
- ✅ **Access Control**: Elasticsearch XPack Security enabled in docker-compose.yml
- ✅ **Data Minimization**: PII redacted via Logstash filters (Phase 1-4)

## References

- [Elasticsearch Index Templates](https://www.elastic.co/guide/en/elasticsearch/reference/8.11/index-templates.html)
- [ILM Policies](https://www.elastic.co/guide/en/elasticsearch/reference/8.11/index-lifecycle-management.html)
- [GDPR Compliance](https://gdpr.eu/tag/chapter-4/)
- [F-03 Phase 4 Architecture](../../docs/security/F-03-PHASE-4-ARCHITECTURE.md)
