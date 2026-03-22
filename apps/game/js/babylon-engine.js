/* global BABYLON */

function color3FromHex(hex) {
  return BABYLON.Color3.FromHexString(hex);
}

function color4FromHex(hex, alpha = 1) {
  const rgb = BABYLON.Color3.FromHexString(hex);
  return new BABYLON.Color4(rgb.r, rgb.g, rgb.b, alpha);
}

export function createBabylonStage(canvas, settings) {
  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: true,
    antialias: true,
    adaptToDeviceRatio: true,
  });

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = color4FromHex('#070b16', 1);

  const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, 1.12, 22, BABYLON.Vector3.Zero(), scene);
  camera.lowerRadiusLimit = 12;
  camera.upperRadiusLimit = 28;
  camera.wheelPrecision = 36;
  camera.panningSensibility = 0;

  const ambient = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), scene);
  ambient.intensity = 0.95;

  const keyLight = new BABYLON.DirectionalLight('key', new BABYLON.Vector3(-0.5, -1, -0.3), scene);
  keyLight.position = new BABYLON.Vector3(8, 14, 10);
  keyLight.intensity = 1.2;

  const rimLight = new BABYLON.PointLight('rim', new BABYLON.Vector3(-8, 6, -6), scene);
  rimLight.intensity = 0.8;

  const glow = new BABYLON.GlowLayer('glow', scene, {
    mainTextureFixedSize: settings.lowGraphics ? 256 : 1024,
    blurKernelSize: settings.lowGraphics ? 24 : 64,
  });
  glow.intensity = 0.45;

  const dynamicMeshes = [];
  const animationCallbacks = [];

  function registerMesh(mesh) {
    dynamicMeshes.push(mesh);
    return mesh;
  }

  function registerAnimation(fn) {
    animationCallbacks.push(fn);
  }

  function clearScene() {
    while (dynamicMeshes.length) {
      dynamicMeshes.pop()?.dispose();
    }
    animationCallbacks.length = 0;
  }

  function createGround(color) {
    const ground = registerMesh(BABYLON.MeshBuilder.CreateGround('ground', {
      width: 32,
      height: 32,
      subdivisions: settings.lowGraphics ? 2 : 12,
    }, scene));
    const material = new BABYLON.StandardMaterial('ground-mat', scene);
    material.diffuseColor = color3FromHex(color);
    material.specularColor = BABYLON.Color3.Black();
    material.alpha = 0.92;
    ground.material = material;
    ground.position.y = -4;
  }

  function createBridge(color) {
    const bridgePoints = [
      new BABYLON.Vector3(-7, -0.8, 0),
      new BABYLON.Vector3(-3, 0.6, 0),
      new BABYLON.Vector3(0, 1.2, 0),
      new BABYLON.Vector3(3, 0.6, 0),
      new BABYLON.Vector3(7, -0.8, 0),
    ];

    const tube = registerMesh(BABYLON.MeshBuilder.CreateTube('bridge', {
      path: bridgePoints,
      radius: 0.34,
      tessellation: settings.lowGraphics ? 12 : 24,
    }, scene));
    const tubeMaterial = new BABYLON.StandardMaterial('bridge-mat', scene);
    tubeMaterial.diffuseColor = color3FromHex(color);
    tubeMaterial.emissiveColor = color3FromHex(color).scale(0.24);
    tube.material = tubeMaterial;

    [-7, 7].forEach((x) => {
      const pillar = registerMesh(BABYLON.MeshBuilder.CreateBox(`pillar-${x}`, {
        width: 0.9,
        depth: 0.9,
        height: 5.2,
      }, scene));
      pillar.position = new BABYLON.Vector3(x, -2.25, 0);
      const pillarMat = new BABYLON.StandardMaterial(`pillar-mat-${x}`, scene);
      pillarMat.diffuseColor = color3FromHex('#cbd5e1');
      pillar.material = pillarMat;
    });

    registerAnimation((time) => {
      tube.rotation.z = Math.sin(time * 0.35) * 0.02;
      tube.position.y = Math.sin(time * 0.75) * 0.08;
    });
  }

  function createFloatingOrb(name, color, position, diameter, speed) {
    const mesh = registerMesh(BABYLON.MeshBuilder.CreateSphere(name, {
      diameter,
      segments: settings.lowGraphics ? 8 : 24,
    }, scene));
    mesh.position = position.clone();
    const material = new BABYLON.StandardMaterial(`${name}-mat`, scene);
    material.diffuseColor = color3FromHex(color);
    material.emissiveColor = color3FromHex(color).scale(0.55);
    mesh.material = material;

    registerAnimation((time) => {
      mesh.position.y = position.y + Math.sin(time * speed + position.x) * 0.45;
      mesh.rotation.y += 0.01;
    });
  }

  function createTrackPillars(trackState = {}, trackDelta = {}) {
    const trackKeys = ['trust', 'participation', 'ruleOfLaw', 'socialTension', 'futureLoad'];

    trackKeys.forEach((key, index) => {
      const rawValue = trackState[key] ?? 50;
      const height = 1.8 + (rawValue / 100) * 4.8;
      const angle = (-Math.PI / 2) + (index * ((Math.PI * 2) / trackKeys.length));
      const x = Math.cos(angle) * 6.4;
      const z = Math.sin(angle) * 4.8;
      const delta = trackDelta[key] ?? 0;
      const pillarColor =
        key === 'socialTension' || key === 'futureLoad'
          ? delta > 0
            ? '#ef4444'
            : '#38bdf8'
          : delta < 0
            ? '#ef4444'
            : '#38bdf8';

      const pillar = registerMesh(BABYLON.MeshBuilder.CreateCylinder(`track-${key}`, {
        height,
        diameterTop: 0.7,
        diameterBottom: 0.95,
        tessellation: settings.lowGraphics ? 10 : 20,
      }, scene));
      pillar.position = new BABYLON.Vector3(x, -4 + height / 2, z);
      const pillarMat = new BABYLON.StandardMaterial(`track-mat-${key}`, scene);
      pillarMat.diffuseColor = color3FromHex(pillarColor);
      pillarMat.emissiveColor = color3FromHex(pillarColor).scale(0.18);
      pillar.material = pillarMat;

      const cap = registerMesh(BABYLON.MeshBuilder.CreateSphere(`track-cap-${key}`, {
        diameter: 0.68,
        segments: settings.lowGraphics ? 8 : 18,
      }, scene));
      cap.position = new BABYLON.Vector3(x, -4 + height, z);
      const capMat = new BABYLON.StandardMaterial(`track-cap-mat-${key}`, scene);
      capMat.diffuseColor = color3FromHex('#f8fafc');
      capMat.emissiveColor = color3FromHex(pillarColor).scale(0.45);
      cap.material = capMat;

      registerAnimation((time) => {
        cap.position.y = -4 + height + Math.sin(time * 0.8 + index) * 0.16;
      });
    });
  }

  function createWorldTotems(worlds) {
    const radius = 8.8;
    worlds.forEach((world, index) => {
      const angle = (Math.PI * 2 * index) / worlds.length;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const base = registerMesh(BABYLON.MeshBuilder.CreateCylinder(`world-base-${world.id}`, {
        height: 0.5,
        diameterTop: 1.7,
        diameterBottom: 2.2,
        tessellation: settings.lowGraphics ? 10 : 24,
      }, scene));
      base.position = new BABYLON.Vector3(x, -2.9, z);
      const baseMat = new BABYLON.StandardMaterial(`world-base-mat-${world.id}`, scene);
      baseMat.diffuseColor = color3FromHex(world.color);
      baseMat.emissiveColor = color3FromHex(world.color).scale(0.28);
      base.material = baseMat;

      const marker = registerMesh(BABYLON.MeshBuilder.CreateSphere(`world-marker-${world.id}`, {
        diameter: 1.25,
        segments: settings.lowGraphics ? 8 : 20,
      }, scene));
      marker.position = new BABYLON.Vector3(x, -1.4, z);
      const markerMat = new BABYLON.StandardMaterial(`world-marker-mat-${world.id}`, scene);
      markerMat.diffuseColor = color3FromHex(world.accent);
      markerMat.emissiveColor = color3FromHex(world.accent).scale(0.75);
      marker.material = markerMat;

      registerAnimation((time) => {
        marker.position.y = -1.4 + Math.sin(time * 0.8 + index) * 0.35;
        marker.rotation.y += 0.015;
      });
    });
  }

  function createLevelPortal(color, progressRatio) {
    createBridge(color);

    const portal = registerMesh(BABYLON.MeshBuilder.CreateTorus('portal', {
      thickness: 0.34,
      diameter: 4.2,
      tessellation: settings.lowGraphics ? 20 : 48,
    }, scene));
    portal.position = new BABYLON.Vector3(0, 1.6, -2.2);
    const portalMaterial = new BABYLON.StandardMaterial('portal-mat', scene);
    portalMaterial.diffuseColor = color3FromHex(color);
    portalMaterial.emissiveColor = color3FromHex(color).scale(0.8);
    portal.material = portalMaterial;

    const progressSegments = Math.max(4, Math.round(progressRatio * 12));
    for (let index = 0; index < progressSegments; index += 1) {
      const segment = registerMesh(BABYLON.MeshBuilder.CreateBox(`progress-${index}`, {
        width: 0.75,
        height: 0.22,
        depth: 0.4,
      }, scene));
      segment.position = new BABYLON.Vector3(-4.8 + index * 0.82, -0.15 + Math.sin(index * 0.55) * 0.25, 0);
      const segmentMat = new BABYLON.StandardMaterial(`progress-mat-${index}`, scene);
      segmentMat.diffuseColor = color3FromHex(color);
      segmentMat.emissiveColor = color3FromHex(color).scale(0.18 + index / 32);
      segment.material = segmentMat;
    }

    registerAnimation((time) => {
      portal.rotation.z += 0.01;
      portal.rotation.x = Math.sin(time * 0.5) * 0.2;
    });
  }

  function createCelebration(color) {
    createBridge(color);

    for (let index = 0; index < 24; index += 1) {
      const angle = (Math.PI * 2 * index) / 24;
      const radius = 2.5 + (index % 4) * 0.8;
      createFloatingOrb(
        `celebration-orb-${index}`,
        index % 2 === 0 ? color : '#f8fafc',
        new BABYLON.Vector3(Math.cos(angle) * radius, 1.5 + (index % 3) * 0.25, Math.sin(angle) * radius),
        0.28,
        1.4 + index * 0.04,
      );
    }
  }

  function setMode(mode, payload = {}) {
    clearScene();

    const color = payload.color ?? '#ef4444';
    scene.clearColor = color4FromHex(payload.background ?? '#070b16', 1);
    rimLight.diffuse = color3FromHex(payload.accent ?? '#f97316');
    createGround(payload.ground ?? '#111827');

    if (mode === 'world') {
      camera.setTarget(BABYLON.Vector3.Zero());
      camera.radius = 24;
      createWorldTotems(payload.worlds ?? []);
      createTrackPillars(payload.trackState ?? {});
      createFloatingOrb('world-center', color, new BABYLON.Vector3(0, 2.5, 0), 1.2, 0.9);
      return;
    }

    if (mode === 'level') {
      camera.setTarget(new BABYLON.Vector3(0, 0.4, 0));
      camera.radius = 18;
      createLevelPortal(color, payload.progressRatio ?? 0.2);
      createTrackPillars(payload.trackState ?? {});
      createFloatingOrb('level-helper-left', payload.accent ?? '#f8fafc', new BABYLON.Vector3(-6, 2.2, 2), 0.35, 1.1);
      createFloatingOrb('level-helper-right', payload.accent ?? '#f8fafc', new BABYLON.Vector3(6, 2.4, -2), 0.35, 1.35);
      return;
    }

    if (mode === 'result') {
      camera.setTarget(BABYLON.Vector3.Zero());
      camera.radius = 19;
      createCelebration(color);
      createTrackPillars(payload.trackState ?? {}, payload.trackDelta ?? {});
      return;
    }

    if (mode === 'teacher') {
      camera.setTarget(BABYLON.Vector3.Zero());
      camera.radius = 20;
      createBridge(color);
      createTrackPillars(payload.trackState ?? {}, payload.trackDelta ?? {});
      return;
    }

    camera.setTarget(BABYLON.Vector3.Zero());
    camera.radius = 20;
    createBridge(color);
    createFloatingOrb('menu-orb-left', payload.accent ?? '#f8fafc', new BABYLON.Vector3(-6, 2.5, 4), 0.52, 1.1);
    createFloatingOrb('menu-orb-right', payload.accent ?? '#f8fafc', new BABYLON.Vector3(6, 2.1, -4), 0.64, 0.8);
    createFloatingOrb('menu-orb-top', '#fde68a', new BABYLON.Vector3(0, 4.2, 0), 0.4, 1.4);
  }

  scene.onBeforeRenderObservable.add(() => {
    const time = performance.now() * 0.001;
    const speedMultiplier = settings.reducedMotion ? 0.35 : 1;
    animationCallbacks.forEach((callback) => callback(time * speedMultiplier));
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  const resizeHandler = () => engine.resize();
  window.addEventListener('resize', resizeHandler);

  return {
    setMode,
    resize: () => engine.resize(),
    dispose: () => {
      clearScene();
      window.removeEventListener('resize', resizeHandler);
      glow.dispose();
      scene.dispose();
      engine.dispose();
    },
  };
}
