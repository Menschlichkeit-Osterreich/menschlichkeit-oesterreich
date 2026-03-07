/**
 * BRÜCKEN BAUEN 3D – Three.js 3D-Engine
 * Verwaltet Renderer, Szenen, Kamera und Animationsloop
 */
'use strict';

const Engine3D = (() => {
  let renderer, camera, currentScene, animFrameId;
  let clock, delta;
  const scenes = {};
  const mixers = []; // AnimationMixer

  // ── Init ──────────────────────────────────────────────────
  function init(canvas) {
    clock = new THREE.Clock();

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: CONFIG.RENDERER.antialias,
      alpha: CONFIG.RENDERER.alpha,
      powerPreference: CONFIG.RENDERER.powerPreference,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Kamera
    camera = new THREE.PerspectiveCamera(
      CONFIG.CAMERA.fov,
      window.innerWidth / window.innerHeight,
      CONFIG.CAMERA.near,
      CONFIG.CAMERA.far
    );
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    // Resize
    window.addEventListener('resize', onResize);

    // Animationsloop starten
    animate();

    return { renderer, camera };
  }

  // ── Resize ────────────────────────────────────────────────
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ── Animationsloop ────────────────────────────────────────
  function animate() {
    animFrameId = requestAnimationFrame(animate);
    delta = clock.getDelta();

    // AnimationMixer updaten
    mixers.forEach(m => m.update(delta));

    // Aktuelle Szene rendern
    if (currentScene && renderer) {
      renderer.render(currentScene.scene, camera);
      if (currentScene.update) currentScene.update(delta, clock.getElapsedTime());
    }
  }

  // ── Szene wechseln ────────────────────────────────────────
  function switchScene(name) {
    if (currentScene && currentScene.onLeave) currentScene.onLeave();
    currentScene = scenes[name];
    if (currentScene && currentScene.onEnter) currentScene.onEnter();
  }

  function registerScene(name, sceneObj) {
    scenes[name] = sceneObj;
  }

  // ── Hilfsfunktionen ───────────────────────────────────────
  function createBasicScene(bgColor = 0x0a0e1a) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.02);
    return scene;
  }

  function createAmbientLight(scene, intensity = 0.4) {
    const light = new THREE.AmbientLight(0xffffff, intensity);
    scene.add(light);
    return light;
  }

  function createDirectionalLight(scene, x = 5, y = 10, z = 5, intensity = 1.2) {
    const light = new THREE.DirectionalLight(0xffffff, intensity);
    light.position.set(x, y, z);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 100;
    light.shadow.camera.left = -20;
    light.shadow.camera.right = 20;
    light.shadow.camera.top = 20;
    light.shadow.camera.bottom = -20;
    scene.add(light);
    return light;
  }

  function createPointLight(scene, color, intensity, x, y, z) {
    const light = new THREE.PointLight(color, intensity, 30);
    light.position.set(x, y, z);
    light.castShadow = true;
    scene.add(light);
    return light;
  }

  function createGround(scene, color = 0x1a2744, size = 50) {
    const geo = new THREE.PlaneGeometry(size, size, 20, 20);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  // Einfaches Gebäude-Mesh
  function createBuilding(scene, x, z, width, height, depth, color) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  // Baum-Mesh
  function createTree(scene, x, z, scale = 1) {
    const group = new THREE.Group();
    // Stamm
    const trunkGeo = new THREE.CylinderGeometry(0.1 * scale, 0.15 * scale, 0.8 * scale, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.4 * scale;
    trunk.castShadow = true;
    group.add(trunk);
    // Krone
    const crownGeo = new THREE.ConeGeometry(0.5 * scale, 1.2 * scale, 8);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = (0.8 + 0.6) * scale;
    crown.castShadow = true;
    group.add(crown);
    group.position.set(x, 0, z);
    scene.add(group);
    return group;
  }

  // Glühende Kugel (für Partikeleffekte)
  function createGlowSphere(scene, color, radius, x, y, z) {
    const geo = new THREE.SphereGeometry(radius, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  // Kamera-Animation (smooth lerp)
  function animateCamera(targetPos, targetLookAt, duration = 1.5) {
    const startPos = camera.position.clone();
    const startTime = clock.getElapsedTime();
    const endTime = startTime + duration;

    const tick = () => {
      const t = Utils.clamp((clock.getElapsedTime() - startTime) / duration, 0, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut

      camera.position.lerpVectors(startPos, targetPos, ease);
      camera.lookAt(targetLookAt);

      if (t < 1) requestAnimationFrame(tick);
    };
    tick();
  }

  // Objekt pulsieren lassen
  function pulseObject(obj, minScale = 0.95, maxScale = 1.05, speed = 2) {
    const baseScale = obj.scale.x;
    const tick = () => {
      const s = baseScale * (1 + Math.sin(clock.getElapsedTime() * speed) * (maxScale - 1));
      obj.scale.setScalar(s);
      requestAnimationFrame(tick);
    };
    tick();
  }

  // Objekt rotieren
  function rotateObject(obj, axis = 'y', speed = 0.5) {
    const tick = () => {
      obj.rotation[axis] += speed * 0.016;
      requestAnimationFrame(tick);
    };
    tick();
  }

  return {
    init, switchScene, registerScene,
    createBasicScene, createAmbientLight, createDirectionalLight,
    createPointLight, createGround, createBuilding, createTree,
    createGlowSphere, animateCamera, pulseObject, rotateObject,
    addMixer: m => mixers.push(m),
    getCamera: () => camera,
    getRenderer: () => renderer,
    getClock: () => clock,
  };
})();
