# Email Design System
**Projekt:** Menschlichkeit Osterreich
**Datum:** 2026-03-22
**Referenz:** Brand_Guidelines.md

---

## 1. Designprinzipien

Das Email Design System definiert verbindliche Gestaltungsregeln fuer alle E-Mail-Templates der Plattform. Es basiert auf den Brand Guidelines und beruecksichtigt die technischen Einschraenkungen von E-Mail-Clients.

### Technische Rahmenbedingungen

| Aspekt | Regel | Begruendung |
|--------|-------|-------------|
| CSS | Alles inline | E-Mail-Clients (Outlook, Gmail, etc.) unterstuetzen kein externes oder eingebettetes CSS zuverlaessig |
| Layout | Table-basiert | Flexbox/Grid werden von Outlook nicht unterstuetzt |
| Max-Breite | 600px | Standard fuer E-Mail, optimiert fuer mobile und Desktop-Anzeige |
| Schriften | Arial, Helvetica, sans-serif als Fallback | Webfonts (Nunito Sans, Source Sans 3) werden nur in Apple Mail, iOS Mail und einigen Webmail-Clients geladen |
| Bilder | Mit Alt-Text, max. 200 KB | Viele Clients blockieren Bilder standardmaessig |
| Dark Mode | Unterstuetzung ueber `@media (prefers-color-scheme: dark)` | Nur fuer Clients die es unterstuetzen (Apple Mail, Outlook.com) |

### Gestaltungsgrundsaetze

1. **Klarheit vor Aesthetik:** Jede E-Mail muss auch ohne Bilder und ohne Webfonts lesbar sein
2. **Mobile First:** 600px Breite funktioniert auf allen Geraeten ohne Media Queries
3. **Barrierefreiheit:** Mindestens WCAG AA Kontrast (4.5:1) fuer allen Text
4. **Konsistenz:** Alle Templates verwenden dieselben Farben, Abstaende und Schriftgroessen
5. **DSGVO-Konformitaet:** Jede E-Mail enthaelt die gesetzlich vorgeschriebenen Pflichtangaben

---

## 2. Farbsystem (aus Brand Guidelines)

### Primaere Farben

| Token | HEX | RGB | Verwendung in E-Mails | WCAG auf Weiss |
|-------|-----|-----|----------------------|----------------|
| brand-primary | #D84A1B | 216, 74, 27 | CTA-Buttons, Akzentlinien, Icon-Hintergruende | 4.55:1 (AA) |
| brand-text-on-white | #CB4D1A | 203, 77, 26 | Orangener Text auf weissem Hintergrund | 4.55:1 (AA) |
| trust-blue | #1B4965 | 27, 73, 101 | Header-Hintergrund, Ueberschriften, Links in Footer | 7.82:1 (AAA) |

### Textfarben

| Token | HEX | RGB | Verwendung in E-Mails | WCAG auf Weiss |
|-------|-----|-----|----------------------|----------------|
| heading-text | #2B231D | 43, 35, 29 | H1, H2, H3 Ueberschriften | 14.2:1 (AAA) |
| body-text | #4A4039 | 74, 64, 57 | Fliesstext, Absaetze | 8.5:1 (AAA) |
| muted-text | #6B6560 | 107, 101, 96 | Fussnoten, Meta-Informationen | 4.8:1 (AA) |
| light-text | #9B958F | 155, 149, 143 | Dezente Hinweise (nur auf weissem Hintergrund) | 2.8:1 (NICHT AA) |

### Hintergrundfarben

| Token | HEX | RGB | Verwendung in E-Mails |
|-------|-----|-----|----------------------|
| background | #FFFFFF | 255, 255, 255 | E-Mail-Hintergrund, Content-Bereich |
| surface | #F5F1ED | 245, 241, 237 | Infoboxen, Footer-Hintergrund, Alternating Rows |
| border | #E8E0D8 | 232, 224, 216 | Trennlinien, Tabellenrahmen, Boxen-Rahmen |

### Funktionale Farben

| Token | HEX | Verwendung |
|-------|-----|-----------|
| success | #16A34A | Erfolgsmeldungen, Bestaetigt-Icons |
| warning | #D97706 | Warnungen, Zahlungserinnerung (Mahnstufe 1) |
| error | #DC2626 | Fehler, Mahnstufe 2 |
| error-dark | #7F1D1D | Kritische Fehler, Mahnstufe 3 |

