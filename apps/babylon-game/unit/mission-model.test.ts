import { describe, expect, it } from 'vitest';

import {
  KINETIC_BEACON_MISSION,
  createMissionDefinitionForScenario,
  createMissionState,
} from '../src/game/missions/mission-model';
import { DEFAULT_GAME_SCENARIOS } from '../src/game/scenarios/scenario-model';

describe('mission-model', () => {
  it('creates a mission definition from scenario', () => {
    const scenario = DEFAULT_GAME_SCENARIOS[0];
    const definition = createMissionDefinitionForScenario(scenario);

    expect(definition.id).toBe(`mission-${scenario?.id}`);
    expect(definition.title).toBe(scenario?.missionTitle);
  });

  it('falls back to kinetic mission if scenario is undefined', () => {
    const definition = createMissionDefinitionForScenario(undefined);

    expect(definition).toEqual(KINETIC_BEACON_MISSION);
  });

  it('creates mission state with status', () => {
    const state = createMissionState(KINETIC_BEACON_MISSION, 'active');

    expect(state.status).toBe('active');
    expect(state.id).toBe(KINETIC_BEACON_MISSION.id);
  });
});
