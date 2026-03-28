# API Service – FastAPI Backend

> ## DEPRECATED
>
> **Dieses Verzeichnis ist veraltet.** Die aktive API-Entwicklung findet ausschließlich
> in `apps/api/` statt. Diese Kopie wird nicht mehr synchron gehalten und soll in einer
> zukünftigen Version entfernt werden.
>
> **Migration:** Alle neuen Endpunkte, Bugfixes und Schema-Änderungen gehören nach `apps/api/`.
> Bestehende Deployments sollten auf `apps/api/` umgestellt werden.

---

> **Zentrale Backend-API für Menschlichkeit Österreich Platform**

**Base URL (Production)**: `https://api.menschlichkeit-oesterreich.at`
**Base URL (Development)**: `http://localhost:8001`

---

## Übersicht

Der API Service ist ein **FastAPI**-basierter Python-Backend, der:

- **Datenintegration** zwischen CRM (CiviCRM), Frontend und Gaming Platform
- **Authentication & Authorization** (JWT Tokens)
- **PII Sanitization** für DSGVO-Compliance (automatisches Filtering sensibler Daten)
- **RESTful API** mit automatischer OpenAPI-Dokumentation

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.12+
- **pip** oder **uv** (empfohlen)
- **PostgreSQL** (für CRM-Integration)

### Installation

```bash
# In API-Verzeichnis wechseln
cd api.menschlichkeit-oesterreich.at

# Virtual Environment erstellen
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Dependencies installieren
pip install -r requirements.txt

# Environment konfigurieren
cp ../.config-templates/.env.api.development .env
# .env anpassen: DATABASE_URL, JWT_SECRET, etc.

# Datenbankmigrationen ausführen
alembic upgrade head

# Development Server starten
uvicorn app.main:app --reload --port 8001
```

**API verfügbar unter**: <http://localhost:8001>  
**Interactive Docs**: <http://localhost:8001/docs> (Swagger UI)  
**Alternative Docs**: <http://localhost:8001/redoc> (ReDoc)

---

## 📁 Projektstruktur

```
api.menschlichkeit-oesterreich.at/
├── app/
│   ├── main.py                 # FastAPI App Entry Point
│   ├── config.py               # Settings & Environment Variables
│   ├── api/                    # API Endpoints (Router)
│   │   ├── v1/                 # API Version 1
│   │   │   ├── auth.py         # Authentication Endpoints
│   │   │   ├── users.py        # User Management
│   │   │   ├── crm.py          # CiviCRM Integration
│   │   │   └── games.py        # Gaming Platform Endpoints
│   │   └── deps.py             # Dependency Injection
│   ├── core/                   # Core Business Logic
│   │   ├── auth.py             # JWT Token Handling
│   │   ├── security.py         # Password Hashing
│   │   └── exceptions.py       # Custom Exceptions
│   ├── lib/                    # Libraries & Utilities
│   │   ├── pii_sanitizer.py    # PII Sanitization (DSGVO)
│   │   └── logging.py          # Structured Logging
│   ├── models/                 # SQLAlchemy Models
│   │   ├── user.py             # User Model
│   │   ├── crm_contact.py      # CRM Contact Model
│   │   └── game_session.py     # Game Session Model
│   ├── schemas/                # Pydantic Schemas (Request/Response)
│   │   ├── auth.py             # Auth DTOs
│   │   ├── user.py             # User DTOs
│   │   └── game.py             # Game DTOs
│   └── tests/                  # Unit Tests
│       ├── test_auth.py
│       ├── test_pii_sanitizer.py
│       └── test_crm.py
├── alembic/                    # Database Migrations
│   ├── versions/               # Migration Scripts
│   └── env.py                  # Alembic Configuration
├── requirements.txt            # Python Dependencies
├── pyproject.toml              # Python Project Config
├── .env                        # Environment Variables (not in git)
└── README.md                   # This file
```

---

## 🔌 API Endpoints

### Authentication

| Endpoint               | Method | Beschreibung                         |
| ---------------------- | ------ | ------------------------------------ |
| `/api/v1/auth/login`   | POST   | Login (Email + Password) → JWT Token |
| `/api/v1/auth/refresh` | POST   | Refresh JWT Token                    |
| `/api/v1/auth/logout`  | POST   | Logout (Token invalidieren)          |

### Users

| Endpoint             | Method | Beschreibung              |
| -------------------- | ------ | ------------------------- |
| `/api/v1/users/me`   | GET    | Aktuell eingeloggter User |
| `/api/v1/users/{id}` | GET    | User by ID (Admin only)   |
| `/api/v1/users`      | POST   | Create User (Admin only)  |

### CRM Integration

| Endpoint                    | Method | Beschreibung          |
| --------------------------- | ------ | --------------------- |
| `/api/v1/crm/contacts`      | GET    | List CiviCRM Contacts |
| `/api/v1/crm/contacts/{id}` | GET    | Get Contact Details   |
| `/api/v1/crm/memberships`   | GET    | List Memberships      |

