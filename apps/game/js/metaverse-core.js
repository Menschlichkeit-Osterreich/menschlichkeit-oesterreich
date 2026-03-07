/* ==========================================================================
   Brücken Bauen - Democracy Metaverse
   100-Level Campaign System with Enhanced Game Mechanics
   ========================================================================== */

/* global DemocracyWorldMap, SkillTreeSystem, MinigamePool, BossSystem,
          SKILL_DEFINITIONS, BOSS_DEFINITIONS, BossBattle, MultiplayerConnection */

// Enhanced Game State Management for 100+ Levels
class DemocracyMetaverse {
  constructor() {
    this.version = '2.0.0-metaverse';
    this.totalLevels = 110; // 100 campaign + 10 endgame
    this.currentLevel = 1;
    this.gameState = this.initializeMetaverseState();
    this.worldMap = new DemocracyWorldMap();
    this.skillTree = new SkillTreeSystem();
    this.minigamePool = new MinigamePool();
    this.bossSystem = new BossSystem();
    this.multiplayerMode = false;

    this.init();
  }

  initializeMetaverseState() {
    return {
      player: {
        profile: {
          name: null,
          avatar: 'bridge_builder',
          democraticTitle: 'Demokratie-Lernende*r',
          playTimeMinutes: 0,
        },
        stats: {
          E: 0, // Empathie
          R: 0, // Menschenrechte
          P: 0, // Partizipation
          Z: 0, // Zivilcourage
        },
        skills: [],
        inventory: [],
        achievements: [],
        progress: {
          currentLevel: 1,
          currentChapter: 1,
          chaptersCompleted: 0,
          bossesDefeated: 0,
          hiddenAreasFound: [],
          endingUnlocked: null,
        },
      },
      world: {
        regions: this.initializeRegions(),
        globalCrisisLevel: 1,
        planetaryBridgeHealth: 100,
        bridgeNetwork: new Map(),
        timeline: [],
      },
      session: {
        startTime: new Date(),
        decisionsToday: 0,
        reflectionsCompleted: 0,
        multiplayerSessionId: null,
        cooperationScore: 0,
      },
      analytics: {
        levelCompletionTimes: new Map(),
        decisionPatterns: [],
        reflectionQuality: [],
        skillUsageStats: new Map(),
      },
    };
  }

