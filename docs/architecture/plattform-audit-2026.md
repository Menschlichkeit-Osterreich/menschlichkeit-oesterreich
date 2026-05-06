# Plattform-Audit & Optimierungsplan – Menschlichkeit Österreich

**Dokument-Typ:** Systemaudit | Architektur | DevOps | Security | UX/UI  
**Organisation:** Verein Menschlichkeit Österreich  
**Domain:** menschlichkeit-oesterreich.at  
**Erstellt:** 2026-03  
**Version:** 1.0  
**Klassifikation:** INTERN – Nicht öffentlich

---

## Legende

| Symbol | Bedeutung |
|---|---|
| ✅ VERIFIZIERT | Direkt aus Repository/Konfiguration ableitbar |
| ⚠️ WAHRSCHEINLICH | Mit hoher technischer Plausibilität anzunehmen |
| 📋 EMPFOHLEN | Konkrete Zielmaßnahme |
| ❓ OFFEN | Prüffrage – nicht verifizierbar ohne Serveraudit |
| P0 | Kritisch – sofortige Umsetzung |
| P1 | Hoch – zeitnahe Umsetzung |
| P2 | Mittel | P3 | Niedrig |

---

## 1. Executive Summary

Die Plattform „Menschlichkeit Österreich" ist eine wachsende Civic-Tech-Plattform auf Basis eines Single-Server-Plesk-Hostings. Das System vereint Website, CRM (Drupal/CiviCRM), API (FastAPI), Nextcloud, Forum, Support, Voting, n8n Automation und ein Webgame in einem GitHub-Monorepo.

**Stärken (VERIFIZIERT):**
- Vollständiger CI/CD-Workflow in GitHub Actions vorhanden
- DSGVO-Compliance-Dokumentation und n8n-Workflows für Löschanträge existieren
- Design-Token-System (Figma → Tailwind) ist implementiert
- Monitoring-Stack (Uptime Kuma, Prometheus, Grafana) ist bereits als Docker Compose definiert
- SBOM, Codacy, Trivy, Semgrep Security-Scans sind konfiguriert

**Kritische Risiken (VERIFIZIERT/WAHRSCHEINLICH):**
1. **Admin-Rollenprüfung clientseitig** (`VITE_ADMIN_EMAILS`): Sicherheitslücke P0
2. **Single-Point-of-Failure**: Alle Dienste auf einer IP/Server
3. **Plesk-Panel auf öffentlicher IP:8443** ohne IP-Whitelist ❓
4. **Secrets im Repository**: `.env.vault` vorhanden, aber `.env.example` enthält strukturell sensible Schlüssel-Namen
5. **Keine serverseitige Rollenvalidierung** im FastAPI-Backend für Admin-Endpunkte ❓
6. **Mock-Daten in Production-Code**: Admin-Dashboard und Member-Dashboard zeigen Stub-Daten

---

## 2. Methodik und Annahmen

**Analysebasis:**
- GitHub-Repository: vollständige Codeanalyse
- Konfigurationsdateien: `.env.example`, `.env.production.template`, `docker-compose*.yml`
- Frontend-Quellcode: React/TypeScript SPA
- Backend-Quellcode: FastAPI (Python)
- Dokumentation im `/docs`-Verzeichnis

**Explizite Annahmen (nicht verifiziert):**
- A1: Plesk ist auf `5.183.217.146:8443` ohne IP-Whitelist erreichbar ❓
- A2: TLS-Zertifikate werden über Let's Encrypt (Plesk-automat.) verwaltet ❓
- A3: MariaDB läuft als einzige Datenbankinstanz ohne Replikation ❓
- A4: Kein CDN (Cloudflare o.ä.) ist vorgeschaltet ❓
- A5: Fail2ban ist installiert aber nicht spezifisch für die Plattform konfiguriert ❓
- A6: Nextcloud ist installiert aber nicht unter cloud.menschlichkeit-oesterreich.at aktiv ❓

---

## 3. Ist-Analyse

### 3.1 Infrastruktur

