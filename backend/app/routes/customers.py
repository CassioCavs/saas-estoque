from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.auth import get_db, get_current_user
from app.models.user import User
from app.schemas.customer_schema import CustomerCreate, CustomerUpdate, CustomerResponse
from app.services.customer_service import (
    create_customer,
    get_customers,
    get_customer_by_id,
    update_customer,
    delete_customer
)

router = APIRouter()

@router.post("/", response_model=CustomerResponse)
def create_customer_endpoint(
    customer: CustomerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_customer(db, customer, current_user.id)

@router.get("/", response_model=List[CustomerResponse])
def get_customers_endpoint(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_customers(db, current_user.id, skip, limit)

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer_endpoint(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_customer_by_id(db, customer_id, current_user.id)

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer_endpoint(
    customer_id: int,
    customer_update: CustomerUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_customer(db, customer_id, customer_update, current_user.id)

@router.delete("/{customer_id}")
def delete_customer_endpoint(
    customer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delete_customer(db, customer_id, current_user.id)
    return {"message": "Customer deleted successfully"}
