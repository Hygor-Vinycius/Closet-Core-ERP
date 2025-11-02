from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import CondicaoPagamento
from typing import Optional

class CondicaoPagamentoRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, CondicaoPagamento)

    def find_by_descricao(self, descricao: str) -> Optional[CondicaoPagamento]:
        """
        Busca uma condição de pagamento pela descrição exata (case-insensitive).
        Usado para a validação de duplicidade.
        """
        return self.session.query(CondicaoPagamento).filter(CondicaoPagamento.descricao.ilike(descricao)).first()

    def buscar(self, descricao: Optional[str] = None, status: Optional[str] = None) -> list[CondicaoPagamento]:
        """
        Busca condições de pagamento de forma dinâmica, permitindo filtrar por descrição e/ou status.
        """
        query = self.session.query(CondicaoPagamento)

        if status:
            query = query.filter(CondicaoPagamento.status == status)

        if descricao:
            termo_busca = f"%{descricao}%"
            query = query.filter(CondicaoPagamento.descricao.ilike(termo_busca))
        
        return query.all()