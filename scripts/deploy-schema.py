"""SQL Schema Deployment Script für Dashboard Analytics"""
import os
import sys
from pathlib import Path
import psycopg
from dotenv import load_dotenv

# .env laden
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Database URL aus .env
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL nicht in .env gefunden!")
    print("Lösung: npx dotenv-vault@latest pull")
    sys.exit(1)

# Schema-Datei
SCHEMA_FILE = Path(__file__).parent.parent / "database" / "schema" / "dashboard-analytics.sql"
if not SCHEMA_FILE.exists():
    print(f"❌ ERROR: Schema-Datei nicht gefunden: {SCHEMA_FILE}")
    sys.exit(1)

print(f"📂 Schema-Datei: {SCHEMA_FILE}")
print(f"🔗 Database URL: {DATABASE_URL[:30]}...")

try:
    # Verbindung aufbauen
    print("\n🔌 Verbinde zu PostgreSQL...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True  # Wichtig für CREATE statements
    cur = conn.cursor()
    
    # Schema laden
    print(f"📖 Lade Schema ({SCHEMA_FILE.stat().st_size // 1024} KB)...")
    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        sql = f.read()
    
    # Ausführen
    print("🚀 Deploye Schema...")
    cur.execute(sql)
    
    print("\n✅ Schema erfolgreich deployt!\n")
    
    # Verifikation: Tabellen zählen
    print("🔍 Verifikation...")
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('members', 'payments', 'expenses', 'projects', 'etl_log')
        ORDER BY table_name;
    """)
    tables = cur.fetchall()
    print(f"   📊 Tabellen: {len(tables)}/5 erstellt")
    for table in tables:
        print(f"      - {table[0]}")
    
    # Materialized Views zählen
    cur.execute("""
        SELECT matviewname 
        FROM pg_matviews 
        WHERE schemaname = 'public'
        ORDER BY matviewname;
    """)
    views = cur.fetchall()
    print(f"\n   📈 Materialized Views: {len(views)}/4 erstellt")
    for view in views:
        print(f"      - {view[0]}")
    
    # Seed-Daten zählen
    cur.execute("SELECT COUNT(*) FROM members;")
    member_count = cur.fetchone()[0]
    print(f"\n   👥 Mitglieder (Seed): {member_count}")
    
    cur.execute("SELECT COUNT(*) FROM payments;")
    payment_count = cur.fetchone()[0]
    print(f"   💰 Zahlungen (Seed): {payment_count}")
    
    cur.execute("SELECT COUNT(*) FROM expenses;")
    expense_count = cur.fetchone()[0]
    print(f"   💸 Ausgaben (Seed): {expense_count}")
    
    cur.execute("SELECT COUNT(*) FROM projects;")
    project_count = cur.fetchone()[0]
    print(f"   📁 Projekte (Seed): {project_count}")
    
    # Refresh-Funktion testen
    print("\n🔄 Teste Refresh-Funktion...")
    cur.execute("SELECT refresh_dashboard_kpis();")
    print("   ✅ refresh_dashboard_kpis() erfolgreich")
    
    # KPIs abrufen
    print("\n📊 KPIs abrufen...")
    cur.execute("SELECT * FROM mv_members_kpis;")
    kpi = cur.fetchone()
    if kpi:
        print(f"   - Gesamt-Mitglieder: {kpi[0]}")
        print(f"   - Neu (30 Tage): {kpi[1]}")
        print(f"   - Austritte (30 Tage): {kpi[2]}")
        print(f"   - Wachstum: {kpi[3]:.2f}%")
    
    cur.close()
    conn.close()
    
    print("\n✅ Deployment abgeschlossen! Backend kann jetzt gestartet werden.")
    print("   Nächster Schritt: cd api/fastapi && uvicorn app.main:app --reload")
    
except psycopg2.Error as e:
    print(f"\n❌ PostgreSQL-Fehler: {e}")
    print(f"   Code: {e.pgcode}")
    print(f"   Details: {e.pgerror}")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Unerwarteter Fehler: {e}")
    sys.exit(1)
