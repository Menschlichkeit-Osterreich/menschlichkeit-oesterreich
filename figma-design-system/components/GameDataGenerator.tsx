import React from 'react';

/**
 * Game Data Generator für Brücken Bauen - Democracy Metaverse
 * Generiert strukturierte Daten für 100+ Level Democracy Game
 */

export interface GameLevel {
  id: number;
  chapter: number;
  title: string;
  description: string;
  category: 'scenario' | 'minigame' | 'boss' | 'special';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTime: number; // in minutes
  learningObjectives: string[];
  scenario?: ScenarioData;
  minigame?: MinigameData;
  boss?: BossData;
  special?: SpecialData;
  unlockRequirements: UnlockRequirement[];
  rewards: Reward[];
}

export interface ScenarioData {
  situation: string;
  context: string;
  stakeholders: Stakeholder[];
  choices: Choice[];
  reflection: ReflectionData;
  realWorldConnection: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  motivation: string;
  concerns: string[];
  power: number; // 1-10
  influence: number; // 1-10
}

export interface Choice {
  id: number;
  text: string;
  shortTermConsequence: string;
  longTermConsequence: string;
  stakeholderReactions: StakeholderReaction[];
  scores: {
    empathy: number;
    humanRights: number;
    participation: number;
    civilCourage: number;
  };
  difficulty: number;
  ethicalDilemma?: string;
}

export interface StakeholderReaction {
  stakeholderId: string;
  reaction: 'positive' | 'neutral' | 'negative';
  reasoning: string;
  trustChange: number; // -5 to +5
}

export interface ReflectionData {
  question: string;
  learningPoint: string;
  transferQuestions: string[];
  discussionPrompts: string[];
}

export interface MinigameData {
  type: 'fact-check' | 'bridge-puzzle' | 'debate-duel' | 'city-sim' | 'crisis-council' | 'dialog-rpg' | 'network-analysis';
  instructions: string;
  timeLimit: number;
  successCriteria: string;
  tips: string[];
}

export interface BossData {
  name: string;
  type: 'populist' | 'lobbyist' | 'demagogue' | 'ai-manipulator' | 'crisis' | 'system';
  description: string;
  specialMechanics: string[];
  weakness: string;
  phases: BossPhase[];
}

export interface BossPhase {
  phase: number;
  description: string;
  challenge: string;
  requiredResponse: string;
  timeLimit?: number;
}

export interface SpecialData {
  type: 'tutorial' | 'simulation' | 'workshop' | 'assessment' | 'reflection';
  description: string;
  activities: Activity[];
  collaborativeFeatures?: string[];
}

export interface Activity {
  name: string;
  description: string;
  duration: number;
  participantRole: string;
}

export interface UnlockRequirement {
  type: 'level-completion' | 'score-threshold' | 'skill-unlock' | 'time-spent' | 'collaboration';
  parameter: string;
  value: number;
}

export interface Reward {
  type: 'skill-point' | 'badge' | 'tool' | 'area-unlock' | 'character-unlock';
  name: string;
  description: string;
  category: 'empathy' | 'rights' | 'participation' | 'courage' | 'special';
}

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  theme: string;
  description: string;
  learningFocus: string[];
  realWorldConnection: string;
  estimatedDuration: string;
  prerequisites: string[];
  chapterBoss: string;
  levelRange: [number, number];
  backgroundColor: string;
  iconSymbol: string;
}

export class GameDataGenerator {
  
