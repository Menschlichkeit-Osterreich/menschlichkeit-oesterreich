/**
 * Democracy Metaverse - Extended Content System
 * Level 1-10 Follow-Up Szenarien & Langzeitkonsequenzen
 *
 * Erweitert die Basis-Level um:
 * - Follow-Up-Ereignisse basierend auf Entscheidungen
 * - Wiederkehrende Charaktere mit Entwicklung
 * - Langzeit-Reputations-System
 * - Adaptive Dialoge
 */

class ExtendedContentSystem {
  constructor(gameCore) {
    this.gameCore = gameCore;
    this.characterMemory = new Map();
    this.reputationSystem = new ReputationSystem();
    this.followUpEvents = new Map();
    this.adaptiveDialogues = new Map();
  }

  /**
   * Follow-Up Ereignisse für Level 1-10
   */
  getFollowUpScenarios() {
    return {
      // Level 1 Follow-Ups
      level_1_conflict_escalation: {
        triggerAfter: 2, // Levels
        condition: gameState => gameState.values.empathy < 0,
        event: {
          title: 'Nachbars-Rache',
          description:
            'Der Nachbar von Level 1 hat dich nicht vergessen. Jetzt spielt er extra laut Musik.',
          choices: [
            {
              text: 'Entschuldigung für damals anbieten',
              values: { empathy: +2, courage: +1 },
              consequence: 'Nachbar ist überrascht und versöhnlich. Konflikt gelöst.',
              characterDevelopment: 'neighbor_level1_reconciled',
            },
            {
              text: 'Eskalation fortsetzen - Polizei rufen',
              values: { rights: +1, empathy: -1, participation: -1 },
              consequence: 'Nachbarschaftskrieg entsteht. Andere Nachbarn werden involviert.',
              characterDevelopment: 'neighbor_level1_enemy',
            },
            {
              text: 'Mediation durch Hausverwalter vorschlagen',
              values: { participation: +2, empathy: +1, rights: +1 },
              consequence: 'Professionelle Hilfe schafft nachhaltige Lösung.',
              characterDevelopment: 'neighbor_level1_mediated',
            },
          ],
        },
      },

      level_1_empathy_success: {
        triggerAfter: 3,
        condition: gameState => gameState.values.empathy >= 3,
        event: {
          title: 'Nachbar wird Freund',
          description: 'Der Nachbar von Level 1 klopft an deine Tür - mit Kuchen!',
          choices: [
            {
              text: 'Kuchen annehmen und zum Kaffee einladen',
              values: { empathy: +1, participation: +1 },
              consequence: 'Eine schöne Freundschaft entsteht. Nachbar wird zu Verbündetem.',
              characterDevelopment: 'neighbor_level1_friend',
            },
          ],
        },
      },

      // Level 2 Follow-Ups (Curry-Gerüche)
      level_2_diversity_celebration: {
        triggerAfter: 1,
        condition: gameState => this.wasChoiceMade(gameState, 2, 'diversity_celebration'),
        event: {
          title: 'Internationale Küche',
          description:
            'Familie Hassan organisiert einen internationalen Kochabend im Gemeinschaftsraum.',
          choices: [
            {
              text: 'Enthusiastisch teilnehmen und eigenes Gericht mitbringen',
              values: { empathy: +2, participation: +2 },
              consequence: 'Wunderbarer Abend. Nachbarschaft wird bunter und verbundener.',
              reward: 'recipe_collection',
            },
            {
              text: 'Höflich teilnehmen',
              values: { empathy: +1 },
              consequence: 'Netter Abend, aber verpasste Chance für tiefere Verbindungen.',
            },
          ],
        },
      },

      level_2_discrimination_consequence: {
        triggerAfter: 1,
        condition: gameState => this.wasChoiceMade(gameState, 2, 'discrimination_support'),
        event: {
          title: 'Familie Hassan zieht weg',
          description: 'Durch die anhaltenden Beschwerden fühlt sich Familie Hassan unwillkommen.',
          choices: [
            {
              text: 'Letzte Chance: Entschuldigung und Nachbarschafts-Meeting',
              values: { courage: +2, empathy: +1 },
              consequence: 'Schwieriges, aber wichtiges Gespräch. Familie bleibt eventuell.',
              difficulty: 'high',
            },
            {
              text: 'Nichts tun - ist ja ihre Entscheidung',
              values: { empathy: -2, participation: -1 },
              consequence: 'Nachbarschaft wird homogener und kälter. Reputationsverlust.',
            },
          ],
        },
      },

      // Level 3 Follow-Ups (Flur-Dekoration)
      level_3_community_building: {
        triggerAfter: 1,
        condition: gameState => this.wasChoiceMade(gameState, 3, 'community_building'),
        event: {
          title: 'Gemeinschafts-Gestaltungskomitee',
          description: 'Das Flur-Gestaltungskomitee trifft sich. Wer soll den Vorsitz übernehmen?',
          choices: [
            {
              text: 'Familie Hassan vorschlagen - sie haben die Idee gebracht',
              values: { empathy: +2, participation: +1, rights: +1 },
              consequence: 'Familie Hassan ist gerührt. Echte Inklusion entsteht.',
            },
            {
              text: 'Rotation vorschlagen - alle sollen mal dran',
              values: { participation: +3, rights: +1 },
              consequence: 'Demokratisches System. Alle lernen Führung.',
            },
            {
              text: 'Selbst übernehmen - ich habe die Erfahrung',
              values: { courage: +1, participation: -1 },
              consequence: 'Effizient, aber andere fühlen sich nicht einbezogen.',
            },
          ],
        },
      },

      // Level 4 Follow-Ups (Frau Weber Hilfe)
      level_4_ongoing_support: {
        triggerAfter: 2,
        condition: gameState => this.wasChoiceMade(gameState, 4, 'ongoing_support'),
        event: {
          title: 'Frau Weber möchte zurückgeben',
          description:
            'Frau Weber hat sich erholt und möchte sich revanchieren. Sie bietet an, auf deine Pflanzen aufzupassen.',
          choices: [
            {
              text: 'Gerne annehmen - Gegenseitigkeit ist schön',
              values: { empathy: +1, participation: +1 },
              consequence: 'Echte gegenseitige Nachbarschaftshilfe entsteht.',
              reward: 'plant_care_network',
            },
            {
              text: 'Ablehnen - sie soll sich ausruhen',
              values: { empathy: +1, participation: -1 },
              consequence: 'Nett gemeint, aber Frau Weber fühlt sich nutzlos.',
            },
          ],
        },
      },

      level_4_community_network: {
        triggerAfter: 1,
        condition: gameState => this.wasChoiceMade(gameState, 4, 'community_network'),
        event: {
          title: 'Nachbarschafts-App Start',
          description:
            'Die Nachbarschaftshilfe-Gruppe wächst. Soll eine digitale Plattform erstellt werden?',
          choices: [
            {
              text: 'App entwickeln für einfache Koordination',
              values: { participation: +2, rights: +1 },
              consequence: 'Moderne Lösung. Hilfe wird effizienter organisiert.',
              skill_unlock: 'digital_organizing',
            },
            {
              text: 'Persönliche Treffen beibehalten',
              values: { empathy: +2, participation: +1 },
              consequence: 'Menschlicher Kontakt bleibt im Fokus. Tiefere Beziehungen.',
              skill_unlock: 'personal_networking',
            },
          ],
        },
      },

      // Level 5 Follow-Ups (Hundekonflikt)
      level_5_infrastructure_solution: {
        triggerAfter: 3,
        condition: gameState => this.wasChoiceMade(gameState, 5, 'infrastructure_solution'),
        event: {
          title: 'Hundebereich Einweihung',
          description:
            'Der neue Hundebereich ist fertig! Familie Schmidt und Herr Müller danken dir.',
          choices: [
            {
              text: 'Einweihungsfest organisieren',
              values: { participation: +2, empathy: +1 },
              consequence: 'Tolle Feier. Erfolgsmodell für andere Konflikte.',
              reputation: 'problem_solver',
            },
            {
              text: 'Bescheiden im Hintergrund bleiben',
              values: { empathy: +1 },
              consequence: 'Andere bekommen den Credit. Aber Lösung funktioniert.',
            },
          ],
        },
      },

      // Level 6 Follow-Ups (Kinder Ruhe)
      level_6_collaborative_rules: {
        triggerAfter: 1,
        condition: gameState => this.wasChoiceMade(gameState, 6, 'collaborative_rules'),
        event: {
          title: 'Kinder-Erwachsenen-Rat',
          description:
            'Die gemeinsam entwickelten Spielregeln funktionieren so gut, dass andere Nachbarschaften nachfragen.',
          choices: [
            {
              text: 'Modell als Open Source teilen',
              values: { participation: +2, empathy: +1, rights: +1 },
              consequence: 'Innovation verbreitet sich. Du wirst zur lokalen Expertin.',
              achievement: 'democracy_innovator',
            },
            {
              text: 'Workshop für andere Nachbarschaften anbieten',
              values: { participation: +3, courage: +1 },
              consequence: 'Du wirst zur gefragten Mediatorin. Neue Karrieremöglichkeiten.',
              skill_unlock: 'professional_mediation',
            },
          ],
        },
      },

      // Level 7 Follow-Ups (Straßenfest)
      level_7_democratic_organizing: {
        triggerAfter: 1,
        condition: gameState => this.wasChoiceMade(gameState, 7, 'democratic_organizing'),
        event: {
          title: 'Jährliche Tradition',
          description:
            'Das demokratisch organisierte Straßenfest war so erfolgreich, dass es zur jährlichen Tradition werden soll.',
          choices: [
            {
              text: 'Rotierendes Organisationskomitee etablieren',
              values: { participation: +3, rights: +1 },
              consequence: 'Nachhaltige demokratische Struktur. Alle können sich einbringen.',
            },
            {
              text: 'Professionalisierung - Verein gründen',
              values: { participation: +1, rights: +2 },
              consequence: 'Offizielle Struktur mit Vorstand und Satzung.',
            },
          ],
        },
      },

      // Level 8 Follow-Ups (Mediation)
      level_8_professional_mediation: {
        triggerAfter: 2,
        condition: gameState => this.wasChoiceMade(gameState, 8, 'professional_mediation'),
        event: {
          title: 'Mediations-Reputation',
          description:
            'Deine erfolgreiche Mediation spricht sich herum. Andere Nachbarschaften bitten um Hilfe.',
          choices: [
            {
              text: 'Kostenlose Nachbarschaftsmediation anbieten',
              values: { empathy: +2, participation: +2, courage: +1 },
              consequence: 'Du hilfst vielen. Aufbau einer Friedens-Community.',
            },
            {
              text: 'Professionelle Mediationsausbildung machen',
              values: { rights: +2, courage: +2, participation: +1 },
              consequence: 'Neue Karriere als zertifizierte Mediatorin.',
            },
          ],
        },
      },

      // Level 9 Follow-Ups (Nachbarschaftskarte)
      level_9_collective_mapping: {
        triggerAfter: 1,
        condition: gameState => this.wasChoiceMade(gameState, 9, 'collective_mapping'),
        event: {
          title: 'Soziales Netzwerk sichtbar',
          description:
            'Die gemeinsam erstellte Nachbarschaftskarte zeigt verborgene Talente und Bedürfnisse auf.',
          choices: [
            {
              text: 'Talent-Sharing-Network gründen',
              values: { participation: +3, empathy: +1 },
              consequence: 'Nachbarn helfen sich mit ihren Fähigkeiten. Solidarität steigt.',
            },
            {
              text: 'Bedürfnis-basierte Hilfsgruppen bilden',
              values: { empathy: +2, participation: +2 },
              consequence: 'Zielgerichtete Unterstützung für die, die sie brauchen.',
            },
          ],
        },
      },

      // Level 10 Boss Follow-Ups
      level_10_boss_victory: {
        triggerAfter: 1,
        condition: gameState =>
          gameState.completedLevels.includes(10) && gameState.values.empathy >= 15,
        event: {
          title: "Herr Grimmig's Wandlung",
          description:
            'Herr Grimmig ist zum aktivsten Nachbarschaftshelfer geworden. Er möchte sich bei dir bedanken.',
          choices: [
            {
              text: 'Gemeinsam Nachbarschafts-Memory-Projekt starten',
              values: { empathy: +2, participation: +2 },
              consequence:
                'Herr Grimmig wird zum Geschichtenerzähler. Generationen verbinden sich.',
              achievement: 'generation_bridge_builder',
            },
            {
              text: 'Ihn zum Nachbarschafts-Botschafter machen',
              values: { empathy: +1, participation: +3 },
              consequence: "Seine Erfahrung hilft anderen 'schwierigen' Nachbarn.",
            },
          ],
        },
      },
    };
  }

