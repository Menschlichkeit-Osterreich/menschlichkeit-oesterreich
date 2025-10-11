---
title: "01 Emaildnssetup"
description: "E-Mail & DNS Infrastructure Setup"
lastUpdated: 2025-10-10
status: ACTIVE
category: infrastructure
tags: ['infrastructure', 'dsgvo']
version: "1.0.0"
language: de-AT
audience: ['DevOps Team', 'System Administrators']
---

---
description: E-Mail-Setup mit SPF/DKIM/DMARC/TLSRPT für Plesk-basierte Multi-Domain-Architektur
priority: high
category: email-infrastructure
execution_order: 1
requires: []
updates_todo: true
---

# E-Mail & DNS Infrastructure Setup

**Ziel:** DSGVO-konforme, deliverable E-Mail-Infrastruktur mit minimalen Postfächern und rollenbasierten Aliassen

**Ausführen mit:** Plesk UI + MCP Tools (GitHub für Secrets, Filesystem für Konfiguration)

---

## 📮 Phase 1: Postfach-Strategie (Ausführen: Plesk UI)

### Echte Postfächer (anlegen/behalten)

```yaml
mailboxes:
  - peter.schuller@menschlichkeit-oesterreich.at  # bestehend, Admin
  - info@menschlichkeit-oesterreich.at            # bestehend, Allgemein
  - support@menschlichkeit-oesterreich.at         # NEU: Primärer Reply-To/Tickets
  - civimail@menschlichkeit-oesterreich.at        # bestehend, CiviMail System
  - bounce@menschlichkeit-oesterreich.at          # bestehend, VERP/Bounces
  - logging@menschlichkeit-oesterreich.at         # bestehend, Logs/Alerts
  - dmarc@menschlichkeit-oesterreich.at           # NEU: DMARC Reports (RUA/RUF)
  - tlsrpt@menschlichkeit-oesterreich.at          # NEU: TLS Reports
```

**Action Items:**
- [ ] Plesk → Mail → Create Mailbox: `support@` (Quota: 10 GB)
- [ ] Plesk → Mail → Create Mailbox: `dmarc@` (Quota: 20 GB, hoher Traffic)
- [ ] Plesk → Mail → Create Mailbox: `tlsrpt@` (Quota: 5 GB)
- [ ] Verify: IMAP/SMTP Credentials für jedes neue Postfach testen

---

## 🔀 Phase 2: Alias-Matrix (Ausführen: Plesk UI + Filesystem MCP)

### Alias-Konfiguration (YAML)

```yaml
domain: menschlichkeit-oesterreich.at

aliases:
  # Pflicht/Tech (Provider-Requirements)
  abuse@:           [logging@, peter.schuller@]
  postmaster@:      [logging@, peter.schuller@]
  hostmaster@:      [logging@, peter.schuller@]
  webmaster@:       [logging@, peter.schuller@]
  admin@:           [logging@, peter.schuller@]
  administrator@:   [logging@, peter.schuller@]
  
  # Security & Compliance
  security@:        [peter.schuller@, logging@]  # VDP/Responsible Disclosure
  privacy@:         [peter.schuller@]            # DSGVO-Anfragen
  datenschutz@:     [peter.schuller@]            # Deutsche Variante
  legal@:           [peter.schuller@]            # Rechtliches
  
  # Operations (alle → support@ für Ticketing)
  newsletter@:      [support@]                   # Newsletter-Replies
  spenden@:         [support@]                   # Donation Inquiries
  mitgliedschaft@:  [support@]                   # Membership
  events@:          [support@]                   # Event-Anfragen
  presse@:          [support@]                   # Press Relations
  partners@:        [support@]                   # Partnerschaften
  volunteers@:      [support@]                   # Freiwillige
  
  # Finance/Backoffice
  finance@:         [support@]
  buchhaltung@:     [support@]
  receipts@:        [support@]
  quittungen@:      [support@]
  
  # No-Reply
  noreply@:         []  # Autoreply only, kein Forward
```

**Action Items:**
- [ ] Via Filesystem MCP: Speichern als `config-templates/email-aliases.yaml`
- [ ] Plesk → Mail → Email Aliases: Alle Aliasse gemäß YAML anlegen
- [ ] Test: E-Mail an jeden Alias senden, Zustellung prüfen

**MCP Command:**
```bash

# Via Filesystem MCP
"Create file config-templates/email-aliases.yaml with alias configuration"
```

---

## 🌐 Phase 3: DNS Records (Ausführen: Plesk DNS + GitHub MCP)

### Hauptdomain: menschlichkeit-oesterreich.at

**SPF Record:**
```dns
@     IN TXT "v=spf1 a mx ip4:IP_TX -all"
```

**DKIM Record (Transactional):**
```dns
tx2025q4._domainkey   IN TXT "v=DKIM1; k=rsa; p=PASTE_2048BIT_PUBKEY"
```

**DMARC Record (Phase 1: quarantine):**
```dns
_dmarc IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@menschlichkeit-oesterreich.at; ruf=mailto:dmarc@menschlichkeit-oesterreich.at; fo=1; pct=100; adkim=s; aspf=s"
```

