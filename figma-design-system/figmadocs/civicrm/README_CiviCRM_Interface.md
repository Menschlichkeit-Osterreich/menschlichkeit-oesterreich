# 🏛️ CiviCRM Interface - Menschlichkeit Österreich

**Organisation:** Menschlichkeit Österreich  
**CMS:** Drupal 10  
**CiviCRM Version:** 5.74+  
**Timezone:** Europe/Vienna  
**Basis-URL:** https://menschlichkeit-oesterreich.at

---

## 📋 Übersicht

Vollständiges CiviCRM-Interface für Mitgliederverwaltung, Spenden, Events, Marketing und Automatisierung.

### Kernkomponenten
1. **SearchKit Dashboards** - 360° Kontaktansicht, Spender-Analytics, Mitgliederstatus
2. **Formulare** - Webform/Afform für Spenden, Beitritt, Events, Profil-Selfservice
3. **Integrationen** - E-Mail, Zahlungen (Stripe/SEPA), Banking, Mailchimp
4. **Automatisierung** - CiviRules + n8n Workflows

---

## 🎯 Interface-Struktur

### Hauptmenü (Drupal)
```
Navigation
├── Startseite
├── Über uns
├── Mitmachen
│   ├── Mitglied werden (Webform)
│   ├── Spenden (Webform)
│   └── Events (Übersicht)
├── Community
│   ├── Forum
│   ├── Mitglieder-Profil (CiviCRM)
│   └── Demokratie-Spiele
├── Admin (ACL: authenticated)
│   ├── CiviCRM Dashboard
│   ├── SearchKit Dashboards
│   ├── Mitgliederverwaltung
│   ├── Spendenverwaltung
│   └── Event-Management
```

### CiviCRM Dashboards (Internal)
```
CiviCRM Home
├── Kontakt-360 (SearchKit)
├── Spender-Dashboard (SearchKit)
├── Mitglieder-Status (SearchKit)
├── Event-Teilnehmer Live (SearchKit)
├── Banking-Import (CiviBanking)
└── SEPA-Batches (CiviSEPA)
```

---

## 🔍 SearchKit Dashboards

### 1. Kontakt-360 Übersicht (`contacts_360_overview`)

**Zweck:** Vollständige Kontaktansicht mit allen Aktivitäten

**Felder:**
- Contact ID, Name, E-Mail (primary)
- Gruppen (Smart + Static)
- Letzte Aktivität (Typ, Datum)
- Jahresbeiträge (SUM current year)
- Mitgliedsstatus (Current/Grace/Expired)
- Tags, Custom Fields

**Joins:**
```sql
Contact
├── LEFT JOIN Email (is_primary = 1)
├── LEFT JOIN GroupContact (status = 'Added')
├── LEFT JOIN Activity (via ActivityContact, ORDER BY activity_date DESC LIMIT 1)
├── LEFT JOIN Contribution (receive_date >= YEAR_START, GROUP BY contact_id)
└── LEFT JOIN Membership (status IN ['New','Current','Grace'])
```

**Filter:**
- Kontakttyp: Individual
- Nicht gelöscht (is_deleted = 0)
- Opt-Out berücksichtigen

**Display:** Table mit Pagination (25/50/100), Export CSV

**Actions:**
- "Kontakt öffnen" → `/civicrm/contact/view?reset=1&cid={contact_id}`
- "E-Mail senden" → Quick Action
- "Aktivität hinzufügen" → Quick Action

---

### 2. Spender-Dashboard (`donor_dashboard`)

**Zweck:** Spenden-Analytics, Kohorten, Recurring-Tracking

**Felder:**
- Contact Name, E-Mail
- Lifetime Total (SUM all contributions)
- Current Year Total
- Anzahl Spenden
- Durchschnittsspende
- Letzte Spende (Datum, Betrag)
- Recurring? (Flag)
- Payment Methode (Stripe/SEPA)
- Kohorte (Einmalspender/Regular/Major Donor)

**Joins:**
```sql
Contact
├── INNER JOIN Contribution (contribution_status = 'Completed')
├── LEFT JOIN ContributionRecur (via contribution_recur_id)
└── LEFT JOIN PaymentProcessor (via payment_processor_id)
```

