from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False, index=True)
    method = Column(String, nullable=False) # e.g. "cash", "debit", "credit", "pix"
    amount = Column(Float, nullable=False)

    sale = relationship("Sale", back_populates="payments")
