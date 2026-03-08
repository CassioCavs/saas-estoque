from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.schemas.sale_schema import SaleCreate, SaleResponse
from .product_service import get_product_by_id
from .activity_log_service import log_activity

def create_sale(db: Session, user_id: int, sale_data: SaleCreate) -> Sale:
    # Debug: verificar dados recebidos
    print(f"User ID: {user_id}")
    print(f"Sale data: {sale_data.dict()}")

    # Validar produtos e estoque
    total = 0.0
    sale_items = []

    for item in sale_data.items:
        print(f"Checking product_id: {item.product_id} (type: {type(item.product_id)})")
        product = get_product_by_id(db, item.product_id, user_id)
        print(f"Product found: {product}")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.name}")
        total += product.price * item.quantity
        sale_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": product.price
        })

    # Criar Sale
    db_sale = Sale(user_id=user_id, customer_id=sale_data.customer_id, total=total)
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)

    # Criar SaleItems e atualizar estoque
    for item_data in sale_items:
        db_item = SaleItem(
            sale_id=db_sale.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            price=item_data["price"]
        )
        db.add(db_item)

        # Diminuir estoque
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.stock -= item_data["quantity"]

    db.commit()
    db.refresh(db_sale)

    # Registrar log
    log_activity(db, user_id, "create_sale", "sale", db_sale.id)

    return db_sale

def get_sales(db: Session, user_id: int):
    return db.query(Sale).filter(Sale.user_id == user_id).order_by(Sale.created_at.desc()).all()

def get_sale_by_id(db: Session, sale_id: int, user_id: int) -> Sale:
    sale = db.query(Sale).filter(Sale.id == sale_id, Sale.user_id == user_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale