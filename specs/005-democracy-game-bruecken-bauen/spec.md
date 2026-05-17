# Feature Specification: Democracy Game Bruecken bauen

**Feature Branch**: `005-democracy-game-bruecken-bauen`

**Created**: 2026-05-17

**Status**: Draft

**Input**: User description: "Erstelle oder aktualisiere die Feature-Spezifikation basierend auf dem aktuellen Auftrag." sowie bereitgestellte Projektunterlagen zum Democracy Game "Bruecken bauen".

## Clarifications

### Session 2026-05-17

- Q: Welches Authentifizierungsmodell soll fuer Spiel- und Workshop-Zugang
  gelten? -> A: Plattform-SSO plus zeitlich begrenzter Workshop-Gastzugang.
- Q: Wie soll der Abstimmungsabschluss im Workshop-Modus verbindlich geregelt
  sein? -> A: Feste Abstimmungsfrist, letzte gueltige Stimme pro Person zaehlt.
- Q: Welche Aufbewahrungsfrist soll fuer rohe Telemetriedaten gelten?
  -> A: 90 Tage Rohdaten, danach nur aggregierte Daten.
- Q: Wie sollen Inhalte aus dem CMS in den Spielbetrieb ueberfuehrt werden?
  -> A: Nur freigegebene, versionierte CMS-Snapshots werden importiert.
- Q: Wie lange soll ein Workshop-Gastzugang gueltig sein?
  -> A: 2 Stunden Gueltigkeit, danach Re-Join erforderlich.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Szenario mit Konsequenzen spielen (Priority: P1)

Als Spielerin oder Spieler moechte ich ein vollstaendiges Konfliktszenario mit Dialogen, Rollenperspektiven, Entscheidungen und sichtbaren Konsequenzen erleben, damit demokratische Konfliktloesung praxisnah geuebt werden kann.

**Why this priority**: Das ist der Kernnutzen des Produkts. Ohne funktionierenden Szenario-Flow gibt es keinen didaktischen Mehrwert.

**Independent Test**: Kann unabhaengig getestet werden, indem ein komplettes Szenario vom Einstieg bis zur Aufloesung durchgespielt wird und dabei unterschiedliche Wahlpfade zu unterschiedlichen Ergebnissen fuehren.

**Acceptance Scenarios**:

1. **Given** ein gestartetes Szenario, **When** die spielende Person nacheinander Dialogoptionen waehlt, **Then** verzweigt der Ablauf entsprechend der gewaehlten Entscheidungen und zeigt passende Konsequenzen.
2. **Given** zwei unterschiedliche Entscheidungsfolgen im selben Szenario, **When** beide Durchlaeufe abgeschlossen sind, **Then** unterscheiden sich Ergebnisdarstellung und Reflexionsinhalt nachvollziehbar.

---

### User Story 2 - Barrierefrei teilnehmen (Priority: P1)

Als Person mit unterschiedlichen Zugangsbeduerfnissen moechte ich das Spiel ueber Tastatur bedienen, Kontraste und Schriftgroesse anpassen sowie Untertitel nutzen koennen, damit ich gleichberechtigt teilnehmen kann.

**Why this priority**: Inklusion ist fuer ein Demokratie-Lernspiel zentral und beeinflusst direkte Nutzbarkeit sowie rechtliche und qualitative Anforderungen.

**Independent Test**: Kann unabhaengig getestet werden, indem ein Szenario ohne Maus bedient wird und dabei alle relevanten UI-Elemente erreichbar und lesbar bleiben.

**Acceptance Scenarios**:

1. **Given** aktivierte Tastatursteuerung, **When** die nutzende Person durch den HUD- und Dialogbereich navigiert, **Then** sind alle interaktiven Funktionen ohne Maus bedienbar.
2. **Given** geaenderte Darstellungseinstellungen, **When** Kontrast und Schriftgroesse angepasst werden, **Then** bleiben Inhalte lesbar und die Bedienung funktionsfaehig.

---

### User Story 3 - Inhalte ohne Codepflege erweitern (Priority: P2)

Als Content-Team moechte ich Welten, Szenarien, Szenen, Entscheidungen, Rollen und Charaktere strukturiert pflegen und veroeffentlichen, damit neue Lerninhalte regelmaessig ausgerollt werden koennen.

**Why this priority**: Nachhaltige Skalierung des Spiels erfordert einen redaktionellen Prozess statt Code-Aenderungen fuer jede neue Geschichte.

**Independent Test**: Kann unabhaengig getestet werden, indem ein neues Szenario mit mehreren Szenen erstellt, veroeffentlicht und im Spiel konsumiert wird.

**Acceptance Scenarios**:

1. **Given** ein neues Szenario mit vollstaendigen Pflichtfeldern, **When** es veroeffentlicht wird, **Then** ist es im Spiel auswaehlbar und lauffaehig.
2. **Given** eine unvollstaendige Inhaltsstruktur, **When** die Freigabe versucht wird, **Then** wird sie mit nachvollziehbarer Rueckmeldung blockiert.

