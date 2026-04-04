from datetime import datetime, timezone
import uuid

from sqlmodel import Column, Field, ForeignKey, Integer, SQLModel


class User(SQLModel, table=True):
    """
    Creates user table (responders/coordinators)
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    first_name: str
    last_name: str
    phone_number: str = Field(unique=True, index=True)
    role: str = Field(default="RESPONDER")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Event(SQLModel, table=True):
    """
    Creates event table to track evacuation events
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    coordinator_id: uuid.UUID = Field(foreign_key="user.id")
    name: str
    barangay: str
    join_code: str = Field(unique=True, index=True)
    checkin_interval: int = Field(default=120)
    is_active: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
