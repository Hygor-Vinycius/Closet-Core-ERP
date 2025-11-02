from .base_repository import BaseRepository
from models import Fornecedor
from typing import Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session

class FornecedorRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Fornecedor)

    def buscar(self, nome: Optional[str] = None, status: Optional[str] = None):
        """
        Busca fornecedores de forma dinâmica, permitindo filtrar por nome e/ou status.
        A busca por nome é case-insensitive e parcial (contém)
        """
        # Começa com a consulta base.
        query = self.session.query(Fornecedor)

        # Adiciona o filtro de status, se forneceido.
        if status:
            query = query.filter(Fornecedor.status == status)
        
        # Adiciona o filtro de nome, se fornecido.
        if nome:
            termo_busca = f'%{nome}%' # Adiciona wildcards para busca parcial
            query = query.filter(Fornecedor.razao_social.ilike(termo_busca))
        
        # Executa a consulta e retona todos os resultados
        return query.all()
    
    def find_by_unique_identifier(self, cnpj: str = None, razao_social: str = None, email: str = None) -> Optional[Fornecedor]:
        """
        Busca um fornecedor pelo CNPJ, Razão Social ou e-mail, utilizada para evitar duplicidade no cadastro de fornecedores.
        Retorna o primeiro fornecedor que encontrar ou None se não houver nenhum.
        """

        # Cria uma lista de filtros a serem aplicados
        filters = []
        if cnpj:
            filters.append(Fornecedor.cnpj == cnpj)
        if razao_social:
            filters.append(Fornecedor.razao_social == razao_social)
        if email:
            filters.append(Fornecedor.email == email)
        
        # Se não houver filtro para aplicar, retorna None

        if not filters:
            return None
        
        # Executa a consulta com os filtros usando o operador OR
        return self.session.query(Fornecedor).filter(or_(*filters)).first()