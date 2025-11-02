from .base_service import BaseService
from repository import ContasAPagarRepository
from sqlalchemy.orm import Session
from typing import Optional

class ServiceContasAPagar(BaseService[ContasAPagarRepository]):
    def __init__(self, session: Session):
        repository = ContasAPagarRepository(session)
        super().__init__(repository)

    def listar_contas(self, id_fornecedor: Optional[int] = None, status_conta: Optional[str] = None):
        """
        Intermedia a busca de contas a pagar com filtros.
        """
        # A lógica de filtro está no repositório
        return self.repository.buscar(
            id_fornecedor=id_fornecedor, 
            status_conta=status_conta
        )
    