# A) Architektur
## A1 Systemzweck
Das Repository implementiert eine Multi-Service-Plattform für die NGO „Menschlichkeit Österreich“ mit Website-, Frontend-, API-, CRM-, Automatisierungs- und Gaming-Komponenten. Der deklarierte Zweck ist die digitale Unterstützung von demokratischer Teilhabe, Bildung und Community-Engagement, inklusive Mitgliederverwaltung und Datenintegration zwischen Diensten. Die Plattform ist als Monorepo organisiert und umfasst sowohl Laufzeitcode als auch Betriebs-, Compliance- und CI/CD-Artefakte.

## A2 Architekturstil & Topologie
- **Architekturstil (abgeleitet):** Monorepo mit mehreren fachlich getrennten Laufzeitdiensten.
- **Topologie (abgeleitet):** Client-Server-Struktur mit separaten Frontend- und Backend-Komponenten sowie angebundener Automatisierung.
- **Laufzeit-Komponenten im Repository:**
  - `frontend/`: React/Vite SPA.
  - `api.menschlichkeit-oesterreich.at/app/`: FastAPI-Service mit JWT-geschützten Endpunkten, CiviCRM-Integration und Privacy-Routen.
  - `api/fastapi/app/`: separater FastAPI-Service für KPI-Endpunkte (Board/Treasurer).
  - `crm.menschlichkeit-oesterreich.at/`: Drupal/CiviCRM-Struktur.
  - `automation/n8n/`: n8n-basierte Workflow-Automatisierung inkl. Docker-Compose.
  - `web/` und `website/`: statische bzw. webseitige Inhalte.
  - `.github/workflows/`: CI/CD- und Security-Pipelines.

## A3 Repository-Struktur (Tree + Verantwortlichkeiten)
```text
menschlichkeit-oesterreich-development/
├── api.menschlichkeit-oesterreich.at/
│   ├── app/
│   │   ├── main.py
│   │   ├── shared.py
│   │   ├── middleware/
│   │   ├── routers/
│   │   └── routes/
│   ├── openapi.yaml
│   └── .env.example
├── api/
│   ├── fastapi/app/
│   │   ├── main.py
│   │   ├── db.py
│   │   └── routers/metrics.py
│   ├── models.py
│   ├── schemas.py
│   ├── crud.py
│   └── routers/members.py
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   └── package.json
├── automation/
│   ├── n8n/
│   │   ├── docker-compose.yml
│   │   ├── workflows/
│   │   └── .env.example
│   └── privacy/
├── crm.menschlichkeit-oesterreich.at/
├── web/
├── website/
├── docs/
├── .github/workflows/
├── docker-compose.yml
├── schema.prisma
└── package.json
```

**Verantwortlichkeiten pro Hauptbereich:**
- `api.menschlichkeit-oesterreich.at/`: produktionsnaher API-Service für Auth, Kontakte, Mitgliedschaften, Zahlungen, Queue und Privacy-Funktionen.
- `api/`: zusätzlicher FastAPI-/SQLAlchemy- bzw. asyncpg-basierter API-Teil für Mitglieder- und KPI-Datenzugriff.
- `frontend/`: Browser-Client mit Routen, geschützten Bereichen und API-Service-Layern.
- `automation/`: n8n-Workflows, Integrationsskripte und Container-Orchestrierung für Automationsaufgaben.
- `crm.menschlichkeit-oesterreich.at/`: CRM-Subsystem (Drupal/CiviCRM-Dateistruktur).
- `.github/workflows/`: Build-, Test-, Security-, Analyse- und Deploy-Automation.

## A4 Schichten & Grenzen
**Erkennbare Schichten:**
- **Presentation/UI:** `frontend/src/pages`, `frontend/src/components`, `frontend/src/layouts`.
- **API/Transport:** FastAPI-Handler in `api.menschlichkeit-oesterreich.at/app/main.py`, `api.menschlichkeit-oesterreich.at/app/routes/privacy.py`, `api.menschlichkeit-oesterreich.at/app/routers/metrics.py`, `api/fastapi/app/main.py`, `api/fastapi/app/routers/metrics.py`, `api/routers/members.py`.
- **Application/Service-Logik:** Hilfsfunktionen und orchestrierende Funktionsblöcke in den API-Modulen (z. B. CiviCRM-Call-Wrapper, Queue-Operationen, KPI-Berechnungen).
- **Domain/Data:**
  - Prisma-Datenmodell in `schema.prisma`.
  - SQLAlchemy-Modelle in `api/models.py`.
- **Infrastructure/Integration:**
  - Datenbankzugriff über `api/fastapi/app/db.py` (asyncpg) und `api/database.py`/SQLAlchemy.
  - Externe Integrationen mit CiviCRM/N8N in `api.menschlichkeit-oesterreich.at/app/main.py` und `api.menschlichkeit-oesterreich.at/app/routes/privacy.py`.
  - Container-Orchestrierung in `docker-compose.yml` und `automation/n8n/docker-compose.yml`.

**Grenzen/Subsysteme (im Code klar getrennt):**
- Frontend-Subsystem (`frontend/`).
- API-Subsystem A (`api.menschlichkeit-oesterreich.at/`).
- API-Subsystem B (`api/fastapi` + `api/routers` + `api/models`).
- CRM-Subsystem (`crm.menschlichkeit-oesterreich.at/`).
- Automation-Subsystem (`automation/n8n/`).

## A5 Abhängigkeiten (intern/extern)
### Interne Abhängigkeiten
- `frontend/src/services/api/*` konsumiert HTTP-Endpunkte des API-Backends.
- `api.menschlichkeit-oesterreich.at/app/main.py` bindet Router aus `app.routers.metrics` und `app.routes.privacy` ein sowie Middleware aus `app.middleware.security`.
- `api.menschlichkeit-oesterreich.at/app/routes/privacy.py` nutzt `app.shared` für JWT-Validierung/Rollenprüfung und ruft CiviCRM-/n8n-nahe Integrationspunkte auf.
- `api/fastapi/app/main.py` bindet `api/fastapi/app/routers/metrics.py` ein; dieses nutzt `api/fastapi/app/db.py`.
- `api/routers/members.py` verwendet `api/crud.py`, `api/schemas.py`, `api/models.py` und DB-Session aus `api/database.py`.

### Externe Abhängigkeiten (Top-Level, deklarativ)
- **Python/FastAPI-Stack:** `fastapi`, `uvicorn`, `httpx`, `pydantic[email]`, `PyJWT`, `redis`, `reportlab`, `asyncpg`, `python-dotenv`.
- **Frontend/Node-Stack:** `react`, `react-dom`, `react-router-dom`, `vite`, `tailwindcss`, `recharts`, Stripe/PayPal SDKs.
- **Datenzugriff:** Prisma (`prisma`, `@prisma/client`) mit PostgreSQL-Datasource in `schema.prisma`.
- **Automation/Container:** `n8nio/n8n`, `postgres`, `redis` über Docker-Compose-Dateien.
- **CI/Security-Ökosystem:** GitHub Actions mit u. a. CodeQL, Trivy, Snyk, Codacy (Workflow-Definitionen in `.github/workflows/`).

## A6 Laufzeit- und Integrationsfluss
- **Startpunkte (Entrypoints):**
  - API A: FastAPI-Instanz in `api.menschlichkeit-oesterreich.at/app/main.py` (Docker-CMD startet `uvicorn app.main:app`).
  - API B: FastAPI-Instanz in `api/fastapi/app/main.py`.
  - Frontend: `frontend/src/main.tsx` → `App.tsx`.
  - n8n: Containerstart über `automation/n8n/docker-compose.yml`.
