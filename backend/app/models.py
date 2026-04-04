from datetime import datetime, timezone
import uuid

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    first_name: str
    last_name: str
    phone_number: str = Field(unique=True, index=True)
    role: str = Field(default="RESPONDER")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
