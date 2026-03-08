# Infrastruktur- und Deployment-Verbesserungen für Menschlichkeit Österreich

## 1. Docker-Konfiguration und Containerisierung

### 1.1 Optimiertes Dockerfile für Frontend
```dockerfile
# apps/website/Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Abhängigkeiten kopieren
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Abhängigkeiten installieren
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Quellcode kopieren
COPY . .

# Build
RUN pnpm build

# Production Stage
FROM node:22-alpine

WORKDIR /app

# Nur notwendige Dateien kopieren
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Port exponieren
EXPOSE 3000

# Start
CMD ["npm", "run", "preview"]
```

### 1.2 Optimiertes Dockerfile für Backend
```dockerfile
# apps/api/Dockerfile
FROM python:3.11-slim AS builder

WORKDIR /app

# Abhängigkeiten installieren
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python-Abhängigkeiten
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production Stage
FROM python:3.11-slim

WORKDIR /app

# Nur notwendige Dateien kopieren
COPY --from=builder /root/.local /root/.local
COPY . .

# Environment
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Port exponieren
EXPOSE 8000

# Start
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 1.3 Docker Compose für lokale Entwicklung
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: menschlichkeit_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD:-postgres}@postgres:5432/menschlichkeit_db
      REDIS_URL: redis://redis:6379/0
      JWT_SECRET: ${JWT_SECRET:-dev-secret-key}
      CIVI_API_KEY: ${CIVI_API_KEY}
      CIVI_SITE_KEY: ${CIVI_SITE_KEY}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./apps/api:/app

  website:
    build:
      context: .
      dockerfile: apps/website/Dockerfile
    environment:
      VITE_API_BASE_URL: http://localhost:8000
      VITE_API_TIMEOUT_MS: 15000
    ports:
      - "3000:3000"
    depends_on:
      - api
    volumes:
      - ./apps/website:/app

  celery:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    command: celery -A src.tasks.celery_app worker --loglevel=info
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD:-postgres}@postgres:5432/menschlichkeit_db
      REDIS_URL: redis://redis:6379/0
      CELERY_BROKER_URL: redis://redis:6379/0
      CELERY_RESULT_BACKEND: redis://redis:6379/1
    depends_on:
      - postgres
      - redis
      - api

  celery-beat:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    command: celery -A src.tasks.celery_app beat --loglevel=info
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD:-postgres}@postgres:5432/menschlichkeit_db
      REDIS_URL: redis://redis:6379/0
      CELERY_BROKER_URL: redis://redis:6379/0
      CELERY_RESULT_BACKEND: redis://redis:6379/1
    depends_on:
      - postgres
      - redis
      - api

volumes:
  postgres_data:
  redis_data:
```

## 2. CI/CD-Pipelines mit GitHub Actions

### 2.1 Frontend CI/CD Pipeline
```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'apps/website/**'
      - '.github/workflows/frontend.yml'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'apps/website/**'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'
          cache-dependency-path: 'apps/website/pnpm-lock.yaml'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        working-directory: apps/website
      
      - name: Lint
        run: pnpm lint
        working-directory: apps/website
      
      - name: Type check
        run: pnpm type-check
        working-directory: apps/website
      
      - name: Build
        run: pnpm build
        working-directory: apps/website
      
      - name: Test
        run: pnpm test
        working-directory: apps/website
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/website/coverage/coverage-final.json

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  deploy-preview:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Preview
        run: |
          echo "Deploying preview to Vercel..."
          # Vercel deployment command
```

### 2.2 Backend CI/CD Pipeline
```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'apps/api/**'
      - '.github/workflows/backend.yml'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'apps/api/**'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r apps/api/requirements.txt
          pip install pytest pytest-cov pytest-asyncio
      
      - name: Lint with flake8
        run: |
          flake8 apps/api/src --count --select=E9,F63,F7,F82 --show-source --statistics
      
      - name: Type check with mypy
        run: |
          mypy apps/api/src --ignore-missing-imports
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379/0
        run: |
          pytest apps/api/tests -v --cov=apps/api/src --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Bandit Security Scan
        run: |
          pip install bandit
          bandit -r apps/api/src -f json -o bandit-report.json || true
      
      - name: Upload Bandit Report
        uses: actions/upload-artifact@v3
        with:
          name: bandit-report
          path: bandit-report.json

  deploy-staging:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Staging
        run: |
          echo "Deploying to staging environment..."
          # Deployment command
```

