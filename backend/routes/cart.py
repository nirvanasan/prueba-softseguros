from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from models.cart import Cart
from models.user import User
from core.dependencies import get_current_user, get_db
from models.cart_item import CartItem
from models.products import Product
from schemas.cart import CartItemCreate, CartResponse
from core.dependencies import get_current_user, get_db
from database import SessionLocal
from schemas.cart import CartItemUpdate
from datetime import datetime
from core.dependencies import get_current_user, get_db
import traceback


router = APIRouter()

#  OBTENER CARRITO ACTIVO DEL USUARIO
@router.get("/", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    cart = db.query(Cart).filter(
        Cart.user_id == current_user.id,
        Cart.is_saved == False
    ).first()

    #  Si no hay carrito activo, devolver vacío
    if not cart:
        return {
            "items": [],
            "total": 0
        }

    db.refresh(cart)  # cargar todos los items asociados

    items = []
    total = 0

    for i in cart.items:
        subtotal = i.price * i.quantity
        total += subtotal

        items.append({
            "item_id": i.id,
            "product_id": i.product_id,
            "name": i.product.name,
            "price": i.price,
            "quantity": i.quantity,
            "subtotal": subtotal,
            "image": i.product.image
        })

    return {
        "items": items,
        "total": total
    }





@router.post("/add", response_model=CartResponse)
def add_to_cart(
    item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    #  Obtener carrito ACTIVO o crear uno nuevo
    cart = db.query(Cart).filter(
        Cart.user_id == current_user.id,
        Cart.is_saved == False
    ).first()

    if not cart:
        cart = Cart(
            user_id=current_user.id,
            is_saved=False
        )
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # Producto
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    #  Item
    cart_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == product.id
    ).first()

    if cart_item:
        cart_item.quantity += item.quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        )
        db.add(cart_item)

    db.commit()

    #  Respuesta
    items = []
    total = 0

    for i in cart.items:
        subtotal = i.price * i.quantity
        total += subtotal
        items.append({
            "item_id": i.id,             
            "product_id": i.product_id,
            "name": i.product.name,
            "price": i.price,
            "quantity": i.quantity,
            "subtotal": subtotal,
            "image": i.product.image
        })

    return {"items": items, "total": total}




@router.delete("/item/{item_id}")
def delete_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = db.query(CartItem).join(CartItem.cart).filter(
        CartItem.id == item_id,
        CartItem.cart.has(user_id=user.id),
        CartItem.cart.has(is_saved=False)
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")

    db.delete(item)
    db.commit()

    return {"message": "Producto eliminado del carrito"}


@router.put("/item/{item_id}")
def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    item = db.query(CartItem).join(CartItem.cart).filter(
        CartItem.id == item_id,
        CartItem.cart.has(user_id=user.id),
        CartItem.cart.has(is_saved=False)
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")

    item.quantity = data.quantity
    db.commit()
    db.refresh(item)

    return {
        "message": "Cantidad actualizada",
        "item": {
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity
        }
    }



@router.post("/save")
def save_cart(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    cart = db.query(Cart).filter(
        Cart.user_id == user.id,
        Cart.is_saved == False
    ).first()

    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="No hay carrito para guardar")

    cart.is_saved = True
    cart.purchased_at = datetime.utcnow()  
    
    db.commit()
    db.refresh(cart)

    return {
        "message": "Carrito guardado correctamente",
        "cart_id": cart.id,
        "purchased_at": cart.purchased_at
    }


@router.get("/saved")
def get_saved_carts(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    carts = (
        db.query(Cart)
        .filter(
            Cart.user_id == user.id,
            Cart.is_saved == True
        )
        .all()
    )

    return [
        {
            "cart_id": cart.id,
            "purchased_at": cart.purchased_at,
            "items": [
                {
                    "item_id": item.id,
                    "product_id": item.product_id,
                    "product_name": item.product.name,
                    "price": item.price,
                    "quantity": item.quantity,
                    "subtotal": item.price * item.quantity,
                    "image": item.product.image
                }
                for item in cart.items
            ],
            "total": sum(
                item.price * item.quantity for item in cart.items
            )
        }
        for cart in carts
    ]


@router.get("/saved/{cart_id}")
def get_cart_by_id(
    cart_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    cart = (
        db.query(Cart)
        .filter(
            Cart.id == cart_id,
            Cart.user_id == user.id
        )
        .first()
    )

    if not cart:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")

    return {
        "cart_id": cart.id,
        "is_saved": cart.is_saved,
        "items": [
            {
                "product": item.product.name,
                "price": item.price,
                "quantity": item.quantity
            }
            for item in cart.items
        ]
    }
