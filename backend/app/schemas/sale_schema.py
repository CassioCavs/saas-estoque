from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from .customer_schema import CustomerResponse

class SaleItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: float = Field(..., gt=0)

class PaymentCreate(BaseModel):
    method: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    items: List[SaleItemCreate] = Field(..., min_items=1)
    amount_received: Optional[float] = None
    change_given: Optional[float] = None
    payments: List[PaymentCreate] = Field(default_factory=list)

class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float
    price: float

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: int
    method: str
    amount: float

    class Config:
        from_attributes = True

class SaleResponse(BaseModel):
    id: int
    total: float
    amount_received: Optional[float] = None
    change_given: Optional[float] = None
    created_at: datetime
    customer_id: Optional[int] = None
    customer: Optional[CustomerResponse] = None
    items: List[SaleItemResponse]
    payments: List[PaymentResponse] = []

    class Config:
        from_attributes = True