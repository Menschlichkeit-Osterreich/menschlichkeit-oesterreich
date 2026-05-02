import { failMission, updateMissionProgress } from '@/game/missions/ring-beacon-mission';
import type { CollectibleSet } from '@/game/objects/create-collectibles';
import type { GoalBeacon } from '@/game/objects/create-goal-beacon';
import type { KineticCore } from '@/game/objects/create-kinetic-core';
import type { PlayerActor } from '@/game/objects/create-player';
import type { GameStore } from '@/game/state/game-store';
import type { InputController } from '@/game/systems/input-controller';
import { updatePlayerMovement } from '@/game/systems/player-movement';

export function updateGameplay({
  deltaSeconds,
  timeSeconds,
  player,
  collectibles,
  kineticCore,
  goalBeacon,
  input,
  store,
}: {
  deltaSeconds: number;
  timeSeconds: number;
  player: PlayerActor;
  collectibles: CollectibleSet;
  kineticCore: KineticCore;
  goalBeacon: GoalBeacon;
  input: InputController;
  store: GameStore;
}) {
  const state = store.getState();
  if (state.phase !== 'playing') {
    return;
  }

  const movement = updatePlayerMovement({
    deltaSeconds,
    player,
    input,
    speedMultiplier: state.activeRole.moveSpeedMultiplier ?? 1,
  });
  if (movement.fellOut) {
    failMission(store, {
      status: 'Du bist aus der Arena gefallen.',
      hint: 'Setze die Runde zurück und versuche es erneut.',
      remainingSeconds: Math.max(0, state.remainingSeconds),
    });
    return;
  }

  updateMissionProgress({
    deltaSeconds,
    timeSeconds,
    playerPosition: player.mesh.position,
    collectibles,
    kineticCore,
    goalBeacon,
    input,
    store,
  });
}
