from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import Vendas
from typing import Optional, List

class VendaRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Vendas)

    def buscar(self, id_cliente: Optional[int] = None, status: Optional[str] = None) -> List[Vendas]:
        """
        Busca vendas com filtros opcionais.
        """
        query = self.session.query(Vendas)

        if id_cliente:
            query = query.filter(Vendas.id_cliente == id_cliente)

        if status:
            query = query.filter(Vendas.status == status)
        
        # Ordena da mais recente para a mais antiga
        return query.order_by(Vendas.data_venda.desc()).all()

