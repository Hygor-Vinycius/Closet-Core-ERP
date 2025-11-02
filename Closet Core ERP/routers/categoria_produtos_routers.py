from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceCategoriaProdutos
from fastapi.encoders import jsonable_encoder
from typing import Optional

router = APIRouter()

@router.post("/categorias", status_code=201, tags=["Categorias de Produtos"])
def cadastrar_categoria_api(dados: dict, db: Session = Depends(get_db)):
    """Endpoint da API: Cria uma nova categoria de produto."""
    service = ServiceCategoriaProdutos(session=db)
    nova_categoria = service.cadastrar_categoria(dados)
    return jsonable_encoder(nova_categoria)

@router.get("/categorias", tags=["Categorias de Produtos"])
def listar_categorias_api(search: Optional[str] = None, status: Optional[str] = "Ativo", db: Session = Depends(get_db)):
    """Endpoint da API: Lista as categorias, com busca opcional por descrição."""
    service = ServiceCategoriaProdutos(session=db)
    status_final = None if status and status.lower() == 'todos' else status.title()
    lista = service.listar_categorias(descricao=search, status=status_final)
    return jsonable_encoder(lista)

@router.get("/categorias/{categoria_id}", tags=["Categorias de Produtos"])
def obter_categoria_api(categoria_id: int, db: Session = Depends(get_db)):
    """Endpoint da API: Busca uma categoria específica pelo seu ID."""
    service = ServiceCategoriaProdutos(session=db)
    categoria = service.get_by_id(categoria_id) # Método herdado!
    return jsonable_encoder(categoria)

@router.put("/categorias/{categoria_id}", tags=["Categorias de Produtos"])
def atualizar_categoria_api(categoria_id: int, dados: dict, db: Session = Depends(get_db)):
    """Endpoint da API: Atualiza os dados de uma categoria existente."""
    service = ServiceCategoriaProdutos(session=db)
    categoria = service.update(categoria_id, dados) # Método herdado!
    return jsonable_encoder(categoria)

@router.delete("/categorias/{categoria_id}", tags=["Categorias de Produtos"])
def inativar_categoria_api(categoria_id: int, db: Session = Depends(get_db)):
    """Endpoint da API: Inativa uma categoria existente (Soft Delete)."""
    service = ServiceCategoriaProdutos(session=db)
    service.inativar(categoria_id) # Método herdado!
    return {"detail": "Categoria inativada com sucesso"}