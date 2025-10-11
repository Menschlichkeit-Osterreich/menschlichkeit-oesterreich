---
title: "Mcpdatabasemigration"
description: "PostgreSQL MCP Database Migration Flow"
lastUpdated: 2025-10-10
status: ACTIVE
category: database
tags: ['database', 'mcp', 'dsgvo']
version: "1.0.0"
language: de-AT
audience: ['Backend Team', 'Database Administrators']
---

```prompt
---
title: Database Migration mit PostgreSQL MCP
description: Sichere Datenbank-Migration für Multi-Service NGO Platform
service: crm, api, gaming
mcpTools: required
mcpServers: ['postgres', 'github', 'filesystem', 'memory']
---

# PostgreSQL MCP Database Migration Flow

**Szenario:** Datenbank-Migration für {SERVICE} durchführen

## 🗄️ Phase 1: Schema-Analyse (PostgreSQL MCP)

```
Via PostgreSQL MCP:
1. "List all tables in current database"
2. "Show schema for table {TABLE_NAME}"
3. "Get all foreign key relationships"
4. "Show indexes for table {TABLE_NAME}"

OUTPUT Schema-Übersicht:
---
Database: {DB_NAME}
Tables: {COUNT}
Critical Tables: civicrm_contact, users, game_sessions, achievements

Dependencies:
- users → game_sessions (FK: user_id)
- game_sessions → achievements (FK: session_id)
- civicrm_contact → civicrm_activity (CiviCRM Core)
---
```text

## 📝 Phase 2: Migration Planning

```
Migration: "Add newsletter_consent column to civicrm_contact"

### Impact Analysis
Via PostgreSQL MCP:
"Count rows in civicrm_contact" 
→ Result: ~5000 contacts

Via Filesystem MCP:
"Search for civicrm_contact references across all services":
→ Found in: 
  - crm.menschlichkeit-oesterreich.at/sites/default/modules/
  - api.menschlichkeit-oesterreich.at/app/models/contact.py

Via GitHub MCP:
"Search code for 'civicrm_contact' in repository"
→ Additional references found in 12 files

RISK ASSESSMENT:
□ Breaking Change? NO (additive column)
□ Data Loss Risk? NO
□ Downtime Required? NO (online migration)
□ Rollback Plan? YES (DROP COLUMN)
```text

## 🛠️ Phase 3: Migration Script Generation

```
Via Filesystem MCP:
"Create migration file: crm.menschlichkeit-oesterreich.at/migrations/2024_01_add_newsletter_consent.sql"

-- Migration: Add Newsletter Consent (DSGVO Compliant)
-- Author: GitHub Copilot + MCP
-- Date: {TIMESTAMP}

BEGIN;

-- Add consent column (default FALSE for GDPR compliance)
ALTER TABLE civicrm_contact 
ADD COLUMN IF NOT EXISTS newsletter_consent BOOLEAN DEFAULT FALSE NOT NULL;

-- Add consent timestamp for audit trail
ALTER TABLE civicrm_contact 
ADD COLUMN IF NOT EXISTS newsletter_consent_date TIMESTAMP;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_consent 
ON civicrm_contact(newsletter_consent) 
WHERE newsletter_consent = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN civicrm_contact.newsletter_consent IS 
'DSGVO: Explicit consent for newsletter subscription (Art. 6 GDPR)';

COMMIT;

-- Rollback Script (save separately)
-- BEGIN;
-- DROP INDEX IF EXISTS idx_newsletter_consent;
-- ALTER TABLE civicrm_contact DROP COLUMN IF EXISTS newsletter_consent_date;
-- ALTER TABLE civicrm_contact DROP COLUMN IF EXISTS newsletter_consent;
-- COMMIT;