**Filter:**
- Nur Completed Contributions
- Financial Type: "Donation" OR "Membership Fee"
- Optional: Date Range

**Display:**
- Table (sortierbar nach Lifetime/Year)
- Card View (Top 10 Donors)

**Charts (optional via ChartKit Extension):**
- Pie: Payment Methods
- Bar: Monthly Trend (Last 12 months)
- Funnel: One-time → Recurring Conversion

---

### 3. Mitglieder-Status Board (`members_status_board`)

**Zweck:** Mitgliedschafts-Monitoring, SEPA-Mandate, Mahnungen

**Felder:**
- Contact Name, E-Mail
- Membership Type (Supporter/Active/Champion)
- Status (New/Current/Grace/Expired)
- Start/End Date
- Fälligkeit (End Date - TODAY)
- SEPA-Mandat vorhanden? (Boolean via CiviSEPA)
- Mandatsreferenz
- Letzte Zahlung (Datum)
- Mahnstufe (Custom Field)

**Joins:**
```sql
Contact
├── INNER JOIN Membership
├── LEFT JOIN ContributionRecur (via CiviSEPA mapping)
└── LEFT JOIN SepaMandate (via contact_id)
```

**Filter:**
- Membership Status: Current, Grace, Expired (next 30 days)
- Sortierung: End Date ASC

**Display:**
- Table mit Color Coding:
  - 🟢 Current + SEPA OK
  - 🟡 Grace Period
  - 🔴 Expired / No SEPA
- Bulk Actions: "Erinnerungs-Mail senden"

**Automations (via CiviRules):**
- 30 Tage vor Ablauf → E-Mail "Mitgliedschaft verlängern"
- 7 Tage nach Ablauf → E-Mail "Mahnung 1"
- 14 Tage → "Mahnung 2"

---

### 4. Event-Teilnehmer Live (`event_attendees_live`)

**Zweck:** Echtzeit-Übersicht Events, Zahlungsstatus, Kommunikation

**Felder:**
- Event Name, Datum
- Contact Name, E-Mail
- Teilnehmerstatus (Registered/Attended/No-show)
- Betrag bezahlt (via Contribution)
- Zahlungsstatus (Pending/Completed)
- Bestätigungs-Mail versendet? (Activity: "Event Confirmation")
- Check-In Status (Custom Field)

**Joins:**
```sql
Event
├── INNER JOIN Participant
├── LEFT JOIN Contact (via participant.contact_id)
├── LEFT JOIN ParticipantPayment → Contribution
└── LEFT JOIN Activity (type = "Event Confirmation")
```

**Filter:**
- Event: Current & Upcoming
- Participant Status: Not "Cancelled"

**Display:**
- Grouped by Event
- Table pro Event mit Participants
- Quick Actions: "Check-In", "Send Reminder"

**Bulk Actions:**
- "Export Teilnehmerliste" (CSV)
- "Erinnerungs-Mail an alle Pending"

---

## 📝 Formulare (Webform CiviCRM)

### 1. Spendenformular (`/spenden`)

**URL:** https://menschlichkeit-oesterreich.at/spenden

**Felder:**

**Kontakt (Contact)**
- Anrede (Prefix)
- Vorname* (First Name)
- Nachname* (Last Name)
- E-Mail* (Email)
- Telefon (Phone)
- Adresse (Address: Street, Postal Code, City)

**Spende (Contribution)**
- Betrag* (Amount) - Select (10, 25, 50, 100, Custom)
- Zweck (Financial Type) - Select (Allgemeine Spende, Projekt XY)
- Nachricht (Note)
- Recurring? (Checkbox) → Erstellt ContributionRecur

**Datenschutz (Required)**
- [x] Datenschutzerklärung akzeptiert* (Required)
- [ ] Newsletter abonnieren (Opt-In → Gruppe "Newsletter")

**Payment Processor:**
- Stripe (Cards: Visa, Mastercard, Amex)

