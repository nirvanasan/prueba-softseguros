from fastapi import APIRouter
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.products import Product
from schemas.product import ProductCreate
from core.dependencies import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def list_products(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)  
):
    products = db.query(Product).all()
    return products

@router.post("/")
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    new_product = Product(
        name=product.name,
        price=product.price
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Producto creado correctamente",
        "product": {
            "id": new_product.id,
            "name": new_product.name,
            "price": new_product.price
        }
    }