# Frontend Production Build - Deployment Ready

**Generated:** 2025-10-04  
**Build Status:** ✅ SUCCESS  
**Bundle Size:** 218KB gzipped (56% under target)

---

## Build Summary

### Environment

- **Build Tool:** Vite 7.1.9
- **Build Time:** 5.01s
- **Modules:** 447 transformed
- **Mode:** Production

### Bundle Analysis

| Asset | Size (Uncompressed) | Size (Gzipped) | Status |
|-------|---------------------|----------------|--------|
| index.html | 0.65 KB | 0.40 KB | ✅ |
| index-CGXVSqrA.css | 191.96 KB | 30.22 KB | ✅ |
| Home-TWGka0hi.js | 3.31 KB | 0.75 KB | ✅ |
| react-CUYz84z8.js | 313.78 KB | 96.55 KB | ✅ |
| index-B-7f4IPW.js | 388.85 KB | 90.11 KB | ✅ |
| **TOTAL** | **~898 KB** | **~218 KB** | ✅ PASSED |

**Target:** <500KB gzipped  
**Actual:** 218KB gzipped  
**Margin:** 56% under target

---

## Environment Configuration

### Production URLs (.env.production)

```env
VITE_API_BASE_URL=https://api.menschlichkeit-oesterreich.at
VITE_CIVICRM_BASE_URL=https://crm.menschlichkeit-oesterreich.at
VITE_GAMES_BASE_URL=https://menschlichkeit-oesterreich.at/games
```

### Feature Flags

| Feature | Status |
|---------|--------|
| Registration | ✅ Enabled |
| Donations | ✅ Enabled |
| Games | ✅ Enabled |
| Newsletter | ✅ Enabled |
| Analytics | ✅ Enabled (Matomo self-hosted) |
| Debug Mode | ❌ Disabled |
| DevTools | ❌ Disabled |

---

## Deployment Instructions

### Step 1: Plesk Subdomain Setup

1. **Create Subdomain:**
   - Login to Plesk Panel
   - Domains → Add Subdomain
   - Subdomain: `frontend`
   - Domain: `menschlichkeit-oesterreich.at`
   - Document Root: `/var/www/vhosts/menschlichkeit-oesterreich.at/frontend/`

2. **SSL Certificate:**
   - SSL/TLS Certificates → Let's Encrypt
   - Check: Secure the domain
   - Check: Secure the wildcard domain
   - Check: Assign the certificate to: Mail domain
   - Install

3. **Force HTTPS:**
   - Apache & nginx Settings
   - Check: Permanent SEO-safe 301 redirect from HTTP to HTTPS

### Step 2: Upload Build Files

**Option A: Plesk File Manager**

1. Files → Upload
2. Navigate to: `/var/www/vhosts/menschlichkeit-oesterreich.at/frontend/`
3. Upload all files from `frontend/dist/`

**Option B: SFTP**

```bash
# From project root
sftp user@menschlichkeit-oesterreich.at
> cd /var/www/vhosts/menschlichkeit-oesterreich.at/frontend/
> put -r frontend/dist/* .
```

**Option C: rsync (Recommended)**

```bash
cd frontend/dist
rsync -avz --delete \
  . user@menschlichkeit-oesterreich.at:/var/www/vhosts/menschlichkeit-oesterreich.at/frontend/
```

### Step 3: Nginx Configuration

Create file: `/etc/nginx/conf.d/frontend-spa.conf`

```nginx
server {
    listen 443 ssl http2;
    server_name frontend.menschlichkeit-oesterreich.at;

    # SSL Configuration (managed by Plesk/Let's Encrypt)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Document Root
    root /var/www/vhosts/menschlichkeit-oesterreich.at/frontend;
    index index.html;

    # SPA Routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Reverse Proxy
    location /api/ {
        proxy_pass http://localhost:8001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # CORS Headers
        add_header Access-Control-Allow-Origin "https://frontend.menschlichkeit-oesterreich.at" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }

    # Static Assets Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.menschlichkeit-oesterreich.at https://crm.menschlichkeit-oesterreich.at;" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 256;
}

# HTTP to HTTPS Redirect
server {
    listen 80;
    server_name frontend.menschlichkeit-oesterreich.at;
    return 301 https://$server_name$request_uri;
}
```

### Step 4: API CORS Configuration

Update `api.menschlichkeit-oesterreich.at/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend.menschlichkeit-oesterreich.at",
        "https://menschlichkeit-oesterreich.at"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 5: Verification Tests

```bash
# 1. Health Check
curl -I https://frontend.menschlichkeit-oesterreich.at

# 2. SPA Routing Test
curl -I https://frontend.menschlichkeit-oesterreich.at/about
# Should return 200 OK (not 404)

# 3. API Proxy Test
curl https://frontend.menschlichkeit-oesterreich.at/api/privacy/health

# 4. Security Headers Test
curl -I https://frontend.menschlichkeit-oesterreich.at | grep -E "X-Frame|X-Content|CSP"
```

---

## Performance Validation

### Lighthouse Audit

```bash
cd frontend
npm run lh:ci
```

**Targets:**

- Performance: ≥90
- Accessibility: ≥90
- Best Practices: ≥95
- SEO: ≥90

### Expected Performance Metrics

| Metric | Target | Expected |
|--------|--------|----------|
| First Contentful Paint (FCP) | <1.5s | ~0.8s |
| Largest Contentful Paint (LCP) | <2.5s | ~1.2s |
| Time to Interactive (TTI) | <3.0s | ~1.5s |
| Total Blocking Time (TBT) | <200ms | ~100ms |
| Cumulative Layout Shift (CLS) | <0.1 | ~0.05 |

---

## Troubleshooting

### Issue: 404 on SPA Routes

**Cause:** Nginx not configured for SPA routing  
**Fix:** Add `try_files $uri $uri/ /index.html;` to nginx config

### Issue: API Calls Blocked by CORS

**Cause:** CORS middleware not configured  
**Fix:** Update FastAPI CORS settings (see Step 4)

### Issue: Mixed Content Warnings

**Cause:** HTTP resources loaded on HTTPS page  
**Fix:** Ensure all URLs in .env.production use `https://`

### Issue: Slow Initial Load

**Cause:** Unoptimized bundle  
**Fix:** Run `npm run build` with production optimizations (already done)

---

## Rollback Plan

If deployment fails:

1. **Backup Current Version:**

   ```bash
   mv /var/www/vhosts/.../frontend /var/www/vhosts/.../frontend.backup
   ```

2. **Restore Previous Version:**

   ```bash
   mv /var/www/vhosts/.../frontend.backup /var/www/vhosts/.../frontend
   ```

3. **Nginx Reload:**

   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

---

## Checklist

### Pre-Deployment

- [x] Production build successful
- [x] Bundle size validated (<500KB gzipped)
- [x] Environment variables configured
- [x] Feature flags reviewed
- [ ] Plesk subdomain created
- [ ] SSL certificate installed
- [ ] Nginx configuration updated

### Deployment

- [ ] Files uploaded to Plesk
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Nginx reloaded
- [ ] API CORS updated
- [ ] API server restarted

### Post-Deployment

- [ ] Health check passed
- [ ] SPA routing verified
- [ ] API integration tested
- [ ] Security headers verified
- [ ] Lighthouse audit ≥90
- [ ] Performance metrics validated
- [ ] Monitoring enabled

---

## Support

**Documentation:** `quality-reports/PHASE-1-TASK-3-FRONTEND-DEPLOYMENT.md`  
**Contact:** development team  
**Deployment Date:** 2025-10-04
