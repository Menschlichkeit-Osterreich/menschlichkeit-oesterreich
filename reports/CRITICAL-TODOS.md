# 🚨 Kritische TODOs – Priorisiert nach Dringlichkeit

**Stand:** 2025-10-18 22:00 Uhr  
**Quelle:** DNS-Checks, Mailbox-Audit, GPG-Implementation, PostgreSQL-Status, Secret-Audit-System

---

## 📋 Gesamtübersicht

**Status:** 1/11 abgeschlossen (9%)  
**Geschätzter Zeitaufwand (gesamt):** ~3-4 Stunden Hands-on + 1-2 Tage Provider-Response  
**Letzte Aktualisierung:** 18. Oktober 2025, 22:00 Uhr

### ✅ Erledigte Aufgaben (1/11)
- [x] **Task 9:** DNS-Tools erstellt und getestet (PowerShell-Scripts + Dokumentation)

### 🚀 Neue Aufgaben (seit 22:00)
- **Task 11:** Secret-Audit-System aktivieren (P1-HIGH) - 4 Dateien erstellt/aktualisiert

---

## 🔴 P0-KRITISCH (Sofort handeln!)

### 1. 📧 logging@ Mailbox archivieren (79% voll!)
**Status:** ⚠️ **197 MB / 250 MB (79% voll)** – Überlauf in ~2-3 Wochen  
**Impact:** Verlust neuer Logs, System-Alerts unzustellbar

**Sofort-Lösung:**
```powershell
# Option A: n8n Workflow (automatisiert)
# 1. n8n öffnen → Import Workflow:
automation/n8n/workflows/mail-archiver-logging.json

# 2. IMAP-Credentials konfigurieren (aus .env):
SMTP_HOST_LOGGING=mail.menschlichkeit-oesterreich.at
SMTP_USER_LOGGING=logging@menschlichkeit-oesterreich.at
SMTP_PASSWORD_LOGGING=<aus .env>

# 3. Workflow aktivieren (läuft täglich 03:00, archiviert ≥90 Tage)

# Option B: Manuell (Plesk Webmail)
# Plesk → Mail → logging@ → Webmail → Archive-Ordner → Download → Löschen
```

**Dokumentation:** `docs/operations/MAIL-ARCHIVIERUNG-LOGGING.md`

---

### 2. 🗄️ PostgreSQL starten (blockiert Dashboard + API)
**Status:** ❌ Connection refused Port 5432  
**Impact:** Dashboard, FastAPI Backend, alle DB-Features unverfügbar

**Lösungen (eine wählen):**
```powershell
# Option A: Lokalen Service starten (Windows)
# Services → postgresql-x64-15 → Start

# Option B: Remote-DB konfigurieren (.env)
DATABASE_URL=postgresql://user:pass@remote-host:5432/db

# Option C: Docker
docker-compose up -d postgres
```

**Nach DB-Start:**
```bash
python scripts/deploy-schema.py  # SQL-Schema deployen
```

**Blockiert:**
- FastAPI Backend (`api/app/routers/metrics.py`)
- Dashboard-UI (`frontend/src/components/Dashboard/`)
- n8n Dashboard-ETL-Workflow

---

## 🟠 P1-HIGH (Diese Woche erledigen)

### 3. 📬 6 kritische Mailboxen anlegen
**Fehlen für DNS/DMARC/TLS-RPT:**
- `dmarc@menschlichkeit-oesterreich.at` – DMARC Reports
- `tlsrpt@menschlichkeit-oesterreich.at` – TLS-RPT Reports
- `newsletter@menschlichkeit-oesterreich.at` – Newsletter-Absender
- `support@menschlichkeit-oesterreich.at` – Support-Tickets
- `no-reply@menschlichkeit-oesterreich.at` – Transaktional
- `admin@menschlichkeit-oesterreich.at` – Systemmeldungen

**Workflow (Plesk):**
1. Mail → Email Addresses → Create Email Address
2. Jeweils 250 MB Quota
3. SPF/DKIM für Domain aktiviert prüfen
4. Passwörter sicher speichern (`.env`)

**Dokumentation:** `docs/operations/MAILBOXEN-ERSTELLUNG-PLESK.md`

---

### 4. 🌐 5 fehlende DNS-Records setzen
**IST:** 5/10 DNS-Checks erfolgreich  
**Fehlen:**

```dns
# In Plesk DNS-Zone oder DNS-Provider eintragen:

1. _mta-sts.menschlichkeit-oesterreich.at.      3600 IN TXT "v=STSv1; id=20251018"
2. mta-sts.menschlichkeit-oesterreich.at.       3600 IN A   5.183.217.146
3. _smtp._tls.menschlichkeit-oesterreich.at.    3600 IN TXT "v=TLSRPTv1; rua=mailto:tlsrpt@menschlichkeit-oesterreich.at"
4. mail.menschlichkeit-oesterreich.at.          3600 IN A   5.183.217.146
5. menschlichkeit-oesterreich.at.               3600 IN CAA 0 issue "letsencrypt.org"
```

