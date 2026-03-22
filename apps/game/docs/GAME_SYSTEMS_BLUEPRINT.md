# GAME SYSTEMS BLUEPRINT
## Brücken Bauen 3D — Kernsysteme-Design
**Version 2.0 | Stand: März 2026 | Dokument: Autoritativ**

---

## 1. Konsequenz-System

Die aktuelle Implementierung (`system-progression.js`) kennt nur Sofort-Konsequenzen: Score + XP. Das ist der erste Schritt, aber nicht genug für das Versprechen des Spiels. Entscheidungen brauchen fünf Ebenen von Wirkung.

### Ebene 1: Sofortkonsequenz (in jedem Level implementiert)

Was passiert sofort nach der Entscheidung, noch in derselben Szenario-Sequenz.

```javascript
// Schema-Erweiterung für jede Choice in data-scenarios.js
immediate: {
  score:        85,         // 0-100
  xpBonus:      22,
  text:         "Der Gemeinderat stimmt zu. Die Maßnahme wird beschlossen.",
  stakeholderReaction: {
    buerger:    "erleichtert",
    politiker:  "zustimmend",
    opponent:   "resigniert",
  },
}
```

Die `stakeholderReaction` bestimmt welche emotionalen Signale die Stakeholder-Billboard-Meshes im 3D-Raum senden (Farbwechsel, kurze Animation). Nicht ausgesprochen — gezeigt.

### Ebene 2: Mittelfristige Konsequenz (beeinflusst Level 2-3 der gleichen Welt)

Entscheidungen in Level N hinterlassen einen `worldTrace` der in Level N+1 und N+2 sichtbar wird — als Kontext-Text und als veränderte Szenario-Schwierigkeit.

```javascript
// Ergänzung im Choice-Schema
midterm: {
  worldTrace: {
    key:   "gemeinde_vertrauen",   // eindeutiger Schlüssel pro Welt
    delta: +2,                     // Vertrauen steigt
    label: "Die Gemeinde erinnert sich an Ihren Einsatz.",  // sichtbar in Folge-Level
  },
  unlocksInLevel: 3,   // ab Level 3 dieser Welt aktiv
  locksOption:    null, // null = keine Option wird in Folge-Level gesperrt
}
```

Wenn `locksOption` gesetzt ist (z.B. `"confrontation"`): In einem Folge-Level ist die direkt konfrontative Option nicht mehr wählbar, weil die Brücke zu dieser Partei verbrannt ist. Das ist die stärkste Form der mittelfristigen Konsequenz.

### Ebene 3: Reputative Konsequenz (andere Rollen/NPCs reagieren anders)

`GAME_STATE.reputation` ist ein neues Objekt das pro Akteur eine Bewertung der Spielfigur speichert.

```javascript
// Neue Property in GAME_STATE (config.js)
GAME_STATE.reputation = {
  zivilgesellschaft: 50,  // 0-100, startet neutral
  institutionen:     50,
  medien:            50,
  opposition:        50,
};

// Choice-Schema-Erweiterung
reputative: {
  zivilgesellschaft: +5,   // steigt bei consensus-Entscheidungen
  institutionen:     -2,   // fällt bei direkter Konfrontation
  medien:             0,
  opposition:        +3,
}
```

Reputation hat zwei Effekte:
1. **Informationszugang:** Bei `medien >= 70` sieht die Journalistin in Folge-Szenarien einen zusätzlichen versteckten Fakt.
2. **Option-Kosten:** Bei `institutionen <= 30` kostet die "offizielle Beschwerde"-Option 20% mehr Score (weil niemand mehr zuhört).

Reputation wird auf der Worldmap nicht direkt als Zahl gezeigt. Sie manifestiert sich subtil — als geänderte Reaktionstexte der Stakeholder.

### Ebene 4: Gesellschaftliche Konsequenz (World State: Demokratie-Indikatoren)

`GAME_STATE.worldState` enthält die fünf Demokratie-Indikatoren. Jede Choice hat eine `societal`-Wirkung.

```javascript
// Choice-Schema-Erweiterung
societal: {
  vertrauen:    +3,
  teilhabe:     +1,
  rechtsstaat:   0,
  spannung:     -2,
  zukunftslast: -1,
}
```

