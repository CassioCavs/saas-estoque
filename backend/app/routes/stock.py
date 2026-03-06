from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.stock_movement_schema import StockMovementCreate, StockMovementResponse
from app.models.user import User
from app.auth import get_db, get_current_user
from app.services.stock_service import create_stock_movement, get_stock_history

router = APIRouter()

@router.post("/movement", response_model=StockMovementResponse)
def create_stock_movement_endpoint(
    movement: StockMovementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_stock_movement(db, movement, current_user.id)

@router.get("/history", response_model=List[StockMovementResponse])
def get_stock_history_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_stock_history(db, current_user.id)