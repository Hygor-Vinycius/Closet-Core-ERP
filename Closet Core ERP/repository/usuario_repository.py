from .base_repository import BaseRepository
from sqlalchemy import or_
from sqlalchemy.orm import Session
from models import Usuarios
from typing import Optional
from typing import Optional
from models import Usuarios

class UsuarioRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Usuarios)

    def buscar(self, nome: Optional[str] = None, status: Optional[str] = None) -> list[Usuarios]:
        """
        Busca usuários de forma dinâmica, permitindo filtrar por nome e/ou status.
        A busca por nome é case-insensitive e parcial (contém).
        """

        # 1. Começa com a consulta base
        query = self.session.query(Usuarios)

        # 2. Adiciona o filtro de nome, se fornecido
        if nome:
            termo_busca = f"%{nome}%" # Adicional wildcards para busca parcial
            query = query.filter(Usuarios.nome.ilike(termo_busca)) 

        # 3. Adiciona o filtro de status, se fornecido
        if status:
            query = query.filter(Usuarios.status == status)

        # 3. Executa a consulta e retorna os resultados
        return query.all()
    
    def find_by_unique_identifier(self, email: str = None) -> Optional[Usuarios]:
        """
        Busca um usuário pelo e-mail, utilizada para evitar duplicidade no cadastro de usuários.
        Retorna o primeiro usuário que encontrar ou None se não houver nenhum. 
        """

        # Se nenhum e-mail for fornecido, não há o que buscar.
        if not email:
            return None
        
        return self.session.query(Usuarios).filter(Usuarios.email.ilike(email)).first()
    
    # NOVO MÉTODO para a lógica de atualização
    def find_by_email_and_not_id(self, email: str, id_usuario: int) -> Optional[Usuarios]:
        """
        Busca um usuário por e-mail, excluindo um ID específico da busca.
        """
        return self.session.query(Usuarios).filter(
            Usuarios.email.ilike(email),
            Usuarios.id_usuario != id_usuario
        ).first()