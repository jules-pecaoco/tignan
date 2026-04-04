from datetime import datetime, timezone
from enum import Enum
from operator import ge
import uuid

from sqlmodel import Field, Integer, SQLModel


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


class RiskLevel(str, Enum):
    UNKNOWN = "UNKNOWN"
    SAFE = "SAFE"
    ATTENTION = "ATTENTION"
    CRITICAL = "CRITICAL"

class ConditionNote(str, Enum):
    SAFE = "SAFE"
    NEEDS_SUPPLIES = "NEEDS_SUPPLIES"
    NEEDS_MEDICAL = "NEEDS_MEDICAL"

class Evacuee(SQLModel, table=True):
    """
    Creates evacuee table for citizens
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    event_id: uuid.UUID = Field(foreign_key="event.id")
    name: str
    phone_number: str = Field(index=True)
    risk_level: RiskLevel = RiskLevel.UNKNOWN
    condition_note: ConditionNote | None
    lat: float | None = Field(default=None)
    lng: float | None = Field(default=None)
    location_text: str | None = Field(default=None)
    battery: int | None = Field(default=None, ge=0, le=100)
    enrolled_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))


class AlertType(str, Enum):
    SOS = "SOS"
    MISSED_CHECKIN = "MISSED_CHECKIN"
    LOW_BATTERY = "LOW_BATTERY"

class Status(str, Enum):
    OPEN = "OPEN"
    AKNOWLEDGED = "AKNOWLEDGED"
    RESOLVED = "RESOLVED"

class Alert(SQLModel, table=True):
    """
    Creates alert table for tracking actionable tasks for responders
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    event_id: uuid.UUID = Field(foreign_key="event.id")
    evacuee_id: uuid.UUID = Field(foreign_key="evacuee.id")
    alert_type: AlertType
    status: Status = Field(default=Status.OPEN)
    responder_id: uuid.UUID | None = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
    resolved_at: datetime | None = Field(default=None)

