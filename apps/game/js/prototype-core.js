/**
 * Democracy Metaverse - Prototype Core Engine
 * Version: 1.0.0 (MVP)
 * Scope: 30 Level (Kapitel 1-3) + Core-Systeme
 *
 * Features:
 * - 4-Achsen-Werte-System (Empathy/Rights/Participation/Courage)
 * - Level-Progression mit adaptiver Schwierigkeit
 * - Boss-Mechaniken für 3 Kapitel
 * - Save/Load System mit localStorage
 * - PWA-Ready mit Service Worker Integration
 * - Accessibility AAA Support
 */

class DemocracyMetaversePrototype {
  constructor() {
    this.version = '1.0.0-prototype';
    this.maxLevels = 30;
    this.currentLevel = 1;
    this.isInitialized = false;

    // Core Game State
    this.gameState = {
      playerId: this.generatePlayerId(),
      currentLevel: 1,
      currentChapter: 1,
      unlockedLevels: [1],
      completedLevels: [],

      // 4-Achsen-Werte-System
      values: {
        empathy: 0, // Empathie & Solidarität
        rights: 0, // Rechtsstaatlichkeit & Fairness
        participation: 0, // Partizipation & Engagement
        courage: 0, // Zivilcourage & Mut
      },

      // Skill-Tree (Prototyp-Version)
      skills: {
        listening: 0, // Aktives Zuhören
        mediation: 0, // Konfliktvermittlung
        rhetoric: 0, // Überzeugungskraft
        research: 0, // Fakten-Check
        networking: 0, // Bündnisse schmieden
        leadership: 0, // Führungskompetenzen
      },

      // Chapter Progress
      chapters: {
        1: { name: 'Nachbarschaft', progress: 0, unlocked: true, boss_defeated: false },
        2: { name: 'Schule & Arbeit', progress: 0, unlocked: false, boss_defeated: false },
        3: { name: 'Digitale Demokratie', progress: 0, unlocked: false, boss_defeated: false },
      },

      // Stats & Analytics
      stats: {
        totalPlayTime: 0,
        decisionsPerMinute: 0,
        conflictsResolved: 0,
        valuesGained: 0,
        perfectLevels: 0,
        bossesDefeated: 0,
      },

      // Settings
      settings: {
        soundEnabled: true,
        animationsEnabled: true,
        difficultyLevel: 'adaptive',
        accessibilityMode: false,
        language: 'de',
      },

      // Multiplayer (Basic)
      multiplayer: {
        isActive: false,
        roomId: null,
        players: [],
        isHost: false,
      },
    };

    // Event System
    this.eventListeners = {
      levelComplete: [],
      valueChange: [],
      bossDefeated: [],
      chapterUnlocked: [],
      skillUnlocked: [],
    };

    // Performance Metrics
    this.metrics = {
      loadStartTime: performance.now(),
      frameCount: 0,
      fps: 60,
      lastFrameTime: 0,
    };

    this.init();
  }

  /**
   * Initialize Game Engine
   */
  async init() {
    console.log(`🚀 Democracy Metaverse Prototype ${this.version} starting...`);

    try {
      await this.loadGameData();
      await this.setupEventListeners();
      await this.initializeUI();
      await this.loadSavedGame();

      this.isInitialized = true;
      this.logMetric('engine_init_time', performance.now() - this.metrics.loadStartTime);

      console.log(`✅ Game Engine ready! Current Level: ${this.currentLevel}`);
      this.triggerEvent('gameReady', { level: this.currentLevel });
    } catch (error) {
      console.error('❌ Failed to initialize game engine:', error);
      this.showError('Spiel konnte nicht geladen werden. Bitte Seite neu laden.');
    }
  }

