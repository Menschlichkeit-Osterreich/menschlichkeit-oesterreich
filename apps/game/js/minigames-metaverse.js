/* ==========================================================================
   Democracy Metaverse - Enhanced Mini-Game System
   7 Core Mini-Games with Adaptive Difficulty and Learning Analytics
   ========================================================================== */

class MinigamePool {
  constructor() {
    this.games = new Map();
    this.difficultyAdaptation = new DifficultyAdapter();
    this.analytics = new MinigameAnalytics();

    this.registerMinigames();
  }

  registerMinigames() {
    // Register all 7 core mini-games
    this.games.set('fact_check_speedrun', new FactCheckSpeedrun());
    this.games.set('bridge_puzzle', new BridgePuzzle());
    this.games.set('debate_duel', new DebateDuel());
    this.games.set('city_simulation', new CitySimulation());
    this.games.set('crisis_council', new CrisisCouncil());
    this.games.set('dialogue_rpg', new DialogueRPG());
    this.games.set('network_analysis', new NetworkAnalysis());
  }

  startMinigame(gameId, context) {
    const game = this.games.get(gameId);
    if (!game) throw new Error(`Minigame ${gameId} not found`);

    // Adapt difficulty based on player performance
    const difficulty = this.difficultyAdaptation.calculateDifficulty(
      gameId,
      context.playerStats,
      context.recentPerformance
    );

    // Initialize game with context
    return game.start({
      ...context,
      difficulty: difficulty,
      onComplete: results => this.handleCompletion(gameId, results),
      onProgress: progress => this.analytics.trackProgress(gameId, progress),
    });
  }
}

/* ==========================================================================
   1. FACT-CHECK SPEEDRUN
   Rapid source verification and bias detection
   ========================================================================== */

class FactCheckSpeedrun {
  constructor() {
    this.timeLimit = 90; // seconds
    this.currentClaims = [];
    this.score = 0;
    this.accuracy = 0;
  }

  start(config) {
    this.difficulty = config.difficulty;
    this.generateClaims(config);

    return {
      type: 'fact_check_speedrun',
      title: 'Fakten-Check Speedrun',
      instructions: 'Prüfe so viele Behauptungen wie möglich auf Wahrheitsgehalt!',
      timeLimit: this.timeLimit,
      interface: this.createInterface(),
      scoring: {
        correctFacts: 10,
        correctFakes: 15,
        speedBonus: 5,
        accuracyBonus: 20,
      },
    };
  }

  generateClaims(config) {
    const claimTypes = [
      'statistical_manipulation',
      'source_misattribution',
      'context_stripping',
      'correlation_causation',
      'cherry_picking',
      'deepfake_detection',
      'bot_generated_content',
    ];

    // Generate claims based on current level context
    this.currentClaims = claimTypes
      .slice(0, Math.min(8, 3 + config.difficulty))
      .map(type => this.generateClaim(type, config));
  }

  generateClaim(type, context) {
    const claimDatabase = {
      statistical_manipulation: {
        true: 'Die Arbeitslosigkeit ist in den letzten 5 Jahren um 12% gesunken',
        fake: '98% aller Statistiken werden frei erfunden',
        sources: ['Statistik Austria', 'AMS Österreich', 'OECD Employment Outlook'],
        difficulty: 2,
      },
      deepfake_detection: {
        true: 'Bundeskanzler hält Rede im Parlament',
        fake: 'Bundeskanzler singt Karaoke in seinem Büro',
        sources: ['ORF Livestream', 'Parliament.gv.at', 'Suspicious TikTok Account'],
        difficulty: 4,
        requires_visual_analysis: true,
      },
    };

    return {
      id: Math.random().toString(36),
      type: type,
      claim: claimDatabase[type][Math.random() > 0.5 ? 'true' : 'fake'],
      isTrue: Math.random() > 0.5,
      sources: claimDatabase[type].sources,
      difficulty: claimDatabase[type].difficulty,
      context: context.currentLevel,
    };
  }

  createInterface() {
    return `
      <div class="fact-check-speedrun">
        <div class="timer-display">
          <div class="timer-bar"></div>
          <span class="time-remaining">${this.timeLimit}s</span>
        </div>
        
        <div class="claim-container">
          <div class="claim-text" id="current-claim"></div>
          <div class="source-indicators">
            <div class="source-list" id="available-sources"></div>
            <div class="credibility-meter"></div>
          </div>
        </div>
        
        <div class="fact-check-controls">
          <button class="verdict-btn true" data-verdict="true">
            ✓ Wahr
          </button>
          <button class="verdict-btn fake" data-verdict="false">  
            ✗ Falsch
          </button>
          <button class="skip-btn">
            → Überspringen
          </button>
        </div>
        
        <div class="speedrun-stats">
          <span class="score">Score: <span id="current-score">0</span></span>
          <span class="accuracy">Genauigkeit: <span id="accuracy-rate">100%</span></span>
          <span class="streak">Serie: <span id="current-streak">0</span></span>
        </div>
      </div>
    `;
  }

