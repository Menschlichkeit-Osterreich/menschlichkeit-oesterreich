/**
 * Democracy Metaverse - Enhanced Mini-Games Integration
 * Erweiterte Mini-Spiele spezifisch für Level 1-10 mit Lernzielen
 *
 * Neue Mini-Games:
 * - Network Mapping (Level 9)
 * - Empathy Circle (Level 2, 4)
 * - Compromise Builder (Level 5, 6)
 * - Story Web (Level 8, 10)
 */

class EnhancedMiniGames {
  constructor(gameCore) {
    this.gameCore = gameCore;
    this.canvas = null;
    this.ctx = null;
    this.currentMiniGame = null;
  }

  /**
   * Network Mapping Mini-Game (Level 9)
   * Interaktive Visualisierung der Nachbarschaftsbeziehungen
   */
  initNetworkMapping() {
    return {
      title: 'Nachbarschafts-Netzwerk',
      description: 'Verbinde die Nachbarn basierend auf ihren Beziehungen und Interessen',
      duration: 300, // 5 Minuten

      setup: () => {
        this.setupCanvas();
        this.networkNodes = this.generateNeighborNodes();
        this.connections = [];
        this.draggedNode = null;
        this.score = 0;
        this.feedback = [];
      },

      gameLoop: deltaTime => {
        this.updateNetworkMapping(deltaTime);
        this.renderNetworkMapping();
        return this.checkNetworkMappingCompletion();
      },

      controls: {
        mouse: {
          click: pos => this.handleNodeClick(pos),
          drag: pos => this.handleNodeDrag(pos),
          release: () => this.handleNodeRelease(),
        },
        keyboard: {
          h: () => this.showHint(),
          r: () => this.resetNetwork(),
        },
      },

      learningObjectives: [
        'Soziale Netzwerke verstehen',
        'Verbindungen zwischen Menschen erkennen',
        'Isolation identifizieren',
        'Brücken bauen zwischen Gruppen',
      ],
    };
  }

  generateNeighborNodes() {
    return [
      {
        id: 'frau_weber',
        name: 'Frau Weber',
        pos: { x: 150, y: 200 },
        color: '#FFB6C1',
        interests: ['garten', 'geschichte', 'backen'],
        needs: ['hilfe_einkaufen', 'gesellschaft'],
        personality: 'freundlich_aber_stolz',
        connections: [],
      },
      {
        id: 'family_hassan',
        name: 'Familie Hassan',
        pos: { x: 400, y: 150 },
        color: '#98FB98',
        interests: ['kochen', 'kinder', 'kultur'],
        needs: ['integration', 'verständnis'],
        personality: 'offen_vorsichtig',
        connections: [],
      },
      {
        id: 'herr_mueller',
        name: 'Herr Müller',
        pos: { x: 300, y: 300 },
        color: '#87CEEB',
        interests: ['hunde', 'sport', 'technik'],
        needs: ['hundeauslauf', 'ruhe_abends'],
        personality: 'direkt_hilfsbereit',
        connections: [],
      },
      {
        id: 'family_schmidt',
        name: 'Familie Schmidt',
        pos: { x: 200, y: 350 },
        color: '#DDA0DD',
        interests: ['kinder', 'sicherheit', 'umwelt'],
        needs: ['kinderfreundlich', 'sauberkeit'],
        personality: 'vorsichtig_ordnungsliebend',
        connections: [],
      },
      {
        id: 'alex_hartmann',
        name: 'Alex Hartmann',
        pos: { x: 350, y: 250 },
        color: '#F0E68C',
        interests: ['musik', 'nachtschicht', 'ruhe'],
        needs: ['schlaf_tagsüber', 'verständnis'],
        personality: 'gestresst_aber_fair',
        connections: [],
      },
      {
        id: 'player',
        name: 'Du',
        pos: { x: 250, y: 225 },
        color: '#FFD700',
        interests: ['gemeinschaft', 'fairness', 'lernen'],
        needs: ['frieden', 'zusammenhalt'],
        personality: 'vermittelnd',
        connections: [],
      },
    ];
  }

