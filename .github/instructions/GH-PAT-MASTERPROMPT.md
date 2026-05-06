# 🔑 Masterprompt – GitHub PAT (Optimal genutzt, sicher betrieben)

Rolle (an Copilot):
Handle als DevOps/Security-Engineer. Implementiere Least-Privilege-Nutzung, sichere Ablage, automatisierte Workflows und Rotation für den neuen GitHub-PAT (`GH_TOKEN`, gültig bis 18.10.2026). Erzeuge/aktualisiere die unten definierten Dateien, Workflows und Policies – ohne jemals Tokens im Klartext ins Repo zu schreiben.

---

## 0) Entscheidungslogik (wann welcher Token)

1. Bevorzugt: `GITHUB_TOKEN` (Actions-Standard) für Vorgänge im selben Repo.
2. GitHub App (langfristig, Org-weit, feingranular) für Integrationen/Bots.
3. Feingranularer PAT (`GH_TOKEN`) nur wenn nötig (repo-übergreifend, Admin, Secrets, Codespaces-Admin, Merge-Queue, Attestations…).
4. Cloud-Zugriff: OIDC (Federation) statt PAT, wo möglich.

> Copilot: Nutze PAT nur, wenn `GITHUB_TOKEN`/GitHub App nicht ausreichen. Prüfe je Workflow explizit.

---

## 1) Sichere Ablage & Laden

### 1.1 Lokal (entwicklerseitig)

- `.env.local` (im `.gitignore`):

  ```dotenv
  GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
- Nie ins Repo, nie in Logs echoen. VS Code:
  `.vscode/settings.json` (ergänzen/erstellen)

  ```json
  {
    "github.gitAuthentication": true,
    "terminal.integrated.env.windows": { "GH_TOKEN": "${env:GH_TOKEN}" }
  }
  ```

### 1.2 GitHub Actions (CI)

- Repo-Secrets unter Settings → Secrets and variables → Actions:

  - `GH_TOKEN`  (PAT)
  - optional: `GH_APP_ID`, `GH_APP_PRIVATE_KEY` für spätere App-Migration

> Copilot: Stelle sicher, dass alle Workflows `${{ secrets.GH_TOKEN }}` referenzieren, nie Klartext.

---

## 2) Standard-Workflows mit Token-Strategie

### 2.1 CI / PR (bevorzugt ohne PAT)

`.github/workflows/ci.yml`

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [ main ]
permissions:
  contents: read
  pull-requests: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4   # nutzt GITHUB_TOKEN
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm test
```

### 2.2 Admin/Repo-übergreifende Tasks (PAT erforderlich)

`.github/workflows/admin-ops.yml`

```yaml
name: admin-ops
on:
  workflow_dispatch:
permissions:
  contents: write
  discussions: write
  issues: write
  actions: write
  # Beachte: PAT bestimmt tatsächlich die effektiven Rechte
jobs:
  label-sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GH_TOKEN }}       # explizit PAT verwenden
      - name: Sync labels (org-weit)
        run: gh label clone source/repo --repo $GITHUB_REPOSITORY
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
      - name: Close stale issues
        run: gh issue list --state open --json number | jq -r '.[].number' | xargs -I{} gh issue close {}
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

### 2.3 Releases + Artefakte + Beglaubigungen

`.github/workflows/release.yml`

```yaml
name: release
on:
  push:
    tags: [ "v*.*.*" ]
permissions:
  contents: write
  attestations: write
  id-token: write        # für künftige OIDC-Nutzung
jobs:
  build-sign-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { token: ${{ secrets.GH_TOKEN }} }  # PAT, z.B. für cross-repo
      - run: |
          npm ci && npm run build
          tar -czf artifact.tar.gz dist/
      - name: Create release
        run: gh release create "$GITHUB_REF_NAME" artifact.tar.gz --generate-notes
        env: { GH_TOKEN: ${{ secrets.GH_TOKEN }} }
      - name: Attest artifact (SLSA/Attestations)
        run: gh attestation sign artifact.tar.gz --repo "$GITHUB_REPOSITORY"
        env: { GH_TOKEN: ${{ secrets.GH_TOKEN }} }
```

### 2.4 Codespaces / Devcontainer (PAT für gh CLI)

`.devcontainer/devcontainer.json`

```json
{
  "features": { "ghcr.io/devcontainers/features/github-cli:1": {} },
  "postCreateCommand": "gh auth login --with-token < .env.local || true"
}
```

---

## 3) Secrets, Variablen & Umgebungen

- Secrets für alles Vertrauliche (PAT, API-Keys).
- Variables für unvertrauliche Konfig (z. B. `DEPLOY_ENV=prod`).
- Environments (z. B. `staging`, `prod`) mit Required Reviewers, wait rules und separaten Secrets pro Umgebung.

Beispiel: `.github/workflows/deploy.yml`

```yaml
name: deploy
on: workflow_dispatch
permissions: { contents: read, deployments: write }
jobs:
  deploy:
    environment: prod
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy with PAT to another repo
        run: gh workflow run deploy.yml --repo org/infra --ref main
        env: { GH_TOKEN: ${{ secrets.GH_TOKEN }} }
```

---

## 4) Rechte-Optimierung & Least-Privilege

- Scoping: Wenn möglich, feingranularen PAT pro Repo statt „alle Repos“.
- Split: Einen zweiten PAT mit nur „Contents: Read/Write“ für CI-Releases; einen Admin-PAT nur für „Administration/Webhooks/Codespaces-Admin“.
- Review: Quartalsweise Bereinigung ungenutzter Scopes.

> Copilot: Prüfe pro Workflow, welche `permissions:` wirklich gebraucht werden; setze minimal nötig (z. B. `contents: read` statt `write`).

---

## 5) Rotation, Ablauf & Notfall

### 5.1 Reminder-Workflow (30 Tage vor Ablauf warnen)

`.github/workflows/pat-expiry-reminder.yml`

```yaml
name: pat-expiry-reminder
on:
  schedule: [ { cron: "0 7 * * *" } ]   # täglich 07:00 CET
  workflow_dispatch:
jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - name: Create issue if PAT expiring soon
        run: |
          EXPIRY="2026-10-18"
          DAYS=$(( ( $(date -u -d "$EXPIRY" +%s) - $(date -u +%s) ) / 86400 ))
          if [ "$DAYS" -le 30 ]; then
            gh issue create --title "PAT läuft in $DAYS Tagen ab" \
              --body "Bitte neuen PAT erstellen, Secrets aktualisieren, alten widerrufen."
          fi
        env: { GH_TOKEN: ${{ secrets.GH_TOKEN }} }
```

### 5.2 Rotation-Playbook (Doku `docs/security/GH-PAT-ROTATION.md`)

1. Neuen PAT mit minimalen Scopes erstellen.
2. Secret `GH_TOKEN` aktualisieren.
3. Test-Workflow manuell starten.
4. Alten PAT widerrufen.
5. Audit: Check, dass keine Workflows mehr auf alten PAT referenzieren.

---

## 6) Schutzmaßnahmen

- Secret-Scanning / Push-Schutz aktivieren (Org/Repo).
- Branch Protection (signierte Commits, Reviews, Status-Checks).
- Maskierung: In Skripten nie `echo $GH_TOKEN`.
- Logs minimieren: `set -x` vermeiden oder vor sensiblen Schritten deaktivieren.

---

## 7) Admin-Aktionen (mit gh CLI + PAT)

Beispiele (als `scripts/gh/…` ablegen; alle verwenden `GH_TOKEN` aus Env):

```bash
gh api -X PATCH repos/{owner}/{repo} -f has_issues=true

gh api repos/{owner}/{repo}/hooks -f name=web -F config.url="$URL" -F config.content_type=json

gh secret set MY_API_KEY --repo {owner}/{repo} --body "$VALUE"

gh api repos/{owner}/{repo}/code-scanning/alerts
```

---

## 8) Dokumentation & Beispiele

### 8.1 `docs/security/GH-TOKEN-USAGE.md`

Kurz-HowTo: Wo liegt `GH_TOKEN` lokal, wie als Secret, wann `GITHUB_TOKEN` reicht, Token niemals loggen.

### 8.2 `.env.example` (ohne Werte)

```dotenv
# Platzhalter – niemals echten Token commiten
GH_TOKEN=
```

### 8.3 `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    { "label": "gh: auth status", "type": "shell", "command": "gh auth status" },
    { "label": "gh: list repos", "type": "shell", "command": "gh repo list --limit 20" }
  ]
}
```

---

## 9) Definition of Done (DoD)

- [ ] Alle Workflows nutzen `GITHUB_TOKEN`, außer wo PAT zwingend ist.
- [ ] `GH_TOKEN` ist als Repo-Secret gesetzt; lokal nur `.env.local`.
- [ ] Rechte/`permissions:` in Workflows sind minimal.
- [ ] Reminder-Workflow aktiv (Ablauf ≤30 Tage).
- [ ] Admin-Ops funktionieren mit `gh` + PAT.
- [ ] Doku vorhanden: Usage, Rotation, Least-Privilege.
- [ ] Secret-Scanning & Push-Schutz aktiv.
- [ ] Kein Token in Logs/Artefakten.

---

## 10) Anweisung an Copilot (konkret)

- Lege/aktualisiere alle oben genannten Dateien exakt an.
- Prüfe existierende Workflows: ersetze unnötige PAT-Verwendungen durch `GITHUB_TOKEN`.
- Füge `permissions:` minimal hinzu, falls nicht vorhanden.
- Erstelle `pat-expiry-reminder.yml`.
- Erzeuge `docs/security/GH-TOKEN-USAGE.md` und `GH-PAT-ROTATION.md`.
- Erstelle `scripts/gh/`-Snippets (bash), die `GH_TOKEN` aus der Umgebung nutzen.
- Keine Klartext-Tokens, keine Ausgabe von Secrets in Logs.
