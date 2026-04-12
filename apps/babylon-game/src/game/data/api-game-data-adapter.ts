import {
  DEFAULT_AVAILABLE_SCENARIOS,
  DEFAULT_PLAYER_ROLES,
  DEFAULT_PROGRESS_PROFILE,
  type GameBootstrapData,
  type GameDataAdapter,
  type GameDataAdapterConfig,
  type MissionProgressSnapshot,
  type ScenarioResultRecord,
} from '@/game/data/contracts';
import { createLocalGameDataAdapter } from '@/game/data/local-game-data-adapter';

interface BootstrapResponseDto {
  roles?: GameBootstrapData['roles'];
  scenarios?: GameBootstrapData['scenarios'];
  progress?: GameBootstrapData['progress'];
}

async function postJson(baseUrl: string, path: string, payload: unknown) {
  await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function createApiGameDataAdapter(config: GameDataAdapterConfig): GameDataAdapter {
  const localFallback = createLocalGameDataAdapter();
  const baseUrl = config.baseUrl?.trim() ?? '';

  return {
    source: 'api-stub',
    async loadBootstrapData(): Promise<GameBootstrapData> {
      const fallbackData = await localFallback.loadBootstrapData();
      if (!baseUrl) {
        return fallbackData;
      }

      try {
        const response = await fetch(`${baseUrl}/game/bootstrap`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`Bootstrap-Request fehlgeschlagen: ${response.status}`);
        }

        const dto = (await response.json()) as BootstrapResponseDto;
        return {
          roles: dto.roles?.length ? dto.roles : DEFAULT_PLAYER_ROLES,
          scenarios: dto.scenarios?.length ? dto.scenarios : DEFAULT_AVAILABLE_SCENARIOS,
          progress: {
            ...DEFAULT_PROGRESS_PROFILE,
            ...dto.progress,
            completedMissionIds: dto.progress?.completedMissionIds ?? [],
            completedScenarioIds: dto.progress?.completedScenarioIds ?? [],
          },
        };
      } catch (error) {
        console.warn(
          'API-Stub konnte keine Bootstrap-Daten laden, lokales Fallback wird verwendet.',
          error
        );
        return fallbackData;
      }
    },
    async saveMissionProgress(snapshot: MissionProgressSnapshot) {
      if (!baseUrl) {
        await localFallback.saveMissionProgress(snapshot);
        return;
      }

      try {
        await postJson(baseUrl, '/game/progress', snapshot);
      } catch (error) {
        console.warn(
          'Mission-Progress konnte nicht an die API übergeben werden, lokal wird gespeichert.',
          error
        );
        await localFallback.saveMissionProgress(snapshot);
      }
    },
    async saveScenarioResult(result: ScenarioResultRecord) {
      if (!baseUrl) {
        await localFallback.saveScenarioResult(result);
        return;
      }

      try {
        await postJson(baseUrl, '/game/scenario-result', result);
      } catch (error) {
        console.warn(
          'Szenario-Ergebnis konnte nicht an die API übergeben werden, lokal wird gespeichert.',
          error
        );
        await localFallback.saveScenarioResult(result);
      }
    },
    async setActiveRole(roleId: string) {
      if (!baseUrl) {
        await localFallback.setActiveRole(roleId);
        return;
      }

      try {
        await postJson(baseUrl, '/game/active-role', { roleId });
      } catch (error) {
        console.warn(
          'Rollenwechsel konnte nicht an die API übergeben werden, lokal wird gespeichert.',
          error
        );
        await localFallback.setActiveRole(roleId);
      }
    },
    async setActiveScenario(scenarioId: string) {
      if (!baseUrl) {
        await localFallback.setActiveScenario(scenarioId);
        return;
      }

      try {
        await postJson(baseUrl, '/game/active-scenario', { scenarioId });
      } catch (error) {
        console.warn(
          'Szenariowechsel konnte nicht an die API übergeben werden, lokal wird gespeichert.',
          error
        );
        await localFallback.setActiveScenario(scenarioId);
      }
    },
  };
}
