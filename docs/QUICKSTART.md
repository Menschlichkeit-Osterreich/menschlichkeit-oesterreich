# Quick Start

Kurzanleitung, um das Monorepo lokal in < 10 Minuten lauffähig zu bekommen.

## Voraussetzungen

- Node.js 18+ (empfohlen: 20 LTS)
- npm 8+
- Python 3.11+
- PHP 8.1 (für Drupal/CRM)
- Docker (für n8n/optionales CRM-Setup)

## Schritte

1. Repository klonen

```bash
git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git
cd menschlichkeit-oesterreich-development
```

1. Development-Setup

```bash
npm run setup:dev
```

1. Alle Services starten

```bash
npm run dev:all
```

1. Endpunkte prüfen

- Frontend: <http://localhost:5173>
- API: <http://localhost:8001>
- CRM: <http://localhost:8000>
- Games: <http://localhost:3000>
- n8n: <http://localhost:5678>

## Nützliche Befehle

- Tests: `npm run test:unit` · `npm run test:e2e`
- Qualität: `npm run quality:gates`
- Sicherheit: `npm run security:scan`

## DSGVO-Hinweise

- Keine PII in Logs; Sanitizer aktiv in API/CRM
- Siehe: `docs/compliance/` und `.github/instructions/dsgvo-compliance.instructions.md`
