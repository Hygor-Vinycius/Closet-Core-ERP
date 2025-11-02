from .base_service import BaseService
from repository import FormasPagamentosRepository
from sqlalchemy.orm import Session
from models import FormasPagamentos
from fastapi import HTTPException
from typing import Optional

class ServiceFormasPagamentos(BaseService[FormasPagamentosRepository]):
    def __init__(self, session: Session):
        repository = FormasPagamentosRepository(session)
        super().__init__(repository)

    def cadastrar_forma_pagamento(self, dados_forma_pagamento: dict):
        """
        Valida e cria uma nova forma de pagamento.
        """
        descricao = dados_forma_pagamento.get('descricao')
        
        if descricao:
            forma_pagamento_existente = self.repository.find_by_descricao(descricao=descricao)
            if forma_pagamento_existente:
                raise HTTPException(status_code=409, detail="Já existe uma forma de pagamento com esta descrição.")
        
        nova_forma_pagamento = FormasPagamentos(**dados_forma_pagamento)
        return super().create(nova_forma_pagamento)

    def listar_formas_pagamento(self, descricao: Optional[str] = None, status: Optional[str] = None):
        """
        Busca formas de pagamento com base em filtros.
        """
        if status and status.lower() == 'todos':
             return self.repository.get_all()
        
        return self.repository.buscar(descricao=descricao, status=status)
    
    # Os métodos get_by_id, update e inativar são herdados automaticamente!