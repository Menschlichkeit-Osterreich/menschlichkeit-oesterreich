# OpenClaw Multi-Agent-System – Architektur

## Überblick

Das OpenClaw-System ist ein vollständiges Multi-Agent-Orchestrierungssystem für die Menschlichkeit-Österreich-Plattform. Es besteht aus sechs spezialisierten KI-Agenten, die über einen Message-Bus (NATS JetStream) kommunizieren und gemeinsam komplexe Aufgaben lösen.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Menschlichkeit Österreich                     │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Website     │    │  Admin-Panel │    │  Windows-Bridge  │  │
│  │  (React)     │    │  (React)     │    │  (PowerShell)    │  │
│  └──────┬───────┘    └──────┬───────┘    └────────┬─────────┘  │
│         │                   │                      │            │
│         └───────────────────┴──────────────────────┘           │
│                             │                                    │
│                    ┌────────▼────────┐                          │
│                    │  Tool-Gateway   │                          │
│                    │  (FastAPI:9101) │                          │
│                    │  Policy-Engine  │                          │
│                    │  Audit-Logging  │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│                    ┌────────▼────────┐                          │
│                    │  NATS JetStream │                          │
│                    │  (Port 4222)    │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│         ┌───────────────────┼───────────────────┐              │
│         │                   │                   │              │
│  ┌──────▼──────┐   ┌───────▼──────┐   ┌───────▼──────┐       │
│  │ Orchestrator│   │  Research    │   │    Code      │       │
│  │  Agent      │   │  Agent       │   │    Agent     │       │
│  └─────────────┘   └──────────────┘   └──────────────┘       │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │  Write       │   │    QA        │   │   Memory     │       │
│  │  Agent       │   │   Agent      │   │   Agent      │       │
│  └─────────────┘   └──────────────┘   └──────────────┘       │
│                             │                                    │
│         ┌───────────────────┼───────────────────┐              │
│         │                   │                   │              │
│  ┌──────▼──────┐   ┌───────▼──────┐   ┌───────▼──────┐       │
│  │ PostgreSQL  │   │    Redis     │   │   Qdrant     │       │
│  │ (Port 5432) │   │  (Port 6379) │   │ (Port 6333)  │       │
│  └─────────────┘   └──────────────┘   └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Komponenten

### Tool-Gateway (FastAPI, Port 9101)

Das Tool-Gateway ist der einzige Einstiegspunkt für alle Tool-Aufrufe der Agenten. Es implementiert:

- **Policy-Engine:** Rollenbasierte Zugriffskontrolle (welcher Agent darf welches Tool aufrufen)
- **Audit-Logging:** Alle Tool-Calls werden in PostgreSQL protokolliert
- **Rate-Limiting:** Schutz vor übermäßiger Nutzung
- **Tool-Katalog:** Alle verfügbaren Tools mit Schemas

**Verfügbare Tools:**

| Tool            | Beschreibung           | Erlaubte Rollen        |
| :-------------- | :--------------------- | :--------------------- |
| `fs.read`       | Datei lesen            | alle                   |
| `fs.write`      | Datei schreiben        | code, orchestrator     |
| `web.search`    | Web-Suche              | research, orchestrator |
| `web.fetch`     | URL abrufen            | research, orchestrator |
| `github.read`   | GitHub-Repo lesen      | alle                   |
| `github.commit` | Commit erstellen       | code, orchestrator     |
| `github.pr`     | Pull Request erstellen | code, orchestrator     |
| `db.query`      | Datenbank abfragen     | alle                   |
| `llm.complete`  | LLM-Completion         | alle                   |
| `llm.embed`     | Text einbetten         | research, memory       |
| `memory.store`  | Erinnerung speichern   | memory, orchestrator   |
| `memory.search` | Erinnerung suchen      | alle                   |
| `email.send`    | E-Mail senden          | write, orchestrator    |
| `n8n.trigger`   | n8n-Workflow auslösen  | orchestrator           |

