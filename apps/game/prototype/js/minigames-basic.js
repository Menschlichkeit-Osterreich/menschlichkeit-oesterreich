/**
 * Democracy Metaverse - Mini-Games (Prototype)
 * 3 Core Mini-Games für interaktive Demokratie-Lernmodule
 *
 * 1. Fact-Check Speedrun - Media Literacy unter Zeitdruck
 * 2. Bridge Puzzle - Werte-Verbindungen mit Physics
 * 3. Debate Duel - Real-time Argumentation vs. AI
 */

class MiniGamesPrototype {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.currentGame = null;
    this.gameState = {};
    this.isActive = false;

    // Game Instances
    this.factCheck = new FactCheckSpeedrun(this);
    this.bridgePuzzle = new BridgePuzzle(this);
    this.debateDuel = new DebateDuel(this);

    console.log('🎮 Mini-Games System initialized');
  }

  /**
   * Start a mini-game
   */
  async startMiniGame(gameType, level, config = {}) {
    if (this.isActive) {
      throw new Error('Ein anderes Mini-Game läuft bereits!');
    }

    console.log(`🎯 Starting mini-game: ${gameType}`);

    this.isActive = true;
    this.currentGame = gameType;

    let gameInstance;
    switch (gameType) {
      case 'fact_check':
        gameInstance = this.factCheck;
        break;
      case 'bridge_puzzle':
        gameInstance = this.bridgePuzzle;
        break;
      case 'debate_duel':
        gameInstance = this.debateDuel;
        break;
      default:
        throw new Error(`Unbekanntes Mini-Game: ${gameType}`);
    }

    try {
      const result = await gameInstance.start(level, config);
      return result;
    } catch (error) {
      this.isActive = false;
      this.currentGame = null;
      throw error;
    }
  }

  /**
   * End current mini-game
   */
  endMiniGame(results = {}) {
    if (!this.isActive) return;

    console.log(`🏁 Mini-game ${this.currentGame} ended`, results);

    // Calculate rewards
    const rewards = this.calculateRewards(results);

    // Update game engine
    if (this.gameEngine) {
      this.gameEngine.triggerEvent('miniGameComplete', {
        game: this.currentGame,
        results,
        rewards,
      });
    }

    this.isActive = false;
    this.currentGame = null;

    return rewards;
  }

  /**
   * Calculate rewards based on performance
   */
  calculateRewards(results) {
    const baseRewards = {
      empathy: 0,
      rights: 0,
      participation: 0,
      courage: 0,
      experience: 10,
    };

    // Performance-based bonuses
    if (results.score >= 80) {
      baseRewards.experience += 15;
    }
    if (results.accuracy >= 90) {
      baseRewards.experience += 10;
    }
    if (results.timeBonus) {
      baseRewards.experience += 5;
    }

    // Game-specific value bonuses
    switch (this.currentGame) {
      case 'fact_check':
        baseRewards.rights += Math.floor(results.score / 20);
        baseRewards.courage += Math.floor(results.accuracy / 25);
        break;
      case 'bridge_puzzle':
        baseRewards.empathy += Math.floor(results.connectionsFound / 2);
        baseRewards.participation += Math.floor(results.score / 15);
        break;
      case 'debate_duel':
        baseRewards.courage += Math.floor(results.argumentsWon / 2);
        baseRewards.participation += Math.floor(results.score / 10);
        break;
    }

    return baseRewards;
  }
}

/**
 * MINI-GAME 1: Fact-Check Speedrun
 * Quellen-Verifikation unter Zeitdruck
 */
class FactCheckSpeedrun {
  constructor(parent) {
    this.parent = parent;
    this.timeLimit = 90; // 90 Sekunden
    this.currentClaims = [];
    this.playerAnswers = [];
    this.startTime = 0;
    this.timer = null;
  }

  async start(level, config = {}) {
    console.log(`🔍 Fact-Check Speedrun Level ${level} starting...`);

    // Generate claims for this level
    this.currentClaims = this.generateClaims(level, config.difficulty || 'normal');
    this.playerAnswers = [];
    this.startTime = Date.now();

    // Setup UI
    this.setupUI();

    // Start timer
    this.startTimer();

    return {
      game: 'fact_check',
      claims: this.currentClaims.map(claim => ({
        id: claim.id,
        text: claim.text,
        source: claim.source,
        context: claim.context,
      })),
      timeLimit: this.timeLimit,
    };
  }

  generateClaims(level, difficulty) {
    const claimBank = {
      1: [
        // Nachbarschaft
        {
          id: 1,
          text: 'In Österreich haben 89% der Menschen Vertrauen in ihre Nachbarn.',
          correct: false,
          source: 'Erfundene Statistik',
          realFact: 'Laut EU-Statistik haben etwa 67% Vertrauen in ihre Nachbarn.',
          context: 'Nachbarschaftsvertrauen',
          difficulty: 'easy',
        },
        {
          id: 2,
          text: 'Lärmbelästigung ist der häufigste Nachbarschaftskonflikt in Wien.',
          correct: true,
          source: 'Stadt Wien Bürgerbefragung 2023',
          context: 'Nachbarschaftskonflikte',
          difficulty: 'easy',
        },
        {
          id: 3,
          text: 'Hausordnungen sind rechtlich bindend für alle Mieter*innen.',
          correct: true,
          source: 'Österreichisches Mietrechtsgesetz',
          context: 'Rechtliche Grundlagen',
          difficulty: 'medium',
        },
        {
          id: 4,
          text: 'Ein Nachbarschaftsfest zu organisieren ist genehmigungspflichtig.',
          correct: false,
          source: 'Irreführende Behauptung',
          realFact: 'Nur bei öffentlichem Raum oder Straßensperrungen nötig.',
          context: 'Event-Organisation',
          difficulty: 'medium',
        },
        {
          id: 5,
          text: 'Geruchsbelästigung durch Kochen kann rechtlich verfolgt werden.',
          correct: false,
          source: 'Übertreibung',
          realFact: 'Nur bei extremer, dauerhafter Belästigung möglich.',
          context: 'Nachbarschaftsrecht',
          difficulty: 'hard',
        },
      ],
      2: [
        // Schule & Arbeit
        {
          id: 6,
          text: 'Der Gender Pay Gap in Österreich beträgt durchschnittlich 19,9%.',
          correct: true,
          source: 'Statistik Austria 2023',
          context: 'Arbeitsplatz-Gerechtigkeit',
          difficulty: 'medium',
        },
        {
          id: 7,
          text: 'Schüler*innenvertretungen haben kein Mitspracherecht bei Schulregeln.',
          correct: false,
          source: 'Falsche Behauptung',
          realFact: 'SchülerInnen haben Mitsprache bei Schulordnung laut Schulunterrichtsgesetz.',
          context: 'Schul-Demokratie',
          difficulty: 'easy',
        },
      ],
      3: [
        // Digital
        {
          id: 8,
          text: '86% der Fake News werden vor Wahlen verbreitet.',
          correct: false,
          source: 'Erfundene Statistik',
          realFact: 'Fake News sind ganzjährig präsent, verstärken sich aber vor Wahlen.',
          context: 'Desinformation',
          difficulty: 'hard',
        },
      ],
    };

    const levelClaims = claimBank[level] || claimBank[1];

    // Difficulty filtering
    let filteredClaims = levelClaims;
    if (difficulty === 'easy') {
      filteredClaims = levelClaims.filter(c => c.difficulty === 'easy');
    } else if (difficulty === 'hard') {
      filteredClaims = levelClaims.filter(c => c.difficulty !== 'easy');
    }

    // Shuffle and return 8-12 claims
    const shuffled = [...filteredClaims].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(12, shuffled.length));
  }

  setupUI() {
    const container = document.getElementById('game-screen');
    if (!container) return;

    container.innerHTML = `
            <div class="fact-check-game glass-panel">
                <div class="game-header">
                    <h3 class="game-title">🔍 Fact-Check Speedrun</h3>
                    <div class="game-stats">
                        <div class="timer-display" id="timer-display">
                            <span class="timer-icon">⏱️</span>
                            <span id="timer-value">${this.timeLimit}</span>
                        </div>
                        <div class="score-display">
                            <span class="score-icon">🎯</span>
                            <span id="score-value">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="claims-container" id="claims-container">
                    ${this.renderClaims()}
                </div>
                
                <div class="game-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                    <div class="progress-text">
                        <span id="claims-checked">0</span> / ${this.currentClaims.length} überprüft
                    </div>
                </div>
            </div>
        `;

    this.bindEvents();
  }

  renderClaims() {
    return this.currentClaims
      .map(
        claim => `
            <div class="claim-card glass-panel-secondary" data-claim-id="${claim.id}">
                <div class="claim-content">
                    <div class="claim-text">${claim.text}</div>
                    <div class="claim-source">
                        <strong>Quelle:</strong> ${claim.source}
                    </div>
                    <div class="claim-context">
                        <em>Kontext: ${claim.context}</em>
                    </div>
                </div>
                <div class="claim-actions">
                    <button class="claim-btn true-btn" data-answer="true" data-claim-id="${claim.id}">
                        ✅ Wahr
                    </button>
                    <button class="claim-btn false-btn" data-answer="false" data-claim-id="${claim.id}">
                        ❌ Falsch
                    </button>
                </div>
            </div>
        `
      )
      .join('');
  }

  bindEvents() {
    document.querySelectorAll('.claim-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        this.handleClaimAnswer(e.target);
      });
    });
  }

  handleClaimAnswer(button) {
    const claimId = parseInt(button.dataset.claimId);
    const answer = button.dataset.answer === 'true';
    const claim = this.currentClaims.find(c => c.id === claimId);

    if (!claim) return;

    // Record answer
    this.playerAnswers.push({
      claimId,
      answer,
      correct: answer === claim.correct,
      timestamp: Date.now() - this.startTime,
    });

    // Visual feedback
    const claimCard = button.closest('.claim-card');
    claimCard.classList.add(answer === claim.correct ? 'correct' : 'incorrect');

    // Disable buttons for this claim
    claimCard.querySelectorAll('.claim-btn').forEach(btn => {
      btn.disabled = true;
    });

    // Show correct answer if wrong
    if (answer !== claim.correct) {
      this.showCorrectAnswer(claimCard, claim);
    }

    this.updateProgress();

    // Check if game complete
    if (this.playerAnswers.length === this.currentClaims.length) {
      this.endGame();
    }
  }

  showCorrectAnswer(claimCard, claim) {
    const explanation = document.createElement('div');
    explanation.className = 'claim-explanation';
    explanation.innerHTML = `
            <div class="explanation-text">
                <strong>Richtige Antwort:</strong> ${claim.correct ? 'Wahr' : 'Falsch'}
            </div>
            ${claim.realFact ? `<div class="real-fact"><strong>Tatsache:</strong> ${claim.realFact}</div>` : ''}
        `;
    claimCard.appendChild(explanation);
  }

  startTimer() {
    this.timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const remaining = Math.max(0, this.timeLimit - elapsed);

      document.getElementById('timer-value').textContent = remaining;

      if (remaining === 0) {
        this.endGame();
      }

      // Visual warning at 20 seconds
      if (remaining <= 20) {
        document.getElementById('timer-display').classList.add('warning');
      }
    }, 1000);
  }

  updateProgress() {
    const progress = (this.playerAnswers.length / this.currentClaims.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('claims-checked').textContent = this.playerAnswers.length;

    // Update score
    const correctAnswers = this.playerAnswers.filter(a => a.correct).length;
    const score = Math.floor((correctAnswers / this.currentClaims.length) * 100);
    document.getElementById('score-value').textContent = score;
  }

  endGame() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    const totalTime = Date.now() - this.startTime;
    const correctAnswers = this.playerAnswers.filter(a => a.correct).length;
    const accuracy = (correctAnswers / this.currentClaims.length) * 100;
    const score = Math.floor(accuracy);
    const timeBonus = totalTime < this.timeLimit * 1000 * 0.8; // 80% of time limit

    const results = {
      score,
      accuracy,
      correctAnswers,
      totalAnswers: this.currentClaims.length,
      timeUsed: totalTime,
      timeBonus,
      averageResponseTime:
        this.playerAnswers.length > 0
          ? this.playerAnswers.reduce((sum, a) => sum + a.timestamp, 0) / this.playerAnswers.length
          : 0,
    };

    this.showResults(results);
    this.parent.endMiniGame(results);
  }

  showResults(results) {
    const container = document.getElementById('claims-container');
    container.innerHTML = `
            <div class="game-results glass-panel">
                <h3 class="results-title">🎯 Fact-Check Ergebnis</h3>
                
                <div class="results-grid">
                    <div class="result-item">
                        <div class="result-value">${results.score}%</div>
                        <div class="result-label">Genauigkeit</div>
                    </div>
                    <div class="result-item">
                        <div class="result-value">${results.correctAnswers}/${results.totalAnswers}</div>
                        <div class="result-label">Richtige Antworten</div>
                    </div>
                    <div class="result-item">
                        <div class="result-value">${Math.floor(results.timeUsed / 1000)}s</div>
                        <div class="result-label">Zeit verwendet</div>
                    </div>
                </div>
                
                <div class="achievement-badges">
                    ${results.accuracy >= 90 ? '<div class="badge expert">🏆 Experte</div>' : ''}
                    ${results.timeBonus ? '<div class="badge speedy">⚡ Blitzschnell</div>' : ''}
                    ${results.correctAnswers === results.totalAnswers ? '<div class="badge perfect">🌟 Perfekt</div>' : ''}
                </div>
                
                <div class="learning-summary">
                    <h4>Was du gelernt hast:</h4>
                    <ul>
                        <li>🔍 Quellen kritisch hinterfragen</li>
                        <li>📊 Statistiken auf Plausibilität prüfen</li>
                        <li>⏱️ Schnelle Fakten-Überprüfung</li>
                        <li>🎯 Kontext bei Informationen beachten</li>
                    </ul>
                </div>
                
                <div class="results-actions">
                    <button class="action-btn secondary" onclick="location.reload()">
                        🔄 Nochmal spielen
                    </button>
                    <button class="action-btn primary" onclick="gameEngine.completeLevel(gameEngine.currentLevel)">
                        ➡️ Weiter zum Level
                    </button>
                </div>
            </div>
        `;
  }
}

