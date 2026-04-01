---
title: 'Rechnungspruefung'
description: 'Rechnungsprüfung - Jahresabschluss-Workflow'
lastUpdated: 2026-03-31
status: DEPRECATED
deprecatedDate: 2025-10-08
migrationTarget: .github/instructions/core/civicrm-vereinsbuchhaltung.instructions.md
category: verein
tags: ['verein']
version: '1.0.0'
language: de-AT
audience: ['Vereinsvorstand', 'Mitgliederverwaltung']
---

> **DEPRECATED** — Migriert nach `.github/instructions/core/civicrm-vereinsbuchhaltung.instructions.md`. Diese Datei bleibt nur als Referenz erhalten.

# Rechnungsprüfung - Jahresabschluss-Workflow

## 🎯 Ziel

Ordnungsgemäße Prüfung der Finanzgebarung des Vereins "Menschlichkeit Österreich" gemäß Statuten § 13 und gesetzlichen Anforderungen.

## 📋 Rechtliche Grundlagen

### Statuten § 13: Rechnungsprüfer\*innen

```markdown
AUFGABEN:
✓ Prüfung der gesamten Finanzgebarung
✓ Kontrolle von Jahresabschluss & Kassenführung
✓ Einsichtnahme in alle Finanzunterlagen
✓ Erstellung schriftlicher Prüfbericht
✓ Empfehlung zur Entlastung des Vorstands

ANFORDERUNGEN:

- 2 unabhängige Prüfer\*innen
- Amtszeit: 5 Jahre (Wiederwahl zulässig)
- Unabhängigkeit: Kein anderes Organ außer Mitgliederversammlung

RECHTE:

- Jederzeit Einsicht in Belege, Kontoauszüge, Verträge
- Auskunftspflicht des Vorstands
- Direkte Berichterstattung an Mitgliederversammlung
```

### Gesetzliche Grundlagen

- **Vereinsgesetz 2002 (VerG)** - Rechnungslegung & Prüfung
- **Bundesabgabenordnung (BAO) §§ 34-47** - Gemeinnützigkeit
- **Einkommensteuergesetz (EStG) § 18 Abs. 8** - Vereine

## 🚀 Workflow

### Phase 1: Vorbereitung (November - Dezember)

**Termin koordinieren:**

```markdown
Von: rechnungspruefer@menschlichkeit-oesterreich.at
An: kassier@menschlichkeit-oesterreich.at
Betreff: Prüfungstermin Jahresabschluss [JAHR]

Liebe\*r [KASSIER NAME],

wir bereiten die Rechnungsprüfung für das Geschäftsjahr [JAHR] vor.

Bitte bereite folgende Unterlagen vor:

1. Vollständiger Jahresabschluss (Einnahmen-Ausgaben-Rechnung)
2. Alle Kontoauszüge (Bankkonto + PayPal + Bar)
3. Belegsammlung (chronologisch sortiert)
4. Mitgliederverzeichnis mit Beitragszahlungen
5. Spendenübersicht (falls vorhanden)
6. Verträge & langfristige Verpflichtungen
7. Kassenbestands-Nachweis (Bar + Digital)

Vorgeschlagener Prüfungstermin: [DATUM]
Ort: [ORT] oder Remote via Video (mit Bildschirm-Sharing)

Bitte Bestätigung bis [DATUM].

Solidarische Grüße,
[RECHNUNGSPRÜFER*INNEN]
```

### Phase 2: Dokumentenprüfung (Januar)

**Prüf-Checkliste:**

#### 1. Formale Prüfung

```markdown
□ Jahresabschluss vollständig & korrekt datiert
□ Alle Belege vorhanden & nummeriert
□ Kontoauszüge lückenlos
□ Kassenbestände plausibel
□ Unterschriften & Freigaben vorhanden
```

#### 2. Inhaltliche Prüfung - Einnahmen