  initializeRegions() {
    return [
      {
        id: 'neighborhood',
        name: 'Nachbarschaft',
        chapterNumber: 1,
        state: 'neutral', // neutral|thriving|fragile|crisis
        bridgeIntegrity: 100,
        levels: this.generateChapterLevels(1, 'neighborhood'),
        specialFeatures: ['community_center', 'playground'],
        hiddenAreas: ['mediation_garden'],
        bossDefeated: false,
      },
      {
        id: 'education_work',
        name: 'Schule & Arbeit',
        chapterNumber: 2,
        state: 'neutral',
        bridgeIntegrity: 100,
        levels: this.generateChapterLevels(2, 'education_work'),
        specialFeatures: ['school', 'workplace', 'union_hall'],
        hiddenAreas: ['equity_archive'],
        bossDefeated: false,
      },
      {
        id: 'digital',
        name: 'Digitale Demokratie',
        chapterNumber: 3,
        state: 'neutral',
        bridgeIntegrity: 100,
        levels: this.generateChapterLevels(3, 'digital'),
        specialFeatures: ['data_center', 'media_hub'],
        hiddenAreas: ['truth_sanctuary'],
        bossDefeated: false,
      },
      {
        id: 'diversity',
        name: 'Gesellschaft & Vielfalt',
        chapterNumber: 4,
        state: 'neutral',
        bridgeIntegrity: 100,
        levels: this.generateChapterLevels(4, 'diversity'),
        specialFeatures: ['cultural_center', 'integration_office'],
        hiddenAreas: ['harmony_plaza'],
        bossDefeated: false,
      },
      {
        id: 'local_politics',
        name: 'Politik vor Ort',
        chapterNumber: 5,
        state: 'neutral',
        bridgeIntegrity: 100,
        levels: this.generateChapterLevels(5, 'local_politics'),
        specialFeatures: ['town_hall', 'civic_square'],
        hiddenAreas: ['participation_tower'],
        bossDefeated: false,
      },
      {
        id: 'crisis',
        name: 'Krise & Konflikt',
        chapterNumber: 6,
        state: 'neutral',
        bridgeIntegrity: 100,
        levels: this.generateChapterLevels(6, 'crisis'),
        specialFeatures: ['emergency_center', 'solidarity_network'],
        hiddenAreas: ['resilience_vault'],
        bossDefeated: false,
      },
      {
        id: 'climate',
        name: 'Klimapolitik & Generationen',
        chapterNumber: 7,
        state: 'neutral',
        bridgeIntegrity: 100,
        levels: this.generateChapterLevels(7, 'climate'),
        specialFeatures: ['renewable_park', 'future_lab'],
        hiddenAreas: ['sustainability_dome'],
        bossDefeated: false,
      },
      {
        id: 'global',
        name: 'Globale Demokratie',
        chapterNumber: 8,
        state: 'neutral',
        bridgeIntegrity: 100,
        levels: this.generateChapterLevels(8, 'global'),
        specialFeatures: ['un_headquarters', 'embassy_row'],
        hiddenAreas: ['world_council'],
        bossDefeated: false,
      },
      {
        id: 'under_pressure',
        name: 'Demokratie unter Druck',
        chapterNumber: 9,
        state: 'neutral',
        bridgeIntegrity: 100,
        levels: this.generateChapterLevels(9, 'under_pressure'),
        specialFeatures: ['free_press', 'civil_rights_monument'],
        hiddenAreas: ['resistance_archive'],
        bossDefeated: false,
      },
      {
        id: 'future_2050',
        name: 'Demokratie 2050',
        chapterNumber: 10,
        state: 'neutral',
        bridgeIntegrity: 100,
        levels: this.generateChapterLevels(10, 'future_2050'),
        specialFeatures: ['ai_ethics_lab', 'virtual_agora'],
        hiddenAreas: ['consciousness_nexus'],
        bossDefeated: false,
      },
      {
        id: 'planetary_endgame',
        name: 'Planetare Demokratie',
        chapterNumber: 11,
        state: 'locked',
        bridgeIntegrity: 0,
        levels: this.generateEndgameLevels(),
        specialFeatures: ['earth_council', 'species_parliament'],
        hiddenAreas: ['cosmic_bridge'],
        bossDefeated: false,
      },
    ];
  }

  generateChapterLevels(chapterNum, regionId) {
    const baseLevel = (chapterNum - 1) * 10;
    const levels = [];

    for (let i = 1; i <= 10; i++) {
      const levelNum = baseLevel + i;
      let levelType = 'scenario';

      if (i === 9) levelType = 'special';
      if (i === 10) levelType = 'boss';

      levels.push({
        id: `${chapterNum}.${i}`,
        globalId: levelNum,
        title: this.getLevelTitle(chapterNum, i),
        type: levelType,
        difficulty: Math.ceil(chapterNum / 2), // 1-5 difficulty scale
        unlocked: levelNum === 1,
        completed: false,
        perfectScore: false,
        requirements: levelNum > 1 ? [`${chapterNum}.${i - 1}`] : [],
        rewards: this.calculateLevelRewards(chapterNum, i, levelType),
        minigame: this.assignMinigame(levelType),
        characters: this.assignCharacters(regionId, i),
        learningObjectives: this.getLearningObjectives(chapterNum, i),
        metadata: {
          estimatedDuration: levelType === 'boss' ? 15 : levelType === 'special' ? 12 : 8,
          accessibility: 'WCAG_AAA',
          contentWarnings: this.getContentWarnings(chapterNum, i),
          cooperativeModeAvailable: true,
        },
      });
    }

    return levels;
  }

