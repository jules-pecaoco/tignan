from typing import Any
from pydantic import BaseModel, Field, ConfigDict

class EventCreateRequest(BaseModel):
    name: str = Field(min_length=3, max_length=100)
    description: str | None = None
    join_code: str = Field(min_length=4, max_length=15, pattern=r"^[A-Z0-9_]+$")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Typhoon Carina",
                "description": "Evacuation operations for NCR",
                "join_code": "CARINA24"
            }
        }
    )

class DashboardResponse(BaseModel):
    event_name: str
    is_active: bool
    total_evacuees: int
    total_active_sos: int
    total_active_battery: int
    urgent_alerts: list[dict[str, Any]]
