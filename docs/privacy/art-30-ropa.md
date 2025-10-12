# Art. 30 DSGVO – Verzeichnis von Verarbeitungstätigkeiten (RoPA)

**Organisation**: Menschlichkeit Österreich (ZVR: 1182213083)  
**Verantwortlicher**: Vorstand  
**Datenschutzbeauftragte:r**: [DPO_NAME] - [DPO_EMAIL]  
**Stand**: 2025-10-12  
**Nächste Review**: 2026-01-12 (Quartalsweise)

---

## Pflicht zur Führung eines Verzeichnisses

Gemäß **Art. 30 DSGVO** muss jeder Verantwortliche ein Verzeichnis aller Verarbeitungstätigkeiten führen, die seiner Zuständigkeit unterliegen.

**Ausnahme**: Nicht erforderlich für Unternehmen mit < 250 Mitarbeitern, **AUSSER**:
- Verarbeitung birgt Risiko für Rechte und Freiheiten
- Regelmäßige Verarbeitung
- Besondere Kategorien (Art. 9) oder strafrechtliche Daten (Art. 10)

**Unsere Situation**: ✅ Verzeichnis ist Pflicht (regelmäßige Verarbeitung, PII, Mitgliederdaten)

---

## Verarbeitungstätigkeiten – Übersicht

| Nr. | Verarbeitungstätigkeit | System | Rechtsgrundlage | Kategorie |
|-----|------------------------|--------|-----------------|-----------|
| VT-01 | Mitgliederverwaltung | CRM (CiviCRM) | Art. 6(1)(b) | HOCH |
| VT-02 | Beitragseinhebung & SEPA | CRM, Banking | Art. 6(1)(b), (c) | HOCH |
| VT-03 | Spendenverwaltung | CRM | Art. 6(1)(b), (c) | MITTEL |
| VT-04 | Newsletter & Marketing | CRM, n8n | Art. 6(1)(a) | NIEDRIG |
| VT-05 | Event-Management | CRM | Art. 6(1)(b) | MITTEL |
| VT-06 | Gaming Platform / XP | Web/Games | Art. 6(1)(b) | NIEDRIG |
| VT-07 | Website Analytics | Matomo | Art. 6(1)(f) | NIEDRIG |
| VT-08 | Support-Tickets | Support-System | Art. 6(1)(b) | MITTEL |
| VT-09 | CI/CD Logs | GitHub Actions | Art. 6(1)(f) | NIEDRIG |
| VT-10 | Security Monitoring | Trivy, CodeQL | Art. 6(1)(f) | MITTEL |

---

## VT-01: Mitgliederverwaltung

### Grundinformationen
- **Name**: Verwaltung von Vereinsmitgliedern
- **Zweck**: Führung des Mitgliederverzeichnisses, Kommunikation, Verwaltung von Rechten/Pflichten
- **Rechtsgrundlage**: Art. 6(1)(b) DSGVO (Vertragserfüllung), Vereinsgesetz 2002

### Verantwortlicher
- **Organisation**: Menschlichkeit Österreich
- **Kontakt**: vorstand@menschlichkeit-oesterreich.at
- **Adresse**: Pottenbrunner Hauptstraße 108/Top 1, 3140 Pottenbrunn, Österreich

### Datenkategorien
- **Stammdaten**: Name, Vorname, Geburtsdatum, Geschlecht (optional)
- **Kontaktdaten**: Adresse, E-Mail, Telefon (optional)
- **Mitgliedschaftsdaten**: Mitgliedsnummer, Typ (ordentlich/außerordentlich/ehren), Status, Beitrittsdatum
- **Funktionen**: Vorstand, Arbeitsgruppen, Projekte

### Kategorien betroffener Personen
- Vereinsmitglieder (ordentlich, außerordentlich, Ehrenmitglieder)
- Interessent:innen (bei Beitrittsantrag)

### Kategorien von Empfängern
- **Intern**: Vorstand, Mitgliederbetreuung (RBAC)
- **Extern**: 
  - Buchhaltung/Steuerberater (bei Bedarf, AVV vorhanden)
  - Vereinsregister (bei Statutenänderungen)
  - **Keine Weitergabe an Dritte** ohne Einwilligung

### Drittlandtransfer
- ❌ Nein, alle Daten innerhalb EU (Österreich, Deutschland)

### Speicherdauer
- **Während Mitgliedschaft**: Aktiv gespeichert
- **Nach Austritt**: 1 Jahr (organisatorische Nachläufe)
- **Danach**: Löschung oder Pseudonymisierung
- **Ausnahme**: 7 Jahre bei finanziellen Verpflichtungen (BAO § 132)

### Technische & organisatorische Maßnahmen (TOMs)
- ✅ Zugriffskontrolle: RBAC in CiviCRM (Vorstand, Buchhaltung, Member)
- ✅ Verschlüsselung: pgcrypto für sensible Felder, TLS 1.3 für Transit
- ✅ Backup: Täglich (verschlüsselt), 30 Tage Retention
- ✅ Audit-Log: Alle Zugriffe/Änderungen protokolliert
- ✅ MFA: Für Admin-Zugriffe obligatorisch

