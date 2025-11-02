from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import Recebimentos
from typing import Optional, List

class RecebimentoRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, Recebimentos)

    # Métodos específicos podem ser adicionados aqui no futuro,
    # por exemplo, para buscar recebimentos de uma conta específica
    def find_by_conta_a_receber_id(self, conta_id: int) -> List[Recebimentos]:
        return self.session.query(Recebimentos).filter(Recebimentos.id_cta_a_receber == conta_id).all()