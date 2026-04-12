import {
  DEFAULT_AVAILABLE_SCENARIOS,
  DEFAULT_PLAYER_ROLES,
  type GameDataSource,
  type PlayerRole,
  type ScenarioResultRecord,
} from '@/game/data/contracts';
import {
  createMissionDefinitionForScenario,
  createMissionState,
  type MissionState,
} from '@/game/missions/mission-model';
import { DEFAULT_ACTIVE_SCENARIO, type GameScenario } from '@/game/scenarios/scenario-model';

export type GamePhase = 'loading' | 'start' | 'playing' | 'success' | 'fail';

export type EnvironmentMode = 'scene-loader' | 'fallback-arena';

export interface GameHudState {
  phase: GamePhase;
  environment: EnvironmentMode;
  dataSource: GameDataSource;
  mission: MissionState;
  availableScenarios: GameScenario[];
  activeScenario: GameScenario;
  availableRoles: PlayerRole[];
  activeRole: PlayerRole;
  completedMissionIds: string[];
  completedScenarioIds: string[];
  lastScenarioResult: ScenarioResultRecord | null;
  status: string;
  hint: string;
  interactionPrompt: string;
  goalUnlocked: boolean;
  collected: number;
  totalCollectibles: number;
  elapsedSeconds: number;
  timeLimitSeconds: number;
  remainingSeconds: number;
}

export interface GameRuntime {
  start(): void;
  reset(): void;
  setActiveRole(roleId: string): void;
  setActiveScenario(scenarioId: string): void;
  dispose(): void;
}

export const GAME_CONTROLS = [
  'WASD / Pfeiltasten bewegen',
  'Shift sprintet',
  'Leertaste springt',
  'E / Enter interagiert oder bewegt den Gemeinschaftskern',
] as const;

const DEFAULT_ACTIVE_ROLE: PlayerRole = DEFAULT_PLAYER_ROLES[0] ?? {
  id: 'runner',
  title: 'Aktivist*in',
  description: 'Lokale Standardrolle für die Babylon-Mission.',
};

export const DEFAULT_HUD_STATE: GameHudState = {
  phase: 'loading',
  environment: 'fallback-arena',
  dataSource: 'local',
  mission: createMissionState(createMissionDefinitionForScenario(DEFAULT_ACTIVE_SCENARIO), 'ready'),
  availableScenarios: DEFAULT_AVAILABLE_SCENARIOS,
  activeScenario: DEFAULT_ACTIVE_SCENARIO,
  availableRoles: DEFAULT_PLAYER_ROLES,
  activeRole: DEFAULT_ACTIVE_ROLE,
  completedMissionIds: [],
  completedScenarioIds: [],
  lastScenarioResult: null,
  status: '3D-MVP wird initialisiert …',
  hint: 'Engine, Szene und Interaktionen werden vorbereitet.',
  interactionPrompt: '',
  goalUnlocked: false,
  collected: 0,
  totalCollectibles: 0,
  elapsedSeconds: 0,
  timeLimitSeconds: 45,
  remainingSeconds: 45,
};
