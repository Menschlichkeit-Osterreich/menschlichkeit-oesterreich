# Contract: Democracy Game API v1

## Scope

Dieses Dokument beschreibt die verbindlichen v1-Vertraege fuer
Vertical-Slice-Funktionen im Democracy Game.

## Endpoint: POST /api/v1/game/active-role

- Request:
  - roleId (string, required)
- Response 200:
  - success (boolean)
  - activeRoleId (string)
- Error:
  - 400 invalid role
  - 401 unauthorized

## Endpoint: POST /api/v1/game/active-scenario

- Request:
  - scenarioId (string, required)
- Response 200:
  - success (boolean)
  - activeScenarioId (string)
- Error:
  - 400 invalid scenario
  - 401 unauthorized

## Endpoint: POST /api/v1/game/scenario-progress

- Request:
  - scenarioId
  - sceneId
  - choiceId
  - timestamp
- Response 200:
  - success
  - nextSceneId
  - updatedStats
- Error:
  - 409 state conflict

## Endpoint: POST /api/v1/workshop/vote

- Request:
  - sessionId
  - participantId
  - choiceId
  - submittedAt
- Response 200:
  - success
  - deadline
  - effectiveVote (latest-valid)
- Rules:
  - Pro Teilnehmer zaehlt nur die letzte gueltige Stimme vor Deadline.

## Endpoint: POST /api/v1/game/events

- Request:
  - consentId
  - eventType
  - payload
- Response 202:
  - accepted
- Error:
  - 403 consent missing/revoked

## Endpoint: GET /api/v1/game/content-version

- Request: none
- Response 200:
  - version (string) — semantic version of the currently active CMS-Snapshot
  - updatedAt (ISO 8601 timestamp)
  - snapshotId (string)
- Error:
  - 500 no snapshot loaded

## Standard Error Object

- code (string)
- message (string)
- correlationId (string)
- details (object, optional)

## NFR Contract Clauses

- API p95 fuer Kernendpunkte <= 300 ms im Staging-Smoke.
- 100% Fehlerantworten enthalten correlationId.
- Workshop-Vote-Resultat <= 2 s p95 fuer 30 Teilnehmende.
