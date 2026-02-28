# CRM System – Drupal 10 + CiviCRM

> **Customer Relationship Management für Menschlichkeit Österreich**

**URL (Production)**: `https://crm.menschlichkeit-oesterreich.at`  
**URL (Development)**: `http://localhost:8000`

---

## 🎯 Übersicht

Das CRM System basiert auf **Drupal 10** + **CiviCRM** und verwaltet:

- 👥 **Contacts** (Mitglieder, Spender, Freiwillige)
- 💳 **Memberships** (Mitgliedschaften mit SEPA-Integration)
- 💰 **Donations** (Spenden-Tracking)
- 📧 **Newsletter** (Email-Kampagnen mit Consent Management)
- 📊 **Reports** (Mitgliederstatistiken, Finanzberichte)

**Tech Stack**: Drupal 10.3+ | CiviCRM 5.75+ | MariaDB | PHP 8.2

---

## 🚀 Quick Start

### Prerequisites

- **PHP** 8.2+
- **Composer** 2.7+
- **MariaDB** 10.6+ (oder MySQL 8.0+)
- **Apache/Nginx** mit mod_rewrite

### Installation

```bash
# In CRM-Verzeichnis wechseln
cd crm.menschlichkeit-oesterreich.at

# Composer Dependencies installieren
composer install

# Drupal Installation (falls fresh install)
# Achtung: Nur bei Erstinstallation!
# vendor/bin/drush site:install standard \
#   --db-url=mysql://user:password@localhost/crm_db \
#   --site-name="Menschlichkeit Österreich CRM"

# Development Server starten (von Root)
npm run dev:crm
# ODER manuell:
php -S localhost:8000 -t web
```

**CRM verfügbar unter**: <http://localhost:8000>

---

## 📁 Projektstruktur

```
crm.menschlichkeit-oesterreich.at/
├── web/                        # Drupal Webroot
│   ├── core/                   # Drupal Core
│   ├── modules/                # Drupal Modules
│   │   ├── contrib/            # Contributed Modules (CiviCRM, etc.)
│   │   └── custom/             # Custom Modules
│   │       └── pii_sanitizer/  # PII Sanitizer Module
│   ├── themes/                 # Drupal Themes
│   │   ├── contrib/
│   │   └── custom/             # Custom Theme (Rot-Weiß-Rot)
│   ├── sites/                  # Site Configuration
│   │   └── default/
│   │       ├── settings.php    # Drupal Settings
│   │       └── files/          # Uploaded Files (not in git)
│   └── index.php               # Entry Point
├── config/                     # Drupal Configuration (exported)
│   └── sync/
├── vendor/                     # Composer Dependencies
├── composer.json               # Composer Configuration
├── composer.lock
├── drush/                      # Drush Configuration
└── README.md                   # This file
```

---

## 🔌 Drupal Modules

### Core Modules (aktiviert)

- **User** – User Management
- **Node** – Content Types
- **Views** – Data Views & Listings
- **Webform** – Forms (Kontaktformular, Anmeldungen)
- **Pathauto** – Automatic URL Aliases

### Contributed Modules

| Modul | Version | Zweck |
|-------|---------|-------|
| **CiviCRM** | 5.75+ | CRM-Funktionalität |
| **Token** | 1.13+ | Token Replacement |
| **Backup & Migrate** | 5.0+ | Database Backups |
| **Admin Toolbar** | 3.4+ | Improved Admin UX |

### Custom Modules

- **pii_sanitizer** – PII Redaktion für DSGVO-Compliance (analog zu API)

**Module installieren**:

```bash
composer require drupal/module_name
vendor/bin/drush en module_name
```

---

## 👥 CiviCRM Integration

### Zugriff

**URL**: <http://localhost:8000/civicrm>  
**Admin Login**: Drupal Admin-Account

### Hauptfunktionen

#### 1. Contacts Management

```php
// Beispiel: Contact via API erstellen
use Civi\Api4\Contact;

Contact::create()
  ->addValue('first_name', 'Max')
  ->addValue('last_name', 'Mustermann')
  ->addValue('email', 'max@example.com')
  ->execute();
```

#### 2. Membership Management

- **Membership Types**: Standard, Premium, Supporter
- **Payment Integration**: SEPA Direct Debit
- **Auto-Renewal**: Automatische Verlängerung

#### 3. Newsletter (DSGVO-konform)

- **Double Opt-In** (Consent Management)
- **Unsubscribe Link** (in jedem Email)
- **Data Retention Policy** (automatische Löschung nach 2 Jahren Inaktivität)

---

## 🗄️ Database

### Drupal Database

**Connection** (in `web/sites/default/settings.php`):

```php
$databases['default']['default'] = [
  'database' => 'crm_drupal',
  'username' => 'crm_user',
  'password' => 'password',
  'host' => 'localhost',
  'port' => '3306',
  'driver' => 'mysql',
  'prefix' => '',
];
```

### CiviCRM Database

**Separate Database** (empfohlen):

```php
define('CIVICRM_DSN', 'mysql://crm_user:password@localhost/crm_civicrm');
```

### Drush Commands

