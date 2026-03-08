from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.category import Category
from app.models.product import Product
from app.schemas.category_schema import CategoryCreate, CategoryUpdate
from .activity_log_service import log_activity

def create_category(db: Session, category: CategoryCreate, user_id: int) -> Category:
    db_category = Category(**category.dict(), user_id=user_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    log_activity(db, user_id, "create_category", "category", db_category.id)
    return db_category

def get_categories(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Category).filter(Category.user_id == user_id).offset(skip).limit(limit).all()

def get_category_by_id(db: Session, category_id: int, user_id: int) -> Category:
    category = db.query(Category).filter(Category.id == category_id, Category.user_id == user_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

def update_category(db: Session, category_id: int, category_update: CategoryUpdate, user_id: int) -> Category:
    category = get_category_by_id(db, category_id, user_id)
    for key, value in category_update.dict(exclude_unset=True).items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    log_activity(db, user_id, "update_category", "category", category_id)
    return category

def delete_category(db: Session, category_id: int, user_id: int):
    category = get_category_by_id(db, category_id, user_id)
    db.delete(category)
    db.commit()
    log_activity(db, user_id, "delete_category", "category", category_id)

def get_products_by_category(db: Session, category_id: int, user_id: int) -> list[Product]:
    # Primeiro verifica se a categoria pertence ao usuário
    get_category_by_id(db, category_id, user_id)
    return db.query(Product).filter(Product.category_id == category_id, Product.user_id == user_id).all()
