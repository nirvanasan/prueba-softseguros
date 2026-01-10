from pydantic import BaseModel,Field
from typing import List

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemResponse(BaseModel):
    item_id: int              
    product_id: int
    name: str
    price: float
    quantity: int
    subtotal: float


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total: float

class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)