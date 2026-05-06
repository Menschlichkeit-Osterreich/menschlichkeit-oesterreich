#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
while ! mysqladmin ping -h"$DB_HOST" --silent; do
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
    
    # Install CiviCRM
    echo "Installing CiviCRM..."
    composer civicrm:install --no-interaction
    
    # Configure CiviCRM
    CIVI_SETTINGS="/var/www/html/web/sites/default/civicrm.settings.php"
    if [ -f "$CIVI_SETTINGS" ]; then
        echo "Configuring CiviCRM settings..."
        
        # Set site key
        if grep -q "CIVICRM_SITE_KEY" "$CIVI_SETTINGS"; then
            sed -ri "s|define\('CIVICRM_SITE_KEY',[^)]*\)|define('CIVICRM_SITE_KEY', '$CIVICRM_SITE_KEY')|" "$CIVI_SETTINGS"
        else
            echo "define('CIVICRM_SITE_KEY', '$CIVICRM_SITE_KEY');" >> "$CIVI_SETTINGS"
        fi
        
        # Set base URL
        if ! grep -q "CIVICRM_UF_BASEURL" "$CIVI_SETTINGS"; then
            echo "if (!defined('CIVICRM_UF_BASEURL')) define('CIVICRM_UF_BASEURL', 'http://localhost/');" >> "$CIVI_SETTINGS"
        fi
    fi
    
    echo "CiviCRM configuration completed!"
    
    # Set proper permissions
    chown -R www-data:www-data /var/www/html
    chmod -R 755 /var/www/html/web/sites/default/files
    
else
    echo "Drupal already installed, skipping installation..."
fi

# Start PHP-FPM
echo "Starting PHP-FPM..."
exec php-fpm