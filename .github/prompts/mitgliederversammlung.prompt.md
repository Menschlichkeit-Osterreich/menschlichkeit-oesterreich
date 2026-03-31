---
title: 'Mitgliederversammlung'
description: 'Mitgliederversammlung - Vorbereitungs-Workflow'
lastUpdated: 2026-03-31
status: DEPRECATED
deprecatedDate: 2025-10-08
category: verein
tags: ['verein']
version: '1.0.0'
language: de-AT
audience: ['Vereinsvorstand', 'Mitgliederverwaltung']
---

> **DEPRECATED** — Migriert nach `.github/chatmodes/mitgliederversammlung.prompt_DE.chatmode.md`. Diese Datei wird als Referenz beibehalten.

# Mitgliederversammlung - Vorbereitungs-Workflow

## 🎯 Ziel

Ordnungsgemäße Organisation und Durchführung der Mitgliederversammlung (MV) gemäß Statuten § 10 für den Verein "Menschlichkeit Österreich".

## 📋 Rechtliche Grundlagen

### Statuten § 10: Mitgliederversammlung

```markdown
OBERSTES ORGAN DES VEREINS

AUFGABEN:
✓ Genehmigung Tätigkeitsbericht
✓ Genehmigung Finanzbericht & Entlastung Vorstand
✓ Wahl/Abberufung Vorstand & Rechnungsprüfer\*innen
✓ Ernennung/Aberkennung Ehrenmitgliedschaften
✓ Festlegung Mitgliedsbeiträge
✓ Statutenänderungen (2/3 Mehrheit)
✓ Vereinsauflösung (2/3 Mehrheit)
✓ Strategische Ausrichtung

HÄUFIGKEIT:

- Mindestens 1x pro Jahr (Jahreshauptversammlung)
- Zusätzlich bei Bedarf (außerordentliche MV)

TEILNAHMEBERECHTIGUNG:

- Ordentliche Mitglieder: Stimm-, Wahl- & Antragsrecht
- Außerordentliche Mitglieder: Gastteilnahme (kein Stimmrecht)
- Ehrenmitglieder: Beratendes Stimmrecht

DURCHFÜHRUNG:

- Physisch, digital oder hybrid möglich
- Einberufung durch Vorstand
- Beschlussfähigkeit: Mind. 50% stimmberechtigte Mitglieder anwesend
```

## 🚀 Workflow

### Phase 1: Terminplanung (10-12 Wochen vor MV)

**Vorstandssitzung einberufen:**

```markdown
TAGESORDNUNG:

1. Festlegung MV-Termin (Samstag bevorzugt, 14-18 Uhr)
2. Format bestimmen (Präsenz/Hybrid/Online)
3. Veranstaltungsort reservieren (falls Präsenz)
4. Tagesordnung-Entwurf besprechen
5. Verantwortlichkeiten verteilen

BESCHLÜSSE:
✓ Termin: [DATUM + UHRZEIT]
✓ Ort: [ADRESSE] + Online-Link (Zoom/Jitsi)
✓ Tagesordnung: [siehe Phase 2]
✓ Zuständigkeiten:

- Einladung: Schriftführer\*in
- Berichte: Obperson + Kassier\*in
- Technik: [NAME]
- Protokoll: [NAME]
- Moderation: Obperson
```

### Phase 2: Tagesordnung erstellen (8-10 Wochen vor MV)

**Standard-Tagesordnung Jahreshauptversammlung:**

