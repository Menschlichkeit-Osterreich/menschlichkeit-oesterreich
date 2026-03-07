/**
 * Democracy Metaverse - Extended Level Content
 * Detaillierte Dialoge, Follow-Up Szenarien und Lernmodule
 * für Level 1-10 (Kapitel 1: Nachbarschaft)
 */

class ExtendedLevelContent {
  constructor() {
    this.followUpScenarios = this.initializeFollowUps();
    this.characterDialogues = this.initializeDialogues();
    this.learningModules = this.initializeLearningModules();

    console.log('📚 Extended Level Content loaded');
  }

  /**
   * Follow-Up Szenarien basierend auf Entscheidungen
   */
  initializeFollowUps() {
    return {
      // Level 1: Lärm im Hof
      empathetic_solution: {
        narrative: 'Drei Wochen später klopft dein Nachbar von oben an deine Tür.',
        dialogue:
          'Hey, danke nochmal für das Gespräch damals. Ich dachte, du solltest wissen - ich habe Kopfhörer gekauft für abends.',
        effect:
          'Die empathische Herangehensweise hat eine dauerhafte positive Beziehung geschaffen.',
        valueGain: { empathy: +1, participation: +1 },
      },

      rule_enforcement: {
        narrative: 'Der Hausverwalter hat neue strikte Ruhezeiten eingeführt.',
        dialogue: 'Beschwerde-Hotline eingerichtet. Verstöße werden mit Abmahnungen geahndet.',
        effect: 'Ruhe herrscht, aber die Nachbarschaftsbeziehungen sind angespannt.',
        valueGain: { rights: +1, empathy: -1 },
      },

      // Level 3: Müll oder Kultur?
      community_building: {
        narrative: 'Ein Monat später hängt ein bunter Aushang im Hausflur.',
        dialogue:
          "Einladung zum 'Kultur-Café': Jede Familie stellt ihre Traditionen vor. Mit Snacks aus aller Welt!",
        effect: 'Aus dem Konflikt ist ein Nachbarschaftsprojekt geworden.',
        valueGain: { empathy: +2, participation: +2 },
      },

      conflict_escalation: {
        narrative: 'Die Situation hat sich verschärft.',
        dialogue:
          "Familie Hassan: 'Wir fühlen uns hier nicht willkommen. Wir überlegen umzuziehen.'",
        effect: 'Diskriminierung führt zu Verlust von Vielfalt in der Nachbarschaft.',
        valueGain: { empathy: -2, participation: -1 },
      },

      // Level 4: Nachbarschaftshilfe
      community_network: {
        narrative: 'Die Nachbarschaftshilfe-WhatsApp-Gruppe ist aktiv.',
        dialogue:
          '15 Nachbarn helfen sich gegenseitig. Von Kinderbetreuung bis Einkaufen - alles organisiert.',
        effect: 'Systematische Solidarität macht alle stärker.',
        valueGain: { participation: +2, empathy: +1 },
      },

      social_isolation: {
        narrative: 'Frau Weber ist gestürzt.',
        dialogue: 'Sie lag 6 Stunden hilflos in ihrer Wohnung. Niemand hat nach ihr gesehen.',
        effect: 'Fehlende Solidarität hat reale Konsequenzen.',
        valueGain: { empathy: -2, participation: -2 },
      },

      // Level 5: Hundekonflikt
      time_sharing: {
        narrative: 'Das neue System funktioniert perfekt.',
        dialogue: 'Hundezeit: 7-9 Uhr und 17-19 Uhr. Kinderzeit: 9-17 Uhr. Alle sind zufrieden!',
        effect: 'Kompromisse können alle Bedürfnisse erfüllen.',
        valueGain: { participation: +2, empathy: +1 },
      },

      dismissive_attitude: {
        narrative: 'Familie Schmidt meidet den Innenhof.',
        dialogue: 'Kind entwickelt Angst vor Hunden. Familie fühlt sich nicht ernst genommen.',
        effect: 'Ignorieren von Bedürfnissen schafft neue Probleme.',
        valueGain: { empathy: -2, participation: -1 },
      },

      // Level 7: Straßenfest
      democratic_organizing: {
        narrative: 'Das Fest war ein riesiger Erfolg!',
        dialogue:
          '50 Nachbarn haben mitgeholfen. Sogar Herr Grimmig war da und hat Schach gespielt!',
        effect: 'Partizipative Organisation schafft Gemeinschaftsgefühl.',
        valueGain: { participation: +3, empathy: +2 },
      },

      top_down_organizing: {
        narrative: 'Das Fest fand statt, aber...',
        dialogue: 'Nur 12 Leute waren da. Die meisten fühlten sich nicht einbezogen.',
        effect: 'Top-down-Planung führt zu geringer Beteiligung.',
        valueGain: { participation: -2, empathy: -1 },
      },

      // Level 8: Mediation
      professional_mediation: {
        narrative: 'Der Konflikt wurde gelöst.',
        dialogue:
          'Frau König und Herr Pfeifer haben einen Parkplatz-Tauschplan entwickelt. Sie reden wieder miteinander!',
        effect: 'Professionelle Mediation schafft nachhaltige Lösungen.',
        valueGain: { participation: +2, empathy: +2 },
      },

      taking_sides: {
        narrative: 'Der Konflikt ist eskaliert.',
        dialogue:
          'Jetzt gibt es zwei Lager im Haus. Die Hälfte spricht nicht mehr mit der anderen Hälfte.',
        effect: 'Partei ergreifen spaltet die Gemeinschaft.',
        valueGain: { participation: -2, empathy: -1 },
      },
    };
  }

