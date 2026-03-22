# EMAIL_DESIGN_SYSTEM

## Komponenten
- Header mit Logo- oder Textfallback `Menschlichkeit Österreich`
- Preheader für Inbox-Vorschau
- Hero/Intro-Block
- Fließtext mit klarer österreichisch-deutscher Tonalität
- Primärer CTA-Button
- Info-/Warn-/Erfolgsbox
- Footer mit:
  - Vereinsname
  - Kontaktadresse `office@menschlichkeit-oesterreich.at`
  - Website- und Datenschutz-Link
  - Opt-out-Hinweis bei Marketingbezug

## Layoutregeln
- Tabellenbasiertes, breit kompatibles HTML
- Maximalbreite ca. 600px
- Nur einfache, robuste CSS-Muster
- Plain-Text-Alternative immer mitführen

## Textregeln
- Österreichisches Deutsch
- Kurz, klar, handlungsorientiert
- Keine juristische Überfrachtung im Haupttext
- Fachlich saubere Betreffzeilen:
  - Registrierung
  - Bestätigung
  - Rechnung
  - Mahnung
  - Datenschutz/Abmeldung

## Brandingregeln
- Absender:
  - Transaktional: `office@menschlichkeit-oesterreich.at` oder themenspezifische Systemadresse
  - Intern/Alerts: Admin-/Ops-Adresse
- Einheitliche CTA-Sprache: `Jetzt bestätigen`, `Rechnung ansehen`, `Einstellungen verwalten`

## DSGVO- und Pflichtbausteine
- Marketing-Mails nur mit Abmeldelink/-hinweis
- Transaktionale Mails ohne versteckte Marketing-Elemente
- Datenschutzhinweis im Footer
- Keine unmaskierte PII in Logs oder Debug-Ausgaben

## Variablen- und Token-Regeln
- Pflichtvariablen pro Template definieren
- Fallbacks für optionale Felder:
  - `first_name`
  - `last_name`
  - `subject`
  - `amount`
  - `currency`
- Fehlende Pflichtvariablen sollen Render-/Testfehler produzieren, nicht stille kaputte Mails

## Governance
- Template-Registry im FastAPI-MailService ist die kanonische Quelle.
- n8n und CiviCRM verwenden diese Inhalte entweder direkt über API oder orientieren sich streng daran.
