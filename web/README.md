# Gaming Platform – Educational Web Games

> **Demokratie-Bildungsspiele mit PostgreSQL + Prisma ORM**

**URL (Production)**: `https://web.menschlichkeit-oesterreich.at`  
**URL (Development)**: `http://localhost:3000` (Static Server)

---

## 🎯 Übersicht

Die Gaming Platform bietet **educational web games** für demokratische Bildung:

- 🎮 **Voting Puzzle** – Wahlsystem-Simulation
- ⚖️ **Constitution Quest** – Verfassungs-Lernspiel
- 🏛️ **Democracy Simulator** – Demokratie-Simulation mit Entscheidungsszenarien

**Tech Stack**: HTML5 + JavaScript + Prisma + PostgreSQL (für User Progress Tracking)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (für Prisma)
- **Python** 3.12+ (für Dev Server)
- **PostgreSQL** 15+ (für Game Sessions)

### Installation

```bash
# In web-Verzeichnis wechseln
cd web

# Prisma Setup
npx prisma generate
npx prisma migrate dev

# Development Server starten (von Root)
npm run dev:games
# ODER manuell:
python3 -m http.server 3000
```

**Games verfügbar unter**: <http://localhost:3000>

---

## 📁 Projektstruktur

```
web/
├── games/                      # Game HTML/JS Files
│   ├── voting-puzzle/
│   │   ├── index.html
│   │   ├── game.js
│   │   └── styles.css
│   ├── constitution-quest/
│   │   ├── index.html
│   │   ├── game.js
│   │   └── styles.css
│   └── democracy-simulator/
│       ├── index.html
│       ├── game.js
│       └── styles.css
├── prisma/                     # Prisma ORM (Game Progress DB)
│   ├── schema.prisma           # Database Schema
│   └── migrations/             # Database Migrations
├── assets/                     # Game Assets (Images, Audio)
│   ├── images/
│   ├── audio/
│   └── fonts/
├── themes/                     # Game Themes & Skins
├── index.html                  # Game Portal (Overview)
└── README.md                   # This file
```

---

## 🗄️ Database Schema (Prisma)

### Models

**Location**: `../schema.prisma` (Root-Level – shared with API)

```prisma
model User {
  id            String         @id @default(uuid())
  username      String         @unique
  email         String         @unique
  xp            Int            @default(0)
  level         Int            @default(1)
  createdAt     DateTime       @default(now())
  gameSessions  GameSession[]
  achievements  Achievement[]
}

model GameSession {
  id          String   @id @default(uuid())
  userId      String
  gameType    GameType
  score       Int
  duration    Int      // Sekunden
  completedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}

model Achievement {
  id          String   @id @default(uuid())
  userId      String
  type        String   // "first_game", "perfect_score", etc.
  earnedAt    DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}

enum GameType {
  VOTING_PUZZLE
  CONSTITUTION_QUEST
  DEMOCRACY_SIMULATOR
}
```

### Database Operations

```bash
# Schema ändern
# 1. schema.prisma bearbeiten (Root-Level)
vim ../schema.prisma

# 2. Migration erstellen
npx prisma migrate dev --name add_achievements

# 3. Prisma Client neu generieren
npx prisma generate

# 4. Database Browser (Prisma Studio)
npx prisma studio
```

---

## 🎮 Games

### 1. Voting Puzzle

