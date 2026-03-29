from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.schemas.dashboard_schema import DashboardSummary


def get_dashboard_summary(db: Session, user_id: int) -> DashboardSummary:
    """
    Retorna resumo do dashboard para o usuário autenticado.

    Observação:
    - Evita expressão SQL inválida na contagem de low stock.
    - Faz agregações simples e compatíveis com SQLite/PostgreSQL.
    """
    stats = (
        db.query(
            func.count(Product.id).label("total_products"),
            func.sum(Product.sale_price * Product.stock).label("total_sale_value"),
            func.sum(Product.cost_price * Product.stock).label("total_cost_value"),
            func.avg(Product.profit_margin).label("average_margin"),
        )
        .filter(Product.user_id == user_id)
        .first()
    )

    total_products = int(stats.total_products or 0)
    total_sale_value = float(stats.total_sale_value or 0.0)
    total_cost_value = float(stats.total_cost_value or 0.0)
    average_margin = float(stats.average_margin or 0.0)

    low_stock_products = (
        db.query(func.count(Product.id))
        .filter(
            Product.user_id == user_id,
            Product.stock <= Product.min_stock,
        )
        .scalar()
        or 0
    )

    potential_profit = total_sale_value - total_cost_value

    today = date.today()
    total_movements_today = (
        db.query(func.count(StockMovement.id))
        .filter(
            StockMovement.user_id == user_id,
            func.date(StockMovement.created_at) == today,
        )
        .scalar()
        or 0
    )

    return DashboardSummary(
        total_products=total_products,
        total_stock_value=total_sale_value,
        total_cost_value=total_cost_value,
        potential_profit=potential_profit,
        average_margin=average_margin,
        low_stock_products=int(low_stock_products),
        total_movements_today=int(total_movements_today),
    )


def get_low_stock_alerts(db: Session, user_id: int):
    return (
        db.query(Product)
        .filter(
            Product.user_id == user_id,
            Product.stock <= Product.min_stock,
        )
        .all()
    )
