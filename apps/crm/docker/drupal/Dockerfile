FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    wget \
    mariadb-client \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Imagick
RUN apt-get install -y libmagickwand-dev --no-install-recommends \
    && pecl install imagick \
    && docker-php-ext-enable imagick

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy custom PHP configuration
COPY php.ini /usr/local/etc/php/conf.d/custom.ini

# Install Drupal and CiviCRM via Composer
RUN composer create-project drupal/recommended-project:10.x . --no-interaction \
    && composer require drush/drush --no-interaction \
    && composer require civicrm/civicrm-asset-plugin:"^1.1" \
    && composer require civicrm/civicrm-setup:"^0.11" \
    && composer require civicrm/cv:^0.4 --dev --no-interaction \
    && composer config allow-plugins.civicrm/civicrm-asset-plugin true

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type d -exec chmod 755 {} \; \
    && find /var/www/html -type f -exec chmod 644 {} \;

# Create files directory
RUN mkdir -p /var/www/html/web/sites/default/files \
    && chown -R www-data:www-data /var/www/html/web/sites/default/files \
    && chmod -R 775 /var/www/html/web/sites/default/files

# Copy initialization script
COPY init-drupal.sh /usr/local/bin/init-drupal.sh
RUN chmod +x /usr/local/bin/init-drupal.sh

EXPOSE 9000

# Start PHP-FPM
CMD ["/usr/local/bin/init-drupal.sh"]