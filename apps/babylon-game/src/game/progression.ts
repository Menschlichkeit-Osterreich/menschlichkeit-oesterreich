import { GAME_SCENARIOS, TOTAL_PLAYABLE_SCENARIOS } from '@/game/content';

const SCENARIO_SEQUENCE = GAME_SCENARIOS.map((scenario) => scenario.id);

function requireLastScenarioId(): string {
  const lastScenarioId = SCENARIO_SEQUENCE[SCENARIO_SEQUENCE.length - 1];
  if (!lastScenarioId) {
    throw new Error('SCENARIO_SEQUENCE ist leer und kann nicht als Fallback verwendet werden.');
  }
  return lastScenarioId;
}

export function calculatePlayerLevelFromXp(xp: number): number {
  return Math.max(1, 1 + Math.floor((xp ?? 0) / 140));
}

export function getUnlockedScenarioIds(completedScenarioIds: string[]): string[] {
  const unlockedCount = Math.min(TOTAL_PLAYABLE_SCENARIOS, Math.max(1, completedScenarioIds.length + 1));
  return SCENARIO_SEQUENCE.slice(0, unlockedCount);
}

export function getNextScenarioId(completedScenarioIds: string[]): string | null {
  for (const scenarioId of SCENARIO_SEQUENCE) {
    if (!completedScenarioIds.includes(scenarioId)) {
      return scenarioId;
    }
  }
  return null;
}

export function resolveResumeScenarioId(resumeScenarioId: string | null, completedScenarioIds: string[]): string {
  if (resumeScenarioId && SCENARIO_SEQUENCE.includes(resumeScenarioId)) {
    return resumeScenarioId;
  }
  return getNextScenarioId(completedScenarioIds) ?? requireLastScenarioId();
}

export function calculateProgressPercent(completedCount: number): number {
  return Math.round((completedCount / TOTAL_PLAYABLE_SCENARIOS) * 100);
}
