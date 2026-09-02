import {
  Color3,
  Color4,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
  type AbstractMesh,
} from '@babylonjs/core';

import { ensureDefaultLighting } from '@/game/bootstrap/ensure-default-lighting';
import type { GameScenario } from '@/game/scenarios/scenario-model';
import type { EnvironmentMode } from '@/game/state/game-types';
import { loadScene, scriptsMap } from '@/scripts';

export interface EnvironmentLoadResult {
  scene: Scene;
  mode: EnvironmentMode;
}

const SCENE_PATH = '/scene/example.babylon';

function applyMaterialColor(
  scene: Scene,
  materialName: string,
  {
    diffuse,
    emissive,
  }: {
    diffuse: Color3;
    emissive?: Color3;
  }
) {
  const material = scene.getMaterialByName(materialName);
  if (material instanceof StandardMaterial) {
    material.diffuseColor.copyFrom(diffuse);
    if (emissive) {
      material.emissiveColor.copyFrom(emissive);
    }
  }
}

export function applyScenarioEnvironmentTheme(scene: Scene, scenario: GameScenario) {
  // Welt 1 — Gemeindeplatz. Eine Arena, eine Palette.
  // Grund #143B4D, Platzpflaster #1C4A5E, Häuserzeile #6F6259.
  const themeMap: Record<
    GameScenario['visualTheme'],
    {
      clear: Color4;
      fogDensity: number;
      fogColor: Color3;
      groundDiffuse: Color3;
      groundEmissive: Color3;
      wallDiffuse: Color3;
      wallEmissive: Color3;
    }
  > = {
    'welt1-gemeindeplatz': {
      clear: new Color4(0.051, 0.169, 0.227, 1),
      fogDensity: 0.004,
      fogColor: new Color3(0.078, 0.231, 0.302),
      groundDiffuse: new Color3(0.11, 0.29, 0.369),
      groundEmissive: new Color3(0.012, 0.035, 0.047),
      wallDiffuse: new Color3(0.435, 0.384, 0.349),
      wallEmissive: new Color3(0.024, 0.02, 0.016),
    },
  };

  const theme = themeMap[scenario.visualTheme] ?? themeMap['welt1-gemeindeplatz'];
  scene.clearColor = theme.clear;
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = theme.fogDensity;
  scene.fogColor = theme.fogColor;

  applyMaterialColor(scene, 'arena-ground-material', {
    diffuse: theme.groundDiffuse,
    emissive: theme.groundEmissive,
  });
  applyMaterialColor(scene, 'arena-wall-material', {
    diffuse: theme.wallDiffuse,
    emissive: theme.wallEmissive,
  });
}

function markEnvironmentMesh(mesh: AbstractMesh) {
  mesh.checkCollisions = true;
  mesh.isPickable = true;
}

async function hasRealSceneAsset() {
  try {
    const response = await fetch(SCENE_PATH, { cache: 'no-store' });
    if (!response.ok) {
      return false;
    }

    const body = await response.text();
    return !body.includes('git-lfs.github.com/spec/v1');
  } catch {
    return false;
  }
}

function createFallbackArena(scene: Scene): EnvironmentLoadResult {
  ensureDefaultLighting(scene);

  const ground = MeshBuilder.CreateGround(
    'arena-ground',
    { width: 22, height: 22, subdivisions: 2 },
    scene
  );
  ground.position.y = 0;
  ground.receiveShadows = true;
  markEnvironmentMesh(ground);

  const groundMaterial = new StandardMaterial('arena-ground-material', scene);
  groundMaterial.diffuseColor = new Color3(0.13, 0.22, 0.24);
  groundMaterial.emissiveColor = new Color3(0.02, 0.08, 0.09);
  ground.material = groundMaterial;

  const wallMaterial = new StandardMaterial('arena-wall-material', scene);
  wallMaterial.diffuseColor = new Color3(0.24, 0.19, 0.26);
  wallMaterial.emissiveColor = new Color3(0.03, 0.03, 0.06);

  const wallSpecs = [
    { name: 'north-wall', position: new Vector3(0, 1.5, 11), width: 22, depth: 0.5 },
    { name: 'south-wall', position: new Vector3(0, 1.5, -11), width: 22, depth: 0.5 },
    { name: 'east-wall', position: new Vector3(11, 1.5, 0), width: 0.5, depth: 22 },
    { name: 'west-wall', position: new Vector3(-11, 1.5, 0), width: 0.5, depth: 22 },
  ];

  for (const wall of wallSpecs) {
    const mesh = MeshBuilder.CreateBox(
      wall.name,
      { width: wall.width, height: 3, depth: wall.depth },
      scene
    );
    mesh.position.copyFrom(wall.position);
    mesh.material = wallMaterial;
    markEnvironmentMesh(mesh);
  }

  const platform = MeshBuilder.CreateBox(
    'center-platform',
    { width: 4, height: 0.5, depth: 4 },
    scene
  );
  platform.position = new Vector3(0, 0.5, 0);
  platform.material = wallMaterial;
  markEnvironmentMesh(platform);

  const platformGlowMaterial = new StandardMaterial('arena-platform-glow-material', scene);
  platformGlowMaterial.diffuseColor = new Color3(0.8, 0.35, 0.12);
  platformGlowMaterial.emissiveColor = new Color3(0.25, 0.08, 0.03);
  const startPad = MeshBuilder.CreateCylinder(
    'arena-start-pad',
    { diameter: 2.8, height: 0.12, tessellation: 32 },
    scene
  );
  startPad.position = new Vector3(0, 0.76, 0);
  startPad.material = platformGlowMaterial;
  startPad.isPickable = false;

  const guideMaterial = new StandardMaterial('arena-guide-material', scene);
  guideMaterial.diffuseColor = new Color3(0.96, 0.73, 0.42);
  guideMaterial.emissiveColor = new Color3(0.3, 0.16, 0.05);
  const guideSpecs = [
    new Vector3(0, 0.06, 8),
    new Vector3(4.2, 0.06, 5.8),
    new Vector3(-4.2, 0.06, 5.8),
  ];
  for (const [index, position] of guideSpecs.entries()) {
    const marker = MeshBuilder.CreateCylinder(
      `arena-guide-${index}`,
      { diameter: 1.2, height: 0.08, tessellation: 32 },
      scene
    );
    marker.position.copyFrom(position);
    marker.material = guideMaterial;
    marker.isPickable = false;
  }

  return {
    scene,
    mode: 'fallback-arena',
  };
}

export async function loadPlayableEnvironment(scene: Scene): Promise<EnvironmentLoadResult> {
  scene.collisionsEnabled = true;

  if (await hasRealSceneAsset()) {
    try {
      await loadScene('/scene/', 'example.babylon', scene, scriptsMap);

      ensureDefaultLighting(scene);
      for (const mesh of scene.meshes) {
        markEnvironmentMesh(mesh);
      }

      return {
        scene,
        mode: 'scene-loader',
      };
    } catch (error) {
      console.warn('Scene-Loader fehlgeschlagen, Fallback-Arena wird verwendet.', error);
    }
  }

  return createFallbackArena(scene);
}