```markdown
MITGLIEDERVERSAMMLUNG [JAHR]
Verein Menschlichkeit Österreich (ZVR 1182213083)

Datum: [DATUM]
Uhrzeit: [UHRZEIT] - ca. [UHRZEIT+4h]
Ort: [ADRESSE] + Online (Link folgt)

TAGESORDNUNG:

1. BEGRÜSSUNG & FORMALIA (15 Min)
   - Eröffnung durch Obperson
   - Feststellung Beschlussfähigkeit
   - Genehmigung Tagesordnung
   - Wahl Protokollführer\*in
   - Wahl Stimmenzähler\*innen (2 Personen)

2. TÄTIGKEITSBERICHT [VORJAHR] (30 Min)
   - Präsentation Obperson
   - Projektberichte Arbeitsgruppen
   - Diskussion & Fragen

3. FINANZBERICHT [VORJAHR] (20 Min)
   - Präsentation Kassier\*in
   - Einnahmen-Ausgaben-Rechnung
   - Vermögensstand
   - Budget-Ausblick [LAUFENDES JAHR]

4. PRÜFBERICHT & ENTLASTUNG (15 Min)
   - Präsentation Rechnungsprüfer\*innen
   - Diskussion
   - **ABSTIMMUNG:** Entlastung Vorstand

5. NEUWAHLEN (45 Min) [NUR ALLE 5 JAHRE]
   - Kandidaturen & Vorstellungen
   - Wahl Obperson
   - Wahl Stellvertretende Obperson
   - Wahl Kassier\*in
   - Wahl Schriftführer\*in
   - Wahl Rechnungsprüfer\*innen (2 Personen)
   - **ABSTIMMUNGEN:** Geheime Wahl (Briefwahl möglich)

6. EHRENMITGLIEDSCHAFTEN (10 Min)
   - Vorschläge Vorstand
   - **ABSTIMMUNG:** Ernennung/Aberkennung

7. MITGLIEDSBEITRÄGE (15 Min)
   - Vorschlag Beitragsanpassung (falls nötig)
   - Diskussion
   - **ABSTIMMUNG:** Neue Beitragsordnung (falls Änderung)

8. STATUTENÄNDERUNGEN (30 Min) [FALLS ERFORDERLICH]
   - Vorstellung Änderungsanträge
   - Diskussion
   - **ABSTIMMUNG:** Statutenänderung (2/3 Mehrheit)

9. STRATEGISCHE PLANUNG (45 Min)
   - Vision & Ziele [LAUFENDES JAHR]
   - Schwerpunkt-Themen
   - Neue Projekte & Initiativen
   - Diskussion & Brainstorming

10. ANTRÄGE AUS MITGLIEDERN (20 Min)
    - Vorstellung eingegangener Anträge
    - Diskussion
    - **ABSTIMMUNGEN:** Je nach Antrag

11. VERSCHIEDENES (10 Min)
    - Sonstiges
    - Ausblick nächste Termine

12. ABSCHLUSS
    - Dank an Teilnehmende
    - Gemütlicher Ausklang (Buffet)

---

Anträge von Mitgliedern bitte bis [DATUM-2Wochen] an vorstand@menschlichkeit-oesterreich.at
```

### Phase 3: Einladung versenden (4-6 Wochen vor MV)

**E-Mail-Template (via n8n Automation):**

```markdown
Von: vorstand@menschlichkeit-oesterreich.at
An: [MITGLIEDER-VERTEILER]
Betreff: Einladung zur Mitgliederversammlung [JAHR] - [DATUM]

Liebe Mitglieder von Menschlichkeit Österreich,

hiermit laden wir herzlich zur

**MITGLIEDERVERSAMMLUNG [JAHR]**

ein.

📅 Datum: [WOCHENTAG], [DATUM]
🕐 Uhrzeit: [UHRZEIT] - ca. [UHRZEIT+4h]
📍 Ort: [VOLLSTÄNDIGE ADRESSE]
🌐 Online-Teilnahme: [ZOOM/JITSI-LINK] (wird 1 Woche vorher verschickt)

**TEILNAHME:**

- Ordentliche Mitglieder: Stimm-, Wahl- & Antragsrecht
- Außerordentliche Mitglieder: Gastteilnahme (kein Stimmrecht)
- Ehrenmitglieder: Beratendes Stimmrecht

**TAGESORDNUNG:**
[Siehe oben - komplette Tagesordnung einfügen]

**UNTERLAGEN:**
Im Anhang findet ihr:

- Tätigkeitsbericht [VORJAHR]
- Finanzbericht [VORJAHR]
- Prüfbericht Rechnungsprüfer\*innen
- Kandidaturen Neuwahlen (falls Wahljahr)
- Budget-Entwurf [LAUFENDES JAHR]

**ANTRÄGE:**
Anträge zur Tagesordnung bitte bis [DATUM-2Wochen] an:
vorstand@menschlichkeit-oesterreich.at

**ANMELDUNG:**
Bitte bis [DATUM-1Woche] Teilnahme bestätigen:
[LINK ZU ONLINE-FORMULAR] oder Antwort auf diese E-Mail

Bei Fragen: vorstand@menschlichkeit-oesterreich.at

Wir freuen uns auf eure Teilnahme!

Solidarische Grüße,
Der Vorstand von Menschlichkeit Österreich

---

Menschlichkeit Österreich
ZVR-Zahl: 1182213083
www.menschlichkeit-oesterreich.at
```

