from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import ContasAReceber
from typing import Optional, List

class ContasAReceberRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, ContasAReceber)

    def buscar(self,
               id_cliente: Optional[int] = None,
               status_conta: Optional[str] = None,
               id_venda: Optional[int] = None) -> List[ContasAReceber]:
        """
        Busca contas a receber, com filtros inteligentes.
        """
        query = self.session.query(ContasAReceber)

        if id_cliente:
            query = query.filter(ContasAReceber.id_cliente == id_cliente)

        if id_venda:
            query = query.filter(ContasAReceber.id_venda == id_venda)

        if status_conta:
            s_lower = status_conta.lower()
            
            # Lógica para "Aberto" (Inclui parcial)
            if s_lower == 'aberto':
                query = query.filter(
                    ContasAReceber.status_conta.in_(['Aberto', 'Recebido Parcial'])
                )
            
            # Lógica para "Recebido" (Aceita 'pago' ou 'recebido')
            elif s_lower in ['recebido', 'pago']:
                query = query.filter(
                    ContasAReceber.status_conta.in_(['Recebido', 'Recebido Total'])
                )
            
            # Outros status (ex: Cancelado)
            else:
                query = query.filter(ContasAReceber.status_conta == status_conta)

        # Ordena por vencimento (mais antigas/urgentes primeiro)
        return query.order_by(ContasAReceber.data_vencimento.asc()).all()