from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from .customer_schema import CustomerResponse

class SaleItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
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
    customer_id: Optional[int] = None
    customer: Optional[CustomerResponse] = None
    items: List[SaleItemResponse]

    class Config:
        from_attributes = True