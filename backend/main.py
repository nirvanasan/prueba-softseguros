from fastapi import FastAPI
from database import Base, engine
from routes import auth, products, cart
from models.user import User
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine) #creamos tablas

app = FastAPI(title="FastAPI Shop")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  #permitimos conexion desde la misma IP pero diferentes puertos (front y backend)
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])

app.mount("/media", StaticFiles(directory="media"), name="media") #archivos estaticos

"""
creamoa endpoints:

/auth/login

/products/

/cart/add
"""