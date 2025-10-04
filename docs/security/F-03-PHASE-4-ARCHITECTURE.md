# F-03 Phase 4: Centralized Log Aggregation - Architecture Design

**Project:** F-03 PII-Sanitization in Logs  
**Phase:** 4 of 4 - Centralized Log Aggregation (ELK Stack)  
**Date:** 2025-01-XX  
**Status:** In Development

---

## 🎯 Executive Summary

Phase 4 integriert einen zentralisierten ELK-Stack (Elasticsearch, Logstash, Kibana) für DSGVO-konforme Log-Aggregation mit **automatischer PII-Sanitization** auf Pipeline-Ebene.

**Hauptziele:**

1. ✅ Zentrale Log-Sammlung aus **allen Services** (FastAPI, Drupal/CiviCRM, n8n, Frontend)
2. ✅ **PII-Redaktion VOR** Elasticsearch-Indexierung (Logstash-Filter)
3. ✅ Compliance-Dashboards für DSGVO-Audits (Kibana)
4. ✅ Automatische Log-Retention (30d operational, 1y compliance)
5. ✅ Alerting für PII-Detection-Bypass & Performance-Issues

---

## 🏗️ Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│
│  │   FastAPI    │  │   Drupal 10  │  │     n8n      │  │ Frontend ││
│  │ api.mensch.. │  │ crm.mensch.. │  │  Workflows   │  │  React   ││
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘│
│         │ JSON Logs       │ Syslog/JSON     │ JSON Logs     │ Logs │
│         └─────────────────┴─────────────────┴───────────────┘      │
│                               │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                ▼
                ┌───────────────────────────────┐
                │       LOGSTASH PIPELINE       │
                │ ═══════════════════════════   │
                │  Input: Beats/HTTP/Syslog     │
                │  ↓                             │
                │  Filter 1: Grok Parsing       │
                │  Filter 2: PII Sanitization   │
                │    ├─ Ruby Inline Script      │
                │    └─ HTTP → FastAPI Endpoint │
                │  Filter 3: GeoIP Enrichment   │
                │  Filter 4: Metrics Extraction │
                │  ↓                             │
                │  Output: Elasticsearch        │
                └───────────────┬───────────────┘
                                ▼
        ┌───────────────────────────────────────────┐
        │         ELASTICSEARCH CLUSTER             │
        │  ═════════════════════════════════════    │
        │  Index: logs-operational-YYYY.MM.DD       │
        │    └─ ILM: 30 days → Delete               │
        │  Index: logs-compliance-YYYY.MM.DD        │
        │    └─ ILM: 1 year → Archive → Delete      │
        │  Index: logs-security-audit-YYYY.MM.DD    │
        │    └─ ILM: 7 years → Archive (DSGVO)      │
        │                                            │
        │  Templates:                                │
        │    ├─ Field Mapping (PII-free)            │
        │    ├─ Index Settings (replicas, shards)   │
        │    └─ ILM Policy Assignment                │
        └────────────────┬──────────────────────────┘
                         ▼
        ┌────────────────────────────────────────────┐
        │            KIBANA DASHBOARDS               │
        │  ════════════════════════════════════      │
        │  Dashboard 1: DSGVO Compliance             │
        │    ├─ PII Redaction Counters               │
        │    ├─ Sanitization Success Rate            │
        │    └─ Bypass Detection Alerts              │
        │  Dashboard 2: Security Monitoring          │
        │    ├─ Failed Authentication Attempts       │
        │    ├─ Suspicious Activity Patterns         │
        │    └─ GeoIP Anomaly Detection              │
        │  Dashboard 3: Performance Metrics          │
        │    ├─ Log Volume per Service               │
        │    ├─ Logstash Throughput                  │
        │    └─ Indexing Latency                     │
        │                                             │
        │  Watcher Alerts:                            │
        │    ├─ PII Bypass Detection → Email/Slack   │
        │    ├─ Log Volume Spike → PagerDuty         │
        │    └─ Retention Policy Violations          │
        └─────────────────────────────────────────────┘
