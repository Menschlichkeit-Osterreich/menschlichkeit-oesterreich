---
title: 'Mitgliederaufnahme'
description: 'Mitgliederaufnahme - Automatisierter Workflow'
lastUpdated: 2026-03-31
status: DEPRECATED
deprecatedDate: 2025-10-08
category: verein
tags: ['verein', 'dsgvo']
version: '1.0.0'
language: de-AT
audience: ['Vereinsvorstand', 'Mitgliederverwaltung']
---

> **DEPRECATED** — Migriert nach `.github/chatmodes/mitgliederaufnahme.prompt_DE.chatmode.md`. Diese Datei wird als Referenz beibehalten.

# Mitgliederaufnahme - Automatisierter Workflow

## 🎯 Ziel

Rechtskonforme Aufnahme neuer Mitglieder in den Verein "Menschlichkeit Österreich" gemäß Statuten § 5 und Beitragsordnung 2025.

## 📋 Voraussetzungen

### Rechtliche Grundlagen

- **Statuten § 5:** Mitgliedschaft (ordentlich/außerordentlich/ehren)
- **Statuten § 6:** Rechte und Pflichten
- **Statuten § 16:** Datenschutz (DSGVO-konform)
- **Beitragsordnung 2025:** Gültig ab 01.07.2025

### Technische Infrastruktur

- CRM-System (Drupal 10 + CiviCRM) verfügbar
- API-Backend (FastAPI) für Validierungen
- E-Mail-System konfiguriert (DKIM/SPF/DMARC)
- DSGVO-Compliance-Tools aktiv

## 🚀 Workflow

### Phase 1: Antragsprüfung

**Input:** Neuer Beitrittsantrag (digital oder physisch)

**Prüfschritte:**

1. **Vollständigkeit prüfen:**

   ```markdown
   Pflichtfelder:
   ✓ Vor- und Nachname
   ✓ Geburtsdatum
   ✓ Vollständige Adresse (Straße, PLZ, Ort)
   ✓ E-Mail-Adresse (gültig & erreichbar)
   ✓ Mitgliedsart gewählt (ordentlich/außerordentlich)
   ✓ Beitragskategorie gewählt (standard/ermäßigt/härtefall)
   ✓ DSGVO-Einwilligung erteilt (Checkbox/Unterschrift)
   ✓ Statutenbestätigung vorhanden
   ```

2. **Formale Validierung:**

   ```bash
   # Via API-Backend (FastAPI):
   POST /api/v1/members/validate
   {
     "email": "max.mustermann@example.at",
     "birthdate": "1990-05-15",
     "address": {
       "street": "Musterstraße 1",
       "postal_code": "3100",
       "city": "St. Pölten"
     },
     "membership_type": "ordentlich",
     "fee_category": "standard"
   }

   # Expected Response:
   {
     "valid": true,
     "duplicate_check": "no_match",
     "age_verification": "adult",
     "fee_calculation": {
       "annual": 36.00,
       "monthly": 3.00,
       "currency": "EUR"
     }
   }
   ```

3. **Duplikate ausschließen:**

   ```sql
   -- Via PostgreSQL MCP (CRM-Datenbank):
   SELECT id, display_name, email
   FROM civicrm_contact
   WHERE email = 'max.mustermann@example.at'
      OR (first_name = 'Max' AND last_name = 'Mustermann' AND birth_date = '1990-05-15')
   LIMIT 1;

   -- Bei Treffer: Kontaktaufnahme mit Antragsteller
   ```

### Phase 2: Vorstandsbeschluss

**Rechtliche Basis:** Statuten § 5 Abs. 2 - "Entscheidung durch Vorstand in einfacher Mehrheit"

**Vorbereitung:**

1. **Antragsliste erstellen:**

   ```markdown
   # Neuzugänge zur Vorstandssitzung vom [DATUM]

   ## Anträge ordentliche Mitgliedschaft:

   1. Max Mustermann (\*15.05.1990) - Standard (36€/Jahr)
   2. Anna Schmidt (\*22.11.1985) - Ermäßigt (18€/Jahr, Studentin)

   ## Anträge außerordentliche Mitgliedschaft:

   1. Firma XY GmbH - Standard (36€/Jahr)

   ## Empfehlung: ANNAHME ALLER ANTRÄGE

   (Keine rechtlichen/satzungsmäßigen Hinderungsgründe)
   ```

2. **Vorstandsbeschluss dokumentieren:**

   ```markdown
   BESCHLUSS NR. [YYYY-MM-DD-001]

   Datum: [DATUM]
   Anwesend: Obperson, Stellvertreter*in, Kassier*in, Schriftführer\*in

   BESCHLOSSEN:
   ✓ Aufnahme folgender Personen als ordentliche Mitglieder: [Namen]
   ✓ Aufnahme folgender Personen als außerordentliche Mitglieder: [Namen]
   ✓ Beitrittsdatum: [DATUM] (rückwirkend zum Antragseingang)
   ✓ Erste Beitragszahlung fällig: [DATUM] (31. März bzw. 5. des Monats)

   Abstimmungsergebnis: [X:Y] (einstimmig/mehrheitlich)

   Unterschriften:
   [Obperson] [Schriftführer*in]
   ```

