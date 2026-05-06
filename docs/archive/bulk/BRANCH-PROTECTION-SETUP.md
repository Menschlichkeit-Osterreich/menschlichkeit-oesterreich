# Branch Protection Rules Setup für chore/figma-mcp-make

## 🛡️ Empfohlene Schutzmaßnahmen

### Schritt 1: Branch Protection aktivieren

Öffnen Sie: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/settings/branches

### Schritt 2: Neue Rule hinzufügen

1. Klicken Sie auf **"Add branch protection rule"** oder **"Add classic branch protection rule"**
2. Unter **"Branch name pattern"** geben Sie ein: `chore/figma-mcp-make`

### Schritt 3: Empfohlene Einstellungen aktivieren

#### ✅ Grundlegender Schutz (Minimal)

- ☑️ **"Require a pull request before merging"** (Optional - nur wenn Sie PRs möchten)
  - ☑️ "Require approvals" (0 oder 1)
  - ☐ "Dismiss stale pull request approvals when new commits are pushed"
- ☑️ **"Require status checks to pass before merging"** (Optional - wenn Sie CI/CD haben)
- ☑️ **"Do not allow bypassing the above settings"** (Für strikte Durchsetzung)

#### ✅ Schutz vor Datenverlust (WICHTIG)

- ☑️ **"Restrict who can push to matching branches"** (Optional)
  - Fügen Sie sich selbst hinzu, falls gewünscht

- ☑️ **"Allow force pushes"** → **DEAKTIVIERT** (Standard)
  - ⚠️ Stellen Sie sicher, dass das Häkchen NICHT gesetzt ist!
- ☑️ **"Allow deletions"** → **DEAKTIVIERT** (Standard)
  - ⚠️ Stellen Sie sicher, dass das Häkchen NICHT gesetzt ist!

#### 📋 Erweiterte Optionen (Optional)

- ☐ "Require signed commits" (Empfohlen für Enterprise)
- ☐ "Require linear history" (Verhindert Merge-Commits)
- ☐ "Require conversation resolution before merging"
- ☐ "Lock branch" (Nur für Read-Only Branches)

### Schritt 4: Speichern

Klicken Sie unten auf **"Create"** oder **"Save changes"**

## 🔒 Minimale Empfehlung für Ihren Hauptbranch

Für `chore/figma-mcp-make` als Hauptarbeitsbranch:

```
✅ Allow force pushes: NEIN (deaktiviert)
✅ Allow deletions: NEIN (deaktiviert)
⚪ Require pull request reviews: Optional (Nein, wenn Sie alleine arbeiten)
⚪ Require status checks: Optional (Ja, wenn CI/CD läuft)
```

## 🚀 Schnelle Einstellung (für Solo-Entwickler)

Wenn Sie der einzige Entwickler sind:

1. **Branch name pattern:** `chore/figma-mcp-make`
2. **WICHTIG:** Scrollen Sie nach unten zu:
   - [ ] "Allow force pushes" → **NICHT aktivieren**
   - [ ] "Allow deletions" → **NICHT aktivieren**
3. Alles andere kann deaktiviert bleiben
4. **"Create"** klicken

## ⚠️ Nach der Aktivierung

Nach dem Einrichten der Protection Rules:

- ✅ Der Branch kann nicht gelöscht werden
- ✅ Force Push ist nicht möglich
- ✅ Ihre Arbeit ist geschützt
- ⚠️ Sie selbst können auch nicht force-pushen (gewollt!)

## 🔄 Falls Sie dennoch Force Push brauchen

Temporär Protection Rules deaktivieren:

1. Gehen Sie zu Settings → Branches
2. Klicken Sie auf "Edit" bei der Rule
3. Aktivieren Sie kurz "Allow force pushes"
4. Führen Sie den Force Push aus
5. Deaktivieren Sie "Allow force pushes" wieder sofort

**Besser:** Verwenden Sie `git revert` statt `git reset --hard`

## 📚 GitHub Dokumentation

- Branch Protection Rules: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- Rulesets (Neu): https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets

---

**Hinweis:** Diese Datei kann gelöscht werden, nachdem Sie die Protection Rules eingerichtet haben.
