/**
 * BRÜCKEN BAUEN 3D – Achievement-System
 * 30+ Errungenschaften für verschiedene Spielstile
 */
'use strict';

const AchievementSystem = (() => {

  const ACHIEVEMENTS = [
    // Erste Schritte
    { id: 'first_step',    icon: '🎯', title: 'Erste Schritte',      desc: 'Schließe dein erstes Level ab.',          condition: s => s.completedLevels.size >= 1 },
    { id: 'ten_levels',    icon: '🔟', title: 'Zehn Schritte',       desc: 'Schließe 10 Level ab.',                   condition: s => s.completedLevels.size >= 10 },
    { id: 'halfway',       icon: '🏃', title: 'Halbzeit',            desc: 'Schließe 50 Level ab.',                   condition: s => s.completedLevels.size >= 50 },
    { id: 'all_levels',    icon: '🏆', title: 'Demokrat*in',         desc: 'Schließe alle 100 Level ab.',             condition: s => s.completedLevels.size >= 100 },

    // Sterne
    { id: 'first_star',    icon: '⭐', title: 'Erster Stern',        desc: 'Erhalte deinen ersten 3-Sterne-Abschluss.',condition: s => LEVELS_DATA.levels.some(l => l.stars === 3) },
    { id: 'star_collector',icon: '🌟', title: 'Sternensammler',      desc: 'Erhalte 50 Sterne insgesamt.',            condition: s => LEVELS_DATA.levels.reduce((a,l)=>a+l.stars,0) >= 50 },
    { id: 'perfect_world', icon: '💫', title: 'Perfekte Welt',       desc: 'Alle Level einer Welt mit 3 Sternen.',    condition: s => _hasFullStarWorld() },

    // Rollen
    { id: 'role_citizen',  icon: '👩‍💼', title: 'Bürgerin',          desc: 'Spiele 10 Level als Bürgerin.',           condition: s => _countRoleDecisions('buerger') >= 10 },
    { id: 'role_politician',icon:'🏛️', title: 'Politiker',          desc: 'Spiele 10 Level als Politiker.',          condition: s => _countRoleDecisions('politiker') >= 10 },
    { id: 'role_journalist',icon:'📰', title: 'Journalist',         desc: 'Spiele 10 Level als Journalist.',         condition: s => _countRoleDecisions('journalist') >= 10 },
    { id: 'role_activist', icon: '🌱', title: 'Aktivist',           desc: 'Spiele 10 Level als Aktivist.',           condition: s => _countRoleDecisions('aktivist') >= 10 },
    { id: 'role_official', icon: '📋', title: 'Beamter',            desc: 'Spiele 10 Level als Beamter.',            condition: s => _countRoleDecisions('beamter') >= 10 },
    { id: 'role_judge',    icon: '⚖️', title: 'Richterin',          desc: 'Spiele 10 Level als Richterin.',          condition: s => _countRoleDecisions('richter') >= 10 },
    { id: 'all_roles',     icon: '🎭', title: 'Allrounder',         desc: 'Spiele mit allen 6 Rollen.',              condition: s => _hasAllRoles() },

    // Score
    { id: 'perfect_score', icon: '💯', title: 'Perfekt!',           desc: 'Erreiche 100% in einem Level.',           condition: s => s.decisions.some(d => d.score >= 100) },
    { id: 'speed_run',     icon: '⚡', title: 'Speedrun',           desc: 'Schließe ein Level in unter 30 Sekunden ab.', condition: s => s.decisions.some(d => d.timeLeft > 90) },
    { id: 'no_hints',      icon: '🧠', title: 'Ohne Hilfe',         desc: 'Schließe 5 Level ohne Hinweise ab.',      condition: s => _countNoHintLevels() >= 5 },

    // Welten
    { id: 'world_1',       icon: '🏘️', title: 'Gemeinderat',        desc: 'Schließe Welt 1 (Gemeinde) ab.',          condition: s => ProgressionSystem.getWorldProgress(1).completed === 10 },
    { id: 'world_5',       icon: '🌍', title: 'Umweltschützer',     desc: 'Schließe Welt 5 (Umwelt) ab.',            condition: s => ProgressionSystem.getWorldProgress(5).completed === 10 },
    { id: 'world_10',      icon: '🚀', title: 'Visionär',           desc: 'Schließe Welt 10 (Zukunft) ab.',          condition: s => ProgressionSystem.getWorldProgress(10).completed === 10 },

    // Spezial
    { id: 'consensus',     icon: '🤝', title: 'Brückenbauer',       desc: 'Wähle 20 Konsens-Optionen.',              condition: s => _countDecisionType('consensus') >= 20 },
    { id: 'rebel',         icon: '✊', title: 'Rebell',             desc: 'Wähle 10 Protest-Optionen.',              condition: s => _countDecisionType('protest') >= 10 },
    { id: 'diplomat',      icon: '🕊️', title: 'Diplomat',           desc: 'Löse 5 Konflikte friedlich.',             condition: s => _countDecisionType('peaceful') >= 5 },
    { id: 'investigator',  icon: '🔍', title: 'Investigator',       desc: 'Decke 3 Korruptionsfälle auf.',           condition: s => _countDecisionType('expose') >= 3 },
    { id: 'lawful',        icon: '📜', title: 'Gesetzestreue',      desc: 'Wähle 15 regelkonforme Optionen.',        condition: s => _countDecisionType('compliant') >= 15 },

    // Fortschritt
    { id: 'level_10',      icon: '🎖️', title: 'Erfahren',           desc: 'Erreiche Spielerlevel 10.',               condition: s => s.playerLevel >= 10 },
    { id: 'level_25',      icon: '🏅', title: 'Veteran',            desc: 'Erreiche Spielerlevel 25.',               condition: s => s.playerLevel >= 25 },
    { id: 'xp_10k',        icon: '💎', title: 'XP-Sammler',         desc: 'Sammle 10.000 XP.',                       condition: s => s.xp >= 10000 },
  ];

  function _hasFullStarWorld() {
    for (let w = 1; w <= 10; w++) {
      const levels = LEVELS_DATA.levels.filter(l => l.worldId === w);
      if (levels.every(l => l.stars === 3)) return true;
    }
    return false;
  }

  function _countRoleDecisions(roleId) {
    return GAME_STATE.decisions.filter(d => d.role === roleId).length;
  }

  function _hasAllRoles() {
    const roles = new Set(GAME_STATE.decisions.map(d => d.role));
    return roles.size >= 6;
  }

  function _countNoHintLevels() {
    return GAME_STATE.decisions.filter(d => d.usedHint === false).length;
  }

  function _countDecisionType(type) {
    return GAME_STATE.decisions.filter(d => d.type === type).length;
  }

  function check() {
    const newlyUnlocked = [];
    ACHIEVEMENTS.forEach(ach => {
      if (!GAME_STATE.achievements.includes(ach.id) && ach.condition(GAME_STATE)) {
        GAME_STATE.achievements.push(ach.id);
        newlyUnlocked.push(ach);
        EventBus.emit('achievementUnlocked', ach);
      }
    });
    return newlyUnlocked;
  }

  function getAll() {
    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: GAME_STATE.achievements.includes(a.id),
    }));
  }

  function getUnlocked() {
    return ACHIEVEMENTS.filter(a => GAME_STATE.achievements.includes(a.id));
  }

  return { check, getAll, getUnlocked, ACHIEVEMENTS };
})();