**Anhang-Dokumente (PDFs):**

```bash

# Automatisch generiert via Scripts:
quality-reports/mitgliederversammlung-[JAHR]/
  ├── 01_Einladung.pdf
  ├── 02_Taetigkeitsbericht_[VORJAHR].pdf
  ├── 03_Finanzbericht_[VORJAHR].pdf
  ├── 04_Pruefbericht_[VORJAHR].pdf
  ├── 05_Kandidaturen_Neuwahlen.pdf (falls Wahljahr)
  └── 06_Budget_Entwurf_[LAUFENDES_JAHR].pdf
```

### Phase 4: Berichte vorbereiten (3-4 Wochen vor MV)

**Tätigkeitsbericht (Obperson):**

```markdown
# TÄTIGKEITSBERICHT [VORJAHR]

Verein Menschlichkeit Österreich

## 1. ÜBERBLICK

[JAHR] war geprägt von [HAUPTTHEMEN]:

- [Projekt 1]: [Kurzbeschreibung + Erfolge]
- [Projekt 2]: [Kurzbeschreibung + Erfolge]
- [Projekt 3]: [Kurzbeschreibung + Erfolge]

## 2. MITGLIEDERENTWICKLUNG

Stand 31.12.[VORJAHR]: [ANZAHL] Mitglieder

- Ordentliche: [ANZAHL]
- Außerordentliche: [ANZAHL]
- Ehrenmitglieder: [ANZAHL]

Neuzugänge [VORJAHR]: [ANZAHL]
Austritte [VORJAHR]: [ANZAHL]

## 3. PROJEKTE & AKTIVITÄTEN

### Bildungsarbeit:

- [Anzahl] Workshops zu Themen: [Themen]
- [Anzahl] Teilnehmende insgesamt
- Kooperationen: [Partner-Organisationen]

### Soziale Projekte:

- [Projektname 1]: [Beschreibung, Zielgruppe, Ergebnis]
- [Projektname 2]: [Beschreibung, Zielgruppe, Ergebnis]

### Klimaschutz:

- [Initiative 1]: [Beschreibung, Ergebnis]
- [Initiative 2]: [Beschreibung, Ergebnis]

### Öffentlichkeitsarbeit:

- Website-Besuche: [ANZAHL] (Steigerung um XX%)
- Social Media Follower: [ANZAHL] (Steigerung um XX%)
- Pressemitteilungen: [ANZAHL]
- Medienberichte: [ANZAHL]

## 4. VERANSTALTUNGEN

- Mitgliederversammlung [VORJAHR-1]: [DATUM], [ANZAHL] Teilnehmende
- Stammtische: [ANZAHL] Treffen, durchschnittlich [ANZAHL] Personen
- Aktionen: [Aufzählung]

## 5. GREMIENARBEIT

- Vorstandssitzungen: [ANZAHL]
- Arbeitsgruppen: [ANZAHL] aktive Gruppen
  - AG [Thema 1]: [Aktivitäten]
  - AG [Thema 2]: [Aktivitäten]

## 6. AUSBLICK [LAUFENDES JAHR]

Geplante Schwerpunkte:

- [Ziel 1]
- [Ziel 2]
- [Ziel 3]

---

Erstellt: [DATUM]
[OBPERSON NAME + UNTERSCHRIFT]
```

