import type {
  RoleDefinition,
  ScenarioDefinition,
  WorldDefinition,
  WorldTrackState,
} from '@/game/types';

export const GAME_CONTENT_VERSION = '2026-03-30-gemeinde-v1';
export const TOTAL_PLAYABLE_SCENARIOS = 3;

export const WORLD_TRACK_LABELS: Record<keyof WorldTrackState, string> = {
  trust: 'Vertrauen',
  participation: 'Teilhabe',
  ruleOfLaw: 'Rechtsstaat',
  socialTension: 'Soziale Spannung',
  futureLoad: 'Zukunftslast',
};

export const GAME_ROLES: RoleDefinition[] = [
  {
    id: 'buerger',
    name: 'Engagierte Bürgerin',
    icon: '👩‍💼',
    color: '#2457d6',
    summary: 'Du bringst leise Stimmen und alltaegliche Betroffenheit in politische Entscheidungen.',
    focusStat: 'participation',
    signatureLabel: 'Nachbarschaftsrat aktivieren',
    signatureSummary: 'Leise Stimmen werden frueher sichtbar und Konfliktlinien klarer.',
  },
  {
    id: 'politiker',
    name: 'Lokalpolitiker',
    icon: '🏛️',
    color: '#7c3aed',
    summary: 'Du sicherst Mehrheiten, Legitimation und Handlungsfaehigkeit.',
    focusStat: 'rights',
    signatureLabel: 'Dringlichkeitssitzung einberufen',
    signatureSummary: 'Verantwortungstraeger kommen schneller zusammen und schaffen Spielraum.',
  },
  {
    id: 'journalist',
    name: 'Investigativ-Journalistin',
    icon: '📰',
    color: '#d97706',
    summary: 'Du machst Quellenlage, Machtfragen und Rechenschaft sichtbar.',
    focusStat: 'rights',
    signatureLabel: 'Quellenlage offenlegen',
    signatureSummary: 'Narrative werden transparent und oeffentliche Orientierung verbessert.',
  },
  {
    id: 'aktivist',
    name: 'Klimaaktivist',
    icon: '🌱',
    color: '#059669',
    summary: 'Du aktivierst Buendnisse und machst Dringlichkeit spuerbar.',
    focusStat: 'courage',
    signatureLabel: 'Buendnis mobilisieren',
    signatureSummary: 'Betroffene und Unterstuetzer:innen werden gezielt aktiviert.',
  },
  {
    id: 'beamter',
    name: 'Verwaltungsbeamter',
    icon: '📋',
    color: '#475569',
    summary: 'Du pruefst Verfahren, Fristen und Belastbarkeit einer Loesung.',
    focusStat: 'rights',
    signatureLabel: 'Verfahrenscheck starten',
    signatureSummary: 'Zustaendigkeiten, Fristen und Reibungen werden frueh sichtbar.',
  },
  {
    id: 'richter',
    name: 'Verfassungsrichterin',
    icon: '⚖️',
    color: '#dc2626',
    summary: 'Du verteidigst Grundrechte, Minderheitenschutz und rote Linien.',
    focusStat: 'rights',
    signatureLabel: 'Grundrechtspruefung anstossen',
    signatureSummary: 'Die verfassungsrechtliche Dimension wird klar benannt.',
  },
];

