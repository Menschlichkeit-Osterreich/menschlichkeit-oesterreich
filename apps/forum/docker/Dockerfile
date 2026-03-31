# =============================================================
# phpBB 3.3.15 — PHP 8.3-FPM (Alpine) — Multi-Stage Build
# Menschlichkeit Österreich Forum
# Optimiert: Sicherheit, Performance, Extensions, Monitoring
# =============================================================

# ── Stage 1: Builder (Downloads + Kompilation) ──────────────
FROM php:8.3-fpm-alpine AS builder

ARG PHPBB_VERSION=3.3.15

# Build-Tools
RUN apk add --no-cache \
    libpng-dev libpq-dev libxml2-dev libzip-dev oniguruma-dev \
    icu-dev freetype-dev libjpeg-turbo-dev curl-dev \
    bzip2 tar unzip $PHPIZE_DEPS

# PHP-Extensions kompilieren
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql pgsql gd mbstring zip opcache intl \
        curl dom fileinfo iconv ctype \
    && pecl install redis \
    && docker-php-ext-enable redis

# phpBB herunterladen und entpacken
RUN curl -fSL "https://download.phpbb.com/pub/release/3.3/${PHPBB_VERSION}/phpBB-${PHPBB_VERSION}.tar.bz2" \
        -o /tmp/phpbb.tar.bz2 \
    && mkdir -p /var/www/phpbb \
    && tar -xjf /tmp/phpbb.tar.bz2 -C /var/www/phpbb --strip-components=1 \
    && rm /tmp/phpbb.tar.bz2

# Deutsche Sprachpakete (de_x_sie = formelles Sie)
RUN curl -fSL "https://download.phpbb.com/pub/release/3.3/${PHPBB_VERSION}/languages/phpBB-${PHPBB_VERSION}-lang-de_x_sie.tar.bz2" \
        -o /tmp/lang-de.tar.bz2 \
    && tar -xjf /tmp/lang-de.tar.bz2 -C /var/www/phpbb --strip-components=1 \
    && rm /tmp/lang-de.tar.bz2

# ── Extensions im Builder herunterladen ──────────────────────
# 1. Media Embed (offiziell)
RUN curl -fSL "https://www.phpbb.com/customise/db/download/195906" \
        -o /tmp/mediaembed.zip \
    && mkdir -p /var/www/phpbb/ext/phpbb/mediaembed \
    && unzip -q /tmp/mediaembed.zip -d /var/www/phpbb/ext/phpbb/mediaembed 2>/dev/null \
    && rm -f /tmp/mediaembed.zip \
    || echo "WARN: Media Embed — manuell nachinstallieren"

# 2. hCaptcha (DSGVO-konformes CAPTCHA)
RUN curl -fSL "https://github.com/AlfredoRamos/phpbb-ext-hcaptcha/archive/refs/heads/master.zip" \
        -o /tmp/hcaptcha.zip \
    && mkdir -p /var/www/phpbb/ext/alfredoramos \
    && unzip -q /tmp/hcaptcha.zip -d /tmp/hcaptcha \
    && mv /tmp/hcaptcha/phpbb-ext-hcaptcha-master /var/www/phpbb/ext/alfredoramos/hcaptcha \
    && rm -rf /tmp/hcaptcha.zip /tmp/hcaptcha \
    || echo "WARN: hCaptcha — manuell nachinstallieren"

# 3. SEO Metadata (Open Graph, Twitter Cards, JSON-LD)
RUN curl -fSL "https://github.com/AlfredoRamos/phpbb-ext-seometadata/archive/refs/heads/master.zip" \
        -o /tmp/seometadata.zip \
    && mkdir -p /var/www/phpbb/ext/alfredoramos \
    && unzip -q /tmp/seometadata.zip -d /tmp/seometadata \
    && mv /tmp/seometadata/phpbb-ext-seometadata-master /var/www/phpbb/ext/alfredoramos/seometadata \
    && rm -rf /tmp/seometadata.zip /tmp/seometadata \
    || echo "WARN: SEO Metadata — manuell nachinstallieren"

