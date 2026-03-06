from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class SaleItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)

class SaleCreate(BaseModel):
    items: List[SaleItemCreate] = Field(..., min_items=1)

class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float

    class Config:
        from_attributes = True

class SaleResponse(BaseModel):
    id: int
    total: float
    created_at: datetime
    items: List[SaleItemResponse]

    class Config:
        from_attributes = True