### Gaming Platform

| Endpoint                     | Method | Beschreibung        |
| ---------------------------- | ------ | ------------------- |
| `/api/v1/games/sessions`     | GET    | List Game Sessions  |
| `/api/v1/games/sessions`     | POST   | Create Game Session |
| `/api/v1/games/achievements` | GET    | List Achievements   |

**Vollständige API-Dokumentation**: <http://localhost:8001/docs> (nach `npm run dev:api`)

---

## 🔒 PII Sanitization (DSGVO-Compliance)

Der API Service enthält ein automatisches **PII Filtering System**, das sensible Daten in Logs und Responses redaktiert:

### Erkannte PII-Typen

- ✅ **Email-Adressen** (Redaktion: `t**@example.com`)
- ✅ **Telefonnummern** (Österreichische & internationale Formate)
- ✅ **Kreditkarten** (nur mit Luhn-Checksum-Validierung)
- ✅ **Passwörter** (komplette Entfernung aus strukturierten Daten)
- ✅ **API Keys** (Pattern-basiert)
- ✅ **IBAN** (EU-IBAN-Validierung)

### Verwendung

```python
from app.lib.pii_sanitizer import scrub, scrub_dict

# Text scrubben
clean_text = scrub("Kontakt: max.mustermann@example.com")
# → "Kontakt: m**@example.com"

# Dictionary scrubben (für API Responses)
clean_data = scrub_dict({
    "email": "user@example.com",
    "password": "secret123",
    "name": "Max Mustermann"
})
# → {"email": "u**@example.com", "name": "Max Mustermann"}
# (password komplett entfernt!)
```

**Vollständige Dokumentation**: [PII-SANITIZATION-README.md](PII-SANITIZATION-README.md)

---

## 🗄️ Database

### Migrations mit Alembic

```bash
# Neue Migration erstellen
alembic revision --autogenerate -m "Add new table"

# Migrations ausführen
alembic upgrade head

# Migration rückgängig machen
alembic downgrade -1

# Aktuellen Stand anzeigen
alembic current
```

### Database Schema

- **users** – User Accounts (Authentication)
- **crm_contacts** – CiviCRM Contact Sync (Read-Only)
- **game_sessions** – Gaming Platform Sessions
- **achievements** – User Achievements & XP

**ORM**: SQLAlchemy 2.0 (async)

---

## 🧪 Testing

```bash
# Unit Tests ausführen
pytest

# Mit Coverage
pytest --cov=app --cov-report=html

# Nur PII Sanitizer Tests
pytest tests/test_pii_sanitizer.py -v

# E2E API Tests
pytest tests/integration/ -v
```

**Coverage Ziel**: ≥80%

---

## 🚀 Deployment

### Plesk Deployment

```bash
# Von Root-Verzeichnis aus
./deployment-scripts/deploy-api-plesk.sh

# Oder aus API-Verzeichnis
cd api.menschlichkeit-oesterreich.at
./deploy.sh  # Falls vorhanden
```

### Environment Variables (Production)

```bash
# .env (auf Server)
DATABASE_URL=postgresql+asyncpg://user:password@localhost/api_db
JWT_SECRET=<secure-random-string>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30
ENVIRONMENT=production
LOG_LEVEL=INFO
ALLOWED_ORIGINS=https://menschlichkeit-oesterreich.at,https://crm.menschlichkeit-oesterreich.at
```

**Secrets Management**: Siehe [../config-templates/README.md](../config-templates/README.md)

---

## 📊 Monitoring & Logs

### Structured Logging

Alle Logs werden strukturiert (JSON) mit automatischer PII-Sanitization ausgegeben:

```json
{
  "timestamp": "2025-10-10T19:30:00Z",
  "level": "INFO",
  "message": "User logged in",
  "user_id": "123",
  "email": "u**@example.com", // ← Redaktiert!
  "ip": "192.168.1.1"
}
```

### Health Check

```bash
curl http://localhost:8001/health
# → {"status": "healthy", "version": "1.0.0"}
```

---

## 🤝 Contributing

Siehe [../.github/CONTRIBUTING.md](../.github/CONTRIBUTING.md)

**Branch Strategy**: Feature Branches → Pull Request → Code Review → Merge to `main`

---

## 📖 Weitere Dokumentation

- **PII Sanitization**: [PII-SANITIZATION-README.md](PII-SANITIZATION-README.md)
- **Security**: [../docs/security/AUTHENTICATION-FLOWS.md](../docs/security/AUTHENTICATION-FLOWS.md)
- **DSGVO**: [../docs/legal/DSGVO-COMPLIANCE-BLUEPRINT.md](../docs/legal/DSGVO-COMPLIANCE-BLUEPRINT.md)
- **DOCS-INDEX**: [../DOCS-INDEX.md](../DOCS-INDEX.md)

---

## 📜 Lizenz

MIT License – Siehe [../LICENSE](../LICENSE)