  handleVerdict(claimId, playerVerdict) {
    const claim = this.currentClaims.find(c => c.id === claimId);
    const correct = claim.isTrue === playerVerdict;

    if (correct) {
      this.score += claim.isTrue ? 10 : 15; // Harder to spot fakes
      this.streak++;
    } else {
      this.streak = 0;
      this.accuracy = this.calculateAccuracy();
    }

    return {
      correct: correct,
      explanation: this.generateExplanation(claim),
      scoreGained: correct ? (claim.isTrue ? 10 : 15) : 0,
      nextClaim: this.getNextClaim(),
    };
  }
}

/* ==========================================================================
   2. BRIDGE PUZZLE 
   Connect democratic values while avoiding contradictions
   ========================================================================== */

class BridgePuzzle {
  constructor() {
    this.gridSize = 8;
    this.values = ['E', 'R', 'P', 'Z']; // Empathy, Rights, Participation, Courage
    this.bridges = [];
    this.cracks = [];
  }

  start(_config) {
    return {
      type: 'bridge_puzzle',
      title: 'Brücken der Demokratie',
      instructions: 'Verbinde alle Werte-Inseln mit stabilen Brücken!',
      interface: this.createPuzzleGrid(),
      mechanics: {
        drag_and_drop: true,
        physics_simulation: true,
        stress_testing: true,
      },
    };
  }

  createPuzzleGrid() {
    return `
      <div class="bridge-puzzle">
        <div class="puzzle-header">
          <div class="construction-materials">
            <div class="material empathy" data-value="E">💜 Empathie</div>
            <div class="material rights" data-value="R">⚖️ Rechte</div>
            <div class="material participation" data-value="P">🗳️ Teilhabe</div>
            <div class="material courage" data-value="Z">🦁 Mut</div>
          </div>
        </div>
        
        <div class="puzzle-grid" id="bridge-grid">
          <!-- 8x8 grid generated dynamically -->
        </div>
        
        <div class="bridge-controls">
          <button class="test-stability">🔧 Stabilität testen</button>
          <button class="clear-bridges">🗑️ Zurücksetzen</button>
          <div class="stability-meter">
            <div class="meter-fill"></div>
            <span class="stability-text">Stabilität: 0%</span>
          </div>
        </div>
      </div>
    `;
  }

  calculateStability(bridges) {
    let totalStability = 0;

    bridges.forEach(bridge => {
      // Check for value conflicts
      const conflicts = this.detectValueConflicts(bridge);
      const supportStrength = this.calculateSupport(bridge);
      const connectionQuality = this.analyzeConnections(bridge);

      const bridgeStability = (supportStrength + connectionQuality - conflicts) / 3;
      totalStability += Math.max(0, bridgeStability);
    });

    return Math.min(100, (totalStability / bridges.length) * 100);
  }

  detectValueConflicts(bridge) {
    // Example: Connecting "Courage" directly to "Rights" without "Empathy" support
    // creates unstable bridge (oversimplified activism)
    const conflictPatterns = {
      'Z-R-no-E': 0.3, // Courage + Rights without Empathy = rigid activism
      'P-E-no-R': 0.2, // Participation + Empathy without Rights = populism risk
      'R-P-no-Z': 0.4, // Rights + Participation without Courage = weak implementation
    };

    return this.analyzePattern(bridge, conflictPatterns);
  }
}

/* ==========================================================================
   3. DEBATE DUEL
   Real-time argumentation with fallacy detection
   ========================================================================== */

class DebateDuel {
  constructor() {
    this.turnTimeLimit = 30;
    this.maxRounds = 5;
    this.currentRound = 0;
    this.playerArguments = [];
    this.opponentArguments = [];
  }

  start(config) {
    this.opponent = this.createOpponent(config.bossType || 'populist');
    this.topic = config.debateTopic || this.generateTopic(config);

    return {
      type: 'debate_duel',
      title: 'Demokratie-Debatte',
      instructions: 'Überzeuze mit starken Argumenten und entlarve Fehlschlüsse!',
      opponent: this.opponent,
      topic: this.topic,
      interface: this.createDebateInterface(),
    };
  }

  createOpponent(type) {
    const opponents = {
      populist: {
        name: 'Der Vereinfacher',
        avatar: '👨‍💼',
        tactics: ['false_dichotomy', 'ad_hominem', 'straw_man'],
        personality: 'aggressive',
        weakness: 'complexity_exposure',
      },
      demagogue: {
        name: 'Die Angstmacherin',
        avatar: '👩‍⚖️',
        tactics: ['fear_appeal', 'slippery_slope', 'bandwagon'],
        personality: 'manipulative',
        weakness: 'fact_checking',
      },
      lobbyist: {
        name: 'Der Interessenvertreter',
        avatar: '👔',
        tactics: ['cherry_picking', 'authority_fallacy', 'red_herring'],
        personality: 'calculating',
        weakness: 'transparency_demand',
      },
    };

    return opponents[type] || opponents.populist;
  }

  createDebateInterface() {
    return `
      <div class="debate-duel">
        <div class="debate-stage">
          <div class="opponent-side">
            <div class="avatar">${this.opponent.avatar}</div>
            <div class="name">${this.opponent.name}</div>
            <div class="argument-bubble" id="opponent-argument"></div>
          </div>
          
          <div class="vs-indicator">VS</div>
          
          <div class="player-side">
            <div class="avatar">👤</div>
            <div class="name">Du</div>
            <div class="argument-input">
              <textarea placeholder="Dein Argument..." id="player-argument"></textarea>
              <div class="argument-tools">
                <button class="fallacy-detector">🔍 Fehlschluss entlarven</button>
                <button class="fact-check">✓ Fakten prüfen</button>
                <button class="empathy-bridge">💜 Empathie zeigen</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="debate-progress">
          <div class="round-indicator">Runde ${this.currentRound}/${this.maxRounds}</div>
          <div class="persuasion-meter">
            <div class="meter-bar">
              <div class="player-progress"></div>
              <div class="opponent-progress"></div>
            </div>
            <div class="meter-labels">
              <span>Du</span>
              <span>Publikum</span>
              <span>${this.opponent.name}</span>
            </div>
          </div>
          <div class="time-remaining">${this.turnTimeLimit}s</div>
        </div>
      </div>
    `;
  }

  processArgument(playerArgument, tool) {
    const analysis = this.analyzeArgument(playerArgument);
    const toolEffectiveness = this.calculateToolEffect(tool, analysis);
    const opponentResponse = this.generateOpponentResponse(playerArgument, tool);

    return {
      argumentStrength: analysis.strength,
      toolEffect: toolEffectiveness,
      audienceReaction: this.calculateAudienceReaction(analysis, toolEffectiveness),
      opponentResponse: opponentResponse,
      roundWinner: this.determineRoundWinner(analysis, opponentResponse),
    };
  }
}

/* ==========================================================================
   4. CITY SIMULATION
   Resource management with stakeholder balance
   ========================================================================== */

class CitySimulation {
  constructor() {
    this.budget = 1000000; // 1 Million Euro
    this.satisfaction = {
      citizens: 50,
      business: 50,
      environment: 50,
      future_generations: 50,
    };
    this.projects = [];
  }

  start(config) {
    this.scenario = config.scenario || 'budget_allocation';
    this.timeLimit = config.timeLimit || 300; // 5 minutes

    return {
      type: 'city_simulation',
      title: 'Stadt der Zukunft',
      instructions: 'Verwalte das Budget gerecht und nachhaltig!',
      interface: this.createSimInterface(),
      realTime: true,
    };
  }

  createSimInterface() {
    return `
      <div class="city-simulation">
        <div class="city-overview">
          <div class="budget-display">
            💰 Budget: <span id="remaining-budget">${this.budget.toLocaleString()}€</span>
          </div>
          <div class="satisfaction-dashboard">
            <div class="satisfaction-meter citizens">
              👥 Bürger*innen: <span class="meter-bar"><span style="width: 50%"></span></span> 50%
            </div>
            <div class="satisfaction-meter business">
              🏢 Wirtschaft: <span class="meter-bar"><span style="width: 50%"></span></span> 50%
            </div>
            <div class="satisfaction-meter environment">
              🌱 Umwelt: <span class="meter-bar"><span style="width: 50%"></span></span> 50%
            </div>
            <div class="satisfaction-meter future">
              👶 Zukunft: <span class="meter-bar"><span style="width: 50%"></span></span> 50%
            </div>
          </div>
        </div>
        
        <div class="project-selection">
          <h3>Verfügbare Projekte</h3>
          <div class="project-cards" id="available-projects">
            <!-- Generated dynamically based on scenario -->
          </div>
        </div>
        
        <div class="stakeholder-feedback">
          <div class="feedback-panel" id="live-feedback">
            <!-- Real-time reactions from different groups -->
          </div>
        </div>
      </div>
    `;
  }

  generateProjects(scenario) {
    const projectDatabase = {
      budget_allocation: [
        {
          name: 'Neue Fahrradwege',
          cost: 200000,
          effects: { citizens: +15, environment: +20, business: -5, future: +10 },
          description: 'Nachhaltige Mobilität fördern',
        },
        {
          name: 'Wirtschaftsförderung',
          cost: 300000,
          effects: { citizens: +5, environment: -10, business: +25, future: -5 },
          description: 'Arbeitsplätze schaffen',
        },
        {
          name: 'Soziale Wohnungen',
          cost: 400000,
          effects: { citizens: +20, environment: 0, business: -10, future: +5 },
          description: 'Bezahlbaren Wohnraum schaffen',
        },
        // ... more projects
      ],
    };

    return projectDatabase[scenario] || [];
  }
}

/* ==========================================================================
   5. CRISIS COUNCIL
   Emergency decision-making under pressure with ethical dilemmas
   ========================================================================== */

class CrisisCouncil {
  constructor() {
    this.timeLimit = 180; // 3 minutes crisis response time
    this.resources = {
      personnel: 100,
      budget: 500000,
      publicTrust: 75,
      internationalSupport: 50,
    };
    this.stakeholders = ['citizens', 'media', 'experts', 'politicians', 'international'];
    this.currentCrisis = null;
  }

  start(config) {
    this.crisis = this.generateCrisis(config.crisisType || 'pandemic');
    this.difficulty = config.difficulty || 3;

    return {
      type: 'crisis_council',
      title: 'Krisenstab Simulation',
      instructions: 'Treffe schwierige Entscheidungen unter Zeitdruck!',
      crisis: this.crisis,
      timeLimit: this.timeLimit,
      interface: this.createCrisisInterface(),
    };
  }

  generateCrisis(type) {
    const crisisTypes = {
      pandemic: {
        name: 'Gesundheitskrise',
        description: 'Ein neues Virus breitet sich rasant aus',
        urgentDecisions: [
          {
            id: 'lockdown_decision',
            title: 'Lockdown verhängen?',
            options: [
              {
                id: 'full_lockdown',
                text: 'Vollständiger Lockdown',
                effects: { health: +30, economy: -25, freedom: -20, trust: -5 },
              },
              {
                id: 'partial_lockdown',
                text: 'Teilweiser Lockdown',
                effects: { health: +15, economy: -10, freedom: -10, trust: +5 },
              },
              {
                id: 'voluntary_measures',
                text: 'Freiwillige Maßnahmen',
                effects: { health: -5, economy: +5, freedom: +15, trust: +10 },
              },
            ],
            timeLimit: 45,
            pressure: 'high',
          },
          {
            id: 'resource_allocation',
            title: 'Ressourcen-Verteilung',
            options: [
              {
                id: 'healthcare_priority',
                text: 'Gesundheitssystem stärken',
                effects: { health: +20, economy: -15, education: -10 },
              },
              {
                id: 'economy_support',
                text: 'Wirtschaftshilfen',
                effects: { health: -5, economy: +20, unemployment: -15 },
              },
              {
                id: 'balanced_approach',
                text: 'Ausgewogener Ansatz',
                effects: { health: +10, economy: +5, trust: +10 },
              },
            ],
            timeLimit: 60,
            pressure: 'medium',
          },
        ],
        metrics: ['health', 'economy', 'freedom', 'trust', 'international_reputation'],
      },

      climate: {
        name: 'Klimakrise',
        description: 'Extremwetter bedroht die Stadt',
        urgentDecisions: [
          {
            id: 'evacuation_decision',
            title: 'Evakuierung anordnen?',
            options: [
              {
                id: 'mandatory_evacuation',
                text: 'Zwangsevakuierung',
                effects: { safety: +25, economy: -20, trust: -10 },
              },
              {
                id: 'voluntary_evacuation',
                text: 'Freiwillige Evakuierung',
                effects: { safety: +10, economy: -5, trust: +5 },
              },
              {
                id: 'shelter_in_place',
                text: 'Vor Ort bleiben',
                effects: { safety: -15, economy: +10, trust: +15 },
              },
            ],
            timeLimit: 30,
            pressure: 'extreme',
          },
        ],
        metrics: ['safety', 'environment', 'economy', 'preparedness'],
      },
    };

    return crisisTypes[type] || crisisTypes.pandemic;
  }

