# Copilot Microsoft Operator – Bootstrap & Betriebsregeln

Status: ACTIVE
Owner: devops / security
Geltungsbereich: GitHub Copilot, VS Code Agent, MCP-Stack, Microsoft 365 / Entra ID / Azure / Microsoft Graph

## Zielbild

GitHub Copilot darf in diesem Repository Microsoft-Konfigurationen lesen, planen und vorbereiten.
Schreibende oder destruktive Aktionen laufen nur ueber explizite, dokumentierte Freigabeschritte.
Es gibt **keinen** dauerhaften Global-Admin-Token im Repo, in Copilot oder in einer MCP-Konfiguration.

```text
GitHub Copilot / VS Code Agent
        |
        v
.vscode/mcp.json                 (Editor-Overlay, github-only per Governance)
mcp.json                         (Repo-Quelle fuer projektweite MCP-Server, stdio)
        |
        v
MCP-Server (kuratiert, gepinnt):
  - github                        Issues, PRs, Repo-Metadaten (Overlay)
  - azure (@azure/mcp@2.0.2)      Azure RG, App Service, Key Vault, RBAC (Plan/Read first)
  - bitwarden-cli                 Secret-Lesung aus Bitwarden (lokal/CI), nie Klartext im Repo
  - postgres / file-server / quality-reporter / build-pipeline / n8n-webhook (bestehend)
  - sequential-thinking           strukturierte Planung

NICHT aktiviert (manuelle Pruefung vor jeder Aktivierung):
  - Custom Microsoft Graph Admin Server
  - SharePoint Sites.ReadWrite.All
  - Mail.Send ungescopt
  - microsoft-docs HTTP MCP (https://learn.microsoft.com/api/mcp)
    Begruendung: aktuelles Repo-Schema (mcp.json mcpServers) modelliert stdio;
    Aufnahme braucht Validator-Erweiterung fuer HTTP-Server in mcp.json oder
    eine separate Governance-Ausnahme fuer .vscode/mcp.json.
```

## Stufenmodell

| Stufe | Faehigkeiten                                                                                    | Aktiviert | Voraussetzung                                            |
| ----- | ----------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------- |
| 0     | Microsoft-Docs lesen, GitHub Repo lesen/schreiben (PRs), Plan-Output erzeugen                   | ja        | bestehend                                                |
| 1     | Azure-Ressourcen lesen (Subscriptions, RG, RBAC, Key Vault Metadaten), Plan-Output              | ja        | `az login` lokal oder Managed Identity in CI             |
| 2     | Azure-Ressourcen erstellen/aendern in dedizierter Sandbox-RG                                    | nein      | Entra-App + RBAC, Owner-Freigabe                         |
| 3     | Microsoft Graph App-only Read (User.Read.All, Group.Read.All)                                   | nein      | Entra-App + Admin Consent, Secret in Bitwarden+Key Vault |
| 4     | Microsoft Graph App-only Write (Mail.Send mit Sender-Policy, Sites.Selected, Team-Verwaltung)   | nein      | Owner-Freigabe je Permission, Audit-Logging              |
| 5     | Schreibender Zugriff auf produktive Subscriptions, Tenants, oder M365-Mandanten ausserhalb Test | nein      | Vier-Augen-Prinzip + Change-Record                       |

Bewegung in eine hoehere Stufe ist nur per PR, mit Eintrag in dieses Runbook und mit Sicherheits-Review zulaessig.

## Einmaliger Bootstrap (manuell, ausserhalb Repo)

1. **Entra App Registration** anlegen, z. B. `moe-copilot-operator`.
2. **Redirect URIs** nur fuer Auth-Flows setzen, die wirklich genutzt werden.
3. **API-Berechtigungen vergeben**, Minimalsatz, Admin Consent:
   - Stufe 3: `User.Read.All`, `Group.Read.All`, `Directory.Read.All`.
   - Stufe 4 nur wenn aktiviert: `Mail.Send` (mit Sender-Restriction), `Sites.Selected`, `TeamMember.ReadWrite.All` o.ae.