/**
 * MINI-GAME 2: Bridge Puzzle
 * Werte-Verbindungen mit Physics-Engine
 */
class BridgePuzzle {
  constructor(parent) {
    this.parent = parent;
    this.gridSize = 8;
    this.valueNodes = [];
    this.bridges = [];
    this.stabilityScore = 0;
    this.connectionsFound = 0;
  }

  async start(level, config = {}) {
    console.log(`🌉 Bridge Puzzle Level ${level} starting...`);

    this.generatePuzzle(level, config.difficulty || 'normal');
    this.setupUI();
    this.initPhysics();

    return {
      game: 'bridge_puzzle',
      gridSize: this.gridSize,
      valueNodes: this.valueNodes,
      objective: 'Verbinde demokratische Werte durch stabile Brücken',
    };
  }

  generatePuzzle(level, difficulty) {
    const valueTypes = ['empathy', 'rights', 'participation', 'courage'];
    const nodeCount = difficulty === 'hard' ? 12 : difficulty === 'easy' ? 6 : 8;

    this.valueNodes = [];

    // Generate value nodes
    for (let i = 0; i < nodeCount; i++) {
      const valueType = valueTypes[i % valueTypes.length];
      this.valueNodes.push({
        id: i,
        type: valueType,
        x: Math.random() * (this.gridSize - 2) + 1,
        y: Math.random() * (this.gridSize - 2) + 1,
        connections: [],
        strength: Math.random() * 50 + 50, // 50-100
      });
    }

    // Add some pre-defined connection challenges based on level
    if (level === 1) {
      // Nachbarschaft: Empathy <-> Participation
      this.addObjectiveConnection('empathy', 'participation');
    } else if (level === 2) {
      // Schule: Rights <-> Courage
      this.addObjectiveConnection('rights', 'courage');
    }
  }