  createCrisisInterface() {
    return `
      <div class="crisis-council">
        <div class="crisis-header">
          <div class="crisis-title">${this.crisis.name}</div>
          <div class="crisis-timer">
            <div class="timer-circle">
              <span id="crisis-countdown">${this.timeLimit}</span>s
            </div>
          </div>
        </div>
        
        <div class="crisis-situation">
          <div class="situation-brief">
            <h3>🚨 Lageeinschätzung</h3>
            <p>${this.crisis.description}</p>
          </div>
          
          <div class="resource-status">
            <div class="resource personnel">👥 Personal: <span>${this.resources.personnel}%</span></div>
            <div class="resource budget">💰 Budget: <span>${this.resources.budget.toLocaleString()}€</span></div>
            <div class="resource trust">🤝 Vertrauen: <span>${this.resources.publicTrust}%</span></div>
            <div class="resource support">🌍 Int. Unterstützung: <span>${this.resources.internationalSupport}%</span></div>
          </div>
        </div>
        
        <div class="decision-panel" id="current-decision">
          <!-- Dynamic decision content -->
        </div>
        
        <div class="stakeholder-reactions">
          <div class="reaction-feed" id="stakeholder-feed">
            <!-- Live reactions from different groups -->
          </div>
        </div>
        
        <div class="crisis-metrics">
          <div class="metrics-grid" id="crisis-metrics">
            <!-- Real-time impact visualization -->
          </div>
        </div>
      </div>
    `;
  }

  processDecision(decisionId, optionId) {
    const decision = this.crisis.urgentDecisions.find(d => d.id === decisionId);
    const option = decision.options.find(o => o.id === optionId);

    // Apply effects to resources and metrics
    Object.entries(option.effects).forEach(([metric, change]) => {
      if (this.resources[metric] !== undefined) {
        this.resources[metric] = Math.max(0, Math.min(100, this.resources[metric] + change));
      }
    });

    // Generate stakeholder reactions
    const reactions = this.generateStakeholderReactions(option);

    // Calculate cascading effects
    const cascadingEffects = this.calculateCascadingEffects(option);

    return {
      decision: option,
      immediateEffects: option.effects,
      cascadingEffects: cascadingEffects,
      stakeholderReactions: reactions,
      newResourceLevels: { ...this.resources },
      nextDecision: this.getNextDecision(),
    };
  }
}

/* ==========================================================================
   6. DIALOGUE RPG
   Character-driven conversations with emotion tracking and empathy building
   ========================================================================== */

class DialogueRPG {
  constructor() {
    this.characters = new Map();
    this.conversationTree = null;
    this.emotionalStates = new Map();
    this.relationshipLevels = new Map();
    this.currentScene = null;
  }

  start(config) {
    this.scenario = config.scenario || 'community_conflict';
    this.characters = this.generateCharacters(this.scenario);
    this.conversationTree = this.buildConversationTree(this.scenario);

    return {
      type: 'dialogue_rpg',
      title: 'Bürgerdialog Simulator',
      instructions: 'Führe empathische Gespräche und löse Konflikte!',
      scenario: this.scenario,
      interface: this.createDialogueInterface(),
    };
  }

  generateCharacters(scenario) {
    const characterDatabase = {
      community_conflict: [
        {
          id: 'concerned_parent',
          name: 'Maria Huber',
          avatar: '👩‍👧‍👦',
          background: 'Alleinerziehende Mutter, sorgt sich um Schulweg',
          personality: ['worried', 'protective', 'pragmatic'],
          emotionalState: 'anxious',
          concerns: ['child_safety', 'traffic', 'community_future'],
          relationship: 0,
          trustLevel: 'neutral',
        },
        {
          id: 'business_owner',
          name: 'Robert Schmidt',
          avatar: '👨‍💼',
          background: 'Inhaber eines lokalen Geschäfts',
          personality: ['practical', 'stressed', 'community_minded'],
          emotionalState: 'frustrated',
          concerns: ['business_impact', 'parking', 'customer_access'],
          relationship: 0,
          trustLevel: 'skeptical',
        },
        {
          id: 'elderly_resident',
          name: 'Anna Kirchner',
          avatar: '👵',
          background: 'Langjährige Bewohnerin, Seniorenvertreterin',
          personality: ['wise', 'traditional', 'caring'],
          emotionalState: 'concerned',
          concerns: ['accessibility', 'community_cohesion', 'quality_of_life'],
          relationship: 0,
          trustLevel: 'cautious',
        },
        {
          id: 'young_activist',
          name: 'Jonas Weber',
          avatar: '🧑‍🎓',
          background: 'Student, Klimaaktivist',
          personality: ['passionate', 'idealistic', 'impatient'],
          emotionalState: 'energetic',
          concerns: ['climate_action', 'future_generations', 'systemic_change'],
          relationship: 0,
          trustLevel: 'hopeful',
        },
      ],
    };

    return new Map(characterDatabase[scenario].map(char => [char.id, char]));
  }

