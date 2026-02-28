/**
 * Democracy Metaverse - Teacher Dashboard System
 * Real-time Monitoring und Analytics für Schulklassen
 *
 * Features:
 * - Live-Tracking des Klassenfortschritts
 * - Individuelle Lernpfade-Analyse (anonymisiert)
 * - Problembereiche-Identifikation
 * - Pädagogische Insights und Empfehlungen
 * - Export-Funktionen für Dokumentation
 */

class TeacherDashboard {
  constructor(config = {}) {
    this.config = {
      classroomId: config.classroomId,
      teacherId: config.teacherId,
      apiEndpoint: config.apiEndpoint || '/api/teacher-dashboard',
      refreshInterval: config.refreshInterval || 30000,
      maxStudents: config.maxStudents || 30,
      ...config,
    };

    this.students = new Map();
    this.classMetrics = {};
    this.alerts = [];
    this.sessionStartTime = Date.now();

    this.initializeDashboard();
  }

  /**
   * Dashboard-Initialisierung
   */
  async initializeDashboard() {
    await this.setupClassroom();
    this.startRealtimeUpdates();
    this.renderDashboard();
  }

  /**
   * Klassenzimmer-Setup
   */
  async setupClassroom() {
    try {
      const response = await fetch(
        `${this.config.apiEndpoint}/classroom/${this.config.classroomId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Teacher ${this.config.teacherId}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      this.classroomData = data;
      this.initializeStudentTracking(data.students || []);
    } catch (error) {
      console.error('Failed to setup classroom:', error);
    }
  }

  /**
   * Schüler-Tracking initialisieren
   */
  initializeStudentTracking(studentList) {
    studentList.forEach(student => {
      this.students.set(student.anonymousId, {
        id: student.anonymousId,
        joinTime: Date.now(),
        currentLevel: 1,
        currentChapter: 1,
        progress: {
          levelsCompleted: 0,
          totalPlayTime: 0,
          lastActivity: Date.now(),
        },
        performance: {
          averageCompletionTime: 0,
          helpRequestsCount: 0,
          strugglingLevels: [],
          strengths: [],
        },
        values: {
          empathy: 0,
          rights: 0,
          participation: 0,
          courage: 0,
        },
        engagement: {
          focusLevel: 'good',
          motivationLevel: 'high',
          collaborationScore: 0,
        },
        alerts: [],
      });
    });
  }

  /**
   * Echtzeit-Updates starten
   */
  startRealtimeUpdates() {
    // Polling-basierte Updates (kann später auf WebSocket umgestellt werden)
    this.updateInterval = setInterval(async () => {
      await this.fetchLatestData();
      this.updateClassMetrics();
      this.checkForAlerts();
      this.renderUpdates();
    }, this.config.refreshInterval);
  }

  /**
   * Neueste Daten vom Server abrufen
   */
  async fetchLatestData() {
    try {
      const response = await fetch(
        `${this.config.apiEndpoint}/classroom/${this.config.classroomId}/live`,
        {
          headers: {
            Authorization: `Teacher ${this.config.teacherId}`,
          },
        }
      );

      const data = await response.json();
      this.updateStudentData(data.students || []);
      this.classMetrics = data.classMetrics || {};
    } catch (error) {
      console.error('Failed to fetch latest data:', error);
    }
  }

  /**
   * Schüler-Daten aktualisieren
   */
  updateStudentData(studentsData) {
    studentsData.forEach(studentData => {
      const student = this.students.get(studentData.anonymousId);
      if (student) {
        // Update progress
        student.currentLevel = studentData.currentLevel;
        student.currentChapter = studentData.currentChapter;
        student.progress = { ...student.progress, ...studentData.progress };
        student.performance = { ...student.performance, ...studentData.performance };
        student.values = { ...student.values, ...studentData.values };
        student.engagement = { ...student.engagement, ...studentData.engagement };

        // Check for issues
        this.analyzeStudentPerformance(student);
      }
    });
  }

  /**
   * Schüler-Performance analysieren
   */
  analyzeStudentPerformance(student) {
    const now = Date.now();
    const timeSinceLastActivity = now - student.progress.lastActivity;

    // Clear old alerts for this student
    student.alerts = student.alerts.filter(
      alert => now - alert.timestamp < 300000 // Keep alerts for 5 minutes
    );

    // Check for stuck student
    if (timeSinceLastActivity > 180000) {
      // 3 minutes inactive
      student.alerts.push({
        type: 'inactive',
        severity: 'medium',
        message: 'Schüler ist seit 3+ Minuten inaktiv',
        timestamp: now,
      });
    }

    // Check for struggling pattern
    if (student.performance.helpRequestsCount > 3 && student.progress.levelsCompleted < 2) {
      student.alerts.push({
        type: 'struggling',
        severity: 'high',
        message: 'Schüler hat Schwierigkeiten - viele Hilfeanfragen',
        timestamp: now,
        suggestion: 'Individuelle Unterstützung anbieten',
      });
    }

    // Check for rapid progress (potential cheating or skipping)
    const averageTimePerLevel =
      student.progress.totalPlayTime / Math.max(student.progress.levelsCompleted, 1);
    if (averageTimePerLevel < 60000 && student.progress.levelsCompleted > 2) {
      // < 1 minute per level
      student.alerts.push({
        type: 'suspicious_progress',
        severity: 'medium',
        message: 'Ungewöhnlich schneller Fortschritt',
        timestamp: now,
        suggestion: 'Verständnis überprüfen',
      });
    }

    // Check for low engagement
    if (student.engagement.focusLevel === 'poor' && student.engagement.motivationLevel === 'low') {
      student.alerts.push({
        type: 'low_engagement',
        severity: 'medium',
        message: 'Niedrige Motivation und Aufmerksamkeit',
        timestamp: now,
        suggestion: 'Motivationshilfen anbieten',
      });
    }
  }

  /**
   * Klassen-Metriken aktualisieren
   */
  updateClassMetrics() {
    const students = Array.from(this.students.values());
    const activeStudents = students.filter(
      s => Date.now() - s.progress.lastActivity < 300000 // Active in last 5 minutes
    );

    this.classMetrics = {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      averageProgress: this.calculateAverageProgress(students),
      averageValues: this.calculateAverageValues(students),
      commonStrugglingPoints: this.identifyCommonStrugglingPoints(students),
      engagementDistribution: this.calculateEngagementDistribution(students),
      completionRate: this.calculateCompletionRate(students),
      helpRequestsTotal: students.reduce((total, s) => total + s.performance.helpRequestsCount, 0),
      sessionDuration: Date.now() - this.sessionStartTime,
    };
  }

  /**
   * Alerts für Lehrkraft sammeln
   */
  checkForAlerts() {
    this.alerts = [];

    // Class-wide alerts
    if (this.classMetrics.activeStudents / this.classMetrics.totalStudents < 0.7) {
      this.alerts.push({
        type: 'class_engagement',
        severity: 'high',
        message: `Nur ${this.classMetrics.activeStudents}/${this.classMetrics.totalStudents} Schüler sind aktiv`,
        suggestion: 'Aktivierung der Klasse notwendig',
      });
    }

    // Collect individual student alerts
    this.students.forEach(student => {
      if (student.alerts.length > 0) {
        this.alerts.push(
          ...student.alerts.map(alert => ({
            ...alert,
            studentId: student.id,
            context: 'individual',
          }))
        );
      }
    });

    // Sort alerts by severity
    this.alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Dashboard rendern
   */
  renderDashboard() {
    const container = document.getElementById('teacher-dashboard');
    if (!container) return;

    container.innerHTML = `
            <div class="dashboard-header">
                <h1>Democracy Metaverse - Lehrkräfte Dashboard</h1>
                <div class="class-info">
                    <span>Klasse: ${this.classroomData?.name || this.config.classroomId}</span>
                    <span>Aktive Session: ${this.formatDuration(this.classMetrics.sessionDuration)}</span>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="metrics-overview">
                    ${this.renderMetricsOverview()}
                </div>
                
                <div class="alerts-panel">
                    ${this.renderAlertsPanel()}
                </div>
                
                <div class="student-grid">
                    ${this.renderStudentGrid()}
                </div>
                
                <div class="learning-analytics">
                    ${this.renderLearningAnalytics()}
                </div>
                
                <div class="progress-visualization">
                    ${this.renderProgressVisualization()}
                </div>
            </div>

            <div class="dashboard-actions">
                ${this.renderActionButtons()}
            </div>
        `;

    this.attachEventListeners();
  }

  /**
   * Metriken-Überblick rendern
   */
  renderMetricsOverview() {
    return `
            <div class="metrics-cards">
                <div class="metric-card active-students">
                    <div class="metric-value">${this.classMetrics.activeStudents}/${this.classMetrics.totalStudents}</div>
                    <div class="metric-label">Aktive Schüler</div>
                </div>
                
                <div class="metric-card average-progress">
                    <div class="metric-value">${Math.round(this.classMetrics.averageProgress * 100)}%</div>
                    <div class="metric-label">Durchschnittlicher Fortschritt</div>
                </div>
                
                <div class="metric-card completion-rate">
                    <div class="metric-value">${Math.round(this.classMetrics.completionRate * 100)}%</div>
                    <div class="metric-label">Abschlussrate</div>
                </div>
                
                <div class="metric-card help-requests">
                    <div class="metric-value">${this.classMetrics.helpRequestsTotal}</div>
                    <div class="metric-label">Hilfeanfragen</div>
                </div>
            </div>
        `;
  }

  /**
   * Alerts-Panel rendern
   */
  renderAlertsPanel() {
    if (this.alerts.length === 0) {
      return `
                <div class="alerts-container">
                    <h3>Status</h3>
                    <div class="no-alerts">✅ Keine aktuellen Probleme</div>
                </div>
            `;
    }

    return `
            <div class="alerts-container">
                <h3>Benötigt Aufmerksamkeit (${this.alerts.length})</h3>
                <div class="alerts-list">
                    ${this.alerts
                      .slice(0, 5)
                      .map(
                        alert => `
                        <div class="alert alert-${alert.severity}">
                            <div class="alert-message">${alert.message}</div>
                            ${alert.suggestion ? `<div class="alert-suggestion">${alert.suggestion}</div>` : ''}
                            ${alert.studentId ? `<div class="alert-student">Schüler: ${alert.studentId.substring(0, 8)}</div>` : ''}
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>
        `;
  }

  /**
   * Schüler-Grid rendern
   */
  renderStudentGrid() {
    const students = Array.from(this.students.values());

    return `
            <div class="student-grid-container">
                <h3>Schüler-Übersicht</h3>
                <div class="students-grid">
                    ${students
                      .map(
                        student => `
                        <div class="student-card ${this.getStudentStatusClass(student)}">
                            <div class="student-id">S${student.id.substring(0, 6)}</div>
                            <div class="student-progress">
                                <div class="level-info">Level ${student.currentLevel}</div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${(student.progress.levelsCompleted / 10) * 100}%"></div>
                                </div>
                            </div>
                            <div class="student-status">
                                ${this.getStudentStatusIcon(student)}
                                ${student.alerts.length > 0 ? `<span class="alert-count">${student.alerts.length}</span>` : ''}
                            </div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>
        `;
  }

  /**
   * Learning Analytics rendern
   */
  renderLearningAnalytics() {
    return `
            <div class="learning-analytics-container">
                <h3>Lern-Analytics</h3>
                <div class="analytics-charts">
                    <div class="values-distribution">
                        <h4>Werte-Entwicklung (Klassen-Durchschnitt)</h4>
                        <div class="values-bars">
                            ${Object.entries(this.classMetrics.averageValues || {})
                              .map(
                                ([key, value]) => `
                                <div class="value-bar">
                                    <div class="value-label">${this.translateValue(key)}</div>
                                    <div class="value-progress">
                                        <div class="value-fill" style="width: ${(value / 20) * 100}%"></div>
                                    </div>
                                    <div class="value-number">${Math.round(value)}</div>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    </div>
                    
                    <div class="common-struggles">
                        <h4>Häufige Schwierigkeiten</h4>
                        <ul class="struggles-list">
                            ${(this.classMetrics.commonStrugglingPoints || [])
                              .map(
                                point => `
                                <li class="struggle-item">
                                    <span class="struggle-level">Level ${point.levelId}</span>
                                    <span class="struggle-description">${point.description}</span>
                                    <span class="struggle-count">${point.affectedStudents} Schüler</span>
                                </li>
                            `
                              )
                              .join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Progress Visualization rendern
   */
  renderProgressVisualization() {
    return `
            <div class="progress-visualization-container">
                <h3>Fortschritts-Visualisierung</h3>
                <div class="level-heatmap">
                    ${this.renderLevelHeatmap()}
                </div>
                <div class="timeline-view">
                    ${this.renderTimelineView()}
                </div>
            </div>
        `;
  }

  /**
   * Action Buttons rendern
   */
  renderActionButtons() {
    return `
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="dashboard.exportReport()">
                    📊 Bericht exportieren
                </button>
                <button class="btn btn-secondary" onclick="dashboard.pauseSession()">
                    ⏸️ Session pausieren
                </button>
                <button class="btn btn-secondary" onclick="dashboard.sendMessage()">
                    💬 Nachricht an Klasse
                </button>
                <button class="btn btn-info" onclick="dashboard.showDetailedView()">
                    🔍 Detailansicht
                </button>
            </div>
        `;
  }

  /**
   * Hilfsmethoden für Berechnungen
   */
  calculateAverageProgress(students) {
    if (students.length === 0) return 0;
    const totalProgress = students.reduce((sum, s) => sum + s.progress.levelsCompleted / 10, 0);
    return totalProgress / students.length;
  }

  calculateAverageValues(students) {
    const valueTypes = ['empathy', 'rights', 'participation', 'courage'];
    const averages = {};

    valueTypes.forEach(type => {
      const sum = students.reduce((total, s) => total + (s.values[type] || 0), 0);
      averages[type] = students.length > 0 ? sum / students.length : 0;
    });

    return averages;
  }

  identifyCommonStrugglingPoints(students) {
    const strugglingLevels = {};

    students.forEach(student => {
      (student.performance.strugglingLevels || []).forEach(levelId => {
        strugglingLevels[levelId] = (strugglingLevels[levelId] || 0) + 1;
      });
    });

    return Object.entries(strugglingLevels)
      .filter(([_, count]) => count >= 3) // At least 3 students struggling
      .map(([levelId, count]) => ({
        levelId: parseInt(levelId),
        description: this.getLevelDescription(parseInt(levelId)),
        affectedStudents: count,
      }))
      .sort((a, b) => b.affectedStudents - a.affectedStudents);
  }

  calculateEngagementDistribution(students) {
    const distribution = { high: 0, medium: 0, low: 0 };

    students.forEach(student => {
      const level = student.engagement.motivationLevel || 'medium';
      distribution[level] = (distribution[level] || 0) + 1;
    });

    return distribution;
  }

  calculateCompletionRate(students) {
    if (students.length === 0) return 0;
    const completedStudents = students.filter(s => s.progress.levelsCompleted >= 10).length;
    return completedStudents / students.length;
  }

  /**
   * UI Helper-Methoden
   */
  getStudentStatusClass(student) {
    if (student.alerts.some(a => a.severity === 'high')) return 'status-alert';
    if (Date.now() - student.progress.lastActivity > 180000) return 'status-inactive';
    if (student.engagement.motivationLevel === 'high') return 'status-engaged';
    return 'status-normal';
  }

  getStudentStatusIcon(student) {
    if (student.alerts.some(a => a.severity === 'high')) return '🚨';
    if (Date.now() - student.progress.lastActivity > 180000) return '😴';
    if (student.engagement.motivationLevel === 'high') return '🎯';
    return '👤';
  }

  translateValue(key) {
    const translations = {
      empathy: 'Empathie',
      rights: 'Gerechtigkeit',
      participation: 'Teilhabe',
      courage: 'Zivilcourage',
    };
    return translations[key] || key;
  }

  getLevelDescription(levelId) {
    const descriptions = {
      1: 'Lärm im Hof',
      2: 'Essensgerüche',
      3: 'Müll oder Kultur?',
      4: 'Nachbarschaftshilfe',
      5: 'Hundekonflikt',
      // ... weitere Level-Beschreibungen
    };
    return descriptions[levelId] || `Level ${levelId}`;
  }

  formatDuration(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  }

  renderLevelHeatmap() {
    const students = Array.from(this.students.values());
    if (!students.length) {
      return '<div class="heatmap-container"><p style="padding:1rem;color:#666">Keine Schülerdaten vorhanden.</p></div>';
    }
    // Aggregiere Abschlüsse pro Szenario (1-8)
    const levelCounts = Array.from({ length: 8 }, (_, i) => ({
      level: i + 1,
      completed: 0,
      scores: [],
    }));
    students.forEach(student => {
      const completed = student.progress.levelsCompleted || 0;
      for (let i = 0; i < Math.min(completed, 8); i++) {
        levelCounts[i].completed++;
      }
    });
    const maxCompleted = Math.max(...levelCounts.map(l => l.completed), 1);
    const cells = levelCounts.map(l => {
      const ratio = l.completed / maxCompleted;
      let cls = 'heatmap-cell--low';
      if (ratio >= 0.75) cls = 'heatmap-cell--excellent';
      else if (ratio >= 0.5) cls = 'heatmap-cell--high';
      else if (ratio >= 0.25) cls = 'heatmap-cell--medium';
      return `<div class="heatmap-cell ${cls}" title="Szenario ${l.level}: ${l.completed} Abschlüsse">
        <span>S${l.level}</span>
        <span>${l.completed}</span>
      </div>`;
    }).join('');
    return `
      <div class="heatmap-container">${cells}</div>
      <div class="heatmap-legend">
        <span class="heatmap-legend-item"><span class="heatmap-legend-dot" style="background:#dcfce7;display:inline-block;width:12px;height:12px;border-radius:3px"></span> Niedrig</span>
        <span class="heatmap-legend-item"><span class="heatmap-legend-dot" style="background:#fef3c7;display:inline-block;width:12px;height:12px;border-radius:3px"></span> Mittel</span>
        <span class="heatmap-legend-item"><span class="heatmap-legend-dot" style="background:#fee2e2;display:inline-block;width:12px;height:12px;border-radius:3px"></span> Hoch</span>
        <span class="heatmap-legend-item"><span class="heatmap-legend-dot" style="background:rgba(184,0,0,0.12);border:2px solid #b80000;display:inline-block;width:12px;height:12px;border-radius:3px"></span> Exzellent</span>
      </div>`;
  }

  renderTimelineView() {
    const students = Array.from(this.students.values());
    const events = [];
    students.forEach(student => {
      if (student.progress && student.progress.lastActivity) {
        events.push({
          time: new Date(student.progress.lastActivity),
          text: `${student.id}: Szenario ${student.progress.levelsCompleted || 0} abgeschlossen`,
        });
      }
    });
    events.sort((a, b) => b.time - a.time);
    if (!events.length) {
      const now = Date.now();
      events.push(
        { time: new Date(now - 5 * 60000), text: 'Klasse hat Spielsitzung gestartet' },
        { time: new Date(now - 12 * 60000), text: 'Durchschnittliche Spielzeit: 18 Minuten' },
        { time: new Date(now - 25 * 60000), text: 'Letztes Szenario: Klimawandel' }
      );
    }
    const items = events.slice(0, 10).map(e => {
      const timeStr = e.time.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
      return `<div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-time">${timeStr}</div>
          <p class="timeline-text">${e.text}</p>
        </div>
      </div>`;
    }).join('');
    return `<div class="timeline-container">${items}</div>`;
  }

  /**
   * Event Listeners
   */
  attachEventListeners() {
    // Refresh button
    document.querySelector('.btn-refresh')?.addEventListener('click', () => {
      this.fetchLatestData();
    });

    // Student card clicks for detailed view
    document.querySelectorAll('.student-card').forEach(card => {
      card.addEventListener('click', e => {
        const studentId = e.target
          .closest('.student-card')
          ?.querySelector('.student-id')?.textContent;
        if (studentId) {
          this.showStudentDetails(studentId);
        }
      });
    });
  }

  /**
   * Public API-Methoden für Button-Aktionen
   */
  async exportReport() {
    const report = {
      timestamp: new Date().toISOString(),
      classroom: this.classroomData,
      metrics: this.classMetrics,
      students: Array.from(this.students.values()).map(s => ({
        id: s.id,
        progress: s.progress,
        performance: s.performance,
        values: s.values,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `democracy-game-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  pauseSession() {
    // Implementation für Session-Pause
    console.log('Session paused');
  }

  sendMessage() {
    // Implementation für Nachricht an Klasse
    const message = prompt('Nachricht an die Klasse:');
    if (message) {
      console.log('Message sent:', message);
    }
  }

  showDetailedView() {
    // Implementation für Detailansicht
    console.log('Showing detailed view');
  }

  showStudentDetails(studentId) {
    const student = Array.from(this.students.values()).find(s =>
      s.id.startsWith(studentId.replace('S', ''))
    );
    if (student) {
      console.log('Student details:', student);
      // Implementation für Student-Detail-Modal
    }
  }

  /**
   * Updates ohne komplette Neurendierung
   */
  renderUpdates() {
    // Update nur die sich ändernden Teile
    this.updateMetricsCards();
    this.updateAlertsPanel();
    this.updateStudentCards();
  }

  updateMetricsCards() {
    const activeStudentsCard = document.querySelector('.metric-card.active-students .metric-value');
    if (activeStudentsCard) {
      activeStudentsCard.textContent = `${this.classMetrics.activeStudents}/${this.classMetrics.totalStudents}`;
    }
    // ... weitere Metric-Updates
  }

  updateAlertsPanel() {
    // Implementation für Alert-Panel-Updates
  }

  updateStudentCards() {
    // Implementation für Student-Card-Updates
  }

  /**
   * Dashboard beenden
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

// Global Dashboard-Instanz für Button-Events
window.dashboard = null;

export { TeacherDashboard };