```sql
-- Via PostgreSQL MCP (CRM-Datenbank):
SELECT
  c.display_name AS mitglied,
  m.membership_type_id AS mitgliedsart,
  SUM(ct.total_amount) AS gezahlt,
  CASE
    WHEN m.membership_type_id = 1 THEN 36.00 -- Ordentlich
    WHEN m.membership_type_id = 2 THEN 36.00 -- Außerordentlich
    WHEN m.membership_type_id = 3 THEN 0.00  -- Ehren (beitragsfrei)
  END AS soll
FROM civicrm_contact c
JOIN civicrm_membership m ON c.id = m.contact_id
LEFT JOIN civicrm_contribution ct ON c.id = ct.contact_id
  AND YEAR(ct.receive_date) = [JAHR]
WHERE m.status_id = 1 -- Active
GROUP BY c.id, m.membership_type_id
HAVING soll > 0;

-- Erwartete Prüfung:
-- ✓ Alle aktiven Mitglieder haben gezahlt?
-- ✓ Beträge korrekt (Standard 36€, Ermäßigt 18€)?
-- ✓ Härtefälle dokumentiert?
-- ✓ Ehrenmitglieder korrekt beitragsfrei?
```

**Einnahmen-Kategorien prüfen:**

```markdown
1. MITGLIEDSBEITRÄGE:
   - Standard-Beiträge (36€ × [ANZAHL_STANDARD])
   - Ermäßigte Beiträge (18€ × [ANZAHL_ERMÄSSIGT])
   - Summe: [BETRAG] EUR
2. SPENDEN:
   - Privatspenden: [BETRAG] EUR
   - Firmenspenden: [BETRAG] EUR
   - Zweckgebundene Spenden: [BETRAG] EUR
3. SONSTIGE EINNAHMEN:
   - Veranstaltungen: [BETRAG] EUR
   - Merchandise: [BETRAG] EUR
   - Projektförderungen: [BETRAG] EUR

GESAMT EINNAHMEN: [BETRAG] EUR
```

#### 3. Inhaltliche Prüfung - Ausgaben

```markdown
PRÜFKRITERIEN FÜR GEMEINNÜTZIGKEIT (BAO §§ 34-47):

✓ Zweckbindung eingehalten?
→ Ausgaben müssen Vereinszweck (§ 3 Statuten) dienen

✓ Keine unzulässigen Zuwendungen?
→ AUSGESCHLOSSEN: Private Zwecke, Gewinnausschüttung
→ ZULÄSSIG: Aufwandsentschädigungen (Vorstand § 11 Abs. 8)

✓ Dokumentation vollständig?
→ Alle Belege mit Datum, Betrag, Zweck, Empfänger
```

**Ausgaben-Kategorien prüfen:**

```markdown
1. PROJEKTAUSGABEN (Kernbereich):
   - Bildungsarbeit: [BETRAG] EUR
     Beispiele: Workshop-Materialien, Referent\*innen-Honorare
   - Soziale Projekte: [BETRAG] EUR
     Beispiele: Sachspenden, Direkthilfe
   - Klimaschutz: [BETRAG] EUR
     Beispiele: Baumpflanzungen, Bildungsmaterialien
2. VERWALTUNGSKOSTEN:
   - Büromaterial: [BETRAG] EUR
   - Porto & Versand: [BETRAG] EUR
   - Versicherungen: [BETRAG] EUR
   - Rechtsberatung: [BETRAG] EUR
3. IT & INFRASTRUKTUR:
   - Webhosting (Plesk): [BETRAG] EUR
   - Domain-Registrierungen: [BETRAG] EUR
   - Software-Lizenzen: [BETRAG] EUR
   - E-Mail-Services: [BETRAG] EUR
4. ÖFFENTLICHKEITSARBEIT:
   - Drucksachen (Flyer, Plakate): [BETRAG] EUR
   - Social Media Ads: [BETRAG] EUR
   - Website-Entwicklung: [BETRAG] EUR
5. VERANSTALTUNGEN:
   - Raummieten: [BETRAG] EUR
   - Catering: [BETRAG] EUR
   - Technik-Ausstattung: [BETRAG] EUR

GESAMT AUSGABEN: [BETRAG] EUR
```

#### 4. Bilanzprüfung

```markdown
KASSENBESTAND ZUM 31.12.[JAHR]:

BANKKONTO (Erste Bank):
Saldo lt. Kontoauszug: [BETRAG] EUR
Saldo lt. Kassenbuch: [BETRAG] EUR
Differenz: [BETRAG] EUR ← MUSS 0 SEIN!

PAYPAL-KONTO:
Saldo lt. PayPal-Bericht: [BETRAG] EUR
Saldo lt. Kassenbuch: [BETRAG] EUR
Differenz: [BETRAG] EUR ← MUSS 0 SEIN!

BARGELD:
Zählung lt. Kassensturz: [BETRAG] EUR
Saldo lt. Kassenbuch: [BETRAG] EUR
Differenz: [BETRAG] EUR ← MUSS 0 SEIN!

GESAMT VERMÖGEN: [BETRAG] EUR
```

