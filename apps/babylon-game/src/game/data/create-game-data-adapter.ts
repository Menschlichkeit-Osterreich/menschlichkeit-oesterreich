import { createApiGameDataAdapter } from '@/game/data/api-game-data-adapter';
import type { GameDataAdapter, GameDataAdapterConfig } from '@/game/data/contracts';
import { createLocalGameDataAdapter } from '@/game/data/local-game-data-adapter';

export function createGameDataAdapter(
  config: Partial<GameDataAdapterConfig> = {}
): GameDataAdapter {
  const normalized: GameDataAdapterConfig = {
    source: config.source ?? 'local',
    ...(config.baseUrl ? { baseUrl: config.baseUrl } : {}),
  };

  if (normalized.source === 'api' || normalized.source === 'api-stub') {
    return createApiGameDataAdapter(normalized);
  }

  return createLocalGameDataAdapter();
}