  /**
   * Generiert alle 10 Kapitel des Democracy Metaverse
   */
  static generateChapters(): Chapter[] {
    return [
      {
        id: 1,
        title: "Nachbarschaft & Alltag",
        subtitle: "Demokratie beginnt vor der Haustür",
        theme: "Empathie & kleine Konflikte",
        description: "Lerne demokratische Grundwerte in alltäglichen Nachbarschaftssituationen kennen und anwenden.",
        learningFocus: ["Empathie entwickeln", "Konfliktlösung", "Perspektivenwechsel", "Kompromissfindung"],
        realWorldConnection: "Nachbarschaftsstreitigkeiten, Hausordnung, Gemeinschaftsleben",
        estimatedDuration: "45-60 Minuten",
        prerequisites: [],
        chapterBoss: "Sturkopf-Nachbar (Debatte)",
        levelRange: [1, 10],
        backgroundColor: "#e8f5e8",
        iconSymbol: "🏘️"
      },
      {
        id: 2,
        title: "Schule & Arbeit",
        subtitle: "Fairness in Bildung und Beruf",
        theme: "Zivilcourage & Fairness",
        description: "Entwickle Zivilcourage und erkenne Diskriminierung in Bildungs- und Arbeitscontexten.",
        learningFocus: ["Zivilcourage zeigen", "Diskriminierung erkennen", "Fairness durchsetzen", "Solidarität"],
        realWorldConnection: "Mobbing, Diskriminierung am Arbeitsplatz, Bildungsgerechtigkeit",
        estimatedDuration: "50-65 Minuten",
        prerequisites: ["Kapitel 1 abgeschlossen"],
        chapterBoss: "Ungerechter Chef (Rollenduell)",
        levelRange: [11, 20],
        backgroundColor: "#fff2e8",
        iconSymbol: "🎓"
      },
      {
        id: 3,
        title: "Digitale Demokratie",
        subtitle: "Meinungsbildung im Netz",
        theme: "Medienkompetenz & Cyberethik",
        description: "Navigiere durch die digitale Informationslandschaft und entwickle kritische Medienkompetenz.",
        learningFocus: ["Fake News erkennen", "Digitale Zivilcourage", "Algorithmus-Bewusstsein", "Online-Diskurs"],
        realWorldConnection: "Social Media, Fake News, Cybermobbing, Filterblasen",
        estimatedDuration: "55-70 Minuten",
        prerequisites: ["Kapitel 2 abgeschlossen"],
        chapterBoss: "Fake News Mastermind",
        levelRange: [21, 30],
        backgroundColor: "#e8f4fd",
        iconSymbol: "💻"
      },
      {
        id: 4,
        title: "Gesellschaft & Vielfalt",
        subtitle: "Zusammenleben in Diversität",
        theme: "Toleranz & Gleichstellung",
        description: "Erlebe die Bereicherung durch gesellschaftliche Vielfalt und lerne mit Unterschieden umzugehen.",
        learningFocus: ["Kulturelle Vielfalt", "Inklusion", "Gleichstellung", "Antidiskriminierung"],
        realWorldConnection: "Migration, religiöse Vielfalt, LGBTQ+, Behinderung",
        estimatedDuration: "60-75 Minuten",
        prerequisites: ["Kapitel 3 abgeschlossen"],
        chapterBoss: "Lobbyverband gegen Vielfalt",
        levelRange: [31, 40],
        backgroundColor: "#f5e8ff",
        iconSymbol: "🌈"
      },
      {
        id: 5,
        title: "Politik vor Ort",
        subtitle: "Demokratie mitgestalten",
        theme: "Partizipation & Gemeinwohl",
        description: "Lerne die Mechanismen lokaler Politik kennen und gestalte deine Gemeinde aktiv mit.",
        learningFocus: ["Bürgerbeteiligung", "Politische Prozesse", "Gemeinwohl", "Interessenvertretung"],
        realWorldConnection: "Gemeinderat, Bürgerinitiativen, Petitionen, Stadtplanung",
        estimatedDuration: "65-80 Minuten",
        prerequisites: ["Kapitel 4 abgeschlossen"],
        chapterBoss: "Mächtiger Lobbyist (Einfluss-Kampf)",
        levelRange: [41, 50],
        backgroundColor: "#e8f8f5",
        iconSymbol: "🏛️"
      },
      {
        id: 6,
        title: "Krise & Konflikt",
        subtitle: "Demokratie unter Stress",
        theme: "Solidarität in der Krise",
        description: "Teste demokratische Werte in Krisenzeiten und lerne Solidarität als gesellschaftlichen Kit kennen.",
        learningFocus: ["Krisenmanagement", "Solidarität", "Grundrechte unter Druck", "Gemeinschaftssinn"],
        realWorldConnection: "Pandemie, Naturkatastrophen, gesellschaftliche Krisen",
        estimatedDuration: "70-85 Minuten",
        prerequisites: ["Kapitel 5 abgeschlossen"],
        chapterBoss: "Autoritärer Ministerpräsident",
        levelRange: [51, 60],
        backgroundColor: "#ffe8e8",
        iconSymbol: "⚡"
      },
      {
        id: 7,
        title: "Klimapolitik & Generationen",
        subtitle: "Verantwortung für die Zukunft",
        theme: "Nachhaltigkeit & Generationengerechtigkeit",
        description: "Verstehe die Herausforderungen des Klimawandels als demokratisches Problem zwischen den Generationen.",
        learningFocus: ["Generationengerechtigkeit", "Nachhaltigkeit", "Zukunftsverantwortung", "Interessenausgleich"],
        realWorldConnection: "Klimawandel, Fridays for Future, Energiewende, Strukturwandel",
        estimatedDuration: "75-90 Minuten",
        prerequisites: ["Kapitel 6 abgeschlossen"],
        chapterBoss: "Klimakrise 2035 (Zeitdruck-Szenario)",
        levelRange: [61, 70],
        backgroundColor: "#e8ffe8",
        iconSymbol: "🌍"
      },
      {
        id: 8,
        title: "Globale Demokratie",
        subtitle: "Internationale Zusammenarbeit",
        theme: "Weltgemeinschaft & Menschenrechte",
        description: "Erkunde die Herausforderungen globaler Demokratie und internationaler Zusammenarbeit.",
        learningFocus: ["Internationale Kooperation", "Globale Gerechtigkeit", "Menschenrechte weltweit", "Diplomatie"],
        realWorldConnection: "UN, EU, Handelspolitik, Entwicklungszusammenarbeit",
        estimatedDuration: "80-95 Minuten",
        prerequisites: ["Kapitel 7 abgeschlossen"],
        chapterBoss: "Weltgipfel (Multilaterale Verhandlung)",
        levelRange: [71, 80],
        backgroundColor: "#e8f0ff",
        iconSymbol: "🌐"
      },
      {
        id: 9,
        title: "Demokratie unter Druck",
        subtitle: "Widerstand gegen Extremismus",
        theme: "Demokratie verteidigen",
        description: "Lerne Bedrohungen der Demokratie zu erkennen und entwickle Strategien zu ihrem Schutz.",
        learningFocus: ["Extremismus erkennen", "Demokratie verteidigen", "Pressefreiheit", "Rechtsstaatlichkeit"],
        realWorldConnection: "Populismus, Autoritarismus, Verschwörungstheorien, Medienfreiheit",
        estimatedDuration: "85-100 Minuten",
        prerequisites: ["Kapitel 8 abgeschlossen"],
        chapterBoss: "Autoritärer Demagoge (Rhetoric-Battle)",
        levelRange: [81, 90],
        backgroundColor: "#ffebe8",
        iconSymbol: "🛡️"
      },
      {
        id: 10,
        title: "Demokratie 2050",
        subtitle: "Zukunftsvisionen gestalten",
        theme: "Digitale Gesellschaft & KI",
        description: "Gestalte die Zukunft der Demokratie im digitalen Zeitalter und mit künstlicher Intelligenz.",
        learningFocus: ["Zukunftsvisionen", "KI & Demokratie", "Digitale Rechte", "Gesellschaftswandel"],
        realWorldConnection: "Künstliche Intelligenz, Blockchain, Metaverse, Post-Demokratie",
        estimatedDuration: "90-105 Minuten",
        prerequisites: ["Kapitel 9 abgeschlossen"],
        chapterBoss: "Global Crisis 2050 (Megaszenario)",
        levelRange: [91, 100],
        backgroundColor: "#f0f8ff",
        iconSymbol: "🚀"
      }
    ];
  }

