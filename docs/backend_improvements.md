# Backend-Verbesserungen für Menschlichkeit Österreich

## 1. Caching-Implementierung mit Redis

### 1.1 Redis-Client Setup
```python
# apps/api/src/cache/redis_client.py
import redis.asyncio as redis
import json
from typing import Any, Optional
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class RedisCache:
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self.redis_url = redis_url
        self.client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Verbindung zu Redis herstellen"""
        try:
            self.client = await redis.from_url(self.redis_url, decode_responses=True)
            await self.client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.client = None
    
    async def disconnect(self):
        """Verbindung zu Redis trennen"""
        if self.client:
            await self.client.close()
            logger.info("Redis connection closed")
    
    async def get(self, key: str) -> Optional[Any]:
        """Wert aus Cache abrufen"""
        if not self.client:
            return None
        try:
            value = await self.client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            logger.warning(f"Cache get error for key {key}: {e}")
        return None
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: timedelta = timedelta(minutes=10)
    ) -> bool:
        """Wert in Cache speichern"""
        if not self.client:
            return False
        try:
            await self.client.setex(
                key,
                ttl,
                json.dumps(value)
            )
            return True
        except Exception as e:
            logger.warning(f"Cache set error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Wert aus Cache löschen"""
        if not self.client:
            return False
        try:
            await self.client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Cache delete error for key {key}: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Alle Werte mit Muster löschen"""
        if not self.client:
            return 0
        try:
            keys = await self.client.keys(pattern)
            if keys:
                return await self.client.delete(*keys)
            return 0
        except Exception as e:
            logger.warning(f"Cache clear pattern error for {pattern}: {e}")
            return 0

# Globale Cache-Instanz
cache = RedisCache()
```

### 1.2 Caching-Decorator
```python
# apps/api/src/cache/decorators.py
from functools import wraps
from datetime import timedelta
import inspect

def cache_result(ttl: timedelta = timedelta(minutes=10), key_prefix: str = ""):
    """Decorator für Caching von Funktionsergebnissen"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Cache-Schlüssel generieren
            cache_key = f"{key_prefix}:{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Aus Cache abrufen
            cached_value = await cache.get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit for {cache_key}")
                return cached_value
            
            # Funktion ausführen
            result = await func(*args, **kwargs)
            
            # In Cache speichern
            await cache.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator
```

### 1.3 Metriken mit Caching
```python
# apps/api/src/routers/metrics_cached.py
from fastapi import APIRouter, Depends
from datetime import timedelta
from src.cache.decorators import cache_result

router = APIRouter(prefix="/metrics", tags=["Metrics"])

@router.get("/members")
@cache_result(ttl=timedelta(minutes=5), key_prefix="metrics")
async def get_members_metrics_cached(
    payload: dict = Depends(verify_jwt_token)
):
    """
    Mitglieder-Metriken mit 5-Minuten-Caching
    """
    require_role(payload, ["board", "treasurer", "admin"])
    stats = await _fetch_civicrm_member_stats()
    logger.info(f"Members metrics (fresh): {stats}")
    return ApiResponse(success=True, data=stats)

@router.get("/finance")
@cache_result(ttl=timedelta(minutes=10), key_prefix="metrics")
async def get_finance_metrics_cached(
    payload: dict = Depends(verify_jwt_token)
):
    """
    Finanz-Metriken mit 10-Minuten-Caching
    """
    require_role(payload, ["treasurer", "admin"])
    stats = await _fetch_civicrm_finance_stats()
    logger.info(f"Finance metrics (fresh): {stats}")
    return ApiResponse(success=True, data=stats)
```

## 2. Asynchrone Aufgabenverarbeitung mit Celery