```
Ist-Zustand:
┌─────────────────────────────────────────────────────┐
│  Internet → 5.183.217.146 (Single Server)           │
│  Plesk Hosting                                      │
│  ├── nginx 1.28.0 (Reverse Proxy)                   │
│  ├── PHP 8.4.11                                     │
│  ├── MariaDB 10.6.22                                │
│  ├── Postfix/Dovecot (Mailserver)                   │
│  └── Dienste:                                       │
│      ├── menschlichkeit-oesterreich.at (React SPA)  │
│      ├── api.* (FastAPI / uvicorn)                  │
│      ├── crm.* (Drupal 10 + CiviCRM)                │
│      ├── cloud.* (Nextcloud geplant)                │
│      └── [weitere Subdomains geplant]               │
└─────────────────────────────────────────────────────│
```

| Komponente | Status | Risiko |
|---|---|---|
| Server (Single) | ✅ VERIFIZIERT | Hoch (SPOF) |
| Plesk-Verwaltung | ✅ VERIFIZIERT | Kritisch (Port 8443 öffentlich) |
| nginx | ✅ VERIFIZIERT | Niedrig |
| MariaDB 10.6.22 | ✅ VERIFIZIERT | Mittel (keine Replikation) |
| PHP 8.4.11 | ✅ VERIFIZIERT | Niedrig |
| Backup-System | ❓ OFFEN | Kritisch |
| TLS-Auto-Renewal | ❓ OFFEN | Hoch |
| Fail2ban | ❓ OFFEN | Hoch |

### 3.2 Repository-Struktur

```
monorepo/
├── apps/
│   ├── website/        ← React/TypeScript Frontend ✅
│   ├── api/            ← FastAPI Backend ✅
│   ├── crm/            ← Drupal 10 + CiviCRM ✅
│   └── game/           ← Webgame ✅
├── automation/
│   ├── n8n/            ← n8n Workflows ✅ (30+ Workflows)
│   └── elk-stack/      ← ELK-Stack Docker ⚠️
├── figma-design-system/ ← Design Tokens ✅
├── docs/               ← Dokumentation ✅
├── docker-compose*.yml ← Multi-Service ✅
├── .env.example        ← Env-Template ✅
└── .env.vault          ← Vault (verschlüsselt) ⚠️
```

**Festgestellte Probleme:**
- `figma-design-system/` enthält React-Komponenten (App.tsx, components/) → Scope-Vermischung
- Sehr viele Markdown-Dateien im Root (50+) → Code-Hygiene
- `apps/website/src/figma-assets/` enthält `.png.ts` Datei → Ungewöhnlich
- `.env.vault` im Repo → Nur sicher wenn korrekt verschlüsselt (dotenv-vault)

---

## 4. Kritische Risiken

| # | Risiko | Typ | Schweregrad | Priorität |
|---|---|---|---|---|
| R1 | Admin-Rollencheck clientseitig via `VITE_ADMIN_EMAILS` | Security | **Kritisch** | P0 |
| R2 | Plesk Port 8443 ohne IP-Whitelist | Security | **Kritisch** | P0 |
| R3 | Single Server = SPOF für alle Dienste | Betrieb | **Hoch** | P1 |
| R4 | Keine Backup-Verifikation dokumentiert | Betrieb | **Hoch** | P1 |
| R5 | Mock-Daten in Admin-/Mitglieder-Dashboard | UX/Produkt | **Hoch** | P1 |
| R6 | Fehlende serverseitige Rollenvalidierung im API | Security | **Hoch** | P0 |
| R7 | DMARC nicht verifiziert konfiguriert | Security | **Hoch** | P1 |
| R8 | Kein Monitoring für Mail-Queue | Betrieb | **Mittel** | P2 |
| R9 | `figma-design-system/` enthält App-Code | Technische Schulden | **Mittel** | P2 |
| R10 | Keine E-Mail-Verifizierung bei Registrierung | Security/UX | **Hoch** | P1 |

---

## 5. Plesk-Optimierungsplan

### 5.1 TLS-Konfiguration

| Maßnahme | Priorität | Aufwand | Risiko bei Nichtumsetzung |
|---|---|---|---|
| Let's Encrypt Auto-Renewal für alle Subdomains | P0 | Niedrig | TLS-Ablauf → Serviceverlust |
| TLSv1.0 + TLSv1.1 deaktivieren | P0 | Niedrig | PCI-DSS-Verletzung |
| HSTS für alle Domains aktivieren | P1 | Niedrig | Downgrade-Angriffe |
| OCSP Stapling aktivieren | P2 | Niedrig | Schlechtere Performance |

