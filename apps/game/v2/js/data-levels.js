/**
 * BRÜCKEN BAUEN 3D – Level-Daten (100 Level, 10 Welten)
 * Jede Welt hat 10 Level mit steigender Komplexität
 */
'use strict';

const LEVELS_DATA = (() => {
  // Welt-Definitionen
  const WORLDS = [
    {
      id: 1, name: 'Gemeinde', icon: '🏘️', color: '#3b82f6',
      desc: 'Lokale Demokratie und Bürgerbeteiligung',
      bg: 'linear-gradient(135deg, #0d1b2a, #1e3a5f)',
      environment: 'village',
    },
    {
      id: 2, name: 'Schule', icon: '🏫', color: '#10b981',
      desc: 'Bildung, Inklusion und Chancengerechtigkeit',
      bg: 'linear-gradient(135deg, #0d2a1e, #1e5f3a)',
      environment: 'school',
    },
    {
      id: 3, name: 'Arbeit', icon: '🏭', color: '#f59e0b',
      desc: 'Arbeitnehmerrechte und soziale Gerechtigkeit',
      bg: 'linear-gradient(135deg, #2a1e0d, #5f3a1e)',
      environment: 'workplace',
    },
    {
      id: 4, name: 'Medien', icon: '📡', color: '#8b5cf6',
      desc: 'Pressefreiheit, Fake News und Medienkompetenz',
      bg: 'linear-gradient(135deg, #1a0d2a, #3a1e5f)',
      environment: 'media',
    },
    {
      id: 5, name: 'Umwelt', icon: '🌍', color: '#06b6d4',
      desc: 'Klimaschutz, Nachhaltigkeit und Generationengerechtigkeit',
      bg: 'linear-gradient(135deg, #0d2a2a, #1e5f5f)',
      environment: 'nature',
    },
    {
      id: 6, name: 'Digital', icon: '💻', color: '#ec4899',
      desc: 'Datenschutz, KI-Ethik und digitale Teilhabe',
      bg: 'linear-gradient(135deg, #2a0d1e, #5f1e3a)',
      environment: 'digital',
    },
    {
      id: 7, name: 'Gesundheit', icon: '🏥', color: '#14b8a6',
      desc: 'Gesundheitsversorgung, Pandemie und Bioethik',
      bg: 'linear-gradient(135deg, #0d2a26, #1e5f56)',
      environment: 'hospital',
    },
    {
      id: 8, name: 'Europa', icon: '🇪🇺', color: '#6366f1',
      desc: 'Europäische Integration und internationale Solidarität',
      bg: 'linear-gradient(135deg, #0d0f2a, #1e225f)',
      environment: 'europe',
    },
    {
      id: 9, name: 'Gerechtigkeit', icon: '⚖️', color: '#ef4444',
      desc: 'Rechtsstaat, Minderheitenschutz und Gleichberechtigung',
      bg: 'linear-gradient(135deg, #2a0d0d, #5f1e1e)',
      environment: 'courthouse',
    },
    {
      id: 10, name: 'Zukunft', icon: '🚀', color: '#f97316',
      desc: 'Innovation, Demokratie der Zukunft und globale Herausforderungen',
      bg: 'linear-gradient(135deg, #2a1a0d, #5f3a1e)',
      environment: 'future',
    },
  ];

  // Level-Templates pro Welt
  const levelTemplates = {
    1: [ // Gemeinde
      { title: 'Der Parkplatz-Streit', difficulty: 1, timeLimit: 90, scenario: 'gemeinde_parkplatz' },
      { title: 'Neues Jugendzentrum', difficulty: 1, timeLimit: 100, scenario: 'gemeinde_jugendzentrum' },
      { title: 'Straßensanierung', difficulty: 2, timeLimit: 100, scenario: 'gemeinde_strasse' },
      { title: 'Flüchtlingsunterkunft', difficulty: 2, timeLimit: 110, scenario: 'gemeinde_fluechtlinge' },
      { title: 'Bürgerinitiative Windrad', difficulty: 2, timeLimit: 110, scenario: 'gemeinde_windrad' },
      { title: 'Gemeindefusion', difficulty: 3, timeLimit: 120, scenario: 'gemeinde_fusion' },
      { title: 'Bürgermeisterwahl', difficulty: 3, timeLimit: 120, scenario: 'gemeinde_wahl' },
      { title: 'Korruption im Gemeinderat', difficulty: 3, timeLimit: 130, scenario: 'gemeinde_korruption' },
      { title: 'Volksbegehren', difficulty: 4, timeLimit: 130, scenario: 'gemeinde_volksbegehren' },
      { title: 'Gemeindebudget-Krise', difficulty: 4, timeLimit: 140, scenario: 'gemeinde_budget' },
    ],
    2: [ // Schule
      { title: 'Mobbing in der Klasse', difficulty: 1, timeLimit: 90, scenario: 'schule_mobbing' },
      { title: 'Inklusiver Unterricht', difficulty: 2, timeLimit: 100, scenario: 'schule_inklusion' },
      { title: 'Lehrerstreik', difficulty: 2, timeLimit: 100, scenario: 'schule_streik' },
      { title: 'Religionsunterricht', difficulty: 2, timeLimit: 110, scenario: 'schule_religion' },
      { title: 'Schulbudget-Kürzungen', difficulty: 3, timeLimit: 110, scenario: 'schule_budget' },
      { title: 'Smartphone-Verbot', difficulty: 3, timeLimit: 120, scenario: 'schule_smartphone' },
      { title: 'Schulschließung', difficulty: 3, timeLimit: 120, scenario: 'schule_schliessung' },
      { title: 'Bildungsreform', difficulty: 4, timeLimit: 130, scenario: 'schule_reform' },
      { title: 'Diskriminierung', difficulty: 4, timeLimit: 130, scenario: 'schule_diskriminierung' },
      { title: 'Schülerstreik für Klimaschutz', difficulty: 4, timeLimit: 140, scenario: 'schule_klimastreik' },
    ],
    3: [ // Arbeit
      { title: 'Überstunden-Konflikt', difficulty: 2, timeLimit: 100, scenario: 'arbeit_ueberstunden' },
      { title: 'Betriebsrat-Wahl', difficulty: 2, timeLimit: 100, scenario: 'arbeit_betriebsrat' },
      { title: 'Fabrikschließung', difficulty: 3, timeLimit: 110, scenario: 'arbeit_fabrik' },
      { title: 'Lohnungleichheit', difficulty: 3, timeLimit: 110, scenario: 'arbeit_lohn' },
      { title: 'Whistleblower', difficulty: 3, timeLimit: 120, scenario: 'arbeit_whistleblower' },
      { title: 'Homeoffice-Streit', difficulty: 3, timeLimit: 120, scenario: 'arbeit_homeoffice' },
      { title: 'Automatisierung', difficulty: 4, timeLimit: 130, scenario: 'arbeit_automatisierung' },
      { title: 'Streikrecht', difficulty: 4, timeLimit: 130, scenario: 'arbeit_streikrecht' },
      { title: 'Mindestlohn', difficulty: 4, timeLimit: 140, scenario: 'arbeit_mindestlohn' },
      { title: 'Gewerkschaftsverbot', difficulty: 5, timeLimit: 150, scenario: 'arbeit_gewerkschaft' },
    ],
    4: [ // Medien
      { title: 'Fake News erkennen', difficulty: 2, timeLimit: 100, scenario: 'medien_fakenews' },
      { title: 'Redaktionskonflikt', difficulty: 2, timeLimit: 100, scenario: 'medien_redaktion' },
      { title: 'Pressefreiheit', difficulty: 3, timeLimit: 110, scenario: 'medien_pressefreiheit' },
      { title: 'Social-Media-Shitstorm', difficulty: 3, timeLimit: 110, scenario: 'medien_shitstorm' },
      { title: 'Medienkonzentration', difficulty: 3, timeLimit: 120, scenario: 'medien_konzentration' },
      { title: 'Quellenschutz', difficulty: 4, timeLimit: 120, scenario: 'medien_quellenschutz' },
      { title: 'Desinformationskampagne', difficulty: 4, timeLimit: 130, scenario: 'medien_desinformation' },
      { title: 'Staatliche Medien', difficulty: 4, timeLimit: 130, scenario: 'medien_staatlich' },
      { title: 'Algorithmus-Bias', difficulty: 5, timeLimit: 140, scenario: 'medien_algorithmus' },
      { title: 'Zensur vs. Meinungsfreiheit', difficulty: 5, timeLimit: 150, scenario: 'medien_zensur' },
    ],
    5: [ // Umwelt
      { title: 'Plastikverbot', difficulty: 2, timeLimit: 100, scenario: 'umwelt_plastik' },
      { title: 'Windpark-Planung', difficulty: 2, timeLimit: 100, scenario: 'umwelt_windpark' },
      { title: 'Hochwasserschutz', difficulty: 3, timeLimit: 110, scenario: 'umwelt_hochwasser' },
      { title: 'Pestizide in der Landwirtschaft', difficulty: 3, timeLimit: 110, scenario: 'umwelt_pestizide' },
      { title: 'CO2-Steuer', difficulty: 3, timeLimit: 120, scenario: 'umwelt_co2steuer' },
      { title: 'Atomkraft-Debatte', difficulty: 4, timeLimit: 120, scenario: 'umwelt_atom' },
      { title: 'Klimaflüchtlinge', difficulty: 4, timeLimit: 130, scenario: 'umwelt_klimafluechtlinge' },
      { title: 'Artenschutz vs. Wirtschaft', difficulty: 4, timeLimit: 130, scenario: 'umwelt_artenschutz' },
      { title: 'Klimanotstand', difficulty: 5, timeLimit: 140, scenario: 'umwelt_klimanotstand' },
      { title: 'Generationenvertrag', difficulty: 5, timeLimit: 150, scenario: 'umwelt_generationen' },
    ],
    6: [ // Digital
      { title: 'Datenschutz vs. Sicherheit', difficulty: 3, timeLimit: 110, scenario: 'digital_datenschutz' },
      { title: 'KI in der Schule', difficulty: 3, timeLimit: 110, scenario: 'digital_ki_schule' },
      { title: 'Überwachungskamera', difficulty: 3, timeLimit: 120, scenario: 'digital_kamera' },
      { title: 'Digitale Kluft', difficulty: 3, timeLimit: 120, scenario: 'digital_kluft' },
      { title: 'Deepfakes', difficulty: 4, timeLimit: 130, scenario: 'digital_deepfake' },
      { title: 'Plattform-Monopole', difficulty: 4, timeLimit: 130, scenario: 'digital_monopol' },
      { title: 'KI-Entscheidungen', difficulty: 4, timeLimit: 140, scenario: 'digital_ki_entscheidung' },
      { title: 'Digitale Identität', difficulty: 5, timeLimit: 140, scenario: 'digital_identitaet' },
      { title: 'Cyberangriff', difficulty: 5, timeLimit: 150, scenario: 'digital_cyberangriff' },
      { title: 'Digitale Demokratie', difficulty: 5, timeLimit: 150, scenario: 'digital_demokratie' },
    ],
    7: [ // Gesundheit
      { title: 'Impfpflicht', difficulty: 3, timeLimit: 110, scenario: 'gesundheit_impfung' },
      { title: 'Krankenhaus-Schließung', difficulty: 3, timeLimit: 110, scenario: 'gesundheit_krankenhaus' },
      { title: 'Pflegenotstand', difficulty: 3, timeLimit: 120, scenario: 'gesundheit_pflege' },
      { title: 'Medikamenten-Knappheit', difficulty: 4, timeLimit: 120, scenario: 'gesundheit_medikamente' },
      { title: 'Sterbehilfe', difficulty: 4, timeLimit: 130, scenario: 'gesundheit_sterbehilfe' },
      { title: 'Pandemie-Maßnahmen', difficulty: 4, timeLimit: 130, scenario: 'gesundheit_pandemie' },
      { title: 'Zwei-Klassen-Medizin', difficulty: 4, timeLimit: 140, scenario: 'gesundheit_klassen' },
      { title: 'Gentherapie', difficulty: 5, timeLimit: 140, scenario: 'gesundheit_gentherapie' },
      { title: 'Bioethik-Kommission', difficulty: 5, timeLimit: 150, scenario: 'gesundheit_bioethik' },
      { title: 'Globale Gesundheit', difficulty: 5, timeLimit: 150, scenario: 'gesundheit_global' },
    ],
    8: [ // Europa
      { title: 'EU-Beitritt', difficulty: 3, timeLimit: 110, scenario: 'europa_beitritt' },
      { title: 'Flüchtlingsverteilung', difficulty: 3, timeLimit: 110, scenario: 'europa_fluechtlinge' },
      { title: 'Euro-Krise', difficulty: 4, timeLimit: 120, scenario: 'europa_euro' },
      { title: 'Schengen-Abkommen', difficulty: 4, timeLimit: 120, scenario: 'europa_schengen' },
      { title: 'EU-Sanktionen', difficulty: 4, timeLimit: 130, scenario: 'europa_sanktionen' },
      { title: 'Rechtsstaatlichkeit', difficulty: 4, timeLimit: 130, scenario: 'europa_rechtsstaat' },
      { title: 'Europäische Armee', difficulty: 5, timeLimit: 140, scenario: 'europa_armee' },
      { title: 'Brexit-Folgen', difficulty: 5, timeLimit: 140, scenario: 'europa_brexit' },
      { title: 'EU-Demokratiedefizit', difficulty: 5, timeLimit: 150, scenario: 'europa_demokratie' },
      { title: 'Europas Zukunft', difficulty: 5, timeLimit: 150, scenario: 'europa_zukunft' },
    ],
    9: [ // Gerechtigkeit
      { title: 'Ungleiche Strafe', difficulty: 3, timeLimit: 110, scenario: 'recht_strafe' },
      { title: 'Minderheitenschutz', difficulty: 3, timeLimit: 110, scenario: 'recht_minderheit' },
      { title: 'Meinungsfreiheit', difficulty: 4, timeLimit: 120, scenario: 'recht_meinung' },
      { title: 'Asylrecht', difficulty: 4, timeLimit: 120, scenario: 'recht_asyl' },
      { title: 'Gleichberechtigung', difficulty: 4, timeLimit: 130, scenario: 'recht_gleichberechtigung' },
      { title: 'Richterliche Unabhängigkeit', difficulty: 4, timeLimit: 130, scenario: 'recht_unabhaengigkeit' },
      { title: 'Todesstrafe', difficulty: 5, timeLimit: 140, scenario: 'recht_todesstrafe' },
      { title: 'Verfassungsänderung', difficulty: 5, timeLimit: 140, scenario: 'recht_verfassung' },
      { title: 'Internationaler Strafgerichtshof', difficulty: 5, timeLimit: 150, scenario: 'recht_strafgerichtshof' },
      { title: 'Grundrechte in der Krise', difficulty: 5, timeLimit: 150, scenario: 'recht_grundrechte' },
    ],
    10: [ // Zukunft
      { title: 'Universelles Grundeinkommen', difficulty: 4, timeLimit: 120, scenario: 'zukunft_grundeinkommen' },
      { title: 'Transhumanismus', difficulty: 4, timeLimit: 120, scenario: 'zukunft_transhumanismus' },
      { title: 'Demokratie 2.0', difficulty: 4, timeLimit: 130, scenario: 'zukunft_demokratie2' },
      { title: 'KI-Regierung', difficulty: 5, timeLimit: 130, scenario: 'zukunft_ki_regierung' },
      { title: 'Weltraumrecht', difficulty: 5, timeLimit: 140, scenario: 'zukunft_weltraum' },
      { title: 'Globale Verfassung', difficulty: 5, timeLimit: 140, scenario: 'zukunft_verfassung' },
      { title: 'Posthumane Rechte', difficulty: 5, timeLimit: 150, scenario: 'zukunft_posthuman' },
      { title: 'Klimadiktatur', difficulty: 5, timeLimit: 150, scenario: 'zukunft_klimadiktatur' },
      { title: 'Demokratie vs. Effizienz', difficulty: 5, timeLimit: 160, scenario: 'zukunft_effizienz' },
      { title: 'Das letzte Kapitel', difficulty: 5, timeLimit: 180, scenario: 'zukunft_final' },
    ],
  };

  // Alle 100 Level generieren
  const levels = [];
  for (let worldId = 1; worldId <= 10; worldId++) {
    const world = WORLDS[worldId - 1];
    const templates = levelTemplates[worldId];
    for (let i = 0; i < 10; i++) {
      const levelNum = (worldId - 1) * 10 + i + 1;
      const tpl = templates[i];
      levels.push({
        id: levelNum,
        worldId,
        worldName: world.name,
        worldIcon: world.icon,
        worldColor: world.color,
        worldBg: world.bg,
        environment: world.environment,
        title: tpl.title,
        difficulty: tpl.difficulty,
        timeLimit: tpl.timeLimit,
        scenario: tpl.scenario,
        stars: 0,           // 0–3, wird beim Spielen gesetzt
        completed: false,
        bestScore: 0,
        xpReward: Math.floor(CONFIG.XP_BASE * tpl.difficulty * (1 + levelNum * 0.02)),
        unlocked: levelNum === 1,
      });
    }
  }

  return { levels, worlds: WORLDS };
})();
