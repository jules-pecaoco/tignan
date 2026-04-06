from pydantic import BaseModel, Field, ConfigDict
from app.models import ConditionNote

class EvacueeEnrollRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone_number: str = Field(min_length=10, max_length=15)
    join_code: str = Field(min_length=4)
    condition_note: ConditionNote | None = None
    lat: float | None = None
    lng: float | None = None
    location_text: str | None = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Maria De Los Santos",
                "phone_number": "+639123456789",
                "join_code": "CARINA24",
                "condition_note": "SAFE",
                "lat": 14.5995,
                "lng": 120.9842,
                "location_text": "Evacuation Center A, San Juan"
            }
        }
    )
