from pydantic import BaseModel
from .product_schema import ProductResponse

class LowStockAlert(BaseModel):
    products: list[ProductResponse]

class DashboardSummary(BaseModel):
    total_products: int
    total_stock_value: float # Sendo o total_sale_value
    total_cost_value: float
    potential_profit: float
    average_margin: float
    low_stock_products: int
    total_movements_today: int