/* ==========================================================================
   Brücken Bauen – Game Analytics Module
   Privacy-first analytics: no PII, aggregated data only, DSGVO-compliant
   ========================================================================== */

class GameAnalytics {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/api/game/analytics';
    this.sessionId = this._generateSessionId();
    this.buffer = [];
    this.flushInterval = options.flushInterval || 30000; // 30s
    this.enabled = options.enabled !== false;
    this.debug = options.debug || false;
    this._startTime = Date.now();
    this._flushTimer = null;

    if (this.enabled) {
      this._startFlushTimer();
      this._trackPageLoad();
    }

    this._log('Analytics initialized', { sessionId: this.sessionId });
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Spielstart tracken */
  trackGameStart(metadata = {}) {
    this._track('game_start', {
      ...metadata,
      user_agent_class: this._getUserAgentClass(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });
  }

  /** Szenario-Ansicht tracken */
  trackScenarioView(scenarioId, scenarioCategory, level) {
    this._track('scenario_view', {
      scenario_id: scenarioId,
      scenario_category: scenarioCategory,
      level,
      time_since_start: this._getElapsedSeconds(),
    });
  }

  /** Entscheidung tracken */
  trackDecision(scenarioId, decisionId, scores, timeToDecide) {
    this._track('decision_made', {
      scenario_id: scenarioId,
      decision_id: decisionId,
      score_empathy: scores.empathy || 0,
      score_rights: scores.rights || 0,
      score_participation: scores.participation || 0,
      score_courage: scores.courage || 0,
      time_to_decide_seconds: timeToDecide,
    });
  }

  /** Level-Abschluss tracken */
  trackLevelComplete(level, totalScore, timeSpent) {
    this._track('level_complete', {
      level,
      total_score: totalScore,
      time_spent_seconds: timeSpent,
    });
  }

  /** Spielende tracken */
  trackGameEnd(finalScores, completedScenarios, totalTime) {
    this._track('game_end', {
      final_score_empathy: finalScores.empathy || 0,
      final_score_rights: finalScores.rights || 0,
      final_score_participation: finalScores.participation || 0,
      final_score_courage: finalScores.courage || 0,
      completed_scenarios: completedScenarios,
      total_time_seconds: totalTime,
    });
    this._flush(); // Sofort senden bei Spielende
  }

  /** Fehler tracken */
  trackError(errorType, message) {
    this._track('error', { error_type: errorType, message });
  }

  /** Multiplayer-Event tracken */
  trackMultiplayerEvent(eventType, playerCount) {
    this._track('multiplayer', { event_type: eventType, player_count: playerCount });
  }

  /** Lehrer-Dashboard-Nutzung tracken */
  trackTeacherAction(action, classSize) {
    this._track('teacher_action', { action, class_size: classSize });
  }

  // ── Aggregierte Auswertung ─────────────────────────────────────────────────

  /** Lokale Session-Statistiken abrufen */
  getSessionStats() {
    const decisions = this.buffer.filter(e => e.event === 'decision_made');
    if (decisions.length === 0) return null;

    const avgScores = decisions.reduce(
      (acc, e) => {
        acc.empathy += e.data.score_empathy;
        acc.rights += e.data.score_rights;
        acc.participation += e.data.score_participation;
        acc.courage += e.data.score_courage;
        return acc;
      },
      { empathy: 0, rights: 0, participation: 0, courage: 0 }
    );

    const count = decisions.length;
    return {
      session_id: this.sessionId,
      decisions_made: count,
      avg_empathy: (avgScores.empathy / count).toFixed(1),
      avg_rights: (avgScores.rights / count).toFixed(1),
      avg_participation: (avgScores.participation / count).toFixed(1),
      avg_courage: (avgScores.courage / count).toFixed(1),
      session_duration_seconds: this._getElapsedSeconds(),
    };
  }

  /** Stärken-Schwächen-Profil berechnen */
  getPlayerProfile(scores) {
    const values = [
      { key: 'empathy', label: 'Empathie', value: scores.empathy || 0 },
      { key: 'rights', label: 'Rechtsbewusstsein', value: scores.rights || 0 },
      { key: 'participation', label: 'Partizipation', value: scores.participation || 0 },
      { key: 'courage', label: 'Zivilcourage', value: scores.courage || 0 },
    ];

    const sorted = [...values].sort((a, b) => b.value - a.value);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    const profiles = {
      empathy: { title: 'Die Brückenbauerin', desc: 'Du verstehst die Perspektiven anderer und findest verbindende Lösungen.' },
      rights: { title: 'Die Rechtshüterin', desc: 'Du kennst deine Rechte und die anderer und setzt sie ein.' },
      participation: { title: 'Die Demokratin', desc: 'Du glaubst an die Kraft der Beteiligung und motivierst andere.' },
      courage: { title: 'Die Mutmacherin', desc: 'Du trittst auch dann ein, wenn es unbequem ist.' },
    };

    return {
      values,
      strongest,
      weakest,
      profile: profiles[strongest.key] || profiles.empathy,
      recommendation: `Stärke dein ${weakest.label}-Profil, indem du Szenarien aus dem Bereich "${weakest.label}" nochmals spielst.`,
    };
  }

  // ── Private Methods ────────────────────────────────────────────────────────

  _track(event, data = {}) {
    if (!this.enabled) return;

    const entry = {
      event,
      data,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      level_context: window.currentLevel || null,
    };

    this.buffer.push(entry);
    this._log(`Event tracked: ${event}`, data);

    // Sofort senden bei kritischen Events
    if (['game_end', 'error'].includes(event)) {
      this._flush();
    }
  }

  async _flush() {
    if (this.buffer.length === 0) return;

    const events = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true,
      });
      this._log(`Flushed ${events.length} events`);
    } catch (err) {
      // Bei Fehler: Events zurück in Buffer
      this.buffer = [...events, ...this.buffer];
      this._log('Flush failed, events re-queued', err);
    }
  }

  _startFlushTimer() {
    this._flushTimer = setInterval(() => this._flush(), this.flushInterval);
    // Auch beim Verlassen der Seite senden
    window.addEventListener('beforeunload', () => this._flush());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this._flush();
    });
  }

  _trackPageLoad() {
    this._track('page_load', {
      referrer: document.referrer ? 'external' : 'direct',
      language: navigator.language,
    });
  }

  _generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _getElapsedSeconds() {
    return Math.round((Date.now() - this._startTime) / 1000);
  }

  _getUserAgentClass() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  _log(message, data = {}) {
    if (this.debug) {
      console.log(`[GameAnalytics] ${message}`, data);
    }
  }

  destroy() {
    if (this._flushTimer) clearInterval(this._flushTimer);
    this._flush();
  }
}

// ── Globale Instanz ────────────────────────────────────────────────────────────

window.gameAnalytics = new GameAnalytics({
  endpoint: '/api/game/analytics',
  debug: window.location.hostname === 'localhost',
  enabled: true,
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameAnalytics };
}