  createDialogueInterface() {
    return `
      <div class="dialogue-rpg">
        <div class="scene-setting">
          <div class="scene-description" id="scene-description">
            Bürgerdialog zur geplanten Verkehrsberuhigung in der Hauptstraße
          </div>
          <div class="scene-atmosphere" id="scene-atmosphere">
            Angespannte Stimmung im Gemeindezentrum...
          </div>
        </div>
        
        <div class="conversation-area">
          <div class="character-panel">
            <div class="active-character" id="current-speaker">
              <!-- Character info and emotion display -->
            </div>
            <div class="other-characters">
              <div class="character-grid" id="all-characters">
                <!-- All characters with relationship indicators -->
              </div>
            </div>
          </div>
          
          <div class="dialogue-content">
            <div class="speech-bubble" id="character-speech">
              <!-- Character's current statement -->
            </div>
            
            <div class="response-options" id="player-responses">
              <!-- Player's response choices with tone indicators -->
            </div>
          </div>
        </div>
        
        <div class="empathy-tools">
          <div class="emotional-intelligence">
            <button class="empathy-action listen" data-action="active_listening">
              👂 Aktiv zuhören
            </button>
            <button class="empathy-action validate" data-action="validate_feelings">
              💜 Gefühle anerkennen  
            </button>
            <button class="empathy-action reframe" data-action="reframe_perspective">
              🔄 Perspektive erweitern
            </button>
            <button class="empathy-action bridge" data-action="find_common_ground">
              🤝 Gemeinsamkeiten finden
            </button>
          </div>
        </div>
        
        <div class="relationship-tracker">
          <div class="relationship-meters" id="relationship-status">
            <!-- Real-time relationship and trust levels -->
          </div>
          <div class="group-harmony" id="group-dynamics">
            Gruppendynamik: <span class="harmony-level">Gespannt</span>
          </div>
        </div>
      </div>
    `;
  }

  processDialogueChoice(characterId, responseId, empathyAction) {
    const character = this.characters.get(characterId);
    const response = this.getResponseById(responseId);

    // Analyze emotional impact
    const emotionalImpact = this.analyzeEmotionalImpact(response, character, empathyAction);

    // Update relationship levels
    this.updateRelationship(characterId, emotionalImpact);

    // Generate character reaction
    const characterReaction = this.generateCharacterReaction(character, response, emotionalImpact);

    // Update conversation tree state
    this.advanceConversation(responseId, characterReaction);

    return {
      emotionalImpact: emotionalImpact,
      relationshipChange: this.getRelationshipChange(characterId),
      characterReaction: characterReaction,
      groupDynamics: this.calculateGroupDynamics(),
      nextDialogueOptions: this.getNextDialogueOptions(),
    };
  }
}

/* ==========================================================================
   7. NETWORK ANALYSIS
   Social network visualization and manipulation detection
   ========================================================================== */

class NetworkAnalysis {
  constructor() {
    this.socialGraph = null;
    this.botDetectionEngine = new BotDetector();
    this.influenceMetrics = new InfluenceCalculator();
    this.echoChambersDetected = [];
  }

  start(config) {
    this.network = this.generateSocialNetwork(config.networkType || 'political_discussion');
    this.scenario = config.scenario || 'election_manipulation';

    return {
      type: 'network_analysis',
      title: 'Soziale Netzwerk-Analyse',
      instructions: 'Entdecke Manipulation und stärke demokratischen Diskurs!',
      network: this.network,
      interface: this.createNetworkInterface(),
    };
  }

  generateSocialNetwork(networkType) {
    return {
      nodes: this.generateNodes(networkType),
      edges: this.generateEdges(),
      communities: this.detectCommunities(),
      influencers: this.identifyInfluencers(),
      suspiciousPatterns: this.addManipulationPatterns(),
    };
  }