### Agent-Runtime (Python asyncio, Port 9100)

Die Agent-Runtime verwaltet alle 6 Agenten und deren Lebenszyklen:

**Agenten-Rollen:**

| Rolle          | Beschreibung                                       | Budget (Token/Tag) |
| :------------- | :------------------------------------------------- | :----------------- |
| `orchestrator` | Zerlegt Aufgaben und koordiniert andere Agenten    | 500.000            |
| `research`     | Recherchiert Informationen aus Web und Datenbanken | 300.000            |
| `code`         | Schreibt und überarbeitet Code                     | 400.000            |
| `write`        | Erstellt Texte, E-Mails und Dokumente              | 200.000            |
| `qa`           | Prüft Ergebnisse und gibt Feedback                 | 150.000            |
| `memory`       | Verwaltet Langzeit-Erinnerungen in Qdrant          | 100.000            |

**Task-Lebenszyklus:**

```
PENDING → RUNNING → DONE
                 ↘ DEADLETTER (nach 3 Fehlversuchen)
```

### Windows-Bridge (`openclaw-system/windows-bridge/`)

Die Windows-Bridge ist ein eigenes Node/CommonJS-Paket und ermöglicht die Kommunikation zwischen Windows-Anwendungen und dem OpenClaw-System in WSL2/Docker:

```
Windows-App → Bridge (Port 18790) → WSL2 → Docker → Services
```

**Endpunkte:**

| Endpunkt           | Methode | Beschreibung                                                   |
| :----------------- | :------ | :------------------------------------------------------------- |
| `/health`          | GET     | Bridge-Status und konfigurierte Targets                        |
| `/agent/*`         | ANY     | Proxy zu Agent-Runtime                                         |
| `/tools/*`         | ANY     | Proxy zu Tool-Gateway                                          |
| `/wsl/status`      | GET     | Docker-Container-Status in der konfigurierten WSL-Distro       |
| `/wsl/start-stack` | POST    | Startet `openclaw-system/scripts/boot.sh` ueber PowerShell/WSL |

## Datenbank-Schema

### PostgreSQL (oc\_\*)

```sql
oc_tasks         -- Task-Definitionen und Status
oc_tool_calls    -- Audit-Log aller Tool-Aufrufe
oc_agent_memory  -- Kurzzeit-Erinnerungen
oc_budgets       -- Token-Budget-Tracking
oc_audit_log     -- Sicherheits-Audit
```

### Redis

```
oc:task:{id}:state    -- Task-Status (TTL: 24h)
oc:agent:{id}:hb      -- Agent Heartbeat (TTL: 30s)
oc:budget:{role}:day  -- Tages-Budget-Counter
oc:rate:{agent}:{tool} -- Rate-Limiting
```

### Qdrant

```
oc_agent_memory  -- Semantische Langzeit-Erinnerungen
```

## Sicherheit

- **Keine direkten LLM-Calls:** Alle Modell-Aufrufe laufen über das Tool-Gateway
- **Policy-Engine:** Jede Tool-Nutzung wird gegen Rollen-Policies geprüft
- **Budget-Limits:** Tägliche Token-Limits pro Agenten-Rolle
- **Audit-Log:** Vollständige Nachvollziehbarkeit aller Aktionen
- **Secrets:** Alle Credentials in `.env` (nie in Git)
- **Branch-Schutz:** Agenten können nur via PR in `main` mergen

## Schnellstart

```bash
# 1. Stack starten (Linux/WSL2)
bash openclaw-system/scripts/boot.sh

# 2. Smoke-Tests
bash openclaw-system/scripts/smoke.sh

# 3. Windows-Bridge installieren (PowerShell als Admin)
C:\openclawd-win-bridge\installer\Install-OpenClawBridge.ps1

# 4. Task einreichen
curl -X POST http://localhost:9100/task/submit \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","objective":"Schreibe einen kurzen Bericht","role":"write"}'
```