### WICHTIG: Verbotene Farben

Die folgenden Farben werden aktuell in Templates verwendet, sind aber NICHT Teil der Brand Guidelines und muessen ersetzt werden:

| Aktuell | Ersatz | Betroffene Templates |
|---------|--------|---------------------|
| #6b21a8 (Lila) | #1B4965 (Demokratie-Blau) oder #D84A1B (Brand-Orange) | donation_thank_you_email.html |
| #9333ea (Helles Lila) | #2d7dd2 nach #1B4965 ersetzen | donation_thank_you_email.html |
| #1a4a6e (Dunkles Blau) | #1B4965 (Demokratie-Blau, geringfuegige Korrektur) | welcome_email.html, invoice_email.html |
| #1f2937 (Dunkelgrau) | #4A4039 (Body-Text Erde) | Alle Stub-Templates |

---

## 3. Typografie

### Schrift-Stack

```
Primaer (Ueberschriften): 'Nunito Sans', Arial, Helvetica, sans-serif
Sekundaer (Fliesstext):   'Source Sans 3', Arial, Helvetica, sans-serif
Fallback (alle Clients):   Arial, Helvetica, sans-serif
```

### Schriftgroessen

| Element | Groesse | Gewicht | Zeilenhoehe | Font-Family |
|---------|---------|---------|-------------|-------------|
| H1 (Header-Titel) | 22px | 700 (Bold) | 28px | Nunito Sans |
| H2 (Abschnittstitel) | 18px | 700 (Bold) | 24px | Nunito Sans |
| H3 (Untertitel) | 16px | 600 (Semibold) | 22px | Nunito Sans |
| Body | 15px | 400 (Regular) | 24px | Source Sans 3 |
| Small (Footer, Meta) | 13px | 400 (Regular) | 20px | Source Sans 3 |
| Micro (Rechtliches) | 11px | 400 (Regular) | 16px | Source Sans 3 |
| Button-Text | 16px | 700 (Bold) | 20px | Nunito Sans |

### Abstaende

| Element | Abstand |
|---------|---------|
| Absaetze (margin-bottom) | 16px |
| Ueberschriften (margin-top) | 24px |
| Ueberschriften (margin-bottom) | 12px |
| Sektionen | 32px |
| Content-Padding (links/rechts) | 32px |
| Content-Padding (mobil) | 16px |

---

## 4. Komponentenbibliothek

### 4.1 Aeusserer Container

Alle E-Mails beginnen mit diesem Container, der die maximale Breite begrenzt und den Hintergrund setzt:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ email_subject }}</title>
  <!--[if mso]>
  <style>table { border-collapse: collapse; } td { font-family: Arial, sans-serif; }</style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#F5F1ED; -webkit-text-size-adjust:100%;">
  <!-- Preheader (unsichtbar, wird in Inbox-Vorschau angezeigt) -->
  <div style="display:none; max-height:0; overflow:hidden;">
    {{ preheader }}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1ED;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF; max-width:600px; width:100%;">
          <!-- Header, Content, Footer hier einfuegen -->
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### 4.2 Header (Brand-Standard)

Verwendet Demokratie-Blau als Hintergrund mit weissem Text:

```html
<!-- Brand-Header: Demokratie-Blau mit weissem Text -->
<tr>
  <td style="background-color:#1B4965; padding:24px 32px; text-align:center;">
    <img src="https://www.menschlichkeit-oesterreich.at/favicon.svg"
         width="40" height="40"
         alt="Menschlichkeit Osterreich"
         style="display:inline-block; vertical-align:middle;" />
    <h1 style="color:#FFFFFF; font-family:'Nunito Sans',Arial,sans-serif; font-size:22px; font-weight:700; margin:12px 0 0; line-height:28px;">
      Menschlichkeit Osterreich
    </h1>
  </td>
</tr>
```

**Variante: Header mit Untertitel**

```html
<tr>
  <td style="background-color:#1B4965; padding:24px 32px; text-align:center;">
    <img src="https://www.menschlichkeit-oesterreich.at/favicon.svg"
         width="40" height="40"
         alt="Menschlichkeit Osterreich"
         style="display:inline-block; vertical-align:middle;" />
    <h1 style="color:#FFFFFF; font-family:'Nunito Sans',Arial,sans-serif; font-size:22px; font-weight:700; margin:12px 0 4px; line-height:28px;">
      Menschlichkeit Osterreich
    </h1>
    <p style="color:#FFFFFF; font-family:'Source Sans 3',Arial,sans-serif; font-size:14px; margin:0; opacity:0.85;">
      {{ subtitle }}
    </p>
  </td>
</tr>
```