  createNetworkInterface() {
    return `
      <div class="network-analysis">
        <div class="analysis-tools">
          <div class="tool-panel">
            <button class="analysis-tool" data-tool="bot_detection">
              🤖 Bot-Erkennung
            </button>
            <button class="analysis-tool" data-tool="influence_mapping">
              📈 Einfluss-Mapping
            </button>
            <button class="analysis-tool" data-tool="echo_chambers">
              🔄 Echo-Kammern
            </button>
            <button class="analysis-tool" data-tool="fact_propagation">
              📰 Fakten-Verbreitung
            </button>
          </div>
          
          <div class="network-metrics">
            <div class="metric">Knoten: <span id="node-count">0</span></div>
            <div class="metric">Verbindungen: <span id="edge-count">0</span></div>
            <div class="metric">Bots: <span id="bot-count" class="warning">0</span></div>
            <div class="metric">Manipulation: <span id="manipulation-score" class="danger">0%</span></div>
          </div>
        </div>
        
        <div class="network-visualization">
          <canvas id="network-canvas" width="800" height="600"></canvas>
          <div class="visualization-controls">
            <button class="view-control" data-view="force_directed">Kräfte-Layout</button>
            <button class="view-control" data-view="community_view">Gemeinschaften</button>
            <button class="view-control" data-view="influence_view">Einfluss-Hierarchie</button>
            <button class="view-control" data-view="time_series">Zeitverlauf</button>
          </div>
        </div>
        
        <div class="analysis-results">
          <div class="findings-panel" id="analysis-findings">
            <!-- Dynamic analysis results -->
          </div>
          <div class="intervention-suggestions" id="interventions">
            <!-- Suggested democratic interventions -->
          </div>
        </div>
      </div>
    `;
  }

  performBotDetection() {
    const suspiciousAccounts = [];

    this.network.nodes.forEach(node => {
      const botProbability = this.botDetectionEngine.analyze(node);

      if (botProbability > 0.7) {
        suspiciousAccounts.push({
          id: node.id,
          probability: botProbability,
          indicators: this.getBotIndicators(node),
          networkImpact: this.calculateBotImpact(node),
        });
      }
    });

    return {
      suspiciousAccounts: suspiciousAccounts,
      networkIntegrity: this.calculateNetworkIntegrity(),
      recommendations: this.generateBotMitigationStrategies(suspiciousAccounts),
    };
  }

  analyzeEchoChambers() {
    const communities = this.detectCommunities();
    const echoChambers = [];

    communities.forEach(community => {
      const isolation = this.calculateIsolationMetric(community);
      const polarization = this.measurePolarization(community);
      const diversityIndex = this.calculateContentDiversity(community);

      if (isolation > 0.8 && polarization > 0.7 && diversityIndex < 0.3) {
        echoChambers.push({
          community: community,
          isolation: isolation,
          polarization: polarization,
          diversityIndex: diversityIndex,
          bridgeOpportunities: this.findBridgeOpportunities(community),
        });
      }
    });

    return {
      echoChambers: echoChambers,
      interventions: this.suggestEchoChamberInterventions(echoChambers),
    };
  }
}

/* ==========================================================================
   INFLUENCE CALCULATOR
   ========================================================================== */

class InfluenceCalculator {
  constructor() {
    this.algorithms = {
      pagerank: new PageRankCalculator(),
      betweenness: new BetweennessCentrality(),
      eigenvector: new EigenvectorCentrality(),
    };
  }

  calculateInfluence(node, network) {
    const pageRankScore = this.algorithms.pagerank.calculate(node, network);
    const betweennessScore = this.algorithms.betweenness.calculate(node, network);
    const eigenvectorScore = this.algorithms.eigenvector.calculate(node, network);

    // Weighted combination of different centrality measures
    const compositeScore = pageRankScore * 0.4 + betweennessScore * 0.35 + eigenvectorScore * 0.25;

    return {
      composite: compositeScore,
      pagerank: pageRankScore,
      betweenness: betweennessScore,
      eigenvector: eigenvectorScore,
      category: this.categorizeInfluence(compositeScore),
    };
  }

  categorizeInfluence(score) {
    if (score > 0.8) return 'major_influencer';
    if (score > 0.6) return 'significant_influencer';
    if (score > 0.4) return 'moderate_influencer';
    if (score > 0.2) return 'minor_influencer';
    return 'follower';
  }
}

class PageRankCalculator {
  calculate(node, network, dampingFactor = 0.85, iterations = 100) {
    // Simplified PageRank implementation
    let score = 1.0;
    const incomingLinks = network.edges.filter(edge => edge.target === node.id);

    for (let i = 0; i < iterations; i++) {
      let newScore = 1 - dampingFactor;

      incomingLinks.forEach(link => {
        const sourceNode = network.nodes.find(n => n.id === link.source);
        const outgoingCount = network.edges.filter(e => e.source === sourceNode.id).length;
        newScore += dampingFactor * (score / Math.max(1, outgoingCount));
      });

      score = newScore;
    }

    return score / network.nodes.length; // Normalize
  }
}

class BetweennessCentrality {
  calculate(node, network) {
    // Simplified betweenness centrality
    let betweenness = 0;
    const allPairs = this.getAllNodePairs(network.nodes.filter(n => n.id !== node.id));

    allPairs.forEach(pair => {
      const shortestPaths = this.findAllShortestPaths(pair[0], pair[1], network);
      const pathsThroughNode = shortestPaths.filter(path => path.includes(node.id));

      if (shortestPaths.length > 0) {
        betweenness += pathsThroughNode.length / shortestPaths.length;
      }
    });

    return betweenness / (((network.nodes.length - 1) * (network.nodes.length - 2)) / 2);
  }

