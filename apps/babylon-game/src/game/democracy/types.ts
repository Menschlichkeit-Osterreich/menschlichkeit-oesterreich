/**
 * Democracy Game – Bruecken bauen
 * TypeScript interfaces mirroring the canonical data model (data-model.md).
 */

/* ── World ───────────────────────────────────────────────────────────────── */

export interface WorldStats {
  readonly [statName: string]: number;
}

export interface World {
  readonly worldId: string;
  readonly name: string;
  readonly description: string;
  readonly stats: WorldStats;
  readonly unlockCriteria: string | null;
}

/* ── Scenario ────────────────────────────────────────────────────────────── */

export type PublishStatus = 'draft' | 'review' | 'released';

export interface Scenario {
  readonly scenarioId: string;
  readonly worldId: string;
  readonly title: string;
  readonly objective: string;
  readonly startSceneId: string;
  readonly estimatedDuration: number;
  readonly requiredRoleIds: readonly string[];
  readonly version: string;
  readonly publishStatus: PublishStatus;
}

/* ── Scene ───────────────────────────────────────────────────────────────── */

export type SceneType = 'dialogue' | 'decision' | 'consequence' | 'info';

export interface Scene {
  readonly sceneId: string;
  readonly scenarioId: string;
  readonly type: SceneType;
  readonly content: string;
  readonly characterId: string | null;
  readonly timerSeconds: number | null;
  readonly choices: readonly Choice[];
}

/* ── Choice ──────────────────────────────────────────────────────────────── */

export interface StatChange {
  readonly stat: string;
  readonly delta: number;
}

export interface Choice {
  readonly choiceId: string;
  readonly sceneId: string;
  readonly label: string;
  readonly nextSceneId: string | null;
  readonly statChanges: readonly StatChange[];
  readonly feedback: string;
}

/* ── Role ────────────────────────────────────────────────────────────────── */

export interface Role {
  readonly roleId: string;
  readonly name: string;
  readonly description: string;
  readonly abilities: readonly string[];
  readonly focusStats: readonly string[];
}

/* ── Character ───────────────────────────────────────────────────────────── */

export interface Character {
  readonly characterId: string;
  readonly name: string;
  readonly bio: string;
  readonly portraitUrl: string;
  readonly voiceAssets: readonly string[];
  readonly accessibilityTags: readonly string[];
}

/* ── Workshop Session ────────────────────────────────────────────────────── */

export type SessionStatus = 'waiting' | 'active' | 'voting' | 'finished';

export interface WorkshopSession {
  readonly sessionId: string;
  readonly hostUserId: string;
  readonly scenarioId: string;
  readonly status: SessionStatus;
  readonly createdAt: string;
  readonly voteDeadline: string | null;
  readonly participants: readonly string[];
}

/* ── Workshop Vote ───────────────────────────────────────────────────────── */

export interface WorkshopVote {
  readonly voteId: string;
  readonly sessionId: string;
  readonly participantId: string;
  readonly choiceId: string;
  readonly submittedAt: string;
  readonly isLatestForParticipant: boolean;
}

/* ── Consent Record ──────────────────────────────────────────────────────── */

export type ConsentScope = 'telemetry' | 'analytics';
export type ConsentStatus = 'granted' | 'revoked';

export interface ConsentRecord {
  readonly consentId: string;
  readonly subjectId: string;
  readonly scope: ConsentScope;
  readonly status: ConsentStatus;
  readonly grantedAt: string;
  readonly revokedAt: string | null;
}

/* ── Telemetry Event ─────────────────────────────────────────────────────── */

export type TelemetryEventType =
  | 'scene_entered'
  | 'choice_made'
  | 'scenario_completed'
  | 'vote_submitted'
  | 'session_joined';

export interface TelemetryEvent {
  readonly eventId: string;
  readonly consentId: string;
  readonly sessionId: string | null;
  readonly eventType: TelemetryEventType;
  readonly payload: Record<string, unknown>;
  readonly createdAt: string;
  readonly retentionUntil: string;
}

/* ── Composite State ─────────────────────────────────────────────────────── */

export interface DemocracyGameState {
  readonly currentScenario: Scenario | null;
  readonly currentScene: Scene | null;
  readonly activeRole: Role | null;
  readonly worldStats: WorldStats;
  readonly workshopSession: WorkshopSession | null;
}
