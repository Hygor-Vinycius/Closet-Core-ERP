import os
import sys
import oracledb
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# --- 1. Descobrir Caminho do Executável ---
if getattr(sys, 'frozen', False):
    application_path = os.path.dirname(sys.executable)
else:
    application_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- 2. Carregar .env ---
env_path = os.path.join(application_path, '.env')
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)
else:
    print("--- ERRO CRÍTICO: Arquivo .env NÃO encontrado! ---")

USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
SID = os.getenv("SID")

# --- 3. FORÇAR O MODO THICK (Usa as DLLs da pasta) ---
try:
    # Tenta inicializar o modo Thick procurando as DLLs na mesma pasta do executável
    # Se estiver rodando como script, pode não achar, então o try/except protege
    if getattr(sys, 'frozen', False):
        oracledb.init_oracle_client(lib_dir=application_path)
    else:
        # Em desenvolvimento (script), tenta achar no PATH ou usa Thin
        pass 
except Exception as e:
    print(f"AVISO: Não foi possível iniciar o Oracle Client (Thick Mode): {e}")
    print("Tentando conectar no modo Thin...")

# --- 4. Criar Conexão ---
dsn = oracledb.makedsn(HOST, PORT, service_name=SID)
engine = create_engine(f"oracle+oracledb://{USER}:{PASSWORD}@{dsn}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()