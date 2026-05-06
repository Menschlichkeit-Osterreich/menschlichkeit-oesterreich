# 09 – Security Hardening Plan

**Stand**: 2026-03-09

---

## SSH-Härtung

```bash
# /etc/ssh/sshd_config (relevante Einstellungen)
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
MaxAuthTries 3
MaxSessions 5
LoginGraceTime 30
X11Forwarding no
AllowTcpForwarding no
TCPKeepAlive yes
ClientAliveInterval 300
ClientAliveCountMax 2
Protocol 2

# Erlaubte User explizit auflisten:
AllowUsers [admin-user] [deploy-user]

# Nach Änderung:
# systemctl restart sshd
```

**SSH-Key-Rotation**: Alle 12 Monate oder bei Verdacht auf Kompromittierung.

---

## HTTP Security Headers (nginx)

```nginx
# /etc/nginx/conf.d/security-headers.conf
# Global für alle vHosts (Plesk Additional Nginx Directives)

add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()" always;

# CSP (individuell je Subdomain anpassen):
# Frontend:
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.menschlichkeit-oesterreich.at; frame-ancestors 'self';" always;

# API (stricter):
add_header Content-Security-Policy "default-src 'none'; frame-ancestors 'none';" always;
```

---

## Secrets Management

### Architektur

```
Lokale Entwicklung:
  .env.local (gitignored) ← Entwickler-Credentials
  .env.example            ← Vorlage mit CHANGE_ME-Platzhaltern

CI/CD (GitHub Actions):
  GitHub Secrets           ← Produktions-Credentials via Actions
  GitHub Variables         ← Nicht-sensitive Konfiguration

Produktion (Server):
  /etc/secrets/            ← Root-only (chmod 600)
    api.env
    n8n.env
    nextcloud.env
  OR: HashiCorp Vault / SOPS + Age-Key
```

### Secrets-Rotation-Kalender

| Secret | Rotation | Letzter Wechsel | Nächster Wechsel |
|--------|----------|-----------------|-----------------|
| n8n Admin-Passwort | 90 Tage | Sofort (P0-Fix) | 2026-06-09 |
| n8n DB-Passwort | 90 Tage | Sofort (P0-Fix) | 2026-06-09 |
| Redis-Passwort | 90 Tage | Sofort (P0-Fix) | 2026-06-09 |
| Plesk Admin-Passwort | 90 Tage | – | Sofort |
| SSH-Keys | 365 Tage | – | Prüfen |
| JWT_SECRET (API) | 180 Tage | – | Prüfen |
| STRIPE_SECRET_KEY | Auf Anfrage | – | – |
| GitHub Personal Access Token | 90 Tage | – | Prüfen |

### Sofortige Credential-Rotation (P0-SECURITY-001)

```bash
# 1. n8n Admin-Passwort:
# n8n-Panel → Settings → Users → Passwort ändern

# 2. MariaDB n8n-User-Passwort:
# SSH auf Server:
mysql -u root -p
ALTER USER 'n8n_user'@'localhost' IDENTIFIED BY '[NEUES_STARKES_PASSWORT]';
FLUSH PRIVILEGES;

# 3. Redis-Passwort:
# In docker-compose.n8n.yml oder n8n-Konfiguration:
# REDIS_PASSWORD → neuen Wert setzen
# Container neu starten: docker compose restart redis

# 4. Neue Werte in SOPS/GitHub Secrets hinterlegen
# 5. Git-History bereinigen (falls Repo öffentlich):
# git filter-repo --path automation/n8n/.env.example --invert-paths
```

---

## WAF / ModSecurity

### CRS-Konfiguration pro Subdomain

| Subdomain | ModSecurity-Modus | Spezifische Ausnahmen |
|-----------|------------------|----------------------|
| apex (Frontend) | Detection | Keine |
| api | Prevention | API-spezifische JSON-Body-Rules |
| crm (Drupal) | Detection→Prevention | Drupal Admin UI, CiviCRM Admin |
| cloud (Nextcloud) | Detection | WebDAV-PUT, CalDAV, CardDAV |
| forum | Prevention | Post-Body (BBCode) |
| n8n | Prevention | Webhook-Payloads |
| vote | Prevention | Abstimmungs-Submit |

