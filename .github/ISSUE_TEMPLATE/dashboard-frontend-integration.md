---
name: Dashboard Frontend Integration
about: metricsAPI.ts an FastAPI-Pfade binden
title: '[FE] metricsAPI.ts an FastAPI-Pfade binden'
labels: dashboard, frontend, integration, priority:high
assignees: ''
---

## 🎯 Ziel

Frontend-API-Client (`metricsAPI.ts`) an laufende FastAPI-Backend-Endpoints anbinden und Dashboard-Widgets mit echten Daten füllen.

## ✅ Akzeptanzkriterien

- [ ] `apps/website/src/lib/metricsAPI.ts` Base-URL ENV-gestützt (`VITE_API_BASE_URL`)
- [ ] Alle 5 API-Endpoints erfolgreich erreichbar (via `metricsAPI.getOverviewKPIs()` etc.)
- [ ] `KpiCard`-Komponente zeigt echte KPI-Werte (keine Mock-Daten)
- [ ] `TrendChart`-Komponente rendert Mitglieder-Zeitreihe (via `getMembersTimeseries()`)
- [ ] `BoardTreasurerDashboard`-Seite lädt ohne Fehler
- [ ] Error-Handling funktioniert (Fehler-Banner bei API-Fehler)
- [ ] Loading-States funktionieren (Skeleton während API-Call)
- [ ] Smoke-Test: Dashboard rendert 4 KPIs + 1 Zeitreihe erfolgreich

## 📋 Tasks

### 1. Environment konfigurieren

```bash
# apps/website/.env erstellen
cd apps/website
cp .env.example .env

# VITE_API_BASE_URL setzen
echo "VITE_API_BASE_URL=http://localhost:8080" >> .env
```

### 2. Backend starten (falls noch nicht läuft)

```bash
# In separatem Terminal
cd apps/api
python -m uvicorn app.main:app --reload --port 8001
```

### 3. Frontend Dev-Server starten

```bash
cd apps/website
npm run dev
# Läuft unter: http://localhost:5173
```

### 4. Dashboard aufrufen

```
http://localhost:5173/admin/dashboard
```

### 5. Browser-Konsole prüfen

- **Erwartung:** Keine Fetch-Fehler (CORS, 404, 500)
- **Erfolgreich:** KPI-Werte sichtbar (z.B. "150 Aktive Mitglieder")

### 6. API-Calls testen (Browser DevTools)

```javascript
// Browser-Konsole:
fetch('http://localhost:8001/api/kpis/overview')
  .then(res => res.json())
  .then(data => console.log(data));
```

### 7. Error-Handling testen

```bash
# Backend stoppen → Frontend sollte Fehler-Banner zeigen
# Backend neu starten → "Retry" sollte funktionieren
```

## 📦 Betroffene Dateien

**Bereits erstellt (in vorherigen Issues):**

- ✅ `apps/website/src/lib/metricsAPI.ts` (TypeScript API-Client)
- ✅ `apps/website/src/components/dashboard/KpiCard.tsx` (Widget)
- ✅ `apps/website/src/components/dashboard/TrendChart.tsx` (Recharts-Wrapper)
- ✅ `apps/website/src/pages/BoardTreasurerDashboard.tsx` (Dashboard-Seite)
- ✅ `apps/website/src/App.tsx` (Route `/admin/dashboard`)

**Zu prüfen/editieren:**

- [ ] `apps/website/.env` (VITE_API_BASE_URL setzen)
- [ ] `apps/website/src/pages/BoardTreasurerDashboard.tsx` (Falls Mock-Daten noch drin sind → entfernen)

## 🔧 Integration-Code (Beispiel)

**BoardTreasurerDashboard.tsx** sollte so aussehen:

```typescript
import { metricsAPI } from '@/lib/metricsAPI';
import { useEffect, useState } from 'react';

export function BoardTreasurerDashboard() {
  const [overview, setOverview] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewData, timeseriesData] = await Promise.all([
          metricsAPI.getOverviewKPIs(),
          metricsAPI.getMembersTimeseries('month', 12)
        ]);
        setOverview(overviewData);
        setTimeseries(timeseriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <KpiCard title="Aktive Mitglieder" value={overview.members_total} />
      <TrendChart data={timeseries} title="Mitglieder-Entwicklung" />
    </div>
  );
}
```

## 🧪 Smoke-Tests

```bash
# 1. Frontend-Build (ohne Fehler)
cd frontend
npm run build

# 2. E2E-Test (Playwright)
npm run test:e2e -- --project=chromium --grep="Dashboard"

# 3. Lighthouse-Audit
npm run performance:lighthouse -- --url=http://localhost:5173/admin/dashboard
```

## 🔗 Verwandte Issues

- #TBD Backend-Deployment (FastAPI Router)
- #TBD n8n-ETL-Import (Daten-Sync)
- #TBD RBAC-Implementierung (Finanz-Kachel nur für Kassier)

## 🐛 Troubleshooting

**Problem:** CORS-Fehler (Cross-Origin Request Blocked)

- Lösung: Backend `main.py` → CORS-Middleware hinzufügen:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:5173"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

**Problem:** 404 Not Found (API-Endpunkt nicht erreichbar)

- Lösung: Backend läuft? `curl http://localhost:8080/healthz`

**Problem:** Infinite Loading (keine Daten)

- Lösung: Browser DevTools → Network → Fetch-Requests prüfen

**Problem:** TypeError: Cannot read property 'members_total' of null

- Lösung: Null-Checks in Dashboard-Komponente (`overview?.members_total`)

## 📊 Definition of Done

- [ ] Backend läuft (`http://localhost:8080`)
- [ ] Frontend läuft (`http://localhost:5173`)
- [ ] Dashboard-Seite lädt erfolgreich
- [ ] 4 KPI-Kacheln zeigen echte Werte (keine Mock-Daten)
- [ ] 1 Chart rendert Zeitreihe (Mitglieder-Entwicklung)
- [ ] Error-Handling getestet (Backend stoppen → Fehler-Banner)
- [ ] Loading-States getestet (Skeleton während Fetch)
- [ ] Smoke-Tests grün (Build, E2E, Lighthouse)
- [ ] Nächstes Issue: RBAC-Implementierung angelegt

---

**Milestone:** M2 (API + Overview, Woche 2)  
**Priority:** P1 (High)  
**Estimated Time:** 45 min (Integration) + 30 min (Tests)  
**Erstellt:** 2025-10-18
