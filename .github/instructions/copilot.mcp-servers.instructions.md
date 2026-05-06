---
applyTo: '**'
---

# Copilot – MCP-Servers Nutzungshinweise

Verfügbare MCP-Tools: Figma (figma_*), GitHub (github_*), Azure DevOps (ado_*), Playwright (playwright_*), Microsoft Docs (microsoft_docs_*), MarkItDown (markitdown_*), Filesystem (filesystem_*), Memory (memory_*), DevBox (devbox_*), Fabric RTI (fabric_*), Clarity (clarity_*).

- Figma: Bei UI/Designaufgaben zuerst `figma_*` oder `TalkToFigma` verwenden. Fehlt ein Token: Hinweis ausgeben und fortfahren ohne Figma.
- GitHub: Für Code/Issues/PRs die `github_*`-Tools nutzen.
- Azure DevOps: Boards/Repos/Pipelines via `ado_*`.
- Microsoft Dokumentation: `microsoft_docs_search` und `microsoft_docs_fetch` einsetzen.
- Playwright: Browser-Interaktionen (`playwright_*`) nur bei Bedarf, sparsam nutzen.
- Healthchecks: Vor längeren Abläufen optional `npm run mcp:check` ausführen.

Fehlerfall-Regeln:
- Nicht erreichbar: Tool überspringen, alternative Quelle vorschlagen.
- Timeout: Vorgang abbrechen, einmalige Wiederholung anbieten.
- Ungültige Antwort: Meldung + Schemahinweis.
- Fehlender Token: Deutlich kommunizieren, wie Token zu setzen ist.
