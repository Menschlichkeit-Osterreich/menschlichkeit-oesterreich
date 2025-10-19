# 📬 Mailboxen-Erstellung: 8 fehlende Mailboxen (Plesk)

**Status:** P1-HIGH  
**Deadline:** KW 43/2025 (bis 25.10.2025)  
**Referenz:** `docs/ENV-DEPLOYMENT-MAIL-STANDARD.md` (Abschnitt 3.2)

---

## 📋 Übersicht: Fehlende Mailboxen

| # | E-Mail-Adresse | Zweck | Quota | Weiterleitung |
|---|----------------|-------|-------|---------------|
| 1 | `newsletter@menschlichkeit-oesterreich.at` | Newsletter-Versand (n8n Double-Opt-In) | 250 MB | n8n Webhook |
| 2 | `support@menschlichkeit-oesterreich.at` | Mitglieder-Support, Anfragen | 250 MB | board@ (CC) |
| 3 | `no-reply@menschlichkeit-oesterreich.at` | System-Mails (keine Antworten erwartet) | 100 MB | /dev/null |
| 4 | `admin@menschlichkeit-oesterreich.at` | Technische Admin-Mails (Server-Alerts) | 250 MB | devops@ |
| 5 | `devops@menschlichkeit-oesterreich.at` | CI/CD-Pipelines, Deployment-Logs | 500 MB | - |
| 6 | `board@menschlichkeit-oesterreich.at` | Vorstand-Kommunikation (intern) | 250 MB | - |
| 7 | `kassier@menschlichkeit-oesterreich.at` | Finanz-/Buchhaltungs-Mails (Stripe, Rechnungen) | 250 MB | - |
| 8 | `fundraising@menschlichkeit-oesterreich.at` | Spendenaktionen, Kampagnen | 250 MB | board@ (BCC) |

**Gesamt-Quota:** 2.350 MB (≈2,3 GB)

---

## 🛠️ Schritt-für-Schritt-Anleitung (Plesk)

### Voraussetzungen

- [x] **Plesk-Zugang:** https://5.183.217.146:8443 (SSH-Tunnel erforderlich)
- [x] **Credentials:** Siehe `.env` → `REMOTE_USER_plesk_prod` + `REMOTE_PASSWORD_plesk_prod`
- [x] **Domain:** `menschlichkeit-oesterreich.at` (verifiziert, SSL aktiv)

---

### 1. SSH-Tunnel aufbauen (Windows PowerShell)

```powershell
# Terminal öffnen (PowerShell)
cd D:\Arbeitsverzeichniss\menschlichkeit-oesterreich-development

# .env laden (dotenv-vault)
npx dotenv-vault@latest pull

# SSH-Tunnel starten (Port 8443 → Plesk Webinterface)
ssh -L 8443:localhost:8443 $env:REMOTE_USER_plesk_prod@5.183.217.146 -i $env:SSH_KEY_PATH_PLESK

# Ausgabe: "Local forwarding listening on 127.0.0.1:8443"
# Browser öffnen: https://localhost:8443
```

**Alternative (ohne Tunnel):** Direkt via https://5.183.217.146:8443 (SSL-Warnung akzeptieren)

---

### 2. Plesk-Login

1. **URL:** https://localhost:8443 (oder https://5.183.217.146:8443)
2. **Username:** (aus `.env` → `REMOTE_USER_plesk_prod`)
3. **Password:** (aus `.env` → `REMOTE_PASSWORD_plesk_prod`)
4. **Login** → Plesk-Dashboard erscheint

---

### 3. Mailbox erstellen (Beispiel: `newsletter@…`)

**Navigation:**

1. **Mail** (linkes Menü)
2. **Mailboxen** (Tab)
3. **Mailbox hinzufügen** (Button oben rechts)

**Formular ausfüllen:**

