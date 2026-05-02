import { Vector3 } from '@babylonjs/core';

import type { PlayerActor } from '@/game/objects/create-player';
import type { InputController } from '@/game/systems/input-controller';

const WALK_SPEED = 4.5;
const SPRINT_SPEED = 7.2;
const JUMP_FORCE = 7.5;
const GRAVITY = 18;
const FALL_BOUNDARY_Y = -5;

export function updatePlayerMovement({
  deltaSeconds,
  player,
  input,
  speedMultiplier = 1,
}: {
  deltaSeconds: number;
  player: PlayerActor;
  input: InputController;
  speedMultiplier?: number;
}) {
  const snapshot = input.getSnapshot();
  let direction = new Vector3(snapshot.moveX, 0, snapshot.moveZ);
  if (direction.lengthSquared() > 1) {
    direction = direction.normalize();
  }

  const speed = (snapshot.sprint ? SPRINT_SPEED : WALK_SPEED) * speedMultiplier;
  const grounded = player.isGrounded();
  let verticalVelocity = grounded
    ? Math.max(0, player.getVerticalVelocity())
    : player.getVerticalVelocity() - GRAVITY * deltaSeconds;

  if (grounded && input.consumeJump()) {
    verticalVelocity = JUMP_FORCE;
  }

  player.setVerticalVelocity(verticalVelocity);
  player.mesh.moveWithCollisions(
    new Vector3(
      direction.x * speed * deltaSeconds,
      verticalVelocity * deltaSeconds,
      direction.z * speed * deltaSeconds
    )
  );

  return {
    fellOut: player.mesh.position.y < FALL_BOUNDARY_Y,
  };
}