  /**
   * Generiert Sample-Level für Kapitel 1 (Nachbarschaft)
   */
  static generateChapter1Levels(): GameLevel[] {
    return [
      {
        id: 1,
        chapter: 1,
        title: "Lärm im Hof",
        description: "Nachtschicht vs. Kindergeschrei - Ein klassischer Nachbarschaftskonflikt",
        category: 'scenario',
        difficulty: 1,
        estimatedTime: 8,
        learningObjectives: [
          "Verschiedene Lebenssituationen verstehen",
          "Empathie für unterschiedliche Bedürfnisse entwickeln",
          "Erste Vermittlungsansätze kennenlernen"
        ],
        scenario: {
          situation: "Frau Weber arbeitet im Krankenhaus und hat oft Nachtschicht. Sie braucht tagsüber absolute Ruhe zum Schlafen. Familie Müller mit zwei kleinen Kindern wohnt nebenan. Die Kinder spielen gerne im Hof - was natürlich laut ist. Frau Weber beschwert sich bei der Hausverwaltung über den 'unerträglichen Lärm'. Sie droht sogar mit dem Auszug.",
          context: "Mehrfamilienhaus mit 12 Parteien, gemeinsamer Innenhof, keine klaren Ruhezeiten-Regelungen",
          stakeholders: [
            {
              id: "frau-weber",
              name: "Frau Weber",
              role: "Krankenschwester",
              motivation: "Braucht Ruhe nach anstrengenden Nachtschichten",
              concerns: ["Schlafmangel", "Gesundheit", "Arbeitsleistung"],
              power: 6,
              influence: 4
            },
            {
              id: "familie-mueller",
              name: "Familie Müller",
              role: "Junge Familie",
              motivation: "Kinder sollen sich frei entwickeln können",
              concerns: ["Kindeswohl", "Lebensqualität", "Nachbarschaftsfrieden"],
              power: 5,
              influence: 6
            },
            {
              id: "hausverwaltung",
              name: "Herr Schmidt (Hausverwalter)",
              role: "Konfliktmediator",
              motivation: "Frieden im Haus erhalten",
              concerns: ["Mieterzufriedenheit", "Kündigungen vermeiden", "Rechtliche Probleme"],
              power: 8,
              influence: 7
            }
          ],
          choices: [
            {
              id: 1,
              text: "Ich organisiere ein Nachbarschaftsgespräch, um gemeinsam eine Lösung zu finden.",
              shortTermConsequence: "Alle Parteien setzen sich an einen Tisch. Zunächst sind die Fronten verhärtet.",
              longTermConsequence: "Nach mehreren Gesprächen wird eine Hausordnung mit flexiblen Ruhezeiten entwickelt.",
              stakeholderReactions: [
                {
                  stakeholderId: "frau-weber",
                  reaction: "neutral",
                  reasoning: "Ist skeptisch, aber bereit zum Gespräch",
                  trustChange: 1
                },
                {
                  stakeholderId: "familie-mueller",
                  reaction: "positive",
                  reasoning: "Schätzt den konstruktiven Ansatz",
                  trustChange: 2
                },
                {
                  stakeholderId: "hausverwaltung",
                  reaction: "positive",
                  reasoning: "Professioneller Mediationsansatz",
                  trustChange: 3
                }
              ],
              scores: {
                empathy: 8,
                humanRights: 6,
                participation: 9,
                civilCourage: 6
              },
              difficulty: 3,
              ethicalDilemma: "Wie wägt man individuelle Bedürfnisse gegen Gemeinschaftsinteressen ab?"
            },
            {
              id: 2,
              text: "Ich unterstütze Frau Weber - Nachtarbeiter haben Anspruch auf Ruhe.",
              shortTermConsequence: "Frau Weber fühlt sich verstanden, aber Familie Müller ist verärgert.",
              longTermConsequence: "Der Konflikt eskaliert, weitere Nachbarn wählen Seiten. Das Hausklima wird vergiftet.",
              stakeholderReactions: [
                {
                  stakeholderId: "frau-weber",
                  reaction: "positive",
                  reasoning: "Endlich versteht jemand ihre Situation",
                  trustChange: 3
                },
                {
                  stakeholderId: "familie-mueller",
                  reaction: "negative",
                  reasoning: "Fühlt sich angegriffen und missverstanden",
                  trustChange: -2
                },
                {
                  stakeholderId: "hausverwaltung",
                  reaction: "neutral",
                  reasoning: "Einseitige Parteinahme erschwert Lösung",
                  trustChange: -1
                }
              ],
              scores: {
                empathy: 4,
                humanRights: 7,
                participation: 3,
                civilCourage: 5
              },
              difficulty: 2
            },
            {
              id: 3,
              text: "Ich schlage praktische Kompromisse vor: Spielzeiten und Ruhezonen.",
              shortTermConsequence: "Beide Seiten sind bereit, konkrete Regelungen auszuprobieren.",
              longTermConsequence: "Es entstehen kreative Lösungen: Spielzeiten, alternative Spielorte, sogar eine Kinderbetreuungsgruppe.",
              stakeholderReactions: [
                {
                  stakeholderId: "frau-weber",
                  reaction: "positive",
                  reasoning: "Konkrete Verbesserung ihrer Situation",
                  trustChange: 2
                },
                {
                  stakeholderId: "familie-mueller",
                  reaction: "positive",
                  reasoning: "Kinder können weiter spielen, nur strukturierter",
                  trustChange: 2
                },
                {
                  stakeholderId: "hausverwaltung",
                  reaction: "positive",
                  reasoning: "Praktikable und nachhaltige Lösung",
                  trustChange: 3
                }
              ],
              scores: {
                empathy: 7,
                humanRights: 8,
                participation: 8,
                civilCourage: 7
              },
              difficulty: 4,
              ethicalDilemma: "Können Kompromisse beide Seiten wirklich zufriedenstellen?"
            }
          ],
          reflection: {
            question: "Was macht einen fairen Kompromiss aus, bei dem sich niemand als Verlierer fühlt?",
            learningPoint: "Echte Lösungen entstehen nicht durch Parteinahme, sondern durch kreatives Miteinander-Denken aller Beteiligten.",
            transferQuestions: [
              "Welche ähnlichen Konflikte kennst du aus deinem Umfeld?",
              "Wie könntest du das Gelernte in deiner Familie oder Schule anwenden?",
              "Was würdest du anders machen, wenn du selbst betroffen wärst?"
            ],
            discussionPrompts: [
              "Diskutiert in 2er-Gruppen: Wann ist ein Kompromiss fair?",
              "Rollenspiel: Einer von euch ist Frau Weber, einer Familie Müller - wie findet ihr eine Lösung?",
              "Sammelt gemeinsam: Welche Win-Win-Lösungen fallen euch noch ein?"
            ]
          },
          realWorldConnection: "Solche Nachbarschaftskonflikte gibt es in jeder Stadt. In Wien gibt es z.B. Nachbarschaftszentren, die bei der Mediation helfen."
        },
        unlockRequirements: [],
        rewards: [
          {
            type: 'skill-point',
            name: 'Empathie +1',
            description: 'Du verstehst verschiedene Perspektiven besser',
            category: 'empathy'
          },
          {
            type: 'tool',
            name: 'Aktives Zuhören',
            description: 'Ermöglicht tiefere Gespräche mit Stakeholdern',
            category: 'empathy'
          }
        ]
      },
      {
        id: 2,
        title: "Essensgerüche",
        description: "Kulturelle Küche vs. Beschwerden - Vielfalt im Treppenhaus",
        category: 'scenario',
        difficulty: 2,
        estimatedTime: 10,
        learningObjectives: [
          "Kulturelle Unterschiede respektieren",
          "Vorurteile hinterfragen",
          "Toleranz und Neugier entwickeln"
        ],
        scenario: {
          situation: "Familie Patel aus Indien kocht gerne traditionelle Gerichte mit intensiven Gewürzen. Der Geruch von Curry und anderen Gewürzen zieht durch das ganze Treppenhaus. Herr Gruber aus dem 2. Stock beschwert sich: 'Das riecht hier wie in einem indischen Restaurant. Können die nicht normal kochen?' Andere Nachbarn sind geteilter Meinung.",
          context: "Altbau mit enger Treppenhaus-Belüftung, multikulturelle Hausgemeinschaft, keine bisherigen Probleme",
          stakeholders: [
            {
              id: "familie-patel",
              name: "Familie Patel",
              role: "Indische Familie",
              motivation: "Ihre Kultur und Traditionen leben",
              concerns: ["Kulturelle Identität", "Sich willkommen fühlen", "Kinder prägen"],
              power: 4,
              influence: 3
            },
            {
              id: "herr-gruber",
              name: "Herr Gruber",
              role: "Alteingesessener Mieter",
              motivation: "Ruhe und gewohntes Umfeld",
              concerns: ["Veränderung", "Immobilienwert", "Eigene Komfortzone"],
              power: 6,
              influence: 5
            },
            {
              id: "andere-nachbarn",
              name: "Andere Nachbarn",
              role: "Hausgemeinschaft",
              motivation: "Friedliches Zusammenleben",
              concerns: ["Nachbarschaftsfrieden", "Fairness", "Toleranz"],
              power: 7,
              influence: 8
            }
          ],
          choices: [
            {
              id: 1,
              text: "Ich lade alle zu einem internationalen Kochabend ein.",
              shortTermConsequence: "Zunächst Skepsis, aber Neugier siegt. Die meisten Nachbarn kommen.",
              longTermConsequence: "Regelmäßige Kochabende entstehen. Das Haus wird zur multikulturellen Gemeinschaft.",
              stakeholderReactions: [
                {
                  stakeholderId: "familie-patel",
                  reaction: "positive",
                  reasoning: "Fühlen sich wertgeschätzt und können ihre Kultur teilen",
                  trustChange: 4
                },
                {
                  stakeholderId: "herr-gruber",
                  reaction: "neutral",
                  reasoning: "Zunächst skeptisch, aber überrascht vom leckeren Essen",
                  trustChange: 1
                },
                {
                  stakeholderId: "andere-nachbarn",
                  reaction: "positive",
                  reasoning: "Bereicherung des Hauslebens",
                  trustChange: 3
                }
              ],
              scores: {
                empathy: 9,
                humanRights: 7,
                participation: 8,
                civilCourage: 6
              },
              difficulty: 4
            },
            {
              id: 2,
              text: "Ich spreche mit Familie Patel über Lüftungsoptionen beim Kochen.",
              shortTermConsequence: "Familie Patel ist aufgeschlossen und probiert verschiedene Lüftungsstrategien aus.",
              longTermConsequence: "Technische Lösung funktioniert gut, aber die kulturelle Dimension wird nicht thematisiert.",
              stakeholderReactions: [
                {
                  stakeholderId: "familie-patel",
                  reaction: "neutral",
                  reasoning: "Lösung ist pragmatisch, aber fühlt sich etwas wie Anpassungsdruck an",
                  trustChange: 0
                },
                {
                  stakeholderId: "herr-gruber",
                  reaction: "positive",
                  reasoning: "Problem wird gelöst ohne große Umstände",
                  trustChange: 2
                },
                {
                  stakeholderId: "andere-nachbarn",
                  reaction: "neutral",
                  reasoning: "Kompromiss funktioniert, aber verpasste Chance für Gemeinschaft",
                  trustChange: 1
                }
              ],
              scores: {
                empathy: 6,
                humanRights: 6,
                participation: 5,
                civilCourage: 4
              },
              difficulty: 2
            },
            {
              id: 3,
              text: "Ich konfrontiere Herrn Gruber mit seinen Vorurteilen.",
              shortTermConsequence: "Herr Gruber fühlt sich angegriffen und wird defensiv. Der Konflikt verschärft sich.",
              longTermConsequence: "Die Hausgemeinschaft spaltet sich. Familie Patel überlegt ernsthaft den Auszug.",
              stakeholderReactions: [
                {
                  stakeholderId: "familie-patel",
                  reaction: "neutral",
                  reasoning: "Freuen sich über Unterstützung, aber Konflikt belastet sie",
                  trustChange: 1
                },
                {
                  stakeholderId: "herr-gruber",
                  reaction: "negative",
                  reasoning: "Fühlt sich als Rassist abgestempelt",
                  trustChange: -3
                },
                {
                  stakeholderId: "andere-nachbarn",
                  reaction: "negative",
                  reasoning: "Fronten verhärten sich, Hausfrieden gefährdet",
                  trustChange: -2
                }
              ],
              scores: {
                empathy: 3,
                humanRights: 8,
                participation: 2,
                civilCourage: 7
              },
              difficulty: 1
            }
          ],
          reflection: {
            question: "Wie kann man kulturelle Vielfalt als Bereicherung statt als Störung erleben?",
            learningPoint: "Begegnung und gemeinsame Erfahrungen bauen Vorurteile ab besser als Konfrontation oder technische Fixes.",
            transferQuestions: [
              "Welche kulturellen Unterschiede erlebst du in deiner Umgebung?",
              "Wann hast du selbst schon mal unbewusst vorurteilsbelastet reagiert?",
              "Wie könntest du Neugier statt Ablehnung entwickeln?"
            ],
            discussionPrompts: [
              "Sammelt: Was sind typische 'Fremdheits'-Erfahrungen in eurer Stadt?",
              "Diskutiert: Wo ist die Grenze zwischen berechtigten Beschwerden und Vorurteilen?",
              "Plant: Wie könntet ihr an eurer Schule kulturelle Vielfalt feiern?"
            ]
          },
          realWorldConnection: "In österreichischen Städten leben Menschen aus über 100 Ländern zusammen. Interkulturalität ist gelebte Realität."
        },
        unlockRequirements: [
          {
            type: 'level-completion',
            parameter: 'level-1',
            value: 1
          }
        ],
        rewards: [
          {
            type: 'skill-point',
            name: 'Kulturkompetenz +1',
            description: 'Du verstehst kulturelle Vielfalt besser',
            category: 'empathy'
          }
        ]
      }
      // Weitere Level 3-10 würden hier folgen...
    ];
  }

