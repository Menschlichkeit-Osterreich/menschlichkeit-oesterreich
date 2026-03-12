# E-Mail-Architektur – Menschlichkeit Österreich

**Version:** 1.0 | **Domain:** menschlichkeit-oesterreich.at

---

## Mailbox- und Alias-Matrix

| Adresse | Typ | Zweck | Empfänger | Quota | 2FA | Hinweis |
|---|---|---|---|---|---|---|
| `office@` | Postfach | Hauptkontakt, Vorstand | Vorstand (Verteiler) | 2 GB | ✅ | Primäre Vereinsadresse |
| `info@` | Postfach / Alias | Allgemeine Anfragen | → office@ | 500 MB | — | Alias auf office@ |
| `kontakt@` | Alias | Kontaktformular Website | → office@ | — | — | Reiner Alias |
| `support@` | Postfach | Helpdesk-Tickets | Support-Team | 2 GB | ✅ | Für Ticket-System |
| `security@` | Postfach | Sicherheitsmeldungen | Sysadmin | 500 MB | ✅ | Nicht weiterleiten |
| `newsletter@` | Postfach | Newsletter-Versand | n8n / CiviCRM | 1 GB | ✅ | Nur Outbound-SMTP |
| `noreply@` | Alias | Transaktionale Mails | — (Blackhole) | — | — | Antworten ablehnen |
| `admin@` | Alias | Systembenachrichtigungen | → office@ | — | — | Alias auf office@ |
| `bounce@` | Postfach | SMTP-Bounce-Handling | CiviCRM / n8n | 500 MB | — | Automatisch verarbeitet |
| `civi@` | Postfach | CiviCRM-Mailverarbeitung | CiviCRM | 1 GB | — | Nur CiviCRM-Zugriff |
| `peter.schuller@` | Postfach | Persönliches Konto | Persönlich | 5 GB | ✅ | Personenbezogen |

---

## Rollenstruktur

```
Funktionsbezogen (keine Personen, DSGVO-konform):
├── office@       ← Hauptadresse Verein
├── info@         ← Öffentlicher Kontakt (→ office@)
├── kontakt@      ← Website-Kontaktformular (→ office@)
├── support@      ← Helpdesk-Tickets
├── security@     ← Sicherheitsmeldungen (isoliert)
├── newsletter@   ← Outbound-Newsletter
├── noreply@      ← Kein Reply-Handling
├── admin@        ← Systembenachrichtigungen (→ office@)
├── bounce@       ← Bounce-Verarbeitung (CiviCRM)
└── civi@         ← CiviCRM-interne Verarbeitung

Personenbezogen:
└── peter.schuller@  ← Persönliches Konto (Vorstands-Rolle)
```

---

## E-Mail-Authentifizierungskonfiguration

### SPF (Sender Policy Framework)

```dns
menschlichkeit-oesterreich.at. IN TXT "v=spf1 ip4:5.183.217.146 include:_spf.plesk.com -all"
```

**Erklärung:**
- `ip4:5.183.217.146` — Plesk-Server autorisiert
- `include:_spf.plesk.com` — Plesk-SMTP autorisiert
- `-all` — Alle anderen Quellen ablehnen (HARD FAIL)

### DKIM (DomainKeys Identified Mail)

Zu konfigurieren in Plesk → Mail → DKIM:
- Schlüssellänge: **2048 Bit** (nicht 1024)
- Selektor: `default` oder `plesk`
- Rotation: alle **12 Monate**

### DMARC

```dns
_dmarc.menschlichkeit-oesterreich.at. IN TXT \
  "v=DMARC1; p=quarantine; \
   rua=mailto:security@menschlichkeit-oesterreich.at; \
   ruf=mailto:security@menschlichkeit-oesterreich.at; \
   fo=1; adkim=s; aspf=s; pct=100; ri=86400"
```

**Rollout-Empfehlung:**
1. `p=none` (Monitor-Modus, 2 Wochen)
2. `p=quarantine; pct=25` (Graduell, 2 Wochen)
3. `p=quarantine; pct=100` (Voll aktiv)
4. `p=reject; pct=100` (Zielzustand)

---

## SMTP-Sicherheitskonfiguration

| Parameter | Empfehlung | Begründung |
|---|---|---|
| Port 25 eingehend | Offen (Mailserver) | MX-Empfang |
| Port 587 (SUBMISSION) | AUTH erforderlich | Client-Versand mit STARTTLS |
| Port 465 (SMTPS) | TLS direkt | Alternative zu 587 |
| Port 110 (POP3) | Deaktivieren | Kein TLS-Support |
| Port 143 (IMAP) | STARTTLS erzwingen | Standard |
| Port 993 (IMAPS) | TLS direkt | Bevorzugt |
| Relay | Nur für authentifizierte Nutzer | Kein Open Relay |
| TLS-Mindestversion | TLSv1.2 | TLSv1.0/1.1 deaktivieren |
| DKIM-Signierung | Alle ausgehenden Mails | Pflicht |
| SPF-Prüfung | Eingehend prüfen | Fail2ban-Integration |

---

## Bounce-Handling

- `bounce@` empfängt alle SMTP-Bounces
- CiviCRM verarbeitet Bounces automatisch via IMAP
- Hard Bounces: Kontakt wird deaktiviert
- Soft Bounces (3×): Kontakt zur Überprüfung markiert
- n8n-Workflow `mail-archiver-logging.json` protokolliert alle Bounces

---

## Anti-Spam-Maßnahmen

| Maßnahme | Status | Priorität |
|---|---|---|
| SPF konfiguriert | ⚠️ Prüfen | P0 |
| DKIM aktiviert | ⚠️ Prüfen | P0 |
| DMARC konfiguriert | ⚠️ Prüfen | P0 |
| Greylisting (Plesk) | 📋 Empfohlen | P1 |
| SpamAssassin (Plesk) | 📋 Empfohlen | P1 |
| Fail2ban für SMTP | 📋 Empfohlen | P1 |
| DNSBL-Blacklists | 📋 Empfohlen | P1 |
| Rate Limiting Newsletter | 📋 Empfohlen | P2 |

---

## Offene Prüffragen

1. Ist DKIM für `menschlichkeit-oesterreich.at` in Plesk aktiviert?
2. Ist SPF korrekt als TXT-Record gesetzt?
3. Ist DMARC-Reporting auf `security@` konfiguriert?
4. Werden `bounce@`-Mails korrekt von CiviCRM verarbeitet?
5. Ist Port 25 durch Fail2ban geschützt?