### 5.2 Firewall & Zugang

| Maßnahme | Priorität | Aufwand | Abhängigkeit |
|---|---|---|---|
| Plesk-Panel (8443) auf IP-Whitelist einschränken | **P0** | Niedrig | VPN oder feste IP |
| SSH-Zugang auf Schlüssel-Auth beschränken (kein Passwort) | **P0** | Niedrig | — |
| SSH-Port auf nicht-standard Port (z.B. 2222) | P1 | Niedrig | Fail2ban |
| Fail2ban für SSH, HTTP, SMTP aktivieren | **P0** | Mittel | — |
| ModSecurity WAF aktivieren | P1 | Mittel | Rule-Set testen |
| phpMyAdmin-Zugang einschränken oder deaktivieren | P1 | Niedrig | Datenbankzugang |

### 5.3 PHP-Konfiguration

| Parameter | Empfehlung | Begründung |
|---|---|---|
| `expose_php` | Off | Kein Version-Fingerprinting |
| `display_errors` | Off (Produktion) | Keine Info-Leaks |
| `error_log` | /var/log/php_errors.log | Zentrales Logging |
| `upload_max_filesize` | 10M | Nextcloud nutzt eigene Config |
| `allow_url_fopen` | Off | RFI-Schutz |
| `session.cookie_httponly` | On | XSS-Schutz |
| `session.cookie_secure` | On | HTTPS only |
| `session.use_strict_mode` | On | Session-Fixation-Schutz |

### 5.4 Backup-Strategie

📋 **Empfehlung:**

```yaml
# Plesk Backup-Konfiguration (Zielzustand)
backup:
  schedule: täglich 02:00 Uhr
  retention: 30 Tage
  type: Vollbackup + Inkrementell
  umfang:
    - Alle Subdomains (Files)
    - MariaDB (alle Datenbanken)
    - Plesk-Konfiguration
  ziel:
    - Primär: Lokales Backup (/backup)
    - Sekundär: Externes Backup (Nextcloud / S3-kompatibel)
  restore-test: Monatlich (dokumentiert)
  benachrichtigung: security@menschlichkeit-oesterreich.at
```

---

## 6. E-Mail-Optimierungsplan

→ Siehe vollständige Dokumentation: [`docs/operations/mail-architecture.md`](../operations/mail-architecture.md)

**Sofortmaßnahmen:**

| Maßnahme | Priorität |
|---|---|
| SPF-Record prüfen und auf `-all` setzen | P0 |
| DKIM in Plesk mit 2048-Bit-Schlüssel aktivieren | P0 |
| DMARC mit `p=quarantine` setzen + Reporting auf `security@` | P0 |
| Port 25 durch Fail2ban schützen | P1 |
| SMTP-TLSv1.0/1.1 deaktivieren | P1 |

---

## 7. Subdomain-Architektur

→ Siehe vollständige Dokumentation: [`docs/architecture/subdomain-matrix.md`](subdomain-matrix.md)

**Kritische Sofortmaßnahme:**

```nginx
# Plesk Panel: Zugriffsschutz für panel.* und n8n.*
location / {
    allow 1.2.3.4; # Admin-IP
    deny all;
}
```

---

## 8. Nextcloud-Architektur

### 8.1 Zielkonfiguration

| Aspekt | Maßnahme |
|---|---|
| URL | `cloud.menschlichkeit-oesterreich.at` |
| TLS | Let's Encrypt (automatisch) |
| Datenspeicher | `/var/www/vhosts/cloud/data` (lokal) oder S3-kompatibel |
| PHP-Memory | min. 512 MB |
| OPcache | Aktiviert |
| Redis | Für Session + Memcache |

### 8.2 Rollenmodell in Nextcloud

| Nextcloud-Gruppe | Entspricht Vereinsrolle |
|---|---|
| `admin` | Systemadmin |
| `vorstand` | Vereinsvorstand |
| `mitglieder` | Alle aktiven Mitglieder |
| `extern` | Freiwillige / Kooperationspartner |

