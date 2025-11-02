from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceMaquininhas
from fastapi.encoders import jsonable_encoder
from typing import Optional

router = APIRouter()
TAGS = ["Maquininhas"]

@router.post("/maquininhas", status_code=201, tags=TAGS)
def cadastrar_maquininha_api(dados: dict, db: Session = Depends(get_db)):
    """Cria uma nova maquininha."""
    service = ServiceMaquininhas(session=db)
    nova_maquininha = service.cadastrar_maquininha(dados)
    return jsonable_encoder(nova_maquininha)

@router.get("/maquininhas", tags=TAGS)
def listar_maquininhas_api(search: Optional[str] = None, status: Optional[str] = "Ativo", db: Session = Depends(get_db)):
    """Lista as maquininhas, com busca opcional por nome."""
    service = ServiceMaquininhas(session=db)
    status_final = None if status and status.lower() == 'todos' else status.title()
    lista = service.listar_maquininhas(nome=search, status=status_final)
    return jsonable_encoder(lista)

@router.get("/maquininhas/{maquininha_id}", tags=TAGS)
def obter_maquininha_api(maquininha_id: int, db: Session = Depends(get_db)):
    """Busca uma maquininha específica pelo seu ID."""
    service = ServiceMaquininhas(session=db)
    maquininha = service.get_by_id(maquininha_id) # Método herdado!
    return jsonable_encoder(maquininha)

@router.put("/maquininhas/{maquininha_id}", tags=TAGS)
def atualizar_maquininha_api(maquininha_id: int, dados: dict, db: Session = Depends(get_db)):
    """Atualiza os dados de uma maquininha existente."""
    service = ServiceMaquininhas(session=db)
    maquininha = service.update(maquininha_id, dados) # Método herdado!
    return jsonable_encoder(maquininha)

@router.delete("/maquininhas/{maquininha_id}", tags=TAGS)
def inativar_maquininha_api(maquininha_id: int, db: Session = Depends(get_db)):
    """Inativa uma maquininha existente (Soft Delete)."""
    service = ServiceMaquininhas(session=db)
    service.inativar(maquininha_id) # Método herdado!
    return {"detail": "Maquininha inativada com sucesso"}