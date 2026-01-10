from sqlalchemy import Column, Integer, ForeignKey,Boolean,DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    is_saved = Column(Boolean, default=False)

    # FECHA DE COMPRA
    purchased_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", cascade="all, delete-orphan")