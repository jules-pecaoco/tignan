from collections.abc import Generator
from typing import Any

from sqlalchemy import Engine
from sqlmodel import Session, create_engine
from app.core.config import settings

engine: Engine = create_engine(url=settings.DATABASE_URL, echo=True)

def get_session() -> Generator[Session, Any, None]:
    with Session(engine) as session:
        yield session
