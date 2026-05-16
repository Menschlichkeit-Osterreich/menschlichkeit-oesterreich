# W003 Abarbeitungsreihenfolge Wave A/C (2026-05-16)

## Ziel

Die finale Reihenfolge fuer Website-bezogene Speckit-Aufgaben in Wave A und die
saubere Uebergabe in Wave C festlegen, um Rework und Abhaengigkeitskonflikte zu
minimieren.

## Scope

- Wave A Fokus: #383, #384, #385
- API-Abhaengigkeiten: #380, #381, #382
- Wave C Anschluss: #392, #393, #394

## Reihenfolge Wave A

1. #380 A001 abschliessen (Ownership und Endpunktinventar)
2. #381 A002 auf Review bringen (Gate-Mapping aktiv)
3. #383 W001 finalisieren (Cluster Landing/Auth/Donation)
4. #384 W002 finalisieren (hard/soft Kanten verbindlich)
5. #382 A003 finalisieren (Risikobewertung fuer A/B)
6. #385 W003 Abschluss-Check und Reihenfolgefreigabe

## Reihenfolge Wave C Anschluss

1. #392 G001 starten (Gameplay vs. Integration splitten)
2. #393 G002 starten (Abhaengigkeiten zu Website/Auth transparent)
3. #394 G003 finalisieren (Priorisierung und Akzeptanzkriterien)

## Entscheidungsregeln fuer Reihenfolgewechsel

1. Ein Wechsel in Wave A ist nur erlaubt, wenn mindestens ein harter Blocker
   dokumentiert ist.
2. Tasks mit hard API-Abhaengigkeit duerfen nicht vor dem zugeordneten
   API-Issue auf `In Progress` gehen.
3. Wave-C-Aufgaben starten erst, wenn Wave-A-Reihenfolge in Project #2 auf
   `Review` oder `Done` stabil ist.

## Konfliktfaelle und Aufloesung

- Website-Task ohne API-Statusklarheit:
  Rueckstufung auf `Ready`, API-Issue vorziehen.
- Parallele Prioritaetswechsel in A und C:
  Wave A hat Vorrang bis #385 abgeschlossen ist.
- Uneinheitliche Risikobewertung:
  A003-Entscheidung gilt als bindend fuer Wave A/B.

## Abnahme

W003 gilt als abgeschlossen, wenn:

1. Die Reihenfolge in Project #2 konsistent abgebildet ist.
2. Kein Wave-A-Issue gegen eine harte API-Abhaengigkeit verstoesst.
3. Der Wave-C-Anschluss als Startsequenz dokumentiert ist.