  /**
   * Wiederkehrende Charaktere mit Entwicklung
   */
  getRecurringCharacters() {
    return {
      neighbor_level1: {
        name: 'Alex Hartmann',
        basePersonality: 'initially_stressed',
        developmentPaths: {
          reconciled: {
            personality: 'grateful_friend',
            futureInteractions: 'helpful_ally',
            specialAbility: 'conflict_prevention',
            backstory: 'Arbeitet im Schichtdienst, war nur überfordert',
          },
          enemy: {
            personality: 'hostile_opponent',
            futureInteractions: 'creates_obstacles',
            specialAbility: 'sabotage_community_efforts',
            backstory: 'Fühlt sich missverstanden und ungerecht behandelt',
          },
          mediated: {
            personality: 'respectful_neutral',
            futureInteractions: 'follows_rules',
            specialAbility: 'mediator_support',
            backstory: 'Respektiert professionelle Konfliktlösung',
          },
        },
      },

      family_hassan: {
        name: 'Familie Hassan',
        members: ['Amira Hassan', 'Farid Hassan', 'Kinder: Layla & Omar'],
        basePersonality: 'warm_but_cautious',
        developmentPaths: {
          celebrated: {
            personality: 'confident_community_leaders',
            futureInteractions: 'cultural_bridge_builders',
            specialAbility: 'diversity_integration',
            backstory: 'Fühlen sich wertgeschätzt und einbezogen',
          },
          isolated: {
            personality: 'withdrawn_suspicious',
            futureInteractions: 'minimal_contact',
            specialAbility: 'none',
            backstory: 'Erfahrung von Diskriminierung macht vorsichtig',
          },
        },
      },

      frau_weber: {
        name: 'Margarete Weber',
        age: 78,
        basePersonality: 'independent_proud',
        developmentPaths: {
          supported: {
            personality: 'grateful_wise_mentor',
            futureInteractions: 'wisdom_provider',
            specialAbility: 'neighborhood_historian',
            backstory: 'Lebt seit 40 Jahren hier, kennt alle Geschichten',
          },
          isolated: {
            personality: 'lonely_bitter',
            futureInteractions: 'complaints_source',
            specialAbility: 'none',
            backstory: 'Fühlt sich vergessen von der Welt',
          },
        },
      },

      herr_grimmig: {
        name: 'Friedrich Grimmig',
        age: 65,
        basePersonality: 'stubborn_traditional',
        developmentPaths: {
          transformed: {
            personality: 'engaged_community_elder',
            futureInteractions: 'wisdom_and_energy_provider',
            specialAbility: 'tradition_modernization_bridge',
            backstory: 'War einsam nach Verlust seiner Frau, jetzt wieder lebendig',
          },
          unchanged: {
            personality: 'perpetual_complainer',
            futureInteractions: 'obstacle_creator',
            specialAbility: 'bureaucratic_warfare',
            backstory: 'Bleibt in Trauer und Widerstand gefangen',
          },
        },
      },
    };
  }