**Lernziel**: Österreichisches Wahlsystem verstehen (Verhältniswahl, d'Hondt-Verfahren)

**Gameplay**:

- Spieler verteilen Stimmen auf Parteien
- Simuliert Mandatsverteilung nach d'Hondt
- Zeigt Auswirkungen kleiner Stimmenänderungen

**Dateien**: `games/voting-puzzle/`

---

### 2. Constitution Quest

**Lernziel**: Grundrechte & Verfassungsprinzipien (B-VG)

**Gameplay**:

- Quiz-basiert mit Entscheidungsszenarien
- Verfassungsartikel müssen Situationen zugeordnet werden
- Progressives Leveling-System (Grundrechte → Staatsorganisation)

**Dateien**: `games/constitution-quest/`

---

### 3. Democracy Simulator

**Lernziel**: Demokratische Entscheidungsprozesse & Kompromisse

**Gameplay**:

- Strategiespiel: Regierung bilden, Gesetze beschließen
- Koalitionsverhandlungen simulieren
- Trade-offs zwischen Idealen & politischer Realität

**Dateien**: `games/democracy-simulator/`

---

## 📊 User Progress Tracking

### API Integration

Games speichern Fortschritt über **API Service**:

```javascript
// game.js Beispiel
async function saveGameSession(score, duration) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(
    'https://api.menschlichkeit-oesterreich.at/api/v1/games/sessions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        gameType: 'VOTING_PUZZLE',
        score: score,
        duration: duration,
      }),
    }
  );

  if (response.ok) {
    const data = await response.json();
    console.log('Session saved:', data);
  }
}
```

### XP & Leveling System

- **XP pro Game**: Score × 10
- **Level-Schwelle**: 1000 XP pro Level
- **Achievements**:
  - `first_game` – Erstes Spiel gespielt
  - `perfect_score` – 100% Score erreicht
  - `speedrun` – Spiel in <60s abgeschlossen
  - `constitution_master` – Alle Constitution Quest Levels

---

## 🧪 Testing

### Manual Testing

```bash
# Games lokal testen
npm run dev:games  # Von Root

# Öffne Browser: http://localhost:3000
# Teste alle 3 Games manuell
```

### E2E Tests (Playwright)

```bash
# Von Root-Verzeichnis
npx playwright test tests/games/
```

**Test-Szenarien**:

- ✅ Game lädt ohne Fehler
- ✅ Score wird korrekt berechnet
- ✅ Progress wird über API gespeichert
- ✅ Achievements werden vergeben

---

## 🚀 Deployment

### Static File Hosting (Plesk)

```bash
# Von Root-Verzeichnis
rsync -avz web/ user@server:/var/www/vhosts/web.menschlichkeit-oesterreich.at/httpdocs/

# ODER mit Deployment-Script
./scripts/safe-deploy.sh --service games
```

### CDN Integration (Optional)

Für bessere Performance: Assets über CDN ausliefern

```html
<!-- index.html -->
<script src="https://cdn.menschlichkeit-oesterreich.at/games/voting-puzzle/game.js"></script>
```

---

## ♿ Accessibility

Games erfüllen **WCAG 2.1 Level AA**:

- ✅ **Keyboard Navigation** (alle Spiele mit Tab/Enter spielbar)
- ✅ **Screen Reader Support** (ARIA Labels für UI-Elemente)
- ✅ **Color Blind Mode** (alternative Farbschemata)
- ✅ **Adjustable Font Size** (Textgröße anpassbar)

---

## 📊 Analytics

### Game Metrics

Tracked über API:

- **Completion Rate** (% der Spieler, die Game abschließen)
- **Average Score** (durchschnittlicher Score pro Game)
- **Average Duration** (durchschnittliche Spieldauer)
- **Popular Games** (meistgespielte Games)

```sql
-- Beispiel-Query (PostgreSQL)
SELECT
  gameType,
  COUNT(*) as sessions,
  AVG(score) as avg_score,
  AVG(duration) as avg_duration
FROM "GameSession"
GROUP BY gameType;
```

---

## 🤝 Contributing

### Neues Game hinzufügen

1. **Ordner erstellen**: `games/neues-game/`
2. **Files**: `index.html`, `game.js`, `styles.css`
3. **GameType hinzufügen**: `schema.prisma` → `enum GameType`
4. **Migration**: `npx prisma migrate dev --name add_new_game`
5. **Portal aktualisieren**: `index.html` → Link zu neuem Game

Siehe [../.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md)

---

## 📖 Weitere Dokumentation

- **Database Schema**: [../schema.prisma](../schema.prisma)
- **API Integration**: [../api.menschlichkeit-oesterreich.at/README.md](../api.menschlichkeit-oesterreich.at/README.md)
- **DOCS-INDEX**: [../DOCS-INDEX.md](../DOCS-INDEX.md)

---

## 📜 Lizenz

MIT License – Siehe [../LICENSE](../LICENSE)

---

<div align="center">
  <strong>🎮 Spielend Demokratie lernen! 🇦🇹</strong>
</div>