  /**
   * Load Game Content (Levels, Characters, etc.)
   */
  async loadGameData() {
    // Load Level Definitions (simplified for prototype)
    this.levelDefinitions = await this.loadLevelDefinitions();

    // Load Characters
    this.characters = {
      player: { name: 'Du', avatar: '🌉', description: 'Brückenbauer*in' },
      neighbors: [
        { id: 'grimmig', name: 'Herr Grimmig', avatar: '😠', type: 'boss_1' },
        { id: 'freundlich', name: 'Frau Freundlich', avatar: '😊', type: 'ally' },
        { id: 'neutral', name: 'Familie Neutral', avatar: '😐', type: 'neutral' },
      ],
      bosses: [
        {
          id: 'sturkopf_nachbar',
          name: 'Herr Grimmig',
          avatar: '👹',
          chapter: 1,
          level: 10,
          health: 100,
          type: 'emotional_resistance',
          patterns: ['denial', 'escalation', 'guilt_tripping'],
          weaknesses: ['empathy', 'common_ground', 'respect'],
        },
        {
          id: 'ungerechter_chef',
          name: 'Direktor Macht',
          avatar: '🎩',
          chapter: 2,
          level: 20,
          health: 150,
          type: 'institutional_authority',
          patterns: ['hierarchy_assertion', 'deflection', 'intimidation'],
          weaknesses: ['evidence', 'coalition', 'transparency'],
        },
        {
          id: 'fake_news_mastermind',
          name: 'Dr. Desinformation',
          avatar: '🕴️',
          chapter: 3,
          level: 30,
          health: 200,
          type: 'information_warfare',
          patterns: ['deepfake_spam', 'source_flooding', 'emotion_manipulation'],
          weaknesses: ['fact_checking', 'source_triangulation', 'calm_logic'],
        },
      ],
    };

    console.log(`📚 Loaded ${Object.keys(this.levelDefinitions).length} level definitions`);
  }

  /**
   * Level Definitions (Prototype - first 30 levels)
   */
  async loadLevelDefinitions() {
    return {
      // KAPITEL 1: NACHBARSCHAFT (Level 1-10)
      1: {
        id: 1,
        chapter: 1,
        title: 'Lärm im Hof',
        type: 'tutorial',
        description: 'Die Nachbarn beschweren sich über laute Musik. Wie gehst du vor?',
        scenario:
          'Es ist 22:30 Uhr. Aus der Wohnung über dir dröhnt Musik. Morgen hast du eine wichtige Prüfung.',
        choices: [
          {
            text: 'Sofort klingeln und Konfrontation suchen',
            values: { courage: +1, empathy: -1 },
            consequences: 'Nachbar wird aggressiv. Konflikt eskaliert.',
          },
          {
            text: 'Höflich anklopfen und Situation erklären',
            values: { empathy: +2, participation: +1 },
            consequences: 'Nachbar zeigt Verständnis. Musik wird leiser.',
          },
          {
            text: 'Nichts tun und leiden',
            values: { empathy: +1, courage: -2 },
            consequences: 'Problem bleibt bestehen. Schlafmangel am nächsten Tag.',
          },
          {
            text: 'Direkt Hausverwalter kontaktieren',
            values: { rights: +1, participation: -1 },
            consequences: 'Formeller Weg, aber Nachbarschaftsbeziehung leidet.',
          },
        ],
        learning_objectives: [
          'Empathie im Alltag',
          'Konfliktvermeidung vs. Ansprechen',
          'Respektvolle Kommunikation',
        ],
        difficulty: 1,
        estimated_time: 3,
      },

      2: {
        id: 2,
        chapter: 1,
        title: 'Essensgerüche',
        type: 'cultural_sensitivity',
        description: 'Starke Curry-Gerüche aus der Nachbarwohnung sorgen für Diskussionen.',
        scenario:
          "Im Hausflur beschweren sich einige über 'fremde Gerüche' aus der Wohnung der indischen Familie.",
        choices: [
          {
            text: 'Den Beschwerdeführer*innen beipflichten',
            values: { empathy: -2, participation: +1 },
            consequences: 'Diskriminierung verstärkt sich. Familie fühlt sich ausgegrenzt.',
          },
          {
            text: 'Die kulturelle Vielfalt verteidigen',
            values: { empathy: +3, courage: +2, rights: +1 },
            consequences: 'Familie fühlt sich unterstützt. Nachbarschaft wird sensibler.',
          },
          {
            text: 'Kompromiss vorschlagen (Lüftungszeiten)',
            values: { participation: +2, empathy: +1 },
            consequences: 'Praktische Lösung gefunden. Alle zufrieden.',
          },
          {
            text: 'Das Thema vermeiden',
            values: { courage: -1 },
            consequences: 'Konflikt schwelt weiter. Familie wird isoliert.',
          },
        ],
        learning_objectives: [
          'Kulturelle Sensibilität',
          'Anti-Diskriminierung',
          'Inclusive Community',
        ],
        difficulty: 2,
        estimated_time: 4,
      },

      3: {
        id: 3,
        chapter: 1,
        title: 'Müll oder Kultur?',
        type: 'aesthetic_conflict',
        description: "Nachbarn diskutieren über 'fremde' Dekorationen im Hausflur.",
        scenario:
          "Familie Hassan hat bunte Teppiche und Pflanzen im gemeinsamen Flur aufgestellt. Einige Nachbarn finden das 'unordentlich'.",
        choices: [
          {
            text: 'Die Hausordnung durchsetzen - alles muss weg',
            values: { rights: +1, empathy: -2, participation: -1 },
            consequences: 'Familie fühlt sich diskriminiert. Hausgemeinschaft wird gespalten.',
            followUp: 'conflict_escalation',
          },
          {
            text: 'Gemeinsame Gestaltungsregeln entwickeln',
            values: { participation: +3, empathy: +2, rights: +1 },
            consequences: 'Alle Nachbarn können sich einbringen. Vielfalt wird geschätzt.',
            followUp: 'community_building',
          },
          {
            text: 'Kulturelle Vielfalt als Bereicherung feiern',
            values: { empathy: +3, courage: +2, participation: +1 },
            consequences: 'Nachbarschaft wird bunter und offener. Vorurteile werden abgebaut.',
            followUp: 'diversity_celebration',
          },
          {
            text: 'Privat mit Familie Hassan sprechen',
            values: { empathy: +1, participation: +1, courage: -1 },
            consequences: 'Direktes Gespräch hilft, aber löst systemisches Problem nicht.',
            followUp: 'individual_solution',
          },
        ],
        learning_objectives: [
          'Kulturelle Sensibilität',
          'Ästhetik und Identität',
          'Inclusive Space Design',
        ],
        difficulty: 2,
        estimated_time: 5,
        minigame: null,
      },

      4: {
        id: 4,
        chapter: 1,
        title: 'Nachbarschaftshilfe',
        type: 'solidarity_building',
        description: 'Frau Weber ist krank und braucht Hilfe beim Einkaufen.',
        scenario:
          'Die 78-jährige Frau Weber aus dem 2. Stock hat sich das Bein gebrochen. Du siehst, wie sie mühsam die Treppen hochgeht.',
        choices: [
          {
            text: 'Sofort anbieten zu helfen und regelmäßig nachfragen',
            values: { empathy: +3, participation: +2, courage: +1 },
            consequences:
              'Frau Weber ist dankbar. Ihr entwickelt eine schöne Nachbarschaftsbeziehung.',
            followUp: 'ongoing_support',
          },
          {
            text: 'Nachbarschaftshilfe-Gruppe organisieren',
            values: { participation: +4, empathy: +2, rights: +1 },
            consequences: 'Systematische Hilfe entsteht. Gemeinschaftsgefühl stärkt sich.',
            followUp: 'community_network',
          },
          {
            text: 'Einmal helfen, aber dann nichts mehr machen',
            values: { empathy: +1, participation: -1 },
            consequences: 'Kurzzeitige Hilfe, aber keine nachhaltige Lösung.',
            followUp: 'minimal_engagement',
          },
          {
            text: 'Das ist nicht meine Verantwortung',
            values: { empathy: -2, participation: -2, courage: -1 },
            consequences: 'Frau Weber bleibt isoliert. Nachbarschaft wird kälter.',
            followUp: 'social_isolation',
          },
        ],
        learning_objectives: [
          'Solidarität im Alltag',
          'Care-Arbeit in der Gemeinschaft',
          'Nachbarschaftsnetze',
        ],
        difficulty: 2,
        estimated_time: 4,
        minigame: null,
      },

      5: {
        id: 5,
        chapter: 1,
        title: 'Hundekonflikt',
        type: 'rules_vs_needs',
        description:
          'Hundebesitzer*in vs. Nicht-Hundebesitzer*in - verschiedene Bedürfnisse prallen aufeinander.',
        scenario:
          'Herr Müller lässt seinen Hund im Innenhof frei laufen. Familie Schmidt hat Angst, weil ihr 4-jähriges Kind sich fürchtet.',
        choices: [
          {
            text: 'Striktes Leinenzwang durchsetzen',
            values: { rights: +2, participation: -1 },
            consequences: 'Problem gelöst, aber Hundebesitzer fühlen sich bevormundet.',
            followUp: 'rules_enforcement',
          },
          {
            text: 'Hundezeiten und kinderfreie Zeiten vereinbaren',
            values: { participation: +3, empathy: +2, rights: +1 },
            consequences: 'Kompromiss funktioniert. Beide Seiten sind zufrieden.',
            followUp: 'time_sharing',
          },
          {
            text: 'Eingezäunten Hundebereich schaffen',
            values: { participation: +2, empathy: +1, rights: +1 },
            consequences: 'Bauliche Lösung schafft Raum für alle.',
            followUp: 'infrastructure_solution',
          },
          {
            text: 'Kind soll sich an Hunde gewöhnen',
            values: { empathy: -2, participation: -1 },
            consequences: 'Familie Schmidt fühlt sich nicht ernst genommen.',
            followUp: 'dismissive_attitude',
          },
        ],
        learning_objectives: [
          'Interessenskonflikte lösen',
          'Win-Win-Lösungen finden',
          'Kompromissfähigkeit',
        ],
        difficulty: 3,
        estimated_time: 4,
        minigame: 'bridge_puzzle',
      },

      6: {
        id: 6,
        chapter: 1,
        title: 'Kinder vs. Ruhe',
        type: 'generational_conflict',
        description: 'Spielende Kinder im Hof sorgen für Diskussionen über Ruhezeiten.',
        scenario:
          'Die Kinder im Haus spielen nach 20 Uhr noch Fußball im Innenhof. Einige Nachbarn beschweren sich über Lärm.',
        choices: [
          {
            text: 'Feste Ruhezeiten ab 19 Uhr durchsetzen',
            values: { rights: +2, empathy: -1, participation: +1 },
            consequences: 'Ruhe ist da, aber Kinder haben wenig Spielraum.',
            followUp: 'strict_quiet_hours',
          },
          {
            text: 'Gemeinsame Spielregeln entwickeln',
            values: { participation: +3, empathy: +2, rights: +1 },
            consequences: 'Alle sind beteiligt. Kreative Lösung entsteht.',
            followUp: 'collaborative_rules',
          },
          {
            text: 'Alternative Spielplätze in der Nähe suchen',
            values: { empathy: +2, participation: +1 },
            consequences: 'Kinder bekommen neue Möglichkeiten. Hof wird ruhiger.',
            followUp: 'external_alternatives',
          },
          {
            text: 'Kinder müssen Rücksicht lernen - Punkt!',
            values: { rights: +1, empathy: -2, participation: -1 },
            consequences: 'Generationenkonflikt verschärft sich.',
            followUp: 'authoritarian_approach',
          },
        ],
        learning_objectives: [
          'Generationenkonflikte',
          'Kinderrechte vs. Ruhebedürfnis',
          'Gemeinsame Regelentwicklung',
        ],
        difficulty: 3,
        estimated_time: 5,
        minigame: null,
      },

      7: {
        id: 7,
        chapter: 1,
        title: 'Straßenfest',
        type: 'community_organizing',
        description: 'Die Idee eines Nachbarschaftsfests muss organisiert werden.',
        scenario:
          'Du schlägst ein Straßenfest vor. Einige sind begeistert, andere skeptisch. Wie organisierst du es demokratisch?',
        choices: [
          {
            text: 'Alles selbst planen und andere informieren',
            values: { courage: +1, participation: -2, empathy: -1 },
            consequences: 'Fest findet statt, aber wenig Beteiligung der Nachbarn.',
            followUp: 'top_down_organizing',
          },
          {
            text: 'Planungsgruppe gründen mit offenen Treffen',
            values: { participation: +4, empathy: +2, courage: +1 },
            consequences: 'Viele bringen sich ein. Fest wird zum Gemeinschaftserlebnis.',
            followUp: 'democratic_organizing',
          },
          {
            text: 'Professionelle Eventfirma beauftragen',
            values: { participation: -1, empathy: -1, rights: +1 },
            consequences: 'Fest ist professionell, aber unpersönlich.',
            followUp: 'outsourced_event',
          },
          {
            text: 'Digitale Umfrage erstellen für alle Entscheidungen',
            values: { participation: +2, rights: +1, empathy: +1 },
            consequences: 'Demokratische Entscheidungen, aber wenig persönliche Begegnung.',
            followUp: 'digital_democracy',
          },
        ],
        learning_objectives: [
          'Community Organizing',
          'Partizipative Planung',
          'Demokratische Entscheidungsfindung',
        ],
        difficulty: 4,
        estimated_time: 6,
        minigame: 'debate_duel',
      },

      8: {
        id: 8,
        chapter: 1,
        title: 'Erste Mediation',
        type: 'conflict_resolution',
        description: 'Zwei Nachbarn streiten heftig - du wirst um Vermittlung gebeten.',
        scenario:
          'Frau König und Herr Pfeifer haben einen eskalierenden Streit über Parkplätze. Beide bitten dich um Unterstützung.',
        choices: [
          {
            text: 'Partei für die Person ergreifen, die recht hat',
            values: { rights: +1, empathy: -1, participation: -1 },
            consequences: 'Eine Seite gewinnt, aber Konflikt bleibt bestehen.',
            followUp: 'taking_sides',
          },
          {
            text: 'Mediationsgespräch mit beiden organisieren',
            values: { participation: +3, empathy: +3, courage: +2 },
            consequences: 'Beide Seiten werden gehört. Nachhaltige Lösung entsteht.',
            followUp: 'professional_mediation',
          },
          {
            text: 'Hausverwalter einschalten - soll der entscheiden',
            values: { rights: +1, participation: -1, courage: -1 },
            consequences: 'Problem wird delegiert, aber nicht wirklich gelöst.',
            followUp: 'authority_delegation',
          },
          {
            text: 'Kreative Lösung vorschlagen (Parkplätze rotieren)',
            values: { participation: +2, empathy: +2, courage: +1 },
            consequences: 'Innovative Ansatz überrascht beide. Fairness entsteht.',
            followUp: 'creative_solution',
          },
        ],
        learning_objectives: ['Mediation und Konfliktlösung', 'Aktives Zuhören', 'Win-Win-Denken'],
        difficulty: 4,
        estimated_time: 6,
        minigame: null,
      },

      9: {
        id: 9,
        chapter: 1,
        title: 'Special: Nachbarschaftskarte',
        type: 'special_minigame',
        description: 'Erstelle eine interaktive Karte der Nachbarschaftsbeziehungen.',
        scenario:
          'Du willst die sozialen Verbindungen in der Nachbarschaft sichtbar machen. Wer kennt wen? Wo gibt es Konflikte? Wo ist Potenzial?',
        choices: [
          {
            text: 'Alle Nachbarn einzeln befragen',
            values: { empathy: +2, participation: +1 },
            consequences: 'Detaillierte Informationen, aber zeitaufwändig.',
            followUp: 'individual_interviews',
          },
          {
            text: 'Gemeinsamen Mapping-Workshop organisieren',
            values: { participation: +4, empathy: +2, courage: +1 },
            consequences: 'Nachbarn lernen sich kennen und schaffen gemeinsam Überblick.',
            followUp: 'collective_mapping',
          },
          {
            text: 'Online-Tool für anonyme Eingaben nutzen',
            values: { participation: +1, rights: +1 },
            consequences: 'Ehrliche Antworten durch Anonymität, aber weniger Verbindung.',
            followUp: 'digital_anonymous',
          },
          {
            text: 'Karte aus eigener Beobachtung erstellen',
            values: { empathy: +1, participation: -1 },
            consequences: 'Subjektive Sicht, möglicherweise unvollständig.',
            followUp: 'solo_observation',
          },
        ],
        learning_objectives: [
          'Soziale Netzwerkanalyse',
          'Community Mapping',
          'Partizipative Forschung',
        ],
        difficulty: 3,
        estimated_time: 8,
        minigame: 'network_mapping',
      },

      10: {
        id: 10,
        chapter: 1,
        title: 'Boss: Sturkopf-Nachbar',
        type: 'boss_battle',
        description:
          'Herr Grimmig blockiert alle Nachbarschaftsinitiativen. Zeit für die finale Konfrontation!',
        boss: 'sturkopf_nachbar',
        scenario:
          "Herr Grimmig droht, das geplante Nachbarschaftsfest zu sabotieren. Er behauptet, 'früher war alles besser' und will keine Veränderungen.",
        victory_conditions: {
          persuasion_points: 50,
          no_aggression: true,
          empathy_threshold: 15,
        },
        boss_phases: [
          {
            phase: 1,
            health: 100,
            pattern: 'denial',
            dialogue:
              'Das braucht hier niemand! Früher haben wir uns auch nicht ständig getroffen!',
            weakness: 'empathy',
            responses: [
              {
                text: 'Früher war vieles anders - aber Menschen brauchen Gemeinschaft',
                empathy: +3,
                effectiveness: 85,
                consequence: 'Herr Grimmig denkt kurz nach...',
              },
              {
                text: 'Sie haben recht, zwingen wollen wir niemanden',
                empathy: +2,
                effectiveness: 60,
                consequence: 'Er wird etwas weniger defensiv.',
              },
              {
                text: 'Die Zeiten ändern sich, wir müssen mit!',
                empathy: -1,
                effectiveness: 20,
                consequence: 'Das macht ihn noch wütender!',
              },
            ],
          },
          {
            phase: 2,
            health: 60,
            pattern: 'escalation',
            dialogue: 'Ihr jungen Leute wollt alles ändern! Ich habe 40 Jahre hier gelebt!',
            weakness: 'common_ground',
            responses: [
              {
                text: 'Ihre Erfahrung ist wertvoll - teilen Sie sie mit uns!',
                empathy: +3,
                effectiveness: 90,
                consequence: "Überraschung: 'Meine Erfahrung ist wertvoll?'",
              },
              {
                text: 'Wir wollen das Bewährte bewahren und Neues ergänzen',
                empathy: +2,
                effectiveness: 70,
                consequence: 'Er nickt langsam zustimmend.',
              },
              {
                text: '40 Jahre Isolation sind genug!',
                empathy: -2,
                effectiveness: 10,
                consequence: 'Völlige Eskalation - er schreit!',
              },
            ],
          },
          {
            phase: 3,
            health: 20,
            pattern: 'vulnerability',
            dialogue: 'Seit meine Frau gestorben ist... niemand fragt nach mir...',
            weakness: 'genuine_care',
            responses: [
              {
                text: 'Das tut mir leid. Sie sind nicht allein - wir sind da',
                empathy: +4,
                effectiveness: 95,
                consequence: "Tränen in den Augen: 'Wirklich?'",
              },
              {
                text: 'Das Nachbarschaftsfest wäre auch für Sie da',
                empathy: +2,
                effectiveness: 75,
                consequence: 'Er überlegt sichtlich.',
              },
              {
                text: 'Dann kommen Sie doch einfach dazu!',
                empathy: +1,
                effectiveness: 50,
                consequence: 'Zu direkt - er zögert noch.',
              },
            ],
          },
        ],
        learning_objectives: [
          'Schwierige Menschen verstehen',
          'Generationenkonflikte lösen',
          'Geduld und Beharrlichkeit',
        ],
        difficulty: 5,
        estimated_time: 8,
      },

      // ... (Level 11-30 werden in separater Datei definiert)
    };
  }

