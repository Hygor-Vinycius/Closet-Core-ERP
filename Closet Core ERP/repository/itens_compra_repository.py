from typing import List
from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import ItensCompra

class ItensCompraRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, ItensCompra)

    def find_by_compra_id(self, compra_id: int) -> List[ItensCompra]:
        """Busca todos os itens de uma compra específica."""
        return self.session.query(ItensCompra).filter(ItensCompra.id_compra == compra_id).all()