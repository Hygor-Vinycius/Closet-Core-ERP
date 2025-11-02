from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import Produtos
from typing import Optional

class ProdutoRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Produtos)

    def find_by_nome(self, nome_produto: str) -> Optional[Produtos]:
        """
        Busca um produto pelo nome exato (case-insensitive).
        Usado para a validação de duplicidade.
        """
        return self.session.query(Produtos).filter(Produtos.nome_produto.ilike(nome_produto)).first()

    def buscar(self, nome: Optional[str] = None, status: Optional[str] = None) -> list[Produtos]:
        """
        Busca produtos de forma dinâmica, permitindo filtrar por nome e/ou status.
        """
        query = self.session.query(Produtos)

        if status:
            query = query.filter(Produtos.status == status)

        if nome:
            termo_busca = f"%{nome}%"
            query = query.filter(Produtos.nome_produto.ilike(termo_busca))
        
        return query.all()