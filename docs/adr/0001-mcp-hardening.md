# ADR 0001 – MCP-Hardening und Stabilisierung

Datum: 2025-10-16
Status: Accepted

Kontext:
Das Projekt nutzt mehrere MCP-Server (Figma, Filesystem, Docker, etc.). Um Stabilität und Sicherheit (DSGVO, OWASP) zu gewährleisten, werden Versionen gepinnt, lokale Schnittstellen verwendet und Quality-Gates in CI erzwungen.

Entscheidungen:
1. Feste Versionen für Container (z. B. `n8nio/n8n:1.72.1`) – kein `latest`
2. MCP-Server nur lokal (127.0.0.1), keine öffentlichen Ports
3. Secrets ausschließlich via GitHub Secrets oder lokale `.env` (ignored)
4. Accessibility-Tests mit `pa11y-ci` in CI (Frontend)
5. DSGVO-Check (`npm run compliance:dsgvo`) als Pflicht in CI
6. Dokumentation in `.github/README_MCP.md`; ADRs für weitere Änderungen

Alternativen:
- Belassen von `latest` → verworfen (Instabilität, Repro-Probleme)
- Externe MCP-Server → verworfen (Security/Compliance-Risiko)

Konsequenzen:
- Höhere Reproduzierbarkeit
- Früherkennung von A11y- und DSGVO-Verstößen
- Minimaler Mehraufwand für Maintenance (Version-Upgrades geplant)

Follow-Ups:
- Azure/Azure DevOps MCP-Server evaluieren und ggf. integrieren mit hartem Version-Lock
- ffmpeg Bereitstellung für MarkItDown (nur lokal, optional)
