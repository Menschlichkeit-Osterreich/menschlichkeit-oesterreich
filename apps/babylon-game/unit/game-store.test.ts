import { describe, expect, it } from 'vitest';

import { createGameStore } from '../src/game/state/game-store';

describe('game-store', () => {
  it('updates state via patch', () => {
    const store = createGameStore();
    store.setState({ status: 'updated' });

    expect(store.getState().status).toBe('updated');
  });

  it('subscribes and unsubscribes listeners', () => {
    const store = createGameStore();
    let calls = 0;

    const unsubscribe = store.subscribe(() => {
      calls += 1;
    });

    store.setState({ status: 'a' });
    unsubscribe();
    store.setState({ status: 'b' });

    expect(calls).toBe(2);
  });

  it('handles reentrant updates without infinite recursion', () => {
    const store = createGameStore();
    let calls = 0;

    store.subscribe(state => {
      calls += 1;
      if (state.status === 'first') {
        store.setState({ status: 'second' });
      }
    });

    store.setState({ status: 'first' });

    expect(store.getState().status).toBe('second');
    expect(calls).toBeGreaterThanOrEqual(2);
    expect(calls).toBeLessThan(10);
  });
});
