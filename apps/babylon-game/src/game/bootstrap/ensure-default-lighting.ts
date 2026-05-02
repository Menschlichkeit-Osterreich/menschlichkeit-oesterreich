import { Color3, DirectionalLight, HemisphericLight, Scene, Vector3 } from '@babylonjs/core';

export function ensureDefaultLighting(scene: Scene) {
  if (scene.lights.length > 0) {
    return;
  }

  const hemiLight = new HemisphericLight('arena-light', new Vector3(0.3, 1, 0.2), scene);
  hemiLight.intensity = 1.45;
  hemiLight.groundColor = new Color3(0.2, 0.22, 0.26);
  const sunLight = new DirectionalLight('arena-sun', new Vector3(-0.35, -1, 0.25), scene);
  sunLight.intensity = 1.2;
}
