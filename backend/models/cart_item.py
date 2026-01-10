from sqlalchemy import Column, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    price = Column(Float)

    # RELACIONES
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")
