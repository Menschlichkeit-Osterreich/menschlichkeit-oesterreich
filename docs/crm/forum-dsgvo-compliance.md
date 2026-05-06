# DSGVO-Compliance: Forum (phpBB)

**Bezug**: Issue #174 – DSGVO-Compliance: Cookie-Banner, Datenexport, Anonymisierung
**Stand**: 2026-03-10

---

## 1. Cookie-Banner / Einwilligung

### phpBB-Extension: "Cookie Consent"

```
ACP → Erweiterungen → Neue Erweiterung → "phpBB Cookie Consent"
Alternativ: phpBB Erweiterungsdatenbank → "GDPR Cookie Consent"

Konfiguration:
  - Kategorien: Notwendig (immer aktiv), Analytik (optional), Präferenzen (optional)
  - Notwendig: phpBB Session-Cookie (phpbb3_[hash]_u, phpbb3_[hash]_k, phpbb3_[hash]_sid)
  - Analytik: Nur wenn Matomo/Plausible eingebunden → Opt-in erforderlich
  - Kein Google Analytics ohne explizite Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
```

### Erforderliche Cookie-Informationen (phpBB)

| Cookie-Name | Typ | Zweck | Lebensdauer | Rechtsgrundlage |
|-------------|-----|-------|-------------|-----------------|
| `phpbb3_*_u` | Sitzung | Benutzer-ID | Sitzungsende | Art. 6 Abs. 1 lit. b DSGVO |
| `phpbb3_*_k` | Persistent | "Angemeldet bleiben" | 1 Jahr | Einwilligung |
| `phpbb3_*_sid` | Sitzung | Session-Management | Sitzungsende | Art. 6 Abs. 1 lit. b DSGVO |

---

## 2. Datenschutzerklärung (Pflichtinhalt)

Im phpBB-Forum muss eine DSGVO-konforme Datenschutzerklärung verlinkt sein:

**ACP → Allgemein → Boardkonfiguration → Datenschutzrichtlinie**

Inhalte (Art. 13, 14 DSGVO):
- Verantwortlicher: Menschlichkeit Österreich, [Adresse]
- Verarbeitete Daten: Benutzername, E-Mail, IP-Adresse, Posts, Nachrichten
- Zweck: Community-Betrieb, Spam-Schutz
- Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung für registrierte Nutzer)
- Empfänger: keine Weitergabe an Dritte
- Speicherdauer: bis zur Kontoschließung + 30 Tage Puffer
- Betroffenenrechte: Auskunft, Berichtigung, Löschung, Einschränkung, Datenportabilität, Widerspruch
- Beschwerderecht: Österreichische Datenschutzbehörde (dsb.gv.at)
- Kontakt: datenschutz@menschlichkeit-oesterreich.at

---

## 3. Datenexport (Recht auf Datenportabilität, Art. 20 DSGVO)

### n8n-Workflow: Datenexport-Anfrage

```json
// Trigger: E-Mail an datenschutz@ oder Webformular
// Workflow: right-to-erasure.json (bereits vorhanden – für Forum erweitern)

// Export-Inhalt für Forum-User:
{
  "benutzer": { "name", "email", "registrierungsdatum" },
  "beitraege": [ { "datum", "thema", "inhalt" } ],
  "nachrichten": [ { "datum", "empfänger", "inhalt" } ],
  "anmeldedaten": [ { "datum", "ip_anonymisiert" } ]
}
```

### phpBB-Bordmittel (phpBB 3.3+):

```
ACP → Benutzer → DSGVO-Daten → Benutzer-Export
→ Generiert ZIP mit Benutzer-Daten in strukturiertem Format
→ Max. 30 Tage Bearbeitungsfrist (Art. 12 DSGVO)
```

---

## 4. Anonymisierung / Recht auf Löschung (Art. 17 DSGVO)

### Sofortmaßnahme: phpBB-Benutzer anonymisieren

```php
// phpBB-Admin: ACP → Benutzer → Benutzer verwalten → [User] → Löschen
// Option: "Beiträge des Benutzers behalten (anonymisiert)"
// → Benutzername: [Gelöscht] | E-Mail: [entfernt] | Avatar: gelöscht
// → Beiträge bleiben für Lesbarkeit erhalten (Anonymität gewahrt)
```