  addObjectiveConnection(type1, type2) {
    const node1 = this.valueNodes.find(n => n.type === type1);
    const node2 = this.valueNodes.find(n => n.type === type2);

    if (node1 && node2) {
      node1.targetConnection = node2.id;
      node2.targetConnection = node1.id;
    }
  }

  setupUI() {
    const container = document.getElementById('game-screen');
    container.innerHTML = `
            <div class="bridge-puzzle-game glass-panel">
                <div class="game-header">
                    <h3 class="game-title">🌉 Bridge Puzzle</h3>
                    <div class="game-stats">
                        <div class="stability-meter">
                            <span>Stabilität:</span>
                            <div class="meter-bar">
                                <div class="meter-fill" id="stability-fill"></div>
                            </div>
                            <span id="stability-value">0%</span>
                        </div>
                    </div>
                </div>
                
                <div class="puzzle-instructions">
                    <p>Verbinde demokratische Werte durch Brücken. Stärkere Verbindungen führen zu einer stabileren Demokratie!</p>
                </div>
                
                <div class="puzzle-grid" id="puzzle-grid">
                    <!-- Grid wird dynamisch generiert -->
                </div>
                
                <div class="value-legend">
                    <div class="legend-item empathy">💜 Empathie</div>
                    <div class="legend-item rights">⚖️ Rechtsstaatlichkeit</div>
                    <div class="legend-item participation">🗳️ Partizipation</div>
                    <div class="legend-item courage">🦁 Zivilcourage</div>
                </div>
                
                <div class="puzzle-actions">
                    <button class="action-btn secondary" id="reset-puzzle">
                        🔄 Zurücksetzen
                    </button>
                    <button class="action-btn primary" id="check-solution">
                        ✅ Lösung prüfen
                    </button>
                </div>
            </div>
        `;

    this.renderGrid();
    this.bindEvents();
  }

  renderGrid() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';