```

---

## 📊 Service-Spezifische Integration

### 1. FastAPI Logs (`api.menschlichkeit-oesterreich.at`)

**Log-Format:** JSON (bereits PII-sanitized via Phase 1)

```json
{
  "timestamp": "2025-01-15T14:30:00Z",
  "level": "INFO",
  "logger": "api.requests",
  "message": "GET /api/users -> 200",
  "user_id": 123,
  "action": "api_request",
  "method": "GET",
  "path": "/api/users",
  "duration_ms": 45.2,
  "status_code": 200,
  "ip_masked": "192.168.1.***"
}
```

**Logstash Input:** Filebeat → `/var/log/fastapi/api.log`

**Zusätzliche Sanitization:** KEINE (bereits PII-frei dank `LoggingPiiFilter`)

**Special Fields:**

- `ip_masked`: Bereits maskiert, **NICHT** durch GeoIP anreichern
- `user_id`: Business-Context, **OK** für DSGVO

---

### 2. Drupal 10 + CiviCRM Logs (`crm.menschlichkeit-oesterreich.at`)

**Log-Format:** Syslog (bereits PII-sanitized via Phase 2)

```
<134>1 2025-01-15T14:30:00Z crm.menschlichkeit-oesterreich.at drupal 12345 - - [pii_sanitizer] User login attempt: email=m**@beispiel.at, status=success
```

**Logstash Input:** Syslog Listener (Port 5140, TLS)

**Grok Pattern:**

```ruby
grok {
  match => {
    "message" => "<%{NUMBER:syslog_pri}>%{NUMBER:syslog_ver} %{TIMESTAMP_ISO8601:timestamp} %{HOSTNAME:hostname} %{WORD:app_name} %{NUMBER:process_id} - - \[%{WORD:drupal_module}\] %{GREEDYDATA:log_message}"
  }
}
```

**Zusätzliche Sanitization:** Double-Check für **Legacy-Logs** (pre-Phase 2 Migration)

**Special Fields:**

- `drupal_module`: Metadata (z.B. `pii_sanitizer`, `civicrm`, `watchdog`)
- `log_message`: Bereits sanitized durch `hook_watchdog()`

---

### 3. n8n Workflow Logs (`automation/n8n`)

**Log-Format:** JSON (PII-sanitized via Phase 3 Custom Node)

```json
{
  "timestamp": "2025-01-15T14:30:00Z",
  "level": "INFO",
  "workflow_id": "abc123",
  "node_name": "PII Sanitizer",
  "execution_id": "xyz789",
  "message": "PII sanitization completed",
  "metrics": {
    "emails_redacted": 3,
    "cards_redacted": 1,
    "total_pii_detected": 4
  }
}
```

**Logstash Input:** Filebeat → `automation/n8n/data/logs/n8n.log`

**Zusätzliche Sanitization:** KEINE (Custom Node garantiert PII-freie Outputs)

**Special Fields:**

- `metrics`: PII-Redaction-Counters → Dashboard-Visualisierung

---

### 4. Frontend Logs (React/Vite)

**Log-Format:** Browser Console → Backend Endpoint (`POST /api/logs`)

**Logstash Input:** HTTP Input Plugin (Port 8080)

**PII-Sanitization:** **CRITICAL** - Frontend kann **ungefilterte User-Inputs** enthalten!

**Filter-Pipeline:**

```ruby
# 1. Grok Parsing
grok {
  match => { "message" => "%{GREEDYDATA:raw_message}" }
}

# 2. PII Sanitization (FastAPI HTTP Call)
http {
  url => "http://api.menschlichkeit-oesterreich.at/api/pii-sanitizer"
  method => "POST"
  body => {
    "text" => "%{raw_message}",
    "pii_types" => ["email", "phone", "card", "iban"],
    "strategy" => "mask"
  }
  target_body => "sanitized"
}