**Schwellwert-Effekte:** Wenn ein Indikator einen Schwellwert über- oder unterschreitet, ändert sich die Worldmap-Visualisierung:

| Indikator | Grenzwert | Effekt |
|---|---|---|
| vertrauen < 30 | Krise | Welt-Knoten färben sich rot, neue Krisen-Level erscheinen |
| spannung > 70 | Eskalation | Eskalations-Overlay auf der Worldmap, manche Level werden schwieriger |
| rechtsstaat < 40 | Erosion | Beamtin-Rolle verliert Werkzeug-Zugang, Richterin-Szenarien erscheinen |
| teilhabe > 80 | Aufbruch | Bonus-Level "Bürger:innen-Initiative" erscheint |
| zukunftslast < 20 | Aufbruch | Welt 10 "Zukunft" öffnet sich früher |

Diese Schwellwert-Effekte sind das stärkste Feedback-Signal des Spiels. Sie machen den Zusammenhang zwischen Einzelentscheidungen und gesellschaftlicher Entwicklung sichtbar.

### Ebene 5: Pädagogische Konsequenz (Reflexionsprompt)

Nach jeder Entscheidung erscheint ein Reflexionsprompt im Debrief. Kein Moralurteil. Offene Frage.

```javascript
// Choice-Schema-Erweiterung
pedagogical: {
  reflectionPrompt: "Wer trägt die Kosten dieser Entscheidung — und wer hat sie nicht getroffen?",
  faktbox: {
    title:   "Verfassungsrechtlicher Kontext",
    text:    "Art. 7 B-VG garantiert allen Staatsbürgern...",
    source:  "Bundesverfassung 1920 (Österreich)",
    link:    "https://www.ris.bka.gv.at/...",
  },
  teacherHook: {
    discussionPrompt: "Wäre die Entscheidung anders ausgefallen, wenn [Stakeholder X] am Tisch gesessen hätte?",
    timeEstimate:     "8-12 Minuten",
    groupSize:        "3-5 Personen empfohlen",
  },
}
```

Der Reflexionsprompt erscheint immer. Die Faktbox ist optional (Spieler:innen können sie überspringen). Der Teacher-Hook ist nur im Teacher-Mode sichtbar.

---

## 2. Rollen-Asymmetrie: Spielmechanische Unterschiede je Rolle

### Asymmetrie-Dimensionen

Jede Rolle hat vier echte mechanische Unterschiede:

#### Engagierte Bürgerin
- **Informationszugang:** `"community_voices"` — sieht in jedem Szenario 1-2 Stimmen aus der Bevölkerung die anderen Rollen verborgen bleiben (kurze Zitate, emotionale Wahrheiten)
- **Werkzeuge:** Bürgerversammlung (Cooldown 3 Level) erhöht `teilhabe +8` aber kostet 2 Szenario-Runden
- **Risiko:** Wenn `reputation.zivilgesellschaft < 40`: Bürgerversammlung hat keine Wirkung mehr
- **Win-Condition:** `consensus`-Entscheidungen bringen +20% Score. Wenn am Ende einer Welt > 6/10 Entscheidungen `consensus` waren: Mastery-Bonus "Brückenbaue-rin"

#### Lokalpolitiker
- **Informationszugang:** `"power_map"` — sieht Koalitionsverhältnisse und Stimmengewichte der Stakeholder, die für andere Rollen unsichtbar sind
- **Werkzeuge:** Dringlichkeitssitzung (Cooldown 4 Level) setzt Entscheidung sofort um, überspringt aber Konsultationsprozesse — wirkt auf `vertrauen -3, rechtsstaat -2`
- **Risiko:** Bei `reputation.zivilgesellschaft < 30`: "Mehrheitsentscheidung"-Bonus sinkt auf +5% (Legitimationsverlust)
- **Win-Condition:** `majority`-Entscheidungen bringen +25% Score. Aber: Wenn am Ende einer Welt `spannung > 60`: Score-Penalty `-15%` (gewonnen, aber Gesellschaft gespalten)