Via Filesystem MCP:
"Create rollback script: crm.menschlichkeit-oesterreich.at/migrations/rollback/2024_01_add_newsletter_consent.sql"
```text

## 🧪 Phase 4: Testing on Staging

```
Via PostgreSQL MCP (on staging DB):
1. "Execute migration script"
2. "Verify column exists in civicrm_contact"
3. "Check index creation"
4. "Test insert with new column":
   INSERT INTO civicrm_contact (email, newsletter_consent, newsletter_consent_date)
   VALUES ('test@example.com', TRUE, NOW());

Via Filesystem MCP:
"Run integration tests":
cd crm.menschlichkeit-oesterreich.at/
./vendor/bin/phpunit tests/Integration/NewsletterConsentTest.php

Expected Output:
✅ Column exists
✅ Default value FALSE
✅ Index created
✅ Insert successful
✅ Integration tests passing
```text

## 🔒 Phase 5: ORM Model Update

```

### Prisma Schema (for Gaming Platform)
Via Filesystem MCP:
"Update schema.prisma":

model User {
  id                    Int       @id @default(autoincrement())
  email                 String    @unique
  newsletter_consent    Boolean   @default(false)  // NEW
  newsletter_consent_date DateTime? // NEW
  
  gameSessions GameSession[]
  achievements Achievement[]
}

Via Terminal:
npx prisma migrate dev --name add_newsletter_consent
npx prisma generate

### FastAPI Model (for API Service)
Via Filesystem MCP:
"Update api.menschlichkeit-oesterreich.at/app/models/contact.py":

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime

class Contact(Base):
    __tablename__ = "civicrm_contact"
    
    id = Column(Integer, primary_key=True)
    email = Column(String)
    newsletter_consent = Column(Boolean, default=False)  # NEW
    newsletter_consent_date = Column(DateTime, nullable=True)  # NEW
    
    def give_consent(self):
        """DSGVO: Record explicit consent"""
        self.newsletter_consent = True
        self.newsletter_consent_date = datetime.utcnow()

### Drupal Entity (for CRM Service)
Via Filesystem MCP:
"Update crm.menschlichkeit-oesterreich.at/web/modules/custom/newsletter/src/Entity/Contact.php":

// Contact entity field definition
$fields['newsletter_consent'] = BaseFieldDefinition::create('boolean')
  ->setLabel(t('Newsletter Consent (DSGVO)'))
  ->setDefaultValue(FALSE)
  ->setDisplayOptions('form', [
    'type' => 'boolean_checkbox',
    'weight' => 10,
  ]);
```text

## 📊 Phase 6: Data Migration (if needed)

```
Scenario: "Migrate existing newsletter subscribers to new consent model"

Via PostgreSQL MCP:
"Find contacts with newsletter subscriptions":

SELECT c.id, c.email, s.is_active
FROM civicrm_contact c
JOIN civicrm_subscription s ON c.id = s.contact_id
WHERE s.group_id = 5 -- Newsletter Group
  AND s.is_active = 1;

Migration Query:
UPDATE civicrm_contact
SET 
  newsletter_consent = TRUE,
  newsletter_consent_date = NOW()
WHERE id IN (
  SELECT contact_id 
  FROM civicrm_subscription 
  WHERE group_id = 5 AND is_active = 1
);

Via PostgreSQL MCP:
"Execute data migration"
"Verify affected rows count"

Expected: ~1500 contacts updated

AUDIT LOG:
Via Filesystem MCP:
"Create migration log: crm.menschlichkeit-oesterreich.at/logs/migration-2024-01.log"
```text

## 🚀 Phase 7: Production Deployment

```
Pre-Deployment Checklist:

Via GitHub MCP:
□ PR approved and merged?
□ CI/CD pipeline passing?
□ Staging tests successful?

Via Memory MCP:
"Load previous migration best practices"

Via Filesystem MCP:
□ Rollback script ready?
□ Backup script executed?

Deployment Steps:

1. Backup Production DB
Via Terminal:
./scripts/db-backup.sh production

2. Execute Migration (Low-Traffic Window)
Via PostgreSQL MCP on Production:
"Execute migration with transaction safety":

