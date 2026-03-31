# phpBB Forum — Menschlichkeit Österreich

Community-Forum basierend auf **phpBB 3.3.15** mit PostgreSQL, Redis-Cache und Brand-konformem Theme.

## Schnellstart

```bash
# 1. Docker-Image bauen
npm run dev:forum:build

# 2. Forum starten (benötigt PostgreSQL + Redis)
npm run docker:up          # Falls noch nicht gestartet
npm run dev:forum

# 3. Erstinstallation via Web-Installer
#    Browser → http://localhost:8002/install/app.php
#    DB-Host: postgres | DB-Name: phpbb | User: phpbb | Passwort: phpbb_dev

# 4. Extensions installieren
npm run dev:forum:extensions

# 5. Theme + Sprache im ACP aktivieren
#    http://localhost:8002/adm/
```

## Architektur

```
Port 8002 → Nginx (phpbb-nginx) → PHP-FPM (phpbb-fpm) → PostgreSQL (phpbb DB)
                                                        → Redis (DB 1: Sessions, DB 2: Cache)
```

## Verzeichnisstruktur

| Verzeichnis            | Inhalt                                        |
| ---------------------- | --------------------------------------------- |
| `docker/`              | Dockerfile, php.ini, php-fpm.conf             |
| `nginx/`               | Dev- und Produktions-Nginx-Config             |
| `config/`              | phpBB config.php Template                     |
| `theme/moe_prosilver/` | Brand-Theme (Prosilver Child)                 |
| `scripts/`             | DB-Init, Extension-Installer, Daten-Migration |

## npm Scripts

| Script                 | Beschreibung            |
| ---------------------- | ----------------------- |
| `dev:forum`            | Forum starten           |
| `dev:forum:build`      | Docker-Image neu bauen  |
| `dev:forum:logs`       | Logs anzeigen           |
| `dev:forum:shell`      | Shell im Container      |
| `dev:forum:cli`        | phpBB CLI               |
| `dev:forum:extensions` | Extensions installieren |

## Extensions

| Extension    | Zweck                     |
| ------------ | ------------------------- |
| hCaptcha     | DSGVO-konformes CAPTCHA   |
| SEO Metadata | Open Graph, JSON-LD       |
| Media Embed  | YouTube/Vimeo Einbettung  |
| de_x_sie     | Deutsche Sprache (formal) |

## DSGVO-Hinweise

- hCaptcha statt reCAPTCHA (kein Google-Tracking)
- IP-Logging-Retention: 7 Tage (ACP konfigurieren)
- Geburtstagsfeld deaktivieren
- Cookie-Consent-Banner aktivieren
- Datenschutzerklärung bei Registrierung erzwingen