### 4.3 Content-Bereich

```html
<tr>
  <td style="padding:32px;">
    <h2 style="color:#2B231D; font-family:'Nunito Sans',Arial,sans-serif; font-size:18px; font-weight:700; margin:0 0 12px; line-height:24px;">
      {{ heading }}
    </h2>
    <p style="color:#4A4039; font-family:'Source Sans 3',Arial,sans-serif; font-size:15px; line-height:24px; margin:0 0 16px;">
      {{ body_text }}
    </p>
  </td>
</tr>
```

### 4.4 CTA-Button (Primaer)

Verwendet Brand-Orange fuer maximale Aufmerksamkeit:

```html
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
  <tr>
    <td align="center" style="border-radius:6px; background-color:#D84A1B;">
      <a href="{{ action_url }}"
         target="_blank"
         style="display:inline-block; padding:14px 32px; background-color:#D84A1B; color:#FFFFFF; font-family:'Nunito Sans',Arial,sans-serif; font-weight:700; font-size:16px; text-decoration:none; border-radius:6px; line-height:20px;">
        {{ button_text }}
      </a>
    </td>
  </tr>
</table>
```

**Variante: Sekundaerer Button (Demokratie-Blau)**

```html
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
  <tr>
    <td align="center" style="border-radius:6px; background-color:#1B4965;">
      <a href="{{ action_url }}"
         target="_blank"
         style="display:inline-block; padding:14px 32px; background-color:#1B4965; color:#FFFFFF; font-family:'Nunito Sans',Arial,sans-serif; font-weight:700; font-size:16px; text-decoration:none; border-radius:6px; line-height:20px;">
        {{ button_text }}
      </a>
    </td>
  </tr>
</table>
```

### 4.5 Infobox

Fuer hervorgehobene Informationen (Rechnungsdetails, Hinweise, etc.):

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
  <tr>
    <td style="background-color:#F5F1ED; border-radius:8px; padding:20px;">
      <p style="color:#4A4039; font-family:'Source Sans 3',Arial,sans-serif; font-size:15px; line-height:24px; margin:0;">
        {{ content }}
      </p>
    </td>
  </tr>
</table>
```

**Variante: Infobox mit Titel**

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
  <tr>
    <td style="background-color:#F5F1ED; border-radius:8px; padding:20px;">
      <h3 style="color:#2B231D; font-family:'Nunito Sans',Arial,sans-serif; font-size:16px; font-weight:600; margin:0 0 8px; line-height:22px;">
        {{ box_title }}
      </h3>
      <p style="color:#4A4039; font-family:'Source Sans 3',Arial,sans-serif; font-size:15px; line-height:24px; margin:0;">
        {{ content }}
      </p>
    </td>
  </tr>
</table>
```

**Variante: Warnungsbox**

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
  <tr>
    <td style="background-color:#FEF3C7; border-left:4px solid #D97706; border-radius:0 8px 8px 0; padding:20px;">
      <p style="color:#4A4039; font-family:'Source Sans 3',Arial,sans-serif; font-size:15px; line-height:24px; margin:0;">
        {{ warning_text }}
      </p>
    </td>
  </tr>
</table>
```

### 4.6 Trennlinie

```html
<tr>
  <td style="padding:0 32px;">
    <hr style="border:none; border-top:1px solid #E8E0D8; margin:24px 0;" />
  </td>
</tr>
```

### 4.7 Datentabelle

Fuer Rechnungspositionen, Spendendetails, etc.:

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0; border:1px solid #E8E0D8; border-radius:8px; overflow:hidden;">
  <tr style="background-color:#1B4965;">
    <td style="padding:10px 16px; color:#FFFFFF; font-family:'Nunito Sans',Arial,sans-serif; font-size:13px; font-weight:700;">
      Beschreibung
    </td>
    <td style="padding:10px 16px; color:#FFFFFF; font-family:'Nunito Sans',Arial,sans-serif; font-size:13px; font-weight:700; text-align:right;">
      Betrag
    </td>
  </tr>
  {% for item in items %}
  <tr style="background-color:{% if loop.index is odd %}#FFFFFF{% else %}#F5F1ED{% endif %};">
    <td style="padding:10px 16px; color:#4A4039; font-family:'Source Sans 3',Arial,sans-serif; font-size:14px; border-top:1px solid #E8E0D8;">
      {{ item.description }}
    </td>
    <td style="padding:10px 16px; color:#4A4039; font-family:'Source Sans 3',Arial,sans-serif; font-size:14px; text-align:right; border-top:1px solid #E8E0D8;">
      {{ item.amount }}
    </td>
  </tr>
  {% endfor %}
</table>
```