# 4. Lazy Load (Bilder erst bei Sichtbarkeit laden)
RUN curl -fSL "https://github.com/AlfredoRamos/phpbb-ext-lazy-load/archive/refs/heads/master.zip" \
        -o /tmp/lazyload.zip \
    && mkdir -p /var/www/phpbb/ext/alfredoramos \
    && unzip -q /tmp/lazyload.zip -d /tmp/lazyload \
    && mv /tmp/lazyload/phpbb-ext-lazy-load-master /var/www/phpbb/ext/alfredoramos/lazyload \
    && rm -rf /tmp/lazyload.zip /tmp/lazyload \
    || echo "WARN: Lazy Load — manuell nachinstallieren"

# 5. Stop Forum Spam (Anti-Spam-Datenbank)
RUN curl -fSL "https://github.com/rmcgirr83/stopforumspam/archive/refs/heads/master.zip" \
        -o /tmp/sfs.zip \
    && mkdir -p /var/www/phpbb/ext/rmcgirr83 \
    && unzip -q /tmp/sfs.zip -d /tmp/sfs \
    && mv /tmp/sfs/stopforumspam-master /var/www/phpbb/ext/rmcgirr83/stopforumspam \
    && rm -rf /tmp/sfs.zip /tmp/sfs \
    || echo "WARN: StopForumSpam — manuell nachinstallieren"

# 6. Simple Mentions (@user)
RUN curl -fSL "https://github.com/paul999/simple_mentions/archive/refs/heads/master.zip" \
        -o /tmp/mentions.zip 2>/dev/null \
    && mkdir -p /var/www/phpbb/ext/paul999 \
    && unzip -q /tmp/mentions.zip -d /tmp/mentions 2>/dev/null \
    && mv /tmp/mentions/simple_mentions-master /var/www/phpbb/ext/paul999/simple_mentions 2>/dev/null \
    && rm -rf /tmp/mentions.zip /tmp/mentions \
    || echo "WARN: Simple Mentions — manuell nachinstallieren"

# Install-Verzeichnis aufräumen (nach Erstinstallation nicht mehr nötig)
# Wird erst nach Web-Installer entfernt — hier nur vorbereiten

# ── Stage 2: Runtime (schlankes Produktions-Image) ───────────
FROM php:8.3-fpm-alpine AS runtime

LABEL maintainer="Menschlichkeit Österreich <dev@menschlichkeit-oesterreich.at>"
LABEL description="phpBB 3.3 Forum — Optimiert für MÖ"

# Runtime-Abhängigkeiten (nur Libs, keine -dev Pakete)
RUN apk add --no-cache \
    libpng libpq libxml2 libzip oniguruma icu-libs \
    freetype libjpeg-turbo curl tini \
    postgresql-client \
    && mkdir -p /tmp/phpbb_uploads \
    && chown www-data:www-data /tmp/phpbb_uploads

# PHP-Extensions aus Builder kopieren
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/

# phpBB + Extensions aus Builder kopieren
COPY --from=builder /var/www/phpbb /var/www/phpbb

# PHP-Konfiguration kopieren (überschreibt Builder-Defaults)
COPY php.ini /usr/local/etc/php/conf.d/99-phpbb.ini
COPY php-fpm.conf /usr/local/etc/php-fpm.d/zz-phpbb.conf

# Health-Check-Script kopieren
COPY healthcheck.sh /usr/local/bin/healthcheck.sh

# Berechtigungen setzen (CIS Docker Benchmark 4.1)
RUN chown -R www-data:www-data /var/www/phpbb \
    && chmod -R 755 /var/www/phpbb \
    && chmod -R 770 /var/www/phpbb/cache \
    && chmod -R 770 /var/www/phpbb/store \
    && chmod -R 770 /var/www/phpbb/files \
    && chmod -R 770 /var/www/phpbb/images/avatars/upload \
    && chmod 660 /var/www/phpbb/config.php 2>/dev/null || true \
    && chmod +x /usr/local/bin/healthcheck.sh

WORKDIR /var/www/phpbb

# Health-Check (prüft FPM + DB-Verbindung)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

EXPOSE 9000

# tini als init-Prozess (Zombie-Reaping, Signal-Forwarding)
ENTRYPOINT ["tini", "--"]

USER www-data

CMD ["php-fpm"]
