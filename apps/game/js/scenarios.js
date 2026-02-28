/* ==========================================================================
   Brücken Bauen - Scenario Data
   Interactive Democracy Game scenarios with educational content
   ========================================================================== */

const SCENARIOS = [
  {
    id: 1,
    category: 'Nachbarschaft',
    title: 'Der laute Nachbar',
    description:
      "In deinem Wohnhaus gibt es regelmäßig Beschwerden über die Familie Ahmeti im 3. Stock. Sie feiern oft bis spät in die Nacht, sprechen laut in ihrer Muttersprache und ihre Kinder spielen auf den Gängen. Einige Nachbarn fordern bereits, dass 'diese Leute' ausziehen sollen. Als Hausvertreter*in musst du eine Lösung finden.",
    image: 'neighborhood',
    decisions: [
      {
        id: 'a',
        text: 'Ich organisiere ein Hausgespräch, um die Bedürfnisse aller zu verstehen und gemeinsame Regeln zu entwickeln.',
        scores: { empathy: 3, rights: 2, participation: 3, courage: 2 },
        feedback:
          'Ausgezeichnet! Du zeigst, dass Konflikte durch Dialog und gegenseitiges Verständnis gelöst werden können. Mediation ist ein demokratisches Werkzeug.',
      },
      {
        id: 'b',
        text: 'Ich setze strenge Hausregeln durch und drohe bei Verstößen mit rechtlichen Konsequenzen.',
        scores: { empathy: 0, rights: 1, participation: 1, courage: 1 },
        feedback:
          'Diese Lösung ist autoritär und berücksichtigt nicht die Umstände der Familie. Echte Demokratie sucht nach inklusiven Lösungen.',
      },
      {
        id: 'c',
        text: 'Ich ignoriere das Problem und hoffe, dass es sich von selbst löst.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Wegschauen löst keine Probleme. Demokratie erfordert aktive Beteiligung und Verantwortungsübernahme.',
      },
    ],
    perspectives: [
      {
        icon: '👨‍👩‍👧‍👦',
        title: 'Familie Ahmeti',
        text: 'Wir arbeiten in Schichten und haben wenig Zeit für Familie. Die Abende sind unsere einzige gemeinsame Zeit.',
      },
      {
        icon: '👴',
        title: 'Pensionist Müller',
        text: 'Ich brauche meinen Schlaf für meine Gesundheit. Aber Integration ist wichtig - wir müssen reden.',
      },
      {
        icon: '👶',
        title: 'Junge Mutter',
        text: 'Mein Baby wird oft geweckt, aber ich verstehe auch, dass Familien Platz zum Leben brauchen.',
      },
    ],
  },

  {
    id: 2,
    category: 'Arbeitsplatz',
    title: 'Diskriminierung im Büro',
    description:
      "Deine Kollegin Fatima trägt seit kurzem ein Kopftuch. Du bemerkst, dass sie bei Meetings weniger zu Wort kommt, bei Teamevents übergangen wird und dein Vorgesetzter sie bei der letzten Beförderungsrunde 'übersehen' hat, obwohl sie die beste Qualifikation hatte. Andere Kollegen machen hinter ihrem Rücken abfällige Bemerkungen.",
    image: 'workplace',
    decisions: [
      {
        id: 'a',
        text: 'Ich spreche Fatima direkt an, biete meine Unterstützung an und ermutige sie, sich an die Personalvertretung zu wenden.',
        scores: { empathy: 3, rights: 3, participation: 2, courage: 3 },
        feedback:
          'Perfekt! Du zeigst Zivilcourage und hilfst dabei, Diskriminierung zu bekämpfen. Menschenrechte gelten für alle.',
      },
      {
        id: 'b',
        text: 'Ich spreche meinen Vorgesetzten diskret auf das Thema Vielfalt am Arbeitsplatz an, ohne Fatima namentlich zu erwähnen.',
        scores: { empathy: 2, rights: 2, participation: 3, courage: 2 },
        feedback:
          'Ein diplomatischer Ansatz, der auch helfen kann. Manchmal braucht es strukturelle Veränderungen für nachhaltige Verbesserungen.',
      },
      {
        id: 'c',
        text: 'Das ist nicht mein Problem. Jeder muss selbst für seine Rechte kämpfen.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Diskriminierung geht alle an. In einer demokratischen Gesellschaft müssen wir füreinander einstehen.',
      },
    ],
    perspectives: [
      {
        icon: '👩‍💼',
        title: 'Fatima',
        text: 'Ich fühle mich isoliert und bin mir unsicher, ob das an meinem Kopftuch liegt oder nur Zufall ist.',
      },
      {
        icon: '👨‍💼',
        title: 'Vorgesetzter',
        text: 'Ich treffe Entscheidungen nach Kompetenz, nicht nach Aussehen. Aber vielleicht sollte ich meine unbewussten Vorurteile hinterfragen.',
      },
      {
        icon: '👥',
        title: 'Andere Kollegen',
        text: 'Wir fühlen uns unwohl mit der Situation, wissen aber nicht, wie wir richtig reagieren sollen.',
      },
    ],
  },

  {
    id: 3,
    category: 'Solidarität',
    title: 'Flüchtlingsunterkunft im Viertel',
    description:
      "In deinem Stadtviertel soll eine Unterkunft für geflüchtete Familien eröffnet werden. Auf einer Bürgerversammlung gibt es heftige Diskussionen: Einige befürchten sinkende Immobilienpreise und mehr Kriminalität, andere betonen humanitäre Verpflichtungen. Ein besorgter Bürger ruft: 'Wir haben schon genug Probleme!' Die Stimmung ist angespannt.",
    image: 'refugee',
    decisions: [
      {
        id: 'a',
        text: 'Ich teile Fakten über Integration und lade alle ein, die bestehende Unterkunft im Nachbarviertel zu besuchen, um Vorurteile abzubauen.',
        scores: { empathy: 3, rights: 3, participation: 3, courage: 3 },
        feedback:
          'Hervorragend! Du bekämpfst Vorurteile mit Aufklärung und direkter Erfahrung. Das ist aktive Demokratieförderung.',
      },
      {
        id: 'b',
        text: 'Ich schlage vor, die Unterkunft zu akzeptieren, aber mit strengen Auflagen und regelmäßigen Kontrollen.',
        scores: { empathy: 1, rights: 2, participation: 2, courage: 1 },
        feedback:
          'Ein Kompromiss, aber er verstärkt das Misstrauen. Echte Integration braucht Vertrauen und Offenheit.',
      },
      {
        id: 'c',
        text: 'Ich unterstütze den Widerstand, weil die Sorgen der Anwohner berechtigt sind.',
        scores: { empathy: 0, rights: 0, participation: 1, courage: 0 },
        feedback:
          'Menschenrechte sind universal. Demokratie bedeutet auch, für die Schwächsten einzustehen, nicht nur für die laute Mehrheit.',
      },
    ],
    perspectives: [
      {
        icon: '🏠',
        title: 'Anwohner',
        text: 'Wir haben Angst vor Veränderungen und fühlen uns nicht gehört von der Politik.',
      },
      {
        icon: '👨‍👩‍👧‍👦',
        title: 'Geflüchtete Familie',
        text: 'Wir wollen nur in Sicherheit leben und unseren Kindern eine Zukunft bieten.',
      },
      {
        icon: '🏛️',
        title: 'Gemeinderat',
        text: 'Wir müssen rechtliche Verpflichtungen erfüllen, aber auch die Sorgen der Bürger ernst nehmen.',
      },
    ],
  },

  {
    id: 4,
    category: 'Medien',
    title: 'Fake News in der Familie',
    description:
      "Bei einem Familientreffen teilt dein Onkel einen Artikel auf Social Media, der behauptet, dass Impfungen zu Autismus führen. Mehrere Familienmitglieder diskutieren aufgeregt und einige beginnen bereits, ihre Impftermine abzusagen. Du weißt, dass diese Information wissenschaftlich widerlegt ist, aber dein Onkel ist überzeugt und zeigt weitere 'Beweise' auf seinem Handy.",
    image: 'social_media',
    decisions: [
      {
        id: 'a',
        text: 'Ich teile sachlich korrekte Informationen von vertrauenswürdigen Quellen und erkläre ruhig, wie man Fake News erkennt.',
        scores: { empathy: 2, rights: 3, participation: 3, courage: 2 },
        feedback:
          'Sehr gut! Aufklärung und Medienkompetenz sind essentiell für eine funktionierende Demokratie.',
      },
      {
        id: 'b',
        text: 'Ich sage direkt, dass das Unsinn ist und erkläre meinem Onkel, dass er Blödsinn verbreitet.',
        scores: { empathy: 0, rights: 1, participation: 1, courage: 2 },
        feedback:
          'Wahrheit ist wichtig, aber aggressive Konfrontation verhärtet oft die Fronten. Empathie hilft bei der Meinungsänderung.',
      },
      {
        id: 'c',
        text: 'Ich halte mich raus, um den Familienfrieden zu bewahren.',
        scores: { empathy: 1, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Schweigen bei Desinformation kann gefährlich werden. Demokratie braucht Menschen, die für Wahrheit und Wissenschaft einstehen.',
      },
    ],
    perspectives: [
      {
        icon: '👨‍🦳',
        title: 'Onkel Karl',
        text: "Ich traue den Medien nicht mehr. Diese 'alternativen' Quellen sagen endlich die Wahrheit!",
      },
      {
        icon: '👩‍⚕️',
        title: 'Hausärztin',
        text: 'Impfungen retten Leben. Ich erkläre gerne die Wissenschaft dahinter - ruhig und mit Geduld.',
      },
      {
        icon: '👶',
        title: 'Junge Eltern',
        text: 'Wir sind verunsichert und wollen nur das Beste für unser Kind. Wem können wir noch vertrauen?',
      },
    ],
  },

  {
    id: 5,
    category: 'Klima',
    title: 'Generationenkonflikt ums Klima',
    description:
      "In deiner Gemeinde protestieren Jugendliche gegen ein neues Einkaufszentrum, das auf einer Grünfläche gebaut werden soll. Sie blockieren friedlich die Baustelle. Ältere Bürger sind empört: 'Die sollen arbeiten gehen statt rumzudemonstrieren!' Der Bürgermeister spricht von 300 neuen Arbeitsplätzen. Die Jugendlichen argumentieren mit Klimaschutz und Artenvielfalt.",
    image: 'climate',
    decisions: [
      {
        id: 'a',
        text: 'Ich organisiere eine moderierte Diskussion zwischen den Generationen, um beide Perspektiven zu verstehen und nach nachhaltigen Lösungen zu suchen.',
        scores: { empathy: 3, rights: 3, participation: 3, courage: 2 },
        feedback:
          'Ausgezeichnet! Du förderst den demokratischen Dialog und suchst nach Lösungen, die verschiedene Bedürfnisse berücksichtigen.',
      },
      {
        id: 'b',
        text: 'Die Jugendlichen haben ein Recht auf Protest, aber sie sollten die Wirtschaft nicht blockieren.',
        scores: { empathy: 1, rights: 2, participation: 1, courage: 1 },
        feedback:
          'Du erkennst das Demonstrationsrecht an, aber vergisst, dass ziviler Ungehorsam manchmal nötig ist für gesellschaftlichen Wandel.',
      },
      {
        id: 'c',
        text: 'Arbeitsplätze sind wichtiger als idealistisches Gerede über Klimawandel.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Kurzfristige Wirtschaftsinteressen vs. langfristige Überlebensfragen - Demokratie muss auch zukünftige Generationen berücksichtigen.',
      },
    ],
    perspectives: [
      {
        icon: '🌱',
        title: 'Klimaaktivistin Lisa (16)',
        text: 'Wir kämpfen für unsere Zukunft! Die Erwachsenen haben versagt - jetzt müssen wir handeln.',
      },
      {
        icon: '👷‍♂️',
        title: 'Arbeiter Thomas (45)',
        text: 'Ich brauche den Job für meine Familie. Umweltschutz ist wichtig, aber wir müssen auch essen.',
      },
      {
        icon: '👩‍🌾',
        title: 'Lokale Landwirtin',
        text: 'Das Grünland ist wichtig für Biodiversität, aber ich verstehe auch die Sorgen um Arbeitsplätze.',
      },
    ],
  },

  {
    id: 6,
    category: 'Inklusion',
    title: 'Barrierefreier Sportverein',
    description:
      "Dein Sportverein soll barrierefreie Umbauten vornehmen, damit auch Menschen mit Behinderungen teilnehmen können. Die Kosten sind hoch, und einige Mitglieder beschweren sich über steigende Beiträge. Ein langjähriges Mitglied sagt: 'Sollen die sich doch einen eigenen Verein suchen!' Du bist im Vorstand und musst eine Entscheidung treffen.",
    image: 'sports',
    decisions: [
      {
        id: 'a',
        text: 'Ich setze mich für die Umbauten ein und organisiere Spendenaktionen, um die Kosten zu teilen. Inklusion ist ein Gewinn für alle.',
        scores: { empathy: 3, rights: 3, participation: 2, courage: 3 },
        feedback:
          'Perfekt! Du zeigst, dass Inklusion bereichernd ist und dass kreative Lösungen möglich sind.',
      },
      {
        id: 'b',
        text: 'Ich schlage vor, nur die günstigen Mindestanpassungen zu machen, um die Kosten zu begrenzen.',
        scores: { empathy: 1, rights: 2, participation: 2, courage: 1 },
        feedback:
          'Ein Kompromiss, aber wahre Inklusion braucht mehr als Mindeststandards. Teilhabe sollte vollständig möglich sein.',
      },
      {
        id: 'c',
        text: 'Die Kosten sind zu hoch. Der Verein ist für die aktuellen Mitglieder da.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Ausgrenzung widerspricht demokratischen Werten. Jeder Mensch hat das Recht auf gesellschaftliche Teilhabe.',
      },
    ],
    perspectives: [
      {
        icon: '🦽',
        title: 'Max (Rollstuhlfahrer)',
        text: 'Ich möchte einfach nur Sport treiben wie alle anderen auch. Inklusion bedeutet Normalität.',
      },
      {
        icon: '💰',
        title: 'Kassier des Vereins',
        text: 'Ich muss auf die Finanzen achten, aber Inklusion ist eine Investition in unsere Gemeinschaft.',
      },
      {
        icon: '👨‍👩‍👧‍👦',
        title: 'Familie mit behindertem Kind',
        text: 'Wir suchen schon so lange einen Ort, wo unser Kind akzeptiert wird und Freunde finden kann.',
      },
    ],
  },

  {
    id: 7,
    category: 'Vielfalt',
    title: 'LGBTQ+ in der Schule',
    description:
      "Als Elternvertreter*in erfährst du, dass einige Lehrer*innen sich beschwert haben: Ein Schüler möchte mit seinem gewählten Namen angesprochen werden und das 'andere' WC benutzen. Einige Eltern sind empört und drohen, ihre Kinder abzumelden. Die Schulleitung ist unsicher. Der betroffene Jugendliche leidet sichtlich unter der Situation.",
    image: 'school',
    decisions: [
      {
        id: 'a',
        text: 'Ich setze mich für den Schüler ein und organisiere einen Informationsabend über LGBTQ+ Themen mit Expert*innen.',
        scores: { empathy: 3, rights: 3, participation: 3, courage: 3 },
        feedback:
          'Hervorragend! Du stehst für die Menschenwürde ein und förderst Verständnis durch Aufklärung.',
      },
      {
        id: 'b',
        text: 'Ich schlage einen Kompromiss vor: neutrale WCs für alle, die sich unwohl fühlen.',
        scores: { empathy: 2, rights: 2, participation: 2, courage: 1 },
        feedback:
          'Ein pragmatischer Ansatz, aber Kompromisse bei Menschenrechten sind schwierig. Volle Akzeptanz wäre besser.',
      },
      {
        id: 'c',
        text: 'Das ist zu kompliziert für eine Schule. Soll sich an die Regeln halten.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Diskriminierung und Ausgrenzung schaden nicht nur dem betroffenen Kind, sondern allen Schüler*innen.',
      },
    ],
    perspectives: [
      {
        icon: '🏳️‍⚧️',
        title: 'Alex (Schüler)',
        text: 'Ich will einfach nur ich selbst sein können und zur Schule gehen, ohne Angst zu haben.',
      },
      {
        icon: '👨‍🏫',
        title: 'Klassenlehrer',
        text: 'Ich möchte alle meine Schüler*innen unterstützen, bin aber unsicher, wie ich richtig handle.',
      },
      {
        icon: '👪',
        title: 'Besorgte Eltern',
        text: 'Wir verstehen das alles nicht und haben Angst, dass unsere Kinder verwirrt werden.',
      },
    ],
  },

  {
    id: 8,
    category: 'Partizipation',
    title: 'Bürgerbeteiligung bei Stadtplanung',
    description:
      "Deine Stadt plant ein neues Wohnviertel. Der Stadtrat hat bereits entschieden, aber Bürger*innen fühlen sich übergangen. Sie fordern echte Mitsprache bei der Planung. Einige Politiker sagen: 'Wir sind gewählt, um zu entscheiden.' Eine Bürgerinitiative sammelt Unterschriften für mehr direkte Demokratie. Du bist in der Stadtverwaltung tätig.",
    image: 'city_planning',
    decisions: [
      {
        id: 'a',
        text: 'Ich unterstütze einen Bürgerbeteiligungsprozess mit Workshops, wo alle Ideen gehört und in die Planung einbezogen werden.',
        scores: { empathy: 3, rights: 2, participation: 3, courage: 2 },
        feedback:
          'Perfekt! Du förderst partizipative Demokratie und zeigst, dass Bürgerbeteiligung zu besseren Lösungen führt.',
      },
      {
        id: 'b',
        text: 'Ich organisiere Informationsveranstaltungen, wo die Bürger*innen über die bereits getroffenen Entscheidungen aufgeklärt werden.',
        scores: { empathy: 1, rights: 1, participation: 1, courage: 1 },
        feedback:
          'Information ist wichtig, aber echte Demokratie bedeutet Mitgestaltung, nicht nur Information über fertige Pläne.',
      },
      {
        id: 'c',
        text: 'Repräsentative Demokratie funktioniert so. Die gewählten Vertreter sollen entscheiden.',
        scores: { empathy: 0, rights: 1, participation: 0, courage: 0 },
        feedback:
          'Wahlen allein reichen nicht aus. Lebendige Demokratie braucht kontinuierliche Bürgerbeteiligung.',
      },
    ],
    perspectives: [
      {
        icon: '🏘️',
        title: 'Bürgerinitiative',
        text: 'Wir leben hier und wollen mitentscheiden, wie sich unser Viertel entwickelt.',
      },
      {
        icon: '🏛️',
        title: 'Stadtrat',
        text: 'Wir haben ein Mandat und müssen effizient entscheiden. Zu viel Bürgerbeteiligung lähmt Prozesse.',
      },
      {
        icon: '🏗️',
        title: 'Projektentwickler',
        text: 'Bürgerbeteiligung ist teuer und verzögert Projekte, aber sie kann auch zu besserer Akzeptanz führen.',
      },
    ],
  },
];

// Demokratie-Profile basierend auf Scores
const DEMOCRACY_PROFILES = {
  democracy_champion: {
    title: 'Demokratie-Champion',
    description:
      'Du verstehst Demokratie als Lebensform und setzt dich aktiv für Menschenrechte, Vielfalt und Partizipation ein. Du siehst in Konflikten Chancen für Wachstum und Verständigung.',
    minScore: 85,
    emoji: '🏆',
  },
  bridge_builder: {
    title: 'Brücken-Bauer*in',
    description:
      'Du hast ein gutes Verständnis für demokratische Werte und bemühst dich, verschiedene Perspektiven zu verstehen. Du suchst nach Lösungen, die möglichst viele Menschen einbeziehen.',
    minScore: 65,
    emoji: '🌉',
  },
  democracy_learner: {
    title: 'Demokratie-Lernende*r',
    description:
      'Du zeigst Interesse an demokratischen Prozessen und entwickelst dein Verständnis für gesellschaftliche Zusammenhänge weiter. Mit mehr Engagement kannst du viel bewirken.',
    minScore: 45,
    emoji: '📚',
  },
  democracy_beginner: {
    title: 'Demokratie-Einsteiger*in',
    description:
      'Du machst erste Schritte im Verständnis demokratischer Werte. Jeder Weg beginnt mit dem ersten Schritt - bleib neugierig und offen für andere Perspektiven!',
    minScore: 0,
    emoji: '🌱',
  },
};

// Utility function to calculate total score
function calculateTotalScore(scores) {
  return scores.empathy + scores.rights + scores.participation + scores.courage;
}

// Utility function to get democracy profile
function getDemocracyProfile(totalScore, maxPossibleScore) {
  const percentage = (totalScore / maxPossibleScore) * 100;

  for (const profile of Object.values(DEMOCRACY_PROFILES)) {
    if (percentage >= profile.minScore) {
      return profile;
    }
  }

  return DEMOCRACY_PROFILES.democracy_beginner;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SCENARIOS, DEMOCRACY_PROFILES, calculateTotalScore, getDemocracyProfile };
}
