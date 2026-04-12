import {
  DEFAULT_AVAILABLE_SCENARIOS,
  DEFAULT_PLAYER_ROLES,
  DEFAULT_PROGRESS_PROFILE,
  type GameBootstrapData,
  type GameDataAdapter,
  type MissionProgressSnapshot,
  type PlayerProgressProfile,
  type ScenarioResultRecord,
} from '@/game/data/contracts';

const STORAGE_KEY = 'moe-babylon-game-bootstrap';

interface StoredGameState {
  progress: PlayerProgressProfile;
}

function readStoredState(): StoredGameState {
  if (typeof window === 'undefined') {
    return {
      progress: { ...DEFAULT_PROGRESS_PROFILE },
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        progress: { ...DEFAULT_PROGRESS_PROFILE },
      };
    }

    const parsed = JSON.parse(raw) as Partial<StoredGameState>;
    return {
      progress: {
        ...DEFAULT_PROGRESS_PROFILE,
        ...parsed.progress,
        completedMissionIds: parsed.progress?.completedMissionIds ?? [],
        completedScenarioIds: parsed.progress?.completedScenarioIds ?? [],
      },
    };
  } catch {
    return {
      progress: { ...DEFAULT_PROGRESS_PROFILE },
    };
  }
}

function writeStoredState(state: StoredGameState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createLocalGameDataAdapter(): GameDataAdapter {
  return {
    source: 'local',
    async loadBootstrapData(): Promise<GameBootstrapData> {
      const stored = readStoredState();
      return {
        roles: DEFAULT_PLAYER_ROLES,
        scenarios: DEFAULT_AVAILABLE_SCENARIOS,
        progress: stored.progress,
      };
    },
    async saveMissionProgress(snapshot: MissionProgressSnapshot) {
      const stored = readStoredState();
      stored.progress.lastMissionSnapshot = snapshot;
      writeStoredState(stored);
    },
    async saveScenarioResult(result: ScenarioResultRecord) {
      const stored = readStoredState();
      stored.progress.lastScenarioResult = result;
      if (result.outcome === 'completed') {
        if (!stored.progress.completedMissionIds.includes(result.missionId)) {
          stored.progress.completedMissionIds = [
            ...stored.progress.completedMissionIds,
            result.missionId,
          ];
        }
        if (!stored.progress.completedScenarioIds.includes(result.scenarioId)) {
          stored.progress.completedScenarioIds = [
            ...stored.progress.completedScenarioIds,
            result.scenarioId,
          ];
        }
      }
      writeStoredState(stored);
    },
    async setActiveRole(roleId: string) {
      const stored = readStoredState();
      stored.progress.activeRoleId = roleId;
      writeStoredState(stored);
    },
    async setActiveScenario(scenarioId: string) {
      const stored = readStoredState();
      stored.progress.activeScenarioId = scenarioId;
      writeStoredState(stored);
    },
  };
}
