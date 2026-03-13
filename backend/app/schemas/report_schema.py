from pydantic import BaseModel
from datetime import datetime
from typing import List

class SalesReportResponse(BaseModel):
    total_sales: int
    total_revenue: float
    total_products_sold: float

class StockReportResponse(BaseModel):
    total_products: int
    total_stock: float
    total_stock_value: float

class TopProductResponse(BaseModel):
    product_id: int
    product_name: str
    total_sold: float
    total_revenue: float

    class Config:
        from_attributes = True
