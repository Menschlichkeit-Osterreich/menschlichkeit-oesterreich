# 🗄️ SQL Schema Deployment: Dashboard Analytics

**Status:** P1-HIGH  
**Dauer:** ~1-2 Minuten  
**Schema:** `database/schema/dashboard-analytics.sql` (320 Zeilen)

---

## 📊 Was wird deployt?

### Tabellen (5x)

1. **`members`** - Mitgliederstammdaten (Name, E-Mail, Beitritt, Status)
2. **`payments`** - Beitragszahlungen (Betrag, Datum, Methode, Stripe-ID)
3. **`expenses`** - Ausgaben (Kategorie, Betrag, Beschreibung)
4. **`projects`** - Projekte (Code, Budget, Start-/Enddatum)
5. **`etl_log`** - ETL-Protokoll (n8n-Sync-Timestamps)

### Materialized Views (4x)

1. **`mv_members_kpis`** - Mitglieder-KPIs (Gesamt, Neu, Austritte, Wachstum %)
2. **`mv_payments_kpis`** - Zahlungs-KPIs (Summe, Durchschnitt, Zahlungsmethoden)
3. **`mv_finance_kpis`** - Finanz-KPIs (Einnahmen, Ausgaben, Saldo)
4. **`mv_project_burn`** - Projekt-Budget-Burn (Budget vs. verbraucht)

### Funktionen (1x)

- **`refresh_dashboard_kpis()`** - Aktualisiert alle 4 Materialized Views

### Indizes (10x)

- Performance-Optimierung für `WHERE`/`JOIN`-Abfragen

### Seed-Daten

- 10 Demo-Mitglieder
- 20 Demo-Zahlungen
- 5 Demo-Ausgaben
- 2 Demo-Projekte

---

## 🚀 Deployment (PowerShell)

### Voraussetzungen prüfen

```powershell
# 1. PostgreSQL läuft?
Get-Service -Name postgresql*

# Erwartete Ausgabe:
# Status   Name               DisplayName
# ------   ----               -----------
# Running  postgresql-x64-15  PostgreSQL Server 15

# 2. .env geladen?
npx dotenv-vault@latest pull

# 3. DATABASE_URL gesetzt?
$env:DATABASE_URL
# Erwartete Ausgabe: postgresql://user:pass@localhost:5432/menschlichkeit_db
```

---

### Option 1: psql-Kommandozeile (empfohlen)

```powershell
# Terminal (PowerShell)
cd D:\Arbeitsverzeichniss\menschlichkeit-oesterreich-development

# Schema deployen
psql $env:DATABASE_URL -f database/schema/dashboard-analytics.sql

# Erwartete Ausgabe:
# CREATE TABLE
# CREATE TABLE
# CREATE TABLE
# CREATE TABLE
# CREATE TABLE
# CREATE MATERIALIZED VIEW
# CREATE MATERIALIZED VIEW
# CREATE MATERIALIZED VIEW
# CREATE MATERIALIZED VIEW
# CREATE FUNCTION
# CREATE INDEX
# CREATE INDEX
# ... (10x)
# INSERT 0 10
# INSERT 0 20
# INSERT 0 5
# INSERT 0 2
```

**Bei Fehler "psql: command not found":**

```powershell
# PostgreSQL-Binaries zum PATH hinzufügen:
$env:PATH += ";C:\Program Files\PostgreSQL\15\bin"

# Nochmal versuchen:
psql $env:DATABASE_URL -f database/schema/dashboard-analytics.sql
```

---

### Option 2: pgAdmin 4 (GUI)

1. **pgAdmin öffnen** (Start-Menü)
2. **Server verbinden:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `menschlichkeit_db`
   - Username: (aus `.env` → `DATABASE_USER`)
   - Password: (aus `.env` → `DATABASE_PASSWORD`)
