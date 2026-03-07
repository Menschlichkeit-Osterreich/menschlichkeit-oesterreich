/**
 * BRÜCKEN BAUEN 3D – Konfiguration
 * Menschlichkeit Österreich | 2026
 */
'use strict';

const CONFIG = {
  VERSION: '2.0.0',
  GAME_TITLE: 'Brücken Bauen 3D',
  ORG: 'Menschlichkeit Österreich',
  WEBSITE: 'https://menschlichkeit-oesterreich.at',

  // Spielparameter
  TOTAL_LEVELS: 100,
  LEVELS_PER_WORLD: 10,
  WORLDS: 10,

  // Zeitlimits (Sekunden)
  DEFAULT_TIME_LIMIT: 120,
  BONUS_TIME_PER_CHOICE: 5,
  WARNING_TIME: 30,

  // XP & Progression
  XP_BASE: 100,
  XP_MULTIPLIER_PERFECT: 2.0,
  XP_MULTIPLIER_GOOD: 1.5,
  XP_MULTIPLIER_OK: 1.0,
  XP_MULTIPLIER_FAIL: 0.25,
  XP_PER_LEVEL: 500,        // XP für Level-Up
  XP_LEVEL_SCALING: 1.15,   // Multiplikator pro Level

  // Score-Schwellen (0–100)
  SCORE_PERFECT: 90,
  SCORE_GOOD: 70,
  SCORE_OK: 50,

  // Rollen
  ROLES: {
    BUERGER:   { id: 'buerger',   color: '#3b82f6' },
    POLITIKER: { id: 'politiker', color: '#8b5cf6' },
    JOURNALIST:{ id: 'journalist',color: '#f59e0b' },
    AKTIVIST:  { id: 'aktivist',  color: '#10b981' },
    BEAMTER:   { id: 'beamter',   color: '#6b7280' },
    RICHTER:   { id: 'richter',   color: '#ef4444' },
  },

  // Welten
  WORLD_NAMES: [
    'Gemeinde',       // 1-10
    'Schule',         // 11-20
    'Arbeit',         // 21-30
    'Medien',         // 31-40
    'Umwelt',         // 41-50
    'Digital',        // 51-60
    'Gesundheit',     // 61-70
    'Europa',         // 71-80
    'Gerechtigkeit',  // 81-90
    'Zukunft',        // 91-100
  ],

  WORLD_COLORS: [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4',
    '#ec4899', '#14b8a6', '#6366f1', '#ef4444', '#f97316',
  ],

  // Analytics
  ANALYTICS_ENDPOINT: '/api/v1/game/analytics',
  ANALYTICS_BATCH_SIZE: 10,

  // Audio
  AUDIO_ENABLED: true,
  MUSIC_VOLUME: 0.3,
  SFX_VOLUME: 0.7,

  // Speichern
  SAVE_KEY: 'bruecken_bauen_v2',
  AUTOSAVE_INTERVAL: 30000, // ms

  // Three.js
  RENDERER: {
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  },

  CAMERA: {
    fov: 60,
    near: 0.1,
    far: 1000,
  },
};

// Globaler Spielzustand
const GAME_STATE = {
  phase: 'loading',   // loading | menu | role-select | world-map | playing | paused | result
  selectedRole: null,
  currentWorld: 0,
  currentLevel: 0,
  score: 0,
  xp: 0,
  playerLevel: 1,
  achievements: [],
  completedLevels: new Set(),
  decisions: [],
  sessionStart: Date.now(),
};

// Event-Bus (einfaches Pub/Sub)
const EventBus = {
  _listeners: {},
  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  },
  off(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(f => f !== fn);
  },
  emit(event, data) {
    (this._listeners[event] || []).forEach(fn => fn(data));
  },
};

// Hilfsfunktionen
const Utils = {
  lerp: (a, b, t) => a + (b - a) * t,
  clamp: (v, min, max) => Math.min(Math.max(v, min), max),
  randInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  randFloat: (min, max) => Math.random() * (max - min) + min,
  shuffle: arr => [...arr].sort(() => Math.random() - 0.5),
  formatTime: s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`,
  formatXP: n => n >= 1000 ? `${(n/1000).toFixed(1)}k` : n.toString(),
  getWorldIndex: level => Math.floor((level - 1) / CONFIG.LEVELS_PER_WORLD),
  getWorldName: level => CONFIG.WORLD_NAMES[Utils.getWorldIndex(level)] || 'Unbekannt',
  getWorldColor: level => CONFIG.WORLD_COLORS[Utils.getWorldIndex(level)] || '#3b82f6',
  xpForLevel: lvl => Math.floor(CONFIG.XP_PER_LEVEL * Math.pow(CONFIG.XP_LEVEL_SCALING, lvl - 1)),
};