  /**
   * Start Level
   */
  async startLevel(levelId) {
    if (!this.isLevelUnlocked(levelId)) {
      throw new Error(`Level ${levelId} ist noch nicht freigeschaltet!`);
    }

    const level = this.levelDefinitions[levelId];
    if (!level) {
      throw new Error(`Level ${levelId} nicht gefunden!`);
    }

    this.currentLevel = levelId;
    this.currentLevelStartTime = Date.now();

    // Boss-Level spezielle Behandlung
    if (level.type === 'boss_battle') {
      return this.startBossBattle(level);
    }

    // Standard-Level
    this.triggerEvent('levelStart', { level, player: this.gameState });
    return level;
  }

  /**
   * Complete Level
   */
  async completeLevel(levelId, choices, performance = {}) {
    const level = this.levelDefinitions[levelId];
    if (!level) return false;

    // Calculate Values Changes
    const valueChanges = this.calculateValueChanges(choices);
    this.updateValues(valueChanges);

    // Update Progress
    if (!this.gameState.completedLevels.includes(levelId)) {
      this.gameState.completedLevels.push(levelId);
    }

    // Unlock next level
    const nextLevel = levelId + 1;
    if (nextLevel <= this.maxLevels && !this.gameState.unlockedLevels.includes(nextLevel)) {
      this.gameState.unlockedLevels.push(nextLevel);
    }

    // Check chapter completion
    this.checkChapterCompletion(level.chapter);

    // Calculate performance metrics
    const completionTime = Date.now() - this.currentLevelStartTime;
    const skillGains = this.calculateSkillGains(choices, performance);
    this.updateSkills(skillGains);

    // Save progress
    await this.saveGame();

    // Trigger events
    this.triggerEvent('levelComplete', {
      levelId,
      valueChanges,
      skillGains,
      completionTime,
      performance,
    });

    return {
      success: true,
      valueChanges,
      skillGains,
      nextLevel: this.isLevelUnlocked(nextLevel) ? nextLevel : null,
    };
  }

