from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class MovementType(str, Enum):
    entrada = "entrada"
    saida = "saida"


class StockMovementCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    type: MovementType
    quantity: float = Field(..., gt=0)
    reason: str | None = None


class StockMovementProduct(BaseModel):
    id: int
    name: str
    unit_type: str

    class Config:
        from_attributes = True


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    type: MovementType
    quantity: float
    reason: str | None
    created_at: datetime
    user_id: int
    product: StockMovementProduct | None = None

    class Config:
        from_attributes = True