### 8.3 DSGVO-Schutzmaßnahmen

- Server-seitige Verschlüsselung aktivieren
- Öffentliche Links mit Ablaufdatum und Passwort
- Audit-Log aktivieren
- E-Mail-Benachrichtigungen für Admin-Aktionen
- Keine personenbezogenen Daten in öffentlichen Ordnern

---

## 9. MariaDB-Architektur

### 9.1 Datenbank-Trennung (Zielzustand)

```sql
-- Service-Datenbanken (getrennt nach Dienst)
CREATE DATABASE main_platform_database   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE civicrm_database         CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE drupal_database          CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE newsletter_database      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE forum_database           CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE support_database         CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE voting_database          CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Staging-Datenbanken
CREATE DATABASE main_platform_staging    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 9.2 Service-Accounts (Least Privilege)

```sql
-- Jeder Dienst erhält nur Rechte auf seine Datenbank
CREATE USER 'api_user'@'localhost'       IDENTIFIED BY '...';
CREATE USER 'civicrm_user'@'localhost'  IDENTIFIED BY '...';
CREATE USER 'drupal_user'@'localhost'   IDENTIFIED BY '...';
CREATE USER 'newsletter_user'@'localhost' IDENTIFIED BY '...';
CREATE USER 'forum_user'@'localhost'    IDENTIFIED BY '...';
CREATE USER 'voting_user'@'localhost'   IDENTIFIED BY '...';
CREATE USER 'backup_user'@'localhost'   IDENTIFIED BY '...'; -- nur SELECT + LOCK

GRANT ALL PRIVILEGES ON main_platform_database.* TO 'api_user'@'localhost';
GRANT SELECT ON *.* TO 'backup_user'@'localhost';
-- etc.

FLUSH PRIVILEGES;
```

### 9.3 Backup-Strategie (MariaDB)

```bash
#!/bin/bash
# mariadb-backup.sh – tägliches Vollbackup aller Datenbanken
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backup/mariadb
RETENTION_DAYS=30

for DB in main_platform_database civicrm_database drupal_database newsletter_database forum_database; do
  mysqldump --single-transaction --quick --lock-tables=false \
    -u backup_user -p"${BACKUP_PASS}" "${DB}" \
    | gzip > "${BACKUP_DIR}/${DB}_${DATE}.sql.gz"
done

