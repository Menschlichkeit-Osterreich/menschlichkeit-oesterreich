---
name: transparency-audit
description: Prüft die Transparenz-Compliance des Menschlichkeit Österreich Projekts — ZVR-Nummer 1182213083, Vereinsstatuten, Datenschutzerklärung und Impressum auf Vollständigkeit und Korrektheit. Wird aufgerufen bei `/transparency-audit`.
argument-hint: '[vollständig|schnell|datenschutz|impressum]'
allowed-tools:
  - Read
  - Grep
  - Bash
  - WebFetch
---

# Transparency Audit für Menschlichkeit Österreich

Du führst eine strukturierte Transparenz-Prüfung für den Verein Menschlichkeit Österreich durch.

## Vereinsdaten (unveränderlich)

- **ZVR-Nummer**: 1182213083
- **Vereinsname**: Menschlichkeit Österreich
- **Domain**: menschlichkeit-oesterreich.at
- **Datenschutz-URL**: https://menschlichkeit-oesterreich.at/datenschutz
- **Impressum-URL**: https://menschlichkeit-oesterreich.at/impressum

---

## Prüfschritt 1 — ZVR-Nummer in allen relevanten Dateien

Prüfe ob ZVR-Nummer `1182213083` vorkommt in:

```bash
grep -rn "1182213083" menschlichkeit-oesterreich-development/apps/website/src/
grep -rn "1182213083" menschlichkeit-oesterreich-development/apps/crm/
grep -rn "1182213083" menschlichkeit-oesterreich-development/ --include="*.md"
grep -rn "1182213083" menschlichkeit-oesterreich-development/ --include="*.html"
```

**Erwartete Fundorte:**

- [ ] Impressum-Seite (Website)
- [ ] Datenschutzerklärung (Website)
- [ ] CRM-Kontakt-Header (`apps/crm/`)
- [ ] CLAUDE.md oder README

Fehlende Fundorte als `[FEHLT]` markieren.

---

## Prüfschritt 2 — Impressum-Vollständigkeit (§ 5 ECG Österreich)

Lies die Impressum-Datei(en):

```bash
find menschlichkeit-oesterreich-development -name "impressum*" -o -name "Impressum*" | head -5
```

**Pflichtangaben gemäß § 5 ECG:**

- [ ] Vereinsname vollständig
- [ ] ZVR-Nummer: 1182213083
- [ ] Zuständige Aufsichtsbehörde
- [ ] Vertretungsberechtigte Person(en) / Vorstand
- [ ] Postanschrift
- [ ] E-Mail-Adresse
- [ ] Angabe des Vereinszwecks
- [ ] Vereinssitz / Bundesland

Jedes fehlende Pflichtfeld als `[FEHLT — § 5 ECG]` kennzeichnen.

---

## Prüfschritt 3 — Datenschutzerklärung (DSGVO Art. 13/14)

```bash
find menschlichkeit-oesterreich-development -name "datenschutz*" -o -name "Datenschutz*" | head -5
find menschlichkeit-oesterreich-development -name "privacy*" | head -5
```

**Pflichtinhalte gemäß DSGVO:**

- [ ] Verantwortlicher (Name + Adresse)
- [ ] Datenschutzbeauftragter oder Kontakt
- [ ] Zweck und Rechtsgrundlage der Verarbeitung
- [ ] Empfänger / Weitergabe an Dritte (Stripe, PayPal, CiviCRM)
- [ ] Speicherdauer
- [ ] Betroffenenrechte (Art. 15-22 DSGVO)
- [ ] Recht auf Beschwerde bei der Datenschutzbehörde Österreich
- [ ] Hinweis auf Cookie-Verwendung
- [ ] Einwilligungswiderruf (Newsletter)

---

## Prüfschritt 4 — Vereinsstatuten-Referenz

```bash
find menschlichkeit-oesterreich-development -name "statuten*" -o -name "Statuten*" -o -name "satzung*" | head -5
grep -rn "Statuten\|Vereinsstatut" menschlichkeit-oesterreich-development/ --include="*.md" | head -10
```

Prüfe ob die Statuten:

- [ ] Im Repository vorhanden oder verlinkt sind
- [ ] Den aktuellen Vereinszweck korrekt beschreiben
- [ ] Mit den CLAUDE.md-Angaben übereinstimmen

---

## Prüfschritt 5 — Cookie-Banner und Einwilligung

```bash
grep -rn "cookie\|Cookie\|Einwilligung\|consent" menschlichkeit-oesterreich-development/apps/website/src/ | grep -v "node_modules" | head -20
```

- [ ] Cookie-Banner mit Opt-In (nicht nur Opt-Out)
- [ ] Granulare Auswahl (notwendig / Analyse / Marketing)
- [ ] Einwilligung wird gespeichert und abrufbar

---

## Ausgabe

Erstelle einen strukturierten Bericht:

```
# Transparenz-Audit Menschlichkeit Österreich
Datum: [heute]
ZVR-Nummer: 1182213083

## Zusammenfassung
✅ Bestanden: X Prüfpunkte
⚠️  Warnung: X Punkte
❌ Fehler: X Pflichtangaben fehlen

## Details
[Alle Findings mit Dateipfad und Zeile]

## Empfehlungen
[Priorisierte Behebungsschritte]
```

Alle Ausgaben auf **Österreichisches Deutsch**.
