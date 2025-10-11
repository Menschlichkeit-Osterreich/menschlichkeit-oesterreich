---
title: 'Datenbank-Optimierung'
description: 'Systematische PostgreSQL Performance-Optimierung für Menschlichkeit Österreich'
lastUpdated: 2025-01-10
status: ACTIVE
category: database
tags: [postgresql, performance, optimization, indexing]
version: '1.0.0'
language: de-AT
audience: [Backend Team, Database Administrators, DevOps]
---

# 🗄️ Datenbank-Optimierung Prompt

## 🎯 Ziel

Systematische Analyse und Optimierung der PostgreSQL-Datenbank für maximale Performance bei DSGVO-Compliance.

## 📋 Kontext

- **Shared Database:** Alle Services (CRM, API, Games, Frontend) nutzen PostgreSQL 15+
- **Schema-Tools:** Alembic (API) und Prisma (Games) - Koordination erforderlich
- **Compliance:** PII-Sanitization in allen Queries und Logs

## 🔍 Analyse-Schritte

### 1. Slow Query Identification

```sql
-- Aktiviere Query-Logging (nur temporär!)
ALTER DATABASE menschlichkeit_oesterreich SET log_min_duration_statement = 1000;

-- Top 10 Slow Queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 2. Index-Analyse

```sql
-- Fehlende Indizes identifizieren
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / seq_scan as avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;

-- Ungenutzte Indizes
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE '%_pkey';
```

### 3. Table Bloat Check

```sql
-- Tabellen-Bloat erkennen
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    n_dead_tup,
    n_live_tup,
    round(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

## ⚡ Optimierungs-Maßnahmen

### A. Index-Optimierung

```sql
-- Beispiel: Composite Index für häufige Queries
CREATE INDEX CONCURRENTLY idx_users_email_status
ON users(email, status)
WHERE status = 'active';

-- Partial Index für DSGVO-relevante Queries
CREATE INDEX CONCURRENTLY idx_consent_active
ON civicrm_contact(consent_date)
WHERE consent = true;
```

### B. Query-Optimierung

```sql
-- EXPLAIN ANALYZE nutzen
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM users WHERE email LIKE '%@example.com';

-- Optimierte Alternative mit GIN Index
CREATE INDEX idx_users_email_gin ON users USING GIN (email gin_trgm_ops);
```

### C. Wartungs-Tasks

```bash
# Vacuum & Analyze (über cron)
psql -d menschlichkeit_oesterreich << EOF
VACUUM ANALYZE;
REINDEX DATABASE menschlichkeit_oesterreich;
EOF

# Auto-Vacuum Tuning (postgresql.conf)
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
```

## 🛡️ DSGVO-Compliance

### PII-Sanitization in Queries

```python
# api/app/lib/db_utils.py
from app.lib.pii_sanitizer import scrub

def log_slow_query(query: str, duration: float):
    """Loggt langsame Queries ohne PII."""
    sanitized_query = scrub(query)
    logger.warning(f"Slow query ({duration}ms): {sanitized_query}")
```

### Encryption at Rest

```sql
-- Sensitive Spalten verschlüsseln (pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users
ADD COLUMN email_encrypted BYTEA;

UPDATE users
SET email_encrypted = pgp_sym_encrypt(email, 'encryption_key');
```

## 📊 Monitoring & Alerting

### Prometheus Exporter

```yaml
# docker-compose.yml
services:
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter
    environment:
      DATA_SOURCE_NAME: 'postgresql://user:pass@db:5432/menschlichkeit_oesterreich?sslmode=disable'
    ports:
      - '9187:9187'
```

### n8n Alert Workflow

```javascript
// automation/n8n/workflows/database-health-check.json
{
  "trigger": "cron: 0 */6 * * *",
  "checks": [
    "connection_pool_utilization > 80%",
    "slow_queries > 10/min",
    "table_bloat > 30%"
  ],
  "alert": "webhook_slack"
}
```

## ✅ Erfolgs-Kriterien

- [ ] Slow Queries < 500ms (95. Perzentil)
- [ ] Index Hit Ratio > 99%
- [ ] Connection Pool Utilization < 70%
- [ ] Table Bloat < 20%
- [ ] Keine PII in Query-Logs

## 🔗 Verwandte Prompts

- `DatenbankSchema_DE.prompt.md` - Schema-Design
- `PerformanceOptimierung_DE.prompt.md` - Application Performance
- `MCPDatabaseMigration_DE.prompt.md` - Sichere Migrations

## 📚 Ressourcen

- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- Projekt-spezifisch: `schema.prisma`, `api/alembic/`
