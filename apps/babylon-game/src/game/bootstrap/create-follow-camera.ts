import { FollowCamera, Scene, Vector3, type AbstractMesh } from '@babylonjs/core';

export function createFollowCamera(scene: Scene, target: AbstractMesh) {
  const camera = new FollowCamera('player-camera', new Vector3(-4, 8, -12), scene);
  camera.radius = 10.5;
  camera.heightOffset = 5.2;
  camera.rotationOffset = 205;
  camera.cameraAcceleration = 0.08;
  camera.maxCameraSpeed = 16;
  camera.lowerRadiusLimit = 8;
  camera.upperRadiusLimit = 12.5;
  camera.lockedTarget = target;
  camera.attachControl();
  return camera;
}
