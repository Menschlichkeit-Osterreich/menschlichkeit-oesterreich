/**
 * BRÜCKEN BAUEN 3D – Speichersystem
 * Lokales Speichern und Laden des Spielstands
 */
'use strict';

const SaveSystem = (() => {

  function save() {
    try {
      const data = {
        version: CONFIG.VERSION,
        timestamp: Date.now(),
        xp: GAME_STATE.xp,
        playerLevel: GAME_STATE.playerLevel,
        selectedRole: GAME_STATE.selectedRole,
        achievements: GAME_STATE.achievements,
        completedLevels: [...GAME_STATE.completedLevels],
        decisions: GAME_STATE.decisions.slice(-500), // max 500 speichern
        levelData: LEVELS_DATA.levels.map(l => ({
          id: l.id, stars: l.stars, bestScore: l.bestScore,
          completed: l.completed, unlocked: l.unlocked,
        })),
      };
      localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Speichern fehlgeschlagen:', e);
      return false;
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(CONFIG.SAVE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (!data.version) return false;

      GAME_STATE.xp = data.xp || 0;
      GAME_STATE.playerLevel = data.playerLevel || 1;
      GAME_STATE.selectedRole = data.selectedRole || null;
      GAME_STATE.achievements = data.achievements || [];
      GAME_STATE.completedLevels = new Set(data.completedLevels || []);
      GAME_STATE.decisions = data.decisions || [];

      // Level-Daten wiederherstellen
      if (data.levelData) {
        data.levelData.forEach(saved => {
          const level = LEVELS_DATA.levels.find(l => l.id === saved.id);
          if (level) {
            level.stars = saved.stars;
            level.bestScore = saved.bestScore;
            level.completed = saved.completed;
            level.unlocked = saved.unlocked;
          }
        });
      }

      return true;
    } catch (e) {
      console.warn('Laden fehlgeschlagen:', e);
      return false;
    }
  }

  function reset() {
    localStorage.removeItem(CONFIG.SAVE_KEY);
    GAME_STATE.xp = 0;
    GAME_STATE.playerLevel = 1;
    GAME_STATE.selectedRole = null;
    GAME_STATE.achievements = [];
    GAME_STATE.completedLevels = new Set();
    GAME_STATE.decisions = [];
    LEVELS_DATA.levels.forEach((l, i) => {
      l.stars = 0; l.bestScore = 0; l.completed = false; l.unlocked = i === 0;
    });
  }

  function hasSave() {
    return !!localStorage.getItem(CONFIG.SAVE_KEY);
  }

  // Autosave
  setInterval(() => {
    if (GAME_STATE.phase === 'playing') save();
  }, CONFIG.AUTOSAVE_INTERVAL);

  return { save, load, reset, hasSave };
})();
