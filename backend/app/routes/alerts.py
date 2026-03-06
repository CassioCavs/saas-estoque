from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.product_schema import ProductResponse
from app.models.user import User
from app.auth import get_db, get_current_user
from app.services.dashboard_service import get_low_stock_alerts

router = APIRouter()

@router.get("/low-stock", response_model=List[ProductResponse])
def get_low_stock_alerts_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_low_stock_alerts(db, current_user.id)