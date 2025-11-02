from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import CategoriaProdutos
from typing import Optional

class CategoriaProdutosRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, CategoriaProdutos)

    def find_by_descricao(self, descricao: str) -> Optional[CategoriaProdutos]:
        """
        Busca uma categoria pela descrição exata (case-insensitive).
        Usado para a validação de duplicidade.
        """
        return self.session.query(CategoriaProdutos).filter(CategoriaProdutos.descricao.ilike(descricao)).first()

    def buscar(self, descricao: Optional[str] = None, status: Optional[str] = None) -> list[CategoriaProdutos]:
        """
        Busca categorias de forma dinâmica, permitindo filtrar por descrição e/ou status.
        """
        query = self.session.query(CategoriaProdutos)

        if status:
            query = query.filter(CategoriaProdutos.status == status)

        if descricao:
            termo_busca = f"%{descricao}%"
            query = query.filter(CategoriaProdutos.descricao.ilike(termo_busca))
        
        return query.all()