**Finanzbericht (Kassier\*in):**

```markdown
# FINANZBERICHT [VORJAHR]

Verein Menschlichkeit Österreich

## EINNAHMEN-AUSGABEN-RECHNUNG

### EINNAHMEN:

Mitgliedsbeiträge: [BETRAG] EUR
Spenden Privatpersonen: [BETRAG] EUR
Spenden Firmen: [BETRAG] EUR
Sonstige Einnahmen: [BETRAG] EUR

---

SUMME EINNAHMEN: [BETRAG] EUR

### AUSGABEN:

Projektausgaben: [BETRAG] EUR (XX%)
Verwaltungskosten: [BETRAG] EUR (XX%)
IT & Infrastruktur: [BETRAG] EUR (XX%)
Öffentlichkeitsarbeit: [BETRAG] EUR (XX%)
Veranstaltungen: [BETRAG] EUR (XX%)

---

SUMME AUSGABEN: [BETRAG] EUR

### JAHRESERGEBNIS:

Einnahmen: [BETRAG] EUR
Ausgaben: [BETRAG] EUR

---

ÜBERSCHUSS/FEHLBETRAG: [BETRAG] EUR

## VERMÖGENSSTAND 31.12.[VORJAHR]:

Bankkonto: [BETRAG] EUR
PayPal: [BETRAG] EUR
Bargeld: [BETRAG] EUR

---

GESAMT: [BETRAG] EUR

## BUDGET-VORSCHLAG [LAUFENDES JAHR]:

Geplante Einnahmen: [BETRAG] EUR
Geplante Ausgaben: [BETRAG] EUR
Erwartetes Ergebnis: [BETRAG] EUR

---

Erstellt: [DATUM]
[KASSIER*IN NAME + UNTERSCHRIFT]
```

### Phase 5: Technik-Setup (1 Woche vor MV)

**Hybrid-MV Checkliste:**

```markdown
HARDWARE (Präsenz-Raum):
□ Beamer + Laptop (Präsentationen)
□ Mikrofon + Lautsprecher (für Online-Teilnehmende)
□ Webcam (gute Qualität, z.B. Logitech C920)
□ Stabile Internetverbindung (mind. 50 Mbit/s)
□ Verlängerungskabel + Mehrfachsteckdosen

SOFTWARE:
□ Zoom/Jitsi-Meeting angelegt

- Meeting-ID: [ID]
- Passwort: [PASSWORT]
- Warteraum aktiviert (Zutrittskontrolle)
- Aufzeichnung aktiviert (Protokoll-Zwecke)

□ Präsentationsfolien vorbereitet:

- Tätigkeitsbericht.pptx
- Finanzbericht.pptx
- Prüfbericht.pptx

□ Online-Abstimmungs-Tool:

- Mentimeter / Slido / Poll Everywhere
- Fragen vorbereitet (Entlastung, Wahlen, etc.)

TEILNEHMERVERWALTUNG:
□ Anmeldeliste (CRM-Export):

- Name, Mitgliedsart, Stimmrecht (Ja/Nein)
- Teilnahme (Präsenz/Online)

□ Anwesenheitsliste (zum Unterschreiben):

- Vorlage: quality-reports/mitgliederversammlung-[JAHR]/anwesenheitsliste.pdf
```

**Online-Link versenden (1 Woche vor MV):**

