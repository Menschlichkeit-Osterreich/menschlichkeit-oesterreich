---
title: DSGVO-Compliance – Datenschutz im Verein (Österreich)
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: critical
category: core
applyTo: 'apps/**,automation/**,scripts/**'
---

# DSGVO-Compliance – Datenschutz im Verein (Österreich)

Diese Anweisung bündelt alle datenschutzrelevanten Vorgaben für den Verein „Menschlichkeit Österreich“ (ZVR 1182213083) und operationalisiert Statuten § 16 in Einklang mit DSGVO und DSG. Alle Beispiele sind in österreichischer Praxis verankert und berücksichtigen BAO-Aufbewahrungspflichten.

Bezug: `Pdf/Statuten Verein Menschlichkeit Österreich 2025 neu.pdf` (insb. § 16 Datenschutz) und zugehörige PDF-Unterlagen.

## 🔒 Rechtliche Grundlagen

- DSGVO (EU 2016/679) – Datenschutz-Grundverordnung
- DSG (Österreich) – Datenschutzgesetz
- TKG 2003 § 107 – Elektronische Kommunikation (Newsletter/Telefon/SMS)
- BAO § 132 – 7-jährige Aufbewahrung von Buchhaltungsunterlagen
- Vereinsgesetz 2002 – Rahmen für Vereinsbetrieb

### Statuten § 16 – Kernaussagen

- Zweckbindung: Verarbeitung nur für Mitgliederverwaltung, Beitragseinhebung, Information über Vereinstätigkeiten, Rechte/Pflichten, gesetzliche Meldepflichten.
- Weitergabe: Nur bei gesetzlicher Verpflichtung, zur Erfüllung von Vereins-/gesetzlichen Aufgaben oder bei ausdrücklicher Zustimmung der betroffenen Person.
- Schutzmaßnahmen: Technisch-organisatorische Maßnahmen (TOMs) gegen unbefugten Zugriff, Verlust, Missbrauch; DSGVO-/DSG-konforme Verarbeitung.

## 📊 Verarbeitete Datenarten, Rechtsgrundlagen, Fristen

### 1) Mitgliederdaten – Art. 6 Abs. 1 lit. b DSGVO (Vertrag/Mitgliedschaft)

Pflichtdaten: Name, Adresse, Geburtsdatum, E-Mail; optional: Telefon. Mitgliedschaftsdaten: Mitgliedsart (ordentlich/außerordentlich/ehren), Beitrittsdatum, Status, Beitragskategorie, Zahlungsart.

- Speicherdauer: während der Mitgliedschaft; nach Austritt weitere 12 Monate für Nachweis-/Abwicklungszwecke; anschließend Löschung bzw. Pseudonymisierung, soweit keine gesetzlichen Pflichten entgegenstehen.

### 2) Finanz-/Beitragsdaten – Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)

Beitragszahlungen, Spendenquittungen, Buchungsbelege.

- Speicherdauer: 7 Jahre gem. BAO § 132 (danach Löschung/Anonymisierung).

### 3) Kommunikation/Newsletter – Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) iVm TKG § 107

Einwilligungen für Newsletter/Veranstaltungsinfos; Präferenzen/Kanäle (E-Mail/SMS/Post).

- Speicherdauer: bis Widerruf; bei Widerruf unverzügliche Löschung/Austragung.

### 4) Aktivitäts-/Engagementdaten – Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)

Teilnahmen an Veranstaltungen, Projekten, Gamification-/XP-Daten – nur soweit erforderlich und verhältnismäßig; regelmäßig prüfen und minimieren.

- Speicherdauer: während Mitgliedschaft; nach Austritt Anonymisierung (Entfernung des Personenbezugs).

## 🧭 Betroffenenrechte (Kapitel III DSGVO) – Vereinbarte Workflows

Alle Fristen: grundsätzlich 30 Tage ab Eingang (verlängerbar um 60 Tage bei Komplexität; Betroffene informieren). Identität prüfen (angemessene Mittel, z. B. E-Mail-Bestätigung oder Ausweisnachweis bei Sensibilitäten).

### Art. 15 – Auskunft

1. Identitätsprüfung; 2. Export aus CRM/API (JSON/PDF, maschinenlesbar + menschenlesbar); 3. Versand binnen 30 Tagen; 4. kostenlos bei Erstbegehren. Inhalt: Datenkategorien, Zwecke, Empfänger, Speicherdauer, Herkunft, automatisierte Entscheidungen (falls vorhanden), Hinweis auf weitere Rechte.