#### Investigativ-Journalistin
- **Informationszugang:** `"hidden_facts"` — sieht in jedem Szenario eine versteckte Variable die anderen Rollen unsichtbar ist (z.B. "Der Bürgermeister hat finanzielle Verbindungen zu Auftragnehmer X")
- **Werkzeuge:** Exklusivbericht (Cooldown 5 Level) kippt öffentliche Meinung in einem Schritt, aber: Quellenschutz-Mechanik — Spieler:innen müssen entscheiden ob sie Quelle schützen (Score -10) oder preisgeben (Score +20 aber `reputation.medien -15` permanent)
- **Risiko:** Quellenmissbrauch akkumuliert über Welten. Bei 3 Quellen-Missbrauch: Szenario "Vertrauensverlust der Presse" wird aktiv
- **Win-Condition:** `expose`-Entscheidungen bringen +30% Score. Wenn alle `hidden_facts` einer Welt aufgedeckt wurden: Mastery-Bonus "Vierte Macht"

#### Klimaaktivist
- **Informationszugang:** `"future_load"` — sieht `zukunftslast`-Delta jeder Choice bevor entschieden wird (einzige Rolle mit Zukunftssicht)
- **Werkzeuge:** Massendemonstration (Cooldown 4 Level) erzeugt massiven Druck (`spannung +10, teilhabe +5`) aber macht institutionelle Wege in 1 Folge-Level schwieriger
- **Risiko:** Wenn `spannung > 70`: Eskalations-Mechanik aktiviert — Demonstrationsbonus kehrt sich um
- **Win-Condition:** `environment`-Entscheidungen bringen +35% Score. Wenn `zukunftslast` am Welt-Ende unter 30: Mastery-Bonus "Morgen"

#### Verwaltungsbeamter
- **Informationszugang:** `"legal_basis"` — sieht Rechtsgrundlage und Verfahrensregeln, die andere Rollen nicht sehen. Weiß welche Optionen rechtswidrig wären (roter Marker)
- **Werkzeuge:** Rechtsgutachten (Cooldown 3 Level) sichert Entscheidung juristisch ab — Score-Penalty für "Verfahrensfehler"-Folgen entfällt. Aber: Kostet 1 Runde (Zeitlimit -30 Sek.)
- **Risiko:** Wenn `rechtsstaat < 40`: Rechtsgutachten verliert Wirksamkeit (System ist bereits erodiert)
- **Win-Condition:** `compliant`-Entscheidungen bringen +40% Score. Wenn keine rechtswidrige Entscheidung in gesamter Welt: Mastery-Bonus "Rechtsstaat"

#### Verfassungsrichterin
- **Informationszugang:** `"constitutional_dimension"` — sieht Verfassungsartikel-Relevanz jeder Option (welches Grundrecht steht auf dem Spiel?). Einzige Rolle die Grundrechts-Dimensionen sieht bevor entschieden wird
- **Werkzeuge:** Verfassungsklage (Cooldown 6 Level) stoppt alle anderen Prozesse. Mächtigstes Werkzeug im Spiel, aber: erzeugt starken Backlash (`spannung +15`) und kann nur einmal pro Welt eingesetzt werden
- **Risiko:** Verfassungsklage als erstes Mittel gilt als Scheitern der Demokratie: `vertrauen -10` auch wenn Klage erfolgreich ist
- **Win-Condition:** `rights`-Entscheidungen bringen +50% Score. Wenn kein Grundrecht in einer gesamten Welt verletzt wurde: Mastery-Bonus "Hüterin"

---

## 3. World-Map-Design

### Nicht nur Level-Auswahlliste

Die Worldmap ist die persistente Visualisierung des Demokratie-Zustands. Jede Welt hat einen sichtbaren Gesundheitszustand der sich über Spielsitzungen verändert.

### Visuelle Demokratie-Indikatoren je Welt

Jede der 10 Welt-Regionen trägt eine farbige Säule (Babylon.js Cylinder-Mesh mit GlowLayer) die den aggregierten Demokratie-Zustand dieser Welt visualisiert:

```
Höhe der Säule = (vertrauen + teilhabe + rechtsstaat - spannung - zukunftslast) / 5
Farbe:  > 70 = Grün (pulsierend)
        50-70 = Gelb
        30-50 = Orange
        < 30 = Rot (flackernd)
```

