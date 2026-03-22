# FastAPI Backend – Dashboard Metrics API

Backend-API für das Dashboard Vorstand/Kassier mit 5 KPI-Endpoints.

## 🚀 Quick Start

```bash
# 1. Python Virtual Environment
cd apps/api
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ODER: .venv\Scripts\Activate.ps1  # Windows

# 2. Dependencies installieren
pip install -r requirements.txt

# 3. Environment konfigurieren
cp .env.example .env
# .env bearbeiten: DATABASE_URL, JWT_SECRET_KEY und Integrationen setzen

# 4. Server starten
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Server läuft unter: **http://localhost:8001**

## 📋 API Endpoints

### Health Check
```bash
GET /healthz
# Response: {"status": "ok"}
```

### 1. Overview KPIs
```bash
GET /api/kpis/overview?since=2025-01-01
# Response:
{
  "members_total": 150,
  "net_new_members_month": 5,
  "donations_ytd_cents": 5000000,
  "income_vs_expense_current_month_cents": 25000,
  "as_of": "2025-10-18",
  "since": "2025-01-01"
}
```

### 2. Members Time Series
```bash
GET /api/members/timeseries?granularity=month&months=12
# Response:
[
  {
    "bucket": "2024-11-01",
    "active_members": 145,
    "joins": 8,
    "cancels": 3
  },
  ...
]
```

### 3. Donations Summary
```bash
GET /api/donations/summary?period=ytd
# Response:
{
  "period": "ytd",
  "total_cents": 5000000,
  "count": 250,
  "avg_cents": 20000,
  "recurring_share": 0.65
}
```

### 4. Finance Income vs Expense
```bash
GET /api/finance/income-vs-expense?from_date=2025-01-01&to_date=2025-10-31
# Response:
[
  {
    "month": "2025-01",
    "income_cents": 450000,
    "expense_cents": 380000,
    "balance_cents": 70000
  },
  ...
]
```

### 5. Project Burn Rate
```bash
GET /api/projects/burn?code=DEMO
# Response:
{
  "code": "DEMO",
  "name": "Demo Project",
  "budget_cents": 10000000,
  "spend_cents": 4500000,
  "burn_rate": 0.45,
  "found": true
}
```

## 🗄️ Database Setup

Benötigt PostgreSQL ≥15 mit Dashboard-Schema:

```bash
# Schema deployen
psql -d menschlichkeit_db -f ../../database/schema/dashboard-analytics.sql

# Verify
psql -d menschlichkeit_db -c "SELECT tablename FROM pg_tables WHERE schemaname='public';"
```

**Erwartete Tabellen:**
- `members` (Mitgliederdaten)
- `payments` (Zahlungen/Spenden)
- `expenses` (Ausgaben)
- `projects` (Projekte)
- `etl_log` (ETL-Audit-Trail)

**Materialized Views:**
- `mv_members_kpis`
- `mv_payments_kpis`
- `mv_finance_kpis`
- `mv_project_burn`

## 🧪 Testing

```bash
# Smoke Tests
curl -s http://localhost:8080/healthz
curl -s "http://localhost:8080/api/kpis/overview"
curl -s "http://localhost:8080/api/members/timeseries?granularity=month&months=6"
curl -s "http://localhost:8080/api/donations/summary?period=last_30d"

# Mit jq formatieren
curl -s "http://localhost:8080/api/kpis/overview" | jq .
```

## 📁 Projektstruktur

```
api/fastapi/
├── app/
│   ├── main.py          # FastAPI App + Router-Integration
│   ├── db.py            # asyncpg Connection Pool
│   └── routers/
│       └── metrics.py   # 5 KPI-Endpoints
├── requirements.txt     # Dependencies
├── .env.example         # ENV-Template
└── README.md            # Diese Datei
```

## 🔐 Environment Variables

Siehe `apps/api/.env.example`:

```bash
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DBNAME
ENVIRONMENT=development
JWT_SECRET_KEY=your-jwt-secret-key
MOE_API_TOKEN=your-internal-bearer-token
N8N_WEBHOOK_SECRET=your-hmac-secret
```

## 🚢 Production Deployment

```bash
# 1. Gunicorn statt uvicorn (Production)
pip install gunicorn

# 2. Starten mit Gunicorn
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8080 \
  --access-logfile - \
  --error-logfile -

# 3. Oder: systemd-Service (siehe deployment-scripts/)
```

## 📊 Integration mit Frontend

Frontend API-Client: `frontend/src/lib/metricsAPI.ts`

```typescript
import { metricsAPI } from '@/lib/metricsAPI';

// Beispiel: Overview-KPIs fetchen
const overview = await metricsAPI.getOverviewKPIs();
console.log(overview.members_total);
```

## 🐛 Troubleshooting

**Problem:** `asyncpg.exceptions.InvalidPasswordError`
- **Lösung:** DATABASE_URL in `.env` prüfen (Credentials korrekt?)

**Problem:** `ModuleNotFoundError: No module named 'asyncpg'`
- **Lösung:** `pip install -r requirements.txt` im venv ausführen

**Problem:** `relation "members" does not exist`
- **Lösung:** SQL-Schema deployen (`psql -f database/schema/dashboard-analytics.sql`)

**Problem:** `Port 8080 already in use`
- **Lösung:** `--port 8081` verwenden oder anderen Prozess beenden

## 📚 Related Docs

- SQL-Schema: `database/schema/dashboard-analytics.sql`
- n8n-ETL: `automation/n8n/workflows/dashboard-etl-stripe-civicrm.json`
- Frontend-API-Client: `frontend/src/lib/metricsAPI.ts`
- Dashboard-Seite: `frontend/src/pages/BoardTreasurerDashboard.tsx`

---

**Status:** ✅ Ready for Deployment  
**Erstellt:** 2025-10-18  
**Version:** 0.1.0
