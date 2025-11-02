from .base_service import BaseService
from repository import TaxaParcelamentoRepository
from sqlalchemy.orm import Session
from models import TaxaParcelamento
from fastapi import HTTPException
from typing import Optional

class ServiceTaxaParcelamento(BaseService[TaxaParcelamentoRepository]):
    def __init__(self, session: Session):
        repository = TaxaParcelamentoRepository(session)
        super().__init__(repository)

    def cadastrar_taxa(self, dados_taxa: dict):
        """
        Valida e cria uma nova taxa de parcelamento.
        """
        maquininha_id = dados_taxa.get('id_maquininha')
        numero_parcelas = dados_taxa.get('numero_parcelas')
        
        if maquininha_id and numero_parcelas:
            taxa_existente = self.repository.find_by_maquininha_and_parcelas(
                maquininha_id=maquininha_id, 
                numero_parcelas=numero_parcelas
            )
            if taxa_existente:
                raise HTTPException(status_code=409, detail="Já existe uma taxa para este número de parcelas nesta maquininha.")
        
        nova_taxa = TaxaParcelamento(**dados_taxa)
        return super().create(nova_taxa)

    def listar_taxas(self, maquininha_id: Optional[int] = None):
        """
        Busca taxas de parcelamento, com filtro opcional por maquininha.
        """
        return self.repository.buscar_por_maquininha(maquininha_id=maquininha_id)
    
    def deletar(self, entity_id: int):
        """
        Sobrescreve a lógica de 'inativar' da BaseService para fazer um Hard Delete,
        já que este modelo não possui a coluna 'status'.
        """
        entity_db = self.get_by_id(entity_id) # Busca a entidade (já trata o 404)
        return self.repository.delete(entity_db) # Chama o delete físico do BaseRepository
    
    # Os métodos get_by_id e update são herdados automaticamente!