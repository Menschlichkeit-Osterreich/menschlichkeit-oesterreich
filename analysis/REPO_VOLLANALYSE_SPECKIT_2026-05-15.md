# Repo-Vollanalyse + Speckit Rollout

Datum: 2026-05-15
Kontext: Menschlichkeit-Osterreich/menschlichkeit-oesterreich

## Executive Summary
- Speckit wurde repo-weit ausgerollt (neuer 004-Plan inkl. Tasks und Wave-Plan).
- 30 neue Repo-Speckit-Issues wurden angelegt, 20 bestehende Multi-App-Speckit-Issues sind aktiv.
- Duplikatbereinigung erfolgte fuer 19 exakte Titeltreffer (geschlossen, referenziert).
- Projekt-Synchronisation war zeitweise durch GitHub GraphQL Rate-Limit blockiert.

## Datenlage (REST-basiert)
- Open Issues gesamt: 134
- Ohne Assignee: 38
- Ohne Milestone: 39
- Ohne Labels: 1
- Labelcluster:
  - status/planned: 50
  - spec/speckit-repowide: 30
  - spec/speckit-multiapp: 20
  - spec/n8n-gate: 26
  - backlog/legacy: 8

## App-Schnellprofil
- apps/api: 254 Dateien, 48 test/spec-Dateien
- apps/babylon-game: 479 Dateien, 11 test/spec-Dateien
- apps/crm: 50 Dateien, 1 test/spec-Datei
- apps/forum: 18 Dateien, 1 test/spec-Datei
- apps/website: 1780 Dateien, 25 test/spec-Dateien

## Durchgefuehrte Speckit-Artefakte
- specs/003-speckit-multi-app-rollout/*
- specs/004-speckit-repo-wide-orchestrierung/*

## Was wurde auf GitHub umgesetzt
- Label hinzugefuegt: spec/speckit-repowide
- Repo-weite Speckit-Issues erstellt: 30
- Multi-App Speckit-Issues vorhanden: 20
- Duplikat-Issues geschlossen: 19

## Offene Luecken / moeglicherweise vergessen
1. Project #2 Vollabgleich aller 134 Open-Issues nicht final bestaetigt (GraphQL Rate-Limit).
2. Ein Open-Issue ohne Label verbleibt.
3. 38 Open-Issues ohne Assignee.
4. 39 Open-Issues ohne Milestone.
5. Quality/Governance Gates zeigen Tooling-/Policy-Luecken:
   - governance:check fail wegen .vscode/mcp.json Policy
   - Codacy Trivy Plugin-Konfiguration fehlerhaft
   - trivy/gitleaks lokal nicht auf PATH (Fallback-Reports leer)

## Verbesserungsmassnahmen (priorisiert)
### P0
1. Project-Sync nach Rate-Reset finalisieren (100% Open-Issues im Board).
2. Ein unlabeled Issue normalisieren.
3. Assignee/Milestone Hygiene fuer 38/39 Issues schliessen.
4. Governance-Check reparieren (.vscode/mcp.json auf erlaubten Overlay-Zustand bringen).

### P1
1. Plan-Wave Feld im Project setzen und 134 Issues A-E zuordnen.
2. Workflow Status fuer alle Open-Issues konsistent nach Wave setzen.
3. WIP-Limits definieren (max. gleichzeitige In-Progress Items pro Wave).

### P2
1. Security-Toolchain stabilisieren (trivy/gitleaks Verfuegbarkeit + Codacy-Trivy Patterns).
2. Testabdeckung fuer crm/forum/babylon-game gezielt ausbauen.
3. Monatlicher Duplikat-/Legacy-Sweep automatisieren.

## Verifikationsqueries
- Open/Updated: `state:open repo:Menschlichkeit-Osterreich/menschlichkeit-oesterreich sort:updated-desc`
- Speckit repowide: `label:spec/speckit-repowide state:open repo:Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
- Speckit multiapp: `label:spec/speckit-multiapp state:open repo:Menschlichkeit-Osterreich/menschlichkeit-oesterreich`

## Abschlussstatus
- Speckit auf Repo angewendet: JA
- Repo-weite Planungsartefakte: JA
- GitHub-Issue-Generierung fuer Speckit: JA
- Project-Endabgleich aller offenen Issues: TEILWEISE (Rate-Limit-bedingter Restcheck offen)
