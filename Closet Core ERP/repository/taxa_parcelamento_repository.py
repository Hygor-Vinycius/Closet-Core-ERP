# Em repository/taxa_parcelamento_repository.py

from .base_repository import BaseRepository
from sqlalchemy.orm import Session
from models import TaxaParcelamento
from typing import Optional

class TaxaParcelamentoRepository(BaseRepository):
    def __init__(self, session: Session):
        super().__init__(session, TaxaParcelamento)

    def find_by_maquininha_and_parcelas(self, maquininha_id: int, numero_parcelas: int) -> Optional[TaxaParcelamento]:
        """
        Busca uma taxa pela combinação de maquininha e número de parcelas.
        Usado para a validação de duplicidade.
        """
        return self.session.query(TaxaParcelamento).filter(
            TaxaParcelamento.id_maquininha == maquininha_id,
            TaxaParcelamento.numero_parcelas == numero_parcelas
        ).first()

    def buscar_por_maquininha(self, maquininha_id: Optional[int] = None) -> list[TaxaParcelamento]:
        """
        Busca todas as taxas de parcelamento, opcionalmente filtrando por uma maquininha específica.
        """
        query = self.session.query(TaxaParcelamento)

        if maquininha_id:
            query = query.filter(TaxaParcelamento.id_maquininha == maquininha_id)
        
        return query.all()