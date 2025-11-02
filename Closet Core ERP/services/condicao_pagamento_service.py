from .base_service import BaseService
from repository import CondicaoPagamentoRepository
from sqlalchemy.orm import Session
from models import CondicaoPagamento
from fastapi import HTTPException
from typing import Optional

class ServiceCondicaoPagamento(BaseService[CondicaoPagamentoRepository]):
    def __init__(self, session: Session):
        repository = CondicaoPagamentoRepository(session)
        super().__init__(repository)

    def cadastrar_condicao_pagamento(self, dados_condicao_pagamento: dict):
        """
        Valida e cria uma nova condição de pagamento.
        """
        descricao = dados_condicao_pagamento.get('descricao')
        
        if descricao:
            condicao_existente = self.repository.find_by_descricao(descricao=descricao)
            if condicao_existente:
                raise HTTPException(status_code=409, detail="Já existe uma condição de pagamento com esta descrição.")
        
        nova_condicao_pagamento = CondicaoPagamento(**dados_condicao_pagamento)
        return super().create(nova_condicao_pagamento)

    def listar_condicoes_pagamento(self, descricao: Optional[str] = None, status: Optional[str] = None):
        """
        Busca condições de pagamento com base em filtros.
        """
        if status and status.lower() == 'todos':
             return self.repository.get_all()
        
        return self.repository.buscar(descricao=descricao, status=status)
    
    # Os métodos get_by_id, update e inativar são herdados automaticamente!