API-Beispiel (dokumentarisch):

```text
POST /api/v1/members/{member_id}/gdpr/export
{
  "request_type": "data_access",
  "format": "pdf",
  "language": "de"
}
```

### Art. 16 – Berichtigung

Unverzügliche Korrektur unrichtiger personenbezogener Daten; Audit-Log der Änderung führen. Bestätigung an neue Kontaktadresse senden.

### Art. 17 – Löschung

„Recht auf Vergessenwerden“ unter Beachtung von Ausnahmen:

- Finanzdaten: 7 Jahre Aufbewahrung (BAO) – vor Ablauf nur Pseudonymisierung zulässig.
- Mitgliederdaten nach Austritt: 12 Monate (organisatorische Nachläufe/Ansprüche); danach löschen/pseudonymisieren, sofern keine Rechtsansprüche bestehen.
- Newsletter-/Marketingdaten: sofort löschen bei Widerruf/Widerspruch.

Protokolliere: Was wurde wann wo gelöscht/pseudonymisiert; in Backups als „zur Löschung markiert“ dokumentieren, automatische Löschung beim Backup-Rollover sicherstellen.

### Art. 18 – Einschränkung

Bei Streit über Richtigkeit/Erforderlichkeit Verarbeitung kennzeichnen („restricted“), Verarbeitung auf Speicherung/Notwendiges beschränken; keine Direktwerbung.

### Art. 20 – Datenübertragbarkeit

Strukturierter, gängiger, maschinenlesbarer Export (JSON/CSV) sowie optional PDF als Lesekopie; Metadaten mit Verantwortlichenangabe und Gültigkeit (Download-Link max. 7 Tage).

### Art. 21 – Widerspruch

Gegen Verarbeitung zu Zwecken der Direktwerbung stets möglich ⇒ unmittelbare Austragung aus Newsletterlisten/Marketing; reine Vereinsverwaltung (z. B. Beitragsvorschreibung) bleibt unberührt.

## 🔐 Technische & Organisatorische Maßnahmen (TOM)

### Zugangskontrolle (RBAC & MFA)

- Rollen: Vorstand (Vollzugriff), Kassier\*in (Finanz + eigene Kontakte), Mitglied (eigene Daten).
- MFA verpflichtend für Administrationskonten; starke Passwörter (≥ 12 Zeichen, Komplexität), Rotation alle 90 Tage für Admins; kein Passwort-Sharing.

### Übertragungskontrolle

- TLS 1.3 für Web, APIs und E-Mail (STARTTLS); DB-Zugriffe nur via VPN/SSH-Tunnel; SFTP statt FTP; keine unverschlüsselten Anhänge mit PII.

### Speicherkontrolle

- Verschlüsselung „at rest“: Datenbank (pgcrypto), Dateispeicher (LUKS/dm-crypt), Backups (GPG).
- Backupplan: täglich inkrementell, wöchentlich Vollbackup, monatlich Archiv; sichere Schlüsselverwaltung (siehe `secrets/`).

### Integrität & Protokollierung

- Audit-Logs für Zugriffe/Änderungen (SELECT/INSERT/UPDATE/DELETE), Login-Versuche, Rollenänderungen; Aufbewahrung 90 Tage; regelmäßige Kontrollen (quartalsweise intern, jährlich extern möglich).

### Datenminimierung & Privacy by Default

- Nur erforderliche Felder erfassen; regelmäßige Review der Pflichtfelder und Formulare (Mitgliederaufnahme); Voreinstellungen möglichst restriktiv (z. B. keine vorangekreuzten Einwilligungen).

## 🧩 Umsetzung – Systemnahe Hinweise (CiviCRM, PostgreSQL, n8n)

### CiviCRM – Berechtigungen (Beispiel)

```text
administrator: [alle]
vorstand:
  - access CiviCRM
  - view all contacts
  - edit all contacts
  - access CiviContribute
  - view contributions
  - edit contributions
kassier:
  - access CiviCRM
  - view own contact
  - edit own contact
  - access CiviContribute
  - view contributions
  - edit contributions
member:
  - access CiviCRM
  - view own contact
  - edit own contact
```

### PostgreSQL – Beispiel Verschlüsselung sensibler Felder

