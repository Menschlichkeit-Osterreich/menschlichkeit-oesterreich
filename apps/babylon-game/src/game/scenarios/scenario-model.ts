export type ScenarioStatus = 'playable' | 'locked';
export type ScenarioPoint = readonly [number, number, number];
export type ScenarioVisualTheme = 'training' | 'resonance' | 'gehoor' | 'kompromiss' | 'beschluss';
export type CollectiblePalette =
  | 'gold'
  | 'violet'
  | 'teal'
  | 'amber'
  | 'rose'
  | 'emerald'
  | 'indigo'
  | 'fuchsia'
  | 'lime'
  | 'sky';

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

export interface PlannedScenarioPreview {
  id: string;
  levelNumber: number;
  worldId: string;
  worldTitle: string;
  title: string;
  teaser: string;
  learningFocus: string;
}

const ROADMAP_WORLDS = [
  { id: 'gemeinde', title: 'Gemeinde und Beteiligung', focus: 'lokale Teilhabe und Dialogkultur' },
  {
    id: 'schule',
    title: 'Schule und Chancengerechtigkeit',
    focus: 'Mitbestimmung und faire Bildungschancen',
  },
  {
    id: 'arbeit',
    title: 'Arbeit und soziale Sicherheit',
    focus: 'Solidarität und soziale Absicherung',
  },
  {
    id: 'medien',
    title: 'Medien und Informationskompetenz',
    focus: 'Fakten, Verantwortung und öffentlicher Diskurs',
  },
  {
    id: 'umwelt',
    title: 'Umwelt und Generationengerechtigkeit',
    focus: 'Klimagerechtigkeit und Zukunftsverantwortung',
  },
  {
    id: 'digital',
    title: 'Digitalisierung und Grundrechte',
    focus: 'digitale Rechte, Datenschutz und Teilhabe',
  },
  {
    id: 'gesundheit',
    title: 'Gesundheit und Versorgung',
    focus: 'Würde, Zugang und faire Versorgung',
  },
  {
    id: 'europa',
    title: 'Europa und Solidarität',
    focus: 'europäische Zusammenarbeit und Rechtsstaatlichkeit',
  },
  {
    id: 'gerechtigkeit',
    title: 'Gerechtigkeit und Schutzrechte',
    focus: 'Minderheitenschutz und Gleichbehandlung',
  },
  {
    id: 'zukunft',
    title: 'Zukunft und demokratische Innovation',
    focus: 'demokratische Zukunftsbilder und Verantwortung',
  },
] as const;

export const ROADMAP_TOTAL_LEVELS = 100;
export const ROADMAP_LIVE_LEVELS = 10;

export const LIVE_SCENARIO_LEVEL_MAP: Record<string, number> = {
  'dialog-start': 1,
  'nachbarschaft-dialog': 2,
  'gemeinde-dialog-3': 3,
  'gemeinde-dialog-4': 4,
  'gemeinde-dialog-5': 5,
  'gemeinde-dialog-6': 6,
  'gemeinde-dialog-7': 7,
  'gemeinde-dialog-8': 8,
  'gemeinde-dialog-9': 9,
  'gemeinde-dialog-10': 10,
};

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

