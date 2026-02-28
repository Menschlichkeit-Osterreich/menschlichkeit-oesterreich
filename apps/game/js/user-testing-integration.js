/**
 * User Testing Integration
 * Democracy Metaverse - Production Deployment Integration
 *
 * Integriert alle Testing-Komponenten in das Haupt-Spiel
 * für nahtlose Educational Analytics
 */

class UserTestingIntegration {
  constructor() {
    this.analytics = null;
    this.abTesting = null;
    this.dashboardConnection = null;

    // Integration status
    this.isInitialized = false;
    this.currentExperiment = null;
    this.sessionMetadata = {};

    // Configuration
    this.config = {
      apiEndpoint: '/api/analytics/',
      dashboardEndpoint: '/api/dashboard/',
      experimentEndpoint: '/api/experiments/',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
    };
  }

  /**
   * Initialize User Testing System
   * Called from main game initialization
   */
  async initialize(gameInstance, userType = 'student') {
    try {
      console.log('[UserTesting] Initializing analytics system...');

      // Initialize analytics system
      if (typeof window.UserTestingAnalytics !== 'undefined') {
        this.analytics = new window.UserTestingAnalytics();
        await this.analytics.initialize();
      }

      // Initialize A/B testing
      if (typeof window.ABTestingFramework !== 'undefined') {
        this.abTesting = new window.ABTestingFramework();
        await this.abTesting.initialize();

        // Get experiment assignment
        this.currentExperiment = await this.abTesting.getExperiment('democracy_game_experience');
      }

      // Setup dashboard connection for teachers
      if (userType === 'teacher' && typeof window.TeacherDashboard !== 'undefined') {
        this.dashboardConnection = new window.TeacherDashboard();
        await this.dashboardConnection.initialize();
      }

      // Store session metadata
      this.sessionMetadata = {
        userType: userType,
        startTime: Date.now(),
        experimentVariant: this.currentExperiment?.variant || 'control',
        browserInfo: this.getBrowserInfo(),
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      };

      // Track session start
      await this.trackEvent('session_start', this.sessionMetadata);

      // Setup game event listeners
      this.setupGameEventListeners(gameInstance);

      // Setup periodic data flush
      this.setupDataFlush();

      this.isInitialized = true;
      console.log('[UserTesting] System initialized successfully');

      return {
        success: true,
        experimentVariant: this.currentExperiment?.variant,
        features: this.getEnabledFeatures(),
      };
    } catch (error) {
      console.error('[UserTesting] Initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup Game Event Listeners
   * Integrates analytics with existing game events
   */
  setupGameEventListeners(gameInstance) {
    if (!gameInstance) return;

    // Level progression events
    gameInstance.on('levelStart', data => {
      this.trackEvent('level_start', {
        levelId: data.levelId,
        difficulty: data.difficulty,
        timestamp: Date.now(),
      });
    });

    gameInstance.on('levelComplete', data => {
      this.trackEvent('level_complete', {
        levelId: data.levelId,
        completionTime: data.duration,
        score: data.score,
        choicesMade: data.choices,
        hintsUsed: data.hintsUsed,
        timestamp: Date.now(),
      });
    });

    // Democracy decision events
    gameInstance.on('decisionMade', data => {
      this.trackEvent('democracy_decision', {
        scenarioId: data.scenarioId,
        optionChosen: data.option,
        timeToDecide: data.duration,
        valuesImpact: data.valuesChange,
        timestamp: Date.now(),
      });
    });

    // Mini-game performance
    gameInstance.on('minigameComplete', data => {
      this.trackEvent('minigame_performance', {
        minigameType: data.type,
        score: data.score,
        duration: data.duration,
        accuracy: data.accuracy,
        timestamp: Date.now(),
      });
    });

    // Learning progress milestones
    gameInstance.on('skillUnlocked', data => {
      this.trackEvent('learning_milestone', {
        skillType: data.skillType,
        level: data.level,
        totalPlayTime: Date.now() - this.sessionMetadata.startTime,
        timestamp: Date.now(),
      });
    });

    // Engagement indicators
    gameInstance.on('helpRequested', data => {
      this.trackEvent('help_requested', {
        context: data.context,
        helpType: data.type,
        timestamp: Date.now(),
      });
    });

    // Session events
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', {
        sessionDuration: Date.now() - this.sessionMetadata.startTime,
        timestamp: Date.now(),
      });

      // Force flush remaining data
      if (this.analytics) {
        this.analytics.flush();
      }
    });

