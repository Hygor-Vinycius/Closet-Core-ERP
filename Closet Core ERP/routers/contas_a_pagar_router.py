from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.contas_a_pagar_service import ServiceContasAPagar # Importe o novo serviço
from fastapi.encoders import jsonable_encoder
from typing import Optional

router = APIRouter()
TAGS = ["Contas a Pagar"]

@router.get("/contas-a-pagar", tags=TAGS)
def listar_contas_a_pagar_api(
    id_fornecedor: Optional[int] = None, 
    status: Optional[str] = "Aberto", # O padrão é buscar contas "Aberto"
    db: Session = Depends(get_db)
):
    """
    Lista as contas a pagar.
    - Filtre por id_fornecedor
    - Filtre por status: 'Aberto', 'Pago', 'Cancelado', 'Pago Parcial'
    """
    service = ServiceContasAPagar(session=db)
    
    # Normalização do status
    status_final = None
    if status:
        if status.lower() == 'todos':
            status_final = None
        elif status.lower() == 'aberto':
            status_final = 'aberto' # O repo trata 'aberto' de forma especial
        else:
            status_final = status.title() # Converte 'pago' -> 'Pago'

    lista = service.listar_contas(id_fornecedor=id_fornecedor, status_conta=status_final)
    return jsonable_encoder(lista)

@router.get("/contas-a-pagar/{conta_id}", tags=TAGS)
def obter_conta_a_pagar_api(conta_id: int, db: Session = Depends(get_db)):
    """ Busca uma conta a pagar específica pelo seu ID. """
    service = ServiceContasAPagar(session=db)
    conta = service.get_by_id(conta_id) # Método herdado da BaseService
    return jsonable_encoder(conta)