  /**
   * Charakter-Dialoge für immersive Erfahrungen
   */
  initializeDialogues() {
    return {
      // Hausbewohner*innen Charaktere
      characters: {
        frau_weber: {
          name: 'Frau Weber',
          age: 78,
          background: 'Pensionierte Lehrerin, wohnt seit 45 Jahren im Haus',
          personality: 'Freundlich aber zurückhaltend, braucht Hilfe aber will nicht betteln',
          dialogues: {
            greeting: 'Ach, hallo! Wie nett, dass Sie fragen...',
            help_accepted:
              'Das ist so lieb von Ihnen. Ich weiß gar nicht, wie ich das zurückgeben soll...',
            help_refused: 'Ach, das schaffe ich schon... irgendwie...',
            gratitude: 'Sie haben mir so geholfen. Das vergesse ich nicht.',
          },
        },

        herr_grimmig: {
          name: 'Herr Grimmig',
          age: 67,
          background: 'Verwitweter Rentner, früher Maschinenbauingenieur',
          personality: 'Verschlossen, verletzt, sehnt sich nach Gemeinschaft aber zeigt es nicht',
          dialogues: {
            defensive: 'Was wollen Sie denn? Lassen Sie mich in Ruhe!',
            softening: 'Hmm... vielleicht haben Sie nicht ganz unrecht...',
            vulnerable: 'Seit Gertrud tot ist... ist es so still hier...',
            transformation: 'Wissen Sie was? Vielleicht könnte ich doch mal vorbeischauen...',
          },
        },

        familie_hassan: {
          name: 'Familie Hassan',
          background: 'Samir (35), Layla (33), Kinder Amira (8) und Yusuf (5)',
          personality: 'Offen, kulturell stolz, wollen dazugehören aber auch authentisch bleiben',
          dialogues: {
            cultural_pride:
              'Diese Teppiche sind von meiner Großmutter. Sie bedeuten uns sehr viel.',
            hurt: 'Wir versuchen nur, uns zuhause zu fühlen. Ist das zu viel verlangt?',
            grateful: 'Danke, dass Sie unsere Kultur respektieren. Das bedeutet uns alles.',
            invitation:
              'Möchten Sie mal auf einen Tee vorbeikommen? Layla macht die besten Baklava!',
          },
        },

        familie_schmidt: {
          name: 'Familie Schmidt',
          background: 'Marcus (29), Julia (27), Tochter Lea (4)',
          personality: 'Junge Eltern, vorsichtig aber fair, wollen das Beste für ihr Kind',
          dialogues: {
            concern:
              'Verstehen Sie, Lea ist noch so klein. Sie hat wirklich Angst vor großen Hunden.',
            compromise: 'Wenn wir eine Lösung finden, die für alle funktioniert, sind wir dabei.',
            relief:
              'So ist es perfekt! Lea kann sicher spielen und die Hunde haben auch ihren Raum.',
            gratitude: 'Danke, dass Sie unsere Sorgen ernst genommen haben.',
          },
        },
      },

      // Situationsspezifische Dialoge
      situations: {
        noise_conflict_evening: [
          "Nachbar: 'Entschuldigung, ist die Musik zu laut?'",
          "Du: 'Ein bisschen schon, ich muss morgen früh raus...'",
          "Nachbar: 'Oh, das wusste ich nicht. Ich drehe sofort leiser.'",
        ],

        cultural_decoration_discussion: [
          "Herr Mueller: 'Das sieht hier aus wie auf dem Basar!'",
          "Frau Hassan: 'Das ist unsere Kultur. Haben wir kein Recht darauf?'",
          'Du: [Deine Entscheidung beeinflusst den weiteren Dialog]',
        ],

        mediation_session: [
          "Du: 'Danke, dass Sie beide gekommen sind. Lassen Sie uns zuhören, was jeder braucht.'",
          "Frau König: 'Ich brauche den Parkplatz für meine Mutter im Rollstuhl!'",
          "Herr Pfeifer: 'Und ich zahle seit 10 Jahren Miete für diesen Platz!'",
          'Du: [Wie führst du die Mediation weiter?]',
        ],
      },
    };
  }

