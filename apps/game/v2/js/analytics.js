/**
 * BRÜCKEN BAUEN 3D – Analytics
 * Minimale lokale Event-Aufzeichnung via localStorage.
 * Kein externes Tracking, keine Serverübertragung.
 */
'use strict';

const GameAnalytics = (() => {
  const STORAGE_KEY = 'bb3d_analytics';
  const MAX_EVENTS = 500;

  function _load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (_) {
      return [];
    }
  }

  function _save(events) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (_) {
      // localStorage voll oder deaktiviert – ignorieren
    }
  }

  function track(eventName, data) {
    const events = _load();
    events.push({
      event: eventName,
      ts: Date.now(),
      data: data || {},
    });
    // Älteste Events entfernen wenn Limit erreicht
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
    _save(events);
  }

  function getEvents() {
    return _load();
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Hilfsmethoden für häufige Spiel-Events
  const events = {
    roleSelected: (roleId) => track('role_selected', { role: roleId }),
    levelStarted: (levelId, world) => track('level_started', { level: levelId, world }),
    levelCompleted: (levelId, score, stars) => track('level_completed', { level: levelId, score, stars }),
    levelFailed: (levelId, score) => track('level_failed', { level: levelId, score }),
    decisionMade: (levelId, scenarioId, choiceType, choiceScore) =>
      track('decision_made', { level: levelId, scenario: scenarioId, type: choiceType, score: choiceScore }),
    hintUsed: (levelId) => track('hint_used', { level: levelId }),
    sessionStart: () => track('session_start', { ua: navigator.userAgent.slice(0, 80) }),
  };

  return { track, getEvents, clear, events };
})();