  /**
   * Generiert Minigame-Daten
   */
  static generateMinigames(): MinigameData[] {
    return [
      {
        type: 'fact-check',
        instructions: "Prüfe die Quellen dieser Behauptungen innerhalb von 3 Minuten!",
        timeLimit: 180,
        successCriteria: "Mindestens 7 von 10 Behauptungen korrekt eingeordnet",
        tips: [
          "Schaue dir immer die Originalquelle an",
          "Prüfe das Datum der Veröffentlichung",
          "Achte auf vertrauenswürdige Medien",
          "Sind Belege und Studien verlinkt?"
        ]
      },
      {
        type: 'bridge-puzzle',
        instructions: "Verbinde die gesellschaftlichen Gruppen durch stabile Brücken! Jede Brücke braucht gemeinsame Werte als Fundament.",
        timeLimit: 300,
        successCriteria: "Alle Gruppen verbunden, keine Brücke bricht unter Stress-Test",
        tips: [
          "Starte mit den stärksten gemeinsamen Werten",
          "Schwache Verbindungen brauchen mehr Stützpfeiler",
          "Teste deine Brücken mit verschiedenen Konflikten",
          "Manchmal braucht es Umwege für stabile Verbindungen"
        ]
      },
      {
        type: 'debate-duel',
        instructions: "Führe eine faire Debatte! Sammle Argumente, erkenne Fehlschlüsse und überzeuge durch sachliche Diskussion.",
        timeLimit: 240,
        successCriteria: "Mindestens 3 starke Argumente, keine Fehlschlüsse verwendet, respektvoller Ton",
        tips: [
          "Höre aktiv zu und gehe auf Gegenargumente ein",
          "Belege deine Aussagen mit Fakten",
          "Greife die Person nicht an, kritisiere die Sache",
          "Suche nach gemeinsamen Grundlagen"
        ]
      },
      {
        type: 'city-sim',
        instructions: "Du bist Bürgermeister*in für einen Tag! Verteile das Budget gerecht und triff Entscheidungen für alle Bürger*innen.",
        timeLimit: 420,
        successCriteria: "Zufriedenheit aller Bevölkerungsgruppen über 70%, Budget ausgeglichen",
        tips: [
          "Berücksichtige die Bedürfnisse aller Altersgruppen",
          "Langfristige Investitionen sind oft nachhaltiger",
          "Transparenz schafft Vertrauen",
          "Suche Win-Win-Lösungen"
        ]
      },
      {
        type: 'crisis-council',
        instructions: "Die Stadt steht vor einer Krise! Koordiniere die Hilfsmaßnahmen unter Zeitdruck und begrenzten Ressourcen.",
        timeLimit: 360,
        successCriteria: "Alle kritischen Bereiche versorgt, faire Ressourcenverteilung, Transparenz gewahrt",
        tips: [
          "Priorisiere lebensrettende Maßnahmen",
          "Kommuniziere ehrlich mit der Bevölkerung",
          "Nutze alle verfügbaren Hilfsorganisationen",
          "Denke an besonders vulnerable Gruppen"
        ]
      },
      {
        type: 'dialog-rpg',
        instructions: "Führe schwierige Gespräche und löse Konflikte durch empathische Kommunikation.",
        timeLimit: 180,
        successCriteria: "Alle Gesprächspartner fühlen sich gehört, konstruktive Lösung gefunden",
        tips: [
          "Verwende Ich-Botschaften statt Vorwürfe",
          "Spiegle die Gefühle deines Gegenübers",
          "Frage nach, statt zu interpretieren",
          "Suche nach den Bedürfnissen hinter Positionen"
        ]
      },
      {
        type: 'network-analysis',
        instructions: "Analysiere das Informationsnetzwerk! Erkenne Bots, Trolle und Manipulation in sozialen Medien.",
        timeLimit: 300,
        successCriteria: "95% der Bots erkannt, Manipulation-Strategien identifiziert, vertrauenswürdige Quellen gefunden",
        tips: [
          "Achte auf unnatürliche Posting-Muster",
          "Prüfe Profil-Alter und Follower-Qualität",
          "Erkenne koordinierte Kampagnen",
          "Verfolge die Quelle viraler Inhalte zurück"
        ]
      }
    ];
  }

