# 10 – Repo & CI/CD Verbesserungen

**Stand**: 2026-03-09

---

## Ist-Zustand (verifiziert)

| Attribut | Wert |
|----------|------|
| Workflows | 52 GitHub Actions Workflows |
| Package Manager | npm (package-lock.json vorhanden) |
| Node.js-Version (package.json) | ≥22.19.0 |
| Node.js-Version (CI vor Fix) | 20 (Mismatch!) |
| Deployment | rsync + SSH (deploy-plesk.yml) |
| Security-Scans | Gitleaks, Trivy, Bandit, Semgrep, CodeQL |
| SBOM | sbom.yml Workflow vorhanden |
| Branch-Policy | main (geschützt), develop, feature/* |

---

## Bereits behobene Issues (in diesem Audit)

| Fix | Datei | Detail |
|-----|-------|--------|
| Node.js 20 → 22 | `deploy-plesk.yml` | build-frontend + test Job |

---

## Verbleibende Verbesserungen

### CI-001 – Node.js-Version in weiteren Workflows prüfen

```bash
# Prüfen welche Workflows noch Node 20 verwenden:
grep -r "node-version.*20" .github/workflows/
```

Alle Workflows sollten konsistent `node-version: "22"` oder besser die `.nvmrc`-Datei verwenden:

```yaml
# Empfehlung: .nvmrc im Root anlegen
# Inhalt: 22
# Dann in Workflows:
- uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'
    cache: 'npm'
```

---

### CI-002 – SBOM-Gate im Releaseprozess

```yaml
# .github/workflows/release.yml (Ergänzung):
- name: SBOM generieren
  run: npm sbom --sbom-type=spdx --sbom-format=json > sbom.json

- name: SBOM auf kritische CVEs prüfen
  run: |
    npm audit --audit-level=critical
    pip-audit --requirement apps/api/requirements.txt --severity critical

- name: SBOM als Release-Artefakt hochladen
  uses: actions/upload-artifact@v4
  with:
    name: sbom-${{ github.sha }}
    path: sbom.json
```

---

### CI-003 – OpenAPI-Drift-Test

```yaml
# Neuer Step in deploy-plesk.yml oder quality-gates.yml:
- name: OpenAPI-Spec-Drift prüfen
  run: |
    # FastAPI schema exportieren und mit committed openapi.yaml vergleichen
    cd apps/api
    python -c "
    from app.main import app
    import json, yaml
    schema = app.openapi()
    with open('openapi.yaml') as f:
        committed = yaml.safe_load(f)
    assert schema == committed, 'OpenAPI-Spec nicht synchron! Bitte openapi.yaml aktualisieren.'
    "
```

---

### CI-004 – Zero-Downtime Deployment (Bluegrün oder Symlink-Swap)

**Aktuell**: rsync überschreibt Produktionsverzeichnis direkt → Downtime während rsync.

**Empfehlung Symlink-Swap** (einfachste Zero-Downtime-Variante):

```bash
# Deploy-Skript auf Server (deploy-atomic.sh):
#!/bin/bash
DOMAIN_ROOT=/var/www/vhosts/menschlichkeit-oesterreich.at
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
NEW_DIR="$DOMAIN_ROOT/releases/$TIMESTAMP"
CURRENT="$DOMAIN_ROOT/httpdocs"

# 1. Neue Version hochladen in releases/
mkdir -p "$NEW_DIR"
rsync -az _dist_frontend/ "$NEW_DIR/"

# 2. Atomic Symlink-Swap
ln -sfn "$NEW_DIR" "${CURRENT}_new"
mv -Tf "${CURRENT}_new" "$CURRENT"

# 3. Alte Releases bereinigen (letzte 5 behalten)
ls -dt "$DOMAIN_ROOT/releases/"* | tail -n +6 | xargs rm -rf

echo "Deployment abgeschlossen: $TIMESTAMP"
```

---

### CI-005 – Rollback-Mechanismus

```bash
# Rollback-Script (deploy-rollback.sh):
#!/bin/bash
DOMAIN_ROOT=/var/www/vhosts/menschlichkeit-oesterreich.at

# Vorherige Version ermitteln
RELEASES=$(ls -dt "$DOMAIN_ROOT/releases/"*)
PREVIOUS=$(echo "$RELEASES" | sed -n '2p')

if [ -z "$PREVIOUS" ]; then
    echo "Kein vorheriges Release gefunden."
    exit 1
fi

# Symlink zurücksetzen
ln -sfn "$PREVIOUS" "${DOMAIN_ROOT}/httpdocs_rollback"
mv -Tf "${DOMAIN_ROOT}/httpdocs_rollback" "$DOMAIN_ROOT/httpdocs"

echo "Rollback auf: $PREVIOUS"
```

---

### REPO-001 – Legacy-Verzeichnisse bereinigen

```bash
# Inventar der Legacy-Verzeichnisse:
ls -la /path/to/repo/ | grep "\.menschlichkeit-oesterreich\.at"

# api.menschlichkeit-oesterreich.at/  ← Legacy (docker-compose.prod.yml)
# crm.menschlichkeit-oesterreich.at/  ← Legacy
# frontend/                            ← Legacy (neben apps/website/)

# Empfehlung:
# 1. Sicherstellen dass alle aktiven Docker-Compose-Files auf apps/* zeigen
# 2. Legacy-Verzeichnisse in ein separates archiv/-Verzeichnis verschieben
# 3. Nach 2 Releases (≈ 6 Monate) löschen
```

---

### REPO-002 – Branch-Policy stärken

```yaml
# GitHub Branch Protection für `main`:
# Settings → Branches → Add Rule → main
required_status_checks:
  strict: true
  contexts:
    - "Unit Tests"
    - "Security Scan (Gitleaks)"
    - "CodeQL"
    - "Quality Gates"
required_pull_request_reviews:
  required_approving_review_count: 1
  dismiss_stale_reviews: true
enforce_admins: false  # Admins können im Notfall pushen
require_linear_history: true  # Squash-Merges erzwingen
```

---

### REPO-003 – Conventional Commits durchsetzen

```bash
# commitlint bereits konfiguriert (wahrscheinlich via .commitlintrc)
# Verifizieren:
cat .commitlintrc.* 2>/dev/null || cat package.json | grep commitlint

# Ergänzung: husky pre-commit Hook für Tests:
npx husky add .husky/pre-push "npm run test:unit"
```

---

## Zusammenfassung der Verbesserungen

| Priorität | Verbesserung | Aufwand |
|-----------|-------------|---------|
| P1 | .nvmrc anlegen (Node.js-Version-Konsistenz) | 5 min |
| P1 | SBOM-Gate in Release-Workflow | 30 min |
| P2 | OpenAPI-Drift-Test | 1h |
| P2 | Symlink-Swap-Deployment (Zero-Downtime) | 2h |
| P2 | Rollback-Mechanismus | 1h |
| P3 | Legacy-Verzeichnisse archivieren | 2h |
| P3 | Branch-Protection verschärfen | 15 min |

---

## Checkliste

```
[ ] .nvmrc angelegt (Inhalt: 22)
[ ] Alle Workflows auf node-version-file: '.nvmrc' umgestellt
[ ] SBOM-Gate im Release-Workflow (kritische CVEs blockieren)
[ ] OpenAPI-Drift-Test im CI
[ ] Symlink-Swap-Deployment deployen und testen
[ ] Rollback-Skript getestet
[ ] Legacy-Verzeichnisse inventarisiert
[ ] Branch Protection für main konfiguriert
[ ] commitlint + husky pre-push aktiv
```
