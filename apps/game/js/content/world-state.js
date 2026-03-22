export const WORLD_TRACKS = [
  {
    key: 'trust',
    label: 'Vertrauen',
    goodDirection: 'up',
    description: 'Wie stark die Gemeinde Entscheidungen als fair, offen und tragfaehig erlebt.',
  },
  {
    key: 'participation',
    label: 'Teilhabe',
    goodDirection: 'up',
    description: 'Wie sichtbar Mitsprache, Einbindung und demokratische Anschlussfaehigkeit bleiben.',
  },
  {
    key: 'ruleOfLaw',
    label: 'Rechtsstaat',
    goodDirection: 'up',
    description: 'Wie klar Verfahren, Grundrechte und institutionelle Verlaesslichkeit getragen werden.',
  },
  {
    key: 'socialTension',
    label: 'Soziale Spannung',
    goodDirection: 'down',
    description: 'Wie stark Konflikte in Lagerbildung, Ressentiment oder Eskalation kippen.',
  },
  {
    key: 'futureLoad',
    label: 'Zukunftslast',
    goodDirection: 'down',
    description: 'Wie viele ungeloste Folgekosten in die Zukunft verschoben werden.',
  },
];

export const WORLD_TRACK_KEYS = WORLD_TRACKS.map((track) => track.key);
export const WORLD_TRACK_LABELS = Object.fromEntries(WORLD_TRACKS.map((track) => [track.key, track.label]));

const BASE_WORLD_STATE = {
  trust: 50,
  participation: 50,
  ruleOfLaw: 50,
  socialTension: 34,
  futureLoad: 52,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampDelta(value) {
  return Math.max(-18, Math.min(18, Math.round(value)));
}

function addBonus(delta, key, value) {
  delta[key] = (delta[key] ?? 0) + value;
}

function createEmptyDelta() {
  return Object.fromEntries(WORLD_TRACK_KEYS.map((key) => [key, 0]));
}

function applyTagBonuses(delta, tags = []) {
  if (tags.includes('community')) {
    addBonus(delta, 'trust', 3);
    addBonus(delta, 'participation', 4);
    addBonus(delta, 'socialTension', -2);
  }

  if (tags.includes('transparency')) {
    addBonus(delta, 'trust', 4);
    addBonus(delta, 'ruleOfLaw', 3);
    addBonus(delta, 'socialTension', -1);
  }

  if (tags.includes('official')) {
    addBonus(delta, 'trust', 1);
    addBonus(delta, 'ruleOfLaw', 2);
    addBonus(delta, 'participation', -1);
  }

  if (tags.includes('mobilize')) {
    addBonus(delta, 'participation', 4);
    addBonus(delta, 'futureLoad', -2);
    addBonus(delta, 'socialTension', 1);
  }

  if (tags.includes('compliance')) {
    addBonus(delta, 'ruleOfLaw', 5);
    addBonus(delta, 'futureLoad', -2);
  }

  if (tags.includes('rights')) {
    addBonus(delta, 'ruleOfLaw', 5);
    addBonus(delta, 'trust', 2);
    addBonus(delta, 'socialTension', -3);
  }
}

function normalizeDelta(delta) {
  return Object.fromEntries(WORLD_TRACK_KEYS.map((key) => [key, clampDelta(delta[key] ?? 0)]));
}

function getTrackBaseline(choice) {
  const stats = {
    empathy: 0,
    rights: 0,
    participation: 0,
    courage: 0,
    ...(choice?.stats ?? {}),
  };

  const delta = createEmptyDelta();
  addBonus(delta, 'trust', stats.empathy * 1.15 + stats.rights * 0.55 + stats.participation * 0.45 + stats.courage * 0.2);
  addBonus(delta, 'participation', stats.participation * 1.2 + stats.empathy * 0.35 + stats.courage * 0.3);
  addBonus(delta, 'ruleOfLaw', stats.rights * 1.35 + stats.courage * 0.35);
  addBonus(delta, 'socialTension', stats.courage * 0.15 - stats.empathy * 0.6 - stats.participation * 0.4 - stats.rights * 0.2);
  addBonus(delta, 'futureLoad', -stats.courage * 0.6 - stats.rights * 0.45 - stats.participation * 0.3);

  applyTagBonuses(delta, choice?.tags ?? []);

  if ((choice?.score ?? 0) >= 85) {
    addBonus(delta, 'trust', 2);
    addBonus(delta, 'futureLoad', -2);
  } else if ((choice?.score ?? 0) <= 45) {
    addBonus(delta, 'trust', -4);
    addBonus(delta, 'socialTension', 4);
    addBonus(delta, 'futureLoad', 3);
  }

  return delta;
}

export function createWorldStateSnapshot(overrides = {}) {
  return Object.fromEntries(
    WORLD_TRACK_KEYS.map((key) => [key, clamp(overrides[key] ?? BASE_WORLD_STATE[key])]),
  );
}

export function createDefaultWorldState(worlds = []) {
  return Object.fromEntries(worlds.map((world) => [String(world.id), createWorldStateSnapshot()]));
}

export function getWorldStateForWorld(state, worldId) {
  return createWorldStateSnapshot(state?.worldState?.[String(worldId)] ?? {});
}

export function buildConsequenceSeeds(choice, role, useRoleAction = false) {
  const delta = getTrackBaseline(choice);

  if (choice?.tags?.includes(role?.synergyTag)) {
    addBonus(delta, 'trust', 2);
    addBonus(delta, role.worldTrackFocusKey ?? 'trust', 2);
  }

  if (useRoleAction) {
    addBonus(delta, role.worldTrackFocusKey ?? 'trust', role.trackBonus ?? 4);
    if (choice?.tags?.includes(role?.synergyTag)) {
      addBonus(delta, 'futureLoad', -1);
    } else {
      addBonus(delta, 'socialTension', 2);
      addBonus(delta, 'futureLoad', 1);
    }
  }

  return normalizeDelta(delta);
}

export function applyWorldDelta(snapshot, delta) {
  return Object.fromEntries(
    WORLD_TRACK_KEYS.map((key) => [key, clamp((snapshot?.[key] ?? BASE_WORLD_STATE[key]) + (delta?.[key] ?? 0))]),
  );
}

export function getWorldStateCards(snapshot, delta = {}) {
  return WORLD_TRACKS.map((track) => ({
    ...track,
    value: snapshot?.[track.key] ?? BASE_WORLD_STATE[track.key],
    delta: delta?.[track.key] ?? 0,
    tone: getWorldTrackTone(track.key, snapshot?.[track.key] ?? BASE_WORLD_STATE[track.key]),
  }));
}

export function getWorldTrackTone(trackKey, value) {
  const track = WORLD_TRACKS.find((entry) => entry.key === trackKey) ?? WORLD_TRACKS[0];
  const normalized = track.goodDirection === 'down' ? 100 - value : value;

  if (normalized >= 68) {
    return 'stabil';
  }
  if (normalized >= 48) {
    return 'angespannt';
  }
  return 'kritisch';
}

export function getDominantShift(delta = {}) {
  return clone(
    WORLD_TRACKS.map((track) => ({
      key: track.key,
      label: track.label,
      delta: delta[track.key] ?? 0,
    }))
      .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
      .find((entry) => entry.delta !== 0) ?? {
      key: 'trust',
      label: 'Vertrauen',
      delta: 0,
    },
  );
}
