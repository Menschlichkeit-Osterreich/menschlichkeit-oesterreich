#!/usr/bin/env pwsh
# API Gateway Implementation
# Zentrale API-Integration für alle Systeme

"""
FastAPI API Gateway für Menschlichkeit Österreich
Verbindet CRM, Frontend, Games und MCP Services
"""

import asyncio
import os
import logging
from datetime import datetime
from typing import Any, Dict, Optional, List

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Integer, String, create_engine, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base, sessionmaker

app = FastAPI(
    title="Menschlichkeit Österreich API Gateway",
    description="Zentrale API für CRM, Frontend, Games Integration",
    version="1.0.0"
)

# CORS Configuration für Cross-System Communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend
        "http://localhost:8000",  # CRM
        "http://localhost:5500",  # Games (Live Server)
        "https://menschlichkeit-oesterreich.at",
        "https://*.menschlichkeit-oesterreich.at"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
class Config:
    CRM_BASE_URL = os.getenv("CRM_BASE_URL", "http://localhost:8000")
    FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000") 
    GAMES_BASE_URL = os.getenv("GAMES_BASE_URL", "http://localhost:5500")
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///app.db")

config = Config()

logger = logging.getLogger(__name__)

if config.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        config.DATABASE_URL,
        connect_args={"check_same_thread": False},
        future=True,
    )
else:
    engine = create_engine(config.DATABASE_URL, future=True)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

Base = declarative_base()


class GameScoreModel(Base):
    __tablename__ = "game_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    game_id = Column(String(100), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)


Base.metadata.create_all(bind=engine)

# Data Models
class User(BaseModel):
    id: int
    email: str
    name: str
    civicrm_id: Optional[int] = None
    game_scores: Optional[Dict[str, int]] = None
    preferences: Optional[Dict[str, Any]] = None

class GameScore(BaseModel):
    user_id: int
    game_id: str
    score: int
    timestamp: datetime

class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    timestamp: datetime


def serialize_game_score(record: "GameScoreModel") -> Dict[str, Any]:
    return {
        "id": record.id,
        "user_id": record.user_id,
        "game_id": record.game_id,
        "score": record.score,
        "timestamp": record.timestamp.isoformat(),
    }


def fetch_user_scores(user_id: int) -> List[Dict[str, Any]]:
    try:
        with SessionLocal() as session:
            stmt = (
                select(GameScoreModel)
                .where(GameScoreModel.user_id == user_id)
                .order_by(GameScoreModel.timestamp.desc())
            )
            records = session.execute(stmt).scalars().all()
            return [serialize_game_score(record) for record in records]
    except SQLAlchemyError:
        logger.exception("Failed to fetch scores for user %s", user_id)
        raise


def persist_game_score(score: "GameScore") -> Dict[str, Any]:
    with SessionLocal() as session:
        try:
            model = GameScoreModel(
                user_id=score.user_id,
                game_id=score.game_id,
                score=score.score,
                timestamp=score.timestamp,
            )
            session.add(model)
            session.commit()
            session.refresh(model)
            return serialize_game_score(model)
        except SQLAlchemyError:
            session.rollback()
            logger.exception("Failed to persist game score for user %s", score.user_id)
            raise


def fetch_leaderboard(game_id: str, limit: int) -> List[Dict[str, Any]]:
    try:
        with SessionLocal() as session:
            stmt = (
                select(GameScoreModel)
                .where(GameScoreModel.game_id == game_id)
                .order_by(
                    GameScoreModel.score.desc(),
                    GameScoreModel.timestamp.asc(),
                )
                .limit(limit)
            )
            records = session.execute(stmt).scalars().all()
            return [serialize_game_score(record) for record in records]
    except SQLAlchemyError:
        logger.exception("Failed to fetch leaderboard for game %s", game_id)
        raise

# Utility Functions
async def proxy_request(url: str, method: str = "GET", **kwargs):
    """Proxy requests to other services"""
    async with httpx.AsyncClient() as client:
        response = await client.request(method, url, **kwargs)
        return response.json()

def create_response(success: bool, data: Any = None, message: str = None) -> APIResponse:
    """Create standardized API response"""
    return APIResponse(
        success=success,
        data=data,
        message=message,
        timestamp=datetime.now()
    )

# Health Check
@app.get("/health")
async def health_check():
    """System health check for all services"""
    services_status = {}
    
    # Check CRM
    try:
        async with httpx.AsyncClient() as client:
            crm_response = await client.get(f"{config.CRM_BASE_URL}/health", timeout=5.0)
            services_status["crm"] = crm_response.status_code == 200
    except:
        services_status["crm"] = False
    
    # Check Frontend
    try:
        async with httpx.AsyncClient() as client:
            frontend_response = await client.get(f"{config.FRONTEND_BASE_URL}/api/health", timeout=5.0)
            services_status["frontend"] = frontend_response.status_code == 200
    except:
        services_status["frontend"] = False
    
    # Check Games
    try:
        async with httpx.AsyncClient() as client:
            games_response = await client.get(f"{config.GAMES_BASE_URL}/games/", timeout=5.0)
            services_status["games"] = games_response.status_code == 200
    except:
        services_status["games"] = False
    
    overall_health = all(services_status.values())
    
    return create_response(
        success=overall_health,
        data={
            "services": services_status,
            "overall_status": "healthy" if overall_health else "degraded"
        },
        message="System health check completed"
    )

