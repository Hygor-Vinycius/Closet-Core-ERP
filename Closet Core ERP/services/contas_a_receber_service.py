# Em: services/contas_a_receber_service.py

from .base_service import BaseService
from repository import ContasAReceberRepository
from sqlalchemy.orm import Session
from typing import Optional

class ServiceContasAReceber(BaseService[ContasAReceberRepository]):
    def __init__(self, session: Session):
        repository = ContasAReceberRepository(session)
        super().__init__(repository)

    def listar_contas(self, id_cliente: Optional[int] = None, status_conta: Optional[str] = None):
        """
        Intermedia a busca de contas a receber com filtros.
        """
        return self.repository.buscar(
            id_cliente=id_cliente, 
            status_conta=status_conta
        )