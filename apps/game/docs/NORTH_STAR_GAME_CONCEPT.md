# NORTH STAR GAME CONCEPT
## Brücken Bauen 3D — Menschlichkeit Österreich
**Version 2.0 | Stand: März 2026 | Dokument: Autoritativ**

---

## 1. Genre-Entscheidung

**Entscheidung: Scenario-based 3D Civic Decision Adventure**

Nicht (a) Narrative Civic Strategy, nicht (c) Systemic Democracy Simulator, nicht (d) Hybrid ohne Identität. Primär (b) — mit einem klar eingegrenzten systemischen Unterbau.

**Begründung:**

Ein reiner Strategie-Ansatz (a) würde voraussetzen, dass Spieler:innen makrostrategische Systeme optimieren wollen. Das passt nicht zur NGO-Mission: Politische Bildung erfordert, dass Menschen *sich* in konkreten Situationen wiedererkennen — nicht in abstrakten Ressourcen-Graphen.

Ein vollständiger Demokratie-Simulator (c) überfordert die Kernzielgruppe in Bildungssettings. Das Gehirn lernt am besten über narrative Identifikation, nicht über Systemoptimierung. Außerdem: Vollständige Simulation demokratischer Prozesse ist ein 5-Jahres-Projekt, kein MVP.

Ein Hybrid ohne klare Identität (d) ist die häufigste Falle bei Lernspiel-Entwicklung. Das Ergebnis: weder gutes Spiel noch gute Pädagogik.

**(b) ist richtig, weil:**
- Die 6 Rollen funktionieren als Identifikationsfiguren, nicht als Spielfiguren ohne Gesicht
- 100 Szenarien sind Entscheidungssituationen, keine Ressourcen-Runden
- Die Choice-Mechanik (4 Optionen, sofortige Konsequenz) ist der Kern — nicht Kartenspiel, nicht Turn-based
- Die NGO kann Inhalte skalieren, ohne die Engine neu zu bauen
- Schulklassen brauchen Debrief-taugliche Szenarien, keine Spielsitzungen die 3 Stunden dauern

Der systemische Unterbau (Demokratie-Indikatoren, persistente Weltspuren, Reputations-Tracking) *dient* dem Szenario-Erlebnis. Er ist Kontext-Tiefe, kein eigenständiger Gameplay-Loop.

---

## 2. Core Fantasy

Als Spieler:in willst du das Gefühl haben, dass **deine Entscheidungen etwas bedeuten** — nicht weil eine Zahl steigt, sondern weil du siehst, wie eine Gemeinde, eine Institution, eine Beziehung sich verändert, und weil du die moralische Logik hinter deiner Wahl verteidigen musst.

Als Spieler:in willst du das Gefühl haben, **die österreichische Demokratie von innen zu kennen** — die Hebel, die Widerstände, die Momente wo eine einzelne Person wirklich etwas bewegen kann, und die Grenzen die kein Einzelner überschreiten kann.

---

## 3. Emotionales Versprechen

Nach einer guten Session — 2 bis 3 abgeschlossene Level — fühlt man:

**Ernste Neugier.** Nicht Triumph, nicht Entertained-worden-sein. Das Gefühl, etwas Echtes berührt zu haben. "Ich hätte nicht gedacht, dass das so funktioniert." "Das passiert wirklich so in Österreich." Dieses Gefühl ist das Ziel. Es öffnet Menschen für politische Bildung in einer Weise, die Vorträge nicht können.

**Produktive Unbequemlichkeit.** Die beste Entscheidung war nicht einfach. Niemand hat sie gratis bekommen. Das ist kein Bug — das ist die pädagogische Kernaussage: Demokratie ist Abwägung unter Bedingungen, nicht Lösung nach Kochbuch.

**Handlungswirksamkeit.** Die Erkenntnis: "Ich kann etwas tun. Auch ich." Das ist die politische Bildungs-Mission der NGO, übersetzt in ein emotionales Spielerlebnis.