    // Create grid cells
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        grid.appendChild(cell);
      }
    }

    // Place value nodes
    this.valueNodes.forEach(node => {
      const nodeElement = document.createElement('div');
      nodeElement.className = `value-node ${node.type}`;
      nodeElement.dataset.nodeId = node.id;
      nodeElement.style.gridColumn = Math.floor(node.x) + 1;
      nodeElement.style.gridRow = Math.floor(node.y) + 1;
      nodeElement.innerHTML = this.getValueIcon(node.type);
      nodeElement.title = `${this.getValueName(node.type)} (Stärke: ${Math.floor(node.strength)})`;

      grid.appendChild(nodeElement);
    });

    // Set grid layout
    grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
  }

  getValueIcon(type) {
    const icons = {
      empathy: '💜',
      rights: '⚖️',
      participation: '🗳️',
      courage: '🦁',
    };
    return icons[type] || '❓';
  }

  getValueName(type) {
    const names = {
      empathy: 'Empathie',
      rights: 'Rechtsstaatlichkeit',
      participation: 'Partizipation',
      courage: 'Zivilcourage',
    };
    return names[type] || 'Unbekannt';
  }

  bindEvents() {
    let selectedNode = null;

    document.querySelectorAll('.value-node').forEach(node => {
      node.addEventListener('click', e => {
        const nodeId = parseInt(e.target.dataset.nodeId);

        if (!selectedNode) {
          // First node selected
          selectedNode = nodeId;
          e.target.classList.add('selected');
        } else if (selectedNode === nodeId) {
          // Deselect same node
          selectedNode = null;
          e.target.classList.remove('selected');
        } else {
          // Connect nodes
          this.createBridge(selectedNode, nodeId);
          document.querySelector(`[data-node-id="${selectedNode}"]`).classList.remove('selected');
          selectedNode = null;
        }
      });
    });

    document.getElementById('reset-puzzle').addEventListener('click', () => {
      this.resetPuzzle();
    });

    document.getElementById('check-solution').addEventListener('click', () => {
      this.checkSolution();
    });
  }

  createBridge(nodeId1, nodeId2) {
    const node1 = this.valueNodes.find(n => n.id === nodeId1);
    const node2 = this.valueNodes.find(n => n.id === nodeId2);

    if (!node1 || !node2) return;

    // Check if bridge already exists
    if (node1.connections.includes(nodeId2)) return;

    // Calculate bridge strength based on value compatibility
    const strength = this.calculateBridgeStrength(node1, node2);

    // Create bridge
    const bridge = {
      id: this.bridges.length,
      from: nodeId1,
      to: nodeId2,
      strength,
    };

    this.bridges.push(bridge);
    node1.connections.push(nodeId2);
    node2.connections.push(nodeId1);

    // Visual bridge
    this.renderBridge(node1, node2, strength);

    // Update stability
    this.updateStability();
  }

  calculateBridgeStrength(node1, node2) {
    // Base strength from node strengths
    let strength = (node1.strength + node2.strength) / 2;

    // Value synergy bonuses
    const synergies = {
      'empathy-participation': 1.3,
      'rights-courage': 1.2,
      'participation-courage': 1.15,
      'empathy-rights': 1.1,
    };

    const combo1 = `${node1.type}-${node2.type}`;
    const combo2 = `${node2.type}-${node1.type}`;

    const synergyMultiplier = synergies[combo1] || synergies[combo2] || 1.0;
    strength *= synergyMultiplier;

    // Distance penalty (further nodes = weaker bridge)
    const distance = Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
    const distancePenalty = Math.max(0.5, 1 - distance / this.gridSize);
    strength *= distancePenalty;

    return Math.min(100, strength);
  }

  renderBridge(node1, node2, strength) {
    const grid = document.getElementById('puzzle-grid');
    const bridge = document.createElement('div');
    bridge.className = 'bridge-connection';

    // Calculate position and rotation
    const startX = ((node1.x + 0.5) / this.gridSize) * 100;
    const startY = ((node1.y + 0.5) / this.gridSize) * 100;
    const endX = ((node2.x + 0.5) / this.gridSize) * 100;
    const endY = ((node2.y + 0.5) / this.gridSize) * 100;

    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;

    bridge.style.position = 'absolute';
    bridge.style.left = `${startX}%`;
    bridge.style.top = `${startY}%`;
    bridge.style.width = `${length}%`;
    bridge.style.height = '4px';
    bridge.style.transformOrigin = '0 50%';
    bridge.style.transform = `rotate(${angle}deg)`;
    bridge.style.background = this.getBridgeColor(strength);
    bridge.style.opacity = strength / 100;
    bridge.title = `Brückenstärke: ${Math.floor(strength)}`;

    grid.appendChild(bridge);
  }

  getBridgeColor(strength) {
    if (strength >= 80) return 'var(--success-500)';
    if (strength >= 60) return 'var(--warning-400)';
    if (strength >= 40) return 'var(--warning-500)';
    return 'var(--error-500)';
  }

  updateStability() {
    // Calculate overall network stability
    const totalConnections = this.bridges.length;
    const avgStrength =
      totalConnections > 0
        ? this.bridges.reduce((sum, b) => sum + b.strength, 0) / totalConnections
        : 0;

    // Network connectivity bonus
    const networkBonus = this.calculateNetworkBonus();

    this.stabilityScore = Math.min(100, avgStrength * 0.7 + networkBonus * 0.3);

    // Update UI
    document.getElementById('stability-fill').style.width = `${this.stabilityScore}%`;
    document.getElementById('stability-value').textContent = `${Math.floor(this.stabilityScore)}%`;
  }

  calculateNetworkBonus() {
    // Check if all value types are connected in network
    const connectedNodes = new Set();
    const valueTypes = new Set();

    // DFS to find connected components
    if (this.bridges.length > 0) {
      const visited = new Set();
      const stack = [this.bridges[0].from];

      while (stack.length > 0) {
        const nodeId = stack.pop();
        if (visited.has(nodeId)) continue;

        visited.add(nodeId);
        connectedNodes.add(nodeId);

        const node = this.valueNodes.find(n => n.id === nodeId);
        if (node) valueTypes.add(node.type);

        // Add connected nodes to stack
        node.connections.forEach(connId => {
          if (!visited.has(connId)) {
            stack.push(connId);
          }
        });
      }
    }

    // Bonus based on network coverage
    const coverageBonus = (connectedNodes.size / this.valueNodes.length) * 50;
    const diversityBonus = (valueTypes.size / 4) * 50; // 4 value types

    return coverageBonus + diversityBonus;
  }

  resetPuzzle() {
    this.bridges = [];
    this.valueNodes.forEach(node => {
      node.connections = [];
    });
    this.stabilityScore = 0;

    // Remove bridge visuals
    document.querySelectorAll('.bridge-connection').forEach(bridge => bridge.remove());
    document.querySelectorAll('.value-node').forEach(node => node.classList.remove('selected'));

    this.updateStability();
  }

  checkSolution() {
    const results = {
      score: this.stabilityScore,
      connectionsFound: this.bridges.length,
      networkCoverage:
        (new Set(this.bridges.flatMap(b => [b.from, b.to])).size / this.valueNodes.length) * 100,
      avgBridgeStrength:
        this.bridges.length > 0
          ? this.bridges.reduce((sum, b) => sum + b.strength, 0) / this.bridges.length
          : 0,
    };

    this.showResults(results);
    this.parent.endMiniGame(results);
  }

  showResults(results) {
    const container = document.getElementById('puzzle-grid').parentElement;
    container.innerHTML = `
            <div class="game-results glass-panel">
                <h3 class="results-title">🌉 Bridge Puzzle Ergebnis</h3>
                
                <div class="results-grid">
                    <div class="result-item">
                        <div class="result-value">${Math.floor(results.score)}%</div>
                        <div class="result-label">Netzwerk-Stabilität</div>
                    </div>
                    <div class="result-item">
                        <div class="result-value">${results.connectionsFound}</div>
                        <div class="result-label">Brücken gebaut</div>
                    </div>
                    <div class="result-item">
                        <div class="result-value">${Math.floor(results.networkCoverage)}%</div>
                        <div class="result-label">Netzwerk-Abdeckung</div>
                    </div>
                </div>
                
                <div class="achievement-badges">
                    ${results.score >= 90 ? '<div class="badge architect">🏗️ Brücken-Architekt</div>' : ''}
                    ${results.networkCoverage >= 80 ? '<div class="badge connector">🔗 Super-Vernetzer</div>' : ''}
                    ${results.avgBridgeStrength >= 85 ? '<div class="badge engineer">⚙️ Qualitäts-Ingenieur</div>' : ''}
                </div>
                
                <div class="learning-summary">
                    <h4>Was du gelernt hast:</h4>
                    <ul>
                        <li>🤝 Demokratische Werte verstärken sich gegenseitig</li>
                        <li>🌐 Starke Netzwerke brauchen Vielfalt</li>
                        <li>⚖️ Balance zwischen verschiedenen Werten</li>
                        <li>🔧 Praktische Demokratie-Gestaltung</li>
                    </ul>
                </div>
                
                <div class="results-actions">
                    <button class="action-btn secondary" onclick="location.reload()">
                        🔄 Nochmal puzzeln
                    </button>
                    <button class="action-btn primary" onclick="gameEngine.completeLevel(gameEngine.currentLevel)">
                        ➡️ Weiter zum Level
                    </button>
                </div>
            </div>
        `;
  }
}