**MTA-STS Policy-Datei (nach Record 2):**
Datei: `https://mta-sts.menschlichkeit-oesterreich.at/.well-known/mta-sts.txt`
```
version: STSv1
mode: enforce
mx: mail.menschlichkeit-oesterreich.at
max_age: 86400
```

**Validierung:**
```powershell
.\tools\dns-check-all.ps1  # Ziel: 10/10 Checks
```

**⚠️ WICHTIG:** DMARC ist auf `p=reject` (sehr streng!)  
Bei E-Mail-Problemen auf `p=quarantine` zurücksetzen.

---

### 5. 🔐 GPG-Infrastruktur aktivieren
**Status:** 9 Dateien erstellt, nicht aktiviert

**Schritt 1: Scripts ausführbar machen**
```bash
chmod +x scripts/gpg/export-keys.sh
chmod +x scripts/gpg/verify-signature.sh
chmod +x .githooks/commit-msg
```

**Schritt 2: Git Hooks aktivieren**
```bash
git config core.hooksPath .githooks

# Test (sollte fehlschlagen):
git commit --allow-empty -m "test: unsigned"

# Korrekt (sollte funktionieren):
git commit -S --allow-empty -m "test: signed"
```

**Schritt 3: GitHub Secrets (für CI/CD)**
1. CI-Key generieren:
   ```bash
   gpg --quick-generate-key "CI Release Bot <ci@menschlichkeit-oesterreich.at>" ed25519 sign 2y
   FP=$(gpg --list-keys --with-colons "ci@" | awk -F: '/^fpr:/ {print $10; exit}')
   gpg --export-secret-keys -a "$FP" | clip  # Windows
   ```

2. GitHub → Settings → Secrets and variables → Actions:
   - `GPG_PRIVATE_KEY` = (aus Clipboard)
   - `GPG_KEY_ID` = (Fingerprint)
   - `GPG_PASSPHRASE` = (leer oder setzen)

3. Test:
   ```bash
   git tag v0.0.1-test
   git push --tags
   # → GitHub Actions sollte Release signieren
   ```

**Dokumentation:**
- `docs/security/GPG-KEYS.md` – Setup & Operation
- `docs/security/GPG-ONBOARDING.md` – 10-Min-Quickstart

---

## 🟡 P2-MEDIUM (Nächste 2 Wochen)

### 6. 📍 PTR-Record prüfen/setzen
**Reverse DNS:** 5.183.217.146 → mail.menschlichkeit-oesterreich.at

**Check:**
```powershell
Resolve-DnsName 5.183.217.146
# Sollte zurückgeben: mail.menschlichkeit-oesterreich.at
```

**Wenn fehlt:** Hosting-Provider/Plesk-Support kontaktieren (nur Provider kann PTR setzen).

**Impact:** Mail-Reputation, manche Empfänger lehnen Mails ohne PTR ab.

---

### 7. 🛡️ Blacklist-Check durchführen
**IP:** 5.183.217.146

**Prüfen bei:**
- https://check.spamhaus.org → IP eingeben
- https://mxtoolbox.com/blacklists.aspx → IP eingeben
- https://www.barracudacentral.org/lookups → IP eingeben

**Bei Listung:**
1. SPF/DKIM/DMARC/PTR validieren (`.\\tools\\dns-check-all.ps1`)
2. Offene Relays/Forwards ausschließen
3. Delisting-Prozess je Anbieter starten

---

## � P1-HIGH (Diese Woche erledigen)

### 3. 📧 6 kritische Mailboxen anlegen

[... bestehende Inhalte bleiben ...]

---

### 6. � Secret-Audit-System aktivieren (NEU!)
**Status:** ✅ Dateien erstellt, ⏳ Aktivierung pending  
**Priorität:** P1-HIGH  
**Zeitaufwand:** 30 Minuten  
**Impact:** Verhindert Secret-Leaks, DSGVO Art. 32 Compliance

**Beschreibung:**
Vollständiges Secret-Management-System wurde erstellt mit Audit-Template, automatischer Validierung und CI-Integration.

**Neue Dateien (erstellt 2025-10-18 22:00):**
```
✅ secrets/SECRETS-AUDIT.md (300+ Zeilen)
   └─ 10 Kategorien dokumentiert
   └─ Rotation-Schedule
   └─ Security Best Practices

✅ scripts/validate-secrets.py (200+ Zeilen)
   └─ Platzhalter-Detection
   └─ Format-Validierung (Regex)
   └─ Security-Rules (keine Prod-Keys in Dev)

✅ scripts/validate-secrets.ps1 (150+ Zeilen)
   └─ PowerShell-Äquivalent

✅ .github/workflows/validate-secrets.yml (aktualisiert)
   └─ CI-Integration für PRs
```

