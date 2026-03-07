/**
 * BRÜCKEN BAUEN 3D – HUD-System
 * Timer, Score, XP-Bar, Achievement-Toast, Level-Up
 */
'use strict';

const UIHud = (() => {
  let timerInterval = null;
  let timeLeft = 0;

  // ── Timer ──────────────────────────────────────────────────
  function startTimer(seconds, onTick, onExpire) {
    stopTimer();
    timeLeft = seconds;
    _updateTimerDisplay();

    timerInterval = setInterval(() => {
      timeLeft--;
      _updateTimerDisplay();
      if (onTick) onTick(timeLeft);

      if (timeLeft <= CONFIG.WARNING_TIME) {
        document.getElementById('hud-timer')?.classList.add('warning');
      }

      if (timeLeft <= 0) {
        stopTimer();
        if (onExpire) onExpire();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function addTime(seconds) {
    timeLeft = Math.min(timeLeft + seconds, 999);
    _updateTimerDisplay();
  }

  function getTimeLeft() { return timeLeft; }

  function _updateTimerDisplay() {
    const el = document.getElementById('hud-timer');
    if (el) el.textContent = Utils.formatTime(timeLeft);
  }

  // ── Score & Stats ──────────────────────────────────────────
  function updateScore(score) {
    const el = document.getElementById('hud-score');
    if (el) el.textContent = score;
  }

  function updateLevel(level) {
    const title = document.getElementById('hud-level-title');
    const name  = document.getElementById('hud-level-name');
    if (title) title.textContent = `${level.worldIcon} Welt ${level.worldId} · Level ${level.id}`;
    if (name)  name.textContent  = level.title;
  }

  function updateXPBar() {
    const bar = document.getElementById('hud-xp-bar');
    if (!bar) return;
    const current = GAME_STATE.xp;
    const needed  = Utils.xpForLevel(GAME_STATE.playerLevel + 1);
    const prev    = Utils.xpForLevel(GAME_STATE.playerLevel);
    const pct = Math.min(100, ((current - prev) / (needed - prev)) * 100);
    bar.style.width = pct + '%';
  }

  // ── Achievement Toast ──────────────────────────────────────
  let toastQueue = [];
  let toastShowing = false;

  function showAchievementToast(ach) {
    toastQueue.push(ach);
    if (!toastShowing) _showNextToast();
  }

  function _showNextToast() {
    if (toastQueue.length === 0) { toastShowing = false; return; }
    toastShowing = true;
    const ach = toastQueue.shift();

    const toast = document.getElementById('achievement-toast');
    const icon  = document.getElementById('toast-icon');
    const title = document.getElementById('toast-title');
    const desc  = document.getElementById('toast-desc');

    if (!toast) { toastShowing = false; return; }

    if (icon)  icon.textContent  = ach.icon;
    if (title) title.textContent = ach.title;
    if (desc)  desc.textContent  = ach.desc;

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(_showNextToast, 400);
    }, 3500);
  }

  // ── Level-Up Toast ─────────────────────────────────────────
  function showLevelUpToast(level) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);
      z-index:150;
      background:linear-gradient(135deg,rgba(245,158,11,0.95),rgba(239,68,68,0.95));
      border-radius:var(--radius);padding:2rem 3rem;text-align:center;
      box-shadow:0 0 60px rgba(245,158,11,0.4);
      transition:transform 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);
    `;
    toast.innerHTML = `
      <div style="font-size:3rem">⬆️</div>
      <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:900;letter-spacing:0.1em;color:#fff">LEVEL UP!</div>
      <div style="font-size:1rem;color:rgba(255,255,255,0.9);margin-top:0.25rem">Spielerlevel ${level}</div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translate(-50%,-50%) scale(1)'; });
    setTimeout(() => {
      toast.style.transform = 'translate(-50%,-50%) scale(0)';
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }

  return { startTimer, stopTimer, addTime, getTimeLeft, updateScore, updateLevel, updateXPBar, showAchievementToast, showLevelUpToast };
})();