  /**
   * Adaptive Dialoge basierend auf bisherigen Entscheidungen
   */
  generateAdaptiveDialogue(characterId, context, gameState) {
    const character = this.characterMemory.get(characterId);
    const reputation = this.reputationSystem.getReputation(gameState);

    // Basis-Dialog anpassen basierend auf:
    // - Bisherige Interaktionen mit diesem Charakter
    // - Aktuelle Reputation in der Nachbarschaft
    // - Werte-Profil des Spielers
    // - Vorherige Entscheidungen in ähnlichen Situationen

    const dialogueVariations = {
      high_empathy: {
        greeting: 'Du bist immer so verständnisvoll...',
        trust_level: 'high',
        special_options: ['emotional_support', 'personal_sharing'],
      },
      high_participation: {
        greeting: 'Gut, dass du da bist - du bringst immer alle zusammen.',
        trust_level: 'medium',
        special_options: ['group_solution', 'democratic_process'],
      },
      high_courage: {
        greeting: 'Du sagst immer, was andere nur denken.',
        trust_level: 'medium',
        special_options: ['direct_confrontation', 'bold_proposal'],
      },
      high_rights: {
        greeting: 'Du kennst dich aus mit Regeln und Rechten.',
        trust_level: 'low',
        special_options: ['legal_advice', 'formal_procedure'],
      },
    };

    return this.buildAdaptiveDialogue(dialogueVariations, gameState, character, reputation);
  }