  /**
   * Generiert Boss-Charaktere
   */
  static generateBosses(): BossData[] {
    return [
      {
        name: "Der Sturkopf-Nachbar",
        type: 'populist',
        description: "Ein Nachbar, der sich allen Kompromissen verweigert und nur seine eigene Sicht gelten lässt.",
        specialMechanics: [
          "Ignoriert rationale Argumente",
          "Wird lauter statt überzeugender",
          "Verwendet Whataboutism",
          "Spielt das Opfer"
        ],
        weakness: "Reagiert auf persönliche Geschichten und echte Empathie",
        phases: [
          {
            phase: 1,
            description: "Konfrontative Ausgangslage",
            challenge: "Völlige Verweigerung jeder Diskussion",
            requiredResponse: "Ruhig bleiben und Gesprächsbereitschaft signalisieren"
          },
          {
            phase: 2,
            description: "Emotionaler Ausbruch",
            challenge: "Persönliche Angriffe und Schuldzuweisungen",
            requiredResponse: "Empathie zeigen, ohne Position aufzugeben"
          },
          {
            phase: 3,
            description: "Versteckte Ängste",
            challenge: "Echte Sorgen kommen zum Vorschein",
            requiredResponse: "Ängste ernst nehmen und gemeinsame Lösungen entwickeln"
          }
        ]
      },
      {
        name: "Der Fake News Mastermind",
        type: 'ai-manipulator',
        description: "Ein Algorithmus, der perfekt zugeschnittene Falschinformationen verbreitet.",
        specialMechanics: [
          "Passt Lügen an persönliche Schwächen an",
          "Nutzt emotionale Trigger",
          "Zitiert scheinbar seriöse Quellen",
          "Verstärkt bestehende Vorurteile"
        ],
        weakness: "Kann auf originelle Quellen und Fakten-Checks nicht reagieren",
        phases: [
          {
            phase: 1,
            description: "Subtile Manipulation",
            challenge: "Harmlos wirkende Falschinformationen",
            requiredResponse: "Quellenkritik und Fact-Checking anwenden"
          },
          {
            phase: 2,
            description: "Emotionale Eskalation",
            challenge: "Angst- und Wut-induzierende Inhalte",
            requiredResponse: "Emotionale Distanz wahren, Sachebene bevorzugen"
          },
          {
            phase: 3,
            description: "Koordinierter Angriff",
            challenge: "Bot-Netzwerke und Astroturfing",
            requiredResponse: "Netzwerk-Analyse und Community-Building",
            timeLimit: 300
          }
        ]
      }
    ];
  }

