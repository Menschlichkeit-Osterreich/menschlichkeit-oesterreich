/**
 * Democracy Metaverse - Character Development System
 * Dynamische NPCs mit Erinnerung, Wachstum und Beziehungsaufbau
 *
 * Features:
 * - Langzeit-Charakterentwicklung basierend auf Spieler-Interaktionen
 * - Emotionale Intelligenz für NPCs
 * - Beziehungssystem mit Vertrauen, Respekt, Zuneigung
 * - Adaptive Persönlichkeiten
 */

class CharacterDevelopmentSystem {
  constructor() {
    this.characters = new Map();
    this.relationships = new Map();
    this.memorySystem = new CharacterMemorySystem();
    this.emotionalStates = new Map();
    this.developmentTracks = new Map();
  }

  /**
   * Erweiterte Charakter-Definitionen für Level 1-10
   */
  initializeCharacters() {
    const characters = {
      alex_hartmann: {
        name: 'Alex Hartmann',
        age: 32,
        profession: 'Krankenpfleger im Schichtdienst',
        background: {
          story:
            'Arbeitet seit 5 Jahren in der Nachtschicht im Krankenhaus. Zog vor 2 Jahren in die Wohnung über dir. Ist eigentlich hilfsbereit, aber chronisch übermüdet.',
          family: 'Single, keine Kinder, Eltern leben weit weg',
          hobbies: ['Musik hören', 'Gaming', 'Fitness (wenn Zeit da ist)'],
          values: ['Fairness', 'Hilfsbereitschaft', 'Ruhe'],
          triggers: ['Lärm während Schlafzeiten', 'Ungerechtigkeit', 'Stress'],
        },

        personality: {
          baseline: {
            empathy: 6,
            patience: 4,
            social_energy: 3,
            stress_level: 7,
            openness: 5,
            cooperation: 6,
          },

          development_paths: {
            friend_path: {
              triggers: ['understanding_shown', 'help_offered', 'respect_given'],
              changes: {
                empathy: +2,
                patience: +3,
                social_energy: +2,
                stress_level: -2,
                cooperation: +3,
              },
              unlocked_dialogues: [
                'personal_struggles_sharing',
                'work_stories',
                'mutual_support_offers',
              ],
              special_abilities: [
                'medical_help_neighbor',
                'shift_schedule_coordination',
                'stress_management_advice',
              ],
            },

            enemy_path: {
              triggers: ['confrontation', 'disrespect', 'escalation'],
              changes: {
                empathy: -2,
                patience: -2,
                social_energy: -1,
                stress_level: +3,
                cooperation: -4,
              },
              unlocked_dialogues: [
                'passive_aggressive_comments',
                'complaint_threats',
                'cold_shoulder',
              ],
              special_abilities: [
                'noise_complaints',
                'rule_enforcement_demands',
                'social_isolation_tactics',
              ],
            },

            neutral_path: {
              triggers: ['formal_resolution', 'minimal_interaction'],
              changes: {
                patience: +1,
                stress_level: -1,
              },
              unlocked_dialogues: ['polite_greetings', 'weather_talk', 'formal_requests'],
            },
          },
        },

        dialogue_system: {
          greeting_variations: {
            friend: ["Hey! Wie geht's dir denn?", 'Schön dich zu sehen!', 'Hast du einen Moment?'],
            neutral: ['Hallo', 'Guten Tag', 'Hi'],
            enemy: ['...', 'Mhm.', 'Was willst du?'],
          },

          context_memory: {
            remembers_help: 'Danke nochmal für neulich. Das war wirklich nett von dir.',
            remembers_conflict: 'Ich hoffe, wir können das von letzter Woche hinter uns lassen.',
            remembers_mediation: 'Die Sache mit dem Hausverwalter hat gut funktioniert.',
          },

          adaptive_responses: {
            high_stress: 'Entschuldige, ich bin gerade ziemlich fertig...',
            low_stress: 'Ach, das ist doch kein Problem!',
            tired: 'Kannst du kurz machen? Ich muss gleich schlafen.',
            energetic: 'Was können wir zusammen machen?',
          },
        },
      },

      family_hassan: {
        name: 'Familie Hassan',
        members: {
          amira: {
            name: 'Amira Hassan',
            age: 38,
            role: 'Mutter, Deutschlehrerin',
            personality: { empathy: 8, cultural_pride: 9, patience: 7, openness: 6 },
          },
          farid: {
            name: 'Farid Hassan',
            age: 41,
            role: 'Vater, IT-Spezialist',
            personality: { empathy: 6, cultural_pride: 7, patience: 5, logic: 9 },
          },
          layla: {
            name: 'Layla Hassan',
            age: 8,
            role: 'Tochter, Schülerin',
            personality: { curiosity: 9, playfulness: 8, adaptability: 7 },
          },
          omar: {
            name: 'Omar Hassan',
            age: 6,
            role: 'Sohn, Kindergartenkind',
            personality: { energy: 9, empathy: 6, shyness: 4 },
          },
        },

        collective_development: {
          integration_successful: {
            triggers: [
              'cultural_appreciation',
              'inclusion_efforts',
              'defense_against_discrimination',
            ],
            outcomes: {
              family_confidence: +3,
              community_engagement: +4,
              cultural_sharing: +3,
              trust_in_neighbors: +2,
            },
            special_events: [
              'international_cooking_evening',
              'cultural_exchange_workshops',
              'language_learning_offers',
              'festival_celebrations',
            ],
          },

          integration_failed: {
            triggers: ['discrimination_experienced', 'isolation', 'cultural_dismissal'],
            outcomes: {
              family_confidence: -2,
              community_engagement: -3,
              withdrawal: +3,
              defensive_behavior: +2,
            },
            special_events: [
              'considering_moving_away',
              'complaint_to_authorities',
              'community_support_seeking',
              'cultural_center_involvement',
            ],
          },
        },
      },

      margarete_weber: {
        name: 'Margarete Weber',
        age: 78,
        background: {
          story:
            'Witwe seit 3 Jahren. Lebte 40 Jahre in dieser Nachbarschaft. Pensionierte Bibliothekarin. Sehr stolz und unabhängig, aber heimlich einsam.',
          family: 'Tochter lebt in einer anderen Stadt, seltener Kontakt',
          health: 'Gebrochenes Bein heilt langsam, aber sonst gesund',
          resources: ['Lebenserfahrung', 'Geschichten', 'Backfähigkeiten', 'Zeit'],
        },

        development_paths: {
          community_elder: {
            triggers: ['respect_shown', 'help_accepted', 'wisdom_requested'],
            transformation: {
              loneliness: -4,
              community_value: +5,
              life_satisfaction: +3,
              storytelling_activity: +4,
            },
            contributions: [
              'neighborhood_history_project',
              'intergenerational_mentoring',
              'traditional_skills_teaching',
              'community_memory_keeper',
            ],
          },

          isolated_elder: {
            triggers: ['help_refused', 'independence_lost', 'ignored'],
            transformation: {
              loneliness: +3,
              bitterness: +2,
              health_decline: +1,
              social_withdrawal: +3,
            },
          },
        },
      },

      friedrich_grimmig: {
        name: 'Friedrich Grimmig',
        age: 65,
        background: {
          story:
            "Kürzlich verwitwet nach 42-jähriger Ehe. Pensionierter Verwaltungsbeamter. Gewohnt an Ordnung und Regeln. Trauert um seine Frau Maria und die 'guten alten Zeiten'.",
          personality_drivers: ['grief', 'routine_need', 'control_need', 'fear_of_change'],
          hidden_needs: ['companionship', 'purpose', 'being_valued', 'stability'],
        },

        transformation_arc: {
          phase_1_denial: {
            behaviors: ['change_resistance', 'complaint_making', 'isolation'],
            dialogue_style: 'gruff_dismissive',
            openness_level: 2,
          },

          phase_2_anger: {
            triggers: ['patience_shown', 'respect_given'],
            behaviors: ['defensive_arguments', 'past_glorification', 'testing_boundaries'],
            dialogue_style: 'argumentative_but_engaging',
            openness_level: 4,
          },

          phase_3_vulnerability: {
            triggers: ['genuine_care', 'loneliness_acknowledged'],
            behaviors: ['emotional_sharing', 'help_requests', 'tentative_participation'],
            dialogue_style: 'honest_uncertain',
            openness_level: 7,
          },

          phase_4_integration: {
            triggers: ['community_role_offered', 'value_recognized'],
            behaviors: ['active_participation', 'wisdom_sharing', 'protective_of_community'],
            dialogue_style: 'wise_supportive',
            openness_level: 9,

            special_abilities: [
              'bureaucratic_navigation_help',
              'conflict_mediation_experience',
              'traditional_skills_teaching',
              'community_history_preservation',
            ],
          },
        },
      },
    };

    // Initialisiere alle Charaktere im System
    Object.entries(characters).forEach(([id, character]) => {
      this.characters.set(id, character);
      this.initializeRelationship(id);
      this.initializeEmotionalState(id);
      this.initializeDevelopmentTrack(id);
    });
  }