  /**
   * Boss Battle System
   */
  async startBossBattle(level) {
    const boss = this.characters.bosses.find(b => b.id === level.boss);
    if (!boss) throw new Error(`Boss ${level.boss} nicht gefunden!`);

    // Initialize boss state
    this.currentBoss = {
      ...boss,
      currentHealth: boss.health,
      currentPhase: 1,
      playerPersuasionPoints: 0,
      turnsWithoutAggression: 0,
      isDefeated: false,
    };

    this.triggerEvent('bossStart', { level, boss: this.currentBoss });
    return { level, boss: this.currentBoss };
  }

  /**
   * Process Boss Turn
   */
  processBossTurn(playerAction) {
    if (!this.currentBoss) return null;

    const level = this.levelDefinitions[this.currentLevel];
    const currentPhase = level.boss_phases.find(
      p =>
        this.currentBoss.currentHealth <= p.health && this.currentBoss.currentHealth > p.health - 40
    );

    // Process player action
    const actionResult = this.processBossAction(playerAction, currentPhase);

    // Check victory conditions
    if (this.checkBossVictory(level.victory_conditions)) {
      return this.defeatBoss();
    }

    // Boss response
    const bossResponse = this.generateBossResponse(currentPhase);

    return {
      playerAction: actionResult,
      bossResponse,
      bossHealth: this.currentBoss.currentHealth,
      persuasionPoints: this.currentBoss.playerPersuasionPoints,
      isVictorious: false,
    };
  }

