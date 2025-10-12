# Codespace & Pull Request Status Checker

## 📋 Übersicht

Der Codespace Status Checker ist ein diagnostisches Tool, das entwickelt wurde, um schnell den Status Ihrer Entwicklungsumgebung zu überprüfen und offene Pull Requests anzuzeigen.

## 🚀 Verwendung

### Schnelle Status-Prüfung

```bash
npm run status:check
```

Zeigt:
- ✅ Ob Sie in einem GitHub Codespace arbeiten
- 🚀 Status aller Development Services (Frontend, API, CRM, Games)
- 📋 Offene Pull Requests (wenn GITHUB_TOKEN verfügbar)
- ⚙️ Letzte GitHub Actions Workflow Runs
- 💡 Empfehlungen zur Fehlerbehebung

### Detaillierte Informationen

```bash
npm run status:verbose
```

Zusätzlich:
- 🌍 Alle Umgebungsvariablen
- 💻 Systemressourcen (CPU, RAM, Disk)
- 🔗 URLs zu PRs und Workflows

### JSON Export

```bash
npm run status:json
```

Speichert den vollständigen Status als JSON in `quality-reports/codespace-status.json` für weitere Analyse.

## 📊 Was wird geprüft?

### 1. Codespace Umgebung
- Erkennt ob in GitHub Codespace
- Zeigt Codespace Name
- Prüft GITHUB_TOKEN Verfügbarkeit

### 2. Development Services

| Service | Port | Beschreibung |
|---------|------|--------------|
| Frontend (Vite) | 5173 | React Development Server |
| API (FastAPI) | 8001 | Python FastAPI Backend |
| CRM (PHP) | 8000 | Drupal/CiviCRM System |
| Games | 3000 | Educational Games Server |

### 3. Pull Requests

Wenn `GITHUB_TOKEN` gesetzt ist:
- Listet alle offenen Pull Requests
- Zeigt Titel, Autor, Erstellungsdatum
- Direkte Links zu GitHub PRs

### 4. Workflow Runs

Wenn `GITHUB_TOKEN` gesetzt ist:
- Zeigt die letzten 10 GitHub Actions Runs
- Status und Conclusion jedes Workflows
- Direkte Links zu Workflow-Details

### 5. System-Ressourcen (verbose mode)

- 💾 Disk Usage
- 🧠 Memory Usage
- ⚡ CPU Cores

## 🔑 GitHub Token Setup

Für vollständige Funktionalität (PR & Workflow Informationen):

### In GitHub Codespace

```bash
# Token wird automatisch gesetzt
echo $GITHUB_TOKEN
```

### Lokal

```bash
# Personal Access Token erstellen auf:
# https://github.com/settings/tokens

export GITHUB_TOKEN="ghp_your_token_here"
```

Erforderliche Scopes:
- `repo` - Full repository access
- `workflow` - Workflow access

## 🔍 Fehlerbehebung

### Problem: Alle Services zeigen "stopped"

**Lösung:**
```bash
npm run dev:all
```

Oder einzelne Services starten:
```bash
npm run dev:frontend    # Nur Frontend
npm run dev:api        # Nur API
npm run dev:crm        # Nur CRM
npm run dev:games      # Nur Games
```

### Problem: "GITHUB_TOKEN nicht verfügbar"

**In Codespace:**
```bash
# Stelle sicher, dass du in einem GitHub Codespace bist
echo $CODESPACES
```

**Lokal:**
```bash
# Setze Personal Access Token
export GITHUB_TOKEN="ghp_..."
```

### Problem: "Not in Codespace"

**Dies ist normal wenn:**
- Du lokal entwickelst (nicht in GitHub Codespace)
- Du in einer anderen Container-Umgebung arbeitest

**Action:** Keine Aktion erforderlich, informativ nur.

## 📝 Exit Codes

| Exit Code | Bedeutung |
|-----------|-----------|
| 0 | Alle Services laufen erfolgreich |
| 1 | Mindestens ein Service ist gestoppt |

