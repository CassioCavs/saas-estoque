from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.product_schema import ProductCreate, ProductResponse, ProductUpdate
from app.models.user import User
from app.auth import get_db, get_current_user
from app.services.product_service import (
    create_product,
    get_products,
    get_product_by_id,
    update_product,
    delete_product
)

router = APIRouter()

@router.post("/", response_model=ProductResponse)
def create_product_endpoint(
    product: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_product(db, product, current_user.id)

@router.get("/", response_model=List[ProductResponse])
def get_products_endpoint(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_products(db, current_user.id, skip, limit)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_endpoint(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_product_by_id(db, product_id, current_user.id)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product_endpoint(
    product_id: int,
    product_update: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_product(db, product_id, product_update, current_user.id)

@router.delete("/{product_id}")
def delete_product_endpoint(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delete_product(db, product_id, current_user.id)
    return {"message": "Product deleted successfully"}