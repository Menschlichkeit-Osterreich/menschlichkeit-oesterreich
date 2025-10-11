---
title: "Testgeneration"
description: "Ziel"
lastUpdated: 2025-10-10
status: ACTIVE
category: testing
tags: ['testing']
version: "1.0.0"
language: de-AT
audience: ['QA Team', 'Developers']
---

---
description: 'Erstellt eine projektspezifische, automatisierte Testsuite für Frontend, API, Gateway, Skripte und PHP-Komponenten'
mode: 'agent'
tools: ['githubRepo', 'codebase']
---

# Ziel
Analysieren Sie den Quellcode des Projekts (#codebase) und generieren Sie eine vollständige, mehrschichtige Testsuite. Abgedeckt werden sollen alle kritischen Pfade (Frontend, FastAPI-Backend, Gateway, Automationsskripte, PHP/Drupal). Jede relevante Klasse, Funktion oder Route erhält Unit-, Integrations- bzw. E2E-Tests. Nutzen Sie die bestehenden Toolchains und erwarten Sie, fehlende Dev-Abhängigkeiten (z. B. `@testing-library/react`) in den jeweiligen `package.json`/`requirements.txt`/`composer.json` zu ergänzen.

## Projektüberblick
- **Frontend (React + Vite, TypeScript):** `frontend/src/**`, gemeinsame Vitest-Konfiguration (`vitest.config.js`, `tests/setup.js`).
- **API (FastAPI + httpx, SQLAlchemy):** Python-Module unter `api.menschlichkeit-oesterreich.at/app/**`.
- **Gateway & Persistenz:** `api.menschlichkeit-oesterreich.at/app/gateway.py` inkl. SQLite/SQLAlchemy.
- **Automation & n8n:** Python- und JS-Utility-Skripte unter `automation/**`.
- **Playwright E2E:** Spezifikationen in `tests/e2e/**`.
- **PHP/Drupal:** Composer-Setup (`composer.json`) + Drupal-Custom-Module unter `crm.menschlichkeit-oesterreich.at/httpdocs/web/modules/custom/**`.

## Test-Frameworks & Befehle
| Domäne | Relevante Pfade | Framework & Setup | Testbefehl |
| --- | --- | --- | --- |
| React/Vite | `frontend/src/**`, `tests/setup.js`, `vitest.config.js` | Vitest + (falls nötig) React Testing Library | `npm run test:unit` |
| FastAPI | `api.menschlichkeit-oesterreich.at/app/**`, `tests/test_*.py` | pytest + httpx AsyncClient, pytest-mock/monkeypatch | `pytest tests/` |
| API Gateway | `api.menschlichkeit-oesterreich.at/app/gateway.py` | pytest (DB Fixtures mit SQLite in-memory) | `pytest tests/` |
| Playwright | `tests/e2e/**`, `playwright.config.js` | Playwright Test (Chromium focus) | `npm run test:e2e` |
| PHP/Drupal | `crm.menschlichkeit-oesterreich.at/**`, `composer.json` | PHPUnit + Drupal Kernel Tests | `composer test` |
| Skripte | `automation/**/*.py`, `scripts/**/*.mjs` | pytest bzw. Vitest/Jest (je nach Sprache) | passend zum Framework |

## Arbeitsauftrag
1. **Analyse:** Erstellen Sie eine Abdeckungsmatrix (Unit, Integration, E2E) für alle Module. Identifizieren Sie ungetestete/risikobehaftete Flächen.
2. **Testdesign:** Definieren Sie konkrete Testfälle (Happy Path, Edge Cases, Fehlerpfade) inkl. Fixtures/Mocks/Stubs.
3. **Implementierung:** Schreiben Sie die Tests in logisch gruppierten Dateien und nutzen Sie vorhandene Helper (`tests/setup.js`, bestehende pytest-Fixtures, etc.). Halten Sie sich an Naming-Konventionen (`*.test.tsx`, `test_*.py`, `*Test.php`).
4. **Konfiguration:** Ergänzen/aktualisieren Sie Testkonfigurationen (Vitest include-Globs, `pytest.ini` falls nötig, Drupal `phpunit.xml.dist`). Dokumentieren Sie zusätzliche Abhängigkeiten.
5. **Ausführung & Nachweis:** Führen Sie die Tests (oder Dry-Run-Erklärung, falls nicht möglich) mit den angegebenen Befehlen aus und liefern Sie protokollierte Ergebnisse bzw. Anweisungen.

## Fokusbereiche & Modulhinweise

### Frontend (React/Vite)
- `#file:frontend/src/services/http.ts` – Testen Sie Timeout/Abort, Header-Zusammenbau, Fehlerpfade (`HttpError`), 401-Handler (`setUnauthorizedHandler`).
- `#file:frontend/src/services/api/auth.ts` – Mocken Sie `apiClient`, verifizieren Sie Token-Rotation, Fehlerbehandlung bei Login/Refresh.
- `#file:frontend/src/auth/AuthContext.tsx` – Render-Tests mit Testing Library: Login/Logout, Session-Rehydration, 401-Redirect.
- `#file:frontend/src/hooks/useApi.ts` – Hook-Tests (z. B. mit `renderHook`) für `execute`, Fehlerzustände und `useMutation`.
- `#file:frontend/src/pages/Login.tsx` & `#file:frontend/src/pages/MemberArea.tsx` – UI-Interaktionen, Redirect-Logik, Guarded Routes.
- Ergänzen Sie ggf. `frontend/package.json` um `test`-Scripts und fehlende DevDependencies (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`).
- Platzieren Sie neue Vitest-Dateien unter `frontend/tests/unit/**/*.test.ts(x)` oder `tests/unit/**/*.test.ts(x)` (Vitest-Glob deckt `/unit/`-Ordner ab).

### Backend (FastAPI Privacy/API)
- `#file:api.menschlichkeit-oesterreich.at/app/main.py` – Tests für CORS-Konfiguration (`_split_csv`, `_parse_bool`, `_require_env`), `/auth/*`, `/user/*`, `/privacy/*` Routen mit JWT-Handling.
- `#file:api.menschlichkeit-oesterreich.at/app/shared.py` – Unit-Tests für `verify_jwt_token` (gültig, falsches Schema, abgelaufene Tokens) und `require_admin`.
- `#file:api.menschlichkeit-oesterreich.at/app/routes/privacy.py` – Async-Tests für `_check_retention_requirements`, `_civicrm_*` Helper (Mock httpx Client), Endpunkte `/privacy/data-deletion`, Admin-Flows.
- Nutzen Sie `pytest` + `pytest-asyncio` (falls noch nicht vorhanden, in `requirements.txt` ergänzen). Verwenden Sie `monkeypatch` für externe Dienste (CiviCRM, n8n) und Fresh DB-State.

### API Gateway & Games Persistenz
- `#file:api.menschlichkeit-oesterreich.at/app/gateway.py` – Tests für `persist_game_score`, `fetch_user_scores`, `fetch_leaderboard` mit In-Memory-SQLite, sowie Proxy-Routen (`proxy_request`, `/health`).
- Validieren Sie Fehlerpfade (z. B. SQLAlchemy-Exceptions, Timeout in `proxy_request`) und Response-Schemata (`create_response`).

### Automation & Utilities
- `#file:automation/n8n/smoke-test.py` – Unit-Tests für `post_json`, `compact_json`, Signatur-Handling (HMAC). Nutzen Sie `urllib.request` Mocks.
- Prüfen Sie weitere Skripte (`scripts/generate-quality-report.js`, `automation/n8n/webhook-client.js`) und decken Sie zentrale Logik mit Tests ab (z. B. Snapshot/Golden File Tests).

### PHP / Drupal / Composer
- `#file:composer.json` + Custom-Module unter `crm.menschlichkeit-oesterreich.at/httpdocs/web/modules/custom/**`.
- Ergänzen Sie PHPUnit-Tests (z. B. Kernel- oder Functional-Tests) für Custom-Module, inkl. Fixtures (Mock-Datenbank, Services). Legen Sie Tests unter `crm.menschlichkeit-oesterreich.at/tests/` an und aktualisieren Sie `composer.json` bei neuen Dev-Abhängigkeiten.

### E2E / Akzeptanz
- Ergänzen/aktualisieren Sie Playwright-Spezifikationen (`tests/e2e/*.spec.ts`). Fokus: Login-Flow (inkl. 401-Redirect), Privacy-Einstellungen, n8n-Webhooks (Smoke).
- Nutzen Sie vorhandene `playwright.config.js`. Dokumentieren Sie Testdaten & benötigte Seeds.

## Qualitätsanforderungen
- Tests müssen deterministisch, isoliert und ohne externe Side-Effects laufen (Mock/Fixture statt echter HTTP-Calls).
- Coverage-Ziele: Backend ≥ 80 %, Frontend ≥ 70 % (Orientierung TODO.md Qualitätsziele). Berichten Sie Ist-Werte oder begründete Abweichungen.
- Linter/Formatter respektieren (`npm run lint`, `ruff`/`black` falls verwendet, `phpcs`).
- Dokumentieren Sie neue Fixtures, Helfer oder Testinfra (z. B. `tests/conftest.py`, `frontend/tests/utils/renderWithProviders.tsx`).

## Ausführung & Ergebnisdokumentation
- Geben Sie für jede Code-Sektion an: Testdatei(en), abgedeckte Funktionen, verwendete Mocks/Fixtures.
- Falls Tests nicht ausgeführt werden können, liefern Sie präzise Anweisungen (inkl. erwarteter Output). Idealerweise Testlauf-Protokoll oder `vitest --run`/`pytest -q` Output zusammenfassen.
- Referenzieren Sie relevante Dateien via `#file:` und liefern Sie Testcode ausschließlich in Markdown-Codeblöcken (` ```ts ``, ```python```, ```php``` etc.).

## Erwartete Ausgabe
- Strukturierte Auflistung der neuen/aktualisierten Testdateien.
- Testcode in Markdown-Codeblöcken, nach Sprache gruppiert.
- Hinweise zu notwendigen Konfig-/Dependency-Updates.
- Kurze Checkliste, wie die Tests lokal ausgeführt werden (`npm run test:unit`, `pytest`, `composer test`, `npm run test:e2e`).
