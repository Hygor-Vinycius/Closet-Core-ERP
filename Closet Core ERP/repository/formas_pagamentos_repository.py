from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import FormasPagamentos
from typing import Optional

class FormasPagamentosRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, FormasPagamentos)

    def find_by_descricao(self, descricao: str) -> Optional[FormasPagamentos]:
        """
        Busca uma forma de pagamento pela descrição exata (case-insensitive).
        Usado para a validação de duplicidade.
        """
        return self.session.query(FormasPagamentos).filter(FormasPagamentos.descricao.ilike(descricao)).first()

    def buscar(self, descricao: Optional[str] = None, status: Optional[str] = None) -> list[FormasPagamentos]:
        """
        Busca formas de pagamento de forma dinâmica, permitindo filtrar por descrição e/ou status.
        """
        query = self.session.query(FormasPagamentos)

        if status:
            query = query.filter(FormasPagamentos.status == status)

        if descricao:
            termo_busca = f"%{descricao}%"
            query = query.filter(FormasPagamentos.descricao.ilike(termo_busca))
        
        return query.all()