- **Request-Flow (typisch):**
  1. Frontend-Route in `App.tsx`.
  2. API-Aufruf über `frontend/src/services/api/client.ts` und spezialisierte Service-Module.
  3. FastAPI-Endpunkt validiert Input (Pydantic), prüft JWT (`verify_jwt_token`) und verarbeitet Business-Logik.
  4. Persistenz/Integration via CiviCRM-HTTP, PostgreSQL (asyncpg/ORM) oder In-Memory-Queue/Stores.
  5. API liefert standardisierte Antwortobjekte (`ApiResponse`) oder domänenspezifische JSON-Strukturen zurück.
- **Persistenz:**
  - PostgreSQL im Root-Compose (`postgres`), zusätzlich dedizierte n8n-PostgreSQL-Instanz in `automation/n8n/docker-compose.yml`.
  - Redis im Root-Compose und in der n8n-Umgebung.
  - Prisma-Schema definiert relationale Modelle für Gaming/CRM-nahe Daten.
- **Externe APIs/Integrationen:**
  - CiviCRM API-Aufrufe in `api.menschlichkeit-oesterreich.at/app/main.py` und `app/routes/privacy.py`.
  - n8n-Webhooks/Automation laut `automation/README.md` und n8n-Compose.

# B) Funktionen
## B1 Entrypoints & öffentliche Schnittstellen (Tabelle)
| Interface | Pfad | Zweck | Input | Output | Side-Effects |
|---|---|---|---|---|---|
| GET `/health` | `api.menschlichkeit-oesterreich.at/app/main.py` | API-Liveness-Prüfung | Keine | Health-Status | Keine |
| POST `/auth/login` | `api.menschlichkeit-oesterreich.at/app/main.py` | Benutzeranmeldung/JWT-Ausgabe | `LoginRequest` (Email/Passwort) | `ApiResponse` mit Token-Daten | Auth-Logging, Token-Erzeugung |
| POST `/auth/register` | `api.menschlichkeit-oesterreich.at/app/main.py` | Registrierung eines Kontakts/Nutzers | `RegisterRequest` | `ApiResponse` | CiviCRM-/Datenanlage (abhängig von Implementierungspfad) |
| POST `/auth/refresh` | `api.menschlichkeit-oesterreich.at/app/main.py` | Erneuerung Access-Token | `RefreshRequest` | `ApiResponse` | Neue JWT-Ausstellung |
| GET `/contacts/search` | `api.menschlichkeit-oesterreich.at/app/main.py` | Kontakt-/Mitgliedersuche | Query-Parameter (z. B. Suchtext/Pagination) | `ApiResponse` | Externe CRM-Abfrage |
| PUT `/contacts/{contact_id}` | `api.menschlichkeit-oesterreich.at/app/main.py` | Kontaktaktualisierung | Pfad-ID + `ContactUpdate` | `ApiResponse` | CRM-Update |
| POST `/memberships/create` | `api.menschlichkeit-oesterreich.at/app/main.py` | Mitgliedschaft anlegen | `MembershipCreate` | `ApiResponse` | CRM-Write |
| POST `/queue/push` | `api.menschlichkeit-oesterreich.at/app/main.py` | Queue-Eintrag erzeugen | `QueuePushRequest` | `ApiResponse` | In-Memory-Queue-Änderung |
| POST `/queue/pop` | `api.menschlichkeit-oesterreich.at/app/main.py` | Queue-Element abrufen | Optionaler Body | `ApiResponse` mit Item | Queue-Zustandsänderung |
| POST `/payments/stripe/intent` | `api.menschlichkeit-oesterreich.at/app/main.py` | Stripe-Zahlungsinitialisierung | `PaymentInitRequest` | `ApiResponse` | Externer Payment-Provider-Call |
| POST `/payments/paypal/order` | `api.menschlichkeit-oesterreich.at/app/main.py` | PayPal-Order erstellen | `PaymentInitRequest` | `ApiResponse` | Externer Payment-Provider-Call |
| POST `/receipts/trigger` | `api.menschlichkeit-oesterreich.at/app/main.py` | Quittungstrigger nach Zahlung | `ReceiptTriggerRequest` | `ApiResponse` | E-Mail-/Dokument-Prozess |
| GET `/metrics/members` | `api.menschlichkeit-oesterreich.at/app/routers/metrics.py` | Aggregierte Mitglieder-KPIs | JWT (Header) | `ApiResponse` | KPI-Berechnung (derzeit Mock-Daten) |
| GET `/metrics/finance` | `api.menschlichkeit-oesterreich.at/app/routers/metrics.py` | Aggregierte Finanz-KPIs | JWT (Header) | `ApiResponse` | KPI-Berechnung (Mock) |
| GET `/metrics/activity` | `api.menschlichkeit-oesterreich.at/app/routers/metrics.py` | Aktivitäts-KPIs | JWT + Query `limit` | `ApiResponse` | KPI-Berechnung (Mock) |
| POST `/privacy/data-deletion` | `api.menschlichkeit-oesterreich.at/app/routes/privacy.py` | DSGVO-Löschantrag erfassen | `DataDeletionRequest` + JWT | `ApiResponse` | In-Memory-Requestpersistenz, Retention-Prüfung |
| POST `/privacy/data-deletion/{request_id}/process` | `api.menschlichkeit-oesterreich.at/app/routes/privacy.py` | Löschantrag freigeben/ablehnen | Pfad-ID + `ProcessDeletionRequest` + Admin-JWT | `ApiResponse` | Prozessstatusänderung, Lösch-Orchestrierung |
| GET `/healthz` | `api/fastapi/app/main.py` | Healthcheck API B | Keine | `{status: ok}` | Keine |
| GET `/api/kpis/overview` | `api/fastapi/app/routers/metrics.py` | Dashboard-Übersicht | Optional `since` | KPI-JSON | SQL-Reads auf `members/payments/expenses` |
| GET `/api/members/timeseries` | `api/fastapi/app/routers/metrics.py` | Zeitreihen zu Mitgliederbewegungen | Query `granularity`, `months` | Array von Buckets | SQL-Reads |
| GET `/members/` | `api/routers/members.py` | Mitgliederliste (Legacy/API-Modul) | Query `skip`, `limit` | Liste `schemas.Member` | SQLAlchemy DB-Read |
| POST `/members/` | `api/routers/members.py` | Mitglied anlegen | `schemas.MemberCreate` | `schemas.Member` | SQLAlchemy DB-Write |

