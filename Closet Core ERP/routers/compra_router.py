
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceCompra
from fastapi.encoders import jsonable_encoder
from typing import Optional
from pydantic import BaseModel

router = APIRouter()
TAGS = ["Compras"]

class CancelamentoInput(BaseModel):
    motivo: Optional[str] = None

@router.post("/compras", status_code=201, tags=TAGS)
def criar_compra_api(dados: dict, db: Session = Depends(get_db)):
    """
    Cria uma nova compra, seus itens e gera o movimento de estoque 
    e contas a pagar.
    """
    service = ServiceCompra(session=db)
    nova_compra = service.criar_compra(dados)
    # Retornar a compra criada, talvez incluindo os itens (depende da sua necessidade)
    return jsonable_encoder(nova_compra) 

@router.get("/compras", tags=TAGS)
def listar_compras_api(id_fornecedor: Optional[int] = None, db: Session = Depends(get_db)):
    """Lista as compras, com filtro opcional por fornecedor."""
    service = ServiceCompra(session=db)
    lista = service.listar_compras(id_fornecedor=id_fornecedor)
    return jsonable_encoder(lista)

@router.get("/compras/{compra_id}", tags=TAGS)
def obter_compra_api(compra_id: int, db: Session = Depends(get_db)):
    """Busca uma compra específica pelo seu ID."""
    service = ServiceCompra(session=db)
    compra = service.get_by_id(compra_id) # Método herdado!
    # Idealmente, carregar os itens juntos (lazy loading ou eager loading)
    return jsonable_encoder(compra) 

@router.post("/compras/{compra_id}/cancelar", tags=TAGS)
def cancelar_compra_api(compra_id: int, input_data: Optional[CancelamentoInput] = None, db: Session = Depends(get_db)):
    """
    Cancela uma compra (por erro de digitação, etc.), desde que não haja pagamentos.
    Reverte o contas a pagar e gera movimento de estorno no estoque.
    Opcionalmente, pode receber um motivo no corpo JSON: {"motivo": "Texto do motivo"}
    """
    service = ServiceCompra(session=db)
    motivo = input_data.motivo if input_data else "Cancelamento"
    compra_cancelada = service.cancelar_compra(compra_id, motivo=motivo)
    return jsonable_encoder(compra_cancelada)