### Phase 3: CRM-Eintrag

**System:** Drupal 10 + CiviCRM

**Schritte:**

1. **Kontakt anlegen:**

   ```php
   // Via CiviCRM API:
   POST /civicrm/ajax/api4/Contact/create
   {
     "first_name": "Max",
     "last_name": "Mustermann",
     "birth_date": "1990-05-15",
     "email_primary.email": "max.mustermann@example.at",
     "phone_primary.phone": "+43 650 1234567",
     "address_primary.street_address": "Musterstraße 1",
     "address_primary.postal_code": "3100",
     "address_primary.city": "St. Pölten",
     "contact_type": "Individual"
   }
   ```

2. **Mitgliedschaft zuweisen:**

   ```php
   POST /civicrm/ajax/api4/Membership/create
   {
     "contact_id": [CONTACT_ID],
     "membership_type_id": [TYPE_ID], // 1=ordentlich, 2=außerordentlich, 3=ehren
     "status_id": 1, // 1=Active
     "join_date": "2025-10-08",
     "start_date": "2025-10-08",
     "end_date": null // Unbegrenzt, bis Austritt
   }
   ```

3. **Beitragskategorie setzen:**

   ```php
   POST /civicrm/ajax/api4/CustomValue/create
   {
     "entity_id": [CONTACT_ID],
     "custom_fee_category": "standard", // standard/ermäßigt/härtefall
     "custom_payment_frequency": "annually", // annually/monthly
     "custom_amount": 36.00
   }
   ```

4. **DSGVO-Einwilligung dokumentieren:**
   ```php
   POST /civicrm/ajax/api4/Activity/create
   {
     "activity_type_id": [CONSENT_TYPE_ID],
     "source_contact_id": [CONTACT_ID],
     "subject": "DSGVO-Einwilligung Mitgliedschaft",
     "details": "Einwilligung erteilt gemäß § 16 Statuten am [DATUM], IP: [IP_ADDRESS]",
     "status_id": 2, // Completed
     "activity_date_time": "[TIMESTAMP]"
   }
   ```

### Phase 4: Willkommenspaket

**Automatischer Versand via n8n Workflow:**

**E-Mail-Template:**

```markdown
Betreff: Willkommen bei Menschlichkeit Österreich! 🎉

Liebe\*r [VORNAME],

herzlich willkommen im Verein Menschlichkeit Österreich!

Deine Mitgliedschaft wurde durch den Vorstand am [DATUM] bestätigt.

**Deine Mitgliedsdaten:**

- Name: [VOLLSTÄNDIGER NAME]
- Mitgliedsnummer: [MEMBER_ID]
- Mitgliedsart: [ordentlich/außerordentlich]
- Beitragskategorie: [standard/ermäßigt/härtefall]
- Beitrag: [BETRAG] EUR/Jahr (bzw. [MONATSBEITRAG] EUR/Monat)

**Wichtige Informationen:**

📋 Statuten & Beitragsordnung:
https://menschlichkeit-oesterreich.at/verein/dokumente

💰 Beitragszahlung:
IBAN: [IBAN wird individuell übermittelt]
Verwendungszweck: Mitgliedsbeitrag [YEAR] - [MEMBER_ID]
Fälligkeit: [DATUM]

🔐 CRM-Zugang:
https://crm.menschlichkeit-oesterreich.at
Benutzername: [EMAIL]
Passwort: [wird separat gesendet]

🎮 Gaming Platform:
https://web.menschlichkeit-oesterreich.at
Sammle XP durch Engagement!

📅 Nächste Termine:

- Mitgliederversammlung: [DATUM]
- Stammtisch: [DATUM]
- Workshop: [DATUM]

Bei Fragen: info@menschlichkeit-oesterreich.at

Solidarische Grüße,
Der Vorstand von Menschlichkeit Österreich

---

Menschlichkeit Österreich
ZVR-Zahl: 1182213083
www.menschlichkeit-oesterreich.at
```

**Beilage-Dokumente (PDF):**

- [ ] Statuten (Stand 21.05.2025)
- [ ] Beitragsordnung (Stand 01.07.2025)
- [ ] Datenschutzerklärung (DSGVO)
- [ ] Leitbild & Vision

### Phase 5: Gaming Platform Integration

**XP-Belohnung für Beitritt:**

