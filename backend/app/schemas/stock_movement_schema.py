from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class MovementType(str, Enum):
    entrada = "entrada"
    saida = "saida"

class StockMovementCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    type: MovementType
    quantity: int = Field(..., gt=0)
    reason: str | None = None

class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    type: MovementType
    quantity: int
    reason: str | None
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True