Diese Säulen sind nicht decorative. Sie stehen direkt neben den Level-Knoten und sind das erste was Spieler:innen nach einem Szenario-Abschluss sehen — die Welt hat sich verändert.

### Freischalt-Logik

```
Welt 1 (Gemeinde):        sofort verfügbar
Welt 2 (Schule):          5 Level in Welt 1 abgeschlossen
Welt 3 (Arbeit):          5 Level in Welt 2 abgeschlossen
Welt 4 (Medien):          alle 10 Level in Welt 1-2 abgeschlossen (oder 3+3 in Welt 2+3)
Welten 5-8:               progressiv, jeweils 5 Level in Vorgänger-Welt
Welt 9 (Gerechtigkeit):   mindestens 50 Level insgesamt abgeschlossen
Welt 10 (Zukunft):        mindestens 80 Level insgesamt, oder: zukunftslast < 20
```

Nicht-freigeschaltete Welten sind sichtbar auf der Worldmap — sie erscheinen gedimmt mit Schloss-Indikator. Spieler:innen sehen wohin sie fahren, aber wissen dass sie sich den Weg erarbeiten müssen.

### Sammelelemente: Wissens-Fragmente

Jedes Level kann 0-1 Wissens-Fragmente freischalten. Wissens-Fragmente sind reale österreichische Dokumente und Fallbeispiele:

- Verfassungsartikel (B-VG, EMRK-Artikel)
- Österreichische Höchstgerichts-Urteile (anonymisiert und vereinfacht)
- Historische Demokratie-Momente aus Österreich (1919 Frauenwahlrecht, 1955 Staatsvertrag, etc.)
- Aktuelle Demokratie-Berichte (demokratieindex.at, Freedom House)

Wissens-Fragmente werden in einer "Demokratie-Bibliothek" gesammelt die außerhalb des Spiels zugänglich ist. Das ist die langfristige Retention-Mechanik für Bildungsinteressierte.

Freischaltbedingung: Nicht Score-abhängig. Wissens-Fragmente erscheinen wenn eine bestimmte moralische Spannung in einem Szenario erkundet wird — z.B. "Wenn Spieler:in die riskante Option wählt und den Debrief-Text vollständig liest."

### Ereignis-Überlagerungen

Wenn `spannung > 70` oder ein Demokratie-Indikator eine Schwellwert-Krise auslöst, erscheinen Ereignis-Marker auf der Worldmap:

- **Krisen-Marker** (rotes Ausrufezeichen): Blockiert bestimmte Level bis die Krise durch andere Level-Abschlüsse gelöst wird
- **Opportunitäts-Marker** (goldener Stern): Öffnet ein temporär verfügbares Bonus-Level (ist nach 5 Sessions wieder geschlossen)

Diese dynamischen Overlay-Elemente machen die Worldmap zu einer lebendigen Oberfläche, nicht zu einer statischen Level-Liste.

---

## 4. Szenario-Schema: Template für alle 100 Level

Alle 100 Level folgen exakt diesem Schema. Kein Level darf ohne alle Pflichtfelder implementiert werden.