  generateEndgameLevels() {
    const endgameLevels = [];
    const endgameScenarios = [
      'Klimaflucht',
      'Ressourcenkriege',
      'KI-Despot',
      'Weltwirtschaftskollaps',
      'Planetare Demokratie',
      'Globale Abstimmung',
      'Zukunftspakt',
      'Internationale Solidarität',
      'Letzte Brücke',
      'Die Brücke der Zukunft',
    ];

    endgameScenarios.forEach((title, index) => {
      endgameLevels.push({
        id: `endgame.${index + 1}`,
        globalId: 101 + index,
        title: title,
        type: index === 9 ? 'final_boss' : 'endgame_scenario',
        difficulty: 5,
        unlocked: false,
        completed: false,
        perfectScore: false,
        requirements: index === 0 ? ['10.10'] : [`endgame.${index}`],
        rewards: {
          E: 3,
          R: 3,
          P: 3,
          Z: 3,
          skills: ['planetary_consciousness'],
          achievements: ['endgame_survivor'],
          unlocks: index === 9 ? ['cosmic_ending'] : [],
        },
        characters: ['world_leaders', 'future_generations', 'ai_entities'],
        learningObjectives: [
          'Globale Interdependenzen verstehen',
          'Planetare Verantwortung übernehmen',
          'Zukunftsvisionen entwickeln',
        ],
        metadata: {
          estimatedDuration: 20,
          accessibility: 'WCAG_AAA',
          contentWarnings: ['complex_scenarios', 'future_uncertainty'],
          cooperativeModeAvailable: true,
          multiplayerRecommended: true,
        },
      });
    });

    return endgameLevels;
  }

  // Enhanced progression system with branching paths
  unlockLevel(levelId) {
    const level = this.findLevelById(levelId);
    if (!level) return false;

    // Check requirements
    const requirementsMet = level.requirements.every(reqId => {
      const reqLevel = this.findLevelById(reqId);
      return reqLevel && reqLevel.completed;
    });

    if (requirementsMet) {
      level.unlocked = true;
      this.checkForHiddenAreaUnlocks(level);
      this.updateWorldState(level);
      return true;
    }

    return false;
  }

  completeLevel(levelId, decisions, performance) {
    const level = this.findLevelById(levelId);
    if (!level || !level.unlocked) return false;

    level.completed = true;
    level.completionData = {
      timestamp: new Date(),
      decisions: decisions,
      performance: performance,
      duration: performance.duration,
      perfectScore: performance.score >= 0.9,
    };

    // Apply rewards
    this.applyLevelRewards(level.rewards, performance);

    // Update world state
    this.updateRegionState(level, decisions);

    // Update bridge network
    this.updateBridgeNetwork(level, decisions);

    // Check for achievements
    this.checkAchievements(level, performance);

    // Unlock next level(s)
    this.unlockSubsequentLevels(level);

    // Track analytics
    this.trackLevelCompletion(level, performance);

    return true;
  }

  updateRegionState(level, decisions) {
    const region = this.findRegionByLevel(level);
    if (!region) return;

    // Calculate decision impact on region
    const positiveDecisions = decisions.filter(
      d => d.effect.E > 0 || d.effect.R > 0 || d.effect.P > 0 || d.effect.Z > 0
    ).length;

    const totalDecisions = decisions.length;
    const positiveRatio = positiveDecisions / totalDecisions;

    // Update bridge integrity
    const integrityChange = Math.floor((positiveRatio - 0.5) * 20);
    region.bridgeIntegrity = Math.max(0, Math.min(100, region.bridgeIntegrity + integrityChange));

    // Update region state based on bridge integrity
    if (region.bridgeIntegrity >= 80) {
      region.state = 'thriving';
    } else if (region.bridgeIntegrity >= 60) {
      region.state = 'stable';
    } else if (region.bridgeIntegrity >= 40) {
      region.state = 'fragile';
    } else {
      region.state = 'crisis';
    }

    // Update global crisis level
    this.updateGlobalCrisis();
  }

