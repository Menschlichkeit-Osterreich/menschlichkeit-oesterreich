---
name: openclaw-status
description: 'Prueft den Status des OpenClaw Multi-Agent-Systems: Agent-Health, NATS Queue-Depth, Budget-Verbrauch, letzte Tasks'
allowed-tools:
  - Bash
  - Read
  - WebFetch
---

# OpenClaw Status

## Zweck

Zeigt den aktuellen Zustand des OpenClaw 6-Agent-Systems an, ohne die Claude-Konversation verlassen zu muessen.

## Architektur-Uebersicht

```
OpenClaw System (openclaw-system/)
├── Agent-Runtime (Port 9100) — Orchestrator + 6 Agenten
├── Tool-Gateway (Port 9101) — FastAPI Tool-Proxy
├── NATS JetStream (Port 4222/8222) — Message Broker
├── Redis (Port 6380) — State + Cache
├── PostgreSQL (Port 55432) — Persistenz
└── Qdrant (Port 6333/6334) — Vector DB
```

## Health-Checks

```bash
# Agent-Runtime
curl -sf http://localhost:9100/health && echo "Agent-Runtime: OK" || echo "FAIL"

# Tool-Gateway
curl -sf http://localhost:9101/health && echo "Tool-Gateway: OK" || echo "FAIL"

# NATS Monitoring
curl -sf http://localhost:8222/varz | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'NATS: {d[\"connections\"]} connections, {d[\"in_msgs\"]} msgs')"

# Qdrant
curl -sf http://localhost:6333/collections | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Qdrant: {len(d.get(\"result\",{}).get(\"collections\",[]))} collections')"
```

## Agent-Rollen

| Agent        | Pipeline          | Aufgabe                     |
| ------------ | ----------------- | --------------------------- |
| Orchestrator | alle              | Task-Routing, Priorisierung |
| Research     | content_factory   | Recherche, Fakten           |
| Builder      | devops_assistant  | Code, Infrastruktur         |
| QA           | devops_assistant  | Testing, Review             |
| Automation   | crm_community_ops | CRM, Workflows              |
| Monetization | content_factory   | Fundraising, Spenden        |

## Konfiguration

- Agent-Rollen: `openclaw-system/configs/agent_roles.yaml`
- Tool-Whitelist: `openclaw-system/configs/capabilities.yaml`
- System-Config: `openclaw-system/configs/system_config.yaml`

## Output-Format

```
═══════════════════════════════════════
  OpenClaw Status
═══════════════════════════════════════
  Agent-Runtime (9100)  ✅ UP
  Tool-Gateway (9101)   ✅ UP
  NATS JetStream (4222) ✅ 3 connections
  Redis (6380)          ✅ UP
  PostgreSQL (55432)    ✅ UP
  Qdrant (6333)         ✅ 2 collections

  Aktive Agenten: 6/6
  Offene Tasks: 3
  Letzter Task: content_factory — vor 12min
═══════════════════════════════════════
```
