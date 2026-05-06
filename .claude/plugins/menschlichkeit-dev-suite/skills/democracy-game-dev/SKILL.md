---
name: democracy-game-dev
description: Fuehrt durch die Entwicklung und Wartung des Demokratiespiel-Moduls (`apps/babylon-game/`) — Spielmechanik, Content, Barrierefreiheit und demokratische Spielszenarien fuer Menschlichkeit Oesterreich. Wird aufgerufen bei `/democracy-game-dev`.
argument-hint: '[neues-szenario|schema|barrierefreiheit|bugfix|analyse]'
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Grep
  - Glob
---

# Demokratiespiel — Entwicklungsleitfaden

Du arbeitest am Demokratiespiel-Modul des Menschlichkeit Österreich Projekts.

## Spielkontext

Das Demokratiespiel simuliert demokratische Entscheidungsprozesse und fördert politische Bildung. Zielgruppe: österreichische Bürger:innen, Schulen, NGOs.

**Kern-Verzeichnisse:**

- `apps/babylon-game/` — Hauptmodul
- `apps/babylon-game/src/` — Next.js App, Gameplay und UI
- `apps/babylon-game/public/` und `apps/babylon-game/assets/` — Szene- und Asset-Bestand

---

## Schritt 1 — Codebase verstehen

```bash
rg --files apps/babylon-game | Select-Object -First 30
Get-ChildItem apps/babylon-game
```

Identifiziere:

- Welche Spielszenarien bereits existieren
- Datenbankmodelle (Prisma)
- API-Endpunkte (falls vorhanden)
- Bestehende Tests

---

## Schritt 2 — Prisma-Schema für Spielmechanik

Das Spiel nutzt aktuell keinen separaten Prisma-Unterordner im Game-Modul; Daten- oder Persistenzlogik muss zuerst im realen Repo verifiziert werden.

```bash
rg --files . | rg "schema\\.prisma"
```

**Wichtige Modelle (Beispiel-Struktur):**

```prisma
model GameSession {
  id         String   @id @default(cuid())
  scenario   String
  players    Int      @default(1)
  createdAt  DateTime @default(now())
  results    Json?
}

model DemocracyScenario {
  id          String   @id @default(cuid())
  title       String
  description String
  options     Json     // Abstimmungsoptionen
  category    String   // "Kommunal" | "National" | "EU"
  difficulty  Int      @default(1) // 1-3
}
```

Bei Schema-Änderungen immer:

```bash
cd . && npx prisma migrate dev --name <beschreibung>
npx prisma generate
```

---

## Schritt 3 — Neues Spielszenario erstellen

Jedes Szenario benötigt:

1. **Titel** (Österreichisches Deutsch, max. 60 Zeichen)
2. **Beschreibung** (Kontext, 100-200 Wörter)
3. **Abstimmungsoptionen** (2-5 Optionen mit Konsequenzen)
4. **Bildungsinhalt** (Erklärung demokratischer Prinzipien)
5. **Schwierigkeitsgrad** (1=Grundschule, 2=Mittelschule, 3=Erwachsene)

**Kategorien:**

- `Kommunal` — Gemeinderat, Bürgermeisterwahl
- `National` — Nationalrat, Volksbegehren
- `EU` — Europaparlament, EU-Richtlinien
- `Vereinsleben` — Vereinsversammlung, Abstimmungen (Bezug zu Menschlichkeit Österreich)

---

## Schritt 4 — Barrierefreiheit (WCAG 2.1 AA)

Alle Spielelemente müssen barrierefrei sein:

```bash
# Prüfe Frontend auf ARIA-Labels
rg -n "aria-|role=" apps/babylon-game/src apps/babylon-game/public | Select-Object -First 20
```

**Pflichtanforderungen:**

- [ ] Alle interaktiven Elemente haben `aria-label`
- [ ] Tastatur-Navigation vollständig (Tab, Enter, Escape)
- [ ] Farbkontrast ≥ 4.5:1 (Normal), ≥ 3:1 (Groß)
- [ ] Keine reinen Farb-Informationen
- [ ] Screen-Reader-kompatible Ausgabe
- [ ] Spielstand auch ohne Animationen nutzbar

---

## Schritt 5 — Tests

```bash
# Unit-Tests für Spiellogik
npm --prefix apps/babylon-game run type-check

# Playwright E2E
npx playwright test --grep "game"
```

Neue Features erfordern Tests für:

- Szenario-Laden und -Anzeige
- Abstimmungslogik und Ergebnis-Berechnung
- Fehlerfall: keine Verbindung zur DB
- Mobile-Ansicht (≥ 320px Breite)

---

## Schritt 6 — Spielbalance und Fairness

Bei neuen Szenarien:

- Keine politisch einseitigen Optionen ohne Gegengewicht
- Alle Optionen sachlich und respektvoll formuliert
- Quellen für Factual-Content angeben
- Review durch Editorial-Bot (Österreichisches Deutsch) empfohlen

---

## Ausgabe

Bei Abschluss eines Tasks:

1. Geänderte Dateien auflisten
2. Migrations (falls Schema-Änderung) dokumentieren
3. Manuelle Testschritte in Österreichischem Deutsch beschreiben
4. Offene Barrierefreiheits-Punkte kennzeichnen