  updateGlobalCrisis() {
    const regions = this.gameState.world.regions;
    const crisisRegions = regions.filter(r => r.state === 'crisis').length;
    const fragileRegions = regions.filter(r => r.state === 'fragile').length;

    // Calculate global crisis level (1-10)
    this.gameState.world.globalCrisisLevel = Math.max(
      1,
      Math.min(10, crisisRegions * 2 + fragileRegions)
    );

    // Update planetary bridge health
    const averageIntegrity =
      regions.reduce((sum, r) => sum + r.bridgeIntegrity, 0) / regions.length;
    this.gameState.world.planetaryBridgeHealth = Math.floor(averageIntegrity);
  }

  // Skill tree system for character progression
  unlockSkill(skillId) {
    const skill = SKILL_DEFINITIONS[skillId];
    if (!skill) return false;

    // Check requirements
    const hasRequiredStats = Object.entries(skill.requirements.stats || {}).every(
      ([stat, min]) => this.gameState.player.stats[stat] >= min
    );

    const hasRequiredSkills = (skill.requirements.skills || []).every(reqSkill =>
      this.gameState.player.skills.includes(reqSkill)
    );

    if (hasRequiredStats && hasRequiredSkills) {
      this.gameState.player.skills.push(skillId);
      this.gameState.player.inventory.push(`skill_${skillId}`);

      // Apply passive effects
      if (skill.passiveEffects) {
        this.applyPassiveEffects(skill.passiveEffects);
      }

      return true;
    }

    return false;
  }

  // Boss battle system with dynamic AI
  initiateBossBattle(bossId, level) {
    const boss = BOSS_DEFINITIONS[bossId];
    if (!boss) return null;

    return new BossBattle({
      boss: boss,
      level: level,
      playerStats: this.gameState.player.stats,
      playerSkills: this.gameState.player.skills,
      worldState: this.gameState.world,
      difficulty: level.difficulty,
      onVictory: results => this.handleBossVictory(bossId, results),
      onDefeat: results => this.handleBossDefeat(bossId, results),
    });
  }

  // Multiplayer cooperation system
  enableMultiplayerMode(sessionConfig) {
    this.multiplayerMode = true;
    this.gameState.session.multiplayerSessionId = sessionConfig.sessionId;
    this.gameState.session.cooperationScore = 0;

    // Initialize WebRTC connection for real-time cooperation
    this.multiplayerConnection = new MultiplayerConnection(sessionConfig);

    // Set up event listeners for cooperative decisions
    this.multiplayerConnection.on('decision_proposal', this.handleCooperativeDecision.bind(this));
    this.multiplayerConnection.on('consensus_reached', this.handleConsensus.bind(this));
    this.multiplayerConnection.on('cooperation_bonus', this.handleCooperationBonus.bind(this));
  }

  handleCooperativeDecision(_proposal) {
    // Present decision to all players
    // Implement voting/consensus mechanism
    // Apply group decision effects
  }

  // Enhanced reflection system
  submitReflection(levelId, reflectionData) {
    const level = this.findLevelById(levelId);
    if (!level) return false;

    const reflection = {
      levelId: levelId,
      timestamp: new Date(),
      responses: reflectionData.responses,
      transferIdeas: reflectionData.transferIdeas,
      emotionalImpact: reflectionData.emotionalImpact,
      learningInsights: reflectionData.learningInsights,
      wordCount: this.calculateWordCount(reflectionData),
      qualityScore: this.assessReflectionQuality(reflectionData),
    };

    // Store reflection
    if (!level.reflections) level.reflections = [];
    level.reflections.push(reflection);

    // Update analytics
    this.gameState.analytics.reflectionQuality.push(reflection.qualityScore);
    this.gameState.session.reflectionsCompleted++;

    // Bonus rewards for high-quality reflections
    if (reflection.qualityScore >= 0.8) {
      this.applyReflectionBonus(reflection);
    }

    return true;
  }

