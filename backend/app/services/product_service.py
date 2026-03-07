from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.product import Product
from app.schemas.product_schema import ProductCreate, ProductUpdate
from .activity_log_service import log_activity

def create_product(db: Session, product: ProductCreate, user_id: int) -> Product:
    db_product = Product(**product.dict(), user_id=user_id)
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
    for key, value in product_update.dict(exclude_unset=True).items():
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