  /**
   * Empathy Circle Mini-Game
   * Perspektivwechsel-Spiel für emotionale Intelligenz
   */
  initEmpathyCircle(scenario) {
    return {
      title: 'Empathie-Kreis',
      description: 'Verstehe die Perspektiven aller Beteiligten in diesem Konflikt',
      duration: 240,

      setup: () => {
        this.setupCanvas();
        this.perspectives = this.generatePerspectives(scenario);
        this.currentPerspective = 0;
        this.understandingScore = {};
        this.empathyPoints = 0;
      },

      gameLoop: deltaTime => {
        this.updateEmpathyCircle(deltaTime);
        this.renderEmpathyCircle();
        return this.checkEmpathyCompletion();
      },

      learningObjectives: [
        'Verschiedene Perspektiven verstehen',
        'Emotionale Bedürfnisse erkennen',
        'Vorurteile überwinden',
        'Gemeinsamkeiten finden',
      ],
    };
  }

  generatePerspectives(scenario) {
    const scenarioPerspectives = {
      curry_smells: [
        {
          character: 'Familie Hassan',
          viewpoint: 'Wir kochen die Gerichte unserer Heimat. Das ist Teil unserer Identität.',
          emotions: ['stolz', 'verletzt', 'verwirrt'],
          needs: ['akzeptanz', 'respekt', 'zugehörigkeit'],
          fears: ['ausgrenzung', 'diskriminierung', 'isolation'],
          hopes: ['integration', 'freundschaft', 'verständnis'],
        },
        {
          character: 'Beschwerde-Nachbar',
          viewpoint: 'Die Gerüche sind sehr intensiv. Ich kann meine Fenster nicht öffnen.',
          emotions: ['unwohl', 'irritiert', 'hilflos'],
          needs: ['frische_luft', 'komfort', 'rücksicht'],
          fears: ['dauerproblem', 'konflikt', 'unfreundlichkeit'],
          hopes: ['lösung', 'rücksichtnahme', 'harmonie'],
        },
        {
          character: 'Neutrale Nachbarn',
          viewpoint: 'Wir wollen keinen Streit, aber auch keine Probleme.',
          emotions: ['unsicher', 'neutral', 'friedliebend'],
          needs: ['ruhe', 'fairness', 'gemeinschaft'],
          fears: ['spaltung', 'dauerkonflikte', 'seitenwahl'],
          hopes: ['zusammenhalt', 'verständigung', 'vielfalt'],
        },
      ],

      noise_conflict: [
        {
          character: 'Musik-Nachbar',
          viewpoint: 'Nach einem harten Arbeitstag brauche ich Musik zum Entspannen.',
          emotions: ['gestresst', 'müde', 'defensiv'],
          needs: ['entspannung', 'privatsphäre', 'verständnis'],
          fears: ['kontrolle', 'einschränkung', 'isolation'],
          hopes: ['respekt', 'kompromiss', 'ruhe'],
        },
        {
          character: 'Ruhebedürftiger',
          viewpoint: 'Ich habe morgen eine wichtige Prüfung und brauche Schlaf.',
          emotions: ['ängstlich', 'frustriert', 'hilflos'],
          needs: ['schlaf', 'konzentration', 'verständnis'],
          fears: ['versagen', 'schlafmangel', 'dauerbelastung'],
          hopes: ['rücksicht', 'erfolg', 'nachbarfrieden'],
        },
      ],
    };

    return scenarioPerspectives[scenario] || scenarioPerspectives.noise_conflict;
  }

