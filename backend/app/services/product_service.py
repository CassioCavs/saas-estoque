from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.product import Product
from app.schemas.product_schema import ProductCreate, ProductUpdate
from .activity_log_service import log_activity

def calculate_prices(data: dict) -> dict:
    cost = data.get("cost_price", 0)
    margin = data.get("profit_margin", 0)
    sale = data.get("sale_price", 0)

    # Se a margem foi alterada (ou custo), recalcula o preço de venda
    if "profit_margin" in data or "cost_price" in data:
        if cost > 0:
            sale = cost * (1 + margin / 100)
            data["sale_price"] = round(sale, 2)
            data["price"] = data["sale_price"] # Sincroniza campo legado

    # Se o preço de venda foi alterado manualmente, recalcula a margem
    elif "sale_price" in data:
        if cost > 0:
            margin = ((sale - cost) / cost) * 100
            data["profit_margin"] = round(margin, 2)
            data["price"] = sale # Sincroniza campo legado
            
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
    
    # Atualiza valores locais antes do cálculo se necessário
    calc_input = {
        "cost_price": update_data.get("cost_price", product.cost_price),
        "profit_margin": update_data.get("profit_margin", product.profit_margin),
        "sale_price": update_data.get("sale_price", product.sale_price)
    }
    
    # Lógica de prioridade: 
    # 1. Se alterou custo ou margem -> recalcula venda
    # 2. Se alterou venda (e não margem) -> recalcula margem
    if "cost_price" in update_data or "profit_margin" in update_data:
        if calc_input["cost_price"] > 0:
            calc_input["sale_price"] = round(calc_input["cost_price"] * (1 + calc_input["profit_margin"] / 100), 2)
            update_data["sale_price"] = calc_input["sale_price"]
            update_data["price"] = update_data["sale_price"]
            
    elif "sale_price" in update_data:
        if calc_input["cost_price"] > 0:
            calc_input["profit_margin"] = round(((calc_input["sale_price"] - calc_input["cost_price"]) / calc_input["cost_price"]) * 100, 2)
            update_data["profit_margin"] = calc_input["profit_margin"]
            update_data["price"] = update_data["sale_price"]

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