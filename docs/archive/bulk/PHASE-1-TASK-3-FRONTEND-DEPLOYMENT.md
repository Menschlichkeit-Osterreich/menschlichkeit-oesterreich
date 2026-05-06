# Phase 1 - Task 3: Frontend Production Deployment

## 📋 Übersicht

**Ziel:** React SPA auf Plesk Subdomain `frontend.menschlichkeit-oesterreich.at` deployen

**Aktueller Status:**

- ✅ Frontend Code existiert (`frontend/`)
- ✅ API Endpoints bereit (`/privacy/*`)
- ✅ Design System integriert (Figma Tokens)
- ⏳ Production Build fehlt
- ⏳ Plesk Deployment fehlt

**Geschätzte Dauer:** 3 Tage

---

## 🎯 Deployment-Strategie

### Phase 3.1: Production Build (Tag 1)

**Schritte:**

1. ✅ Environment Configuration
   - `.env.production` erstellen
   - `VITE_API_BASE_URL` setzen
   - Build-Optimierung konfigurieren

2. ✅ Build ausführen

   ```bash
   cd frontend
   npm run build
   # Output: dist/ Verzeichnis
   ```

3. ✅ Build validieren
   - Bundle-Größe prüfen (<500KB initial)
   - Source Maps generiert
   - Assets optimiert (images, fonts)

**Deliverables:**

- `frontend/dist/` → Production-ready Bundle
- `frontend/.env.production` → API URLs konfiguriert
- Build-Report mit Größen-Analyse

---

### Phase 3.2: Plesk Konfiguration (Tag 2)

**Schritte:**

