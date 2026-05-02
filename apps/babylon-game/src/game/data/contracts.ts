import type { MissionStatus } from '@/game/missions/mission-model';
import {
  DEFAULT_ACTIVE_SCENARIO,
  DEFAULT_GAME_SCENARIOS,
  type GameScenario,
} from '@/game/scenarios/scenario-model';

export interface PlayerRole {
  id: string;
  title: string;
  description: string;
  specialty?: string;
  moveSpeedMultiplier?: number;
  timeBonusSeconds?: number;
  interactionRadiusMultiplier?: number;
}

export interface MissionProgressSnapshot {
  missionId: string;
  scenarioId: string;
  roleId: string;
  status: MissionStatus;
  collected: number;
  totalCollectibles: number;
  remainingSeconds: number;
}

export interface ScenarioResultRecord {
  missionId: string;
  missionTitle: string;
  scenarioId: string;
  scenarioTitle: string;
  outcome: 'completed' | 'failed';
  roleId: string;
  roleTitle: string;
  collected: number;
  totalCollectibles: number;
  elapsedSeconds: number;
  recordedAt: string;
}

export interface PlayerProgressProfile {
  activeRoleId: string;
  activeScenarioId: string;
  audioMuted: boolean;
  completedMissionIds: string[];
  completedScenarioIds: string[];
  lastMissionSnapshot: MissionProgressSnapshot | null;
  lastScenarioResult: ScenarioResultRecord | null;
}

export interface GameBootstrapData {
  roles: PlayerRole[];
  scenarios: GameScenario[];
  progress: PlayerProgressProfile;
}

export type GameDataSource = 'local' | 'api' | 'api-stub';

export interface GameDataAdapterConfig {
  source: GameDataSource;
  baseUrl?: string;
}

export interface GameDataAdapter {
  readonly source: GameDataSource;
  loadBootstrapData(): Promise<GameBootstrapData>;
  saveMissionProgress(snapshot: MissionProgressSnapshot): Promise<void>;
  saveScenarioResult(result: ScenarioResultRecord): Promise<void>;
  setActiveRole(roleId: string): Promise<void>;
  setActiveScenario(scenarioId: string): Promise<void>;
  setAudioMuted(audioMuted: boolean): Promise<void>;
}

export const DEFAULT_PLAYER_ROLES: PlayerRole[] = [
  {
    id: 'runner',
    title: 'Aktivist*in',
    description: 'Schnell unterwegs, um Impulse, Stimmen und Menschen im Quartier zu erreichen.',
    specialty: 'Mehr Lauftempo für direkte Wege zwischen Begegnungspunkten und Gesprächen.',
    moveSpeedMultiplier: 1.18,
    timeBonusSeconds: 0,
    interactionRadiusMultiplier: 1,
  },
  {
    id: 'operator',
    title: 'Moderator*in',
    description: 'Hält den Überblick und öffnet Räume für ruhige, sichere Beteiligung.',
    specialty: 'Mehr Zeitfenster und größere Reichweite für verlässliche Aktivierungen.',
    moveSpeedMultiplier: 0.94,
    timeBonusSeconds: 8,
    interactionRadiusMultiplier: 1.25,
  },
  {
    id: 'vermittler',
    title: 'Vermittler*in',
    description: 'Schafft Raum für Verständigung zwischen unterschiedlichen Perspektiven.',
    specialty:
      'Größere Interaktionsreichweite und zusätzlicher Zeitpuffer für schwierige Gespräche.',
    moveSpeedMultiplier: 0.86,
    timeBonusSeconds: 15,
    interactionRadiusMultiplier: 1.5,
  },
];

export const DEFAULT_PROGRESS_PROFILE: PlayerProgressProfile = {
  activeRoleId: DEFAULT_PLAYER_ROLES[0]?.id ?? 'runner',
  activeScenarioId: DEFAULT_ACTIVE_SCENARIO.id,
  audioMuted: false,
  completedMissionIds: [],
  completedScenarioIds: [],
  lastMissionSnapshot: null,
  lastScenarioResult: null,
};

export const DEFAULT_AVAILABLE_SCENARIOS: GameScenario[] = DEFAULT_GAME_SCENARIOS;