---

## 4. Core Loop (7 Schritte)

```
WAHRNEHMEN
│  Szenario-Text (max. 200 Wörter) + 3D-Kulisse signalisiert Kontext.
│  Stakeholder-Icons zeigen, wer betroffen ist. Rollenspezifische
│  Vorab-Information wird sichtbar (Journalist sieht versteckten Fakt,
│  Beamtin sieht Rechtsgrundlage). Kein Information-Overload.
▼
VERSTEHEN
│  Konfliktachse wird explizit benannt: Wer will was? Was steht auf dem Spiel?
│  Versteckte Variable existiert aber wird nicht direkt kommuniziert —
│  Spieler:in muss aktiv nachdenken.
▼
ABWÄGEN
│  4 Optionen gleichzeitig sichtbar. Jede Option trägt einen Preview-Hinweis
│  auf systemische Wirkung ("wirkt auf: Vertrauen, Teilhabe").
│  Rollensymbol neben optionaler Bonus-Option (kein Pflicht-Pfad, nur Signal).
│  Zeitlimit optional — in Schulkontext oft deaktiviert für Diskussion.
▼
ENTSCHEIDEN
│  Eine Wahl. Keine Rücknahme. Entscheidungsgewicht muss spürbar sein.
│  UI-Reaktion: kurze Pause, dann Konsequenz-Sequenz.
▼
KONSEQUENZEN ERLEBEN
│  Sofort: Score + XP + Rollenbonus.
│  Visuell: Demokratie-Indikator bewegt sich. Weltspuren aktualisieren sich.
│  Narrativ: 1-2 Sätze Konsequenztext aus Perspektive Betroffener.
│  Mittelfristig (nächste Level): Entscheidung hinterlässt Spur in Welt-State.
▼
REFLEKTIEREN
│  Debrief-Karte zeigt: Was haben andere gewählt? (aggregiert, anonym).
│  Reflexionsfrage: keine Moral-Predigt, sondern offene Frage.
│  Faktenbox optional: österreichischer Rechtskontext, reale Fallbeispiele.
│  Teacher-Hook: Diskussionsimpuls wird in Teacher-Mode sichtbar.
▼
FORTSCHRITT FREISCHALTEN
   Sterne (1-3) + XP + eventuelle Achievement-Meldung.
   Nächstes Level öffnet sich. Bei Welt-Abschluss: neue Welt sichtbar.
   Perspective-Shift angeboten: "Spiele dieses Szenario als [andere Rolle]?"
   Wissens-Fragment (Verfassungsartikel, österreichischer Rechtsfall) freigeschaltet.
```

---

## 5. Rollenmodell: Was jede Rolle WIRKLICH anders macht

Die bestehenden Bonuswerte in `data-roles.js` sind notwendig aber nicht hinreichend. Jede Rolle braucht **drei echte Asymmetrien**: anderen Informationszugang, andere Werkzeuge, andere Win-Condition.

### Engagierte Bürgerin (Maria, 38)
- **Informationszugang:** Sieht Alltagsauswirkungen auf normale Menschen, die Institutionen übersehen. Sieht Nachbarschaftsnetzwerke und informelle Solidarstrukturen.
- **Werkzeuge:** Bürgerversammlung (alle Parteien müssen zuhören), Petition (erhöht Öffentlichkeitsdruck), Netzwerk-Aktivierung (mobilisiert Nachbarschaft).
- **Moralisches Dilemma:** Konsens kostet Zeit. Konflikt-Vermeidung kann Unrecht perpetuieren. Wann ist Kompromiss Feigheit?
- **Win-Condition:** Tragfähige Lösungen die niemanden ausschließen. Nicht die "beste" Lösung — die nachhaltigste.
- **Risiko:** Zu viel Vermittlung ohne Position führt zu Bedeutungslosigkeit im System.