  /**
   * Update Values System
   */
  updateValues(changes) {
    for (const [value, change] of Object.entries(changes)) {
      if (Object.prototype.hasOwnProperty.call(this.gameState.values, value)) {
        this.gameState.values[value] = Math.max(
          0,
          Math.min(100, this.gameState.values[value] + change)
        );

        this.triggerEvent('valueChange', {
          value,
          change,
          newTotal: this.gameState.values[value],
        });
      }
    }

    // Check for skill unlocks
    this.checkSkillUnlocks();
  }

  /**
   * Calculate Skill Gains
   */
  calculateSkillGains(choices, performance) {
    const gains = {};

    // Based on choices made
    choices.forEach(choice => {
      if (choice.text.includes('zuhör')) gains.listening = (gains.listening || 0) + 1;
      if (choice.text.includes('vermittel') || choice.text.includes('kompromiss')) {
        gains.mediation = (gains.mediation || 0) + 1;
      }
      if (choice.text.includes('überzeu') || choice.text.includes('argument')) {
        gains.rhetoric = (gains.rhetoric || 0) + 1;
      }
      if (choice.text.includes('fakt') || choice.text.includes('recherch')) {
        gains.research = (gains.research || 0) + 1;
      }
    });

    // Performance bonuses
    if (performance.perfectScore) {
      Object.keys(gains).forEach(skill => (gains[skill] = (gains[skill] || 0) + 1));
    }

    return gains;
  }

