import {
  WORLD_TRACK_KEYS,
  WORLD_TRACK_LABELS,
  applyWorldDelta,
  buildConsequenceSeeds,
  createDefaultWorldState,
  createWorldStateSnapshot,
  getDominantShift,
  getWorldStateCards,
  getWorldStateForWorld,
  getWorldTrackTone,
} from './world-state.js';

export const WEBSITE_URL = 'https://www.menschlichkeit-oesterreich.at';
export const GAMES_URL = 'https://games.menschlichkeit-oesterreich.at';
export const ROADMAP_LEVEL_COUNT = 100;
export const PLAYABLE_LEVEL_COUNT = 10;

export const SITE_LINKS = {
  main: WEBSITE_URL,
  play: GAMES_URL,
  join: `${WEBSITE_URL}/mitglied-werden`,
  education: `${WEBSITE_URL}/bildung`,
  donate: `${WEBSITE_URL}/spenden`,
  contact: `${WEBSITE_URL}/kontakt`,
  privacy: `${WEBSITE_URL}/datenschutz`,
  imprint: `${WEBSITE_URL}/impressum`,
};

export const PROFILE_KEYS = ['empathy', 'rights', 'participation', 'courage'];

export const PROFILE_LABELS = {
  empathy: 'Empathie',
  rights: 'Rechte',
  participation: 'Teilhabe',
  courage: 'Zivilcourage',
};

export const ROLES = [
  {
    id: 'buerger',
    name: 'Engagierte Buergerin',
    icon: '👩‍💼',
    color: '#3b82f6',
    summary: 'Du arbeitest nah an Alltagsrealitaeten und hoerst frueh, wo Menschen sich uebergangen fuehlen.',
    focusStat: 'participation',
    synergyTag: 'community',
    intelLead: 'Du bemerkst zuerst, wo im Alltag Vertrauen bruechig wird.',
    riskPrompt: 'du Harmonie ueber Klarheit stellst und Konflikte zu lange moderierst',
    reflectionLens: 'Wie wurde Teilhabe fuer Menschen wirklich spuergbar?',
    worldTrackFocusKey: 'participation',
    trackBonus: 5,
    pressureTrack: 'Anschlussfaehigkeit im Alltag',
    failureMode: 'Du beruhigst die Lage oberflaechlich, ohne Machtfragen sichtbar zu machen.',
    roleObjective: 'Leise Stimmen, verletzliche Gruppen und alltaegliche Betroffenheit in echte Mitsprache uebersetzen.',
    intelActions: ['Leise Stimmen sammeln', 'Konfliktlinien frueh sichtbar machen'],
    signatureAction: {
      label: 'Nachbarschaftsrat aktivieren',
      summary: 'Du oeffnest einen geschuetzten Raum fuer leise Stimmen und erkennst Konfliktlinien frueher.',
      scoreBonus: 6,
      xpBonus: 4,
      statBonus: 2,
    },
  },
  {
    id: 'politiker',
    name: 'Lokalpolitiker',
    icon: '🏛️',
    color: '#8b5cf6',
    summary: 'Du musst Mehrheiten, Legitimation und Gemeinwohl gleichzeitig tragen.',
    focusStat: 'rights',
    synergyTag: 'official',
    intelLead: 'Du erkennst frueh, ob eine Entscheidung politisch wirklich traegt.',
    riskPrompt: 'du nur Mehrheiten sicherst, statt gesellschaftliches Vertrauen aufzubauen',
    reflectionLens: 'Welche Entscheidung war politisch tragfaehig, ohne das Gemeinwohl zu verraten?',
    worldTrackFocusKey: 'trust',
    trackBonus: 4,
    pressureTrack: 'Legitimation und Mehrheitsdruck',
    failureMode: 'Du verwechselst politische Geschwindigkeit mit demokratischer Tragfaehigkeit.',
    roleObjective: 'Handlungsfaehigkeit sichern, ohne Fairness, Minderheitenschutz oder Transparenz zu opfern.',
    intelActions: ['Mehrheiten absichern', 'Zustaendigkeiten und Timing ordnen'],
    signatureAction: {
      label: 'Dringlichkeitssitzung einberufen',
      summary: 'Du bringst Verantwortungstraeger schnell an einen Tisch und gewinnst Handlungsspielraum.',
      scoreBonus: 5,
      xpBonus: 5,
      statBonus: 1,
    },
  },
  {
    id: 'journalist',
    name: 'Investigativ-Journalistin',
    icon: '📰',
    color: '#f59e0b',
    summary: 'Du arbeitest mit Recherche, Quellen und oeffentlicher Rechenschaft.',
    focusStat: 'rights',
    synergyTag: 'transparency',
    intelLead: 'Du merkst sofort, welche Information fuer faire Debatten noch fehlt.',
    riskPrompt: 'du Enthuellung ueber soziale Anschlussfaehigkeit stellst',
    reflectionLens: 'Welche Information musste sichtbar werden, damit Demokratie arbeiten kann?',
    worldTrackFocusKey: 'ruleOfLaw',
    trackBonus: 5,
    pressureTrack: 'Glaubwuerdigkeit der Oeffentlichkeit',
    failureMode: 'Du erzeugst Aufmerksamkeit, aber keine tragfaehige Orientierung fuer Betroffene.',
    roleObjective: 'Machtfragen, Quellenlage und Rechenschaft oeffentlich sichtbar machen.',
    intelActions: ['Quellenlage schuetzen', 'Widersprueche oeffentlich pruefen'],
    signatureAction: {
      label: 'Quellenlage offenlegen',
      summary: 'Du machst Narrative transparent und deckst Machtfragen hinter dem Konflikt auf.',
      scoreBonus: 7,
      xpBonus: 4,
      statBonus: 2,
    },
  },
  {
    id: 'aktivist',
    name: 'Klimaaktivist',
    icon: '🌱',
    color: '#10b981',
    summary: 'Du spuerst, wann gesellschaftlicher Druck noetig ist, damit sich etwas bewegt.',
    focusStat: 'courage',
    synergyTag: 'mobilize',
    intelLead: 'Du erkennst, wann eine Lage kippt und kollektive Energie gebraucht wird.',
    riskPrompt: 'du Mobilisierung ueber gesellschaftliche Anschlussfaehigkeit stellst',
    reflectionLens: 'Wo war Druck noetig und wo haette er Vertrauen kosten koennen?',
    worldTrackFocusKey: 'futureLoad',
    trackBonus: -4,
    pressureTrack: 'Dringlichkeit und Erschoepfung',
    failureMode: 'Du verschiebst Spannungen zu stark in Konfrontation und verlierst Bruckenbauer:innen.',
    roleObjective: 'Stillstand durchbrechen, ohne die Gemeinde in reine Lagerlogik kippen zu lassen.',
    intelActions: ['Buendnisse aktivieren', 'Dringlichkeit sichtbar machen'],
    signatureAction: {
      label: 'Buendnis mobilisieren',
      summary: 'Du aktivierst Betroffene und Unterstuetzer:innen und machst Dringlichkeit sichtbar.',
      scoreBonus: 6,
      xpBonus: 5,
      statBonus: 2,
    },
  },
  {
    id: 'beamter',
    name: 'Verwaltungsbeamter',
    icon: '📋',
    color: '#6b7280',
    summary: 'Du machst sichtbar, ob gute Ideen auch wirklich belastbar umsetzbar sind.',
    focusStat: 'rights',
    synergyTag: 'compliance',
    intelLead: 'Du erkennst Reibung in Verfahren, Fristen und Zustaendigkeiten sehr frueh.',
    riskPrompt: 'du nur Formalien rettest und Menschen aus dem Blick verlierst',
    reflectionLens: 'Welche Loesung war nicht nur gut gemeint, sondern auch tragfaehig?',
    worldTrackFocusKey: 'ruleOfLaw',
    trackBonus: 4,
    pressureTrack: 'Verfahren und Belastbarkeit',
    failureMode: 'Du schuetzt den Prozess, aber nicht zwingend seine soziale Legitimation.',
    roleObjective: 'Gute Absichten in tragfaehige Regeln, Fristen und Zustandsketten uebersetzen.',
    intelActions: ['Verfahrensrisiken aufdecken', 'Folgekosten frueh absichern'],
    signatureAction: {
      label: 'Verfahrenscheck starten',
      summary: 'Du pruefst Zustaendigkeiten, Fristen und Umsetzbarkeit und deckst stille Reibung auf.',
      scoreBonus: 5,
      xpBonus: 4,
      statBonus: 1,
    },
  },
  {
    id: 'richter',
    name: 'Verfassungsrichterin',
    icon: '⚖️',
    color: '#ef4444',
    summary: 'Du verteidigst Grundrechte, Minderheitenschutz und klare rote Linien.',
    focusStat: 'rights',
    synergyTag: 'rights',
    intelLead: 'Du siehst sofort, wo Grundrechte und Minderheitenschutz beruehrt werden.',
    riskPrompt: 'du Prinzipien so abstrakt formulierst, dass soziale Realitaeten unsichtbar bleiben',
    reflectionLens: 'Welche rote Linie musste sichtbar gezogen werden und warum?',
    worldTrackFocusKey: 'ruleOfLaw',
    trackBonus: 6,
    pressureTrack: 'Grundrechte unter Druck',
    failureMode: 'Du bleibst formal richtig, aber gesellschaftlich anschlussarm und spaet im Konflikt.',
    roleObjective: 'Mehrheitswille, Verwaltungshandeln und Schutzrechte in ein faires Gleichgewicht bringen.',
    intelActions: ['Rote Linien markieren', 'Minderheitenschutz absichern'],
    signatureAction: {
      label: 'Grundrechtspruefung anstossen',
      summary: 'Du machst die verfassungsrechtliche Dimension sichtbar und schaerfst die Legitimaetsfrage.',
      scoreBonus: 7,
      xpBonus: 4,
      statBonus: 2,
    },
  },
];

