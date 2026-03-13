from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.category_schema import CategoryResponse

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: str | None = None
    price: float = Field(0, ge=0) # sale_price
    cost_price: float | None = Field(None, ge=0)
    profit_margin: float | None = Field(None)
    sale_price: float = Field(..., ge=0)
    stock: float = Field(0, ge=0)
    min_stock: float = Field(0, ge=0)
    barcode: str | None = None
    unit_type: str = Field("un", min_length=1)
    allow_fraction: bool = False
    category_id: int | None = None

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None
    price: float
    cost_price: float | None = None
    profit_margin: float | None = None
    sale_price: float
    stock: float
    min_stock: float
    barcode: str | None
    unit_type: str
    allow_fraction: bool
    category_id: int | None
    category_relation: CategoryResponse | None = None
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1)
    description: str | None = None
    price: float | None = Field(None, ge=0)
    cost_price: float | None = Field(None, ge=0)
    profit_margin: float | None = Field(None)
    sale_price: float | None = Field(None, ge=0)
    stock: float | None = Field(None, ge=0)
    min_stock: float | None = Field(None, ge=0)
    barcode: str | None = None
    unit_type: str | None = Field(None, min_length=1)
    allow_fraction: bool | None = None
    category_id: int | None = None