### Lokalpolitiker (Thomas, 52)
- **Informationszugang:** Sieht Machtverhältnisse, Haushaltszwänge, Koalitionsrücksichten. Sieht was politisch möglich ist — aber auch was politisch bequem ist.
- **Werkzeuge:** Beschluss (schnelle Umsetzung), Dringlichkeitssitzung, Budget-Umwidmung (wenn Ressourcen vorhanden), Koalitionsverhandlung.
- **Moralisches Dilemma:** Kurzfristige Mehrheitsfähigkeit vs. langfristige Gerechtigkeit. Wähler:innenstimmen vs. Grundrechtsschutz für Minderheiten.
- **Win-Condition:** Handlungsfähigkeit erhalten. Demokratische Institutionen stärken, nicht nur Entscheidungen treffen.
- **Risiko:** Populistische Abkürzungen erhöhen kurzfristigen Score, senken aber Demokratie-Indikator und erzeugen Folge-Szenarien mit höherer Schwierigkeit.

### Investigativ-Journalistin (Sophie, 31)
- **Informationszugang:** Sieht versteckte Fakten die anderen Rollen verborgen bleiben. Sieht Verbindungen zwischen Akteuren, Interessenskonflikte, nicht-öffentliche Dokumente.
- **Werkzeuge:** Exklusivbericht (kippt öffentliche Meinung sofort), Quellenschutz-Mechanik (Kosten/Nutzen-Abwägung), Recherche-Aktion (deckt versteckte Variable auf).
- **Moralisches Dilemma:** Öffentliches Interesse vs. Quellenschutz. Wahrheit jetzt vs. Wahrheit sicher. Wann schadet Veröffentlichung mehr als sie nützt?
- **Win-Condition:** Transparenz herstellen. Nicht Score-Maximierung — Wahrheit ins Licht bringen, auch wenn das kurzfristig unbequem ist.
- **Risiko:** Veröffentlichung ohne ausreichende Absicherung kann Quellen gefährden und Folge-Szenarien triggern wo Pressefreiheit unter Druck gerät.

### Klimaaktivist (Lena, 24)
- **Informationszugang:** Sieht langfristige Systemfolgen die kurzfristig-orientierte Akteure ignorieren. Sieht Netzwerke zivilgesellschaftlicher Organisationen, internationale Verbindungen.
- **Werkzeuge:** Massendemonstration (massiver Druck, aber Eskalationsrisiko), Koalitionsaufbau (langsam aber nachhaltig), Ziviler Ungehorsam (letztes Mittel, hohes Risiko).
- **Moralisches Dilemma:** Radikalität vs. Anschlussfähigkeit. Tempo vs. Breite. Wann ist Kompromiss Verrat, wann ist er strategisch notwendig?
- **Win-Condition:** Systemwandel anstoßen. Nicht Konflikte lösen — Bedingungen verändern unter denen zukünftige Konflikte entstehen.
- **Risiko:** Eskalation kann Allianzen beschädigen und demokratiefeindliche Gegenreaktionen auslösen.

### Verwaltungsbeamter (Klaus, 47)
- **Informationszugang:** Sieht Rechtslage, Verfahrensvorschriften, historische Präzedenzfälle, institutionelle Zuständigkeiten. Sieht was legal möglich ist — und was rechtliche Konsequenzen hätte.
- **Werkzeuge:** Rechtsgutachten (juristisch absichern), Verfahrensregel (kann Prozesse verlangsamen oder beschleunigen), Akteneinsicht (Informationsrechte durchsetzen).
- **Moralisches Dilemma:** Rechtstreue vs. moralische Dringlichkeit. Prozesse schützen Demokratie — aber können auch Unrecht verewigen. Wann ist "das Gesetz ist das Gesetz" eine Ausrede?
- **Win-Condition:** Verfahrensintegrität wahren. Entscheidungen die vor Gericht halten. Nicht die schnellste oder populärste Lösung — die rechtsstaatliche.
- **Risiko:** Überbetonung von Verfahren bei klarem moralischen Versagen senkt Teilhabe-Indikator und erzeugt Vertrauensverlust.

