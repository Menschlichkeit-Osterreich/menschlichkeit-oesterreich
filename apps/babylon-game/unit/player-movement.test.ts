import { Vector3 } from '@babylonjs/core';
import { describe, expect, it, vi } from 'vitest';

import { updatePlayerMovement } from '../src/game/systems/player-movement';

function buildPlayer({
  grounded,
  y,
  verticalVelocity,
}: {
  grounded: boolean;
  y: number;
  verticalVelocity: number;
}) {
  const moveWithCollisions = vi.fn();
  let velocity = verticalVelocity;

  return {
    moveWithCollisions,
    player: {
      mesh: {
        position: { y },
        moveWithCollisions,
      },
      isGrounded: vi.fn(() => grounded),
      getVerticalVelocity: vi.fn(() => velocity),
      setVerticalVelocity: vi.fn((next: number) => {
        velocity = next;
      }),
    },
    getVelocity: () => velocity,
  };
}

describe('player-movement', () => {
  it('normalisiert diagonale Bewegung und berechnet Sprintgeschwindigkeit mit Multiplikator', () => {
    const setup = buildPlayer({ grounded: true, y: 1, verticalVelocity: 0 });
    const input = {
      getSnapshot: vi.fn(() => ({ moveX: 1, moveZ: 1, sprint: true })),
      consumeJump: vi.fn(() => false),
    };

    const result = updatePlayerMovement({
      deltaSeconds: 0.5,
      player: setup.player as never,
      input: input as never,
      speedMultiplier: 2,
    });

    const movementVector = setup.moveWithCollisions.mock.calls[0][0] as Vector3;
    expect(movementVector.x).toBeCloseTo(5.0911, 3);
    expect(movementVector.z).toBeCloseTo(5.0911, 3);
    expect(movementVector.y).toBe(0);
    expect(result.fellOut).toBe(false);
  });

  it('setzt Sprungkraft beim Grounded-Jump und meldet Arena-Fall korrekt', () => {
    const setup = buildPlayer({ grounded: true, y: -6, verticalVelocity: 0 });
    const input = {
      getSnapshot: vi.fn(() => ({ moveX: 0, moveZ: 0, sprint: false })),
      consumeJump: vi.fn(() => true),
    };

    const result = updatePlayerMovement({
      deltaSeconds: 0.25,
      player: setup.player as never,
      input: input as never,
    });

    const movementVector = setup.moveWithCollisions.mock.calls[0][0] as Vector3;
    expect(setup.getVelocity()).toBe(7.5);
    expect(movementVector.y).toBeCloseTo(1.875, 6);
    expect(result.fellOut).toBe(true);
  });

  it('wendet Gravitation in der Luft an, wenn kein Jump gequeued ist', () => {
    const setup = buildPlayer({ grounded: false, y: 2, verticalVelocity: 5 });
    const input = {
      getSnapshot: vi.fn(() => ({ moveX: 0, moveZ: -1, sprint: false })),
      consumeJump: vi.fn(() => false),
    };

    updatePlayerMovement({
      deltaSeconds: 0.2,
      player: setup.player as never,
      input: input as never,
    });

    const movementVector = setup.moveWithCollisions.mock.calls[0][0] as Vector3;
    expect(setup.getVelocity()).toBeCloseTo(1.4, 6);
    expect(movementVector.z).toBeCloseTo(-0.9, 6);
    expect(movementVector.y).toBeCloseTo(0.28, 6);
  });
});