3. **Query Tool öffnen:** Rechtsklick auf `menschlichkeit_db` → **Query Tool**
4. **Datei öffnen:** Menü → **File** → **Open** → `database/schema/dashboard-analytics.sql`
5. **Ausführen:** Button "Execute/Refresh" (F5)
6. **Ergebnis prüfen:** Sollte 40+ Meldungen zeigen (CREATE, INSERT)

---

### Option 3: Python-Script (automatisiert)

```powershell
# Terminal (PowerShell)
cd D:\Arbeitsverzeichniss\menschlichkeit-oesterreich-development

# Python Virtual Environment aktivieren
.venv\Scripts\Activate.ps1

# Script erstellen:
@'
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Verbindung aufbauen
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

# Schema laden
with open("database/schema/dashboard-analytics.sql", "r", encoding="utf-8") as f:
    sql = f.read()

# Ausführen
cur.execute(sql)
conn.commit()

print("✅ Schema erfolgreich deployt!")

# Prüfung: Tabellen zählen
cur.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'members' OR table_name LIKE 'payments' OR table_name LIKE 'expenses' OR table_name LIKE 'projects' OR table_name LIKE 'etl_log';")
count = cur.fetchone()[0]
print(f"📊 {count} Tabellen erstellt (erwartet: 5)")

cur.close()
conn.close()
'@ | Out-File -Encoding utf8 scripts/deploy-schema.py

# Ausführen:
python scripts/deploy-schema.py
```

---

## ✅ Verifikation

### 1. Tabellen prüfen

```powershell
psql $env:DATABASE_URL -c "\dt"

# Erwartete Ausgabe (Tabelle):
#            List of relations
#  Schema |   Name    | Type  |  Owner
# --------+-----------+-------+----------
#  public | etl_log   | table | postgres
#  public | expenses  | table | postgres
#  public | members   | table | postgres
#  public | payments  | table | postgres
#  public | projects  | table | postgres
# (5 rows)
```

### 2. Materialized Views prüfen

```powershell
psql $env:DATABASE_URL -c "\dm"

# Erwartete Ausgabe:
#                  List of relations
#  Schema |       Name        | Type              |  Owner
# --------+-------------------+-------------------+----------
#  public | mv_finance_kpis   | materialized view | postgres
#  public | mv_members_kpis   | materialized view | postgres
#  public | mv_payments_kpis  | materialized view | postgres
#  public | mv_project_burn   | materialized view | postgres
# (4 rows)
```

### 3. Seed-Daten prüfen

```powershell
# Mitglieder zählen:
psql $env:DATABASE_URL -c "SELECT COUNT(*) AS mitglieder FROM members;"

# Erwartete Ausgabe:
#  mitglieder
# ------------
#          10

# Zahlungen summieren:
psql $env:DATABASE_URL -c "SELECT SUM(amount_cents) / 100.0 AS gesamt_eur FROM payments;"

# Erwartete Ausgabe (ca. 720 EUR bei Seed-Daten):
#  gesamt_eur
# ------------
#      720.00
```

### 4. Materialized Views testen

```powershell
# KPIs abrufen:
psql $env:DATABASE_URL -c "SELECT * FROM mv_members_kpis;"

# Erwartete Ausgabe:
#  total_members | new_members_30d | cancellations_30d | growth_rate_percent
# ---------------+-----------------+-------------------+---------------------
#             10 |               3 |                 1 |                20.00
```

### 5. Refresh-Funktion testen

```powershell
psql $env:DATABASE_URL -c "SELECT refresh_dashboard_kpis();"

# Erwartete Ausgabe:
#  refresh_dashboard_kpis
# ------------------------
#  (null)
# (1 row)

# Nochmal KPIs abrufen (sollte aktualisiert sein):
psql $env:DATABASE_URL -c "SELECT * FROM mv_members_kpis;"
```

---

## 🔄 Täglicher Refresh (Automatisierung)

