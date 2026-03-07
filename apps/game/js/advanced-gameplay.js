/* ==========================================================================
   ADVANCED GAMEPLAY SYSTEM
   Sophisticated gameplay mechanics with progression and achievements
   ========================================================================== */

class AdvancedGameplaySystem {
  constructor() {
    this.levelSystem = new LevelSystem();
    this.achievementEngine = new AchievementEngine();
    this.progressionTracker = new ProgressionTracker();
    this.gameplayMechanics = new GameplayMechanics();
    this.rewardSystem = new RewardSystem();
    this.challengeGenerator = new ChallengeGenerator();
    this.narrativeEngine = new NarrativeEngine();
  }

  initialize(playerProfile, gameConfig) {
    const gameplayState = {
      playerId: playerProfile.id,
      currentLevel: playerProfile.level || 1,
      experience: playerProfile.experience || 0,
      competencies: playerProfile.competencies || {},
      achievements: playerProfile.achievements || [],
      currentNarrative: null,
      activeBuffs: [],
      gameMode: gameConfig.mode || 'story',
    };

    return this.setupGameplay(gameplayState, gameConfig);
  }

  /* ==========================================================================
     SOPHISTICATED LEVEL SYSTEM
     ========================================================================== */

  setupLevelSystem() {
    return {
      levels: {
        // Demokratie-Grundlagen (1-10)
        novice_democracy: {
          range: [1, 10],
          title: 'Demokratie-Neuling',
          description: 'Erste Schritte in der demokratischen Bildung',
          unlocked_games: ['factcheck_speedrun', 'bridge_puzzle'],
          competency_focus: ['basic_civic_knowledge', 'information_literacy'],
          graduation_requirements: {
            min_games_completed: 5,
            competency_threshold: 0.6,
            peer_interactions: 3,
          },
        },

        // Demokratische Partizipation (11-25)
        active_citizen: {
          range: [11, 25],
          title: 'Aktiver Bürger',
          description: 'Verstehen und Anwenden demokratischer Prozesse',
          unlocked_games: ['debate_duel', 'city_simulation'],
          competency_focus: ['argumentation', 'compromise_building', 'systems_thinking'],
          graduation_requirements: {
            min_games_completed: 12,
            competency_threshold: 0.75,
            leadership_experiences: 2,
            successful_mediations: 1,
          },
        },

        // Kritisches Denken (26-45)
        critical_thinker: {
          range: [26, 45],
          title: 'Kritischer Denker',
          description: 'Komplexe Analyse und Bewertung gesellschaftlicher Themen',
          unlocked_games: ['network_analysis', 'crisis_council'],
          competency_focus: ['critical_thinking', 'media_literacy', 'analytical_reasoning'],
          graduation_requirements: {
            min_games_completed: 20,
            competency_threshold: 0.85,
            complex_challenges_solved: 5,
            teaching_moments: 3,
          },
        },

        // Gesellschaftsgestalter (46-70)
        civic_leader: {
          range: [46, 70],
          title: 'Gesellschaftsgestalter',
          description: 'Führung und Innovation in demokratischen Prozessen',
          unlocked_games: ['dialogue_rpg', 'advanced_scenarios'],
          competency_focus: ['empathy', 'conflict_resolution', 'democratic_leadership'],
          graduation_requirements: {
            min_games_completed: 35,
            competency_threshold: 0.9,
            community_projects_led: 2,
            mentorship_hours: 10,
          },
        },

        // Demokratie-Experte (71-100)
        democracy_expert: {
          range: [71, 100],
          title: 'Demokratie-Experte',
          description: 'Meisterhafte Beherrschung demokratischer Prinzipien',
          unlocked_games: ['all_games', 'expert_challenges', 'creative_mode'],
          competency_focus: ['democratic_mastery', 'innovation', 'systemic_change'],
          graduation_requirements: {
            min_games_completed: 60,
            competency_threshold: 0.95,
            original_solutions_created: 5,
            expert_certifications: 3,
          },
        },
      },

      experience_formula: {
        base_xp: 100,
        level_multiplier: 1.15,
        competency_bonus: 50,
        collaboration_bonus: 25,
        innovation_bonus: 75,
      },
    };
  }

