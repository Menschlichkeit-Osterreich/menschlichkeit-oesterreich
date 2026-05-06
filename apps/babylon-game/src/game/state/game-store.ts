import { DEFAULT_HUD_STATE, type GameHudState } from './game-types';

export type GameStateListener = (state: GameHudState) => void;

export function createGameStore(initialState: Partial<GameHudState> = {}) {
  let state: GameHudState = {
    ...DEFAULT_HUD_STATE,
    ...initialState,
  };
  const listeners = new Set<GameStateListener>();
  let emitting = false;
  let rerun = false;

  const emit = () => {
    if (emitting) {
      rerun = true;
      return;
    }

    emitting = true;
    do {
      rerun = false;
      for (const listener of listeners) {
        listener(state);
      }
    } while (rerun);
    emitting = false;
  };

  return {
    getState() {
      return state;
    },
    setState(patch: Partial<GameHudState>) {
      state = {
        ...state,
        ...patch,
      };
      emit();
    },
    reset(patch: Partial<GameHudState> = {}) {
      state = {
        ...DEFAULT_HUD_STATE,
        ...patch,
      };
      emit();
    },
    subscribe(listener: GameStateListener) {
      listeners.add(listener);
      listener(state);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type GameStore = ReturnType<typeof createGameStore>;