```text
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Beispiel: IBAN verschlüsseln (nur wenn überhaupt gespeichert; vermeiden, wenn möglich)
ALTER TABLE civicrm_contact ADD COLUMN iban_encrypted BYTEA;
UPDATE civicrm_contact
SET iban_encrypted = pgp_sym_encrypt(iban, '[ENCRYPTION_KEY]')
WHERE iban IS NOT NULL;

-- Entschlüsselung bei Bedarf (rollenbasiert absichern!)
SELECT display_name,
       pgp_sym_decrypt(iban_encrypted, '[ENCRYPTION_KEY]') AS iban
FROM civicrm_contact
WHERE id = 123;
```

### n8n – Austragung/Opt-out (Widerspruch/Widerruf)

- Trigger auf CRM-Flag „no_marketing = true“ ⇒ Flows zum Entfernen aus Verteilerlisten.
- Double-Opt-Out-Bestätigung an Mitglied versenden; Logs speichern (Zeitpunkt/IP).

## 📜 Datenschutzerklärung (Website – Muster)

Kurzfassung – vollständigen Text unter „Website/Privacy“ pflegen und veröffentlichen.

```bash
# DATENSCHUTZERKLÄRUNG
Verein Menschlichkeit Österreich (ZVR 1182213083)

1. Verantwortlicher
Menschlichkeit Österreich, Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn
E-Mail: datenschutz@menschlichkeit-oesterreich.at

2. Verarbeitete Daten
- Bei Beitritt: Name, Adresse, Geburtsdatum, E-Mail, Mitgliedsart, Beitrag
- Website: IP, Browserdaten, aufgerufene Seiten (nur technisch notwendige Cookies)
- Newsletter: E-Mail-Adresse, Präferenzen (mit Einwilligung)

3. Rechtsgrundlagen
Art. 6 Abs. 1 lit. b (Mitgliedschaft), lit. c (rechtliche Pflichten), lit. a (Einwilligung), lit. f (berechtigtes Interesse).

4. Speicherdauern
Mitgliederdaten: während Mitgliedschaft + 1 Jahr; Finanzdaten: 7 Jahre; Newsletter: bis Widerruf; Server-Logs: max. 90 Tage.

5. Weitergabe
Nur bei gesetzlicher Verpflichtung, zur Erfüllung von Vereinsaufgaben, oder mit Einwilligung; Auftragsverarbeiter mit AVV.

6. Ihre Rechte
Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch, Beschwerde (dsb.gv.at).

7. Cookies
Nur technisch notwendige Cookies (Session/CSRF/Sprachpräferenz). Keine Drittanbieter-Tracking-Cookies.

8. Sicherheit
HTTPS/TLS, Zugriffsschutz, Verschlüsselung, Backups, Protokollierung.

Stand: [DATUM], Version: 1.0
```

## 🚨 Datenpannen-Prozess (Art. 33/34 DSGVO)

Definition: Verlust/Diebstahl/Unbefugter Zugriff auf personenbezogene Daten, Fehlversand, Ransomware usw.

72-Stunden-Workflow:

1. Eindämmung: System isolieren, Passwörter ändern, Lücke schließen.
2. Dokumentation: Zeitpunkt, Art/Umfang, betroffene Datentypen/Personenzahl, Risiken, Maßnahmen.
3. Meldung an DSB binnen 72h (bei Risiko): dsb@dsb.gv.at inkl. Beschreibung, Kategorien, Anzahl, Kontakt, Folgen, Maßnahmen.
4. Information Betroffener (bei hohem Risiko): klare Sprache, was/ welche Daten/ Maßnahmen/ Handlungsempfehlungen, Kontakt.

## ✅ Regelmäßige Checks & Audits

Monatlich:

- Audit-Logs prüfen (ungewöhnliche Zugriffe?).
- Backup-Status und Entschlüsselbarkeit testen.
- Zertifikate/HTTPS und Security-Header prüfen.
- Opt-in/Opt-out-Prozesse funktionieren (n8n-Flows)?

Jährlich:

- Datenschutz-Folgenabschätzung (DSFA), falls erforderlich (umfangreiche neue Prozesse/Technologien/sensible Daten).
- Rollen & Berechtigungen-Review (Least Privilege).
- Schulung/Refresher für Funktionsträger\*innen.

## 🔗 Referenzen & Quellen

- DSGVO Volltext: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- DSG Österreich: https://www.ris.bka.gv.at
- Datenschutzbehörde: https://www.dsb.gv.at
- Statuten § 16: `Pdf/Statuten Verein Menschlichkeit Österreich 2025 neu.pdf`

---

Verantwortlich: Vorstand Menschlichkeit Österreich  
Kontakt Datenschutz: datenschutz@menschlichkeit-oesterreich.at  
Letzte Aktualisierung: 2025-10-08  
Version: 1.0