**TLS Reporting:**
```dns
_smtp._tls IN TXT "v=TLSRPTv1; rua=mailto:tlsrpt@menschlichkeit-oesterreich.at"
```

**BIMI (Optional, nach DMARC=reject):**
```dns
default._bimi IN TXT "v=BIMI1; l=https://media.menschlichkeit-oesterreich.at/brand/bimi.svg; a=https://media.menschlichkeit-oesterreich.at/brand/vmc.pem"
```

### Subdomain: newsletter.menschlichkeit-oesterreich.at

**SPF Record:**
```dns
newsletter IN TXT "v=spf1 a:newsletter.menschlichkeit-oesterreich.at ip4:IP_NEWS -all"
```

**DKIM Record (Bulk/CiviMail):**
```dns
news2025q4._domainkey.newsletter IN TXT "v=DKIM1; k=rsa; p=PASTE_2048BIT_PUBKEY"
```

**DMARC Record:**
```dns
_dmarc.newsletter IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@menschlichkeit-oesterreich.at; fo=1; pct=100; adkim=s; aspf=s"
```

**Action Items:**
- [ ] DKIM Keypair generieren (2048-bit RSA): `openssl genrsa -out tx2025q4.pem 2048`
- [ ] Public Key extrahieren: `openssl rsa -in tx2025q4.pem -pubout -outform der | base64 -w0`
- [ ] Plesk → DNS → Add TXT Records (alle obigen Records)
- [ ] GitHub MCP: Private Keys in Secrets speichern (`DKIM_TX_PRIVATE_KEY`, `DKIM_NEWS_PRIVATE_KEY`)
- [ ] Validation: `dig TXT _dmarc.menschlichkeit-oesterreich.at`, `dig TXT tx2025q4._domainkey.menschlichkeit-oesterreich.at`

**MCP Commands:**
```bash

# Via GitHub MCP
"Create repository secret DKIM_TX_PRIVATE_KEY with value from tx2025q4.pem"
"Create repository secret DKIM_NEWS_PRIVATE_KEY with value from news2025q4.pem"

# Via Terminal
openssl genrsa -out /tmp/tx2025q4.pem 2048
openssl rsa -in /tmp/tx2025q4.pem -pubout -outform der | base64 -w0
```

---

## 📧 Phase 4: CiviMail/CiviCRM Konfiguration (Ausführen: CRM Settings)

### Bulk Absender (Newsletter)

```yaml
From: "Menschlichkeit Österreich" <newsletter@newsletter.menschlichkeit-oesterreich.at>
Envelope-From: bounce@menschlichkeit-oesterreich.at  # VERP aktiv
Reply-To: support@menschlichkeit-oesterreich.at
List-Unsubscribe: <mailto:unsubscribe@menschlichkeit-oesterreich.at>, <https://newsletter.menschlichkeit-oesterreich.at/unsubscribe?m={{message_id}}>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

### Transactional Mail

```yaml
From: noreply@menschlichkeit-oesterreich.at
Reply-To: support@menschlichkeit-oesterreich.at
Return-Path: bounce@menschlichkeit-oesterreich.at
```

### Bounce Handling

```yaml
Hard Bounces: sofort sperren
Soft Bounces: 3-5 Versuche → Pause/Prüfung
VERP Pattern: von CiviMail generiert
Catch-all: bounce@ akzeptiert alle VERP-Varianten
```

**Action Items:**
- [ ] CiviCRM → Administer → CiviMail → From Email Addresses: `newsletter@newsletter.menschlichkeit-oesterreich.at`
- [ ] CiviCRM → Administer → CiviMail → Bounce Processing: Return-Path = `bounce@menschlichkeit-oesterreich.at`
- [ ] CiviCRM → Administer → CiviMail → VERP aktivieren
- [ ] CiviCRM → Administer → CiviMail → List-Unsubscribe Header aktivieren
- [ ] Test: Testmailing an Gmail/Outlook senden, Header prüfen

---

## 🤖 Phase 5: Autoreplies & SLAs (Ausführen: Plesk Autoresponder)

### abuse@/postmaster@ Autoreply

```text
Betreff: Re: Ihre Meldung an {alias}@menschlichkeit-oesterreich.at

Sehr geehrte Damen und Herren,

vielen Dank für Ihre Meldung. Wir prüfen Ihr Anliegen innerhalb von 24 Stunden 
und melden uns umgehend bei Ihnen.

Mit freundlichen Grüßen
IT-Team – Menschlichkeit Österreich

---
Interne SLA: Triage < 8 Std, Abschluss < 72 Std
```

### security@ Autoreply (VDP)

```text
Betreff: Re: Sicherheitsmeldung

Sehr geehrte/r Sicherheitsforscher/in,

vielen Dank für Ihre verantwortungsvolle Meldung (Responsible Disclosure).
Unser Security-Team bestätigt den Eingang innerhalb von 24 Stunden.

Bitte veröffentlichen Sie keine Details (CVE/Public Disclosure) vor unserer 
ausdrücklichen Freigabe.