**Workflow:**
1. Submit → Webform Handler
2. CiviCRM Contact: Create/Update (Dedupe Rule: Email)
3. CiviCRM Contribution: Create (Status: Pending)
4. Stripe Checkout Session → Redirect
5. Webhook (success) → Update Contribution Status: Completed
6. CiviRules Trigger: "Contribution Completed" → Send Thank-You Email

**Thank-You Page:**
```
Vielen Dank für deine Spende!

Deine Spende von €{amount} wurde erfolgreich verarbeitet.
Spendenquittung: [PDF Download]

[Button: Zurück zur Startseite]
```

---

### 2. Mitglied werden (`/mitglied-werden`)

**URL:** https://menschlichkeit-oesterreich.at/mitglied-werden

**Felder:**

**Kontakt (Contact)**
- Anrede*, Vorname*, Nachname*
- E-Mail*, Telefon
- Geburtsdatum (Birth Date)
- Adresse (vollständig)

**Mitgliedschaft (Membership)**
- Typ* (Select)
  - Supporter (15 €/Monat)
  - Active (30 €/Monat)
  - Champion (50 €/Monat)
- Start Datum (Default: TODAY)
- Zahlungsweise*:
  - SEPA-Lastschrift (empfohlen)
  - Stripe (Kreditkarte)

**SEPA (conditional: if SEPA selected)**
- IBAN* (Validation: AT...)
- Kontoinhaber* (Account Holder)
- [x] SEPA-Mandat erteilen* (Checkbox → erzeugt SepaMandate)

**Datenschutz**
- [x] Datenschutzerklärung*
- [ ] Newsletter
- [ ] Event-Einladungen

**Workflow:**
1. Submit → Create Contact
2. Create Membership (Status: Pending)
3. IF SEPA:
   - Create SepaMandate (Type: RCUR)
   - Create ContributionRecur
   - Status → Pending (first debit)
4. IF Stripe:
   - Create Subscription via Stripe API
   - Webhook → Update Membership Status: New
5. Send "Willkommens-E-Mail" (CiviRules)

**Thank-You:**
```
Willkommen bei Menschlichkeit Österreich!

Deine Mitgliedschaft wurde beantragt.

SEPA: Erste Abbuchung erfolgt in 5-7 Werktagen.
Stripe: Zahlung erfolgreich, Mitgliedschaft aktiv.

[Button: Zum Mitgliedsbereich]
```

---

### 3. Event-Anmeldung (`/events/{event-id}`)

**URL:** https://menschlichkeit-oesterreich.at/events/workshop-demokratie

**Felder:**

**Kontakt**
- Vorname*, Nachname*, E-Mail*
- Telefon (optional)

**Event (Participant)**
- Event: [Auto-filled from URL]
- Teilnehmer-Typ (Individual / Organization)
- Anzahl Personen (Default: 1)

**Preis-Set (conditional)**
- Regulär (20 €)
- Ermäßigt (10 €) - Studierende/Arbeitslose
- Gratis (0 €) - Mitglieder

**Payment (if > 0 €)**
- Stripe Checkout

**Custom Fields**
- Ernährung (Vegetarisch/Vegan/Keine Einschränkungen)
- Besondere Bedürfnisse (Textarea)

**Workflow:**
1. Create Contact
2. Create Participant (Status: Pending)
3. IF Price > 0:
   - Create Contribution (via ParticipantPayment)
   - Stripe Checkout
   - Webhook → Update Participant Status: Registered
4. ELSE:
   - Update Status: Registered
5. Send "Event-Bestätigung" (CiviRules)

**Confirmation Email Template:**
```
Anmeldung bestätigt: {event.title}

Hallo {contact.first_name},

deine Anmeldung wurde erfolgreich bestätigt!

Event: {event.title}
Datum: {event.start_date}
Ort: {event.location}

Teilnehmer-Code: {participant.id}

[Button: Zum Kalender hinzufügen]
[Button: Event absagen]
```

---

### 4. Profil-Self-Service (`/mein-profil`)

**URL:** https://menschlichkeit-oesterreich.at/mein-profil

**Login:** Drupal User (authenticated)