```markdown
Von: vorstand@menschlichkeit-oesterreich.at
An: [MITGLIEDER-VERTEILER]
Betreff: MV [JAHR] - Online-Zugang & letzte Infos

Liebe Mitglieder,

nur noch 1 Woche bis zur Mitgliederversammlung!

**ZUGANG FÜR ONLINE-TEILNAHME:**
🌐 Zoom-Link: [LINK]
🔑 Meeting-ID: [ID]
🔐 Passwort: [PASSWORT]

**WICHTIG FÜR ONLINE-TEILNEHMENDE:**

- Bitte 15 Min früher einwählen (Technik-Check)
- Mikrofon standardmäßig stummschalten
- Für Wortmeldung: "Hand heben"-Funktion nutzen
- Bei Abstimmungen: Reaktionen (👍/👎) oder Chat-Voting

**ABSTIMMUNGEN ONLINE:**
Wir nutzen [TOOL] für digitale Abstimmungen.
Link wird während der MV im Chat geteilt.

**UNTERLAGEN NOCHMAL IM ANHANG:**
[PDFs anbei]

Bei technischen Problemen am Tag:
📞 [TECHNIK-HOTLINE]
📧 technik@menschlichkeit-oesterreich.at

Wir freuen uns auf euch!

Solidarische Grüße,
Der Vorstand
```

### Phase 6: Durchführung am MV-Tag

**Ablauf-Checkliste:**

```markdown
⏰ [UHRZEIT-1h]: SETUP
□ Raum herrichten (Stühle, Tische, Beamer)
□ Technik aufbauen & testen
□ Online-Meeting öffnen (Warteraum aktiv)
□ Anwesenheitsliste auslegen
□ Getränke & Snacks bereitstellen

⏰ [UHRZEIT-30min]: EMPFANG
□ Teilnehmende begrüßen
□ Anwesenheitsliste unterschreiben lassen
□ Online-Teilnehmende einlassen (Identität prüfen!)
□ Stimmrechts-Überprüfung (nur ordentliche Mitglieder)

⏰ [UHRZEIT]: BEGINN
□ Obperson eröffnet MV
□ Beschlussfähigkeit feststellen:
Anwesend/Online: [ANZAHL] stimmberechtigte
Mind. 50% von [GESAMT]: [MINDESTANZAHL]
✅ BESCHLUSSFÄHIG / ❌ NICHT BESCHLUSSFÄHIG

□ Tagesordnung vorlesen & zur Abstimmung stellen
□ Protokollführer*in wählen
□ Stimmenzähler*innen wählen (2 Personen)

⏰ [UHRZEIT+15min]: BERICHTE
□ Tätigkeitsbericht präsentieren (30 Min)
□ Finanzbericht präsentieren (20 Min)
□ Prüfbericht präsentieren (15 Min)

⏰ [UHRZEIT+1h20min]: ABSTIMMUNG ENTLASTUNG
□ Diskussion eröffnen (5 Min)
□ Abstimmung durchführen:
Online: [TOOL]-Link im Chat
Präsenz: Handzeichen / Stimmkarten

Ergebnis:
✅ Dafür: [ANZAHL]
❌ Dagegen: [ANZAHL]
⚪ Enthaltungen: [ANZAHL]

→ Vorstand ist ENTLASTET / NICHT ENTLASTET

⏰ [UHRZEIT+1h30min]: WAHLEN (nur alle 5 Jahre)
[Siehe separate Wahl-Anleitung]

⏰ [UHRZEIT+2h30min]: STRATEGISCHE PLANUNG
□ Diskussion Schwerpunkte [LAUFENDES JAHR]
□ Brainstorming neue Projekte
□ Abstimmungen über Prioritäten

⏰ [UHRZEIT+3h30min]: ABSCHLUSS
□ Verschiedenes
□ Dank an alle
□ MV offiziell beenden
□ Gemütlicher Ausklang

⏰ [UHRZEIT+4h]: NACHBEREITUNG
□ Aufzeichnung beenden
□ Technik abbauen
□ Raum aufräumen
□ Protokoll-Entwurf beginnen
```

### Phase 7: Protokoll & Nachbereitung (1 Woche nach MV)

**Protokoll erstellen:**

