/**
 * BRÜCKEN BAUEN 3D – Weltenkarte
 * Interaktive Karte mit allen 10 Welten
 */
'use strict';

const SceneWorldmap = (() => {

  function init() {
    _renderWorldGrid();
    _updateProgress();
  }

  function _renderWorldGrid() {
    const grid = document.getElementById('worlds-grid');
    if (!grid) return;

    const progress = ProgressionSystem.getProgress();

    grid.innerHTML = LEVELS_DATA.worlds.map(world => {
      const wp = ProgressionSystem.getWorldProgress(world.id);
      const firstLevel = LEVELS_DATA.levels.find(l => l.worldId === world.id);
      const isUnlocked = firstLevel && firstLevel.unlocked;
      const isComplete = wp.completed === wp.total;

      return `
        <div class="world-card ${isUnlocked ? '' : 'locked'} ${isComplete ? 'complete' : ''}"
             style="--world-color:${world.color}"
             onclick="${isUnlocked ? `SceneWorldmap.openWorld(${world.id})` : ''}">
          <div class="world-icon">${world.icon}</div>
          <div class="world-name">${world.name}</div>
          <div class="world-desc">${world.desc}</div>
          <div class="world-progress">
            <div class="progress-bar-wrap">
              <div class="progress-bar" style="width:${(wp.completed/wp.total)*100}%;background:${world.color}"></div>
            </div>
            <span class="progress-text">${wp.completed}/${wp.total}</span>
          </div>
          ${isComplete ? '<div class="world-badge">✓ Abgeschlossen</div>' : ''}
          ${!isUnlocked ? '<div class="world-lock">🔒</div>' : ''}
        </div>
      `;
    }).join('');

    // Gesamtfortschritt
    const totalEl = document.getElementById('total-progress');
    if (totalEl) totalEl.textContent = `${progress.completed}/${progress.total} Level abgeschlossen`;

    const totalBar = document.getElementById('total-progress-bar');
    if (totalBar) totalBar.style.width = progress.percent + '%';
  }

  function openWorld(worldId) {
    const world = LEVELS_DATA.worlds.find(w => w.id === worldId);
    const levels = LEVELS_DATA.levels.filter(l => l.worldId === worldId);

    // Level-Auswahl-Overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:100;
      background:rgba(10,14,26,0.95);backdrop-filter:blur(20px);
      display:flex;align-items:center;justify-content:center;
      padding:1rem;overflow-y:auto;
    `;

    overlay.innerHTML = `
      <div style="max-width:600px;width:100%;display:flex;flex-direction:column;gap:1.5rem">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <h2 style="font-family:var(--font-display);font-size:1.5rem;letter-spacing:0.1em">
              ${world.icon} ${world.name.toUpperCase()}
            </h2>
            <p style="color:var(--clr-muted);font-size:0.85rem">${world.desc}</p>
          </div>
          <button class="btn-ghost btn-sm" onclick="this.closest('div[style]').remove()">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:0.5rem">
          ${levels.map(l => `
            <button
              class="level-btn ${l.completed ? 'completed' : ''} ${l.unlocked ? '' : 'locked'}"
              style="--world-color:${world.color}"
              onclick="${l.unlocked ? `SceneWorldmap.selectLevel(${l.id});this.closest('div[style]').remove()` : ''}"
              title="${l.title}"
            >
              <span class="level-num">${l.id}</span>
              ${l.completed ? `<span class="level-stars">${'⭐'.repeat(l.stars)}</span>` : ''}
              ${!l.unlocked ? '<span class="level-lock">🔒</span>' : ''}
            </button>
          `).join('')}
        </div>
        <div style="display:flex;gap:0.5rem;font-size:0.75rem;color:var(--clr-muted)">
          <span>⭐ = 1 Stern</span>
          <span>⭐⭐ = 2 Sterne</span>
          <span>⭐⭐⭐ = Perfekt</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }

  function selectLevel(levelId) {
    if (typeof window.startLevel === 'function') {
      window.startLevel(levelId);
    }
  }

  function _updateProgress() {
    UIHud.updateXPBar();
    const playerLvlEl = document.getElementById('player-level');
    if (playerLvlEl) playerLvlEl.textContent = `Level ${GAME_STATE.playerLevel}`;
  }

  return { init, openWorld, selectLevel };
})();
