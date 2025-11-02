from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services import ServiceCliente
from database import get_db
from fastapi.encoders import jsonable_encoder # Para converser os retornos de dados em JSON, possibilitando a leitura pelo Insomnia.
from typing import Optional

router = APIRouter()

@router.post("/clientes/")
def cadastrar_cliente_api(cliente_data: dict, db: Session = Depends(get_db), status_code=200):
    """Endpoint da API: Recebe o pedido do cliente e passa para a camada de serviço."""

    service = ServiceCliente(session=db)
    novo_cliente = service.cadastrar_cliente(cliente_data)

    # Lógica para escolher o nome de exibição para PF e PJ
    if novo_cliente.razao_social:
        nome_exibicao = novo_cliente.razao_social
    else:
        nome_exibicao = novo_cliente.nome_completo

    return {"mensagem": f"Cliente {nome_exibicao} ID: {novo_cliente.id_cliente} cadastrado com sucesso!"}

@router.get("/clientes/")
def listar_clientes_api(search: Optional[str] = None, status: Optional[str] = "Ativo", db: Session = Depends(get_db)):
    """Endpoint da API: Retorna uma lista de clientes.
    Pode ser filtrado por status e/ou por termo de busca no nome.
    Ex: /clientes?search=Silva&status=Inativo"""
    service = ServiceCliente(session=db)
    
    # Lógica de normalização para o status
    if status and status.lower() == 'todos':
        status_final = None
    else:
        # NORMALIZAÇÃO ACONTECE AQUI:
        # Converte o status para o formato padrão (ex: "ativo" -> "Ativo")
        status_final = status.title()

    # Chamamos o serviço com os filtros já tratados
    lista_de_clientes = service.listar_clientes(nome=search, status=status_final)

    return jsonable_encoder(lista_de_clientes)

@router.get("/clientes/{id_cliente}", status_code=200)
def consultar_cliente_por_id_api(id_cliente: int, db: Session = Depends(get_db)):
    """Endpoint da API: Retorna os dados de um cliente específico pelo seu ID."""
    service = ServiceCliente(session=db)
    cliente = service.get_by_id(id_cliente)
    return jsonable_encoder(cliente)

@router.put("/clientes/{id_cliente}", status_code=200)
def atualizar_cliente_api(id_cliente: int, dados_cliente: dict, db: Session = Depends(get_db)):
    """Endpoint da API: Atualiza os dados de um cliente existente"""
    service = ServiceCliente(session=db)
    cliente_atualizado = service.update(id_cliente, dados_cliente)
    return jsonable_encoder(cliente_atualizado)

@router.delete("/clientes/{id_cliente}", status_code=200)
def inativar_cliente_api(id_cliente: int, db: Session = Depends(get_db)):
    """Endpoint da API: Inativa um cliente existente (Soft Delete)."""
    service = ServiceCliente(session=db)
    service.inativar(id_cliente)

    return {"mensagem": f"Cliente com ID {id_cliente} foi inativado com sucesso!"}