4. **Authentifizierung**:
   - bevorzugt Federated Credential / OIDC fuer GitHub Actions,
   - zweite Wahl Zertifikats-Login,
   - Client Secret nur fuer lokale Entwicklung und nur in Bitwarden.
5. **Azure RBAC**:
   - Stufe 1: `Reader` auf Subscription oder Resource Group.
   - Stufe 2: `Contributor` ausschliesslich auf Sandbox-RG `moe-sandbox`.
   - Stufe 5: `Owner` nur auf produktive RG nach Vier-Augen-Prinzip.
6. **Secret-Ablage**:
   - lokal: Bitwarden-Eintrag `moe/microsoft/entra-operator` (`MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`).
   - CI: GitHub Environment Secrets je Environment (z. B. `staging`, `production`), gemappt ueber `.github/bsm-secret-ids.json`.
   - Azure Key Vault fuer produktive Workloads.
7. **Tenant / Subscription Mapping** in `.github/bsm-secret-ids.json` ergaenzen, ohne Klartext-Werte.

## Repo-Hooks fuer Copilot-Steuerung

- `mcp.json` ist die Quelle fuer projektweite MCP-Server.
- `.vscode/mcp.json` ist Editor-Overlay; enthaelt nur Tools, die der Copilot-Agent im Editor sehen darf.
- Keine Secrets im Repo. Werte werden zur Laufzeit ueber Bitwarden oder GitHub Secrets injiziert.
- Versionen werden gepinnt. `@latest` und floating Tags sind verboten.
- Aenderungen muessen durch laufen:

```bash
npm run mcp:check
npm run mcp:health
npm run governance:check
npm run workspace:config:check
```

## Auftragsmuster fuer Copilot

Lese-/Plan-Auftrag (immer erlaubt):

```text
Pruefe in der Azure Subscription <NAME> alle Resource Groups, liste Ressourcen,
Owner und Kostenstellen-Tags. Schreibe ein PROPOSAL (Markdown) mit Zielzustand
und benoetigten Aenderungen. KEINE Schreibaktion ausfuehren.
```

Bootstrap-Auftrag (nur nach Stufenfreigabe):

```text
Stufe 2 freigegeben. Lege in RG moe-sandbox ein App-Service-Plan + App Service
nach Plan an, Key Vault inkl. Diagnostic Settings, Tags gemaess Repo-Standard.
Output: Terraform/Bicep-PR, kein direkter Apply. Apply erfolgt durch Owner.
```

Graph-Read-Auftrag (Stufe 3):

```text
Liste ueber Microsoft Graph (App-only) alle Mitglieder der Gruppe <ID>, ohne
PII-Felder zu loggen. Speichere Ergebnis als anonymisierten Report im Quality-Output.
```

Verbotene Auftraege (auch wenn Copilot sie ausfuehren koennte):

- "Mach mich global admin"
- "Trage die Microsoft-Secrets ins Repo ein"
- "Loesche RG xy" ohne expliziten Stufe-5-Freigabevermerk
- "Aendere Mandantenweite Conditional Access Policies"

## Eskalation und Notfall

- Bei kompromittierter App: sofort Client Secret rotieren, Federated Credential entfernen, RBAC entziehen, BSM-Eintrag rotieren, GitHub Environment Secrets rotieren, Audit-Log in `runbooks/incident-p1.md` aktualisieren.
- Bei MCP-Server-Drift (Version nicht gepinnt, unbekannter Server in `.vscode/mcp.json` oder `mcp.json`): `npm run mcp:check` muss rot werden. Eintrag wird im Review zurueckgewiesen.

## Stage 1 Bootstrap – ausfuehrbare Schritte

Diese Schritte sind read-only fuer Repo und Codespace; sie veraendern den Azure-Tenant
und muessen ausserhalb von Copilot durch einen freigegebenen Owner ausgefuehrt werden.

