const STORAGE_KEY = 'bruecken-bauen-babylon-v3';
const CURRENT_VERSION = 3;
const LEGACY_KEYS = [
  STORAGE_KEY,
  'bruecken-bauen-babylon-v2',
  'bruecken-bauen-babylon-v1',
  'bruecken_bauen_v2',
  'democracy_metaverse_save',
  'democracy_game_progress',
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeDeep(base, incoming) {
  const output = clone(base);
  for (const [key, value] of Object.entries(incoming ?? {})) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      output[key] &&
      typeof output[key] === 'object' &&
      !Array.isArray(output[key])
    ) {
      output[key] = mergeDeep(output[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

function migrateLegacyState(parsed, defaultState) {
  const migrated = clone(defaultState);

  const legacyCompletedLevels = parsed.completedLevels ?? {};
  const completedLevels =
    Array.isArray(legacyCompletedLevels)
      ? Object.fromEntries(
          legacyCompletedLevels.map((levelId) => [
            String(levelId),
            {
              levelId,
              completedAt: parsed.lastPlayedAt ?? new Date().toISOString(),
              score: 0,
              xpAwarded: 0,
              roleId: parsed.selectedRole ?? defaultState.campaign.selectedRole,
              usedRoleAction: false,
              outcomeId: null,
            },
          ]),
        )
      : legacyCompletedLevels;

  migrated.version = CURRENT_VERSION;
  migrated.campaign.completedLevels = completedLevels;
  migrated.campaign.selectedRole = parsed.selectedRole ?? defaultState.campaign.selectedRole;
  migrated.campaign.currentWorldId = parsed.currentWorldId ?? defaultState.campaign.currentWorldId;
  migrated.campaign.currentLevelId = parsed.lastLevelId ?? parsed.currentLevelId ?? defaultState.campaign.currentLevelId;

  migrated.profile.xp = parsed.xp ?? 0;
  migrated.profile.playerLevel = parsed.playerLevel ?? 1;
  migrated.profile.stats = {
    ...defaultState.profile.stats,
    ...(parsed.stats ?? {}),
  };

  migrated.settings = {
    ...defaultState.settings,
    ...(parsed.settings ?? {}),
  };

  migrated.worldState = {
    ...defaultState.worldState,
    ...(parsed.worldState ?? {}),
  };

  migrated.teacher = {
    ...defaultState.teacher,
    ...(parsed.teacher ?? {}),
  };

  migrated.meta.lastPlayedAt = parsed.lastPlayedAt ?? parsed.timestamp ?? new Date().toISOString();
  migrated.meta.migratedFromLegacy = true;
  return migrated;
}

export function createGameStorage(defaultState) {
  function readRawState() {
    for (const key of LEGACY_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) {
        return { key, raw };
      }
    }
    return null;
  }

  function loadState() {
    const rawEntry = readRawState();
    if (!rawEntry) {
      return clone(defaultState);
    }

    try {
      const parsed = JSON.parse(rawEntry.raw);
      if (parsed.version === CURRENT_VERSION) {
        return mergeDeep(defaultState, parsed);
      }
      if (parsed.version >= 2) {
        return mergeDeep(defaultState, parsed);
      }
      return migrateLegacyState(parsed, defaultState);
    } catch {
      return clone(defaultState);
    }
  }

  function saveState(state) {
    const nextState = mergeDeep(defaultState, state);
    nextState.version = CURRENT_VERSION;
    nextState.meta.lastPlayedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  function resetState() {
    for (const key of LEGACY_KEYS) {
      localStorage.removeItem(key);
    }
    const nextState = clone(defaultState);
    saveState(nextState);
    return nextState;
  }

  return {
    storageKey: STORAGE_KEY,
    currentVersion: CURRENT_VERSION,
    loadState,
    saveState,
    resetState,
  };
}