BEGIN;
-- Migration SQL here
-- Verify with SELECT
COMMIT;

3. Verify Deployment
Via PostgreSQL MCP:
"Check migration success":
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'civicrm_contact'
  AND column_name IN ('newsletter_consent', 'newsletter_consent_date');

4. Deploy Application Code
Via Filesystem MCP:
"Execute deployment":
./scripts/safe-deploy.sh production

5. Smoke Tests
Via Playwright MCP:
"Run critical path tests on production"
```text

## 🔄 Phase 8: Rollback (if needed)

```
IF CRITICAL ISSUE DETECTED:

Via PostgreSQL MCP:
"Execute rollback script":
\i crm.menschlichkeit-oesterreich.at/migrations/rollback/2024_01_add_newsletter_consent.sql

Via Filesystem MCP:
"Restore previous application version":
git checkout {PREVIOUS_COMMIT}
./scripts/safe-deploy.sh production

Via GitHub MCP:
"Create incident issue with label 'migration-failure'"
```text

## 📈 Phase 9: Monitoring & Validation

```
Via PostgreSQL MCP:
"Monitor database performance":
SELECT 
  tablename, 
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables
WHERE tablename = 'civicrm_contact';

"Check query performance":
EXPLAIN ANALYZE
SELECT * FROM civicrm_contact 
WHERE newsletter_consent = TRUE;

Via Brave Search MCP (if performance issues):
"Search for PostgreSQL performance tuning for {use_case}"

METRICS:
□ Migration Duration: {X} seconds
□ Table Size Impact: +{Y} KB
□ Query Performance: <50ms
□ Zero Downtime: ✅
```text

## 📚 Phase 10: Documentation

```
Via Filesystem MCP:
"Update docs/DATABASE-MIGRATIONS.md":

## Migration 2024-01: Newsletter Consent (DSGVO)

**Date:** {TIMESTAMP}
**Author:** GitHub Copilot + MCP
**Services Affected:** CRM, API

### Changes:
- Added `newsletter_consent` column (BOOLEAN, default FALSE)
- Added `newsletter_consent_date` column (TIMESTAMP)
- Created index on `newsletter_consent`

### DSGVO Compliance:
- Explicit consent required (Art. 6 GDPR)
- Audit trail via timestamp
- Default FALSE (no assumed consent)

### Rollback:
See `migrations/rollback/2024_01_add_newsletter_consent.sql`

### Performance Impact:
- Migration Duration: 12s
- Table Size: +2KB
- Query Performance: 45ms avg

Via GitHub MCP:
"Update migration tracking issue"
"Close related feature issue"

Via Memory MCP:
"Store migration patterns for future use"
```text

## 🎯 Success Criteria

```
TECHNICAL:
✅ Migration executed without errors
✅ Rollback script tested
✅ ORM models updated across all services
✅ Zero data loss
✅ Performance within acceptable range (<100ms queries)

COMPLIANCE:
✅ DSGVO-compliant consent model
✅ Audit trail implemented
✅ Privacy documentation updated

OPERATIONAL:
✅ Zero downtime deployment
✅ Monitoring active
✅ Team notified
✅ Documentation complete
```text

## 🔧 MCP Tools Usage Summary

```
PostgreSQL MCP:
- Schema inspection
- Migration execution
- Performance monitoring
- Data validation

Filesystem MCP:
- Migration script creation
- ORM model updates
- Documentation generation

GitHub MCP:
- Code reference search
- PR management
- Issue tracking

Memory MCP:
- Best practices retrieval
- Pattern storage
```text

---

**Verwendung:**
- Prompt: "Führe Database Migration für {CHANGE} durch mit PostgreSQL MCP"
- Erwartung: Sichere, DSGVO-konforme Migration mit vollständiger Dokumentation
- Output: Migration Scripts, Updated ORM Models, Deployment-ready Code
```