1. ✅ Subdomain erstellen
   - Plesk Panel: `frontend.menschlichkeit-oesterreich.at`
   - Document Root: `/var/www/vhosts/.../frontend/`
   - SSL/TLS Certificate (Let's Encrypt)

2. ✅ Nginx Reverse Proxy

   ```nginx
   # /api/* → FastAPI Backend
   location /api/ {
       proxy_pass http://localhost:8001/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   
   # SPA Routing (alle anderen Requests → index.html)
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

3. ✅ Static Asset Optimization
   - Gzip Compression aktivieren
   - Browser Caching (1 Jahr für assets)
   - Security Headers (CSP, HSTS)

**Deliverables:**

- Nginx Config: `deployment-scripts/nginx/frontend-spa.conf`
- SSL Certificate: Aktiv und validiert
- DNS: `frontend.menschlichkeit-oesterreich.at` → Server IP

---

### Phase 3.3: Deployment & Testing (Tag 3)

**Schritte:**

1. ✅ Upload Build

   ```bash
   ./deployment-scripts/deploy-frontend-plesk.sh
   # Synct dist/ → Plesk Document Root
   ```

2. ✅ Smoke Tests
   - Health Check: `https://frontend.menschlichkeit-oesterreich.at/`
   - API Integration: Privacy Center → `/api/privacy/health`
   - Route Testing: `/about`, `/privacy` → SPA Routing

3. ✅ Performance Validation
   - Lighthouse Audit: P≥90, A11y≥90
   - First Contentful Paint <1.5s
   - Time to Interactive <3s

**Deliverables:**

- Live URL: `https://frontend.menschlichkeit-oesterreich.at`
- Lighthouse Report: Alle Scores ≥90
- Deployment Script: `deploy-frontend-plesk.sh`

---

## 🔧 Technische Details

### Frontend Build Configuration

**File:** `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-toast']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### Environment Variables

**File:** `frontend/.env.production`

```bash
VITE_API_BASE_URL=https://api.menschlichkeit-oesterreich.at
VITE_APP_TITLE="Menschlichkeit Österreich"
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=https://...  # Optional
```

### API Integration Points

**File:** `frontend/src/services/config.ts`

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

export const API_ENDPOINTS = {
  privacy: {
    requestDeletion: `${API_BASE_URL}/privacy/data-deletion`,
    getRequests: `${API_BASE_URL}/privacy/data-deletion`,
    health: `${API_BASE_URL}/privacy/health`
  },
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`
  }
}
```

---

## 📊 Deployment Checklist

### Pre-Deployment

- [ ] Environment Variables gesetzt (`.env.production`)
- [ ] Build erfolgreich (`npm run build`)
- [ ] Bundle Größe validiert (<500KB initial)
- [ ] Source Maps generiert
- [ ] API URLs korrekt (production endpoints)

### Plesk Setup

- [ ] Subdomain erstellt (`frontend.menschlichkeit-oesterreich.at`)
- [ ] Document Root konfiguriert
- [ ] SSL Certificate aktiv (Let's Encrypt)
- [ ] Nginx Config deployed
- [ ] Reverse Proxy getestet (`/api/*` → Backend)

### Post-Deployment

- [ ] Health Check: Frontend lädt
- [ ] SPA Routing funktioniert (`/about`, `/privacy`)
- [ ] API Integration: Privacy Center kommuniziert mit Backend
- [ ] Performance: Lighthouse Scores ≥90
- [ ] Security Headers gesetzt (CSP, HSTS, X-Frame-Options)
- [ ] CORS konfiguriert (API erlaubt frontend.menschlichkeit-oesterreich.at)

---

## 🚨 Bekannte Herausforderungen

### 1. CORS Configuration

**Problem:** API blockiert Requests von Frontend-Subdomain

**Lösung:** FastAPI CORS Middleware updaten

**File:** `api.menschlichkeit-oesterreich.at/app/main.py`

```python
ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend.menschlichkeit-oesterreich.at",
        "https://menschlichkeit-oesterreich.at",
        "http://localhost:3000"  # Dev only
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. SPA Routing on Plesk

**Problem:** Direct URL access (`/privacy`) gibt 404

**Lösung:** Nginx `try_files` Directive

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 3. API Proxy für Development

**Problem:** Different domains (localhost:3000 vs localhost:8001) → CORS Preflight

**Lösung:** Vite Proxy (bereits konfiguriert)

```typescript
server: {
  proxy: {
    '/api': 'http://localhost:8001'
  }
}
```

---

## 🔐 Security Considerations

### Content Security Policy

**Nginx Header:**

```nginx
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.menschlichkeit-oesterreich.at;
";
```

### HTTPS Enforcement

```nginx
# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name frontend.menschlichkeit-oesterreich.at;
    return 301 https://$server_name$request_uri;
}
```

### Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## 📈 Success Metrics

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | <1.5s | Lighthouse |
| Largest Contentful Paint | <2.5s | Lighthouse |
| Total Blocking Time | <200ms | Lighthouse |
| Cumulative Layout Shift | <0.1 | Lighthouse |
| Speed Index | <3.0s | Lighthouse |

### Lighthouse Scores

| Category | Target | Actual |
|----------|--------|--------|
| Performance | ≥90 | TBD |
| Accessibility | ≥90 | TBD |
| Best Practices | ≥95 | TBD |
| SEO | ≥90 | TBD |

### Bundle Size Limits

| Bundle | Max Size | Actual |
|--------|----------|--------|
| Initial JS | 500KB | TBD |
| Initial CSS | 100KB | TBD |
| Vendor Chunks | 300KB | TBD |
| Total (gzipped) | 200KB | TBD |

---

## 🎯 Next Steps (nach Completion)

1. **Monitoring Setup**
   - Sentry Error Tracking
   - Analytics (optional)
   - Uptime Monitoring

2. **CI/CD Pipeline**
   - GitHub Actions für Auto-Deploy
   - Automated Lighthouse Checks
   - Bundle Size Monitoring

3. **Content Updates**
   - CMS Integration (optional)
   - Multi-Language Support (DE/EN)
   - SEO Optimization

---

## 📚 Related Documentation

- **API Integration:** `quality-reports/PHASE-1-PROGRESS-RIGHT-TO-ERASURE-API.md`
- **Design System:** `figma-design-system/ARCHITECTURE.md`
- **Plesk Setup:** Root-level `PLESK-*.md` files
- **Nginx Config:** `deployment-scripts/nginx/`

---

**Status:** READY TO START (pending n8n workflow activation)
**Owner:** DevOps Team
**Priority:** HIGH (blocks E2E testing)
