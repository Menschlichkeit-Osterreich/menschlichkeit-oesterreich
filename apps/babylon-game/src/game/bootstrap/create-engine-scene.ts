import { Color3, Color4, Engine, Scene } from '@babylonjs/core';

export function createEngineScene(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.08, 0.12, 0.18, 1);
  scene.ambientColor = new Color3(0.45, 0.5, 0.6);
  scene.collisionsEnabled = true;
  scene.imageProcessingConfiguration.contrast = 1.1;
  scene.imageProcessingConfiguration.exposure = 1.15;

  canvas.tabIndex = 1;
  canvas.focus();

  return {
    engine,
    scene,
  };
}
