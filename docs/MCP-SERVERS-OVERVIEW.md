# MCP Servers Übersicht

Stand: 2025-10-14

Diese Datei dokumentiert alle konfigurierten MCP Server in `mcp.json` und deren Status (Installiert / Fehlend / Wrapper).

## Tabelle

| Server | Typ | Status | Installation | Output / Pfad |
|--------|-----|--------|--------------|---------------|
| git | native | OK | vorhanden | Git Operationen |
| docker | native | OK | vorhanden | Container Tasks |
| codacy-cli | docker-wrapper | TEILWEISE (Analyse fehlerhaft) | `docker pull codacy/codacy-analysis-cli:latest` | Fehler beim Lesen `.codacyrc` |
| prisma | npm | OK | installiert | Prisma Migrations/Client |
| lighthouse | npm | TEILWEISE | CLI installiert, Chrome fehlt | Performance Budgets |
| trivy-security | binary | OK | Install Script ausgeführt | `quality-reports/security-findings.sarif` |
| n8n-webhook | node | OK | Node vorhanden | Webhook Events |
| build-pipeline | bash | OK | Skript vorhanden | Dry-Run Build |
| plesk-deploy | bash | OK | Skript vorhanden | Dry-Run Deploy |
| quality-reporter | node | OK | Reports Aggregation | `quality-reports/` |
| figma | node | OK | Token Script | Design Tokens Sync |
| github-cli | node/python | OK | GH Auth benötigt | Repo Checks |
| memory | wrapper | OK | Platzhalter | Session Lines |
| filesystem | wrapper | OK | `scripts/mcp/wrapper-filesystem.sh` | Basis Dateizugriff |
| sequential-thinking | wrapper | OK | Platzhalter | Nummerierte Schritte |
| context7 | wrapper | OK | Platzhalter | Code-Snippets grep |
| gitleaks | binary | OK | Release Download erledigt | `quality-reports/gitleaks-report.json` |
| pii-sanitizer-test | pytest | OK | Python vorhanden | DSGVO Test |
| design-tokens-validate | node | OK | Node vorhanden | Token Qualität |

## Installation Batch

```bash
mkdir -p quality-reports

# Node Tooling
npm install -D prisma @prisma/client @lhci/cli

# Security Tools
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
curl -sSL https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz | tar -xz -C /usr/local/bin gitleaks

# Optional: Chrome für Lighthouse
apt-get update && apt-get install -y chromium-browser || echo "Chromium optional"

# Codacy via Docker Wrapper
docker pull codacy/codacy-analysis-cli:latest
```

## Validierung

```bash
npx prisma validate || echo "Prisma nicht bereit"
npx lhci healthcheck || echo "Lighthouse CI benötigt ggf. Chrome"
trivy --version || echo "Trivy fehlt"
gitleaks version || echo "Gitleaks fehlt"
./scripts/codacy/codacy-cli.sh version || echo "Codacy Wrapper Problem"
```

## Sicherheit & Compliance

Nach jeder neuen Installation:
```bash
gitleaks detect --config gitleaks.toml --report-path quality-reports/gitleaks-report.json || true
trivy fs . --format sarif --output quality-reports/security-findings.sarif || true
pytest tests/test_pii_sanitizer.py -q || true
```

## Offene Punkte
- Echten filesystem MCP integrieren
- Wrapper durch vollwertige Server ersetzen
- Automatische Ausführung in CI verankern
- Headless Chrome nachrüsten für vollständige Lighthouse Audits
- Codacy Analyse reparieren (möglicher stabiler Tag, YAML Format testen)
- Codacy npm Paket beobachten; bei Verfügbarkeit Wrapper ersetzen