  /**
   * Save/Load System
   */
  async saveGame() {
    try {
      const saveData = {
        version: this.version,
        timestamp: Date.now(),
        gameState: this.gameState,
      };

      localStorage.setItem('democracy_metaverse_save', JSON.stringify(saveData));
      console.log('💾 Spiel gespeichert');
    } catch (error) {
      console.error('❌ Fehler beim Speichern:', error);
    }
  }

  async loadSavedGame() {
    try {
      const saveData = localStorage.getItem('democracy_metaverse_save');
      if (!saveData) return false;

      const data = JSON.parse(saveData);

      // Version check
      if (data.version !== this.version) {
        console.log('🔄 Save-Version veraltet, neues Spiel gestartet');
        return false;
      }

      this.gameState = { ...this.gameState, ...data.gameState };
      this.currentLevel = this.gameState.currentLevel;

      console.log('📁 Gespeichertes Spiel geladen');
      return true;
    } catch (error) {
      console.error('❌ Fehler beim Laden:', error);
      return false;
    }
  }

  /**
   * Utility Methods
   */
  isLevelUnlocked(levelId) {
    return this.gameState.unlockedLevels.includes(levelId);
  }

  calculateValueChanges(choices) {
    const changes = { empathy: 0, rights: 0, participation: 0, courage: 0 };

    choices.forEach(choice => {
      if (choice.values) {
        for (const [value, change] of Object.entries(choice.values)) {
          changes[value] = (changes[value] || 0) + change;
        }
      }
    });

    return changes;
  }

