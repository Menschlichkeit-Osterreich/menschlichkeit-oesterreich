# 📘 CiviCRM Operations Runbook

**Organisation:** Menschlichkeit Österreich  
**Maintainer:** IT Team  
**Last Updated:** 2025-10-11

---

## 🚨 Emergency Contacts

| Role | Contact | Phone |
|------|---------|-------|
| **System Admin** | admin@menschlichkeit-oesterreich.at | +43 xxx xxx |
| **Hosting** | support@hosting-provider.com | 24/7 |
| **Stripe Support** | https://support.stripe.com | - |

---

## 🔧 Daily Operations

### Cron Jobs (Scheduled Tasks)

**Server Cron:**
```bash
# Every 15 minutes
*/15 * * * * curl -sS "https://menschlichkeit-oesterreich.at/civicrm/job?reset=1&key=${SITE_KEY}"
```

**CiviCRM Scheduled Jobs (via UI):**
```
Administer → System Settings → Scheduled Jobs

✅ Send Scheduled Mailings (every 15 min)
✅ Fetch Bounces (every 15 min)
✅ Process Inbound Emails (every 15 min)
✅ Update Membership Statuses (daily 03:00)
✅ Update Greeting/Addressee (daily 04:00)
✅ Geocode and Parse Addresses (hourly)
✅ Clean up temporary data (weekly)
```

---

## 🔍 Monitoring

### Health Checks

**Daily (Automated):**
- Cron execution (check logs)
- API availability (curl test)
- Email sending (test mailing)
- Stripe webhooks (dashboard)
- Disk space (> 20% free)

**Weekly (Manual):**
- Database size growth
- Failed jobs review
- Bounce rate check (<2%)
- Payment failures (<1%)

---

## 🚑 Incident Response

### 1. CiviCRM Site Down

**Symptoms:**
- White Screen of Death (WSOD)
- 500 Internal Server Error
- Database connection error

**Diagnostics:**
```bash
# Check PHP error log
tail -f /var/log/php/error.log

# Check Drupal watchdog
drush watchdog:show --severity=error --count=50

# Check database
mysql -u civicrm -p
> SHOW PROCESSLIST;
> SELECT * FROM civicrm_system_log ORDER BY id DESC LIMIT 10;
```

**Resolution:**
1. Clear caches: `drush cr && cv flush`
2. Check disk space: `df -h`
3. Restart PHP-FPM: `sudo systemctl restart php8.1-fpm`
4. If persistent → Restore from backup

---

### 2. Emails Not Sending

**Diagnostics:**
```bash
# Check CiviCRM queue
cv api4 MailingJob.get

# Check SparkPost status
curl -H "Authorization: ${SPARKPOST_API_KEY}" \
  https://api.sparkpost.com/api/v1/metrics/deliverability

# Check bounce mailbox
# Login to bounce@... IMAP
```

**Resolution:**
1. Verify SparkPost API key valid
2. Check DNS records (SPF, DKIM)
3. Review bounces → clear "On Hold" if false positives
4. Re-queue stuck mailings

---

### 3. Payment Processor Failure

**Symptoms:**
- Stripe webhooks not received
- Contributions stuck in "Pending"

**Diagnostics:**
```bash
# Check Stripe webhook logs
# Dashboard → Developers → Webhooks → Event logs

# Check CiviCRM contribution status
cv api4 Contribution.get +w contribution_status_id=2 --limit=50
```

**Resolution:**
1. Verify webhook endpoint accessible: `curl https://...`
2. Re-send failed webhook from Stripe dashboard
3. Manually update contribution if needed
4. Contact Stripe support if widespread

---

### 4. Database Performance Issues

**Symptoms:**
- Slow page loads (>5s)
- Timeout errors
- High CPU usage

**Diagnostics:**
```sql
-- Slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 20;

-- Table sizes
SELECT table_name, ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'civicrm'
ORDER BY size_mb DESC;

-- Locks
SHOW PROCESSLIST;
```

**Resolution:**
1. Kill long-running queries: `KILL <process_id>;`
2. Optimize tables: `OPTIMIZE TABLE civicrm_contact;`
3. Add missing indexes (check SearchKit queries)
4. Consider upgrading server resources

---

## 🔄 Backup & Restore

### Automated Backups

**Schedule:** Daily 01:00 CET

**Script:**
```bash
#!/bin/bash
# /scripts/backup-civicrm.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/civicrm"

# Database
mysqldump -u civicrm -p${DB_PASSWORD} civicrm > $BACKUP_DIR/civicrm_$DATE.sql
gzip $BACKUP_DIR/civicrm_$DATE.sql

# Files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/html/sites/default/files/civicrm

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete

# Upload to S3
aws s3 sync $BACKUP_DIR s3://backups-menschlichkeit/civicrm/
```

### Restore Procedure

```bash
# Database
gunzip < civicrm_20251011_020000.sql.gz | mysql -u civicrm -p civicrm

# Files
tar -xzf files_20251011_020000.tar.gz -C /var/www/html/sites/default/files/

# Clear caches
drush cr && cv flush

# Verify
curl https://menschlichkeit-oesterreich.at/civicrm
```

---

## 📊 Performance Tuning

### MySQL Optimization

```ini
# /etc/mysql/my.cnf
[mysqld]
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
max_connections = 200
query_cache_size = 128M
tmp_table_size = 64M
max_heap_table_size = 64M
```

### PHP-FPM

```ini
# /etc/php/8.1/fpm/pool.d/www.conf
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

---

## 🔒 Security Checklist

### Monthly
- [ ] Update Drupal core + modules
- [ ] Update CiviCRM + extensions
- [ ] Review user accounts (remove inactive)
- [ ] Check access logs for suspicious activity
- [ ] Rotate API keys/tokens

### Quarterly
- [ ] Security audit (external)
- [ ] Penetration testing
- [ ] GDPR compliance review
- [ ] Backup restore test

---

## 📞 Escalation Path

**Level 1:** Self-Service (this Runbook)  
**Level 2:** Email IT Team  
**Level 3:** Call Emergency Contact  
**Level 4:** Contact Hosting Provider  
**Level 5:** Engage External Consultant

---

<div align="center">
  <strong>📘 Operations Ready</strong>
</div>