# 3. Replace Message
mutate {
  replace => { "message" => "%{[sanitized][sanitized_text]}" }
}
```

---

## 🛡️ Logstash PII-Sanitization Filter

### Option 1: Ruby Inline (Standalone)

**Pros:** Keine externe Abhängigkeit, schnell  
**Cons:** Duplikation der PII-Regex aus Phase 1-3

```ruby
filter {
  ruby {
    code => '
      # PII Regex Patterns
      EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
      CARD_PATTERN = /\b(?:\d{4}[\s-]?){3}\d{4}\b/
      IBAN_PATTERN = /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/

      message = event.get("message")

      # Email Redaction
      message.gsub!(EMAIL_PATTERN) { |email|
        user, domain = email.split("@")
        "#{user[0]}**@#{domain}"
      }

      # Card Redaction
      message.gsub!(CARD_PATTERN, "[CARD]")

      # IBAN Redaction
      message.gsub!(IBAN_PATTERN, "[IBAN]")

      event.set("message", message)
    '
  }
}
```

---

### Option 2: HTTP Filter (Reuses FastAPI Endpoint)

**Pros:** Wiederverwendung von Phase 1 Code, zentrale PII-Logik  
**Cons:** HTTP-Overhead, Latenz, Abhängigkeit von FastAPI

```ruby
filter {
  http {
    url => "http://api.menschlichkeit-oesterreich.at/api/pii-sanitizer"
    verb => "POST"
    headers => {
      "Content-Type" => "application/json"
      "Authorization" => "Bearer ${LOGSTASH_API_TOKEN}"
    }
    body => {
      "text" => "%{message}",
      "pii_types" => ["email", "phone", "card", "iban", "jwt", "ip", "secret"],
      "strategy" => "mask",
      "include_metrics" => true
    }
    target_body => "pii_result"
    timeout => 1  # 1 Sekunde Timeout
  }

  # Extract Sanitized Text + Metrics
  mutate {
    replace => { "message" => "%{[pii_result][sanitized_text]}" }
    add_field => {
      "pii_emails_redacted" => "%{[pii_result][metrics][emails_redacted]}"
      "pii_cards_redacted" => "%{[pii_result][metrics][cards_redacted]}"
      "pii_total_detected" => "%{[pii_result][metrics][total_pii_detected]}"
    }
  }
}
```

**Recommendation:** Start with **Option 1 (Ruby Inline)** for MVP, migrate to **Option 2 (HTTP)** after performance testing.

---

## 📦 Elasticsearch Index Strategy

### Index Naming Convention

```
logs-{purpose}-{YYYY.MM.DD}

Examples:
  logs-operational-2025.01.15  → Daily operational logs (30d retention)
  logs-compliance-2025.01.15   → DSGVO audit logs (1y retention)
  logs-security-audit-2025.01.15 → Security events (7y retention)