## B2 Zentrale Module/Services (je Modul: Steckbrief + Bullet-Liste zentraler Funktionen)
### 1) `api.menschlichkeit-oesterreich.at/app/main.py`
**Zweck/Verantwortlichkeit:** Zentrale API-Orchestrierung für Authentifizierung, Kontakt-/Mitgliedschaftsverwaltung, Queueing, Payments, Receipts, CiviCRM-Gateway und Middleware-Integration.

**Zentrale Funktionen/Elemente:**
- `_require_env`, `_split_csv`, `_parse_bool`, `_parse_int` für ENV- und CORS-Konfiguration.
- FastAPI-App-Initialisierung inklusive CORS, Security-Middleware und Router-Mounts.
- Auth-Endpunkte (`/auth/login`, `/auth/register`, `/auth/refresh`).
- Kontakt-/Mitgliedschafts-Endpunkte (`/contacts/*`, `/memberships/*`).
- Queue-Endpunkte (`/queue/*`) inkl. DLQ-Operationen.
- Zahlungs-/Receipt-Endpunkte (`/payments/*`, `/receipts/*`, `/contributions/*`, `/sepa/*`).

**Verwendete/erzeugte Datenobjekte:**
`ContactCreate`, `MembershipCreate`, `LoginRequest`, `RegisterRequest`, `RefreshRequest`, `ContactUpdate`, `MembershipUpdate`, `SepaMandateCreate`, `PaymentInitRequest`, `PayPalCaptureRequest`, `ReceiptTriggerRequest`, `QueuePushRequest`, `QueueItem`, `ApiResponse`.

