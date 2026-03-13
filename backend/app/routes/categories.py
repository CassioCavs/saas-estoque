from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.category_schema import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.product_schema import ProductResponse
from app.models.user import User
from app.auth import get_db, get_current_user
from app.services.category_service import (
    create_category,
    get_categories,
    get_category_by_id,
    update_category,
    delete_category,
    get_products_by_category
)

router = APIRouter()

@router.post("/", response_model=CategoryResponse)
def create_category_endpoint(
    category: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_category(db, category, current_user.id)

@router.get("/", response_model=List[CategoryResponse])
def get_categories_endpoint(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_categories(db, current_user.id, skip, limit)

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category_endpoint(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_category_by_id(db, category_id, current_user.id)

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category_endpoint(
    category_id: int,
    category_update: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_category(db, category_id, category_update, current_user.id)

@router.delete("/{category_id}")
def delete_category_endpoint(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delete_category(db, category_id, current_user.id)
    return {"message": "Category deleted successfully"}

@router.get("/{category_id}/products", response_model=List[ProductResponse])
def get_category_products_endpoint(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_products_by_category(db, category_id, current_user.id)
