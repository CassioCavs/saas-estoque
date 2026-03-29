from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (UniqueConstraint("user_id", "barcode", name="uq_user_barcode"),)

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(
        Float, nullable=False
    )  # Mantido para compatibilidade, será o sale_price
    cost_price = Column(Float, nullable=False, default=0.0)
    profit_margin = Column(Float, nullable=False, default=0.0)
    sale_price = Column(Float, nullable=False, default=0.0)
    stock = Column(Float, nullable=False, default=0.0)
    min_stock = Column(Float, nullable=False, default=0.0)
    barcode = Column(String, index=True)
    unit_type = Column(String, nullable=False, default="un")
    allow_fraction = Column(Boolean, nullable=False, default=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User")
    category_relation = relationship("Category", back_populates="products")
    movements = relationship("StockMovement", back_populates="product")
