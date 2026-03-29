from typing import Any, cast

from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload

from app.models.stock_movement import StockMovement
from app.schemas.stock_movement_schema import StockMovementCreate

from .activity_log_service import log_activity
from app.models.stock_movement import MovementType

def record_stock_movement(
    db: Session, product_id: int, movement_type: str, quantity: float, reason: str, user_id: int
) -> StockMovement:
    """
    Internal function to record a stock movement ledger entry 
    without modifying the actual Product.stock. Used by other services.
    """
    db_movement = StockMovement(
        product_id=product_id,
        type=MovementType(movement_type),
        quantity=quantity,
        reason=reason,
        user_id=user_id
    )
    db.add(db_movement)
    db.flush()
    return db_movement

def create_stock_movement(
    db: Session, movement: StockMovementCreate, user_id: int
) -> StockMovement:
    """
    Cria movimentação de estoque e atualiza o estoque do produto.
    """
    from .product_service import get_product_by_id
    product = get_product_by_id(db, int(movement.product_id), int(user_id))
    movement_type = movement.type.value
    movement_quantity = float(movement.quantity)

    current_stock = float(cast(float, product.stock))
    if movement_type == "saida":
        if current_stock < movement_quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        setattr(product, "stock", cast(Any, current_stock - movement_quantity))
    elif movement_type == "entrada":
        setattr(product, "stock", cast(Any, current_stock + movement_quantity))

    db_movement = StockMovement(**movement.dict(), user_id=int(user_id))
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)

    log_activity(
        db,
        int(user_id),
        "stock_movement",
        "stock_movement",
        int(cast(int, db_movement.id)),
    )
    return db_movement


def get_stock_history(db: Session, user_id: int):
    """
    Retorna histórico de estoque com produto carregado para exibição completa no frontend.
    """
    return (
        db.query(StockMovement)
        .filter(StockMovement.user_id == user_id)
        .options(selectinload(StockMovement.product))
        .order_by(StockMovement.created_at.desc())
        .all()
    )