  initializeRelationship(characterId) {
    this.relationships.set(characterId, {
      trust: 5,
      respect: 5,
      affection: 5,
      familiarity: 1,
      shared_experiences: [],
      conflict_history: [],
      positive_memories: [],
      relationship_status: 'stranger',
    });
  }

  initializeEmotionalState(characterId) {
    this.emotionalStates.set(characterId, {
      current_mood: 'neutral',
      stress_level: 5,
      happiness: 5,
      energy: 5,
      recent_events_impact: [],
    });
  }

  initializeDevelopmentTrack(characterId) {
    this.developmentTracks.set(characterId, {
      current_path: 'baseline',
      development_points: 0,
      unlocked_content: [],
      personality_shifts: {},
      special_flags: [],
    });
  }

  /**
   * Interaktion mit Charakter verarbeiten
   */
  processInteraction(characterId, interactionType, playerChoice, context) {
    // Analysiere Spieler-Entscheidung
    const interactionAnalysis = this.analyzePlayerChoice(playerChoice, context);

    // Update Beziehung
    this.updateRelationship(characterId, interactionAnalysis);

    // Update emotionaler Zustand
    this.updateEmotionalState(characterId, interactionAnalysis);

    // Check für Entwicklungspfad-Änderungen
    this.checkDevelopmentPathTriggers(characterId, interactionAnalysis);

    // Generiere Charakter-Antwort
    const response = this.generateCharacterResponse(characterId, interactionAnalysis);

    // Speichere Interaktion in Erinnerungssystem
    this.memorySystem.recordInteraction(characterId, {
      type: interactionType,
      playerChoice: playerChoice,
      characterResponse: response,
      context: context,
      timestamp: Date.now(),
      relationship_impact: interactionAnalysis.relationship_impact,
    });

    return response;
  }

