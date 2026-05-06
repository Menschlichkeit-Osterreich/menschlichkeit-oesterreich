# 04 – E-Mail-Architektur

**Stand**: 2026-03-09

---

## Rollenstruktur (Soll-Zustand)

### Primäre Geschäftsadressen

| Adresse | Funktion | Typ | Quota | Status |
|---------|----------|-----|-------|--------|
| office@menschlichkeit-oesterreich.at | Hauptadresse, Geschäftsleitung | Mailbox | 5 GB | ✅ vorhanden |
| info@menschlichkeit-oesterreich.at | Allgemeine Anfragen | Mailbox | 2 GB | ✅ vorhanden |
| kontakt@menschlichkeit-oesterreich.at | Kontaktformular → Weiterleitung | Weiterleitung → office@ | – | ✅ vorhanden |

### System- und Automatisierungsadressen

| Adresse | Funktion | Typ | Quota | Status |
|---------|----------|-----|-------|--------|
| noreply@menschlichkeit-oesterreich.at | Transaktionsmails (Bestätigungen, Passwörter) | Mailbox (kein IMAP-Eingang) | 500 MB | ❌ fehlt – P1 |
| bounce@menschlichkeit-oesterreich.at | E-Mail-Bounce-Handling (DSN) | Mailbox + n8n-Webhook | 1 GB | ✅ vorhanden |
| automation@menschlichkeit-oesterreich.at | n8n SMTP-Versand | Mailbox | 1 GB | ❌ fehlt – P2 |
| civi@menschlichkeit-oesterreich.at | CiviCRM-Integration | Mailbox | 2 GB | ✅ vorhanden |

### Team-Rollenadressen

| Adresse | Funktion | Typ | Quota | Status |
|---------|----------|-----|-------|--------|
| support@menschlichkeit-oesterreich.at | Ticketing, Nutzerhilfe | Mailbox + Ticketing | 5 GB | ❌ fehlt – P1 |
| newsletter@menschlichkeit-oesterreich.at | Newsletter-Kampagnen | Mailbox | 2 GB | ❌ fehlt – P1 |
| security@menschlichkeit-oesterreich.at | Security-Disclosures, Vulnerability-Reports | Mailbox | 2 GB | ❌ fehlt – P1 |
| admin@menschlichkeit-oesterreich.at | System-Alerts, Monitoring | Mailbox | 2 GB | ❌ fehlt – P1 |
| devops@menschlichkeit-oesterreich.at | Ops-Benachrichtigungen | Weiterleitung → peter.schuller@ | – | ❌ fehlt – P2 |

### Persönliche Mailboxen

| Adresse | Funktion | Status |
|---------|----------|--------|
| peter.schuller@menschlichkeit-oesterreich.at | Persönliche Mailbox (Gründer/Admin) | ✅ vorhanden |

---

## E-Mail-Authentifizierung

### SPF (Sender Policy Framework)

```dns
; Empfohlener DNS-TXT-Eintrag für menschlichkeit-oesterreich.at:
@ IN TXT "v=spf1 mx a:menschlichkeit-oesterreich.at ip4:5.183.217.146 include:_spf.menschlichkeit-oesterreich.at ~all"

; Falls externe Newsletter-Dienste (z.B. Mailchimp, Brevo):
@ IN TXT "v=spf1 mx ip4:5.183.217.146 include:servers.mcsv.net ~all"
```

**Wichtig**: Maximal 10 DNS-Lookups in SPF erlaubt. Aktuell prüfen:
```bash
dig TXT menschlichkeit-oesterreich.at +short
```

### DKIM (DomainKeys Identified Mail)

```bash
# Via Plesk automatisch konfiguriert. Manuell prüfen:
dig TXT default._domainkey.menschlichkeit-oesterreich.at +short

# Empfohlener Schlüssel: 2048-bit RSA, Selector: default
# Rotation: jährlich oder bei Verdacht auf Kompromittierung
```

**DKIM-Eintrag (Beispielstruktur)**:
```dns
default._domainkey IN TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A..."
```

### DMARC (Domain-based Message Authentication)

**Aktuell empfohlen** (Monitoring-Phase → schrittweise verschärfen):

```dns
; Phase 1: Monitoring (sofort setzen)
_dmarc IN TXT "v=DMARC1; p=none; rua=mailto:dmarc-reports@menschlichkeit-oesterreich.at; ruf=mailto:dmarc-reports@menschlichkeit-oesterreich.at; fo=1; adkim=s; aspf=s"

; Phase 2: Quarantine (nach 30 Tagen, wenn Reports zeigen keine Fehler)
_dmarc IN TXT "v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc-reports@menschlichkeit-oesterreich.at; fo=1"

; Phase 3: Reject (nach 90 Tagen, volle Enforcement)
_dmarc IN TXT "v=DMARC1; p=reject; rua=mailto:dmarc-reports@menschlichkeit-oesterreich.at; fo=1"
```