/**
 * MINI-GAME 3: Debate Duel
 * Real-time Argumentation vs. AI
 */
class DebateDuel {
  constructor(parent) {
    this.parent = parent;
    this.rounds = 5;
    this.currentRound = 0;
    this.playerScore = 0;
    this.aiScore = 0;
    this.audienceScore = 50; // 0-100, starts neutral
    this.debateTopic = null;
    this.playerArguments = [];
  }

  async start(level, config = {}) {
    console.log(`🗣️ Debate Duel Level ${level} starting...`);

    this.debateTopic = this.generateDebateTopic(level);
    this.setupUI();
    this.startRound();

    return {
      game: 'debate_duel',
      topic: this.debateTopic,
      rounds: this.rounds,
      objective: 'Überzeuge das Publikum mit starken Argumenten',
    };
  }

  generateDebateTopic(level) {
    const topics = {
      1: {
        title: 'Hausordnung vs. Persönliche Freiheit',
        description: 'Sollten Hausordnungen strenger durchgesetzt werden?',
        playerSide: 'Für mehr Flexibilität',
        aiSide: 'Für strikte Regeln',
        context: 'Nachbarschaftskonflikt',
      },
      2: {
        title: 'Schüler*innen-Mitbestimmung',
        description: 'Sollten Schüler*innen mehr Einfluss auf Schulregeln haben?',
        playerSide: 'Für mehr Partizipation',
        aiSide: 'Für Autorität der Schule',
        context: 'Schul-Demokratie',
      },
      3: {
        title: 'Social Media Regulierung',
        description: 'Brauchen wir stärkere Kontrolle von Social Media Plattformen?',
        playerSide: 'Für Meinungsfreiheit',
        aiSide: 'Für Regulierung',
        context: 'Digitale Rechte',
      },
    };

    return topics[level] || topics[1];
  }

  setupUI() {
    const container = document.getElementById('game-screen');
    container.innerHTML = `
            <div class="debate-duel-game glass-panel">
                <div class="debate-header">
                    <h3 class="game-title">🗣️ Debate Duel</h3>
                    <div class="debate-topic">
                        <h4>${this.debateTopic.title}</h4>
                        <p>${this.debateTopic.description}</p>
                    </div>
                </div>
                
                <div class="debate-arena">
                    <div class="debater player-side">
                        <div class="debater-avatar">👤</div>
                        <div class="debater-position">${this.debateTopic.playerSide}</div>
                        <div class="debater-score" id="player-score">${this.playerScore}</div>
                    </div>
                    
                    <div class="audience-meter">
                        <div class="audience-title">Publikum</div>
                        <div class="audience-bar">
                            <div class="audience-fill" id="audience-fill" style="width: 50%"></div>
                        </div>
                        <div class="audience-labels">
                            <span>Du</span>
                            <span>Neutral</span>
                            <span>KI</span>
                        </div>
                    </div>
                    
                    <div class="debater ai-side">
                        <div class="debater-avatar">🤖</div>
                        <div class="debater-position">${this.debateTopic.aiSide}</div>
                        <div class="debater-score" id="ai-score">${this.aiScore}</div>
                    </div>
                </div>
                
                <div class="round-info">
                    <span>Runde <span id="current-round">1</span> / ${this.rounds}</span>
                </div>
                
                <div class="argument-section" id="argument-section">
                    <!-- Wird dynamisch gefüllt -->
                </div>
                
                <div class="debate-log" id="debate-log">
                    <!-- Argument-Historie -->
                </div>
            </div>
        `;
  }

  startRound() {
    this.currentRound++;
    document.getElementById('current-round').textContent = this.currentRound;

    if (this.currentRound > this.rounds) {
      this.endGame();
      return;
    }

    // Generate argument options for player
    const argumentOptions = this.generateArgumentOptions();
    this.showArgumentOptions(argumentOptions);
  }

