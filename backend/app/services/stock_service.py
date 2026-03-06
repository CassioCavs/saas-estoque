from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.stock_movement import StockMovement
from app.models.product import Product
from app.schemas.stock_movement_schema import StockMovementCreate
from .product_service import get_product_by_id
from .activity_log_service import log_activity

def create_stock_movement(db: Session, movement: StockMovementCreate, user_id: int) -> StockMovement:
    product = get_product_by_id(db, movement.product_id, user_id)
    if movement.type == "saida":
        if product.stock < movement.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        product.stock -= movement.quantity
    elif movement.type == "entrada":
        product.stock += movement.quantity
    db_movement = StockMovement(**movement.dict(), user_id=user_id)
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    log_activity(db, user_id, "stock_movement", "stock_movement", db_movement.id)
    return db_movement

def get_stock_history(db: Session, user_id: int):
    return db.query(StockMovement).filter(StockMovement.user_id == user_id).order_by(StockMovement.created_at.desc()).all()