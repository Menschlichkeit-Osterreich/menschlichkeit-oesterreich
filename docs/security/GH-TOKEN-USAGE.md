# GitHub Token (GH_TOKEN) – Quick-Start-Guide

**Zielgruppe:** Entwickler*innen, DevOps Engineers
**Zweck:** Schneller Einstieg in die Nutzung des GitHub Personal Access Token (PAT)
**Update:** 2025-10-18

---

## 🎯 TL;DR (Was du wissen musst)

```yaml
Token-Typ:        GitHub Personal Access Token (Fine-grained)
Variable:         GH_TOKEN
Ablauf:           2026-10-18 (1 Jahr)
Scope:            repo, workflow, admin:org, codespace, attestations
Speicherort:      .env.local (lokal) + GitHub Secrets (CI/CD)
NIE committen:    ❌ .env, ❌ Git-History, ❌ Logs, ❌ Chat
```

---

## 📍 Wo liegt der Token?

### Lokal (dein Rechner)

**`.env.local`** (in Projekt-Root, NICHT in Git!)

```dotenv
# NIEMALS .env.local committen!
GH_TOKEN=[GITHUB_PERSONAL_ACCESS_TOKEN_PLACEHOLDER]
```

**Prüfen:**

```bash
# Windows (PowerShell)
Get-Content .env.local | Select-String "GH_TOKEN"

# Linux/macOS (Bash)
grep "^GH_TOKEN=" .env.local
```

### GitHub Actions (CI/CD)

**Repository Secrets:** https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/settings/secrets/actions

**Zugriff in Workflows:**

```yaml
env:
  GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

---

## ✅ Wie nutze ich den Token?

### gh CLI (Kommandozeile)

```bash
# Token aus .env.local laden (automatisch via $PROFILE oder .bashrc)
gh auth status

# Sollte zeigen:
# ✓ Logged in to github.com as peschull (via GH_TOKEN)

# Beispiel-Kommandos
gh repo list --limit 10
gh issue list --state open
gh pr view 123
```

### Git-Operationen (HTTPS)

```bash
# Clone (Token wird automatisch genutzt, wenn gh auth aktiv)
gh repo clone Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development

# Push (bevorzugt SSH, aber HTTPS funktioniert auch)
git push origin main
```

### API-Calls (mit curl)

```bash
# User-Info abrufen
curl -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user

# Repository-Info
curl -H "Authorization: Bearer $GH_TOKEN" \
  https://api.github.com/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development
```

### GitHub Actions (Workflows)

```yaml
# Bevorzugt: GITHUB_TOKEN für Operationen im gleichen Repo
- run: gh issue list
  env:
    GH_TOKEN: ${{ github.token }}  # NICHT secrets.GH_TOKEN

# Nur bei Cross-Repo-Operationen: PAT verwenden
- uses: actions/checkout@v4
  with:
    repository: peschull/other-repo
    token: ${{ secrets.GH_TOKEN }}
```

---

## 🚫 Was du NIEMALS tun darfst

### ❌ Token committen

```bash
# FALSCH – landet in Git-History!
git add .env
git commit -m "Add config"  # ❌ .env enthält Token!

# RICHTIG – .env.local ist in .gitignore
git add .env.local  # Git ignoriert diese Datei ✅
```

### ❌ Token in Logs ausgeben

```yaml
# FALSCH – Token landet in Workflow-Logs!
- run: echo "Token: $GH_TOKEN"  # ❌

# RICHTIG – Maskiert oder gar nicht ausgeben
- run: |
    set +x  # Debug aus
    gh api user --silent  # Keine Ausgabe
  env:
    GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

### ❌ Token teilen

```markdown
❌ Slack/Teams/E-Mail
❌ GitHub Issues/PRs
❌ Screenshots
❌ Pastebin/Gist (auch nicht "privat"!)

✅ Passwort-Manager (1Password, Bitwarden)
✅ GitHub Secrets (für CI/CD)
```

---

## 🔧 Troubleshooting

### Problem: "Bad credentials"

**Symptom:**

```
gh: Bad credentials (HTTP 401)
```

**Ursache:** Token abgelaufen, falsch kopiert oder widerrufen.

**Lösung:**

```bash
# 1. Token-Status prüfen
gh auth status

# 2. Neu einloggen (interaktiv)
gh auth login

# 3. Oder: Token aus .env.local neu laden
source .env.local  # Bash/Zsh
$env:GH_TOKEN = (Get-Content .env.local | Select-String "GH_TOKEN").ToString().Split("=")[1]  # PowerShell
```

---

### Problem: "Resource not accessible by token"

**Symptom:**

```
gh: Resource not accessible by personal access token (HTTP 403)
```

**Ursache:** Token-Scope reicht nicht aus (z.B. fehlt `admin:org` für Org-Operationen).

**Lösung:**

1. https://github.com/settings/tokens
2. Token finden → **Edit**
3. Scope hinzufügen (z.B. `admin:org`)
4. **Update token**
5. Neuen Token in `.env.local` und GitHub Secrets aktualisieren

---

### Problem: gh CLI nutzt falschen Token

**Symptom:**

```
gh auth status
# ✓ Logged in to github.com as wrong-user
```

**Lösung:**

```bash
# Alten Token entfernen
gh auth logout

# Neu einloggen mit GH_TOKEN
echo "$GH_TOKEN" | gh auth login --with-token

# Bestätigung
gh auth status
# ✓ Logged in to github.com as peschull
```

---

## 📅 Token-Ablauf & Rotation

**Aktueller Token:**

- **Erstellt:** 2025-10-18
- **Ablauf:** 2026-10-18 (1 Jahr)
- **Reminder:** 30 Tage vorher (Auto-Issue via Workflow)

**Rotation-Playbook:** `docs/security/GH-PAT-ROTATION.md`

---

## 🔗 Häufige Workflows

### Issue erstellen

```bash
gh issue create \
  --title "Bug: Frontend-Fehler" \
  --body "Beschreibung..." \
  --label "bug,P2-Medium"
```

### PR erstellen

```bash
# Branch erstellen
git checkout -b feature/new-feature

# Commits machen
git add .
git commit -m "feat: neue Funktion"

# Push + PR
git push -u origin feature/new-feature
gh pr create --fill
```

### Workflow manuell starten

```bash
gh workflow run deploy-staging.yml --ref main
```

### Secret setzen

```bash
echo "NEW_VALUE" | gh secret set MY_SECRET
```

### Repo klonen (mit Submodules)

```bash
gh repo clone Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development -- --recurse-submodules
```

---

## 📚 Weiterführende Links

**Interne Dokumentation:**
- **Masterprompt:** `.github/instructions/gh-pat-integration.instructions.md`
- **Rotation-Guide:** `docs/security/GH-PAT-ROTATION.md`
- **Admin-Skripte:** `scripts/gh/`

**Externe Ressourcen:**
- [gh CLI Manual](https://cli.github.com/manual/)
- [GitHub REST API](https://docs.github.com/en/rest)
- [PAT Best Practices](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

---

## ✅ Checkliste (für neue Entwickler*innen)

```markdown
- [ ] `.env.local` erstellt (nicht `.env`!)
- [ ] `GH_TOKEN=...` aus 1Password/Bitwarden eingefügt
- [ ] `.env.local` in `.gitignore` (bereits vorhanden ✅)
- [ ] `gh auth status` → ✓ Logged in as peschull
- [ ] Test-Kommando: `gh repo list --limit 5`
- [ ] VS Code: Terminal zeigt Token NICHT an (maskiert)
- [ ] Dokumentation gelesen: `GH-PAT-ROTATION.md`
```

---

**Fragen?** → Issue erstellen: `gh issue create --title "Frage: GH_TOKEN..." --label "question"`

**Letzte Aktualisierung:** 2025-10-18
**Version:** 1.0.0