  generateArgumentOptions() {
    const options = {
      1: [
        // Nachbarschaft
        {
          id: 1,
          text: 'Nachbarn sollten mehr Verständnis füreinander zeigen',
          type: 'empathy',
          strength: 7,
          fallacy_risk: 'appeal_to_emotion',
        },
        {
          id: 2,
          text: 'Klare Regeln schaffen Sicherheit für alle',
          type: 'rights',
          strength: 8,
          fallacy_risk: 'false_security',
        },
        {
          id: 3,
          text: 'Gemeinsame Lösungen sind besser als einseitige Verbote',
          type: 'participation',
          strength: 9,
          fallacy_risk: 'false_compromise',
        },
      ],
      2: [
        // Schule
        {
          id: 4,
          text: 'Schüler*innen sind die Betroffenen und sollten mitreden',
          type: 'participation',
          strength: 8,
          fallacy_risk: 'appeal_to_consequence',
        },
        {
          id: 5,
          text: 'Demokratie muss gelernt und gelebt werden',
          type: 'courage',
          strength: 9,
          fallacy_risk: 'idealism',
        },
      ],
    };

    const roundOptions = options[Math.min(this.currentRound, 2)] || options[1];
    return [...roundOptions].sort(() => Math.random() - 0.5).slice(0, 3);
  }

