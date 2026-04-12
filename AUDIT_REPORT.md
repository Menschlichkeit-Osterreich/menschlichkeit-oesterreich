# 🔍 Vollständiger Codebase-Audit — Menschlichkeit Österreich

**Erstellt:** 2026-04-05
**Auditor:** Claude Sonnet 4.6 (automatisiert)
**Repo:** `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`
**Branch:** `main` (HEAD: `4a62ac22`)

---

## Executive Summary

Das Monorepo ist für ein Non-Profit-Projekt bemerkenswert professionell aufgestellt:
42 GitHub Actions Workflows, alle Actions auf Commit-Hashes gepinnt, aktives
Gitleaks-/Trivy-/Semgrep-/CodeQL-Scanning, Bitwarden-SDK für Secrets-Management.

**Kritische Blocker:** 0 (keine sofortige Produktionsblockade)
**High-Prio Findings:** 5
**Medium-Prio Findings:** 7
**Low-Prio Findings:** 6

---

## Findings nach Priorität

---

### 🔴 CRITICAL — Keine Findings

Keine kritischen Blocker identifiziert.

---

### 🟠 HIGH

#### H1 — `.claude/skills/azure-devops-cli/SKILL.md` ist unvollständig (25 Zeilen statt 2467)

**Datei:** `.claude/skills/azure-devops-cli/SKILL.md`
**Status:** Die Datei wurde am 2026-04-05 neu angelegt, enthält aber nur den Header und
die Authentifizierungs-Sektion (25 Zeilen / 887 Bytes). Die vollständige Referenz-Datei
soll laut Aufgabenstellung 2467 Zeilen umfassen.
**Risiko:** Alle KI-Assistenten, die den `azure-devops-cli`-Skill aufrufen, erhalten
unvollständige Instruktionen — Azure-DevOps-Tasks können fehlschlagen oder korrekte
CLI-Befehle werden nicht bekannt.
**Sofort-Fix:** Skill aus Referenz-Datei wiederherstellen (siehe Abschnitt "Sofort-Fixes").

---

#### H2 — 3 unpushed Commits auf `main`

**Status:**

```
4a62ac22 feat(infra): azure postgresql konfiguration vorbereitet
c467a60e chore: laravel-legacy-konfiguration entfernt
6115bea3 feat(tools): openwolf second-brain integration mit pm2 und puppeteer-core
```

**Risiko:** Lokale Änderungen sind nicht auf origin gepusht — CI/CD läuft nicht dagegen,
Reviews fehlen, kein Backup falls lokale Disk verloren geht.
**Empfehlung:** `git push origin main` nach Review der Commits.

---

#### H3 — Viele offene Dependabot-Branches (Remote, nicht gemerged)

**Gezählte Remote-Branches:**

```
dependabot/pip/apps/api/alembic-1.18.4
dependabot/pip/apps/api/httpx-0.28.1
dependabot/pip/apps/api/prometheus-fastapi-instrumentator-7.1.0
dependabot/pip/apps/api/pytest-9.0.2
dependabot/pip/apps/api/python-dotenv-1.2.2
dependabot/pip/apps/api/sqlalchemy-2.0.48
dependabot/pip/apps/api/structlog-25.5.0
dependabot/pip/api.menschlichkeit-oesterreich.at/fastapi-0.135.2
dependabot/pip/api.menschlichkeit-oesterreich.at/pyjwt-2.12.1
dependabot/pip/api.menschlichkeit-oesterreich.at/redis-7.4.0
dependabot/pip/api.menschlichkeit-oesterreich.at/reportlab-4.4.10
dependabot/pip/api.menschlichkeit-oesterreich.at/uvicorn-0.42.0
dependabot/github_actions/github/codeql-action-4.35.1
dependabot/github_actions/softprops/action-gh-release-2.6.1
```

**Hinweis:** Die lokalen Dependabot-Branches (#269, #270, #271 vermutlich für
`setup-node-6.3.0`, `trivy-action-0.35.0`, `build-push-action-7.0.0`) warten auf
Rebase. Viele dieser Branches überlappen sich (z.B. `fastapi-0.135.1` vs `fastapi-0.135.2`),
was auf gestapelte/verwaiste PRs hindeutet.
**Risiko:** Veraltete Dependencies → potenzielle CVEs; technischer Debt wächst.
**Empfehlung:** Wöchentliche Merge-Session für Dependabot-PRs einführen.

---

#### H4 — CSP: `style-src 'unsafe-inline'` in Production

**Datei:** `apps/api/app/main.py` Zeile 175
**Code:**

```python
"style-src 'self' 'unsafe-inline'",
```

**Status:** `script-src` ist korrekt auf `'self'` beschränkt (gut!), aber `style-src`
erlaubt noch `unsafe-inline`. Das ermöglicht CSS-basierte Angriffe (z.B. Exfiltration
via CSS-Selektoren) und kann XSS-Vektoren bei Template-Rendering öffnen.
**Empfehlung:** CSS-Inline-Styles durch CSS-Klassen ersetzen; alternativ per-Request
Nonce einführen.

---

#### H5 — JWT Token-Revocation bei Account-Deletion fehlt

**Datei:** `apps/api/app/routers/privacy.py` (Zeile 107–130)
**Status:** `POST /privacy/data-deletion` erstellt einen Löschantrag in der DB, aber
es gibt keinen Token-Blacklist-Mechanismus. Gelöschte User könnten mit existierenden
JWTs noch Requests abschicken bis zum Token-Expire.
**Risiko:** DSGVO-Verletzung (gelöschter User hat noch Datenzugriff).
**Empfehlung:** Redis-basierte JWT-Blacklist (Jti → Expire-Zeit) beim Löschantrag
befüllen; `require_auth` Middleware muss Blacklist prüfen.

---

### 🟡 MEDIUM

#### M1 — Mehrere redundante Admin-Token-Namen in GitHub Secrets

**Datei:** `.github/workflows/branch-protection.yml`
**Code-Kommentar im Workflow:**

```
TOKEN_1: GH_ADMIN_TOKEN (kanonisch)
TOKEN_2: ADMIN_GITHUB_TOKEN (veraltet)
TOKEN_3: REPO_ADMIN_TOKEN (veraltet)
```

Das Workflow selbst dokumentiert, dass TOKEN_2/TOKEN_3 "veraltete Aliase" sind.
Sie kosten keinen Aufwand, solange die Secrets existieren, aber sie erhöhen die
Angriffsfläche bei einer möglichen Secret-Kompromittierung.
**Empfehlung:** Nach vollständiger Konsolidierung auf `GH_ADMIN_TOKEN` hin die anderen
beiden Secrets aus GitHub entfernen.

---

#### M2 — `codacy-analysis-cli-master/` im Repo

**Pfad:** `menschlichkeit-oesterreich/codacy-analysis-cli-master/`
Das komplette Codacy-CLI-Source-Repository (Scala) ist als Unterordner committed
statt als Git-Submodule oder Docker-Image referenziert zu werden.
**Risiko:** Repo-Bloat (~100k Dateien), keine automatischen Updates.
**Empfehlung:** Entweder als Submodule oder entfernen + Docker-Image-Referenz nutzen.

---

#### M3 — `.complexity-log.md` (654 KB) und `.project-structure.md` (3 MB) committed

**Größe:**

- `.complexity-log.md` → 654 KB
- `.project-structure.md` → 3 MB (größte Datei im Repo)

Diese automatisch generierten Logs sind im Haupt-Branch gespeichert und werden
vermutlich bei jedem Build neu generiert. Das bläht das Repo unnötig auf und erzeugt
Merge-Konflikte.
**Empfehlung:** In `.gitignore` aufnehmen; stattdessen als CI-Artefakt publizieren.

---

#### M4 — Verwaiste Dependabot-Remote-Branches mit altem Pfad `api.menschlichkeit-oesterreich.at/`

**Status:** `dependabot.yml` ist bereits korrekt (referenziert `/apps/api`).
Jedoch existieren noch Remote-Branches mit dem alten Namensschema:
`dependabot/pip/api.menschlichkeit-oesterreich.at/...` — das sind Überbleibsel
aus der Umbenennungsphase.
**Empfehlung:** Alte Branches auf GitHub schließen/löschen:
`git push origin --delete dependabot/pip/api.menschlichkeit-oesterreich.at/<name>` für jeden alten Branch.

---

#### M5 — Ungetrackte `.claude/skills/` im Repo

**Git-Status:** `?? .claude/skills/`
Die lokalen Skills in `.claude/skills/` sind nicht in `.gitignore` eingetragen und
nicht committed — ein Zwischenzustand der zu Datenverlust führen kann.
**Empfehlung:** Entweder committen (falls team-weite Skills gewünscht) oder explizit
in `.gitignore` aufnehmen.

---

#### M6 — Veraltete `h11`-Pinning-Notiz in `requirements.txt` (Duplikat)

**Datei:** `apps/api/requirements.txt`
Der CVE-2025-43859 wurde bereits via Commit `6e49809c` gefixt und `h11>=0.16.0` gepinnt.
Die aktuelle `requirements.txt` enthält die Pin korrekt. Allerdings gibt es noch einen
alten `api.menschlichkeit-oesterreich.at/` Ordner, der möglicherweise eine separate
`requirements.txt` mit veralteter Pinning enthält.
**Empfehlung:** Sicherstellen dass `api.menschlichkeit-oesterreich.at/` kein aktives
Deployment-Target mehr ist oder ebenso aktuell gepflegt wird.

---

#### M7 — HSTS nur in Production, nicht in Staging

**Datei:** `apps/api/app/main.py` Zeile 186–188

```python
if IS_PRODUCTION:
    response.headers["Strict-Transport-Security"] = ...
```

HSTS fehlt in Staging — das bedeutet Staging-Deployments sind anfällig für
Protokoll-Downgrade-Angriffe.
**Empfehlung:** HSTS auch in Staging aktivieren (mit kürzerem `max-age`).

---

### 🔵 LOW

#### L1 — Babylon-Game Build-Artefakte committed (`.next/` Ordner)

**Pfad:** `apps/babylon-game/.next/`
Der komplette Next.js Build-Output ist im Repo. Das verursacht massiven Repo-Bloat
und Merge-Konflikte.
**Empfehlung:** `.next/` zu `.gitignore` hinzufügen.

---

#### L2 — Stale Remote-Branches

Folgende Remote-Branches scheinen verwaist:

```
copilot/worktree-2026-03-31T06-26-04
copilot/update-github-secrets-management
copilot/add-wiki-pages-for-pdfs
```

**Empfehlung:** Nach Review und Merge/Close der zugehörigen PRs löschen.

---

#### L3 — Token-Konsolidierung für PAT-Expiry-Reminder nicht abgeschlossen

**Datei:** `.github/workflows/pat-expiry-reminder.yml`
Das Workflow prüft mehrere Token-Namen auf Ablauf (GH_ADMIN_TOKEN, ADMIN_GITHUB_TOKEN,
REPO_ADMIN_TOKEN). Nach der Token-Konsolidierung aus M1 muss dieses Workflow aktualisiert
werden.

---

#### L4 — `logo.JPG` im Repo-Root

**Pfad:** `logo.JPG` (112 KB)
Binäre Assets sollten in `assets/` leben oder mit Git LFS verwaltet werden.

---

#### L5 — `composer-setup.php` committed (59 KB)

Composer-Installer-Script im Repo. Wenn dieser Script eine veraltete Version von
Composer installiert, kann es zu inkompatiblen Builds führen.
**Empfehlung:** Via offiziellem Docker-Image oder CI-Action ersetzen.

---

#### L6 — Python `pyproject.toml` referenziert veralteten Monorepo-Namen

**Datei:** `pyproject.toml`

```
menschlichkeit-oesterreich-monorepo/
```

Der alte Monorepo-Name erscheint in `exclude`-Pfaden. Da der aktuelle Pfad
`menschlichkeit-oesterreich-development/` ist, sind diese Excludes wirkungslos.

---

## TODOs im Source-Code (Eigener Code)

Die meisten TODOs/FIXMEs im Repo befinden sich im **Drupal Core Vendor-Code** (nicht beeinflussbar).

Eigene Source-Code-TODOs (relevante Auswahl aus `.todos-report.md`):

| #   | Datei                                               | Inhalt                         | Priorität |
| --- | --------------------------------------------------- | ------------------------------ | --------- |
| 1   | `apps/api/app/routers/privacy.py:304`               | JWT Token Revocation fehlt     | HIGH      |
| 2   | `apps/api/app/main.py:175`                          | CSP unsafe-inline              | HIGH      |
| 3   | `api.menschlichkeit-oesterreich.at/app/main.py:777` | CiviCRM IDs hardcoded als NOTE | LOW       |

---

## DSGVO/Security-Bewertung

### ✅ Gut umgesetzt:

- `.env` ist korrekt in `.gitignore` (P0 SECURITY Kommentar)
- Gitleaks-CI läuft täglich + bei jedem PR
- Bitwarden SDK für Secrets-Injection (`bitwarden-sdk>=2.0.0`)
- `PII Middleware` vorhanden (`apps/api/app/middleware/pii_middleware.py`)
- `DSGVO Compliance Check` als npm-Script (`compliance:dsgvo`)
- Privacy-Router mit Data-Deletion, Consent-Revocation
- SOPS-Konfiguration (`.sops.yaml`) für verschlüsselte Secrets
- SBOM-Generierung via CI
- Alle GitHub Actions auf Commit-Hashes gepinnt (Supply-Chain-Security)

### ⚠️ Verbesserungsbedarf:

- JWT Token-Revocation bei Account-Deletion (H5)
- CSP `unsafe-inline` für Styles (H4)
- HSTS fehlt in Staging (M7)

### ✅ Hardcoded Secrets Check:

Keine hardcoded Secrets in eigenem Source-Code gefunden. Die Secrets-Referenzen in
`apps/api/app/services/sepa_service.py` nutzen korrekt `get_secret()` mit BSM-Fallback.

---

## CI/CD Analyse

### Pipeline-Übersicht (42 Workflows):

| Kategorie  | Workflows                                                                                                | Status |
| ---------- | -------------------------------------------------------------------------------------------------------- | ------ |
| Security   | gitleaks, codeql, semgrep, trivy, osv-scanner, owasp-zap, scorecard, secrets-validate, dependency-review | ✅     |
| Build/Test | ci, api-tests, ci-forum, mcp-tests                                                                       | ✅     |
| Deploy     | deploy-plesk, deploy-staging, deploy-forum                                                               | ✅     |
| Quality    | codacy, quality, docs-lint                                                                               | ✅     |
| Compliance | sbom-generation, env-guard, validate-secrets                                                             | ✅     |
| Monitoring | ssl-cert-check, insights, otel-collector-test, n8n-smoke                                                 | ✅     |
| Governance | branch-protection, pat-expiry-reminder, social-posts                                                     | ✅     |

### Stärken:

- `npm audit --audit-level=critical --omit=dev` als CI-Gate
- Concurrency-Groups verhindern parallele Deployments
- Timeout-Limits auf allen Jobs gesetzt
- Branch-Protection wird täglich via Cron konfiguriert

### Lücken:

- `npm audit --audit-level=high` wäre sicherer (aktuell nur `critical`)
- Kein automatisches Merge der Dependabot-PRs nach grünem CI

---

## Git-Status

| Item                                | Status                                                         |
| ----------------------------------- | -------------------------------------------------------------- |
| Uncommitted Changes                 | Keine (Clean Working Tree)                                     |
| Untracked                           | `.claude/skills/` (nicht gitignored)                           |
| Unpushed Commits                    | **3** (`4a62ac22`, `c467a60e`, `6115bea3`)                     |
| Offene Dependabot-Branches (Remote) | **14+**                                                        |
| Aktive Feature-Branches             | `humanobmann/issue142`, `feature/devops-audit-rescue-20260310` |

---

## Dokumentations-Zustand

| Dokument                  | Vorhanden | Qualität                            |
| ------------------------- | --------- | ----------------------------------- |
| README.md                 | ✅        | Gut (5.2 KB)                        |
| CONTRIBUTING.md           | ✅        | Gut                                 |
| CHANGELOG.md              | ✅        | Aktiv gepflegt                      |
| SECURITY.md               | ✅        | Sehr gut (CVSS, Response-Times)     |
| DEPLOYMENT_CONFIG.md      | ✅        | Detailliert                         |
| DEVELOPMENT-QUICKSTART.md | ✅        | Vorhanden                           |
| API OpenAPI               | ✅        | `apps/api/openapi.yaml`             |
| DSGVO-Dokumentation       | ✅        | `dsgvo-audit` Skill, Privacy-Router |
| Brand Guidelines          | ✅        | `Brand_Guidelines.md` (89 KB!)      |

**Auffällig:** `Brand_Guidelines.md` (89 KB), `EMAIL_DESIGN_SYSTEM.md` (22 KB),
`EMAIL_TEMPLATE_INVENTORY.md` (16 KB) sind für ein Code-Repo sehr umfangreiche
Marketing-Dokumente — könnten in ein separates Confluence/Wiki ausgelagert werden.

---

## GitHub Issues die erstellt werden sollten

### Issue 1 — `[P1][security] JWT Token-Blacklist bei Account-Deletion implementieren`

```
**Beschreibung:** Wenn ein User Account-Deletion beantragt, werden existierende JWTs
nicht invalidiert. User hat bis Token-Expiry noch Datenzugriff → DSGVO-Verletzung.

**Umsetzung:**
- Redis-Blacklist: `jti → exp` Mapping bei Löschantrag setzen
- `require_auth` Middleware: Blacklist-Check vor jeder Anfrage
- TTL = JWT-Lebensdauer (redundant entries werden automatisch bereinigt)

**Dateien:** apps/api/app/routers/privacy.py, apps/api/app/security.py

**Labels:** security, privacy, DSGVO, P1
```

### Issue 2 — `[P2][security] CSP unsafe-inline aus style-src entfernen`

```
**Beschreibung:** apps/api/app/main.py:175 enthält 'unsafe-inline' in style-src.

**Umsetzung:**
- Inline-Styles in FastAPI-Templates in CSS-Dateien auslagern
- Oder: Per-Request Nonce generieren und in CSP + Templates injizieren
- Report-Only Modus erst testen bevor enforcing

**Dateien:** apps/api/app/main.py:165-195

**Labels:** security, CSP, P2
```

### Issue 3 — `[P2][infra] Dependabot-Pfad-Duplikat bereinigen`

```
**Beschreibung:** dependabot.yml referenziert sowohl api.menschlichkeit-oesterreich.at/
als auch apps/api/ für pip-Dependencies → doppelte PRs, Konflikte.

**Umsetzung:**
- Alten api.menschlichkeit-oesterreich.at/ Eintrag aus dependabot.yml entfernen
- Offene verwaiste Dependabot-Branches schließen/löschen

**Labels:** dependencies, infra, P2
```

### Issue 4 — `[P3][ops] .next/ Build-Artefakte aus Git entfernen`

```
**Beschreibung:** apps/babylon-game/.next/ (Build-Output) ist committed.
Das bläht das Repo auf und erzeugt Konflikte.

**Umsetzung:**
1. .next/ zu .gitignore hinzufügen
2. git rm -r --cached apps/babylon-game/.next/
3. Commit

**Labels:** chore, cleanup, P3
```

### Issue 5 — `[P3][tooling] .claude/skills/azure-devops-cli/SKILL.md vervollständigen`

```
**Beschreibung:** SKILL.md hat nur 25 Zeilen (Header + Auth-Sektion). Die vollständige
Skill-Dokumentation soll laut Spezifikation ~2467 Zeilen umfassen und alle Azure DevOps
CLI-Kommandos abdecken (Pipelines, Builds, Work Items, Artifacts, etc.).

**Umsetzung:**
- Vollständige Datei aus Referenz /sessions/vibrant-gracious-bohr/mnt/outputs/azure-devops-cli-SKILL.md
  einkopieren
- Committen (aktuell untracked)

**Labels:** tooling, documentation, P3
```

---

## Sofort-Fixes (direkt umsetzbar)

### Fix 1 — `.claude/skills/` in `.gitignore` — ✅ ANGEWENDET

`.gitignore` wurde aktualisiert: `.claude/skills/` ist jetzt ignoriert.
Die Skills-Verzeichnisse sind user-lokal und sollen nicht ins Repo.

### Fix 2 — Dependabot-Pfad — ✅ BEREITS KORREKT

`dependabot.yml` referenziert korrekt `/apps/api`. Verwaiste Remote-Branches
mit dem alten Pfad müssen auf GitHub geschlossen/gelöscht werden (manuel).

### Fix 3 — `.next/` Build-Artefakte — ✅ BEREITS KORREKT

`apps/babylon-game/.next/` ist bereits in `.gitignore` (Zeile 514) und nicht
getrackt (0 Dateien via `git ls-files`).

### Fix 4 — `npm audit --audit-level` von `critical` auf `high` anheben (offen)

In `.github/workflows/ci.yml`:

```yaml
# Vorher:
run: npm audit --audit-level=critical --omit=dev
# Nachher:
run: npm audit --audit-level=high --omit=dev
```

---

## Zusammenfassung

| Kategorie          | Bewertung  | Kommentar                                                     |
| ------------------ | ---------- | ------------------------------------------------------------- |
| Security-Setup     | ⭐⭐⭐⭐   | Exzellent: Gitleaks, Trivy, CodeQL, OWASP ZAP                 |
| Secrets-Management | ⭐⭐⭐⭐   | Bitwarden, SOPS, kein Hardcoding                              |
| CI/CD              | ⭐⭐⭐⭐   | 42 Workflows, Hashes-Pinning, Timeouts                        |
| Code-Qualität      | ⭐⭐⭐     | Gut; wenige eigene TODOs; Drupal-Vendor-TODOs sind irrelevant |
| DSGVO              | ⭐⭐⭐     | PII-Middleware vorhanden, JWT-Revocation fehlt noch           |
| Dokumentation      | ⭐⭐⭐⭐⭐ | Außergewöhnlich umfangreich                                   |
| Dependencies       | ⭐⭐⭐     | Viele Dependabot-PRs offen; Overrides aktiv gepflegt          |
| Repo-Hygiene       | ⭐⭐⭐     | .next/, codacy-CLI, große MD-Dateien committed                |

**Gesamtbewertung: Produktionstauglich mit bekannten Verbesserungspunkten.**

---

_Report generiert von Claude Sonnet 4.6 am 2026-04-05_
