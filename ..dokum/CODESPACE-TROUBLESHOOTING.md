# GitHub Codespace Troubleshooting Guide

## 🆘 "Warum läuft mein Codespace nicht?" - Häufige Probleme und Lösungen

### Problem: Codespace startet nicht oder ist sehr langsam

**Lösung:**
1. Warten Sie einige Minuten - der erste Start kann 3-5 Minuten dauern
2. Überprüfen Sie den Setup-Progress im Terminal
3. Falls der Setup hängt, starten Sie den Codespace neu

### Problem: API Server startet nicht (uvicorn not found)

**Symptom:** `sh: 1: uvicorn: not found`

**Lösung:**
```bash
# Option 1: Manuelle Installation
cd api.menschlichkeit-oesterreich.at
pip install --user fastapi uvicorn python-dotenv

# Option 2: Minimal-Setup verwenden
pip install --user -r requirements-minimal.txt

# Option 3: Setup-Script erneut ausführen
bash .devcontainer/setup.sh
```

### Problem: Python Dependencies Installation schlägt fehl

**Symptom:** `ReadTimeoutError` oder `cryptography version conflicts`

**Lösung:**
```bash
# Nur essenzielle Pakete installieren
cd api.menschlichkeit-oesterreich.at
pip install --user --timeout 300 fastapi uvicorn python-dotenv pydantic requests

# Bei Erfolg, weitere Pakete einzeln hinzufügen
pip install --user python-multipart httpx jinja2
```

### Problem: Frontend startet nicht

**Lösung:**
```bash
# Dependencies neu installieren
npm install

# Frontend-Workspace überprüfen
cd frontend
npm install
npm run dev
```

### Problem: CRM (PHP) Server Fehler

**Lösung:**
```bash
# PHP-Version überprüfen
php --version

# CRM-Verzeichnis überprüfen
ls -la crm.menschlichkeit-oesterreich.at/
cd crm.menschlichkeit-oesterreich.at
php -S localhost:8000 -t httpdocs
```

### Problem: Ports sind nicht verfügbar

**Lösung:**
1. Überprüfen Sie die Ports-Tab in VS Code
2. Ports manuell weiterleiten: `Ports` → `Forward a Port`
3. Standard-Ports: 5173 (Frontend), 8001 (API), 8000 (CRM), 3000 (Games)

### Problem: Docker-in-Docker funktioniert nicht

**Symptom:** `Docker exited with code 1` in Quality Reports

**Lösung:**
```bash
# Docker-Status überprüfen
docker --version
sudo dockerd &

# N8N mit Docker starten
npm run n8n:start
```

### Problem: Umgebungsvariablen fehlen

**Lösung:**
```bash
# .env-Dateien aus Beispielen erstellen
cp .env.example .env
cp api.menschlichkeit-oesterreich.at/.env.example api.menschlichkeit-oesterreich.at/.env
cp frontend/.env.example frontend/.env

# Schlüssel anpassen (besonders wichtig für API):
# - JWT_SECRET: Mindestens 32 Zeichen
# - CIVI_SITE_KEY und CIVI_API_KEY für CiviCRM-Integration
```

## 🔧 Schnelle Diagnose-Befehle

```bash
# System-Check
node --version && npm --version && python3 --version && php --version

# Services-Status
ps aux | grep -E "(node|python|php|uvicorn)" | grep -v grep

# Dependencies-Check
cd api.menschlichkeit-oesterreich.at
python3 -c "import fastapi, uvicorn; print('✅ FastAPI OK')" || echo "❌ FastAPI fehlt"

# Ports-Check
netstat -tlnp | grep -E "(3000|5173|8000|8001)"
```

## 🚀 Neustart-Sequence

Falls alles andere fehlschlägt:

```bash
# 1. Services stoppen
pkill -f "node\|python\|php\|uvicorn" || true

# 2. Setup erneut ausführen
bash .devcontainer/setup.sh

# 3. Services einzeln starten und testen
npm run dev:frontend &
sleep 5
npm run dev:api &
sleep 5
npm run dev:crm &

# 4. Status prüfen
npm run dev:all
```

## 📞 Weitere Hilfe

- Überprüfen Sie die Logs im Terminal
- Nutzen Sie VS Code's "Problems" Panel für Fehler
- Bei Netzwerkproblemen: Codespace neu starten
- Setup-Script logs: `bash .devcontainer/setup.sh > setup.log 2>&1`

## 💡 Performance-Tipps

1. **Erste Setup**: Kann 5-10 Minuten dauern
2. **RAM**: Verwenden Sie mindestens 4GB Codespace
3. **Extensions**: Deaktivieren Sie nicht benötigte VS Code Extensions
4. **Services**: Starten Sie nur benötigte Services (`npm run dev:frontend` statt `npm run dev:all`)