### 2.1 Celery-Konfiguration
```python
# apps/api/src/tasks/celery_app.py
from celery import Celery
from celery.schedules import crontab
import os

celery_app = Celery(
    'menschlichkeit',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1')
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Europe/Vienna',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 Minuten
    task_soft_time_limit=25 * 60,  # 25 Minuten
)

# Periodische Aufgaben
celery_app.conf.beat_schedule = {
    'social-media-autopost': {
        'task': 'src.tasks.social_media.post_scheduled_content',
        'schedule': crontab(hour=9, minute=0),  # Täglich um 9:00
    },
    'generate-daily-reports': {
        'task': 'src.tasks.reports.generate_daily_report',
        'schedule': crontab(hour=23, minute=59),  # Täglich um 23:59
    },
    'cleanup-expired-sessions': {
        'task': 'src.tasks.maintenance.cleanup_expired_sessions',
        'schedule': crontab(hour=2, minute=0),  # Täglich um 2:00
    },
}
```

### 2.2 Social Media Posting Task
```python
# apps/api/src/tasks/social_media.py
from celery import shared_task
from src.services.social_media import SocialMediaService
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def post_to_social_media(self, title: str, body: str, url: str = "", image_url: str = ""):
    """
    Poste zu Social Media (Hintergrundaufgabe)
    """
    try:
        service = SocialMediaService()
        from src.services.social_media import SocialPost
        
        post = SocialPost(
            title=title,
            body=body,
            url=url,
            image_url=image_url
        )
        
        results = service.crosspost(post)
        logger.info(f"Social media post completed: {results}")
        return {
            "status": "success",
            "results": {p.value: r.__dict__ for p, r in results.items()}
        }
    except Exception as exc:
        logger.error(f"Social media post failed: {exc}")
        # Retry mit exponentieller Backoff-Strategie
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)

@shared_task
def post_scheduled_content():
    """
    Poste geplante Inhalte (periodische Aufgabe)
    """
    logger.info("Posting scheduled content...")
    # Implementierung für geplante Inhalte
    pass
```

### 2.3 Bericht-Generierungs-Task
```python
# apps/api/src/tasks/reports.py
from celery import shared_task
from src.services.reports import ReportService
import logging

logger = logging.getLogger(__name__)

@shared_task
def generate_daily_report():
    """
    Generiere täglichen Bericht
    """
    try:
        service = ReportService()
        report = service.generate_daily_report()
        logger.info(f"Daily report generated: {report}")
        return {"status": "success", "report_id": report.id}
    except Exception as e:
        logger.error(f"Failed to generate daily report: {e}")
        return {"status": "error", "message": str(e)}

@shared_task
def generate_receipt_pdf(amount: float, currency: str, purpose: str = "", email: str = ""):
    """
    Generiere Beleg-PDF (Hintergrundaufgabe)
    """
    try:
        service = ReportService()
        pdf_bytes = service.generate_receipt_pdf(
            amount=amount,
            currency=currency,
            purpose=purpose
        )
        
        if email:
            service.send_receipt_email(email, pdf_bytes)
        
        logger.info(f"Receipt generated and sent to {email}")
        return {"status": "success", "email": email}
    except Exception as e:
        logger.error(f"Failed to generate receipt: {e}")
        return {"status": "error", "message": str(e)}
```

## 3. Rate Limiting und DDoS-Schutz

### 3.1 Rate Limiting mit Slowapi
```python
# apps/api/src/middleware/rate_limit.py
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

limiter = Limiter(key_func=get_remote_address)

def setup_rate_limiting(app: FastAPI):
    """Rate Limiting konfigurieren"""
    
    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={
                "success": False,
                "message": "Rate limit exceeded. Please try again later.",
                "retry_after": exc.detail
            }
        )
    
    # Rate Limits für verschiedene Endpunkte
    app.state.limiter = limiter
    return app
```

### 3.2 Rate Limiting in Routers
```python
# apps/api/src/routers/auth.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
@limiter.limit("5/minute")  # 5 Versuche pro Minute
async def login(request: Request, credentials: LoginRequest):
    """
    Login mit Rate Limiting
    """
    # Implementierung
    pass

@router.post("/register")
@limiter.limit("3/hour")  # 3 Registrierungen pro Stunde
async def register(request: Request, data: RegisterRequest):
    """
    Registrierung mit Rate Limiting
    """
    # Implementierung
    pass
```

## 4. Umfassende Input-Validierung