    // Engagement tracking
    this.setupEngagementTracking(gameInstance);
  }

  /**
   * Setup Engagement Tracking
   * Monitors user attention and interaction patterns
   */
  setupEngagementTracking(_gameInstance) {
    let lastActivity = Date.now();
    let focusStartTime = Date.now();
    let totalFocusTime = 0;

    // Mouse/keyboard activity
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        lastActivity = Date.now();
      });
    });

    // Focus/blur tracking
    window.addEventListener('focus', () => {
      focusStartTime = Date.now();
    });

    window.addEventListener('blur', () => {
      if (focusStartTime) {
        totalFocusTime += Date.now() - focusStartTime;
      }
    });

    // Periodic engagement snapshot
    setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const isEngaged = timeSinceActivity < 10000; // 10 seconds threshold

      this.trackEvent('engagement_snapshot', {
        isEngaged: isEngaged,
        timeSinceActivity: timeSinceActivity,
        totalFocusTime: totalFocusTime,
        timestamp: now,
      });
    }, 60000); // Every minute
  }

  /**
   * Apply Experiment Features
   * Modifies game based on A/B test assignment
   */
  applyExperimentFeatures(gameInstance) {
    if (!this.currentExperiment) return;

    const variant = this.currentExperiment.variant;

    switch (this.currentExperiment.name) {
      case 'tutorial_intensity':
        this.applyTutorialVariant(gameInstance, variant);
        break;

      case 'values_feedback':
        this.applyValuesFeedbackVariant(gameInstance, variant);
        break;

      case 'difficulty_adaptation':
        this.applyDifficultyVariant(gameInstance, variant);
        break;

      default:
        console.log('[UserTesting] No experiment features to apply');
    }
  }

  /**
   * Apply Tutorial Variants
   */
  applyTutorialVariant(gameInstance, variant) {
    switch (variant) {
      case 'extended_help':
        gameInstance.config.tutorialMode = 'extended';
        gameInstance.config.showDetailedHelp = true;
        break;

      case 'video_tutorials':
        gameInstance.config.tutorialMode = 'video';
        gameInstance.config.enableVideoHelp = true;
        break;

      case 'control':
      default:
        gameInstance.config.tutorialMode = 'standard';
        break;
    }

    this.trackEvent('experiment_feature_applied', {
      experiment: 'tutorial_intensity',
      variant: variant,
      timestamp: Date.now(),
    });
  }

  /**
   * Apply Values Feedback Variants
   */
  applyValuesFeedbackVariant(gameInstance, variant) {
    switch (variant) {
      case 'live_updates':
        gameInstance.config.valuesDisplayMode = 'live';
        gameInstance.config.showImmediateFeedback = true;
        break;

      case 'emotional_npcs':
        gameInstance.config.valuesDisplayMode = 'emotional';
        gameInstance.config.enableEmotionalNPCs = true;
        break;

      case 'control':
      default:
        gameInstance.config.valuesDisplayMode = 'end_level';
        break;
    }

    this.trackEvent('experiment_feature_applied', {
      experiment: 'values_feedback',
      variant: variant,
      timestamp: Date.now(),
    });
  }

  /**
   * Apply Difficulty Variants
   */
  applyDifficultyVariant(gameInstance, variant) {
    switch (variant) {
      case 'adaptive':
        gameInstance.config.difficultyMode = 'adaptive';
        gameInstance.config.enablePerformanceTracking = true;
        break;

      case 'player_choice':
        gameInstance.config.difficultyMode = 'selectable';
        gameInstance.config.showDifficultySelector = true;
        break;

      case 'control':
      default:
        gameInstance.config.difficultyMode = 'fixed';
        break;
    }

    this.trackEvent('experiment_feature_applied', {
      experiment: 'difficulty_adaptation',
      variant: variant,
      timestamp: Date.now(),
    });
  }

  /**
   * Track Custom Event
   */
  async trackEvent(eventType, eventData) {
    if (!this.analytics) return;

    const enrichedData = {
      ...eventData,
      sessionId: this.analytics.sessionId,
      experimentVariant: this.currentExperiment?.variant || 'control',
      userType: this.sessionMetadata.userType,
      timestamp: eventData.timestamp || Date.now(),
    };

    await this.analytics.trackEvent(eventType, enrichedData);
  }

  /**
   * Get Enabled Features based on experiment
   */
  getEnabledFeatures() {
    const features = {
      analytics: !!this.analytics,
      abTesting: !!this.abTesting,
      teacherDashboard: !!this.dashboardConnection,
    };

    if (this.currentExperiment) {
      features.experimentVariant = this.currentExperiment.variant;
      features.experimentName = this.currentExperiment.name;
    }

    return features;
  }

  /**
   * Setup Periodic Data Flush
   */
  setupDataFlush() {
    setInterval(() => {
      if (this.analytics) {
        this.analytics.flush();
      }
    }, this.config.flushInterval);
  }

  /**
   * Get Browser Information
   */
  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
    };
  }

  /**
   * Get Session Statistics
   */
  getSessionStats() {
    if (!this.analytics) return null;

    return {
      sessionId: this.analytics.sessionId,
      startTime: this.sessionMetadata.startTime,
      duration: Date.now() - this.sessionMetadata.startTime,
      eventsTracked: this.analytics.eventQueue.length,
      experimentVariant: this.currentExperiment?.variant,
    };
  }

  /**
   * Force Data Export (for teachers)
   */
  async exportSessionData() {
    if (!this.analytics) return null;

    await this.analytics.flush();

    return {
      sessionMetadata: this.sessionMetadata,
      sessionStats: this.getSessionStats(),
      experimentInfo: this.currentExperiment,
    };
  }

  /**
   * Cleanup on page unload
   */
  cleanup() {
    if (this.analytics) {
      this.analytics.flush();
    }

    if (this.dashboardConnection) {
      this.dashboardConnection.disconnect();
    }
  }
}

/**
 * Game Integration Helper Functions
 * For easy integration with existing game code
 */
window.UserTestingIntegration = UserTestingIntegration;

// Auto-initialize if game instance is available
window.addEventListener('DOMContentLoaded', () => {
  // Check for existing game instance
  if (window.democracyGame) {
    window.userTestingSystem = new UserTestingIntegration();
    window.userTestingSystem.initialize(window.democracyGame);
  }
});

// Integration with Democracy Game Block
if (typeof window.DemocracyGameBlock !== 'undefined') {
  const originalInit = window.DemocracyGameBlock.prototype.initialize;

  window.DemocracyGameBlock.prototype.initialize = function () {
    // Call original initialization
    const result = originalInit.call(this);

    // Initialize user testing
    if (!window.userTestingSystem) {
      window.userTestingSystem = new UserTestingIntegration();
      window.userTestingSystem.initialize(this);

      // Apply experiment features
      window.userTestingSystem.applyExperimentFeatures(this);
    }

    return result;
  };
}

console.log('[UserTesting] Integration module loaded successfully');
