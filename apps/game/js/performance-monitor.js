/**
 * Performance Monitoring System
 * Democracy Metaverse - Production Readiness
 *
 * Comprehensive monitoring for 176+ concurrent users
 * Real-time metrics, error tracking, and performance optimization
 */

class DemocracyPerformanceMonitor {
  constructor() {
    this.metrics = {
      system: new Map(),
      user: new Map(),
      game: new Map(),
      multiplayer: new Map(),
    };

    this.alerts = new Map();
    this.thresholds = {
      pageLoadTime: 3000, // 3 seconds max
      apiResponseTime: 1000, // 1 second max
      errorRate: 0.05, // 5% max error rate
      memoryUsage: 0.8, // 80% max memory
      cpuUsage: 0.7, // 70% max CPU
      networkLatency: 500, // 500ms max latency
      concurrentUsers: 200, // 200 max concurrent users
    };

    this.samplingInterval = 1000; // 1 second
    this.retentionPeriod = 7200000; // 2 hours in milliseconds

    // Performance observer for web vitals
    this.performanceObserver = null;
    this.resourceObserver = null;

    // Error tracking
    this.errorBuffer = [];
    this.errorPatterns = new Map();

    // User experience tracking
    this.sessionData = new Map();
    this.interactionMetrics = new Map();

    // Dashboard update callbacks
    this.dashboardCallbacks = [];

    // Monitoring state
    this.isMonitoring = false;
    this.monitoringStartTime = null;

    console.log('[Monitor] Performance Monitoring System initialized');
  }

  /**
   * Start performance monitoring
   */
  start() {
    if (this.isMonitoring) {
      console.warn('[Monitor] Already monitoring');
      return;
    }

    this.isMonitoring = true;
    this.monitoringStartTime = Date.now();

    // Start system monitoring
    this.startSystemMonitoring();

    // Start user experience monitoring
    this.startUserExperienceMonitoring();

    // Start error tracking
    this.startErrorTracking();

    // Start performance observers
    this.startPerformanceObservers();

    // Start periodic cleanup
    this.startCleanupRoutine();

    console.log('[Monitor] Performance monitoring started');

    // Initial metrics collection
    this.collectInitialMetrics();
  }

  /**
   * Stop performance monitoring
   */
  stop() {
    if (!this.isMonitoring) {
      console.warn('[Monitor] Not currently monitoring');
      return;
    }

    this.isMonitoring = false;

    // Clear intervals
    if (this.systemInterval) clearInterval(this.systemInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);

    // Disconnect observers
    if (this.performanceObserver) this.performanceObserver.disconnect();
    if (this.resourceObserver) this.resourceObserver.disconnect();

    // Remove event listeners
    window.removeEventListener('error', this.errorHandler);
    window.removeEventListener('unhandledrejection', this.rejectionHandler);

    console.log('[Monitor] Performance monitoring stopped');
  }