export const GAME_WORLDS: WorldDefinition[] = [
  { id: 'gemeinde', name: 'Gemeinde', icon: '🏘️', color: '#2457d6', accent: '#93c5fd', status: 'playable', release: 'Vertical Slice', summary: 'Lokale Demokratie, Beteiligung und Konfliktloesung vor Ort.', learningFocus: 'Beteiligung, Moderation, Gemeinwohl und lokale Legitimität' },
  { id: 'schule', name: 'Schule', icon: '🏫', color: '#16a34a', accent: '#86efac', status: 'roadmap', release: 'MVP', summary: 'Bildung, Inklusion und demokratischer Alltag an Lernorten.', learningFocus: 'Inklusion, Diskriminierung und Mitbestimmung' },
  { id: 'arbeit', name: 'Arbeit', icon: '🏭', color: '#ea580c', accent: '#fdba74', status: 'roadmap', release: 'MVP', summary: 'Mitbestimmung, faire Arbeit und soziale Sicherheit.', learningFocus: 'Arbeitsrechte, Solidaritaet und Verhandlung' },
  { id: 'medien', name: 'Medien', icon: '📡', color: '#8b5cf6', accent: '#c4b5fd', status: 'roadmap', release: 'MVP', summary: 'Pressefreiheit, Informationskompetenz und oeffentliche Verantwortung.', learningFocus: 'Recherche, Oeffentlichkeit und Vertrauen' },
  { id: 'umwelt', name: 'Umwelt', icon: '🌍', color: '#0891b2', accent: '#67e8f9', status: 'roadmap', release: 'Post-MVP', summary: 'Klimaschutz, Generationengerechtigkeit und nachhaltige Entscheidungen.', learningFocus: 'Langfristigkeit und gerechter Wandel' },
  { id: 'digital', name: 'Digital', icon: '💻', color: '#db2777', accent: '#f9a8d4', status: 'roadmap', release: 'Post-MVP', summary: 'Datenschutz, KI und demokratische Kontrolle digitaler Systeme.', learningFocus: 'Grundrechte und Plattformmacht' },
  { id: 'gesundheit', name: 'Gesundheit', icon: '🏥', color: '#0f766e', accent: '#5eead4', status: 'roadmap', release: 'Post-MVP', summary: 'Versorgungssicherheit, Pflege und schwierige Priorisierungen.', learningFocus: 'Menschenwuerde und gerechte Versorgung' },
  { id: 'europa', name: 'Europa', icon: '🇪🇺', color: '#4f46e5', accent: '#a5b4fc', status: 'roadmap', release: 'Full Product', summary: 'Solidaritaet, Rechtsstaatlichkeit und europaeische Verantwortung.', learningFocus: 'Kooperation und Mehr-Ebenen-Demokratie' },
  { id: 'gerechtigkeit', name: 'Gerechtigkeit', icon: '⚖️', color: '#dc2626', accent: '#fca5a5', status: 'roadmap', release: 'Full Product', summary: 'Grundrechte, Gleichstellung und Minderheitenschutz.', learningFocus: 'Schutzrechte und faire Institutionen' },
  { id: 'zukunft', name: 'Zukunft', icon: '🚀', color: '#f97316', accent: '#fdba74', status: 'roadmap', release: 'Full Product', summary: 'Demokratie der Zukunft, Innovation und globale Verantwortung.', learningFocus: 'Technikfolgen und globale Gerechtigkeit' },
];