### 4.8 DSGVO-Footer (PFLICHT fuer alle Marketing-Mails)

Dieser Footer ist fuer alle Marketing- und Newsletter-E-Mails verpflichtend:

```html
<tr>
  <td style="background-color:#F5F1ED; border-top:2px solid #1B4965; padding:24px 32px; text-align:center;">
    <!-- Vereinsadresse (Pflicht) -->
    <p style="color:#4A4039; font-family:'Source Sans 3',Arial,sans-serif; font-size:13px; line-height:20px; margin:0 0 12px;">
      Menschlichkeit Osterreich<br/>
      Pottenbrunner Hauptstrasse 108/Top 1, 3140 Pottenbrunn<br/>
      ZVR: 1182213083
    </p>

    <!-- Links (Pflicht) -->
    <p style="font-size:12px; line-height:18px; margin:0 0 12px;">
      <a href="https://www.menschlichkeit-oesterreich.at/datenschutz"
         style="color:#1B4965; text-decoration:underline;">Datenschutz</a>
      &middot;
      <a href="https://www.menschlichkeit-oesterreich.at/impressum"
         style="color:#1B4965; text-decoration:underline;">Impressum</a>
      &middot;
      <a href="{{ unsubscribe_url }}"
         style="color:#1B4965; text-decoration:underline;">Abmelden</a>
    </p>

    <!-- Verarbeitungsgrund (Pflicht fuer Marketing) -->
    <p style="font-size:11px; color:#9B958F; font-family:'Source Sans 3',Arial,sans-serif; line-height:16px; margin:0;">
      Sie erhalten diese E-Mail, weil Sie sich bei Menschlichkeit Osterreich registriert haben.
    </p>
  </td>
</tr>
```

**Variante: Transaktions-Footer (ohne Abmelde-Link)**

Fuer Rechnungen, Passwort-Reset und andere Transaktions-E-Mails:

```html
<tr>
  <td style="background-color:#F5F1ED; border-top:2px solid #1B4965; padding:24px 32px; text-align:center;">
    <p style="color:#4A4039; font-family:'Source Sans 3',Arial,sans-serif; font-size:13px; line-height:20px; margin:0 0 12px;">
      Menschlichkeit Osterreich<br/>
      Pottenbrunner Hauptstrasse 108/Top 1, 3140 Pottenbrunn<br/>
      ZVR: 1182213083
    </p>
    <p style="font-size:12px; line-height:18px; margin:0;">
      <a href="https://www.menschlichkeit-oesterreich.at/datenschutz"
         style="color:#1B4965; text-decoration:underline;">Datenschutz</a>
      &middot;
      <a href="https://www.menschlichkeit-oesterreich.at/impressum"
         style="color:#1B4965; text-decoration:underline;">Impressum</a>
    </p>
  </td>
</tr>
```

---

## 5. Template-Architektur (Jinja2)

### 5.1 Basis-Template (_base.html)

Alle E-Mail-Templates sollen von einem gemeinsamen Basis-Template erben. Dies stellt sicher, dass Header und Footer konsistent sind und DSGVO-Pflichtangaben nie vergessen werden.

**Datei:** `apps/api/src/notifications/templates/_base.html`

**Block-Struktur:**

```
_base.html
|
|-- {% block preheader %}     --> Unsichtbarer Vorschautext fuer Inbox
|-- {% block header %}        --> Standard: Brand-Header (Demokratie-Blau)
|-- {% block content %}       --> Hauptinhalt (MUSS ueberschrieben werden)
|-- {% block footer %}        --> Standard: DSGVO-Footer mit Abmelde-Link
```

**Verwendung in Templates:**