Mit bestem Dank
Security Team – Menschlichkeit Österreich
```

### noreply@ Autoreply

```text
Betreff: Re: Ihre Nachricht an noreply@

Diese Mailbox wird nicht gelesen. Bitte wenden Sie sich an:
support@menschlichkeit-oesterreich.at

Mit freundlichen Grüßen
Menschlichkeit Österreich
```

**Action Items:**
- [ ] Plesk → Mail → abuse@ → Autoresponder: Text einfügen, aktivieren
- [ ] Plesk → Mail → postmaster@ → Autoresponder: Text einfügen, aktivieren
- [ ] Plesk → Mail → security@ → Autoresponder: VDP-Text einfügen
- [ ] Plesk → Mail → noreply@ → Autoresponder: Text einfügen
- [ ] Test: E-Mail an jeden Alias senden, Autoreply prüfen

---

## ✅ Phase 6: Smoke Tests (Ausführen: Manual + MCP Tools)

### Deliverability Tests

```bash

# Via Brave Search MCP
"Search for mail-tester.com best practices"

# Manual Tests
1. mail-tester.com: Score ≥ 9/10
2. Gmail Test: Zustellung im Inbox (nicht Spam)
3. Outlook Test: Zustellung im Inbox
4. GMX Test: Zustellung im Inbox
5. Authentication-Results Header prüfen:
   - SPF: pass
   - DKIM: pass
   - DMARC: pass
```

**Action Items:**
- [ ] Testmail an test@mail-tester.com senden, Score prüfen
- [ ] Testmail an Gmail/Outlook/GMX, Spam-Ordner prüfen
- [ ] Authentication-Results Header in empfangenen Mails validieren
- [ ] DMARC Reports bei dmarc@ nach 24-48h prüfen
- [ ] TLS Reports bei tlsrpt@ nach 24-48h prüfen

### DMARC Monitoring

```bash

# Nach 24-48 Stunden
- dmarc@ Postfach checken
- Reports parsen (via dmarcian.com oder parsedmarc)
- Failures analysieren
- Nach 30 Tagen fehlerfreier Reports: DMARC auf p=reject anheben
```

**Action Items:**
- [ ] Tag 2: DMARC RUA bei dmarc@ prüfen
- [ ] Tag 7: DMARC RUF (Failure Reports) analysieren
- [ ] Tag 30: Wenn 100% Pass → DMARC auf `p=reject` umstellen
- [ ] Tag 60: BIMI-Record aktivieren (optional)

---

## 🔄 Phase 7: Maintenance & Rotation (Ausführen: Quartalsweise)

### DKIM Key Rotation

```bash

# Alle 6 Monate (z.B. Q1/Q3)
1. Neuen Keypair generieren: tx2025q1, tx2025q3, etc.
2. Neuen Public Key in DNS publizieren
3. 48h warten (DNS-Propagation)
4. Alten Selector deaktivieren
5. Alte Private Keys löschen (nach 90 Tagen Retention)
```

**Action Items:**
- [ ] Q1 2025: Neue DKIM Keys generieren und rotieren
- [ ] Q3 2025: Neue DKIM Keys generieren und rotieren
- [ ] GitHub Secrets: Alte Keys nach 90 Tagen löschen

---

## 📊 Metriken & SLAs

| Metrik | Ziel | Messung |
|--------|------|---------|
| DMARC Pass Rate | ≥ 99% | dmarcian.com |
| Mail-Tester Score | ≥ 9/10 | mail-tester.com |
| Spam-Beschwerderate | < 0.1% | CiviMail Reports |
| Bounce Rate | < 2% | CiviMail Reports |
| Autoreply SLA | < 1 Min | Plesk Logs |
| Security Response | < 24h | Manual Tracking |
| DSGVO Response | < 30 Tage | CRM Ticketing |

---

## 🔗 Abhängigkeiten

**Benötigt von:**
- `02_DatabaseRollout_DE.prompt.md` (CiviCRM DB für Bounce-Handling)
- `03_DeploymentPipeline_DE.prompt.md` (Secrets Management)

**Triggert:**
- TODO.md Update: "E-Mail Infrastructure Setup abgeschlossen"
- Quality Gates: DSGVO Compliance Check

---

## 📝 TODO Updates

Bei erfolgreicher Ausführung dieser Prompt wird automatisch TODO.md aktualisiert:
- [ ] E-Mail-Postfächer angelegt (support@, dmarc@, tlsrpt@)
- [ ] Aliasse konfiguriert (alle rollenbasierten Adressen)
- [ ] DNS Records publiziert (SPF, DKIM, DMARC, TLSRPT)
- [ ] CiviMail konfiguriert (From, Reply-To, Bounce, List-Unsubscribe)
- [ ] Autoreplies aktiviert (abuse@, security@, noreply@)
- [ ] Smoke Tests bestanden (mail-tester ≥ 9/10)
- [ ] Tag 30: DMARC auf p=reject umgestellt (pending)
- [ ] Tag 60: BIMI aktiviert (optional, pending)

**Next Prompt:** `02_DatabaseRollout_DE.prompt.md`