  // Learning analytics (GDPR compliant)
  generateLearningProfile() {
    return {
      democraticProfile: this.calculateDemocraticProfile(),
      learningStyle: this.analyzeLearningStyle(),
      strengthAreas: this.identifyStrengths(),
      growthAreas: this.identifyGrowthAreas(),
      recommendedPaths: this.generateRecommendations(),
      transferPotential: this.assessTransferPotential(),
      timestamp: new Date(),
    };
  }

  calculateDemocraticProfile() {
    const stats = this.gameState.player.stats;
    const total = stats.E + stats.R + stats.P + stats.Z;

    if (total >= 80) return 'Demokratie-Champion';
    if (total >= 60) return 'Brücken-Bauer*in';
    if (total >= 40) return 'Demokratie-Lernende*r';
    return 'Demokratie-Einsteiger*in';
  }

  // Accessibility enhancements for inclusive gameplay
  applyAccessibilitySettings(settings) {
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    }

    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    }

    if (settings.dyslexiaSupport) {
      document.body.classList.add('dyslexia-friendly');
    }

    if (settings.screenReaderMode) {
      this.enableScreenReaderEnhancements();
    }

    if (settings.simplifiedLanguage) {
      this.enableSimplifiedLanguage();
    }
  }

  // Export system for educational use
  exportGameData(format = 'pdf') {
    const data = {
      profile: this.gameState.player.profile,
      stats: this.gameState.player.stats,
      progress: this.gameState.player.progress,
      achievements: this.gameState.player.achievements,
      reflections: this.collectAllReflections(),
      democraticProfile: this.generateLearningProfile(),
      timeline: this.generatePlayTimeline(),
      transferRecommendations: this.generateTransferRecommendations(),
    };

    switch (format) {
      case 'pdf':
        return this.generatePDFReport(data);
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'classroom_summary':
        return this.generateClassroomSummary(data);
      default:
        return data;
    }
  }

  // Performance monitoring and optimization
  trackPerformanceMetrics() {
    return {
      loadTime: performance.now(),
      frameRate: this.averageFrameRate,
      memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : null,
      activeConnections: this.multiplayerMode ? 1 : 0,
      cacheEfficiency: this.calculateCacheHitRate(),
      accessibilityCompliance: this.validateAccessibility(),
    };
  }

  // Utility methods
  findLevelById(levelId) {
    for (const region of this.gameState.world.regions) {
      const level = region.levels.find(l => l.id === levelId || l.globalId.toString() === levelId);
      if (level) return level;
    }
    return null;
  }

  findRegionByLevel(level) {
    return this.gameState.world.regions.find(region => region.levels.some(l => l.id === level.id));
  }

  // Initialize the enhanced democracy metaverse
  init() {
    console.log('🌉 Democracy Metaverse v2.0 initialized');
    console.log(`📊 ${this.totalLevels} levels loaded`);
    console.log('🎮 Enhanced game systems active');

    // Load saved state if available
    this.loadGameState();

    // Initialize UI systems
    this.initializeUI();

    // Setup accessibility
    this.setupAccessibility();

    // Enable analytics (opt-in)
    this.setupAnalytics();

    // Ready to play!
    this.emit('game_ready');
  }
}

// Initialize the Democracy Metaverse
document.addEventListener('DOMContentLoaded', () => {
  window.democracyMetaverse = new DemocracyMetaverse();

  // Development helpers
  if (process.env.NODE_ENV === 'development') {
    window.debugMetaverse = () => window.democracyMetaverse.gameState;
    window.jumpToLevel = levelId => window.democracyMetaverse.unlockLevel(levelId);
    window.exportProfile = () => window.democracyMetaverse.exportGameData('json');
    console.log('🔧 Debug tools available: debugMetaverse(), jumpToLevel(), exportProfile()');
  }
});
