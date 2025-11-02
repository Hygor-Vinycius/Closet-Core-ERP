# Em database.py

import os
import oracledb
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
SID = os.getenv("SID") # Onde você define o service_name, ex: XEPDB1

# --- LÓGICA DE CONEXÃO CORRIGIDA E ROBUSTA ---

# Usa a função makedsn para criar o DSN (Data Source Name) da forma correta.
# Isso evita qualquer ambiguidade entre SID e Service Name.
dsn = oracledb.makedsn(HOST, PORT, service_name=SID)

# Cria o motor de conexão do SQLAlchemy usando o DSN.
engine = create_engine(
    f"oracle+oracledb://{USER}:{PASSWORD}@{dsn}"
)

# ------------------------------------

# Cria o gerador de sessões
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Função de dependência para a sessão de banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()