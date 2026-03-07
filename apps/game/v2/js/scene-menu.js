/**
 * BRÜCKEN BAUEN 3D – Menü-Hintergrundszene
 * Animierte 3D-Partikel und schwebende Geometrien
 */
'use strict';

const SceneMenu = (() => {
  let scene, renderer, camera, clock;
  let particles, geometries = [];
  let animId;

  function init() {
    const canvas = document.getElementById('menu-bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);

    scene = new THREE.Scene();

    // Partikel-Feld
    _createParticleField();

    // Schwebende Geometrien
    _createFloatingGeometries();

    // Licht
    scene.add(new THREE.AmbientLight(0x3b82f6, 0.5));
    const dl = new THREE.DirectionalLight(0x8b5cf6, 1);
    dl.position.set(5, 5, 5);
    scene.add(dl);

    window.addEventListener('resize', _onResize);
    _animate();
  }

  function _createParticleField() {
    const count = 500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 60;
      pos[i*3+1] = (Math.random() - 0.5) * 40;
      pos[i*3+2] = (Math.random() - 0.5) * 30;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.08, transparent: true, opacity: 0.6 });
    particles = new THREE.Points(geo, mat);
    scene.add(particles);
  }

  function _createFloatingGeometries() {
    const shapes = [
      new THREE.IcosahedronGeometry(1.2, 0),
      new THREE.OctahedronGeometry(1.0, 0),
      new THREE.TetrahedronGeometry(0.9, 0),
      new THREE.DodecahedronGeometry(0.8, 0),
    ];
    const colors = [0x3b82f6, 0x8b5cf6, 0x10b981, 0xf59e0b];

    for (let i = 0; i < 8; i++) {
      const geo = shapes[i % shapes.length];
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        wireframe: i % 2 === 0,
        transparent: true,
        opacity: 0.4,
        roughness: 0.3,
        metalness: 0.7,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10 - 5
      );
      mesh.userData = {
        rotSpeed: { x: (Math.random()-0.5)*0.01, y: (Math.random()-0.5)*0.01, z: (Math.random()-0.5)*0.01 },
        floatSpeed: Math.random() * 0.5 + 0.3,
        floatAmp: Math.random() * 0.5 + 0.3,
        originY: mesh.position.y,
      };
      scene.add(mesh);
      geometries.push(mesh);
    }
  }

  function _animate() {
    animId = requestAnimationFrame(_animate);
    const t = clock.getElapsedTime();

    // Partikel rotieren
    if (particles) {
      particles.rotation.y = t * 0.02;
      particles.rotation.x = t * 0.01;
    }

    // Geometrien animieren
    geometries.forEach(g => {
      g.rotation.x += g.userData.rotSpeed.x;
      g.rotation.y += g.userData.rotSpeed.y;
      g.rotation.z += g.userData.rotSpeed.z;
      g.position.y = g.userData.originY + Math.sin(t * g.userData.floatSpeed) * g.userData.floatAmp;
    });

    renderer.render(scene, camera);
  }

  function _onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function destroy() {
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener('resize', _onResize);
  }

  return { init, destroy };
})();