  /**
   * Compromise Builder Mini-Game
   * Kreative Win-Win-Lösungen entwickeln
   */
  initCompromiseBuilder(conflict) {
    return {
      title: 'Kompromiss-Baukasten',
      description: 'Baue eine Lösung, die alle Bedürfnisse berücksichtigt',
      duration: 360,

      setup: () => {
        this.setupCanvas();
        this.conflictElements = this.analyzeConflict(conflict);
        this.solutionPieces = this.generateSolutionPieces();
        this.currentSolution = [];
        this.satisfactionLevels = {};
      },

      gameLoop: deltaTime => {
        this.updateCompromiseBuilder(deltaTime);
        this.renderCompromiseBuilder();
        return this.checkCompromiseCompletion();
      },

      learningObjectives: [
        'Win-Win-Denken entwickeln',
        'Kreative Problemlösung',
        'Bedürfnisse priorisieren',
        'Fairness ausbalancieren',
      ],
    };
  }

  analyzeConflict(conflict) {
    const conflicts = {
      dog_conflict: {
        parties: [
          {
            name: 'Hundebesitzer',
            needs: ['auslauf', 'entspannung', 'freiheit'],
            constraints: ['arbeitszeiten', 'platz', 'geld'],
          },
          {
            name: 'Familie mit Kind',
            needs: ['sicherheit', 'ruhe', 'spielraum'],
            constraints: ['kinderbetreuung', 'ängste', 'zeit'],
          },
        ],
        resources: ['innenhof', 'zeit', 'regeln', 'geld', 'kreativität'],
        constraints: ['hausordnung', 'budget', 'platz', 'zeit'],
      },

      children_noise: {
        parties: [
          {
            name: 'Kinder',
            needs: ['spielen', 'bewegung', 'spaß', 'soziale_kontakte'],
            constraints: ['schulzeiten', 'wetter', 'aufsicht'],
          },
          {
            name: 'Ruhesuchende',
            needs: ['entspannung', 'schlaf', 'konzentration'],
            constraints: ['arbeitszeiten', 'gesundheit', 'alter'],
          },
        ],
        resources: ['hof', 'alternative_räume', 'zeit', 'regeln'],
        constraints: ['lautstärke', 'zeiten', 'sicherheit'],
      },
    };

    return conflicts[conflict] || conflicts.dog_conflict;
  }

  generateSolutionPieces() {
    return [
      // Zeit-basierte Lösungen
      {
        type: 'time_solution',
        title: 'Zeitfenster',
        description: 'Verschiedene Zeiten für verschiedene Aktivitäten',
        cost: 1,
        satisfaction_impact: { all: 0.7 },
        pieces: ['morgen_slots', 'abend_slots', 'weekend_special', 'rotation'],
      },

      // Raum-basierte Lösungen
      {
        type: 'space_solution',
        title: 'Raumaufteilung',
        description: 'Verschiedene Bereiche für verschiedene Bedürfnisse',
        cost: 3,
        satisfaction_impact: { all: 0.8 },
        pieces: ['quiet_zone', 'play_area', 'shared_space', 'barriers'],
      },

      // Regel-basierte Lösungen
      {
        type: 'rule_solution',
        title: 'Gemeinsame Regeln',
        description: 'Demokratisch entwickelte Verhaltensregeln',
        cost: 2,
        satisfaction_impact: { all: 0.6 },
        pieces: ['noise_limits', 'respect_hours', 'cleanup_duty', 'enforcement'],
      },

      // Kreative Lösungen
      {
        type: 'creative_solution',
        title: 'Innovation',
        description: 'Neue, unkonventionelle Ansätze',
        cost: 2,
        satisfaction_impact: { all: 0.9 },
        pieces: ['soundproofing', 'alternative_spaces', 'community_events', 'mediation'],
      },
    ];
  }

  /**
   * Story Web Mini-Game
   * Narrative Entscheidungsauswirkungen verstehen
   */
  initStoryWeb(levelHistory) {
    return {
      title: 'Geschichten-Netz',
      description: 'Erkunde, wie deine Entscheidungen zusammenhängen',
      duration: 180,

      setup: () => {
        this.setupCanvas();
        this.storyNodes = this.generateStoryNodes(levelHistory);
        this.connectionLines = this.calculateConnections();
        this.currentFocus = null;
        this.insightScore = 0;
      },

      gameLoop: deltaTime => {
        this.updateStoryWeb(deltaTime);
        this.renderStoryWeb();
        return this.checkStoryWebCompletion();
      },

      learningObjectives: [
        'Langzeitkonsequenzen verstehen',
        'Entscheidungsverkettungen erkennen',
        'Systemisches Denken entwickeln',
        'Narrative Kohärenz schaffen',
      ],
    };
  }

