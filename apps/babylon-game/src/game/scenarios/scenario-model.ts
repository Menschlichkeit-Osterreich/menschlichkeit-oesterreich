export type ScenarioStatus = 'playable' | 'locked';
export type ScenarioPoint = readonly [number, number, number];
export type ScenarioVisualTheme = 'training' | 'resonance';
export type CollectiblePalette = 'gold' | 'violet';

export interface GameScenario {
  id: string;
  title: string;
  description: string;
  briefing: string;
  timeLimitSeconds: number;
  status: ScenarioStatus;
  unlockAfterScenarioId?: string;
  difficultyLabel: string;
  visualTheme: ScenarioVisualTheme;
  collectiblePalette: CollectiblePalette;
  collectibleLabel: string;
  collectiblePositions: readonly ScenarioPoint[];
  missionTitle: string;
  missionObjective: string;
  missionCompletionCondition: string;
}

export type GameLevelRoadmapStatus = 'live' | 'planned';

export interface GameLevelRoadmapEntry {
  levelNumber: number;
  worldId: string;
  worldTitle: string;
  levelTitle: string;
  status: GameLevelRoadmapStatus;
  learningFocus: string;
}

const ROADMAP_WORLDS = [
  { id: 'gemeinde', title: 'Gemeinde und Beteiligung', focus: 'lokale Teilhabe und Dialogkultur' },
  { id: 'schule', title: 'Schule und Chancengerechtigkeit', focus: 'Mitbestimmung und faire Bildungschancen' },
  { id: 'arbeit', title: 'Arbeit und soziale Sicherheit', focus: 'Solidarität und soziale Absicherung' },
  { id: 'medien', title: 'Medien und Informationskompetenz', focus: 'Fakten, Verantwortung und öffentlicher Diskurs' },
  { id: 'umwelt', title: 'Umwelt und Generationengerechtigkeit', focus: 'Klimagerechtigkeit und Zukunftsverantwortung' },
  { id: 'digital', title: 'Digitalisierung und Grundrechte', focus: 'digitale Rechte, Datenschutz und Teilhabe' },
  { id: 'gesundheit', title: 'Gesundheit und Versorgung', focus: 'Würde, Zugang und faire Versorgung' },
  { id: 'europa', title: 'Europa und Solidarität', focus: 'europäische Zusammenarbeit und Rechtsstaatlichkeit' },
  { id: 'gerechtigkeit', title: 'Gerechtigkeit und Schutzrechte', focus: 'Minderheitenschutz und Gleichbehandlung' },
  { id: 'zukunft', title: 'Zukunft und demokratische Innovation', focus: 'demokratische Zukunftsbilder und Verantwortung' },
] as const;

export const ROADMAP_TOTAL_LEVELS = 100;
export const ROADMAP_LIVE_LEVELS = 2;

export const GAME_LEVEL_ROADMAP: GameLevelRoadmapEntry[] = Array.from(
  { length: ROADMAP_TOTAL_LEVELS },
  (_, index) => {
    const levelNumber = index + 1;
    const worldIndex = Math.floor(index / 10);
    const world = ROADMAP_WORLDS[worldIndex] ?? ROADMAP_WORLDS[0];
    const worldLevel = (index % 10) + 1;
    return {
      levelNumber,
      worldId: world.id,
      worldTitle: world.title,
      levelTitle: `Level ${worldLevel}: ${world.title}`,
      status: levelNumber <= ROADMAP_LIVE_LEVELS ? 'live' : 'planned',
      learningFocus: world.focus,
    };
  }
);

export const DEFAULT_GAME_SCENARIOS: GameScenario[] = [
  {
    id: 'dialog-start',
    title: 'Brücken bauen',
    description: 'Einstiegsmission zu Demokratie, Teilhabe und gemeinsamem Handeln.',
    briefing:
      'Sichere drei Gesprächsimpulse im Viertel, bringe danach den Gemeinschaftskern zum Treffpunkt und eröffne den Dialograum.',
    timeLimitSeconds: 45,
    status: 'playable',
    difficultyLabel: 'Einstieg',
    visualTheme: 'training',
    collectiblePalette: 'gold',
    collectibleLabel: 'Impuls',
    collectiblePositions: [
      [3, 1.1, 2],
      [-4, 1.1, -1],
      [2, 1.1, -4],
    ],
    missionTitle: 'Treffpunkt öffnen',
    missionObjective: 'Sammle alle Gesprächsimpulse und öffne danach den Treffpunkt.',
    missionCompletionCondition:
      'Bringe den Gemeinschaftskern zur Plattform und aktiviere danach den Treffpunkt mit E.',
  },
  {
    id: 'nachbarschaft-dialog',
    title: 'Nachbarschaft im Dialog',
    description:
      'Freischaltbares Szenario zu Solidarität, Beteiligung und Zivilcourage mit mehr Wegen und weniger Zeit.',
    briefing:
      'Sichere fünf Stimmen im Außenfeld, bündle sie im Gemeinschaftskern und aktiviere den Treffpunkt, bevor das Zeitfenster schließt.',
    timeLimitSeconds: 35,
    status: 'locked',
    unlockAfterScenarioId: 'dialog-start',
    difficultyLabel: 'Fortgeschritten',
    visualTheme: 'resonance',
    collectiblePalette: 'violet',
    collectibleLabel: 'Stimme',
    collectiblePositions: [
      [4.8, 1.1, 4.2],
      [-5.2, 1.1, 3.1],
      [4.5, 1.1, -4.4],
      [-4.7, 1.1, -3.8],
      [0, 1.1, -5.8],
    ],
    missionTitle: 'Dialograum sichern',
    missionObjective:
      'Sammle alle Stimmen und bringe den Gemeinschaftskern rechtzeitig zum Treffpunkt.',
    missionCompletionCondition:
      'Nach dem Einsammeln aller Stimmen den Gemeinschaftskern aufladen und den Treffpunkt sofort mit E aktivieren.',
  },
];

export const DEFAULT_ACTIVE_SCENARIO: GameScenario = DEFAULT_GAME_SCENARIOS[0] ?? {
  id: 'dialog-start',
  title: 'Brücken bauen',
  description: 'Standard-Szenario für das Babylon-MVP.',
  briefing:
    'Sichere Gesprächsimpulse, bringe den Gemeinschaftskern zum Treffpunkt und schließe die Mission erfolgreich ab.',
  timeLimitSeconds: 45,
  status: 'playable',
  difficultyLabel: 'Einstieg',
  visualTheme: 'training',
  collectiblePalette: 'gold',
  collectibleLabel: 'Impuls',
  collectiblePositions: [
    [3, 1.1, 2],
    [-4, 1.1, -1],
    [2, 1.1, -4],
  ],
  missionTitle: 'Treffpunkt öffnen',
  missionObjective: 'Sammle alle Gesprächsimpulse und öffne danach den Treffpunkt.',
  missionCompletionCondition:
    'Bringe den Gemeinschaftskern zur Plattform und aktiviere danach den Treffpunkt mit E.',
};