**Vermögensentwicklung:**

```markdown
Anfangsbestand 01.01.[JAHR]: [BETRAG] EUR

- Einnahmen [JAHR]: [BETRAG] EUR

* Ausgaben [JAHR]: [BETRAG] EUR
  = Endbestand 31.12.[JAHR]: [BETRAG] EUR

PLAUSIBILITÄTSPRÜFUNG:
✓ Saldo stimmt mit Kontoständen überein?
✓ Keine unklaren Bewegungen?
✓ Liquidität ausreichend für laufende Verpflichtungen?
```

### Phase 3: Stichprobenprüfung (Januar)

**Zufallsauswahl von Belegen:**

```python

# Via Python Script (scripts/audit-sample-selection.py):
import random
from datetime import datetime

def select_audit_samples(year, sample_size=20):
    """
    Wählt zufällige Belege für Stichprobenprüfung
    """
    # Query aus CRM-Datenbank
    all_transactions = query_transactions(year)

    # Stratifizierte Stichprobe:
    samples = {
        "high_value": [],  # Über 500€
        "medium_value": [], # 100-500€
        "low_value": [],   # Unter 100€
    }

    for tx in all_transactions:
        if tx.amount > 500:
            samples["high_value"].append(tx)
        elif tx.amount > 100:
            samples["medium_value"].append(tx)
        else:
            samples["low_value"].append(tx)

    # Mindestens 5 aus jeder Kategorie
    selected = (
        random.sample(samples["high_value"], min(5, len(samples["high_value"]))) +
        random.sample(samples["medium_value"], min(10, len(samples["medium_value"]))) +
        random.sample(samples["low_value"], min(5, len(samples["low_value"])))
    )

    return selected

# Ausführen:
samples = select_audit_samples(2025)
print(f"Prüfe {len(samples)} Belege im Detail")
```

**Detailprüfung je Beleg:**

```markdown
Beleg-ID: [NUMMER]
Datum: [DATUM]
Betrag: [BETRAG] EUR
Kategorie: [KATEGORIE]

PRÜFPUNKTE:
□ Original-Beleg vorhanden (Rechnung/Quittung)?
□ Datum & Betrag stimmen überein?
□ Zweck nachvollziehbar & vereinskonform?
□ Freigabe durch Vorstand dokumentiert (bei >200€)?
□ Buchung korrekt erfasst?
□ Umsatzsteuer korrekt (falls anwendbar)?
```

### Phase 4: Kassenprüfung vor Ort (Februar)

**Physischer Kassensturz:**

```markdown
Datum: [DATUM]
Uhrzeit: [UHRZEIT]
Anwesend: Kassier*in + 2 Rechnungsprüfer*innen

BARGELDZÄHLUNG:

- 200€ Scheine: [ANZAHL] × 200€ = [BETRAG] EUR
- 100€ Scheine: [ANZAHL] × 100€ = [BETRAG] EUR
- 50€ Scheine: [ANZAHL] × 50€ = [BETRAG] EUR
- 20€ Scheine: [ANZAHL] × 20€ = [BETRAG] EUR
- 10€ Scheine: [ANZAHL] × 10€ = [BETRAG] EUR
- 5€ Scheine: [ANZAHL] × 5€ = [BETRAG] EUR
- Münzen: [BETRAG] EUR

SUMME BARGELD: [BETRAG] EUR

ABGLEICH MIT KASSENBUCH:
Soll: [BETRAG] EUR
Ist: [BETRAG] EUR
Diff: [BETRAG] EUR ← Bei Differenz > 10€ → Abklärung!

Unterschriften:
[Kassier*in] [Rechnungsprüfer 1] [Rechnungsprüfer 2]
```

### Phase 5: Gemeinnützigkeitsprüfung (Februar)

**BAO §§ 34-47 Compliance Check:**