### 2) `api.menschlichkeit-oesterreich.at/app/routes/privacy.py`
**Zweck/Verantwortlichkeit:** DSGVO-Löschprozess (Art. 17) mit Retention-Prüfungen, Admin-Freigabeprozess und systemübergreifender Lösch-/Anonymisierungsorchestrierung.

**Zentrale Funktionen/Elemente:**
- Modelle: `DataDeletionRequest`, `DeletionStatus`, `ProcessDeletionRequest`.
- `civicrm_api_call` als Integrationsfunktion für CiviCRM APIv4.
- Retention-Checks: `_check_retention_requirements`, `_civicrm_get_recent_donations`, `_civicrm_get_active_sepa_mandates`.
- Lösch-Orchestrierung: `_execute_deletion`.
- Endpunkte: `POST /privacy/data-deletion`, `GET /privacy/data-deletion`, `POST /privacy/data-deletion/{request_id}/process`, `GET /privacy/data-deletion/admin/all`, `GET /privacy/health`.

**Verwendete/erzeugte Datenobjekte:**
`DataDeletionRequest`, `DeletionStatus`, `ProcessDeletionRequest`, `ApiResponse`, JWT-Claims-Dicts.

### 3) `api.menschlichkeit-oesterreich.at/app/routers/metrics.py`
**Zweck/Verantwortlichkeit:** Bereitstellung aggregierter Dashboard-Kennzahlen für Mitglieder, Finanzen und Aktivität.

**Zentrale Funktionen/Elemente:**
- `_fetch_civicrm_member_stats`, `_fetch_civicrm_finance_stats`, `_fetch_civicrm_activity_stats` (Mock-basierte Datenbeschaffung).
- Endpunkte: `get_members_metrics`, `get_finance_metrics`, `get_activity_metrics`.

**Verwendete/erzeugte Datenobjekte:**
`ApiResponse`, JWT-Claims, KPI-Dictionaries.

### 4) `api/fastapi/app/routers/metrics.py`
**Zweck/Verantwortlichkeit:** SQL-basierte KPI-Abfragen für Vorstand/Kassier-Dashboard aus PostgreSQL.

**Zentrale Funktionen/Elemente:**
- `kpis_overview`, `members_timeseries`, `donations_summary`, `income_vs_expense`, `project_burn`.
- Hilfsfunktion `first_day_of_year`.
- Nutzung von `fetch`, `fetchval` aus `db.py`.

**Verwendete/erzeugte Datenobjekte:**
JSON-KPI-Objekte, Zeitreihenlisten, Finanzaggregationen.

### 5) `frontend/src/App.tsx` + `frontend/src/services/api/*`
**Zweck/Verantwortlichkeit:** SPA-Routing, Zugriffsschutz und HTTP-Kommunikation zum Backend.

**Zentrale Funktionen/Elemente:**
- Routing mit öffentlichen und geschützten Bereichen (`/`, `/mitglied-werden`, `/spenden`, `/admin/*`, `/account/privacy`).
- `ProtectedRoute` für geschützte Ansichten.
- `ApiClient` (`client.ts`) mit Token-Handling, Request-Methoden, Fehlerabbildung.
- Service-Module (`auth.ts`, `privacy.ts`, `sepa.ts`, `payments.ts`, `receipts.ts`) als fachliche API-Fassaden.

**Verwendete/erzeugte Datenobjekte:**
`ApiResponse<T>`, `ApiError`, User-/Auth-/Privacy-/SEPA-DTOs.

### 6) `schema.prisma` + `api/models.py`
**Zweck/Verantwortlichkeit:** Persistenzmodellierung in zwei Datenmodellschichten (Prisma und SQLAlchemy).

