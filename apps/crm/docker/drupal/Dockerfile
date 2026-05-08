FROM php:8.2-fpm@sha256:2509cda8128e084b8cbb9e560dffae5f53e24e0cd90355414d57ed9a28727711

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libicu-dev \
    zip \
    unzip \
    wget \
    mariadb-client \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl \
    && rm -rf /var/lib/apt/lists/*

# Install Imagick (optional - commented out due to unavailable libmagickwand-dev)
# RUN apt-get install -y libmagickwand-dev --no-install-recommends \
#     && pecl install imagick \
#     && docker-php-ext-enable imagick


# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy custom PHP configuration
COPY php.ini /usr/local/etc/php/conf.d/custom.ini

# Install Drupal and CiviCRM via Composer
RUN composer create-project drupal/recommended-project:10.x . --no-interaction \
    && composer config allow-plugins.civicrm/civicrm-asset-plugin true \
    && composer require drush/drush --no-interaction \
    && composer require civicrm/civicrm-asset-plugin:"^1.1" --no-interaction

# Set proper permissions without stripping executable bits from vendor/bin
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R u+rwX,go+rX /var/www/html

# Create files directory
RUN mkdir -p /var/www/html/web/sites/default/files \
    && chown -R www-data:www-data /var/www/html/web/sites/default/files \
    && chmod -R 775 /var/www/html/web/sites/default/files

# Copy initialization script
COPY init-drupal.sh /usr/local/bin/init-drupal.sh
RUN chmod +x /usr/local/bin/init-drupal.sh

EXPOSE 9000

# Non-root user: www-data existiert in php:8.2-fpm, Permissions oben gesetzt (CIS Docker Benchmark 4.1)
USER www-data

# Start PHP-FPM
CMD ["/usr/local/bin/init-drupal.sh"]