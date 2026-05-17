# Data Model: Democracy Game Bruecken bauen

## Entity: World

- Key: worldId
- Attributes:
  - name
  - description
  - stats (solidarity, participation, innovation)
  - unlockCriteria
- Validation:
  - worldId eindeutig
  - stats-Werte im definierten Bereich

## Entity: Scenario

- Key: scenarioId
- Attributes:
  - worldId
  - title
  - objective
  - startSceneId
  - estimatedDuration
  - requiredRoleIds
  - version
  - publishStatus
- Validation:
  - worldId muss existieren
  - startSceneId muss in Scenario-Szenen enthalten sein
  - publishStatus nur draft/review/released

## Entity: Scene

- Key: sceneId
- Attributes:
  - scenarioId
  - type (dialogue, action, reflection)
  - content
  - characterId
  - timerSeconds
  - choices[]
- Validation:
  - scenarioId muss existieren
  - choice-Referenzen muessen gueltig sein

## Entity: Choice

- Key: choiceId
- Attributes:
  - sceneId
  - label
  - nextSceneId
  - statChanges
  - feedback
- Validation:
  - nextSceneId muss existieren oder als Ende markiert sein
  - statChanges nur definierte Stat-Felder

## Entity: Role

- Key: roleId
- Attributes:
  - name
  - description
  - abilities
  - focusStats
- Validation:
  - roleId eindeutig

## Entity: Character

- Key: characterId
- Attributes:
  - name
  - bio
  - portraitUrl
  - voiceAssets
  - accessibilityTags
- Validation:
  - characterId eindeutig

## Entity: WorkshopSession

- Key: sessionId
- Attributes:
  - hostUserId
  - scenarioId
  - status
  - createdAt
  - voteDeadline
  - participants[]
- Validation:
  - status nur waiting/running/voting/finished
  - voteDeadline muss fuer aktive Abstimmung gesetzt sein

## Entity: WorkshopVote

- Key: voteId
- Attributes:
  - sessionId
  - participantId
  - choiceId
  - submittedAt
  - isLatestForParticipant
- Validation:
  - genau eine letzte gueltige Stimme pro participantId und Abstimmung

## Entity: ConsentRecord

- Key: consentId
- Attributes:
  - subjectId
  - scope
  - status
  - grantedAt
  - revokedAt
- Validation:
  - status nur granted/revoked
  - revokedAt gesetzt, wenn status=revoked

## Entity: TelemetryEvent

- Key: eventId
- Attributes:
  - consentId
  - sessionId
  - eventType
  - payload
  - createdAt
  - retentionUntil
- Validation:
  - consentId muss gueltig und aktiv sein
  - retentionUntil <= createdAt + 90 Tage
