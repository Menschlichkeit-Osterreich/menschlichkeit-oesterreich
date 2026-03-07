/**
 * BRÜCKEN BAUEN 3D – Hauptdatei
 * Initialisierung und Spielfluss-Steuerung
 */
'use strict';

// ── Initialisierung ────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  const loadingBar = document.getElementById('loading-bar');
  const loadingPercent = document.getElementById('loading-percent');

  function setProgress(pct) {
    if (loadingBar) loadingBar.style.width = pct + '%';
    if (loadingPercent) loadingPercent.textContent = pct + '%';
  }

  // Loading-Logo animieren
  const logoCanvas = document.getElementById('logo-canvas');
  if (logoCanvas) _animateLoadingLogo(logoCanvas);

  setProgress(10);

  // Spielstand laden
  const hasSave = SaveSystem.load();
  setProgress(30);

  // 3D-Engine initialisieren (unsichtbarer Canvas im Hintergrund)
  const bgCanvas = document.getElementById('menu-bg-canvas');
  if (bgCanvas && typeof THREE !== 'undefined') {
    try {
      Engine3D.init(bgCanvas);
      setProgress(60);
    } catch (e) {
      console.warn('3D-Engine konnte nicht initialisiert werden:', e);
    }
  }

  // Event-Listener registrieren
  _registerEventListeners();
  setProgress(80);

  // Kurze Pause für Animation
  await _sleep(600);
  setProgress(100);
  await _sleep(400);

  // Zum Hauptmenü wechseln
  _showScreen('main-menu');
  GAME_STATE.phase = 'menu';

  // Menü-Hintergrund initialisieren
  if (typeof SceneMenu !== 'undefined') SceneMenu.init();

  // Buttons aktualisieren
  const btnContinue = document.getElementById('btn-continue');
  if (btnContinue) btnContinue.style.display = hasSave ? 'flex' : 'none';
});

// ── Screen-Management ──────────────────────────────────────
function _showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('hidden');
    el.classList.add('animate-fadeInUp');
    setTimeout(() => el.classList.remove('animate-fadeInUp'), 500);
  }
}

// ── Event-Listener ─────────────────────────────────────────
function _registerEventListeners() {
  // Hauptmenü
  _on('btn-new-game', 'click', () => {
    SaveSystem.reset();
    _showScreen('role-selection');
    GAME_STATE.phase = 'role-select';
    if (typeof UIScreens !== 'undefined') UIScreens.renderRoleSelection();
  });

  _on('btn-continue', 'click', () => {
    _showScreen('world-map');
    GAME_STATE.phase = 'world-map';
    if (typeof SceneWorldmap !== 'undefined') SceneWorldmap.init();
  });

  _on('btn-settings', 'click', () => {
    // TODO: Settings-Screen
    console.log('Settings');
  });

  _on('btn-achievements', 'click', () => {
    if (typeof UIScreens !== 'undefined') UIScreens.showAchievements();
  });

  // Pause
  _on('btn-pause', 'click', () => {
    if (GAME_STATE.phase === 'playing') {
      GAME_STATE.phase = 'paused';
      _showScreen('pause-menu');
    }
  });

  _on('btn-resume', 'click', () => {
    _showScreen('game-hud');
    GAME_STATE.phase = 'playing';
    if (typeof SceneGame !== 'undefined') SceneGame.resume();
  });

  _on('btn-restart', 'click', () => {
    if (typeof SceneGame !== 'undefined') SceneGame.restart();
    _showScreen('game-hud');
    GAME_STATE.phase = 'playing';
  });

  _on('btn-quit-to-map', 'click', () => {
    _showScreen('world-map');
    GAME_STATE.phase = 'world-map';
  });

  // Ergebnis
  _on('btn-next-level', 'click', () => {
    const nextId = GAME_STATE.currentLevel + 1;
    if (nextId <= CONFIG.TOTAL_LEVELS) {
      _startLevel(nextId);
    } else {
      _showScreen('world-map');
    }
  });

  _on('btn-retry', 'click', () => {
    _startLevel(GAME_STATE.currentLevel);
  });

  _on('btn-back-to-map', 'click', () => {
    _showScreen('world-map');
    GAME_STATE.phase = 'world-map';
  });

  // Tastatur
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (GAME_STATE.phase === 'playing') {
        GAME_STATE.phase = 'paused';
        _showScreen('pause-menu');
      } else if (GAME_STATE.phase === 'paused') {
        GAME_STATE.phase = 'playing';
        _showScreen('game-hud');
      }
    }
  });

  // EventBus
  EventBus.on('achievementUnlocked', ach => {
    if (typeof UIHud !== 'undefined') UIHud.showAchievementToast(ach);
    AchievementSystem.check();
  });

  EventBus.on('levelCompleted', data => {
    if (typeof UIScreens !== 'undefined') UIScreens.showResult(data);
    _showScreen('result-screen');
    GAME_STATE.phase = 'result';
  });

  EventBus.on('levelUp', data => {
    if (typeof UIHud !== 'undefined') UIHud.showLevelUpToast(data.level);
  });
}

// ── Level starten ──────────────────────────────────────────
function _startLevel(levelId) {
  const level = LEVELS_DATA.levels.find(l => l.id === levelId);
  if (!level || !level.unlocked) return;

  GAME_STATE.currentLevel = levelId;
  GAME_STATE.currentWorld = level.worldId;
  GAME_STATE.score = 0;
  GAME_STATE.phase = 'playing';

  _showScreen('game-hud');

  if (typeof SceneGame !== 'undefined') SceneGame.startLevel(level);
  if (typeof UIHud !== 'undefined') UIHud.updateLevel(level);
}

// ── Loading-Logo-Animation ─────────────────────────────────
function _animateLoadingLogo(canvas) {
  if (typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(200, 200);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Ikosaeder als Logo
  const geo = new THREE.IcosahedronGeometry(1.5, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    wireframe: false,
    roughness: 0.3,
    metalness: 0.7,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Wireframe-Overlay
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, wireframe: true, transparent: true, opacity: 0.3 });
  const wire = new THREE.Mesh(geo, wireMat);
  scene.add(wire);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dl = new THREE.DirectionalLight(0x3b82f6, 2);
  dl.position.set(3, 3, 3);
  scene.add(dl);
  const dl2 = new THREE.DirectionalLight(0x8b5cf6, 1);
  dl2.position.set(-3, -1, -3);
  scene.add(dl2);

  let t = 0;
  const animate = () => {
    requestAnimationFrame(animate);
    t += 0.02;
    mesh.rotation.x = t * 0.5;
    mesh.rotation.y = t;
    wire.rotation.x = t * 0.5;
    wire.rotation.y = t;
    renderer.render(scene, camera);
  };
  animate();
}

// ── Hilfsfunktionen ────────────────────────────────────────
function _on(id, event, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, fn);
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Globale Funktion für Weltenkarte
window.startLevel = _startLevel;