### Risikobewertung
- **Risiko**: MITTEL-HOCH (personenbezogene Daten, Vereinsinternum)
- **Maßnahmen**: TOMs implementiert, regelmäßige Security Audits
- **DPIA erforderlich**: ❌ Nein (Standardverarbeitung)

---

## VT-02: Beitragseinhebung & SEPA

### Grundinformationen
- **Name**: Verwaltung von Mitgliedsbeiträgen und SEPA-Lastschriften
- **Zweck**: Beitragseinzug, Buchhaltung, gesetzliche Aufbewahrung
- **Rechtsgrundlage**: 
  - Art. 6(1)(b) – Vertragserfüllung (Mitgliedsbeitrag)
  - Art. 6(1)(c) – Rechtliche Verpflichtung (BAO § 132)

### Verantwortlicher
- Wie VT-01

### Datenkategorien
- **Finanzdaten**: IBAN, BIC, Mandatsreferenz, Lastschrift-Datum
- **Zahlungshistorie**: Betrag, Buchungsdatum, Verwendungszweck
- **Buchhaltung**: Belegnummer, Kostenstelle, Buchungskonto

### Kategorien betroffener Personen
- Zahlende Mitglieder
- Mandatsgeber:innen (SEPA)

### Kategorien von Empfängern
- **Intern**: Buchhaltung, Kassier:in
- **Extern**: 
  - Bank (für SEPA-Lastschriften)
  - Steuerberater (AVV vorhanden)
  - Finanzamt (bei Prüfung)

### Drittlandtransfer
- ❌ Nein

### Speicherdauer
- **SEPA-Mandate**: Während Mitgliedschaft + 14 Monate (SEPA-Regeln)
- **Buchhaltungsbelege**: 7 Jahre (BAO § 132)
- **Danach**: Sichere Löschung

### TOMs
- ✅ Verschlüsselung: IBAN/BIC verschlüsselt (pgp_sym_encrypt)
- ✅ Zugriff: Nur Kassier:in & Buchhaltung (Least Privilege)
- ✅ SEPA-Datei: Generierung verschlüsselt, sichere Übertragung (SFTP)
- ✅ Audit-Log: Alle Finanztransaktionen protokolliert

### Risikobewertung
- **Risiko**: HOCH (Finanzdaten, Bankverbindung)
- **DPIA erforderlich**: ✅ Ja (siehe `art-35-dpia.md`)

---

## VT-03: Spendenverwaltung

### Grundinformationen
- **Name**: Verwaltung von Spenden und Zuwendungsbestätigungen
- **Zweck**: Spendenerfassung, Quittungen, Steuerrecht
- **Rechtsgrundlage**: 
  - Art. 6(1)(b) – Vertrag (Spendenquittung)
  - Art. 6(1)(c) – Rechtliche Verpflichtung (Steuerrecht)

### Datenkategorien
- **Spenderdaten**: Name, Adresse (für Quittung)
- **Spendenbetrag**: Betrag, Datum, Zweck
- **Quittung**: Quittungsnummer, Ausstellungsdatum

### Speicherdauer
- **Spenderdaten**: 7 Jahre (Steuerrecht)
- **Danach**: Löschung (außer bei expliziter Einwilligung für Newsletter)

### TOMs
- Wie VT-02 (ähnliches Risiko)

### Risikobewertung
- **Risiko**: MITTEL (Finanzdaten, aber einmalig)
- **DPIA erforderlich**: ❌ Nein

---

## VT-04: Newsletter & Marketing

### Grundinformationen
- **Name**: Newsletter-Versand und Marketing-Kommunikation
- **Zweck**: Information über Vereinstätigkeiten, Events, Kampagnen
- **Rechtsgrundlage**: Art. 6(1)(a) – Einwilligung (mit Double-Opt-In)

### Datenkategorien
- **Kontaktdaten**: E-Mail, Vorname (optional)
- **Präferenzen**: Themen, Frequenz, Sprache (de-AT/en)
- **Tracking**: Öffnungsrate, Klicks (pseudonymisiert)

### Kategorien betroffener Personen
- Newsletter-Abonnent:innen (können auch Nicht-Mitglieder sein)

### Kategorien von Empfängern
- **Intern**: Marketing-Team
- **Extern**: 
  - n8n (Automation, Self-Hosted)
  - E-Mail-Provider (AVV vorhanden, EU-Server)

### Drittlandtransfer
- ❌ Nein (nur EU-Server)

### Speicherdauer
- **Bis Widerruf**: Aktiv gespeichert
- **Nach Abmeldung**: Sofortlöschung (nur Hash für Blacklist)

### TOMs
- ✅ Double-Opt-In: Bestätigung per E-Mail erforderlich
- ✅ Abmelde-Link: In jeder E-Mail
- ✅ Tracking: Nur mit Einwilligung, pseudonymisiert

### Risikobewertung
- **Risiko**: NIEDRIG (nur E-Mail, Opt-in, jederzeit kündbar)
- **DPIA erforderlich**: ❌ Nein

---

