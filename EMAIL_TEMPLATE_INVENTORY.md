# Email Template Inventory

**Projekt:** Menschlichkeit Osterreich
**Datum:** 2026-03-22

---

## 1. Ubersicht

Die E-Mail-Templates der Plattform befinden sich in zwei Verzeichnissen:

| Verzeichnis                             | Anzahl         | Typ                                 |
| --------------------------------------- | -------------- | ----------------------------------- |
| `apps/api/src/notifications/templates/` | 12 Dateien     | Transaktions- und Marketing-E-Mails |
| `apps/api/src/finance/templates/`       | 4 Dateien      | Rechnungen, Mahnungen, PDF-Vorlagen |
| **Gesamt**                              | **16 Dateien** |                                     |

### Status-Verteilung

| Status     | Anzahl | Beschreibung                              |
| ---------- | ------ | ----------------------------------------- |
| Production | 4      | Vollstaendig gestaltet, im Einsatz        |
| Stub       | 8      | Minimal-Template, nur Text, kein Branding |
| Stub (PDF) | 3      | PDF-Vorlagen, nur Platzhalter             |
| Fehlt      | 5      | Benoetigt, aber noch nicht erstellt       |

---

## 2. Template-Registry (aus mail_service.py)

Der `MailService` registriert 10 Templates mit folgender Konfiguration:

| Template-ID             | Datei                         | Betreff                                  | Preheader                           |
| ----------------------- | ----------------------------- | ---------------------------------------- | ----------------------------------- |
| welcome                 | welcome_email.html            | Willkommen bei Menschlichkeit Osterreich | Danke fuer Ihre Registrierung       |
| verify_email            | verify_email.html             | Bitte E-Mail-Adresse bestaetigen         | Bestaetigen Sie Ihre E-Mail         |
| newsletter_doi          | newsletter_doi.html           | Bitte Newsletter-Anmeldung bestaetigen   | Ein Klick fehlt noch                |
| newsletter_confirmed    | newsletter_confirmed.html     | Newsletter-Anmeldung bestaetigt          | Ihre Anmeldung ist bestaetigt       |
| newsletter_unsubscribed | newsletter_unsubscribed.html  | Newsletter-Abmeldung bestaetigt          | Erfolgreich abgemeldet              |
| donation_success        | donation_thank_you_email.html | Vielen Dank fuer Ihre Unterstuetzung     | Ihre Unterstuetzung ist eingegangen |
| membership_received     | membership_received.html      | Ihr Mitgliedsantrag ist eingegangen      | Danke fuer Ihren Mitgliedsantrag    |
| password_reset          | password_reset_email.html     | Passwort zuruecksetzen                   | Link zur Wiederherstellung          |
| contact_confirmation    | contact_confirmation.html     | Ihre Nachricht ist bei uns eingegangen   | Danke fuer Ihre Nachricht           |
| admin_alert             | admin_alert.html              | Interne Benachrichtigung                 | Neuer Vorgang                       |

---

## 3. Detailanalyse pro Template

### Notification Templates (apps/api/src/notifications/templates/)

---

### welcome_email.html

