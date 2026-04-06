import uuid
from pydantic import BaseModel, ConfigDict

class AlertAcknowledgeRequest(BaseModel):
    responder_id: uuid.UUID | None = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "responder_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }
    )
