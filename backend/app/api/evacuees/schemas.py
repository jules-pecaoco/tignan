from pydantic import BaseModel

class EvacueeEnrollRequest(BaseModel):
    name: str
    phone_number: str
    join_code: str
    condition_note: str | None = None
    lat: str | None = None
    lng: str | None = None
    location_text: str | None = None