```typescript
// Via Gaming API:
POST /api/v1/users/achievements
{
  "user_id": [MEMBER_ID],
  "achievement_id": "new_member",
  "xp_reward": 100,
  "title": "Neue*r Aktivist*in",
  "description": "Du bist dem Verein beigetreten!",
  "unlocked_at": "[TIMESTAMP]"
}

// Response:
{
  "success": true,
  "user_xp_total": 100,
  "level": 1,
  "next_level_xp": 500,
  "message": "Glückwunsch! Du hast dein erstes Achievement freigeschaltet!"
}
```

**Profil verknüpfen:**

```sql
-- Via PostgreSQL MCP (Gaming DB):
UPDATE "User"
SET
  email = 'max.mustermann@example.at',
  "displayName" = 'Max Mustermann',
  "totalXP" = 100,
  "currentXP" = 100,
  level = 1,
  "createdAt" = NOW(),
  "updatedAt" = NOW()
WHERE id = [USER_ID];
```

### Phase 6: Monitoring & Nachverfolgung

**KPIs tracken:**

```json
{
  "new_members_this_month": 5,
  "membership_types": {
    "ordentlich": 3,
    "außerordentlich": 2
  },
  "fee_categories": {
    "standard": 4,
    "ermäßigt": 1,
    "härtefall": 0
  },
  "conversion_rate": "80%", // Von Antrag zu Aufnahme
  "average_processing_time": "3 days",
  "gdpr_compliance": "100%"
}
```

**Offene Beiträge überwachen:**

```bash

# Via n8n Workflow (täglich 9:00 UTC):

# 1. Query CRM für überfällige Beiträge

# 2. Automatische Mahnung nach 30 Tagen

# 3. Zweite Mahnung nach 60 Tagen

# 4. Streichungsverfahren nach 90 Tagen (gemäß Statuten § 7)
```

## 🛡️ Qualitätssicherung

### DSGVO-Compliance prüfen:

- [ ] Einwilligung dokumentiert (IP + Timestamp)
- [ ] Zweckbindung eingehalten
- [ ] Betroffenenrechte (Art. 15-21) informiert
- [ ] Verschlüsselte Speicherung sensibler Daten
- [ ] Zugriffskontrolle aktiv (rollenbasiert)

### Statutenkonformität:

- [ ] Vorstandsbeschluss dokumentiert
- [ ] Beitragskategorie korrekt zugeordnet
- [ ] Mitgliedsart gemäß Statuten § 5
- [ ] Rechte & Pflichten kommuniziert

### Technische Qualität:

- [ ] CRM-Eintrag vollständig
- [ ] E-Mail-Versand erfolgreich
- [ ] Gaming-Profil verknüpft
- [ ] Finanzmodul aktualisiert

## 📊 Automatisierung via n8n

**Workflow:** `automation/n8n/workflows/member-onboarding.json`

**Trigger:** Webhook bei neuem Beitrittsantrag

**Nodes:**

1. **Webhook Receive** → Antragsdaten empfangen
2. **API Validation** → FastAPI /members/validate
3. **Duplicate Check** → PostgreSQL Query
4. **Vorstand Notification** → E-Mail an Vorstand
5. **Wait for Approval** → Manueller Vorstandsbeschluss
6. **CRM Create Contact** → CiviCRM API
7. **Send Welcome Email** → SMTP mit Templates
8. **Gaming Achievement** → POST /achievements
9. **Slack Notification** → Team informieren
10. **Quality Report** → Metrics aktualisieren

## 🔍 Troubleshooting

### Fehler: E-Mail-Duplikat

```markdown
SYMPTOM: CRM meldet "Email already exists"

LÖSUNG:

1. Prüfen ob bereits Mitglied
2. Falls inaktiv/ausgetreten: Reaktivieren statt neu anlegen
3. Falls Tippfehler: Korrektur anfordern
```

### Fehler: DSGVO-Einwilligung fehlt

```markdown
SYMPTOM: Checkbox nicht gesetzt

LÖSUNG:

1. Antrag NICHT verarbeiten
2. Rückmeldung an Antragsteller\*in
3. Erneute Einreichung mit Einwilligung
```

### Fehler: Beitragskategorie unklar

```markdown
SYMPTOM: Ermäßigung beantragt ohne Nachweis

LÖSUNG:

1. Nachfrage bei Antragsteller\*in
2. Nachweis einfordern (z.B. Studienbestätigung, AMS-Bescheid)
3. Vorstandsentscheidung bei Härtefall
```

## 📚 Referenzen

- **Statuten § 5:** Mitgliedschaft
- **Statuten § 16:** Datenschutz
- **Beitragsordnung 2025:** Tarife & Zahlungsmodalitäten
- **DSGVO Art. 6:** Rechtmäßigkeit der Verarbeitung
- **DSGVO Art. 15-21:** Betroffenenrechte

---

**Letzte Aktualisierung:** 2025-10-08  
**Version:** 1.0  
**Verantwortlich:** Vorstand Menschlichkeit Österreich