```markdown
1. AUSSCHLIESSLICHKEIT (§ 34 Abs. 2):
   □ Alle Ausgaben dienen ausschließlich gemeinnützigen Zwecken?
   □ Keine Gewinnausschüttung an Mitglieder?
   □ Keine unverhältnismäßigen Gehälter/Honorare?

2. UNMITTELBARKEIT (§ 34 Abs. 3):
   □ Verein führt Projekte selbst durch?
   □ Bei Kooperationen: Gemeinnützigkeit des Partners geprüft?

3. SELBSTLOSIGKEIT (§ 35):
   □ Keine Begünstigung von Einzelpersonen?
   □ Aufwandsentschädigungen angemessen & dokumentiert?
   □ Vorstand ehrenamtlich tätig?

4. MITTELVERWENDUNG (§ 45):
   □ Mind. 2/3 der Mittel für gemeinnützige Zwecke verwendet?
   □ Rücklagenbildung innerhalb Grenzen (max. 1/3)?
   □ Alle Ausgaben zeitnah (innerhalb 2 Jahre)?

5. DOKUMENTATION (§ 47):
   □ Jahresabschluss erstellt?
   □ Aufzeichnungen mind. 7 Jahre aufbewahrt?
   □ Gemeinnützigkeits-Nachweis für Spendenbescheinigungen?
```

### Phase 6: Prüfbericht erstellen (März)

**Struktur des Prüfberichts:**

```markdown
# PRÜFBERICHT GESCHÄFTSJAHR [JAHR]

Verein: Menschlichkeit Österreich (ZVR 1182213083)

## I. PRÜFUNGSAUFTRAG

Prüfung der Finanzgebarung gemäß Statuten § 13 für das Geschäftsjahr [JAHR].

Prüfungszeitraum: 01.01.[JAHR] - 31.12.[JAHR]
Prüfungsdatum: [DATUM]
Prüfer\*innen: [NAME 1], [NAME 2]

## II. GEPRÜFTE UNTERLAGEN

- Einnahmen-Ausgaben-Rechnung [JAHR]
- Kontoauszüge Erste Bank (Konto [NUMMER])
- PayPal-Transaktionsbericht
- Bargeldkasse (Kassenbuch + Belege)
- Belegsammlung (nummeriert 1-[ANZAHL])
- Mitgliederverzeichnis mit Beitragszahlungen
- Spendenübersicht
- Verträge & Verpflichtungen

## III. PRÜFUNGSERGEBNISSE

### 1. Kassenführung

✓ ORDNUNGSGEMÄSS

- Alle Belege vorhanden & korrekt verbucht
- Kontoauszüge lückenlos
- Kassenbuch sauber geführt
- Stichprobe (20 Belege): Keine Beanstandungen

### 2. Einnahmen-Ausgaben-Rechnung

Einnahmen gesamt: [BETRAG] EUR
davon Mitgliedsbeiträge: [BETRAG] EUR ([ANZAHL] Mitglieder)
davon Spenden: [BETRAG] EUR
davon Sonstige: [BETRAG] EUR

Ausgaben gesamt: [BETRAG] EUR
davon Projektausgaben: [BETRAG] EUR (XX%)
davon Verwaltung: [BETRAG] EUR (XX%)
davon IT & Infrastruktur: [BETRAG] EUR (XX%)

Jahresüberschuss/-fehlbetrag: [BETRAG] EUR

BEWERTUNG: ✓ PLAUSIBEL & NACHVOLLZIEHBAR

### 3. Vermögensstand 31.12.[JAHR]

Bankkonto: [BETRAG] EUR
PayPal: [BETRAG] EUR
Bargeld: [BETRAG] EUR

---

SUMME: [BETRAG] EUR

Vorjahr (31.12.[JAHR-1]): [BETRAG] EUR
Veränderung: [+/-BETRAG] EUR

BEWERTUNG: ✓ KORREKT ABGESTIMMT

### 4. Gemeinnützigkeit (BAO §§ 34-47)

✓ Ausschließlichkeit gewahrt
✓ Unmittelbarkeit gegeben
✓ Selbstlosigkeit eingehalten
✓ Mittelverwendung >2/3 für gemeinnützige Zwecke
✓ Dokumentation vollständig

BEWERTUNG: ✓ GEMEINNÜTZIGKEIT BESTÄTIGT

## IV. FESTSTELLUNGEN & EMPFEHLUNGEN

### Positive Punkte:

- Saubere Kassenführung durch Kassier\*in
- Lückenlose Dokumentation
- Gemeinnützige Zwecke konsequent verfolgt
- Transparente Finanzverwaltung

### Kleinere Hinweise:

- [Falls zutreffend: z.B. "Manche Belege könnten detaillierter beschriftet sein"]
- [Vorschlag: "Digitalisierung der Belege für bessere Archivierung"]

### Dringender Handlungsbedarf:

[NUR falls kritische Mängel vorliegen - sonst "Keine"]

## V. EMPFEHLUNG

Die Rechnungsprüfer\*innen empfehlen der Mitgliederversammlung die

✅ **ENTLASTUNG DES VORSTANDS FÜR DAS GESCHÄFTSJAHR [JAHR]**

Begründung:

- Ordnungsgemäße Kassenführung
- Gemeinnützigkeit gewahrt
- Statutenkonforme Mittelverwendung
- Transparente & nachvollziehbare Finanzgebarung

---

Ort, Datum: [ORT], [DATUM]

Unterschriften Rechnungsprüfer\*innen:

---

[NAME 1] [NAME 2]
```

