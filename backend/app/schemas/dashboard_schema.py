from pydantic import BaseModel
from .product_schema import ProductResponse

class LowStockAlert(BaseModel):
    products: list[ProductResponse]

class DashboardSummary(BaseModel):
    total_products: int
    total_stock_value: float
    low_stock_products: int
    total_movements_today: int