  /**
   * Generiert Achievement-Kategorien
   */
  static generateAchievements(): { [category: string]: Reward[] } {
    return {
      empathy: [
        {
          type: 'badge',
          name: 'Perspektiven-Wechsler',
          description: 'Du hast 10 verschiedene Stakeholder-Sichtweisen verstanden',
          category: 'empathy'
        },
        {
          type: 'badge',
          name: 'Empathie-Meister',
          description: 'Du hast in 95% deiner Entscheidungen hohe Empathie-Werte erreicht',
          category: 'empathy'
        }
      ],
      rights: [
        {
          type: 'badge',
          name: 'Menschenrechts-Verteidiger',
          description: 'Du hast konsequent für Menschenrechte eingestanden',
          category: 'rights'
        },
        {
          type: 'badge',
          name: 'Gleichstellungs-Champion',
          description: 'Du hast Diskriminierung erkannt und bekämpft',
          category: 'rights'
        }
      ],
      participation: [
        {
          type: 'badge',
          name: 'Demokratie-Aktivist',
          description: 'Du hast in allen Bereichen demokratische Teilhabe gefördert',
          category: 'participation'
        },
        {
          type: 'badge',
          name: 'Mediations-Experte',
          description: 'Du hast komplexe Konflikte erfolgreich vermittelt',
          category: 'participation'
        }
      ],
      courage: [
        {
          type: 'badge',
          name: 'Zivilcourage-Held',
          description: 'Du hast auch in schwierigen Situationen Mut bewiesen',
          category: 'courage'
        },
        {
          type: 'badge',
          name: 'Wahrheits-Finder',
          description: 'Du hast Fake News konsequent entlarvt',
          category: 'courage'
        }
      ]
    };
  }

