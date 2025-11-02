from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import Empresa
from typing import Optional


class EmpresaRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Empresa)

    def buscar(self, nome: Optional[str] = None):
        """
        Busca empresas de forma dinâmica, permitindo filtrar por nome  e/ou status. 
        A busca por nome é case-insensitive e parcial (contém)
        """
        # Começa com a consulta base. 
        query = self.session.query(Empresa)

        # Adiciona o filtro de nome, se fornecido.
        if nome:
            termo_busca = f'%{nome}%' # Adiciona wildcards para busca parcial
            query = query.filter(Empresa.razao_social.ilike(termo_busca))
        
        # Executa a consulta e retorna todos os resultados
        return query.all()
    
    def find_by_unique_identifier(self, cnpj: str = None, razao_social: str = None, email: str = None) -> Optional[Empresa]:
        """
        Busca uma empresa pelo CNPJ, Razão Social ou e-mail, utilizada para evitar duplicidade no cadastro de empresas.
        Retorna a primeiro empresa que encontrar ou None se não houver nenhuma.
        """

        # Cria uma lista de filtros a serem aplicados
        filters = []
        if cnpj:
            filters.append(Empresa.cnpj == cnpj)
        if razao_social:
            filters.append(Empresa.razao_social == razao_social)
        if email:
            filters.append(Empresa.email == email)
        
        # se não houver filtro para aplicar, retorna None
        if not filters:
            return None
        
        #Executa a consulta com os filtros usando o operador OR
        return self.session.query(Empresa).filter(or_(*filters)).first()