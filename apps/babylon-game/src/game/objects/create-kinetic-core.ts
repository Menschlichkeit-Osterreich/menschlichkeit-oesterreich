import {
  Color3,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Quaternion,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

const PUSH_RADIUS = 2.1;
const CHARGE_RADIUS = 0.95;
const LANE_CENTER = new Vector3(0, 0.45, 5.8);
const CORE_START_POSITION = new Vector3(-4.2, 1.08, 5.8);
const PAD_POSITION = new Vector3(4.2, 0.68, 5.8);

const CORE_LOCKED_COLOR = new Color3(0.3, 0.34, 0.42);
const CORE_READY_COLOR = new Color3(0.82, 0.48, 0.14);
const CORE_HIGHLIGHT_COLOR = new Color3(0.2, 0.88, 1);
const CORE_CHARGED_COLOR = new Color3(0.18, 0.9, 0.45);

const PAD_LOCKED_COLOR = new Color3(0.18, 0.2, 0.26);
const PAD_READY_COLOR = new Color3(0.55, 0.35, 0.08);
const PAD_CHARGED_COLOR = new Color3(0.08, 0.7, 0.38);

export interface KineticCore {
  core: Mesh;
  unlock(): void;
  isUnlocked(): boolean;
  isCharged(): boolean;
  highlightNearby(playerPosition: Vector3, radiusMultiplier?: number): boolean;
  tryPush(playerPosition: Vector3, radiusMultiplier?: number): boolean;
  update(): boolean;
  reset(): void;
}

export function createKineticCore(scene: Scene): KineticCore {
  const physicsEnabled = scene.isPhysicsEnabled();

  const laneMaterial = new StandardMaterial('kinetic-lane-material', scene);
  laneMaterial.diffuseColor = new Color3(0.18, 0.22, 0.3);

  const railMaterial = new StandardMaterial('kinetic-rail-material', scene);
  railMaterial.diffuseColor = new Color3(0.42, 0.18, 0.18);

  const padMaterial = new StandardMaterial('kinetic-pad-material', scene);
  padMaterial.diffuseColor = new Color3(0.22, 0.26, 0.34);
  padMaterial.emissiveColor = PAD_LOCKED_COLOR.clone();

  const lane = MeshBuilder.CreateBox('kinetic-lane', { width: 10, height: 0.3, depth: 2.4 }, scene);
  lane.position.copyFrom(LANE_CENTER);
  lane.material = laneMaterial;
  lane.checkCollisions = true;
  lane.isPickable = true;

  const railOffsets = [-1, 1];
  for (const direction of railOffsets) {
    const rail = MeshBuilder.CreateBox(
      `kinetic-rail-${direction > 0 ? 'north' : 'south'}`,
      { width: 10, height: 0.6, depth: 0.18 },
      scene
    );
    rail.position = new Vector3(0, 0.78, LANE_CENTER.z + direction * 1.08);
    rail.material = railMaterial;
    rail.checkCollisions = true;
    rail.isPickable = true;
    if (physicsEnabled) {
      new PhysicsAggregate(
        rail,
        PhysicsShapeType.BOX,
        { mass: 0, friction: 0.9, restitution: 0.05 },
        scene
      );
    }
  }

  const pad = MeshBuilder.CreateCylinder(
    'kinetic-pad',
    { diameter: 1.5, height: 0.16, tessellation: 24 },
    scene
  );
  pad.position.copyFrom(PAD_POSITION);
  pad.material = padMaterial;
  pad.checkCollisions = true;
  pad.isPickable = true;

  if (physicsEnabled) {
    new PhysicsAggregate(
      lane,
      PhysicsShapeType.BOX,
      { mass: 0, friction: 0.95, restitution: 0.05 },
      scene
    );
    new PhysicsAggregate(
      pad,
      PhysicsShapeType.CYLINDER,
      { mass: 0, friction: 1, restitution: 0.05 },
      scene
    );
  }

  const core = MeshBuilder.CreateSphere('kinetic-core', { diameter: 0.82, segments: 20 }, scene);
  core.position.copyFrom(CORE_START_POSITION);
  core.isPickable = false;
  core.checkCollisions = false;

  const coreMaterial = new StandardMaterial('kinetic-core-material', scene);
  coreMaterial.diffuseColor = new Color3(0.9, 0.74, 0.25);
  coreMaterial.emissiveColor = CORE_LOCKED_COLOR.clone();
  core.material = coreMaterial;

  const aggregate = physicsEnabled
    ? new PhysicsAggregate(
        core,
        PhysicsShapeType.SPHERE,
        { mass: 1, friction: 0.9, restitution: 0.12 },
        scene
      )
    : null;
  aggregate?.body.setLinearDamping(0.55);
  aggregate?.body.setAngularDamping(0.65);

  let unlocked = false;
  let charged = false;

  const stopCoreMotion = () => {
    aggregate?.body.setLinearVelocity(Vector3.Zero());
    aggregate?.body.setAngularVelocity(Vector3.Zero());
  };

  const applyVisualState = (isHighlighted: boolean) => {
    core.scaling.setAll(isHighlighted ? 1.06 : 1);

    if (charged) {
      coreMaterial.emissiveColor.copyFrom(CORE_CHARGED_COLOR);
      padMaterial.emissiveColor.copyFrom(PAD_CHARGED_COLOR);
      return;
    }

    if (!unlocked) {
      coreMaterial.emissiveColor.copyFrom(CORE_LOCKED_COLOR);
      padMaterial.emissiveColor.copyFrom(PAD_LOCKED_COLOR);
      return;
    }

    coreMaterial.emissiveColor.copyFrom(isHighlighted ? CORE_HIGHLIGHT_COLOR : CORE_READY_COLOR);
    padMaterial.emissiveColor.copyFrom(PAD_READY_COLOR);
  };

  const snapCoreToPad = () => {
    charged = true;
    const lockedPosition = PAD_POSITION.add(new Vector3(0, 0.5, 0));
    stopCoreMotion();
    aggregate?.body.setTargetTransform(lockedPosition, Quaternion.Identity());
    core.position.copyFrom(lockedPosition);
    applyVisualState(false);
  };

  applyVisualState(false);

  return {
    core,
    unlock() {
      if (charged) {
        return;
      }

      unlocked = true;
      applyVisualState(false);
    },
    isUnlocked() {
      return unlocked;
    },
    isCharged() {
      return charged;
    },
    highlightNearby(playerPosition, radiusMultiplier = 1) {
      const effectiveRadius = PUSH_RADIUS * radiusMultiplier;
      const isHighlighted =
        unlocked && !charged && Vector3.Distance(playerPosition, core.position) <= effectiveRadius;
      applyVisualState(isHighlighted);
      return isHighlighted;
    },
    tryPush(playerPosition, radiusMultiplier = 1) {
      const effectiveRadius = PUSH_RADIUS * radiusMultiplier;
      if (!unlocked || charged || Vector3.Distance(playerPosition, core.position) > effectiveRadius) {
        return false;
      }

      const impulseDirection = core.position.subtract(playerPosition);
      impulseDirection.y = 0;

      if (impulseDirection.lengthSquared() < 0.001) {
        impulseDirection.copyFromFloats(1, 0, 0);
      }

      if (aggregate) {
        const impulse = impulseDirection
          .normalize()
          .scale(1.8)
          .add(new Vector3(0, 0.3, 0));
        aggregate.body.applyImpulse(impulse, core.getAbsolutePosition());
      } else {
        const toPad = PAD_POSITION.subtract(core.position);
        toPad.y = 0;
        const step = toPad.length() > 1.35 ? toPad.normalize().scale(1.35) : toPad;
        core.position.addInPlace(step);
        core.position.y = CORE_START_POSITION.y;
      }
      applyVisualState(true);
      return true;
    },
    update() {
      if (!unlocked || charged) {
        return false;
      }

      if (Vector3.Distance(core.position, PAD_POSITION) <= CHARGE_RADIUS) {
        snapCoreToPad();
        return true;
      }

      return false;
    },
    reset() {
      unlocked = false;
      charged = false;
      core.setEnabled(true);
      stopCoreMotion();
      aggregate?.body.setTargetTransform(CORE_START_POSITION, Quaternion.Identity());
      core.position.copyFrom(CORE_START_POSITION);
      applyVisualState(false);
    },
  };
}
