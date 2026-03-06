from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.sale_schema import SaleCreate, SaleResponse
from app.models.user import User
from app.auth import get_db, get_current_user
from app.services.sale_service import (
    create_sale,
    get_sales,
    get_sale_by_id
)

router = APIRouter()

@router.post("/", response_model=SaleResponse)
def create_sale_endpoint(
    sale: SaleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_sale(db, current_user.id, sale)

@router.get("/", response_model=List[SaleResponse])
def get_sales_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_sales(db, current_user.id)

@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale_endpoint(
    sale_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_sale_by_id(db, sale_id, current_user.id)