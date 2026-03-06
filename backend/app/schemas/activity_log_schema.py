from pydantic import BaseModel
from datetime import datetime

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    entity: str
    entity_id: int
    timestamp: datetime

    class Config:
        from_attributes = True