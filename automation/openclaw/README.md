# OpenClaw Integration – Menschlichkeit Österreich

OpenClaw ist der KI-Assistent des Vereins. Er verbindet alle Plattformen (Telegram, WhatsApp, Website-Chat) mit der Vereins-API, CiviCRM und n8n.

## Architektur

```
Telegram / WhatsApp / WebChat
         │
         ▼
   OpenClaw Gateway (Port 18789)
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Vereins-API  GitHub
(Port 8000)  API
    │
    ▼
  n8n Bridge
  (Port 5678)
```

## Schnellstart

### 1. Voraussetzungen

```bash
# Node.js 18+ und npm installiert
node --version  # v22+
npm --version   # 10+
```

### 2. OpenClaw installieren

```bash
npm install -g openclaw
# oder via npx (kein globales Install nötig):
npx openclaw --version
```

### 3. Konfiguration einrichten

```bash
# Konfigurationsverzeichnis anlegen
mkdir -p ~/.openclaw/skills/menschlichkeit-oesterreich

# Konfigurationsdateien aus dem Repository kopieren
cp automation/openclaw/config/config.yaml ~/.openclaw/config.yaml
cp automation/openclaw/skills/* ~/.openclaw/skills/menschlichkeit-oesterreich/

# Umgebungsvariablen setzen
cp automation/openclaw/.env.example ~/.openclaw/.env
# Datei bearbeiten und echte Werte eintragen:
nano ~/.openclaw/.env
```

### 4. Umgebungsvariablen befüllen

Folgende Werte in `~/.openclaw/.env` eintragen:

| Variable | Beschreibung | Wo finden |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API-Schlüssel | platform.openai.com |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token | @BotFather auf Telegram |
| `MO_API_TOKEN` | Vereins-API-Token | Admin-Dashboard → Einstellungen → API |
| `GITHUB_TOKEN` | GitHub Personal Access Token | github.com → Settings → Developer Settings |
| `OPENCLAW_HOOK_TOKEN` | Zufälliger sicherer Token | `openssl rand -hex 32` |

### 5. OpenClaw starten

```bash
# Interaktiv starten (für Tests)
openclaw start

# Als Hintergrunddienst (systemd)
openclaw service install
openclaw service start
openclaw service status
```

### 6. Verbindung testen

```bash
# Webhook testen
curl -X POST http://127.0.0.1:18789/hooks/wake \
  -H "Authorization: Bearer $OPENCLAW_HOOK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hallo! Bitte Vereinszusammenfassung erstellen.", "mode": "now"}'

# Vereins-API-Skill testen
curl http://localhost:8000/api/v1/members/summary
```

## Verfügbare Skills

### `get_members_summary`
Gibt Mitgliederstatistiken zurück (Gesamt, Aktiv, Neu, Ausstehende Beiträge).

### `search_member`
Sucht ein Mitglied nach Name oder E-Mail.

### `get_upcoming_events`
Listet kommende Veranstaltungen auf.

### `get_finance_summary`
Finanzübersicht (Einnahmen, Ausgaben, offene Rechnungen).

### `send_newsletter`
Sendet einen Newsletter an ein Mitgliedersegment.

### `get_game_stats`
Statistiken zum Demokratiespiel.

### `get_repo_status`
Letzte Commits und offene Issues auf GitHub.

## Automatische Aufgaben (Cron)

| Job | Zeitplan | Beschreibung |
|---|---|---|
| Tägliche Zusammenfassung | Mo–Fr, 08:00 | Übersicht für den Vorstand |
| Wöchentlicher Bericht | Montag, 09:00 | Ausführlicher Wochenbericht |
| Buchhaltungserinnerung | 1. des Monats | Monatlicher Abschluss |
| Event-Reminder | Täglich, 10:00 | Events in 3 Tagen ankündigen |

## n8n-Bridge

Der Workflow `automation/n8n/workflows/openclaw-bridge.json` leitet Vereinsereignisse an OpenClaw weiter.

**Importieren:**
1. n8n öffnen → Workflows → Import
2. `openclaw-bridge.json` hochladen
3. Webhook-URL notieren: `http://localhost:5678/webhook/mo-events`
4. In der Vereins-API als `OPENCLAW_N8N_BRIDGE_URL` konfigurieren

## Sicherheitshinweise

- `~/.openclaw/.env` **niemals** in Git einchecken (ist in `.gitignore`)
- `OPENCLAW_HOOK_TOKEN` regelmäßig rotieren
- OpenClaw nur auf `127.0.0.1` binden (nicht öffentlich zugänglich)
- Für Produktionsbetrieb: Nginx als Reverse Proxy mit SSL verwenden
