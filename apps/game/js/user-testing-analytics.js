/**
 * Democracy Metaverse - User Testing Analytics System
 * DSGVO-konforme Datenerfassung für Schulklassen und NGO-Workshops
 *
 * Features:
 * - Anonyme Spieler-Analytics ohne personenbezogene Daten
 * - Level-Performance-Tracking für pädagogische Insights
 * - A/B-Testing Framework für verschiedene Level-Varianten
 * - Real-time Dashboard für Lehrkräfte
 * - Export-Funktionen für wissenschaftliche Auswertung
 */

class UserTestingAnalytics {
  constructor(config = {}) {
    this.config = {
      endpoint: config.endpoint || '/api/analytics',
      anonymousMode: config.anonymousMode !== false, // Default: true
      batchSize: config.batchSize || 50,
      flushInterval: config.flushInterval || 30000, // 30 seconds
      retention: config.retention || 90, // 90 days
      schoolMode: config.schoolMode || false,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.events = [];
    this.startTime = Date.now();
    this.lastActivity = Date.now();
    this.testGroup = this.assignTestGroup();

    // Initialize privacy-first tracking
    this.initializePrivacySettings();
    this.startSession();
  }

  /**
   * DSGVO-konforme Session-Initialisierung
   */
  initializePrivacySettings() {
    // Keine Cookies, nur sessionStorage für temporäre Daten
    this.consentGiven = this.checkConsent();
    this.anonymousId = this.getOrCreateAnonymousId();

    // Entferne IP-Adressen und andere identifizierende Daten
    this.privacyFilters = [
      'ip_address',
      'user_agent_full',
      'exact_timestamp',
      'browser_fingerprint',
    ];
  }

  /**
   * Consent-Management für Schulen
   */
  checkConsent() {
    if (this.config.schoolMode) {
      // Schulen: Opt-out per Lehrkraft-Einstellung
      return localStorage.getItem('school_analytics_consent') !== 'false';
    } else {
      // Öffentlich: Explizites Opt-in erforderlich
      return localStorage.getItem('analytics_consent') === 'true';
    }
  }

  /**
   * Anonyme Session-ID generierung
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `session_${timestamp}_${random}`;
  }

  /**
   * A/B Test-Gruppe zuweisen
   */
  assignTestGroup() {
    const groups = ['control', 'variant_a', 'variant_b'];
    const hash = this.simpleHash(this.sessionId);
    return groups[hash % groups.length];
  }

  /**
   * Level-Start Tracking
   */
  trackLevelStart(levelData) {
    if (!this.consentGiven) return;

    const event = {
      type: 'level_start',
      timestamp: Date.now(),
      session_id: this.sessionId,
      test_group: this.testGroup,
      level_id: levelData.id,
      level_type: levelData.type,
      chapter: levelData.chapter,
      player_state: this.sanitizePlayerState(levelData.playerState),
      attempt_number: this.getLevelAttempts(levelData.id) + 1,
    };

    this.addEvent(event);
  }

  /**
   * Level-Completion Tracking
   */
  trackLevelComplete(levelData, performance) {
    if (!this.consentGiven) return;

    const event = {
      type: 'level_complete',
      timestamp: Date.now(),
      session_id: this.sessionId,
      test_group: this.testGroup,
      level_id: levelData.id,
      level_type: levelData.type,
      chapter: levelData.chapter,
      completion_time: performance.completionTime,
      choices_made: performance.choices.map(choice => ({
        choice_id: choice.id,
        choice_type: choice.type,
        values_impact: choice.values,
        time_to_decide: choice.decisionTime,
      })),
      values_gained: performance.valuesGained,
      final_score: performance.score,
      mini_games_played: performance.miniGamesPlayed || [],
      help_used: performance.helpUsed || false,
      retries: performance.retries || 0,
    };

    this.addEvent(event);
  }

  /**
   * Entscheidungs-Pattern Tracking
   */
  trackDecisionPattern(choiceData) {
    if (!this.consentGiven) return;

    const event = {
      type: 'decision_pattern',
      timestamp: Date.now(),
      session_id: this.sessionId,
      test_group: this.testGroup,
      level_id: choiceData.levelId,
      choice_category: choiceData.category, // empathy, rights, participation, courage
      decision_time: choiceData.decisionTime,
      hesitation_indicators: {
        mouse_movements: choiceData.mouseMovements > 10,
        option_hover_time: choiceData.optionHoverTime,
        back_and_forth: choiceData.backAndForth > 2,
      },
      context_factors: {
        time_of_day: this.getTimeCategory(),
        session_duration: Date.now() - this.startTime,
        recent_performance: this.getRecentPerformance(),
      },
    };

    this.addEvent(event);
  }

  /**
   * Learning Progress Tracking
   */
  trackLearningProgress(progressData) {
    if (!this.consentGiven) return;

    const event = {
      type: 'learning_progress',
      timestamp: Date.now(),
      session_id: this.sessionId,
      test_group: this.testGroup,
      levels_completed: progressData.levelsCompleted,
      total_play_time: progressData.totalPlayTime,
      skill_development: {
        empathy_trend: this.calculateTrend('empathy'),
        participation_trend: this.calculateTrend('participation'),
        rights_trend: this.calculateTrend('rights'),
        courage_trend: this.calculateTrend('courage'),
      },
      learning_velocity: this.calculateLearningVelocity(),
      stuck_indicators: this.identifyStuckPatterns(),
      engagement_score: this.calculateEngagementScore(),
    };

    this.addEvent(event);
  }

  /**
   * Fehler und Probleme Tracking
   */
  trackError(errorData) {
    const event = {
      type: 'error_occurred',
      timestamp: Date.now(),
      session_id: this.sessionId,
      error_type: errorData.type,
      error_level: errorData.level,
      error_context: errorData.context,
      user_action_sequence: errorData.lastActions,
      browser_info: this.getBrowserInfo(),
      resolution_attempt: errorData.resolutionAttempt || null,
    };

    this.addEvent(event);
    // Fehler sofort senden für schnelle Reaktion
    this.flush();
  }

  /**
   * Mini-Game Performance Tracking
   */
  trackMiniGamePerformance(gameData) {
    if (!this.consentGiven) return;

    const event = {
      type: 'minigame_performance',
      timestamp: Date.now(),
      session_id: this.sessionId,
      test_group: this.testGroup,
      game_type: gameData.type,
      level_context: gameData.levelId,
      performance: {
        completion_time: gameData.completionTime,
        score: gameData.score,
        attempts: gameData.attempts,
        help_used: gameData.helpUsed,
        quit_early: gameData.quitEarly,
      },
      interaction_patterns: {
        clicks_per_minute: gameData.clicksPerMinute,
        accuracy: gameData.accuracy,
        strategy_indicators: gameData.strategyIndicators,
      },
    };

    this.addEvent(event);
  }

  /**
   * Social Learning Tracking (für Multiplayer-Modi)
   */
  trackSocialInteraction(interactionData) {
    if (!this.consentGiven) return;

    const event = {
      type: 'social_interaction',
      timestamp: Date.now(),
      session_id: this.sessionId,
      interaction_type: interactionData.type, // 'cooperation', 'discussion', 'peer_help'
      participants_count: interactionData.participantsCount,
      interaction_duration: interactionData.duration,
      outcome_quality: interactionData.outcomeQuality,
      communication_patterns: {
        messages_sent: interactionData.messagesSent,
        help_requests: interactionData.helpRequests,
        consensus_reached: interactionData.consensusReached,
      },
      learning_boost: interactionData.learningBoost || false,
    };

    this.addEvent(event);
  }

  /**
   * Engagement und Motivation Tracking
   */
  trackEngagement() {
    if (!this.consentGiven) return;

    const now = Date.now();
    const sessionDuration = now - this.startTime;
    const timeSinceLastActivity = now - this.lastActivity;

    const event = {
      type: 'engagement_snapshot',
      timestamp: now,
      session_id: this.sessionId,
      session_duration: sessionDuration,
      activity_indicators: {
        time_since_last_action: timeSinceLastActivity,
        actions_per_minute: this.calculateActionsPerMinute(),
        focus_changes: this.getFocusChanges(),
        pause_frequency: this.getPauseFrequency(),
      },
      motivation_indicators: {
        voluntary_replays: this.getVoluntaryReplays(),
        exploration_behavior: this.getExplorationBehavior(),
        help_seeking_pattern: this.getHelpSeekingPattern(),
      },
    };

    this.addEvent(event);
    this.lastActivity = now;
  }

  /**
   * Event-Sammlung und Batch-Verarbeitung
   */
  addEvent(event) {
    // Privatsphäre-Filter anwenden
    const sanitizedEvent = this.applyPrivacyFilters(event);

    this.events.push(sanitizedEvent);

    // Batch senden wenn Limit erreicht
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Events an Server senden
   */
  async flush() {
    if (this.events.length === 0) return;

    try {
      const payload = {
        events: this.events,
        metadata: {
          version: '1.0.0',
          client: 'democracy-metaverse',
          privacy_compliant: true,
          test_environment: this.config.schoolMode,
        },
      };

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        this.events = []; // Clear events after successful send
      } else {
        console.warn('Analytics upload failed:', response.status);
      }
    } catch (error) {
      console.warn('Analytics network error:', error);
      // Events bleiben in Queue für späteren Retry
    }
  }

  /**
   * Session beenden
   */
  endSession() {
    const event = {
      type: 'session_end',
      timestamp: Date.now(),
      session_id: this.sessionId,
      total_duration: Date.now() - this.startTime,
      levels_completed: this.getLevelsCompletedInSession(),
      final_values: this.getCurrentPlayerValues(),
      engagement_summary: this.getEngagementSummary(),
    };

    this.addEvent(event);
    this.flush();
  }

  /**
   * Hilfsmethoden
   */
  sanitizePlayerState(playerState) {
    return {
      level: playerState.currentLevel,
      chapter: playerState.currentChapter,
      values: playerState.values,
      // Keine persönlichen Daten oder IDs
    };
  }

  applyPrivacyFilters(event) {
    const filtered = { ...event };

    // Entferne oder anonymisiere identifizierende Daten
    this.privacyFilters.forEach(filter => {
      if (filtered[filter]) {
        delete filtered[filter];
      }
    });

    // Timestamp zu Zeitkategorie abstrahieren
    if (filtered.timestamp) {
      filtered.time_category = this.getTimeCategory(filtered.timestamp);
      delete filtered.timestamp;
    }

    return filtered;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  getTimeCategory(timestamp = Date.now()) {
    const hour = new Date(timestamp).getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  calculateTrend(_valueType) {
    // Implementation für Trend-Berechnung
    return 'increasing'; // Placeholder
  }

  calculateLearningVelocity() {
    // Implementation für Learning-Velocity
    return 1.2; // Placeholder
  }

  identifyStuckPatterns() {
    // Implementation für Stuck-Pattern-Erkennung
    return []; // Placeholder
  }

  calculateEngagementScore() {
    // Implementation für Engagement-Score
    return 0.85; // Placeholder
  }

  getBrowserInfo() {
    return {
      platform: navigator.platform,
      language: navigator.language,
      screen_resolution: `${screen.width}x${screen.height}`,
      // Keine detaillierten Browser-Fingerprints
    };
  }

  getOrCreateAnonymousId() {
    let id = sessionStorage.getItem('anonymous_id');
    if (!id) {
      id = 'anon_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('anonymous_id', id);
    }
    return id;
  }

  startSession() {
    const event = {
      type: 'session_start',
      timestamp: Date.now(),
      session_id: this.sessionId,
      test_group: this.testGroup,
      user_agent_category: this.getBrowserCategory(),
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      initial_referrer: document.referrer ? 'external' : 'direct',
    };

    this.addEvent(event);

    // Periodisches Engagement-Tracking
    this.engagementInterval = setInterval(() => {
      this.trackEngagement();
    }, this.config.flushInterval);

    // Auto-flush Interval
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  getBrowserCategory() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'chrome';
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Safari')) return 'safari';
    if (ua.includes('Edge')) return 'edge';
    return 'other';
  }

  // Placeholder-Implementationen für komplexe Metriken
  getLevelAttempts(_levelId) {
    return 0;
  }
  getRecentPerformance() {
    return 'good';
  }
  calculateActionsPerMinute() {
    return 5.2;
  }
  getFocusChanges() {
    return 3;
  }
  getPauseFrequency() {
    return 'low';
  }
  getVoluntaryReplays() {
    return 1;
  }
  getExplorationBehavior() {
    return 'high';
  }
  getHelpSeekingPattern() {
    return 'appropriate';
  }
  getLevelsCompletedInSession() {
    return 3;
  }
  getCurrentPlayerValues() {
    return { empathy: 15, rights: 12, participation: 18, courage: 10 };
  }
  getEngagementSummary() {
    return { overall: 'high', consistency: 'good' };
  }
}

export { UserTestingAnalytics };