  /**
   * Hilfsfunktion zur Generierung zufälliger realistischer Stakeholder
   */
  static generateRandomStakeholder(context: string): Stakeholder {
    const names = [
      "Anna Müller", "David Schmidt", "Maria Koller", "Thomas Weber",
      "Sarah Ahmed", "Michael Gruber", "Lisa Patel", "Alexander Novak"
    ];
    
    const roles = {
      neighborhood: ["Anwohner*in", "Hausverwalter*in", "Elternteil", "Senior*in"],
      workplace: ["Kolleg*in", "Vorgesetzte*r", "Betriebsrat", "HR-Manager*in"],
      digital: ["Blogger*in", "Journalist*in", "Influencer*in", "IT-Expert*in"],
      politics: ["Bürgermeister*in", "Gemeinderat", "Aktivist*in", "Lobbyist*in"]
    };

    return {
      id: `stakeholder-${Math.random().toString(36).substr(2, 9)}`,
      name: names[Math.floor(Math.random() * names.length)],
      role: roles[context as keyof typeof roles]?.[0] || "Beteiligte*r",
      motivation: "Verschiedene persönliche und gesellschaftliche Ziele",
      concerns: ["Persönliche Interessen", "Familiäre Situation", "Berufliche Anforderungen"],
      power: Math.floor(Math.random() * 8) + 3,
      influence: Math.floor(Math.random() * 8) + 3
    };
  }
}

export default GameDataGenerator;