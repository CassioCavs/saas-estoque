from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.schemas.dashboard_schema import DashboardSummary
from datetime import date

def get_dashboard_summary(db: Session, user_id: int) -> DashboardSummary:
    # Total products
    total_products = db.query(func.count(Product.id)).filter(Product.user_id == user_id).scalar()

    # Total stock value
    total_stock_value = db.query(func.sum(Product.price * Product.stock)).filter(Product.user_id == user_id).scalar() or 0.0

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
        total_stock_value=total_stock_value,
        low_stock_products=low_stock_products,
        total_movements_today=total_movements_today
    )

def get_low_stock_alerts(db: Session, user_id: int):
    return db.query(Product).filter(
        Product.user_id == user_id,
        Product.stock <= Product.min_stock
    ).all()