---
title: Performance Optimization Modus
version: 1.0.0
created: 2025-10-08
lastUpdated: 2025-10-08
status: ACTIVE
priority: medium
category: operations
applyTo: **/*
---
```chatmode
---
description: Performance-Optimierung mit MCP-Tools für Multi-Service Austrian NGO Platform
tools: ['codebase', 'fetch', 'search', 'usages']
mcpServers: ['postgres', 'playwright', 'filesystem', 'brave-search', 'github', 'memory']
---

# Performance Optimization Modus

Du befindest dich im **Performance Optimization Modus** mit vollständiger MCP-Integration.

## 🚀 Performance Optimization Pipeline

### Phase 1: Performance Baseline (Playwright MCP)

```
Via Playwright MCP:
"Run Lighthouse audit for all critical pages"

Critical Pages:
□ Homepage (menschlichkeit-oesterreich.at)
□ Donation Form (menschlichkeit-oesterreich.at/spenden)
□ Membership Registration (menschlichkeit-oesterreich.at/mitglied-werden)
□ CRM Dashboard (crm.menschlichkeit-oesterreich.at)
□ API Health (api.menschlichkeit-oesterreich.at/health)
□ Gaming Platform (web/)

Lighthouse Targets:
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 95
- SEO: ≥ 90

BASELINE REPORT:
{PAGE}: P={SCORE}, A={SCORE}, BP={SCORE}, SEO={SCORE}
```text

### Phase 2: Frontend Performance (React/TypeScript)

```
#### Bundle Analysis
Via Filesystem MCP:
"Analyze bundle size for frontend/"

npm run build
ls -lh frontend/dist/assets/*.js

CHECKS:
□ Initial Bundle < 200KB
□ Code-Splitting aktiv?
□ Tree-Shaking konfiguriert?
□ Dynamic Imports verwendet?

Via Brave Search MCP:
"Search for Vite bundle optimization techniques"
"Find React 18 performance best practices"

#### Image Optimization
Via Filesystem MCP:
"Find all images in frontend/public/"

OPTIMIZE:
□ Convert to WebP
□ Responsive Images (srcset)
□ Lazy Loading implemented
□ Next-gen formats (AVIF wenn supported)

Command:
npx sharp-cli \
  --input "frontend/public/images/*.{jpg,png}" \
  --output "frontend/public/images-optimized/" \
  --format webp

#### Code-Splitting Strategy
Via Filesystem MCP:
"Analyze route-based code splitting"

// React.lazy für Routes
const HomePage = lazy(() => import('./pages/Home'));
const DonationForm = lazy(() => import('./pages/Donation'));

// Suspense Wrapper
<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/spenden" element={<DonationForm />} />
  </Routes>
</Suspense>

Via Memory MCP:
"Store code-splitting patterns for future components"
```text

### Phase 3: Backend Performance (FastAPI + PostgreSQL)

```
#### Database Query Optimization
Via PostgreSQL MCP:
"Analyze slow queries"

SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- Queries > 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;

#### N+1 Query Detection
Via PostgreSQL MCP:
"Identify N+1 query patterns"

-- BEFORE (N+1):
for user in users:
    donations = get_donations_by_user(user.id)  # N queries

-- AFTER (JOIN):
SELECT u.*, d.*
FROM users u
LEFT JOIN donations d ON u.id = d.user_id
WHERE u.active = true;

Via Filesystem MCP:
"Update ORM queries to use joins/prefetch"

# FastAPI + SQLAlchemy
from sqlalchemy.orm import joinedload

users = session.query(User)\
    .options(joinedload(User.donations))\
    .all()

#### Index Optimization
Via PostgreSQL MCP:
"Check missing indexes"

SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
ORDER BY n_distinct DESC;

CREATE INDEX RECOMMENDATIONS:
□ email (for login lookups)
□ created_at (for time-based queries)
□ status (for filtering)
□ user_id (foreign keys)

Via PostgreSQL MCP:
"Create indexes with minimal lock time"

CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_donations_user_id ON donations(user_id);

#### Connection Pooling
Via Filesystem MCP:
"Configure connection pooling in API"

# api.menschlichkeit-oesterreich.at/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,        # Max connections
    max_overflow=10,     # Burst capacity
    pool_pre_ping=True,  # Connection health check
    echo=False           # No query logging in prod
)
```text

### Phase 4: Caching Strategy

```
#### Redis Caching (Backend)
Via Filesystem MCP:
"Implement Redis caching for API"

# api.menschlichkeit-oesterreich.at/app/cache.py
from redis import Redis
from functools import wraps

redis_client = Redis(host='localhost', port=6379, decode_responses=True)

def cache_result(ttl=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{args}:{kwargs}"
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator

# Usage:
@router.get("/stats")
@cache_result(ttl=600)  # Cache 10min
async def get_statistics():
    return calculate_stats()

#### Browser Caching (Frontend)
Via Filesystem MCP:
"Configure cache headers in nginx"

# deployment-scripts/nginx/performance.conf
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    add_header Cache-Control "no-cache, must-revalidate";
}

#### Service Worker (PWA)
Via Filesystem MCP:
"Implement Service Worker caching"

// frontend/public/sw.js
const CACHE_NAME = 'menschlichkeit-v1';
const urlsToCache = [
  '/',
  '/spenden',
  '/assets/logo.webp',
  '/assets/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```text

### Phase 5: Network Optimization

```
#### HTTP/2 & Compression
Via Filesystem MCP:
"Enable HTTP/2 in nginx config"

# deployment-scripts/nginx/http2.conf
listen 443 ssl http2;
listen [::]:443 ssl http2;

# Gzip Compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/json application/javascript;

# Brotli (if available)
brotli on;
brotli_types text/plain text/css application/json;

#### CDN für Static Assets
Via Brave Search MCP:
"Search for free CDN options for NGOs"
"Find Austrian CDN providers"

RECOMMENDATION:
- Cloudflare (Free Tier für NGOs)
- BunnyCDN (EU-based, DSGVO-compliant)

Via Filesystem MCP:
"Update asset URLs to use CDN"

// frontend/vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          return `https://cdn.menschlichkeit-oesterreich.at/assets/${assetInfo.name}`;
        }
      }
    }
  }
});

#### Preconnect & DNS-Prefetch
Via Filesystem MCP:
"Add resource hints to HTML"

<!-- website/index.html -->
<link rel="preconnect" href="https://api.menschlichkeit-oesterreich.at">
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="preload" href="/assets/hero.webp" as="image">
```text

### Phase 6: Database Performance (CiviCRM)

```
#### CiviCRM Query Optimization
Via PostgreSQL MCP:
"Analyze CiviCRM slow queries"

SELECT 
  substring(query from 1 for 100) as short_query,
  calls,
  mean_exec_time,
  stddev_exec_time
FROM pg_stat_statements
WHERE query LIKE '%civicrm%'
  AND mean_exec_time > 50
ORDER BY mean_exec_time DESC;

OPTIMIZE:
□ Add indexes to civicrm_contact
□ Optimize civicrm_activity joins
□ Cache frequent contact lookups

Via Filesystem MCP:
"Configure CiviCRM caching"

// crm.menschlichkeit-oesterreich.at/sites/default/civicrm.settings.php
define('CIVICRM_DB_CACHE_CLASS', 'Redis');
define('CIVICRM_DB_CACHE_HOST', 'localhost');
define('CIVICRM_DB_CACHE_PORT', 6379);

#### Contact Search Optimization
Via PostgreSQL MCP:
"Create full-text search index"

CREATE INDEX idx_contact_fulltext 
ON civicrm_contact 
USING gin(to_tsvector('german', 
  COALESCE(display_name, '') || ' ' || 
  COALESCE(email, '')));

-- Usage:
SELECT * FROM civicrm_contact
WHERE to_tsvector('german', display_name || ' ' || email) 
  @@ to_tsquery('german', 'maria & schmidt');
```text

### Phase 7: Monitoring & Metrics

```
#### Real User Monitoring (RUM)
Via Filesystem MCP:
"Implement Web Vitals tracking"

// frontend/src/utils/webVitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to n8n webhook
  fetch('https://n8n.menschlichkeit-oesterreich.at/webhook/vitals', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

#### Performance Budget
Via Filesystem MCP:
"Define performance budgets in Lighthouse CI"

// .github/workflows/lighthouse-ci.yml
performance:
  - metric: first-contentful-paint
    budget: 1.5s
  - metric: speed-index
    budget: 2.0s
  - metric: largest-contentful-paint
    budget: 2.5s
  - metric: time-to-interactive
    budget: 3.0s
  - metric: total-blocking-time
    budget: 300ms

#### Database Monitoring
Via PostgreSQL MCP:
"Create performance monitoring view"

CREATE VIEW performance_metrics AS
SELECT 
  'active_connections' as metric,
  count(*) as value
FROM pg_stat_activity
WHERE state = 'active'
UNION ALL
SELECT 
  'cache_hit_ratio' as metric,
  round(100.0 * sum(heap_blks_hit) / 
    (sum(heap_blks_hit) + sum(heap_blks_read)), 2) as value
FROM pg_statio_user_tables;

-- Alarm wenn Cache Hit Ratio < 95%
```text

### Phase 8: Gaming Platform Performance

```
#### Game Loop Optimization
Via Filesystem MCP:
"Optimize game rendering loop"

// web/js/game-engine.js
class GameEngine {
  constructor() {
    this.lastFrameTime = 0;
    this.fps = 60;
    this.frameInterval = 1000 / this.fps;
  }
  
  gameLoop(currentTime) {
    requestAnimationFrame((t) => this.gameLoop(t));
    
    const deltaTime = currentTime - this.lastFrameTime;
    
    if (deltaTime > this.frameInterval) {
      this.update(deltaTime);
      this.render();
      this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);
    }
  }
}

#### Asset Preloading
Via Filesystem MCP:
"Preload game assets"

// web/js/asset-loader.js
const assets = {
  images: ['player.png', 'enemy.png', 'background.png'],
  sounds: ['jump.mp3', 'coin.mp3']
};

async function preloadAssets() {
  const imagePromises = assets.images.map(src => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.src = `/assets/images/${src}`;
    });
  });
  
  await Promise.all(imagePromises);
}

#### XP Calculation Caching
Via PostgreSQL MCP:
"Cache XP calculations with materialized view"

CREATE MATERIALIZED VIEW user_xp_summary AS
SELECT 
  user_id,
  SUM(xp_earned) as total_xp,
  COUNT(*) as sessions_played,
  MAX(created_at) as last_played
FROM game_sessions
GROUP BY user_id;

-- Refresh periodically (not on every query)
REFRESH MATERIALIZED VIEW CONCURRENTLY user_xp_summary;
```text

### Phase 9: Performance Testing

```
#### Load Testing (k6)
Via Filesystem MCP:
"Create load test script"

// tests/load/api-endpoints.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,        // 100 virtual users
  duration: '5m',  // 5 minutes
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% < 200ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  const res = http.get('https://api.menschlichkeit-oesterreich.at/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}

Via Playwright MCP:
"Run load test and capture metrics"

#### Stress Testing
Via Brave Search MCP:
"Search for database stress testing tools"

RECOMMENDATION: pgbench für PostgreSQL

Via Terminal:
pgbench -c 50 -j 4 -t 1000 $DATABASE_URL

MONITOR:
□ Response Time Degradation
□ Error Rate Increase
□ Database Connection Pool Saturation
```text

### Phase 10: Optimization Report

```
Via Memory MCP:
"Generate performance optimization report"

## Performance Optimization Report

### Before Optimization:
- Homepage Lighthouse: P=72, A=85, BP=88, SEO=91
- API Response Time: 350ms avg
- Database Queries: 150ms avg
- Bundle Size: 450KB

### After Optimization:
- Homepage Lighthouse: P=94, A=92, BP=96, SEO=93 ✅
- API Response Time: 85ms avg ✅
- Database Queries: 45ms avg ✅
- Bundle Size: 180KB ✅

### Key Improvements:
1. Code-Splitting → Bundle Size -60%
2. Database Indexing → Query Time -70%
3. Redis Caching → API Response -76%
4. Image Optimization → LCP -50%

### Remaining Optimizations:
- [ ] CDN implementation
- [ ] HTTP/2 Server Push
- [ ] Service Worker enhancement

Via GitHub MCP:
"Create issue with optimization roadmap"
```text

## 🎯 Performance Targets (SLA)

```
CRITICAL METRICS (Lighthouse):
✅ Performance: ≥ 90
✅ Accessibility: ≥ 90
✅ Best Practices: ≥ 95
✅ SEO: ≥ 90

BACKEND METRICS:
✅ API Response Time: < 100ms (p95)
✅ Database Queries: < 50ms (avg)
✅ Error Rate: < 0.1%
✅ Uptime: ≥ 99.9%

USER EXPERIENCE:
✅ First Contentful Paint: < 1.5s
✅ Largest Contentful Paint: < 2.5s
✅ Time to Interactive: < 3.0s
✅ Total Blocking Time: < 300ms
```text

---

**Ziel:** Lighthouse 90+ auf allen Pages, API < 100ms, 99.9% Uptime
**Monitoring:** Kontinuierlich via Web Vitals + PostgreSQL Metrics
**Iteration:** Monatlicher Performance Review mit Memory MCP Trends

### Schnellstart & Stop-Kriterien
- Schnellstart:
  1) Via Playwright MCP Lighthouse‑Baseline erfassen
  2) Größten Bottleneck (Backend/Frontend/DB) identifizieren
  3) Quick Wins umsetzen, erneut messen und reporten
- STOP bei auffälliger Fehlerquote (>1%) oder Stabilitätsverlust → Rollback/Guardrails vor Optimierung
```
