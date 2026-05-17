# Wave A Operations Snapshot (2026-05-16)

## Zweck

Aktueller Ausfuehrungsstand fuer Wave A in Project #2, inklusive
Workflow-Status, Gate-Lage und Ampelbewertung fuer #380 bis #385.

## Snapshot-Tabelle

| Issue | Bereich      | Zielstatus    | Ist-Status  | Gate-Lage                            | Ampel |
| ----- | ------------ | ------------- | ----------- | ------------------------------------ | ----- |
| #380  | API A001     | In Progress   | In Progress | G1 PASS, G4 PASS                     | Gruen |
| #381  | API A002     | Review        | Review      | G1 PASS, G2 PASS, G4 PASS            | Gruen |
| #382  | API A003     | Blocked       | Blocked     | G1 PASS, G2 PASS, G3 FAIL, G4 PASS   | Rot   |
| #383  | Website W001 | In Progress   | In Progress | API-Abhaengigkeit #380 erfuellt      | Gelb  |
| #384  | Website W002 | Backlog/Ready | Backlog     | Hard-Kante zu #381/#380 dokumentiert | Gelb  |
| #385  | Website W003 | Backlog/Ready | Backlog     | Hard-Kante zu #382 offen             | Rot   |

## Gate-Interpretation

- G1: `npm run test:api` -> Exit 0
- G2: `npm run test:api:coverage` -> Exit 0
- G3: `npm run security:scan` -> Exit 0 im Aggregat nach Docker-Fallback,
  Trivy/Bandit/Gitleaks laufen technisch durch; fuer #382 weiterhin FAIL
  wegen realer Findings (Trivy-Vulnerabilities, Bandit-Issues,
  Gitleaks-Leaks)
- G4: `npm run governance:check` -> Exit 0

## Kommentar-Backfill (standardisiert)

- #380: Nachweis-Kommentar vorhanden
- #381: Nachweis-Kommentar vorhanden
- #382: Nachweis-Kommentar vorhanden (inkl. aktualisierter
  G3-Fail-Begruendung: Findings statt Tooling-Ausfall)

## Triage-Artefakt

- Operative Findings-Triage fuer #382 dokumentiert in
  `a003-g3-findings-triage-2026-05-17.md`.
- Priorisierte Reihenfolge fuer Entblockung: S1 Secrets, S2 Injection,
  S4 Hardcoded Credentials, danach S3 Dependency-CVEs.

## Operative Prioritaet naechster Durchgang

1. G3 Findings fuer #382 triagieren und in umsetzbare Fix-Bloecke schneiden.
2. S1/S2 als erste Umsetzungsbloecke starten und #382 danach neu bewerten.
3. #385 erst starten, wenn #382 stabil auf Review/Done ist.