```javascript
{
  // PFLICHTFELDER
  id:           42,                    // global eindeutig, 1-100
  worldId:      4,                     // 1-10
  levelInWorld: 2,                     // 1-10
  title:        "Pressefreiheit",
  difficulty:   "mittel",              // einfach | mittel | schwer | experte

  context: `
    Wien, 2026. Sophie Maier, Investigativ-Journalistin beim Österreichischen
    Rundfunk, hat Dokumente erhalten, die eine Verknüpfung zwischen dem
    Stadtrat für Stadtentwicklung und einem privaten Baukonzern nahelegen.
    Ihr Redaktionsleiter rät zur Vorsicht — die Quellen könnten gefährdet sein.
    Die Unterlagen wurden ihr anonym zugespielt.
  `,   // Max. 200 Wörter

  prompt: "Wie handeln Sie?",   // kurz, direkt

  stakeholders: [
    { id: "sophie",    name: "Sophie Maier",       role: "Journalistin",  interest: "Wahrheit publizieren" },
    { id: "stadtrat",  name: "Stadtrat Gruber",    role: "Politiker",     interest: "Information unterdrücken" },
    { id: "quelle",    name: "Anonyme Quelle",     role: "Whistleblower", interest: "Schutz + Gerechtigkeit" },
    { id: "chefredakteur", name: "Mag. Winter",   role: "Redaktionsleitung", interest: "Rechtssicherheit" },
  ],

  conflictAxis: "Pressefreiheit vs. Quellenschutz vs. öffentliches Interesse",

  hiddenVariable: {
    key:       "quelle_gefaehrdet",
    condition: "wenn Option 'sofort_publizieren' gewählt wird",
    reveal:    "Die Quelle war ein Beamter des Innenministeriums — Strafverfolgung droht.",
  },

  moralTension: "Öffentliches Interesse an Transparenz steht gegen Schutzpflicht gegenüber einer Person die sich exponiert hat.",

  choices: [
    {
      id:     "sofort_publizieren",
      text:   "Sofort publizieren — das öffentliche Interesse überwiegt",
      type:   "expose",
      difficulty: "riskant",   // optimal | pragmatisch | riskant | falsch
      immediate: {
        score:    75,
        xpBonus:  18,
        text:     "Der Bericht erscheint. Die Öffentlichkeit ist aufgerüttelt. Stadtrat Gruber kündigt rechtliche Schritte an.",
        stakeholderReaction: { sophie: "entschlossen", stadtrat: "wütend", quelle: "verängstigt" },
      },
      midterm: {
        worldTrace: { key: "quelle_exponiert", delta: 0, label: "Die Quelle wurde identifiziert." },
        unlocksInLevel: 2,
        locksOption: null,
      },
      reputative: { zivilgesellschaft: +8, institutionen: -5, medien: +12, opposition: +4 },
      societal:   { vertrauen: +4, teilhabe: +2, rechtsstaat: -2, spannung: +6, zukunftslast: 0 },
      pedagogical: {
        reflectionPrompt: "Hat die Journalistin die richtige Abwägung getroffen — oder hätte sie zuerst die Quelle fragen müssen?",
        faktbox: {
          title:  "Medienfreiheit in Österreich",
          text:   "Art. 10 EMRK schützt die Meinungsfreiheit. Das Redaktionsgeheimnis (§ 31 MedienG) schützt Journalisten vor Quellenoffenbarung.",
          source: "Mediengesetz (MedienG), BGBl. Nr. 314/1981",
        },
        teacherHook: {
          discussionPrompt: "Welche Pflichten hat eine Journalistin gegenüber ihrer Quelle? Gegenüber der Öffentlichkeit? Wenn sie in Konflikt geraten — was hat Vorrang?",
          timeEstimate: "10-15 Minuten",
        },
      },
    },
    {
      id:     "absicherung_zuerst",
      text:   "Erst rechtliche Absicherung einholen, dann publizieren",
      type:   "official",
      difficulty: "optimal",
      immediate: {
        score:    88,
        xpBonus:  22,
        text:     "Ein Anwalt prüft die Lage. Nach einer Woche wird ein wasserdichter Bericht veröffentlicht.",
        stakeholderReaction: { sophie: "konzentriert", stadtrat: "nervös", quelle: "erleichtert" },
      },
      midterm: {
        worldTrace: { key: "recherche_solide", delta: +2, label: "Die Redaktion gilt als vertrauenswürdig." },
        unlocksInLevel: 2,
        locksOption: null,
      },
      reputative: { zivilgesellschaft: +5, institutionen: +3, medien: +8, opposition: +2 },
      societal:   { vertrauen: +6, teilhabe: +3, rechtsstaat: +3, spannung: +2, zukunftslast: -1 },
      pedagogical: {
        reflectionPrompt: "Schützt rechtliche Absicherung nur die Journalistin — oder stärkt sie auch die Demokratie?",
        faktbox: null,
        teacherHook: {
          discussionPrompt: "Verlangsamt rechtliche Vorsicht wichtige demokratische Kontrolle? Oder ist sie ihr Fundament?",
          timeEstimate: "8-10 Minuten",
        },
      },
    },
    {
      id:     "quelle_fragen",
      text:   "Zuerst die Quelle um Erlaubnis fragen",
      type:   "community",
      difficulty: "pragmatisch",
      immediate: {
        score:    80,
        xpBonus:  20,
        text:     "Die Quelle stimmt zu, unter Bedingungen. Der Bericht erscheint — mit Einschränkungen.",
        stakeholderReaction: { sophie: "bedächtig", stadtrat: "unruhig", quelle: "dankbar" },
      },
      midterm: {
        worldTrace: { key: "vertrauen_quelle", delta: +3, label: "Quellen vertrauen der Redaktion in Zukunft mehr." },
        unlocksInLevel: 3,
        locksOption: null,
      },
      reputative: { zivilgesellschaft: +6, institutionen: 0, medien: +6, opposition: +1 },
      societal:   { vertrauen: +5, teilhabe: +2, rechtsstaat: +1, spannung: +1, zukunftslast: -1 },
      pedagogical: {
        reflectionPrompt: "Wessen Geschichte ist das — der Journalistin, der Quelle oder der Öffentlichkeit?",
        faktbox: null,
        teacherHook: {
          discussionPrompt: "Gibt es ein Recht auf 'Vergessen' für Whistleblower — auch wenn das öffentliche Interesse hoch ist?",
          timeEstimate: "12 Minuten",
        },
      },
    },
    {
      id:     "bericht_einstellen",
      text:   "Den Bericht auf Druck des Redaktionsleiters einstellen",
      type:   "reject",
      difficulty: "falsch",
      immediate: {
        score:    20,
        xpBonus:  0,
        text:     "Der Bericht bleibt unveröffentlicht. Stadtrat Gruber bleibt im Amt.",
        stakeholderReaction: { sophie: "frustriert", stadtrat: "erleichtert", quelle: "verbittert" },
      },
      midterm: {
        worldTrace: { key: "selbstzensur", delta: -4, label: "Selbstzensur schwächt das Vertrauen in Medien." },
        unlocksInLevel: 2,
        locksOption: "sofort_publizieren",   // in Folge-Level nicht mehr wählbar
      },
      reputative: { zivilgesellschaft: -8, institutionen: +2, medien: -12, opposition: -3 },
      societal:   { vertrauen: -6, teilhabe: -3, rechtsstaat: -4, spannung: +3, zukunftslast: +2 },
      pedagogical: {
        reflectionPrompt: "Wenn Journalistinnen aus Angst schweigen — wer verliert dann?",
        faktbox: {
          title:  "Pressefreiheits-Index Österreich",
          text:   "Österreich liegt im Reporters Without Borders Index 2025 auf Platz 30 von 180 Ländern. Hauptkritikpunkt: Konzentration der Medienbesitz.",
          source: "Reporters Without Borders, World Press Freedom Index 2025",
        },
        teacherHook: {
          discussionPrompt: "Welche strukturellen Bedingungen schützen Pressefreiheit? Welche gefährden sie?",
          timeEstimate: "15 Minuten",
        },
      },
    },
  ],

  // ROLLENSPEZIFISCHE INFORMATIONEN
  roleSpecificInfo: {
    journalist: {
      extraFact: "Ihre Quelle hat Anzeichen von Angst gezeigt. Eine Vertrauensperson hat Sie gewarnt.",
      toolHint:  "Exklusivbericht verfügbar — Cooldown beachten",
    },
    richter: {
      extraFact:  "§ 31 MedienG: Redaktionsgeheimnis gilt absolut, auch gegenüber Strafverfolgungsbehörden.",
      toolHint:   null,
    },
    beamter: {
      extraFact:  "Aktenordnung: Dokumente dieser Klassifikation dürfen nicht ohne ministeriellen Beschluss weitergeleitet werden.",
      toolHint:   null,
    },
    buerger:  { extraFact: "Drei Bekannte haben den gleichen Verdacht geäußert — ohne es zu wissen.", toolHint: null },
    politiker: { extraFact: "Stadtrat Gruber hat im letzten Halbjahr drei Bauprojekte beschleunigt.", toolHint: null },
    aktivist:  { extraFact: "Die Dokumente könnten auch Umweltauflagen betreffen.", toolHint: null },
  },

  // DIFFICULTY-MODIFIKATOREN
  timeLimit:        90,         // Sekunden (null = kein Limit)
  hiddenVariableActive: true,   // false in einfach-Szenarien
  reputationActive:    true,    // false in einfach-Szenarien

  // PROGRESSION-REWARD
  stars:     null,   // wird nach Abschluss berechnet
  xpReward:  250,    // Basis-XP für dieses Level
  knowledge: {       // Wissens-Fragment (optional)
    id:        "mediengesetz_31",
    condition: "debrief_vollständig_gelesen",
  },
}
```

