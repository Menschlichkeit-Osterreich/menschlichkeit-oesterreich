---
name: Dashboard Backend Deployment
about: FastAPI Metrics-Router deployen (api/fastapi/)
title: "[API] FastAPI Router „metrics" deployen"
labels: dashboard, backend, api, priority:high
assignees: ''
---

## 🎯 Ziel

FastAPI Backend-API mit 5 Dashboard-KPI-Endpoints deployen und testen.

## ✅ Akzeptanzkriterien

- [ ] Pfadstruktur gemäß `api/fastapi/app/(main.py, db.py, routers/metrics.py)` existiert
- [ ] `.env` mit `DATABASE_URL` konfiguriert (PostgreSQL Connection String)
- [ ] Virtual Environment erstellt (`python -m venv .venv`)
- [ ] Dependencies installiert (`pip install -r requirements.txt`)
- [ ] Server startet erfolgreich (`uvicorn app.main:app --reload --port 8080`)
- [ ] Health-Check erfolgreich: `GET /healthz` → `{"status": "ok"}`
- [ ] Alle 5 KPI-Endpoints erreichbar:
  - `GET /api/kpis/overview`
  - `GET /api/members/timeseries`
  - `GET /api/donations/summary`
  - `GET /api/finance/income-vs-expense`
  - `GET /api/projects/burn`
- [ ] Smoke-Tests via `curl` erfolgreich (siehe README.md)
- [ ] README.md mit Start-Anleitung vorhanden

## 📋 Tasks

### 1. Environment Setup
```bash
cd api/fastapi
python -m venv .venv
source .venv/bin/activate  # Linux/Mac: .venv\Scripts\Activate.ps1 (Windows)
pip install -r requirements.txt
```

### 2. Database Configuration
```bash
# .env erstellen
cp .env.example .env

# DATABASE_URL konfigurieren (Beispiel):
# DATABASE_URL=postgresql://postgres:password@localhost:5432/menschlichkeit_db
```

### 3. Database Schema Deploy
```bash
# SQL-Schema ausführen (einmalig)
psql -d menschlichkeit_db -f ../../database/schema/dashboard-analytics.sql

# Verify
psql -d menschlichkeit_db -c "\dt"  # Tabellen: members, payments, expenses, projects, etl_log
psql -d menschlichkeit_db -c "\dm"  # Views: mv_members_kpis, mv_payments_kpis, mv_finance_kpis, mv_project_burn
```

### 4. Server starten
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### 5. Smoke-Tests
```bash
# Health-Check
curl -s http://localhost:8080/healthz

# Overview-KPIs
curl -s "http://localhost:8080/api/kpis/overview" | jq .

# Members-Timeseries
curl -s "http://localhost:8080/api/members/timeseries?granularity=month&months=12" | jq .

# Donations-Summary
curl -s "http://localhost:8080/api/donations/summary?period=ytd" | jq .

# Finance Income vs Expense
curl -s "http://localhost:8080/api/finance/income-vs-expense?from_date=2025-01-01&to_date=2025-10-31" | jq .

# Project Burn Rate
curl -s "http://localhost:8080/api/projects/burn?code=DEMO" | jq .
```

## 📦 Dateien

**Erstellt:**
- ✅ `api/fastapi/requirements.txt` (4 Dependencies)
- ✅ `api/fastapi/.env.example` (Template)
- ✅ `api/fastapi/app/main.py` (FastAPI App)
- ✅ `api/fastapi/app/db.py` (asyncpg Pool)
- ✅ `api/fastapi/app/routers/metrics.py` (5 Endpoints, 250+ Zeilen)
- ✅ `api/fastapi/README.md` (Deployment-Anleitung)

**Abhängigkeiten:**
- ✅ `database/schema/dashboard-analytics.sql` (320 Zeilen, 5 Tabellen, 4 Views)
- ✅ `automation/n8n/workflows/dashboard-etl-stripe-civicrm.json` (ETL-Workflow)

## 🔗 Verwandte Issues

- #TBD Frontend-Integration (`metricsAPI.ts` anbinden)
- #TBD Dashboard-Seite testen (BoardTreasurerDashboard)
- #TBD n8n-Workflow importieren (ETL täglich 02:00)

## 🐛 Troubleshooting

**Problem:** `asyncpg.exceptions.InvalidPasswordError`
- Lösung: DATABASE_URL in `.env` prüfen

**Problem:** `relation "members" does not exist`
- Lösung: SQL-Schema deployen (`psql -f database/schema/dashboard-analytics.sql`)

**Problem:** `ModuleNotFoundError: No module named 'asyncpg'`
- Lösung: `pip install -r requirements.txt` im venv

## 📊 Definition of Done

- [x] Code committed (`api/fastapi/`)
- [ ] Server läuft lokal (`http://localhost:8080`)
- [ ] Alle Smoke-Tests grün
- [ ] README.md dokumentiert
- [ ] Environment-Template (`.env.example`) vorhanden
- [ ] Nächstes Issue: Frontend-Integration angelegt

---

**Milestone:** M1 (ETL + DB, Woche 1)  
**Priority:** P1 (High)  
**Estimated Time:** 30 min (Setup) + 15 min (Tests)  
**Erstellt:** 2025-10-18