export const PLANNED_SCENARIO_PREVIEWS: PlannedScenarioPreview[] = GAME_LEVEL_ROADMAP.filter(
  level => level.status === 'planned'
)
  .slice(0, 24)
  .map(level => {
    const slug = level.worldId.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    return {
      id: `planned-${slug}-${String(level.levelNumber).padStart(3, '0')}`,
      levelNumber: level.levelNumber,
      worldId: level.worldId,
      worldTitle: level.worldTitle,
      title: `${level.worldTitle} · Etappe ${level.levelNumber}`,
      teaser: `Demnächst: Fokus auf ${level.learningFocus}.`,
      learningFocus: level.learningFocus,
    };
  });

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
  {
    id: 'gemeinde-dialog-3',
    title: 'Gehör finden',
    description: 'Suche tragfähige Stimmen und bringe sie in einen gemeinsamen Fokus.',
    briefing:
      'Sammle vier Impulse im Quartier, stabilisiere den Gemeinschaftskern und öffne den Treffpunkt.',
    timeLimitSeconds: 40,
    status: 'locked',
    unlockAfterScenarioId: 'nachbarschaft-dialog',
    difficultyLabel: 'Gemeinde I',
    visualTheme: 'gehoor',
    collectiblePalette: 'teal',
    collectibleLabel: 'Impuls',
    collectiblePositions: [
      [5.2, 1.1, 4.5],
      [-5.4, 1.1, 3.8],
      [4.9, 1.1, -4.7],
      [-4.8, 1.1, -4.2],
    ],
    missionTitle: 'Stimmen bündeln',
    missionObjective: 'Sammle vier Impulse und aktiviere den Treffpunkt.',
    missionCompletionCondition:
      'Bewege den Gemeinschaftskern zur Plattform und öffne den Treffpunkt mit E.',
  },
  {
    id: 'gemeinde-dialog-4',
    title: 'Kompromiss aushandeln',
    description: 'Finde Mehrheiten zwischen unterschiedlichen Perspektiven.',
    briefing:
      'Sichere fünf Beiträge, halte den Kern stabil und schließe die Runde innerhalb des Zeitfensters.',
    timeLimitSeconds: 38,
    status: 'locked',
    unlockAfterScenarioId: 'gemeinde-dialog-3',
    difficultyLabel: 'Gemeinde II',
    visualTheme: 'kompromiss',
    collectiblePalette: 'amber',
    collectibleLabel: 'Beitrag',
    collectiblePositions: [
      [6.1, 1.1, 2.4],
      [-5.8, 1.1, 4.8],
      [2.8, 1.1, -6.2],
      [-3.1, 1.1, -6.4],
      [0, 1.1, 5.9],
    ],
    missionTitle: 'Kompromiss sichern',
    missionObjective: 'Sammle fünf Beiträge und öffne den Treffpunkt.',
    missionCompletionCondition:
      'Lade den Gemeinschaftskern auf und aktiviere den Treffpunkt mit E.',
  },
  {
    id: 'gemeinde-dialog-5',
    title: 'Beschluss umsetzen',
    description: 'Überführe den ausgehandelten Konsens in konkretes Handeln.',
    briefing:
      'Sammle sechs Handlungsmarker und schließe die Mission durch aktiven Treffpunktabschluss.',
    timeLimitSeconds: 35,
    status: 'locked',
    unlockAfterScenarioId: 'gemeinde-dialog-4',
    difficultyLabel: 'Gemeinde III',
    visualTheme: 'beschluss',
    collectiblePalette: 'rose',
    collectibleLabel: 'Marker',
    collectiblePositions: [
      [6.4, 1.1, 5.4],
      [-6.2, 1.1, 5.1],
      [6.1, 1.1, -5.6],
      [-6.1, 1.1, -5.4],
      [0, 1.1, 6.7],
      [0, 1.1, -6.8],
    ],
    missionTitle: 'Beschluss finalisieren',
    missionObjective: 'Sammle sechs Marker und aktiviere danach den Treffpunkt.',
    missionCompletionCondition:
      'Bringe den Gemeinschaftskern zur Plattform und öffne den Treffpunkt mit E.',
  },
  {
    id: 'gemeinde-dialog-6',
    title: 'Beteiligung organisieren',
    description: 'Koordiniere wachsende Beteiligung unter Zeitdruck.',
    briefing: 'Sammle sieben Signale, sichere den Kern und öffne den Treffpunkt ohne Verzögerung.',
    timeLimitSeconds: 32,
    status: 'locked',
    unlockAfterScenarioId: 'gemeinde-dialog-5',
    difficultyLabel: 'Gemeinde IV',
    visualTheme: 'training',
    collectiblePalette: 'emerald',
    collectibleLabel: 'Signal',
    collectiblePositions: [
      [6.8, 1.1, 3.2],
      [-6.7, 1.1, 3.6],
      [3.3, 1.1, -6.9],
      [-3.4, 1.1, -7],
      [0, 1.1, 7.3],
      [7.2, 1.1, 0],
      [-7.2, 1.1, 0],
    ],
    missionTitle: 'Beteiligung bündeln',
    missionObjective: 'Sammle sieben Signale und öffne den Treffpunkt.',
    missionCompletionCondition:
      'Stabilisiere den Gemeinschaftskern und aktiviere den Treffpunkt mit E.',
  },
  {
    id: 'gemeinde-dialog-7',
    title: 'Interessen ausgleichen',
    description: 'Vermittle zwischen mehreren Gruppen und halte den Prozess offen.',
    briefing: 'Sammle acht Stimmen, halte die Runde zusammen und schließe am Treffpunkt ab.',
    timeLimitSeconds: 30,
    status: 'locked',
    unlockAfterScenarioId: 'gemeinde-dialog-6',
    difficultyLabel: 'Gemeinde V',
    visualTheme: 'resonance',
    collectiblePalette: 'indigo',
    collectibleLabel: 'Stimme',
    collectiblePositions: [
      [7.4, 1.1, 4.8],
      [-7.3, 1.1, 4.4],
      [7.1, 1.1, -4.9],
      [-7.2, 1.1, -4.7],
      [4.6, 1.1, 7.1],
      [-4.5, 1.1, 7],
      [4.8, 1.1, -7.2],
      [-4.9, 1.1, -7.1],
    ],
    missionTitle: 'Interessen balancieren',
    missionObjective: 'Sammle acht Stimmen und aktiviere den Treffpunkt.',
    missionCompletionCondition:
      'Bringe den Gemeinschaftskern zum Ziel und öffne den Treffpunkt mit E.',
  },
  {
    id: 'gemeinde-dialog-8',
    title: 'Verantwortung teilen',
    description: 'Stärke gemeinsame Verantwortung in einem komplexen Feld.',
    briefing: 'Sammle neun Beiträge und führe den Kern trotz knapper Zeit zum Treffpunkt.',
    timeLimitSeconds: 28,
    status: 'locked',
    unlockAfterScenarioId: 'gemeinde-dialog-7',
    difficultyLabel: 'Gemeinde VI',
    visualTheme: 'gehoor',
    collectiblePalette: 'fuchsia',
    collectibleLabel: 'Beitrag',
    collectiblePositions: [
      [7.9, 1.1, 2.7],
      [-7.8, 1.1, 2.9],
      [2.8, 1.1, 7.8],
      [-2.7, 1.1, 7.9],
      [7.6, 1.1, -2.8],
      [-7.7, 1.1, -2.7],
      [2.9, 1.1, -7.8],
      [-2.8, 1.1, -7.9],
      [0, 1.1, 8.2],
    ],
    missionTitle: 'Verantwortung verankern',
    missionObjective: 'Sammle neun Beiträge und öffne den Treffpunkt.',
    missionCompletionCondition: 'Lade den Kern vollständig auf und aktiviere den Treffpunkt mit E.',
  },
  {
    id: 'gemeinde-dialog-9',
    title: 'Konflikte klären',
    description: 'Bearbeite Konfliktlinien und führe wieder in eine gemeinsame Richtung.',
    briefing: 'Sammle zehn Marker im Feld und schließe die Runde am Treffpunkt erfolgreich ab.',
    timeLimitSeconds: 26,
    status: 'locked',
    unlockAfterScenarioId: 'gemeinde-dialog-8',
    difficultyLabel: 'Gemeinde VII',
    visualTheme: 'kompromiss',
    collectiblePalette: 'lime',
    collectibleLabel: 'Marker',
    collectiblePositions: [
      [8.3, 1.1, 5.2],
      [-8.2, 1.1, 5.1],
      [8.1, 1.1, -5.3],
      [-8.1, 1.1, -5.2],
      [5.2, 1.1, 8.2],
      [-5.1, 1.1, 8.1],
      [5.3, 1.1, -8.2],
      [-5.2, 1.1, -8.1],
      [0, 1.1, 8.5],
      [0, 1.1, -8.5],
    ],
    missionTitle: 'Konfliktlösung sichern',
    missionObjective: 'Sammle zehn Marker und öffne den Treffpunkt.',
    missionCompletionCondition: 'Halte den Kern stabil und aktiviere den Treffpunkt mit E.',
  },
  {
    id: 'gemeinde-dialog-10',
    title: 'Gemeinde-Forum abschließen',
    description: 'Finale Etappe der ersten Welt mit maximaler Dichte und kurzer Zeit.',
    briefing: 'Sammle elf Impulse, führe den Kern präzise und beende die Welt am Treffpunkt.',
    timeLimitSeconds: 25,
    status: 'locked',
    unlockAfterScenarioId: 'gemeinde-dialog-9',
    difficultyLabel: 'Gemeinde VIII',
    visualTheme: 'beschluss',
    collectiblePalette: 'sky',
    collectibleLabel: 'Impuls',
    collectiblePositions: [
      [8.6, 1.1, 3.4],
      [-8.5, 1.1, 3.5],
      [8.4, 1.1, -3.5],
      [-8.4, 1.1, -3.4],
      [3.5, 1.1, 8.6],
      [-3.4, 1.1, 8.5],
      [3.6, 1.1, -8.6],
      [-3.5, 1.1, -8.5],
      [0, 1.1, 8.8],
      [0, 1.1, -8.8],
      [8.8, 1.1, 0],
    ],
    missionTitle: 'Welt 1 abschließen',
    missionObjective: 'Sammle elf Impulse und öffne den finalen Treffpunkt.',
    missionCompletionCondition:
      'Bringe den Gemeinschaftskern zur Plattform und aktiviere den Treffpunkt mit E.',
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

export function resolveAvailableScenarios(
  scenarios: GameScenario[],
  completedScenarioIds: string[]
): GameScenario[] {
  const completed = new Set(completedScenarioIds);
  return scenarios.map(scenario => {
    const unlocked =
      scenario.status === 'playable' ||
      (scenario.unlockAfterScenarioId ? completed.has(scenario.unlockAfterScenarioId) : false);
    return {
      ...scenario,
      status: unlocked ? 'playable' : 'locked',
    };
  });
}