---

## 5. Teacher Mode: Echter Nutzen, kein Demo-Oberfläche

### Design-Grundsatz

Der Teacher Mode ist kein Reporting-Tool das nachträglich implementiert wird. Er ist ein eigenständiger Nutzungsmodus der von Beginn an in den Core Loop integriert ist.

### Klassen-Code-System

Lehrpersonen generieren einen Klassen-Code (6 Zeichen, z.B. `WIE-42`). Spieler:innen geben diesen Code beim Start ein. Alle Entscheidungen dieser Session werden lokal mit diesem Code verknüpft.

**Datenschutz (DSGVO-kritisch):**
- Kein Account-System. Kein Server-Upload ohne expliziten Export.
- Klassen-Codes sind lokal gespeichert (localStorage).
- Export ist ein manueller Schritt der Lehrperson (JSON-Download).
- Anonymisierung: Spieler:innen werden nicht namentlich gespeichert. Nur Klassen-Code + anonyme Spieler-ID (zufälliger String, wechselt jede Session).

### Live-Heatmap der Entscheidungen

Im Teacher-Mode-Screen sieht die Lehrperson nach jedem Szenario:

```
Szenario: "Pressefreiheit" (Level 42)
──────────────────────────────────────
Option A: Sofort publizieren          ████████░░  8 Schüler:innen (32%)
Option B: Rechtliche Absicherung      ████████████ 12 Schüler:innen (48%)
Option C: Quelle fragen               ████░░░░░░  4 Schüler:innen (16%)
Option D: Bericht einstellen          █░░░░░░░░░  1 Schüler:in   (4%)
```

