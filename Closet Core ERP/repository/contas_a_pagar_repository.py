from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import ContasAPagar
from typing import Optional, List

class ContasAPagarRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, ContasAPagar)

    def buscar(self, 
               id_fornecedor: Optional[int] = None, 
               status_conta: Optional[str] = None
               ) -> List[ContasAPagar]:
        """
        Busca contas a pagar com filtros dinâmicos.
        """
        query = self.session.query(ContasAPagar)

        if id_fornecedor:
            query = query.filter(ContasAPagar.id_fornecedor == id_fornecedor)

        if status_conta:
            # --- LÓGICA CORRIGIDA E SIMPLIFICADA ---
            if status_conta.lower() == 'aberto':
                # "Aberto" significa 'Aberto' OU 'Pago Parcial'
                query = query.filter(
                    ContasAPagar.status_conta.in_(['Aberto', 'Pago Parcial'])
                )
            else:
                # 'Pago' vai buscar 'Pago'
                # 'Cancelado' vai buscar 'Cancelado'
                query = query.filter(ContasAPagar.status_conta == status_conta)
            # --- FIM DA CORREÇÃO ---
        
        return query.order_by(ContasAPagar.data_vencimento.asc()).all()