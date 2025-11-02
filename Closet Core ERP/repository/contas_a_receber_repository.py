from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import ContasAReceber
from typing import Optional

class ContasAReceberRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, ContasAReceber)

    def buscar(self,
               id_cliente: Optional[int] = None,
               status_conta: Optional[str] = None,
               id_venda: Optional[int] = None) -> list[ContasAReceber]: # 1. Adicione id_venda aqui
        """
        Busca contas a receber, com filtros opcionais por cliente, status da conta e/ou ID da venda.
        """
        query = self.session.query(ContasAReceber)

        if id_cliente:
            query = query.filter(ContasAReceber.id_cliente == id_cliente)

        if status_conta:
            query = query.filter(ContasAReceber.status_conta == status_conta)

        # 2. Adicione o filtro por id_venda
        if id_venda:
            query = query.filter(ContasAReceber.id_venda == id_venda)

        return query.all()