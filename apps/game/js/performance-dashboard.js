/**
 * Performance Dashboard
 * Democracy Metaverse - Real-time Monitoring Interface
 *
 * Visual dashboard for monitoring 176+ concurrent users
 * Live metrics, alerts, and system health visualization
 */

class DemocracyPerformanceDashboard {
  constructor(containerId = 'performance-dashboard') {
    this.containerId = containerId;
    this.container = null;
    this.monitor = null;

    // Chart instances
    this.charts = new Map();

    // Update intervals
    this.updateInterval = null;
    this.fastUpdateInterval = null;

    // Dashboard state
    this.isVisible = false;
    this.autoRefresh = true;
    this.refreshRate = 5000; // 5 seconds

    // Color scheme
    this.colors = {
      primary: '#2196F3',
      success: '#4CAF50',
      warning: '#FF9800',
      danger: '#F44336',
      info: '#17a2b8',
      dark: '#343a40',
      light: '#f8f9fa',
    };

    console.log('[Dashboard] Performance Dashboard initialized');
  }

  /**
   * Initialize dashboard
   */
  initialize(performanceMonitor) {
    this.monitor = performanceMonitor;

    // Create dashboard container if it doesn't exist
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      this.createDashboardContainer();
    }

    // Create dashboard UI
    this.createDashboardUI();

    // Setup event handlers
    this.setupEventHandlers();

    // Register with performance monitor
    this.monitor.registerDashboardCallback((type, data) => {
      this.handleMonitorUpdate(type, data);
    });

    // Start update cycle
    this.startUpdateCycle();