### Phase 7: Präsentation an Mitgliederversammlung

**Vorbereitung:**

```markdown
PRÄSENTATIONSFOLIEN (PowerPoint/PDF):

Folie 1: TITEL
"Rechnungsprüfung [JAHR]"
Verein Menschlichkeit Österreich

Folie 2: FINANZÜBERSICHT
[Balkendiagramm]
Einnahmen: [BETRAG] EUR
Ausgaben: [BETRAG] EUR
Überschuss: [BETRAG] EUR

Folie 3: EINNAHMEN-BREAKDOWN
[Kreisdiagramm]

- Mitgliedsbeiträge: XX%
- Spenden: XX%
- Sonstige: XX%

Folie 4: AUSGABEN-BREAKDOWN
[Kreisdiagramm]

- Projektausgaben: XX% (Kernbereich!)
- Verwaltung: XX%
- IT & Infrastruktur: XX%

Folie 5: VERMÖGENSENTWICKLUNG
[Liniendiagramm]
2023: [BETRAG] EUR
2024: [BETRAG] EUR
2025: [BETRAG] EUR

Folie 6: PRÜFUNGSERGEBNIS
✅ Kassenführung ordnungsgemäß
✅ Gemeinnützigkeit bestätigt
✅ Keine Beanstandungen

Folie 7: EMPFEHLUNG
✅ ENTLASTUNG DES VORSTANDS

Abstimmung jetzt!
```

**Protokoll-Eintrag:**

```markdown
TOP X: Rechnungsbericht & Entlastung Vorstand

Rechnungsprüfer\*in [NAME] präsentiert Prüfbericht für [JAHR]:

- Einnahmen: [BETRAG] EUR
- Ausgaben: [BETRAG] EUR
- Überschuss: [BETRAG] EUR
- Vermögensstand: [BETRAG] EUR

Prüfungsergebnis: Ordnungsgemäß, gemeinnützig, keine Beanstandungen

Empfehlung: Entlastung des Vorstands

ABSTIMMUNG ENTLASTUNG:

- Dafür: [ANZAHL] Stimmen
- Dagegen: [ANZAHL] Stimmen
- Enthaltungen: [ANZAHL] Stimmen

BESCHLUSS: Vorstand für Geschäftsjahr [JAHR] einstimmig/mit [X] Gegenstimmen entlastet.
```

## 🛡️ Qualitätssicherung

### Vor Abschluss prüfen:

- [ ] Alle Unterlagen eingesehen
- [ ] Stichproben durchgeführt (mind. 20 Belege)
- [ ] Kassensturz protokolliert
- [ ] Gemeinnützigkeit geprüft
- [ ] Prüfbericht erstellt & unterschrieben
- [ ] Präsentation vorbereitet

### Dokumentation archivieren:

```bash

# Speicherort im Repository:
quality-reports/financial-audits/[JAHR]/
  ├── pruefbericht-[JAHR].pdf
  ├── kassenprotokoll-[JAHR].pdf
  ├── stichproben-[JAHR].xlsx
  ├── praesentation-mitgliederversammlung-[JAHR].pptx
  └── unterschriften/
        ├── pruefbericht-signed.pdf
        └── kassenprotokoll-signed.pdf

# Aufbewahrungsfrist: 7 Jahre (gesetzlich)
```