- **E-Mail-Adresse:** `newsletter`
- **Domain:** `menschlichkeit-oesterreich.at` (Dropdown)
- **Passwort:** Starkes Passwort generieren (20+ Zeichen)
  - **Empfehlung:** `pwgen -sy 24 1` (Linux) oder Bitwarden Password Generator
  - **Speichern in:** `.env` → `SMTP_PASSWORD_NEWSLETTER`
- **Mailbox-Quota:** `250 MB` (Standard)
- **Zugriff auf Control Panel:** Deaktiviert (nur SMTP/IMAP)

**Erweiterte Einstellungen (optional):**

- **Weiterleitung:**
  - Aktivieren: Ja
  - Ziel: (siehe Tabelle oben, z.B. `webhook@n8n.menschlichkeit-oesterreich.at`)
- **Automatische Antwort:** Deaktiviert
- **IMAP:** Aktiviert (Port 993, SSL)
- **SMTP:** Aktiviert (Port 587, STARTTLS)

**Speichern** → Mailbox wird erstellt

---

### 4. Credentials in `.env` speichern

**PowerShell (lokal):**

```powershell
# .env öffnen (VS Code)
code D:\Arbeitsverzeichniss\menschlichkeit-oesterreich-development\.env

# Eintrag hinzufügen (Beispiel):
SMTP_HOST_NEWSLETTER=menschlichkeit-oesterreich.at
SMTP_PORT_NEWSLETTER=587
SMTP_USER_NEWSLETTER=newsletter@menschlichkeit-oesterreich.at
SMTP_PASSWORD_NEWSLETTER=<GENERIERTES_PASSWORT>
SMTP_FROM_NEWSLETTER=newsletter@menschlichkeit-oesterreich.at

IMAP_HOST_NEWSLETTER=menschlichkeit-oesterreich.at
IMAP_PORT_NEWSLETTER=993
IMAP_USER_NEWSLETTER=newsletter@menschlichkeit-oesterreich.at
IMAP_PASSWORD_NEWSLETTER=<GENERIERTES_PASSWORT>

# Speichern
# dotenv-vault aktualisieren:
npx dotenv-vault@latest push
```

---

### 5. Vorgang wiederholen (7x weitere Mailboxen)

**Checkliste:**

- [ ] `newsletter@menschlichkeit-oesterreich.at` → Quota 250 MB, Weiterleitung n8n Webhook
- [ ] `support@menschlichkeit-oesterreich.at` → Quota 250 MB, CC an board@
- [ ] `no-reply@menschlichkeit-oesterreich.at` → Quota 100 MB, keine Weiterleitung
- [ ] `admin@menschlichkeit-oesterreich.at` → Quota 250 MB, Weiterleitung devops@
- [ ] `devops@menschlichkeit-oesterreich.at` → Quota 500 MB, keine Weiterleitung
- [ ] `board@menschlichkeit-oesterreich.at` → Quota 250 MB, keine Weiterleitung
- [ ] `kassier@menschlichkeit-oesterreich.at` → Quota 250 MB, keine Weiterleitung
- [ ] `fundraising@menschlichkeit-oesterreich.at` → Quota 250 MB, BCC an board@

**Zeitaufwand:** ~5-7 Minuten pro Mailbox = **40-55 Minuten gesamt**

---

## 🧪 Funktionstest (nach Erstellung)

### Test 1: SMTP-Versand (PowerShell)

```powershell
# swaks installieren (falls nicht vorhanden):
# https://github.com/jetmore/swaks
# Oder: Chocolatey: choco install swaks

# Test-Mail versenden (Beispiel: newsletter@):
swaks --to peter@menschlichkeit-oesterreich.at `
      --from newsletter@menschlichkeit-oesterreich.at `
      --server menschlichkeit-oesterreich.at:587 `
      --auth LOGIN `
      --auth-user newsletter@menschlichkeit-oesterreich.at `
      --auth-password "$env:SMTP_PASSWORD_NEWSLETTER" `
      --tls `
      --header "Subject: Test: Newsletter-Mailbox" `
      --body "Diese Mail wurde automatisch generiert (swaks)."

# Erwartete Ausgabe:
# -> 250 2.0.0 OK: queued as ABC123
```