  /* ==========================================================================
     DYNAMIC GAMEPLAY MECHANICS
     ========================================================================== */

  createGameplayMechanics() {
    return {
      // Adaptive Difficulty System
      difficulty_adaptation: {
        factors: [
          'player_competency_level',
          'recent_performance_trend',
          'time_investment_pattern',
          'peer_comparison_relative',
          'learning_style_preferences',
        ],

        adjustment_algorithm: (playerData, gameContext) => {
          const basedifficulty = gameContext.defaultDifficulty || 0.5;

          // Competency-based adjustment
          const competencyModifier = this.calculateCompetencyModifier(
            playerData.competencies,
            gameContext.requiredCompetencies
          );

          // Performance trend adjustment
          const performanceModifier = this.calculatePerformanceTrend(playerData.recentSessions);

          // Engagement optimization
          const engagementModifier = this.optimizeForEngagement(playerData.engagementHistory);

          // Flow state targeting
          const flowModifier = this.targetFlowState(
            playerData.challengePreference,
            playerData.skillLevel
          );

          return Math.max(
            0.1,
            Math.min(
              1.0,
              basedifficulty +
                competencyModifier * 0.3 +
                performanceModifier * 0.25 +
                engagementModifier * 0.25 +
                flowModifier * 0.2
            )
          );
        },
      },

      // Dynamic Challenge Generation
      challenge_system: {
        challenge_types: [
          'time_pressure_scenarios',
          'multi_stakeholder_dilemmas',
          'resource_constraint_puzzles',
          'ethical_complexity_cases',
          'innovation_creativity_tasks',
          'collaboration_coordination_challenges',
        ],

        generation_rules: {
          personal_relevance: 0.4, // Connect to student's interests/background
          competency_stretch: 0.3, // Challenge just above current level
          collaborative_element: 0.2, // Include teamwork opportunities
          real_world_connection: 0.1, // Link to current events/local issues
        },
      },

      // Behavioral Game Mechanics
      behavioral_mechanics: {
        streak_systems: {
          daily_engagement: {
            rewards: ['xp_multiplier', 'exclusive_content', 'cosmetic_unlocks'],
            decay_rate: 0.8, // 20% decay per missed day
            max_multiplier: 3.0,
          },

          collaborative_streaks: {
            rewards: ['group_achievements', 'leadership_opportunities'],
            social_recognition: true,
            peer_visible: true,
          },

          learning_momentum: {
            tracks: ['competency_growth', 'challenge_completion', 'help_others'],
            compound_rewards: true,
            milestone_celebrations: true,
          },
        },

        social_dynamics: {
          peer_recognition_system: {
            categories: ['helpful_collaborator', 'creative_problem_solver', 'empathetic_mediator'],
            nomination_system: 'peer_based',
            visibility: 'classroom_wide',
            reward_impact: 'social_status_boost',
          },

          mentorship_mechanics: {
            senior_student_roles: ['game_guide', 'conflict_mediator', 'skill_coach'],
            mentorship_rewards: ['leadership_xp', 'teaching_achievements', 'special_privileges'],
            structured_programs: ['buddy_system', 'cross_grade_collaboration'],
          },
        },
      },
    };
  }

  /* ==========================================================================
     ACHIEVEMENT SYSTEM
     ========================================================================== */