  /**
   * Interaktive Lernmodule für vertieftes Verstehen
   */
  initializeLearningModules() {
    return {
      empathy_training: {
        title: 'Empathie-Training',
        description: 'Lerne verschiedene Perspektiven zu verstehen',
        exercises: [
          {
            type: 'perspective_switch',
            scenario: 'Nachbar spielt laute Musik',
            perspectives: [
              {
                role: 'Studentin',
                viewpoint: 'Muss für Prüfung lernen, braucht Ruhe, traut sich nicht zu beschweren',
              },
              {
                role: 'Musiker',
                viewpoint: 'Arbeitet von zuhause, übt für Auftritt, weiß nicht um Störung',
              },
              {
                role: 'Rentner',
                viewpoint: 'Hörgerät macht Geräusche lauter, aber freut sich über Leben im Haus',
              },
            ],
          },
        ],
      },

      conflict_resolution: {
        title: 'Konflikte lösen',
        description: 'Methoden für konstruktive Konfliktlösung',
        steps: [
          '1. Aktives Zuhören - beide Seiten verstehen',
          '2. Gemeinsame Interessen finden',
          '3. Win-Win-Lösungen entwickeln',
          '4. Vereinbarungen treffen und überprüfen',
        ],
        practice_scenarios: [
          'Lärm-Konflikt',
          'Parkplatz-Streit',
          'Hausordnung-Diskussion',
          'Kulturelle Unterschiede',
        ],
      },

      participation_methods: {
        title: 'Partizipation organisieren',
        description: 'Wie man Menschen erfolgreich beteiligt',
        methods: [
          {
            name: 'Open Space Technology',
            description: 'Selbstorganisierte Diskussionsrunden',
            use_case: 'Nachbarschaftstreffen planen',
          },
          {
            name: 'World Café Methode',
            description: 'Rotierende Kleingruppen-Gespräche',
            use_case: 'Verschiedene Themen gleichzeitig diskutieren',
          },
          {
            name: 'Konsensus-Entscheidung',
            description: 'Entscheidungen, die alle mittragen können',
            use_case: 'Hausordnung gemeinsam entwickeln',
          },
        ],
      },

      democratic_values: {
        title: 'Demokratische Werte verstehen',
        description: 'Was Demokratie im Alltag bedeutet',
        values: [
          {
            name: 'Empathie',
            explanation: 'Andere Perspektiven verstehen und respektieren',
            daily_practice: 'Vor Entscheidungen fragen: Wie geht es den anderen damit?',
          },
          {
            name: 'Rechtsstaatlichkeit',
            explanation: 'Faire Regeln für alle, die transparent angewendet werden',
            daily_practice: 'Regeln hinterfragen: Sind sie fair und für alle gleich?',
          },
          {
            name: 'Partizipation',
            explanation: 'Alle Betroffenen in Entscheidungen einbeziehen',
            daily_practice: 'Fragen: Wer ist noch betroffen und sollte mitreden?',
          },
          {
            name: 'Zivilcourage',
            explanation: 'Aufstehen für Werte, auch wenn es schwer ist',
            daily_practice: 'Bei Unrecht nicht wegschauen, sondern handeln',
          },
        ],
      },
    };
  }

  /**
   * Get Follow-Up content based on player choice
   */
  getFollowUp(followUpId) {
    return this.followUpScenarios[followUpId] || null;
  }

  /**
   * Get character dialogue
   */
  getCharacterDialogue(characterId, situationId) {
    const character = this.dialogues.characters[characterId];
    if (!character) return null;

    return character.dialogues[situationId] || null;
  }

  /**
   * Get learning module
   */
  getLearningModule(moduleId) {
    return this.learningModules[moduleId] || null;
  }

  /**
   * Calculate long-term consequences based on multiple choices
   */
  calculateLongTermConsequences(playerChoices) {
    let consequences = {
      neighborhood_harmony: 0,
      individual_relationships: {},
      community_initiatives: [],
      conflicts_resolved: 0,
      conflicts_created: 0,
    };

    playerChoices.forEach(choice => {
      // Analyze choice impact
      if (choice.values) {
        if (choice.values.empathy > 0 && choice.values.participation > 0) {
          consequences.neighborhood_harmony += 2;
        }
        if (choice.values.empathy < 0 || choice.values.participation < 0) {
          consequences.neighborhood_harmony -= 1;
        }
      }

      // Track relationship building
      if (choice.followUp && choice.followUp.includes('community')) {
        consequences.community_initiatives.push(choice.followUp);
      }
    });

    return consequences;
  }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.extendedContent = null;

  document.addEventListener('DOMContentLoaded', () => {
    window.extendedContent = new ExtendedLevelContent();
    console.log('✅ Extended Level Content ready!');
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExtendedLevelContent;
}
