from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceVariacaoProdutos
from fastapi.encoders import jsonable_encoder
from typing import Optional

router = APIRouter()

@router.post("/variacoes", status_code=201, tags=["Variações de Produtos"])
def cadastrar_variacao_api(dados: dict, db: Session = Depends(get_db)):
    """Cria uma nova variação de produto."""
    service = ServiceVariacaoProdutos(session=db)
    nova_variacao = service.cadastrar_variacao(dados)
    return jsonable_encoder(nova_variacao)

@router.get("/variacoes", tags=["Variações de Produtos"])
def listar_variacoes_api(produto_id: Optional[int] = None, status: Optional[str] = "Ativo", db: Session = Depends(get_db)):
    """Lista as variações, com filtro opcional por produto_id e status."""
    service = ServiceVariacaoProdutos(session=db)
    status_final = None if status and status.lower() == 'todos' else status.title()
    lista = service.listar_variacoes(produto_id=produto_id, status=status_final)
    return jsonable_encoder(lista)

@router.get("/variacoes/{variacao_id}", tags=["Variações de Produtos"])
def obter_variacao_api(variacao_id: int, db: Session = Depends(get_db)):
    """Busca uma variação específica pelo seu ID."""
    service = ServiceVariacaoProdutos(session=db)
    variacao = service.get_by_id(variacao_id) # Método herdado!
    return jsonable_encoder(variacao)

@router.put("/variacoes/{variacao_id}", tags=["Variações de Produtos"])
def atualizar_variacao_api(variacao_id: int, dados: dict, db: Session = Depends(get_db)):
    """Atualiza os dados de uma variação existente."""
    service = ServiceVariacaoProdutos(session=db)
    variacao = service.update(variacao_id, dados) # Método herdado!
    return jsonable_encoder(variacao)

@router.delete("/variacoes/{variacao_id}", tags=["Variações de Produtos"])
def inativar_variacao_api(variacao_id: int, db: Session = Depends(get_db)):
    """Inativa uma variação existente (Soft Delete)."""
    service = ServiceVariacaoProdutos(session=db)
    service.inativar(variacao_id) # Método herdado!
    return {"detail": "Variação inativada com sucesso"}