## 3. Kubernetes-Deployment

### 3.1 Kubernetes Deployment für Backend
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  namespace: menschlichkeit
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: menschlichkeit/api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 3.2 Kubernetes Service
```yaml
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: menschlichkeit
spec:
  type: LoadBalancer
  selector:
    app: api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
```

### 3.3 Kubernetes Ingress
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: menschlichkeit-ingress
  namespace: menschlichkeit
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.menschlichkeit-oesterreich.at
    - menschlichkeit-oesterreich.at
    secretName: menschlichkeit-tls
  rules:
  - host: api.menschlichkeit-oesterreich.at
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
  - host: menschlichkeit-oesterreich.at
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: website-service
            port:
              number: 80
```

## 4. Monitoring und Observability

### 4.1 Prometheus-Konfiguration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
```

### 4.2 Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Menschlichkeit Österreich - API Monitoring",
    "panels": [
      {
        "title": "API Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "API Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Database Connections",
        "targets": [
          {
            "expr": "pg_stat_activity_count"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~'5..'}[5m])"
          }
        ]
      }
    ]
  }
}
```

## 5. Secrets Management

### 5.1 Kubernetes Secrets
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
  namespace: menschlichkeit
type: Opaque
stringData:
  url: postgresql://user:password@postgres:5432/menschlichkeit_db

---
apiVersion: v1
kind: Secret
metadata:
  name: jwt-secret
  namespace: menschlichkeit
type: Opaque
stringData:
  secret: your-jwt-secret-key

---
apiVersion: v1
kind: Secret
metadata:
  name: stripe-secret
  namespace: menschlichkeit
type: Opaque
stringData:
  key: sk_live_xxxxx
```

### 5.2 Environment-Datei (.env.production)
```bash
# .env.production
NODE_ENV=production
VITE_API_BASE_URL=https://api.menschlichkeit-oesterreich.at
VITE_API_TIMEOUT_MS=15000
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_PAYPAL_CLIENT_ID=xxxxx

DATABASE_URL=postgresql://user:password@postgres:5432/menschlichkeit_db
REDIS_URL=redis://redis:6379/0
JWT_SECRET=your-jwt-secret-key
CIVI_API_KEY=xxxxx
CIVI_SITE_KEY=xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/1

LOG_LEVEL=INFO
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

## 6. Backup und Disaster Recovery

### 6.1 PostgreSQL Backup Script
```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups/postgresql"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/menschlichkeit_db_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

# Backup erstellen
pg_dump -h localhost -U postgres menschlichkeit_db | gzip > "$BACKUP_FILE"

# Alte Backups löschen (älter als 30 Tage)
find "$BACKUP_DIR" -type f -mtime +30 -delete

# Backup zu S3 hochladen
aws s3 cp "$BACKUP_FILE" s3://menschlichkeit-backups/postgresql/

echo "Backup completed: $BACKUP_FILE"
```

### 6.2 Backup Cronjob
```bash
# Täglich um 2:00 Uhr Backup erstellen
0 2 * * * /scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

## 7. Implementierungs-Checkliste

- [ ] Dockerfiles optimieren
- [ ] Docker Compose für Entwicklung einrichten
- [ ] GitHub Actions Workflows erstellen
- [ ] Frontend CI/CD Pipeline testen
- [ ] Backend CI/CD Pipeline testen
- [ ] Kubernetes Manifests erstellen
- [ ] Ingress und TLS konfigurieren
- [ ] Prometheus und Grafana einrichten
- [ ] Monitoring Dashboards erstellen
- [ ] Secrets Management implementieren
- [ ] Backup-Strategie implementieren
- [ ] Disaster Recovery Plan erstellen
- [ ] Load Testing durchführen
- [ ] Security Scanning in CI/CD integrieren
- [ ] Logging und Error Tracking konfigurieren
