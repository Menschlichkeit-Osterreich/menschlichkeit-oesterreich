/**
 * BRÜCKEN BAUEN 3D – Erweiterte Szenarien-Daten
 * Zusätzliche Szenarien für alle 100 Level
 * Die Kern-Szenarien sind in scene-game.js definiert.
 * Diese Datei enthält erweiterte Szenarien für Level 11-100.
 */
'use strict';

// Erweiterte Szenarien werden dynamisch in SceneGame.SCENARIOS eingebunden
const EXTENDED_SCENARIOS = {
  // Welt 2: Schule
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
  // Welt 3: Arbeit
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
  // Welt 4: Medien
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
  // Welt 5: Umwelt
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
  // Welt 6: Digital
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
  // Welt 7: Gesundheit
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
  // Welt 8: Europa
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
  // Welt 9: Gerechtigkeit
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
  // Welt 10: Zukunft
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
};

// In SceneGame.SCENARIOS einbinden
if (typeof SceneGame !== 'undefined' && SceneGame.SCENARIOS) {
  Object.assign(SceneGame.SCENARIOS, EXTENDED_SCENARIOS);
}
