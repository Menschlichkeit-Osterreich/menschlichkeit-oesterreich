/**
 * BRÜCKEN BAUEN 3D – Partikeleffekte
 * Konfetti, Explosionen, Sterne, Ambient-Partikel
 */
'use strict';

const ParticleEngine = (() => {
  const systems = [];

  // ── Ambient-Partikel (schwebende Punkte im Hintergrund) ──
  function createAmbientParticles(scene, count = 200, color = 0x3b82f6, spread = 20) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = Math.random() * spread * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      velocities[i * 3]     = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = Math.random() * 0.02 + 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const system = {
      points, positions, velocities, count, spread,
      update(delta) {
        for (let i = 0; i < count; i++) {
          positions[i * 3]     += velocities[i * 3];
          positions[i * 3 + 1] += velocities[i * 3 + 1];
          positions[i * 3 + 2] += velocities[i * 3 + 2];
          // Reset wenn zu hoch
          if (positions[i * 3 + 1] > spread * 0.5) {
            positions[i * 3 + 1] = 0;
          }
        }
        geo.attributes.position.needsUpdate = true;
      },
    };

    systems.push(system);
    return system;
  }

  // ── Konfetti-Explosion ────────────────────────────────────
  function createConfetti(scene, x, y, z, count = 80) {
    const colors = [0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xef4444, 0xec4899];
    const particles = [];

    for (let i = 0; i < count; i++) {
      const geo = new THREE.BoxGeometry(0.08, 0.08, 0.01);
      const mat = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        Math.random() * 0.4 + 0.1,
        (Math.random() - 0.5) * 0.3
      );
      const rot = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );

      scene.add(mesh);
      particles.push({ mesh, vel, rot, life: 1.0 });
    }

    const system = {
      particles,
      update(delta) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= delta * 0.5;
          p.vel.y -= 0.01; // Schwerkraft
          p.mesh.position.add(p.vel);
          p.mesh.rotation.x += p.rot.x;
          p.mesh.rotation.y += p.rot.y;
          p.mesh.rotation.z += p.rot.z;
          p.mesh.material.opacity = Math.max(0, p.life);

          if (p.life <= 0) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
          }
        }
      },
      done: () => particles.length === 0,
    };

    systems.push(system);
    return system;
  }

  // ── Stern-Burst (Achievement) ─────────────────────────────
  function createStarBurst(scene, x, y, z, color = 0xf59e0b) {
    const count = 12;
    const particles = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const geo = new THREE.SphereGeometry(0.06, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);

      const speed = 0.15 + Math.random() * 0.1;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed * 0.5 + 0.1,
        (Math.random() - 0.5) * 0.1
      );

      scene.add(mesh);
      particles.push({ mesh, vel, life: 1.0 });
    }

    const system = {
      particles,
      update(delta) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= delta * 1.2;
          p.vel.y -= 0.008;
          p.mesh.position.add(p.vel);
          p.mesh.material.opacity = Math.max(0, p.life);
          p.mesh.scale.setScalar(p.life);
          if (p.life <= 0) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
          }
        }
      },
      done: () => particles.length === 0,
    };

    systems.push(system);
    return system;
  }

  // ── Ring-Welle (Entscheidungs-Feedback) ──────────────────
  function createRipple(scene, x, y, z, color = 0x3b82f6) {
    const geo = new THREE.RingGeometry(0.1, 0.15, 32);
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.8, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + 0.01, z);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    let life = 1.0;
    const system = {
      update(delta) {
        life -= delta * 1.5;
        const scale = 1 + (1 - life) * 5;
        mesh.scale.setScalar(scale);
        mat.opacity = Math.max(0, life * 0.8);
        if (life <= 0) scene.remove(mesh);
      },
      done: () => life <= 0,
    };

    systems.push(system);
    return system;
  }

  // ── Update alle Systeme ───────────────────────────────────
  function updateAll(delta) {
    for (let i = systems.length - 1; i >= 0; i--) {
      systems[i].update(delta);
      if (systems[i].done && systems[i].done()) {
        systems.splice(i, 1);
      }
    }
  }

  return {
    createAmbientParticles,
    createConfetti,
    createStarBurst,
    createRipple,
    updateAll,
  };
})();
