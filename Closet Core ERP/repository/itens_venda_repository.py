from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import ItensVenda

class ItensVendaRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, ItensVenda)

    def find_by_venda_id(self, venda_id: int) -> list[ItensVenda]:
        """Busca todos os itens pertencentes a uma venda específica."""
        return self.session.query(ItensVenda).filter(ItensVenda.id_venda == venda_id).all()