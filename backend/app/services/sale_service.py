from sqlalchemy.orm import Session, selectinload
from fastapi import HTTPException
from app.models.sale import Sale, SaleItem
from app.models.payment import Payment
from app.models.product import Product
from app.schemas.sale_schema import SaleCreate, SaleResponse
from .product_service import get_product_by_id
from .activity_log_service import log_activity
from .stock_service import record_stock_movement

def create_sale(db: Session, user_id: int, sale_data: SaleCreate) -> Sale:
    # Debug: verificar dados recebidos
    print(f"User ID: {user_id}")
    print(f"Sale data: {sale_data.dict()}")

    # Validar produtos e estoque
    total = 0.0
    sale_items = []
    # Batch fetch products to avoid N+1 query loop
    product_ids = [item.product_id for item in sale_data.items]
    products = db.query(Product).filter(
        Product.id.in_(product_ids), 
        Product.user_id == user_id
    ).all()
    products_dict = {p.id: p for p in products}

    for item in sale_data.items:
        print(f"Checking product_id: {item.product_id} (type: {type(item.product_id)})")
        product = products_dict.get(item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        print(f"Product found: {product.name}")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.name}")
        total += product.price * item.quantity
        sale_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": product.price,
            "product_obj": product # Keep reference to update stock
        })

    # Criar Sale com os novos campos de pagamento
    db_sale = Sale(
        user_id=user_id, 
        customer_id=sale_data.customer_id, 
        total=total,
        amount_received=sale_data.amount_received,
        change_given=sale_data.change_given
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)

    # Strict payment validation
    payments_total = sum(p.amount for p in sale_data.payments)
    difference = abs(payments_total - total)
    if difference > 0.05:  # Margin for floating-point inaccuracies
        raise HTTPException(status_code=400, detail="Payment total does not match sale total.")

    for payment in sale_data.payments:
        db_payment = Payment(
            sale_id=db_sale.id,
            method=payment.method,
            amount=payment.amount
        )
        db.add(db_payment)

    # Criar SaleItems e atualizar estoque
    for item_data in sale_items:
        db_item = SaleItem(
            sale_id=db_sale.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            price=item_data["price"]
        )
        db.add(db_item)
        
        # Diminuir estoque no objeto já carregado da memória
        item_data["product_obj"].stock -= item_data["quantity"]
        
        # Registrar o histórico de saída
        record_stock_movement(
            db=db,
            product_id=item_data["product_id"],
            movement_type="saida",
            quantity=item_data["quantity"],
            reason=f"Venda PDV",
            user_id=user_id
        )

    db.commit()
    db.refresh(db_sale)

    # Registrar log
    log_activity(db, user_id, "create_sale", "sale", db_sale.id)

    return db_sale

def get_sales(db: Session, user_id: int):
    return db.query(Sale).filter(Sale.user_id == user_id)\
        .options(
            selectinload(Sale.customer),
            selectinload(Sale.items),
            selectinload(Sale.payments)
        )\
        .order_by(Sale.created_at.desc()).all()

def get_sale_by_id(db: Session, sale_id: int, user_id: int) -> Sale:
    sale = db.query(Sale).filter(Sale.id == sale_id, Sale.user_id == user_id)\
        .options(
            selectinload(Sale.customer),
            selectinload(Sale.items),
            selectinload(Sale.payments)
        )\
        .first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale