1. EXECUTIVE SUMMARY

Repository-Zustand ist nicht produktionsreif für einen stabilen, auditierbaren `main`-Branch. Hauptblocker sind (a) nicht ausführbare Standard-Qualitätschecks (ESLint/Vitest), (b) fehlerhafte Python-Test-Imports durch ungültige Modulpfade mit Bindestrichen/Punkten, (c) Build-Pipeline-Abbruch durch ESM/CJS-Inkompatibilität in `automation/n8n/webhook-client.js`, sowie (d) mehrere High-Severity-Abhängigkeiten laut `npm audit`. Branch-/Issue-Forensik ist eingeschränkt, da kein Git-Remote, keine lokal eingebundene Issue-Datenquelle und nur ein lokaler Branch (`work`) vorliegen. Architektur ist monorepo-ähnlich, aber ohne klare, erzwungene Domänengrenzen (Node, Python, PHP, Frontend parallel). Sicherheitskontrollen sind in Workflows vorhanden (CodeQL/Trivy/Gitleaks/SBOM), jedoch operative Stabilität wird durch fehlende Build-Reproduzierbarkeit unterlaufen. Konsolidierungsziel: zuerst Toolchain-Stabilisierung, dann Test-/Import-Reparatur, dann Dependency-Härtung, danach deterministische Merge-/Release-Schiene.

2. ARCHITEKTUR-FORENSIK

- Topologie (aus Verzeichnisstruktur):
  - Backend-Python/FastAPI: `api.menschlichkeit-oesterreich.at/app`, zusätzlich `api/fastapi`.
  - Frontend: `frontend` (Next.js/React/Tailwind-orientiert), zusätzlich `website`, `web`.
  - CRM/PHP-Stack: `crm.menschlichkeit-oesterreich.at`.
  - Automation: `automation/n8n`.
  - CI/CD + Security: `.github/workflows` (umfangreich).
- Architektur-Risiken:
  - Redundante Plattformpfade (`api` vs `api.menschlichkeit-oesterreich.at`; `frontend` vs `website` vs `web`) → erhöhte Drift-Gefahr.
  - Monorepo-Workspaces referenzieren teilweise nicht vorhandene Ziele (`servers`, `mcp-bridge`, `mcp-search`) → Build-Unsicherheit.
  - FastAPI-Initialisierung doppelt für Privacy-Router (`include_router` doppelt) → Routen-Duplikationsrisiko.
- Namensinkonsistenzen:
  - Pfade mit Domains (`api.menschlichkeit-oesterreich.at`) kollidieren mit Python-Importkonventionen.
- Konfigurations-/Environment-Abhängigkeiten:
  - App-Start hart von ENV abhängig (`CIVI_SITE_KEY`, `CIVI_API_KEY`, `JWT_SECRET`, `FRONTEND_ORIGINS` in non-dev).
  - Pipeline benötigt Node+Python+PHP-Tooling konsistent, aber lokale Ausführung zeigt Inkonsistenzen.

3. DEPENDENCY- & SECURITY-AUDIT

- Dependency-Konflikte/Instabilität:
  - `npm run lint` scheitert mit `Cannot find package '@eslint/js'` trotz deklariertem devDependency → inkonsistenter Installationszustand.
  - `npm run test:unit` scheitert (`vitest: not found`) → Workspace/Bin-Auflösung nicht robust.
- Sicherheitsbefunde (`npm audit --omit=dev --audit-level=high`):
  - High: `@modelcontextprotocol/sdk` (ReDoS, Datenleck-Risiko, DNS-Rebinding-Protection Default).
  - High: `qs` DoS.
  - High: `react-router` (CSRF/XSS/Redirect).
  - Moderate: `ajv`, `body-parser`, `vite`.
- Security-Kontrollfläche im Repo vorhanden:
  - Workflows für `codeql`, `trivy`, `gitleaks`, `sbom-*`, `owasp-zap-baseline`, `dependency-review`, `osv-scanner` vorhanden.
- Konfigurationslecks:
  - `.env.vault` im Repository vorhanden (sensitives Artefakt, auch wenn verschlüsselt) → Governance-Prüfpflicht.

4. FUNKTIONS-AUDIT (Tabelle)

| Priorität | Datei | Funktion | Kategorie | Problem | Maßnahme | Validierung |
|---|---|---|---|---|---|---|
| Critical | tests/test_auth_api.py | Modulimport (`from api.menschlichkeit-oesterreich.at...`) | Compile/Import | Python-Syntaxfehler durch ungültigen Importpfad mit `-` | Importpfad auf package-konformen Alias (z. B. `api_menschlichkeit_oesterreich_at`) umstellen und PYTHONPATH standardisieren | `python3 -m pytest -q` ohne Collection-Errors |
| Critical | tests/test_privacy_api.py | Modulimport (`from api.menschlichkeit-oesterreich.at...`) | Compile/Import | identischer Syntaxfehler | identische Umstellung wie oben | `python3 -m pytest -q` |
| High | tests/test_pii_sanitizer.py | Imports `from app.lib.pii_sanitizer` | Missing Module | `ModuleNotFoundError: No module named 'app.lib'` | Paketstruktur/Init-Dateien harmonisieren oder Test-Imports auf tatsächlichen Modulpfad korrigieren | `python3 -m pytest -q tests/test_pii_sanitizer.py` |
| High | automation/n8n/webhook-client.js | Modul-Initialisierung | Runtime | `require` in ES-Module-Kontext (`type: module`) | Datei auf `.cjs` migrieren oder ESM-Imports verwenden | `bash build-pipeline.sh` bis Install-Schritt erfolgreich |
| High | api.menschlichkeit-oesterreich.at/app/main.py | `app.include_router(privacy_router)` | Routing | Router doppelt inkludiert (einmal optional/try, einmal direkt) | eine eindeutige Router-Registrierung + Integrationscheck in Startup-Test | `pytest` API-Routentests + OpenAPI-Routenliste auf Duplikate prüfen |
| High | frontend/src/components/figma/*.tsx | `CtaSection`, `Footer`, `FeaturesGrid`, `HeaderNavigation`, `HeroSection` | Unvollständige Implementierung | explizite TODO-Platzhalter in produktivem Component-Pfad | Komponenten vollständig implementieren oder Feature-Flag/Removal bis fertig | Frontend Build + visuelle Snapshot/E2E |
| Medium | website/assets/js/auth-handler.js | Passwort-Reset-Pfad | TODO/Feature-Lücke | `TODO: Implement password reset API call` | API-Endpoint + Fehlerpfade + Token-Lifecycle ergänzen | E2E für Reset-Flow inkl. Negativfälle |
| Medium | scripts/ai-code-generator.py | Generierter Output | Stub-Erzeugung | Generator produziert `# TODO: Implement ...` | Generator nur merge-fähigen Code erzeugen lassen oder Stub-Output blockieren | Generator-Snapshot-Tests ohne TODO-Ausgabe |
| Medium | scripts/ai-code-generator-fixed.py | Generierter Output | Stub-Erzeugung | analog Stub-Erzeugung | analog | analog |
| Medium | tests/test_pii_sanitizer.py | Kommentar TODO („Spaces“) | Edge Case | bekannter unbehandelter Inputfall | zusätzliche Sanitizer-Tests für Space-/Unicode-Varianten | Pfadabdeckung betroffener Sanitizer-Funktion |

5. DEBUG- & STABILITÄTSRISIKEN

- Build-Flow-Simulation:
  - `bash build-pipeline.sh` bricht ab.
  - `npm run lint -- --max-warnings=0` bricht ab.
  - `npm run test:unit -- --run` bricht ab.
  - `python3 -m pytest -q` bricht bereits in Collection.
- Risikoklassifizierung:
  - Critical:
    - Python-Testsuite nicht lauffähig (Syntax/Import-Fehler).
  - High:
    - Build-Pipeline nicht reproduzierbar (ESM/CJS-Mismatch + Dependency-Auflösung).
    - Mehrere High-Security-Vulns in produktionsrelevanten JS-Abhängigkeiten.
  - Medium:
    - Unvollständige Frontend-Features mit TODO-Platzhaltern.
    - Heterogene Error-Handling-Strategie (try/except broad in API-Startup).
  - Low:
    - Warnungen (`.eslintignore` deprecated) erhöhen mittelfristig Wartungsaufwand.
- Observability/Resilience-Lücken:
  - Keine nachgewiesene, zentral konsolidierte Retry-/Circuit-Breaker-Strategie über Services.
  - Keine deterministisch verifizierte End-to-End-Transaktionskette (Spende/SEPA/Receipt) im aktuellen Zustand.

6. ISSUE- & BRANCH-MATRIX

| Branch | Status | Risiko | Aktion | Reihenfolge |
|---|---|---|---|---|
| work | aktiv, einziger lokaler Branch | High (Single-Branch ohne Upstream/PR-Referenzen verhindert belastbare Divergenz-Analyse) | Remote anbinden, Tracking-Branches laden, dann Divergenzmatrix erzeugen | 1 |
| (keine weiteren lokalen/remoten Branches verfügbar) | nicht auswertbar | Critical (Merge-Kandidaten unbestimmt) | Forensik-Import aus zentralem Git-Host (alle Heads/PR-Refs) | 2 |

Issue-Kategorisierung:
- Im bereitgestellten lokalen Repo ist kein maschinenlesbarer Issue-Export vorhanden.
- GitHub CLI nicht verfügbar; kein Remote gesetzt.
- Daher: vollständige Issue-Klassifizierung aktuell **nicht deterministisch durchführbar**.

7. ZIELARCHITEKTUR FÜR MAIN

- Zielbild:
  - Ein konsolidierter Monorepo-`main` mit klaren Domänen: `backend/` (FastAPI+Prisma), `frontend/` (Next.js), `automation/n8n/`, `infra/`, `security/`.
- Dependency-Modell:
  - Zentrale Lockfile-Strategie je Ökosystem (npm/pip/composer) + reproduzierbare CI-Installationen (`npm ci`, pinned Python, composer lock verify).
- Namenskonvention:
  - Python-packages ohne Sonderzeichen/Punkte in Verzeichnisnamen für importfähige Module.
- Logging-Standard:
  - JSON-structured Logging serviceübergreifend, korrelierbare Request-ID.
- Error-Handling-Standard:
  - Einheitliche Fehlerhülle (HTTP Problem Details), keine stillen broad-except ohne strukturiertes Error-Event.
- Teststrategie:
  - Gate-Reihenfolge: static checks → unit → integration → smoke; Pflichtkriterien als Merge-Blocker.
- CI/CD-Härtung:
  - Pflichtjobs: Build, Test, CodeQL, Trivy, Gitleaks, SBOM (CycloneDX+SPDX), Container Build, Staging Deploy mit Environments.

8. MASTER-TODO-LISTE (vollständig, priorisiert)

| Nr | Kategorie | Priorität | Modul | Maßnahme | Validierung | Aufwand |
|---|---|---|---|---|---|---|
| 1 | Build-Stabilität | Critical | Root Toolchain | Node-Workspace-Abhängigkeiten reproduzierbar machen (`npm ci`, Workspace-Referenzen prüfen) | `npm run lint`, `npm run test:unit` erfolgreich | M |
| 2 | Test-Fix | Critical | tests/ Python | Ungültige Python-Imports in `test_auth_api.py` und `test_privacy_api.py` korrigieren | `python3 -m pytest -q` ohne SyntaxError | S |
| 3 | Test-Fix | High | tests/ Python | `app.lib` Modulpfadproblem beheben | `pytest tests/test_pii_sanitizer.py` grün | S |
| 4 | Pipeline-Fix | High | automation/n8n | `webhook-client.js` ESM/CJS-kompatibel umbauen | `bash build-pipeline.sh` notif-Schritte ohne RuntimeError | S |
| 5 | Security | High | npm dependencies | High/Moderate Vulns remediieren (`@modelcontextprotocol/sdk`, `qs`, `react-router`, `vite`, etc.) | `npm audit --omit=dev --audit-level=high` clean | M |
| 6 | API-Konsistenz | High | FastAPI main | Doppelte Router-Registrierung entfernen | OpenAPI route diff ohne Doppelungen | S |
| 7 | Feature-Vervollständigung | Medium | frontend figma components | TODO-Komponenten implementieren oder deaktivieren | Frontend build + UI smoke | M |
| 8 | Feature-Vervollständigung | Medium | website auth-handler | Passwort-Reset vollständig implementieren | E2E Reset-Flow | M |
| 9 | Governance | Medium | Repo Secrets/Config | `.env.vault` und Secrets-Policy auditen; Zugriff/Rotation dokumentieren | Security-Review-Checklist bestanden | S |
| 10 | Branch-Forensik | High | Git-Metadaten | Remote + vollständige Branch-/PR-Historie importieren | Branch-Divergenzreport generiert | S |
| 11 | CI-Härtung | High | .github/workflows | Konsolidierten Pflicht-Workflow als required checks markieren | Merge ohne Pflichtchecks blockiert | M |
| 12 | Architektur-Konsolidierung | Medium | Monorepo-Struktur | `api`, `api.*`, `web`, `website` Verantwortlichkeiten bereinigen | ADR + Pfadkonsistenz + Buildmatrix | L |
| 13 | Observability | Medium | backend/frontend | Standardisierte Audit-Trails + Correlation-IDs vollständig erzwingen | Log-schema tests + trace sampling | M |
| 14 | Reliability | Medium | API Integrationen | Retry/Backoff/Circuit-Breaker für externe Calls formalisieren | Chaos/smoke fault-injection tests | M |

9. INTEGRATIONSFAHRPLAN (nummerierte Schritte)

1. Git-Metadaten vervollständigen (Remote, alle Branches/PR-Refs, Issue-Export).
2. Toolchain-Baseline fixieren (Node/Python/PHP Version-Pinning, lockfile integrity checks).
3. Test-Collection-Blocker in Python entfernen.
4. JS-Lint/Test-Blocker (fehlende Binaries/Packages) beheben.
5. Build-Pipeline ESM/CJS-Fehler in `automation/n8n` korrigieren.
6. Sicherheitsupdates der High-Vulns durchführen, Regressionstest.
7. API-Routing/Startup-Bereinigung (keine Doppel-Registrierung, saubere Fehlerstrategie).
8. Unvollständige Feature-Pfade (Frontend/Website TODOs) schließen.
9. CI Required Checks deterministisch definieren und aktivieren.
10. Staging-End-to-End-Lauf (Build/Test/Security/SBOM/Deploy) als Release-Gate etablieren.
11. Danach erst Konsolidierungs-Merge in `main` mit signed tag `v2.0.0`.

10. RISIKOMATRIX

| Risiko | Wahrscheinlichkeit | Impact | Gegenmaßnahme |
|---|---|---|---|
| Python-Tests bleiben unstartbar | Hoch | Kritisch | Importpfad-Normalisierung + CI-Collection-Gate |
| Build bricht durch ESM/CJS-Konflikte | Hoch | Hoch | Modulformat standardisieren, Pipeline smoke in PR |
| Bekannte High-Vulns bleiben offen | Hoch | Hoch | zeitnahe Dependency-Upgrades + audit gate |
| Branch-/Issue-Divergenzen unbekannt | Mittel | Hoch | vollständige Git/Issue-Synchronisierung vor Merge |
| Architekturdrift zwischen ähnlichen Modulen | Hoch | Mittel | Zielstruktur + ADR + Ownership je Domäne |
| Security-Scans laufen, aber Build instabil | Hoch | Mittel | zuerst Build-Reproduzierbarkeit, dann Security-Gates erzwingen |

11. ABSCHLUSSBEWERTUNG

VALIDATION: INTERNAL_CHECK_PASSED
VERSION: v2.0.0
MODE: COMPLEX

Freigabe für produktionssicheren `main`-Konsolidierungsmerge aktuell **nicht** erteilt. Kritische Build-/Test-Blocker und offene High-Sicherheitsrisiken müssen vor Branch-Konsolidierung behoben werden. Nach Umsetzung der Master-TODO-Punkte 1–6 ist ein zweiter, deterministischer Go/No-Go-Audit erforderlich.
