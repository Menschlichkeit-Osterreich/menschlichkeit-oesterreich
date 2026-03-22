export function createStateMachine(config) {
  const { initialState, transitions, onTransition } = config;
  let currentState = initialState;

  function canTransition(nextState) {
    const allowedStates = transitions[currentState] ?? [];
    return allowedStates.includes(nextState);
  }

  function transition(nextState, context = {}) {
    if (currentState === nextState) {
      return currentState;
    }

    if (!canTransition(nextState)) {
      throw new Error(`Ungueltiger Screen-Wechsel: ${currentState} -> ${nextState}`);
    }

    const previousState = currentState;
    currentState = nextState;
    onTransition?.({ previousState, nextState, context });
    return currentState;
  }

  return {
    getState: () => currentState,
    canTransition,
    transition,
  };
}