```jinja2
{% extends "_base.html" %}

{% block preheader %}Willkommen bei Menschlichkeit Osterreich{% endblock %}

{% block content %}
<tr>
  <td style="padding:32px;">
    <h2 style="color:#2B231D; font-family:'Nunito Sans',Arial,sans-serif; font-size:18px; font-weight:700; margin:0 0 12px;">
      Willkommen, {{ first_name }}!
    </h2>
    <p style="color:#4A4039; font-family:'Source Sans 3',Arial,sans-serif; font-size:15px; line-height:24px; margin:0 0 16px;">
      Vielen Dank fuer Ihre Registrierung.
    </p>
  </td>
</tr>
{% endblock %}
```

### 5.2 Standard-Variablen

Jedes Template hat Zugriff auf folgende globale Variablen:

| Variable | Typ | Beschreibung | Beispiel |
|----------|-----|-------------|---------|
| `{{ preheader }}` | String | Vorschautext fuer E-Mail-Inbox | "Willkommen bei..." |
| `{{ unsubscribe_url }}` | URL | Funktionaler Opt-Out-Link | https://.../?token=abc |
| `{{ year }}` | Integer | Aktuelles Jahr (fuer Copyright) | 2026 |
| `{{ base_url }}` | URL | Basis-URL der Plattform | https://www.menschlichkeit-oesterreich.at |

### 5.3 Verzeichnisstruktur (Ziel)

```
apps/api/src/notifications/templates/
  _base.html                    <-- Basis-Template (NEU)
  _base_transactional.html      <-- Basis fuer Transaktions-Mails (NEU, ohne Abmelde-Link)
  welcome_email.html
  verify_email.html
  newsletter_doi.html
  newsletter_confirmed.html
  newsletter_unsubscribed.html
  password_reset_email.html
  contact_confirmation.html
  admin_alert.html
  donation_thank_you_email.html
  membership_received.html

apps/api/src/finance/templates/
  _base_finance.html            <-- Basis fuer Finance-Mails (NEU)
  invoice_email.html
  dunning_email.html
  invoice.html                  <-- PDF-Template
  dunning.html                  <-- PDF-Template
  receipt.html                  <-- PDF-Template
  membership_card.html          <-- PDF-Template
```

---

## 6. DSGVO-Pflichtbausteine

### 6.1 Uebersicht

| Baustein | Pflicht fuer | Inhalt | In _base.html |
|----------|-----------|--------|---------------|
| Absender-Adresse | Alle kommerziellen Mails | Vereinsname, Strasse, PLZ Ort | Ja (Footer) |
| Datenschutz-Link | Alle Mails | Link zu /datenschutz | Ja (Footer) |
| Impressum-Link | Alle Mails | Link zu /impressum | Ja (Footer) |
| Abmelde-Link | Alle Marketing/Newsletter | Funktionaler Opt-Out-Link | Ja (Footer, Marketing-Version) |
| Verarbeitungsgrund | Newsletter, Marketing | "Sie erhalten diese E-Mail, weil..." | Ja (Footer) |
| ZVR-Nummer | Alle Vereins-Mails | ZVR: 1182213083 | Ja (Footer) |

### 6.2 Pflicht nach E-Mail-Typ

| E-Mail-Typ | Absender | Datenschutz | Impressum | Abmelden | Verarbeitungsgrund | ZVR |
|------------|---------|-------------|-----------|----------|-------------------|-----|
| Newsletter | Pflicht | Pflicht | Pflicht | Pflicht | Pflicht | Pflicht |
| Marketing (Spenden-Aufruf) | Pflicht | Pflicht | Pflicht | Pflicht | Pflicht | Pflicht |
| Transaktional (Rechnung) | Pflicht | Pflicht | Pflicht | -- | -- | Pflicht |
| Transaktional (Passwort) | Pflicht | Pflicht | Pflicht | -- | -- | Pflicht |
| Intern (Admin-Alert) | -- | -- | -- | -- | -- | -- |

### 6.3 Zusaetzliche Anforderungen

- **List-Unsubscribe Header:** Alle Marketing-E-Mails muessen den HTTP-Header `List-Unsubscribe` setzen (wird im MailService konfiguriert, nicht im Template)
- **Absender-Format:** `Menschlichkeit Osterreich <noreply@menschlichkeit-oesterreich.at>`
- **Reply-To:** `kontakt@menschlichkeit-oesterreich.at` (damit Antworten ankommen)
- **Verarbeitungsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) fuer Newsletter, Art. 6 Abs. 1 lit. b DSGVO (Vertragserfuellung) fuer Transaktions-Mails

---

## 7. Migrations-Plan

### Phase 1: _base.html erstellen (KW 13)

