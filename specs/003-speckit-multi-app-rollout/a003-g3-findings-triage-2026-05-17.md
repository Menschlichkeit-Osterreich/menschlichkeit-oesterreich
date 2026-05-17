# A003 G3 Findings Triage (2026-05-17)

## Zweck

Operative Triage der realen G3-Findings fuer Issue #382.
Der Tooling-Blocker ist geschlossen; verbleibend sind echte Security-Findings.

## Executive Summary

- `security:scan` laeuft technisch durch (Trivy, Bandit, Gitleaks).
- #382 bleibt `Blocked`, weil Security-Findings oberhalb der Freigabeschwelle liegen.
- Fokus fuer Entblockung: zuerst High/Medium mit direkter Exploit-Wirkung,
  danach Secret-Hygiene und Low-Risks in Batches.

## Findings Lage

### Trivy

- Hauptfunde in `package-lock.json` (Root und `apps/website/`).
- Mehrere CVEs in transitive Dependencies.
- Technische Entblockung: Abhaengigkeits-Updates in kontrollierten Upgrade-Bloecken.

### Bandit

- Severity: 1 High, 27 Medium, 342 Low.
- Dominantes Muster: `B608` (SQL-Injection-Risiko) in API-Routern.
- Kritische Einzelmeldung: `B105` (Hardcoded Password) in `apps/api/app/rbac.py`.

### Gitleaks

- 13 Findings gesamt.
- Cluster: `generic-api-key`, `private-key`, `curl-auth-header`.
- Betroffene Orte: Doku-, Agenten- und Secret-Dateien.

## Priorisierte Fix-Bloecke

## Block S1 (P0) - Secrets Exposure stoppen

Ziel: Alle realen Geheimnisfunde rotieren/entfernen oder mit sicherem Placeholder ersetzen.

Umfang:

- Entfernen oder Redaction in Doku/Agent-Dateien.
- Ersetzen durch dokumentierte Platzhalter (`REDACTED`, `${ENV_VAR}`).
- Fuer echte Secrets: Rotation und Nachweis im Issue-Kommentar.

DoD:

- Gitleaks-Findings auf 0 fuer aktive Branch-Aenderungen.
- Keine Klartext-Secrets in `docs/`, `.claude/`, `deployment-scripts/`.

## Block S2 (P0) - API Injection-Risiken reduzieren

Ziel: `B608`-Muster in API-Routern auf sichere Query-Pfade umstellen.

Umfang:

- Priorisierte Router mit SQL-Zusammenbau pruefen.
- Parameterisierte Statements / ORM-native Query-Bausteine nutzen.
- Negative Tests fuer SQL-Injection-Payloads ergaenzen.

DoD:

- Keine High/Medium Injection-Hinweise in bearbeitetem Scope.
- Regressionstests fuer betroffene Endpunkte gruen.

## Block S3 (P1) - Dependency CVEs abbauen

Ziel: Trivy-CVEs in Root- und Website-Dependencies stufenweise reduzieren.

Umfang:

- Upgrade-Plan je Paketgruppe (minimal invasive zuerst).
- Lockfile-Refresh mit Testlauf pro Upgrade-Welle.
- Breaking-Changes getrennt als Folgetask.

DoD:

- Kritische/hohe CVEs fuer betroffene Pakete reduziert.
- `npm run test:unit` und relevante Service-Tests gruen.

## Block S4 (P1) - Hardcoded Credentials Nacharbeiten

Ziel: `B105` und aehnliche Funde sauber auf Konfigurationspfade umstellen.

Umfang:

- `apps/api/app/rbac.py` und verwandte Konfigurationsquellen.
- Konsistente Env- und Secret-Injektion statt Fallback-Literale.

DoD:

- Keine harten Credentials im Runtime-Code.
- Konfigurationspfad dokumentiert und getestet.

## Reihenfolge fuer Entblockung #382

1. S1 abschliessen und Report neu laufen lassen.
2. S2 fuer Top-Router abschliessen und gezielte API-Tests laufen lassen.
3. S4 abschliessen.
4. S3 iterativ starten; #382 von `Blocked` auf `In Progress`, sobald S1+S2 abgeschlossen und G3-Risiko signifikant gesenkt ist.

## Evidence Baseline

- Trivy: Findings vorhanden (Dependency-CVEs).
- Bandit: 1 High, 27 Medium, 342 Low.
- Gitleaks: 13 Findings.

Diese Baseline ist der Referenzpunkt fuer die naechste #382-Statusentscheidung.
