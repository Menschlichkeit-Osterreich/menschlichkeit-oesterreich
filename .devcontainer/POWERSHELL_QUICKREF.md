# 🚀 PowerShell Quick Reference - Menschlichkeit Österreich

## 📋 Schnellstart

```bash
# PowerShell starten
pwsh

# Profil laden (beim ersten Start)
. $PROFILE

# Hilfe anzeigen
Get-Help
```

---

## ⚡ Aliase (nach Profil-Load)

| Alias      | Befehl                  | Beschreibung            |
| ---------- | ----------------------- | ----------------------- |
| `devall`   | `npm run dev:all`       | Alle Services starten   |
| `quality`  | `npm run quality:gates` | Quality Gates ausführen |
| `security` | `npm run security:scan` | Security Scan           |
| `g`        | `git`                   | Git Kurzform            |
| `d`        | `docker`                | Docker Kurzform         |
| `dc`       | `docker-compose`        | Docker Compose          |
| `k`        | `kubectl`               | Kubernetes CLI          |

---

## 🛠️ Git-Workflow (GitHelper.psm1)

```powershell
# Module importieren
Import-Module ./scripts/powershell/GitHelper.psm1

# Feature Branch erstellen
New-FeatureBranch -IssueNumber "42" -Description "awesome-feature"
# Ergebnis: feature/42-awesome-feature

# Quality Gates ausführen
Invoke-QualityCheck

# Safe Commit (mit automatischen Pre-Checks)
Invoke-SafeCommit -Message "feat: add awesome feature"
```

---

## 🚀 Deployment-Workflow (DeploymentHelper.psm1)

```powershell
# Module importieren
Import-Module ./scripts/powershell/DeploymentHelper.psm1

# Staging Deployment
Start-StagingDeployment

# Staging Deployment (ohne Tests)
Start-StagingDeployment -SkipTests

# Production Deployment (fragt nach Bestätigung)
Start-ProductionDeployment

# Rollback zu vorheriger Version
Invoke-Rollback -Version "v1.2.3"
```

---

## 📦 Installierte PowerShell-Module

| Modul                | Beschreibung                               |
| -------------------- | ------------------------------------------ |
| **PSReadLine**       | Syntax-Highlighting, Autovervollständigung |
| **posh-git**         | Git-Integration im Prompt, Branch-Anzeige  |
| **Terminal-Icons**   | Datei-Icons im Terminal                    |
| **PSScriptAnalyzer** | Linting für PowerShell-Code                |

---

## 🎨 Custom Prompt

**Aussehen:**

```
🇦🇹 ~/project/path [main] >
```

- 🇦🇹 = Österreich-Flagge
- Blau = Aktueller Pfad
- Grün = Git-Branch (falls in Git-Repo)

---

## 📚 Häufige Befehle

### Navigation & Files

```powershell
# Verzeichnis wechseln
cd /workspaces/menschlichkeit-oesterreich-development

# Dateien auflisten (mit Icons)
ls

# Suchen
Get-ChildItem -Recurse -Filter "*.md"
```

### Git

```powershell
# Status
g status

# Alle Änderungen stagen
g add .

# Commit
g commit -m "feat: awesome feature"

# Push
g push
```

### Docker

```powershell
# Container auflisten
d ps

# Logs anzeigen
d logs -f container-name

# Container stoppen
d stop container-name
```

### NPM/Projekt

```powershell
# Alle Services starten
devall

# Quality Gates
quality

# Security Scan
security

# Einzelne Services
npm run dev:api
npm run dev:frontend
npm run dev:crm
npm run dev:games
```

---

## 🔧 Konfiguration

**Profil-Location:**

```powershell
$PROFILE
# Ausgabe: ~/.config/powershell/Microsoft.PowerShell_profile.ps1
```

**Profil bearbeiten:**

```powershell
code $PROFILE
```

**Profil neu laden:**

```powershell
. $PROFILE
```

---

## 💡 Tipps & Tricks

### 1. Tab-Completion

Drücke `Tab` für Autovervollständigung (wie in Bash)

### 2. History-Search

- `↑` / `↓` - Durchsuche History mit aktuellem Input
- `Ctrl+R` - Reverse-Search durch History

### 3. Command History

```powershell
# Zeige letzte 10 Befehle
Get-History | Select-Object -Last 10

# Suche in History
Get-History | Where-Object {$_.CommandLine -like "*git*"}
```

### 4. Pipeline

```powershell
# Dateien zählen
Get-ChildItem -Recurse | Measure-Object

# Nur .md Dateien
Get-ChildItem -Recurse -Filter "*.md" | Select-Object Name, Length
```

### 5. Help-System

```powershell
# Hilfe zu Befehl
Get-Help Get-ChildItem

# Beispiele anzeigen
Get-Help Get-ChildItem -Examples

# Vollständige Hilfe
Get-Help Get-ChildItem -Full
```

---

## 🚨 Troubleshooting

### PowerShell startet nicht

```bash
# Prüfe Installation
which pwsh

# Falls nicht gefunden: Container neu bauen
# Command Palette: "Codespaces: Rebuild Container"
```

### Module nicht gefunden

```powershell
# Module-Pfade prüfen
$env:PSModulePath -split ':'

# Module manuell installieren
Install-Module -Name PSReadLine -Force -Scope CurrentUser
```

### Profil lädt nicht automatisch

```powershell
# Manuell laden
. $PROFILE

# In ~/.bashrc hinzufügen (falls gewünscht):
# if [ -f ~/.config/powershell/Microsoft.PowerShell_profile.ps1 ]; then
#     pwsh -NoExit -Command '. $PROFILE'
# fi
```

---

## 📖 Weitere Ressourcen

**Projekt-Dokumentation:**

- `.devcontainer/POWERSHELL.md` - Vollständige Dokumentation
- `scripts/powershell/` - Helper-Module-Quellcode

**Externe Ressourcen:**

- [PowerShell Docs](https://learn.microsoft.com/powershell/)
- [PSReadLine](https://github.com/PowerShell/PSReadLine)
- [posh-git](https://github.com/dahlbyk/posh-git)

---

## 🎯 Nächste Schritte

1. **Container neu bauen** (falls noch nicht geschehen)
2. **PowerShell starten:** `pwsh`
3. **Module importieren** (siehe oben)
4. **Projekt-Workflows nutzen!**

---

**Version:** 1.0.0  
**Datum:** 2025-01-10  
**Maintainer:** DevOps Team Menschlichkeit Österreich
