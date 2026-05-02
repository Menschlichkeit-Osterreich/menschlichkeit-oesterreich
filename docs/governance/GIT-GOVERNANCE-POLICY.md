# Git Governance & Repository Policy

**Version:** 1.0.0  
**Datum:** 2025-10-03  
**Enforcement:** Automated (GitHub Branch Protection + Pre-Commit Hooks)  
**Revision:** Quartalsweise

---

## Übersicht

Dieses Dokument definiert verbindliche Governance-Regeln für das Git-Repository `menschlichkeit-oesterreich`, um Codequalität, Sicherheit und Nachvollziehbarkeit zu gewährleisten.

---

## 1. Branch-Strategie

### 1.1 Branch-Modell

**Strategie:** Trunk-Based Development mit Feature-Branches

```
chore/figma-mcp-make (Default/Main)
├── feature/new-donation-flow
├── fix/csrf-vulnerability
├── chore/dependency-updates
└── release/v1.2.0
```

**Branch-Namenskonvention:**

```
<type>/<short-description>

Typen:
- feature/    Neue Funktionalität
- fix/        Bugfix
- hotfix/     Kritischer Production-Fix
- chore/      Wartung, Refactoring
- docs/       Dokumentation
- test/       Test-Implementierung
- release/    Release-Vorbereitung
```

**Beispiele:**

- ✅ `feature/civicrm-api-integration`
- ✅ `fix/broken-email-validation`
- ✅ `chore/upgrade-node-20`
- ❌ `new-stuff`
- ❌ `johns-work`

---

### 1.2 Branch-Lebenszyklus

**Feature-Branch:**

1. Erstellen von `chore/figma-mcp-make`
2. Entwicklung (max. 7 Tage)
3. Pull Request öffnen
4. Code Review (mindestens 1 Approval)
5. Merge → Branch löschen

**Hotfix-Branch:**

1. Direkt von `chore/figma-mcp-make` abzweigen
2. Fix implementieren
3. Fast-Track Review (< 4h)
4. Merge & Deploy

---

### 1.3 Branch Protection Rules

**Default Branch (`chore/figma-mcp-make`):**

```yaml
protection:
  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
    require_code_owner_reviews: true

  required_status_checks:
    strict: true
    contexts:
      - 'ci/lint'
      - 'ci/test'
      - 'security/trivy'
      - 'quality/codacy'

  enforce_admins: true

  required_signatures: true # GPG-signierte Commits

  allow_force_pushes: false
  allow_deletions: false

  required_linear_history: true # Keine Merge-Commits

  required_conversation_resolution: true # Alle Review-Kommentare müssen resolved sein
```

**GitHub API Setup:**

```bash
curl -X PUT \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/branches/chore%2Ffigma-mcp-make/protection \
  -d @- <<EOF
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci/lint", "ci/test", "security/trivy", "quality/codacy"]
  },
  "enforce_admins": true,
  "required_signatures": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": true,
  "required_conversation_resolution": true
}
EOF
```

---

## 2. Commit-Richtlinien

### 2.1 Commit-Message-Format

**Standard:** Conventional Commits 1.0.0

**Format:**

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Typen:**

- `feat`: Neue Funktionalität (MINOR-Version)
- `fix`: Bugfix (PATCH-Version)
- `docs`: Nur Dokumentation
- `style`: Formatierung (keine Code-Änderung)
- `refactor`: Code-Umstrukturierung (keine Funktionsänderung)
- `perf`: Performance-Verbesserung
- `test`: Tests hinzufügen/ändern
- `chore`: Build/Tool-Konfiguration
- `ci`: CI/CD-Änderungen
- `revert`: Commit rückgängig machen

**Breaking Changes:**

```
feat(api)!: remove deprecated /v1/donations endpoint

BREAKING CHANGE: The /v1/donations endpoint has been removed. Use /v2/donations instead.
```

**Beispiele:**

```
✅ feat(crm): add SEPA payment validation
✅ fix(frontend): resolve CSRF token refresh issue
✅ docs(readme): update installation instructions
✅ chore(deps): bump react from 18.2.0 to 18.3.0

❌ Fixed stuff
❌ WIP
❌ Update
```

---

### 2.2 Commit Signing

**Anforderung:** Alle Commits MÜSSEN GPG-signiert sein.

**Einrichtung:**

