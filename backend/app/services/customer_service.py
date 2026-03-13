from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.customer import Customer
from app.schemas.customer_schema import CustomerCreate, CustomerUpdate
from .activity_log_service import log_activity

def create_customer(db: Session, customer: CustomerCreate, user_id: int) -> Customer:
    db_customer = Customer(**customer.dict(), user_id=user_id)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    log_activity(db, user_id, "create_customer", "customer", db_customer.id)
    return db_customer

def get_customers(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Customer).filter(Customer.user_id == user_id).order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()

def search_customers(db: Session, user_id: int, name: str, limit: int = 10):
    return db.query(Customer).filter(
        Customer.user_id == user_id,
        Customer.name.ilike(f"%{name}%")
    ).limit(limit).all()

def get_customer_by_id(db: Session, customer_id: int, user_id: int) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.user_id == user_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

def update_customer(db: Session, customer_id: int, customer_update: CustomerUpdate, user_id: int) -> Customer:
    customer = get_customer_by_id(db, customer_id, user_id)
    for key, value in customer_update.dict(exclude_unset=True).items():
        setattr(customer, key, value)
    db.commit()
    db.refresh(customer)
    log_activity(db, user_id, "update_customer", "customer", customer_id)
    return customer

def delete_customer(db: Session, customer_id: int, user_id: int):
    customer = get_customer_by_id(db, customer_id, user_id)
    db.delete(customer)
    db.commit()
    log_activity(db, user_id, "delete_customer", "customer", customer_id)