```bash
# Variablen anpassen
TENANT_ID="<your-tenant-id>"
SUBSCRIPTION_ID="a41eb54a-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
REPO="Menschlichkeit-Osterreich/menschlichkeit-oesterreich"
APP_DISPLAY_NAME="moe-copilot-operator"

az login --tenant "$TENANT_ID"
az account set --subscription "$SUBSCRIPTION_ID"

# 1) App Registration ohne Client Secret
APP_ID=$(az ad app create \
    --display-name "$APP_DISPLAY_NAME" \
    --sign-in-audience AzureADMyOrg \
    --query appId -o tsv)

# 2) Service Principal
az ad sp create --id "$APP_ID"
SP_OBJECT_ID=$(az ad sp show --id "$APP_ID" --query id -o tsv)

# 3) Federated Credential fuer GitHub Actions (main branch)
cat > /tmp/fic.json <<JSON
{
  "name": "github-main",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:${REPO}:ref:refs/heads/main",
  "audiences": ["api://AzureADTokenExchange"]
}
JSON
az ad app federated-credential create --id "$APP_ID" --parameters @/tmp/fic.json

# 4) Azure RBAC: Reader auf Subscription
az role assignment create \
    --assignee-object-id "$SP_OBJECT_ID" \
    --assignee-principal-type ServicePrincipal \
    --role "Reader" \
    --scope "/subscriptions/${SUBSCRIPTION_ID}"

# 5) Werte fuer Bitwarden-Eintraege ausgeben (keine Secrets, nur IDs)
echo "COPILOT_OPERATOR_TENANT_ID=$TENANT_ID"
echo "COPILOT_OPERATOR_CLIENT_ID=$APP_ID"
echo "COPILOT_OPERATOR_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
```

## Stage 1 – BSM-Mapping (pending vault creation)

Die folgenden Eintraege werden **nach** dem Bootstrap in `vault.bitwarden.eu`
(Projekt `moe-production`) angelegt. Erst wenn die UUIDs feststehen, wird der
Block in `.github/bsm-secret-ids.json` (Profil `deploy-production` oder neues
Profil `azure-copilot-operator`) ergaenzt. Bis dahin **kein Eintrag mit
Platzhalter-UUID**, da Drift-Verifikation (`secret-mapping-verification`) das
ablehnt.

| BSM Key                                  | Env Var                            | GitHub Variable                              | Wert-Quelle                      |
| ---------------------------------------- | ---------------------------------- | -------------------------------------------- | -------------------------------- |
| `azure/COPILOT_OPERATOR_TENANT_ID`       | `COPILOT_OPERATOR_TENANT_ID`       | `BSM_AZURE_COPILOT_OPERATOR_TENANT_ID`       | Entra-Tenant-Directory-ID        |
| `azure/COPILOT_OPERATOR_CLIENT_ID`       | `COPILOT_OPERATOR_CLIENT_ID`       | `BSM_AZURE_COPILOT_OPERATOR_CLIENT_ID`       | App Registration appId (Stage 1) |
| `azure/COPILOT_OPERATOR_SUBSCRIPTION_ID` | `COPILOT_OPERATOR_SUBSCRIPTION_ID` | `BSM_AZURE_COPILOT_OPERATOR_SUBSCRIPTION_ID` | Azure Subscription ID            |

Es gibt **kein** `azure/COPILOT_OPERATOR_CLIENT_SECRET` in Stage 1 – Federated
Credential ersetzt das Client Secret vollstaendig.

## Stage 1 Verifikation

```bash
az ad app list --filter "displayName eq 'moe-copilot-operator'" \
    --query "[].{appId:appId, displayName:displayName}" -o table
az role assignment list --assignee "$APP_ID" -o table
az ad app federated-credential list --id "$APP_ID" -o table
```

## Aenderungsprotokoll

| Datum      | Aenderung                                                                               | Verantwortlich  |
| ---------- | --------------------------------------------------------------------------------------- | --------------- |
| 2026-05-19 | Initiale Stufen, Bootstrap, Azure MCP 2.0.2, Microsoft Docs MCP                         | devops/security |
| 2026-05-20 | Stufe 1 Bootstrap dokumentiert (Federated Credential, Reader-RBAC, BSM-Mapping pending) | devops/security |