  createAchievementSystem() {
    return {
      achievement_categories: {
        // Kompetenz-Achievements
        competency_achievements: [
          {
            id: 'fact_checker_bronze',
            title: '🔍 Fakten-Checker Bronze',
            description: 'Erkenne 50 Fake News korrekt',
            category: 'information_literacy',
            difficulty: 'bronze',
            requirements: { fake_news_detected: 50 },
            rewards: { xp: 500, badge: 'fact_checker_bronze', title: 'Fakten-Scout' },
          },
          {
            id: 'master_mediator',
            title: '🕊️ Meister-Mediator',
            description: 'Löse 20 Konflikte erfolgreich',
            category: 'conflict_resolution',
            difficulty: 'gold',
            requirements: { conflicts_resolved: 20, success_rate: 0.85 },
            rewards: { xp: 2000, badge: 'master_mediator', ability: 'advanced_mediation_tools' },
          },
          {
            id: 'systems_architect',
            title: '🏗️ Systems-Architekt',
            description: 'Entwerfe 5 nachhaltige Stadtlösungen',
            category: 'systems_thinking',
            difficulty: 'platinum',
            requirements: { sustainable_solutions: 5, peer_approval_rate: 0.9 },
            rewards: { xp: 5000, badge: 'systems_architect', unlock: 'city_architect_mode' },
          },
        ],

        // Kollaborations-Achievements
        collaboration_achievements: [
          {
            id: 'team_catalyst',
            title: '⚡ Team-Katalysator',
            description: 'Verbessere die Gruppenleistung in 10 Sessions',
            requirements: { group_performance_improvements: 10 },
            rewards: { leadership_xp: 1000, special_role: 'group_optimizer' },
          },
          {
            id: 'bridge_builder',
            title: '🌉 Brückenbauer',
            description: 'Finde Kompromisse zwischen 50 verschiedenen Positionen',
            requirements: { compromises_facilitated: 50, satisfaction_rate: 0.8 },
            rewards: { xp: 1500, ability: 'advanced_compromise_tools' },
          },
        ],

        // Innovation-Achievements
        innovation_achievements: [
          {
            id: 'creative_revolutionary',
            title: '🚀 Kreativ-Revolutionär',
            description: 'Entwickle 3 völlig neue Lösungsansätze',
            requirements: { original_solutions: 3, novelty_score: 0.9 },
            rewards: { innovation_xp: 3000, unlock: 'creative_sandbox_mode' },
          },
          {
            id: 'paradigm_shifter',
            title: '🌟 Paradigmen-Wandler',
            description: 'Verändere die Denkweise von 20 Mitspielern',
            requirements: { perspective_shifts_caused: 20, lasting_impact: 0.7 },
            rewards: { influence_xp: 4000, title: 'Thought Leader' },
          },
        ],

        // Spezial-Achievements
        special_achievements: [
          {
            id: 'democracy_guardian',
            title: '🛡️ Demokratie-Wächter',
            description: 'Schütze demokratische Werte in kritischen Momenten',
            secret: true,
            requirements: { democratic_values_defended: 5, crisis_moments: 3 },
            rewards: { prestige_xp: 10000, legendary_badge: 'democracy_guardian' },
          },
          {
            id: 'empathy_master',
            title: '💝 Empathie-Meister',
            description: 'Zeige außergewöhnliches Verständnis für alle Perspektiven',
            secret: true,
            requirements: { empathy_demonstrations: 100, cross_cultural_understanding: 0.95 },
            rewards: { wisdom_xp: 8000, special_ability: 'perspective_synthesis' },
          },
        ],
      },

      // Dynamische Achievement-Generierung
      dynamic_achievements: {
        personal_milestones: {
          based_on: ['individual_growth_patterns', 'personal_challenges', 'interest_areas'],
          generation_frequency: 'weekly',
          personalization_level: 'high',
        },

        classroom_achievements: {
          based_on: ['collective_goals', 'class_dynamics', 'curriculum_alignment'],
          shared_rewards: true,
          celebration_events: true,
        },

        seasonal_achievements: {
          election_season: 'special_democracy_challenges',
          global_events: 'real_world_connection_tasks',
          school_events: 'community_integration_projects',
        },
      },
    };
  }

  /* ==========================================================================
     NARRATIVE PROGRESSION SYSTEM
     ========================================================================== */

