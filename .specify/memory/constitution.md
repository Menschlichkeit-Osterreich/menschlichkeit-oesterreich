# Democracy Game — Bruecken bauen — Constitution

## Core Principles

### I. DSGVO-Compliance (NON-NEGOTIABLE)

- Telemetrie MUSS Consent-gated sein: keine Datenerfassung ohne aktive, dokumentierte Einwilligung.
- Rohe Telemetriedaten MUESSEN nach spaetestens 90 Tagen geloescht oder irreversibel anonymisiert werden.
- Widerruf MUSS sofort wirksam sein und nachgelagerte Verarbeitung unterbinden.
- Jeder ausgewertete Datensatz MUSS einen gueltigen Einwilligungsstatus vorweisen.
- Keine PII in Logs, Beispielen oder Prompts.

### II. Barrierefreiheit (NON-NEGOTIABLE)

- 100% der kritischen Kerninteraktionen MUESSEN per Tastatur bedienbar sein.
- HUD und Dialog MUESSEN anpassbare Kontraste, Schriftgroessen und Untertitel unterstuetzen.
- Barrierefreiheit ist kein nachgelagertes Feature, sondern wird ab Phase 4 (US2) als eigenstaendiger Track umgesetzt.
- Accessibility-Audit-Log ist verbindlicher Bestandteil der Qualitaetsnachweise (FR-020).

### III. Contract-First API

- Jeder API-Endpunkt MUSS vor Implementierung im Vertragsdokument (`contracts/democracy-game-api-v1.md`) spezifiziert sein.
- Aenderungen an bestehenden Endpunkten erfordern eine neue Vertragsversion oder dokumentierten Nachtrag.
- Fehlermodelle folgen dem standardisierten Error Object (`type`, `title`, `status`, `detail`, `instance`).
- Non-Functional Requirements (Latenz, Rate Limits) sind Teil des API-Vertrags, nicht nur der Implementierung.

### IV. CMS-Snapshot-Integritaet

- Im produktiven Spielbetrieb werden ausschliesslich freigegebene, versionierte CMS-Snapshots verwendet.
- Jeder Snapshot MUSS die Strukturvalidierung bestehen, bevor er fuer den Import freigegeben wird.
- CMS-Snapshots MUESSEN reproduzierbar und rollback-faehig sein.
- Unvollstaendige Lokalisierungen blockieren die Freigabe mit nachvollziehbarer Rueckmeldung.

### V. Messbare Qualitaetsziele

- Performance-Ziele sind als messbare p95-Schwellenwerte definiert (PG-001 ≤ 150ms, PG-002 ≤ 300ms, PG-003 ≤ 2s).
- Reliability-Ziele sind als prozentuale Schwellenwerte definiert (RG-001 ≥ 99%, RG-003 < 1% Fehlerquote).
- Observability-Ziele verlangen 100% strukturierte Logs mit Korrelation-ID und Dashboard-Abdeckung.
- Qualitaetsnachweise (Testreport, Accessibility-Audit-Log, Governance-Checkliste) sind verbindliche Lieferobjekte.

### VI. Oesterreichisches Deutsch

- Alle nutzersichtbaren Texte, UI-Labels, Fehlermeldungen und Dokumentation MUESSEN in oesterreichischem Deutsch verfasst sein.
- Mehrsprachigkeit MUSS waehrend der Nutzung umschaltbar sein (FR-007).
- i18n-Infrastruktur wird ab Phase 3 (MVP) mitgeliefert, nicht nachgelagert.

### VII. Main-First, Vertical Slice

- Entwicklung folgt dem Main-first-Workflow: Branches von `main`, PRs zurueck auf `main`.
- Der initiale Scope ist ein spielbarer Vertical Slice mit einem Premium-Szenario.
- Neue Szenarien werden ueber den CMS-Redaktionsworkflow erweitert, nicht ueber Codeaenderungen.
- Keine neuen Parallelstrukturen; Umsetzung erfolgt in bestehenden `apps/`-Pfaden.

## Security Constraints

- Workshop-Gastzugaenge sind auf maximal 2 Stunden begrenzt (TTL); danach ist ein erneuter Session-Beitritt erforderlich.
- Regulaere Spielzugriffe werden ueber Plattform-SSO abgesichert.
- Workshop-Abstimmungen verwenden feste Fristen; nur die letzte gueltige Stimme pro Person wird gezaehlt.
- Keine Secrets, Tokens oder PII in Code, Logs, Beispielen oder Prompts.

## Development Workflow

- Frontend: Vitest (Unit) + Playwright (E2E); Backend: Pytest (Unit/Integration).
- Contract-Checks gegen spezifizierte API-Schnittstellen sind Teil der CI-Pipeline.
- Aenderungen an Governance-Dateien (AGENTS.md, CLAUDE.md, copilot-instructions.md) muessen bei betroffenen Ablaeufen mitgezogen werden.
- `npm run quality:gates` und `npm run governance:check` MUESSEN vor Merge gruen sein.
- Staging-Smoke auf echtem n8n/CiviCRM ist verbindlich fuer produktionsnahe Freigaben.

## Governance

- Diese Constitution ist verbindlich fuer alle Speckit-Artefakte im Scope `specs/005-democracy-game-bruecken-bauen/`.
- Konflikte zwischen Spec, Plan oder Tasks und dieser Constitution werden zugunsten der Constitution entschieden.
- Aenderungen an der Constitution erfordern explizite Dokumentation, Begruendung und Versionierung.
- Die uebergeordnete Repo-Governance (`AGENTS.md`, `CLAUDE.md`) bleibt autoritativ fuer repo-weite Belange.

**Version**: 1.0.0 | **Ratified**: 2026-05-17 | **Last Amended**: 2026-05-17
