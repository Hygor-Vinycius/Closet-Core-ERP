from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceProduto
from fastapi.encoders import jsonable_encoder
from typing import Optional

router = APIRouter()

@router.post("/produtos", status_code=201, tags=["Produtos"])
def cadastrar_produto_api(dados: dict, db: Session = Depends(get_db)):
    """Cria um novo produto."""
    service = ServiceProduto(session=db)
    novo_produto = service.cadastrar_produto(dados)
    return jsonable_encoder(novo_produto)

@router.get("/produtos", tags=["Produtos"])
def listar_produtos_api(search: Optional[str] = None, status: Optional[str] = "Ativo", db: Session = Depends(get_db)):
    """Lista os produtos, com busca opcional por nome e filtro de status."""
    service = ServiceProduto(session=db)
    status_final = None if status and status.lower() == 'todos' else status.title()
    lista = service.listar_produtos(nome=search, status=status_final)
    return jsonable_encoder(lista)

@router.get("/produtos/{produto_id}", tags=["Produtos"])
def obter_produto_api(produto_id: int, db: Session = Depends(get_db)):
    """Busca um produto específico pelo seu ID."""
    service = ServiceProduto(session=db)
    produto = service.get_by_id(produto_id) 
    return jsonable_encoder(produto)

@router.put("/produtos/{produto_id}", tags=["Produtos"])
def atualizar_produto_api(produto_id: int, dados: dict, db: Session = Depends(get_db)):
    """Atualiza os dados de um produto existente."""
    service = ServiceProduto(session=db)
    produto = service.update(produto_id, dados)
    return jsonable_encoder(produto)

@router.delete("/produtos/{produto_id}", tags=["Produtos"])
def inativar_produto_api(produto_id: int, db: Session = Depends(get_db)):
    """Inativa um produto existente (Soft Delete)."""
    service = ServiceProduto(session=db)
    service.inativar(produto_id)
    return {"detail": "Produto inativado com sucesso"}