**Ziel:** Basis-Template mit Header und DSGVO-Footer erstellen

| Schritt | Aktion | Dateien |
|---------|--------|---------|
| 1.1 | `_base.html` mit allen Pflichtbausteinen erstellen | _base.html (neu) |
| 1.2 | `_base_transactional.html` (ohne Abmelde-Link) erstellen | _base_transactional.html (neu) |
| 1.3 | `_base_finance.html` (mit Bankdaten im Footer) erstellen | _base_finance.html (neu) |
| 1.4 | MailService anpassen: `year` und `base_url` als globale Variablen | mail_service.py |

### Phase 2: Stub-Templates upgraden (KW 14-15)

**Ziel:** Alle 8 Stub-Templates auf _base.html umstellen und Brand-konform gestalten

| Schritt | Template | Basis | Geschaetzter Aufwand |
|---------|----------|-------|---------------------|
| 2.1 | verify_email.html | _base_transactional | 2h |
| 2.2 | newsletter_doi.html | _base | 2h |
| 2.3 | newsletter_confirmed.html | _base | 1h |
| 2.4 | newsletter_unsubscribed.html | _base | 1h |
| 2.5 | password_reset_email.html | _base_transactional | 2h |
| 2.6 | contact_confirmation.html | _base_transactional | 1h |
| 2.7 | admin_alert.html | _base_transactional | 1h |
| 2.8 | membership_received.html | _base | 2h |

### Phase 3: Production-Templates auf Base umstellen (KW 15-16)

**Ziel:** Die 4 existierenden Production-Templates auf das Base-System migrieren

| Schritt | Template | Aenderungen |
|---------|----------|-------------|
| 3.1 | welcome_email.html | Auf _base.html umstellen, Header-Farbe korrigieren |
| 3.2 | donation_thank_you_email.html | Auf _base.html umstellen, Lila nach Brand-Farben |
| 3.3 | invoice_email.html | Auf _base_finance.html umstellen, Farbe korrigieren |
| 3.4 | dunning_email.html | Auf _base_finance.html umstellen (Eskalationsfarben beibehalten) |

### Phase 4: Farben vereinheitlichen und Fehlende erstellen (KW 16-17)

**Ziel:** Alle Farben auf Brand Guidelines abstimmen, fehlende Templates erstellen

| Schritt | Aktion |
|---------|--------|
| 4.1 | Alle Farbreferenzen in Templates gegen Design Tokens pruefen |
| 4.2 | PDF-Templates (dunning.html, receipt.html, membership_card.html) implementieren |
| 4.3 | Fehlende E-Mail-Templates (donation_failed, recurring_donation_problem, etc.) erstellen |
| 4.4 | Visueller Vergleichstest in Litmus/Email on Acid durchfuehren |

### Risiken und Mitigationen

| Risiko | Mitigation |
|--------|-----------|
| Template-Aenderungen brechen bestehende Renders | Jinja2-Variablen-Kompatibilitaet sicherstellen, alte Variablen als deprecated beibehalten |
| Outlook-Rendering-Probleme | Conditional Comments (`<!--[if mso]>`) fuer Outlook-spezifische Fixes |
| Fehlende Tests | Vor jeder Phase E-Mail-Rendering in Litmus oder Email on Acid testen |
| MailService-Aenderungen | Backward-kompatible API beibehalten, neue Templates ueber Feature-Flag einschalten |

---

## 8. Checkliste fuer neue Templates

Jedes neue E-Mail-Template muss folgende Kriterien erfuellen:

- [ ] Erbt von `_base.html` oder `_base_transactional.html`
- [ ] Verwendet ausschliesslich Brand-Farben aus Abschnitt 2
- [ ] Alle Texte in oesterreichischem Deutsch
- [ ] CTA-Button verwendet Brand-Orange (#D84A1B)
- [ ] Footer enthaelt alle DSGVO-Pflichtangaben (Abschnitt 6)
- [ ] Preheader-Text definiert
- [ ] Alt-Texte fuer alle Bilder
- [ ] Getestet in: Gmail, Outlook 365, Apple Mail, iOS Mail
- [ ] WCAG AA Kontrast fuer allen Text geprueft
- [ ] Keine externen CSS-Dateien, alles inline
- [ ] Kein JavaScript (wird von allen Clients blockiert)
- [ ] Keine PII in Preheader oder Subject (DSGVO)
- [ ] Im MailService registriert mit Template-ID, Betreff und Preheader
