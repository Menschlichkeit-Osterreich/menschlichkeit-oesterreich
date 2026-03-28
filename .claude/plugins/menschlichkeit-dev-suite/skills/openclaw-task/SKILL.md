---
name: openclaw-task
description: 'Submittiert einen Task an das OpenClaw Multi-Agent-System mit Pipeline-Auswahl und Fortschritts-Monitoring'
argument-hint: '<pipeline> <task-beschreibung>'
allowed-tools:
  - Bash
  - Read
  - WebFetch
---

# OpenClaw Task — Task-Submission

## Zweck

Sendet einen strukturierten Task an den OpenClaw Orchestrator und ueberwacht den Fortschritt.

## Verfuegbare Pipelines

| Pipeline            | Agenten                 | Typische Tasks                                |
| ------------------- | ----------------------- | --------------------------------------------- |
| `content_factory`   | Research + Monetization | Blog-Artikel, Social Media, Fundraising-Texte |
| `devops_assistant`  | Builder + QA            | Code-Generierung, Testing, Deployment         |
| `crm_community_ops` | Automation              | CRM-Sync, Newsletter, Community-Management    |

## Task-Submission

```bash
curl -X POST http://localhost:9101/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": "<pipeline>",
    "description": "<task-beschreibung>",
    "priority": "normal",
    "metadata": {
      "source": "claude-code",
      "session_id": "..."
    }
  }'
```

## Prioritaeten

| Level      | Beschreibung                          | Max. Wartezeit |
| ---------- | ------------------------------------- | -------------- |
| `critical` | Sicherheitsvorfall, Production-Down   | Sofort         |
| `high`     | Deployment-Blockade, Datenintegritaet | < 5 min        |
| `normal`   | Feature-Entwicklung, Content          | < 30 min       |
| `low`      | Cleanup, Dokumentation                | < 2h           |

## Sicherheitsregeln

1. **IMMER** Pipeline und Beschreibung anzeigen BEVOR der Task gesendet wird
2. **Bestaetigung einholen** fuer `critical` und `high` Priority
3. **KEINE PII** in Task-Beschreibungen
4. **Budget pruefen** vor ressourcenintensiven Tasks (LLM-Calls)

## Ablauf

1. Pipeline aus Argument oder Task-Beschreibung ableiten
2. Task-Payload zusammenstellen
3. Bei high/critical: Bestaetigung einholen
4. Task an Tool-Gateway senden (Port 9101)
5. Task-ID merken und Fortschritt polLen:
   ```bash
   curl http://localhost:9101/tasks/<task-id>/status
   ```
6. Ergebnis zusammenfassen
