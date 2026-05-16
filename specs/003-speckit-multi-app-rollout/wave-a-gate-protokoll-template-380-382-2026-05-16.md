# Wave A Gate-Protokoll Template (#380/#381/#382)

## Zweck

Einheitliches Nachweisformat fuer Gate-Laeufe auf den API-Issues #380, #381
und #382 in Project #2.

## Template

```text
Gate-Protokoll (Wave A)
Issue: #<380|381|382>
Datum: YYYY-MM-DD
Verantwortlich: @handle

Scope:
- Kurzbeschreibung des getesteten Stands

Ausgefuehrte Gates:
- G1 (npm run test:api): <PASS|FAIL> | Exit-Code: <0|!=0>
- G2 (npm run test:api:coverage): <PASS|FAIL|N/A> | Exit-Code: <...>
- G3 (npm run security:scan): <PASS|FAIL|N/A> | Exit-Code: <...>
- G4 (npm run governance:check): <PASS|FAIL> | Exit-Code: <...>

Befunde:
- Kritisch (P0): <ja/nein + kurz>
- Hoch (P1): <ja/nein + kurz>
- Mittel (P2): <ja/nein + kurz>

Entscheidung:
- Neuer Status: <Ready|In Progress|Review|Blocked|Done>
- Begruendung: <1-3 Saetze>
- Naechster Schritt: <konkrete Aktion>

Artefakt-Links:
- A001/A002/A003 Dokument-Link
- Optional: Test-Output/CI-Link
```

## Pflichtregeln

1. Jeder Wechsel nach `Review` oder `Done` braucht ein ausgefuelltes Protokoll.
2. Bei `FAIL` in einem Pflichtgate muss `Blocked` oder `In Progress` begruendet
   werden.
3. Kein Statuswechsel ohne Exit-Code-Angabe fuer ausgefuehrte Gates.

## Kurzbeispiele

- #380 typischer Lauf: G1 und G4 Pflicht.
- #381 typischer Lauf: G1, G2, G4 Pflicht.
- #382 typischer Lauf: G1, G2, G3, G4 Pflicht.