  getAllNodePairs(nodes) {
    const pairs = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        pairs.push([nodes[i], nodes[j]]);
      }
    }
    return pairs;
  }

  findAllShortestPaths(_start, _end, _network) {
    // Simplified shortest path finding - would implement BFS/Dijkstra here
    return [];
  }
}

class EigenvectorCentrality {
  calculate(node, network, iterations = 100) {
    // Simplified eigenvector centrality
    let score = 1.0;
    const connections = network.edges.filter(
      edge => edge.source === node.id || edge.target === node.id
    );

    for (let i = 0; i < iterations; i++) {
      let newScore = 0;

      connections.forEach(edge => {
        const neighborId = edge.source === node.id ? edge.target : edge.source;
        const neighbor = network.nodes.find(n => n.id === neighborId);
        if (neighbor) {
          newScore += neighbor.influence || 1.0;
        }
      });

      score = newScore;
    }

    return score / network.nodes.length;
  }
}

/* ==========================================================================
   BOT DETECTION ENGINE
   ========================================================================== */

class BotDetector {
  analyze(node) {
    let botScore = 0;

    // Account age and activity patterns
    if (node.accountAge < 30) botScore += 0.2;
    if (node.postsPerDay > 50) botScore += 0.3;

    // Content analysis
    if (node.textSimilarity > 0.8) botScore += 0.4;
    if (node.hashtagDensity > 0.3) botScore += 0.2;

    // Network behavior
    if (node.followRatio > 10) botScore += 0.3;
    if (node.rapidFollowGrowth) botScore += 0.25;

    // Temporal patterns
    if (this.detectUnhumanTiming(node.activityTimes)) botScore += 0.35;

    return Math.min(1, botScore);
  }

  detectUnhumanTiming(activityTimes) {
    // Check for 24/7 activity, lack of sleep patterns, etc.
    const hourlyDistribution = this.analyzeHourlyActivity(activityTimes);
    const sleepTime = hourlyDistribution.slice(0, 6).reduce((a, b) => a + b, 0);

    return sleepTime > 0.3; // Active during typical sleep hours
  }
}

/* ==========================================================================
   ADAPTIVE DIFFICULTY SYSTEM
   ========================================================================== */

class DifficultyAdapter {
  calculateDifficulty(gameId, playerStats, recentPerformance) {
    const baseLevel = Math.floor(
      (playerStats.E + playerStats.R + playerStats.P + playerStats.Z) / 20
    );
    const performanceModifier = this.analyzePerformance(recentPerformance);
    const gameSpecificModifier = this.getGameModifier(gameId, playerStats);

    return Math.max(1, Math.min(5, baseLevel + performanceModifier + gameSpecificModifier));
  }

  analyzePerformance(performance) {
    if (!performance || performance.length === 0) return 0;

    const averageScore = performance.reduce((sum, p) => sum + p.score, 0) / performance.length;
    const averageTime =
      performance.reduce((sum, p) => sum + p.completionTime, 0) / performance.length;

    // Increase difficulty if consistently high performance
    if (averageScore > 0.8 && averageTime < 60) return 1;
    if (averageScore < 0.4 || averageTime > 180) return -1;

    return 0;
  }
}

/* ==========================================================================
   LEARNING ANALYTICS
   ========================================================================== */

class MinigameAnalytics {
  trackProgress(gameId, progress) {
    // GDPR-compliant learning analytics
    const anonymizedData = {
      game: gameId,
      timestamp: Date.now(),
      progress: progress.percentage,
      decisions: progress.decisions?.length || 0,
      hintsUsed: progress.hintsUsed || 0,
      errorPatterns: this.categorizeErrors(progress.errors),
    };

    // Store locally for immediate feedback
    this.storeLocal(anonymizedData);

    // Optional: Send to learning analytics service (with consent)
    if (this.hasAnalyticsConsent()) {
      this.sendToLearningService(anonymizedData);
    }
  }

  generatePersonalizedFeedback(gameId, results) {
    return {
      strengths: this.identifyStrengths(results),
      improvements: this.suggestImprovements(results),
      nextSteps: this.recommendNextSteps(gameId, results),
      transferTips: this.generateTransferTips(results),
    };
  }
}

// Export for use in main game system
export { MinigamePool, FactCheckSpeedrun, BridgePuzzle, DebateDuel, CitySimulation };
