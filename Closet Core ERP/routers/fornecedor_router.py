from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceFornecedor
from typing import Optional
from fastapi.encoders import jsonable_encoder

router = APIRouter()

@router.post("/fornecedores")
def cadastrar_fornecedor_api(fornecedor_data: dict, db: Session = Depends(get_db), status_code=200):
    """Endpoint da API: Recebe o pedido do cliente da API e passa para a camada de serviço"""
    
    service = ServiceFornecedor(session=db)
    novo_fornecedor = service.cadastrar_fornecedor(fornecedor_data)

    return {"mensagem": f"Fornecedor: {novo_fornecedor.razao_social} | ID: {novo_fornecedor.id_fornecedor} cadastrado com sucesso!"}

@router.get("/fornecedores")
def listar_fornecedores_api(search: Optional[str] = None, status: Optional[str] = "Ativo", db: Session = Depends(get_db)):
    """
    Endpoint da API: Retorna uma lista de fornecedores, podendo ser buscados por status ou por termo de busca no nome.
    """
    service = ServiceFornecedor(session=db)

    # Lógica de normalização para status
    if status and status.lower() == 'todos':
        status_final = None
    else:
        # Converte o status para o formato padrão (primeira letra maiúscula)
        status_final = status.title()
    
    # Chamamos o serviço com os filtros já tratados

    lista_de_fornecedores = service.listar_fornecedores(nome=search, status=status_final)

    return jsonable_encoder(lista_de_fornecedores)

@router.get("/fornecedores/{id_fornecedor}", status_code=200)
def consultar_fornecedor_por_id_api(id_fornecedor: int, db: Session = Depends(get_db)):
    """Endpoint da API: Retorna os dados de um fornecedor específico pelo seu ID"""
    service = ServiceFornecedor(session=db)
    fornecedor = service.get_by_id(id_fornecedor)
    return jsonable_encoder(fornecedor)

@router.put("/fornecedores/{id_fornecedor}", status_code=200)
def atualizar_fornecedor_api(id_fornecedor: int, dados_fornecedor: dict, db: Session = Depends(get_db)):
    """Endpoint da API: Atualiza os dados de um fornecedor existente"""
    service = ServiceFornecedor(session=db)
    fornecedor_atualizado = service.update(id_fornecedor, dados_fornecedor)
    return jsonable_encoder(fornecedor_atualizado)

@router.delete("/fornecedores/{id_fornecedor}")
def inativar_fornecedor_api(id_fornecedor: int, db: Session = Depends(get_db)):
    """Endpoint da API: Inativa um cliente existente (soft Delete)"""
    service = ServiceFornecedor(session=db)
    service.inativar(id_fornecedor)

    return {"mensagem": f"Fornecedor com ID: {id_fornecedor} foi inativado com sucesso!"}
    