    console.log('[Dashboard] Performance Dashboard ready');
  }

  /**
   * Create dashboard container
   */
  createDashboardContainer() {
    this.container = document.createElement('div');
    this.container.id = this.containerId;
    this.container.className = 'performance-dashboard';

    // Position fixed for overlay
    this.container.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 400px;
            height: 100vh;
            background: white;
            border-left: 2px solid #dee2e6;
            z-index: 9999;
            overflow-y: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
        `;

    document.body.appendChild(this.container);
  }

  /**
   * Create dashboard UI
   */
  createDashboardUI() {
    this.container.innerHTML = `
            <div class="dashboard-header">
                <h3>🔍 Performance Monitor</h3>
                <div class="dashboard-controls">
                    <button id="refresh-toggle" class="dashboard-btn small">
                        <span id="refresh-status">⏸️</span>
                    </button>
                    <button id="export-data" class="dashboard-btn small">📊</button>
                    <button id="close-dashboard" class="dashboard-btn small">✖️</button>
                </div>
            </div>
            
            <!-- System Overview -->
            <div class="dashboard-section">
                <h4>⚡ System Status</h4>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-label">Uptime</div>
                        <div id="system-uptime" class="metric-value">--:--:--</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Active Users</div>
                        <div id="active-users" class="metric-value">0</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Memory Usage</div>
                        <div id="memory-usage" class="metric-value">0%</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Network RTT</div>
                        <div id="network-rtt" class="metric-value">-- ms</div>
                    </div>
                </div>
            </div>
            
            <!-- Performance Charts -->
            <div class="dashboard-section">
                <h4>📈 Performance Trends</h4>
                <div class="chart-container">
                    <canvas id="performance-chart" width="350" height="150"></canvas>
                </div>
            </div>
            
            <!-- User Engagement -->
            <div class="dashboard-section">
                <h4>👥 User Engagement</h4>
                <div class="engagement-overview">
                    <div class="engagement-metric">
                        <div class="engagement-label">Average Engagement</div>
                        <div id="avg-engagement" class="engagement-value">0.0</div>
                        <div class="engagement-bar">
                            <div id="engagement-progress" class="engagement-fill"></div>
                        </div>
                    </div>
                </div>
                <div class="activity-chart">
                    <canvas id="engagement-chart" width="350" height="100"></canvas>
                </div>
            </div>
            
            <!-- Alerts Panel -->
            <div class="dashboard-section">
                <h4>🚨 Active Alerts</h4>
                <div id="alerts-container" class="alerts-container">
                    <div class="no-alerts">✅ No active alerts</div>
                </div>
            </div>
            
            <!-- Error Tracking -->
            <div class="dashboard-section">
                <h4>⚠️ Error Monitor</h4>
                <div class="error-overview">
                    <div class="error-stats">
                        <div class="error-stat">
                            <span class="error-count" id="error-count">0</span>
                            <span class="error-label">Recent Errors</span>
                        </div>
                        <div class="error-stat">
                            <span class="error-rate" id="error-rate">0%</span>
                            <span class="error-label">Error Rate</span>
                        </div>
                    </div>
                </div>
                <div id="error-log" class="error-log">
                    <!-- Recent errors will be listed here -->
                </div>
            </div>
            
            <!-- Multiplayer Status -->
            <div class="dashboard-section">
                <h4>🎮 Multiplayer Status</h4>
                <div id="multiplayer-status" class="multiplayer-overview">
                    <div class="multiplayer-metric">
                        <div class="metric-label">Active Sessions</div>
                        <div id="mp-sessions" class="metric-value">0</div>
                    </div>
                    <div class="multiplayer-metric">
                        <div class="metric-label">Avg Latency</div>
                        <div id="mp-latency" class="metric-value">-- ms</div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="dashboard-section">
                <h4>⚡ Quick Actions</h4>
                <div class="action-buttons">
                    <button id="trigger-gc" class="action-btn">🗑️ Force GC</button>
                    <button id="clear-cache" class="action-btn">🧹 Clear Cache</button>
                    <button id="reset-metrics" class="action-btn">🔄 Reset Metrics</button>
                </div>
            </div>
        `;

    this.addDashboardStyles();
    this.initializeCharts();
  }

  /**
   * Add dashboard CSS styles
   */
  addDashboardStyles() {
    const style = document.createElement('style');
    style.textContent = `
            .performance-dashboard {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 12px;
                line-height: 1.4;
            }
            
            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: #f8f9fa;
                border-bottom: 1px solid #dee2e6;
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            .dashboard-header h3 {
                margin: 0;
                font-size: 14px;
                color: #495057;
            }
            
            .dashboard-controls {
                display: flex;
                gap: 4px;
            }
            
            .dashboard-btn {
                padding: 4px 8px;
                border: 1px solid #ced4da;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }
            
            .dashboard-btn:hover {
                background: #e9ecef;
            }
            
            .dashboard-btn.small {
                padding: 4px 6px;
                font-size: 10px;
            }
            
            .dashboard-section {
                padding: 16px;
                border-bottom: 1px solid #f1f3f4;
            }
            
            .dashboard-section h4 {
                margin: 0 0 12px 0;
                font-size: 13px;
                color: #495057;
                font-weight: 600;
            }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
            
            .metric-card {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 8px;
                text-align: center;
            }
            
            .metric-label {
                font-size: 10px;
                color: #6c757d;
                margin-bottom: 4px;
            }
            
            .metric-value {
                font-size: 14px;
                font-weight: bold;
                color: #495057;
            }
            
            .metric-value.warning {
                color: #fd7e14;
            }
            
            .metric-value.danger {
                color: #dc3545;
            }
            
            .metric-value.success {
                color: #198754;
            }
            
            .chart-container {
                background: #fafafa;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 8px;
            }
            
            .engagement-overview {
                margin-bottom: 12px;
            }
            
            .engagement-metric {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 12px;
            }
            
            .engagement-label {
                font-size: 11px;
                color: #6c757d;
                margin-bottom: 4px;
            }
            
            .engagement-value {
                font-size: 18px;
                font-weight: bold;
                color: #495057;
                margin-bottom: 8px;
            }
            
            .engagement-bar {
                height: 6px;
                background: #e9ecef;
                border-radius: 3px;
                overflow: hidden;
            }
            
            .engagement-fill {
                height: 100%;
                background: linear-gradient(90deg, #28a745, #20c997);
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .activity-chart {
                margin-top: 8px;
                background: #fafafa;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 8px;
            }
            
            .alerts-container {
                max-height: 150px;
                overflow-y: auto;
            }
            
            .no-alerts {
                text-align: center;
                color: #28a745;
                font-style: italic;
                padding: 20px;
            }
            
            .alert-item {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 4px;
                padding: 8px;
                margin-bottom: 4px;
                border-left: 4px solid #ffc107;
            }
            
            .alert-item.critical {
                background: #f8d7da;
                border-color: #f5c6cb;
                border-left-color: #dc3545;
            }
            
            .alert-item.warning {
                background: #fff3cd;
                border-color: #ffeaa7;
                border-left-color: #ffc107;
            }
            
            .alert-type {
                font-weight: bold;
                font-size: 11px;
                text-transform: uppercase;
            }
            
            .alert-message {
                font-size: 11px;
                margin-top: 2px;
                color: #495057;
            }
            
            .error-overview {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 12px;
            }
            
            .error-stats {
                display: flex;
                justify-content: space-between;
            }
            
            .error-stat {
                text-align: center;
            }
            
            .error-count, .error-rate {
                display: block;
                font-size: 16px;
                font-weight: bold;
                color: #dc3545;
            }
            
            .error-label {
                display: block;
                font-size: 10px;
                color: #6c757d;
                margin-top: 2px;
            }
            
            .error-log {
                max-height: 100px;
                overflow-y: auto;
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 8px;
            }
            
            .error-entry {
                font-size: 10px;
                color: #dc3545;
                margin-bottom: 4px;
                padding: 2px 4px;
                background: rgba(220, 53, 69, 0.1);
                border-radius: 2px;
            }
            
            .multiplayer-overview {
                display: flex;
                justify-content: space-between;
            }
            
            .multiplayer-metric {
                text-align: center;
                flex: 1;
            }
            
            .action-buttons {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .action-btn {
                padding: 8px 12px;
                border: 1px solid #007bff;
                background: #007bff;
                color: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
                flex: 1;
                min-width: 80px;
                transition: all 0.2s ease;
            }
            
            .action-btn:hover {
                background: #0056b3;
                border-color: #0056b3;
            }
            
            .action-btn:active {
                transform: translateY(1px);
            }
        `;
    document.head.appendChild(style);
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Refresh toggle
    document.getElementById('refresh-toggle').addEventListener('click', () => {
      this.toggleAutoRefresh();
    });

    // Close dashboard
    document.getElementById('close-dashboard').addEventListener('click', () => {
      this.hide();
    });

    // Export data
    document.getElementById('export-data').addEventListener('click', () => {
      this.exportData();
    });

    // Quick actions
    document.getElementById('trigger-gc').addEventListener('click', () => {
      this.triggerGarbageCollection();
    });

    document.getElementById('clear-cache').addEventListener('click', () => {
      this.clearCache();
    });

    document.getElementById('reset-metrics').addEventListener('click', () => {
      this.resetMetrics();
    });
  }

  /**
   * Initialize charts
   */
  initializeCharts() {
    // Performance trend chart (simple canvas-based)
    this.performanceChart = new SimpleLineChart('performance-chart', {
      width: 350,
      height: 150,
      maxPoints: 50,
      lineColor: this.colors.primary,
      backgroundColor: '#fafafa',
    });

    // Engagement chart
    this.engagementChart = new SimpleLineChart('engagement-chart', {
      width: 350,
      height: 100,
      maxPoints: 30,
      lineColor: this.colors.success,
      backgroundColor: '#fafafa',
    });
  }

  /**
   * Handle updates from performance monitor
   */
  handleMonitorUpdate(type, data) {
    switch (type) {
      case 'update':
        this.updateMetrics(data);
        break;
      case 'alert':
        this.addAlert(data);
        break;
      default:
        console.log('[Dashboard] Unknown update type:', type);
    }
  }

  /**
   * Update dashboard metrics
   */
  updateMetrics(data) {
    if (!this.isVisible) return;

    // System metrics
    this.updateSystemMetrics(data.system);

    // User metrics
    this.updateUserMetrics(data.user);

    // Error metrics
    this.updateErrorMetrics(data.errors);

    // Update charts
    this.updateCharts(data);

    // Update uptime
    this.updateUptime(data.uptime);
  }

  /**
   * Update system metrics display
   */
  updateSystemMetrics(systemData) {
    // Memory usage
    if (systemData.memory && systemData.memory.usage !== null) {
      const memoryElement = document.getElementById('memory-usage');
      const usage = Math.round(systemData.memory.usage * 100);
      memoryElement.textContent = `${usage}%`;

      // Color coding
      if (usage > 80) {
        memoryElement.className = 'metric-value danger';
      } else if (usage > 60) {
        memoryElement.className = 'metric-value warning';
      } else {
        memoryElement.className = 'metric-value success';
      }
    }

    // Network RTT
    if (systemData.network && systemData.network.rtt !== null) {
      const rttElement = document.getElementById('network-rtt');
      rttElement.textContent = `${systemData.network.rtt} ms`;

      if (systemData.network.rtt > 500) {
        rttElement.className = 'metric-value danger';
      } else if (systemData.network.rtt > 200) {
        rttElement.className = 'metric-value warning';
      } else {
        rttElement.className = 'metric-value success';
      }
    }

    // Active users
    if (systemData.sessions) {
      document.getElementById('active-users').textContent = systemData.sessions.active;
    }
  }

  /**
   * Update user engagement metrics
   */
  updateUserMetrics(userData) {
    if (userData.averageEngagement !== undefined) {
      const engagementElement = document.getElementById('avg-engagement');
      const progressElement = document.getElementById('engagement-progress');

      const engagement = userData.averageEngagement;
      engagementElement.textContent = engagement.toFixed(1);
      progressElement.style.width = `${Math.min(engagement * 100, 100)}%`;

      // Update engagement chart
      this.engagementChart.addPoint(engagement);
    }
  }

  /**
   * Update error metrics
   */
  updateErrorMetrics(errorData) {
    // Error count
    document.getElementById('error-count').textContent = errorData.total;

    // Error rate
    const rate = Math.round(errorData.rate * 100);
    document.getElementById('error-rate').textContent = `${rate}%`;

    // Update error log (show recent errors)
    this.updateErrorLog(errorData);
  }

  /**
   * Update error log display
   */
  updateErrorLog(errorData) {
    const errorLog = document.getElementById('error-log');

    // Clear existing entries
    errorLog.innerHTML = '';

    // Add recent error patterns
    const patterns = Object.entries(errorData.patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (patterns.length === 0) {
      errorLog.innerHTML =
        '<div style="text-align: center; color: #28a745; font-style: italic;">No recent errors</div>';
      return;
    }

    patterns.forEach(([pattern, count]) => {
      const entry = document.createElement('div');
      entry.className = 'error-entry';
      entry.textContent = `${pattern} (${count}x)`;
      errorLog.appendChild(entry);
    });
  }

  /**
   * Update charts with performance data
   */
  updateCharts(data) {
    // Update performance chart with memory usage
    if (data.system && data.system.memory && data.system.memory.usage !== null) {
      this.performanceChart.addPoint(data.system.memory.usage);
    }
  }

  /**
   * Update uptime display
   */
  updateUptime(uptime) {
    const hours = Math.floor(uptime / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);

    const uptimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('system-uptime').textContent = uptimeString;
  }

  /**
   * Add alert to dashboard
   */
  addAlert(alert) {
    const alertsContainer = document.getElementById('alerts-container');

    // Remove "no alerts" message
    const noAlerts = alertsContainer.querySelector('.no-alerts');
    if (noAlerts) {
      noAlerts.remove();
    }

    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert-item ${alert.severity}`;
    alertElement.innerHTML = `
            <div class="alert-type">${alert.type}</div>
            <div class="alert-message">${this.formatAlertMessage(alert)}</div>
        `;

    // Add to container (newest first)
    alertsContainer.insertBefore(alertElement, alertsContainer.firstChild);

    // Limit number of visible alerts
    const alerts = alertsContainer.querySelectorAll('.alert-item');
    if (alerts.length > 10) {
      alerts[alerts.length - 1].remove();
    }

    // Auto-remove after 30 seconds for non-critical alerts
    if (alert.severity !== 'critical') {
      setTimeout(() => {
        if (alertElement.parentNode) {
          alertElement.remove();

          // Show "no alerts" if container is empty
          if (alertsContainer.children.length === 0) {
            alertsContainer.innerHTML = '<div class="no-alerts">✅ No active alerts</div>';
          }
        }
      }, 30000);
    }
  }

  /**
   * Format alert message for display
   */
  formatAlertMessage(alert) {
    switch (alert.type) {
      case 'memory_threshold':
        return `Memory usage: ${Math.round(alert.data.current * 100)}% (threshold: ${Math.round(alert.data.threshold * 100)}%)`;
      case 'latency_threshold':
        return `Network latency: ${alert.data.current}ms (threshold: ${alert.data.threshold}ms)`;
      case 'error_rate_threshold':
        return `Error rate: ${Math.round(alert.data.current * 100)}% (${alert.data.errorCount} errors, ${alert.data.activeUsers} users)`;
      case 'concurrent_users_threshold':
        return `Concurrent users: ${alert.data.current} (threshold: ${alert.data.threshold})`;
      default:
        return JSON.stringify(alert.data);
    }
  }

  /**
   * Dashboard visibility controls
   */
  show() {
    if (!this.container) {
      console.warn('[Dashboard] Dashboard not initialized');
      return;
    }

    this.container.style.transform = 'translateX(0)';
    this.isVisible = true;

    // Start update cycle if not already running
    if (!this.updateInterval) {
      this.startUpdateCycle();
    }
  }

  hide() {
    if (!this.container) return;

    this.container.style.transform = 'translateX(100%)';
    this.isVisible = false;

    // Stop update cycle to save resources
    this.stopUpdateCycle();
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Update cycle management
   */
  startUpdateCycle() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      if (this.monitor && this.isVisible) {
        const summary = this.monitor.getPerformanceSummary();
        this.updateMetrics(summary);
      }
    }, this.refreshRate);

    // Fast updates for critical metrics
    this.fastUpdateInterval = setInterval(() => {
      if (this.monitor && this.isVisible) {
        // Update only essential metrics more frequently
        this.updateCriticalMetrics();
      }
    }, 1000);
  }

  stopUpdateCycle() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.fastUpdateInterval) {
      clearInterval(this.fastUpdateInterval);
      this.fastUpdateInterval = null;
    }
  }

  updateCriticalMetrics() {
    // Quick updates for time-sensitive metrics
    if (this.monitor) {
      const uptime = Date.now() - this.monitor.monitoringStartTime;
      this.updateUptime(uptime);
    }
  }

  /**
   * Control functions
   */
  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
    const statusIcon = document.getElementById('refresh-status');

    if (this.autoRefresh) {
      statusIcon.textContent = '⏸️';
      this.startUpdateCycle();
    } else {
      statusIcon.textContent = '▶️';
      this.stopUpdateCycle();
    }
  }

  exportData() {
    if (!this.monitor) {
      alert('Performance monitor not available');
      return;
    }

    const data = this.monitor.exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-data-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('[Dashboard] Performance data exported');
  }

  triggerGarbageCollection() {
    if (this.monitor) {
      this.monitor.triggerGarbageCollection();
    }

    // Visual feedback
    const button = document.getElementById('trigger-gc');
    const originalText = button.textContent;
    button.textContent = '✅ Done';
    button.disabled = true;

    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }

  clearCache() {
    // Clear browser caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    // Clear local storage (careful not to break app)
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('temp_') || key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('[Dashboard] Could not clear localStorage:', e);
    }

    // Visual feedback
    const button = document.getElementById('clear-cache');
    const originalText = button.textContent;
    button.textContent = '✅ Cleared';
    button.disabled = true;

    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }

  resetMetrics() {
    if (confirm('Reset all performance metrics? This action cannot be undone.')) {
      if (this.monitor) {
        // Clear metrics data
        this.monitor.metrics.clear();
        this.monitor.errorBuffer = [];
        this.monitor.alerts.clear();

        // Reset charts
        this.performanceChart.reset();
        this.engagementChart.reset();

        console.log('[Dashboard] Metrics reset');
      }
    }
  }
}

/**
 * Simple Line Chart Implementation
 * Lightweight charting for performance dashboard
 */
class SimpleLineChart {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.data = [];

    this.options = {
      maxPoints: 50,
      lineColor: '#2196F3',
      backgroundColor: '#ffffff',
      gridColor: '#e0e0e0',
      padding: 20,
      ...options,
    };

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.draw();
  }

  addPoint(value) {
    this.data.push(value);

    if (this.data.length > this.options.maxPoints) {
      this.data.shift();
    }

    this.draw();
  }

  draw() {
    const { ctx, width, height, options, data } = this;
    const { padding, backgroundColor, gridColor, lineColor } = options;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    if (data.length === 0) return;

    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;

    // Find min/max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Draw grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (plotHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw data line
    if (data.length > 1) {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((value, index) => {
        const x = padding + (plotWidth / (data.length - 1)) * index;
        const y = height - padding - ((value - min) / range) * plotHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    }
  }

  reset() {
    this.data = [];
    this.draw();
  }
}

// Export for global use
window.DemocracyPerformanceDashboard = DemocracyPerformanceDashboard;
window.SimpleLineChart = SimpleLineChart;

console.log('[Dashboard] Performance Dashboard loaded successfully');