```bash
# 1. GPG-Key generieren
gpg --full-generate-key
# Wählen: (1) RSA and RSA, 4096 bits, kein Ablaufdatum

# 2. Key-ID ermitteln
gpg --list-secret-keys --keyid-format=long
# Ausgabe: sec   rsa4096/ABCDEF1234567890 ...

# 3. Public Key exportieren
gpg --armor --export ABCDEF1234567890

# 4. Zu GitHub hinzufügen
# Settings → SSH and GPG keys → New GPG key

# 5. Git konfigurieren
git config --global user.signingkey ABCDEF1234567890
git config --global commit.gpgsign true
git config --global tag.gpgsign true

# 6. GPG-Agent konfigurieren (für VS Code)
echo 'export GPG_TTY=$(tty)' >> ~/.bashrc
source ~/.bashrc
```

**Verifikation:**

```bash
# Lokaler Commit
git log --show-signature -1

# GitHub: Verified Badge sichtbar
```

---

### 2.3 Commit-Größe

**Richtlinie:**

- **Idealerweise:** 1 logische Änderung = 1 Commit
- **Maximal:** 500 Zeilen (ohne Auto-Generated Code)
- **Mindestens:** Compilable/Testable State

**Schlechte Praxis (❌):**

```
commit: "Fixed everything + added new features + refactored database"
  Files changed: 47
  Insertions: 3,452
  Deletions: 1,890
```

**Gute Praxis (✅):**

```
commit 1: "refactor(db): normalize donation table schema"
commit 2: "feat(api): add SEPA validation endpoint"
commit 3: "test(api): add integration tests for SEPA validation"
```

---

### 2.4 Commit-Hooks

**Pre-Commit-Hook (`.git/hooks/pre-commit`):**

```bash
#!/bin/bash
# Enforces linting, tests, and commit message format

# 1. Lint-Check
npm run lint || exit 1

# 2. Type-Check (TypeScript)
npm run typecheck || exit 1

# 3. Secret-Scan (prevent accidental token commits)
git diff --cached --name-only | xargs grep -E '(AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36})' && {
  echo "❌ ERROR: Potential secret detected!"
  exit 1
}

# 4. Conventional Commits Check
COMMIT_MSG=$(cat .git/COMMIT_EDITMSG)
if ! echo "$COMMIT_MSG" | grep -Eq '^(feat|fix|docs|style|refactor|perf|test|chore|ci|revert)(\(.+\))?: .+'; then
  echo "❌ ERROR: Commit message must follow Conventional Commits format"
  echo "Example: feat(api): add new endpoint"
  exit 1
fi

exit 0
```

**Installation:**

```bash
# Husky (automatisiert)
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional
npx husky init
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

---

## 3. Pull Request (PR) Richtlinien

### 3.1 PR-Template

**`.github/PULL_REQUEST_TEMPLATE.md`:**

```markdown
## Beschreibung

<!-- Was ändert dieser PR? -->

## Motivation

<!-- Warum ist diese Änderung notwendig? Issue-Referenz: #123 -->

## Art der Änderung

- [ ] Bugfix (nicht-breaking)
- [ ] Neue Funktionalität (nicht-breaking)
- [ ] Breaking Change
- [ ] Dokumentation

## Checkliste

- [ ] Code folgt Style-Guide
- [ ] Selbst-Review durchgeführt
- [ ] Kommentare an komplexen Stellen
- [ ] Dokumentation aktualisiert
- [ ] Keine neuen Warnings
- [ ] Unit-Tests hinzugefügt
- [ ] Alle Tests bestehen
- [ ] SBOM aktualisiert (falls neue Dependencies)
- [ ] DSGVO-konform (keine neuen PII-Verarbeitungen)

## Screenshots (falls UI-Änderung)

## Weitere Hinweise
```

---

### 3.2 PR-Review-Prozess

**Workflow:**

1. **Öffnen:** PR gegen `chore/figma-mcp-make`
2. **Automated Checks:** CI/CD läuft (Lint, Test, Security)
3. **Code Review:** Mindestens 1 Approver (CODEOWNERS)
4. **Discussions:** Alle Kommentare müssen resolved sein
5. **Merge:** Squash & Merge (1 Commit im Main-Branch)
6. **Cleanup:** Feature-Branch automatisch gelöscht

**Review-Kriterien:**

- [ ] Code ist lesbar und wartbar
- [ ] Tests vorhanden und sinnvoll
- [ ] Keine Sicherheitslücken (SQL-Injection, XSS, etc.)
- [ ] Performance-Impact akzeptabel
- [ ] Dokumentation aktuell

**Review-SLA:**

- **Standard:** 48h
- **Hotfix:** 4h
- **Breaking Change:** 7 Tage (mit Team-Meeting)

---

### 3.3 CODEOWNERS

**Operative Quelle:** `.github/CODEOWNERS`

Die operative Ownership fuer Review-Zustaendigkeiten wird ausschliesslich in `.github/CODEOWNERS` gepflegt.
Organisatorische Rollen (z. B. Board, Tech Lead, Security) bleiben in Governance-/RACI-Dokumenten beschrieben,
werden aber nicht als unbestaetigte GitHub-Handles in der operativen Ownership simuliert.

**Kanonischer Einstieg:**

```
# siehe .github/CODEOWNERS (operativer Stand)
```

**Enforcement:**

```yaml
required_pull_request_reviews:
  require_code_owner_reviews: true # CODEOWNERS müssen approven
```

---

## 4. Release-Management

### 4.1 Versioning

**Standard:** Semantic Versioning 2.0.0

**Format:** `MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`

**Regeln:**

- **MAJOR:** Breaking Changes (z.B. API-Änderung)
- **MINOR:** Neue Features (backwards-compatible)
- **PATCH:** Bugfixes (backwards-compatible)

**Beispiele:**

- `1.2.3` → Stable Release
- `2.0.0-beta.1` → Pre-Release
- `1.2.3+20250103` → Build-Metadaten

**Automatisierung mit `semantic-release`:**

```json
// package.json
{
  "scripts": {
    "release": "semantic-release"
  },
  "devDependencies": {
    "semantic-release": "^22.0.0",
    "@semantic-release/changelog": "^6.0.0",
    "@semantic-release/git": "^10.0.0"
  }
}
```

**`.releaserc.json`:**

```json
{
  "branches": ["chore/figma-mcp-make"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]"
      }
    ]
  ]
}
```

---

### 4.2 Release-Workflow

**Schritte:**

1. **Vorbereitung:**
   - Alle PRs für Release gemerged
   - CHANGELOG manuell überprüft
   - SBOM aktualisiert

2. **Release-Branch (optional für MAJOR):**

   ```bash
   git checkout -b release/v2.0.0
   ```

3. **Semantic Release:**

   ```bash
   npm run release
   # Automatisch: Version bump, CHANGELOG, Git-Tag, GitHub-Release
   ```

4. **Deployment:**

   ```bash
   ./scripts/safe-deploy.sh --environment production
   ```

5. **Post-Release:**
   - GitHub Release Notes veröffentlichen
   - SBOM signieren und hochladen
   - Stakeholder benachrichtigen (n8n-Workflow)

---

### 4.3 Release-Checkliste

**Pre-Release:**

- [ ] Alle CI/CD-Tests bestanden
- [ ] Security-Scan clean (Trivy, Codacy)
- [ ] SBOM generiert und validiert
- [ ] Dokumentation aktualisiert
- [ ] CHANGELOG geprüft
- [ ] Breaking Changes kommuniziert (falls MAJOR)
- [ ] Rollback-Plan vorhanden

**Post-Release:**

- [ ] GitHub Release erstellt
- [ ] Docker-Images gepusht & signiert
- [ ] Production-Deployment erfolgreich
- [ ] Monitoring zeigt keine Anomalien (24h)
- [ ] SBOM auf GitHub veröffentlicht
- [ ] Release-Notes an Stakeholder

---

## 5. Repository-Hygiene

### 5.1 Datei-Organisation

**Verbotene Inhalte:**

- ❌ Credentials (API-Keys, Passwörter)
- ❌ Binärdateien >10 MB (außer LFS)
- ❌ Auto-Generated Files (z.B. `node_modules/`, `build/`)
- ❌ IDE-spezifische Configs (außer `.vscode/` für Team-Settings)
- ❌ Persönliche Notizen (`TODO_JOHN.md`)

**.gitignore (essentiell):**

```gitignore
# Dependencies
node_modules/
vendor/

# Build
build/
dist/
*.pyc

# Secrets
.env
.env.local
secrets/**
!secrets/.gitkeep

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

### 5.2 Archivierung

**Altlasten-Policy:**

- **Feature-Branches:** Löschen nach Merge
- **Release-Branches:** Behalten (als Git-Tag)
- **Veraltete Dateien:** In `archive/` verschieben mit README

**Archivierungs-Skript:**

```bash
#!/bin/bash
# scripts/archive-old-files.sh

TARGET_DIR="archive/$(date +%Y-%m-%d)"
mkdir -p "$TARGET_DIR"

# Beispiel: Alte Build-Reports
mv build-report-*.json "$TARGET_DIR/"
git add "$TARGET_DIR"
git commit -m "chore(archive): move old build reports to $TARGET_DIR"
```

---

### 5.3 Sensitive Data Removal

**Falls Secrets committed wurden:**

```bash
# Mit git-filter-repo (empfohlen)
pip install git-filter-repo
git filter-repo --path secrets/api-key.txt --invert-paths

# History neu schreiben
git push --force --all
git push --force --tags

# Alle Collaborators müssen re-clonen
```

**Prevention:**

```bash
# Pre-Commit-Hook (siehe 2.4)
# + GitHub Secret Scanning aktivieren
```

---

## 6. Access Control & Permissions

### 6.1 Team-Rollen

| Rolle          | Berechtigung             | Personen   |
| -------------- | ------------------------ | ---------- |
| **Admin**      | Alles (inkl. Settings)   | @peschull  |
| **Maintainer** | Merge PRs, Releases      | TBD        |
| **Developer**  | Push zu Feature-Branches | Team       |
| **Reviewer**   | Comment, Approve         | CODEOWNERS |
| **Read-Only**  | Klonen, Issues           | Public     |

---

### 6.2 Token-Management

**GitHub Personal Access Tokens (PAT):**

**Verwendung:**

- CI/CD (GitHub Actions Secrets)
- Deployment-Skripte
- API-Aufrufe

**Rotation:**

- **Admin-Tokens:** Alle 90 Tage
- **CI-Tokens:** Alle 180 Tage
- **Deprecated:** Sofort widerrufen

**Scopes (Minimum Privilege):**

```
✅ repo (für Private Repos)
✅ read:org
✅ workflow
❌ admin:org (nur falls absolut notwendig)
❌ delete:packages (nur für Cleanup-Jobs)
```

---

### 6.3 SSH-Keys

**Richtlinien:**

- **Algorithmus:** Ed25519 (bevorzugt) oder RSA 4096
- **Passphrase:** Pflicht
- **Rotation:** Jährlich
- **Pro-User:** Max. 2 aktive Keys (Desktop + Laptop)

**Generierung:**

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Passphrase eingeben!
```

---

## 7. Compliance-Status

### 7.1 Checkliste

**Branch Protection:**

- [x] Default-Branch geschützt
- [ ] Force-Push deaktiviert
- [ ] Deletion deaktiviert
- [ ] Required Reviews: 1
- [ ] Required Signatures: GPG

**Commit-Standards:**

- [ ] Conventional Commits enforced
- [ ] GPG-Signing mandatory
- [ ] Pre-Commit-Hooks aktiv

**PR-Workflow:**

- [ ] PR-Template vorhanden
- [ ] CODEOWNERS definiert
- [ ] Automated Checks (CI/CD)

**Release-Management:**

- [ ] Semantic Versioning
- [ ] Automated Releases (semantic-release)
- [ ] SBOM pro Release

**Repository-Hygiene:**

- [ ] .gitignore vollständig
- [ ] Keine Secrets im Repo
- [ ] Alte Branches archiviert

### 7.2 Gesamt-Score

**Erfüllt:** 2 / 23 Checkboxen (8.7%)  
**Status:** 🔴 NICHT COMPLIANT

---

## 8. Nächste Schritte

**SOFORT (0-7 Tage):**

1. Branch-Protection via API aktivieren
2. GPG-Keys für alle Maintainer
3. Pre-Commit-Hooks installieren (Husky)

**KURZ (1-4 Wochen):** 4. CODEOWNERS-Datei erstellen 5. PR-Template hinzufügen 6. Semantic-Release konfigurieren

**MITTEL (1-3 Monate):** 7. Team-Rollen definieren 8. Token-Rotation-Policy umsetzen 9. Compliance-Monitoring (monatlich)

---

**Review-Zyklus:** Quartalsweise  
**Nächste Review:** 2025-12-31  
**Verantwortlich:** Repository Admin (@peschull) + DevOps Team
