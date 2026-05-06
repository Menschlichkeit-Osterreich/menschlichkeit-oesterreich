# Devcontainer Troubleshooting Guide

## 🚨 Schnelle Problemlösung

### Problem: Devcontainer startet nicht oder hängt

**Symptome:**

- Codespace öffnet sich nicht vollständig
- Setup-Prozess bleibt hängen
- Fehlermeldungen beim Start

**Lösung:**

1. **Diagnose ausführen**

   ```bash
   bash .devcontainer/diagnose.sh
   ```

2. **Logs überprüfen**

   ```bash
   # onCreate Log (falls vorhanden)
   cat /tmp/devcontainer-onCreate-setup.log

   # Setup-Test ausführen
   bash .devcontainer/test-setup.sh
   ```

3. **Manuelles Setup starten**
   ```bash
   bash .devcontainer/manual-setup.sh
   ```

### Problem: Keine Netzwerkverbindung (Offline-Modus)

**Symptome:**

- `Network connectivity failed` Meldungen
- npm/pip Installation schlägt fehl
- Git clone/push funktioniert nicht

**Erklärung:**

- Dies ist normal in CI/Test-Umgebungen ohne Internet
- Setup-Scripts erkennen dies automatisch und arbeiten offline

**Lösung:**

```bash
# Die Setup-Scripts funktionieren bereits offline
# Wenn später Netzwerk verfügbar ist:

# npm Pakete nachinstallieren
npm install

# Python Pakete nachinstallieren
pip install --user fastapi uvicorn python-dotenv pydantic

# Vollständige API Requirements
cd apps/api
pip install --user -r app/requirements.txt
```

### Problem: Python Dependencies fehlen (FastAPI/Uvicorn)

**Symptome:**

- `ModuleNotFoundError: No module named 'fastapi'`
- API-Server startet nicht

**Lösung:**

```bash
# Schnelle Installation der essentiellen Pakete
pip install --user fastapi uvicorn python-dotenv pydantic

# Oder mit Timeout-Schutz
timeout 120 pip install --user fastapi uvicorn python-dotenv

# Vollständige Requirements (wenn benötigt)
cd apps/api
timeout 180 pip install --user -r app/requirements.txt
```

### Problem: .env Dateien fehlen

**Symptome:**

- Umgebungsvariablen nicht verfügbar
- Services starten mit Fehlern

**Lösung:**

```bash
# Automatisch alle .env Dateien erstellen
bash .devcontainer/onCreate-setup.sh

# Oder manuell:
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/website/.env.example apps/website/.env.local
```

### Problem: npm install schlägt fehl oder hängt

**Symptome:**

- npm install timeout
- node_modules unvollständig
- Dependency errors

**Lösung:**

```bash
# 1. Cache leeren
npm cache clean --force

# 2. Mit Timeout neu installieren
timeout 300 npm install

# 3. Falls weiterhin Probleme:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 4. Nur Production Dependencies:
npm install --only=production
```

### Problem: Shell-Skripte nicht ausführbar

**Symptome:**

- `Permission denied` beim Ausführen von .sh Dateien
- Scripts laufen nicht

**Lösung:**

```bash
# Alle Skripte ausführbar machen
chmod +x build-pipeline.sh
chmod +x .devcontainer/*.sh
chmod +x scripts/*.sh
chmod +x deployment-scripts/*.sh

# Oder alles auf einmal:
find . -name "*.sh" -type f -exec chmod +x {} \;
```

### Problem: PowerShell Module fehlen

**Symptome:**

- PowerShell-Funktionen nicht verfügbar
- Module-Import schlägt fehl

**Lösung:**

```bash
# PowerShell Setup erneut ausführen
pwsh .devcontainer/setup-powershell.ps1

# Oder manuell Module installieren:
pwsh -c "Install-Module -Name PSReadLine -Scope CurrentUser -Force"
pwsh -c "Install-Module -Name posh-git -Scope CurrentUser -Force"
```

**Hinweis:** PowerShell-Module sind optional. Das Devcontainer funktioniert ohne sie.

## 🔍 Erweiterte Diagnose

### Vollständige System-Prüfung

