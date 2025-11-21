# Em: routers/contas_a_receber_router.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.contas_a_receber_service import ServiceContasAReceber
from fastapi.encoders import jsonable_encoder
from typing import Optional

router = APIRouter()
TAGS = ["Contas a Receber"]

@router.get("/contas-a-receber", tags=TAGS)
def listar_contas_a_receber_api(
    id_cliente: Optional[int] = None, 
    status: Optional[str] = "Aberto", 
    db: Session = Depends(get_db)
):
    """
    Lista as contas a receber.
    Status padrão: 'Aberto' (inclui 'Recebido Parcial').
    """
    service = ServiceContasAReceber(session=db)
    
    # Normalização do status
    status_final = None
    if status:
        if status.lower() == 'todos':
            status_final = None
        elif status.lower() == 'aberto':
            status_final = 'aberto' # O repo trata 'aberto' de forma especial (Aberto + Parcial)
        else:
            status_final = status.title() # Ex: 'recebido' -> 'Recebido'

    lista = service.listar_contas(id_cliente=id_cliente, status_conta=status_final)
    return jsonable_encoder(lista)

@router.get("/contas-a-receber/{conta_id}", tags=TAGS)
def obter_conta_a_receber_api(conta_id: int, db: Session = Depends(get_db)):
    service = ServiceContasAReceber(session=db)
    conta = service.get_by_id(conta_id)
    return jsonable_encoder(conta)