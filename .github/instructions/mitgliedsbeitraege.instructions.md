---
title: Beitragsordnung – Mitgliedsbeiträge, Fälligkeiten, Reduktionen & Mahnwesen (Österreich)
description: Beitragsordnung – Mitgliedsbeiträge, Fälligkeiten, Reduktionen & Mahnwesen (Österreich)
applyTo: '**'
priority: high
category: governance
status: ACTIVE
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
---

# Beitragsordnung – Menschlichkeit Österreich (gültig ab 01.07.2025)

Diese Anweisung konkretisiert die Beitragsordnung und operationalisiert Statuten (§§ 5, 7, 10, 11) für die Vereinsverwaltung. Rechtsgrundlagen: Vereinsgesetz 2002, BAO § 132 (Aufbewahrung 7 Jahre), DSGVO/DSG, TKG § 107 (Kommunikation).

## Beitragskategorien und Beträge

- Standard: 36,00 EUR/Jahr (3,00 EUR/Monat)
- Ermäßigt: 18,00 EUR/Jahr (1,50 EUR/Monat)
  - Anspruch: Studierende, Arbeitssuchende, Pensionist*innen, prekäre Lebenslagen (Nachweis/Erklärung ausreichend)
- Härtefall: 0,00 EUR (befreit; Beschluss Vorstand)
- Vorstand & Ehrenmitglieder: beitragsfrei (gemäß Beschluss und Statuten)

Hinweis: Bei Eintritt im laufenden Jahr anteilige Berechnung ab Beitrittsmonat.

## Fälligkeiten & Zahlungsarten

- Jahresbeitrag: fällig bis 31. März des Kalenderjahres
- Monatsbeitrag: fällig jeweils bis zum 5. des laufenden Monats
- Zahlungsarten:
  - Banküberweisung (IBAN wird individuell übermittelt)
  - SEPA-Dauerauftrag (empfohlen bei Monatsbeitrag)
  - Digitale Zahlung wie PayPal (nach Absprache)

## Ermäßigungen & Befreiungen

- Ermäßigung (18,00 EUR): auf Antrag oder Selbsterklärung – unbürokratisch, vertrauensbasiert.
- Härtefall-Befreiung (0,00 EUR): Antrag mit kurzer Begründung; Beschluss durch Vorstand (einfache Mehrheit); Dauer befristet (z. B. 12 Monate) oder bis Widerruf.
- Dokumentation: CRM-Feld „Beitragskategorie“ und „Befreiung bis [Datum]“; Nachvollziehbarkeit im Audit-Log (kein sensibler Beleg im Klartext ablegen – DSGVO!).

## Mahnwesen & Streichung (Statuten § 7)

- T+14 Tage nach Fälligkeit: Erste Zahlungserinnerung (freundlich, E-Mail; TKG § 107 beachten)
- T+30 Tage: Zweite Erinnerung (inkl. Hinweis auf mögliche Streichung)
- T+90 Tage: Streichung wegen Beitragsrückstand nach zwei Mahnungen (Vorstandsbeschluss protokollieren)
- Wirkung: Verlust der Mitgliedsrechte ab Beschluss; Reaktivierung jederzeit bei Zahlung/Neuantrag.

## DSGVO & BAO – Daten & Aufbewahrung

- Beitrags- und Finanzdaten: 7 Jahre aufbewahren (BAO § 132)
- Mitgliederdaten nach Austritt: 12 Monate (organisatorischer Nachlauf), danach löschen/pseudonymisieren, sofern keine rechtliche Pflicht entgegensteht
- Keine PII in freien Notizen; Konto-IBAN nur wenn nötig und möglichst nicht dauerhaft speichern – wenn unvermeidbar: Verschlüsselung (pgcrypto) und rollenbasierter Zugriff

## Operativer Ablauf (standardisiert)

1) Onboarding
- Kategorie erfassen (standard/ermäßigt/härtefall)
- Zahlungsart wählen, SEPA-Dauerauftrag empfehlen (Monatszahler)
- Willkommensmail inkl. Beitragsinfos (freundlicher Ton, österreichisches Deutsch)

2) Verrechnung
- Jahreszahler: Sammel-E-Mail im Jänner mit Zahlungsziel 31.03.
- Monatszahler: automatisierte Erinnerung am 1. und Fälligkeit am 5. des Monats

3) Mahnwesen
- Automatisierte Erinnerungen T+14 und T+30
- Entscheidungsvorlage an Vorstand bei T+90
- Streichungsbeschluss dokumentieren, Mitteilung an betroffene Person (respektvoll, inklusive Hinweis auf Wiedereintritt)

4) Reporting
- Monatsreport: Zahlungseingänge, offene Posten, Befreiungen (aggregiert)
- Quartalsweise Vorstandsreport: Trends, Empfehlungen (z. B. SEPA-Quote erhöhen)

## CRM- und Automationshinweise

- CRM-Felder: Mitgliedsart, Beitragskategorie, Zahlungsart, Befreiung-bis, Mahnstufe
- N8N/Automation: Erinnerungs- und Mahn-Workflows; Double-Opt-In/-Out beachten
- Keine PII in Logs – E-Mail/IBAN werden automatisch maskiert (PII-Sanitizer)

## Kommunikationsvorlagen (Kurzfassung)

- Zahlungserinnerung (freundlich):
  „Liebe/r {Vorname}, dein Mitgliedsbeitrag {Zeitraum} ist fällig. Wenn du Fragen hast oder eine Ermäßigung brauchst: Melde dich einfach. Danke für deine Unterstützung!“

- Letzte Mahnung:
  „Liebe/r {Vorname}, leider ist trotz Erinnerung noch kein Beitrag eingelangt. Bitte gib uns kurz Bescheid. Ohne Rückmeldung müssten wir gemäß Statuten nach 3 Monaten eine Streichung vornehmen. Wir finden gern gemeinsam eine Lösung.“

- Streichung:
  „Liebe/r {Vorname}, schweren Herzens mussten wir gemäß Statuten deine Mitgliedschaft streichen. Eine Reaktivierung ist jederzeit möglich – melde dich bitte.“

## Qualität & Compliance

- Messgrößen: SEPA-Quote, offene Posten < 5% der Mitglieder, Mahnläufe termingerecht, 0 DSGVO-Verstöße
- Reviews: Quartalsweise Abgleich Beitragsordnung/Statuten; Anpassungen via Mitgliederversammlung (§ 10)

---

Verantwortlich: Vorstand (Kassier*in)
Kontakt: finanzen@menschlichkeit-oesterreich.at
