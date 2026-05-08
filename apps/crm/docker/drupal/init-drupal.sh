#!/bin/bash
set -euo pipefail

# Wait for database to be ready
echo "Waiting for database..."
DB_WAIT_TIMEOUT_SECONDS=90
DB_WAIT_START_TS=$(date +%s)
while ! mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" --silent --skip-ssl 2>/dev/null; do
    DB_WAIT_NOW_TS=$(date +%s)
    DB_WAIT_ELAPSED=$((DB_WAIT_NOW_TS - DB_WAIT_START_TS))
    if [[ "$DB_WAIT_ELAPSED" -ge "$DB_WAIT_TIMEOUT_SECONDS" ]]; then
        echo "ERROR: Database was not ready within ${DB_WAIT_TIMEOUT_SECONDS}s. Aborting bootstrap." >&2
        exit 1
    fi
    sleep 1
done
echo "Database is ready!"

# Check if Drupal is already installed
if [ ! -f "/var/www/html/web/sites/default/settings.php" ]; then
    echo "Installing Drupal..."
    
    # Install Drupal site
    cd /var/www/html
    vendor/bin/drush site:install standard -y \
        --site-name="$DRUPAL_SITE_NAME" \
        --account-name="admin" \
        --account-pass="admin123" \
        --db-url="mysql://$DB_USER:$DB_PASS@$DB_HOST/$DB_NAME"

    echo "Drupal installation completed!"

    echo "Installing and enabling CiviCRM Drupal module..."
    # Drupal hardens permissions during install; CiviCRM needs temporary write access
    # to generate sites/default/civicrm.settings.php on first bootstrap.
    chmod u+w /var/www/html/web/sites/default

    vendor/bin/drush -l http://localhost en civicrm -y
    vendor/bin/drush -l http://localhost cr

    if ! vendor/bin/drush -l http://localhost pm:list --type=module --status=enabled --format=list | grep -qx 'civicrm'; then
        echo "ERROR: civicrm module is not enabled after bootstrap"
        exit 1
    fi

    if [ ! -f "/var/www/html/web/sites/default/civicrm.settings.php" ]; then
        echo "ERROR: civicrm.settings.php was not created"
        exit 1
    fi

    echo "CiviCRM bootstrap completed!"
    
else
    echo "Drupal already installed, skipping installation..."
fi

# Start PHP-FPM
echo "Starting PHP-FPM..."
exec php-fpm