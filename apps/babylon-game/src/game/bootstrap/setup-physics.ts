import { HavokPlugin, Scene, Vector3 } from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';

const PHYSICS_TIMEOUT_MS = 3000;

export async function setupPhysics(scene: Scene): Promise<boolean> {
  if (scene.isPhysicsEnabled()) {
    return true;
  }

  try {
    const havok = await Promise.race([
      HavokPhysics(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Havok-Initialisierung hat das Zeitlimit überschritten.')), PHYSICS_TIMEOUT_MS);
      }),
    ]);

    scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, havok));
    return true;
  } catch (error) {
    console.warn('Havok konnte nicht rechtzeitig geladen werden. Das Spiel läuft im vereinfachten Fallback-Modus weiter.', error);
    return false;
  }
}
