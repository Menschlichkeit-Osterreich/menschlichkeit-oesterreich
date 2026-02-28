/* ========================================================================== 
   Brücken Bauen - Main Game Logic
   Interactive Democracy Game Controller
   ========================================================================== */

/* global SCENARIOS, GameUI, getDemocracyProfile, gtag */

class DemocracyGame {
  constructor() {
    this.currentScenario = 0;
    this.gameState = {
      scenarios: [...SCENARIOS],
      scores: {
        empathy: 0,
        rights: 0,
        participation: 0,
        courage: 0,
      },
      decisions: [],
      startTime: null,
      totalScore: 0,
      profile: null,
    };

    this.maxPossibleScore = SCENARIOS.length * 12; // 4 categories × 3 max points
    this.ui = new GameUI(this);
    this.debugTools = null;
    this._pendingDebugEvents = [];

    this.init();
  }

  init() {
    this.setupDebugTools();
    this.debugEmit('game_init', {
      maxPossibleScore: this.maxPossibleScore,
      scenarios: SCENARIOS.length,
    });
    console.log('🌉 Brücken Bauen - Democracy Game initialized');
    this.setupEventListeners();
    this.showStartScreen();

    // Initialize accessibility announcements
    this.announcements = document.getElementById('announcements');

    // Track analytics (privacy-friendly)
    this.trackGameStart();
  }