Nützlich für Automatisierung:
```bash
if npm run status:check; then
    echo "✅ Alles läuft"
else
    echo "❌ Services fehlen - starte sie"
    npm run dev:all
fi
```

## 🔄 Integration in Workflows

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

npm run status:check
if [ $? -ne 0 ]; then
    echo "⚠️  Warnung: Nicht alle Services laufen"
fi
```

### CI/CD Pipeline

```yaml
# .github/workflows/dev-check.yml
- name: Check Development Environment
  run: |
    npm run status:check
    npm run status:json
    
- name: Upload Status Report
  uses: actions/upload-artifact@v4
  with:
    name: codespace-status
    path: quality-reports/codespace-status.json
```

### Monitoring

```bash
# Regelmäßige Checks
watch -n 60 'npm run status:check'
```

## 🎯 Häufige Szenarien

### Szenario 1: Neuer Entwickler startet Codespace

```bash
# Nach Codespace Start
npm run status:check

# Erwartete Ausgabe:
# ✅ In Codespace: True
# 🔴 4 Services stopped
# 💡 Verwende 'npm run dev:all' zum Starten
```

### Szenario 2: Debug warum Service nicht startet

```bash
# Detaillierte Analyse
npm run status:verbose

# Prüfe Systemressourcen
# Prüfe ob Port belegt
# Folge Empfehlungen
```

### Szenario 3: Code Review - PR Status prüfen

```bash
# Zeige offene PRs
npm run status:check

# Output als JSON für Tooling
npm run status:json
jq '.pull_requests.pull_requests[] | {number, title}' quality-reports/codespace-status.json
```

### Szenario 4: Automatisiertes Monitoring

```bash
# In Cron Job oder CI
*/30 * * * * cd /workspace && npm run status:json

# Alert bei gestoppten Services
if ! npm run status:check; then
    # Benachrichtigung senden
    curl -X POST https://slack.com/api/chat.postMessage ...
fi
```

## 🛠️ Erweiterte Verwendung

### Nur bestimmte Checks

```python
# Direkter Script-Aufruf mit Python für Custom Checks
from scripts.codespace_status_check import CodespaceStatusChecker

checker = CodespaceStatusChecker()
services = checker.check_all_services()
print(services)
```

### JSON Struktur

```json
{
  "timestamp": "2025-10-11T14:00:47.279902",
  "codespace": {
    "is_codespace": false,
    "codespace_name": "N/A",
    "github_token_available": false,
    "environment_vars": {...}
  },
  "services": {
    "services": [
      {
        "service": "Frontend (Vite)",
        "port": 5173,
        "status": "stopped",
        "details": "Service not running on port"
      }
    ]
  },
  "pull_requests": {
    "pull_requests": [...],
    "count": 0
  },
  "workflow_runs": {
    "workflow_runs": [...],
    "count": 0
  },
  "system": {
    "disk": {...},
    "memory": {...},
    "cpu_cores": "4"
  },
  "recommendations": [...]
}
```

## 📚 Weitere Ressourcen

- [Codespace Troubleshooting Guide](./CODESPACE-TROUBLESHOOTING.md)
- [Development Setup](.devcontainer/README.md)
- [GitHub API Documentation](https://docs.github.com/en/rest)

## 🐛 Bekannte Limitierungen

1. **Port-Checks nur über lsof/netstat** - Funktioniert möglicherweise nicht in allen Container-Umgebungen
2. **GitHub API Rate Limits** - Max 60 Requests/Stunde ohne Token, 5000 mit Token
3. **Systemressourcen** - Nur Linux-kompatible Befehle (df, free, nproc)

## 📞 Support

Bei Problemen:
1. Prüfe [CODESPACE-TROUBLESHOOTING.md](./CODESPACE-TROUBLESHOOTING.md)
2. Erstelle Issue auf GitHub
3. Kontaktiere DevOps Team

---

**Version:** 1.0.0  
**Letztes Update:** 2025-10-11  
**Maintainer:** DevOps Team