```bash
# Database Export
vendor/bin/drush sql:dump > backup.sql

# Database Import
vendor/bin/drush sql:cli < backup.sql

# Cache Clear
vendor/bin/drush cache:rebuild
```

---

## 🔒 PII Sanitizer Module

**Zweck**: DSGVO-konforme Redaktion sensibler Daten in Drupal Logs

**Location**: `web/modules/custom/pii_sanitizer/`

**Installation**:

```bash
vendor/bin/drush en pii_sanitizer
vendor/bin/drush cr
```

**Konfiguration**: `/admin/config/system/pii-sanitizer`

**Automatische Redaktion** in:

- Watchdog (Drupal Logs)
- Webform Submissions (nach Verarbeitung)
- CiviCRM Activity Logs

---

## 🧪 Testing

### PHPUnit Tests

```bash
# Alle Tests
vendor/bin/phpunit

# Nur Custom Module Tests
vendor/bin/phpunit web/modules/custom/
```

### Functional Testing (Drupal Test Traits)

```bash
# In web/
../vendor/bin/phpunit --group functional
```

---

## 🚀 Deployment

### Config Export (vor Deployment)

```bash
# Configuration exportieren
vendor/bin/drush config:export

# Git commit
git add config/sync/
git commit -m "feat: update drupal config"
```

### Plesk Deployment

```bash
# Von Root-Verzeichnis
./deployment-scripts/deploy-crm-plesk.sh

# Steps:
# 1. Git pull auf Server
# 2. composer install --no-dev
# 3. drush updatedb (Database Updates)
# 4. drush config:import (Config Import)
# 5. drush cache:rebuild
```

### Environment Variables (Production)

```php
// settings.php
$databases['default']['default'] = [
  'database' => getenv('DB_NAME'),
  'username' => getenv('DB_USER'),
  'password' => getenv('DB_PASSWORD'),
  'host' => getenv('DB_HOST'),
  'port' => '3306',
  'driver' => 'mysql',
];
```

---

## 🔐 Security

### Best Practices

✅ **HTTPS erzwungen** (via Plesk)  
✅ **Strong Passwords** (Policy: min. 12 Zeichen, Sonderzeichen)  
✅ **2FA aktiviert** (für Admin-Accounts)  
✅ **File Permissions**: `chmod 644` für Files, `755` für Directories  
✅ **Regular Updates**: Drupal Core + Module Updates via Composer

### Update Workflow

```bash
# Security Updates checken
composer outdated "drupal/*"

# Core Update
composer update drupal/core-recommended --with-dependencies
vendor/bin/drush updatedb
vendor/bin/drush cache:rebuild
```

---

## 🧹 Maintenance

### Automated Cron

**Cron URL**: <https://crm.menschlichkeit-oesterreich.at/cron/CRON_KEY>

**Plesk Cron Job** (täglich 02:00):

```bash
0 2 * * * curl -s https://crm.menschlichkeit-oesterreich.at/cron/CRON_KEY > /dev/null
```

### Database Cleanup

```bash
# Alte Logs löschen (> 90 Tage)
vendor/bin/drush watchdog:delete all --severity=Notice

# Temp Files cleanup
find web/sites/default/files/tmp -mtime +7 -delete
```

---

## 🆘 Troubleshooting

### Häufige Probleme

**Problem**: White Screen of Death (WSOD)  
**Lösung**:

```bash
# Error Reporting aktivieren (settings.php)
$config['system.logging']['error_level'] = 'verbose';
vendor/bin/drush cache:rebuild
```

**Problem**: CiviCRM Admin-Seite nicht erreichbar  
**Lösung**:

```bash
# CiviCRM Cache leeren
rm -rf web/sites/default/files/civicrm/templates_c/*
vendor/bin/drush cache:rebuild
```

**Problem**: Permissions Error beim File Upload  
**Lösung**:

```bash
chmod -R 755 web/sites/default/files
chown -R www-data:www-data web/sites/default/files
```

---

## 🤝 Contributing

### Custom Module entwickeln

```bash
# Modul erstellen
vendor/bin/drush generate module

# Development Mode
vendor/bin/drush state:set system.maintenance_mode 1
# ... Development ...
vendor/bin/drush state:set system.maintenance_mode 0
```

Siehe [../.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md)

---

## 📖 Weitere Dokumentation

- **Drupal Core**: [web/core/README.md](web/README.md)
- **CiviCRM Docs**: <https://docs.civicrm.org/>
- **API Integration**: [../api.menschlichkeit-oesterreich.at/README.md](../api.menschlichkeit-oesterreich.at/README.md)
- **DSGVO Compliance**: [../docs/legal/DSGVO-COMPLIANCE-BLUEPRINT.md](../docs/legal/DSGVO-COMPLIANCE-BLUEPRINT.md)
- **DOCS-INDEX**: [../DOCS-INDEX.md](../DOCS-INDEX.md)

---

## 📜 Lizenz

Drupal: GPL v2+  
CiviCRM: AGPL v3  
Custom Modules: MIT License – Siehe [../LICENSE](../LICENSE)

---

<div align="center">
  <strong>👥 CRM für demokratische Teilhabe 🇦🇹</strong>
  <br>
  <sub>Powered by Drupal 10 | CiviCRM | MariaDB</sub>
</div>