  setupEventListeners() {
    // Start button
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startGame());
    }

    // Decision submission
    const submitBtn = document.getElementById('submit-decision-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitDecision());
    }

    // Continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => this.nextScenario());
    }

    // Final screen buttons
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restartGame());
    }

    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareGame());
    }

    // Keyboard navigation
    document.addEventListener('keydown', e => this.handleKeyboard(e));

    // Decision option clicks
    this.setupDecisionHandlers();
  }

  setupDecisionHandlers() {
    const decisionContainer = document.getElementById('decision-options');
    if (decisionContainer) {
      decisionContainer.addEventListener('click', e => {
        if (e.target.classList.contains('decision-option')) {
          this.selectDecision(e.target.dataset.decisionId);
        }
      });

      decisionContainer.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.classList.contains('decision-option')) {
            e.preventDefault();
            this.selectDecision(e.target.dataset.decisionId);
          }
        }
      });
    }
  }

  showStartScreen() {
    this.ui.showScreen('start');
    this.ui.updateProgress(0, SCENARIOS.length);
    this.announce('Willkommen bei Brücken Bauen - dem interaktiven Demokratie-Lernspiel');
    this.debugEmit('screen_show', { screen: 'start' });
  }

  startGame() {
    this.gameState.startTime = new Date();
    this.currentScenario = 0;
    this.resetScores();
    this.debugEmit('game_start', { timestamp: this.gameState.startTime.toISOString() });

    this.ui.showLoadingScreen(true);

    setTimeout(() => {
      this.ui.showLoadingScreen(false);
      this.loadScenario();
      this.trackScenarioStart(1);
    }, 1000);
  }

  resetScores() {
    this.gameState.scores = {
      empathy: 0,
      rights: 0,
      participation: 0,
      courage: 0,
    };
    this.gameState.decisions = [];
    this.gameState.totalScore = 0;
    this.debugEmit('scores_reset', { scores: { ...this.gameState.scores } });
  }

  loadScenario() {
    if (this.currentScenario >= SCENARIOS.length) {
      this.endGame();
      return;
    }

    const scenario = SCENARIOS[this.currentScenario];
    this.ui.showScreen('game');
    this.ui.updateProgress(this.currentScenario + 1, SCENARIOS.length);
    this.ui.renderScenario(scenario);

    this.announce(`Szenario ${this.currentScenario + 1}: ${scenario.title}`);

    // Reset decision state
    this.selectedDecision = null;
    this.ui.updateSubmitButton(false);
    this.debugEmit('scenario_loaded', {
      index: this.currentScenario + 1,
      scenarioId: scenario.id,
      title: scenario.title,
    });
  }

  selectDecision(decisionId) {
    const scenario = SCENARIOS[this.currentScenario];
    const decision = scenario.decisions.find(d => d.id === decisionId);

    if (!decision) return;

    this.selectedDecision = decision;

    // Update UI
    this.ui.selectDecisionOption(decisionId);
    this.ui.updateSubmitButton(true);

    this.announce(`Entscheidung ausgewählt: ${decision.text}`);
    this.debugEmit('decision_selected', {
      scenarioId: scenario.id,
      decisionId: decision.id,
    });
  }

  submitDecision() {
    if (!this.selectedDecision) return;

    const scenario = SCENARIOS[this.currentScenario];

    // Update scores
    this.updateScores(this.selectedDecision.scores);

    // Save decision
    this.gameState.decisions.push({
      scenarioId: scenario.id,
      decisionId: this.selectedDecision.id,
      decision: this.selectedDecision,
      timestamp: new Date(),
    });

    // Show result
    this.showResult(scenario, this.selectedDecision);

    // Track analytics
    this.trackDecision(scenario.id, this.selectedDecision.id);
    this.debugEmit('decision_submitted', {
      scenarioId: scenario.id,
      decisionId: this.selectedDecision.id,
      scores: { ...this.selectedDecision.scores },
    });
  }

  updateScores(newScores) {
    this.gameState.scores.empathy += newScores.empathy;
    this.gameState.scores.rights += newScores.rights;
    this.gameState.scores.participation += newScores.participation;
    this.gameState.scores.courage += newScores.courage;

    this.gameState.totalScore = Object.values(this.gameState.scores).reduce(
      (sum, score) => sum + score,
      0
    );
    this.debugEmit('scores_updated', {
      totalScore: this.gameState.totalScore,
      scores: { ...this.gameState.scores },
    });
  }

  showResult(scenario, decision) {
    this.ui.showScreen('result');
    this.ui.renderResult(scenario, decision, this.gameState.scores, this.maxPossibleScore);

    this.announce(`Ergebnis: ${decision.feedback}`);

    // Update continue button text
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      if (this.currentScenario >= SCENARIOS.length - 1) {
        continueBtn.textContent = 'Zum Ergebnis';
        continueBtn.innerHTML = `
          <svg class="button-icon" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 2L13 8h5l-4 6 1 4-5-3-5 3 1-4-4-6h5l3-6z" fill="currentColor"/>
          </svg>
          Zum Ergebnis
        `;
      } else {
        continueBtn.textContent = 'Weiter zum nächsten Szenario';
      }
    }
    this.debugEmit('result_shown', {
      scenarioId: scenario.id,
      decisionId: decision.id,
      totalScore: this.gameState.totalScore,
    });
  }

  nextScenario() {
    const previousScenario = this.currentScenario;
    this.currentScenario++;

    if (this.currentScenario >= SCENARIOS.length) {
      this.endGame();
    } else {
      this.ui.showLoadingScreen(true);

      setTimeout(() => {
        this.ui.showLoadingScreen(false);
        this.loadScenario();
        this.trackScenarioStart(this.currentScenario + 1);
      }, 500);
    }

    this.debugEmit('scenario_advance', {
      from: previousScenario + 1,
      to: this.currentScenario + 1,
    });
  }

  endGame() {
    // Calculate final profile
    this.gameState.profile = getDemocracyProfile(this.gameState.totalScore, this.maxPossibleScore);

    this.ui.showScreen('final');
    this.ui.renderFinalResult(this.gameState);

    this.announce(`Spiel beendet! Du bist ein ${this.gameState.profile.title}`);

    // Track completion
    this.trackGameComplete();
    this.debugEmit('game_complete', {
      totalScore: this.gameState.totalScore,
      profile: this.gameState.profile?.title,
      decisions: this.gameState.decisions.length,
    });
  }

  restartGame() {
    this.currentScenario = 0;
    this.resetScores();
    this.showStartScreen();
    this.trackGameRestart();
    this.debugEmit('game_restart', { timestamp: new Date().toISOString() });
  }

  shareGame() {
    if (navigator.share) {
      navigator.share({
        title: 'Brücken Bauen - Democracy Game',
        text: `Ich habe das Demokratie-Lernspiel gespielt und bin ein ${this.gameState.profile.title}! 🌉`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers without native sharing
      const shareText = `Ich habe das Demokratie-Lernspiel "Brücken Bauen" gespielt und bin ein ${this.gameState.profile.title}! 🌉 ${window.location.href}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          this.announce('Link wurde in die Zwischenablage kopiert!');
        });
      } else {
        // Ultra-fallback
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.announce('Link wurde in die Zwischenablage kopiert!');
      }
    }

    this.trackShare();
  }

  isDebugMode() {
    try {
      const host = window.location?.hostname;
      if (!host) return false;
      if (host === 'localhost' || host === '127.0.0.1') return true;
      return window.location.search.includes('debug=1');
    } catch {
      return false;
    }
  }

  setupDebugTools() {
    if (!this.isDebugMode()) {
      return;
    }

    if (!this.debugTools) {
      this.debugTools = new GameDebugTools(this);
      if (Array.isArray(this._pendingDebugEvents) && this._pendingDebugEvents.length > 0) {
        this._pendingDebugEvents.forEach(({ name, payload }) => {
          this.debugTools.handleGameEvent(name, payload);
        });
        this._pendingDebugEvents = [];
      }
    }
  }

  debugEmit(name, payload = {}) {
    if (this.debugTools) {
      this.debugTools.handleGameEvent(name, payload);
    } else if (this.isDebugMode()) {
      this._pendingDebugEvents.push({ name, payload });
    }
  }

  debugJumpToScenario(targetScenario) {
    if (!Number.isFinite(targetScenario)) {
      const parsed = parseInt(targetScenario, 10);
      if (Number.isNaN(parsed)) {
        return false;
      }
      targetScenario = parsed;
    }

    let desiredIndex = targetScenario;
    if (targetScenario >= 1) {
      desiredIndex = targetScenario - 1;
    }

    desiredIndex = Math.max(0, Math.min(desiredIndex, SCENARIOS.length - 1));

    if (
      this.currentScenario === desiredIndex &&
      document.querySelector('.screen.active')?.id === 'game-screen'
    ) {
      this.loadScenario();
      return true;
    }

    this.currentScenario = desiredIndex;
    if (!this.gameState.startTime) {
      this.gameState.startTime = new Date();
    }

    this.debugEmit('debug_jump_scenario', { target: desiredIndex + 1 });
    this.loadScenario();
    return true;
  }

  debugApplyDecision(decisionId, options = {}) {
    const { submit = false } = options;
    const scenario = SCENARIOS[this.currentScenario];
    if (!scenario) return false;

    const decision = scenario.decisions.find(entry => entry.id === decisionId);
    if (!decision) return false;

    this.selectedDecision = decision;
    this.ui.selectDecisionOption(decision.id);
    this.ui.updateSubmitButton(true);

    this.debugEmit('debug_decision_prefill', {
      scenarioId: scenario.id,
      decisionId: decision.id,
      submit,
    });

    if (submit) {
      this.submitDecision();
    }

    return true;
  }

  debugSelectDecisionByScore(preference = 'best', options = {}) {
    const scenario = SCENARIOS[this.currentScenario];
    if (!scenario || !Array.isArray(scenario.decisions)) {
      return false;
    }

    const sorted = [...scenario.decisions].sort(
      (a, b) => this.calculateDecisionScore(b) - this.calculateDecisionScore(a)
    );

    const decision = preference === 'worst' ? sorted[sorted.length - 1] : sorted[0];

    if (!decision) {
      return false;
    }

    return this.debugApplyDecision(decision.id, options);
  }

  calculateDecisionScore(decision) {
    if (!decision || !decision.scores) return 0;
    const { empathy = 0, rights = 0, participation = 0, courage = 0 } = decision.scores;
    return empathy + rights + participation + courage;
  }

  handleKeyboard(e) {
    // ESC key - return to start
    if (e.key === 'Escape' && this.currentScenario > 0) {
      if (confirm('Möchtest du das Spiel wirklich verlassen?')) {
        this.showStartScreen();
      }
    }

    // Arrow keys for decision navigation
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      this.navigateDecisions(e.key === 'ArrowUp' ? -1 : 1);
      e.preventDefault();
    }

    // Enter key for quick actions
    if (e.key === 'Enter') {
      const activeScreen = document.querySelector('.screen.active');
      if (activeScreen.id === 'start-screen') {
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn && document.activeElement !== startBtn) {
          startBtn.click();
        }
      }
    }
  }

  navigateDecisions(direction) {
    const options = document.querySelectorAll('.decision-option');
    if (options.length === 0) return;

    const currentIndex = Array.from(options).findIndex(option => document.activeElement === option);

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = options.length - 1;
    if (nextIndex >= options.length) nextIndex = 0;

    options[nextIndex].focus();
  }

  announce(message) {
    if (this.announcements) {
      this.announcements.textContent = message;

      // Clear after 3 seconds
      setTimeout(() => {
        this.announcements.textContent = '';
      }, 3000);
    }
  }

  // Analytics methods (privacy-friendly, no personal data)
  trackGameStart() {
    if (typeof gtag === 'function') {
      gtag('event', 'game_start', {
        event_category: 'democracy_game',
        event_label: 'bruecken_bauen',
      });
    }
  }

  trackScenarioStart(scenarioNumber) {
    if (typeof gtag === 'function') {
      gtag('event', 'scenario_start', {
        event_category: 'democracy_game',
        event_label: `scenario_${scenarioNumber}`,
      });
    }
  }

  trackDecision(scenarioId, decisionId) {
    if (typeof gtag === 'function') {
      gtag('event', 'decision_made', {
        event_category: 'democracy_game',
        event_label: `scenario_${scenarioId}_decision_${decisionId}`,
      });
    }
  }

  trackGameComplete() {
    const playTime = new Date() - this.gameState.startTime;
    const minutes = Math.round(playTime / 60000);

    if (typeof gtag === 'function') {
      gtag('event', 'game_complete', {
        event_category: 'democracy_game',
        event_label: this.gameState.profile.title,
        value: this.gameState.totalScore,
        custom_parameter_1: minutes, // play time in minutes
      });
    }
  }

  trackGameRestart() {
    if (typeof gtag === 'function') {
      gtag('event', 'game_restart', {
        event_category: 'democracy_game',
      });
    }
  }

  trackShare() {
    if (typeof gtag === 'function') {
      gtag('event', 'share', {
        event_category: 'democracy_game',
        event_label: 'game_result',
      });
    }
  }

  // Debug methods (only in development)
  debugGameState() {
    console.log('🔍 Game State:', this.gameState);
    console.log('🎯 Current Scenario:', this.currentScenario);
    console.log('📊 Scores:', this.gameState.scores);
    console.log('🏆 Total Score:', this.gameState.totalScore, '/', this.maxPossibleScore);

    if (this.gameState.profile) {
      console.log('👤 Profile:', this.gameState.profile.title);
    }
  }

  // Export game data (for educational analysis)
  exportGameData() {
    const exportData = {
      timestamp: new Date().toISOString(),
      gameVersion: '1.0',
      totalScore: this.gameState.totalScore,
      maxPossibleScore: this.maxPossibleScore,
      profile: this.gameState.profile?.title,
      scores: { ...this.gameState.scores },
      decisions: this.gameState.decisions.map(d => ({
        scenarioId: d.scenarioId,
        decisionId: d.decisionId,
        scores: d.decision.scores,
      })),
      playTime: this.gameState.startTime ? new Date() - this.gameState.startTime : null,
    };

    return exportData;
  }
}

class GameDebugTools {
  constructor(game) {
    this.game = game;
    this.visible = false;
    this.events = [];
    this.loggingEnabled = false;
    this.statusTimeout = null;

    this.handleKeyDown = this.handleKeyDown.bind(this);

    GameDebugTools.injectStyles();
    this.buildUI();
    this.bindEvents();
    this.refresh();

    console.info('🛠️ Game debug overlay aktiviert. Strg+Umschalt+D zum Umschalten.');
  }

  static injectStyles() {
    if (document.getElementById('democracy-debug-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'democracy-debug-styles';
    style.textContent = `
      .debug-toggle-button {
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 9998;
        background: rgba(16, 16, 24, 0.9);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 12px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(6px);
      }

      .debug-toggle-button:hover {
        background: rgba(40, 40, 60, 0.95);
      }

      .debug-panel {
        position: fixed;
        bottom: 72px;
        right: 16px;
        width: 340px;
        max-height: 80vh;
        overflow: hidden;
        z-index: 9999;
        background: rgba(12, 12, 20, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 16px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
        color: #f5f5f5;
        font-family: 'Fira Code', 'Courier New', monospace;
        font-size: 12px;
        letter-spacing: 0.01em;
        backdrop-filter: blur(14px);
      }

      .debug-panel.hidden {
        display: none;
      }

      .debug-panel__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .debug-panel__close {
        background: transparent;
        border: none;
        color: inherit;
        font-size: 16px;
        cursor: pointer;
      }

      .debug-panel__section {
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .debug-panel__section:last-of-type {
        border-bottom: none;
      }

      .debug-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .debug-panel__stat {
        display: flex;
        flex-direction: column;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 8px;
      }

      .debug-label {
        font-size: 10px;
        text-transform: uppercase;
        opacity: 0.65;
        margin-bottom: 4px;
      }

      .debug-value {
        font-size: 12px;
        font-weight: 500;
      }

      .debug-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }

      .debug-action {
        flex: 1 1 auto;
        background: rgba(184, 0, 0, 0.2);
        color: #ffb4a2;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        padding: 6px 8px;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .debug-action:hover {
        background: rgba(255, 105, 97, 0.25);
      }

      .debug-panel__row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-top: 8px;
      }

      .debug-panel__row input[type="number"] {
        width: 80px;
        padding: 6px 8px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.3);
        color: inherit;
      }

      .debug-panel__footer {
        padding: 10px 16px 14px 16px;
        font-size: 11px;
        opacity: 0.7;
      }

      .debug-log {
        list-style: none;
        margin: 8px 0 0 0;
        padding: 0;
        max-height: 140px;
        overflow-y: auto;
      }

      .debug-log li {
        padding: 4px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        line-height: 1.4;
        word-break: break-word;
      }

      .debug-log li:last-child {
        border-bottom: none;
      }

      .debug-toggle-checkbox {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        cursor: pointer;
      }

      .debug-toggle-checkbox input {
        accent-color: #ff7d74;
      }

      .debug-status--warn {
        color: #f4d35e;
      }

      .debug-status--error {
        color: #ff6b6b;
      }

      .debug-status--success {
        color: #8ac926;
      }
    `;

    document.head.appendChild(style);
  }

  buildUI() {
    this.toggleButton = document.createElement('button');
    this.toggleButton.type = 'button';
    this.toggleButton.className = 'debug-toggle-button';
    this.toggleButton.setAttribute('aria-label', 'Debug Panel umschalten');
    this.toggleButton.textContent = 'Debug';
    document.body.appendChild(this.toggleButton);

    this.panel = document.createElement('section');
    this.panel.className = 'debug-panel hidden';
    this.panel.setAttribute('aria-live', 'polite');
    this.panel.innerHTML = `
      <header class="debug-panel__header">
        <span class="debug-panel__title">Debug Monitor</span>
        <button type="button" class="debug-panel__close" data-action="close" aria-label="Debug Panel schließen">×</button>
      </header>
      <div class="debug-panel__section">
        <div class="debug-grid">
          <div class="debug-panel__stat">
            <span class="debug-label">Screen</span>
            <span class="debug-value" data-field="mode">–</span>
          </div>
          <div class="debug-panel__stat">
            <span class="debug-label">Szenario</span>
            <span class="debug-value" data-field="scenario">–</span>
          </div>
          <div class="debug-panel__stat">
            <span class="debug-label">Gesamt</span>
            <span class="debug-value" data-field="totalScore">–</span>
          </div>
          <div class="debug-panel__stat">
            <span class="debug-label">Entscheidung</span>
            <span class="debug-value" data-field="decision">–</span>
          </div>
          <div class="debug-panel__stat">
            <span class="debug-label">Teilwertungen</span>
            <span class="debug-value" data-field="scores">–</span>
          </div>
          <div class="debug-panel__stat">
            <span class="debug-label">Entscheidungen</span>
            <span class="debug-value" data-field="decisionCount">0</span>
          </div>
        </div>
      </div>
      <div class="debug-panel__section">
        <div class="debug-panel__row">
          <button type="button" class="debug-action" data-action="previous">◀︎ Zurück</button>
          <button type="button" class="debug-action" data-action="next">Weiter ▶︎</button>
        </div>
        <div class="debug-panel__row">
          <input type="number" min="1" max="${SCENARIOS.length}" data-field="jumpTarget" placeholder="Szenario" />
          <button type="button" class="debug-action" data-action="jump">Springen</button>
        </div>
      </div>
      <div class="debug-panel__section">
        <label class="debug-toggle-checkbox">
          <input type="checkbox" data-field="logging" />
          Detailliertes Logging aktivieren
        </label>
        <div class="debug-actions">
          <button type="button" class="debug-action" data-action="best-submit">Beste Entscheidung</button>
          <button type="button" class="debug-action" data-action="worst-submit">Schlechteste Entscheidung</button>
          <button type="button" class="debug-action" data-action="copy-state">Spielstand kopieren</button>
        </div>
      </div>
      <div class="debug-panel__section">
        <span class="debug-label">Letzte Ereignisse</span>
        <ul class="debug-log" data-field="events"></ul>
      </div>
      <footer class="debug-panel__footer">
        <span data-field="status">Bereit</span>
      </footer>
    `;

    document.body.appendChild(this.panel);

    this.fields = {
      mode: this.panel.querySelector('[data-field="mode"]'),
      scenario: this.panel.querySelector('[data-field="scenario"]'),
      totalScore: this.panel.querySelector('[data-field="totalScore"]'),
      decision: this.panel.querySelector('[data-field="decision"]'),
      decisionCount: this.panel.querySelector('[data-field="decisionCount"]'),
      scores: this.panel.querySelector('[data-field="scores"]'),
      logging: this.panel.querySelector('[data-field="logging"]'),
      jumpTarget: this.panel.querySelector('[data-field="jumpTarget"]'),
      events: this.panel.querySelector('[data-field="events"]'),
      status: this.panel.querySelector('[data-field="status"]'),
    };
  }

  bindEvents() {
    this.toggleButton.addEventListener('click', () => this.togglePanel());
    this.panel
      .querySelector('[data-action="close"]')
      .addEventListener('click', () => this.togglePanel(false));

    this.panel.querySelectorAll('.debug-action').forEach(button => {
      button.addEventListener('click', event => {
        const action = event.currentTarget.getAttribute('data-action');
        this.handleAction(action);
      });
    });

    if (this.fields.logging) {
      this.fields.logging.addEventListener('change', () => {
        this.loggingEnabled = this.fields.logging.checked;
        const mode = this.loggingEnabled ? 'aktiviert' : 'deaktiviert';
        this.setStatus(`Verbose Logging ${mode}`, this.loggingEnabled ? 'success' : 'info');
      });
    }

    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event) {
    if (event.key === 'D' && event.ctrlKey && event.shiftKey) {
      event.preventDefault();
      this.togglePanel();
    }
  }

  togglePanel(forceVisible) {
    const nextState = typeof forceVisible === 'boolean' ? forceVisible : !this.visible;
    this.visible = nextState;

    if (this.visible) {
      this.panel.classList.remove('hidden');
      this.refresh();
      if (this.fields.jumpTarget) {
        this.fields.jumpTarget.focus();
      }
    } else {
      this.panel.classList.add('hidden');
    }
  }

  refresh() {
    const activeScreen = document.querySelector('.screen.active');
    const scenarioIndex = this.game.currentScenario;
    const scenario = SCENARIOS[scenarioIndex];
    const scores = this.game.gameState.scores;

    if (this.fields.mode) {
      this.fields.mode.textContent = activeScreen ? activeScreen.id : 'unbekannt';
    }

    if (this.fields.scenario) {
      if (scenario) {
        this.fields.scenario.textContent = `${scenarioIndex + 1}/${SCENARIOS.length} ${scenario.title}`;
      } else {
        this.fields.scenario.textContent = '–';
      }
    }

    if (this.fields.totalScore) {
      this.fields.totalScore.textContent = `${this.game.gameState.totalScore} / ${this.game.maxPossibleScore}`;
    }

    if (this.fields.decision) {
      const decision = this.game.selectedDecision;
      this.fields.decision.textContent = decision
        ? `${decision.id.toUpperCase()} (${this.formatScore(decision.scores)})`
        : '–';
    }

    if (this.fields.scores) {
      this.fields.scores.textContent = this.formatScore(scores);
    }

    if (this.fields.decisionCount) {
      this.fields.decisionCount.textContent = this.game.gameState.decisions.length;
    }

    if (this.fields.logging) {
      this.fields.logging.checked = this.loggingEnabled;
    }
  }

  handleAction(action) {
    switch (action) {
      case 'previous':
        if (this.game.currentScenario === 0) {
          this.setStatus('Bereits beim ersten Szenario.', 'warn');
          return;
        }
        this.game.debugJumpToScenario(this.game.currentScenario);
        this.setStatus('Zum vorherigen Szenario gewechselt.', 'info');
        break;
      case 'next':
        if (this.game.currentScenario >= SCENARIOS.length - 1) {
          this.setStatus('Letztes Szenario erreicht.', 'warn');
          return;
        }
        this.game.debugJumpToScenario(this.game.currentScenario + 2);
        this.setStatus('Zum nächsten Szenario gewechselt.', 'info');
        break;
      case 'jump': {
        if (!this.fields.jumpTarget) return;
        const rawValue = this.fields.jumpTarget.value.trim();
        if (!rawValue) {
          this.setStatus('Bitte Ziel-Szenario eingeben.', 'warn');
          return;
        }
        const target = parseInt(rawValue, 10);
        if (Number.isNaN(target) || target < 1 || target > SCENARIOS.length) {
          this.setStatus(`Wert muss zwischen 1 und ${SCENARIOS.length} liegen.`, 'error');
          return;
        }
        this.game.debugJumpToScenario(target);
        this.setStatus(`Zu Szenario ${target} gesprungen.`, 'success');
        break;
      }
      case 'best-submit':
        if (!this.ensureGameScreen()) return;
        if (this.game.debugSelectDecisionByScore('best', { submit: true })) {
          this.setStatus('Beste Entscheidung angewendet.', 'success');
        } else {
          this.setStatus('Keine Entscheidung gefunden.', 'error');
        }
        break;
      case 'worst-submit':
        if (!this.ensureGameScreen()) return;
        if (this.game.debugSelectDecisionByScore('worst', { submit: true })) {
          this.setStatus('Schlechteste Entscheidung angewendet.', 'warn');
        } else {
          this.setStatus('Keine Entscheidung gefunden.', 'error');
        }
        break;
      case 'copy-state':
        this.copyStateToClipboard();
        break;
    }

    this.refresh();
  }

  ensureGameScreen() {
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen || activeScreen.id !== 'game-screen') {
      this.setStatus('Aktion nur im Spielbildschirm verfügbar.', 'warn');
      return false;
    }
    return true;
  }

  copyStateToClipboard() {
    try {
      const snapshot =
        typeof this.game.exportGameData === 'function'
          ? this.game.exportGameData()
          : this.game.gameState;
      const formatted = JSON.stringify(snapshot, null, 2);

      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(formatted)
          .then(() => {
            this.setStatus('Spielstand in Zwischenablage kopiert.', 'success');
          })
          .catch(() => {
            this.fallbackCopy(formatted);
          });
      } else {
        this.fallbackCopy(formatted);
      }
    } catch (error) {
      console.error('Debug copyState failed', error);
      this.setStatus('Konnte Spielstand nicht kopieren.', 'error');
    }
  }

  fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.setStatus('Spielstand kopiert (Fallback).', 'success');
  }

  handleGameEvent(name, payload) {
    this.recordEvent(name, payload);
    this.refresh();
  }

  recordEvent(name, payload = {}) {
    const timestamp = new Date().toLocaleTimeString();
    const description = this.formatEvent(name, payload);
    this.events.unshift({ timestamp, description });
    if (this.events.length > 20) {
      this.events.length = 20;
    }

    if (this.loggingEnabled) {
      console.debug(`[Debug][${name}]`, payload);
    }

    this.updateEventList();
  }

  updateEventList() {
    if (!this.fields.events) return;
    this.fields.events.innerHTML = this.events
      .map(entry => `<li>[${entry.timestamp}] ${this.escapeHtml(entry.description)}</li>`)
      .join('');
  }

  formatEvent(name, payload) {
    switch (name) {
      case 'game_init':
        return `Spiel initialisiert (${payload.scenarios} Szenarien).`;
      case 'screen_show':
        return `Screen gewechselt: ${payload.screen}`;
      case 'game_start':
        return 'Spielstart ausgelöst.';
      case 'scores_reset':
        return 'Scores zurückgesetzt.';
      case 'scenario_loaded':
        return `Szenario ${payload.index}: ${payload.title}`;
      case 'decision_selected':
        return `Entscheidung ${payload.decisionId} gewählt.`;
      case 'decision_submitted':
        return `Entscheidung ${payload.decisionId} abgeschlossen.`;
      case 'scores_updated':
        return `Scores aktualisiert: ${this.formatScore(payload.scores)}`;
      case 'result_shown':
        return `Ergebnis angezeigt (Score ${payload.totalScore}).`;
      case 'scenario_advance':
        return `Weiter von ${payload.from} → ${payload.to}.`;
      case 'game_complete':
        return `Spiel beendet als ${payload.profile || 'unbekannt'}.`;
      case 'game_restart':
        return 'Spiel neu gestartet.';
      case 'debug_jump_scenario':
        return `Debug: Sprung zu Szenario ${payload.target}.`;
      case 'debug_decision_prefill':
        return `Debug: Entscheidung ${payload.decisionId} vorbereitet${payload.submit ? ' & eingereicht' : ''}.`;
      default:
        return `${name}`;
    }
  }

  formatScore(scores = {}) {
    const empathy = scores.empathy ?? 0;
    const rights = scores.rights ?? 0;
    const participation = scores.participation ?? 0;
    const courage = scores.courage ?? 0;
    return `E${empathy} · R${rights} · P${participation} · Z${courage}`;
  }

  setStatus(message, tone = 'info') {
    if (!this.fields.status) return;

    this.fields.status.textContent = message;
    this.fields.status.classList.remove(
      'debug-status--warn',
      'debug-status--error',
      'debug-status--success'
    );

    if (tone === 'warn') {
      this.fields.status.classList.add('debug-status--warn');
    } else if (tone === 'error') {
      this.fields.status.classList.add('debug-status--error');
    } else if (tone === 'success') {
      this.fields.status.classList.add('debug-status--success');
    }

    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }

    this.statusTimeout = setTimeout(() => {
      this.fields.status.textContent = 'Bereit';
      this.fields.status.classList.remove(
        'debug-status--warn',
        'debug-status--error',
        'debug-status--success'
      );
    }, 4000);
  }

  escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.democracyGame = new DemocracyGame();

  // Expose debug methods in development
  const debugEnabled = window.democracyGame.isDebugMode();
  if (debugEnabled) {
    window.debugGame = () => window.democracyGame.debugGameState();
    window.exportGame = () => window.democracyGame.exportGameData();
    window.openGameDebug = () => window.democracyGame.debugTools?.togglePanel(true);
    console.log('🔧 Debugmodus aktiv: debugGame(), exportGame() oder openGameDebug() nutzen.');
  }
});