### Test 2: IMAP-Zugriff (Thunderbird/Outlook)

1. **Konto hinzufügen**
2. **Server:** `menschlichkeit-oesterreich.at`
3. **IMAP-Port:** `993` (SSL)
4. **SMTP-Port:** `587` (STARTTLS)
5. **User:** `newsletter@menschlichkeit-oesterreich.at`
6. **Passwort:** (aus `.env`)
7. **Verbindung testen** → Erfolgreich ✅

---

## 🔒 Sicherheitsmaßnahmen

### SPF-Record aktualisieren (DNS)

**Plesk → Domains → menschlichkeit-oesterreich.at → DNS-Einstellungen:**

```dns
; Aktueller SPF (Beispiel):
menschlichkeit-oesterreich.at. IN TXT "v=spf1 mx a ip4:5.183.217.146 include:_spf.google.com ~all"

; Kein Update erforderlich (Server-IP bereits enthalten)
```

### DKIM aktivieren (Plesk)

1. **Mail** → **Mail-Server-Einstellungen**
2. **DKIM-Signierung:** Aktivieren
3. **Selector:** `default`
4. **Key-Länge:** `2048 Bit`
5. **Apply** → DNS-Record automatisch erstellt

**Prüfung (DNS-Lookup):**

```powershell
nslookup -type=TXT default._domainkey.menschlichkeit-oesterreich.at
```

### DMARC-Policy setzen (DNS)

**Plesk → DNS-Einstellungen → TXT-Record hinzufügen:**

```dns
_dmarc.menschlichkeit-oesterreich.at. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@menschlichkeit-oesterreich.at; ruf=mailto:dmarc-failures@menschlichkeit-oesterreich.at; fo=1"
```

---

## 📊 Monitoring

### Plesk: Quota-Überwachung

**Mail → Mailboxen → Quota-Übersicht** (visuell)

**Automatisierung (n8n):**

```javascript
// n8n Workflow: Täglich 06:00 Uhr
// Node: HTTP Request → Plesk API
GET https://5.183.217.146:8443/api/v2/mail

// Response:
{
  "mailboxes": [
    {
      "email": "newsletter@menschlichkeit-oesterreich.at",
      "quota_used_mb": 23,
      "quota_total_mb": 250,
      "quota_percentage": 9.2
    },
    // ...
  ]
}

// Alert bei quota_percentage > 80%
```

---

## ✅ Definition of Done (DoD)

- [ ] **Alle 8 Mailboxen in Plesk erstellt**
- [ ] **Credentials in `.env` gespeichert** (SMTP_* + IMAP_*)
- [ ] **dotenv-vault aktualisiert** (`npx dotenv-vault push`)
- [ ] **Funktionstest SMTP** (swaks) → Erfolgreich
- [ ] **Funktionstest IMAP** (Thunderbird) → Erfolgreich
- [ ] **SPF/DKIM/DMARC aktiv** (DNS-Records geprüft)
- [ ] **Weiterleitungen konfiguriert** (siehe Tabelle oben)
- [ ] **Quota-Monitoring aktiv** (n8n Workflow oder manuell)
- [ ] **Dokumentation aktualisiert** (`docs/ENV-DEPLOYMENT-MAIL-STANDARD.md`)
- [ ] **Issue #XYZ geschlossen** (GitHub)

---

## 🔗 Referenzen

- **ENV-Standard:** `docs/ENV-DEPLOYMENT-MAIL-STANDARD.md` (Abschnitt 3: Mailboxen)
- **Plesk-Zugang:** `.env` → `REMOTE_USER_plesk_prod`, `REMOTE_PASSWORD_plesk_prod`
- **dotenv-vault:** `npx dotenv-vault@latest pull/push`
- **swaks:** https://github.com/jetmore/swaks (SMTP-Test-Tool)

---

**Erstellt:** 2025-10-18  
**Verantwortlich:** DevOps (Peter Schuller)  
**Nächster Review:** Nach Erstellung aller 8 Mailboxen
