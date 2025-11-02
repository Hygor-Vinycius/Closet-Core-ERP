from sqlalchemy.orm import Session
from sqlalchemy import or_
from .base_repository import BaseRepository
from models import Clientes
from typing import Optional

class ClienteRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Clientes)

    def buscar(self, nome: Optional[str] = None, status: Optional[str] = None) -> list[Clientes]:
        """
        Busca clientes de forma dinâmica, permitindo filtrar por nome e/ou status.
        A busca por nome é case-insensitive e parcial (contém).
        """

        # Começa com a consulta base
        query = self.session.query(Clientes)

        # Adiciona o filtro de status, se fornecido
        if status: 
            query = query.filter(Clientes.status == status)

        # Adicional o filtro de nome, se fornecido
        if nome: 
            termo_busca = f"%{nome}%" # Adiciona os wildcards para busca parcial
            query = query.filter(Clientes.nome_completo.ilike(termo_busca))

        # Executa a consulta e retorna todos os resultados
        return query.all()
    
    def find_by_unique_identifier(self, cpf: str = None, cnpj: str = None, email: str = None) -> Optional[Clientes]:
        """
        Busca um cliente pelo CPF, CNPJ ou E-mail, utilizada para evitar duplicidade no cadastro de clientes.
        Retorna o primeiro cliente que encontrar ou None se não houver nenhum.
        """
        # Cria uma lista de filtros a seram aplicados
        filters = []
        if cpf:
            filters.append(Clientes.cpf == cpf)
        if cnpj:
            filters.append(Clientes.cnpj == cnpj)
        if email:
            filters.append(Clientes.email == email)

        # Se não houver nenhum filtro para aplicar, retorna None
        if not filters:
            return None
        
        # Executa a consulta com os filtros usando o operador OR
        return self.session.query(Clientes).filter(or_(*filters)).first()