### Option A: PostgreSQL Cron (pg_cron Extension)

```sql
-- Extension aktivieren (einmalig):
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Job anlegen (täglich 02:00 Uhr):
SELECT cron.schedule(
  'refresh-dashboard-kpis',
  '0 2 * * *',
  'SELECT refresh_dashboard_kpis();'
);

-- Jobs anzeigen:
SELECT * FROM cron.job;
```

### Option B: n8n Workflow

**Workflow:**
1. **Trigger:** Cron (täglich 02:00 Uhr)
2. **Node:** PostgreSQL Execute Query
3. **Query:** `SELECT refresh_dashboard_kpis();`
4. **Webhook:** Ergebnis an Monitoring senden

**Datei:** `automation/n8n/workflows/dashboard-kpi-refresh.json` (analog zu Mail-Archivierung)

---

## 🔧 Troubleshooting

### Fehler: "relation already exists"

**Ursache:** Schema wurde bereits deployt

**Lösung:**

```powershell
# Drop-Script erstellen (VORSICHT: löscht alle Daten!):
psql $env:DATABASE_URL -c "DROP MATERIALIZED VIEW IF EXISTS mv_members_kpis, mv_payments_kpis, mv_finance_kpis, mv_project_burn CASCADE; DROP TABLE IF EXISTS members, payments, expenses, projects, etl_log CASCADE; DROP FUNCTION IF EXISTS refresh_dashboard_kpis();"

# Nochmal deployen:
psql $env:DATABASE_URL -f database/schema/dashboard-analytics.sql
```

### Fehler: "permission denied"

**Ursache:** User hat keine CREATE-Rechte

**Lösung:**

```powershell
# Als Superuser verbinden (postgres):
psql -U postgres -d menschlichkeit_db -f database/schema/dashboard-analytics.sql

# Oder: Rechte vergeben:
psql -U postgres -d menschlichkeit_db -c "GRANT ALL PRIVILEGES ON DATABASE menschlichkeit_db TO <DEIN_USER>;"
```

### Fehler: "database does not exist"

**Ursache:** Datenbank `menschlichkeit_db` existiert nicht

**Lösung:**

```powershell
# Datenbank erstellen:
psql -U postgres -c "CREATE DATABASE menschlichkeit_db WITH ENCODING 'UTF8' LC_COLLATE 'de_AT.UTF-8' LC_CTYPE 'de_AT.UTF-8';"

# Nochmal deployen:
psql $env:DATABASE_URL -f database/schema/dashboard-analytics.sql
```

---

## ✅ Definition of Done (DoD)

- [ ] **Schema deployt** (psql-Befehl erfolgreich)
- [ ] **5 Tabellen existieren** (`\dt` zeigt 5 Zeilen)
- [ ] **4 Materialized Views existieren** (`\dm` zeigt 4 Zeilen)
- [ ] **Seed-Daten geladen** (10 Mitglieder, 20 Zahlungen)
- [ ] **Refresh-Funktion getestet** (`SELECT refresh_dashboard_kpis();` erfolgreich)
- [ ] **KPIs abrufbar** (`SELECT * FROM mv_members_kpis;` liefert Daten)
- [ ] **Automatischer Refresh konfiguriert** (pg_cron ODER n8n)
- [ ] **Backend API getestet** (`curl http://localhost:8080/api/kpis/overview` liefert JSON)

---

## 🔗 Referenzen

- **Schema-Datei:** `database/schema/dashboard-analytics.sql`
- **Backend-Router:** `api/fastapi/app/routers/metrics.py`
- **ENV-Variablen:** `.env` → `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`
- **n8n ETL:** `automation/n8n/workflows/dashboard-etl-stripe-civicrm.json`

---

**Erstellt:** 2025-10-18  
**Verantwortlich:** Developer (Peter Schuller)  
**Nächster Schritt:** FastAPI Backend starten (`uvicorn app.main:app --reload`)
