import type { GameScenario } from '@/game/scenarios/scenario-model';

export type MissionStatus = 'ready' | 'active' | 'completed' | 'failed';

export interface MissionDefinition {
  id: string;
  title: string;
  objective: string;
  completionCondition: string;
}

export interface MissionState extends MissionDefinition {
  status: MissionStatus;
}

export const KINETIC_BEACON_MISSION: MissionDefinition = {
  id: 'kinetic-beacon',
  title: 'Treffpunkt öffnen',
  objective: 'Sammle alle Gesprächsimpulse und öffne danach den Treffpunkt.',
  completionCondition:
    'Bringe den Gemeinschaftskern zur Plattform und aktiviere danach den Treffpunkt mit E.',
};

export function createMissionDefinitionForScenario(
  scenario: GameScenario | null | undefined
): MissionDefinition {
  if (!scenario) {
    return KINETIC_BEACON_MISSION;
  }

  return {
    id: `mission-${scenario.id}`,
    title: scenario.missionTitle,
    objective: scenario.missionObjective,
    completionCondition: scenario.missionCompletionCondition,
  };
}

export function createMissionState(
  definition: MissionDefinition,
  status: MissionStatus
): MissionState {
  return {
    ...definition,
    status,
  };
}
