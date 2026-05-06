# Token-Uebergabe-Template

Status: Vorlage
Zweck: einheitliche Uebergabe fuer persoenliche, workflowbezogene, produktive, interne und temporaere Notfall-Tokens

## Verwendung

- Pro Token oder tokenaehnlichem Zugang genau ein ausgefuelltes Blatt.
- Keine echten Secret-Werte in dieses Dokument schreiben.
- Primaerablage und Injektionspunkt muessen getrennt dokumentiert werden.
- Produktive Tokens duerfen nur mit Verweis auf die kanonische Ablage uebergeben werden.

## 1. Identitaet

- Token-Name:
- Token-Klasse: persoenlich / workflow / produktiv / intern / notfall
- Kurzbeschreibung:
- Systembereich:
- Kritikalitaet: hoch / mittel / niedrig

## 2. Zweck

- Exakter Einsatzzweck:
- Welche Funktion ohne dieses Token nicht funktioniert:
- Was ausdruecklich nicht damit gemacht werden darf:

## 3. Eigentum und Verantwortung

- Fachlicher Owner:
- Technischer Owner:
- Stellvertretung:
- Freigabe durch:

## 4. Ablage und Quelle der Wahrheit

- Primaerablage:
- Sekundaerer Injektionspunkt:
- Ist Bitwarden die Quelle der Wahrheit: ja / nein
- Falls nein: begruendete Ausnahme:

## 5. Nutzungspfad

- Lokal genutzt: ja / nein
- GitHub Actions genutzt: ja / nein
- Produktiv genutzt: ja / nein
- Betroffene Workflows:
- Betroffene Systeme:
- Betroffene Environments:

## 6. Rechte

- Benoetigte Minimalrechte:
- Ablaufdatum:
- IP-/Scope-Beschraenkung:
- Besondere Schutzmassnahmen:

## 7. Rotation

- Letzte Rotation:
- Naechste geplante Rotation:
- Rotationsanlass:
- Rotationsschritte:
  1. Neues Token erzeugen
  2. In Primaerablage aktualisieren
  3. Injektionspunkt aktualisieren
  4. Smoke-Test ausfuehren
  5. Altes Token widerrufen
  6. Nachweis dokumentieren

## 8. Incident-Prozess

- Was tun bei Verdacht auf Offenlegung:
- Wer wird informiert:
- Sofortmassnahmen:
- Widerruf erfolgt wo:
- Nachkontrolle erfolgt wie:

## 9. Offene Validierung

- Ist die produktive Nutzung live bestaetigt:
- Letzter belastbarer Nachweis:
- Offene Risiken:
- Offene Abhaengigkeiten:

## 10. Uebergabestatus

- Vollstaendig uebergeben am:
- Empfaenger:
- Rueckfragen offen:
- Freigabestatus: offen / vollstaendig / erneut pruefen

## Kurzcheck vor Freigabe

- Kein Secret-Wert im Dokument
- Genau ein fachlicher Owner benannt
- Genau eine Primaerablage dokumentiert
- Kein produktiver PAT im normalen Deploy-Pfad
- Rotation und Incident-Widerruf nachvollziehbar