**Zentrale Funktionen/Elemente:**
- Prisma-Modelle: `User`, `Achievement`, `UserAchievement`, `GameSession`, `GameProgress`, `Contact`, `Event`.
- SQLAlchemy-Modelle: `Member`, `Payment`, `Expense`, `Project`.

**Verwendete/erzeugte Datenobjekte:**
Relationale Entitäten für Mitglieder-/Finanz-/Gaming-Domänen.

## B3 Kern-Use-Cases (nummeriert, end-to-end)
1. **Login und Session-Aufbau**
   - Trigger: Frontend sendet `POST /auth/login`.
   - Validierung: Pydantic `LoginRequest`, Header-/Body-Prüfung.
   - Business-Logik: Authentifizierung und Token-Erstellung.
   - Persistenz/Integration: Nicht eindeutig im Repository ablesbar, aber JWT-Ausgabe ist implementiert.
   - Output: `ApiResponse` mit Token-Daten.
   - Side-Effects: Token im Frontend-Storage via `apiClient.setToken`/`localStorage`.

2. **Mitgliedersuche und -pflege (Admin-Bereich)**
   - Trigger: UI `/admin/members` ruft Suche/Update-Endpunkte auf.
   - Validierung: JWT (`verify_jwt_token`) + Pydantic-Modelle (`ContactUpdate`).
   - Business-Logik: Kontaktabfrage/Änderung.
   - Persistenz/Integration: CiviCRM-Aufrufe über API-Integrationsfunktionen.
   - Output: `ApiResponse` mit Kontakt-/Mitgliedsdaten.
   - Side-Effects: Externe CRM-Datenänderung.

3. **Mitgliedschaft anlegen/aktualisieren**
   - Trigger: API-Calls auf `/memberships/create` bzw. `/memberships/{id}`.
   - Validierung: JWT + `MembershipCreate`/`MembershipUpdate`.
   - Business-Logik: Zuordnung von Kontakten zu Membership-Daten.
   - Persistenz/Integration: CiviCRM-Write.
   - Output: `ApiResponse`.
   - Side-Effects: Mitgliedschaftsstatus im CRM.

4. **Queue-Verarbeitung für asynchrone Jobs**
   - Trigger: `POST /queue/push`.
   - Validierung: `QueuePushRequest`.
   - Business-Logik: Enqueue/Pop/Ack/Fail/DLQ-Steuerung.
   - Persistenz: In-Memory-Queue-Strukturen in `main.py`.
   - Output: `ApiResponse` (QueueItem/Statistik).
   - Side-Effects: Queue-Zustandsänderung, optionale Alerts/E-Mail-Endpunkte.

5. **Zahlungsinitialisierung (Stripe/PayPal)**
   - Trigger: Frontend sendet Payment-Request.
   - Validierung: `PaymentInitRequest` oder `PayPalCaptureRequest`.
   - Business-Logik: Erstellen von Zahlungsobjekten/Orders.
   - Persistenz/Integration: Aufruf externer Payment-Provider.
   - Output: `ApiResponse` mit Zahlungsreferenzen.
   - Side-Effects: Externe Payment-Transaktion.

6. **Quittungserstellung/-versand**
   - Trigger: `POST /receipts/trigger` oder `/receipts/generate`.
   - Validierung: `ReceiptTriggerRequest` bzw. Request-Body.
   - Business-Logik: Triggern/Gerarieren von Receipt-Prozess.
   - Persistenz/Integration: E-Mail/Dateierzeugung (reportlab/smtplib in API-Abhängigkeiten/Imports).
   - Output: API-Antwort bzw. Datei-Response.
   - Side-Effects: Versand/Erstellung von Belegartefakten.