**Felder (editable):**
- Name, E-Mail, Telefon
- Adresse
- Geburtsdatum
- Kommunikationspräferenzen:
  - [ ] Newsletter
  - [ ] Event-Einladungen
  - [ ] Umfragen
- Privacy:
  - [ ] Profil öffentlich sichtbar (im Forum)
  - [ ] Name in Spenderliste anzeigen

**SEPA-Mandate (readonly):**
- Liste aller Mandate (Reference, Status, Next Debit)
- Action: "Mandat widerrufen" (Status → Cancelled)

**Mitgliedschaften (readonly):**
- Current Membership Type, Status, End Date
- Action: "Upgrade" (Formular öffnen)

**Contributions (readonly):**
- Liste (Date, Amount, Type, Status, Receipt)

**GDPR Actions:**
- [Button: Datenexport anfordern] → Queue Job
- [Button: Konto löschen] → Anonymization Request

**Workflow:**
- Update Contact via APIv4
- Log Activity: "Profile Updated"

---

## 🎨 Design & UX

### Theme Integration (Drupal)
- **Frontend:** Olivero (Drupal 10 Default) mit Custom Glassmorphismus
- **CiviCRM Admin:** Angepasste Farben (Primary: #0d6efd, Gradient: orange-red)

### Custom CSS (CiviCRM)
```css
/* /sites/default/files/civicrm/custom_css/menschlichkeit.css */

:root {
  --menschlichkeit-primary: #0d6efd;
  --menschlichkeit-gradient: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
}

.crm-container {
  font-family: 'Inter', sans-serif;
}

.searchkit-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
}

.btn-primary {
  background: var(--menschlichkeit-gradient);
  border: none;
}
```

### Mobile Optimization
- Alle SearchKit Displays: Responsive Tables (Horizontal Scroll)
- Webforms: Single-Column Layout on Mobile
- Touch-Friendly Buttons (min 44px)

---

## 🔗 Navigation & Shortcuts

### Admin Quick Links (Menu Block)
```
CiviCRM Shortcuts
├── Neuer Kontakt
├── Neue Spende erfassen
├── Event erstellen
├── Mailing versenden
├── Banking-Import
└── SEPA-Batches
```

### User Quick Actions (Frontend)
```
Mein Bereich
├── Profil bearbeiten
├── Meine Spenden
├── Meine Events
├── Mitgliedschaft verwalten
└── Präferenzen
```

---

## 📊 Reports & Analytics

### Standard-Reports (CiviReport)
1. **Spenden-Übersicht** (Year-over-Year, by Type)
2. **Mitglieder-Entwicklung** (New/Renewals/Lapses)
3. **Event-Teilnahme** (Attendance Rate, Revenue)
4. **SEPA-Statistik** (Mandate, Failed Debits)

### Custom Dashboards (SearchKit + ChartKit)
- **Fundraising Dashboard:**
  - YTD Total vs. Goal (Progress Bar)
  - Top 10 Donors (Card List)
  - Monthly Trend (Line Chart)
  - Payment Methods (Pie Chart)

- **Membership Dashboard:**
  - Active Members (Total)
  - Renewal Rate (%)
  - Expirations next 90 days (Table)
  - Cohort Breakdown (Stacked Bar)

---

## 🔔 Notifications & Alerts

### CiviRules Auto-Notifications
1. **Spende eingegangen:**
   - Trigger: Contribution Completed
   - Action: Send Email "Danke für deine Spende"
   - Delay: Immediate

2. **Mitgliedschaft läuft ab:**
   - Trigger: Membership End Date - 30 days
   - Condition: Status = Current
   - Action: Send Email "Verlängerung"
   - Delay: Scheduled (daily cron)

3. **Event-Erinnerung:**
   - Trigger: Event Start Date - 3 days
   - Condition: Participant Status = Registered
   - Action: Send Email "Event-Reminder"

4. **Failed SEPA Debit:**
   - Trigger: SepaMandate Updated (Status = Failed)
   - Action: 
     - Send Email "Zahlung fehlgeschlagen"
     - Add Tag "Payment Issue"
     - Create Activity "Follow-up required"

### Admin Alerts (via n8n → Slack/Email)
- Daily: Banking Import Errors
- Weekly: Membership Lapses
- Monthly: Financial Summary

---

## ♿ Accessibility (WCAG 2.1 AA)

### SearchKit
- ✅ Keyboard Navigation (Tab, Arrow Keys)
- ✅ Screen Reader Labels (aria-label)
- ✅ Color Contrast ≥ 4.5:1
- ✅ Focus Indicators

### Webforms
- ✅ Labels for all inputs
- ✅ Error messages (inline + summary)
- ✅ Required fields marked with *
- ✅ ARIA live regions for dynamic content

### General
- ✅ Skip Links (Jump to Content)
- ✅ Semantic HTML (h1-h6 hierarchy)
- ✅ Alt texts for images

---

## 🔒 Security & Permissions

### Roles & ACLs
| Role | Permissions |
|------|-------------|
| **Anonymous** | View public pages, submit forms |
| **Authenticated** | View own profile, edit preferences |
| **Member** | Access member area, view member directory |
| **Staff** | View all contacts, edit contributions, manage events |
| **Admin** | Full CiviCRM access, Financial ACLs, System settings |

### Financial ACLs
- **View Financial Data:** Staff, Admin
- **Edit Financial Data:** Admin only
- **Delete Contributions:** Admin only (with audit log)

### GDPR Compliance
- ✅ Double Opt-In for Newsletter
- ✅ Unsubscribe Links in all mailings
- ✅ Data Export (Contact → Download PDF/CSV)
- ✅ Right to be Forgotten (Anonymization)
- ✅ Consent Tracking (Activities)

---

## 📈 Performance

### Caching
- **Drupal:** Page Cache, Dynamic Page Cache, BigPipe
- **CiviCRM:** Template Cache, Menu Cache

### Optimization
- **SearchKit:** Indexed columns (contact_id, email, last_modified_date)
- **Joins:** Efficient (LEFT JOIN only when necessary)
- **Pagination:** Max 100 rows per page
- **Lazy Loading:** Card displays load on scroll

### Monitoring
- **Slow Query Log:** Queries > 1s
- **Error Log:** PHP errors, CiviCRM exceptions
- **Uptime:** Pingdom/UptimeRobot

---

## 🔄 Data Flow

```
Frontend Form (Webform)
    ↓
Webform Handler (CiviCRM)
    ↓
APIv4 Contact/Contribution/Participant Create
    ↓
CiviRules Trigger
    ↓
Actions (Email, Tag, Activity)
    ↓
n8n Webhook (optional)
    ↓
External Systems (Mailchimp, Analytics)
```

---

## 📚 Dokumentation

### User Guides
- `docs/civicrm/user-guide/SPENDEN.md` - Spendenformular nutzen
- `docs/civicrm/user-guide/MITGLIED_WERDEN.md` - Mitgliedschaft beantragen
- `docs/civicrm/user-guide/PROFIL.md` - Profil-Self-Service

### Admin Guides
- `docs/civicrm/admin/SEARCHKIT.md` - Dashboards verwalten
- `docs/civicrm/admin/BANKING.md` - Banking-Import
- `docs/civicrm/admin/SEPA.md` - SEPA-Batches

### Developer Docs
- `docs/civicrm/developer/APIv4.md` - API-Referenz
- `docs/civicrm/developer/HOOKS.md` - Custom Hooks
- `docs/civicrm/developer/EXTENSIONS.md` - Genutzte Extensions

---

## 🎯 Next Steps

1. ✅ Interface-Struktur dokumentiert
2. ⏳ SearchKit Dashboards implementieren (API-Definitionen)
3. ⏳ Webforms erstellen & CiviCRM-Handler konfigurieren
4. ⏳ Integrationen aktivieren (siehe integrations/)
5. ⏳ CiviRules aufsetzen
6. ⏳ User Acceptance Testing (UAT)

---

<div align="center">
  <br />
  <strong>🏛️ CiviCRM Interface Ready for Implementation</strong>
  <br />
  <sub>Dokumentation: v1.0 | 11. Oktober 2025</sub>
</div>