---

## DSGVO-Datenschutz-Technisch

### Logging-Richtlinien

```python
# FastAPI PII-Sanitizer (bereits vorhanden – app/lib/pii_sanitizer.py)
# Regel: Keine PII in Logs

# Verifizieren mit:
# pytest tests/test_pii_sanitizer.py

# Ergänzungen prüfen:
# - Drupal: custom module web/modules/custom/pii_sanitizer/ vorhanden
# - n8n: Workflow-Logs auf PII prüfen (manuelle Prüfung)
# - MariaDB: Slow Query Log kein E-Mail-Content
# - nginx: IP-Adressen nach 7 Tagen anonymisieren
```

### IP-Anonymisierung nginx

```nginx
# nginx: IP-Adressen im Log auf letztes Oktett anonymisieren
map $remote_addr $remote_addr_anon {
    ~(?P<ip>\d+\.\d+\.\d+)\.    $ip.0;
    ~(?P<ip>[^:]+:[^:]+):        $ip::;
    default                      0.0.0.0;
}
access_log /var/log/nginx/access.log combined;
# Format anpassen: $remote_addr_anon statt $remote_addr
```

---

## Dependency Management

```bash
# Wöchentlicher Dependency-Audit (bereits via GitHub Actions):
npm audit
pip-audit   # FastAPI Python-Dependencies
composer audit  # Drupal PHP-Dependencies

# SBOM generieren (bereits via sbom.yml Workflow):
npm sbom --sbom-type=spdx --sbom-format=json > sbom.json

# Kritische Schwachstellen blockieren CI (empfohlen):
# In GitHub Actions quality-gates.yml:
npm audit --audit-level=critical --fail
```

---

## Security-Monitoring

### Automatisierte Scans (bereits in CI/CD)

| Tool | Typ | Trigger |
|------|-----|---------|
| Gitleaks | Secret-Scan | Push + PR |
| Trivy | Container + FS-Scan | PR + tägl. |
| Bandit | Python SAST | PR + tägl. |
| Semgrep | Multi-Language SAST | PR |
| CodeQL | SAST (GitHub) | PR + tägl. |
| dependency-review | OSS-Lizenzen + CVEs | PR |

### Empfohlene Ergänzungen

```yaml
# .github/workflows/security-headers-check.yml (neu):
- name: Security-Header-Check (Produktion)
  run: |
    curl -s -I https://menschlichkeit-oesterreich.at | grep -E "(Strict-Transport|X-Frame|X-Content|CSP)"
    curl -s -I https://api.menschlichkeit-oesterreich.at | grep -E "(Strict-Transport|X-Frame|Content-Security)"
```

---

## Checkliste Security Hardening

```
SSH:
[ ] PermitRootLogin no
[ ] PasswordAuthentication no
[ ] SSH-Keys inventarisiert
[ ] Rotation-Schedule definiert

Headers:
[ ] HSTS für alle Domains (inkl. Subdomains)
[ ] CSP für Frontend (kein 'unsafe-eval' wo möglich)
[ ] X-Frame-Options: SAMEORIGIN
[ ] X-Content-Type-Options: nosniff

Secrets:
[ ] P0-Credentials rotiert (n8n, Redis, Plesk)
[ ] Alle Secrets in GitHub Secrets oder SOPS
[ ] Rotation-Kalender gepflegt
[ ] Keine Klartext-Credentials in .env.example

WAF:
[ ] ModSecurity CRS aktiv (Detection-Mode)
[ ] Fehlalarme dokumentiert
[ ] Schrittweise auf Prevention-Mode

DSGVO:
[ ] PII-Sanitizer: pytest bestanden
[ ] nginx IP-Anonymisierung
[ ] Log-Retention: max. 90 Tage
[ ] Drupal PII-Modul aktiv

Dependencies:
[ ] npm audit weekly
[ ] pip-audit weekly
[ ] composer audit weekly
[ ] SBOM bei jedem Release
```
