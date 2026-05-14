---
name: codacy-remediation
description: 'Codacy Analyse, Problembehebung und Quality-Settings-Optimierung fuer dieses Repository. Use when asked to run Codacy analysis, fix Codacy findings, tune .codacy.yml, adjust Codacy thresholds, improve quality gates, troubleshoot codacy-analysis-cli, or optimize Codacy workflow settings.'
---

# Codacy Remediation

Nutze diesen Skill, wenn Codacy-Findings analysiert, behoben und die zugehoerigen Repo-Settings optimiert werden sollen. Ziel ist ein nachvollziehbarer Ablauf von Analyse ueber Fix bis Re-Analyse, ohne Quality-Gates durch kosmetische oder riskante Aenderungen zu umgehen.

## When to Use This Skill

- Der Nutzer fragt nach Codacy-Analyse, Codacy-Scan, Codacy-Problemen oder Codacy-Findings.
- Codacy-Gates in CI, PR oder lokal schlagen fehl.
- `.codacy.yml`, `.codacy/codacy.yaml`, `.github/workflows/codacy.yml` oder `scripts/ci/run-codacy.mjs` sollen angepasst oder optimiert werden.
- Der Nutzer moechte Findings beheben und anschliessend eine erneute Analyse durchfuehren.
- Codacy-Settings, Excludes, Tools, Thresholds oder SARIF-Ausgabe sollen geprueft werden.

## Repository Anchors

- Primary Codacy rules: `.codacy.yml`
- Local Codacy runtime/tool list: `.codacy/codacy.yaml`
- Local runner: `scripts/ci/run-codacy.mjs`
- CI gate: `.github/workflows/codacy.yml`
- Aggregate gate: `npm run quality:gates`
- Local script aliases: `npm run quality:codacy` and `npm run analyze:codacy`
- Local default tools: `eslint,trivy`; use `CODACY_TOOLS=all` for an intentionally broad full-tool scan
- SARIF triage helper: `node .github/skills/codacy-remediation/scripts/sarif-summary.mjs [sarif-file]`

## Workflow

### 1. Scope bestimmen

1. Klaere, ob der Nutzer ein einzelnes File, einen Service oder das gesamte Repository analysieren will.
2. Bei Codeaenderungen analysiere bevorzugt die geaenderten Dateien zuerst.
3. Bei Dependency- oder Package-Manager-Aenderungen fuehre zusaetzlich einen Trivy-Scan durch.
4. Bei Governance-, Workflow- oder VS-Code-Konfigurationsaenderungen plane `npm run workspace:config:check` als Verifikation ein.

### 2. Analyse ausfuehren

1. Fuer direkte MCP-basierte Analyse nutze `codacy_cli_analyze` mit `rootPath` auf den Workspace-Pfad.
2. Fuer einzelne Dateien setze `file` auf den absoluten Dateipfad und lasse `tool` leer, ausser der Nutzer verlangt ein bestimmtes Tool.
3. Fuer Dependency-Checks setze `tool` auf `trivy` und lasse `file` leer.
4. Fuer lokale Repo-Ausfuehrung nutze `npm run quality:codacy`; der lokale Runner nutzt standardmaessig `eslint,trivy`, damit der normale Gate nicht an teuren Vollscans haengt.
5. Fuer bewusst breite Analyse setze `CODACY_TOOLS=all npm run quality:codacy` oder grenze mit `CODACY_TOOLS=<tool>` und `CODACY_DIRECTORY=<path>` ein.
6. Bei kompletter Validierung nutze `npm run quality:gates`.
7. Falls SARIF vorliegt, nutze den [SARIF summary helper](./scripts/sarif-summary.mjs), um Tool-, Severity- und Rule-Schwerpunkte sichtbar zu machen.
8. Wenn die Codacy CLI nicht verfuegbar ist, folge der Codacy-Instructions-Regel: Nutzer fragen, ob die Codacy CLI installiert werden soll, und erst nach Antwort fortfahren.

### 3. Findings triagieren

Ordne Findings in dieser Reihenfolge:

1. Security und Secrets: sofort beheben, keine Suppression als erste Wahl.
2. Correctness und Error-Prone: Root Cause fixen, Tests ergaenzen falls Risiko besteht.
3. DSGVO/PII-Nahe Findings: Logging, Maskierung und Datenminimierung pruefen.
4. Maintainability: gezielt vereinfachen, ohne unrelated Refactors.
5. Style: nur beheben, wenn es Gate-relevant ist oder die betroffene Datei ohnehin bearbeitet wird.

Ignoriere reine Metrik-Debatten wie abstrakte Complexity Scores, wenn kein konkretes Codacy-Issue vorliegt. Fixe konkrete Complexity-Issues, aber optimiere nicht blind auf Kennzahlen.

### 4. Probleme beheben

1. Lies die betroffene Datei und den lokalen Kontext vor jedem Fix.
2. Behebe die Ursache statt Symptome zu verstecken.
3. Veraendere nur die betroffenen Dateien und keine historischen Archivpfade, ausser der Finding-Kontext verlangt es.
4. Fuege Tests oder Checks proportional zum Risiko hinzu.
5. Keine Secrets, Tokens oder PII in Code, Logs, Testdaten oder Beispielen aufnehmen.

### 5. Settings anpassen und optimieren

Passe Codacy-Settings nur an, wenn die Aenderung fachlich begruendet ist:

- `exclude_paths`: Nur fuer generierte Artefakte, Archive, Vendor-Code, Reports oder nicht aktive historische Snapshots.
- `engines`: Nur aktivieren, wenn das Tool fuer die realen Sprachen und Pfade des Repos relevant ist.
- `categories`: Nicht deaktivieren, um echte Findings zu verstecken.
- `max-allowed-issues`: Temporare Anpassungen sind nur pragmatisch vertretbar, wenn sie klein, begruendet, zeitlich eingegrenzt und mit Ruecknahme- oder Remediation-Plan dokumentiert sind.
- `.codacy/codacy.yaml`: Runtime- und Tool-Versionen konsistent mit CI und lokaler Umgebung halten.
- `.github/workflows/codacy.yml`: Threshold, SARIF-Pfad, Permissions und Timeout nur gezielt anpassen.

Wenn Settings geaendert werden, dokumentiere in der Antwort, welches Problem dadurch geloest wird, warum die Aenderung nicht nur ein Gate-Bypass ist und welches Risiko bleibt.

### 6. Re-Analyse und Abschluss

1. Nach jedem erfolgreichen File-Edit fuehre die Codacy-MCP-Analyse fuer jede geaenderte Datei aus.
2. Nach Package-Manager- oder Dependency-Aenderungen fuehre `codacy_cli_analyze` mit `tool: trivy` aus.
3. Fuehre passende lokale Checks aus, zum Beispiel `npm run quality:codacy`, service-spezifische Tests oder `npm run workspace:config:check`.
4. Pruefe, ob Findings neu, bestehend oder unrelated sind.
5. Berichte knapp: geaenderte Dateien, behobene Findings, ausgefuehrte Checks, verbleibende Risiken.

## Decision Points

| Situation | Aktion |
| --- | --- |
| Finding liegt in generiertem Report oder Archiv | Exclude pruefen, nicht produktiven Code refactoren |
| Finding betrifft Security/Secret/PII | Sofort fixen, keine Unterdrueckung ohne explizite Begruendung |
| Tool erzeugt viele False Positives | Kleinste moegliche Config-Anpassung pruefen und begruenden |
| Analyse scheitert an fehlender CLI | Nutzer gemaess Codacy-Regel zur Installation fragen |
| Analyse scheitert an Tooling-Timeout | Scope verkleinern oder Tool gezielt ausfuehren |
| Threshold ist ueberschritten | Findings reduzieren; falls temporaer erhoeht wird, Ruecknahme-Plan und Begruendung festhalten |
| Vollscan wird benoetigt | `CODACY_TOOLS=all` bewusst setzen und laengeren Timeout waehlen |

## Quality Checklist

- [ ] Findings sind nach Risiko priorisiert.
- [ ] Root Cause ist behoben oder ein klarer Grund fuer Konfigurationsaenderung ist dokumentiert.
- [ ] Codacy-MCP-Analyse wurde fuer jede geaenderte Datei ausgefuehrt.
- [ ] Bei Dependency-Aenderungen wurde Trivy ausgefuehrt.
- [ ] Keine Secrets oder PII wurden eingefuehrt.
- [ ] Lokale oder CI-nahe Verifikation wurde ausgefuehrt oder begruendet ausgelassen.
- [ ] Settings-Aenderungen sind minimal, nachvollziehbar und nicht gate-umgehend.

## Gotchas

- **Nicht** `max-allowed-issues` dauerhaft erhoehen, nur um einen roten Build gruen zu bekommen.
- **Nicht** ganze aktive App-Pfade ausschliessen, wenn nur einzelne generierte Dateien problematisch sind.
- **Nicht** Codacy fuer reine Coverage- oder Duplication-Metrik-Jagden verwenden; konkrete Issues haben Vorrang.
- **Nicht** Shell-Heredocs oder Redirects zum Schreiben von Dateien verwenden; nutze Datei-Editing-Tools.
- **Nicht** Codacy-Token, SARIF-Inhalte mit Secrets oder personenbezogene Daten in Antworten ausgeben.

## Troubleshooting

| Problem | Loesung |
| --- | --- |
| Codacy CLI ist nicht installiert | Codacy-MCP-Analyse versuchen; falls die CLI fehlt, Nutzer fragen, ob Installation erfolgen soll |
| SARIF fehlt oder ist leer | `scripts/ci/run-codacy.mjs` pruefen, `quality-reports/` anlegen lassen und Strict-Mode beachten |
| Java/JAR-Fallback scheitert | `.codacy/codacy-analysis-cli-assembly.jar` Validitaet und Java-Version pruefen |
| Zu viele unrelated Findings | Analyse auf geaenderte Dateien oder betroffene Services begrenzen |
| CI und lokal unterscheiden sich | `.codacy/codacy.yaml`, Node-Version, Tool-Versionen und Workflow-Env vergleichen |
| Trivy blockiert nach Dependency-Aenderung | Vulnerability beheben oder Dependency-Version wechseln, erst danach Originaltask fortsetzen |

## Example Prompts

- `/codacy-remediation Analysiere die geaenderten Dateien und behebe neue Codacy-Findings.`
- `/codacy-remediation Optimiere .codacy.yml, damit Archive und Reports sauber ausgeschlossen sind.`
- `/codacy-remediation Warum faellt der Codacy SARIF Gate Workflow aus und wie beheben wir das?`
- `/codacy-remediation Fuehre Codacy fuer apps/api aus, triagiere Findings und schlage Fixes vor.`