## VT-05: Event-Management

### Grundinformationen
- **Name**: Verwaltung von Veranstaltungen und Teilnehmer:innen
- **Zweck**: Event-Organisation, Anmeldung, Teilnehmerverwaltung
- **Rechtsgrundlage**: Art. 6(1)(b) – Vertragserfüllung (Event-Anmeldung)

### Datenkategorien
- **Teilnehmerdaten**: Name, E-Mail, Telefon (optional)
- **Event-Daten**: Anmeldedatum, Teilnahme-Status, Zahlungsstatus
- **Besondere Kategorien**: Ernährungspräferenzen, Barrierefreiheit (nur mit Einwilligung)

### Speicherdauer
- **Während Event**: Aktiv
- **Nach Event**: 3 Monate (für Nachbereitung)
- **Danach**: Löschung (außer bei separater Newsletter-Einwilligung)

### TOMs
- ✅ Separate Einwilligung für besondere Kategorien
- ✅ Zugriff: Nur Event-Team

### Risikobewertung
- **Risiko**: MITTEL (ggf. besondere Kategorien)
- **DPIA erforderlich**: ❌ Nein (Standard-Event-Management)

---

## VT-06: Gaming Platform / XP System

### Grundinformationen
- **Name**: Verwaltung von User-Profilen und Gamification
- **Zweck**: Engagement-Steigerung, XP/Achievements, Leaderboard
- **Rechtsgrundlage**: Art. 6(1)(b) – Vertragserfüllung (Nutzung der Plattform)

### Datenkategorien
- **User-Daten**: User-ID, Display-Name (Pseudonym), E-Mail
- **Gaming-Daten**: XP, Level, Achievements, Game-Sessions
- **Keine sensiblen Daten**: Keine PII außer E-Mail für Account

### Speicherdauer
- **Bis Account-Löschung**: Aktiv
- **Nach Löschung**: Sofortige Entfernung aus Leaderboard, XP anonymisiert

### TOMs
- ✅ Pseudonymisierung: Display-Name statt Realname
- ✅ Opt-out: Leaderboard-Teilnahme optional

### Risikobewertung
- **Risiko**: NIEDRIG (pseudonymisiert, kein Profiling)
- **DPIA erforderlich**: ❌ Nein

---

## VT-07: Website Analytics (Matomo)

### Grundinformationen
- **Name**: Webanalyse und Nutzungsstatistiken
- **Zweck**: Website-Optimierung, User-Experience-Verbesserung
- **Rechtsgrundlage**: Art. 6(1)(f) – Berechtigtes Interesse (mit Opt-out)

### Datenkategorien
- **Zugriffsdaten**: IP-Adresse (anonymisiert - letzte 2 Bytes), User-Agent, Referrer
- **Nutzungsdaten**: Seitenaufrufe, Verweildauer, Klickpfade

### TOMs
- ✅ IP-Anonymisierung: Automatisch (letztes Oktett entfernt)
- ✅ Cookie-Consent: Opt-out-Link auf jeder Seite
- ✅ Self-Hosted: Matomo auf eigenen Servern (keine Third-Party)

### Speicherdauer
- **Analytics-Daten**: 12 Monate
- **Danach**: Automatische Löschung

### Risikobewertung
- **Risiko**: NIEDRIG (anonymisiert, Opt-out)
- **DPIA erforderlich**: ❌ Nein

---

## VT-08 bis VT-10: Weitere Verarbeitungen

*Analog zu oben, vollständig dokumentiert in internem RoPA-Register*

---

## Auftragsverarbeiter (AVV-Verträge)

| Dienstleister | Leistung | AVV vorhanden | Server-Standort |
|---------------|----------|---------------|-----------------|
| Plesk Hosting | Server-Hosting | ✅ | Deutschland (EU) |
| Nextcloud | File Storage | ✅ | Österreich (EU) |
| E-Mail Provider | SMTP/Newsletter | ✅ | Deutschland (EU) |
| Steuerberater | Buchhaltung | ✅ | Österreich (EU) |

**Alle AVV-Verträge**: In `docs/legal/auftragsverarbeitung/` abgelegt

---

## Compliance-Nachweise

### Automatisierte Checks
```bash
# Vollständigkeit RoPA
./scripts/validate-ropa.sh

# Alle AVVs vorhanden?
ls -la docs/legal/auftragsverarbeitung/ | wc -l

# TOMs implementiert?
npm run compliance:dsgvo
```

### Manuelle Reviews
- [x] Quartalsweise Review durch DPO
- [x] Bei neuen Verarbeitungen: Sofortige Ergänzung
- [x] Bei System-Änderungen: RoPA-Update

---

## Kontakt & Verantwortlichkeiten

**Verantwortlich für RoPA**: [DPO_NAME]  
**Zugänglichkeit**: Auf Anfrage der Aufsichtsbehörde verfügbar  
**Nächste Aktualisierung**: 2026-01-12 (oder bei wesentlichen Änderungen)

---

**Version**: 1.0  
**Letzte Änderung**: 2025-10-12  
**Genehmigt durch**: [Vorstand Unterschrift]