---

### User Story 4 - Workshop moderieren (Priority: P2)

Als Moderatorin oder Moderator moechte ich eine gemeinsame Session mit Teilnehmenden starten und Abstimmungen in Echtzeit durchfuehren, damit das Spiel in Gruppen- und Bildungssettings eingesetzt werden kann.

**Why this priority**: Der Workshop-Modus erweitert den Einsatz im Bildungsbetrieb und erhoeht den Multiplikationseffekt.

**Independent Test**: Kann unabhaengig getestet werden, indem eine Session mit mehreren Teilnehmenden erstellt wird und mindestens eine gemeinsame Abstimmungsrunde erfolgreich abgeschlossen wird.

**Acceptance Scenarios**:

1. **Given** eine aktive Workshop-Session, **When** Teilnehmende beitreten, **Then** sehen alle denselben Sitzungsstatus.
2. **Given** eine laufende Abstimmung, **When** Teilnehmende Stimmen abgeben, **Then** wird ein aggregiertes Ergebnis fuer alle sichtbar angezeigt.

---

### User Story 5 - Lernwirkung datenschutzkonform auswerten (Priority: P3)

Als Forschungsteam moechte ich aggregierte, anonymisierte Nutzungs- und Entscheidungsdaten auswerten, damit Lernwirkung und Szenarioqualitaet verbessert werden koennen.

**Why this priority**: Datengetriebene Verbesserung ist wichtig, aber nachrangig gegenueber funktionierendem Kernprodukt und Zugaenglichkeit.

**Independent Test**: Kann unabhaengig getestet werden, indem bei erteilter Einwilligung Ereignisse erfasst und anschliessend in aggregierter Form ausgewertet werden.

**Acceptance Scenarios**:

1. **Given** eine aktiv erteilte Einwilligung, **When** ein Szenario abgeschlossen wird, **Then** werden nur erlaubte Ereignisdaten gespeichert.
2. **Given** keine Einwilligung, **When** gespielt wird, **Then** findet keine personenbezogene Auswertung statt.

---

### Edge Cases

- Was passiert, wenn eine Entscheidung auf eine nicht mehr verfuegbare Folgeszene verweist?
- Wie wird ein laufendes Szenario behandelt, wenn waehrenddessen die Sprache gewechselt wird?
- Wie wird verfahren, wenn Teilnehmende im Workshop-Modus waehrend einer Abstimmung die Verbindung verlieren?
- Was passiert, wenn fuer einen CMS-Snapshot notwendige Lokalisierungen unvollstaendig sind?
- Wie wird sichergestellt, dass Telemetrie bei widerrufener Einwilligung sofort ausgesetzt wird?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Das System MUSS rollenspielbasierte Szenarien mit mehreren Szenen und Entscheidungszweigen bereitstellen.
- **FR-002**: Das System MUSS pro Entscheidung nachvollziehbare Konsequenzen fuer Verlauf und Ergebnis anzeigen.
- **FR-003**: Nutzende MUESSEN vor Szenariostart eine Rolle auswaehlen koennen.
- **FR-004**: Das System MUSS den Szenariofortschritt speichern und bei erneuter Sitzung wiederherstellen koennen.
- **FR-005**: Das System MUSS eine anpassbare, barrierearme HUD-Interaktion bereitstellen (inklusive Tastaturnavigation).
- **FR-006**: Das System MUSS Unterstuetzung fuer Untertitel und alternative Darstellungsoptionen anbieten.
- **FR-007**: Das System MUSS mehrsprachige Inhalte verwalten und waehrend der Nutzung umschaltbar machen.
- **FR-008**: Das System MUSS strukturierte Inhaltsobjekte fuer Welten, Szenarien, Szenen, Entscheidungen, Rollen und Charaktere verwalten.
- **FR-009**: Das System MUSS Inhaltsfreigaben nur fuer vollstaendige und valide Inhaltsstrukturen erlauben.
- **FR-010**: Das System MUSS einen redaktionellen Workflow mit nachvollziehbaren Status fuer Entwurf, Review und Freigabe ermoeglichen.
- **FR-011**: Das System MUSS aktive Rolle und aktives Szenario pro Spielperson eindeutig fuehren.
- **FR-012**: Das System MUSS standardisierte Fehlerantworten fuer ungueltige Eingaben und nicht verfuegbare Inhalte liefern.
- **FR-013**: Das System MUSS versionierte Schnittstellen fuer Spiel- und Inhaltsdaten bereitstellen.
- **FR-014**: Das System MUSS einen Workshop-Modus mit Session-Erstellung und Beitrittsmechanismus bereitstellen.
- **FR-015**: Das System MUSS Abstimmungen in einer Session in nahezu Echtzeit aggregieren und anzeigen.
- **FR-016**: Das System MUSS bei Verbindungsabbruechen robuste Wiederbeitritts- oder Fehlerpfade bereitstellen.
- **FR-017**: Das System MUSS Telemetrie nur nach aktiver, dokumentierter Einwilligung erfassen.
- **FR-018**: Das System MUSS Auswertungen in aggregierter und anonymisierter Form bereitstellen.
- **FR-019**: Das System MUSS den Widerruf von Einwilligungen respektieren und nachgelagerte Verarbeitung entsprechend begrenzen.
- **FR-020**: Das System MUSS nachvollziehbare Nachweise fuer Qualitaet, Barrierefreiheit und Governance bereitstellen (Testreport, Accessibility-Audit-Log, Governance-Checkliste).
- **FR-021**: Das System MUSS regulaere Spielzugriffe ueber Plattform-SSO
  absichern und zusaetzlich einen zeitlich begrenzten Workshop-Gastzugang
  mit eingeschraenkten Rechten bereitstellen.