---

## SMTP-Konfiguration (Plesk Postfix)

### Empfohlene Ports

| Port | Protokoll | Verschlüsselung | Verwendung |
|------|-----------|-----------------|------------|
| 587 | SUBMISSION | STARTTLS (erzwungen) | Outgoing (Clients, n8n, FastAPI) |
| 465 | SMTPS | TLS direkt | Alternative für Clients |
| 25 | SMTP | STARTTLS (opportunistisch) | MX-zu-MX (nicht für Clients) |

**Deaktivieren**: Plaintext SMTP auf Port 25 für externe Clients (nur MX-Relaying erlauben).

### Anti-Spam-Konfiguration (Plesk)

```
SpamAssassin:
  - Aktiviert: ja
  - Score-Threshold: 5.0
  - Aktion bei Score 5–10: Betreff-Tag [SPAM]
  - Aktion bei Score >10: Ablehnen (reject)
  - Bayes-Filter: aktiv
  - Auto-Learn: ja

Greylisting:
  - Aktiviert: ja
  - Wartezeit: 5 Minuten
  - Whitelist: bekannte Newsletter-Dienste, Google, Microsoft

Blocklisten (RBL):
  - zen.spamhaus.org
  - bl.spamcop.net
  - b.barracudacentral.org
```

---

## Bounce-Handling

```
bounce@menschlichkeit-oesterreich.at
  ↓
Plesk IMAP (abruf alle 5 Minuten)
  ↓
n8n Workflow: "Bounce-Handler"
  ↓
  ├─ Soft Bounce: CiviCRM → bounce_count++, bei >3 → deaktivieren
  ├─ Hard Bounce: CiviCRM → Kontakt auf "do_not_email" setzen
  └─ DSN-Report → Log + Alert an admin@
```

### n8n-Webhook für Bounce-Verarbeitung

```
Trigger: Cron (alle 5 min)
Aktion: IMAP-Read bounce@
Parse: RFC 5321 DSN-Nachrichten
Entscheidung:
  - "550 User unknown" → Hard Bounce
  - "452 Mailbox full" → Soft Bounce
  - "421 Try again" → Temporary Failure
Update: CiviCRM via REST API
```

---

## Routing-Matrix

```
Eingehend:
  office@        → Postfach office (Peter Schuller)
  info@          → Postfach info (Allgemein)
  kontakt@       → Weiterleitung → office@
  support@       → Support-Ticketing-System (Webhook/IMAP-Polling)
  security@      → Postfach security (Peter Schuller + GPG-verschlüsselt empfohlen)
  newsletter@    → Postfach newsletter (CiviCRM-gesteuert)
  bounce@        → Postfach bounce (n8n-Automatik)
  civi@          → CiviCRM IMAP-Integration
  admin@         → Postfach admin (Weiterleitung → devops@)
  devops@        → Weiterleitung → peter.schuller@

Ausgehend:
  Transaktionsmails (FastAPI):        noreply@
  Newsletter (CiviCRM):               newsletter@
  System-Alerts (n8n):                automation@
  CiviCRM-Prozesse:                   civi@
```

---

## Checkliste E-Mail-Setup

```
Sofort:
[ ] noreply@ anlegen (P1)
[ ] support@ anlegen (P1)
[ ] security@ anlegen (P1)
[ ] admin@ anlegen (P1)
[ ] newsletter@ anlegen (P1)

Diese Woche:
[ ] automation@ anlegen (P2)
[ ] devops@ anlegen (P2)
[ ] DMARC Phase 1 (p=none) setzen
[ ] SPF-Eintrag verifizieren (dig TXT)
[ ] DKIM verifizieren (dig TXT default._domainkey)

Diesen Monat:
[ ] DMARC-Reports analysieren (tools: dmarcanalyzer.com)
[ ] DMARC auf Phase 2 (p=quarantine) umstellen
[ ] Bounce-Handling n8n-Workflow konfigurieren
[ ] Anti-Spam-Konfiguration testen (mail-tester.com Score ≥9)

Nach 90 Tagen:
[ ] DMARC auf Phase 3 (p=reject) umstellen
[ ] Jährliche DKIM-Key-Rotation planen
```
