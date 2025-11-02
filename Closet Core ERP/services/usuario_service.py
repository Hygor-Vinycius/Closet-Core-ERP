from .base_service import BaseService
from repository import UsuarioRepository
from sqlalchemy.orm import Session
from models import Usuarios
from fastapi import HTTPException
from typing import Optional

class ServiceUsuario(BaseService[UsuarioRepository]):
    def __init__(self, session: Session):
        repository = UsuarioRepository(session)
        super().__init__(repository)

    def cadastrar_usuario(self, dados_usuario: dict):
        """
        Valida e cria um novo usuário.
        """
        email = dados_usuario.get('email')
        
        # A lógica de verificação de duplicidade é específica do usuário
        usuario_existente = self.repository.find_by_unique_identifier(email=email)
        if usuario_existente:
            mensagem = f'Já existe um usuário cadastrado para o e-mail informado. Status: {usuario_existente.status} ID: {usuario_existente.id_usuario}'
            raise HTTPException(status_code=409, detail=mensagem)
        
        novo_usuario = Usuarios(**dados_usuario)
        return super().create(novo_usuario)

    def atualizar_usuario(self, id_usuario: int, dados_usuario: dict):
        """ 
        Atualiza os dados de um usuário, com validação de e-mail duplicado.
        """
        # Reutiliza o get_by_id da BaseService (que já trata o 404)
        usuario_db = self.get_by_id(id_usuario)

        # Lógica de validação de e-mail duplicado específica da atualização
        novo_email = dados_usuario.get('email')
        if novo_email and novo_email.lower() != usuario_db.email.lower():
            outro_usuario = self.repository.find_by_email_and_not_id(email=novo_email, id_usuario=id_usuario)
            if outro_usuario:
                raise HTTPException(status_code=409, detail="O e-mail informado já está em uso por outro usuário.")

        # Lógica genérica de atualização de atributos
        for chave, valor in dados_usuario.items():
            setattr(usuario_db, chave, valor)

        # Chama o update genérico do repositório
        return self.repository.update(usuario_db)

    def listar_usuarios(self, nome: Optional[str] = None, status: Optional[str] = None): # Renomeado para plural
        """
        Busca usuários com base em filtros. Lógica específica.
        """
        if status and status.lower() == 'todos':
            return self.repository.get_all()
        
        return self.repository.buscar(nome=nome, status=status)
    
    # O MÉTODO ABAIXO FOI REMOVIDO!
    # A lógica dele agora é herdada da BaseService e chamada com self.get_by_id()
    #
    # def consultar_usuario_por_id(...)