# Alte Backups löschen
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
```

---

## 10. Monitoring-Architektur

→ Siehe vollständige Dokumentation: [`docs/operations/monitoring-matrix.md`](../operations/monitoring-matrix.md)

**Sofortmaßnahme (P0):**
```bash
# Uptime Kuma sofort starten
docker compose -f docker-compose.monitoring.yml up -d uptime-kuma
```

---

## 11. Security-Hardening-Plan

### 11.1 Kritische Sofortmaßnahmen (P0)

| # | Maßnahme | Ziel | Abhängigkeit | Aufwand |
|---|---|---|---|---|
| S1 | Admin-Check im JWT-Backend implementieren | R1 beheben | FastAPI-Backend | Mittel |
| S2 | Plesk-Panel IP-Whitelist | R2 beheben | Feste Admin-IP | Niedrig |
| S3 | SSH: Passwort-Auth deaktivieren | Brute-Force | — | Niedrig |
| S4 | Fail2ban aktivieren (SSH, HTTP, SMTP) | Brute-Force | — | Mittel |
| S5 | SPF/DKIM/DMARC prüfen und setzen | E-Mail-Sicherheit | DNS-Zugang | Niedrig |

### 11.2 Security Headers (nginx)

```nginx
# nginx-Security-Header für alle Subdomains
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.menschlichkeit-oesterreich.at;" always;
```

### 11.3 API-Sicherheit (FastAPI)

```python
# Empfehlung: JWT-Claim-basierte Rollenprüfung
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def require_admin(token: str = Depends(oauth2_scheme)):
    payload = decode_jwt(token)
    if payload.get("role") not in ["admin", "sysadmin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return payload
```

---

## 12. Repo- und CI/CD-Verbesserungen

### 12.1 Festgestellte Probleme

| Problem | Schweregrad | Empfehlung |
|---|---|---|
| 50+ Markdown-Dateien im Root | Mittel | In `/docs` konsolidieren |
| `figma-design-system/` enthält App-Code | Mittel | In `apps/design-system/` verschieben |
| `.env.vault` im Repository | Hoch | Sicherstellen dass korrekt verschlüsselt (dotenv-vault) |
| Keine `CODEOWNERS`-Datei | Mittel | Ownership pro Bereich definieren |
| Kein Dependabot für Python (`apps/api/`) | Mittel | `dependabot.yml` erweitern |

### 12.2 Empfohlene Branching-Strategie

```
main          → Produktion (geschützt, keine direkten Pushes)
  └── develop → Integration (PR-Ziel für Features)
      └── feature/xxx → Einzelne Features
      └── fix/xxx     → Bugfixes
      └── hotfix/xxx  → Kritische Produktions-Fixes (direkt → main + develop)
```

### 12.3 GitHub Actions Empfehlungen

```yaml
# Empfohlene Checks in CI
jobs:
  security-scan:
    - trivy filesystem --exit-code 1 --severity CRITICAL,HIGH
    - bandit -r apps/api/
    - semgrep --config=auto

  code-quality:
    - eslint apps/website/src/
    - tsc --noEmit

  tests:
    - vitest run (Frontend-Unit-Tests)
    - pytest apps/api/ (Backend-Tests)
```

---

## 13. UX/UI und Designsystem

### 13.1 Designsystem-Grundlage

**Farbpalette (Brand-konform, VERIFIZIERT):**

| Token | Wert | Verwendung |
|---|---|---|
| `primary-600` | `#dc2626` | Hauptfarbe, CTAs, aktive States |
| `primary-700` | `#c01010` | Hover-States |
| `primary-800` | `#9b1313` | Active-States |
| `primary-50` | `#fff5f5` | Hintergründe, Highlights |
| Brand Gradient | `135deg, #b91c1c → #dc2626 → #ea580c` | Hero, Banner |
| `secondary-900` | `#0f172a` | Footer-Hintergrund, dunkle UI |
| `secondary-600` | `#475569` | Bodytext |

**Logo-Einsatz:**
- Primär: `/public/logo.jpg` (JPEG, quadratisch)
- NavBar: Kreisförmig zugeschnitten (40×40 px, ring-Effekt)
- Hero: Quadratisch mit rounded-3xl (176×176 px)
- Footer: Kreisförmig zugeschnitten (48×48 px)
- Login: Brand-Panel links (128×128 px, rounded-3xl)
- Favicon: 📋 Aus Logo extrahieren (32×32 ICO + 180×180 PNG)
- SVG-Version: 📋 Empfohlen für skalierbare Darstellung
- Dark-Mode-Variante: 📋 Weißer Hintergrund oder Logo invertieren

### 13.2 Umgesetzte Verbesserungen

| Bereich | Verbesserung | Status |
|---|---|---|
| NavBar | Logo-Bild + „Verein"-Label + Dropdown | ✅ Umgesetzt |
| Home Hero | Full-width Brand-Gradient, Logo prominent, Stats-Bar | ✅ Umgesetzt |
| Login-Seite | Split-Layout: Brand-Panel + Formular, Passwort-Toggle | ✅ Umgesetzt |
| AuthLayout | Brand-Panel links, mobile Header | ✅ Umgesetzt |
| DashboardLayout | Sidebar-Navigation (Mitglieder/Admin getrennt) | ✅ Umgesetzt |
| PublicLayout/Footer | 3-spaltig, dunkel, Logo, Kontakt | ✅ Umgesetzt |
| Brand-Farben | Primärfarbe → Rot (#dc2626) statt Blau | ✅ Umgesetzt |

### 13.3 Ausstehende UI-Verbesserungen

| Bereich | Empfehlung | Priorität |
|---|---|---|
| Admin-Dashboard | Mock-Daten durch echte API-Calls ersetzen | P0 |
| Member-Dashboard | Mock-Profil durch echte Mitgliederdaten | P0 |
| Join-Seite | E-Mail-Verifizierungsschritt hinzufügen | P1 |
| Favicon | SVG/ICO aus Logo generieren | P1 |
| Dark Mode | System-Präferenz respektieren | P2 |
| Zugänglichkeit | WCAG AA: Farbkontraste prüfen (rot-auf-weiß ≥ 4.5:1) | P1 |

---

## 14. Mitgliederbereich

### 14.1 Aktueller Zustand

| Feature | Status |
|---|---|
| Profil anzeigen | ✅ Implementiert (API-Anbindung) |
| Dashboard (XP, Badges, Aktivitäten) | ⚠️ Mock-Daten |
| Datenschutzeinstellungen | ✅ Implementiert |
| Löschantrag (DSGVO Art. 17) | ✅ Implementiert |
| Onboarding | ✅ Implementiert |
| Forum-Verlinkung | ❌ Fehlt |
| Webgame-Integration | ❌ Fehlt |
| Voting-Integration | ❌ Fehlt |

### 14.2 Empfohlene Erweiterungen

```typescript
// Empfohlene API-Endpunkte (FastAPI) für Mitgliederbereich
GET  /api/member/profile          → Vollständiges Profil
PUT  /api/member/profile          → Profil aktualisieren
GET  /api/member/dashboard        → XP, Level, Badges, Aktivitäten
GET  /api/member/events           → Kommende Veranstaltungen
POST /api/member/game/progress    → Spielfortschritt speichern
GET  /api/member/forum/activity   → Forum-Aktivitäten
```

---

## 15. Rollenmodell

→ Vollständige RBAC-Matrix: [`docs/security/rbac.md`](../security/rbac.md)

**Kritischste Sofortmaßnahme:**

```python
# FastAPI: JWT-Claim-basierte Admin-Prüfung (P0)
# ERSETZT: VITE_ADMIN_EMAILS im Frontend (clientseitige Prüfung ist unsicher)

def get_current_role(token: str = Depends(oauth2_scheme)) -> str:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return payload.get("role", "member")

def require_role(*allowed_roles: str):
    def dependency(role: str = Depends(get_current_role)):
        if role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
    return Depends(dependency)

# Verwendung in Routen:
@router.get("/admin/members", dependencies=[require_role("admin", "sysadmin")])
```

---

## 16. Adminbereich

### 16.1 Navigationsstruktur (Empfohlen)

```
/admin
├── /dashboard          ← KPI-Übersicht (Echtdaten)
├── /members            ← Mitgliederliste + Filter + Export
│   └── /{id}          ← Einzelmitglied
├── /queue             ← Eingehende Anfragen (Beitritt, Support)
├── /finanzen
│   ├── /rechnungen    ← Offene/bezahlte Rechnungen
│   ├── /mahnungen     ← Mahnlauf
│   └── /sepa-export   ← SEPA-XML-Export
├── /events            ← Veranstaltungsverwaltung
├── /newsletter        ← Kampagnen + Segmentierung
├── /dsgvo             ← Löschanträge + Export-Anfragen
├── /reports           ← Berichte + KPI-Charts
├── /vorstand          ← Kassier/Vorstand-Dashboard
└── /settings          ← Plattformeinstellungen
```

### 16.2 Sicherheitsbarrieren

- Jede Admin-Route: Serverseitige Rollenvalidierung (P0)
- Sensible Aktionen (Löschen, SEPA-Export): Bestätigungsdialog + Audit-Log
- DSGVO-Löschung: 4-Augen-Prinzip empfohlen

---

## 17. Webgame-Integration

### 17.1 Aktueller Zustand

- Webgame existiert unter `apps/game/` ✅
- Kein SSO mit dem Hauptsystem ❓
- Keine Fortschritts-API im Backend erkennbar ❓
- Gamification-System (XP, Badges) in Member-Dashboard als Mock definiert ✅

### 17.2 Integrationsplan

| Aspekt | Empfehlung | Priorität |
|---|---|---|
| SSO | JWT-Token aus Hauptsystem im Game-Iframe nutzen | P1 |
| Fortschritt-API | `POST /api/member/game/progress` implementieren | P1 |
| XP-System | Echtzeit-XP-Updates nach Spielabschluss | P1 |
| Badge-Vergabe | Automatisch bei Meilensteinen (n8n-Workflow) | P2 |
| Design | Brand-Farben und Logo im Game konsistent | P1 |
| Entkopplung | Game als eigenständige App mit JWT-Auth | P2 |

---

## 18. Dokumentations-Zielstruktur

```
docs/
├── index.md                          ← Einstiegspunkt ✅
├── architecture/
│   ├── overview.md                   ← Systemübersicht ✅
│   ├── subdomain-matrix.md           ← Subdomain-Matrix ✅ (NEU)
│   ├── database.md                   ← Datenbankarchitektur
│   ├── target-architecture.md        ← Zielarchitektur
│   └── plattform-audit-2026.md       ← Dieses Dokument ✅ (NEU)
├── operations/
│   ├── mail-architecture.md          ← E-Mail-Architektur ✅ (NEU)
│   ├── monitoring-matrix.md          ← Monitoring-Matrix ✅ (NEU)
│   ├── backup-restore.md             ← Backup & Restore ✅
│   ├── deployment.md                 ← Deployment-Prozess ✅
│   └── incident-response.md         ← Incident Response ✅
├── security/
│   ├── rbac.md                       ← RBAC-Matrix ✅ (NEU)
│   ├── hardening.md                  ← Server-Härtung ✅
│   ├── secrets.md                    ← Secrets-Management
│   └── incident-response.md         ← Vorfallreaktion ✅
├── compliance/
│   ├── dsgvo.md                      ← DSGVO-Dokumentation ✅
│   └── audit-log.md                  ← Audit-Log-Richtlinien
└── media/
    └── brand-guidelines.md           ← Branding & Logo
```

---

## 19. Sofortmaßnahmen nach Priorität

### P0 – Kritisch (sofort umsetzen)

| # | Maßnahme | Bereich | Aufwand |
|---|---|---|---|
| 1 | Admin-Rollenprüfung ins FastAPI-Backend verlagern (JWT-Claims) | Security | Mittel |
| 2 | Plesk-Panel (Port 8443) auf IP-Whitelist einschränken | Security | Niedrig |
| 3 | SSH: Passwort-Authentifizierung deaktivieren | Security | Niedrig |
| 4 | Fail2ban für SSH, HTTP, SMTP aktivieren | Security | Mittel |
| 5 | SPF/DKIM/DMARC verifizieren und setzen | E-Mail | Niedrig |
| 6 | Uptime Kuma starten (Docker Compose vorhanden) | Monitoring | Niedrig |

### P1 – Hoch (zeitnah umsetzen)

| # | Maßnahme | Bereich | Aufwand |
|---|---|---|---|
| 7 | Admin-Dashboard mit echten API-Daten verbinden | Frontend | Hoch |
| 8 | Member-Dashboard mit echten API-Daten verbinden | Frontend | Hoch |
| 9 | E-Mail-Verifizierung bei Registrierung | Sicherheit/UX | Mittel |
| 10 | Backup-System und -Verifizierung dokumentieren | Betrieb | Niedrig |
| 11 | nginx Security Headers für alle Subdomains | Security | Niedrig |
| 12 | TLSv1.0/1.1 in Plesk deaktivieren | Security | Niedrig |
| 13 | Favicon aus Logo generieren | UX | Niedrig |

### P2 – Mittel

| # | Maßnahme | Bereich | Aufwand |
|---|---|---|---|
| 14 | Root-Verzeichnis aufräumen (50+ MD-Dateien konsolidieren) | Repo | Mittel |
| 15 | Nextcloud unter cloud.* aktivieren und konfigurieren | Infrastruktur | Hoch |
| 16 | Forum-Subdomain in Betrieb nehmen | Infrastruktur | Hoch |
| 17 | Webgame-SSO implementieren | Integration | Mittel |
| 18 | CODEOWNERS-Datei anlegen | Repo | Niedrig |
| 19 | Dark Mode implementieren | UX | Hoch |

### P3 – Niedrig

| # | Maßnahme | Bereich | Aufwand |
|---|---|---|---|
| 20 | SVG-Version des Logos erstellen | Branding | Mittel |
| 21 | Prometheus + Grafana vollständig konfigurieren | Monitoring | Hoch |
| 22 | ELK-Stack in Betrieb nehmen | Logging | Hoch |
| 23 | Drupal/CiviCRM-Dokumentation vervollständigen | Doku | Mittel |

---

## 20. Zielarchitektur

### Ist-Zustand
```
Internet → Single Server (5.183.217.146) → Plesk → [alle Dienste]
```

### Zielzustand (Containerisiert, Modular)

```
Internet
  │
  ▼
Cloudflare (CDN, WAF, DDoS-Schutz) [EMPFOHLEN]
  │
  ▼
nginx Reverse Proxy (Plesk oder dediziert)
  │
  ├── menschlichkeit-oesterreich.at ──→ React SPA (Vite/nginx, statisch)
  ├── api.* ──────────────────────────→ FastAPI (uvicorn, Docker)
  ├── crm.* ──────────────────────────→ Drupal+CiviCRM (PHP-FPM, Docker)
  ├── cloud.* ────────────────────────→ Nextcloud (Docker)
  ├── forum.* ────────────────────────→ Discourse (Docker)
  ├── vote.* ─────────────────────────→ Voting-App (Docker)
  ├── n8n.* ──────────────────────────→ n8n (Docker, intern)
  ├── monitor.* ──────────────────────→ Grafana (Docker, intern)
  └── status.* ───────────────────────→ Uptime Kuma (Docker, öffentlich)
  │
  ▼
MariaDB (getrennte DBs pro Dienst)
Redis (Session, Cache)
Nextcloud-Storage

[Backup → Externer S3-kompatibler Speicher]
[CI/CD → GitHub Actions → Plesk/Docker Deploy]
```

**Vergleich:**

| Aspekt | Ist-Zustand | Zielzustand |
|---|---|---|
| Hosting | Single-Server, Plesk | Single-Server, Plesk + Docker |
| Skalierung | Vertikal (RAM/CPU) | Vertikal + Container-Isolation |
| Deployment | rsync/Plesk | GitHub Actions → Docker |
| Monitoring | Noch nicht produktiv | Vollstack (Prometheus+Grafana+Kuma) |
| Security | Manuell | WAF (Cloudflare/ModSecurity) + Fail2ban |
| Mail | Plesk-Mailserver | Plesk + DKIM/SPF/DMARC vollständig |
| CDN | Keins | Cloudflare (empfohlen) |

---

## 21. Konkrete umzusetzende Artefakte

Die folgenden Dateien wurden in diesem Audit erstellt oder aktualisiert und sollten direkt im Repository verfügbar sein:

| Artefakt | Pfad | Status |
|---|---|---|
| Plattform-Audit-Dokument | `docs/architecture/plattform-audit-2026.md` | ✅ Erstellt |
| RBAC-Matrix | `docs/security/rbac.md` | ✅ Erstellt |
| Subdomain-Matrix | `docs/architecture/subdomain-matrix.md` | ✅ Erstellt |
| E-Mail-Architektur | `docs/operations/mail-architecture.md` | ✅ Erstellt |
| Monitoring-Matrix | `docs/operations/monitoring-matrix.md` | ✅ Erstellt |
| Brand-Farben (Tokens) | `figma-design-system/00_design-tokens.json` | ✅ Rot-Palette |
| Logo im Public-Verzeichnis | `apps/website/public/logo.jpg` | ✅ Eingebunden |
| NavBar mit Logo | `apps/website/src/components/NavBar.tsx` | ✅ Umgesetzt |
| AuthLayout (Brand-Panel) | `apps/website/src/layouts/AuthLayout.tsx` | ✅ Umgesetzt |
| Login-Seite (Split-Layout) | `apps/website/src/pages/Login.tsx` | ✅ Umgesetzt |
| DashboardLayout (Sidebar) | `apps/website/src/layouts/DashboardLayout.tsx` | ✅ Umgesetzt |
| PublicLayout (Footer) | `apps/website/src/layouts/PublicLayout.tsx` | ✅ Umgesetzt |
| Home-Seite (Brand-Hero) | `apps/website/src/pages/Home.tsx` | ✅ Umgesetzt |
| MariaDB-Backup-Skript | `scripts/mariadb-backup.sh` | 📋 Zu erstellen |
| nginx Security Headers | `scripts/nginx-security-headers.conf` | 📋 Zu erstellen |
| CODEOWNERS | `.github/CODEOWNERS` | 📋 Zu erstellen |
