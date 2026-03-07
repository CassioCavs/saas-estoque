from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from datetime import datetime
from typing import List

def get_sales_report(db: Session, user_id: int, start_date: datetime = None, end_date: datetime = None):
    query = db.query(
        func.count(Sale.id).label("total_sales"),
        func.sum(Sale.total).label("total_revenue"),
        func.sum(SaleItem.quantity).label("total_products_sold")
    ).join(SaleItem, Sale.id == SaleItem.sale_id).filter(Sale.user_id == user_id)

    if start_date:
        query = query.filter(Sale.created_at >= start_date)
    if end_date:
        query = query.filter(Sale.created_at <= end_date)

    result = query.first()
    
    return {
        "total_sales": result.total_sales or 0,
        "total_revenue": result.total_revenue or 0.0,
        "total_products_sold": result.total_products_sold or 0
    }

def get_stock_report(db: Session, user_id: int):
    result = db.query(
        func.count(Product.id).label("total_products"),
        func.sum(Product.stock).label("total_stock"),
        func.sum(Product.stock * Product.price).label("total_stock_value")
    ).filter(Product.user_id == user_id).first()

    return {
        "total_products": result.total_products or 0,
        "total_stock": result.total_stock or 0,
        "total_stock_value": result.total_stock_value or 0.0
    }

def get_top_products(db: Session, user_id: int, limit: int = 10):
    top_products = db.query(
        Product.id.label("product_id"),
        Product.name.label("product_name"),
        func.sum(SaleItem.quantity).label("total_sold"),
        func.sum(SaleItem.quantity * SaleItem.price).label("total_revenue")
    ).join(SaleItem, Product.id == SaleItem.product_id)\
     .join(Sale, Sale.id == SaleItem.sale_id)\
     .filter(Sale.user_id == user_id)\
     .group_by(Product.id, Product.name)\
     .order_by(func.sum(SaleItem.quantity).desc())\
     .limit(limit).all()

    return [
        {
            "product_id": p.product_id,
            "product_name": p.product_name,
            "total_sold": int(p.total_sold),
            "total_revenue": float(p.total_revenue)
        } for p in top_products
    ]
