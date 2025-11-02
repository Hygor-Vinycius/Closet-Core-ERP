from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import Pagamentos
from typing import List

class PagamentoRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Pagamentos)

    def existem_pagamentos_ativos_para_contas(self, contas_pagar_ids: List[int]) -> bool:
        """Verifica se existe algum pagamento 'Efetivado' para a lista de IDs de contas a pagar."""
        if not contas_pagar_ids:
            return False

        count = self.session.query(Pagamentos).filter(
            Pagamentos.id_cta_a_pgto.in_(contas_pagar_ids),
            Pagamentos.status == 'Efetivado' # Considera apenas pagamentos não cancelados
        ).count()
        return count > 0
    
    def find_by_conta_a_pagar_id(self, id_cta_a_pgto: int) -> List[Pagamentos]:
        """
        Busca todos os pagamentos (efetivados ou cancelados) de uma conta a pagar específica.
        """
        return self.session.query(Pagamentos).filter(
            Pagamentos.id_cta_a_pgto == id_cta_a_pgto
        ).order_by(Pagamentos.data_pagamento.desc()).all()