```markdown
# PROTOKOLL MITGLIEDERVERSAMMLUNG [JAHR]

Verein Menschlichkeit Österreich (ZVR 1182213083)

**Datum:** [DATUM]
**Uhrzeit:** [BEGINN] - [ENDE]
**Ort:** [ADRESSE] + Online (Zoom)

**Anwesend:**

- Präsenz: [ANZAHL] Personen (siehe Anwesenheitsliste)
- Online: [ANZAHL] Personen (siehe Teilnehmerliste)
- **Gesamt:** [ANZAHL] stimmberechtigte Mitglieder

**Protokollführer\*in:** [NAME]
**Versammlungsleitung:** [NAME] (Obperson)

---

## TOP 1: BEGRÜSSUNG & FORMALIA

Obperson [NAME] eröffnet die Mitgliederversammlung um [UHRZEIT] und begrüßt alle Anwesenden.

**Beschlussfähigkeit:**
Anwesend: [ANZAHL] stimmberechtigte Mitglieder
Mindestquorum (50%): [MINDESTANZAHL]
→ ✅ BESCHLUSSFÄHIG

**Tagesordnung:**
BESCHLUSS: Tagesordnung wird einstimmig genehmigt.

**Protokollführung:**
BESCHLUSS: [NAME] wird als Protokollführer\*in gewählt. Einstimmig.

**Stimmenzähler\*innen:**
BESCHLUSS: [NAME 1] und [NAME 2] werden als Stimmenzähler\*innen gewählt. Einstimmig.

---

## TOP 2: TÄTIGKEITSBERICHT [VORJAHR]

Obperson [NAME] präsentiert Tätigkeitsbericht (siehe Anlage).

**Highlights [VORJAHR]:**

- [Projekt 1]: [Kurzbeschreibung]
- [Projekt 2]: [Kurzbeschreibung]
- Mitgliederstand: [ANZAHL] (+[ZUWACHS] gegenüber Vorjahr)

**Diskussion:**

- [NAME]: Frage zu [Thema] → Antwort: [...]
- [NAME]: Anregung zu [Thema] → Wird von Vorstand aufgenommen

---

## TOP 3: FINANZBERICHT [VORJAHR]

Kassier\*in [NAME] präsentiert Finanzbericht (siehe Anlage).

**Kennzahlen:**

- Einnahmen: [BETRAG] EUR
- Ausgaben: [BETRAG] EUR
- Überschuss: [BETRAG] EUR
- Vermögen 31.12.[VORJAHR]: [BETRAG] EUR

**Diskussion:**

- [NAME]: Frage zu Ausgabenposten "[KATEGORIE]" → Erklärung: [...]

---

## TOP 4: PRÜFBERICHT & ENTLASTUNG

Rechnungsprüfer\*in [NAME] präsentiert Prüfbericht (siehe Anlage).

**Prüfungsergebnis:**
✅ Kassenführung ordnungsgemäß
✅ Gemeinnützigkeit bestätigt
✅ Keine Beanstandungen

**Empfehlung:** Entlastung des Vorstands

**ABSTIMMUNG ENTLASTUNG:**

- Dafür: [ANZAHL] Stimmen
- Dagegen: [ANZAHL] Stimmen
- Enthaltungen: [ANZAHL] Stimmen

BESCHLUSS: Vorstand wird für Geschäftsjahr [VORJAHR] einstimmig/mehrheitlich entlastet.

---

## TOP 5: NEUWAHLEN (nur alle 5 Jahre)

[Falls Wahljahr - siehe Wahl-Protokoll]

---

## TOP 6: STRATEGISCHE PLANUNG

Diskussion Schwerpunkte [LAUFENDES JAHR]:

**Vorschläge aus Mitgliedern:**

- [NAME]: Projekt "[PROJEKTNAME]" → Wird von Vorstand geprüft
- [NAME]: Kooperation mit "[ORGANISATION]" → AG wird gegründet

**BESCHLUSS:**
Folgende Schwerpunkte werden für [LAUFENDES JAHR] festgelegt:

1. [Schwerpunkt 1]
2. [Schwerpunkt 2]
3. [Schwerpunkt 3]

Abstimmung: [X] Dafür, [Y] Dagegen, [Z] Enthaltungen → ANGENOMMEN

---

## TOP 7: VERSCHIEDENES

- [NAME]: Information zu [Thema]
- Nächste Termine:
  - Stammtisch: [DATUM]
  - Workshop: [DATUM]
  - Nächste MV: [DATUM (tentativ)]

---

## ABSCHLUSS

Obperson [NAME] bedankt sich bei allen für die Teilnahme und schließt die Mitgliederversammlung um [UHRZEIT].

---

**Anlagen:**

1. Tätigkeitsbericht [VORJAHR]
2. Finanzbericht [VORJAHR]
3. Prüfbericht [VORJAHR]
4. Anwesenheitsliste (Präsenz + Online)
5. Abstimmungsprotokolle (Screenshots [TOOL])

---

Ort, Datum: [ORT], [DATUM+1Woche]

Unterschriften:

---

[OBPERSON] [PROTOKOLLFÜHRER*IN]
```