  analyzePlayerChoice(choice, context) {
    return {
      empathy_level: choice.values?.empathy || 0,
      respect_shown: this.detectRespect(choice.text),
      understanding_demonstrated: this.detectUnderstanding(choice.text, context),
      help_offered: this.detectHelpOffer(choice.text),
      patience_shown: this.detectPatience(choice.text),
      relationship_impact: this.calculateRelationshipImpact(choice),
    };
  }

  updateRelationship(characterId, analysis) {
    const relationship = this.relationships.get(characterId);

    // Trust updates
    if (analysis.empathy_level > 1) relationship.trust += 1;
    if (analysis.help_offered) relationship.trust += 2;
    if (analysis.understanding_demonstrated) relationship.trust += 1;

    // Respect updates
    if (analysis.respect_shown) relationship.respect += 2;
    if (analysis.patience_shown) relationship.respect += 1;

    // Affection updates
    if (analysis.empathy_level > 2) relationship.affection += 1;
    if (analysis.help_offered && analysis.respect_shown) relationship.affection += 1;

    // Familiarity increases with any interaction
    relationship.familiarity += 0.5;

    // Update relationship status
    this.updateRelationshipStatus(characterId);
  }

  updateRelationshipStatus(characterId) {
    const rel = this.relationships.get(characterId);
    const total_score = rel.trust + rel.respect + rel.affection;

    if (total_score >= 24 && rel.familiarity >= 10) {
      rel.relationship_status = 'close_friend';
    } else if (total_score >= 18 && rel.familiarity >= 5) {
      rel.relationship_status = 'friend';
    } else if (total_score >= 12) {
      rel.relationship_status = 'friendly_acquaintance';
    } else if (total_score >= 8) {
      rel.relationship_status = 'neutral_neighbor';
    } else if (total_score < 8) {
      rel.relationship_status = 'difficult_relationship';
    }
  }

  generateCharacterResponse(characterId, analysis) {
    const character = this.characters.get(characterId);
    const relationship = this.relationships.get(characterId);
    const emotionalState = this.emotionalStates.get(characterId);
    const developmentTrack = this.developmentTracks.get(characterId);

    // Wähle Response-Stil basierend auf Charakter und Beziehung
    const responseStyle = this.determineResponseStyle(character, relationship, emotionalState);

    // Generiere kontextuell angepasste Antwort
    return {
      dialogue: this.generateDialogue(characterId, responseStyle, analysis),
      emotional_reaction: this.generateEmotionalReaction(emotionalState, analysis),
      future_behavior_changes: this.predictBehaviorChanges(developmentTrack, analysis),
      relationship_feedback: this.generateRelationshipFeedback(relationship),
    };
  }

  // Hilfsmethoden für Analyse
  detectRespect(text) {
    const respectMarkers = ['bitte', 'entschuldigung', 'verstehe', 'respektiere', 'schätze'];
    return respectMarkers.some(marker => text.toLowerCase().includes(marker));
  }