**Validierung (IST-Stand):**
```bash
# Python-Test (lokal):
python scripts/validate-secrets.py
# Ergebnis:
# ✅ 2/2 Pflicht-Variablen (DATABASE_URL, JWT_SECRET)
# ❌ 26 Platzhalter gefunden (YOUR_, CHANGE, EXAMPLE, GENERATE)
# Exit-Code: 2 (wie erwartet bei Template-Datei)

# PowerShell-Test:
.\scripts\validate-secrets.ps1
# Identisches Ergebnis (26 Fehler)
```

**Nächste Schritte:**
```powershell
# 1. Scripts ausführbar machen (WSL/Git Bash):
chmod +x scripts/validate-secrets.py

# 2. CI-Workflow testen:
git add secrets/SECRETS-AUDIT.md scripts/validate-secrets.* .github/workflows/validate-secrets.yml
git commit -m "feat(security): Add secret audit system with automated validation

- secrets/SECRETS-AUDIT.md: 10 Kategorien mit Rotation-Schedule
- scripts/validate-secrets.py: Automatische Validierung + Format-Checks
- scripts/validate-secrets.ps1: PowerShell-Äquivalent
- CI-Integration: Validiert .env.example in PRs

Prevents secret leaks, GDPR Art. 32 compliant
"
git push
# → GitHub Actions validiert .env.example

# 3. Produktionstest (wenn echte Secrets gesetzt):
cp .env .env.production
# <Platzhalter durch echte Werte ersetzen>
python scripts/validate-secrets.py --env production --file .env.production
# Expected: 0 Fehler
```

**Erfolgskriterien:**
- ✅ CI-Workflow läuft grün (validate-secrets.yml)
- ✅ .env.example hat keine echten Secrets
- ✅ Alle 10 Secret-Kategorien dokumentiert
- ✅ Rotation-Schedule eingehalten (90/180/365 Tage)

**Features:**
- 🔍 Automatische Platzhalter-Detection
- 📋 Dokumentiert Herkunft/Zweck/Rotation
- 🤖 CI-Integration (PRs blockieren bei Leak)
- ✅ DSGVO Art. 32 konform (TOMs)

**Dokumentation:**
- Audit: `secrets/SECRETS-AUDIT.md`
- Python: `python scripts/validate-secrets.py --help`
- PowerShell: `Get-Help .\scripts\validate-secrets.ps1`

---

### 7. 🔑 GPG-Infrastruktur aktivieren

[... bestehende Inhalte bleiben ...]

---

## 📊 Fortschritt-Dashboard

| Kategorie | Gesamt | Erledigt | Offen |
|-----------|--------|----------|-------|
| **P0-KRITISCH** | 2 | 0 | 2 ⚠️ |
| **P1-HIGH** | 6 | 0 | 6 |
| **P2-MEDIUM** | 2 | 0 | 2 |
| **P3-LOW** | 1 | 0 | 1 |
| **GESAMT** | 11 | 1 | 10 |

### Erfolge heute (18.10.2025):
- ✅ **09:00-18:00:** GPG-Sicherheits-Infrastruktur implementiert (9 Dateien)
- ✅ **18:00-21:00:** DNS-Infrastruktur komplett dokumentiert
- ✅ **21:00-21:30:** 3 PowerShell DNS-Check-Tools erstellt
- ✅ **21:30-22:00:** DNS IST-Zustand erfasst (5/10 funktionieren, 20/20 Subdomains OK)
- ✅ **22:00:** Secret-Audit-System implementiert (4 Dateien)

---

## 🎯 Empfohlene Reihenfolge (Quick Wins zuerst)

1. **JETZT:** `logging@` archivieren (n8n Workflow importieren, 10 Min)
2. **HEUTE:** PostgreSQL starten (3 Optionen, 5 Min)
3. **MORGEN:** 6 Mailboxen anlegen (Plesk, 30 Min)
4. **MORGEN:** DNS-Records setzen (5 Records, 20 Min)
5. **MORGEN:** GPG aktivieren (chmod + git config, 15 Min)
6. **DIESE WOCHE:** PTR-Record anfragen (Provider-Ticket)
7. **DIESE WOCHE:** Blacklist-Check (3 Links, 10 Min)

**Total Time Investment:** ~2-3 Stunden Hands-on + 1-2 Tage Provider-Response

---

**Automatisierte Reports:**
- `reports/dns/dns-check-*.json` – DNS-Validierung
- `reports/dns/subdomains-*.csv` – Subdomain-Status
- `reports/dns/dns-inventory-*.csv` – Komplett-Inventar

**Tools:**
- `.\tools\dns-check-all.ps1` – Kompletter DNS-Check
- `.\tools\dns-check-subdomains.ps1` – 20 Web-Subdomains
- `.\tools\dns-export-csv.ps1` – IST-Zustand nach CSV
