-- ============================================================
-- MariaDB Least-Privilege User Setup
-- Menschlichkeit Österreich – Infrastruktur-Audit 2026-03
-- ============================================================
--
-- VERWENDUNG:
--   mysql -u root -p < scripts/db-user-setup.sql
--
-- VORAUSSETZUNGEN:
--   - MariaDB 10.6+
--   - root-Zugriff auf MariaDB
--   - Passwörter NICHT hier eintragen – via Umgebungsvariablen setzen:
--     SET @api_pw = '...';   -- vorher in Shell: set -a; source secrets.env
--
-- SICHERHEIT:
--   - Keine Passwörter in diese Datei eintragen (gitignored ausgenommen)
--   - Passwörter via SOPS oder Vault verwalten
--   - Nach Ausführung: mysql_history bereinigen
-- ============================================================

-- Zeichensatz sicherstellen
SET NAMES utf8mb4;

-- ============================================================
-- 1. Datenbanken anlegen
-- ============================================================

CREATE DATABASE IF NOT EXISTS moe_main
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    COMMENT 'FastAPI Hauptplattform (User-Management, Auth)';

CREATE DATABASE IF NOT EXISTS moe_crm
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    COMMENT 'Drupal 10 + CiviCRM (Kontakte, Spenden, CRM)';

CREATE DATABASE IF NOT EXISTS moe_forum
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    COMMENT 'Community-Forum';

CREATE DATABASE IF NOT EXISTS moe_newsletter
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    COMMENT 'Newsletter-Kampagnen und Subscriber';

CREATE DATABASE IF NOT EXISTS moe_support
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    COMMENT 'Support-Ticketing-System';

CREATE DATABASE IF NOT EXISTS moe_voting
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    COMMENT 'Demokratische Abstimmungsplattform (anonymisiert)';

CREATE DATABASE IF NOT EXISTS moe_nextcloud
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    COMMENT 'Nextcloud Dateispeicher-Metadaten';

CREATE DATABASE IF NOT EXISTS moe_n8n
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    COMMENT 'n8n Automation-Workflows und Execution-Logs';

-- ============================================================
-- 2. Service-User anlegen (Passwörter EXTERN setzen)
-- ============================================================
-- WICHTIG: Passwörter durch sichere, zufällige Werte ersetzen.
-- Empfehlung: pwgen -s 32 1
-- Dann in SOPS / GitHub Secrets hinterlegen.
--
-- Syntax: IDENTIFIED BY '${PASSWORT_AUS_VAULT}'
-- In Produktion: separate SQL-Datei mit Passwörtern, nicht in Git.
-- ============================================================

-- API-User (FastAPI / Hauptplattform)
CREATE USER IF NOT EXISTS 'api_user'@'localhost'
    IDENTIFIED BY 'CHANGE_ME_api_password';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON moe_main.*
    TO 'api_user'@'localhost';

-- CRM-User (Drupal + CiviCRM)
CREATE USER IF NOT EXISTS 'crm_user'@'localhost'
    IDENTIFIED BY 'CHANGE_ME_crm_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE TEMPORARY TABLES
    ON moe_crm.*
    TO 'crm_user'@'localhost';

-- Forum-User
CREATE USER IF NOT EXISTS 'forum_user'@'localhost'
    IDENTIFIED BY 'CHANGE_ME_forum_password';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON moe_forum.*
    TO 'forum_user'@'localhost';

-- Newsletter-User
CREATE USER IF NOT EXISTS 'newsletter_user'@'localhost'
    IDENTIFIED BY 'CHANGE_ME_newsletter_password';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON moe_newsletter.*
    TO 'newsletter_user'@'localhost';

-- Support-User
CREATE USER IF NOT EXISTS 'support_user'@'localhost'
    IDENTIFIED BY 'CHANGE_ME_support_password';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON moe_support.*
    TO 'support_user'@'localhost';

-- Voting-User
CREATE USER IF NOT EXISTS 'voting_user'@'localhost'
    IDENTIFIED BY 'CHANGE_ME_voting_password';
GRANT SELECT, INSERT, UPDATE, DELETE
    ON moe_voting.*
    TO 'voting_user'@'localhost';

-- Nextcloud-User
CREATE USER IF NOT EXISTS 'nextcloud_user'@'localhost'
    IDENTIFIED BY 'CHANGE_ME_nextcloud_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, LOCK TABLES, CREATE TEMPORARY TABLES
    ON moe_nextcloud.*
    TO 'nextcloud_user'@'localhost';

-- n8n-User
CREATE USER IF NOT EXISTS 'n8n_user'@'localhost'
    IDENTIFIED BY 'CHANGE_ME_n8n_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER
    ON moe_n8n.*
    TO 'n8n_user'@'localhost';

-- ============================================================
-- 3. Backup-User (Read-Only für alle Datenbanken)
-- ============================================================

CREATE USER IF NOT EXISTS 'backup_user'@'localhost'
    IDENTIFIED BY 'CHANGE_ME_backup_password';

GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER
    ON moe_main.*    TO 'backup_user'@'localhost';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER
    ON moe_crm.*     TO 'backup_user'@'localhost';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER
    ON moe_forum.*   TO 'backup_user'@'localhost';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER
    ON moe_newsletter.* TO 'backup_user'@'localhost';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER
    ON moe_support.* TO 'backup_user'@'localhost';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER
    ON moe_voting.*  TO 'backup_user'@'localhost';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER
    ON moe_nextcloud.* TO 'backup_user'@'localhost';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER
    ON moe_n8n.*     TO 'backup_user'@'localhost';
GRANT RELOAD, PROCESS
    ON *.* TO 'backup_user'@'localhost';

-- ============================================================
-- 4. Sicherheit: root-Zugriff prüfen
-- ============================================================

-- root darf NUR von localhost verbinden (kein Remote-Zugriff):
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Anonyme User entfernen:
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.db WHERE User='';

-- Test-Datenbank entfernen:
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';

-- ============================================================
-- 5. Berechtigungen aktivieren
-- ============================================================

FLUSH PRIVILEGES;

-- ============================================================
-- 6. Verifizierung (nach Ausführung ausführen)
-- ============================================================
-- SHOW GRANTS FOR 'api_user'@'localhost';
-- SHOW GRANTS FOR 'backup_user'@'localhost';
-- SELECT User, Host FROM mysql.user ORDER BY User;
-- ============================================================