- **FR-022**: Das System MUSS Workshop-Abstimmungen mit einer festen
  Abstimmungsfrist abschliessen und pro teilnehmender Person nur die letzte
  gueltige Stimme in die Ergebnisaggregation uebernehmen.
- **FR-023**: Das System MUSS rohe Telemetriedaten spaetestens nach 90 Tagen
  loeschen oder irreversibel anonymisieren und danach nur aggregierte
  Auswertungsdaten fuer Langzeitanalysen vorhalten.
- **FR-024**: Das System MUSS fuer den produktiven Spielbetrieb ausschliesslich
  freigegebene und versionierte CMS-Snapshots importieren, sodass
  Szenariostaende reproduzierbar und rollback-faehig bleiben.
- **FR-025**: Das System MUSS Workshop-Gastzugaenge auf eine maximale
  Gueltigkeit von 2 Stunden begrenzen und danach einen erneuten Session-Beitritt
  verlangen.

### Key Entities _(include if feature involves data)_

- **World**: Thematischer Spielkontext mit eigenen Ausgangsbedingungen und Fortschrittsparametern.
- **Scenario**: Zusammenhaengende Konfliktgeschichte mit Lernziel, Startpunkt und messbaren Ergebnissen.
- **Scene**: Einzelner Interaktionsabschnitt innerhalb eines Szenarios.
- **Choice**: Auswahloption innerhalb einer Szene mit definierter Konsequenz auf Folgeablauf und Bewertung.
- **Role**: Spielbare Perspektive mit spezifischem Fokus und Faehigkeiten.
- **Character**: Figur mit Identitaet, Kontext und mediengestuetzten Dialogbeitraegen.
- **WorkshopSession**: Moderierte Mehrpersonen-Sitzung mit Teilnehmendenstatus und Abstimmungsereignissen.
- **WorkshopVote**: Einzelne Stimmabgabe innerhalb einer WorkshopSession mit Teilnehmer-ID, Auswahl, Zeitstempel und Gueltigkeitsstatus (nur letzte Stimme vor Deadline zaehlt).
- **ConsentRecord**: Dokumentierte Zustimmung oder Ablehnung zur Datenverarbeitung mit Gueltigkeitsstatus.
- **TelemetryEvent**: Anonymisiertes Ereignis zur aggregierten Auswertung von Nutzung und Lernverhalten.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Mindestens 90% der Testpersonen (N ≥ 20, moderierter Usability-Test) koennen ein Szenario ohne Abbruch von Start bis Abschluss durchlaufen.
- **SC-002**: Mindestens 85% der Testpersonen (N ≥ 20, Post-Session-Fragebogen) bestaetigen, dass Entscheidungsfolgen im Szenario klar erkennbar sind.
- **SC-003**: In Accessibility-Tests sind 100% der kritischen Kerninteraktionen per Tastatur bedienbar.
- **SC-004**: Mindestens 95% der Inhaltsfreigaben scheitern nicht an strukturellen Validierungsfehlern.
- **SC-005**: Workshop-Sessions mit mindestens 30 gleichzeitigen Teilnehmenden liefern stabile Abstimmungsergebnisse ohne Datenverlust.
- **SC-006**: Bei 100% der ausgewerteten Datensaetze liegt ein gueltiger Einwilligungsstatus vor.

## Assumptions

- Das Democracy-Game wird in einer ersten Ausbaustufe als Vertical Slice
  mit einem priorisierten Premium-Szenario ausgeliefert.
- Fuer den initialen Rollout stehen Moderations- und Content-Teams fuer
  redaktionelle Reviews zur Verfuegung.
- Bestehende Plattformbereiche koennen fuer Identitaets- und Nutzerkontext
  wiederverwendet werden.
- Die erste Veroeffentlichungsphase fokussiert auf Browsernutzung mit
  anschliessender iterativer Erweiterung.
- Die bereitgestellten Projektunterlagen gelten als fachlich fuehrende
  Grundlage fuer Scope und Priorisierung.