Diese Visualisierung ist der Ausgangspunkt für die Klassendiskussion. Lehrpersonen sehen auf einen Blick: "4% haben aufgegeben — warum? 32% haben das Risiko gewählt — wie begründen sie das?"

### Diskussionsprompts

Pro Szenario erscheinen im Teacher-Mode 3 vorgefertigte Diskussionsprompts (aus `pedagogical.teacherHook`). Lehrperson kann diese mit einem Klick auf dem Projektor-Display anzeigen.

Format: Frage + empfohlene Methode + Zeitschätzung.

### Exportierbare Lernstandsberichte

Export-Format: JSON (maschinenlesbar) + HTML (druckbar für Zeugnis-Portfolio).

```
Lernstandsbericht — Klasse 4A WIE-42
Sitzung: 15.04.2026, 10:00-10:50
──────────────────────────────────────────────────────────────────
Gespielte Level:     3 (Level 1, 2, 3 der Welt "Gemeinde")
Klassen-Entscheid:   68% consensus-orientiert, 24% institutionell, 8% konfrontativ
Diskutiert:          Bürgerversammlung vs. Gemeinderatsbeschluss (12 Minuten)

Lernziele (Curriculum-Bezug):
[x] PB 4.2: Demokratische Entscheidungsprozesse verstehen
[x] PB 4.5: Interessenskonflikte in der Demokratie analysieren
[ ] PB 5.1: Grundrechte und Verfassung (nicht gespielt)

Empfehlung für nächste Sitzung: Level 4-5 der Welt Gemeinde
──────────────────────────────────────────────────────────────────
```

Curriculum-Bezug: Österreichischer Lehrplan Politische Bildung (AHS, Lehrplan 2023). Lehrpersonen können die relevanten Kompetenzbereiche manuell bestätigen oder anpassen.

