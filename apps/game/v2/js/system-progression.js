/**
 * BRÜCKEN BAUEN 3D – Progressionssystem
 * XP, Level-Ups, Sterne, Freischaltungen
 */
'use strict';

const ProgressionSystem = (() => {

  function addXP(amount) {
    const multiplier = _getRoleMultiplier();
    const gained = Math.floor(amount * multiplier);
    GAME_STATE.xp += gained;

    // Level-Up prüfen
    while (GAME_STATE.xp >= Utils.xpForLevel(GAME_STATE.playerLevel + 1)) {
      GAME_STATE.playerLevel++;
      EventBus.emit('levelUp', { level: GAME_STATE.playerLevel });
    }

    EventBus.emit('xpGained', { amount: gained, total: GAME_STATE.xp });
    return gained;
  }

  function _getRoleMultiplier() {
    if (!GAME_STATE.selectedRole) return 1.0;
    const role = ROLES_DATA.find(r => r.id === GAME_STATE.selectedRole);
    if (!role) return 1.0;
    const xpBonus = role.bonuses.find(b => b.type === 'xp');
    return xpBonus ? 1.0 + xpBonus.value : 1.0;
  }

  function completeLevel(levelId, score, decisions) {
    const level = LEVELS_DATA.levels.find(l => l.id === levelId);
    if (!level) return;

    // Sterne berechnen
    let stars = 1;
    if (score >= CONFIG.SCORE_PERFECT) stars = 3;
    else if (score >= CONFIG.SCORE_GOOD) stars = 2;

    // Nur aktualisieren wenn besser
    if (!level.completed || stars > level.stars) {
      level.stars = stars;
      level.bestScore = Math.max(level.bestScore, score);
    }
    level.completed = true;
    GAME_STATE.completedLevels.add(levelId);

    // Nächstes Level freischalten
    const nextLevel = LEVELS_DATA.levels.find(l => l.id === levelId + 1);
    if (nextLevel) nextLevel.unlocked = true;

    // XP vergeben
    const xpGained = addXP(level.xpReward * (score / 100));

    // Entscheidungen speichern
    GAME_STATE.decisions.push(...decisions.map(d => ({
      ...d, levelId, timestamp: Date.now(),
    })));

    EventBus.emit('levelCompleted', { levelId, score, stars, xpGained });
    SaveSystem.save();

    return { stars, xpGained };
  }

  function getProgress() {
    const total = LEVELS_DATA.levels.length;
    const completed = LEVELS_DATA.levels.filter(l => l.completed).length;
    const stars = LEVELS_DATA.levels.reduce((sum, l) => sum + l.stars, 0);
    return { total, completed, stars, maxStars: total * 3, percent: Math.round(completed / total * 100) };
  }

  function getWorldProgress(worldId) {
    const levels = LEVELS_DATA.levels.filter(l => l.worldId === worldId);
    const completed = levels.filter(l => l.completed).length;
    return { total: levels.length, completed, unlocked: completed === levels.length };
  }

  return { addXP, completeLevel, getProgress, getWorldProgress };
})();