  detectUnderstanding(text, _context) {
    const understandingMarkers = ['verstehe', 'nachvollziehen', 'sehe ein', 'kann mir vorstellen'];
    return understandingMarkers.some(marker => text.toLowerCase().includes(marker));
  }

  detectHelpOffer(text) {
    const helpMarkers = ['helfen', 'unterstützen', 'gemeinsam', 'zusammen'];
    return helpMarkers.some(marker => text.toLowerCase().includes(marker));
  }

  detectPatience(text) {
    const patienceMarkers = ['zeit lassen', 'schritt für schritt', 'langsam', 'geduld'];
    return patienceMarkers.some(marker => text.toLowerCase().includes(marker));
  }

  calculateRelationshipImpact(choice) {
    let impact = 0;
    if (choice.values) {
      impact += (choice.values.empathy || 0) * 0.3;
      impact += (choice.values.participation || 0) * 0.2;
      impact += (choice.values.courage || 0) * 0.15;
      impact += (choice.values.rights || 0) * 0.1;
    }
    return impact;
  }

  determineResponseStyle(_character, _relationship, _emotionalState) {
    // Komplex logic basierend auf Charakter-Persönlichkeit, Beziehungsstand und aktueller Emotion
    return 'adaptive'; // Placeholder
  }

  generateDialogue(_characterId, _responseStyle, _analysis) {
    // Generiere kontextuell angepassten Dialog
    return 'Adaptiver Dialog basierend auf Entwicklung'; // Placeholder
  }

  generateEmotionalReaction(_emotionalState, _analysis) {
    // Generiere emotionale Reaktion
    return 'Emotionale Reaktion'; // Placeholder
  }

  predictBehaviorChanges(_developmentTrack, _analysis) {
    // Vorhersage zukünftiger Verhaltensänderungen
    return []; // Placeholder
  }

  generateRelationshipFeedback(_relationship) {
    // Feedback über Beziehungsstand
    return 'Beziehungs-Feedback'; // Placeholder
  }

  updateEmotionalState(characterId, analysis) {
    // Update emotionaler Zustand basierend auf Interaktion
    const state = this.emotionalStates.get(characterId);

    if (analysis.empathy_level > 0) {
      state.happiness += analysis.empathy_level * 0.5;
      state.stress_level -= analysis.empathy_level * 0.3;
    }

    if (analysis.help_offered) {
      state.happiness += 1;
      state.energy += 0.5;
    }
  }

  checkDevelopmentPathTriggers(_characterId, _analysis) {
    // Prüfe ob Entwicklungspfad-Trigger aktiviert wurden
    // Implementierung der Trigger-Logik
    // Placeholder für komplexe Entwicklungspfad-Logik
  }
}

/**
 * Character Memory System für langfristige Erinnerungen
 */
class CharacterMemorySystem {
  constructor() {
    this.memories = new Map();
    this.significantEvents = new Map();
    this.emotionalMemories = new Map();
  }

  recordInteraction(characterId, interaction) {
    if (!this.memories.has(characterId)) {
      this.memories.set(characterId, []);
    }

    this.memories.get(characterId).push(interaction);

    // Bewerte Signifikanz der Interaktion
    if (this.isSignificant(interaction)) {
      this.recordSignificantEvent(characterId, interaction);
    }
  }

  isSignificant(interaction) {
    // Bewerte ob Interaktion signifikant genug ist für Langzeitgedächtnis
    return (
      Math.abs(interaction.relationship_impact) >= 2 ||
      interaction.type === 'major_conflict' ||
      interaction.type === 'major_help' ||
      interaction.type === 'emotional_breakthrough'
    );
  }

  recordSignificantEvent(characterId, interaction) {
    if (!this.significantEvents.has(characterId)) {
      this.significantEvents.set(characterId, []);
    }

    this.significantEvents.get(characterId).push({
      ...interaction,
      significance_score: this.calculateSignificance(interaction),
      memory_strength: 1.0,
    });
  }

  calculateSignificance(interaction) {
    // Berechne wie bedeutsam eine Erinnerung ist
    return (
      Math.abs(interaction.relationship_impact) +
      (interaction.type === 'emotional_breakthrough' ? 3 : 0) +
      (interaction.type === 'major_help' ? 2 : 0)
    );
  }

  getRelevantMemories(characterId, context) {
    const memories = this.memories.get(characterId) || [];
    return memories
      .filter(memory => this.isRelevantToContext(memory, context))
      .sort((a, b) => b.significance_score - a.significance_score);
  }

  isRelevantToContext(memory, context) {
    // Bestimme ob Erinnerung relevant für aktuellen Kontext ist
    return (
      memory.type === context.interaction_type || memory.context?.situation === context.situation
    );
  }
}

export { CharacterDevelopmentSystem, CharacterMemorySystem };
