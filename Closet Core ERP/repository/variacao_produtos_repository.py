from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import VariacaoProdutos
from typing import Optional

class VariacaoProdutosRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, VariacaoProdutos)

    def find_by_unique_identifier(self, sku: str = None, ean: str = None) -> Optional[VariacaoProdutos]:
        """
        Busca uma variação pelo SKU ou EAN.
        Usado para a validação de duplicidade.
        """
        filters = []
        if sku:
            filters.append(VariacaoProdutos.sku.ilike(sku))
        if ean:
            filters.append(VariacaoProdutos.ean.ilike(ean))
        
        if not filters:
            return None
            
        return self.session.query(VariacaoProdutos).filter(or_(*filters)).first()

    def buscar(self, produto_id: Optional[int] = None, status: Optional[str] = None) -> list[VariacaoProdutos]:
        """
        Busca variações de forma dinâmica, permitindo filtrar por id_produto e/ou status.
        """
        query = self.session.query(VariacaoProdutos)

        if status:
            query = query.filter(VariacaoProdutos.status == status)

        if produto_id:
            query = query.filter(VariacaoProdutos.id_produto == produto_id)
        
        return query.all()