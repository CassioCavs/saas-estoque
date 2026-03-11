from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.product import Product
from app.schemas.product_schema import ProductCreate, ProductUpdate
from .activity_log_service import log_activity

def calculate_prices(data: dict) -> dict:
    cost = data.get("cost_price") or 0.0
    margin = data.get("profit_margin") or 0.0
    sale = data.get("sale_price") or 0.0

    if "profit_margin" in data or "cost_price" in data:
        if cost > 0 and margin is not None:
            sale = cost * (1 + margin / 100)
            data["sale_price"] = round(sale, 2)
            data["price"] = data["sale_price"]
    elif "sale_price" in data:
        if cost > 0:
            margin = ((sale - cost) / cost) * 100
            data["profit_margin"] = round(margin, 2)
        data["price"] = sale
            
    return data

def create_product(db: Session, product: ProductCreate, user_id: int) -> Product:
    product_data = product.dict()
    product_data = calculate_prices(product_data)
    
    db_product = Product(**product_data, user_id=user_id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    log_activity(db, user_id, "create_product", "product", db_product.id)
    return db_product

def get_products(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 10,
    search: str | None = None,
    category_id: int | None = None,
    low_stock: bool | None = None,
    min_price: float | None = None,
    max_price: float | None = None
):
    query = db.query(Product).filter(Product.user_id == user_id)

    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) | 
            (Product.barcode.ilike(f"%{search}%"))
        )

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if low_stock:
        query = query.filter(Product.stock <= Product.min_stock)

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    return query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()

def get_product_by_id(db: Session, product_id: int, user_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id, Product.user_id == user_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

def update_product(db: Session, product_id: int, product_update: ProductUpdate, user_id: int) -> Product:
    product = get_product_by_id(db, product_id, user_id)
    
    update_data = product_update.dict(exclude_unset=True)
    
    cost = update_data.get("cost_price", product.cost_price)
    if cost is None: cost = 0.0
    
    margin = update_data.get("profit_margin", product.profit_margin)
    if margin is None: margin = 0.0
    
    sale = update_data.get("sale_price", product.sale_price)

    if "cost_price" in update_data or "profit_margin" in update_data:
        if cost > 0:
            new_sale = cost * (1 + margin / 100)
            update_data["sale_price"] = round(new_sale, 2)
            update_data["price"] = update_data["sale_price"]
    elif "sale_price" in update_data:
        if cost > 0:
            new_margin = ((sale - cost) / cost) * 100
            update_data["profit_margin"] = round(new_margin, 2)
        update_data["price"] = sale

    for key, value in update_data.items():
        setattr(product, key, value)
        
    db.commit()
    db.refresh(product)
    log_activity(db, user_id, "update_product", "product", product_id)
    return product

def delete_product(db: Session, product_id: int, user_id: int):
    product = get_product_by_id(db, product_id, user_id)
    db.delete(product)
    db.commit()
    log_activity(db, user_id, "delete_product", "product", product_id)