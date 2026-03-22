/**
 * BRÜCKEN BAUEN 3D – UI-Screens
 * Rollenauswahl, Achievements, Ergebnis-Screen
 */
'use strict';

const UIScreens = (() => {

  // ── Rollenauswahl ──────────────────────────────────────────
  function renderRoleSelection() {
    const grid = document.getElementById('roles-grid');
    if (!grid) return;

    grid.innerHTML = ROLES_DATA.map(role => `
      <div class="role-card" data-role="${role.id}"
           style="--role-color: ${role.color}"
           onclick="UIScreens.selectRole('${role.id}')">
        <span class="role-icon">${role.icon}</span>
        <div class="role-name">${role.name}</div>
        <div class="role-desc">${role.shortDesc}</div>
        <p style="font-size:0.8rem;color:var(--clr-muted);margin-top:0.5rem;line-height:1.5">${role.description}</p>
        <div class="role-stats">
          ${_renderStatBars(role.stats)}
        </div>
        <div class="role-stats" style="margin-top:0.5rem">
          ${role.bonuses.map(b => `<span class="stat-badge" style="color:${role.color}">${b.label}</span>`).join('')}
        </div>
        ${role.unlockLevel > 1 ? `<div style="margin-top:0.5rem;font-size:0.72rem;color:var(--clr-muted)">🔒 Ab Level ${role.unlockLevel}</div>` : ''}
      </div>
    `).join('');
  }

  function _renderStatBars(stats) {
    const labels = { empathie: '💙 Empathie', einfluss: '⚡ Einfluss', ressourcen: '💰 Ressourcen', wissen: '🧠 Wissen', netzwerk: '🌐 Netzwerk' };
    return Object.entries(stats).map(([key, val]) => `
      <div style="width:100%;margin-top:0.3rem">
        <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--clr-muted);margin-bottom:2px">
          <span>${labels[key] || key}</span><span>${val}</span>
        </div>
        <div class="progress-bar-wrap" style="height:4px">
          <div class="progress-bar blue" style="width:${val}%"></div>
        </div>
      </div>
    `).join('');
  }

  function selectRole(roleId) {
    // Karte markieren
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`[data-role="${roleId}"]`);
    if (card) card.classList.add('selected');

    GAME_STATE.selectedRole = roleId;

    // Confirm-Button anzeigen
    const btn = document.getElementById('btn-confirm-role');
    if (btn) {
      btn.style.display = 'flex';
      btn.onclick = () => {
        document.getElementById('role-select-screen').classList.add('hidden');
        document.getElementById('world-map').classList.remove('hidden');
        GAME_STATE.phase = 'world-map';
        if (typeof SceneWorldmap !== 'undefined') SceneWorldmap.init();
      };
    }
  }

  // ── Ergebnis-Screen ────────────────────────────────────────
  function showResult({ levelId, score, stars, xpGained }) {
    const level = LEVELS_DATA.levels.find(l => l.id === levelId);
    if (!level) return;

    const success = score >= CONFIG.SCORE_OK;

    // Badge
    const badge = document.getElementById('result-badge');
    if (badge) badge.textContent = stars === 3 ? '🏆' : stars === 2 ? '🥈' : success ? '🥉' : '😔';

    // Titel
    const title = document.getElementById('result-title');
    if (title) {
      title.textContent = stars === 3 ? 'Ausgezeichnet!' : stars === 2 ? 'Sehr gut!' : success ? 'Bestanden!' : 'Nicht bestanden';
      title.className = 'result-title ' + (success ? 'success' : 'fail');
    }

    // Sterne
    const starsEl = document.getElementById('result-stars');
    if (starsEl) {
      starsEl.innerHTML = [1,2,3].map(i =>
        `<span style="font-size:2rem;filter:${i <= stars ? 'none' : 'grayscale(1) opacity(0.3)'}"
               class="${i <= stars ? 'animate-fadeInUp' : ''}"
               style="animation-delay:${(i-1)*0.15}s">⭐</span>`
      ).join('');
    }

    // Score-Karten
    const scores = document.getElementById('result-scores');
    if (scores) {
      scores.innerHTML = `
        <div class="score-item">
          <span class="score-icon">📊</span>
          <span class="score-label">Score</span>
          <span class="score-value" style="color:${score >= 90 ? 'var(--clr-success)' : score >= 70 ? 'var(--clr-accent)' : 'var(--clr-text)'}">${score}%</span>
        </div>
        <div class="score-item">
          <span class="score-icon">⭐</span>
          <span class="score-label">Sterne</span>
          <span class="score-value">${stars}/3</span>
        </div>
        <div class="score-item">
          <span class="score-icon">✨</span>
          <span class="score-label">XP</span>
          <span class="score-value" style="color:var(--clr-accent)">+${Utils.formatXP(xpGained)}</span>
        </div>
      `;
    }

    // XP-Anzeige
    const xpEl = document.getElementById('xp-gained');
    if (xpEl) xpEl.textContent = `+${Utils.formatXP(xpGained)} XP`;

    // Nächstes Level Button
    const btnNext = document.getElementById('btn-next-level');
    if (btnNext) {
      const nextLevel = LEVELS_DATA.levels.find(l => l.id === levelId + 1);
      btnNext.style.display = (success && nextLevel) ? 'flex' : 'none';
    }

    // Achievements prüfen
    const newAchs = AchievementSystem.check();
    if (newAchs.length > 0) {
      setTimeout(() => newAchs.forEach(a => EventBus.emit('achievementUnlocked', a)), 1000);
    }
  }

  // ── Achievements-Overlay ───────────────────────────────────
  function showAchievements() {
    const all = AchievementSystem.getAll();
    const unlocked = all.filter(a => a.unlocked).length;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:200;
      background:rgba(10,14,26,0.95);backdrop-filter:blur(20px);
      display:flex;align-items:center;justify-content:center;
      padding:1rem;overflow-y:auto;
    `;

    overlay.innerHTML = `
      <div style="max-width:700px;width:100%;display:flex;flex-direction:column;gap:1.5rem">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <h2 style="font-family:var(--font-display);font-size:1.5rem;letter-spacing:0.1em">ERRUNGENSCHAFTEN</h2>
            <p style="color:var(--clr-muted);font-size:0.85rem">${unlocked}/${all.length} freigeschaltet</p>
          </div>
          <button class="btn-ghost btn-sm" onclick="this.closest('div[style]').remove()">✕ Schließen</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem">
          ${all.map(a => `
            <div style="
              background:var(--clr-surface);
              border:1px solid ${a.unlocked ? 'var(--clr-accent)' : 'var(--clr-border)'};
              border-radius:var(--radius);padding:1rem;
              opacity:${a.unlocked ? 1 : 0.5};
              transition:all 0.2s;
            ">
              <div style="font-size:2rem;margin-bottom:0.5rem">${a.icon}</div>
              <div style="font-weight:700;font-size:0.9rem;color:${a.unlocked ? 'var(--clr-accent)' : 'var(--clr-text)'}">${a.title}</div>
              <div style="font-size:0.75rem;color:var(--clr-muted);margin-top:0.25rem">${a.desc}</div>
              ${a.unlocked ? '<div style="font-size:0.7rem;color:var(--clr-success);margin-top:0.5rem">✓ Freigeschaltet</div>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }

  return { renderRoleSelection, selectRole, showResult, showAchievements };
})();
