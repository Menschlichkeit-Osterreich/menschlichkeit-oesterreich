import { beforeEach, describe, expect, it, vi } from 'vitest';

const failMissionMock = vi.fn();
const updateMissionProgressMock = vi.fn();
const updatePlayerMovementMock = vi.fn();

async function loadGameplayModule() {
  vi.doMock('@/game/missions/ring-beacon-mission', () => ({
    failMission: failMissionMock,
    updateMissionProgress: updateMissionProgressMock,
  }));
  vi.doMock('@/game/systems/player-movement', () => ({
    updatePlayerMovement: updatePlayerMovementMock,
  }));

  return import('../src/game/systems/gameplay-loop');
}

function createStore(phase: 'loading' | 'start' | 'playing' | 'success' | 'fail' = 'playing') {
  const state = {
    phase,
    activeRole: {
      moveSpeedMultiplier: 1.5,
    },
    remainingSeconds: 12,
  };

  return {
    getState: vi.fn(() => state),
  };
}

describe('gameplay-loop', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('überspringt Gameplay-Updates ausserhalb der playing-Phase', async () => {
    updatePlayerMovementMock.mockReturnValue({ fellOut: false });
    const { updateGameplay } = await loadGameplayModule();

    updateGameplay({
      deltaSeconds: 0.16,
      timeSeconds: 5,
      player: { mesh: { position: { y: 0 } } },
      collectibles: {},
      kineticCore: {},
      goalBeacon: {},
      input: {},
      store: createStore('start'),
    } as never);

    expect(updatePlayerMovementMock).not.toHaveBeenCalled();
    expect(updateMissionProgressMock).not.toHaveBeenCalled();
    expect(failMissionMock).not.toHaveBeenCalled();
  });

  it('markiert die Mission als fehlgeschlagen, wenn der Spieler aus der Arena faellt', async () => {
    updatePlayerMovementMock.mockReturnValue({ fellOut: true });
    const { updateGameplay } = await loadGameplayModule();
    const store = createStore('playing');

    updateGameplay({
      deltaSeconds: 0.16,
      timeSeconds: 5,
      player: { mesh: { position: { y: -10 } } },
      collectibles: {},
      kineticCore: {},
      goalBeacon: {},
      input: {},
      store,
    } as never);

    expect(updatePlayerMovementMock).toHaveBeenCalledWith(
      expect.objectContaining({
        deltaSeconds: 0.16,
        speedMultiplier: 1.5,
      })
    );
    expect(failMissionMock).toHaveBeenCalledWith(store, {
      status: 'Du bist aus der Arena gefallen.',
      hint: 'Setze die Runde zurück und versuche es erneut.',
      remainingSeconds: 12,
    });
    expect(updateMissionProgressMock).not.toHaveBeenCalled();
  });

  it('delegiert bei stabilem Bewegungszustand an den Missionsfortschritt', async () => {
    updatePlayerMovementMock.mockReturnValue({ fellOut: false });
    const { updateGameplay } = await loadGameplayModule();
    const store = createStore('playing');
    const player = { mesh: { position: { x: 1, y: 0, z: 2 } } };
    const collectibles = { id: 'collectibles' };
    const kineticCore = { id: 'core' };
    const goalBeacon = { id: 'beacon' };
    const input = { id: 'input' };

    updateGameplay({
      deltaSeconds: 0.25,
      timeSeconds: 11,
      player,
      collectibles,
      kineticCore,
      goalBeacon,
      input,
      store,
    } as never);

    expect(updateMissionProgressMock).toHaveBeenCalledWith({
      deltaSeconds: 0.25,
      timeSeconds: 11,
      playerPosition: player.mesh.position,
      collectibles,
      kineticCore,
      goalBeacon,
      input,
      store,
    });
  });
});