---
title: Mitgliederantrag & Spenden.prompt.md
description:
lastUpdated: 2026-03-31
status: ACTIVE
category: general
tags: ['expert']
version: 1.0.0
language: de-AT
audience: ['Team']
---

prompt – Mitgliederantrag & Spendenmodul (Menschlichkeit Österreich)

## 🎯 Ziel

Erzeuge für den Verein **Menschlichkeit Österreich** ein vollständiges digitales **Mitgliedschafts- und Spendenmanagementsystem**.
Das System muss **rechtskonform (Statuten, DSGVO, Vereinsrecht Österreich, Beitragsordnung 2025)**, **barrierefrei (WCAG 2.2 AA)**, **DSGVO-sicher**, **mehrsprachig**, **testbar** und **visuell optimiert für alle Endgeräte** sein.

---

## 🔹 Rechtliche & organisatorische Anforderungen

### Mitgliederantrag

- **Pflichtangaben**: Vorname, Nachname, Geburtsdatum, Adresse, E-Mail, optional Telefon.
- **Mitgliedsart**: ordentlich, außerordentlich, Ehrenmitglied (gemäß Statuten §5–§6).
- **Beitragskategorie**: Standard, ermäßigt, Härtefall (laut Beitragsordnung 2025).
- **Pflicht-Zustimmungen (Checkboxen, nicht vorausgewählt):**
  - Statutenanerkennung (§5 Statuten).
  - DSGVO-Einwilligung zur Datenverarbeitung (§16 Statuten, Art. 6 Abs. 1 lit. a DSGVO).
  - Beitragsordnung 2025 (Verpflichtung zur Zahlung).

- **Weitere Hinweise:**
  - Austritt (§7 Statuten).
  - Ausschluss (§8 Statuten).
  - Schiedsgericht (§14 Statuten).
  - Widerrufsrecht DSGVO (Art. 7 Abs. 3).

### Spendenformular

- **Spendenarten:** einmalig, wiederkehrend (monatlich, vierteljährlich, jährlich).
- **Zweckbindung:** Dropdown oder Chips für Projekte/Fonds.
- **Anonyme Spenden** optional.
- **Tribute/In Memoriam** Spenden (im Namen einer anderen Person).
- **Pflichtfelder:** Betrag (Preset + frei), Name, E-Mail, Zahlungsart, DSGVO-Zustimmung.
- **Bestätigung:** Erfolgsseite, E-Mail mit PDF-Beleg, jährliche Sammelbestätigung möglich.

---

## 🔹 Zahlungsarten (alle zulässigen & relevanten Optionen)

- **Bank**: Überweisung (IBAN), SEPA-Lastschrift/Dauerauftrag (Mandat).
- **Debitkarten**: Maestro, VISA Debit, Mastercard Debit.
- **Kreditkarten**: Visa, Mastercard, Amex.
- **Digitale Wallets**: PayPal, Apple Pay, Google Pay, Samsung Pay.
- **Sofort-/Online-Banking**: EPS (AT), Sofort/Klarna (EU), Giropay (DE, optional).
- **Alternative Anbieter**: Revolut, Wise (technisch SEPA/Karten).
- **POS/Physisch**: SumUp/Zettle-Terminal, Barzahlung (nur nach Absprache, Quittungspflicht).
- **Optional Zukunft**: Open Banking API/PSD2, Crypto (nur nach AML-Konzept).

---

## 🔹 Webseiten & Module

1. **Mitglied werden** – digitales Beitrittsformular (DSGVO, Statuten, Beitragsordnung, Zahlungsarten).
2. **Spenden** – einmalig & wiederkehrend, Zweckbindung, alle Zahlungsarten.
3. **Beitragsordnung** – eigene Seite + PDF-Download.
4. **Statuten** – eigene Seite + PDF-Download.
5. **DSGVO-Selbstservice** – Datenexport, Löschung, Widerruf.
6. **Zahlungsseite** – Schnittstelle zu PSPs (Stripe, PayPal, Klarna, EPS, SEPA).
7. **Mitgliederbereich** – Profil aktualisieren, Zahlungen einsehen, Dokumente herunterladen.
8. **Bestätigungsseite** – Zusammenfassung, PDF-Antrag/Beleg, automatisierte Mail.

---

## 🔹 Backend & CiviCRM-Anbindung

