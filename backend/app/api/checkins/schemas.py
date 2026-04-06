import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from app.models import Channel, CheckInStatus

class CheckInCreateRequest(BaseModel):
    evacuee_id: uuid.UUID 
    idempotency_key: str
    status: CheckInStatus
    channel: Channel
    battery_level: int | None = Field(default=None, ge=0, le=100)
    device_time: datetime

    # Swagger docs sample
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "evacuee_id": "123e4567-e89b-12d3-a456-426614174000",
                "idempotency_key": "app-tap-1712345678",
                "status": "SAFE",
                "channel": "APP",
                "battery_level": 85,
                "device_time": "2026-04-05T14:30:00Z"
            }
        }
    )