  createNarrativeSystem() {
    return {
      story_arcs: {
        // Hauptgeschichte: "Die Neue Demokratie"
        main_arc: {
          title: 'Die Neue Demokratie',
          description: 'Eine Reise zur Gestaltung der Gesellschaft von morgen',

          chapters: [
            {
              id: 'awakening',
              title: 'Das Erwachen',
              level_range: [1, 10],
              description: 'Entdecke die Macht deiner Stimme in der Demokratie',
              key_games: ['factcheck_speedrun', 'bridge_puzzle'],
              narrative_elements: {
                setting: 'Moderne Kleinstadt mit demokratischen Herausforderungen',
                protagonist_role: 'Engagierter Jugendlicher',
                central_conflict: 'Fehlinformation bedroht die Meinungsbildung',
                character_development: 'Von passivem Konsument zu aktivem Teilnehmer',
              },
            },

            {
              id: 'participation',
              title: 'Die Teilnahme',
              level_range: [11, 25],
              description: 'Lerne die Kunst der demokratischen Beteiligung',
              key_games: ['debate_duel', 'city_simulation'],
              narrative_elements: {
                setting: 'Stadtrat und Bürgerforen',
                protagonist_role: 'Aktiver Bürger und Diskutant',
                central_conflict: 'Interessenskonflikte in der Gemeinschaft',
                character_development: 'Vom Einzelkämpfer zum Teamplayer',
              },
            },

            {
              id: 'leadership',
              title: 'Die Führung',
              level_range: [26, 45],
              description: 'Übernimm Verantwortung für demokratische Prozesse',
              key_games: ['crisis_council', 'network_analysis'],
              narrative_elements: {
                setting: 'Krisenzeiten und komplexe Herausforderungen',
                protagonist_role: 'Emerging Leader und Problemlöser',
                central_conflict: 'Manipulation und Polarisierung der Gesellschaft',
                character_development: 'Vom Teilnehmer zum Gestalter',
              },
            },

            {
              id: 'mastery',
              title: 'Die Meisterschaft',
              level_range: [46, 70],
              description: 'Gestalte die Zukunft der Demokratie mit',
              key_games: ['dialogue_rpg', 'advanced_scenarios'],
              narrative_elements: {
                setting: 'Gesellschaftsweite Transformation',
                protagonist_role: 'Demokratie-Innovator und Mentor',
                central_conflict: 'Systemische Herausforderungen der modernen Demokratie',
                character_development: 'Vom Gestalter zum Visionär',
              },
            },

            {
              id: 'legacy',
              title: 'Das Vermächtnis',
              level_range: [71, 100],
              description: 'Hinterlasse dein Vermächtnis für zukünftige Generationen',
              key_games: ['all_games', 'creative_mode'],
              narrative_elements: {
                setting: 'Globale demokratische Renaissance',
                protagonist_role: 'Demokratie-Architekt und Weiser',
                central_conflict: 'Nachhaltige demokratische Innovation',
                character_development: 'Vom Visionär zum Vermächtnis-Schöpfer',
              },
            },
          ],
        },

        // Nebengeschichten
        side_arcs: {
          local_heroes: {
            title: 'Lokale Helden',
            description: 'Geschichten aus der eigenen Gemeinde',
            integration: 'Lokale Ereignisse und Persönlichkeiten einbinden',
          },

          historical_echoes: {
            title: 'Historische Echos',
            description: 'Demokratische Meilensteine der Geschichte erleben',
            integration: 'Geschichtsunterricht mit Gameplay verknüpfen',
          },

          future_visions: {
            title: 'Zukunftsvisionen',
            description: 'Demokratie in der digitalen Zukunft',
            integration: 'Technologie und Ethik verbinden',
          },
        },
      },

      // Dynamische Story-Elemente
      adaptive_storytelling: {
        branching_narratives: {
          player_choice_impact: 'high',
          consequence_persistence: 'session_spanning',
          moral_complexity: 'age_appropriate',
        },

        personalized_stories: {
          based_on: ['player_competencies', 'interests', 'cultural_background'],
          cultural_sensitivity: 'high',
          local_relevance: 'integrated',
        },

        collaborative_storytelling: {
          group_narrative_creation: true,
          shared_story_ownership: true,
          peer_story_sharing: true,
        },
      },
    };
  }

  /* ==========================================================================
     PROGRESSION MECHANICS
     ========================================================================== */

