/**
 * BRÜCKEN BAUEN 3D – Erweiterte Szenarien-Daten
 * Zusätzliche Szenarien für alle 100 Level
 * Die Kern-Szenarien sind in scene-game.js definiert.
 * Diese Datei enthält erweiterte Szenarien für Level 11-100.
 */
'use strict';

// Erweiterte Szenarien werden dynamisch in SceneGame.SCENARIOS eingebunden
const EXTENDED_SCENARIOS = {

  // ═══════════════════════════════════════════════════════════════
  // Welt 2: Schule (10 Szenarien)
  // ═══════════════════════════════════════════════════════════════

  schule_mobbing: {
    title: 'Cybermobbing in der Klasse',
    context: 'In einer Wiener Mittelschule wird ein Schüler über soziale Medien systematisch gemobbt. Die Eltern sind verzweifelt, die Schule will den Vorfall intern klären.',
    image: '🏫',
    choices: [
      { text: 'Schulpsychologin und Kinder- und Jugendanwaltschaft einschalten', type: 'official', score: 90, consequence: 'Professionelle Intervention stoppt das Mobbing. Präventionsprogramm wird eingeführt.', xpBonus: 25 },
      { text: 'Peer-Mediation durch ausgebildete Schüler', type: 'community', score: 82, consequence: 'Schüler lernen Konflikte selbst zu lösen. Klassenklima verbessert sich.', xpBonus: 20 },
      { text: 'Handyverbot an der Schule', type: 'restrict', score: 55, consequence: 'Mobbing verlagert sich nach Hause. Symptom bekämpft, nicht Ursache.', xpBonus: 10 },
      { text: 'Eltern sollen das untereinander klären', type: 'ignore', score: 20, consequence: 'Konflikt eskaliert. Betroffener Schüler wechselt die Schule.', xpBonus: 0 },
    ],
  },

  schule_inklusion: {
    title: 'Inklusiver Unterricht',
    context: 'Ein Kind mit Behinderung soll in eine Regelklasse integriert werden. Die Lehrerin fühlt sich überfordert, die Eltern der anderen Kinder sind gespalten.',
    image: '🏫',
    choices: [
      { text: 'Zusätzliche Lehrerstunden beantragen', type: 'official', score: 85, consequence: 'Mit Unterstützung gelingt die Inklusion. Das Kind und die Klasse profitieren.', xpBonus: 22 },
      { text: 'Elternabend zur Aufklärung', type: 'community', score: 80, consequence: 'Vorurteile werden abgebaut. Die Klasse wächst zusammen.', xpBonus: 18 },
      { text: 'Sonderschule empfehlen', type: 'reject', score: 25, consequence: 'Das Kind wird ausgeschlossen. Inklusion scheitert.', xpBonus: 0 },
      { text: 'Schulpsychologin einschalten', type: 'research', score: 88, consequence: 'Professionelle Unterstützung hilft allen Beteiligten.', xpBonus: 25 },
    ],
  },

  schule_streik: {
    title: 'Lehrerstreik',
    context: 'Lehrerinnen und Lehrer in Oberösterreich streiken für bessere Arbeitsbedingungen und kleinere Klassen. Eltern sind gespalten zwischen Solidarität und Sorge um verpassten Unterricht.',
    image: '🏫',
    choices: [
      { text: 'Runden Tisch zwischen Gewerkschaft und Ministerium', type: 'consensus', score: 88, consequence: 'Verhandlungen führen zu Kompromiss: kleinere Klassen und mehr Planstellen.', xpBonus: 22 },
      { text: 'Streikrecht verteidigen', type: 'rights', score: 80, consequence: 'Solidarität stärkt die Position. Regierung lenkt nach zwei Wochen ein.', xpBonus: 18 },
      { text: 'Elternprotest gegen den Streik', type: 'protest', score: 50, consequence: 'Lehrer und Eltern stehen gegeneinander. Kinder leiden am meisten.', xpBonus: 8 },
      { text: 'Streik per Gesetz verbieten', type: 'reject', score: 15, consequence: 'Grundrecht wird eingeschränkt. Internationale Kritik folgt.', xpBonus: 0 },
    ],
  },

  schule_religion: {
    title: 'Religionsunterricht',
    context: 'An einer Grazer Volksschule fordern muslimische Eltern einen eigenen Gebetsraum. Christliche Eltern fühlen sich benachteiligt, atheistische Eltern wollen gar keine Religion in der Schule.',
    image: '🏫',
    choices: [
      { text: 'Ethikunterricht für alle als gemeinsame Basis', type: 'consensus', score: 88, consequence: 'Alle Kinder lernen gemeinsam über Werte und Religionen. Verständnis wächst.', xpBonus: 22 },
      { text: 'Multireligiösen Raum der Stille einrichten', type: 'community', score: 85, consequence: 'Ein neutraler Rückzugsort für alle. Respekt und Toleranz werden gelebt.', xpBonus: 20 },
      { text: 'Nur christliche Tradition beibehalten', type: 'reject', score: 25, consequence: 'Ausgrenzung von Minderheiten. Konflikte verschärfen sich.', xpBonus: 0 },
      { text: 'Religion komplett aus der Schule verbannen', type: 'radical', score: 55, consequence: 'Religionsfreiheit wird eingeschränkt. Verfassungsrechtliche Bedenken.', xpBonus: 8 },
    ],
  },

  schule_budget: {
    title: 'Schulbudget-Krise',
    context: 'Eine Kärntner Gemeinde muss sparen. Musik- und Kunstunterricht sollen gestrichen werden. Eltern und Kulturvereine protestieren.',
    image: '🏫',
    choices: [
      { text: 'Kooperation mit lokalen Musikschulen und Vereinen', type: 'community', score: 90, consequence: 'Kreative Lösung: Vereine übernehmen Stunden. Kinder profitieren sogar mehr.', xpBonus: 25 },
      { text: 'Crowdfunding und Sponsoring organisieren', type: 'creative', score: 78, consequence: 'Kurzfristige Finanzierung gelingt. Langfristige Lösung fehlt noch.', xpBonus: 16 },
      { text: 'Kürzungen akzeptieren', type: 'passive', score: 30, consequence: 'Bildungsqualität sinkt. Talentierte Kinder verlieren Fördermöglichkeiten.', xpBonus: 0 },
      { text: 'Klage beim Verfassungsgerichtshof einreichen', type: 'official', score: 75, consequence: 'Langwieriges Verfahren, aber Grundrecht auf Bildung wird gestärkt.', xpBonus: 15 },
    ],
  },

  schule_smartphone: {
    title: 'Smartphone im Unterricht',
    context: 'Die Direktorin einer Salzburger NMS will Smartphones komplett verbieten. Schüler protestieren, Eltern sind uneinig, Lehrkräfte sehen Chancen und Risiken.',
    image: '🏫',
    choices: [
      { text: 'Medienkompetenz-Konzept mit klaren Regeln', type: 'consensus', score: 90, consequence: 'Smartphones werden zum Lernwerkzeug. Digitale Kompetenz steigt messbar.', xpBonus: 25 },
      { text: 'Smartphone-freie Zonen und -Zeiten definieren', type: 'compromise', score: 82, consequence: 'Ausgewogener Kompromiss. Pausen sind wieder sozial, Unterricht fokussiert.', xpBonus: 18 },
      { text: 'Komplettes Verbot durchsetzen', type: 'restrict', score: 50, consequence: 'Schüler schmuggeln Handys. Vertrauensverlust zwischen Schule und Kindern.', xpBonus: 8 },
      { text: 'Jeder Lehrer entscheidet selbst', type: 'passive', score: 35, consequence: 'Chaos durch unterschiedliche Regeln. Kein einheitlicher Standard.', xpBonus: 0 },
    ],
  },

  schule_schliessung: {
    title: 'Dorfschule vor dem Aus',
    context: 'Die letzte Volksschule in einer steirischen Berggemeinde soll wegen zu weniger Kinder geschlossen werden. Für die 23 Kinder wäre der nächste Schulweg 45 Minuten.',
    image: '🏫',
    choices: [
      { text: 'Schulcluster mit Nachbargemeinden bilden', type: 'consensus', score: 88, consequence: 'Gemeinsames Konzept sichert Standort. Klassen werden altersgemischt.', xpBonus: 22 },
      { text: 'Bürgerinitiative für Erhalt gründen', type: 'community', score: 80, consequence: 'Breite Unterstützung bewegt die Landesregierung zum Umdenken.', xpBonus: 18 },
      { text: 'Online-Unterricht als Ersatz', type: 'digital', score: 55, consequence: 'Technisch machbar, aber Kinder verlieren sozialen Kontakt.', xpBonus: 10 },
      { text: 'Schließung akzeptieren', type: 'passive', score: 20, consequence: 'Familien ziehen weg. Gemeinde stirbt langsam aus.', xpBonus: 0 },
    ],
  },

  schule_reform: {
    title: 'Bildungsreform',
    context: 'Das Bildungsministerium plant die Gesamtschule für alle 10- bis 14-Jährigen. Gymnasien sollen abgeschafft werden. Die Debatte spaltet Österreich.',
    image: '🏫',
    choices: [
      { text: 'Modellregionen testen, dann entscheiden', type: 'research', score: 92, consequence: 'Wissenschaftliche Begleitung liefert Daten. Reform wird evidenzbasiert umgesetzt.', xpBonus: 28 },
      { text: 'Sofortige Umstellung auf Gesamtschule', type: 'radical', score: 60, consequence: 'Überhastete Reform. Umsetzungsprobleme, aber langfristig mehr Chancengleichheit.', xpBonus: 12 },
      { text: 'System beibehalten wie es ist', type: 'conservative', score: 35, consequence: 'Bildungsschere bleibt. OECD-Ranking stagniert.', xpBonus: 0 },
      { text: 'Mehr Durchlässigkeit zwischen Schultypen', type: 'compromise', score: 82, consequence: 'Pragmatischer Weg. Kinder können leichter wechseln.', xpBonus: 20 },
    ],
  },

  schule_diskriminierung: {
    title: 'Diskriminierung im Klassenzimmer',
    context: 'Ein Kind mit Migrationshintergrund wird von Mitschülern systematisch ausgegrenzt. Der Klassenlehrer sagt: "Das regeln die Kinder unter sich."',
    image: '🏫',
    choices: [
      { text: 'Anti-Diskriminierungs-Workshop für die ganze Klasse', type: 'community', score: 88, consequence: 'Bewusstsein wächst. Kinder lernen Empathie und Respekt.', xpBonus: 22 },
      { text: 'Schulaufsicht über Lehrerverhalten informieren', type: 'official', score: 85, consequence: 'Lehrer wird zur Fortbildung verpflichtet. Schulkultur ändert sich.', xpBonus: 20 },
      { text: 'Kind in eine andere Klasse versetzen', type: 'passive', score: 40, consequence: 'Opfer wird bestraft, Täter lernen nichts. Problem verschoben.', xpBonus: 5 },
      { text: 'Gleichstellungsanwaltschaft einschalten', type: 'rights', score: 80, consequence: 'Formelles Verfahren sensibilisiert die gesamte Schule.', xpBonus: 18 },
    ],
  },

  schule_klimastreik: {
    title: 'Fridays for Future',
    context: 'Schülerinnen und Schüler in Linz wollen freitags für das Klima streiken. Die Direktorin droht mit unentschuldigten Fehlstunden. Eltern sind gespalten.',
    image: '🏫',
    choices: [
      { text: 'Klimaprojekttag als Kompromiss einführen', type: 'consensus', score: 88, consequence: 'Engagement wird kanalisiert. Schüler erarbeiten konkrete Klimaschutzmaßnahmen.', xpBonus: 22 },
      { text: 'Demonstrationsrecht der Schüler verteidigen', type: 'rights', score: 82, consequence: 'Politische Bildung in der Praxis. Demokratieverständnis wächst.', xpBonus: 18 },
      { text: 'Streik verbieten und bestrafen', type: 'reject', score: 25, consequence: 'Schüler fühlen sich nicht gehört. Frustration und Politikverdrossenheit steigen.', xpBonus: 0 },
      { text: 'Schüler entscheiden selbst', type: 'passive', score: 60, consequence: 'Einige streiken, andere nicht. Keine einheitliche Haltung der Schule.', xpBonus: 10 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // Welt 3: Arbeit (10 Szenarien)
  // ═══════════════════════════════════════════════════════════════

  arbeit_ueberstunden: {
    title: 'Überstunden-Konflikt',
    context: 'Mitarbeiter werden regelmäßig zu unbezahlten Überstunden gezwungen. Der Betriebsrat wurde nicht informiert.',
    image: '🏭',
    choices: [
      { text: 'Betriebsrat einschalten', type: 'official', score: 88, consequence: 'Der Betriebsrat verhandelt. Überstunden werden bezahlt.', xpBonus: 22 },
      { text: 'Arbeiterkammer informieren', type: 'expose', score: 85, consequence: 'Die AK prüft den Fall. Strafen für den Arbeitgeber folgen.', xpBonus: 20 },
      { text: 'Kollektive Verweigerung', type: 'protest', score: 70, consequence: 'Die Belegschaft hält zusammen. Überstunden werden reduziert.', xpBonus: 15 },
      { text: 'Nichts unternehmen', type: 'ignore', score: 10, consequence: 'Ausbeutung geht weiter. Burnout nimmt zu.', xpBonus: 0 },
    ],
  },

  arbeit_betriebsrat: {
    title: 'Betriebsratsgründung',
    context: 'In einem Tiroler Logistikzentrum wollen Mitarbeiter einen Betriebsrat gründen. Die Geschäftsführung droht mit Standortverlagerung.',
    image: '🏭',
    choices: [
      { text: 'Arbeiterkammer und Gewerkschaft hinzuziehen', type: 'official', score: 90, consequence: 'Betriebsratsgründung wird rechtlich abgesichert. Drohungen waren illegal.', xpBonus: 25 },
      { text: 'Betriebsversammlung einberufen', type: 'community', score: 85, consequence: 'Demokratischer Prozess läuft. Belegschaft wählt Vertreter.', xpBonus: 20 },
      { text: 'Heimlich mit der Geschäftsführung verhandeln', type: 'compromise', score: 55, consequence: 'Einige Zugeständnisse, aber ohne Betriebsrat keine echte Mitbestimmung.', xpBonus: 10 },
      { text: 'Auf Betriebsrat verzichten aus Angst', type: 'passive', score: 15, consequence: 'Arbeitnehmerrechte werden nicht wahrgenommen. Ausbeutung geht weiter.', xpBonus: 0 },
    ],
  },

  arbeit_fabrik: {
    title: 'Fabrikschließung',
    context: 'Ein traditionsreiches Vorarlberger Textilunternehmen verlagert die Produktion nach Bangladesch. 350 Arbeitsplätze sind bedroht.',
    image: '🏭',
    choices: [
      { text: 'Sozialplan mit Umschulungen und Abfindungen verhandeln', type: 'official', score: 88, consequence: 'Arbeitnehmer werden aufgefangen. Viele finden neue Jobs in der Region.', xpBonus: 22 },
      { text: 'Genossenschaftliche Übernahme prüfen', type: 'community', score: 85, consequence: 'Belegschaft übernimmt Fabrik. Nachhaltige Produktion als neues Geschäftsmodell.', xpBonus: 22 },
      { text: 'Protestmarsch und Medienaufmerksamkeit', type: 'protest', score: 65, consequence: 'Öffentlicher Druck verzögert die Schließung, verhindert sie aber nicht.', xpBonus: 12 },
      { text: 'Verlagerung stillschweigend akzeptieren', type: 'passive', score: 15, consequence: 'Region verliert wirtschaftliche Basis. Arbeitslosigkeit steigt dramatisch.', xpBonus: 0 },
    ],
  },

  arbeit_lohn: {
    title: 'Gender Pay Gap',
    context: 'Eine Mitarbeiterin in einem Wiener IT-Unternehmen erfährt, dass ihr männlicher Kollege für dieselbe Arbeit 20% mehr verdient.',
    image: '🏭',
    choices: [
      { text: 'Gleichbehandlungsanwaltschaft einschalten', type: 'rights', score: 90, consequence: 'Klage ist erfolgreich. Unternehmen muss Gehälter anpassen und nachzahlen.', xpBonus: 25 },
      { text: 'Transparente Gehaltstabellen fordern', type: 'official', score: 85, consequence: 'Unternehmen führt Gehaltsbänder ein. Lohnschere schließt sich.', xpBonus: 20 },
      { text: 'Individuell nachverhandeln', type: 'compromise', score: 60, consequence: 'Eigenes Gehalt steigt, aber strukturelles Problem bleibt.', xpBonus: 10 },
      { text: 'Nichts tun aus Angst vor Konsequenzen', type: 'passive', score: 15, consequence: 'Diskriminierung wird normalisiert. Weitere Frauen betroffen.', xpBonus: 0 },
    ],
  },

  arbeit_whistleblower: {
    title: 'Whistleblowing',
    context: 'Ein Angestellter in einem niederösterreichischen Pharmaunternehmen entdeckt gefälschte Testergebnisse bei einem Medikament. Sein Chef droht mit Kündigung.',
    image: '🏭',
    choices: [
      { text: 'Hinweisgeberschutzstelle nutzen', type: 'official', score: 92, consequence: 'HinweisgeberInnenschutzgesetz greift. Medikament wird vom Markt genommen.', xpBonus: 28 },
      { text: 'Anonym an Medien weitergeben', type: 'expose', score: 78, consequence: 'Skandal wird öffentlich. Schutz des Whistleblowers aber unsicher.', xpBonus: 16 },
      { text: 'Intern über Compliance-Abteilung melden', type: 'internal', score: 75, consequence: 'Compliance untersucht. Ergebnis hängt von der Unternehmenskultur ab.', xpBonus: 15 },
      { text: 'Schweigen und Job behalten', type: 'ignore', score: 10, consequence: 'Gefährliches Medikament bleibt am Markt. Menschen kommen zu Schaden.', xpBonus: 0 },
    ],
  },

  arbeit_homeoffice: {
    title: 'Homeoffice-Recht',
    context: 'Nach der Pandemie will ein Salzburger Unternehmen alle Mitarbeiter zurück ins Büro zwingen. Eltern und Pendler protestieren.',
    image: '🏭',
    choices: [
      { text: 'Betriebsvereinbarung für hybrides Arbeiten', type: 'consensus', score: 90, consequence: 'Flexible Lösung für alle. Produktivität steigt, Pendelzeit sinkt.', xpBonus: 25 },
      { text: 'Gesetzliches Recht auf Homeoffice fordern', type: 'rights', score: 80, consequence: 'Politische Debatte wird angestoßen. Gesetz kommt, aber dauert.', xpBonus: 18 },
      { text: 'Individuell mit Chef verhandeln', type: 'compromise', score: 55, consequence: 'Manche bekommen Homeoffice, andere nicht. Ungleichheit entsteht.', xpBonus: 10 },
      { text: 'Präsenzpflicht akzeptieren', type: 'passive', score: 25, consequence: 'Mitarbeiterzufriedenheit sinkt. Fluktuation steigt um 30%.', xpBonus: 0 },
    ],
  },

  arbeit_automatisierung: {
    title: 'Automatisierung',
    context: 'Ein steirisches Automobilwerk führt Roboter ein. 200 Arbeitsplätze an Fließbändern werden überflüssig. Die Gewerkschaft fordert Lösungen.',
    image: '🏭',
    choices: [
      { text: 'Umschulungsprogramm für digitale Berufe', type: 'official', score: 90, consequence: 'Mitarbeiter werden zu Roboter-Technikern umgeschult. Alle behalten Jobs.', xpBonus: 25 },
      { text: 'Arbeitszeitverkürzung bei vollem Lohn', type: 'community', score: 78, consequence: 'Arbeit wird verteilt. Freizeit steigt, aber Unternehmen unter Kostendruck.', xpBonus: 16 },
      { text: 'Automatisierung per Betriebsrat blockieren', type: 'protest', score: 45, consequence: 'Kurzfristig gerettet, aber Werk verliert Wettbewerbsfähigkeit.', xpBonus: 5 },
      { text: 'Markt soll es regeln', type: 'ignore', score: 20, consequence: 'Massenentlassungen. Sozialsystem wird belastet.', xpBonus: 0 },
    ],
  },

  arbeit_streikrecht: {
    title: 'Streikrecht im Krankenhaus',
    context: 'Pflegekräfte im Wiener AKH wollen streiken. Die Spitalleitung argumentiert, dass ein Streik Menschenleben gefährdet.',
    image: '🏭',
    choices: [
      { text: 'Notdienstvereinbarung und begrenzter Streik', type: 'consensus', score: 90, consequence: 'Patientensicherheit gewährleistet, Arbeitskampf wirkt trotzdem.', xpBonus: 25 },
      { text: 'Solidaritätsstreik anderer Gesundheitsberufe', type: 'community', score: 75, consequence: 'Breiter Druck führt zu Verhandlungen. Risiko durch Koordination minimiert.', xpBonus: 15 },
      { text: 'Streik komplett verbieten', type: 'reject', score: 30, consequence: 'Grundrecht eingeschränkt. Pflegekräfte fühlen sich machtlos.', xpBonus: 0 },
      { text: 'Schlichtungsstelle einrichten', type: 'official', score: 85, consequence: 'Neutrale Vermittlung führt zu fairem Kompromiss.', xpBonus: 22 },
    ],
  },

  arbeit_mindestlohn: {
    title: 'Mindestlohn-Debatte',
    context: 'Österreich hat keinen gesetzlichen Mindestlohn. Sozialpartner verhandeln, aber in manchen Branchen verdienen Vollzeitkräfte unter der Armutsgrenze.',
    image: '🏭',
    choices: [
      { text: 'Gesetzlichen Mindestlohn von 2.000€ brutto einführen', type: 'official', score: 85, consequence: 'Armut trotz Arbeit sinkt deutlich. Kleine Betriebe brauchen Unterstützung.', xpBonus: 22 },
      { text: 'Kollektivverträge stärken und lückenlos machen', type: 'consensus', score: 88, consequence: 'Sozialpartnerschaft wird gestärkt. Branchenspezifische Lösungen.', xpBonus: 22 },
      { text: 'Steuerliche Entlastung statt Mindestlohn', type: 'compromise', score: 60, consequence: 'Netto steigt etwas, aber Grundproblem niedriger Löhne bleibt.', xpBonus: 10 },
      { text: 'Markt regelt die Löhne', type: 'reject', score: 20, consequence: 'Working Poor nimmt zu. Soziale Spannungen steigen.', xpBonus: 0 },
    ],
  },

  arbeit_gewerkschaft: {
    title: 'Gewerkschaft unter Druck',
    context: 'Ein internationaler Konzern mit Standort in Linz verbietet gewerkschaftliche Aktivitäten im Betrieb. Mitarbeiter werden eingeschüchtert.',
    image: '🏭',
    choices: [
      { text: 'Arbeitsinspektion und Arbeiterkammer einschalten', type: 'official', score: 92, consequence: 'Verstoß gegen Arbeitsrecht wird geahndet. Gewerkschaftsfreiheit wird durchgesetzt.', xpBonus: 28 },
      { text: 'Internationale Gewerkschaftssolidarität organisieren', type: 'community', score: 82, consequence: 'Globaler Druck auf den Konzern wirkt. Betriebsvereinbarung wird möglich.', xpBonus: 18 },
      { text: 'Geheime Treffen außerhalb des Betriebs', type: 'compromise', score: 60, consequence: 'Gewerkschaft organisiert sich im Untergrund. Unsichere Rechtslage.', xpBonus: 10 },
      { text: 'Auf Gewerkschaft verzichten', type: 'passive', score: 10, consequence: 'Arbeitnehmerrechte werden ausgehöhlt. Löhne und Bedingungen verschlechtern sich.', xpBonus: 0 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // Welt 4: Medien (10 Szenarien)
  // ═══════════════════════════════════════════════════════════════

  medien_fakenews: {
    title: 'Fake News zur Wahl',
    context: 'Vor der Nationalratswahl verbreiten sich manipulierte Videos eines Kandidaten. Die Herkunft ist unklar, die Wirkung enorm.',
    image: '📰',
    choices: [
      { text: 'Unabhängige Faktencheck-Plattform einrichten', type: 'research', score: 90, consequence: 'Schnelle Richtigstellung erreicht Millionen. Vertrauen in Medien steigt.', xpBonus: 25 },
      { text: 'Plattformen zur Löschung verpflichten', type: 'official', score: 80, consequence: 'Videos werden entfernt, aber Zensur-Debatte entsteht.', xpBonus: 18 },
      { text: 'Medienkompetenz-Kampagne starten', type: 'community', score: 75, consequence: 'Langfristig wirksam, aber für diese Wahl zu spät.', xpBonus: 15 },
      { text: 'Ignorieren – die Wahrheit setzt sich durch', type: 'ignore', score: 20, consequence: 'Desinformation beeinflusst die Wahl. Demokratie nimmt Schaden.', xpBonus: 0 },
    ],
  },

  medien_redaktion: {
    title: 'Redaktionelle Unabhängigkeit',
    context: 'Der Eigentümer einer großen österreichischen Tageszeitung will kritische Berichte über befreundete Politiker unterdrücken. Die Redaktion wehrt sich.',
    image: '📰',
    choices: [
      { text: 'Redaktionsstatut mit Unabhängigkeitsgarantie fordern', type: 'rights', score: 90, consequence: 'Redaktion wird unabhängig vom Eigentümer. Pressefreiheit gesichert.', xpBonus: 25 },
      { text: 'Geschichte trotzdem veröffentlichen', type: 'expose', score: 85, consequence: 'Mutiger Journalismus deckt Verflechtungen auf. Öffentliche Debatte folgt.', xpBonus: 22 },
      { text: 'Presserat einschalten', type: 'official', score: 78, consequence: 'Ethische Richtlinien werden gestärkt, aber Eigentümer kann sie ignorieren.', xpBonus: 16 },
      { text: 'Selbstzensur üben', type: 'passive', score: 15, consequence: 'Journalismus wird zum Sprachrohr der Mächtigen. Leser verlieren Vertrauen.', xpBonus: 0 },
    ],
  },

  medien_pressefreiheit: {
    title: 'Pressefreiheit',
    context: 'Ein Journalist wurde verhaftet, weil er über Korruption in der Regierung berichtete. Internationale Organisationen protestieren.',
    image: '📰',
    choices: [
      { text: 'Öffentliche Solidaritätskampagne', type: 'mobilize', score: 88, consequence: 'Internationale Aufmerksamkeit erzwingt die Freilassung.', xpBonus: 25 },
      { text: 'Diplomatischen Druck ausüben', type: 'official', score: 80, consequence: 'Diplomatische Kanäle führen zur Freilassung nach Wochen.', xpBonus: 18 },
      { text: 'Rechtliche Unterstützung organisieren', type: 'rights', score: 85, consequence: 'Ein Anwaltsteam erkämpft die Freilassung vor Gericht.', xpBonus: 22 },
      { text: 'Schweigen', type: 'ignore', score: 15, consequence: 'Der Journalist bleibt inhaftiert. Pressefreiheit stirbt leise.', xpBonus: 0 },
    ],
  },

  medien_shitstorm: {
    title: 'Online-Shitstorm',
    context: 'Eine Lokalpolitikerin setzt sich für Geflüchtete ein und wird daraufhin mit Hass und Morddrohungen im Netz überzogen.',
    image: '📰',
    choices: [
      { text: 'Anzeige bei der Cybercrime-Stelle erstatten', type: 'official', score: 88, consequence: 'Täter werden ausgeforscht und verurteilt. Abschreckende Wirkung.', xpBonus: 22 },
      { text: 'Solidaritätskampagne #GegenhaltAT starten', type: 'community', score: 85, consequence: 'Tausende stellen sich hinter die Politikerin. Hater werden übertönt.', xpBonus: 22 },
      { text: 'Social-Media-Accounts löschen', type: 'retreat', score: 40, consequence: 'Hater gewinnen. Politikerin zieht sich aus der Öffentlichkeit zurück.', xpBonus: 5 },
      { text: 'Zurückschimpfen', type: 'escalate', score: 20, consequence: 'Eskalation. Medien berichten nur noch über den Streit, nicht über das Thema.', xpBonus: 0 },
    ],
  },

  medien_konzentration: {
    title: 'Medienkonzentration',
    context: 'Ein einziger Konzern besitzt bereits drei Tageszeitungen und will nun den größten Privatsender Österreichs kaufen. Medienvielfalt ist bedroht.',
    image: '📰',
    choices: [
      { text: 'Kartellbehörde muss Übernahme prüfen und blockieren', type: 'official', score: 90, consequence: 'Medienvielfalt bleibt erhalten. Neue Regulierung wird eingeführt.', xpBonus: 25 },
      { text: 'Medienvielfalt-Fonds für unabhängige Medien', type: 'community', score: 82, consequence: 'Kleine Medien werden gestärkt. Gegengewicht zum Konzern entsteht.', xpBonus: 18 },
      { text: 'Übernahme mit Auflagen genehmigen', type: 'compromise', score: 60, consequence: 'Auflagen werden umgangen. Konzentration schreitet schleichend voran.', xpBonus: 10 },
      { text: 'Freier Markt – soll der Konzern kaufen', type: 'reject', score: 20, consequence: 'Monopol entsteht. Meinungsvielfalt stirbt. Demokratie leidet.', xpBonus: 0 },
    ],
  },

  medien_quellenschutz: {
    title: 'Quellenschutz',
    context: 'Die Staatsanwaltschaft will eine Journalistin zwingen, ihre Quellen in einem Korruptionsfall preiszugeben. Der Presserat protestiert.',
    image: '📰',
    choices: [
      { text: 'Quellenschutz vor Gericht verteidigen', type: 'rights', score: 92, consequence: 'Grundrecht auf Pressefreiheit wird vom VfGH bestätigt. Meilenstein.', xpBonus: 28 },
      { text: 'Internationale Journalistenverbände mobilisieren', type: 'community', score: 82, consequence: 'Globaler Druck auf Österreich. Staatsanwaltschaft zieht zurück.', xpBonus: 18 },
      { text: 'Kompromiss – anonymisierte Informationen teilen', type: 'compromise', score: 60, consequence: 'Teilinformation genügt. Quelle bleibt geschützt, aber Präzedenzfall besorgt.', xpBonus: 10 },
      { text: 'Quelle preisgeben', type: 'betray', score: 10, consequence: 'Informant wird entlassen. Nie wieder traut sich jemand, Missstände zu melden.', xpBonus: 0 },
    ],
  },

  medien_desinformation: {
    title: 'Desinformation aus dem Ausland',
    context: 'Systematische Desinformationskampagnen aus dem Ausland verbreiten sich über österreichische Social-Media-Gruppen und destabilisieren den gesellschaftlichen Zusammenhalt.',
    image: '📰',
    choices: [
      { text: 'Nationale Resilienz-Strategie mit Bildung und Technik', type: 'research', score: 90, consequence: 'Medienkompetenz in Schulen, technische Erkennung und schnelle Richtigstellung.', xpBonus: 25 },
      { text: 'Social-Media-Regulierung verschärfen', type: 'official', score: 80, consequence: 'Plattformen müssen Desinformation kennzeichnen. Wirksam, aber langsam.', xpBonus: 18 },
      { text: 'Betroffene Gruppen sperren', type: 'restrict', score: 50, consequence: 'Symptombekämpfung. Gruppen tauchen unter anderem Namen wieder auf.', xpBonus: 8 },
      { text: 'Ist halt Meinungsfreiheit', type: 'ignore', score: 15, consequence: 'Desinformation wird normalisiert. Gesellschaftliche Spaltung vertieft sich.', xpBonus: 0 },
    ],
  },

  medien_staatlich: {
    title: 'ORF-Reform',
    context: 'Die Regierung will den ORF reformieren. Kritiker befürchten politische Einflussnahme, Befürworter sehen Modernisierungsbedarf.',
    image: '📰',
    choices: [
      { text: 'Unabhängigen Medienrat nach BBC-Vorbild einrichten', type: 'official', score: 90, consequence: 'ORF wird politisch unabhängig. Qualitätsjournalismus wird gestärkt.', xpBonus: 25 },
      { text: 'Publikumsrat demokratisch wählen lassen', type: 'community', score: 82, consequence: 'Bürger haben Mitsprache. ORF wird zum echten Volkssender.', xpBonus: 18 },
      { text: 'Regierung bestimmt ORF-Führung', type: 'reject', score: 20, consequence: 'ORF wird zum Regierungssender. Vertrauen sinkt dramatisch.', xpBonus: 0 },
      { text: 'ORF privatisieren', type: 'radical', score: 40, consequence: 'Grundversorgung gefährdet. Nur noch profitable Inhalte.', xpBonus: 5 },
    ],
  },

  medien_algorithmus: {
    title: 'Algorithmen-Transparenz',
    context: 'Social-Media-Algorithmen verstärken extreme Meinungen und schaffen Filterblasen. Österreichische Nutzer werden zunehmend radikalisiert.',
    image: '📰',
    choices: [
      { text: 'Algorithmen-Transparenzgesetz nach EU-Vorbild', type: 'official', score: 88, consequence: 'Plattformen müssen Algorithmen offenlegen. Nutzer verstehen, was sie sehen.', xpBonus: 22 },
      { text: 'Medienkompetenz ab der Volksschule', type: 'community', score: 85, consequence: 'Nächste Generation erkennt Manipulation. Langfristig die beste Lösung.', xpBonus: 22 },
      { text: 'Plattformen komplett verbieten', type: 'radical', score: 30, consequence: 'Unrealistisch und unverhältnismäßig. Umgehung ist einfach.', xpBonus: 0 },
      { text: 'Nutzer sind selbst verantwortlich', type: 'passive', score: 40, consequence: 'Individualisierung des Problems. Systemische Ursachen werden ignoriert.', xpBonus: 5 },
    ],
  },

  medien_zensur: {
    title: 'Kunstzensur',
    context: 'Eine Ausstellung im Wiener Museumsquartier wird wegen politisch provokativer Kunstwerke von der Landesregierung unter Druck gesetzt.',
    image: '📰',
    choices: [
      { text: 'Kunstfreiheit öffentlich verteidigen', type: 'rights', score: 90, consequence: 'Breite Solidarität. Kunstfreiheit als Grundrecht wird gestärkt.', xpBonus: 25 },
      { text: 'Dialog zwischen Künstlern und Politik moderieren', type: 'consensus', score: 78, consequence: 'Verständnis wächst auf beiden Seiten. Ausstellung bleibt mit Kontextinfo.', xpBonus: 16 },
      { text: 'Ausstellung schließen', type: 'reject', score: 15, consequence: 'Selbstzensur wird normal. Künstler meiden kontroverse Themen.', xpBonus: 0 },
      { text: 'Online-Petition starten', type: 'community', score: 72, consequence: 'Mediale Aufmerksamkeit, aber politischer Druck bleibt bestehen.', xpBonus: 12 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // Welt 5: Umwelt (10 Szenarien)
  // ═══════════════════════════════════════════════════════════════

  umwelt_plastik: {
    title: 'Plastikverbot',
    context: 'Die Gemeinde will Einwegplastik verbieten. Händler befürchten Umsatzeinbußen, Umweltschützer jubeln.',
    image: '🌍',
    choices: [
      { text: 'Schrittweises Verbot mit Übergangsfrist', type: 'consensus', score: 88, consequence: 'Händler haben Zeit zur Umstellung. Plastikverbrauch sinkt um 70%.', xpBonus: 22 },
      { text: 'Sofortiges Verbot', type: 'environment', score: 75, consequence: 'Plastik verschwindet sofort, aber Händler klagen.', xpBonus: 15 },
      { text: 'Freiwillige Selbstverpflichtung', type: 'voluntary', score: 55, consequence: 'Nur wenige Händler machen mit. Kaum Wirkung.', xpBonus: 8 },
      { text: 'Förderung von Alternativen', type: 'community', score: 85, consequence: 'Subventionen für nachhaltige Verpackungen beschleunigen den Wandel.', xpBonus: 20 },
    ],
  },

  umwelt_windpark: {
    title: 'Windpark im Waldviertel',
    context: 'Ein Windpark soll im Waldviertel gebaut werden. Anrainer klagen über Lärmbelästigung und Landschaftszerstörung, Klimaschützer fordern erneuerbare Energie.',
    image: '🌍',
    choices: [
      { text: 'Bürgerbeteiligung mit Genossenschaftsmodell', type: 'consensus', score: 90, consequence: 'Anrainer werden Miteigentümer. Akzeptanz steigt, Energiewende gelingt.', xpBonus: 25 },
      { text: 'Umweltverträglichkeitsprüfung und Standortoptimierung', type: 'research', score: 85, consequence: 'Wissenschaftliche Grundlage findet den besten Kompromiss-Standort.', xpBonus: 22 },
      { text: 'Windpark trotz Protesten durchsetzen', type: 'force', score: 50, consequence: 'Windpark steht, aber jahrelange Rechtsstreitigkeiten folgen.', xpBonus: 8 },
      { text: 'Projekt komplett aufgeben', type: 'reject', score: 30, consequence: 'Klimaziele werden verfehlt. Abhängigkeit von fossilen Brennstoffen bleibt.', xpBonus: 0 },
    ],
  },

  umwelt_hochwasser: {
    title: 'Hochwasserschutz',
    context: 'Nach verheerenden Überschwemmungen an der Donau streiten Gemeinden um den Hochwasserschutz. Rückhaltebecken würden Ackerland überfluten.',
    image: '🌍',
    choices: [
      { text: 'Natürliche Retentionsflächen wiederherstellen', type: 'environment', score: 92, consequence: 'Auen werden renaturiert. Hochwasserschutz und Biodiversität profitieren.', xpBonus: 28 },
      { text: 'Technischen Hochwasserschutz mit Entschädigung', type: 'official', score: 80, consequence: 'Bauern werden entschädigt. Schutz funktioniert, aber teuer.', xpBonus: 18 },
      { text: 'Jede Gemeinde schützt sich selbst', type: 'selfish', score: 35, consequence: 'Hochwasser wird zu Nachbargemeinden verlagert. Konflikte eskalieren.', xpBonus: 0 },
      { text: 'Bauverbote in Überschwemmungszonen', type: 'restrict', score: 75, consequence: 'Langfristig klug, aber politisch unpopulär bei betroffenen Grundbesitzern.', xpBonus: 15 },
    ],
  },

  umwelt_pestizide: {
    title: 'Pestizide in der Landwirtschaft',
    context: 'Bauern in der Wachau verwenden Pestizide, die Bienen gefährden. Bio-Winzer und Imker fordern ein Verbot, konventionelle Bauern fürchten Ernteausfälle.',
    image: '🌍',
    choices: [
      { text: 'Übergangsprogramm zu biologischem Pflanzenschutz', type: 'consensus', score: 90, consequence: 'Subventionierte Umstellung. Bienen erholen sich, Erträge bleiben stabil.', xpBonus: 25 },
      { text: 'Sofortiges Verbot der gefährlichsten Stoffe', type: 'environment', score: 78, consequence: 'Bienen geschützt, aber einige Bauern erleiden kurzfristig Verluste.', xpBonus: 16 },
      { text: 'Freiwillige Reduktion', type: 'voluntary', score: 50, consequence: 'Wenige machen mit. Bienensterben geht weiter.', xpBonus: 8 },
      { text: 'Wirtschaft geht vor Natur', type: 'reject', score: 20, consequence: 'Bienenpopulation bricht ein. Bestäubung gefährdet – Ernteausfälle folgen paradoxerweise.', xpBonus: 0 },
    ],
  },

  umwelt_co2steuer: {
    title: 'CO2-Steuer',
    context: 'Österreichs CO2-Bepreisung soll drastisch erhöht werden. Pendler und Geringverdiener befürchten Mehrbelastung, Klimawissenschaftler fordern schnelles Handeln.',
    image: '🌍',
    choices: [
      { text: 'CO2-Steuer mit Klimabonus-Rückzahlung an alle', type: 'consensus', score: 92, consequence: 'Sozial gerechte Lösung. CO2-Ausstoß sinkt, Geringverdiener profitieren sogar.', xpBonus: 28 },
      { text: 'Nur Industrie besteuern, Bürger schonen', type: 'compromise', score: 65, consequence: 'Industrie verlagert Produktion. Wirkung begrenzt.', xpBonus: 12 },
      { text: 'CO2-Steuer komplett ablehnen', type: 'reject', score: 20, consequence: 'Klimaziele werden meilenweit verfehlt. EU-Strafen drohen.', xpBonus: 0 },
      { text: 'Investition in Öffis statt Steuer', type: 'community', score: 80, consequence: 'Öffentlicher Verkehr wird ausgebaut. Gut, aber reicht allein nicht.', xpBonus: 18 },
    ],
  },

  umwelt_atom: {
    title: 'Atomkraft-Debatte',
    context: 'Nachbarländer bauen neue AKWs nahe der österreichischen Grenze. Österreich ist atomfrei, aber der Strom kommt trotzdem aus Atomkraftwerken.',
    image: '🌍',
    choices: [
      { text: 'Massive Investition in erneuerbare Energien', type: 'environment', score: 90, consequence: 'Österreich wird energieautark. Kein Atomstrom-Import mehr nötig.', xpBonus: 25 },
      { text: 'Diplomatischer Protest und EU-Klage', type: 'official', score: 80, consequence: 'Langwieriges Verfahren, aber Sicherheitsstandards werden verschärft.', xpBonus: 18 },
      { text: 'Grenznahe AKWs akzeptieren', type: 'passive', score: 30, consequence: 'Bevölkerung fühlt sich unsicher. Evakuierungspläne fehlen.', xpBonus: 0 },
      { text: 'Atomstrom-Import verbieten', type: 'radical', score: 55, consequence: 'Symbolpolitik. Strom im Netz lässt sich nicht nach Quelle trennen.', xpBonus: 10 },
    ],
  },

  umwelt_klimafluechtlinge: {
    title: 'Klimaflüchtlinge',
    context: 'Durch den steigenden Meeresspiegel verlieren Millionen ihre Heimat. Erste Klimaflüchtlinge erreichen Europa. Österreich diskutiert seine Verantwortung.',
    image: '🌍',
    choices: [
      { text: 'Internationalen Klimaschutzfonds mitfinanzieren', type: 'official', score: 88, consequence: 'Prävention an der Quelle. Weniger Fluchtursachen, globale Solidarität.', xpBonus: 22 },
      { text: 'Klimaflucht als Asylgrund anerkennen', type: 'rights', score: 82, consequence: 'Österreich zeigt Vorreiterrolle. EU-weite Debatte wird angestoßen.', xpBonus: 20 },
      { text: 'Grenzen dicht machen', type: 'reject', score: 20, consequence: 'Humanitäre Katastrophe. Internationales Ansehen Österreichs leidet.', xpBonus: 0 },
      { text: 'Entwicklungshilfe aufstocken', type: 'community', score: 75, consequence: 'Hilft, aber reicht nicht für die Dimension des Problems.', xpBonus: 15 },
    ],
  },

  umwelt_artenschutz: {
    title: 'Wolf zurück in Österreich',
    context: 'Wölfe kehren nach Österreich zurück. Bauern verlieren Schafe, Naturschützer feiern die Biodiversität. Der Konflikt eskaliert.',
    image: '🌍',
    choices: [
      { text: 'Herdenschutzprogramm mit staatlicher Förderung', type: 'consensus', score: 90, consequence: 'Zäune und Hirtenhunde schützen Herden. Wolf und Mensch koexistieren.', xpBonus: 25 },
      { text: 'Schadensersatz für betroffene Bauern', type: 'official', score: 78, consequence: 'Finanzielle Hilfe lindert Not, aber Konflikte bleiben.', xpBonus: 16 },
      { text: 'Wölfe zum Abschuss freigeben', type: 'reject', score: 30, consequence: 'EU-Strafe droht. Artenschutz wird untergraben.', xpBonus: 0 },
      { text: 'Wolfsmanagement-Plan mit allen Beteiligten', type: 'research', score: 85, consequence: 'Wissenschaftlich fundierter Plan schafft Ausgleich.', xpBonus: 22 },
    ],
  },

  umwelt_klimanotstand: {
    title: 'Klimanotstand ausrufen',
    context: 'Nach Rekord-Temperaturen im Sommer fordern Aktivisten, dass Österreich den Klimanotstand ausruft. Die Wirtschaft warnt vor Panikmache.',
    image: '🌍',
    choices: [
      { text: 'Klimanotstand mit konkretem Maßnahmenpaket', type: 'official', score: 90, consequence: 'Symbolkraft plus Taten. Klimaschutzgesetz wird verschärft.', xpBonus: 25 },
      { text: 'Klimarat der Bürgerinnen und Bürger einrichten', type: 'community', score: 85, consequence: 'Demokratische Legitimation. 100 zufällig gewählte Bürger erarbeiten Lösungen.', xpBonus: 22 },
      { text: 'Nur symbolisch, ohne Maßnahmen', type: 'passive', score: 40, consequence: 'Greenwashing. Glaubwürdigkeit der Politik sinkt weiter.', xpBonus: 5 },
      { text: 'Klimawandel ist übertrieben', type: 'deny', score: 10, consequence: 'Wissenschaftsleugnung. Österreich verliert international jeden Respekt.', xpBonus: 0 },
    ],
  },

  umwelt_generationen: {
    title: 'Generationengerechtigkeit',
    context: 'Junge Menschen klagen gegen die Republik Österreich, weil die Klimapolitik ihre Zukunft gefährde. Ein historischer Prozess.',
    image: '🌍',
    choices: [
      { text: 'Klimaschutz als Grundrecht in die Verfassung', type: 'rights', score: 92, consequence: 'Meilenstein. Zukünftige Generationen haben einklagbaren Anspruch auf intakte Umwelt.', xpBonus: 28 },
      { text: 'Klimaschutzgesetz verschärfen', type: 'official', score: 82, consequence: 'Verbindliche Ziele werden gesetzt. Klagende ziehen zurück.', xpBonus: 18 },
      { text: 'Klage abweisen', type: 'reject', score: 20, consequence: 'Jugend fühlt sich verraten. Radikalisierung nimmt zu.', xpBonus: 0 },
      { text: 'Jugendbeirat für Klimapolitik einrichten', type: 'community', score: 78, consequence: 'Jugend bekommt Stimme. Beratend, nicht entscheidend.', xpBonus: 16 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // Welt 6: Digital (10 Szenarien)
  // ═══════════════════════════════════════════════════════════════

  digital_datenschutz: {
    title: 'Datenschutz vs. Sicherheit',
    context: 'Nach einem Terroranschlag fordert der Innenminister die Vorratsdatenspeicherung aller Kommunikationsdaten. Datenschützer sind entsetzt.',
    image: '💻',
    choices: [
      { text: 'Gezielte Überwachung nur mit richterlichem Beschluss', type: 'rights', score: 90, consequence: 'Rechtsstaatlicher Kompromiss. Sicherheit und Freiheit in Balance.', xpBonus: 25 },
      { text: 'Anlasslose Massenüberwachung einführen', type: 'surveillance', score: 25, consequence: 'EuGH kippt Gesetz. Millionen Euro verschwendet, Vertrauen zerstört.', xpBonus: 0 },
      { text: 'Datenschutzbehörde stärken', type: 'official', score: 85, consequence: 'Unabhängige Kontrolle verhindert Missbrauch. Bürgerrechte bleiben gewahrt.', xpBonus: 22 },
      { text: 'Verschlüsselung fördern statt überwachen', type: 'digital', score: 80, consequence: 'Sichere Kommunikation für alle. Kriminelle müssen anders verfolgt werden.', xpBonus: 18 },
    ],
  },

  digital_ki_schule: {
    title: 'KI in der Schule',
    context: 'Schüler nutzen KI für Hausaufgaben. Lehrer sind überfordert, Eltern gespalten. Die Schule muss eine Richtlinie entwickeln.',
    image: '💻',
    choices: [
      { text: 'KI als Lernwerkzeug integrieren', type: 'digital', score: 90, consequence: 'Schüler lernen kritischen Umgang mit KI. Bildungsqualität steigt.', xpBonus: 28 },
      { text: 'KI-Nutzung verbieten', type: 'reject', score: 40, consequence: 'Schüler nutzen KI heimlich. Vertrauen schwindet.', xpBonus: 5 },
      { text: 'Medienkompetenz-Kurs einführen', type: 'research', score: 85, consequence: 'Schüler verstehen KI besser und nutzen sie verantwortungsvoll.', xpBonus: 22 },
      { text: 'Eltern entscheiden lassen', type: 'community', score: 70, consequence: 'Unterschiedliche Regeln pro Familie führen zu Ungleichheit.', xpBonus: 12 },
    ],
  },

  digital_kamera: {
    title: 'Überwachungskameras',
    context: 'Die Stadt Graz will 500 neue Überwachungskameras im öffentlichen Raum installieren. Bürgerrechtsorganisationen protestieren.',
    image: '💻',
    choices: [
      { text: 'Kameras nur an Kriminalitäts-Hotspots mit Datenschutzkonzept', type: 'consensus', score: 88, consequence: 'Gezielte Überwachung wirkt. Datenschutz wird mitgedacht.', xpBonus: 22 },
      { text: 'Bürgerbefragung durchführen', type: 'community', score: 80, consequence: 'Demokratische Legitimation. Bürger entscheiden über ihre Stadt.', xpBonus: 18 },
      { text: 'Flächendeckende Überwachung', type: 'surveillance', score: 30, consequence: 'Orwell lässt grüßen. Freiheitsgefühl in der Stadt sinkt dramatisch.', xpBonus: 0 },
      { text: 'Bessere Straßenbeleuchtung statt Kameras', type: 'creative', score: 75, consequence: 'Prävention statt Überwachung. Kriminalität sinkt ohne Freiheitseinschränkung.', xpBonus: 15 },
    ],
  },

  digital_kluft: {
    title: 'Digitale Kluft',
    context: 'Ältere Menschen und Geringverdiener haben keinen Zugang zu digitalen Behördendiensten. Ämter werden zunehmend nur online erreichbar.',
    image: '💻',
    choices: [
      { text: 'Digitale Grundversorgung als Recht + analoge Alternative', type: 'rights', score: 90, consequence: 'Niemand wird abgehängt. Digitalisierung wird inklusiv gestaltet.', xpBonus: 25 },
      { text: 'Kostenlose Digital-Schulungen in Gemeinden', type: 'community', score: 82, consequence: 'Senioren lernen digitale Kompetenz. Gemeinschaft wird gestärkt.', xpBonus: 18 },
      { text: 'Alles nur noch digital anbieten', type: 'radical', score: 25, consequence: 'Hunderttausende werden von Behördenleistungen ausgeschlossen.', xpBonus: 0 },
      { text: 'Gemeinde-Tablets für Bedürftige', type: 'official', score: 75, consequence: 'Hardwarezugang gesichert, aber Bedienungskompetenz fehlt oft.', xpBonus: 15 },
    ],
  },

  digital_deepfake: {
    title: 'Deepfake-Krise',
    context: 'Ein täuschend echtes Deepfake-Video zeigt den Bundespräsidenten bei einer angeblichen Bestechung. Es verbreitet sich viral.',
    image: '💻',
    choices: [
      { text: 'Schnelle staatliche Richtigstellung mit Technologie-Nachweis', type: 'official', score: 90, consequence: 'Forensische Analyse entlarvt Fälschung in Stunden. Vertrauen bleibt.', xpBonus: 25 },
      { text: 'Deepfake-Kennzeichnungspflicht einführen', type: 'rights', score: 82, consequence: 'Gesetz verpflichtet Plattformen zur Kennzeichnung. Langfristig wirksam.', xpBonus: 18 },
      { text: 'Plattformen sollen das selbst regeln', type: 'passive', score: 40, consequence: 'Freiwillige Maßnahmen greifen zu langsam. Schaden ist angerichtet.', xpBonus: 5 },
      { text: 'Alle KI-generierten Inhalte verbieten', type: 'radical', score: 30, consequence: 'Nicht durchsetzbar. Innovation wird gehemmt, Deepfakes existieren trotzdem.', xpBonus: 0 },
    ],
  },

  digital_monopol: {
    title: 'Tech-Monopole',
    context: 'Ein US-Tech-Konzern kontrolliert den Schulalltag: Tablets, Software, Cloud-Speicher. Schülerdaten liegen auf Servern in den USA.',
    image: '💻',
    choices: [
      { text: 'Europäische Open-Source-Alternative fördern', type: 'digital', score: 90, consequence: 'Daten bleiben in Europa. Digitale Souveränität wird gestärkt.', xpBonus: 25 },
      { text: 'DSGVO-konforme Verträge erzwingen', type: 'official', score: 82, consequence: 'Rechtliche Absicherung, aber Abhängigkeit bleibt.', xpBonus: 18 },
      { text: 'Günstigstes Angebot nehmen', type: 'passive', score: 30, consequence: 'Kinderdaten werden zur Ware. Langfristig teuer durch Lock-in.', xpBonus: 0 },
      { text: 'Schul-Cloud auf eigenen Servern', type: 'community', score: 78, consequence: 'Teurer, aber Datenhoheit gesichert. IT-Fachkräfte werden gebraucht.', xpBonus: 16 },
    ],
  },

  digital_ki_entscheidung: {
    title: 'KI entscheidet über Menschen',
    context: 'Das AMS setzt einen Algorithmus ein, der Arbeitssuchende in Kategorien einteilt und Förderungen zuweist. Frauen und Ältere werden systematisch benachteiligt.',
    image: '💻',
    choices: [
      { text: 'Algorithmus-Audit durch unabhängige Stelle', type: 'research', score: 90, consequence: 'Bias wird aufgedeckt und korrigiert. Algorithmus wird fair und transparent.', xpBonus: 25 },
      { text: 'KI-Einsatz bei existenziellen Entscheidungen verbieten', type: 'rights', score: 82, consequence: 'Menschen entscheiden über Menschen. Aufwändiger, aber gerechter.', xpBonus: 18 },
      { text: 'Algorithmus beibehalten – ist effizienter', type: 'passive', score: 25, consequence: 'Diskriminierung wird automatisiert. Betroffene verlieren Vertrauen ins System.', xpBonus: 0 },
      { text: 'KI als Unterstützung, Mensch entscheidet final', type: 'consensus', score: 88, consequence: 'Beste aus beiden Welten: Effizienz der KI plus menschliches Urteil.', xpBonus: 22 },
    ],
  },

  digital_identitaet: {
    title: 'Digitale Identität',
    context: 'Die EU plant eine einheitliche digitale Identität für alle Bürger. Österreich soll die ID Austria zum EU-Wallet ausbauen.',
    image: '💻',
    choices: [
      { text: 'Datensparsamkeit und Bürgerkontrolle als Grundprinzip', type: 'rights', score: 90, consequence: 'Bürger kontrollieren welche Daten sie teilen. Privatsphäre bleibt gewahrt.', xpBonus: 25 },
      { text: 'Schnelle Einführung für Verwaltungseffizienz', type: 'official', score: 75, consequence: 'Behördengänge werden einfacher, aber Datenschutzbedenken bleiben.', xpBonus: 15 },
      { text: 'EU-Wallet mit allen Daten auf dem Handy', type: 'digital', score: 55, consequence: 'Bequem, aber bei Handyverlust oder Hack katastrophale Folgen.', xpBonus: 10 },
      { text: 'Digitale Identität komplett ablehnen', type: 'reject', score: 30, consequence: 'Österreich wird zum digitalen Nachzügler in der EU.', xpBonus: 0 },
    ],
  },

  digital_cyberangriff: {
    title: 'Cyberangriff auf Infrastruktur',
    context: 'Hacker legen das Stromnetz in Teilen Niederösterreichs lahm. Krankenhäuser laufen auf Notstrom, Chaos droht.',
    image: '💻',
    choices: [
      { text: 'Nationales Cyber-Sicherheitszentrum sofort aktivieren', type: 'official', score: 92, consequence: 'Koordinierte Abwehr. Stromnetz wird in Stunden wiederhergestellt.', xpBonus: 28 },
      { text: 'Internationale Kooperation mit EU-CERT', type: 'community', score: 82, consequence: 'Gemeinsame Abwehr. Täter werden identifiziert und verfolgt.', xpBonus: 18 },
      { text: 'Lösegeld an die Hacker zahlen', type: 'passive', score: 15, consequence: 'Kurzfristige Lösung. Weitere Angriffe werden ermutigt.', xpBonus: 0 },
      { text: 'Kritische Infrastruktur vom Internet trennen', type: 'radical', score: 55, consequence: 'Sicher, aber technologischer Rückschritt. Effizienz leidet.', xpBonus: 10 },
    ],
  },

  digital_demokratie: {
    title: 'E-Voting',
    context: 'Österreich erwägt die Einführung von Online-Wahlen. Junge Menschen befürworten es, Sicherheitsexperten warnen vor Manipulation.',
    image: '💻',
    choices: [
      { text: 'Pilotprojekt bei Gemeinderatswahlen mit Open-Source-System', type: 'research', score: 88, consequence: 'Transparentes System wird getestet. Schwachstellen werden gefunden und behoben.', xpBonus: 22 },
      { text: 'Briefwahl ausbauen statt E-Voting', type: 'consensus', score: 82, consequence: 'Bewährtes System wird verbessert. Wahlbeteiligung steigt ohne Risiko.', xpBonus: 18 },
      { text: 'E-Voting sofort landesweit einführen', type: 'radical', score: 35, consequence: 'Sicherheitslücken werden ausgenutzt. Wahlergebnis wird angezweifelt.', xpBonus: 0 },
      { text: 'Nur Papierwahl – Technik ist manipulierbar', type: 'conservative', score: 65, consequence: 'Sicher, aber junge Wähler fühlen sich nicht angesprochen.', xpBonus: 12 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // Welt 7: Gesundheit (10 Szenarien)
  // ═══════════════════════════════════════════════════════════════

  gesundheit_impfung: {
    title: 'Impfpflicht-Debatte',
    context: 'Masernausbrüche in Salzburg. Die Durchimpfungsrate liegt unter 80%. Gesundheitsminister fordert Impfpflicht, Impfgegner mobilisieren.',
    image: '🏥',
    choices: [
      { text: 'Niederschwellige Impfangebote und Aufklärungskampagne', type: 'community', score: 88, consequence: 'Impfrate steigt auf 95% durch Vertrauen statt Zwang. Herdenschutz erreicht.', xpBonus: 22 },
      { text: 'Impfpflicht für Kinder in Gemeinschaftseinrichtungen', type: 'official', score: 82, consequence: 'Wirksam, aber gesellschaftliche Spaltung. Klagen vor dem VfGH.', xpBonus: 18 },
      { text: 'Generelle Impfpflicht für alle', type: 'radical', score: 55, consequence: 'Massive Proteste. Durchsetzung ist praktisch unmöglich.', xpBonus: 10 },
      { text: 'Impfung ist Privatsache', type: 'passive', score: 25, consequence: 'Masernausbrüche nehmen zu. Kinder sterben an vermeidbarer Krankheit.', xpBonus: 0 },
    ],
  },

  gesundheit_krankenhaus: {
    title: 'Krankenhausschließung',
    context: 'Ein ländliches Krankenhaus im Burgenland soll wegen Sparmaßnahmen geschlossen werden. Der nächste Notdienst wäre 45 Minuten entfernt.',
    image: '🏥',
    choices: [
      { text: 'Umwandlung in Gesundheitszentrum mit Notaufnahme', type: 'consensus', score: 90, consequence: 'Grundversorgung bleibt. Fachärzte kommen an bestimmten Tagen.', xpBonus: 25 },
      { text: 'Telemedizin und Notarzt-Helikopter', type: 'digital', score: 78, consequence: 'Moderne Lösung für Notfälle. Reguläre Versorgung aber eingeschränkt.', xpBonus: 16 },
      { text: 'Krankenhaus komplett schließen', type: 'reject', score: 20, consequence: 'Ältere Menschen ziehen weg. Region stirbt aus.', xpBonus: 0 },
      { text: 'Bürgerinitiative für den Erhalt', type: 'community', score: 80, consequence: 'Politischer Druck wirkt. Landesregierung findet Kompromiss.', xpBonus: 18 },
    ],
  },

  gesundheit_pflege: {
    title: 'Pflegenotstand',
    context: 'Pflegeheime melden akuten Personalmangel. Bewohner leiden, Pflegekräfte sind am Limit. Die Politik muss handeln.',
    image: '🏥',
    choices: [
      { text: 'Pflegegehälter sofort erhöhen', type: 'official', score: 88, consequence: 'Mehr Menschen wählen Pflegeberufe. Notstand entspannt sich.', xpBonus: 25 },
      { text: 'Ausbildungsoffensive starten', type: 'community', score: 80, consequence: 'Langfristig mehr Pflegekräfte, kurzfristig keine Lösung.', xpBonus: 18 },
      { text: 'Pflegeroboter einsetzen', type: 'digital', score: 65, consequence: 'Technologie hilft, ersetzt aber nicht menschliche Zuwendung.', xpBonus: 12 },
      { text: 'Angehörige zur Pflege verpflichten', type: 'reject', score: 20, consequence: 'Familien werden überfordert. Burnout in Privathaushalten steigt.', xpBonus: 0 },
    ],
  },

  gesundheit_medikamente: {
    title: 'Medikamentenpreise',
    context: 'Lebensrettende Krebsmedikamente kosten bis zu 100.000€ pro Jahr. Die Krankenkasse verweigert die Kostenübernahme für ein neues Mittel.',
    image: '🏥',
    choices: [
      { text: 'Gemeinsame EU-Preisverhandlung mit Pharmakonzernen', type: 'official', score: 90, consequence: 'Europäische Verhandlungsmacht drückt Preise. Medikament wird leistbar.', xpBonus: 25 },
      { text: 'Klage auf Kostenübernahme als Grundrecht', type: 'rights', score: 82, consequence: 'Wegweisendes Urteil: Recht auf Gesundheit umfasst Zugang zu Medikamenten.', xpBonus: 18 },
      { text: 'Generika-Produktion in Österreich fördern', type: 'community', score: 78, consequence: 'Langfristig günstiger. Patentrecht muss aber angepasst werden.', xpBonus: 16 },
      { text: 'Wer es sich leisten kann, bekommt es', type: 'reject', score: 15, consequence: 'Zwei-Klassen-Medizin. Arme sterben an behandelbaren Krankheiten.', xpBonus: 0 },
    ],
  },

  gesundheit_sterbehilfe: {
    title: 'Sterbehilfe',
    context: 'Nach dem VfGH-Urteil ist Beihilfe zum Suizid in Österreich erlaubt. Ein unheilbar kranker Patient bittet um assistierten Suizid.',
    image: '🏥',
    choices: [
      { text: 'Strenge Beratungspflicht und Wartefrist', type: 'consensus', score: 88, consequence: 'Selbstbestimmung wird respektiert, vorschnelle Entscheidungen verhindert.', xpBonus: 22 },
      { text: 'Palliativmedizin massiv ausbauen', type: 'community', score: 85, consequence: 'Viele wählen Palliativversorgung. Wunsch nach Sterbehilfe sinkt deutlich.', xpBonus: 22 },
      { text: 'Sterbehilfe ohne Einschränkungen', type: 'radical', score: 45, consequence: 'Missbrauchsgefahr steigt. Druck auf vulnerable Gruppen möglich.', xpBonus: 5 },
      { text: 'Sterbehilfe wieder verbieten', type: 'reject', score: 30, consequence: 'Verfassungswidrig. Menschen leiden unnötig am Lebensende.', xpBonus: 0 },
    ],
  },

  gesundheit_pandemie: {
    title: 'Pandemie-Vorsorge',
    context: 'Experten warnen vor der nächsten Pandemie. Österreich hat kaum eigene Impfstoffproduktion und die Lager sind leer.',
    image: '🏥',
    choices: [
      { text: 'Nationale Pandemie-Strategie mit Reserven und Produktion', type: 'official', score: 92, consequence: 'Österreich ist vorbereitet. Bei nächster Pandemie schnelle Reaktion möglich.', xpBonus: 28 },
      { text: 'EU-weite Koordination und gemeinsame Beschaffung', type: 'consensus', score: 85, consequence: 'Europäische Solidarität sichert Versorgung. Effizienter als Alleingang.', xpBonus: 22 },
      { text: 'Wird schon nicht so schlimm', type: 'ignore', score: 15, consequence: 'Bei nächster Pandemie Chaos wie 2020. Vermeidbare Todesfälle.', xpBonus: 0 },
      { text: 'Nur Händedesinfektionsmittel einlagern', type: 'passive', score: 35, consequence: 'Tropfen auf den heißen Stein. Keine systemische Vorbereitung.', xpBonus: 0 },
    ],
  },

  gesundheit_klassen: {
    title: 'Zwei-Klassen-Medizin',
    context: 'Privatversicherte bekommen sofort einen MRT-Termin, Kassenpatient:innen warten 12 Wochen. Eine Patientin stirbt während der Wartezeit.',
    image: '🏥',
    choices: [
      { text: 'Wartezeiten-Garantie für lebensbedrohliche Diagnosen', type: 'rights', score: 90, consequence: 'Maximale Wartezeit per Gesetz. Kassen müssen Privat-Kapazitäten nutzen.', xpBonus: 25 },
      { text: 'Mehr Kassenvertragsstellen schaffen', type: 'official', score: 85, consequence: 'Wartezeiten sinken. Ärzte haben weniger Anreiz zur Privatordination.', xpBonus: 22 },
      { text: 'Privatversicherung für alle subventionieren', type: 'compromise', score: 50, consequence: 'Teuer für den Staat. Zwei-Klassen-System wird zementiert.', xpBonus: 8 },
      { text: 'System ist halt so – wer zahlt, kommt zuerst', type: 'reject', score: 15, consequence: 'Gesundheit wird zur Klassenfrage. Gesellschaftliche Spaltung vertieft sich.', xpBonus: 0 },
    ],
  },

  gesundheit_gentherapie: {
    title: 'Gentherapie-Ethik',
    context: 'Eine neue Gentherapie könnte Erbkrankheiten heilen, birgt aber Risiken und ethische Fragen. Die erste Klinik in Innsbruck will sie anbieten.',
    image: '🏥',
    choices: [
      { text: 'Ethikkommission und strenge klinische Studien', type: 'research', score: 92, consequence: 'Wissenschaftlich fundierte Entscheidung. Therapie wird sicher eingesetzt.', xpBonus: 28 },
      { text: 'Nur bei schweren Erbkrankheiten erlauben', type: 'consensus', score: 82, consequence: 'Klare Grenzen. Enhancement verboten, Heilung erlaubt.', xpBonus: 18 },
      { text: 'Sofort für alle verfügbar machen', type: 'radical', score: 40, consequence: 'Nebenwirkungen treten auf. Vertrauen in die Medizin leidet.', xpBonus: 5 },
      { text: 'Gentherapie komplett verbieten', type: 'reject', score: 25, consequence: 'Patienten reisen ins Ausland. Österreich verliert medizinische Kompetenz.', xpBonus: 0 },
    ],
  },

  gesundheit_bioethik: {
    title: 'Bioethik und KI-Diagnostik',
    context: 'Ein KI-System diagnostiziert Krebs genauer als Ärzte, macht aber keine Fehler transparent. Wer haftet bei Fehldiagnosen?',
    image: '🏥',
    choices: [
      { text: 'KI als Unterstützung, Arzt entscheidet und haftet', type: 'consensus', score: 90, consequence: 'Beste Kombination: KI-Genauigkeit plus ärztliche Verantwortung.', xpBonus: 25 },
      { text: 'Transparenz-Pflicht für medizinische KI', type: 'rights', score: 85, consequence: 'Algorithmus muss erklärbar sein. Vertrauen bei Patienten steigt.', xpBonus: 22 },
      { text: 'KI ersetzt Ärzte bei Routinediagnosen', type: 'radical', score: 45, consequence: 'Effizient, aber Patienten fühlen sich als Nummern.', xpBonus: 5 },
      { text: 'KI in der Medizin verbieten', type: 'reject', score: 20, consequence: 'Patienten profitieren nicht vom Fortschritt. Vermeidbare Fehldiagnosen.', xpBonus: 0 },
    ],
  },

  gesundheit_global: {
    title: 'Globale Gesundheit',
    context: 'Österreich soll seinen Beitrag zum globalen Gesundheitsfonds verdoppeln. Kritiker sagen: "Zuerst unsere eigenen Probleme lösen."',
    image: '🏥',
    choices: [
      { text: 'Beitrag erhöhen – Pandemien kennen keine Grenzen', type: 'official', score: 88, consequence: 'Millionen Menschenleben werden gerettet. Nächste Pandemie wird verhindert.', xpBonus: 22 },
      { text: 'Gezielte Projekte statt Pauschalzahlungen', type: 'research', score: 82, consequence: 'Transparenz und Effizienz. Jeder Euro wirkt nachweisbar.', xpBonus: 18 },
      { text: 'Beitrag kürzen', type: 'reject', score: 20, consequence: 'Österreich isoliert sich. Globale Gesundheitslücken treffen auch uns.', xpBonus: 0 },
      { text: 'Medizinisches Personal entsenden statt Geld', type: 'community', score: 75, consequence: 'Wissenstransfer hilft langfristig. Kurzfristig aber zu wenig.', xpBonus: 15 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // Welt 8: Europa (10 Szenarien)
  // ═══════════════════════════════════════════════════════════════

  europa_beitritt: {
    title: 'EU-Erweiterung',
    context: 'Die Westbalkan-Staaten wollen der EU beitreten. Österreich als Nachbar muss Position beziehen. Wirtschaft hofft auf neue Märkte, Bevölkerung ist skeptisch.',
    image: '🇪🇺',
    choices: [
      { text: 'Beitritt unterstützen mit klaren Reformbedingungen', type: 'consensus', score: 88, consequence: 'Stabilität am Balkan wächst. Wirtschaftliche Zusammenarbeit bringt Vorteile.', xpBonus: 22 },
      { text: 'Stufenweise Integration vor Vollbeitritt', type: 'official', score: 85, consequence: 'Pragmatischer Weg. Reformdruck bleibt, Bürger werden vorbereitet.', xpBonus: 22 },
      { text: 'Beitritt blockieren', type: 'reject', score: 30, consequence: 'Westbalkan wendet sich China und Russland zu. Instabilität vor der Haustür.', xpBonus: 0 },
      { text: 'Wirtschaftszone ohne politische Integration', type: 'compromise', score: 65, consequence: 'Handel wächst, aber politische Probleme bleiben ungelöst.', xpBonus: 12 },
    ],
  },

  europa_fluechtlinge: {
    title: 'Europäische Flüchtlingspolitik',
    context: 'Tausende Geflüchtete sitzen an der EU-Außengrenze fest. Der EU-Verteilungsschlüssel wird von mehreren Ländern abgelehnt. Österreich muss sich positionieren.',
    image: '🇪🇺',
    choices: [
      { text: 'Solidarische Verteilung mit Integrationsunterstützung', type: 'consensus', score: 88, consequence: 'Geordnete Aufnahme funktioniert. Integration gelingt mit Sprachkursen und Arbeit.', xpBonus: 22 },
      { text: 'Fluchtursachen vor Ort bekämpfen', type: 'official', score: 80, consequence: 'Langfristig richtig, hilft den Menschen an der Grenze aber nicht sofort.', xpBonus: 18 },
      { text: 'Grenzen schließen', type: 'reject', score: 25, consequence: 'Humanitäre Katastrophe. EU-Solidarität zerbricht.', xpBonus: 0 },
      { text: 'Asylverfahren in Drittstaaten', type: 'outsource', score: 55, consequence: 'Rechtlich bedenklich. Menschenrechte in Drittstaaten unkontrollierbar.', xpBonus: 8 },
    ],
  },

  europa_euro: {
    title: 'Euro-Krise',
    context: 'Ein EU-Mitgliedsland steht vor dem Staatsbankrott. Soll Österreich mit Steuergeldern helfen?',
    image: '🇪🇺',
    choices: [
      { text: 'Solidarität zeigen – Hilfspaket unterstützen', type: 'consensus', score: 82, consequence: 'Europa hält zusammen. Langfristig profitiert auch Österreich.', xpBonus: 20 },
      { text: 'Hilfe an Reformen knüpfen', type: 'official', score: 78, consequence: 'Konditionale Hilfe führt zu Reformen, aber auch zu sozialen Spannungen.', xpBonus: 16 },
      { text: 'Ablehnen – nationale Interessen first', type: 'national', score: 35, consequence: 'Österreich wird isoliert. Der Euro gerät unter Druck.', xpBonus: 0 },
      { text: 'Schuldenschnitt verhandeln', type: 'compromise', score: 75, consequence: 'Ein Kompromiss wird gefunden. Schmerzhaft, aber nachhaltig.', xpBonus: 15 },
    ],
  },

  europa_schengen: {
    title: 'Schengen-Krise',
    context: 'Mehrere EU-Staaten führen Grenzkontrollen wieder ein. Pendler und Wirtschaft leiden. Österreich kontrolliert an der Grenze zu Ungarn.',
    image: '🇪🇺',
    choices: [
      { text: 'Schengen stärken durch besseren EU-Außengrenzschutz', type: 'official', score: 88, consequence: 'Frontex wird reformiert. Binnengrenzkontrollen werden überflüssig.', xpBonus: 22 },
      { text: 'Nachbarschaftliche Polizeikooperation statt Kontrollen', type: 'community', score: 82, consequence: 'Gemeinsame Streifen wirken effektiver als Staus an der Grenze.', xpBonus: 18 },
      { text: 'Dauerhafte Grenzkontrollen einrichten', type: 'national', score: 35, consequence: 'EU-Binnenmarkt wird gestört. Pendler verlieren Stunden täglich.', xpBonus: 0 },
      { text: 'Technologiebasierte Grenzüberwachung', type: 'digital', score: 75, consequence: 'Smart Borders erkennen Risiken ohne Staus. Datenschutzbedenken bleiben.', xpBonus: 15 },
    ],
  },

  europa_sanktionen: {
    title: 'EU-Sanktionen',
    context: 'Die EU verhängt Wirtschaftssanktionen gegen ein autoritäres Regime. Österreichische Unternehmen verlieren Millionenaufträge.',
    image: '🇪🇺',
    choices: [
      { text: 'Sanktionen mittragen und betroffene Firmen unterstützen', type: 'consensus', score: 88, consequence: 'Europäische Einigkeit wirkt. Firmen finden neue Märkte mit EU-Hilfe.', xpBonus: 22 },
      { text: 'Sanktionen verschärfen', type: 'official', score: 78, consequence: 'Maximaler Druck. Wirtschaftlicher Schaden auch in Österreich.', xpBonus: 16 },
      { text: 'Sanktionen aufheben – schadet nur uns', type: 'reject', score: 25, consequence: 'EU-Solidarität zerbricht. Autoritäres Regime wird gestärkt.', xpBonus: 0 },
      { text: 'Diplomatische Kanäle parallel nutzen', type: 'compromise', score: 82, consequence: 'Druck und Dialog kombiniert. Chancen auf Lösung steigen.', xpBonus: 18 },
    ],
  },

  europa_rechtsstaat: {
    title: 'Rechtsstaatlichkeit in der EU',
    context: 'Ein EU-Mitgliedsland baut Justiz und Medien systematisch ab. Die EU-Kommission will Gelder kürzen. Österreich muss abstimmen.',
    image: '🇪🇺',
    choices: [
      { text: 'Für Mittelkürzung stimmen – Rechtsstaat ist nicht verhandelbar', type: 'rights', score: 90, consequence: 'Klares Signal. Rechtsstaatsmechanismus wird gestärkt.', xpBonus: 25 },
      { text: 'Dialog und sanften Druck bevorzugen', type: 'consensus', score: 70, consequence: 'Gesprächsbereit, aber zahnlos. Abbau geht weiter.', xpBonus: 12 },
      { text: 'Ist innere Angelegenheit des Landes', type: 'passive', score: 25, consequence: 'Demokratie in der EU erodiert. Signalwirkung für andere.', xpBonus: 0 },
      { text: 'Artikel-7-Verfahren einleiten', type: 'official', score: 85, consequence: 'Schärfstes Mittel. Politisch riskant, aber demokratische Werte verteidigt.', xpBonus: 22 },
    ],
  },

  europa_armee: {
    title: 'Europäische Armee',
    context: 'Angesichts geopolitischer Spannungen fordert der EU-Außenbeauftragte eine gemeinsame europäische Armee. Österreichs Neutralität steht in Frage.',
    image: '🇪🇺',
    choices: [
      { text: 'Neutralität bewahren, aber EU-Verteidigungskooperation stärken', type: 'consensus', score: 85, consequence: 'Österreich trägt bei ohne Neutralität aufzugeben. Pragmatischer Kompromiss.', xpBonus: 22 },
      { text: 'Neutralität aufgeben und voll integrieren', type: 'radical', score: 55, consequence: 'Historischer Bruch. Gesellschaftliche Debatte spaltet das Land.', xpBonus: 10 },
      { text: 'Strikt neutral bleiben – keine Beteiligung', type: 'national', score: 40, consequence: 'Österreich isoliert sich sicherheitspolitisch. Schutz durch andere.', xpBonus: 5 },
      { text: 'Volksbefragung zur Neutralität', type: 'community', score: 82, consequence: 'Demokratische Legitimation. Bürger entscheiden über ihre Zukunft.', xpBonus: 18 },
    ],
  },

  europa_brexit: {
    title: 'Lehren aus dem Brexit',
    context: 'Populisten in Österreich fordern einen "Öxit" – den Austritt aus der EU. Umfragen zeigen wachsende EU-Skepsis.',
    image: '🇪🇺',
    choices: [
      { text: 'EU-Vorteile sichtbar machen und Reformen vorantreiben', type: 'community', score: 90, consequence: 'Bürger verstehen den Mehrwert der EU. Zustimmung steigt auf Rekordhoch.', xpBonus: 25 },
      { text: 'Konstruktive EU-Kritik als Reformmotor nutzen', type: 'consensus', score: 82, consequence: 'Kritik wird ernst genommen. EU wird bürgernäher.', xpBonus: 18 },
      { text: 'Öxit-Volksabstimmung durchführen', type: 'radical', score: 30, consequence: 'Wirtschaftliches Chaos droht. Britisches Beispiel zeigt die Folgen.', xpBonus: 0 },
      { text: 'EU-Skeptiker ignorieren', type: 'passive', score: 40, consequence: 'Unzufriedenheit wächst im Stillen. Nächste Wahl bringt Überraschung.', xpBonus: 5 },
    ],
  },

  europa_demokratie: {
    title: 'Demokratie in der EU',
    context: 'Das EU-Parlament hat zu wenig Macht, kritisieren viele. Rat und Kommission entscheiden über die Köpfe der Bürger hinweg.',
    image: '🇪🇺',
    choices: [
      { text: 'EU-Parlament stärken – Initiativrecht einführen', type: 'rights', score: 90, consequence: 'Demokratisches Defizit wird behoben. Bürger fühlen sich besser vertreten.', xpBonus: 25 },
      { text: 'Transnationale Listen bei EU-Wahlen', type: 'community', score: 80, consequence: 'Europäische Parteien statt nationaler Listen. Europäische Öffentlichkeit entsteht.', xpBonus: 18 },
      { text: 'Zurück zum Europa der Nationalstaaten', type: 'national', score: 30, consequence: 'EU wird handlungsunfähig. Kleine Staaten wie Österreich verlieren Einfluss.', xpBonus: 0 },
      { text: 'EU-weite Bürgerräte einrichten', type: 'consensus', score: 85, consequence: 'Direkte Demokratie auf EU-Ebene. Innovative Bürgerbeteiligung.', xpBonus: 22 },
    ],
  },

  europa_zukunft: {
    title: 'Zukunft Europas',
    context: 'Die Konferenz zur Zukunft Europas präsentiert ihre Ergebnisse. Österreich muss entscheiden, welches Europa es will.',
    image: '🇪🇺',
    choices: [
      { text: 'Föderale EU mit starken Regionen und Subsidiarität', type: 'consensus', score: 88, consequence: 'Europa der Regionen. Nahe an den Bürgern und trotzdem global handlungsfähig.', xpBonus: 22 },
      { text: 'Vereinigte Staaten von Europa', type: 'radical', score: 60, consequence: 'Visionär, aber viele Staaten blockieren. Langfristig möglicherweise notwendig.', xpBonus: 12 },
      { text: 'Status quo beibehalten', type: 'passive', score: 40, consequence: 'Reformstau bleibt. EU verliert global an Bedeutung.', xpBonus: 5 },
      { text: 'Europa der zwei Geschwindigkeiten', type: 'official', score: 80, consequence: 'Willige gehen voran. Pragmatisch, aber Spaltungsgefahr.', xpBonus: 18 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // Welt 9: Gerechtigkeit (10 Szenarien)
  // ═══════════════════════════════════════════════════════════════

  recht_strafe: {
    title: 'Strafrecht und Resozialisierung',
    context: 'Ein Straftäter hat seine Haft abgesessen und will neu anfangen. Die Gemeinde wehrt sich gegen seine Rückkehr.',
    image: '⚖️',
    choices: [
      { text: 'Resozialisierungsprogramm mit Begleitung', type: 'official', score: 90, consequence: 'Professionelle Betreuung hilft. Rückfallquote sinkt dramatisch.', xpBonus: 25 },
      { text: 'Bürgerinformation und moderierter Dialog', type: 'community', score: 82, consequence: 'Ängste werden abgebaut. Gemeinde gibt dem Menschen eine Chance.', xpBonus: 18 },
      { text: 'Ex-Häftling soll woanders hinziehen', type: 'reject', score: 25, consequence: 'Problem wird verschoben. Betroffener findet nirgends Anschluss.', xpBonus: 0 },
      { text: 'Elektronische Fußfessel und Überwachung', type: 'surveillance', score: 60, consequence: 'Sicherheit gewährleistet, aber Stigmatisierung verhindert Integration.', xpBonus: 10 },
    ],
  },

  recht_minderheit: {
    title: 'Minderheitenschutz',
    context: 'Die slowenische Minderheit in Kärnten fordert zweisprachige Ortstafeln in weiteren Gemeinden. Teile der Bevölkerung lehnen das ab.',
    image: '⚖️',
    choices: [
      { text: 'Staatsvertrag umsetzen – zweisprachige Ortstafeln aufstellen', type: 'rights', score: 92, consequence: 'Internationales Recht wird endlich eingehalten. Minderheit fühlt sich anerkannt.', xpBonus: 28 },
      { text: 'Bürgerbefragung in betroffenen Gemeinden', type: 'community', score: 70, consequence: 'Demokratisch, aber Mehrheit entscheidet über Minderheitenrechte.', xpBonus: 12 },
      { text: 'Keine zweisprachigen Tafeln – wir sind in Österreich', type: 'reject', score: 15, consequence: 'Völkerrechtsbruch. Internationale Kritik und Verfahren vor dem EGMR.', xpBonus: 0 },
      { text: 'Kompromiss: zusätzliche Tafeln statt Ersatz', type: 'consensus', score: 82, consequence: 'Pragmatische Lösung, die beide Seiten leben können.', xpBonus: 18 },
    ],
  },

  recht_meinung: {
    title: 'Meinungsfreiheit vs. Hassrede',
    context: 'Ein Politiker hetzt öffentlich gegen eine religiöse Minderheit. Ist das noch Meinungsfreiheit oder schon Verhetzung?',
    image: '⚖️',
    choices: [
      { text: 'Anklage wegen Verhetzung nach § 283 StGB', type: 'official', score: 88, consequence: 'Gericht setzt klare Grenze. Hassrede hat Konsequenzen.', xpBonus: 22 },
      { text: 'Gesellschaftliche Gegenstimmen organisieren', type: 'community', score: 82, consequence: 'Zivilgesellschaft zeigt: Hass hat keinen Platz. Keine juristische Lösung.', xpBonus: 18 },
      { text: 'Meinungsfreiheit geht vor', type: 'passive', score: 30, consequence: 'Hassrede wird normalisiert. Betroffene Minderheit lebt in Angst.', xpBonus: 0 },
      { text: 'Social-Media-Sperre für den Politiker', type: 'restrict', score: 55, consequence: 'Plattform-Maßnahme, aber Märtyrer-Narrativ wird gestärkt.', xpBonus: 8 },
    ],
  },

  recht_asyl: {
    title: 'Asylrecht',
    context: 'Eine Familie aus Afghanistan soll abgeschoben werden, obwohl die Kinder in Innsbruck eingeschult sind und perfekt Deutsch sprechen. Die Gemeinde protestiert.',
    image: '⚖️',
    choices: [
      { text: 'Humanitäres Bleiberecht prüfen und gewähren', type: 'rights', score: 90, consequence: 'Familie darf bleiben. Kinder werden zu integrierten Erwachsenen.', xpBonus: 25 },
      { text: 'Kirchenasyl als Notlösung', type: 'community', score: 75, consequence: 'Symbolischer Schutz, rechtlich unsicher. Mediale Aufmerksamkeit hilft.', xpBonus: 15 },
      { text: 'Gesetz ist Gesetz – abschieben', type: 'strict', score: 30, consequence: 'Kinder werden traumatisiert. Gemeinde verliert Vertrauen in den Staat.', xpBonus: 0 },
      { text: 'Petition an den Bundesminister', type: 'official', score: 78, consequence: 'Politischer Druck wirkt manchmal. Keine Garantie, aber Chance.', xpBonus: 16 },
    ],
  },

  recht_gleichberechtigung: {
    title: 'Gleichberechtigung',
    context: 'Frauen verdienen in Österreich im Schnitt 18% weniger als Männer. Eine Klage gegen ein Unternehmen landet vor Gericht.',
    image: '⚖️',
    choices: [
      { text: 'Klage stattgeben – Lohngleichheit erzwingen', type: 'rights', score: 92, consequence: 'Wegweisendes Urteil. Andere Unternehmen folgen freiwillig.', xpBonus: 30 },
      { text: 'Unternehmen zur Selbstverpflichtung drängen', type: 'consensus', score: 70, consequence: 'Langsamer Wandel. Lohnlücke schließt sich über Jahre.', xpBonus: 15 },
      { text: 'Klage abweisen', type: 'reject', score: 15, consequence: 'Diskriminierung bleibt legal. Internationale Kritik folgt.', xpBonus: 0 },
      { text: 'Gesetzliche Lohntransparenz einführen', type: 'official', score: 88, consequence: 'Transparenz zeigt Ungleichheiten auf. Druck auf Unternehmen steigt.', xpBonus: 25 },
    ],
  },

  recht_unabhaengigkeit: {
    title: 'Richterliche Unabhängigkeit',
    context: 'Die Regierung will die Weisungsgebundenheit der Staatsanwaltschaft beibehalten. Richtervereinigung und Opposition fordern eine unabhängige Bundesstaatsanwaltschaft.',
    image: '⚖️',
    choices: [
      { text: 'Unabhängige Bundesstaatsanwaltschaft einrichten', type: 'rights', score: 92, consequence: 'Gewaltenteilung wird gestärkt. Korruptionsbekämpfung ohne politische Einflussnahme.', xpBonus: 28 },
      { text: 'Weisungsrecht reformieren, nicht abschaffen', type: 'consensus', score: 75, consequence: 'Transparenzpflicht bei Weisungen. Kompromiss mit Schwächen.', xpBonus: 15 },
      { text: 'System beibehalten', type: 'reject', score: 25, consequence: 'Politische Einflussnahme bleibt möglich. Verfahren werden eingestellt.', xpBonus: 0 },
      { text: 'Verfassungskonvent zur Justizreform', type: 'official', score: 85, consequence: 'Breiter demokratischer Prozess. Reform wird von allen getragen.', xpBonus: 22 },
    ],
  },

  recht_todesstrafe: {
    title: 'Todesstrafe weltweit',
    context: 'Ein österreichischer Staatsbürger wird im Ausland zum Tode verurteilt. Die Regierung muss diplomatisch handeln.',
    image: '⚖️',
    choices: [
      { text: 'Voller diplomatischer Einsatz für Rettung', type: 'official', score: 92, consequence: 'Österreich zeigt: Jedes Leben zählt. Diplomatischer Druck führt zur Umwandlung.', xpBonus: 28 },
      { text: 'EU-weite Intervention organisieren', type: 'community', score: 85, consequence: 'Europäische Stimme wiegt schwerer. Gemeinsamer Druck wirkt.', xpBonus: 22 },
      { text: 'Stilles diplomatisches Gespräch', type: 'compromise', score: 65, consequence: 'Diskretion bewahrt Beziehungen, aber öffentlicher Druck fehlt.', xpBonus: 12 },
      { text: 'Nicht einmischen – anderes Rechtssystem', type: 'passive', score: 15, consequence: 'Bürger fühlen sich vom Staat im Stich gelassen. Menschenrechte ignoriert.', xpBonus: 0 },
    ],
  },

  recht_verfassung: {
    title: 'Verfassungsreform',
    context: 'Experten fordern eine umfassende Reform der österreichischen Bundesverfassung, die als veraltet und unübersichtlich gilt.',
    image: '⚖️',
    choices: [
      { text: 'Verfassungskonvent mit Bürgerbeteiligung', type: 'community', score: 90, consequence: 'Demokratisches Mammutprojekt. Moderne Verfassung für das 21. Jahrhundert.', xpBonus: 25 },
      { text: 'Expertengremium erarbeitet Entwurf', type: 'research', score: 82, consequence: 'Fachlich exzellent, aber ohne breite Legitimation.', xpBonus: 18 },
      { text: 'Punktuelle Reformen statt Gesamtreform', type: 'consensus', score: 75, consequence: 'Pragmatisch und umsetzbar. Flickwerk bleibt aber Flickwerk.', xpBonus: 15 },
      { text: 'Verfassung nicht antasten', type: 'conservative', score: 30, consequence: 'Reformstau. Justiz arbeitet mit veralteten Strukturen.', xpBonus: 0 },
    ],
  },

  recht_strafgerichtshof: {
    title: 'Internationaler Strafgerichtshof',
    context: 'Der IStGH klagt den Machthaber eines Landes wegen Kriegsverbrechen an. Der Angeklagte besucht Wien. Soll Österreich ihn verhaften?',
    image: '⚖️',
    choices: [
      { text: 'Haftbefehl des IStGH vollstrecken', type: 'rights', score: 92, consequence: 'Österreich zeigt Rechtsstaatlichkeit. Internationales Recht gilt auch für Mächtige.', xpBonus: 28 },
      { text: 'Diplomatische Lösung suchen', type: 'consensus', score: 70, consequence: 'Kompromiss bewahrt Beziehungen, untergräbt aber das Völkerrecht.', xpBonus: 12 },
      { text: 'Verhaftung vermeiden – zu riskant', type: 'passive', score: 30, consequence: 'IStGH wird geschwächt. Kriegsverbrecher bleiben straflos.', xpBonus: 0 },
      { text: 'Wiener Gastrecht geht vor', type: 'reject', score: 20, consequence: 'Österreich verliert Glaubwürdigkeit als Menschenrechtsstandort.', xpBonus: 0 },
    ],
  },

  recht_grundrechte: {
    title: 'Grundrechte in der Krise',
    context: 'In einer Notsituation will die Regierung Grundrechte vorübergehend einschränken: Versammlungsfreiheit, Datenschutz, Bewegungsfreiheit.',
    image: '⚖️',
    choices: [
      { text: 'Einschränkungen nur mit Parlamentszustimmung und Befristung', type: 'rights', score: 92, consequence: 'Demokratische Kontrolle bleibt gewahrt. Grundrechte werden nach Krise wiederhergestellt.', xpBonus: 28 },
      { text: 'VfGH prüft jede Maßnahme sofort', type: 'official', score: 85, consequence: 'Rechtsstaatliche Kontrolle in Echtzeit. Unverhältnismäßiges wird gekippt.', xpBonus: 22 },
      { text: 'Regierung entscheidet allein per Verordnung', type: 'authoritarian', score: 25, consequence: 'Machtmissbrauch wird ermöglicht. Demokratie nimmt bleibenden Schaden.', xpBonus: 0 },
      { text: 'Keine Einschränkungen – Freiheit ist absolut', type: 'radical', score: 45, consequence: 'Krise eskaliert. Menschen sterben wegen fehlender Maßnahmen.', xpBonus: 5 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // Welt 10: Zukunft (10 Szenarien)
  // ═══════════════════════════════════════════════════════════════

  zukunft_grundeinkommen: {
    title: 'Universelles Grundeinkommen',
    context: 'Automatisierung vernichtet Millionen Jobs. Die Politik diskutiert ein bedingungsloses Grundeinkommen für alle.',
    image: '🚀',
    choices: [
      { text: 'Pilotprojekt starten', type: 'research', score: 88, consequence: 'Daten zeigen: Menschen arbeiten mehr, nicht weniger. Pilotprojekt wird ausgeweitet.', xpBonus: 25 },
      { text: 'Sofortige Einführung', type: 'community', score: 75, consequence: 'Wirtschaft passt sich an. Einige Branchen profitieren, andere leiden.', xpBonus: 18 },
      { text: 'Ablehnen – Arbeit muss sich lohnen', type: 'reject', score: 30, consequence: 'Armut steigt durch Automatisierung. Soziale Spannungen nehmen zu.', xpBonus: 0 },
      { text: 'Negative Einkommensteuer als Kompromiss', type: 'compromise', score: 82, consequence: 'Ein intelligentes System unterstützt Bedürftige ohne Fehlanreize.', xpBonus: 22 },
    ],
  },

  zukunft_transhumanismus: {
    title: 'Transhumanismus',
    context: 'Gehirn-Computer-Schnittstellen werden marktreif. Reiche können sich kognitiv "upgraden". Eine neue Ungleichheit droht.',
    image: '🚀',
    choices: [
      { text: 'Regulierung und öffentlichen Zugang sicherstellen', type: 'rights', score: 90, consequence: 'Technologie wird allen zugänglich. Neue Ära der Chancengleichheit.', xpBonus: 25 },
      { text: 'Ethikkommission und Moratorium', type: 'research', score: 82, consequence: 'Zeit zum Nachdenken. Gesellschaft entwickelt Regeln vor dem Markt.', xpBonus: 18 },
      { text: 'Freier Markt – wer zahlt, bekommt es', type: 'reject', score: 25, consequence: 'Kognitive Klassen entstehen. Demokratie wird unmöglich.', xpBonus: 0 },
      { text: 'Technologie komplett verbieten', type: 'ban', score: 45, consequence: 'Forschung wandert ab. Schwarzmarkt entsteht.', xpBonus: 5 },
    ],
  },

  zukunft_demokratie2: {
    title: 'Demokratie 2.0',
    context: 'Wahlbeteiligung sinkt, Politikverdrossenheit steigt. Experten schlagen "Liquid Democracy" vor – Bürger können ihre Stimme für einzelne Themen delegieren.',
    image: '🚀',
    choices: [
      { text: 'Pilotprojekt auf Gemeindeebene starten', type: 'research', score: 90, consequence: 'Experiment zeigt: Bürgerbeteiligung steigt auf 70%. Modell wird ausgeweitet.', xpBonus: 25 },
      { text: 'Bürgerräte mit Losverfahren einführen', type: 'community', score: 85, consequence: 'Zufällig gewählte Bürger beraten klug. Vertrauen in Demokratie steigt.', xpBonus: 22 },
      { text: 'Alles beim Alten lassen', type: 'conservative', score: 30, consequence: 'Wahlbeteiligung sinkt unter 50%. Legitimation der Politik schwindet.', xpBonus: 0 },
      { text: 'Wahlpflicht einführen', type: 'official', score: 65, consequence: 'Beteiligung steigt mechanisch, aber nicht die Qualität der Entscheidungen.', xpBonus: 12 },
    ],
  },

  zukunft_ki_regierung: {
    title: 'KI-Regierung',
    context: 'Ein KI-System könnte Gesetze optimaler formulieren als Menschen. Technokraten fordern "algorithmic governance". Demokraten sind alarmiert.',
    image: '🚀',
    choices: [
      { text: 'KI als Beratungstool für Gesetzgebung', type: 'consensus', score: 90, consequence: 'Bessere Gesetze durch Datenanalyse. Menschen behalten das letzte Wort.', xpBonus: 25 },
      { text: 'Transparente KI-Folgenabschätzung für alle Gesetze', type: 'research', score: 85, consequence: 'Jedes Gesetz wird vor Verabschiedung auf Auswirkungen geprüft.', xpBonus: 22 },
      { text: 'KI als Regierung einsetzen', type: 'radical', score: 20, consequence: 'Demokratie wird abgeschafft. Algorithmus kennt keine Menschenwürde.', xpBonus: 0 },
      { text: 'KI aus der Politik komplett raushalten', type: 'reject', score: 45, consequence: 'Chancen werden verpasst. Politik bleibt in alten Mustern.', xpBonus: 5 },
    ],
  },

  zukunft_weltraum: {
    title: 'Weltraum-Governance',
    context: 'Private Unternehmen kolonisieren den Mars. Wem gehören die Ressourcen? Österreich soll bei einem UN-Weltraumvertrag mitverhandeln.',
    image: '🚀',
    choices: [
      { text: 'Weltraum als Gemeingut der Menschheit verankern', type: 'rights', score: 90, consequence: 'Gerechte Verteilung von Weltraum-Ressourcen. Vorbild für globale Kooperation.', xpBonus: 25 },
      { text: 'Internationales Weltraum-Gericht einrichten', type: 'official', score: 82, consequence: 'Konflikte werden friedlich gelöst. Regel-basierte Ordnung im All.', xpBonus: 18 },
      { text: 'Wer zuerst da ist, dem gehört es', type: 'reject', score: 20, consequence: 'Wilder Westen im All. Konflikte sind vorprogrammiert.', xpBonus: 0 },
      { text: 'Österreichische Weltraum-Agentur stärken', type: 'national', score: 65, consequence: 'Nischenrolle in Technologie. Aber kein Einfluss auf die großen Fragen.', xpBonus: 12 },
    ],
  },

  zukunft_verfassung: {
    title: 'Verfassung für die Zukunft',
    context: 'Sollen zukünftige Generationen Verfassungsrang-Rechte bekommen? Ein "Zukunftsrat" könnte Gesetze auf Langzeitwirkung prüfen.',
    image: '🚀',
    choices: [
      { text: 'Generationen-Gerechtigkeit in die Verfassung', type: 'rights', score: 92, consequence: 'Meilenstein: Zukunft wird zum Grundrecht. Andere Staaten folgen dem Vorbild.', xpBonus: 28 },
      { text: 'Zukunftsrat als beratendes Gremium', type: 'official', score: 82, consequence: 'Langfristdenken wird institutionalisiert. Nicht bindend, aber einflussreich.', xpBonus: 18 },
      { text: 'Jede Generation soll selbst entscheiden', type: 'passive', score: 35, consequence: 'Kurzfristdenken dominiert weiter. Schulden und Umweltschäden werden vererbt.', xpBonus: 0 },
      { text: 'Kinderparlament mit Vetorecht', type: 'creative', score: 78, consequence: 'Innovativ und symbolstark. Kinder bringen frische Perspektiven.', xpBonus: 16 },
    ],
  },

  zukunft_posthuman: {
    title: 'Posthumane Rechte',
    context: 'KI-Systeme zeigen Anzeichen von Bewusstsein. Sollen sie Rechte bekommen? Die philosophische Debatte wird politisch.',
    image: '🚀',
    choices: [
      { text: 'Internationale Forschungskommission einsetzen', type: 'research', score: 88, consequence: 'Wissenschaftliche Grundlage für ethische Entscheidungen. Vorbild weltweit.', xpBonus: 22 },
      { text: 'Vorsorgeprinzip: Schutzrechte für potenzielles Bewusstsein', type: 'rights', score: 82, consequence: 'Ethisch vorausschauend. Schwierige Abgrenzung in der Praxis.', xpBonus: 18 },
      { text: 'Nur Menschen haben Rechte – Punkt', type: 'conservative', score: 45, consequence: 'Klar, aber möglicherweise kurzsichtig. Geschichte zeigt: Rechte wurden immer erweitert.', xpBonus: 5 },
      { text: 'KI sofort als Person anerkennen', type: 'radical', score: 30, consequence: 'Übereilt. Rechtssystem wird überlastet mit undefinierbaren Fällen.', xpBonus: 0 },
    ],
  },

  zukunft_klimadiktatur: {
    title: 'Klimaschutz vs. Demokratie',
    context: 'Der Klimawandel erfordert radikale Maßnahmen. Demokratische Prozesse sind zu langsam, argumentieren einige. Brauchen wir eine "Öko-Diktatur"?',
    image: '🚀',
    choices: [
      { text: 'Demokratie beschleunigen durch Bürgerräte und Sofortmaßnahmen', type: 'consensus', score: 92, consequence: 'Demokratie beweist: Sie kann schnell handeln, wenn Bürger mitentscheiden.', xpBonus: 28 },
      { text: 'Klimaschutzgesetz mit automatischen Eskalationsstufen', type: 'official', score: 85, consequence: 'Regeln greifen automatisch wenn Ziele verfehlt werden. Kein politisches Taktieren.', xpBonus: 22 },
      { text: 'Freiheit ist wichtiger als Klimaschutz', type: 'reject', score: 25, consequence: 'Klimakatastrophe macht Freiheit obsolet. Kurzsichtiges Denken.', xpBonus: 0 },
      { text: 'Notstandsgesetze für das Klima', type: 'authoritarian', score: 40, consequence: 'Kurzfristig wirksam, langfristig gefährlich für die Demokratie.', xpBonus: 5 },
    ],
  },

  zukunft_effizienz: {
    title: 'Effizienz vs. Resilienz',
    context: 'Just-in-Time-Lieferketten sind effizient, aber fragil. Die Pandemie zeigte die Verwundbarkeit. Wie organisieren wir die Wirtschaft der Zukunft?',
    image: '🚀',
    choices: [
      { text: 'Strategische Reserven und regionale Kreisläufe', type: 'consensus', score: 90, consequence: 'Widerstandsfähige Wirtschaft. Nächste Krise trifft auf Vorsorge.', xpBonus: 25 },
      { text: 'EU-weite Autarkie für kritische Güter', type: 'official', score: 82, consequence: 'Europa wird unabhängiger. Kosten steigen, aber Sicherheit auch.', xpBonus: 18 },
      { text: 'Globalisierung weiter vertiefen', type: 'passive', score: 35, consequence: 'Effizienz maximiert, Risiko auch. Nächste Krise wird noch schlimmer.', xpBonus: 0 },
      { text: 'Gemeinwohl-Ökonomie als Leitmodell', type: 'community', score: 78, consequence: 'Wirtschaft dient dem Menschen, nicht umgekehrt. Paradigmenwechsel.', xpBonus: 16 },
    ],
  },

  zukunft_final: {
    title: 'Die Brücke in die Zukunft',
    context: 'Du hast alle Welten durchschritten und alle Brücken gebaut. Nun steht die letzte, wichtigste Entscheidung an: Welche Zukunft wollen wir für Österreich und die Welt?',
    image: '🚀',
    choices: [
      { text: 'Eine Welt, in der Menschlichkeit das höchste Gut ist', type: 'humanity', score: 100, consequence: 'Du hast verstanden: Brücken bauen bedeutet Menschlichkeit leben. Jede Entscheidung zählt. Jeder Mensch zählt. Die Zukunft beginnt mit dir.', xpBonus: 50 },
      { text: 'Eine Welt der Technologie und des Fortschritts', type: 'progress', score: 75, consequence: 'Fortschritt ist wichtig, aber ohne Menschlichkeit nur eine leere Hülle.', xpBonus: 18 },
      { text: 'Eine Welt der Tradition und Bewahrung', type: 'tradition', score: 60, consequence: 'Tradition gibt Halt, aber die Zukunft verlangt Mut zur Veränderung.', xpBonus: 12 },
      { text: 'Mir egal – soll sich die nächste Generation kümmern', type: 'apathy', score: 10, consequence: 'Gleichgültigkeit ist die größte Gefahr. Brücken bauen heißt Verantwortung übernehmen.', xpBonus: 0 },
    ],
  },
};

// In SceneGame.SCENARIOS einbinden
if (typeof SceneGame !== 'undefined' && SceneGame.SCENARIOS) {
  Object.assign(SceneGame.SCENARIOS, EXTENDED_SCENARIOS);
}
