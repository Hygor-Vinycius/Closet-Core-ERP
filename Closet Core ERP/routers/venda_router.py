from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceVenda
from fastapi.encoders import jsonable_encoder

router = APIRouter()
TAGS = ["Vendas"]

@router.post("/vendas", status_code=201, tags=TAGS)
def criar_venda_api(dados: dict, db: Session = Depends(get_db)):
    """
    Cria uma nova venda, incluindo seus itens, baixando o estoque
    e gerando o contas a receber.
    
    Exemplo de JSON:
    {
        "id_cliente": 1,
        "id_usuario": 1,
        "itens": [
            { "id_variacao": 1, "quantidade": 2 },
            { "id_variacao": 3, "quantidade": 1 }
        ]
    }
    """
    service = ServiceVenda(session=db)
    nova_venda = service.criar_venda(dados)
    return jsonable_encoder(nova_venda)

# Outros endpoints para consulta podem ser adicionados aqui
@router.get("/vendas", tags=TAGS)
def listar_vendas_api(db: Session = Depends(get_db)):
    # Lógica de listagem a ser implementada
    return {"message": "Listagem de vendas a ser implementada."}

@router.get("/vendas/{venda_id}", tags=TAGS)
def obter_venda_api(venda_id: int, db: Session = Depends(get_db)):
    service = ServiceVenda(session=db)
    venda = service.get_by_id(venda_id)
    return jsonable_encoder(venda)

@router.post("/vendas/{venda_id}/cancelar", tags=TAGS)
def cancelar_venda_api(venda_id: int, db: Session = Depends(get_db)):
    """
    Cancela uma venda existente, revertendo estoque e financeiro.
    """
    service = ServiceVenda(session=db)
    venda_cancelada = service.cancelar_venda(venda_id)
    return jsonable_encoder(venda_cancelada)