  calculateExperienceGain(gameSession, playerProfile) {
    const baseXP = this.getBaseXP(gameSession.gameType, gameSession.difficulty);

    // Kompetenz-basierte Boni
    const competencyBonus = this.calculateCompetencyBonus(
      gameSession.competenciesImproved,
      playerProfile.currentLevel
    );

    // Performance-basierte Boni
    const performanceBonus = this.calculatePerformanceBonus(
      gameSession.performance,
      gameSession.difficulty
    );

    // Kollaborations-Boni
    const collaborationBonus = this.calculateCollaborationBonus(gameSession.collaborationMetrics);

    // Innovation-Boni
    const innovationBonus = this.calculateInnovationBonus(
      gameSession.creativitySolutions,
      gameSession.originalityScore
    );

    // Zeit-Investment-Bonus
    const timeInvestmentBonus = this.calculateTimeInvestmentBonus(
      gameSession.timeSpent,
      gameSession.focusMetrics
    );

    // Lehr-/Hilfs-Bonus
    const teachingBonus = this.calculateTeachingBonus(
      gameSession.helpingBehavior,
      gameSession.knowledgeSharing
    );

    const totalXP = Math.round(
      baseXP +
        competencyBonus +
        performanceBonus +
        collaborationBonus +
        innovationBonus +
        timeInvestmentBonus +
        teachingBonus
    );

    return {
      totalXP: totalXP,
      breakdown: {
        base: baseXP,
        competency: competencyBonus,
        performance: performanceBonus,
        collaboration: collaborationBonus,
        innovation: innovationBonus,
        timeInvestment: timeInvestmentBonus,
        teaching: teachingBonus,
      },
    };
  }

  /* ==========================================================================
     SKILL TREE SYSTEM
     ========================================================================== */

  createSkillTree() {
    return {
      democratic_participation: {
        title: 'Demokratische Teilhabe',
        icon: '🗳️',
        branches: {
          civic_knowledge: {
            title: 'Bürgerwissen',
            skills: [
              { id: 'constitution_basics', title: 'Verfassungsgrundlagen', maxLevel: 5 },
              { id: 'political_systems', title: 'Politische Systeme', maxLevel: 5 },
              { id: 'democratic_history', title: 'Demokratiegeschichte', maxLevel: 3 },
            ],
          },

          participation_skills: {
            title: 'Partizipationsfähigkeiten',
            skills: [
              { id: 'voting_competency', title: 'Wahlkompetenz', maxLevel: 5 },
              { id: 'petition_creation', title: 'Petitionserstellung', maxLevel: 3 },
              { id: 'public_speaking', title: 'Öffentliches Sprechen', maxLevel: 5 },
            ],
          },
        },
      },

      critical_thinking: {
        title: 'Kritisches Denken',
        icon: '🧠',
        branches: {
          information_literacy: {
            title: 'Informationskompetenz',
            skills: [
              { id: 'source_evaluation', title: 'Quellenbewertung', maxLevel: 5 },
              { id: 'bias_detection', title: 'Bias-Erkennung', maxLevel: 5 },
              { id: 'fact_checking', title: 'Faktenprüfung', maxLevel: 5 },
            ],
          },

          analytical_reasoning: {
            title: 'Analytisches Denken',
            skills: [
              { id: 'argument_analysis', title: 'Argumentanalyse', maxLevel: 5 },
              { id: 'logical_fallacies', title: 'Denkfehler erkennen', maxLevel: 4 },
              { id: 'evidence_evaluation', title: 'Beweisführung', maxLevel: 5 },
            ],
          },
        },
      },

      social_competence: {
        title: 'Soziale Kompetenz',
        icon: '🤝',
        branches: {
          empathy_skills: {
            title: 'Empathie-Fähigkeiten',
            skills: [
              { id: 'perspective_taking', title: 'Perspektivwechsel', maxLevel: 5 },
              { id: 'emotional_intelligence', title: 'Emotionale Intelligenz', maxLevel: 5 },
              { id: 'cultural_sensitivity', title: 'Kultursensibilität', maxLevel: 4 },
            ],
          },

          conflict_resolution: {
            title: 'Konfliktlösung',
            skills: [
              { id: 'mediation_basics', title: 'Mediations-Grundlagen', maxLevel: 5 },
              { id: 'negotiation_tactics', title: 'Verhandlungstaktiken', maxLevel: 4 },
              { id: 'consensus_building', title: 'Konsensbildung', maxLevel: 5 },
            ],
          },
        },
      },

      digital_citizenship: {
        title: 'Digitale Bürgerschaft',
        icon: '💻',
        branches: {
          online_participation: {
            title: 'Online-Partizipation',
            skills: [
              { id: 'digital_advocacy', title: 'Digitale Meinungsbildung', maxLevel: 5 },
              { id: 'online_collaboration', title: 'Online-Zusammenarbeit', maxLevel: 5 },
              { id: 'digital_campaigns', title: 'Digitale Kampagnen', maxLevel: 4 },
            ],
          },

          digital_safety: {
            title: 'Digitale Sicherheit',
            skills: [
              { id: 'privacy_protection', title: 'Datenschutz', maxLevel: 5 },
              { id: 'misinformation_defense', title: 'Desinformations-Abwehr', maxLevel: 5 },
              { id: 'digital_ethics', title: 'Digitale Ethik', maxLevel: 4 },
            ],
          },
        },
      },
    };
  }
}

