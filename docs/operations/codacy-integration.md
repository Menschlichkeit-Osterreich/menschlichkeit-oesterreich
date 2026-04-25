# Codacy Integration Betriebskonzept

Dieses Dokument beschreibt die operative Codacy-Integration fuer das Repository und trennt klar zwischen statischer Analyse, Coverage-Upload und Governance.

## Ziele

- Stabile SARIF-basierte Analyse in GitHub Actions
- Reproduzierbare Coverage-Uebermittlung an Codacy
- Klare Token-Verantwortung ohne Secret-Leaks
- Transparente Gates fuer Pull Requests

## Token-Modell

- CODACY_API_TOKEN:
  - Scope: Account/Organization API
  - Verwendung: Codacy API-Aufrufe, optionale Integrationen
  - Ablage: GitHub Secret (Repo oder Organization)
- CODACY_PROJECT_TOKEN:
  - Scope: einzelnes Codacy-Projekt
  - Verwendung: Coverage Upload (`coverage.codacy.com/get.sh`)
  - Ablage: GitHub Secret (Repo)

Wichtig: Beide Tokens sind fachlich unterschiedlich und duerfen nicht gegeneinander ersetzt werden.

## Workflows

- `.github/workflows/codacy.yml`
  - Fuehrt Codacy Analyse ueber Docker-Wrapper aus
  - Erzeugt SARIF unter `quality-reports/codacy-analysis.sarif`
  - Laedt Findings als Code-Scanning-Ergebnisse nach GitHub hoch
  - Prueft Findings gegen einen Workflow-Threshold (aktuell 25)

- `.github/workflows/codacy-coverage.yml`
  - Erzeugt Frontend-Coverage (`apps/website/coverage/lcov.info`)
  - Upload zu Codacy nur wenn `CODACY_PROJECT_TOKEN` vorhanden ist
  - Kein Secret-Upload bei externen Fork-PRs

- `.github/workflows/validate-secrets.yml`
  - Prueft optionales Vorhandensein von `CODACY_API_TOKEN` und `CODACY_PROJECT_TOKEN`
  - Liefert Transparenz, blockiert aber nicht wegen optionaler Integrations-Tokens

## PR-Check-Strategie

- Pflicht-Check:
  - `Codacy Analysis (SARIF Gate)`
- Optional/Beobachtend:
  - `Codacy Coverage Upload` (haengt von Token-Verfuegbarkeit ab)

Empfehlung fuer Schutzregeln in GitHub:

1. `Codacy Analysis (SARIF Gate)` als Required Status Check setzen
2. `Codacy Coverage Upload` nicht als Required markieren, solange Coverage schrittweise ausgebaut wird
3. Bei stabilen Coverage-Runs optional spaeter auf Required hochziehen

## Betriebscheckliste

1. Repository in Codacy verbunden und Projekt aktiv
2. `CODACY_PROJECT_TOKEN` in GitHub Secrets gesetzt
3. Optional `CODACY_API_TOKEN` gesetzt (API/Integrationen)
4. Threshold im Workflow `codacy.yml` auf gewuenschten Gate-Wert gesetzt (aktuell 25)
5. Branch Protection auf SARIF-Gate ausgerichtet

## Troubleshooting

- Problem: Coverage Upload wird uebersprungen
  - Ursache: `CODACY_PROJECT_TOKEN` fehlt oder PR kommt aus externem Fork
  - Aktion: Token setzen oder Upload nur im internen Branch testen

- Problem: Codacy-Gate schlaegt bei zu vielen Findings fehl
  - Ursache: Findings > Threshold
  - Aktion: Findings reduzieren oder Threshold in `codacy.yml` kontrolliert anpassen

- Problem: SARIF-Upload ohne Findings
  - Ursache: Analysefehler oder leere Ergebnisdatei
  - Aktion: Workflow-Logs pruefen, `quality-reports/codacy-analysis.sarif` auf Inhalt testen

## Governance-Hinweis

Die Codacy-Integration darf keine Deployment-Secrets verwenden. Deployment bleibt in Environment-gebundenen Workflows und wird getrennt von statischer Analyse betrieben.