### Verfassungsrichterin (Dr. Anna, 58)
- **Informationszugang:** Sieht Grundrechtsdimension aller Konflikte. Sieht Verfassungskonformität von Maßnahmen. Kann Parallelen zu internationalen Rechtsprechungen ziehen.
- **Werkzeuge:** Verfassungsklage (stoppt alle anderen Prozesse — mächtig aber kostet politisches Kapital), Normenkontrolle, Obiter Dictum (Signal ohne Bindung).
- **Moralisches Dilemma:** Mehrheitswille vs. Grundrechtsschutz. Tempo vs. Gründlichkeit. Wann ist richterlicher Aktivismus notwendig, wann überschreitet er demokratische Legitimation?
- **Win-Condition:** Grundrechte durchsetzen, auch gegen Mehrheitsmeinung. Verfassungsmäßige Ordnung schützen, auch wenn das unpopulär ist.
- **Risiko:** Verfassungsklage als erstes Mittel untergräbt andere Institutionen und kann Backlash gegen Verfassungsgericht auslösen.

---

## 6. Progression-Design: 100 Level als Kompetenz-Entwicklung

Das Problem bei content-getriebenen Spielen: Level 1 und Level 50 fühlen sich gleich an. Dagegen arbeitet die folgende Progression-Logik.

### Dramaturgie-Archetypus pro Welt (10 Level = 1 Welt-Erzählung)
```
Level 1-2:   Einführung — überschaubare Konflikte, klare Lernziele, niedrige Komplexität
Level 3-4:   Komplikation — erste Rollenkonflikte, versteckte Variablen werden eingeführt
Level 5-6:   Eskalation — mehrere Stakeholder mit echten Interessenskonflikten
Level 7-8:   Institutionelle Dimension — Verfahren, Rechtsrahmen, strukturelle Hindernisse
Level 9:     Capstone-Dilemma — kein klarer richtiger Weg, echte moralische Spannung
Level 10:    Welt-Auflösung — Konsequenzen der bisherigen Entscheidungen der Welt zeigen sich
```

### Mechanische Komplexitäts-Skalierung
- **Einfach (Level 1-20):** 4 Optionen, klare Konsequenztexte, Zeitlimit 120 Sek.
- **Mittel (Level 21-50):** Versteckte Variable aktiv, mittelfristige Konsequenzen werden sichtbar, Zeitlimit 90 Sek.
- **Schwer (Level 51-80):** Reputations-Tracking aktiv, Entscheidungen beeinflussen 2-3 Folge-Szenarien, Zeitlimit 60 Sek.
- **Experte (Level 81-100):** Demokratie-Indikator kritisch, alle Systeme aktiv, no perfect option.

### Kompetenz-Aufbau (was Spieler:innen wirklich lernen)
- Welten 1-3: Basisverständnis demokratischer Entscheidungsprozesse
- Welten 4-6: Medien, Information, digitale Demokratie
- Welten 7-8: Institutionelle Rechtsstaatlichkeit, Gesundheit als Gesellschaftsfrage
- Welt 9: Gerechtigkeit — strukturelle vs. individuelle Verantwortung
- Welt 10: Zukunft — Langfristdenken, Generationengerechtigkeit, Systemwandel

---

## 7. Zielgruppen

### Primärzielgruppe: Schüler:innen 14-18 (Politische Bildung AHS/BHS)
- Kontext: Schulstunde oder Nachmittagsbetreuung, Lehrperson anwesend
- Nutzungsmodus: 1-2 Level + Debrief + Klassendiskussion
- Technologie: Chromebook, iPad oder Schulcomputer
- Anforderung: Sofort spielbar ohne Tutorial-Hürde, Teacher-Mode aktiv