/* ==========================================================================
   SUPPORTING CLASSES
   ========================================================================== */

class LevelSystem {
  constructor() {
    this.levels = this.initializeLevels();
    this.experienceFormula = this.initializeExperienceFormula();
  }

  initializeLevels() {
    return new Map();
  }

  initializeExperienceFormula() {
    return {
      base: 100,
      multiplier: 1.15,
      competencyBonus: 50,
    };
  }

  calculateLevelFromExperience(experience) {
    let level = 1;
    let requiredXP = this.experienceFormula.base;

    while (experience >= requiredXP && level < 100) {
      experience -= requiredXP;
      level++;
      requiredXP = Math.floor(
        this.experienceFormula.base * Math.pow(this.experienceFormula.multiplier, level - 1)
      );
    }

    return { level, remainingXP: experience, nextLevelXP: requiredXP };
  }
}

class AchievementEngine {
  constructor() {
    this.achievements = new Map();
    this.playerAchievements = new Map();
  }

  checkAchievements(playerId, actionData) {
    const unlockedAchievements = [];

    this.achievements.forEach((achievement, id) => {
      if (!this.hasAchievement(playerId, id) && this.meetsRequirements(achievement, actionData)) {
        this.unlockAchievement(playerId, id);
        unlockedAchievements.push(achievement);
      }
    });

    return unlockedAchievements;
  }

  hasAchievement(playerId, achievementId) {
    const playerAchievements = this.playerAchievements.get(playerId) || [];
    return playerAchievements.includes(achievementId);
  }

  meetsRequirements(achievement, actionData) {
    return Object.entries(achievement.requirements).every(([key, requiredValue]) => {
      return (actionData[key] || 0) >= requiredValue;
    });
  }

  unlockAchievement(playerId, achievementId) {
    if (!this.playerAchievements.has(playerId)) {
      this.playerAchievements.set(playerId, []);
    }
    this.playerAchievements.get(playerId).push(achievementId);
  }
}

class ProgressionTracker {
  constructor() {
    this.playerProgress = new Map();
    this.competencyTracking = new Map();
  }

  updateProgress(playerId, gameSession) {
    if (!this.playerProgress.has(playerId)) {
      this.playerProgress.set(playerId, this.createInitialProgress());
    }

    const progress = this.playerProgress.get(playerId);
    this.updateExperience(progress, gameSession);
    this.updateCompetencies(progress, gameSession);
    this.updateStatistics(progress, gameSession);

    return progress;
  }

  createInitialProgress() {
    return {
      experience: 0,
      level: 1,
      competencies: {},
      gamesPlayed: 0,
      achievements: [],
      statistics: {},
    };
  }

  updateExperience(progress, gameSession) {
    const xpGain = this.calculateXPGain(gameSession);
    progress.experience += xpGain;

    const levelInfo = this.calculateLevel(progress.experience);
    progress.level = levelInfo.level;

    return xpGain;
  }