### Projizier-Modus

Lehrpersonen können das Spiel in einem "Live"-Modus starten wo alle Spielentscheidungen auf einem zentralen Bildschirm als Heatmap sichtbar sind — während die Schüler:innen auf eigenen Geräten spielen. Kein Server notwendig: Alle Schüler:innen-Geräte exportieren ihren Entscheid als QR-Code den die Lehrperson scannt, oder (wenn im selben Netz) über lokales Broadcast via BroadcastChannel API.

---

## 6. Retention-Mechanismen (ohne toxische Dark Patterns)

### Was verboten ist

- Keine Energie-Mechanik (keine tägliche Regeneration)
- Kein Fear of Missing Out (keine zeitlich begrenzten Inhalte die durch Nicht-Spielen verloren gehen)
- Keine Push-Notifications
- Kein Leaderboard (anonyme Aggregat-Statistiken sind erlaubt, Ranglisten nicht)
- Kein Daily-Login-Bonus
- Keine künstlichen Wartezeiten

### Was erlaubt und erwünscht ist

#### Mastery-Pfade (nicht XP-Grinding)

XP und Sterne sind Fortschritts-Indikatoren, keine Grinding-Belohnungen. Mastery-Boni werden durch *Art* der Entscheidungen erworben, nicht durch *Anzahl*:

- "Brückenbaue-rin": 6/10 consensus-Entscheidungen in einer Welt
- "Vierte Macht": alle hidden_facts einer Welt aufgedeckt
- "Rechtsstaat": keine rechtswidrige Entscheidung in einer Welt
- "Morgen": `zukunftslast < 20` am Welt-Ende
- "Hüterin": kein Grundrecht in einer Welt verletzt

Mastery-Boni geben kein spielmechanisches Powerup. Sie geben Wissens-Fragmente frei und personalisieren die Abschluss-Karte der Welt. Das ist genug.

#### Perspective-Shifting

Nach dem Abschluss eines Levels erscheint der Hinweis: "Wie hätte [andere Rolle] entschieden?" Mit einem Klick startet dasselbe Szenario mit einer anderen Rolle. Verschiedene `roleSpecificInfo`-Felder liefern andere Ausgangslagen, andere Werkzeuge, andere Win-Conditions — es ist mechanisch ein anderes Spiel.

Das ist die wichtigste Replayability-Mechanik. Sie hat auch pädagogischen Kern: Perspektivwechsel ist eine demokratische Kompetenz.

#### Meta-Wissen: Demokratie-Bibliothek

Alle freigeschalteten Wissens-Fragmente sind in einer Bibliothek zugänglich die auch ohne laufendes Spiel aufgerufen werden kann. Diese Bibliothek ist linkbar und teilbar — ein Schüler kann einen Verfassungsartikel an eine Mitschülerin schicken.

Inhalt: Verfassungsartikel, Gerichtsurteile, historische Demokratie-Momente, aktuelle Demokratie-Berichte. Alle mit Quellenangabe und österreichischem Kontext.

#### Welt-Abschluss-Reflektion

Wenn alle 10 Level einer Welt abgeschlossen sind, erscheint eine "Welt-Bilanz"-Karte:

```
Welt 1: Gemeinde — Abgeschlossen
────────────────────────────────────────────────────
Ihre demokratische Bilanz:
  Vertrauen:    70 (+10) — gestärkt durch Ihre Entscheidungen
  Teilhabe:     65 (+5)
  Rechtsstaat:  72 (+2)
  Spannung:     28 (-7)  — abgebaut
  Zukunftslast: 35 (-10) — reduziert

Muster in Ihren Entscheidungen:
  Sie haben in 7 von 10 Situationen zuerst gehört, dann gehandelt.
  Sie haben 2 Mal riskiert — einmal hat es sich gelohnt, einmal nicht.
  Sie haben kein Grundrecht verletzt.

Freigeschaltete Wissens-Fragmente: 4 von 7
────────────────────────────────────────────────────
```

Diese Bilanz ist keine Bewertung. Sie ist ein Spiegel. Spieler:innen sollen über ihre eigenen Muster nachdenken, nicht über eine externe Beurteilung.