## 📊 Automatisierung via MCP & Scripts

### CRM-Daten exportieren (Python):

```python

# scripts/export-financial-data.py
import requests
from datetime import datetime

def export_contributions(year):
    """Exportiert Beitragszahlungen aus CiviCRM"""
    api_url = "https://crm.menschlichkeit-oesterreich.at/civicrm/ajax/api4"

    response = requests.post(
        f"{api_url}/Contribution/get",
        json={
            "where": [
                ["receive_date", ">=", f"{year}-01-01"],
                ["receive_date", "<=", f"{year}-12-31"]
            ],
            "select": [
                "contact_id.display_name",
                "total_amount",
                "receive_date",
                "financial_type_id:label"
            ]
        },
        headers={"X-Requested-With": "XMLHttpRequest"}
    )

    return response.json()

# Ausführung:
data = export_contributions(2025)
print(f"Exportiert: {len(data)} Beitragszahlungen")
```

### PostgreSQL MCP für Queries:

```sql
-- Mitgliedsbeiträge summieren:
SELECT
  YEAR(receive_date) AS jahr,
  financial_type_id AS typ,
  COUNT(*) AS anzahl_zahlungen,
  SUM(total_amount) AS summe
FROM civicrm_contribution
WHERE YEAR(receive_date) = 2025
GROUP BY YEAR(receive_date), financial_type_id;

-- Erwartet vs. Tatsächlich:
SELECT
  COUNT(CASE WHEN m.membership_type_id = 1 THEN 1 END) AS ordentlich_mitglieder,
  COUNT(CASE WHEN m.membership_type_id = 1 THEN 1 END) * 36 AS soll_einnahmen,
  SUM(ct.total_amount) AS ist_einnahmen,
  (SUM(ct.total_amount) - COUNT(CASE WHEN m.membership_type_id = 1 THEN 1 END) * 36) AS differenz
FROM civicrm_membership m
LEFT JOIN civicrm_contribution ct ON m.contact_id = ct.contact_id
  AND YEAR(ct.receive_date) = 2025
WHERE m.status_id = 1; -- Active members
```

## 🔍 Troubleshooting

### Problem: Kassendifferenz

```markdown
SYMPTOM: Soll ≠ Ist beim Kassensturz

LÖSUNGSSCHRITTE:

1. Letzte 10 Transaktionen nochmals prüfen
2. Belege gegen Kassenbuch abgleichen
3. Buchungsfehler suchen (Vertipper bei Beträgen)
4. Falls Differenz < 10€: Rundungsfehler akzeptabel
5. Falls > 10€: Detailanalyse mit Kassier\*in
```

### Problem: Fehlende Belege

```markdown
SYMPTOM: Buchung ohne Originalbeleg

LÖSUNGSSCHRITTE:

1. Kassier\*in kontaktieren: Beleg nachreichen
2. Bei Kleinbeträgen (<20€): Eigenbeleg akzeptieren
3. Bei größeren Beträgen: Duplikat beim Lieferanten anfordern
4. Als Anmerkung im Prüfbericht festhalten
```

### Problem: Unklare Zweckbindung

```markdown
SYMPTOM: Ausgabe nicht eindeutig gemeinnützig zuordenbar

LÖSUNGSSCHRITTE:

1. Vorstand nach Verwendungszweck befragen
2. Dokumentation nachfordern (z.B. Veranstaltungsprotokoll)
3. Bei Zweifeln: Finanzamt-Richtlinien konsultieren
4. Worst Case: Als nicht-gemeinnützig werten
```

## 📚 Referenzen

- **Statuten § 13:** Rechnungsprüfer\*innen
- **Vereinsgesetz 2002 (VerG):** Rechnungslegung
- **BAO §§ 34-47:** Gemeinnützigkeit
- **EStG § 18 Abs. 8:** Vereine
- **BMF-Richtlinien:** Spendenbescheinigungen

---

**Letzte Aktualisierung:** 2025-10-08  
**Version:** 1.0  
**Verantwortlich:** Rechnungsprüfer\*innen Menschlichkeit Österreich