  generateStoryNodes(levelHistory) {
    return levelHistory.map((level, index) => ({
      id: `level_${level.id}`,
      title: level.title,
      decision: level.playerChoice,
      consequences: level.consequences,
      values_impact: level.valuesChange,
      connections: [],
      position: this.calculateNodePosition(index, levelHistory.length),
      color: this.getDecisionColor(level.playerChoice),
      pulse: false,
    }));
  }

  calculateConnections() {
    // Analysiere Verbindungen zwischen Entscheidungen
    // - Ähnliche Werte-Impacts
    // - Charaktere, die mehrfach auftreten
    // - Thematische Verbindungen
    // - Konsequenzen-Ketten
    return [];
  }

  calculateNodePosition(index, total) {
    const angle = (2 * Math.PI * index) / total;
    const radius = 200;
    const centerX = 400;
    const centerY = 300;

    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  }

  getDecisionColor(choice) {
    const colorMap = {
      empathy: '#FF69B4', // Pink
      rights: '#4169E1', // Royal Blue
      participation: '#32CD32', // Lime Green
      courage: '#FF4500', // Orange Red
    };

    // Bestimme dominanten Wert der Entscheidung
    const dominantValue = this.getDominantValue(choice.values || {});
    return colorMap[dominantValue] || '#808080';
  }

  getDominantValue(values) {
    return Object.entries(values).reduce((a, b) =>
      Math.abs(values[a[0]]) > Math.abs(values[b[0]]) ? a : b
    )[0];
  }

  // Canvas Setup für alle Mini-Games
  setupCanvas() {
    const container = document.getElementById('minigame-container');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 800;
      this.canvas.height = 600;
      this.canvas.style.border = '2px solid #333';
      this.canvas.style.borderRadius = '10px';
      container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }
  }

  // Placeholder Update/Render Methoden (würden vollständig implementiert)
  updateNetworkMapping(_deltaTime) {
    // Network mapping logic
  }

  renderNetworkMapping() {
    // Network mapping rendering
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render nodes and connections
    this.networkNodes?.forEach(node => {
      this.ctx.fillStyle = node.color;
      this.ctx.fillRect(node.pos.x - 25, node.pos.y - 15, 50, 30);
      this.ctx.fillStyle = '#000';
      this.ctx.font = '12px Arial';
      this.ctx.fillText(node.name, node.pos.x - 20, node.pos.y);
    });
  }

  checkNetworkMappingCompletion() {
    return this.score >= 100;
  }

  updateEmpathyCircle(_deltaTime) {
    // Empathy circle logic
  }

  renderEmpathyCircle() {
    // Empathy circle rendering
    this.ctx.fillStyle = '#ffe6e6';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  checkEmpathyCompletion() {
    return this.empathyPoints >= 50;
  }

  updateCompromiseBuilder(_deltaTime) {
    // Compromise builder logic
  }

  renderCompromiseBuilder() {
    // Compromise builder rendering
    this.ctx.fillStyle = '#e6f3ff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  checkCompromiseCompletion() {
    return Object.values(this.satisfactionLevels).every(level => level >= 0.6);
  }

  updateStoryWeb(_deltaTime) {
    // Story web logic
  }

  renderStoryWeb() {
    // Story web rendering
    this.ctx.fillStyle = '#f0f8ff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  checkStoryWebCompletion() {
    return this.insightScore >= 75;
  }

  // Event Handlers
  handleNodeClick(_pos) {
    // Handle node interaction
  }

  handleNodeDrag(_pos) {
    // Handle dragging
  }

  handleNodeRelease() {
    // Handle release
  }

  showHint() {
    // Show contextual hint
  }

  resetNetwork() {
    // Reset to initial state
  }
}

export { EnhancedMiniGames };
