# M365, Foundry & Deploy Matrix

Stand: 2026-04-10

## Zielbild

Die produktive Website soll **nach Push auf `main` automatisch deployen**, Microsoft 365 bleibt der primäre Mail-Stack, und Microsoft Foundry/AI Toolkit werden als **kontrollierte Erweiterung** für Agenten, Evaluation und interne Automatisierung genutzt.

## Entscheidungs- und Aufräummatrix

| Bereich                                       | Entscheidung                 | Priorität | Konkrete Aktion                                                                                |
| --------------------------------------------- | ---------------------------- | --------: | ---------------------------------------------------------------------------------------------- |
| Azure DevOps Org `menschlichkeit-oesterreich` | **Behalten**                 |        P0 | Als kanonische Org für Boards, Repos und Pipelines verwenden                                   |
| Azure DevOps Org `peterschuller`              | **Prüfen / ggf. entkoppeln** |        P1 | Nur behalten, wenn noch produktive Pipelines oder Abrechnungen daran hängen                    |
| Microsoft 365 Business Mail                   | **Behalten**                 |        P0 | SMTP via `smtp.office365.com`; mittelfristig auf Microsoft Graph + Entra OAuth umstellen       |
| Entra App Registration                        | **Aufbauen**                 |        P1 | `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` als Secrets pflegen    |
| AI Toolkit for VS Code                        | **Aktiv empfehlen**          |        P1 | Extension `ms-windows-ai-studio.windows-ai-studio` im Repo-Setup verwenden                     |
| Microsoft Foundry                             | **Gezielt nutzen**           |        P1 | Für Modelltests, Agenten-Evaluierung und interne Assistenten; nicht für statisches Web-Hosting |
| Application Insights                          | **Aktivieren**               |        P1 | `APPLICATIONINSIGHTS_CONNECTION_STRING` für API/n8n setzen                                     |
| Figma MCP                                     | **Entfernen**                |        P1 | Kein Live-MCP mehr; stattdessen committed Design-Tokens im Repo nutzen                         |
| Docker lokal                                  | **Behalten & verschlanken**  |        P1 | Docker nur für lokale Services wie Forum, Postgres, Redis, n8n und API/Web-Builds verwenden    |
| Website Deployment                            | **Automatisieren**           |        P0 | `.github/workflows/deploy-plesk.yml` deployt Frontend jetzt automatisch bei Push auf `main`    |

## Erforderliche Secrets / Variablen

### GitHub Environment `production`

- `PLESK_HOST`
- `PLESK_USER`
- `PLESK_SSH_PRIVATE_KEY`
- `PLESK_KNOWN_HOSTS`
- optional: `BW_ACCESS_TOKEN`

### Microsoft / Azure

- `MICROSOFT_TENANT_ID`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `AZURE_AI_FOUNDRY_PROJECT_ENDPOINT`
- `AZURE_AI_FOUNDRY_MODEL_DEPLOYMENT`
- `APPLICATIONINSIGHTS_CONNECTION_STRING`

## Betriebsregel

- **Website live nach Push:** Push auf `main` ⇒ Frontend-Deploy nach Plesk.
- **API/CRM/Games:** weiterhin gezielt via `workflow_dispatch`, wenn ein kontrollierter Service-Deploy nötig ist.
- **M365 zuerst, Foundry gezielt:** E-Mail und Identität bleiben im Microsoft-Stack; Foundry ergänzt intern, ersetzt aber nicht die Web- und Vereinsbasis.
