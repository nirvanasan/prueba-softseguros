from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./shop.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} #Permitimos que FastAPI (multihilo) use SQLite sin errores
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

"""
Cada request:

crea una sesión

ejecuta consultas

hace commit / rollback

se cierra
"""


Base = declarative_base() #Todas las tablas (models) heredan de esta base
