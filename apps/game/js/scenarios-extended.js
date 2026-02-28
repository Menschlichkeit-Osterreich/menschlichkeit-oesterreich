/* ==========================================================================
   Brücken Bauen – Extended Scenarios (Level 9–16)
   Neue Szenarien für Schule, Politik, Umwelt und digitale Welt
   ========================================================================== */

const SCENARIOS_EXTENDED = [
  // ── LEVEL 9: SCHULE ─────────────────────────────────────────────────────────
  {
    id: 9,
    category: 'Schule',
    level: 9,
    chapter: 'Bildung & Chancengerechtigkeit',
    title: 'Das Schulprojekt',
    difficulty: 'mittel',
    description:
      'In deiner Klasse soll ein Gruppenprojekt über "Demokratie in Österreich" erarbeitet werden. Dein Mitschüler Kerim, der erst seit einem Jahr in Österreich ist, spricht noch nicht perfekt Deutsch. Einige Klassenkamerad:innen wollen ihn nicht in ihrer Gruppe, weil sie befürchten, dass er die Note verschlechtert.',
    image: 'school',
    tags: ['Inklusion', 'Bildung', 'Chancengleichheit'],
    decisions: [
      {
        id: 'a',
        text: 'Ich nehme Kerim in meine Gruppe auf und verteile die Aufgaben so, dass er seine Stärken einbringen kann.',
        scores: { empathy: 3, rights: 3, participation: 3, courage: 2 },
        feedback:
          'Hervorragend! Inklusion bedeutet, Stärken zu erkennen und Aufgaben fair zu verteilen. Kerim bringt vielleicht Wissen über andere politische Systeme mit, das die Arbeit bereichert.',
        followUp: 'Kerim präsentiert einen Vergleich zwischen dem österreichischen und dem türkischen Wahlsystem – die Klasse ist begeistert.',
      },
      {
        id: 'b',
        text: 'Ich spreche mit der Lehrerin und schlage vor, dass sie die Gruppen zufällig einteilt, damit niemand ausgeschlossen wird.',
        scores: { empathy: 2, rights: 2, participation: 3, courage: 2 },
        feedback:
          'Ein guter systemischer Ansatz! Strukturelle Lösungen können Diskriminierung verhindern, bevor sie entsteht.',
        followUp: 'Die Lehrerin übernimmt die Idee und führt ein faires Gruppenrotationssystem ein.',
      },
      {
        id: 'c',
        text: 'Ich sage nichts und lasse die anderen Gruppen entscheiden.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Schweigen ist keine neutrale Handlung – es bestätigt die Ausgrenzung. Demokratie braucht aktive Stimmen.',
        followUp: 'Kerim muss alleine arbeiten und fühlt sich isoliert. Die Klasse verpasst eine Chance zur Bereicherung.',
      },
    ],
    perspectives: [
      { icon: '🧑‍🎓', title: 'Kerim', text: 'Ich kenne mich gut mit Geschichte aus und kann recherchieren. Ich lerne gerne Deutsch, aber ich brauche Zeit.' },
      { icon: '📚', title: 'Lehrerin Mag. Bauer', text: 'Gruppenarbeit soll soziale Kompetenzen fördern. Ausgrenzung ist inakzeptabel.' },
      { icon: '🏆', title: 'Mitschülerin Lisa', text: 'Ich will eine gute Note, aber ich weiß, dass Ausgrenzung falsch ist.' },
    ],
    learningContent: {
      fact: 'Österreich hat eine der höchsten Bildungsungleichheiten in der EU. Kinder mit Migrationshintergrund haben deutlich geringere Chancen auf höhere Bildungsabschlüsse.',
      link: 'https://www.statistik.at/statistiken/bevoelkerung-und-soziales/bildung',
    },
  },

  // ── LEVEL 10: POLITIK ───────────────────────────────────────────────────────
  {
    id: 10,
    category: 'Politik',
    level: 10,
    chapter: 'Demokratische Teilhabe',
    title: 'Die erste Wahl',
    difficulty: 'mittel',
    description:
      'Du bist 18 und darfst zum ersten Mal wählen. In deiner Gemeinde gibt es eine Gemeinderatswahl. Deine Freunde sagen, "Wählen bringt eh nichts" und planen, zuhause zu bleiben. Gleichzeitig hörst du, dass in deinem Bezirk ein Kandidat antritt, der offen diskriminierende Aussagen über Migrant:innen macht.',
    image: 'politics',
    tags: ['Wahlrecht', 'Demokratie', 'Zivilcourage'],
    decisions: [
      {
        id: 'a',
        text: 'Ich gehe wählen, informiere mich vorher über alle Kandidat:innen und überzeuge meine Freunde, ebenfalls zu wählen.',
        scores: { empathy: 2, rights: 3, participation: 3, courage: 3 },
        feedback:
          'Perfekt! Wahlbeteiligung ist eine der wichtigsten demokratischen Handlungen. Und andere zum Wählen zu motivieren, multipliziert den Effekt.',
        followUp: 'Vier deiner Freunde gehen mit dir wählen. Der diskriminierende Kandidat erhält weniger Stimmen als erwartet.',
      },
      {
        id: 'b',
        text: 'Ich gehe wählen, aber sage meinen Freunden nichts – das ist ihre Entscheidung.',
        scores: { empathy: 1, rights: 2, participation: 2, courage: 1 },
        feedback:
          'Gut, dass du wählst! Aber demokratische Teilhabe lebt auch davon, andere zu ermutigen. Deine Stimme zählt – und die deiner Freunde auch.',
        followUp: 'Du wählst. Deine Freunde bleiben zuhause. Knapper Ausgang bei der Wahl.',
      },
      {
        id: 'c',
        text: 'Ich bleibe auch zuhause – eine Stimme macht keinen Unterschied.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Jede Stimme zählt! Bei Gemeinderatswahlen entscheiden oft wenige Hundert Stimmen. Nicht-Wählen ist auch eine Entscheidung – aber eine, die anderen die Macht überlässt.',
        followUp: 'Der diskriminierende Kandidat gewinnt mit 12 Stimmen Vorsprung.',
      },
    ],
    perspectives: [
      { icon: '🗳️', title: 'Wahlbehörde', text: 'In Österreich gilt die Wahlpflicht nicht, aber die Wahlbeteiligung ist wichtig für die Legitimität der Demokratie.' },
      { icon: '👥', title: 'Freund Jonas', text: 'Was soll ich wählen? Alle Parteien sind gleich schlecht.' },
      { icon: '🏘️', title: 'Nachbarin Frau Özdemir', text: 'Ich darf als Nicht-EU-Bürgerin nicht wählen. Bitte nutzt euer Recht für alle.' },
    ],
    learningContent: {
      fact: 'In Österreich liegt das Wahlalter bei Nationalratswahlen bei 16 Jahren – eines der niedrigsten in Europa. Bei der letzten Nationalratswahl 2024 lag die Wahlbeteiligung bei 78,9%.',
      link: 'https://www.bmi.gv.at/412/start.aspx',
    },
  },

  // ── LEVEL 11: UMWELT & KLIMAGERECHTIGKEIT ───────────────────────────────────
  {
    id: 11,
    category: 'Umwelt',
    level: 11,
    chapter: 'Klimagerechtigkeit',
    title: 'Die Fabrik am Fluss',
    difficulty: 'schwer',
    description:
      'In deiner Gemeinde soll eine neue Fabrik gebaut werden. Sie würde 200 Arbeitsplätze schaffen, aber auch den lokalen Fluss belasten. Ärmere Familien am Stadtrand – viele mit Migrationshintergrund – leben direkt am Fluss und würden am stärksten von der Verschmutzung betroffen sein. Die Fabrik würde hauptsächlich wohlhabenderen Stadtteilen zugutekommen.',
    image: 'environment',
    tags: ['Klimagerechtigkeit', 'Partizipation', 'Umweltrecht'],
    decisions: [
      {
        id: 'a',
        text: 'Ich organisiere eine Bürgerversammlung, bei der alle Betroffenen – besonders die Anwohner:innen am Fluss – gehört werden, bevor eine Entscheidung fällt.',
        scores: { empathy: 3, rights: 3, participation: 3, courage: 3 },
        feedback:
          'Exzellent! Umweltgerechtigkeit bedeutet, dass alle Stimmen zählen – besonders die der am stärksten Betroffenen. Partizipative Prozesse führen zu besseren und gerechteren Entscheidungen.',
        followUp: 'Die Bürgerversammlung führt zu einem Kompromiss: Die Fabrik wird mit strengeren Umweltauflagen und einem Ausgleichsfonds für Betroffene genehmigt.',
      },
      {
        id: 'b',
        text: 'Ich unterstütze die Fabrik, weil Arbeitsplätze wichtig sind, aber fordere strengere Umweltauflagen.',
        scores: { empathy: 2, rights: 2, participation: 2, courage: 2 },
        feedback:
          'Ein pragmatischer Ansatz. Wichtig ist, dass die Umweltauflagen tatsächlich durchgesetzt werden und die Betroffenen entschädigt werden.',
        followUp: 'Die Fabrik wird gebaut. Die Umweltauflagen werden anfangs eingehalten, aber die Überwachung lässt nach.',
      },
      {
        id: 'c',
        text: 'Ich lehne die Fabrik ab, weil Umweltschutz wichtiger ist als Wirtschaftswachstum.',
        scores: { empathy: 2, rights: 2, participation: 1, courage: 2 },
        feedback:
          'Umweltschutz ist wichtig, aber die Arbeitslosen brauchen auch Perspektiven. Echte Lösungen berücksichtigen beide Dimensionen.',
        followUp: 'Die Fabrik wird abgelehnt. Die Gemeinde sucht nach alternativen Wirtschaftsprojekten.',
      },
    ],
    perspectives: [
      { icon: '🌊', title: 'Familie Kovač (Flussanwohner)', text: 'Unsere Kinder spielen im Fluss. Wir können uns keinen Umzug leisten.' },
      { icon: '🏭', title: 'Bürgermeisterin', text: 'Wir brauchen Arbeitsplätze. Aber wir haben auch eine Verantwortung für die Umwelt.' },
      { icon: '💼', title: 'Fabrikbetreiber', text: 'Wir erfüllen alle gesetzlichen Anforderungen. Die Fabrik ist modern und umweltfreundlich.' },
    ],
    learningContent: {
      fact: 'Klimawandel trifft ärmere Bevölkerungsgruppen und Länder des Globalen Südens überproportional stark, obwohl sie am wenigsten zu den Emissionen beigetragen haben. Das nennt man Klimaungerechtigkeit.',
      link: 'https://www.umweltbundesamt.at/umweltthemen/klima',
    },
  },

  // ── LEVEL 12: DIGITALE WELT ─────────────────────────────────────────────────
  {
    id: 12,
    category: 'Digital',
    level: 12,
    chapter: 'Digitale Demokratie',
    title: 'Der virale Post',
    difficulty: 'mittel',
    description:
      'In deiner Social-Media-Timeline siehst du einen Post, der behauptet, Geflüchtete würden bevorzugt Wohnungen bekommen, während "echte Österreicher:innen" warten müssen. Der Post wird tausendfach geteilt. Du weißt, dass diese Information falsch ist, aber viele deiner Freunde und Familienmitglieder teilen ihn bereits.',
    image: 'digital',
    tags: ['Desinformation', 'Digitale Kompetenz', 'Zivilcourage'],
    decisions: [
      {
        id: 'a',
        text: 'Ich recherchiere die Fakten, kommentiere den Post mit korrekten Informationen und Quellen, und spreche direkt mit Freunden, die ihn geteilt haben.',
        scores: { empathy: 2, rights: 3, participation: 3, courage: 3 },
        feedback:
          'Ausgezeichnet! Aktives Entgegentreten von Desinformation ist eine demokratische Pflicht. Faktenbasierte Kommunikation mit Quellen ist besonders effektiv.',
        followUp: 'Drei deiner Freunde löschen den Post nach deinem Kommentar. Einer bedankt sich für die Richtigstellung.',
      },
      {
        id: 'b',
        text: 'Ich melde den Post als Fehlinformation bei der Plattform.',
        scores: { empathy: 1, rights: 2, participation: 2, courage: 2 },
        feedback:
          'Melden ist wichtig und richtig! Aber alleine reicht es oft nicht – aktive Gegenrede ist ebenfalls notwendig.',
        followUp: 'Die Plattform prüft den Post. Er bleibt vorerst online, wird aber mit einem Faktencheck-Label versehen.',
      },
      {
        id: 'c',
        text: 'Ich scrolle weiter und ignoriere den Post – ich will keinen Streit.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Desinformation verbreitet sich am schnellsten durch Schweigen. Jedes Nicht-Reagieren ist eine implizite Zustimmung.',
        followUp: 'Der Post wird weiter geteilt und beeinflusst die Meinung vieler Menschen in deinem Umfeld.',
      },
    ],
    perspectives: [
      { icon: '📱', title: 'Onkel Herbert', text: 'Das habe ich von einem Freund bekommen. Wenn es nicht stimmt, warum teilen es dann so viele?' },
      { icon: '🏠', title: 'Sozialarbeiterin Mag. Gruber', text: 'Wohnungsvergabe folgt strengen Kriterien. Desinformation schadet echten Bedürftigen.' },
      { icon: '🌐', title: 'Medienwissenschaftler', text: 'Falschinformationen verbreiten sich 6x schneller als korrekte Informationen in sozialen Medien.' },
    ],
    learningContent: {
      fact: 'Laut einer EU-Studie glauben 71% der Österreicher:innen, dass Desinformation ein ernstes Problem für die Demokratie darstellt. Medienkompetenz ist eine Schlüsselkompetenz des 21. Jahrhunderts.',
      link: 'https://www.saferinternet.at',
    },
  },

  // ── LEVEL 13: GESUNDHEIT & SOZIALES ─────────────────────────────────────────
  {
    id: 13,
    category: 'Gesundheit',
    level: 13,
    chapter: 'Soziale Gerechtigkeit',
    title: 'Die Warteschlange',
    difficulty: 'mittel',
    description:
      'Du wartest in einer langen Schlange beim Arzt. Eine ältere Frau, die offensichtlich Schmerzen hat und kaum Deutsch spricht, wird von der Rezeptionistin abgewiesen, weil sie ihre E-Card vergessen hat. Die Rezeptionistin sagt, sie solle "nächstes Mal besser vorbereitet kommen". Andere Wartende schauen weg.',
    image: 'health',
    tags: ['Menschenwürde', 'Gesundheitsrecht', 'Zivilcourage'],
    decisions: [
      {
        id: 'a',
        text: 'Ich spreche die Rezeptionistin ruhig an, erkläre die Situation und frage, ob es eine Lösung gibt – z.B. die Sozialversicherungsnummer nachschlagen.',
        scores: { empathy: 3, rights: 3, participation: 2, courage: 3 },
        feedback:
          'Perfekt! Ruhiges, sachliches Eintreten für andere ist oft am effektivsten. Gesundheitsversorgung ist ein Grundrecht.',
        followUp: 'Die Rezeptionistin schlägt die Nummer nach. Die Frau wird behandelt und bedankt sich mit Tränen in den Augen.',
      },
      {
        id: 'b',
        text: 'Ich biete der Frau an, als Übersetzer:in zu helfen, und unterstütze sie dabei, ihre Situation zu erklären.',
        scores: { empathy: 3, rights: 2, participation: 2, courage: 2 },
        feedback:
          'Sehr einfühlsam! Sprachbarrieren sind eine reale Hürde im Gesundheitssystem. Deine Hilfe macht einen echten Unterschied.',
        followUp: 'Mit deiner Hilfe versteht die Rezeptionistin das Problem und findet eine Lösung.',
      },
      {
        id: 'c',
        text: 'Das ist nicht meine Angelegenheit. Ich warte auf meinen Termin.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Wegschauen bei Ungerechtigkeit macht uns mitverantwortlich. Kleine Gesten der Solidarität können Leben verändern.',
        followUp: 'Die Frau verlässt die Praxis unbehandelt. Ihr Zustand verschlechtert sich.',
      },
    ],
    perspectives: [
      { icon: '👵', title: 'Frau Novak', text: 'Ich habe die Karte vergessen. Ich bin doch versichert. Ich habe so starke Schmerzen.' },
      { icon: '💊', title: 'Dr. Hofmann', text: 'Niemand darf aus medizinischen Gründen abgewiesen werden. Das ist gesetzlich geregelt.' },
      { icon: '🏥', title: 'Rezeptionistin', text: 'Ich folge den Vorschriften. Aber vielleicht gibt es eine Ausnahme.' },
    ],
    learningContent: {
      fact: 'In Österreich hat jede Person, die sich im Land aufhält, das Recht auf medizinische Notfallversorgung. Niemand darf aus einem Notfall abgewiesen werden.',
      link: 'https://www.sozialministerium.at/Themen/Gesundheit.html',
    },
  },

  // ── LEVEL 14: SPORT & GEMEINSCHAFT ──────────────────────────────────────────
  {
    id: 14,
    category: 'Sport',
    level: 14,
    chapter: 'Gemeinschaft & Inklusion',
    title: 'Das Fußballteam',
    difficulty: 'leicht',
    description:
      'Dein Fußballverein nimmt an einem Stadtturnier teil. Kurz vor dem Finale erfährst du, dass ein Spieler der gegnerischen Mannschaft rassistische Beleidigungen gegen euren Mitspieler Amadou verwendet hat. Der Schiedsrichter hat es nicht gehört. Dein Trainer sagt: "Konzentriert euch aufs Spiel."',
    image: 'sports',
    tags: ['Antirassismus', 'Sport', 'Zivilcourage'],
    decisions: [
      {
        id: 'a',
        text: 'Ich spreche den Schiedsrichter an und schildere, was passiert ist. Wenn nötig, drohe ich damit, das Spiel zu verlassen.',
        scores: { empathy: 3, rights: 3, participation: 2, courage: 3 },
        feedback:
          'Stark! Rassismus hat im Sport keinen Platz. Das Melden ist richtig und wichtig. Solidarität mit Amadou zeigt, dass ihr als Team zusammenhaltet.',
        followUp: 'Der Schiedsrichter verwarnt den gegnerischen Spieler. Amadou spielt das Finale mit neuem Selbstvertrauen.',
      },
      {
        id: 'b',
        text: 'Ich spreche Amadou an, frage wie es ihm geht, und sage ihm, dass ich hinter ihm stehe.',
        scores: { empathy: 3, rights: 2, participation: 2, courage: 2 },
        feedback:
          'Persönliche Solidarität ist wertvoll! Amadou weiß, dass er nicht allein ist. Aber der Täter sollte auch Konsequenzen spüren.',
        followUp: 'Amadou fühlt sich unterstützt. Das Team gewinnt das Spiel. Ihr meldet den Vorfall danach dem Verein.',
      },
      {
        id: 'c',
        text: 'Ich konzentriere mich aufs Spiel, wie der Trainer sagt.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Schweigen bei Rassismus ist keine Neutralität – es ist Komplizenschaft. Sport hat die Kraft, Gesellschaft zu verändern, wenn wir aktiv werden.',
        followUp: 'Amadou verlässt nach dem Spiel den Verein. Das Team verliert einen wichtigen Spieler und Freund.',
      },
    ],
    perspectives: [
      { icon: '⚽', title: 'Amadou', text: 'Das passiert mir nicht zum ersten Mal. Aber wenn meine Mitspieler nichts sagen, fühle ich mich allein.' },
      { icon: '🏆', title: 'Trainer', text: 'Ich hätte anders reagieren sollen. Rassismus ist nie akzeptabel, auch nicht im Sport.' },
      { icon: '🤝', title: 'Vereinspräsident', text: 'Unser Verein hat eine Null-Toleranz-Politik gegenüber Diskriminierung.' },
    ],
    learningContent: {
      fact: 'Der ÖFB (Österreichischer Fußball-Bund) hat eine "Fairplay"-Initiative gegen Rassismus im Sport. Spieler:innen können Spiele unterbrechen, wenn rassistische Vorfälle auftreten.',
      link: 'https://www.oefb.at/Fairplay',
    },
  },

  // ── LEVEL 15: WOHNEN & STADTPLANUNG ─────────────────────────────────────────
  {
    id: 15,
    category: 'Stadtplanung',
    level: 15,
    chapter: 'Demokratische Stadtentwicklung',
    title: 'Der neue Park',
    difficulty: 'schwer',
    description:
      'Die Stadt plant, ein brachliegendes Grundstück in deinem Viertel zu bebauen. Zur Auswahl stehen: ein Luxuswohnprojekt (das die Mieten im Viertel erhöhen würde), ein Gemeinschaftsgarten (den alle nutzen könnten) oder ein Parkplatz (den Autofahrer:innen wünschen). Du hast die Möglichkeit, an einer Bürger:innenbeteiligung teilzunehmen.',
    image: 'urban',
    tags: ['Stadtplanung', 'Partizipation', 'Wohnen'],
    decisions: [
      {
        id: 'a',
        text: 'Ich nehme an der Bürger:innenbeteiligung teil, spreche mit Nachbar:innen aller Altersgruppen und Hintergründe, und setze mich für den Gemeinschaftsgarten ein.',
        scores: { empathy: 3, rights: 2, participation: 3, courage: 2 },
        feedback:
          'Exzellent! Bürger:innenbeteiligung ist das Herzstück der lokalen Demokratie. Ein inklusiver Prozess führt zu besseren Ergebnissen für alle.',
        followUp: 'Der Gemeinschaftsgarten wird gebaut. Er wird zum Treffpunkt für alle Generationen und Kulturen im Viertel.',
      },
      {
        id: 'b',
        text: 'Ich unterschreibe eine Online-Petition für den Gemeinschaftsgarten.',
        scores: { empathy: 1, rights: 1, participation: 2, courage: 1 },
        feedback:
          'Online-Petitionen sind ein Anfang, aber persönliche Beteiligung ist effektiver. Demokratie lebt von aktiver Teilhabe.',
        followUp: 'Die Petition erhält 500 Unterschriften. Die Stadt berücksichtigt sie teilweise.',
      },
      {
        id: 'c',
        text: 'Ich tue nichts – die Stadt entscheidet sowieso, was sie will.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Politikverdrossenheit ist verständlich, aber gefährlich. Lokale Entscheidungen haben direkten Einfluss auf dein Leben – und deine Stimme zählt.',
        followUp: 'Das Luxuswohnprojekt wird gebaut. Die Mieten im Viertel steigen um 30%.',
      },
    ],
    perspectives: [
      { icon: '🌱', title: 'Umweltgruppe', text: 'Wien braucht mehr Grünflächen. Ein Gemeinschaftsgarten verbessert das Stadtklima und fördert Gemeinschaft.' },
      { icon: '🚗', title: 'Autofahrer Herr Maier', text: 'Ich brauche einen Parkplatz. Die Parksituation ist katastrophal.' },
      { icon: '🏗️', title: 'Stadtplanerin', text: 'Wir müssen alle Interessen abwägen. Bürger:innenbeteiligung hilft uns, die beste Lösung zu finden.' },
    ],
    learningContent: {
      fact: 'Wien ist weltweit führend in partizipativer Stadtplanung. Das "Grätzl-Budget" ermöglicht es Bürger:innen, direkt über die Verwendung von Stadtgeldern abzustimmen.',
      link: 'https://www.wien.gv.at/stadtentwicklung/partizipation/',
    },
  },

  // ── LEVEL 16: FINALE – ÖSTERREICH UND EUROPA ────────────────────────────────
  {
    id: 16,
    category: 'Europa',
    level: 16,
    chapter: 'Europäische Demokratie',
    title: 'Die EU-Wahl',
    difficulty: 'schwer',
    description:
      'Du bist Mitglied einer Jugendorganisation und sollt eine Veranstaltung zur EU-Wahl organisieren. Viele Jugendliche in deinem Umfeld sind skeptisch gegenüber der EU: "Die entscheiden eh alles in Brüssel." Gleichzeitig weißt du, dass EU-Entscheidungen direkten Einfluss auf Klimaschutz, Menschenrechte und Wirtschaft haben.',
    image: 'europe',
    tags: ['Europa', 'Demokratie', 'Jugend'],
    decisions: [
      {
        id: 'a',
        text: 'Ich organisiere ein interaktives Format, bei dem Jugendliche echte EU-Entscheidungen simulieren und sehen, wie diese ihr Leben betreffen.',
        scores: { empathy: 2, rights: 3, participation: 3, courage: 3 },
        feedback:
          'Ausgezeichnet! Erlebnisorientiertes Lernen ist am effektivsten. Wenn Jugendliche selbst erleben, wie EU-Entscheidungen entstehen, steigt das Engagement.',
        followUp: '80 Jugendliche nehmen teil. Die Wahlbeteiligung in deiner Gruppe bei der EU-Wahl liegt bei 75% – weit über dem Durchschnitt.',
      },
      {
        id: 'b',
        text: 'Ich lade EU-Parlamentarier:innen ein, um Fragen zu beantworten.',
        scores: { empathy: 1, rights: 2, participation: 2, courage: 2 },
        feedback:
          'Direkter Kontakt mit Politiker:innen kann inspirierend sein. Wichtig ist, dass die Veranstaltung dialogorientiert ist.',
        followUp: 'Die Veranstaltung findet statt. Einige Jugendliche sind begeistert, andere bleiben skeptisch.',
      },
      {
        id: 'c',
        text: 'Ich sage ab – EU-Politik ist zu komplex für Jugendliche.',
        scores: { empathy: 0, rights: 0, participation: 0, courage: 0 },
        feedback:
          'Demokratie ist für alle! Jugendliche sind besonders von EU-Entscheidungen betroffen – Klimapolitik, Bildung, Freizügigkeit. Ihre Stimme ist unverzichtbar.',
        followUp: 'Die Veranstaltung findet nicht statt. Die Wahlbeteiligung in deiner Gruppe ist niedrig.',
      },
    ],
    perspectives: [
      { icon: '🇪🇺', title: 'EU-Parlamentarierin', text: 'Jugendliche sind die Zukunft Europas. Ihre Beteiligung ist entscheidend für die Demokratie.' },
      { icon: '🧑‍💻', title: 'Jugendlicher Max', text: 'Was hat die EU mit meinem Leben zu tun? Ich verstehe das alles nicht.' },
      { icon: '🌍', title: 'Klimaaktivistin', text: 'Der Green Deal der EU ist das wichtigste Klimaschutzprogramm der Geschichte. Dafür brauchen wir EU-Demokratie.' },
    ],
    learningContent: {
      fact: 'Bei der EU-Wahl 2024 lag die Wahlbeteiligung in Österreich bei 59,7%. Österreicher:innen ab 16 Jahren dürfen bei EU-Wahlen wählen.',
      link: 'https://www.europarl.europa.eu/at-your-service/de/be-heard/elections',
    },
  },
];

// Exportiere für Verwendung im Hauptspiel
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SCENARIOS_EXTENDED };
} else {
  window.SCENARIOS_EXTENDED = SCENARIOS_EXTENDED;
}