- **Entities**:
  - `contact.create` / `contact.get` → Mitglied/Spender.
  - `membership.create` → Mitgliedschaftstyp + Startdatum.
  - `contribution.create` → Spenden/Beiträge (Financial Type, Payment Instrument).
  - `contribution_recur.create` → wiederkehrende Zahlungen (Stripe/SEPA).
  - `SepaMandate.create` → SEPA-Lastschriftmandat.

- **Mapping**: Jede Zahlungsart → eigener `payment_instrument_id`.
- **PSP-Integration**: Stripe, PayPal, Klarna/Sofort, EPS – mit Webhooks für Status-Sync.
- **Finanzbuchhaltung**: Mapping auf Financial Accounts (Mitgliedsbeiträge, Spenden, Gebühren).

---

## 🔹 Technische Anforderungen

- **Frontend**: Mobile-first, responsiv, React/Tailwind oder SSR-Framework.
- **A11y**: Labels, ARIA, Fokus-Management, Kontraste ≥4.5:1.
- **i18n**: `lang`, `hreflang`, `data-i18n-key`.
- **Validierung**: Client (Regex, Pflichtfelder) + Server (Zod/Yup + Business Rules).
- **Sicherheit**: CSRF-Schutz, Rate-Limits, Idempotenz bei API-Calls, keine Speicherung sensibler Zahlungsdaten.
- **Protokollierung**: Zeitstempel + IP bei Zustimmungen (Audit-Trail).
- **Performance-Budgets**: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, initiales HTML ≤50KB.

---

## 🔹 Teststrategie & CI/CD

- **Unit-Tests**: Validierung, Mapper (Form → API Payload), Webhook-Parser.
- **E2E-Tests (Playwright)**: Happy-Path & Fehlerfälle für jede Zahlungsart.
- **Visuelle Regression**: xs/md/lg Snapshots aller Formulare.
- **Accessibility-Tests**: axe-core, keine „serious/critical“-Fehler.
- **Lighthouse**: mobil, Performance-Budgets enforced.
- **CI-Gates**: Builds schlagen fehl bei A11y-Fehlern, Visual-Diff >1 %, Payment-Flow-Fehlern.

---

## 🔹 Kontrollfragen

- Sind alle rechtlich erforderlichen Zustimmungen enthalten (DSGVO, Statuten, Beitragsordnung)?
- Ist der Aufnahme-Ablauf eingehalten (Antrag → Vorstand → Beitrag → Bestätigung)?
- Sind alle Zahlungsarten für Österreich/EU technisch korrekt implementiert?
- Werden DSGVO-Rechte abgebildet (Widerruf, Export, Löschung)?
- Ist alles barrierefrei (WCAG 2.2 AA)?
- Sind API-Calls idempotent & sicher?
- Sind alle Prozesse testbar (Unit, E2E, Visuell, A11y)?

---

## 🔹 Prompt-Satz (sofort nutzbar)

> „Erzeuge für den Verein _Menschlichkeit Österreich_ ein vollständiges digitales Mitglieder- & Spendenmanagementsystem gemäß Statuten 2025, Beitragsordnung 2025 und DSGVO.
> Liefere:
> – **Mitgliederantrag** inkl. Pflichtangaben, Zustimmungen (Statuten, DSGVO, Beitragsordnung), rechtlichem Ablauf (Vorstand entscheidet, Beitrag, Bestätigung).
> – **Spendenformular** für einmalig & wiederkehrend, mit Zweckbindung, Presets, Anonym/Tribute, DSGVO-Checkbox.
> – **Alle relevanten Zahlungsarten** (Bank, SEPA, Debitkarte, Kreditkarte, PayPal, Apple/Google Pay, EPS, Sofort, POS, Bar) mit CiviCRM-Mapping (`contact`, `membership`, `contribution`, `contribution_recur`, `SepaMandate`).
> – **Webseiten**: Mitglied werden, Spenden, Statuten, Beitragsordnung, DSGVO-Selbstservice, Zahlungsseite, Bestätigung, Mitgliederbereich.
> – **Technische Artefakte**: HTML/JSX-Formulare mit A11y/i18n, Validierungsschemata, API-Sequenzen, E-Mail-Templates, Tests (Playwright, axe-core, Lighthouse), CI/CD Pipeline mit Quality Gates.
> Stelle sicher: DSGVO-Konformität, WCAG 2.2 AA, Mobile-first Design, Performance-Budgets, sichere PSP-Integration ohne Speicherung sensibler Daten.
> Hänge am Ende eine **Checkliste (✅/⚠️)** an, die rechtliche & technische Abdeckung dokumentiert.“