### 4.1 Erweiterte Pydantic-Modelle
```python
# apps/api/src/schemas/validation.py
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional
import re

class CreateContactRequest(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, regex=r'^\+?[0-9\s\-()]{10,}$')
    
    @validator('first_name', 'last_name')
    def sanitize_names(cls, v):
        # Entferne potentiell gefährliche Zeichen
        v = v.strip()
        if not re.match(r'^[a-zA-ZäöüßÄÖÜ\s\-\']+$', v):
            raise ValueError('Invalid characters in name')
        return v
    
    class Config:
        example = {
            "email": "user@example.com",
            "first_name": "Max",
            "last_name": "Mustermann",
            "phone": "+43 1 234 567"
        }

class CreateMembershipRequest(BaseModel):
    contact_id: int = Field(..., gt=0)
    membership_type_id: int = Field(..., gt=0)
    start_date: str = Field(..., regex=r'^\d{4}-\d{2}-\d{2}$')
    end_date: Optional[str] = Field(None, regex=r'^\d{4}-\d{2}-\d{2}$')
    
    @validator('end_date')
    def validate_dates(cls, v, values):
        if v and 'start_date' in values:
            if v <= values['start_date']:
                raise ValueError('end_date must be after start_date')
        return v
```

### 4.2 Globale Exception Handler
```python
# apps/api/src/middleware/exception_handlers.py
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)

def setup_exception_handlers(app: FastAPI):
    """Exception Handler konfigurieren"""
    
    @app.exception_handler(ValidationError)
    async def validation_exception_handler(request: Request, exc: ValidationError):
        logger.warning(f"Validation error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "message": "Validation error",
                "errors": exc.errors()
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Internal server error"
            }
        )
```

## 5. Datenbank-Migrationen mit Alembic

### 5.1 Alembic-Setup
```bash
# Alembic initialisieren
alembic init alembic

# Konfiguration in alembic.ini anpassen
# sqlalchemy.url = postgresql://user:password@localhost/dbname
```

### 5.2 Migration erstellen
```python
# alembic/versions/001_initial_schema.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'members',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('membership_type', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), default='pending'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, onupdate=sa.func.now()),
    )
    op.create_index('idx_members_email', 'members', ['email'])

def downgrade():
    op.drop_table('members')
```

## 6. Monitoring und Logging

### 6.1 Strukturiertes Logging
```python
# apps/api/src/logging_config.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data, ensure_ascii=False)

def setup_logging():
    """Strukturiertes Logging konfigurieren"""
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler()
    formatter = JSONFormatter()
    handler.setFormatter(formatter)
    logger.addHandler(handler)
```

### 6.2 Health Check Endpunkt
```python
# apps/api/src/routers/health.py
from fastapi import APIRouter, HTTPException
from src.monitoring.service import HealthCheckService

router = APIRouter(prefix="/health", tags=["Health"])
health_service = HealthCheckService()

@router.get("/")
async def health_check():
    """Gesundheitsprüfung"""
    report = await health_service.get_full_health_report()
    
    if report["status"] != "healthy":
        raise HTTPException(status_code=503, detail=report)
    
    return report

@router.get("/ready")
async def readiness_check():
    """Bereitschaftsprüfung für Kubernetes"""
    report = await health_service.get_full_health_report()
    
    if report["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail="Not ready")
    
    return {"status": "ready"}
```

## 7. Implementierungs-Checkliste

- [ ] Redis installieren und konfigurieren
- [ ] Redis-Client implementieren
- [ ] Caching-Decorator erstellen
- [ ] Metriken-Endpunkte mit Caching versehen
- [ ] Celery installieren und konfigurieren
- [ ] Social Media Task implementieren
- [ ] Bericht-Generierungs-Task implementieren
- [ ] Slowapi für Rate Limiting installieren
- [ ] Rate Limiting auf kritischen Endpunkten implementieren
- [ ] Erweiterte Validierungsmodelle erstellen
- [ ] Exception Handler konfigurieren
- [ ] Alembic für Migrationen einrichten
- [ ] Strukturiertes Logging implementieren
- [ ] Health Check Endpunkte erstellen
- [ ] Prometheus-Metriken integrieren
- [ ] Sentry für Error Tracking konfigurieren