  checkChapterCompletion(chapterId) {
    const chapterLevels = Object.values(this.levelDefinitions)
      .filter(level => level.chapter === chapterId)
      .map(level => level.id);

    const completedInChapter = this.gameState.completedLevels.filter(levelId =>
      chapterLevels.includes(levelId)
    );

    if (completedInChapter.length === chapterLevels.length) {
      this.gameState.chapters[chapterId].progress = 100;

      // Unlock next chapter
      const nextChapter = chapterId + 1;
      if (this.gameState.chapters[nextChapter]) {
        this.gameState.chapters[nextChapter].unlocked = true;
        this.triggerEvent('chapterUnlocked', { chapterId: nextChapter });
      }
    }
  }

  /**
   * Event System
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  triggerEvent(event, data = {}) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Setup Event Listeners
   */
  async setupEventListeners() {
    // Performance monitoring
    this.addEventListener('levelComplete', data => {
      this.gameState.stats.conflictsResolved++;
      this.gameState.stats.valuesGained += Object.values(data.valueChanges).reduce(
        (sum, val) => sum + Math.abs(val),
        0
      );
    });

    // Accessibility shortcuts
    if (this.gameState.settings.accessibilityMode) {
      document.addEventListener('keydown', this.handleAccessibilityShortcuts.bind(this));
    }
  }

  /**
   * UI Integration
   */
  async initializeUI() {
    // Wait for DOM ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Initialize UI components
    this.setupProgressBar();
    this.setupValueMeters();
    this.setupAccessibility();

    console.log('🎨 UI initialized');
  }

  setupProgressBar() {
    const progressBar = document.getElementById('level-progress');
    if (progressBar) {
      const progress = (this.gameState.completedLevels.length / this.maxLevels) * 100;
      progressBar.style.width = `${progress}%`;
      progressBar.setAttribute('aria-valuenow', progress);
    }
  }

  setupValueMeters() {
    Object.entries(this.gameState.values).forEach(([value, amount]) => {
      const meter = document.getElementById(`value-${value}`);
      if (meter) {
        meter.style.width = `${amount}%`;
        meter.setAttribute('aria-valuenow', amount);
        meter.textContent = `${value}: ${amount}`;
      }
    });
  }

  /**
   * Performance & Analytics
   */
  logMetric(event, value, metadata = {}) {
    const metric = {
      event,
      value,
      timestamp: Date.now(),
      level: this.currentLevel,
      ...metadata,
    };

    console.log(`📊 Metric: ${event} = ${value}`, metadata);

    // Send to analytics (wenn implementiert)
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track(event, metric);
    }
  }

  /**
   * Error Handling
   */
  showError(message) {
    console.error('❌', message);

    // Show user-friendly error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  /**
   * Utility: Generate unique player ID
   */
  generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get Game State (for debugging)
   */
  getGameState() {
    return {
      ...this.gameState,
      engine_version: this.version,
      is_initialized: this.isInitialized,
      current_level_data: this.levelDefinitions[this.currentLevel],
    };
  }
}

/**
 * Initialize Game Engine when page loads
 */
let gameEngine = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌉 Democracy Metaverse Prototype loading...');

  try {
    gameEngine = new DemocracyMetaversePrototype();

    // Make globally available for debugging
    window.gameEngine = gameEngine;
    window.democracy = gameEngine; // shorthand

    console.log('✅ Game Engine ready for action!');
  } catch (error) {
    console.error('💥 Critical error during initialization:', error);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DemocracyMetaversePrototype;
}