  calculateXPGain(gameSession) {
    let baseXP = 100;

    // Performance multiplier
    if (gameSession.performance) {
      baseXP *= 1 + gameSession.performance;
    }

    // Collaboration bonus
    if (gameSession.collaboration) {
      baseXP *= 1.2;
    }

    return Math.round(baseXP);
  }

  calculateLevel(experience) {
    let level = 1;
    let threshold = 100;

    while (experience >= threshold) {
      experience -= threshold;
      level++;
      threshold = Math.floor(100 * Math.pow(1.15, level - 1));
    }

    return { level, remaining: experience, nextThreshold: threshold };
  }
}

class GameplayMechanics {
  constructor() {
    this.difficultySystem = new DifficultySystem();
    this.flowStateOptimizer = new FlowStateOptimizer();
  }

  adaptDifficulty(playerData, gameContext) {
    return this.difficultySystem.calculateOptimalDifficulty(playerData, gameContext);
  }

  optimizeForFlow(playerProfile, currentChallenge) {
    return this.flowStateOptimizer.adjustForFlowState(playerProfile, currentChallenge);
  }
}

class RewardSystem {
  constructor() {
    this.rewards = new Map();
    this.rewardHistory = new Map();
  }

  calculateRewards(playerId, achievement) {
    const rewards = {
      experience: achievement.rewards?.xp || 0,
      badges: achievement.rewards?.badge || null,
      unlocks: achievement.rewards?.unlock || null,
      titles: achievement.rewards?.title || null,
    };

    this.recordReward(playerId, rewards);
    return rewards;
  }

  recordReward(playerId, rewards) {
    if (!this.rewardHistory.has(playerId)) {
      this.rewardHistory.set(playerId, []);
    }

    this.rewardHistory.get(playerId).push({
      timestamp: new Date(),
      rewards: rewards,
    });
  }
}

class ChallengeGenerator {
  constructor() {
    this.challengeTemplates = new Map();
    this.personalizedChallenges = new Map();
  }

  generatePersonalizedChallenge(playerProfile, learningObjectives) {
    const challenge = {
      id: this.generateChallengeId(),
      type: this.selectChallengeType(playerProfile, learningObjectives),
      difficulty: this.calculateOptimalDifficulty(playerProfile),
      personalizedElements: this.addPersonalizedElements(playerProfile),
      learningObjectives: learningObjectives,
      timeEstimate: this.estimateTimeRequirement(playerProfile, learningObjectives),
    };

    return challenge;
  }

  generateChallengeId() {
    return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  selectChallengeType(_playerProfile, _objectives) {
    const challengeTypes = ['collaboration', 'critical_thinking', 'creativity', 'leadership'];
    return challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
  }

  calculateOptimalDifficulty(playerProfile) {
    const baseLevel = playerProfile.level || 1;
    return Math.min(1.0, Math.max(0.1, baseLevel / 100 + 0.1));
  }

  addPersonalizedElements(playerProfile) {
    return {
      interests: playerProfile.interests || [],
      preferredGameModes: playerProfile.preferredGameModes || [],
      culturalBackground: playerProfile.culturalBackground || 'default',
    };
  }

  estimateTimeRequirement(playerProfile, objectives) {
    const baseTime = 15; // minutes
    const complexityMultiplier = objectives.length * 0.3;
    return Math.round(baseTime * (1 + complexityMultiplier));
  }
}

class NarrativeEngine {
  constructor() {
    this.storyArcs = new Map();
    this.characterProfiles = new Map();
    this.narrativeState = new Map();
  }

  generatePersonalizedNarrative(playerProfile, currentProgress) {
    const narrative = {
      currentChapter: this.determineCurrentChapter(currentProgress),
      personalizedElements: this.createPersonalizedElements(playerProfile),
      choiceHistory: this.getChoiceHistory(playerProfile.id),
      upcomingBranches: this.calculateUpcomingBranches(currentProgress),
    };

    return narrative;
  }

