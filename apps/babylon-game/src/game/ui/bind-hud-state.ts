import type { GameStore } from '@/game/state/game-store';
import type { GameHudState } from '@/game/state/game-types';

export function bindHudState(store: GameStore, onStateChange?: (state: GameHudState) => void) {
  return onStateChange ? store.subscribe(onStateChange) : () => {};
}
