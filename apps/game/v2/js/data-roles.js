/**
 * BRÜCKEN BAUEN 3D – Rollendaten
 * Alle 6 spielbaren Rollen mit Eigenschaften, Boni und Hintergrundgeschichten
 */
'use strict';

const ROLES_DATA = [
  {
    id: 'buerger',
    name: 'Engagierte Bürgerin',
    icon: '👩‍💼',
    color: '#3b82f6',
    shortDesc: 'Die Stimme der Gemeinschaft',
    description: 'Als engagierte Bürgerin bringst du die Perspektive der Zivilgesellschaft ein. Du kennst die alltäglichen Sorgen der Menschen und kannst Brücken zwischen verschiedenen Gruppen bauen.',
    background: 'Maria, 38, arbeitet als Lehrerin und ist Mutter von zwei Kindern. Sie engagiert sich im Gemeinderat und organisiert lokale Bürgerinitiativen.',
    stats: {
      empathie: 90,
      einfluss: 50,
      ressourcen: 40,
      wissen: 60,
      netzwerk: 70,
    },
    bonuses: [
      { type: 'score', label: '+20% bei Konsens-Entscheidungen', value: 0.2, trigger: 'consensus' },
      { type: 'xp', label: '+15% XP bei Community-Aktionen', value: 0.15, trigger: 'community' },
    ],
    unlockLevel: 1,
    specialAbility: {
      name: 'Bürgerversammlung',
      desc: 'Rufe eine Bürgerversammlung ein – alle Parteien müssen zuhören.',
      cooldown: 3, // Level
    },
    voiceLines: [
      'Wir müssen zusammenarbeiten, nicht gegeneinander!',
      'Die Menschen in unserer Gemeinde verdienen bessere Antworten.',
      'Demokratie beginnt im Kleinen – hier, bei uns.',
    ],
  },
  {
    id: 'politiker',
    name: 'Lokalpolitiker',
    icon: '🏛️',
    color: '#8b5cf6',
    shortDesc: 'Macht und Verantwortung',
    description: 'Als Lokalpolitiker trägst du Verantwortung für deine Gemeinde. Du musst zwischen verschiedenen Interessen abwägen und trotzdem das Gemeinwohl im Blick behalten.',
    background: 'Thomas, 52, ist seit 15 Jahren Bürgermeister einer mittelgroßen Stadt. Er kennt die politischen Spielregeln, aber auch die Grenzen seiner Macht.',
    stats: {
      empathie: 55,
      einfluss: 90,
      ressourcen: 75,
      wissen: 70,
      netzwerk: 85,
    },
    bonuses: [
      { type: 'score', label: '+25% bei Mehrheitsentscheidungen', value: 0.25, trigger: 'majority' },
      { type: 'score', label: '+10% bei offiziellen Beschlüssen', value: 0.10, trigger: 'official' },
    ],
    unlockLevel: 1,
    specialAbility: {
      name: 'Dringlichkeitssitzung',
      desc: 'Berufe eine Dringlichkeitssitzung ein – Entscheidungen werden sofort umgesetzt.',
      cooldown: 4,
    },
    voiceLines: [
      'Ich trage die Verantwortung für alle Bürgerinnen und Bürger.',
      'Manchmal muss man unbequeme Entscheidungen treffen.',
      'Politik ist die Kunst des Möglichen.',
    ],
  },
  {
    id: 'journalist',
    name: 'Investigativ-Journalistin',
    icon: '📰',
    color: '#f59e0b',
    shortDesc: 'Wahrheit und Transparenz',
    description: 'Als Investigativ-Journalistin ist es deine Aufgabe, die Wahrheit ans Licht zu bringen. Du hast Zugang zu Informationen, die andere nicht haben, und trägst Verantwortung für die öffentliche Meinung.',
    background: 'Sophie, 31, arbeitet für eine regionale Tageszeitung. Sie hat mehrere Korruptionsskandale aufgedeckt und kämpft täglich für Pressefreiheit.',
    stats: {
      empathie: 65,
      einfluss: 75,
      ressourcen: 50,
      wissen: 95,
      netzwerk: 80,
    },
    bonuses: [
      { type: 'score', label: '+30% bei Aufdeckungs-Entscheidungen', value: 0.30, trigger: 'expose' },
      { type: 'xp', label: '+20% XP bei Recherche-Aktionen', value: 0.20, trigger: 'research' },
    ],
    unlockLevel: 1,
    specialAbility: {
      name: 'Exklusivbericht',
      desc: 'Veröffentliche einen Exklusivbericht – die öffentliche Meinung kippt sofort.',
      cooldown: 5,
    },
    voiceLines: [
      'Die Öffentlichkeit hat ein Recht auf die Wahrheit.',
      'Meine Quellen schütze ich mit meinem Leben.',
      'Ein freie Presse ist das Fundament der Demokratie.',
    ],
  },
  {
    id: 'aktivist',
    name: 'Klimaaktivist',
    icon: '🌱',
    color: '#10b981',
    shortDesc: 'Wandel durch Engagement',
    description: 'Als Klimaaktivist kämpfst du für eine bessere Zukunft. Du mobilisierst Menschen, organisierst Proteste und bringst unbequeme Wahrheiten in die öffentliche Debatte.',
    background: 'Lena, 24, studiert Umweltwissenschaften und ist Mitgründerin einer lokalen Klimagruppe. Sie glaubt an zivilen Ungehorsam als letztes Mittel.',
    stats: {
      empathie: 80,
      einfluss: 65,
      ressourcen: 30,
      wissen: 75,
      netzwerk: 90,
    },
    bonuses: [
      { type: 'score', label: '+35% bei Umwelt-Entscheidungen', value: 0.35, trigger: 'environment' },
      { type: 'score', label: '+20% bei Mobilisierungs-Aktionen', value: 0.20, trigger: 'mobilize' },
    ],
    unlockLevel: 1,
    specialAbility: {
      name: 'Massendemonstration',
      desc: 'Organisiere eine Massendemonstration – der politische Druck steigt massiv.',
      cooldown: 4,
    },
    voiceLines: [
      'Die Erde ist nicht unser Erbe, wir haben sie von unseren Kindern geliehen.',
      'Wir haben keine Zeit mehr für halbe Maßnahmen.',
      'Wenn nicht wir, wer? Wenn nicht jetzt, wann?',
    ],
  },
  {
    id: 'beamter',
    name: 'Verwaltungsbeamter',
    icon: '📋',
    color: '#6b7280',
    shortDesc: 'Regeln und Prozesse',
    description: 'Als Verwaltungsbeamter kennst du die Gesetze und Vorschriften in- und auswendig. Du sorgst dafür, dass Entscheidungen rechtmäßig und nachhaltig umgesetzt werden.',
    background: 'Klaus, 47, arbeitet seit 20 Jahren in der Stadtverwaltung. Er kennt jeden Paragrafen und weiß, wie man Dinge "richtig" macht – auch wenn es manchmal länger dauert.',
    stats: {
      empathie: 45,
      einfluss: 60,
      ressourcen: 70,
      wissen: 90,
      netzwerk: 55,
    },
    bonuses: [
      { type: 'score', label: '+40% bei regelkonformen Entscheidungen', value: 0.40, trigger: 'compliant' },
      { type: 'score', label: 'Keine Punktabzüge bei Verfahrensfehlern', value: 1.0, trigger: 'procedural' },
    ],
    unlockLevel: 5,
    specialAbility: {
      name: 'Rechtsgutachten',
      desc: 'Erstelle ein Rechtsgutachten – Entscheidungen werden juristisch abgesichert.',
      cooldown: 3,
    },
    voiceLines: [
      'Das Gesetz ist das Gesetz. Daran führt kein Weg vorbei.',
      'Ich verstehe Ihre Ungeduld, aber wir müssen die Vorschriften einhalten.',
      'Ordnung und Recht sind die Grundlage unserer Gesellschaft.',
    ],
  },
  {
    id: 'richter',
    name: 'Verfassungsrichterin',
    icon: '⚖️',
    color: '#ef4444',
    shortDesc: 'Gerechtigkeit und Unabhängigkeit',
    description: 'Als Verfassungsrichterin bist du die letzte Instanz. Du entscheidest, was rechtens ist – unabhängig von politischem Druck und öffentlicher Meinung.',
    background: 'Dr. Anna, 58, sitzt seit 10 Jahren am Verfassungsgerichtshof. Sie hat wegweisende Urteile gefällt, die das österreichische Rechtssystem geprägt haben.',
    stats: {
      empathie: 60,
      einfluss: 85,
      ressourcen: 65,
      wissen: 100,
      netzwerk: 60,
    },
    bonuses: [
      { type: 'score', label: '+50% bei Grundrechts-Entscheidungen', value: 0.50, trigger: 'rights' },
      { type: 'score', label: '+30% bei Unabhängigkeits-Aktionen', value: 0.30, trigger: 'independent' },
    ],
    unlockLevel: 10,
    specialAbility: {
      name: 'Verfassungsklage',
      desc: 'Erhebe eine Verfassungsklage – alle anderen Prozesse werden gestoppt.',
      cooldown: 6,
    },
    voiceLines: [
      'Gerechtigkeit ist keine Frage der Mehrheit, sondern des Rechts.',
      'Die Verfassung schützt auch die Schwächsten in unserer Gesellschaft.',
      'Ich urteile nach Recht und Gewissen, nicht nach Popularität.',
    ],
  },
];