### n8n Right-to-Erasure Workflow (erweitern für Forum):

```
Bestehender Workflow: right-to-erasure.json

Ergänzung für phpBB:
1. phpBB-User-ID über E-Mail ermitteln (DB-Query)
2. phpBB Admin-API oder direkte DB-Anonymisierung:
   UPDATE phpbb_users SET username='[Gelöscht]', user_email='deleted_[ID]@example.invalid',
   user_password='', user_avatar='', user_sig='' WHERE user_id=[ID];
3. Privat-Nachrichten löschen: DELETE FROM phpbb_privmsgs WHERE ...
4. Sitzungen löschen: DELETE FROM phpbb_sessions WHERE ...
5. IP-Adressen aus phpbb_log bereinigen
6. Bestätigungs-E-Mail senden (Art. 12 Abs. 1 DSGVO: Löschbestätigung)
```

---

## 5. IP-Adress-Anonymisierung

```
phpBB speichert IPs standardmäßig für 3 Monate.
DSGVO-konforme Einstellung:

ACP → Allgemein → Server-Einstellungen → IP-Validierung:
  IP-Protokollierung: auf Minimum reduzieren
  Log-Dauer: 7 Tage (dann automatisch bereinigen via Cron)

Optional: IP-Anonymisierung via .htaccess + mod_remoteip (letztes Oktett)
```

### Cron-Job: IP-Logs bereinigen

```bash
# phpBB IP-Logs nach 7 Tagen bereinigen:
# Zu phpBB-Cron in ACP → Allgemein → Aufgabenplaner hinzufügen:
# Aufgabe: "IP-Log bereinigen" – täglich
# SQL: DELETE FROM phpbb_log WHERE log_time < UNIX_TIMESTAMP() - 604800;
```

---

## 6. Minderjährigenschutz

```
ACP → Registrierung:
  Mindestalter: 16 (DSGVO Art. 8 – in Österreich: 14 Jahre)
  Bestätigung: "Ich bin mindestens 14 Jahre alt"
  Elterliche Einwilligung: Für unter 14-Jährige (in AT) erforderlich
```

---

## 7. Verarbeitungsverzeichnis-Eintrag (Art. 30 DSGVO)

| Feld | Wert |
|------|------|
| Verarbeitung | Community-Forum |
| Zweck | Demokratische Beteiligung, Community-Management |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. b (Vertragserfüllung) |
| Datenkategorien | Pseudonyme Nutzerdaten, Posts, IP-Adressen |
| Empfänger | Keine externen Empfänger |
| Speicherdauer | Kontolaufzeit + 30 Tage nach Löschantrag |
| Drittlandtransfer | Keiner (Server in AT/EU) |
| TOM | TLS, Passwort-Hashing (bcrypt), Fail2ban |

---

## 8. Checkliste DSGVO-Forum

```
Rechtliches:
[ ] Datenschutzerklärung (Forum-spezifisch) im ACP hinterlegt
[ ] Verarbeitungsverzeichnis um "Forum" ergänzt
[ ] Cookie-Banner konfiguriert (notwendige Cookies klar deklariert)
[ ] Mindestalter 14 Jahre in Registrierung gesetzt
[ ] Datenschutzbeauftragter / Kontaktadresse hinterlegt

Technisch:
[ ] IP-Protokollierung auf 7 Tage reduziert
[ ] Automatischer IP-Lösch-Cron aktiv
[ ] Datenexport-Funktion (ACP) getestet
[ ] Right-to-Erasure n8n-Workflow auf phpBB ausgeweitet
[ ] Anonymisierter Löschvorgang getestet
[ ] /install/-Verzeichnis gelöscht
[ ] Keine externen CDN-URLs (Google Fonts etc.) ohne Einwilligung

Prozesse:
[ ] Bearbeitungszeit für DSGVO-Anfragen: max. 30 Tage (Art. 12)
[ ] E-Mail-Adresse für DSGVO-Anfragen: datenschutz@menschlichkeit-oesterreich.at
[ ] Löschbestätigung via E-Mail an Betroffene
```
