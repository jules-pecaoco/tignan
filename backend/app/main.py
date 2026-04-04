from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from app.db.database import engine
from app.api import core

import app.models

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs once when the server boots. 
    # It looks at models.py and creates the tables in Render!
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(lifespan=lifespan, title="Tignan API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change to your Vercel URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach the test router
app.include_router(core.router)