```bash
# 1. Diagnostik-Tool ausführen
bash .devcontainer/diagnose.sh > diagnostic-report.txt

# 2. Test-Suite ausführen
bash .devcontainer/test-setup.sh

# 3. Logs sammeln
cat /tmp/devcontainer-onCreate-setup.log 2>/dev/null || echo "Kein onCreate Log"
```

### Netzwerk-Probleme

Wenn pip/npm Downloads fehlschlagen:

```bash
# 1. Proxy-Einstellungen prüfen
echo $HTTP_PROXY
echo $HTTPS_PROXY

# 2. Alternative npm Registry
npm config set registry https://registry.npmmirror.com

# 3. pip mit Alternative
pip install --index-url https://pypi.org/simple/ --user fastapi
```

### Speicher-Probleme

Wenn "Out of Memory" Fehler auftreten:

```bash
# 1. Speicher-Status prüfen
free -h
df -h

# 2. Cache leeren
npm cache clean --force
pip cache purge

# 3. Unnötige Dateien entfernen
rm -rf quality-reports/*.ndjson
rm -rf .next .nuxt dist build
```

## 🔄 Neustart-Strategien

### Sanfter Neustart (empfohlen)

```bash
# 1. Setup-Scripts neu ausführen
bash .devcontainer/onCreate-setup.sh
bash .devcontainer/setup.sh
pwsh .devcontainer/setup-powershell.ps1 || true

# 2. Validieren
bash .devcontainer/test-setup.sh
```

### Vollständiger Neustart

```bash
# 1. Alles zurücksetzen (VORSICHT: Löscht lokale Änderungen!)
git clean -fdx  # Entfernt alle nicht-versionierten Dateien
git reset --hard HEAD

# 2. Setup neu starten
bash .devcontainer/onCreate-setup.sh

# 3. Dependencies neu installieren
npm install
cd apps/api && pip install --user -r app/requirements.txt
```

### Codespace neu erstellen (letzter Ausweg)

Wenn nichts hilft:

1. Codespace löschen (GitHub → Codespaces → Delete)
2. Neuen Codespace erstellen
3. Warten bis automatisches Setup abgeschlossen ist

## 📋 Checkliste für erfolgreichen Start

- [ ] `bash .devcontainer/test-setup.sh` zeigt 19/19 Tests bestanden
- [ ] `python3 -c "import fastapi"` funktioniert ohne Fehler
- [ ] `.env` Dateien existieren (Root, API, Frontend)
- [ ] `node_modules` Verzeichnis existiert und ist vollständig
- [ ] Shell-Skripte sind ausführbar (`ls -la *.sh` zeigt `rwxr-xr-x`)
- [ ] `npm run dev:all` startet ohne Fehler

## 🆘 Wenn nichts funktioniert

1. **Issue erstellen**
   - Repository: github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich
   - Template: Bug Report
   - Anhängen: Output von `bash .devcontainer/diagnose.sh`

2. **Direkte Hilfe**

   ```bash
   # Manual Setup mit interaktiver Auswahl
   bash .devcontainer/manual-setup.sh
   ```

3. **Dokumentation**
   - `.devcontainer/README.md` - Setup-Anleitung
   - `CODESPACE-STARTUP-FIX.md` - Bekannte Probleme & Lösungen
   - `CODESPACE-FIX-SUMMARY.md` - Zusammenfassung der Fixes

## 🔧 Wartung & Prävention

### Regelmäßige Checks

```bash
# Wöchentlich ausführen
bash .devcontainer/diagnose.sh
bash .devcontainer/test-setup.sh
npm run quality:gates
```

### Updates

```bash
# Dependencies aktualisieren
npm update
pip install --user --upgrade fastapi uvicorn pydantic

# PowerShell Module aktualisieren
pwsh -c "Update-Module -Force"
```

### Cache-Verwaltung

```bash
# Bei Problemen Cache leeren
npm cache clean --force
pip cache purge
rm -rf ~/.cache/pip ~/.npm
```

## 📚 Zusätzliche Ressourcen

- [GitHub Codespaces Docs](https://docs.github.com/codespaces)
- [Devcontainer Specification](https://containers.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Node.js Troubleshooting](https://nodejs.org/en/docs/guides/debugging-getting-started/)

---

**Letzte Aktualisierung:** 2025-10-12
**Maintenance:** DevOps Team Menschlichkeit Österreich