  /**
   * Hilfsmethoden
   */
  wasChoiceMade(gameState, levelId, choiceId) {
    return (
      gameState.levelChoices &&
      gameState.levelChoices[levelId] &&
      gameState.levelChoices[levelId].includes(choiceId)
    );
  }

  buildAdaptiveDialogue(variations, gameState, _character, _reputation) {
    // Implementierung der Dialogerstellung basierend auf Kontext
    const dominantValue = this.getDominantValue(gameState.values);
    return variations[`high_${dominantValue}`] || variations.default;
  }

  getDominantValue(values) {
    return Object.entries(values).reduce((a, b) => (values[a] > values[b] ? a : b));
  }
}

/**
 * Reputation System für Langzeitkonsequenzen
 */
class ReputationSystem {
  constructor() {
    this.reputationCategories = {
      problem_solver: 0,
      empathy_champion: 0,
      democratic_facilitator: 0,
      rights_defender: 0,
      community_builder: 0,
    };
  }

  updateReputation(choice, _gameState) {
    // Reputation basierend auf Entscheidungsmuster aufbauen
    const values = choice.values || {};

    if (values.empathy > 2) this.reputationCategories.empathy_champion++;
    if (values.participation > 2) this.reputationCategories.democratic_facilitator++;
    if (values.rights > 2) this.reputationCategories.rights_defender++;
    if (values.courage > 1 && values.empathy > 1) this.reputationCategories.problem_solver++;

    // Gesamt-Community-Building Score
    const totalPositive = Object.values(values).filter(v => v > 0).length;
    if (totalPositive >= 3) this.reputationCategories.community_builder++;
  }