export const GAME_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'gemeinde-parkplatz',
    worldId: 'gemeinde',
    title: 'Der Parkplatz-Streit',
    difficulty: 1,
    summary: 'Ein Parkplatzprojekt spaltet Anrainer:innen, Handel und Elternverein.',
    prompt: 'Wie bringst du Mobilitaet, Sicherheit und Gemeinwohl in eine faire Entscheidung?',
    learningFocus: 'Abwaegung lokaler Interessen und sichtbare Beteiligung',
    teacherPrompt: 'Welche Stimmen waren formal laut und welche mussten aktiv hereingeholt werden?',
    stakes: [
      'Lokaler Druck durch Handel, Elternverein und Anrainer:innen',
      'Unsichtbare Risiken fuer Schulweg und Alltagsmobilitaet',
      'Die Entscheidung muss spaeter legitimierbar bleiben',
    ],
    choices: [
      { id: 'forum', label: 'Nachbarschaftsforum mit klaren Kriterien', summary: 'Du oeffnest die Planung und legst Verkehr, Sicherheit und Nutzen offen.', immediate: 'Mehr Konflikt wird sichtbar, aber das Vertrauen steigt.', mediumTerm: 'Die Entscheidung wird spaeter besser getragen.', tags: ['community', 'transparency'] },
      { id: 'schnell', label: 'Sofortige Verwaltungsentscheidung ohne Beteiligung', summary: 'Du beschleunigst das Projekt und vermeidest eine oeffentliche Auseinandersetzung.', immediate: 'Der Beschluss geht schnell durch.', mediumTerm: 'Widerstand verlagert sich in Misstrauen und Protest.', tags: ['official'] },
      { id: 'schule', label: 'Schulweg und Verkehrssicherheit zuerst neu planen', summary: 'Du verschiebst das Projekt und baust die Planung um verletzliche Gruppen herum auf.', immediate: 'Die Entscheidung kostet Zeit.', mediumTerm: 'Die Gemeinde gewinnt an Glaubwuerdigkeit.', tags: ['rights', 'community'] },
    ],
  },
  {
    id: 'gemeinde-jugendzentrum',
    worldId: 'gemeinde',
    title: 'Neues Jugendzentrum',
    difficulty: 1,
    summary: 'Ein freier Standort ist verfuegbar, aber manche fuerchten Laerm und Vandalismus.',
    prompt: 'Wie schaffst du einen Ort fuer Jugendliche, ohne die Nachbarschaft zu verlieren?',
    learningFocus: 'Beteiligung statt Symbolpolitik',
    teacherPrompt: 'Wurde mit Jugendlichen oder nur ueber Jugendliche gesprochen?',
    stakes: [
      'Jugendliche brauchen einen sicheren Ort mit echter Mitsprache',
      'Anrainer:innen fuerchten Kontrollverlust und Belastung',
      'Budget und Akzeptanz muessen gemeinsam getragen werden',
    ],
    choices: [
      { id: 'co-design', label: 'Jugendrat und Anrainer:innen gemeinsam planen lassen', summary: 'Du gibst Jugendlichen echte Mitgestaltung und legst Nutzungsregeln gemeinsam fest.', immediate: 'Der Prozess wirkt anfangs muehsam.', mediumTerm: 'Die Nutzungsregeln sind legitimiert und tragfaehig.', tags: ['community', 'mobilize'] },
      { id: 'image', label: 'Nur ein starkes PR-Konzept ausrollen', summary: 'Du versuchst die Akzeptanz ueber Kommunikation statt Mitgestaltung zu sichern.', immediate: 'Die Debatte beruhigt sich kurz.', mediumTerm: 'Sobald Probleme auftauchen, fehlt echte Bindung.', tags: ['official'] },
      { id: 'sparen', label: 'Projekt verschieben und auf spaeteres Budget hoffen', summary: 'Du vermeidest den Konflikt und vertagst die Entscheidung.', immediate: 'Heute gibt es weniger Gegenwind.', mediumTerm: 'Jugendliche bleiben ohne geschuetzten Ort.', tags: [] },
    ],
  },
  {
    id: 'gemeinde-strassensanierung',
    worldId: 'gemeinde',
    title: 'Strassensanierung',
    difficulty: 2,
    summary: 'Die Hauptstrasse muss saniert werden, aber Gewerbe und Oeffis sind betroffen.',
    prompt: 'Wie organisierst du eine Sanierung, ohne dass die Gemeinde in Lager zerfaellt?',
    learningFocus: 'Umsetzungskraft und Transparenz',
    teacherPrompt: 'Welche Information braucht eine Gemeinde, um Bauzeit und Belastung fair zu akzeptieren?',
    stakes: [
      'Baustellenlogik trifft auf soziale Belastung',
      'Kleine Geschaefte und Pendler:innen tragen sehr unterschiedliche Risiken',
      'Transparenz entscheidet mit ueber Akzeptanz',
    ],
    choices: [
      { id: 'transparenz', label: 'Etappenplan mit offenem Belastungsmonitor', summary: 'Du veroeffentlichst Bauphasen, Ersatzwege und ein klares Beschwerdefenster.', immediate: 'Mehr Menschen fuehlen sich ernst genommen.', mediumTerm: 'Die Sanierung bleibt trotz Belastung politisch stabil.', tags: ['transparency', 'compliance'] },
      { id: 'nachtbau', label: 'Maximal verdichten und nachts durchziehen', summary: 'Du priorisierst Geschwindigkeit ueber Gesundheits- und Lebensqualitaetsfragen.', immediate: 'Die Bauzeit sinkt.', mediumTerm: 'Vertrauen und Akzeptanz brechen spuerbar weg.', tags: ['official'] },
      { id: 'sozialfonds', label: 'Baustellenplan mit haerterem Schutz fuer kleine Geschaefte', summary: 'Du kombinierst Zeitplan, Lieferfenster und gezielte lokale Entlastung.', immediate: 'Die Umsetzung wird komplexer.', mediumTerm: 'Besonders betroffene Gruppen bleiben handlungsfaehig.', tags: ['community', 'compliance'] },
    ],
  },
];

function requireFirstItem<T>(items: T[], label: string): T {
  const first = items[0];
  if (!first) {
    throw new Error(`${label} ist leer und kann nicht als Fallback verwendet werden.`);
  }
  return first;
}

export function getRoleById(roleId: string): RoleDefinition {
  return GAME_ROLES.find((role) => role.id === roleId) ?? requireFirstItem(GAME_ROLES, 'GAME_ROLES');
}

export function getWorldById(worldId: string): WorldDefinition {
  return GAME_WORLDS.find((world) => world.id === worldId) ?? requireFirstItem(GAME_WORLDS, 'GAME_WORLDS');
}

export function getScenarioById(scenarioId: string): ScenarioDefinition | null {
  return GAME_SCENARIOS.find((scenario) => scenario.id === scenarioId) ?? null;
}