  showArgumentOptions(options) {
    const section = document.getElementById('argument-section');
    section.innerHTML = `
            <div class="argument-prompt">
                <h4>Wähle dein Argument:</h4>
                <div class="argument-options">
                    ${options
                      .map(
                        option => `
                        <button class="argument-btn" data-argument-id="${option.id}">
                            <div class="argument-text">${option.text}</div>
                            <div class="argument-meta">
                                <span class="argument-type ${option.type}">${this.getArgumentTypeIcon(option.type)}</span>
                                <span class="argument-strength">Stärke: ${option.strength}/10</span>
                            </div>
                        </button>
                    `
                      )
                      .join('')}
                </div>
            </div>
        `;

    // Bind events
    document.querySelectorAll('.argument-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const argumentId = parseInt(e.currentTarget.dataset.argumentId);
        const argument = options.find(opt => opt.id === argumentId);
        this.handlePlayerArgument(argument);
      });
    });
  }

  getArgumentTypeIcon(type) {
    const icons = {
      empathy: '💜',
      rights: '⚖️',
      participation: '🗳️',
      courage: '🦁',
    };
    return icons[type] || '💭';
  }

  handlePlayerArgument(argument) {
    this.playerArguments.push(argument);

    // Add to debate log
    this.addToDebateLog('player', argument.text, argument.strength);

    // Calculate round score
    const playerRoundScore = this.calculateArgumentScore(argument);
    this.playerScore += playerRoundScore;

    // AI counter-argument
    setTimeout(() => {
      const aiArgument = this.generateAIArgument();
      this.addToDebateLog('ai', aiArgument.text, aiArgument.strength);

      const aiRoundScore = this.calculateArgumentScore(aiArgument);
      this.aiScore += aiRoundScore;

      // Update audience
      this.updateAudience(playerRoundScore, aiRoundScore);

      // Show round result
      this.showRoundResult(playerRoundScore, aiRoundScore, argument, aiArgument);

      // Next round after delay
      setTimeout(() => {
        this.startRound();
      }, 3000);
    }, 1500);

    // Update UI
    document.getElementById('player-score').textContent = this.playerScore;
  }

  generateAIArgument() {
    const aiArguments = [
      {
        text: 'Ohne klare Strukturen entstehen Chaos und Konflikte',
        strength: 8,
        type: 'authority',
      },
      {
        text: 'Erfahrung und Expertise sollten Entscheidungen leiten',
        strength: 7,
        type: 'expertise',
      },
      {
        text: 'Individuelle Wünsche können nicht immer berücksichtigt werden',
        strength: 6,
        type: 'pragmatism',
      },
      {
        text: 'Bewährte Systeme funktionieren besser als Experimente',
        strength: 7,
        type: 'tradition',
      },
    ];

    return aiArguments[Math.floor(Math.random() * aiArguments.length)];
  }

  calculateArgumentScore(argument) {
    let score = argument.strength;

    // Bonus for argument type based on current context
    if (this.currentRound <= 2 && argument.type === 'empathy') score += 2;
    if (this.currentRound >= 3 && argument.type === 'courage') score += 2;

    // Random factor for realism
    score += (Math.random() - 0.5) * 2;

    return Math.max(1, Math.min(10, Math.floor(score)));
  }

  updateAudience(playerScore, aiScore) {
    const scoreDiff = playerScore - aiScore;
    this.audienceScore += scoreDiff * 2;
    this.audienceScore = Math.max(0, Math.min(100, this.audienceScore));

    document.getElementById('audience-fill').style.width = `${this.audienceScore}%`;

    // Color based on audience lean
    const fill = document.getElementById('audience-fill');
    if (this.audienceScore > 60) {
      fill.style.background = 'var(--success-500)';
    } else if (this.audienceScore < 40) {
      fill.style.background = 'var(--error-500)';
    } else {
      fill.style.background = 'var(--warning-400)';
    }
  }

  addToDebateLog(speaker, text, strength) {
    const log = document.getElementById('debate-log');
    const entry = document.createElement('div');
    entry.className = `debate-entry ${speaker}`;
    entry.innerHTML = `
            <div class="entry-speaker">${speaker === 'player' ? '👤' : '🤖'}</div>
            <div class="entry-content">
                <div class="entry-text">${text}</div>
                <div class="entry-strength">Stärke: ${strength}/10</div>
            </div>
        `;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }

  showRoundResult(playerScore, aiScore, playerArg, aiArg) {
    const section = document.getElementById('argument-section');
    const winner = playerScore > aiScore ? 'Du' : aiScore > playerScore ? 'KI' : 'Unentschieden';

    section.innerHTML = `
            <div class="round-result glass-panel-secondary">
                <h4>Runde ${this.currentRound} Ergebnis</h4>
                <div class="result-comparison">
                    <div class="result-item player">
                        <div class="result-score">${playerScore}</div>
                        <div class="result-text">${playerArg.text}</div>
                    </div>
                    <div class="result-vs">VS</div>
                    <div class="result-item ai">
                        <div class="result-score">${aiScore}</div>
                        <div class="result-text">${aiArg.text}</div>
                    </div>
                </div>
                <div class="round-winner">${winner} gewinnt diese Runde!</div>
            </div>
        `;
  }

  endGame() {
    const results = {
      score: this.playerScore,
      aiScore: this.aiScore,
      audienceSupport: this.audienceScore,
      argumentsWon: this.playerArguments.filter((arg, index) => {
        // Simplified win calculation
        return arg.strength >= 7;
      }).length,
      totalArguments: this.rounds,
      debateQuality: this.calculateDebateQuality(),
    };

    this.showResults(results);
    this.parent.endMiniGame(results);
  }

  calculateDebateQuality() {
    // Based on argument diversity and strength
    const avgStrength =
      this.playerArguments.reduce((sum, arg) => sum + arg.strength, 0) /
      this.playerArguments.length;
    const typesDiversity = new Set(this.playerArguments.map(arg => arg.type)).size;

    return Math.floor(avgStrength * 5 + typesDiversity * 10);
  }

  showResults(results) {
    const container = document.getElementById('argument-section').parentElement;
    const victory =
      results.audienceSupport > 60 ? 'victory' : results.audienceSupport < 40 ? 'defeat' : 'draw';

    container.innerHTML = `
            <div class="game-results glass-panel ${victory}">
                <h3 class="results-title">🗣️ Debate Duel Ergebnis</h3>
                
                <div class="final-verdict">
                    ${
                      victory === 'victory'
                        ? '🏆 Du hast das Publikum überzeugt!'
                        : victory === 'defeat'
                          ? '😔 Die KI war überzeugender.'
                          : '🤝 Unentschieden - beide Seiten hatten gute Punkte!'
                    }
                </div>
                
                <div class="results-grid">
                    <div class="result-item">
                        <div class="result-value">${results.score}</div>
                        <div class="result-label">Deine Punkte</div>
                    </div>
                    <div class="result-item">
                        <div class="result-value">${Math.floor(results.audienceSupport)}%</div>
                        <div class="result-label">Publikums-Unterstützung</div>
                    </div>
                    <div class="result-item">
                        <div class="result-value">${results.argumentsWon}/${results.totalArguments}</div>
                        <div class="result-label">Starke Argumente</div>
                    </div>
                </div>
                
                <div class="achievement-badges">
                    ${results.audienceSupport >= 80 ? '<div class="badge orator">🎤 Meister-Redner</div>' : ''}
                    ${results.argumentsWon === results.totalArguments ? '<div class="badge logical">🧠 Logik-Genie</div>' : ''}
                    ${results.debateQuality >= 80 ? '<div class="badge quality">⭐ Qualitäts-Debattierer</div>' : ''}
                </div>
                
                <div class="learning-summary">
                    <h4>Was du gelernt hast:</h4>
                    <ul>
                        <li>💭 Starke Argumente strukturiert aufbauen</li>
                        <li>👥 Verschiedene Perspektiven berücksichtigen</li>
                        <li>🎯 Zielgruppen-orientiert kommunizieren</li>
                        <li>⚖️ Demokratischen Diskurs führen</li>
                    </ul>
                </div>
                
                <div class="results-actions">
                    <button class="action-btn secondary" onclick="location.reload()">
                        🔄 Neue Debatte
                    </button>
                    <button class="action-btn primary" onclick="gameEngine.completeLevel(gameEngine.currentLevel)">
                        ➡️ Weiter zum Level
                    </button>
                </div>
            </div>
        `;
  }
}

// Initialize Mini-Games System
if (typeof window !== 'undefined') {
  window.miniGames = null;

  document.addEventListener('DOMContentLoaded', () => {
    // Wait for game engine to be ready
    const initMiniGames = () => {
      if (window.gameEngine && window.gameEngine.isInitialized) {
        window.miniGames = new MiniGamesPrototype(window.gameEngine);
        console.log('✅ Mini-Games System ready!');
      } else {
        setTimeout(initMiniGames, 100);
      }
    };

    initMiniGames();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MiniGamesPrototype, FactCheckSpeedrun, BridgePuzzle, DebateDuel };
}