### Sekundärzielgruppe: Studierende 18-25 (Politikwissenschaft, Pädagogik, Soziale Arbeit)
- Kontext: Seminar, Workshop, selbstgesteuert
- Nutzungsmodus: Längere Sessions, Rollenexploration, Meta-Wissens-Sammlung
- Anforderung: Tiefere Rollenasymmetrie, Faktenboxen, Wissens-Fragmente

### Tertiärzielgruppe: Erwachsene in Bildungskontext (VHS, NGO-Workshops, Volkshochschule)
- Kontext: Gruppenveranstaltung mit Moderation
- Nutzungsmodus: Live-Demo + Gruppenentscheidung + Diskussion
- Anforderung: Großbildschirm-tauglich, Entscheidungsmuster exportierbar

### Quartärzielgruppe: NGO-Community (Freiwillige, Unterstützer:innen, Spendengebende)
- Kontext: Eigenständig, zu Hause
- Nutzungsmodus: Vollständige Progression, alle Welten
- Anforderung: Motivierendes Progression-System, Austausch-Möglichkeit

---

## 8. Alleinstellungsmerkmal

**"Österreichische Demokratie von innen — in 15 Minuten pro Session."**

Konkret und singulär: Kein anderes Lernspiel kombiniert alle folgenden Elemente gleichzeitig:

1. **Österreichischer Rechtskontext** — Verfassungsgerichtshof, AK, Gemeinderat, ÖNORM-Verwaltung. Nicht generisch-europäisch, sondern konkret österreichisch.
2. **Echte Rollenasymmetrie** — nicht nur Bonuswerte, sondern andere Informationszugänge und andere Win-Conditions je Rolle.
3. **3D-Visualisierung von Demokratiezustand** — der Weltzustand ist sichtbar, nicht nur eine Zahl.
4. **Teacher-Mode als Erstklassen-Feature** — nicht nachgereicht, sondern von Anfang an in den Core Loop integriert.
5. **Perspective-Shifting als Replayability-Mechanik** — dasselbe Szenario aus 6 Rollen → 6 verschiedene Stories.

---

## 9. Anti-Pattern-Liste

Das Spiel darf **nicht** werden:

- **Moral-Predigt:** Keine Meldungen die Spieler:innen sagen, was sie hätten tun sollen. Reflexionsfragen statt Urteile.
- **Reward-Inflation:** Kein Achievement für jede Kleinigkeit. Achievements müssen verdient sein.
- **Score-Gamification ohne Substanz:** XP und Sterne sind Hilfsmittel, kein Selbstzweck. Kein Leaderboard-Fokus.
- **Vereinfachung politischer Realität:** Es gibt keine perfekte Lösung. Die Spielmechanik muss das widerspiegeln.
- **Engagement-Dark-Patterns:** Kein Fear of Missing Out, keine künstlichen Wartezeiten, keine Energie-Mechaniken, kein Daily-Login-Druck.
- **Inauthentische österreichische Realität:** Keine generisch-deutschen Inhalte mit Österreich-Branding. Jedes Szenario muss österreichisch verankert sein.
- **Tutorial-Hölle:** Maximale 90-Sekunden Einführung. Spieler:innen müssen im ersten Level lernen durch spielen, nicht durch Lesen.
- **3D um der 3D willen:** Babylon.js-Visualisierungen existieren nur wenn sie Bedeutung tragen. Keine Technologie-Showcase-Elemente die keinen Pädagogischen Mehrwert haben.
- **Teacher-Mode als Anhang:** Das Lehrpersonen-Tool ist ein eigenständiges Feature. Es darf nicht nachgereicht oder versteckt sein.
- **Ausschluss durch Komplexität:** Das Spiel muss ohne Vorwissen spielbar sein. Komplexität wird durch Progression aufgebaut, nicht vorausgesetzt.
