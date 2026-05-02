import { describe, expect, it } from 'vitest';

import {
  DEFAULT_GAME_SCENARIOS,
  GAME_LEVEL_ROADMAP,
  ROADMAP_TOTAL_LEVELS,
  resolveAvailableScenarios,
} from '../src/game/scenarios/scenario-model';

describe('scenario-model', () => {
  it('builds a 100-level roadmap', () => {
    expect(GAME_LEVEL_ROADMAP).toHaveLength(ROADMAP_TOTAL_LEVELS);
    expect(GAME_LEVEL_ROADMAP[0]?.levelNumber).toBe(1);
    expect(GAME_LEVEL_ROADMAP[99]?.levelNumber).toBe(100);
  });

  it('keeps world ids in roadmap entries', () => {
    const worldIds = new Set(GAME_LEVEL_ROADMAP.map(level => level.worldId));
    expect(worldIds.size).toBeGreaterThan(1);
    expect([...worldIds]).toContain('gemeinde');
  });

  it('unlocks scenarios based on completed scenario ids', () => {
    const unlocked = resolveAvailableScenarios(DEFAULT_GAME_SCENARIOS, ['dialog-start']);
    const dialogStart = unlocked.find(entry => entry.id === 'dialog-start');
    const nextScenario = unlocked.find(entry => entry.id === 'nachbarschaft-dialog');

    expect(dialogStart?.status).toBe('playable');
    expect(nextScenario?.status).toBe('playable');
  });

  it('keeps later scenarios locked when prerequisites are missing', () => {
    const unlocked = resolveAvailableScenarios(DEFAULT_GAME_SCENARIOS, []);
    const laterScenario = unlocked.find(entry => entry.id === 'gemeinde-dialog-10');

    expect(laterScenario?.status).toBe('locked');
  });
});
