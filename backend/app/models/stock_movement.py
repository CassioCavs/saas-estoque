from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class MovementType(enum.Enum):
    entrada = "entrada"
    saida = "saida"

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    type = Column(Enum(MovementType), nullable=False)
    quantity = Column(Float, nullable=False)
    reason = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    product = relationship("Product", back_populates="movements")
    owner = relationship("User")