# prueba-softseguros

Proyecto full-stack de e-commerce para la creación y compra de productos.  
Incluye backend en FastAPI y frontend en React con funcionalidades de carrito y pedidos.

------------------------------------------------------------------------------------------------------

## Tecnologías usadas

- **Backend:** FastAPI, SQLAlchemy, Uvicorn  
- **Frontend:** React, Tailwind CSS  
- **Base de datos:** SQLite 

------------------------------------------------------------------------------------------------------

## Instalación y ejecución

### Backend
```bash
#entrar a carpeta backend

cd backend

# crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# instalar dependencias
pip install -r requirements.txt

# ejecutar backend
uvicorn main:app --reload
```
-----------------------------------

### Frontend
```bash
#entrar a carpeta frontend

cd frontend

#instalar dependencias

npm install

#ejecutar frontend

npm run dev

```
### INGRESA A: http://localhost:5173/
------------------------------------------------------------------------------------------------

### Notas:

Todos los endpoints de carrito requieren autenticación con token.

Los precios se expresan en moneda local (COP).

------------------------------------------------------------------------------------------------

# Endpoints de la aplicacion web y detalles:

# ENDPOINTS DE AUTENTICACION

# 1 POST /auth/register

    Este endpoint es usado para registrar usuarios

    se usa:

    {
        "email": "user@example.com",
        "password": "string"
    }

# 2 POST /auth/login

    Este endpoint es usado para iniciar sesion luego del registro

    se usa:

    {
        "email": "string",
        "password": "string"
    }

    Devuelve token

# ENDPOINTS DE PRODUCTOS

# 1 GET /products

    Este endpoint es usado para listar los productos a comprar

# 2 POST /products

    Este endpoint es usado para crear productos

    se usa:

    {
        "name": "string",
        "price": 1
    }


# ENDPOINTS DE CARRITO

# 1 GET /cart

    Este endpoint es usado para listar el carrito actual

    devuelve:

    {
    "items": [
        {
        "product_id": 0,
        "name": "string",
        "price": 0,
        "quantity": 0,
        "subtotal": 0
        }
    ],
    "total": 0
    }

# 2 POST /cart/add

    Este endpoint es usado para añadir producto al carrito

    se usa:

    {
    "product_id": 0,
    "quantity": 1
    }

# 3 DELETE /cart/item/{item_id}

    Este endpoint es usado para eliminar producto del carrito

    se usa:

    {
        "product_id": 3,
        "quantity": 1
    }

# 4 PUT /cart/item/{item_id}

    Este endpoint es usado para actualizar la cantidad de un producto del carrito

    se usa:

    {
    "quantity": 1
    }

# 5 POST /cart/save

    Este endpoint es usado para guardar el carrito en la base de datos


# 6 GET /cart/saved

    Este endpoint es usado para ver los carritos guardados del usuario


# 7 GET /cart/saved/{cart_id}

    Este endpoint es usado para ver un carrito en especifico de cualquier usuario

------------------------------------------------------------------------------------------------------