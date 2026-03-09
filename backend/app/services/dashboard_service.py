from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.schemas.dashboard_schema import DashboardSummary
from datetime import date

def get_dashboard_summary(db: Session, user_id: int) -> DashboardSummary:
    # Total products
    total_products = db.query(func.count(Product.id)).filter(Product.user_id == user_id).scalar()

    # Total sale value (estoque * sale_price)
    total_sale_value = db.query(func.sum(Product.sale_price * Product.stock)).filter(Product.user_id == user_id).scalar() or 0.0

    # Total cost value (estoque * cost_price)
    total_cost_value = db.query(func.sum(Product.cost_price * Product.stock)).filter(Product.user_id == user_id).scalar() or 0.0

    # Potential profit
    potential_profit = total_sale_value - total_cost_value

    # Average margin
    average_margin = db.query(func.avg(Product.profit_margin)).filter(Product.user_id == user_id).scalar() or 0.0

    # Low stock products
    low_stock_products = db.query(func.count(Product.id)).filter(
        Product.user_id == user_id,
        Product.stock <= Product.min_stock
    ).scalar()

    # Total movements today
    today = date.today()
    total_movements_today = db.query(func.count(StockMovement.id)).filter(
        StockMovement.user_id == user_id,
        func.date(StockMovement.created_at) == today
    ).scalar()

    return DashboardSummary(
        total_products=total_products,
        total_stock_value=total_sale_value,
        total_cost_value=total_cost_value,
        potential_profit=potential_profit,
        average_margin=average_margin,
        low_stock_products=low_stock_products,
        total_movements_today=total_movements_today
    )

def get_low_stock_alerts(db: Session, user_id: int):
    return db.query(Product).filter(
        Product.user_id == user_id,
        Product.stock <= Product.min_stock
    ).all()