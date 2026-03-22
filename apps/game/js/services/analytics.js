const STORAGE_KEY = 'bruecken-bauen-analytics-v1';
const MAX_EVENTS = 120;

function safeParse(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sanitize(payload) {
  return JSON.parse(JSON.stringify(payload ?? {}));
}

export function createAnalyticsService() {
  let storedEvents = safeParse(localStorage.getItem(STORAGE_KEY));

  function persist() {
    const safeEvents = Array.isArray(storedEvents) ? storedEvents : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeEvents.slice(-MAX_EVENTS)));
  }

  function track(state, eventType, payload = {}) {
    if (!state?.settings?.analyticsConsent) {
      return;
    }

    const safeEvents = Array.isArray(storedEvents) ? storedEvents : [];
    safeEvents.push({
      type: eventType,
      timestamp: new Date().toISOString(),
      sessionId: state.telemetry?.sessionId ?? 'local-session',
      payload: sanitize(payload),
    });
    storedEvents = safeEvents.slice(-MAX_EVENTS);
    persist();
  }

  function getEvents() {
    return [...(Array.isArray(storedEvents) ? storedEvents : [])];
  }

  function getSummary() {
    const safeEvents = Array.isArray(storedEvents) ? storedEvents : [];
    const counts = {};
    safeEvents.forEach((event) => {
      counts[event.type] = (counts[event.type] ?? 0) + 1;
    });

    return {
      total: safeEvents.length,
      counts,
      lastEvent: safeEvents.at(-1) ?? null,
    };
  }

  function reset() {
    storedEvents = [];
    persist();
  }

  return {
    track,
    getEvents,
    getSummary,
    reset,
  };
}