7. **DSGVO-Löschantrag und Admin-Verarbeitung**
   - Trigger: Nutzer ruft `POST /privacy/data-deletion`; Admin ruft `POST /privacy/data-deletion/{id}/process`.
   - Validierung: Pydantic-Modelle + JWT + `require_admin`.
   - Business-Logik: Retention-Prüfung, Statuswechsel, Ausführung von Anonymisierungs-/Löschschritten.
   - Persistenz/Integration: In-Memory-Requestspeicher + CiviCRM-Aufrufe; PostgreSQL-Löschung als geplanter Schritt dokumentiert.
   - Output: `ApiResponse` mit Status/Logdaten.
   - Side-Effects: Systemübergreifende Datenänderungen (CiviCRM/n8n-Hooks).

8. **KPI-Dashboard-Abfragen (Board/Treasurer API)**
   - Trigger: Frontend/Clients rufen `/api/kpis/overview`, `/api/members/timeseries`, `/api/donations/summary`, `/api/finance/income-vs-expense`, `/api/projects/burn` auf.
   - Validierung: Query-Parameter (z. B. `months`, `period`, Datumsbereiche).
   - Business-Logik: SQL-Aggregationen.
   - Persistenz: PostgreSQL-Read via asyncpg-Pool.
   - Output: KPI-JSON.
   - Side-Effects: Keine Writes in den gezeigten Endpunkten.

## B4 Datenmodelle & Persistenz
### Prisma-Modelle (`schema.prisma`)
- `User` mit Beziehungen zu `UserAchievement`, `GameSession`, `GameProgress`.
- `Achievement` und Join-Entität `UserAchievement` (m:n zwischen User und Achievement).
- `GameSession` und `GameProgress` pro Benutzer/Spieltyp.
- `Contact` und `Event` als CRM-nahe Domänenobjekte.
- Datenquelle: PostgreSQL via `DATABASE_URL`.

### SQLAlchemy-Modelle (`api/models.py`)
- `Member` (Stammdaten + DSGVO-Consent-Felder) mit 1:n zu `Payment`.
- `Payment` (Zahlungsbuchungen inkl. Betrag, Methode, Recurring-Flag).
- `Expense` (Ausgabenbuchungen).
- `Project` (Projektbudgetrahmen).

### Zugriffsschichten
- `api/fastapi/app/db.py`: asyncpg-Pool und Query-Hilfsfunktionen `fetch`, `fetchrow`, `fetchval`.
- `api/crud.py` + `api/routers/members.py`: CRUD-Zugriff auf `Member` via SQLAlchemy-Session.
- `api.menschlichkeit-oesterreich.at/app/main.py`: direkter Integrationszugriff (CiviCRM/API-Calls) und In-Memory-Queue.

### Persistenzsysteme im Compose
- Root `docker-compose.yml`: PostgreSQL + Redis + optional n8n.
- `automation/n8n/docker-compose.yml`: separates PostgreSQL und Redis für n8n.

## B5 Konfiguration
- **Top-Level/Workspace-Konfiguration:** `package.json` (Workspaces, Build/Test/Lint/Security/Deploy-Skripte).
- **API-Konfiguration:** `api.menschlichkeit-oesterreich.at/.env.example` definiert u. a. `APP_ENV`, `FRONTEND_ORIGINS`, `CIVI_BASE_URL`, `CIVI_SITE_KEY`, `CIVI_API_KEY`, `JWT_SECRET`.
- **n8n-Konfiguration:** `automation/n8n/.env.example` enthält n8n-, DB-, Redis-, Integrations- und Notification-Variablen.
- **Docker-Konfiguration:** `docker-compose.yml` (lokale Core-Services) sowie `automation/n8n/docker-compose.yml` (Automation-Stack).
- **CI/CD-Konfiguration:** `.github/workflows/enterprise-pipeline.yml` und weitere Workflows in `.github/workflows/` für Quality Gates, Security Scans, Analysen und Deployments.
- **Nicht ableitbar aus Repository-Inhalt:** konkrete produktive Secret-Werte, tatsächliche Infrastruktur-Topologie außerhalb der im Repository hinterlegten Compose-/Workflow-Dateien.
