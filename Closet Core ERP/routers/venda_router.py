from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceVenda
from fastapi.encoders import jsonable_encoder
from typing import Optional, List

router = APIRouter()
TAGS = ["Vendas"]

@router.post("/vendas", status_code=201, tags=TAGS)
def criar_venda_api(dados: dict, db: Session = Depends(get_db)):
    """ Cria uma nova venda. """
    service = ServiceVenda(session=db)
    nova_venda = service.criar_venda(dados)
    return jsonable_encoder(nova_venda)

@router.get("/vendas", tags=TAGS)
def listar_vendas_api(
    id_cliente: Optional[int] = None, 
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """ Lista as vendas realizadas. """
    service = ServiceVenda(session=db)
    lista = service.listar_vendas(id_cliente=id_cliente, status=status)
    return jsonable_encoder(lista)

@router.get("/vendas/{venda_id}", tags=TAGS)
def obter_venda_api(venda_id: int, db: Session = Depends(get_db)):
    """ Busca uma venda específica. """
    service = ServiceVenda(session=db)
    venda = service.get_by_id(venda_id)
    return jsonable_encoder(venda)

@router.post("/vendas/{venda_id}/cancelar", tags=TAGS)
def cancelar_venda_api(venda_id: int, db: Session = Depends(get_db)):
    """ Cancela uma venda e estorna o estoque/financeiro. """
    service = ServiceVenda(session=db)
    venda_cancelada = service.cancelar_venda(venda_id)
    return jsonable_encoder(venda_cancelada)