  getReputation(gameState) {
    return {
      primary: this.getPrimaryReputation(),
      secondary: this.getSecondaryReputation(),
      trust_level: this.calculateTrustLevel(gameState),
      influence: this.calculateInfluence(gameState),
    };
  }

  getPrimaryReputation() {
    return Object.entries(this.reputationCategories).reduce((a, b) =>
      this.reputationCategories[a[0]] > this.reputationCategories[b[0]] ? a : b
    )[0];
  }

  getSecondaryReputation() {
    const sorted = Object.entries(this.reputationCategories).sort((a, b) => b[1] - a[1]);
    return sorted[1] ? sorted[1][0] : null;
  }

  calculateTrustLevel(gameState) {
    const totalPositiveChoices = gameState.completedLevels.length;
    const negativeValueCount = Object.values(gameState.values).filter(v => v < 0).length;

    if (negativeValueCount === 0 && totalPositiveChoices >= 8) return 'very_high';
    if (negativeValueCount <= 1 && totalPositiveChoices >= 6) return 'high';
    if (negativeValueCount <= 2 && totalPositiveChoices >= 4) return 'medium';
    return 'low';
  }

  calculateInfluence(gameState) {
    const participationScore = gameState.values.participation || 0;
    const leadershipActions =
      this.reputationCategories.democratic_facilitator +
      this.reputationCategories.community_builder;

    return Math.min(10, participationScore + leadershipActions);
  }
}

export { ExtendedContentSystem, ReputationSystem };
