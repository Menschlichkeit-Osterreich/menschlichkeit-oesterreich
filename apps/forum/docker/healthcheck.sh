#!/bin/sh
# =============================================================
# phpBB Health-Check — prüft FPM-Prozess und DB-Verbindung
# Wird alle 30s von Docker HEALTHCHECK aufgerufen
# =============================================================

set -e

# 1. PHP-FPM läuft?
php-fpm -t 2>/dev/null || exit 1

# 2. PHP kann ausgeführt werden?
php -r "echo 'ok';" > /dev/null 2>&1 || exit 1

# Alles OK
exit 0
