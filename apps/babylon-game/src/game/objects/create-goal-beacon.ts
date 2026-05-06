import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core';

const INACTIVE_COLOR = new Color3(0.15, 0.18, 0.24);
const ACTIVE_COLOR = new Color3(0.1, 0.85, 0.45);
const HIGHLIGHT_COLOR = new Color3(0.35, 1, 0.85);
const INTERACTION_RADIUS = 2;

export interface GoalBeacon {
  mesh: Mesh;
  activate(): void;
  deactivate(): void;
  isActive(): boolean;
  highlightNearby(position: Vector3, radiusMultiplier?: number): boolean;
  tryComplete(position: Vector3, radiusMultiplier?: number): boolean;
  animate(timeSeconds: number): void;
  reset(): void;
}

export function createGoalBeacon(scene: Scene): GoalBeacon {
  const pedestal = MeshBuilder.CreateCylinder(
    'goal-beacon',
    { diameter: 1.2, height: 2.2, tessellation: 24 },
    scene
  );
  pedestal.position = new Vector3(0, 1.1, 8);
  pedestal.isPickable = false;
  pedestal.checkCollisions = false;

  const material = new StandardMaterial('goal-beacon-material', scene);
  material.diffuseColor = new Color3(0.22, 0.28, 0.36);
  material.emissiveColor = INACTIVE_COLOR.clone();
  pedestal.material = material;

  let active = false;

  const applyVisualState = (isHighlighted: boolean) => {
    if (!active) {
      material.emissiveColor.copyFrom(INACTIVE_COLOR);
      pedestal.scaling.setAll(1);
      return;
    }

    material.emissiveColor.copyFrom(isHighlighted ? HIGHLIGHT_COLOR : ACTIVE_COLOR);
    pedestal.scaling.setAll(isHighlighted ? 1.08 : 1);
  };

  applyVisualState(false);

  return {
    mesh: pedestal,
    activate() {
      active = true;
      applyVisualState(false);
    },
    deactivate() {
      active = false;
      applyVisualState(false);
    },
    isActive() {
      return active;
    },
    highlightNearby(position, radiusMultiplier = 1) {
      const effectiveRadius = INTERACTION_RADIUS * radiusMultiplier;
      const isHighlighted =
        active && Vector3.Distance(position, pedestal.position) <= effectiveRadius;
      applyVisualState(isHighlighted);
      return isHighlighted;
    },
    tryComplete(position, radiusMultiplier = 1) {
      const effectiveRadius = INTERACTION_RADIUS * radiusMultiplier;
      return active && Vector3.Distance(position, pedestal.position) <= effectiveRadius;
    },
    animate(timeSeconds) {
      if (!active) {
        return;
      }

      pedestal.position.y = 1.1 + Math.sin(timeSeconds * 2.5) * 0.08;
    },
    reset() {
      pedestal.position = new Vector3(0, 1.1, 8);
      active = false;
      applyVisualState(false);
    },
  };
}