  /**
   * Start system-level monitoring
   */
  startSystemMonitoring() {
    this.systemInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.checkThresholds();
      this.updateDashboards();
    }, this.samplingInterval);
  }

  /**
   * Collect system performance metrics
   */
  collectSystemMetrics() {
    const now = Date.now();

    // Memory usage
    if (performance.memory) {
      const memoryMetrics = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usage: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit,
        timestamp: now,
      };

      this.recordMetric('system', 'memory', memoryMetrics);
    }

    // Network connection
    if (navigator.connection) {
      const networkMetrics = {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
        timestamp: now,
      };

      this.recordMetric('system', 'network', networkMetrics);
    }

    // Performance timing
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const timingMetrics = {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: this.getFirstPaintTime(),
        firstContentfulPaint: this.getFirstContentfulPaintTime(),
        timestamp: now,
      };

      this.recordMetric('system', 'timing', timingMetrics);
    }

    // Active sessions count
    const activeSessions = this.getActiveSessionsCount();
    this.recordMetric('system', 'sessions', {
      count: activeSessions,
      timestamp: now,
    });
  }

  /**
   * Start user experience monitoring
   */
  startUserExperienceMonitoring() {
    // Track user interactions
    this.trackUserInteractions();

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.recordMetric('user', 'visibility', {
        visible: !document.hidden,
        timestamp: Date.now(),
      });
    });

    // Track window focus/blur
    window.addEventListener('focus', () => {
      this.recordMetric('user', 'focus', { focused: true, timestamp: Date.now() });
    });

    window.addEventListener('blur', () => {
      this.recordMetric('user', 'focus', { focused: false, timestamp: Date.now() });
    });
  }

  /**
   * Track user interactions for engagement metrics
   */
  trackUserInteractions() {
    const interactionTypes = ['click', 'keydown', 'scroll', 'touchstart'];

    interactionTypes.forEach(type => {
      document.addEventListener(type, event => {
        const now = Date.now();
        const sessionId = this.getCurrentSessionId();

        if (!this.interactionMetrics.has(sessionId)) {
          this.interactionMetrics.set(sessionId, {
            interactions: [],
            startTime: now,
            lastActivity: now,
          });
        }

        const session = this.interactionMetrics.get(sessionId);
        session.interactions.push({
          type: type,
          target: event.target.tagName,
          timestamp: now,
        });
        session.lastActivity = now;

        // Calculate engagement metrics
        this.updateEngagementMetrics(sessionId);
      });
    });
  }

  /**
   * Start error tracking
   */
  startErrorTracking() {
    // JavaScript errors
    this.errorHandler = event => {
      this.recordError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null,
        timestamp: Date.now(),
      });
    };

    window.addEventListener('error', this.errorHandler);

    // Promise rejections
    this.rejectionHandler = event => {
      this.recordError({
        type: 'promise',
        message: event.reason ? event.reason.message : 'Unhandled promise rejection',
        stack: event.reason ? event.reason.stack : null,
        timestamp: Date.now(),
      });
    };

    window.addEventListener('unhandledrejection', this.rejectionHandler);

    // Console error override
    const originalError = console.error;
    console.error = (...args) => {
      this.recordError({
        type: 'console',
        message: args.join(' '),
        timestamp: Date.now(),
      });
      originalError.apply(console, args);
    };
  }

  /**
   * Start performance observers
   */
  startPerformanceObservers() {
    // Observe web vitals and performance entries
    if ('PerformanceObserver' in window) {
      // Performance observer for navigation and resource timing
      this.performanceObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.processPerformanceEntry(entry);
        });
      });

      try {
        this.performanceObserver.observe({
          entryTypes: ['navigation', 'resource', 'measure', 'mark'],
        });
      } catch (error) {
        console.warn('[Monitor] Performance observer not supported:', error);
      }

      // Long task observer
      try {
        const longTaskObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.duration > 50) {
              // Tasks longer than 50ms
              this.recordMetric('system', 'longTask', {
                duration: entry.duration,
                startTime: entry.startTime,
                timestamp: Date.now(),
              });
            }
          });
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('[Monitor] Long task observer not supported:', error);
      }
    }
  }

  /**
   * Process performance entry
   */
  processPerformanceEntry(entry) {
    const now = Date.now();

    switch (entry.entryType) {
      case 'navigation':
        this.recordMetric('system', 'navigation', {
          domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          loadComplete: entry.loadEventEnd - entry.loadEventStart,
          dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
          tcpConnect: entry.connectEnd - entry.connectStart,
          serverResponse: entry.responseEnd - entry.requestStart,
          timestamp: now,
        });
        break;

      case 'resource':
        if (entry.duration > 1000) {
          // Resources taking longer than 1 second
          this.recordMetric('system', 'slowResource', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            timestamp: now,
          });
        }
        break;

      case 'measure':
        this.recordMetric('system', 'customMeasure', {
          name: entry.name,
          duration: entry.duration,
          timestamp: now,
        });
        break;
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(category, type, data) {
    if (!this.metrics.has(category)) {
      this.metrics.set(category, new Map());
    }

    const categoryMetrics = this.metrics.get(category);

    if (!categoryMetrics.has(type)) {
      categoryMetrics.set(type, []);
    }

    const typeMetrics = categoryMetrics.get(type);
    typeMetrics.push(data);

    // Limit array size to prevent memory issues
    if (typeMetrics.length > 1000) {
      typeMetrics.shift();
    }

    // Check if this metric triggers any alerts
    this.checkMetricThresholds(category, type, data);
  }

  /**
   * Record an error
   */
  recordError(errorData) {
    this.errorBuffer.push(errorData);

    // Update error patterns
    const pattern = `${errorData.type}:${errorData.message}`;
    const count = this.errorPatterns.get(pattern) || 0;
    this.errorPatterns.set(pattern, count + 1);

    // Limit buffer size
    if (this.errorBuffer.length > 100) {
      this.errorBuffer.shift();
    }

    // Check error rate threshold
    this.checkErrorRateThreshold();

    // Emit alert for critical errors
    if (this.isCriticalError(errorData)) {
      this.emitAlert('critical_error', {
        error: errorData,
        timestamp: Date.now(),
      });
    }

    console.warn('[Monitor] Error recorded:', errorData);
  }

  /**
   * Check metric thresholds
   */
  checkMetricThresholds(category, type, data) {
    // Memory usage threshold
    if (category === 'system' && type === 'memory' && data.usage > this.thresholds.memoryUsage) {
      this.emitAlert('memory_threshold', {
        current: data.usage,
        threshold: this.thresholds.memoryUsage,
        timestamp: data.timestamp,
      });
    }

    // Network latency threshold
    if (category === 'system' && type === 'network' && data.rtt > this.thresholds.networkLatency) {
      this.emitAlert('latency_threshold', {
        current: data.rtt,
        threshold: this.thresholds.networkLatency,
        timestamp: data.timestamp,
      });
    }

    // Session count threshold
    if (
      category === 'system' &&
      type === 'sessions' &&
      data.count > this.thresholds.concurrentUsers
    ) {
      this.emitAlert('concurrent_users_threshold', {
        current: data.count,
        threshold: this.thresholds.concurrentUsers,
        timestamp: data.timestamp,
      });
    }
  }

  /**
   * Check all thresholds periodically
   */
  checkThresholds() {
    // Check overall error rate
    this.checkErrorRateThreshold();

    // Check performance degradation
    this.checkPerformanceDegradation();

    // Check resource usage trends
    this.checkResourceUsageTrends();
  }

  /**
   * Check error rate threshold
   */
  checkErrorRateThreshold() {
    const now = Date.now();
    const recentErrors = this.errorBuffer.filter(
      error => now - error.timestamp < 60000 // Last minute
    );

    const activeUsers = this.getActiveSessionsCount();
    if (activeUsers > 0) {
      const errorRate = recentErrors.length / activeUsers;

      if (errorRate > this.thresholds.errorRate) {
        this.emitAlert('error_rate_threshold', {
          current: errorRate,
          threshold: this.thresholds.errorRate,
          errorCount: recentErrors.length,
          activeUsers: activeUsers,
          timestamp: now,
        });
      }
    }
  }

  /**
   * Emit an alert
   */
  emitAlert(type, data) {
    const alertId = `${type}_${Date.now()}`;
    const alert = {
      id: alertId,
      type: type,
      data: data,
      timestamp: Date.now(),
      severity: this.getAlertSeverity(type),
      acknowledged: false,
    };

    this.alerts.set(alertId, alert);

    // Notify dashboards
    this.notifyDashboards('alert', alert);

    // Log alert
    console.warn(`[Monitor] ALERT [${alert.severity}]: ${type}`, data);

    // Trigger alert handlers
    this.handleAlert(alert);
  }

  /**
   * Get alert severity level
   */
  getAlertSeverity(type) {
    const severityMap = {
      memory_threshold: 'warning',
      latency_threshold: 'warning',
      concurrent_users_threshold: 'info',
      error_rate_threshold: 'critical',
      critical_error: 'critical',
      performance_degradation: 'warning',
    };

    return severityMap[type] || 'info';
  }

  /**
   * Handle alert based on type and severity
   */
  handleAlert(alert) {
    switch (alert.severity) {
      case 'critical':
        // Critical alerts might need immediate action
        this.handleCriticalAlert(alert);
        break;

      case 'warning':
        // Warning alerts for monitoring
        this.handleWarningAlert(alert);
        break;

      case 'info':
        // Informational alerts
        this.handleInfoAlert(alert);
        break;
    }
  }

  /**
   * Handle critical alerts
   */
  handleCriticalAlert(alert) {
    // For critical alerts, we might want to:
    // 1. Send immediate notifications
    // 2. Initiate automatic recovery procedures
    // 3. Log to external monitoring systems

    console.error('[Monitor] CRITICAL ALERT:', alert);

    // Example: Automatic garbage collection attempt for memory issues
    if (alert.type === 'memory_threshold') {
      this.triggerGarbageCollection();
    }

    // Example: Reconnection attempt for network issues
    if (alert.type === 'error_rate_threshold') {
      this.triggerConnectionRecovery();
    }
  }

  /**
   * Update engagement metrics for a session
   */
  updateEngagementMetrics(sessionId) {
    const session = this.interactionMetrics.get(sessionId);
    if (!session) return;

    const now = Date.now();
    const sessionDuration = now - session.startTime;
    const timeSinceLastActivity = now - session.lastActivity;

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(session, sessionDuration);

    this.recordMetric('user', 'engagement', {
      sessionId: sessionId,
      score: engagementScore,
      interactionCount: session.interactions.length,
      sessionDuration: sessionDuration,
      timeSinceLastActivity: timeSinceLastActivity,
      timestamp: now,
    });
  }

  /**
   * Calculate engagement score
   */
  calculateEngagementScore(session, duration) {
    if (duration === 0) return 0;

    const interactionsPerMinute = (session.interactions.length / duration) * 60000;
    const varietyScore = new Set(session.interactions.map(i => i.type)).size / 4; // Max 4 interaction types

    // Normalize scores
    const activityScore = Math.min(interactionsPerMinute / 10, 1); // Max 10 interactions per minute = 1.0
    const engagementScore = activityScore * 0.7 + varietyScore * 0.3;

    return Math.round(engagementScore * 100) / 100;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const now = Date.now();
    const summary = {
      timestamp: now,
      uptime: now - this.monitoringStartTime,
      system: this.getSystemSummary(),
      user: this.getUserSummary(),
      errors: this.getErrorSummary(),
      alerts: this.getActivealerts(),
    };

    return summary;
  }

  /**
   * Get system metrics summary
   */
  getSystemSummary() {
    const systemMetrics = this.metrics.get('system') || new Map();

    // Latest memory usage
    const memoryMetrics = systemMetrics.get('memory') || [];
    const latestMemory = memoryMetrics[memoryMetrics.length - 1];

    // Latest network metrics
    const networkMetrics = systemMetrics.get('network') || [];
    const latestNetwork = networkMetrics[networkMetrics.length - 1];

    // Latest session count
    const sessionMetrics = systemMetrics.get('sessions') || [];
    const latestSessions = sessionMetrics[sessionMetrics.length - 1];

    return {
      memory: {
        usage: latestMemory ? latestMemory.usage : null,
        used: latestMemory ? latestMemory.used : null,
        total: latestMemory ? latestMemory.total : null,
      },
      network: {
        effectiveType: latestNetwork ? latestNetwork.effectiveType : null,
        rtt: latestNetwork ? latestNetwork.rtt : null,
        downlink: latestNetwork ? latestNetwork.downlink : null,
      },
      sessions: {
        active: latestSessions ? latestSessions.count : 0,
      },
    };
  }

  /**
   * Get user metrics summary
   */
  getUserSummary() {
    const userMetrics = this.metrics.get('user') || new Map();
    const engagementMetrics = userMetrics.get('engagement') || [];

    if (engagementMetrics.length === 0) {
      return { averageEngagement: 0, activeUsers: 0 };
    }

    // Calculate average engagement over last 5 minutes
    const fiveMinutesAgo = Date.now() - 300000;
    const recentEngagement = engagementMetrics.filter(metric => metric.timestamp > fiveMinutesAgo);

    const averageEngagement =
      recentEngagement.length > 0
        ? recentEngagement.reduce((sum, metric) => sum + metric.score, 0) / recentEngagement.length
        : 0;

    const activeUsers = new Set(recentEngagement.map(metric => metric.sessionId)).size;

    return {
      averageEngagement: Math.round(averageEngagement * 100) / 100,
      activeUsers: activeUsers,
    };
  }

  /**
   * Get error summary
   */
  getErrorSummary() {
    const now = Date.now();
    const recentErrors = this.errorBuffer.filter(
      error => now - error.timestamp < 300000 // Last 5 minutes
    );

    const errorsByType = {};
    recentErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
    });

    const totalErrors = recentErrors.length;
    const errorRate = totalErrors > 0 ? totalErrors / this.getActiveSessionsCount() : 0;

    return {
      total: totalErrors,
      rate: errorRate,
      byType: errorsByType,
      patterns: Object.fromEntries(this.errorPatterns),
    };
  }

  /**
   * Get active alerts
   */
  getActivealerts() {
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => b.timestamp - a.timestamp);

    return {
      count: activeAlerts.length,
      critical: activeAlerts.filter(a => a.severity === 'critical').length,
      warning: activeAlerts.filter(a => a.severity === 'warning').length,
      info: activeAlerts.filter(a => a.severity === 'info').length,
      recent: activeAlerts.slice(0, 5), // Most recent 5 alerts
    };
  }

  /**
   * Utility functions
   */
  getFirstPaintTime() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  getFirstContentfulPaintTime() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  getCurrentSessionId() {
    // Generate or retrieve current session ID
    if (!this.currentSessionId) {
      this.currentSessionId =
        'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }
    return this.currentSessionId;
  }

  getActiveSessionsCount() {
    // Count unique sessions with recent activity
    const now = Date.now();
    const activeThreshold = 300000; // 5 minutes

    let activeSessions = 0;

    for (const session of this.interactionMetrics.values()) {
      if (now - session.lastActivity < activeThreshold) {
        activeSessions++;
      }
    }

    return Math.max(activeSessions, 1); // At least 1 (current session)
  }

  isCriticalError(errorData) {
    const criticalPatterns = [
      /failed to fetch/i,
      /network error/i,
      /out of memory/i,
      /script error/i,
      /security error/i,
    ];

    return criticalPatterns.some(pattern => pattern.test(errorData.message));
  }

  collectInitialMetrics() {
    // Collect initial metrics immediately
    this.collectSystemMetrics();

    // Record initial page load performance
    if (performance.timing) {
      const timing = performance.timing;
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;

      this.recordMetric('system', 'pageLoad', {
        duration: pageLoadTime,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        timestamp: Date.now(),
      });
    }
  }

  startCleanupRoutine() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000); // Every 5 minutes
  }

  cleanupOldMetrics() {
    const cutoffTime = Date.now() - this.retentionPeriod;

    // Clean up metrics
    for (const [, categoryMetrics] of this.metrics.entries()) {
      for (const [type, typeMetrics] of categoryMetrics.entries()) {
        const filteredMetrics = typeMetrics.filter(metric => metric.timestamp > cutoffTime);
        categoryMetrics.set(type, filteredMetrics);
      }
    }

    // Clean up errors
    this.errorBuffer = this.errorBuffer.filter(error => error.timestamp > cutoffTime);

    // Clean up interaction metrics
    for (const [sessionId, session] of this.interactionMetrics.entries()) {
      if (session.lastActivity < cutoffTime) {
        this.interactionMetrics.delete(sessionId);
      }
    }

    console.log('[Monitor] Cleanup completed');
  }

  /**
   * Dashboard integration
   */
  registerDashboardCallback(callback) {
    this.dashboardCallbacks.push(callback);
  }

  updateDashboards() {
    const summary = this.getPerformanceSummary();
    this.notifyDashboards('update', summary);
  }

  notifyDashboards(type, data) {
    this.dashboardCallbacks.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        console.warn('[Monitor] Dashboard callback error:', error);
      }
    });
  }

  /**
   * Recovery procedures
   */
  triggerGarbageCollection() {
    // Attempt to free memory
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }

    // Clear caches if available
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  }

  triggerConnectionRecovery() {
    // Attempt to recover from connection issues
    // This could involve reconnecting multiplayer sessions,
    // refreshing data connections, etc.
    console.log('[Monitor] Triggering connection recovery procedures');

    // Emit event for other systems to handle
    window.dispatchEvent(
      new CustomEvent('performance-recovery', {
        detail: { type: 'connection' },
      })
    );
  }

  handleWarningAlert(_alert) {
    // Handle warning alerts (less critical)
    console.warn('[Monitor] Warning alert handled');
  }

  handleInfoAlert(_alert) {
    // Handle informational alerts
    console.info('[Monitor] Info alert handled');
  }

  checkPerformanceDegradation() {
    // Check for performance degradation patterns
    // Implementation depends on specific metrics
  }

  checkResourceUsageTrends() {
    // Check for concerning resource usage trends
    // Implementation depends on specific needs
  }

  /**
   * Export data for external analysis
   */
  exportMetrics(timeRange = 3600000) {
    // Default 1 hour
    const now = Date.now();
    const startTime = now - timeRange;

    const exportData = {
      timestamp: now,
      timeRange: timeRange,
      metrics: {},
      errors: this.errorBuffer.filter(error => error.timestamp >= startTime),
      alerts: Array.from(this.alerts.values()).filter(alert => alert.timestamp >= startTime),
    };

    // Export metrics within time range
    for (const [category, categoryMetrics] of this.metrics.entries()) {
      exportData.metrics[category] = {};
      for (const [type, typeMetrics] of categoryMetrics.entries()) {
        exportData.metrics[category][type] = typeMetrics.filter(
          metric => metric.timestamp >= startTime
        );
      }
    }

    return exportData;
  }
}

// Export for global use
window.DemocracyPerformanceMonitor = DemocracyPerformanceMonitor;

console.log('[Monitor] Performance Monitoring System loaded successfully');