  determineCurrentChapter(progress) {
    const level = progress.level || 1;

    if (level <= 10) return 'awakening';
    if (level <= 25) return 'participation';
    if (level <= 45) return 'leadership';
    if (level <= 70) return 'mastery';
    return 'legacy';
  }

  createPersonalizedElements(playerProfile) {
    return {
      characterName: playerProfile.displayName || 'Held',
      culturalBackground: playerProfile.culturalBackground || 'urban_austria',
      interests: playerProfile.interests || ['politics', 'technology'],
      personalChallenges: this.identifyPersonalChallenges(playerProfile),
    };
  }

  getChoiceHistory(playerId) {
    return this.narrativeState.get(playerId)?.choices || [];
  }

  calculateUpcomingBranches(_progress) {
    return {
      majorChoices: 2,
      characterDevelopmentOpportunities: 3,
      collaborativeStoryElements: 1,
    };
  }

  identifyPersonalChallenges(playerProfile) {
    const challenges = [];

    if (playerProfile.shyness > 0.7) {
      challenges.push('social_confidence');
    }

    if (playerProfile.criticalThinking < 0.5) {
      challenges.push('analytical_skills');
    }

    return challenges;
  }
}

class DifficultySystem {
  calculateOptimalDifficulty(playerData, gameContext) {
    const competencyLevel = this.assessCompetencyLevel(playerData, gameContext);
    const engagementHistory = this.analyzeEngagementHistory(playerData);
    const performanceTrend = this.calculatePerformanceTrend(playerData);

    return Math.max(
      0.1,
      Math.min(1.0, competencyLevel * 0.4 + engagementHistory * 0.3 + performanceTrend * 0.3)
    );
  }

  assessCompetencyLevel(playerData, gameContext) {
    const requiredCompetencies = gameContext.requiredCompetencies || [];
    if (requiredCompetencies.length === 0) return 0.5;

    const scores = requiredCompetencies.map(comp => playerData.competencies?.[comp] || 0);

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  analyzeEngagementHistory(playerData) {
    const history = playerData.engagementHistory || [];
    if (history.length === 0) return 0.5;

    return history.reduce((a, b) => a + b, 0) / history.length;
  }

  calculatePerformanceTrend(playerData) {
    const performances = playerData.recentPerformances || [];
    if (performances.length < 2) return 0.5;

    const recent = performances.slice(-3);
    const older = performances.slice(-6, -3);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;

    return Math.max(0, Math.min(1, recentAvg - olderAvg + 0.5));
  }
}

class FlowStateOptimizer {
  adjustForFlowState(playerProfile, currentChallenge) {
    const skillLevel = this.assessSkillLevel(playerProfile, currentChallenge);
    const challengeLevel = currentChallenge.difficulty || 0.5;

    // Flow state occurs when challenge slightly exceeds skill
    const optimalChallenge = skillLevel + 0.1;

    return {
      recommendedDifficulty: optimalChallenge,
      flowProbability: this.calculateFlowProbability(skillLevel, optimalChallenge),
      adjustmentReason: this.getAdjustmentReason(skillLevel, challengeLevel),
    };
  }

  assessSkillLevel(playerProfile, currentChallenge) {
    const relevantCompetencies = currentChallenge.requiredCompetencies || [];
    if (relevantCompetencies.length === 0) return 0.5;

    const skillScores = relevantCompetencies.map(comp => playerProfile.competencies?.[comp] || 0);

    return skillScores.reduce((a, b) => a + b, 0) / skillScores.length;
  }

  calculateFlowProbability(skillLevel, challengeLevel) {
    const difference = Math.abs(skillLevel - challengeLevel);
    return Math.max(0, 1 - difference * 2); // Flow decreases as gap increases
  }

  getAdjustmentReason(skillLevel, challengeLevel) {
    if (challengeLevel > skillLevel + 0.2) return 'reduce_difficulty_anxiety_prevention';
    if (challengeLevel < skillLevel - 0.2) return 'increase_difficulty_boredom_prevention';
    return 'optimal_flow_zone';
  }
}

// Export the main class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedGameplaySystem;
} else if (typeof window !== 'undefined') {
  window.AdvancedGameplaySystem = AdvancedGameplaySystem;
}
