from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from app.db.database import engine
from app.api import core

import app.models
from app.api.events.router import router as event_router
from app.api.evacuees.router import router as enroll_router
from app.api.checkins.router import router as checkins_router
from app.api.alerts.router import router as alert_router
from app.api.ws.router import router as ws_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs once when the server boots. 
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(lifespan=lifespan, title="Tignan API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(core.router)
app.include_router(event_router)
app.include_router(enroll_router)
app.include_router(checkins_router)
app.include_router(alert_router)
app.include_router(ws_router)

