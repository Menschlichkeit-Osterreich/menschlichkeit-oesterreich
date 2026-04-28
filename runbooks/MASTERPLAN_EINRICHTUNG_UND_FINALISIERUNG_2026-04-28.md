# Masterplan: Einrichtung und Finalisierung

Stand: 2026-04-28  
Branch: chore/remove-openclaw-openwolf  
PR: #298 nach main

## 1) Ist-Status (technisch verifiziert)

### 1.1 Reposcope und Branchlage

- Aktueller Arbeitsbranch ist nicht `main`, sondern `chore/remove-openclaw-openwolf`.
- Grund: Es existiert ein aktiver PR-Flow nach `main` (PR #298).
- Vergleich zu `origin/main`: Branch ist `ahead 24`, `behind 0`.
- Schluss: Lokaler Feature-Branch enthaelt bereits den aktuellen Stand von `main`; offen ist die Rueckfuehrung nach `main` via Merge/PR.

### 1.2 Systemquellen vorhanden

Folgende Kernsysteme sind im Repo vorhanden:

- `apps/website`
- `apps/api`
- `apps/crm` (Drupal/CiviCRM)
- `apps/babylon-game`
- `apps/forum`
- `automation/n8n`
- Datenbank-/Schema-Bestand (`apps/api/alembic`, `schema.prisma`, `docker-compose.yml`)

### 1.3 Laufzeitstatus lokal

Aktuell lokal nicht laufend:

- Frontend: DOWN
- API: DOWN
- CRM: DOWN
- Games: DOWN
- Forum: DOWN
- n8n: DOWN

Infrastruktur-Blocker lokal:

- Docker-Daemon: DOWN
- PHP CLI: nicht verfuegbar im aktuellen Terminalkontext

## 2) Zielbild

Ziel ist ein reproduzierbarer Zustand mit:

1. Laufenden lokalen Kernservices fuer Entwicklung und Smoke-Tests.
2. Nachweisbarer Datenbank-/Migration-Readiness fuer API/CRM.
3. Bereinigtem Branchfluss mit sauberem Rueckweg nach `main`.

## 3) Umsetzungsplan

### Phase A: Host- und Tooling-Basis (Blocker zuerst)

1. Docker Desktop starten und Daemon verifizieren (`docker info`).
2. PHP 8.2+ im PATH bereitstellen (fuer `apps/crm` Runtime).
3. Workspace-Bootstrap ausfuehren (`npm run workspace:bootstrap`).

Abnahmekriterium:

- Docker erreichbar, PHP verfuegbar, Bootstrap ohne harte Fehler.

### Phase B: Datenbank- und Service-Stack hochfahren

1. Compose-Basis starten (`docker compose up -d`).
2. API lokal starten (`npm run dev:api`).
3. CRM lokal starten (`npm run dev:crm`).
4. Optional: Gesamtstack (`npm run dev:all`) fuer Frontend/Games/Forum.

Abnahmekriterium:

- Endpunkte antworten: `5173`, `8001/healthz`, `8000`, `3001`, `8002`, `5678/healthz`.

### Phase C: Daten- und Fachlogik validieren

1. API-Tests ausfuehren (`npm run test:api`).
2. Website Unit Tests ausfuehren (`Test: Website Unit` Task).
3. Zahlungs-/Secret-Wiring verifizieren (`Verify: Payment Secret Wiring`).
4. Governance/Quality pruefen (`npm run governance:check`, `npm run quality:gates`).

Abnahmekriterium:

- Keine kritischen Fehler in API/Governance/Quality Gates.

### Phase D: Branch-Finalisierung und Rueckfuehrung

1. Sammelcommit auf aktuellem Branch erstellen (dokumentierte Aenderungen gebuendelt).
2. Sicherstellen, dass Branch weiter `behind 0` gegen `origin/main` bleibt.
3. PR #298 aktualisieren und final reviewen.
4. Branches vereinen durch Merge des PR nach `main` (Server-seitig).

Abnahmekriterium:

- PR gemerged, `main` enthaelt die gebuendelten Aenderungen.

## 4) Risiken und Gegenmassnahmen

- Risiko: Lokale Laufzeit bleibt rot wegen fehlender Secrets/.env.
  - Massnahme: Erst `workspace:bootstrap`, dann gezielte Env-Pruefung pro Service.
- Risiko: CRM kann ohne PHP/Composer nicht gestartet werden.
  - Massnahme: PHP/Composer in Hosttooling aufnehmen, dann CRM-Start erneut pruefen.
- Risiko: Sammelcommit zieht unerwuenschte Artefakte mit.
  - Massnahme: Vor Commit nur definierte Pfade stagen, `git status --short` pruefen.

## 5) Definition of Done

Der Masterplan ist abgeschlossen, wenn:

1. Kernservices lokal nachweisbar erreichbar sind.
2. API/DB/CRM-Basis lauffaehig und getestet ist.
3. Sammelcommit erstellt wurde.
4. PR nach `main` erfolgreich gemerged wurde.
