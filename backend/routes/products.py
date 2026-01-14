from fastapi import APIRouter
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import SessionLocal
from models.products import Product
from schemas.product import ProductCreate
from core.dependencies import get_current_user





import shutil
import os
import uuid

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

    return [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "image": f"http://127.0.0.1:8000/{p.image}" if p.image else None
        }
        for p in products
    ]


@router.post("/")
def create_product(
    name: str = Form(...),
    price: float = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    image_path = None

    if image:
        # Validar tipo de imagen
        if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(status_code=400, detail="Formato de imagen no válido")

        # Crear nombre único
        ext = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"

        os.makedirs("media/products", exist_ok=True)
        file_location = f"media/products/{filename}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_path = file_location

    new_product = Product(
        name=name,
        price=price,
        image=image_path
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Producto creado correctamente",
        "product": {
            "id": new_product.id,
            "name": new_product.name,
            "price": new_product.price,
            "image": new_product.image
        }
    }