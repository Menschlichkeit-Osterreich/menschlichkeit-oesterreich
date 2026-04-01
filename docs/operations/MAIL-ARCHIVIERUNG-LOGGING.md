# 📧 Mail-Archivierung: logging@menschlichkeit-oesterreich.at

**Status:** P0-CRITICAL  
**Quota:** 197 MB / 250 MB (79% voll)  
**Risiko:** Überlauf in ~2-3 Wochen bei normaler Nutzung

---

## 🚨 Sofortmaßnahme (Manuelle Archivierung via Plesk)

### Option 1: Plesk Webmail (schnell, ≤5 Minuten)

1. **Login:** https://menschlichkeit-oesterreich.at:8443 (Plesk-Panel)
2. **Mail** → **Mailboxen** → `logging@menschlichkeit-oesterreich.at`
3. **Webmail öffnen** (Roundcube oder Horde)
4. **Filter anwenden:**
   - Datum: Älter als 90 Tage (vor 18. Juli 2025)
   - Ordner: INBOX
5. **Alle auswählen** → **Verschieben nach → Archive** (Ordner erstellen, falls nicht vorhanden)
6. **Archive-Ordner:** Rechtsklick → **Als .zip herunterladen**
7. **Lokal speichern:** `D:\Backups\mail-archive-logging-2025-10-18.zip`
8. **Archive-Ordner leeren** (Nachrichten löschen)
9. **Papierkorb leeren**

**Erwartete Einsparung:** ~100-120 MB (≈50-60% Reduktion)

---

### Option 2: IMAP-Client (Thunderbird, Outlook)

1. **Konto hinzufügen:**
   - Server: `menschlichkeit-oesterreich.at`
   - Port: 993 (IMAP/SSL)
   - User: `logging@menschlichkeit-oesterreich.at`
   - Passwort: (aus `.env` → `SMTP_PASSWORD_LOGGING`)
2. **Ordner synchronisieren** (erstes Mal dauert 2-5 Minuten)
3. **Suchfilter:**
   - "Empfangsdatum ist vor 18.07.2025"
   - Ordner: INBOX
4. **Alle markieren** → **Archivieren** (Thunderbird: Taste `A`)
5. **Archiv-Ordner exportieren:**
   - Rechtsklick → **Exportieren als .mbox**
   - Speichern: `D:\Backups\mail-archive-logging-2025-10-18.mbox`
6. **Archiv-Ordner auf Server löschen**

---

## 🤖 Automatisierung (n8n Workflow - EMPFOHLEN)

### Workflow importieren

```bash
# Terminal (PowerShell)
cd D:\Arbeitsverzeichniss\menschlichkeit-oesterreich
npm run n8n:start

# Browser: http://localhost:5678
# Workflows → Import from File
# Datei: automation/n8n/workflows/mail-archiver-logging.json
```

### Workflow-Konfiguration

**Credentials anlegen:**

1. **n8n-Panel** → **Credentials** → **New Credential** → **IMAP**
2. **Name:** `logging@menschlichkeit-oesterreich.at`
3. **Host:** `menschlichkeit-oesterreich.at`
4. **Port:** `993`
5. **User:** `logging@menschlichkeit-oesterreich.at`
6. **Password:** (aus `.env` → `SMTP_PASSWORD_LOGGING`)
7. **SSL/TLS:** Aktiviert
8. **Save**

**Workflow aktivieren:**

1. **Workflow öffnen:** "📧 Mail-Archivierung: logging@…"
2. **Nodes prüfen:**
   - ✅ Trigger: Täglich 03:00 Uhr
   - ✅ Filter: Älter als 90 Tage
   - ✅ Speichern: `archive/YYYY/MM/message-id.eml`
   - ✅ IMAP: Nachricht löschen
3. **Execute Workflow** (Testlauf)
4. **Activate** (Slider oben rechts)

**Archiv-Speicherort:**

```
automation/n8n/data/
├── archive/
│   ├── 2025/
│   │   ├── 01/
│   │   ├── 02/
│   │   ├── ...
│   │   └── 10/
│   │       ├── msg-abc123.eml
│   │       ├── msg-def456.eml
│   │       └── ...
```

**Backup-Strategie:**

- **Täglich:** n8n archiviert Mails ≥90 Tage
- **Wöchentlich:** `archive/` nach ELK-Stack kopieren (Langzeitarchiv)
- **Monatlich:** Alte Monate komprimieren (`7z a archive-2025-01.7z archive/2025/01/`)

---

## 📊 Monitoring

### Quota überwachen (manuell)

**Plesk:**

1. **Mail** → **Mailboxen**
2. **logging@…** → Quota-Balken (visuell)
3. **Details** → Exakte MB-Angabe

**Ziel:** Quota dauerhaft < 150 MB (≤60%)

---

### n8n Webhook-Report

**Automatisch nach jedem Archivierunglauf:**

```bash
# Webhook-URL (in n8n konfiguriert):
POST https://n8n.menschlichkeit-oesterreich.at/webhook/mail-archive-report

# Payload:
{
  "archived_count": 237,
  "mailbox": "logging@menschlichkeit-oesterreich.at",
  "timestamp": "2025-10-18T03:00:15.342Z"
}
```

**Einbindung in Monitoring:**

- ELK-Stack: Webhook-Logs nach Elasticsearch indexieren
- Alert: Bei `archived_count > 500` → Slack/E-Mail-Benachrichtigung

---

## ✅ Checkliste (Sofortmaßnahme)

- [ ] **1. Plesk-Login** (5.183.217.146:8443)
- [ ] **2. Webmail öffnen** (logging@…)
- [ ] **3. Filter: ≥90 Tage** (vor 18.07.2025)
- [ ] **4. Verschieben → Archive**
- [ ] **5. Archive als .zip herunterladen**
- [ ] **6. Lokale Sicherung:** `D:\Backups\mail-archive-logging-2025-10-18.zip`
- [ ] **7. Archive-Ordner auf Server leeren**
- [ ] **8. Papierkorb leeren**
- [ ] **9. Quota prüfen:** Soll < 150 MB
- [ ] **10. n8n Workflow importieren** (automation/n8n/workflows/mail-archiver-logging.json)
- [ ] **11. Credentials konfigurieren**
- [ ] **12. Workflow aktivieren**
- [ ] **13. Testlauf durchführen**
- [ ] **14. Monitoring: Webhook-Report prüfen**

---

## 🔗 Referenzen

- **ENV-Standard:** `docs/ENV-DEPLOYMENT-MAIL-STANDARD.md` (Mailbox-Inventory)
- **n8n Workflow:** `automation/n8n/workflows/mail-archiver-logging.json`
- **SMTP-Credentials:** `.env` → `SMTP_PASSWORD_LOGGING` (via dotenv-vault)
- **Plesk-Zugang:** SSH 5.183.217.146 (User: siehe `.env` → `REMOTE_USER_plesk_prod`)

---

**Erstellt:** 2025-10-18  
**Nächste Review:** 2025-11-15 (monatlich Quota prüfen)  
**Verantwortlich:** DevOps (Peter Schuller)