```

---

### Index Templates

#### 1. Operational Logs Template

```json
{
  "index_patterns": ["logs-operational-*"],
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "index.lifecycle.name": "operational-retention-30d"
  },
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "service": { "type": "keyword" },
      "logger": { "type": "keyword" },
      "message": { "type": "text" },
      "user_id": { "type": "integer" },
      "action": { "type": "keyword" },
      "method": { "type": "keyword" },
      "path": { "type": "keyword" },
      "status_code": { "type": "integer" },
      "duration_ms": { "type": "float" },
      "ip_masked": { "type": "keyword" },
      "pii_emails_redacted": { "type": "integer" },
      "pii_cards_redacted": { "type": "integer" },
      "pii_total_detected": { "type": "integer" }
    }
  }
}
```

---

#### 2. Compliance Logs Template (DSGVO Audit Trail)

```json
{
  "index_patterns": ["logs-compliance-*"],
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 2, // Higher redundancy for compliance
    "index.lifecycle.name": "compliance-retention-1y"
  },
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "audit_event": { "type": "keyword" },
      "user_id": { "type": "integer" },
      "action": { "type": "keyword" },
      "resource_type": { "type": "keyword" },
      "resource_id": { "type": "keyword" },
      "data_before": { "type": "object", "enabled": false }, // Masked snapshot
      "data_after": { "type": "object", "enabled": false },
      "consent_granted": { "type": "boolean" },
      "consent_timestamp": { "type": "date" },
      "retention_period_days": { "type": "integer" }
    }
  }
}
```

---

### Index Lifecycle Management (ILM)

#### Policy 1: Operational Retention (30 days)

```json
{
  "policy": "operational-retention-30d",
  "phases": {
    "hot": {
      "min_age": "0ms",
      "actions": {
        "rollover": {
          "max_age": "1d",
          "max_primary_shard_size": "50gb"
        }
      }
    },
    "delete": {
      "min_age": "30d",
      "actions": {
        "delete": {}
      }
    }
  }
}
```

---

#### Policy 2: Compliance Retention (1 year)

```json
{
  "policy": "compliance-retention-1y",
  "phases": {
    "hot": {
      "min_age": "0ms",
      "actions": {
        "rollover": {
          "max_age": "1d",
          "max_primary_shard_size": "50gb"
        }
      }
    },
    "warm": {
      "min_age": "7d",
      "actions": {
        "allocate": {
          "number_of_replicas": 1
        },
        "forcemerge": {
          "max_num_segments": 1
        }
      }
    },
    "cold": {
      "min_age": "30d",
      "actions": {
        "searchable_snapshot": {
          "snapshot_repository": "compliance_backups"
        }
      }
    },
    "delete": {
      "min_age": "365d",
      "actions": {
        "delete": {}
      }
    }
  }
}
```

---

#### Policy 3: Security Audit Retention (7 years, DSGVO Art. 5(2))

```json
{
  "policy": "security-audit-retention-7y",
  "phases": {
    "hot": {
      "min_age": "0ms",
      "actions": {
        "rollover": {
          "max_age": "1d"
        }
      }
    },
    "warm": {
      "min_age": "30d",
      "actions": {
        "allocate": {
          "number_of_replicas": 2
        }
      }
    },
    "cold": {
      "min_age": "180d",
      "actions": {
        "searchable_snapshot": {
          "snapshot_repository": "security_backups"
        }
      }
    },
    "delete": {
      "min_age": "2555d", // 7 years
      "actions": {
        "delete": {}
      }
    }
  }
}
```

---

## 📈 Kibana Dashboards

### Dashboard 1: DSGVO Compliance Monitor

**Visualizations:**

1. **PII Redaction Rate** (Gauge)
   - Query: `pii_total_detected > 0`
   - Metric: `(pii_emails_redacted + pii_cards_redacted) / pii_total_detected * 100`
   - Target: **100% (Green)**, <99.9% (Yellow), <99% (Red)

2. **PII Types Detected** (Pie Chart)
   - Buckets: `emails_redacted`, `cards_redacted`, `ibans_redacted`, `phones_redacted`
   - Time Range: Last 7 days

3. **Sanitization Bypass Alerts** (Data Table)
   - Filter: `message =~ /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/` (Email Regex)
   - Columns: `timestamp`, `service`, `message`, `logger`
   - Purpose: **Detect unsanitized emails that bypassed filters**

4. **Consent Audit Trail** (Timeline)
   - Index: `logs-compliance-*`
   - Filter: `audit_event: "consent_update"`
   - Metrics: `consent_granted: true` vs `false`

---

### Dashboard 2: Security Monitoring

**Visualizations:**

1. **Failed Authentication Attempts** (Line Chart)
   - Query: `action: "authentication" AND status: "failed"`
   - Group By: `ip_masked` (Top 10)
   - Alert: >10 failures/hour from same IP

2. **Suspicious Activity Patterns** (Heatmap)
   - X-Axis: Hour of Day
   - Y-Axis: `action` (e.g., `login`, `data_export`, `user_delete`)
   - Z-Axis: Count
   - Purpose: Detect unusual activity outside business hours

3. **GeoIP Anomaly Detection** (Map)
   - **NOTE:** Only for **public-facing services** (Frontend, API)
   - **DO NOT** map `ip_masked` (already anonymized)
   - Field: `client_country` (from Logstash GeoIP filter on **unmasked** IP before sanitization)

---

### Dashboard 3: Performance Metrics

**Visualizations:**

1. **Log Volume per Service** (Stacked Bar Chart)
   - Group By: `service` (`fastapi`, `drupal`, `n8n`, `frontend`)
   - Time Range: Last 24 hours

2. **Logstash Throughput** (Gauge)
   - Metric: Events/second processed
   - Target: >1000 events/s (Green), <500 (Yellow), <100 (Red)

3. **Indexing Latency** (Line Chart)
   - Metric: Time from log generation to Elasticsearch indexing
   - Target: <5s (Green), <15s (Yellow), >30s (Red)

---

## 🔔 Kibana Watcher Alerts

### Alert 1: PII Bypass Detection

```json
{
  "trigger": {
    "schedule": {
      "interval": "10m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["logs-operational-*"],
        "body": {
          "query": {
            "bool": {
              "must": [
                { "range": { "timestamp": { "gte": "now-10m" } } },
                {
                  "regexp": {
                    "message": "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b"
                  }
                }
              ]
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total": {
        "gt": 0
      }
    }
  },
  "actions": {
    "email_admin": {
      "email": {
        "to": "devops@menschlichkeit-oesterreich.at",
        "subject": "⚠️ PII Bypass Detected in Logs",
        "body": "Unsanitized emails found in {{ctx.payload.hits.total}} log entries. Investigate immediately!"
      }
    },
    "slack_notification": {
      "webhook": {
        "url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX",
        "body": {
          "text": ":rotating_light: PII Bypass Alert: {{ctx.payload.hits.total}} unsanitized emails detected!"
        }
      }
    }
  }
}
```

---

### Alert 2: Log Volume Spike

```json
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["logs-operational-*"],
        "body": {
          "query": {
            "range": {
              "timestamp": {
                "gte": "now-5m"
              }
            }
          },
          "aggs": {
            "log_count": {
              "value_count": {
                "field": "timestamp"
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.aggregations.log_count.value": {
        "gt": 50000 // Threshold: 10k logs/min
      }
    }
  },
  "actions": {
    "pagerduty_alert": {
      "webhook": {
        "url": "https://events.pagerduty.com/v2/enqueue",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "routing_key": "YOUR_PAGERDUTY_INTEGRATION_KEY",
          "event_action": "trigger",
          "payload": {
            "summary": "Log Volume Spike: {{ctx.payload.aggregations.log_count.value}} logs in 5 minutes",
            "severity": "warning",
            "source": "Kibana Watcher"
          }
        }
      }
    }
  }
}
```

---

## 🔧 Performance Optimization

### Logstash Tuning

**Pipeline Workers:**

```yaml
# logstash.yml
pipeline.workers: 4 # Number of CPU cores
pipeline.batch.size: 1000
pipeline.batch.delay: 50 # milliseconds
```

**JVM Heap Size:**

```bash
# /etc/logstash/jvm.options
-Xms4g  # Initial heap size
-Xmx4g  # Maximum heap size
```

---

### Elasticsearch Tuning

**Index Refresh Interval:**

```json
{
  "settings": {
    "index.refresh_interval": "30s" // Default is 1s, increase for higher throughput
  }
}
```

**Disable Replication During Bulk Indexing:**

```bash
curl -X PUT "localhost:9200/logs-operational-2025.01.15/_settings" \
  -H 'Content-Type: application/json' -d'
{
  "index.number_of_replicas": 0
}
'
# Re-enable after indexing complete
```

---

## 🐳 Docker Compose Configuration

**Services:**

- `elasticsearch`: Single-node cluster (dev) → 3-node cluster (prod)
- `logstash`: Single instance (dev) → Load-balanced (prod)
- `kibana`: Single instance
- `filebeat`: Log shipper (co-located with each service)

**Network:**

- Bridge network `elk-network` for internal communication
- External access only via Nginx reverse proxy (TLS)

**Volumes:**

- `elasticsearch-data`: Persistent index storage
- `logstash-pipeline`: Pipeline configurations
- `kibana-dashboards`: Saved dashboards/visualizations

**See:** `automation/elk-stack/docker-compose.yml` (to be created in next step)

---

## 📋 DSGVO Compliance Checklist

| Requirement                             | Implementation                           | Status        |
| --------------------------------------- | ---------------------------------------- | ------------- |
| **Art. 5(1)(a) - Lawfulness**           | All PII sanitized before indexing        | ✅            |
| **Art. 5(1)(c) - Data Minimization**    | Only allowlist fields logged             | ✅            |
| **Art. 5(1)(e) - Storage Limitation**   | ILM policies enforce retention limits    | ✅            |
| **Art. 5(2) - Accountability**          | Compliance audit logs (7y retention)     | ✅            |
| **Art. 17 - Right to Erasure**          | User deletion triggers log anonymization | ⏳ Phase 5    |
| **Art. 25 - Data Protection by Design** | PII filters at multiple pipeline stages  | ✅            |
| **Art. 32 - Security**                  | TLS encryption, access controls (RBAC)   | ⏳ Docker TLS |
| **Art. 33 - Breach Notification**       | Kibana Watcher alerts for PII bypass     | ✅            |

---

## 🚀 Deployment Roadmap

### MVP (Minimal Viable Product)

1. ✅ Docker Compose with single-node Elasticsearch
2. ✅ Logstash with Ruby inline PII filter
3. ✅ Basic Kibana dashboard (DSGVO Compliance Monitor)
4. ✅ Filebeat integration for FastAPI + Drupal
5. ✅ ILM policy: 30-day retention

**Timeline:** 4-6 hours

---

### Production-Ready

1. ⏳ 3-node Elasticsearch cluster (High Availability)
2. ⏳ Logstash HTTP filter (FastAPI PII endpoint)
3. ⏳ All 3 dashboards + Watcher alerts
4. ⏳ Nginx reverse proxy with TLS
5. ⏳ Snapshot repository for compliance logs
6. ⏳ Prometheus metrics exporter (Logstash + Elasticsearch)

**Timeline:** +8-12 hours

---

## 📏 Success Metrics

| Metric                         | Target       | Measurement           |
| ------------------------------ | ------------ | --------------------- |
| **PII Redaction Rate**         | ≥99.99%      | Kibana Dashboard      |
| **Indexing Latency**           | <5s (p95)    | Logstash metrics      |
| **Log Retention Compliance**   | 100%         | ILM policy audit      |
| **Sanitization Bypass Events** | 0 per day    | Watcher alert count   |
| **Elasticsearch Disk Usage**   | <200GB/month | Index size monitoring |
| **Query Response Time**        | <200ms (p95) | Kibana performance    |

---

## 🔗 Related Documentation

- [F-03 Phase 1: FastAPI PII-Sanitizer](./F-03-PHASE-1-COMPLETION-REPORT.md)
- [F-03 Phase 2: Drupal/CiviCRM PII-Sanitizer](./F-03-PHASE-2-COMPLETION-REPORT.md)
- [F-03 Phase 3: n8n Custom Node](./F-03-PHASE-3-COMPLETION-REPORT.md)
- [F-03 Master Completion Report](./F-03-MASTER-COMPLETION-REPORT.md)

---

**Next Steps:**

1. Implement Docker Compose configuration
2. Create Logstash pipeline files
3. Configure Elasticsearch index templates + ILM policies
4. Build Kibana dashboards
5. Test end-to-end PII sanitization
6. Deploy to staging environment
7. Write Phase 4 Completion Report

---

**Author:** AI DevOps Agent  
**Last Updated:** 2025-01-XX
