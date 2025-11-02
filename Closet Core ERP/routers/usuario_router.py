from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services import ServiceUsuario
from database import get_db
from fastapi.encoders import jsonable_encoder # Para converser os retornos de dados em JSON, possibilitando a leitura pelo Insomnia.
from typing import Optional

router = APIRouter()

@router.post("/usuarios/")
def cadsatrar_usuario_api(usuario_data: dict, db: Session = Depends(get_db), status_code=200):
    """Endpoint da API: Recebe o pedido do cliente e passa para a camada de serviço."""

    service = ServiceUsuario(session=db)
    novo_usuario = service.cadastrar_usuario(usuario_data)

    mensagem = f'Usuario {novo_usuario.nome} ID: {novo_usuario.id_usuario} cadastrado com sucesso!'

    return mensagem

@router.get("/usuarios/")
def listar_usuarios_api(search: Optional[str] = None, status: Optional[str] = "Ativo", db: Session = Depends(get_db)):
    """
    Endpoint da API: Retorna uma lista de usuários, podendo ser buscados por status ou por termo de busca no nome.
    """

    service = ServiceUsuario(session=db)

    # Lógica de normalização para status
    if status and status.lower() == 'todos':
        status_final = None
    else:
        status_final = status.title()

    # Chamamos o serviço com os filtros já tratados
    lista_de_usuarios = service.listar_usuarios(nome=search, status=status_final)

    return jsonable_encoder(lista_de_usuarios)

@router.get("/usuarios/{id_usuario}", status_code=200)
def consultar_usuario_por_id_api(id_usuario: int, db: Session = Depends(get_db)):
    """Endpoist da API: retorna os dados de um fornecedor específico pelo seu ID."""
    service = ServiceUsuario(session=db)
    usuario = service.get_by_id(id_usuario)
    
    return jsonable_encoder(usuario)

@router.put("/usuarios/{id_usuario}", status_code=200)
def atualizar_usuario_api(id_usuario: int, dados_usuario: dict, db: Session = Depends(get_db)):
    """Endpoint da API: Atualiza os dados de um usuário existente"""
    service = ServiceUsuario(session=db)
    usuario_atualizado = service.update(id_usuario, dados_usuario)

    return jsonable_encoder(usuario_atualizado)