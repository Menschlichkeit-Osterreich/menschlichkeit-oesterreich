import type { GameProfile, GameProgress, ScreenState } from '@/game/types';

const TRANSITIONS: Record<ScreenState, ScreenState[]> = {
  auth: ['role', 'world'],
  role: ['world', 'auth'],
  world: ['role', 'scenario', 'auth'],
  scenario: ['world', 'result', 'auth'],
  result: ['world', 'scenario', 'role', 'auth'],
};

export function canTransition(current: ScreenState, next: ScreenState): boolean {
  return TRANSITIONS[current].includes(next);
}

export function resolveInitialScreen(profile: GameProfile | null, _progress: GameProgress | null): ScreenState {
  if (!profile) {
    return 'auth';
  }
  if (!profile.selectedRole) {
    return 'role';
  }
  return 'world';
}
