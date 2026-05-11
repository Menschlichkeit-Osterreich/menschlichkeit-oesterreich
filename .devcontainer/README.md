# Devcontainer Setup (Codespaces + Azure Remote SSH)

Diese Devcontainer-Umgebung ist strikt auf die aktive Repo-Struktur ausgerichtet:

- apps/api
- apps/website
- apps/crm
- apps/babylon-game
- automation/n8n

## Start

Der Container führt automatisch aus:

1. onCreate: `.devcontainer/onCreate-setup.sh`
2. postCreate: `.devcontainer/setup.sh`
3. postStart: `.devcontainer/setup-powershell.ps1` (optional, non-blocking)

## Harte Mindestversionen

- Node.js >= 22.19.0
- npm >= 11 (Ziel: 11.4.2)

Die Mindestversionen werden in `.devcontainer/setup.sh` und `.devcontainer/test-setup.sh` geprüft.

## Kritische vs. optionale Tools

Kritisch (Fail bei Fehlen):

- node, npm, git
- docker, docker compose
- python3, pip
- php, composer
- jq, yq

Optional (nur Warn):

- az, gh, pwsh, stripe, bws

## Ports

Vorwärtsweiterleitungen im Devcontainer:

- 3000 (Games Local)
- 3001 (Games Server)
- 5173 (Frontend)
- 5678 (n8n)
- 8000 (CRM)
- 8001 (API)
- 8002 (Forum)

## Verifikation

Nach Containerstart:

```bash
bash .devcontainer/test-setup.sh
npm run workspace:config:check
docker compose config
```

Optional:

```bash
npm run mcp:check
```

## Login & Secrets

- Kein automatisches `stripe login`
- Keine automatische Secret-Schreiboperation
- Keine Tokens/Secrets in Repo-Dateien committen
- Secrets nur über Environment-Secrets oder sichere Secret Stores injizieren

Zusätzlicher nicht-sensitiver Default im Container:

- `BWS_SERVER_URL=https://api.bitwarden.com`