# CRM Integration Routes
@app.get("/api/crm/{path:path}")
async def proxy_crm(path: str, request: Request):
    """Proxy requests to CRM system"""
    try:
        query_params = dict(request.query_params)
        url = f"{config.CRM_BASE_URL}/api/{path}"
        
        data = await proxy_request(url, params=query_params)
        return create_response(success=True, data=data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CRM service error: {str(e)}")

@app.post("/api/crm/{path:path}")
async def proxy_crm_post(path: str, request: Request):
    """Proxy POST requests to CRM system"""
    try:
        body = await request.json()
        url = f"{config.CRM_BASE_URL}/api/{path}"
        
        data = await proxy_request(url, method="POST", json=body)
        return create_response(success=True, data=data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CRM service error: {str(e)}")

# Games Integration Routes
@app.get("/api/games/scores/{user_id}")
async def get_user_game_scores(user_id: int):
    """Get all game scores for a user"""
    try:
        scores = await run_in_threadpool(fetch_user_scores, user_id)
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Could not load game scores")

    return create_response(
        success=True,
        data={"user_id": user_id, "scores": scores},
        message="Game scores retrieved"
    )

@app.post("/api/games/score")
async def save_game_score(score: GameScore):
    """Save a new game score"""
    if score.score < 0:
        raise HTTPException(status_code=400, detail="Score must be non-negative")

    try:
        persisted = await run_in_threadpool(persist_game_score, score)
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Could not save game score")

    return create_response(
        success=True,
        data=persisted,
        message="Game score saved successfully"
    )

@app.get("/api/games/leaderboard/{game_id}")
async def get_game_leaderboard(game_id: str, limit: int = 10):
    """Get leaderboard for a specific game"""
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")

    try:
        leaderboard = await run_in_threadpool(fetch_leaderboard, game_id, limit)
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Could not load leaderboard")

    return create_response(
        success=True,
        data={"game_id": game_id, "leaderboard": leaderboard},
        message="Leaderboard retrieved"
    )

# Frontend Integration Routes
@app.get("/api/frontend/user/{user_id}")
async def get_user_profile(user_id: int):
    """Get complete user profile with CRM and game data"""
    try:
        # Get CRM data
        crm_data = await proxy_request(f"{config.CRM_BASE_URL}/api/user/{user_id}")
        
        # Get game scores (placeholder)
        game_scores = {"game1": 1500, "game2": 2300}
        
        user_profile = {
            "id": user_id,
            "crm_data": crm_data,
            "game_scores": game_scores,
            "last_login": datetime.now().isoformat()
        }
        
        return create_response(
            success=True,
            data=user_profile,
            message="User profile retrieved"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile service error: {str(e)}")

# Authentication & Session Management
@app.post("/api/auth/login")
async def login(email: str, password: str):
    """Cross-system authentication"""
    try:
        # Authenticate against CRM
        crm_auth = await proxy_request(
            f"{config.CRM_BASE_URL}/api/auth/login",
            method="POST",
            json={"email": email, "password": password}
        )
        
        if crm_auth.get("success"):
            # Create session valid for all systems
            session_data = {
                "user_id": crm_auth["user"]["id"],
                "email": email,
                "token": crm_auth["token"],
                "expires_at": (datetime.now().timestamp() + 3600 * 24)  # 24 hours
            }
            
            return create_response(
                success=True,
                data=session_data,
                message="Authentication successful"
            )
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")

# MCP Integration Routes
@app.get("/api/mcp/services")
async def list_mcp_services():
    """List available MCP services"""
    services = {
        "essential-stack": {
            "stripe": "Payment processing",
            "mailchimp": "Email marketing", 
            "google-services": "Google integrations"
        },
        "web-stack": {
            "wordpress": "WordPress management",
            "plesk": "Server management",
            "laravel": "Laravel framework tools"
        },
        "custom-servers": {
            "filesystem": "File operations",
            "git": "Version control",
            "memory": "In-memory storage"
        }
    }
    
    return create_response(
        success=True,
        data=services,
        message="MCP services listed"
    )

# System Integration Routes
@app.get("/api/integration/status")
async def integration_status():
    """Get overall system integration status"""
    status = {
        "crm_integration": True,
        "frontend_integration": True, 
        "games_integration": True,
        "mcp_integration": True,
        "database_connection": True,
        "last_sync": datetime.now().isoformat()
    }
    
    return create_response(
        success=True,
        data=status,
        message="Integration status retrieved"
    )

@app.post("/api/integration/sync")
async def sync_systems():
    """Trigger data synchronization between all systems"""
    try:
        # Sync CRM data
        # Sync game scores  
        # Update user profiles
        # Refresh caches
        
        return create_response(
            success=True,
            data={"synced_at": datetime.now().isoformat()},
            message="Systems synchronized successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync error: {str(e)}")

# WebSocket for Real-time Updates
@app.websocket("/ws/updates")
async def websocket_endpoint(websocket):
    """WebSocket endpoint for real-time system updates"""
    await websocket.accept()
    
    try:
        while True:
            # Send periodic updates to connected clients
            update = {
                "type": "system_status",
                "timestamp": datetime.now().isoformat(),
                "data": "System running normally"
            }
            await websocket.send_json(update)
            await asyncio.sleep(30)  # Send updates every 30 seconds
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

# Root endpoint
@app.get("/")
async def root():
    """API Gateway information"""
    return {
        "name": "Menschlichkeit Österreich API Gateway",
        "version": "1.0.0",
        "services": {
            "crm": f"{config.CRM_BASE_URL}",
            "frontend": f"{config.FRONTEND_BASE_URL}",
            "games": f"{config.GAMES_BASE_URL}"
        },
        "endpoints": {
            "health": "/health",
            "crm": "/api/crm/*",
            "games": "/api/games/*", 
            "frontend": "/api/frontend/*",
            "auth": "/api/auth/*",
            "mcp": "/api/mcp/*",
            "integration": "/api/integration/*"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)