**Protokoll-Versand:**

```markdown
Von: vorstand@menschlichkeit-oesterreich.at
An: [MITGLIEDER-VERTEILER]
Betreff: Protokoll Mitgliederversammlung [JAHR]

Liebe Mitglieder,

anbei das Protokoll unserer Mitgliederversammlung vom [DATUM].

**Wichtigste Beschlüsse:**
✅ Vorstand entlastet
✅ Schwerpunkte [LAUFENDES JAHR] festgelegt
[✅ Neuer Vorstand gewählt (falls Wahljahr)]

Vollständiges Protokoll im Anhang.

Bei Rückfragen: vorstand@menschlichkeit-oesterreich.at

Solidarische Grüße,
Der Vorstand

---

Anhang: Protokoll*MV*[JAHR].pdf
```

## 🛡️ Qualitätssicherung

### Vor MV prüfen:

- [ ] Einladung mind. 4 Wochen vorher versendet
- [ ] Alle Berichte vorbereitet & verschickt
- [ ] Technik getestet (Hybrid-Setup)
- [ ] Raum/Location gebucht
- [ ] Anträge aus Mitgliedern berücksichtigt
- [ ] Abstimmungs-Tools vorbereitet

### Während MV:

- [ ] Beschlussfähigkeit festgestellt
- [ ] Alle Abstimmungen dokumentiert
- [ ] Aufzeichnung läuft (für Protokoll)
- [ ] Anwesenheitsliste vollständig

### Nach MV:

- [ ] Protokoll innerhalb 1 Woche erstellt
- [ ] Protokoll an alle Mitglieder versendet
- [ ] Beschlüsse umgesetzt (z.B. neue Beitragsordnung)
- [ ] Unterlagen archiviert (mind. 7 Jahre)

## 📊 Automatisierung via n8n

**Workflow:** `automation/n8n/workflows/mitgliederversammlung.json`

**Trigger:** Manuell (Vorstand startet MV-Prozess)

**Nodes:**

1. **Schedule MV** → Termin eintragen
2. **Generate Reports** → CRM-Daten exportieren, PDFs erstellen
3. **Send Invitations** → E-Mail mit Anhängen an alle Mitglieder
4. **Reminder 1 Week** → Erinnerung + Online-Link
5. **Reminder 1 Day** → Letzte Erinnerung
6. **Post-MV Protocol** → Protokoll-Entwurf aus Aufzeichnung generieren
7. **Archive Documents** → Unterlagen in Repository speichern

## 📚 Referenzen

- **Statuten § 10:** Mitgliederversammlung
- **Statuten § 11:** Vorstand (Wahlen)
- **Vereinsgesetz 2002:** Anforderungen Versammlungen

---

**Letzte Aktualisierung:** 2025-10-08  
**Version:** 1.0  
**Verantwortlich:** Vorstand Menschlichkeit Österreich