- **Zweck:** Willkommens-E-Mail nach erfolgreicher Registrierung
- **Trigger:** POST /api/auth/register (nach E-Mail-Verifikation)
- **Zeilen:** 72
- **Status:** Production
- **Header:** Ja (Logo, blauer Gradient #1a4a6e nach #2d7dd2)
- **Footer:** Ja (Social-Icons, ZVR-Nummer, Datenschutz-Link, Abmelde-Link)
- **Farben:** #1a4a6e (Header-Start), #2d7dd2 (Header-Ende), #FFFFFF (Text auf Header)
- **Jinja2-Variablen:** `{{ contact.first_name }}`, `{{ member.membership_number }}`, `{{ invoice.amount }}`, `{{ unsubscribe_url }}`
- **DSGVO-konform:** Ja (Opt-Out, Datenschutz, Absender-Adresse vorhanden)
- **Probleme:**
  - Farben nicht Brand-konform: Verwendet Blau-Gradient statt Brand-Farbe #1B4965 (Demokratie-Blau). Abweichung gering (#1a4a6e vs. #1B4965), sollte aber vereinheitlicht werden.
  - Referenziert `invoice.amount` -- ungewoehnlich fuer eine Willkommens-E-Mail, eventuell Copy-Paste-Fehler aus einem anderen Template.

---

### verify_email.html

- **Zweck:** E-Mail-Adresse bestaetigen (Double-Opt-In fuer Account)
- **Trigger:** POST /api/auth/register (sofort nach Registrierung)
- **Zeilen:** 13
- **Status:** Stub
- **Header:** Nein
- **Footer:** Nein
- **Farben:** #1f2937 (Text)
- **Jinja2-Variablen:** `{{ preheader }}`, `{{ first_name }}`, `{{ last_name }}`, `{{ verification_url }}`
- **DSGVO-konform:** Eingeschraenkt (kein Impressum, keine Absender-Adresse)
- **Probleme:**
  - Minimal-Stub ohne jegliches Branding
  - Kein Footer mit Vereinsadresse (rechtlich problematisch)
  - Kein Datenschutz-Link

---

### newsletter_doi.html

- **Zweck:** Double-Opt-In Bestaetigung fuer Newsletter-Anmeldung
- **Trigger:** POST /api/newsletter/subscribe
- **Zeilen:** 13
- **Status:** Stub
- **Header:** Nein
- **Footer:** Nein
- **Farben:** #1f2937 (Text)
- **Jinja2-Variablen:** `{{ preheader }}`, `{{ first_name }}`, `{{ last_name }}`, `{{ confirmation_url }}`
- **DSGVO-konform:** NEIN
- **Probleme:**
  - KRITISCH: Kein Opt-Out-Hinweis (DSGVO-Pflicht bei Newsletter-bezogenen E-Mails)
  - Kein Hinweis auf Verarbeitungszweck
  - Kein Datenschutz-Link
  - Kein Impressum/Vereinsadresse

---

### newsletter_confirmed.html

- **Zweck:** Bestaetigung der erfolgreichen Newsletter-Anmeldung
- **Trigger:** GET /api/newsletter/confirm?token=...
- **Zeilen:** 10
- **Status:** Stub
- **Header:** Nein
- **Footer:** Nein
- **Farben:** #1f2937 (Text)
- **Jinja2-Variablen:** `{{ preheader }}`, `{{ first_name }}`, `{{ last_name }}`
- **DSGVO-konform:** NEIN
- **Probleme:**
  - KRITISCH: Kein Abmelde-Link (DSGVO-Pflicht fuer Newsletter-E-Mails)
  - Kein Datenschutz-Link
  - Kein Vereinsimpressum

---

### newsletter_unsubscribed.html

- **Zweck:** Bestaetigung der Newsletter-Abmeldung
- **Trigger:** POST /api/newsletter/unsubscribe
- **Zeilen:** 10
- **Status:** Stub
- **Header:** Nein
- **Footer:** Nein
- **Farben:** #1f2937 (Text)
- **Jinja2-Variablen:** `{{ preheader }}`, `{{ first_name }}`, `{{ last_name }}`
- **DSGVO-konform:** Eingeschraenkt (Abmelde-Link nicht noetig, aber Impressum fehlt)
- **Probleme:**
  - Kein Branding
  - Kein Vereinsimpressum

---

### password_reset_email.html

- **Zweck:** Link zum Zuruecksetzen des Passworts
- **Trigger:** POST /api/auth/password-reset
- **Zeilen:** 12
- **Status:** Stub
- **Header:** Nein
- **Footer:** Nein
- **Farben:** #1f2937 (Text)
- **Jinja2-Variablen:** `{{ preheader }}`, `{{ first_name }}`, `{{ last_name }}`, `{{ reset_url }}`, `{{ expires_hours }}`
- **DSGVO-konform:** Eingeschraenkt (Transaktions-E-Mail, aber Impressum fehlt)
- **Probleme:**
  - Kein Branding
  - Kein Sicherheitshinweis ("Falls Sie diese Anfrage nicht gestellt haben...")

---

### contact_confirmation.html

- **Zweck:** Empfangsbestaetigung fuer Kontaktformular-Nachricht
- **Trigger:** POST /api/contact
- **Zeilen:** 11
- **Status:** Stub
- **Header:** Nein
- **Footer:** Nein
- **Farben:** #1f2937 (Text)
- **Jinja2-Variablen:** `{{ preheader }}`, `{{ first_name }}`, `{{ last_name }}`, `{{ subject }}`
- **DSGVO-konform:** Eingeschraenkt
- **Probleme:**
  - Kein Branding
  - Kein Hinweis auf Antwortzeit

---

### admin_alert.html

- **Zweck:** Interne Benachrichtigung an Admins bei neuen Vorgaengen
- **Trigger:** Verschiedene interne Events
- **Zeilen:** 12
- **Status:** Stub (intern)
- **Header:** Nein
- **Footer:** Nein
- **Farben:** #1f2937 (Text)
- **Jinja2-Variablen:** `{{ preheader }}`, `{{ title }}`, `{{ body_html }}`, `{{ related_id }}`
- **DSGVO-konform:** Nicht relevant (interne E-Mail)
- **Probleme:**
  - Kein Branding (niedrige Prioritaet, da intern)
  - `body_html` wird ungefiltert eingefuegt -- XSS-Risiko bei schadhaftem Input

---

### donation_thank_you_email.html

- **Zweck:** Dankes-E-Mail nach erfolgreicher Spende
- **Trigger:** Webhook von Stripe (ueber n8n donation-processing Workflow)
- **Zeilen:** 91
- **Status:** Production
- **Header:** Ja (Logo, lila Gradient #6b21a8 nach #9333ea)
- **Footer:** Ja (Social-Icons, ZVR-Nummer, Datenschutz-Link, Abmelde-Link)
- **Farben:** #6b21a8 (Header-Start), #9333ea (Header-Ende), #FFFFFF (Text auf Header)
- **Jinja2-Variablen:** `{{ contact.first_name }}`, `{{ donation.amount }}`, `{{ donation.date }}`, `{{ donation.receipt_eligible }}`, `{{ unsubscribe_url }}`
- **DSGVO-konform:** Ja (Opt-Out, Datenschutz, Absender-Adresse vorhanden)
- **Probleme:**
  - KRITISCH: Farben FALSCH -- Lila Gradient (#6b21a8 nach #9333ea) entspricht NICHT den Brand Guidelines. Soll-Farbe ist #D84A1B (Logo-Orange) oder #1B4965 (Demokratie-Blau).
  - Spendenquittungs-Hinweis (`receipt_eligible`) fehlt moeglicherweise fuer oesterreichisches Steuerrecht

---

### membership_received.html

- **Zweck:** Empfangsbestaetigung fuer Mitgliedsantrag
- **Trigger:** POST /api/membership/apply
- **Zeilen:** Nicht vollstaendig analysiert (vermutlich Stub-Niveau)
- **Status:** Stub (vermutet)
- **Header:** Vermutlich Nein
- **Footer:** Vermutlich Nein
- **Farben:** Vermutlich #1f2937 (Text)
- **Jinja2-Variablen:** `{{ preheader }}`, `{{ first_name }}`, `{{ last_name }}` (vermutet)
- **DSGVO-konform:** Unklar -- Detailanalyse ausstehend
- **Probleme:**
  - Template-Inhalt muss vollstaendig analysiert werden
  - Voraussichtlich gleiche Stub-Probleme wie andere Minimal-Templates

---

### Finance Templates (apps/api/src/finance/templates/)

---

### invoice_email.html

- **Zweck:** E-Mail-Begleitschreiben zur Rechnung (mit PDF-Anhang)
- **Trigger:** n8n finance-invoicing Workflow (Cron)
- **Zeilen:** 73
- **Status:** Production
- **Header:** Ja (blauer Gradient #1a4a6e nach #2d7dd2)
- **Footer:** Ja (Vereinsadresse, Bankdaten)
- **Farben:** #1a4a6e (Header-Start), #2d7dd2 (Header-Ende)
- **Jinja2-Variablen:** `{{ contact.first_name }}`, `{{ invoice.number }}`, `{{ invoice.due_date }}`, `{{ invoice.period }}`, `{{ invoice.amount_net }}`, `{{ invoice.amount_total }}`, `{{ invoice.date }}`, `{{ invoice.id }}`, `{{ bank.iban }}`, `{{ bank.bic }}`
- **DSGVO-konform:** Ja (Transaktions-E-Mail mit vollstaendigem Impressum)
- **Probleme:**
  - Header-Farbe #1a4a6e weicht leicht von Brand-Farbe #1B4965 ab
  - IBAN/BIC werden im Klartext angezeigt (akzeptabel fuer Rechnungs-E-Mails)

---

### dunning_email.html

- **Zweck:** Mahnung in 3 Eskalationsstufen
- **Trigger:** n8n finance-dunning Workflow (Cron)
- **Zeilen:** 79
- **Status:** Production
- **Header:** Ja (dynamisch, 3 Eskalationsstufen)
- **Footer:** Ja (Vereinsadresse, Kontaktdaten)
- **Farben:** Dynamisch nach Eskalationsstufe:
  - Stufe 1 (Zahlungserinnerung): Orange
  - Stufe 2 (1. Mahnung): Rot
  - Stufe 3 (2. Mahnung): Dunkelrot
- **Jinja2-Variablen:** `{{ dunning.level_label }}`, `{{ dunning.header_class }}`, `{{ dunning.box_class }}`, `{{ dunning.warning_title }}`, `{{ dunning.warning_text }}`, `{{ dunning.new_due_date }}`, `{{ invoice.number }}`, `{{ invoice.due_date }}`, `{{ invoice.amount_total }}`, `{{ invoice.id }}`
- **DSGVO-konform:** Ja (Transaktions-E-Mail)
- **Probleme:**
  - Eskalationsfarben sind sinnvoll und muessen nicht an Brand-Farben angepasst werden
  - Kontaktmoeglichkeit bei Haertefaellen sollte prominenter dargestellt werden (NGO-Kontext)

---

### invoice.html (PDF-Template)

- **Zweck:** PDF-Rechnungsvorlage fuer WeasyPrint/wkhtmltopdf
- **Trigger:** n8n finance-invoicing Workflow
- **Zeilen:** 118
- **Status:** Stub (PDF, CSS-injected)
- **Header:** Vereinslogo und -adresse
- **Footer:** Bankdaten, ZVR-Nummer
- **Jinja2-Variablen:** `{{ invoice.invoice_number }}`, `{{ issuer.* }}` (Name, Adresse, etc.), `{{ recipient.* }}` (Name, Adresse, etc.), `{{ items[] }}` (Positionen mit Beschreibung, Menge, Preis)
- **Probleme:**
  - CSS wird inline injiziert statt ueber separates Stylesheet
  - Keine automatische Seitennummerierung
  - Brand-Farben nicht aus Design Tokens geladen

---

### dunning.html (PDF-Template)

- **Zweck:** PDF-Mahnungsvorlage
- **Trigger:** n8n finance-dunning Workflow
- **Zeilen:** 9
- **Status:** Stub (nur Platzhalter)
- **Probleme:**
  - Template ist nicht funktionsfaehig (nur 9 Zeilen)
  - Muss vollstaendig implementiert werden

---

### receipt.html (PDF-Template)

- **Zweck:** PDF-Spendenquittung fuer Steuerabzug
- **Trigger:** Manuell / geplanter annual-donation-receipt Workflow
- **Zeilen:** 9
- **Status:** Stub (nur Platzhalter)
- **Probleme:**
  - Template ist nicht funktionsfaehig (nur 9 Zeilen)
  - Muss gemaess oesterreichischem Steuerrecht (Spendenabsetzbarkeit) gestaltet werden
  - Benoetigt Vereins-Registrierungsnummer fuer Spendenabsetzbarkeit

---

### membership_card.html (PDF-Template)

- **Zweck:** PDF-Mitgliedskarte zum Download/Druck
- **Trigger:** Nach Mitgliedschaftsbestaetigung
- **Zeilen:** 9
- **Status:** Stub (nur Platzhalter)
- **Probleme:**
  - Template ist nicht funktionsfaehig (nur 9 Zeilen)
  - Branding und Layout muessen definiert werden

---

## 4. Fehlende Templates

Die folgenden Templates werden benoetigt, existieren aber noch nicht:

| Template                        | Zweck                                                       | Prioritaet | Abhaengigkeit                                                                         |
| ------------------------------- | ----------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| donation_failed.html            | Benachrichtigung bei fehlgeschlagener Spende                | vorhanden  | Template ist im API-Stack vorhanden; optionaler n8n-/Ops-Folgeworkflow ist noch offen |
| recurring_donation_problem.html | Problem mit wiederkehrender Spende (Karte abgelaufen, etc.) | P2         | Stripe Webhook Integration                                                            |
| admin_new_donation.html         | Interne Benachrichtigung bei neuer Spende                   | P2         | Kann als Erweiterung von admin_alert.html implementiert werden                        |
| admin_new_registration.html     | Interne Benachrichtigung bei neuer Registrierung            | P2         | Kann als Erweiterung von admin_alert.html implementiert werden                        |
| opt_out_confirmed.html          | Bestaetigung des vollstaendigen Opt-Out (DSGVO Art. 21)     | P2         | GDPR right-to-erasure Workflow                                                        |

---

## 5. Farbvergleich: IST vs. Brand Guidelines

### Ubersicht

| Template           | IST-Farbe                    | SOLL (Brand Guidelines)               | Bewertung                                   |
| ------------------ | ---------------------------- | ------------------------------------- | ------------------------------------------- |
| welcome_email      | #1a4a6e Blau Gradient        | #1B4965 Demokratie-Blau               | Nah dran, minimale Korrektur                |
| donation_thank_you | #6b21a8 Lila Gradient        | #D84A1B Logo-Orange oder #1B4965 Blau | FALSCH -- Lila ist keine Brand-Farbe        |
| invoice_email      | #1a4a6e Blau                 | #1B4965 Demokratie-Blau               | Nah dran, minimale Korrektur                |
| dunning_email      | Orange nach Rot (Eskalation) | Eskalationsfarben sind funktional     | OK -- Sonderstatus fuer Mahnungen           |
| Alle Stubs         | #1f2937 Grau                 | Kein Branding vorhanden               | Muss bei Template-Upgrade korrigiert werden |

### Brand-Farbreferenz

| Token         | HEX     | Verwendung in E-Mails         |
| ------------- | ------- | ----------------------------- |
| brand-primary | #D84A1B | CTA-Buttons, Akzente          |
| trust-blue    | #1B4965 | Header-Hintergrund            |
| body-text     | #4A4039 | Fliesstext                    |
| heading-text  | #2B231D | Ueberschriften                |
| surface       | #F5F1ED | Infoboxen, Footer-Hintergrund |
| border        | #E8E0D8 | Trennlinien                   |

### Korrektur-Prioritaeten

1. **Sofort:** donation_thank_you_email.html -- Lila nach Blau/Orange aendern
2. **KW 14:** welcome_email.html -- #1a4a6e nach #1B4965 korrigieren
3. **KW 14:** invoice_email.html -- #1a4a6e nach #1B4965 korrigieren
4. **KW 15-16:** Alle Stubs bei Upgrade auf Brand-Farben umstellen

---

## 6. DSGVO-Compliance-Status

| Template                | Absender-Adresse | Datenschutz-Link | Abmelde-Link | Verarbeitungsgrund | ZVR-Nummer | Bewertung       |
| ----------------------- | ---------------- | ---------------- | ------------ | ------------------ | ---------- | --------------- |
| welcome_email           | Ja               | Ja               | Ja           | Nein               | Ja         | Gut             |
| verify_email            | Nein             | Nein             | N/A          | Nein               | Nein       | Mangelhaft      |
| newsletter_doi          | Nein             | Nein             | Nein         | Nein               | Nein       | KRITISCH        |
| newsletter_confirmed    | Nein             | Nein             | Nein         | Nein               | Nein       | KRITISCH        |
| newsletter_unsubscribed | Nein             | Nein             | N/A          | Nein               | Nein       | Mangelhaft      |
| donation_thank_you      | Ja               | Ja               | Ja           | Nein               | Ja         | Gut             |
| membership_received     | Unklar           | Unklar           | Unklar       | Unklar             | Unklar     | Pruefung noetig |
| password_reset          | Nein             | Nein             | N/A          | Nein               | Nein       | Mangelhaft      |
| contact_confirmation    | Nein             | Nein             | N/A          | Nein               | Nein       | Mangelhaft      |
| admin_alert             | N/A              | N/A              | N/A          | N/A                | N/A        | Intern          |
| invoice_email           | Ja               | Ja               | N/A          | N/A                | Ja         | Gut             |
| dunning_email           | Ja               | Ja               | N/A          | N/A                | Ja         | Gut             |

**Zusammenfassung:** 4 von 12 E-Mail-Templates sind DSGVO-konform. 2 Templates haben kritische Maengel (Newsletter-bezogen ohne Opt-Out). 6 Templates haben leichte Maengel (fehlendes Impressum).

---

## 7. Naechste Schritte

| Prioritaet | Aktion                                               | Betroffene Templates                             | Deadline |
| ---------- | ---------------------------------------------------- | ------------------------------------------------ | -------- |
| P0         | newsletter_doi.html: Opt-Out-Hinweis ergaenzen       | newsletter_doi                                   | Sofort   |
| P0         | newsletter_confirmed.html: Abmelde-Link ergaenzen    | newsletter_confirmed                             | Sofort   |
| P1         | donation_thank_you: Lila nach Brand-Farben aendern   | donation_thank_you_email                         | KW 13    |
| P1         | \_base.html erstellen (siehe EMAIL_DESIGN_SYSTEM.md) | Neues Template                                   | KW 13    |
| P2         | Alle Stubs auf \_base.html umstellen                 | 8 Templates                                      | KW 14-15 |
| P2         | Fehlende Templates erstellen                         | 5 neue Templates                                 | KW 15-16 |
| P3         | PDF-Templates vollstaendig implementieren            | dunning.html, receipt.html, membership_card.html | KW 16-17 |