export const WORLDS = [
  { id: 1, name: 'Gemeinde', icon: '🏘️', color: '#3b82f6', accent: '#93c5fd', summary: 'Lokale Demokratie, Beteiligung und Konfliktloesung vor Ort.', status: 'playable', release: 'Vertical Slice', learningFocus: 'Beteiligung, Moderation, Gemeinwohl und lokale Legitimität' },
  { id: 2, name: 'Schule', icon: '🏫', color: '#10b981', accent: '#6ee7b7', summary: 'Bildung, Inklusion und demokratischer Alltag an Lernorten.', status: 'roadmap', release: 'MVP', learningFocus: 'Inklusion, Diskriminierung, Mitbestimmung und Schutzraeume' },
  { id: 3, name: 'Arbeit', icon: '🏭', color: '#f59e0b', accent: '#fcd34d', summary: 'Mitbestimmung, faire Arbeit und soziale Sicherheit.', status: 'roadmap', release: 'MVP', learningFocus: 'Arbeitsrechte, Verhandlung, Solidaritaet und Machtasymmetrien' },
  { id: 4, name: 'Medien', icon: '📡', color: '#8b5cf6', accent: '#c4b5fd', summary: 'Pressefreiheit, Informationskompetenz und oeffentliche Verantwortung.', status: 'roadmap', release: 'MVP', learningFocus: 'Desinformation, Recherche, Oeffentlichkeit und Vertrauen' },
  { id: 5, name: 'Umwelt', icon: '🌍', color: '#06b6d4', accent: '#67e8f9', summary: 'Klimaschutz, Generationengerechtigkeit und nachhaltige Entscheidungen.', status: 'roadmap', release: 'Post-MVP', learningFocus: 'Langfristigkeit, Zielkonflikte und sozial gerechter Wandel' },
  { id: 6, name: 'Digital', icon: '💻', color: '#ec4899', accent: '#f9a8d4', summary: 'Datenschutz, KI und demokratische Kontrolle digitaler Systeme.', status: 'roadmap', release: 'Post-MVP', learningFocus: 'Grundrechte, Plattformmacht und Digitalkompetenz' },
  { id: 7, name: 'Gesundheit', icon: '🏥', color: '#14b8a6', accent: '#5eead4', summary: 'Versorgungssicherheit, Pflege und schwierige Priorisierungen.', status: 'roadmap', release: 'Post-MVP', learningFocus: 'Menschenwuerde, Ressourcenknappheit und gerechte Versorgung' },
  { id: 8, name: 'Europa', icon: '🇪🇺', color: '#6366f1', accent: '#a5b4fc', summary: 'Solidaritaet, Rechtsstaatlichkeit und europaeische Verantwortung.', status: 'roadmap', release: 'Full Product', learningFocus: 'Kooperation, Souveraenitaet und demokratische Mehr-Ebenen-Politik' },
  { id: 9, name: 'Gerechtigkeit', icon: '⚖️', color: '#ef4444', accent: '#fca5a5', summary: 'Grundrechte, Gleichstellung und Minderheitenschutz.', status: 'roadmap', release: 'Full Product', learningFocus: 'Rechtsstaat, Schutzrechte und faire Institutionen' },
  { id: 10, name: 'Zukunft', icon: '🚀', color: '#f97316', accent: '#fdba74', summary: 'Demokratie der Zukunft, Innovation und globale Verantwortung.', status: 'roadmap', release: 'Full Product', learningFocus: 'Technikfolgen, globale Gerechtigkeit und demokratische Innovation' },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function withWorldMeta(level) {
  const world = getWorldById(level.worldId);
  return {
    ...level,
    worldName: world.name,
    worldIcon: world.icon,
    worldColor: world.color,
    worldAccent: world.accent,
  };
}

const GEMEINDE_LEVELS = [
  {
    id: 1,
    worldId: 1,
    title: 'Der Parkplatz-Streit',
    district: 'Pottenbrunn Nord',
    difficulty: 1,
    summary: 'Ein Parkplatzprojekt spaltet Anrainer:innen, Handel und Elternverein.',
    context: 'Der Gemeinderat will einen Parkplatz erweitern. Der Handel draengt, Eltern wollen sichere Schulwege und Anrainer:innen fuerchten mehr Verkehr.',
    prompt: 'Wie bringst du Mobilitaet, Sicherheit und Gemeinwohl in eine faire Entscheidung?',
    stakeholders: ['Anrainer:innen', 'Elternverein', 'Handelsverein'],
    learningFocus: 'Abwaegung lokaler Interessen und sichtbare Beteiligung',
    teacherPrompt: 'Welche Stimmen waren formal laut und welche mussten aktiv hereingeholt werden?',
    choices: [
      { id: 'forum', label: 'Nachbarschaftsforum mit klaren Kriterien', summary: 'Du oeffnest die Planung und legst Verkehr, Sicherheit und Nutzen offen.', immediate: 'Mehr Konflikt wird sichtbar, aber das Vertrauen steigt.', mediumTerm: 'Die Entscheidung wird spaeter besser getragen.', score: 90, xp: 24, stats: { empathy: 5, rights: 3, participation: 8, courage: 2 }, tags: ['community', 'transparency'] },
      { id: 'schnell', label: 'Sofortige Verwaltungsentscheidung ohne Beteiligung', summary: 'Du beschleunigst das Projekt und vermeidest eine oeffentliche Auseinandersetzung.', immediate: 'Der Beschluss geht schnell durch.', mediumTerm: 'Widerstand verlagert sich in Misstrauen und Protest.', score: 42, xp: 6, stats: { empathy: 0, rights: 1, participation: -2, courage: 1 }, tags: ['official'] },
      { id: 'schule', label: 'Schulweg und Verkehrssicherheit zuerst neu planen', summary: 'Du verschiebst das Projekt und baust die Planung um die verletzlichsten Gruppen herum auf.', immediate: 'Die Entscheidung kostet Zeit.', mediumTerm: 'Die Gemeinde gewinnt an Glaubwuerdigkeit.', score: 84, xp: 18, stats: { empathy: 6, rights: 4, participation: 5, courage: 3 }, tags: ['rights', 'community'] },
    ],
  },
  {
    id: 2,
    worldId: 1,
    title: 'Neues Jugendzentrum',
    district: 'Innenstadt',
    difficulty: 1,
    summary: 'Ein freier Standort ist verfuegbar, aber manche fuerchten Laerm und Vandalismus.',
    context: 'Jugendliche wollen einen sicheren Ort, mehrere Hausgemeinschaften sind skeptisch und das Budget ist knapp.',
    prompt: 'Wie schaffst du einen Ort fuer Jugendliche, ohne die Nachbarschaft zu verlieren?',
    stakeholders: ['Jugendliche', 'Anrainer:innen', 'Sozialarbeit'],
    learningFocus: 'Beteiligung statt Symbolpolitik',
    teacherPrompt: 'Wurde mit Jugendlichen oder nur ueber Jugendliche gesprochen?',
    choices: [
      { id: 'co-design', label: 'Jugendrat und Anrainer:innen gemeinsam planen lassen', summary: 'Du gibst Jugendlichen echte Mitgestaltung und legst Nutzungsregeln gemeinsam fest.', immediate: 'Der Prozess wirkt anfangs muhsam.', mediumTerm: 'Die Nutzungsregeln sind legitimiert und tragfaehig.', score: 92, xp: 26, stats: { empathy: 7, rights: 3, participation: 8, courage: 2 }, tags: ['community', 'mobilize'] },
      { id: 'image', label: 'Nur ein starkes PR-Konzept ausrollen', summary: 'Du versuchst die Akzeptanz ueber Kommunikation statt Mitgestaltung zu sichern.', immediate: 'Die Debatte beruhigt sich kurz.', mediumTerm: 'Sobald Probleme auftauchen, fehlt echte Bindung.', score: 50, xp: 8, stats: { empathy: 1, rights: 1, participation: 0, courage: 0 }, tags: ['official'] },
      { id: 'sparen', label: 'Projekt verschieben und auf spaeteres Budget hoffen', summary: 'Du vermeidest den Konflikt und vertagst die Entscheidung.', immediate: 'Heute gibt es weniger Gegenwind.', mediumTerm: 'Jugendliche bleiben ohne geschuetzten Ort.', score: 25, xp: 0, stats: { empathy: -2, rights: 0, participation: -3, courage: -2 }, tags: [] },
    ],
  },
  {
    id: 3,
    worldId: 1,
    title: 'Strassensanierung',
    district: 'Altort',
    difficulty: 2,
    summary: 'Die Hauptstrasse muss saniert werden, aber Gewerbe und Oeffis sind betroffen.',
    context: 'Bauamt, Geschaefte und Pendler:innen brauchen eine Loesung, die nicht nur technisch, sondern auch sozial tragfaehig ist.',
    prompt: 'Wie organisierst du eine Sanierung, ohne dass die Gemeinde in Lager zerfaellt?',
    stakeholders: ['Bauamt', 'Geschaefte', 'Pendler:innen'],
    learningFocus: 'Umsetzungskraft und Transparenz',
    teacherPrompt: 'Welche Information braucht eine Gemeinde, um Bauzeit und Belastung fair zu akzeptieren?',
    choices: [
      { id: 'transparenz', label: 'Etappenplan mit offenem Belastungsmonitor', summary: 'Du veroeffentlichst Bauphasen, Ersatzwege und ein klares Beschwerdefenster.', immediate: 'Mehr Menschen fuehlen sich ernst genommen.', mediumTerm: 'Die Sanierung bleibt trotz Belastung politisch stabil.', score: 88, xp: 22, stats: { empathy: 4, rights: 3, participation: 5, courage: 3 }, tags: ['transparency', 'compliance'] },
      { id: 'nachtbau', label: 'Maximal verdichten und nachts durchziehen', summary: 'Du priorisierst Geschwindigkeit ueber Gesundheits- und Lebensqualitaetsfragen.', immediate: 'Die Bauzeit sinkt.', mediumTerm: 'Vertrauen und Akzeptanz brechen spuerbar weg.', score: 38, xp: 4, stats: { empathy: -1, rights: 0, participation: -2, courage: 1 }, tags: ['official'] },
      { id: 'sozialfonds', label: 'Baustellenplan mit haerterem Schutz fuer kleine Geschaefte', summary: 'Du kombinierst Zeitplan, Lieferfenster und gezielte lokale Entlastung.', immediate: 'Die Umsetzung wird komplexer.', mediumTerm: 'Besonders betroffene Gruppen bleiben handlungsfaehig.', score: 82, xp: 16, stats: { empathy: 4, rights: 2, participation: 4, courage: 2 }, tags: ['community', 'compliance'] },
    ],
  },
  {
    id: 4,
    worldId: 1,
    title: 'Fluechtlingsunterkunft',
    district: 'Am Stadtpark',
    difficulty: 2,
    summary: 'Eine Notunterkunft muss schnell geschaffen werden, die Stimmung ist aufgeheizt.',
    context: 'Hilfsbereite Initiativen, verunsicherte Nachbarschaft und politische Zuspitzung treffen in wenigen Tagen aufeinander.',
    prompt: 'Wie schaffst du Schutz, ohne die Gemeinde in Angstkommunikation kippen zu lassen?',
    stakeholders: ['Gefluechtete Menschen', 'Nachbarschaft', 'Hilfsinitiativen'],
    learningFocus: 'Menschenwuerde, Deeskalation und lokale Verantwortung',
    teacherPrompt: 'Welche Kommunikation schuetzt Betroffene und nimmt Unsicherheit ernst, ohne Ressentiments zu bedienen?',
    choices: [
      { id: 'schutz', label: 'Unterkunft oeffnen und sofort Begleitdialog organisieren', summary: 'Du priorisierst Schutz und oeffnest gleichzeitig klare lokale Informationskanaele.', immediate: 'Die Lage bleibt emotional, aber handhabbar.', mediumTerm: 'Menschlichkeit wird mit Ordnung verbunden statt gegeneinander ausgespielt.', score: 94, xp: 28, stats: { empathy: 8, rights: 6, participation: 4, courage: 5 }, tags: ['rights', 'community', 'mobilize'] },
      { id: 'beschwichtigen', label: 'Nur Sicherheitsnarrativ nach aussen spielen', summary: 'Du versuchst Akzeptanz ueber haerte Sprache und Kontrolle zu gewinnen.', immediate: 'Ein Teil der Kritik beruhigt sich kurz.', mediumTerm: 'Die Unterkunft startet unter Misstrauen und Druck.', score: 44, xp: 7, stats: { empathy: -1, rights: 0, participation: -1, courage: 1 }, tags: ['official'] },
      { id: 'abwarten', label: 'Entscheidung vertagen und auf Landesloesung warten', summary: 'Du verschiebst Verantwortung nach oben.', immediate: 'Lokal sinkt der Druck fuer dich.', mediumTerm: 'Schutzbeduerftige bleiben unversorgt und die Gemeinde wirkt passiv.', score: 20, xp: 0, stats: { empathy: -3, rights: -2, participation: -1, courage: -3 }, tags: [] },
    ],
  },
  {
    id: 5,
    worldId: 1,
    title: 'Windrad-Buergerinitiative',
    district: 'Weinberg Ost',
    difficulty: 3,
    summary: 'Klimaschutz trifft auf Landschaftsbild, Flaechenrechte und Energiekosten.',
    context: 'Eine Windkraftflaeche ist fachlich sinnvoll, aber eine Buergerinitiative sammelt Unterschriften gegen das Projekt.',
    prompt: 'Wie gehst du mit einem Konflikt um, in dem Zukunftsverantwortung und lokale Betroffenheit kollidieren?',
    stakeholders: ['Buergerinitiative', 'Energiegenossenschaft', 'Gemeinderat'],
    learningFocus: 'Langfristigkeit, Legitimation und gerechter Wandel',
    teacherPrompt: 'Wie wird ein Transformationskonflikt fair, wenn nicht alle Kosten und Nutzen gleich verteilt sind?',
    choices: [
      { id: 'beteiligung', label: 'Beteiligungsmodell mit lokaler Energiegenossenschaft', summary: 'Du verknuepfst Klimaziel, Mitsprache und lokalen Nutzen.', immediate: 'Das Projekt wird nicht einfacher, aber breiter verankert.', mediumTerm: 'Wandel wird als gemeinsames Projekt sichtbar.', score: 91, xp: 26, stats: { empathy: 4, rights: 3, participation: 6, courage: 6 }, tags: ['community', 'mobilize'] },
      { id: 'durchziehen', label: 'Projekt mit Minimaldialog durchziehen', summary: 'Du setzt auf fachliche Richtigkeit und politische Beschleunigung.', immediate: 'Das Windrad kommt schneller naeher.', mediumTerm: 'Der lokale Konflikt bleibt bestehen und vergiftet Folgeprojekte.', score: 47, xp: 8, stats: { empathy: -1, rights: 1, participation: -2, courage: 2 }, tags: ['official'] },
      { id: 'verzicht', label: 'Aus Angst vor Konflikt ganz aufgeben', summary: 'Du vermeidest Eskalation, verlierst aber Handlungsfaehigkeit.', immediate: 'Die Gemeinde beruhigt sich oberflaechlich.', mediumTerm: 'Klimapolitik wirkt beliebig und unzuverlaessig.', score: 29, xp: 0, stats: { empathy: 0, rights: 0, participation: -1, courage: -4 }, tags: [] },
    ],
  },
  {
    id: 6,
    worldId: 1,
    title: 'Gemeindefusion',
    district: 'Regionalverband',
    difficulty: 3,
    summary: 'Zwei Gemeinden sollen zusammengelegt werden, Identitaet und Versorgung stehen auf dem Spiel.',
    context: 'Die Fusion verspricht Effizienz, aber viele fuerchten Verlust von Naehe, Mitsprache und Identitaet.',
    prompt: 'Wie verhandelst du Reformdruck, lokale Identitaet und reale Servicequalitaet?',
    stakeholders: ['Beide Gemeinden', 'Regionalpolitik', 'Verwaltung'],
    learningFocus: 'Reformlegitimität und demokratische Naehe',
    teacherPrompt: 'Wann ist eine strukturelle Reform legitim und wann fuehlt sie sich wie Entmachtung an?',
    choices: [
      { id: 'fusionsrat', label: 'Fusionsrat mit lokalen Garantien und Review-Klausel', summary: 'Du kombinierst Reform mit verhandelten Schutzgarantien.', immediate: 'Der Prozess wird langsamer, aber nachvollziehbarer.', mediumTerm: 'Aengste sinken, weil Naehe vertraglich sichtbar bleibt.', score: 86, xp: 22, stats: { empathy: 4, rights: 3, participation: 6, courage: 3 }, tags: ['official', 'community', 'compliance'] },
      { id: 'topdown', label: 'Fusionsentscheid top-down beschliessen', summary: 'Du argumentierst mit Kostendruck und ziehst den Prozess zentral durch.', immediate: 'Die Reform ist schnell auf Schiene.', mediumTerm: 'Lokale Ablehnung schuert dauerhaftes Misstrauen.', score: 40, xp: 5, stats: { empathy: -1, rights: 1, participation: -3, courage: 1 }, tags: ['official'] },
      { id: 'abbruch', label: 'Fusion komplett stoppen', summary: 'Du schuetzt Identitaet, aber vertagst die Strukturprobleme.', immediate: 'Lokale Zustimmung steigt.', mediumTerm: 'Spaetere Reformen werden noch schwieriger.', score: 54, xp: 9, stats: { empathy: 2, rights: 1, participation: 1, courage: -1 }, tags: ['community'] },
    ],
  },
  {
    id: 7,
    worldId: 1,
    title: 'Buergermeisterwahl unter Druck',
    district: 'Rathaus',
    difficulty: 4,
    summary: 'Im Wahlkampf kippt die Debatte Richtung Angst und gezielte Halbwahrheiten.',
    context: 'Kurz vor der Wahl verbreiten mehrere Kanaele ein verzerrtes Bild ueber soziale Ausgaben und Sicherheit im Ort.',
    prompt: 'Wie verteidigst du eine faire demokratische Debatte, ohne selbst in reine Kampflogik zu kippen?',
    stakeholders: ['Waehler:innen', 'Parteien', 'lokale Medien'],
    learningFocus: 'Fairness, Transparenz und demokratische Streitkultur',
    teacherPrompt: 'Was unterscheidet harte demokratische Auseinandersetzung von manipulativer Eskalation?',
    choices: [
      { id: 'faktenraum', label: 'Offenen Faktenraum mit lokalen Medien und Quellen aufsetzen', summary: 'Du hebst die Debatte auf nachvollziehbare Informationen zurueck.', immediate: 'Der Wahlkampf bleibt angespannt, aber klarer.', mediumTerm: 'Die Gemeinde entwickelt ein staerkeres Abwehrsystem gegen Desinformation.', score: 89, xp: 24, stats: { empathy: 2, rights: 5, participation: 4, courage: 5 }, tags: ['transparency', 'official'] },
      { id: 'gegenkampagne', label: 'Mit emotionaler Gegenkampagne antworten', summary: 'Du bekaempfst Zuspitzung mit eigener Zuspitzung.', immediate: 'Die eigene Basis wird aktiviert.', mediumTerm: 'Die politische Kultur wird weiter ausgeduennt.', score: 46, xp: 7, stats: { empathy: 0, rights: 1, participation: 0, courage: 2 }, tags: ['mobilize'] },
      { id: 'ignorieren', label: 'Desinformation ignorieren und auf Vernunft hoffen', summary: 'Du gibst manipulativen Erzaehlungen freien Raum.', immediate: 'Der eigene Stress sinkt.', mediumTerm: 'Narrative verfestigen sich ohne Widerrede.', score: 18, xp: 0, stats: { empathy: 0, rights: -1, participation: -2, courage: -4 }, tags: [] },
    ],
  },
  {
    id: 8,
    worldId: 1,
    title: 'Korruption im Gemeinderat',
    district: 'Vergabestelle',
    difficulty: 4,
    summary: 'Hinweise auf Bevorzugung bei Auftraegen werden konkreter.',
    context: 'Ein lokaler Auftrag wurde moeglicherweise nicht sauber vergeben. Teile der Verwaltung wollen diskret bleiben, die Oeffentlichkeit fordert Klarheit.',
    prompt: 'Wie handelst du, wenn Vertrauen in Institutionen auf dem Spiel steht?',
    stakeholders: ['Gemeinderat', 'Verwaltung', 'Oeffentlichkeit'],
    learningFocus: 'Institutionelle Integritaet und klare Verantwortlichkeit',
    teacherPrompt: 'Welche Schritte schuetzen Institutionen wirklich und welche schuetzen nur Gesichter?',
    choices: [
      { id: 'offenlegen', label: 'Unabhaengige Pruefung und proaktive Offenlegung', summary: 'Du priorisierst Institutionenvertrauen ueber kurzfristige Schadensbegrenzung.', immediate: 'Es wird fuer mehrere Akteure unangenehm.', mediumTerm: 'Die Gemeinde zeigt, dass Kontrolle ernst gemeint ist.', score: 95, xp: 30, stats: { empathy: 1, rights: 7, participation: 3, courage: 6 }, tags: ['transparency', 'rights', 'compliance'] },
      { id: 'intern', label: 'Fall intern bereinigen und nach aussen klein halten', summary: 'Du versuchst Schaden zu begrenzen, ohne den Skandal zu oeffnen.', immediate: 'Kurzfristig bleibt die Lage ruhig.', mediumTerm: 'Wenn der Fall doch aufbricht, ist der Vertrauensverlust doppelt so hoch.', score: 34, xp: 3, stats: { empathy: 0, rights: -1, participation: -1, courage: -2 }, tags: ['compliance'] },
      { id: 'abwaelzen', label: 'Verantwortung auf Einzelpersonen abschieben', summary: 'Du suchst schnelle Distanz statt saubere Aufklaerung.', immediate: 'Politisch entsteht Luft.', mediumTerm: 'Systemische Probleme bleiben bestehen.', score: 40, xp: 5, stats: { empathy: -1, rights: 0, participation: -1, courage: 0 }, tags: ['official'] },
    ],
  },
  {
    id: 9,
    worldId: 1,
    title: 'Volksbegehren im Ort',
    district: 'Marktplatz',
    difficulty: 5,
    summary: 'Ein lokales Volksbegehren polarisiert, obwohl die Rechtslage komplex ist.',
    context: 'Viele Menschen fuehlen sich uebergangen und sammeln Unterschriften, aber die Forderung greift teilweise in Grundrechte Dritter ein.',
    prompt: 'Wie nimmst du das demokratische Signal ernst, ohne rechtsstaatliche Grenzen zu verwischen?',
    stakeholders: ['Initiative', 'Minderheiten', 'Gemeindevertretung'],
    learningFocus: 'Demokratie und Grundrechte gleichzeitig denken',
    teacherPrompt: 'Warum ist Mehrheitswille allein nicht genug und wie erklaert man das fair?',
    choices: [
      { id: 'dialogplus', label: 'Volksbegehren ernst nehmen und mit Grundrechtscheck koppeln', summary: 'Du schaffst eine faire Erklaerung von Beteiligung plus rechtsstaatlicher Grenze.', immediate: 'Die Debatte bleibt kontrovers, aber nachvollziehbar.', mediumTerm: 'Die Gemeinde lernt, dass Beteiligung und Schutzrechte zusammengehoeren.', score: 90, xp: 28, stats: { empathy: 3, rights: 7, participation: 5, courage: 4 }, tags: ['rights', 'community', 'official'] },
      { id: 'mehrheit', label: 'Mehrheitswunsch ungeprueft politisch uebernehmen', summary: 'Du reagierst direkt auf Stimmung und Signale.', immediate: 'Die Initiative fuehlt sich bestaetigt.', mediumTerm: 'Grundrechte werden instrumentalisiert und Vertrauen in Regeln sinkt.', score: 28, xp: 0, stats: { empathy: 0, rights: -4, participation: 1, courage: 0 }, tags: ['mobilize'] },
      { id: 'abwehr', label: 'Volksbegehren formell abwehren, ohne Erklaerung oder Dialog', summary: 'Du schuetzt die Rechtslage, aber nicht die demokratische Anschlussfaehigkeit.', immediate: 'Formal bleibt alles korrekt.', mediumTerm: 'Frust ueber Verfahren waechst und radikalisiert den Konflikt.', score: 52, xp: 9, stats: { empathy: -1, rights: 3, participation: -2, courage: 1 }, tags: ['rights'] },
    ],
  },
  {
    id: 10,
    worldId: 1,
    title: 'Gemeindebudget-Krise',
    district: 'Finanzausschuss',
    difficulty: 5,
    summary: 'Das Gemeindebudget reicht nicht mehr fuer alles, kuerzen trifft immer jemand Konkreten.',
    context: 'Energiepreise, Sozialbedarf und Investitionsstau treffen gleichzeitig aufeinander. Mehrere Gruppen halten ihre Position fuer unverzichtbar.',
    prompt: 'Wie triffst du eine harte Budgetentscheidung, ohne den sozialen Zusammenhalt zu zerlegen?',
    stakeholders: ['Sozialbereich', 'Infrastruktur', 'Sport und Kultur'],
    learningFocus: 'Gerechte Priorisierung und transparente Verantwortung',
    teacherPrompt: 'Was macht eine harte Verteilungsentscheidung demokratisch legitim und sozial fair?',
    choices: [
      { id: 'kriterien', label: 'Offene Priorisierung nach Schutzbedarf und Langzeitwirkung', summary: 'Du erklaerst, nach welchen demokratischen Kriterien gekuerzt, gesichert und investiert wird.', immediate: 'Die Entscheidung bleibt schmerzhaft.', mediumTerm: 'Die Gemeinde versteht eher, warum welche Lasten getragen werden.', score: 93, xp: 30, stats: { empathy: 5, rights: 5, participation: 4, courage: 6 }, tags: ['official', 'rights', 'community'] },
      { id: 'symbol', label: 'Nur kleinere, symbolische Einsparungen verteilen', summary: 'Du vermeidest Konflikt, loest aber das Kernproblem nicht.', immediate: 'Heute bleibt die Stimmung etwas ruhiger.', mediumTerm: 'Spaeter muessen unter schlechteren Bedingungen haertere Schnitte folgen.', score: 45, xp: 6, stats: { empathy: 1, rights: 1, participation: 0, courage: -1 }, tags: [] },
      { id: 'laut', label: 'Den lautesten Gruppen nachgeben', summary: 'Du priorisierst politische Lautstaerke statt nachvollziehbare Kriterien.', immediate: 'Einige Akteure sind zufrieden.', mediumTerm: 'Die leiseren Gruppen verlieren Vertrauen in Fairness.', score: 31, xp: 1, stats: { empathy: -2, rights: -1, participation: -2, courage: 0 }, tags: ['mobilize'] },
    ],
  },
].map(withWorldMeta);

const SCENARIO_SYSTEMS = {
  1: {
    hiddenVariables: ['Schulwegsicherheit ist emotional sichtbarer als Parkplatzlogik.', 'Handel und Eltern sprechen mit ungleicher Lautstaerke, nicht mit gleichem Risiko.'],
    reflectionPrompts: ['Welche Gruppe traegt das Alltagsrisiko, obwohl sie politisch nicht am lautesten ist?', 'Welche Kriterien muessen offenliegen, damit Tempo nicht als Willkuer erlebt wird?'],
    teacherHooks: ['Interessenmatrix zu Lautstaerke versus Verletzlichkeit', 'Debatte ueber faire Kriterien statt reine Positionsabfrage'],
  },
  2: {
    hiddenVariables: ['Jugendliche tragen die Folgen, haben aber oft die schwaechste institutionelle Stimme.', 'Laermdebatten verbergen oft Unsicherheit ueber Kontrolle und Vertrauen.'],
    reflectionPrompts: ['Wie veraendert echte Mitgestaltung die Legitimität eines Ortes?', 'Wann wird Jugendarbeit als Sicherheitsfrage verkleidet?'],
    teacherHooks: ['Perspektivwechsel Jugend versus Nachbarschaft', 'Regeln als gemeinsam verhandelte Schutzstruktur diskutieren'],
  },
  3: {
    hiddenVariables: ['Baustellenkommunikation entscheidet mit ueber Akzeptanz, nicht nur der Bauplan.', 'Kleine Geschaefte sind zeitlich verletzlicher als grosse Institutionen.'],
    reflectionPrompts: ['Welche Belastung ist technisch unvermeidbar und welche kommunikativ verursacht?', 'Wie wird Verwaltung fair, wenn nicht alle die gleiche Reserve haben?'],
    teacherHooks: ['Belastungskarte fuer verschiedene Gruppen erstellen', 'Transparenz als Infrastruktur, nicht nur als PR besprechen'],
  },
  4: {
    hiddenVariables: ['Unsicherheit in der Nachbarschaft ist real, aber nicht automatisch legitimierende Angstpolitik.', 'Die ersten Tage entscheiden ueber die Tonlage fuer Wochen.'],
    reflectionPrompts: ['Wie verbindet man Schutzpflicht und lokale Verunsicherung ohne Entmenschlichung?', 'Welche Sprache schuetzt Betroffene und entzieht Ressentiments gleichzeitig die Buehne?'],
    teacherHooks: ['Kommunikationsvergleich Schutzsprache versus Sicherheitsnarrativ', 'Menschenwuerde und Ordnung nicht als Gegensaetze behandeln'],
  },
  5: {
    hiddenVariables: ['Transformationskosten sind ungleich verteilt, auch wenn das Klimaziel gemeinsam ist.', 'Langfristige Vorteile verlieren gegen kurzfristig sichtbare Verluste.'],
    reflectionPrompts: ['Welche Last muss die Gemeinde sichtbar ausgleichen, damit Wandel fair wirkt?', 'Wann kippt fachliche Richtigkeit in demokratische Arroganz?'],
    teacherHooks: ['Kosten-Nutzen-Matrix mit Verteilungsgerechtigkeit', 'Zukunftsverantwortung gegen lokale Betroffenheit abwaegen'],
  },
  6: {
    hiddenVariables: ['Naehe ist ein demokratischer Wert, nicht nur ein romantischer Reflex.', 'Effizienzgewinne ohne Garantien werden schnell als Entmachtung erlebt.'],
    reflectionPrompts: ['Wann ist Reform ein Gewinn und wann ein Machtverlust fuer Buerger:innen?', 'Welche Garantien machen Strukturwandel legitim?'],
    teacherHooks: ['Servicequalitaet gegen lokale Identitaet abgleichen', 'Review-Klauseln als demokratisches Sicherheitsnetz diskutieren'],
  },
  7: {
    hiddenVariables: ['Desinformation wirkt ueber Wiederholung und Stimmung, nicht nur ueber Faktenfehler.', 'Gegenkampagnen stabilisieren oft die gleiche Eskalationslogik.'],
    reflectionPrompts: ['Was braucht eine faire Wahlauseinandersetzung ausser Fakten?', 'Wann wird Mobilisierung zur Erosion demokratischer Streitkultur?'],
    teacherHooks: ['Debattenregeln fuer harte, aber faire Kampagnen ableiten', 'Quellenraum als lokale Institution denken'],
  },
  8: {
    hiddenVariables: ['Institutionenvertrauen sinkt nicht nur durch Fehlverhalten, sondern auch durch verdeckte Aufklaerung.', 'Einzelfall-Erzaehlungen koennen systemische Muster unsichtbar machen.'],
    reflectionPrompts: ['Welche Form der Offenlegung schuetzt Institutionen wirklich?', 'Warum reicht Schuldzuweisung ohne Systemlernen nicht aus?'],
    teacherHooks: ['Aufklaerungsschritte nach Vertrauenswirkung sortieren', 'Systemfehler versus Einzelversagen vergleichen'],
  },
  9: {
    hiddenVariables: ['Mehrheitswillen ernst nehmen heisst nicht, ihn ungeprueft umzusetzen.', 'Formale Korrektheit ohne Erklaerung produziert demokratischen Frust.'],
    reflectionPrompts: ['Wie erklaert man Grundrechte, ohne Beteiligung abzuwerten?', 'Welche Form von Dialog verhindert, dass Rechtsstaat als Blockade erscheint?'],
    teacherHooks: ['Mehrheit, Minderheit und Grundrechte im Dreieck besprechen', 'Fallunterscheidung Beteiligungssignal versus verfassungsrechtliche Grenze'],
  },
  10: {
    hiddenVariables: ['Symbolische Gleichbehandlung kann reale Ungerechtigkeit verstaerken.', 'Kurzfristige Entlastung kann spaetere Haerte massiv vergroessern.'],
    reflectionPrompts: ['Welche Kriterien machen harte Verteilung transparent und fair?', 'Welche Gruppen zahlen spaeter den Preis fuer heutiges Konfliktvermeiden?'],
    teacherHooks: ['Schutzbedarf gegen Lautstaerke priorisieren', 'Langzeitwirkung als demokratisches Entscheidungskriterium behandeln'],
  },
};

export const LEVELS = GEMEINDE_LEVELS;

function getScenarioSystem(levelId) {
  return SCENARIO_SYSTEMS[levelId] ?? {
    hiddenVariables: ['Konflikte enthalten meist Machtunterschiede, die nicht sofort sichtbar sind.'],
    reflectionPrompts: ['Welche Perspektive wurde zu spaet ernst genommen?'],
    teacherHooks: ['Diskussion ueber faire Kriterien und betroffene Gruppen'],
  };
}

function getChoiceImpactPreview(choice, role) {
  const delta = buildConsequenceSeeds(choice, role, false);
  const dominant = getDominantShift(delta);
  const direction = dominant.delta > 0 ? 'steigt' : dominant.delta < 0 ? 'sinkt' : 'bleibt stabil';
  return `${dominant.label} ${direction}`;
}

function getTrackDirectionLabel(trackKey, delta) {
  if (!delta) {
    return 'bleibt stabil';
  }

  const positive = delta > 0;
  const highIsGood = !['socialTension', 'futureLoad'].includes(trackKey);

  if (highIsGood) {
    return positive ? 'verbessert sich' : 'geraet unter Druck';
  }

  return positive ? 'steigt an' : 'sinkt';
}

function buildScenarioStakes(level, role, worldState) {
  const dominantTrack = getDominantShift(worldState);
  return [
    `Lokaler Druck: ${level.stakeholders.join(', ')}`,
    `Verdeckte Variable: ${getScenarioSystem(level.id).hiddenVariables[0]}`,
    `Weltzustand: ${WORLD_TRACK_LABELS[dominantTrack.key]} ist derzeit ${getWorldTrackTone(dominantTrack.key, worldState[dominantTrack.key])}.`,
    `Rollenrisiko: Achte darauf, dass ${role.riskPrompt}.`,
  ];
}

function buildLayeredConsequences(scenario, choice, role, worldDelta, worldAfter) {
  return [
    {
      title: 'Kurzfristig',
      body: choice.immediate,
      tone: 'neutral',
    },
    {
      title: 'Mittelfristig',
      body: choice.mediumTerm,
      tone: 'neutral',
    },
    {
      title: 'Reputativ',
      body: `${WORLD_TRACK_LABELS.trust} ${getTrackDirectionLabel('trust', worldDelta.trust)}; neuer Stand ${worldAfter.trust}/100.`,
      tone: worldDelta.trust >= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Institutionell',
      body: `${WORLD_TRACK_LABELS.ruleOfLaw} ${getTrackDirectionLabel('ruleOfLaw', worldDelta.ruleOfLaw)}; Verfahren und Legitimität werden ${worldDelta.ruleOfLaw >= 0 ? 'gestaerkt' : 'angespannt'}.`,
      tone: worldDelta.ruleOfLaw >= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Gesellschaftlich',
      body: `${WORLD_TRACK_LABELS.participation} ${getTrackDirectionLabel('participation', worldDelta.participation)}, waehrend ${WORLD_TRACK_LABELS.socialTension} ${getTrackDirectionLabel('socialTension', worldDelta.socialTension)}.`,
      tone: worldDelta.socialTension <= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Zukunft',
      body: `${WORLD_TRACK_LABELS.futureLoad} ${getTrackDirectionLabel('futureLoad', worldDelta.futureLoad)}; offene Folgekosten liegen nun bei ${worldAfter.futureLoad}/100.`,
      tone: worldDelta.futureLoad <= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Didaktische Reflexion',
      body: `${role.reflectionLens} ${getScenarioSystem(scenario.id).reflectionPrompts[0]}`,
      tone: 'neutral',
    },
  ];
}

export function getDefaultState() {
  return {
    version: 3,
    campaign: {
      selectedRole: ROLES[0].id,
      currentWorldId: 1,
      currentLevelId: 1,
      completedLevels: {},
    },
    profile: {
      xp: 0,
      playerLevel: 1,
      stats: {
        empathy: 0,
        rights: 0,
        participation: 0,
        courage: 0,
      },
      achievements: [],
    },
    worldState: createDefaultWorldState(WORLDS),
    settings: {
      reducedMotion: false,
      lowGraphics: false,
      analyticsConsent: false,
      localSave: true,
    },
    telemetry: {
      sessionId: `session-${Date.now()}`,
      sessionStartedAt: new Date().toISOString(),
      events: [],
    },
    teacher: {
      exports: [],
      sessionLog: [],
    },
    meta: {
      createdAt: new Date().toISOString(),
      lastPlayedAt: null,
      migratedFromLegacy: false,
    },
  };
}

export function getRoleById(roleId) {
  return ROLES.find((role) => role.id === roleId) ?? ROLES[0];
}

export function getWorldById(worldId) {
  return WORLDS.find((world) => world.id === worldId) ?? WORLDS[0];
}

export function getLevelById(levelId) {
  return LEVELS.find((level) => level.id === levelId) ?? null;
}

export function getLevelsForWorld(worldId) {
  return LEVELS.filter((level) => level.worldId === worldId);
}

export function isWorldPlayable(worldId) {
  return getWorldById(worldId).status === 'playable';
}

export function getCompletedPlayableLevelCount(state) {
  return Object.keys(state?.campaign?.completedLevels ?? {}).length;
}

export function getNextPlayableLevelId(state) {
  return clamp(getCompletedPlayableLevelCount(state) + 1, 1, PLAYABLE_LEVEL_COUNT);
}

export function isLevelUnlocked(state, levelId) {
  return levelId <= getNextPlayableLevelId(state);
}

export function getWorldProgress(state, worldId) {
  const levels = getLevelsForWorld(worldId);
  const completed = levels.filter((level) => state.campaign.completedLevels[String(level.id)]).length;
  return {
    total: levels.length,
    completed,
    isPlayable: isWorldPlayable(worldId),
    release: getWorldById(worldId).release,
  };
}

export function getCampaignStats(state) {
  return {
    completedPlayableLevels: getCompletedPlayableLevelCount(state),
    totalPlayableLevels: PLAYABLE_LEVEL_COUNT,
    totalRoadmapLevels: ROADMAP_LEVEL_COUNT - PLAYABLE_LEVEL_COUNT,
    nextPlayableLevelId: getNextPlayableLevelId(state),
  };
}

export function getPlayerLevelFromXp(xp) {
  return Math.max(1, 1 + Math.floor((xp ?? 0) / 140));
}

export function getWorldStateSnapshot(state, worldId) {
  return getWorldStateForWorld(state, worldId);
}

export function getWorldStateViewModel(state, worldId, delta = {}) {
  return getWorldStateCards(getWorldStateSnapshot(state, worldId), delta);
}

export function getScenarioDefinition(levelId, roleId, state = null) {
  const level = getLevelById(levelId);
  const role = getRoleById(roleId);
  if (!level) {
    return null;
  }

  const worldState = state ? getWorldStateSnapshot(state, level.worldId) : createWorldStateSnapshot();
  const system = getScenarioSystem(level.id);

  return {
    ...level,
    role,
    hiddenVariables: system.hiddenVariables,
    reflectionPrompts: system.reflectionPrompts,
    teacherHooks: system.teacherHooks,
    roleToolkit: [
      role.intelActions[0],
      role.intelActions[1],
      `Druckspur: ${role.pressureTrack}`,
      `Fehlermodus: ${role.failureMode}`,
    ],
    worldState,
    subtitle: `${level.worldIcon} ${level.worldName} · Level ${level.id} von ${ROADMAP_LEVEL_COUNT}`,
    intel: `${role.intelLead} In ${level.district} faellt besonders auf: ${level.summary}`,
    stakes: buildScenarioStakes(level, role, worldState),
    choices: level.choices.map((choice) => ({
      ...choice,
      impactPreview: getChoiceImpactPreview(choice, role),
      consequenceSeeds: buildConsequenceSeeds(choice, role, false),
    })),
  };
}

function getOutcomeBand(score) {
  if (score >= 88) {
    return 'stark';
  }
  if (score >= 68) {
    return 'tragfaehig';
  }
  return 'kritisch';
}

export function resolveScenarioOutcome(state, levelId, roleId, choiceId, useRoleAction = false) {
  const scenario = getScenarioDefinition(levelId, roleId, state);
  if (!scenario) {
    return null;
  }

  const role = scenario.role;
  const choice = scenario.choices.find((entry) => entry.id === choiceId) ?? scenario.choices[0];
  const synergyBonus = choice.tags.includes(role.synergyTag) ? 4 : 0;
  const score = clamp(choice.score + synergyBonus + (useRoleAction ? role.signatureAction.scoreBonus : 0), 0, 100);
  const xpAwarded = choice.xp + (useRoleAction ? role.signatureAction.xpBonus : 0) + (choice.tags.includes(role.synergyTag) ? 2 : 0);
  const stats = {
    empathy: 0,
    rights: 0,
    participation: 0,
    courage: 0,
    ...choice.stats,
  };
  if (useRoleAction) {
    stats[role.focusStat] += role.signatureAction.statBonus;
  }

  const worldStateBefore = getWorldStateSnapshot(state, scenario.worldId);
  const worldDelta = buildConsequenceSeeds(choice, role, useRoleAction);
  const worldStateAfter = applyWorldDelta(worldStateBefore, worldDelta);
  const band = getOutcomeBand(score);
  const dominantShift = getDominantShift(worldDelta);
  const layeredConsequences = buildLayeredConsequences(scenario, choice, role, worldDelta, worldStateAfter);

  return {
    levelId: scenario.id,
    worldId: scenario.worldId,
    choiceId: choice.id,
    usedRoleAction: useRoleAction,
    score,
    xpAwarded,
    stats,
    band,
    worldStateBefore,
    worldStateAfter,
    worldDelta,
    dominantShift,
    layeredConsequences,
    reflectionPrompts: scenario.reflectionPrompts,
    resultTitle:
      band === 'stark'
        ? 'Starke demokratische Entscheidung'
        : band === 'tragfaehig'
          ? 'Tragfaehige, aber nicht perfekte Loesung'
          : 'Kritische Entscheidung mit Folgekosten',
    resultSummary: `${choice.summary} ${choice.mediumTerm}`,
    debrief: layeredConsequences.map((entry) => `${entry.title}: ${entry.body}`),
    teacherSummary: {
      world: scenario.worldName,
      level: scenario.title,
      role: role.name,
      choice: choice.label,
      band,
      reflection: role.reflectionLens,
      learningFocus: scenario.learningFocus,
      dominantShift: `${dominantShift.label} (${dominantShift.delta > 0 ? '+' : ''}${dominantShift.delta})`,
      prompts: [scenario.teacherPrompt, ...scenario.reflectionPrompts],
      teacherHooks: scenario.teacherHooks,
      worldStateBefore,
      worldStateAfter,
      worldDelta,
    },
    signatureSummary: useRoleAction ? role.signatureAction.summary : 'Keine Rollenaktion aktiviert.',
    sessionRecord: {
      world: scenario.worldName,
      levelId: scenario.id,
      level: scenario.title,
      roleId: role.id,
      role: role.name,
      choiceId: choice.id,
      choice: choice.label,
      band,
      score,
      xpAwarded,
      dominantShift,
      worldDelta,
      reflectionPrompts: scenario.reflectionPrompts,
      usedRoleAction: useRoleAction,
      timestamp: new Date().toISOString(),
    },
  };
}

export function getTeacherSessionSummary(state) {
  const sessionLog = state?.teacher?.sessionLog ?? [];
  const latest = sessionLog.at(-1) ?? null;

  return {
    totalEntries: sessionLog.length,
    latest,
    recentEntries: [...sessionLog].slice(-5).reverse(),
  };
}

export { WORLD_TRACK_KEYS, WORLD_TRACK_LABELS };
